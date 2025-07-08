import { getMockSession, canMakeMockQuery, mockUserQueryUsed } from "@/lib/mock-auth"
import { type NextRequest, NextResponse } from "next/server"
import { APIError, isApiChecker } from "@/lib/utils"
import { z } from "zod"

// Standard schema - customize as needed for each route
const requestSchema = z.object({
	query: z.string().min(1),
})

export async function POST(request: NextRequest) {
	if (!isApiChecker(request)) {
		try {
			// Get mock session (authentication disabled)
			const user = getMockSession()

			const body = await request.json()
			const { query } = requestSchema.parse(body)

			// Check query limits
			if (!(await canMakeMockQuery())) {
				throw new APIError("Query limit exceeded", 429)
			}

			// Track query usage
			await mockUserQueryUsed()

			// Mock response in the expected VinAudit format
			const mockData = {
				success: true,
				data: {
					id: `mock-${Date.now()}`,
					vin: query,
					date: new Date().toISOString(),
					mode: "mock",
					clean: true,
					specs: {
						Year: null,
						Make: null,
						Model: null,
						Trim: null,
						Engine: null,
						Style: null,
						"Made In": null,
						"Fuel Type": null,
						"Fuel Capacity": null,
						"City Mileage": null,
						"Highway Mileage": null,
						"Overall Length": null,
						"Overall Width": null,
						"Overall Height": null,
						"Gross Weight": null,
						"Standard Seating": null,
						MSRP: null,
						"Invoice Price": null,
						Description: "Mock VIN data - authentication disabled"
					},
					titles: [],
					accidents: [],
					salvage: [],
					thefts: []
				}
			}

			return NextResponse.json(mockData)
		} catch (error) {
			if (error instanceof z.ZodError) {
				return NextResponse.json(
					{
						success: false,
						error: "Invalid request parameters",
						details: error.errors,
					},
					{ status: 400 },
				)
			}

			if (error instanceof APIError) {
				return NextResponse.json(
					{
						success: false,
						error: error.message,
					},
					{ status: error.statusCode },
				)
			}

			return NextResponse.json(
				{
					success: false,
					error: error instanceof Error ? error.message : "Unknown error occurred",
				},
				{ status: 500 },
			)
		}
	} else {
		// API checker bypass (for monitoring tools)
		try {
			const body = await request.json()
			const { query } = requestSchema.parse(body)

			const mockData = {
				success: true,
				data: {
					id: `mock-${Date.now()}`,
					vin: query,
					date: new Date().toISOString(),
					mode: "mock",
					clean: true,
					specs: {
						Year: null,
						Make: null,
						Model: null,
						Trim: null,
						Engine: null,
						Style: null,
						"Made In": null,
						"Fuel Type": null,
						"Fuel Capacity": null,
						"City Mileage": null,
						"Highway Mileage": null,
						"Overall Length": null,
						"Overall Width": null,
						"Overall Height": null,
						"Gross Weight": null,
						"Standard Seating": null,
						MSRP: null,
						"Invoice Price": null,
						Description: "Mock VIN data - API checker bypass"
					},
					titles: [],
					accidents: [],
					salvage: [],
					thefts: []
				}
			}

			return NextResponse.json(mockData)
		} catch (error) {
			if (error instanceof z.ZodError) {
				return NextResponse.json(
					{
						success: false,
						error: "Invalid request parameters",
						details: error.errors,
					},
					{ status: 400 },
				)
			}

			return NextResponse.json(
				{
					success: false,
					error: error instanceof Error ? error.message : "Unknown error occurred",
				},
				{ status: 500 },
			)
		}
	}
}