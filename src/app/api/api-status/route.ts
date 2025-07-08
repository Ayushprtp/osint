import { NextResponse } from "next/server"

export async function GET() {
	// Authentication disabled - returning mock API status data
	try {
		const mockStatuses = [
			{
				id: 1,
				service: "OSINT Services",
				status: "operational",
				last_checked: new Date().toISOString(),
				error: null,
				response_time: 150
			},
			{
				id: 2,
				service: "Search APIs",
				status: "operational", 
				last_checked: new Date().toISOString(),
				error: null,
				response_time: 200
			},
			{
				id: 3,
				service: "Data Sources",
				status: "operational",
				last_checked: new Date().toISOString(), 
				error: null,
				response_time: 180
			}
		]

		return NextResponse.json({ success: true, data: mockStatuses })
	} catch (error) {
		console.error("Error fetching API status:", error)
		return NextResponse.json({ success: false, error: "Failed to fetch API status" }, { status: 500 })
	}
}
