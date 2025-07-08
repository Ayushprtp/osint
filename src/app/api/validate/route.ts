import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
	// Authentication disabled - subscription validation not required
	try {
		const { key } = await req.json()

		if (!key) {
			return NextResponse.json({ error: "Subscription key is required" }, { status: 400 })
		}

		// Mock successful validation response
		return NextResponse.json({
			success: true,
			message: "Authentication disabled - validation bypassed"
		})
	} catch (error) {
		console.error("Error validating subscription key:", error)
		return NextResponse.json({ error: "Failed to validate subscription key" }, { status: 500 })
	}
}
