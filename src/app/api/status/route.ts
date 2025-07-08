import { type NextRequest, NextResponse } from "next/server"
import { getActiveSubscription } from "@/lib/subscription"
import { headers } from "next/headers"
import { auth } from "@/auth"
import { APIError } from "@/lib/utils"

export async function GET(_: NextRequest) {
	const session = await auth.api.getSession({ headers: await headers() })
	if (!session) {
		throw new APIError("Unauthorized", 401)
	}

	try {
		const subscription = await getActiveSubscription(session.user.id)

		if (!subscription) {
			return NextResponse.json({
				active: false,
			})
		}

		const expiryDate = new Date(subscription.expiryDate)
		const now = new Date()
		const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

		return NextResponse.json({
			active: true,
			expiryDate: subscription.expiryDate,
			daysLeft,
		})
	} catch (error) {
		console.error("Error fetching subscription status:", error)
		return NextResponse.json({ error: "Failed to fetch subscription status" }, { status: 500 })
	}
}
