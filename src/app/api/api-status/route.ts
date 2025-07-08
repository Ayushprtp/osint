import { NextResponse } from "next/server"
import { db } from "@/db"
import { apiStatus } from "@/db/schema"
import { desc } from "drizzle-orm"

export async function GET() {
	try {
		const statuses = await db.select().from(apiStatus).orderBy(desc(apiStatus.lastChecked))

		return NextResponse.json({ success: true, data: statuses })
	} catch (error) {
		console.error("Error fetching API status:", error)
		return NextResponse.json({ success: false, error: "Failed to fetch API status" }, { status: 500 })
	}
}
