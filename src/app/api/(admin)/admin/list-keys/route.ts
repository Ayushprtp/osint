import { auth } from "@/auth"
import { APIError } from "@/lib/utils"
import { listActiveKeys } from "@/lib/subscription"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
	try {
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

		const keys = await listActiveKeys()

		return NextResponse.json({ keys })
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error"
		throw new APIError(`Failed to list subscription keys: ${errorMessage}`, 500)
	}
}
