import { NextResponse } from "next/server"
import { between, sql, desc, eq } from "drizzle-orm"
import { db } from "@/db"
import { user, userQueries, userSearches } from "@/db/schema"
import type { QueryUsageData } from "@/lib/billing"
import { headers } from "next/headers"
import { auth } from "@/auth"
import { APIError } from "@/lib/utils"

const TIME_RANGES = {
	"1d": 1,
	"7d": 7,
	"30d": 30,
	"90d": 90,
	all: 365 * 1000,
} as const

type TimeRange = keyof typeof TIME_RANGES

function getTimeRange(rangeParam: string | null): TimeRange {
	if (!rangeParam || !(rangeParam in TIME_RANGES)) {
		return "7d"
	}
	return rangeParam as TimeRange
}

function getStartDate(rangeInDays: number): Date {
	const startDate = new Date()
	startDate.setDate(startDate.getDate() - rangeInDays)
	return startDate
}

async function fetchQueryUsageData(startDate: Date, endDate: Date): Promise<QueryUsageData> {
	const [totalQueriesResult, uniqueUsersResult] = await Promise.all([
		db
			.select({ totalQueries: sql<number>`COALESCE(sum(${userQueries.queriesUsed}), 0)` })
			.from(userQueries)
			.where(between(userQueries.lastUpdated, startDate, endDate)),

		db
			.select({ uniqueUsers: sql<number>`count(distinct ${userQueries.userId})` })
			.from(userQueries)
			.where(between(userQueries.lastUpdated, startDate, endDate)),
	])

	const totalQueries = totalQueriesResult[0]?.totalQueries ?? 0
	const uniqueUsers = uniqueUsersResult[0]?.uniqueUsers ?? 0
	const averageQueriesPerUser = uniqueUsers > 0 ? totalQueries / uniqueUsers : 0

	const [topUsers, queryCountByDay, latestUserSearches, userSearchTypeResults] = await Promise.all([
		db
			.select({
				userId: userQueries.userId,
				username: user.name,
				alias: user.alias,
				queryCount: sql<number>`sum(${userQueries.queriesUsed})`,
			})
			.from(userQueries)
			.innerJoin(user, eq(user.id, userQueries.userId))
			.where(between(userQueries.lastUpdated, startDate, endDate))
			.groupBy(userQueries.userId, user.name, user.alias)
			.orderBy(desc(sql<number>`sum(${userQueries.queriesUsed})`))
			.limit(20),

		db
			.select({
				date: sql<string>`DATE(${userQueries.lastUpdated})`,
				count: sql<number>`COALESCE(sum(${userQueries.queriesUsed}), 0)`,
			})
			.from(userQueries)
			.where(between(userQueries.lastUpdated, startDate, endDate))
			.groupBy(sql<string>`DATE(${userQueries.lastUpdated})`)
			.orderBy(sql<string>`DATE(${userQueries.lastUpdated})`)
			.limit(100),

		db
			.select({
				username: user.name,
				alias: user.alias,
				type: userSearches.searchType,
				createdAt: userSearches.addedAt,
			})
			.from(userSearches)
			.innerJoin(user, eq(user.id, userSearches.userId))
			.where(between(userSearches.addedAt, startDate, endDate))
			.orderBy(desc(userSearches.addedAt))
			.limit(200),

		db
			.select({
				userId: userSearches.userId,
				username: user.name,
				alias: user.alias,
				searchType: userSearches.searchType,
				count: sql<number>`count(*)`,
			})
			.from(userSearches)
			.innerJoin(user, eq(user.id, userSearches.userId))
			.where(between(userSearches.addedAt, startDate, endDate))
			.groupBy(userSearches.userId, user.name, user.alias, userSearches.searchType)
			.orderBy(desc(sql<number>`count(*)`))
			.limit(200),
	])

	const userSearchTypes = processUserSearchTypes(userSearchTypeResults)

	return {
		totalQueries,
		uniqueUsers,
		averageQueriesPerUser,
		topUsers,
		queryCountByDay,
		latestUserSearches,
		userSearchTypes,
	}
}

function processUserSearchTypes(
	userSearchTypeResults: Array<{
		userId: string
		username: string | null
		alias: string | null
		searchType: string | null
		count: number
	}>,
) {
	const userMap = new Map<
		string,
		{
			username: string
			alias: string
			searchTypes: Array<{ type: string; count: number }>
		}
	>()

	for (const item of userSearchTypeResults) {
		const username = item.username ?? "Unknown"
		const alias = item.alias ?? "Unknown"
		const searchType = item.searchType ?? "Unknown"
		const count = item.count

		const key = username || `user-${item.userId}`

		if (!userMap.has(key)) {
			userMap.set(key, {
				username,
				alias,
				searchTypes: [],
			})
		}

		const userData = userMap.get(key)!
		userData.searchTypes.push({
			type: searchType,
			count,
		})
	}

	return Array.from(userMap.values())
}

export async function GET(req: Request) {
	try {
		const userSession = await auth.api.getSession({
			headers: await headers(),
		})

		const hasAdminPermission = await auth.api.userHasPermission({
			body: {
				userId: userSession?.user?.id,
				permissions: { user: ["list"] },
			},
		})
		if (!userSession || !hasAdminPermission) {
			throw new APIError("Unauthorized", 401)
		}

		const { searchParams } = new URL(req.url)
		const range = getTimeRange(searchParams.get("range"))
		const rangeInDays = TIME_RANGES[range]
		const startDate = getStartDate(rangeInDays)
		const endDate = new Date()

		const usageData = await fetchQueryUsageData(startDate, endDate)

		return NextResponse.json({
			...usageData,
			timeRange: {
				range,
				days: rangeInDays,
				startDate: startDate.toISOString(),
				endDate: endDate.toISOString(),
			},
		})
	} catch (error) {
		if (error instanceof APIError) {
			throw error
		}

		console.error("Analytics API error:", error)
		const message = error instanceof Error ? error.message : "An unknown error occurred"
		throw new APIError(message, 500)
	}
}
