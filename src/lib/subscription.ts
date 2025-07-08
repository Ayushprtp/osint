import { eq, and, desc } from "drizzle-orm"
import { subscriptions, subscriptionKeys } from "@/db/schema"
import { db } from "@/db"
import { randomUUID } from "node:crypto"
import { createHash } from "node:crypto"

/**
 * Retrieves the active subscription for a user.
 * @param userId - The ID of the user.
 * @returns The active subscription or null if no active subscription exists.
 */
export async function getActiveSubscription(userId: string) {
	try {
		const [subscription] = await db
			.select()
			.from(subscriptions)
			.where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
			.limit(1)
			.orderBy(desc(subscriptions.startDate))

		if (subscription && new Date(Date.now()) > new Date(subscription.expiryDate)) {
			await db.update(subscriptions).set({ status: "expired" }).where(eq(subscriptions.id, subscription.id))
			return null
		}

		return subscription
	} catch (error) {
		console.error("Error fetching active subscription:", error)
		throw new Error("Failed to fetch active subscription")
	}
}

/**
 * Generates a subscription key with a specific duration.
 * @param durationDays - Number of days the subscription will last.
 * @returns The generated subscription key.
 */
export async function generateKey(durationDays: number): Promise<string> {
	if (durationDays <= 0) {
		throw new Error("Duration must be greater than 0 days")
	}

	const keyId = randomUUID()

	const keyBase = createHash("sha256").update(`${keyId}-${durationDays}-${Date.now()}`).digest("hex").substring(0, 16)

	const formattedKey =
		`${keyBase.substring(0, 4)}-${keyBase.substring(4, 8)}-${keyBase.substring(8, 12)}-${keyBase.substring(12, 16)}`.toUpperCase()
	try {
		await db.insert(subscriptionKeys).values({
			id: keyId,
			key: formattedKey,
			durationDays,
			isUsed: false,
			createdAt: new Date().toISOString(),
		})

		return formattedKey
	} catch (error) {
		console.error("Error generating subscription key:", error)
		throw new Error("Failed to generate subscription key")
	}
}

/**
 * Validates and claims a subscription key for a user.
 * @param userId - The ID of the user.
 * @param key - The subscription key to validate and claim.
 * @returns An object indicating success or failure of the operation.
 */
export async function validateKey(
	userId: string,
	key: string,
): Promise<{ success: boolean; message: string; durationDays?: number }> {
	try {
		const [subscriptionKey] = await db
			.select()
			.from(subscriptionKeys)
			.where(and(eq(subscriptionKeys.key, key), eq(subscriptionKeys.isUsed, false)))
			.limit(1)

		if (!subscriptionKey) {
			return {
				success: false,
				message: "Invalid or already used subscription key",
			}
		}

		await db
			.update(subscriptionKeys)
			.set({
				isUsed: true,
				usedBy: userId,
				usedAt: new Date().toISOString(),
			})
			.where(eq(subscriptionKeys.id, subscriptionKey.id))

		const currentSub = await getActiveSubscription(userId)
		const expiryDate = new Date(
			(currentSub?.expiryDate ? new Date(currentSub.expiryDate) : new Date()).getTime() +
				subscriptionKey.durationDays * 24 * 60 * 60 * 1000,
		)

		if (currentSub) {
			await db
				.update(subscriptions)
				.set({
					expiryDate: expiryDate.toISOString(),
				})
				.where(eq(subscriptions.id, currentSub.id))
		} else {
			await db.insert(subscriptions).values({
				id: randomUUID(),
				userId: userId,
				startDate: new Date().toISOString(),
				expiryDate: expiryDate.toISOString(),
				status: "active",
			})
		}

		return {
			success: true,
			message: currentSub
				? `Successfully extended subscription by ${subscriptionKey.durationDays} days`
				: `Successfully activated ${subscriptionKey.durationDays} days subscription`,
			durationDays: subscriptionKey.durationDays,
		}
	} catch (error) {
		console.error("Error validating subscription key:", error)
		throw new Error("Failed to validate subscription key")
	}
}

/**
 * Lists all active subscription keys.
 * @returns An array of active subscription keys.
 */
export async function listActiveKeys() {
	try {
		const keys = await db.select().from(subscriptionKeys).where(eq(subscriptionKeys.isUsed, false))

		return keys.map((key) => ({
			key: key.key,
			createdAt: key.createdAt,
			expiresAt: new Date(new Date(key.createdAt).getTime() + key.durationDays * 86400000).toISOString(),
			isActive: key.isUsed,
			usedBy: key.usedBy,
		}))
	} catch (error) {
		console.error("Error listing active subscription keys:", error)
		throw new Error("Failed to list active subscription keys")
	}
}
