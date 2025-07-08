import { NextResponse } from "next/server"
import { db } from "@/db"
import { eq } from "drizzle-orm"
import { user } from "@/db/schema"
import { headers } from "next/headers"
import { auth } from "@/auth"
import { APIError } from "@/lib/utils"

export async function DELETE(req: Request) {
	const userSession = await auth.api.getSession({
		headers: await headers(),
	})

	const hasAdminPermission = await auth.api.userHasPermission({
		body: {
			userId: userSession?.user?.id,
			permissions: { user: ["ban"] },
		},
	})
	if (!userSession || !hasAdminPermission) {
		throw new APIError("Unauthorized", 401)
	}

	const body = await req.json().catch(() => ({}))
	const { username } = body

	if (!username || typeof username !== "string") {
		throw new APIError("Username is required", 400)
	}

	try {
		const users = await db
			.select({
				id: user.id,
				name: user.name,
			})
			.from(user)
			.where(eq(user.name, username))
			.limit(1)

		if (!users.length) {
			throw new APIError("User not found", 404)
		}

		const userToBan = users[0]

		await auth.api.banUser({
			body: {
				userId: userToBan.id,
				banReason: "You have been banned by an admin, please contact support for more information.",
				banExpiresIn: undefined,
			},
		})

		return NextResponse.json({ success: true, message: "User banned" })
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error"
		throw new APIError(`Failed to ban user: ${errorMessage}`, 500)
	}
}
