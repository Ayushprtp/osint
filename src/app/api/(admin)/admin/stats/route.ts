import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { headers } from "next/headers"
import { APIError } from "@/lib/utils"
import { userSubscription, subscriptions } from "@/db/schema"
import { db } from "@/db"
import { gte, lt, eq, and, sql } from "drizzle-orm/sql"

export async function GET(_: Request) {
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

	const activeSubscriptions = await db
		.select()
		.from(userSubscription)
		.where(eq(userSubscription.isActive, true))
		.execute()

	const revenueThisMonth = await db
		.select({
			sum: sql<number>`SUM((${subscriptions.expiryDate} - ${subscriptions.startDate}) / 86400000 * 1)`,
		})
		.from(subscriptions)
		.where(
			and(
				gte(subscriptions.startDate, sql`date_trunc('month', CURRENT_DATE)`),
				lt(subscriptions.startDate, sql`date_trunc('month', CURRENT_DATE + interval '1 month')`),
			),
		)
		.execute()

	const pendingPayments = await db.select().from(subscriptions).where(eq(subscriptions.status, "pending")).execute()

	return NextResponse.json({
		activeSubscriptions: activeSubscriptions.length,
		revenueThisMonth: revenueThisMonth[0].sum,
		pendingPayments: pendingPayments.length,
	})
}
