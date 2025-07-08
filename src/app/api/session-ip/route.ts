import { db } from "@/db"
import { sessionIps } from "@/db/schema"
import { eq } from "drizzle-orm"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
	const sessionId = request.nextUrl.searchParams.get("sessionId")

	if (!sessionId) {
		return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
	}

	try {
		const record = await db.select().from(sessionIps).where(eq(sessionIps.sessionId, sessionId)).limit(1)

		if (!record || record.length === 0 || new Date(record[0].expiresAt) < new Date()) {
			return NextResponse.json({ exists: false, ip: null })
		}

		return NextResponse.json({ exists: true, ip: record[0].ip })
	} catch (error) {
		console.error("Error fetching session IP:", error)
		return NextResponse.json({ error: "Database error" }, { status: 500 })
	}
}

export async function POST(request: NextRequest) {
	try {
		const { sessionId, ip } = await request.json()

		if (!sessionId || !ip) {
			return NextResponse.json({ error: "Session ID and IP are required" }, { status: 400 })
		}

		const expiresAt = new Date()
		expiresAt.setSeconds(expiresAt.getSeconds() + 60 * 60 * 24 * 7)

		await db
			.insert(sessionIps)
			.values({
				sessionId,
				ip,
				expiresAt,
			})
			.onConflictDoUpdate({
				target: sessionIps.sessionId,
				set: { ip, expiresAt },
			})

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error("Error storing session IP:", error)
		return NextResponse.json({ error: "Database error" }, { status: 500 })
	}
}

export async function DELETE(request: NextRequest) {
	const sessionId = request.nextUrl.searchParams.get("sessionId")

	if (!sessionId) {
		return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
	}

	try {
		await db.delete(sessionIps).where(eq(sessionIps.sessionId, sessionId))
		return NextResponse.json({ success: true })
	} catch (error) {
		console.error("Error deleting session IP:", error)
		return NextResponse.json({ error: "Database error" }, { status: 500 })
	}
}
