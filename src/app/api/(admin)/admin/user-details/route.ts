import { auth } from "@/auth";
import { APIError } from "@/lib/utils";
import { db } from "@/db";
import { subscriptionKeys, user, subscriptions } from "@/db/schema";
import { eq, or, and, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const userSession = await auth.api.getSession({
			headers: await headers(),
		});

		const hasAdminPermission = await auth.api.userHasPermission({
			body: {
				userId: userSession?.user?.id,
				permissions: { user: ["list"] },
			},
		});
		if (!userSession || !hasAdminPermission) {
			throw new APIError("Unauthorized", 401);
		}

		const { searchParams } = new URL(request.url);
		const identifier = searchParams.get("identifier");

		if (!identifier) {
			return NextResponse.json(
				{ error: "User identifier is required" },
				{ status: 400 },
			);
		}

		// Find user by username, alias, or email
		const [userDetails] = await db
			.select()
			.from(user)
			.where(
				or(
					eq(user.name, identifier),
					eq(user.alias, identifier),
					eq(user.email, identifier)
				)
			)
			.limit(1);

		if (!userDetails) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 },
			);
		}

		// Get active subscription for the user
		const [subscription] = await db
			.select()
			.from(subscriptions)
			.where(
				and(
					eq(subscriptions.userId, userDetails.id),
					eq(subscriptions.status, "active"),
				),
			)
			.limit(1)
			.orderBy(desc(subscriptions.startDate));

		// Find the subscription key used by this user
		const [key] = await db
			.select()
			.from(subscriptionKeys)
			.where(eq(subscriptionKeys.usedBy, userDetails.id))
			.limit(1)
			.orderBy(desc(subscriptionKeys.usedAt));

		if (!subscription || !key) {
			return NextResponse.json(
				{ error: "No active subscription found for this user" },
				{ status: 404 },
			);
		}

		// Calculate subscription duration in days
		const startDate = new Date(subscription.startDate);
		const expiryDate = new Date(subscription.expiryDate);
		const subscriptionDays = Math.round((expiryDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

		return NextResponse.json({
			userSubscription: {
				exists: true,
				subscriptionDays,
				expiresAt: subscription.expiryDate,
				key: key.key,
				usedAt: key.usedAt,
				userDetails: {
					id: userDetails.id,
					name: userDetails.name,
					email: userDetails.email,
					alias: userDetails.alias || "",
				},
			},
		});
	} catch (error) {
		console.error("Error fetching user details:", error);
		return NextResponse.json(
			{ error: "Failed to fetch user details" },
			{ status: 500 },
		);
	}
} 
