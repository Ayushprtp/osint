import { authClient } from "@/client"
import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/auth"
import { APIError } from "@/lib/utils"

export async function POST(_: NextRequest) {
	const session = await auth.api.getSession({ headers: await headers() })
	if (!session) {
		throw new APIError("Unauthorized", 401)
	}

	try {
		await authClient.revokeSessions()
		return NextResponse.json({ success: true })
	} catch (error) {
		console.error("Error revoking sessions:", error)
		return NextResponse.json({ error: "Failed to revoke sessions" }, { status: 500 })
	}
}
