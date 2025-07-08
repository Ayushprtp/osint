import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { headers } from "next/headers"
import { APIError } from "@/lib/utils"
import { db } from "@/db"
import { user } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function POST(request: Request) {
	const userSession = await auth.api.getSession({
		headers: await headers(),
	})

	const hasAdminPermission = await auth.api.userHasPermission({
		body: {
			userId: userSession?.user?.id,
			permissions: { user: ["create"] },
		},
	})
	if (!userSession || !hasAdminPermission) {
		throw new APIError("Unauthorized", 401)
	}

	const { alias } = await request.json()

	if (!alias || typeof alias !== "string") {
		throw new APIError("Alias is required", 400)
	}

	try {
		const userHash = Math.random().toString(36).substring(2, 10)
		const email = `${userHash}@t7.wtf`
		const name = userHash
		const password = userHash

		const { user: createdUser } = await auth.api.signUpEmail({
			body: {
				email,
				name,
				password,
			},
		})

		const [{ alias: setAlias }] = await db
			.update(user)
			.set({ alias })
			.where(eq(user.name, name))
			.returning({ alias: user.alias })

		return NextResponse.json({ success: true, user: createdUser, setAlias })
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error"
		throw new APIError(`Failed to create user: ${errorMessage}`, 500)
	}
}
