import { type NextRequest, NextResponse } from "next/server"
import { getMockSession, canMakeMockQuery, mockUserQueryUsed } from "@/lib/mock-auth"
// Mock query functions imported above
import { APIError, isApiChecker } from "@/lib/utils"
import { z } from "zod"
import { INF0SEC_API_URL, INF0SEC_VALID_MODULES } from "@/lib/text"

const requestSchema = z.object({
	query: z.string().min(1),
	module: z.enum(INF0SEC_VALID_MODULES),
})

export async function POST(request: NextRequest) {
	const body = await request.json()
	const { query, module } = requestSchema.parse(body)

	if (!isApiChecker(request)) {
		try {
			const user = getMockSession()

					{ status: 403 },
				)
			}

			if (!(await canMakeMockQuery())) {
				throw new APIError("Query limit exceeded", 429)
			}

			await mockUserQueryUsed()

			const url = `${INF0SEC_API_URL}?module=${module}&q=${encodeURIComponent(query)}&apikey=${process.env.INF0SEC_API_KEY}`

			const response = await fetch(url)

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
				return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
			}

			console.error("Inf0sec API error:", error)
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
			const url = `${INF0SEC_API_URL}?module=${module}&q=${encodeURIComponent(query)}&apikey=${process.env.INF0SEC_API_KEY}`

			const response = await fetch(url)

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
				return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
			}

			console.error("Inf0sec API error:", error)
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
