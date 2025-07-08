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

			// Mock response in the expected OSINTDog format
			const mockData = {
				success: true,
				data: {
					success: true,
					credit: "100",
					intelvault_results: {
						success: true,
						time_taken: 100,
						results: []
					},
					snusbase_results: {
						took: 10,
						size: 0,
						results: {}
					},
					leakcheck_results: {
						success: true,
						quota: 100,
						found: 0,
						result: []
					},
					breachbase_results: {
						code: 200,
						data: {
							content: [],
							status: "success"
						},
						message: "No results found"
					},
					hackcheck_results: {
						code: 200,
						data: {
							data: {
								databases: 0,
								elapsed: "100ms",
								found: 0,
								results: []
							}
						},
						message: "No results found"
					}
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
					success: true,
					credit: "100",
					intelvault_results: {
						success: true,
						time_taken: 100,
						results: []
					},
					snusbase_results: {
						took: 10,
						size: 0,
						results: {}
					},
					leakcheck_results: {
						success: true,
						quota: 100,
						found: 0,
						result: []
					},
					breachbase_results: {
						code: 200,
						data: {
							content: [],
							status: "success"
						},
						message: "API checker bypass"
					},
					hackcheck_results: {
						code: 200,
						data: {
							data: {
								databases: 0,
								elapsed: "100ms",
								found: 0,
								results: []
							}
						},
						message: "API checker bypass"
					}
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