import { auth } from "@/auth"
import { APIError } from "@/lib/utils"
import { generateKey } from "@/lib/subscription"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

const MAX_KEYS_PER_REQUEST = 100

export async function POST(req: Request) {
	try {
		const { durationDays, count = 1 } = await req.json()

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

		if (!durationDays || durationDays <= 0) {
			return NextResponse.json({ error: "Valid duration in days is required" }, { status: 400 })
		}

		if (count < 1 || count > MAX_KEYS_PER_REQUEST) {
			return NextResponse.json(
				{ error: `Cannot generate more than ${MAX_KEYS_PER_REQUEST} keys at once` },
				{ status: 400 },
			)
		}

		const keys = await Promise.all(Array.from({ length: count }, async () => await generateKey(durationDays)))

		return NextResponse.json({ keys })
	} catch (error) {
		console.error("Error generating subscription key:", error)
		throw new APIError("Failed to generate subscription key", 500)
	}
}
