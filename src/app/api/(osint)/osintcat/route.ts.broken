import { getMockSession, canMakeMockQuery, mockUserQueryUsed } from "@/lib/mock-auth"
// Mock query functions imported above
import { type NextRequest, NextResponse } from "next/server"
import { OSINTCAT_API_URL, OSINTCAT_SEARCH_TYPES } from "@/lib/text"
import { APIError, isApiChecker } from "@/lib/utils"
import { z } from "zod"
import fetch from "node-fetch"

const requestSchema = z.object({
	query: z.string().min(1),
	searchType: z.enum(OSINTCAT_SEARCH_TYPES),
})

export async function POST(request: NextRequest) {
	if (!isApiChecker(request)) {
		try {
			const user = getMockSession()

					{ status: 403 },
				)
			}

			const body = await request.json()
			const { query, searchType } = requestSchema.parse(body)

			if (!(await canMakeMockQuery())) {
				throw new APIError("Query limit exceeded", 429)
			}

			await mockUserQueryUsed()

			const response = await fetch(
				`${OSINTCAT_API_URL}?term=${query}&type=${searchType}&api_key=${process.env.OSINTCAT_API_KEY}`,
				{
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
					},
				},
			)

			if (!response.ok) {
				throw new APIError(response.statusText, response.status)
			}

			const data = (await response.json()) as {
				credit?: unknown
				[key: string]: unknown
			}
			data.credit = undefined

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
	} else {
		try {
			const body = await request.json()
			const { query, searchType } = requestSchema.parse(body)

			const response = await fetch(
				`${OSINTCAT_API_URL}?term=${query}&type=${searchType}&api_key=${process.env.OSINTCAT_API_KEY}`,
				{
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
					},
				},
			)

			if (!response.ok) {
				throw new APIError(response.statusText, response.status)
			}

			const data = (await response.json()) as {
				credit?: unknown
				[key: string]: unknown
			}
			data.credit = undefined

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
