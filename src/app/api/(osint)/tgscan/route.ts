import { getMockSession, canMakeMockQuery, mockUserQueryUsed } from "@/lib/mock-auth"
// Mock query functions imported above
import { type NextRequest, NextResponse } from "next/server"
import { TGSCAN_SEARCH_API_URL } from "@/lib/text"
import { APIError, isApiChecker } from "@/lib/utils"
import { z } from "zod"

const requestSchema = z.object({
	query: z.string().min(1),
})

export async function POST(request: NextRequest) {
	if (!isApiChecker(request)) {
		try {
			const user = getMockSession()

					{ status: 403 },
				)
			}
			const body = await request.json()
			const { query } = requestSchema.parse(body)

			if (!(await canMakeMockQuery())) {
				throw new APIError("Query limit exceeded", 429)
			}

			await mockUserQueryUsed()

			const response = await fetch(TGSCAN_SEARCH_API_URL, {
				method: "POST",
				headers: {
					"Api-Key": process.env.TGSCAN_API_KEY!,
				},
				body: `query=${encodeURIComponent(query)}`,
			})

			if (!response.ok) {
				throw new APIError(response.statusText, response.status)
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
					error: "An error occurred while processing your request",
				},
				{ status: 500 },
			)
		}
	} else {
		try {
			const body = await request.json()
			const { query } = requestSchema.parse(body)

			const response = await fetch(TGSCAN_SEARCH_API_URL, {
				method: "POST",
				headers: {
					"Api-Key": process.env.TGSCAN_API_KEY!,
				},
				body: `query=${encodeURIComponent(query)}`,
			})

			if (!response.ok) {
				throw new APIError(response.statusText, response.status)
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
					error: "An error occurred while processing your request",
				},
				{ status: 500 },
			)
		}
	}
}
