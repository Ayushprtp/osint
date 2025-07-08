import { db } from "@/db"
import { userQueries, userSearches, dailyServiceQueries, serviceQueryLimits } from "@/db/schema"
import { eq, sql, and } from "drizzle-orm"

export async function userQueryUsed(userId: string, source: string): Promise<number> {
	if (!userId || !source) {
		throw new Error("userId and source are required")
	}

	try {
		return await db.transaction(async (tx) => {
			const [updatedQuery] = await tx
				.insert(userQueries)
				.values({ userId, queriesUsed: 1 })
				.onConflictDoUpdate({
					target: userQueries.userId,
					set: {
						queriesUsed: sql`${userQueries.queriesUsed} + 1`,
						lastUpdated: new Date(),
					},
				})
				.returning({ queriesUsed: userQueries.queriesUsed })

			await tx.insert(userSearches).values({ userId, searchType: source, addedAt: new Date() }).onConflictDoNothing()

			return updatedQuery.queriesUsed
		})
	} catch (error) {
		console.error("Error incrementing query usage:", error)
		throw new Error(`Failed to increment query usage: ${error instanceof Error ? error.message : "Unknown error"}`)
	}
}

export async function canMakeQuery(userId: string, service: string): Promise<boolean> {
	if (!userId || !service) {
		throw new Error("userId and service are required")
	}

	const today = new Date()
	today.setHours(0, 0, 0, 0)

	const defaultLimits: Record<string, number> = {
		intelx: 25,
		osintalternative: 5,
		default: 200,
	}

	try {
		return await db.transaction(async (tx) => {
			let [serviceLimit] = await tx.select().from(serviceQueryLimits).where(eq(serviceQueryLimits.service, service))

			if (!serviceLimit) {
				;[serviceLimit] = await tx
					.insert(serviceQueryLimits)
					.values({
						service,
						dailyLimit: defaultLimits[service] ?? defaultLimits.default,
					})
					.returning()
			}

			const [dailyQuery] = await tx
				.select()
				.from(dailyServiceQueries)
				.where(
					and(
						eq(dailyServiceQueries.userId, userId),
						eq(dailyServiceQueries.service, service),
						eq(dailyServiceQueries.date, today),
					),
				)

			if (!dailyQuery) {
				await tx.insert(dailyServiceQueries).values({ userId, service, queriesUsed: 1, date: today })
				return true
			}

			if (dailyQuery.queriesUsed >= serviceLimit.dailyLimit) {
				return false
			}

			await tx
				.update(dailyServiceQueries)
				.set({ queriesUsed: dailyQuery.queriesUsed + 1 })
				.where(
					and(
						eq(dailyServiceQueries.userId, userId),
						eq(dailyServiceQueries.service, service),
						eq(dailyServiceQueries.date, today),
					),
				)

			return true
		})
	} catch (error) {
		console.error("Error checking query usage:", error)
		return false
	}
}
