import { type NextRequest, NextResponse } from "next/server"
import { getMockSubscription } from "@/lib/mock-auth"

export async function GET(_: NextRequest) {
	// Authentication disabled - returning mock subscription data
	try {
		const subscription = await getMockSubscription()

		return NextResponse.json({
			active: subscription.active,
			expiryDate: subscription.expiryDate,
			daysLeft: subscription.daysLeft,
		})
	} catch (error) {
		console.error("Error fetching subscription status:", error)
		return NextResponse.json({ error: "Failed to fetch subscription status" }, { status: 500 })
	}
}
