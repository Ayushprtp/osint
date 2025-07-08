import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { headers } from "next/headers"
import { db } from "@/db"
import { alerts } from "@/db/schema"
import { desc } from "drizzle-orm"
import { APIError } from "@/lib/utils"

export async function GET(_: Request) {
	const userSession = await auth.api.getSession({
		headers: await headers(),
	})

	if (!userSession) {
		throw new APIError("Unauthorized", 401)
	}

	try {
		const [data] = await db
			.select({ text: alerts.text, createdAt: alerts.createdAt })
			.from(alerts)
			.orderBy(desc(alerts.createdAt))
			.limit(1)

		return NextResponse.json({ success: true, data })
	} catch (error) {
		throw new APIError("Internal Server Error", 500)
	}
}
