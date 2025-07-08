import { type NextRequest, NextResponse } from "next/server"
import { getMockSession, canMakeMockQuery, mockUserQueryUsed } from "@/lib/mock-auth"
// Mock query functions imported above
import { APIError, isApiChecker } from "@/lib/utils"
import { z } from "zod"

const requestSchema = z.object({
	query: z.string().min(1),
	use_case: z.string().optional(),
})

export async function POST(request: NextRequest) {
	if (!isApiChecker(request)) {
		try {
			const user = getMockSession()

					{ status: 403 },
				)
			}

			const body = await request.json()
			const { query, use_case } = requestSchema.parse(body)

			if (!(await canMakeMockQuery())) {
				throw new APIError("Query limit exceeded", 429)
			}

			await mockUserQueryUsed()

			const apiUrl = "https://api.r00m101.com/analyze"
			const apiKey = process.env.ROOM101_API_KEY

			if (!apiKey) {
				throw new APIError("Room101 API key not configured", 500)
			}

			let requestUrl = `${apiUrl}/${encodeURIComponent(query)}`
			if (use_case) {
				requestUrl += `?use_case=${use_case}`
			}

			const response = await fetch(requestUrl, {
				method: "GET",
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${apiKey}`,
				},
			})

			if (!response.ok) {
				throw new APIError(`Room101 API error: ${response.statusText}`, response.status)
			}

			const data = await response.json()
			return NextResponse.json({ success: true, data })
		} catch (error) {
			console.error("Error in room101 route:", error)

			if (error instanceof z.ZodError) {
				return NextResponse.json(
					{
						success: false,
						error: "Invalid request data",
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
					error: "An error occurred while processing your request",
				},
				{ status: 500 },
			)
		}
	} else {
		try {
			const body = await request.json()
			const { query, use_case } = requestSchema.parse(body)

			const apiUrl = "https://api.r00m101.com/analyze"
			const apiKey = process.env.ROOM101_API_KEY

			if (!apiKey) {
				throw new APIError("Room101 API key not configured", 500)
			}

			let requestUrl = `${apiUrl}/${encodeURIComponent(query)}`
			if (use_case) {
				requestUrl += `?use_case=${use_case}`
			}

			const response = await fetch(requestUrl, {
				method: "GET",
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${apiKey}`,
				},
			})

			if (!response.ok) {
				throw new APIError(`Room101 API error: ${response.statusText}`, response.status)
			}

			const data = await response.json()
			return NextResponse.json({ success: true, data })
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
	}
}
