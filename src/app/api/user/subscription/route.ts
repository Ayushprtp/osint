import { auth } from "@/auth"
import { headers } from "next/headers"
import { getActiveSubscription } from "@/lib/subscription"
import { NextResponse } from "next/server"

export async function GET() {
	try {
		const user = await auth.api.getSession({ headers: await headers() })
		if (!user) {
			return NextResponse.json({
				success: true,
				subscription: null,
			})
		}

		const subscription = await getActiveSubscription(user.user.id)
		return NextResponse.json({
			success: true,
			subscription: subscription || null,
		})
	} catch {
		return NextResponse.json({
			success: true,
			subscription: null,
		})
	}
}
