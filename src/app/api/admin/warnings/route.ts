import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { headers } from "next/headers"
import { APIError } from "@/lib/utils"
import { db } from "@/db"
import { userWarnings, user } from "@/db/schema"
import { eq, inArray } from "drizzle-orm"

export async function POST(request: Request) {
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

	const { usernames, message } = await request.json()

	if (!usernames || !Array.isArray(usernames) || usernames.length === 0) {
		throw new APIError("Usernames/hashes are required", 400)
	}

	if (!message || typeof message !== "string") {
		throw new APIError("Warning message is required", 400)
	}

	try {
		const existingUsers = await db.select({ id: user.id }).from(user).where(inArray(user.name, usernames))

		if (existingUsers.length !== usernames.length) {
			throw new APIError("One or more users not found", 404)
		}

		const warnings = await db
			.insert(userWarnings)
			.values(
				existingUsers.map((user) => ({
					userId: user.id,
					message,
					createdBy: userSession.user.id,
				})),
			)
			.returning()

		return NextResponse.json({ success: true, warnings })
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error"
		throw new APIError(`Failed to create warnings: ${errorMessage}`, 500)
	}
}

export async function GET(request: Request) {
	const userSession = await auth.api.getSession({
		headers: await headers(),
	})

	if (!userSession) {
		throw new APIError("Unauthorized", 401)
	}

	const { searchParams } = new URL(request.url)
	const userId = searchParams.get("userId")

	if (!userId) {
		throw new APIError("User ID is required", 400)
	}

	const hasAdminPermission = await auth.api.userHasPermission({
		body: {
			userId: userSession.user.id,
			permissions: { user: ["list"] },
		},
	})

	if (!hasAdminPermission && userId !== userSession.user.id) {
		throw new APIError("Unauthorized", 401)
	}

	try {
		const warnings = await db
			.select()
			.from(userWarnings)
			.where(eq(userWarnings.userId, userId))
			.orderBy(userWarnings.createdAt)

		return NextResponse.json({ success: true, warnings })
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error"
		throw new APIError(`Failed to fetch warnings: ${errorMessage}`, 500)
	}
}

export async function PATCH(request: Request) {
	const userSession = await auth.api.getSession({
		headers: await headers(),
	})

	if (!userSession) {
		throw new APIError("Unauthorized", 401)
	}

	const { warningId } = await request.json()

	if (!warningId) {
		throw new APIError("Warning ID is required", 400)
	}

	try {
		const [warning] = await db.select().from(userWarnings).where(eq(userWarnings.id, warningId))

		if (!warning) {
			throw new APIError("Warning not found", 404)
		}

		const hasAdminPermission = await auth.api.userHasPermission({
			body: {
				userId: userSession.user.id,
				permissions: { user: ["list"] },
			},
		})

		if (!hasAdminPermission && warning.userId !== userSession.user.id) {
			throw new APIError("Unauthorized", 401)
		}

		const updatedWarning = await db
			.update(userWarnings)
			.set({ isRead: true })
			.where(eq(userWarnings.id, warningId))
			.returning()

		return NextResponse.json({ success: true, warning: updatedWarning[0] })
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error"
		throw new APIError(`Failed to update warning: ${errorMessage}`, 500)
	}
}
