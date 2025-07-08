import { NextResponse } from "next/server"

export async function GET(_: Request) {
	// Authentication disabled - returning mock alert data
	try {
		const mockData = {
			text: "Welcome to the OSINT Dashboard - Authentication has been disabled for easy access!",
			createdAt: new Date().toISOString()
		}

		return NextResponse.json({ success: true, data: mockData })
	} catch (error) {
		return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
	}
}
