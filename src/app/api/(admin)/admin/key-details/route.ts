import { auth } from "@/auth"
import { APIError } from "@/lib/utils"
import { db } from "@/db"
import { subscriptionKeys, user } from "@/db/schema"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
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

		const { searchParams } = new URL(request.url)
		const key = searchParams.get("key")

		if (!key) {
			return NextResponse.json({ error: "Subscription key is required" }, { status: 400 })
		}

		const keyDetails = await db
			.select()
			.from(subscriptionKeys)
			.where(eq(subscriptionKeys.key, key))
			.limit(1)
			.then((results) => results[0] || null)

		if (!keyDetails) {
			return NextResponse.json({ error: "Subscription key not found" }, { status: 404 })
		}

		const expiresAt = keyDetails.createdAt
			? new Date(new Date(keyDetails.createdAt).getTime() + keyDetails.durationDays * 86400000).toISOString()
			: null

		let userDetails = null
		if (keyDetails.isUsed && keyDetails.usedBy) {
			const userRecord = await db
				.select({
					id: user.id,
					name: user.name,
					email: user.email,
					alias: user.alias,
				})
				.from(user)
				.where(eq(user.id, keyDetails.usedBy))
				.limit(1)
				.then((results) => results[0] || null)

			userDetails = userRecord
		}

		return NextResponse.json({
			keyDetails: {
				key: keyDetails.key,
				exists: true,
				isUsed: keyDetails.isUsed,
				createdAt: keyDetails.createdAt,
				expiresAt,
				durationDays: keyDetails.durationDays,
				usedBy: keyDetails.usedBy || null,
				usedAt: keyDetails.usedAt || null,
				userDetails,
			},
		})
	} catch (error) {
		console.error("Error fetching subscription key details:", error)
		throw new APIError("Failed to fetch subscription key details", 500)
	}
}
