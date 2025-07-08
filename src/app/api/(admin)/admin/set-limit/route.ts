import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { headers } from "next/headers"
import { APIError } from "@/lib/utils"
import { db } from "@/db"
import { serviceQueryLimits } from "@/db/schema"
import { eq } from "drizzle-orm"

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

		const { service, dailyLimit } = await req.json()

		if (!service || typeof dailyLimit !== "number" || dailyLimit < 0) {
			throw new APIError(
				"Invalid input: service and dailyLimit are required, and dailyLimit must be a non-negative number",
				400,
			)
		}

		const [result] = await db.transaction(async (tx) => {
			const [existingLimit] = await tx.select().from(serviceQueryLimits).where(eq(serviceQueryLimits.service, service))

			if (existingLimit) {
				return await tx
					.update(serviceQueryLimits)
					.set({ dailyLimit })
					.where(eq(serviceQueryLimits.service, service))
					.returning()
			}

			return await tx
				.insert(serviceQueryLimits)
				.values({
					service,
					dailyLimit,
				})
				.returning()
		})

		return NextResponse.json({
			success: true,
			data: result,
		})
	} catch (error) {
		if (error instanceof APIError) {
			return NextResponse.json({ error: error.message }, { status: error.statusCode })
		}

		const errorMessage = error instanceof Error ? error.message : "Unknown error"
		throw new APIError(`Error setting limit: ${errorMessage}`, 500)
	}
}
