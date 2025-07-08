import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { headers } from "next/headers"
import { APIError } from "@/lib/utils"
import { db } from "@/db"
import { user } from "@/db/schema"
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

		const { id, alias } = await req.json()

		if (!id || typeof id !== "string" || !alias || typeof alias !== "string") {
			throw new APIError("Invalid request data", 400)
		}

		const [updatedUser] = await db.update(user).set({ alias }).where(eq(user.name, id)).returning()

		if (!updatedUser) {
			throw new APIError("User not found", 404)
		}

		return NextResponse.json({ success: true, data: updatedUser })
	} catch (error) {
		if (error instanceof APIError) {
			return NextResponse.json({ error: error.message }, { status: error.statusCode })
		}

		const message = error instanceof Error ? error.message : "An unknown error occurred"
		throw new APIError(message, 500)
	}
}
