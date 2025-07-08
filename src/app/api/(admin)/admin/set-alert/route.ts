import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { headers } from "next/headers"
import { db } from "@/db"
import { alerts } from "@/db/schema"
import { APIError } from "@/lib/utils"

export async function POST(req: Request) {
	try {
		const userSession = await auth.api.getSession({
			headers: await headers(),
		})

		const hasAdminPermission = await auth.api.userHasPermission({
			body: {
				userId: userSession?.user?.id,
				permissions: { user: ["set-role"] },
			},
		})
		if (!userSession || !hasAdminPermission) {
			throw new APIError("Unauthorized", 401)
		}

		const { alertText } = await req.json()

		if (!alertText || typeof alertText !== "string") {
			throw new APIError("Invalid alert text", 400)
		}

		await db
			.insert(alerts)
			.values({
				text: alertText,
			})
			.onConflictDoNothing()

		return NextResponse.json({ success: true }, { status: 200 })
	} catch (error) {
		if (error instanceof APIError) {
			return NextResponse.json({ error: error.message }, { status: error.statusCode })
		}

		const message = error instanceof Error ? error.message : "An unknown error occurred"
		throw new APIError(message, 500)
	}
}
