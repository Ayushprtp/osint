import { type NextRequest, NextResponse } from "next/server"
import { validateKey } from "@/lib/subscription"
import { auth } from "@/auth"
import { headers } from "next/headers"
import { APIError } from "@/lib/utils"

export async function POST(req: NextRequest) {
	const session = await auth.api.getSession({ headers: await headers() })
	if (!session) {
		throw new APIError("Unauthorized", 401)
	}

	try {
		const { key } = await req.json()

		if (!key) {
			return NextResponse.json({ error: "Subscription key is required" }, { status: 400 })
		}

		const result = await validateKey(session.user.id, key)

		if (!result.success) {
			return NextResponse.json({ error: result.message }, { status: 400 })
		}

		return NextResponse.json(result)
	} catch (error) {
		console.error("Error validating subscription key:", error)
		return NextResponse.json({ error: "Failed to validate subscription key" }, { status: 500 })
	}
}
