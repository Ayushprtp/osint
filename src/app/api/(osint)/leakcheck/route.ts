import { type NextRequest, NextResponse } from "next/server"
import { getMockSession, canMakeMockQuery, mockUserQueryUsed } from "@/lib/mock-auth"
// Mock query functions imported above
import { APIError, isApiChecker } from "@/lib/utils"
import { z } from "zod"

const LEAKCHECK_API_URL = "https://leakcheck.io/api/v2"

const requestSchema = z.object({
	query: z.string().min(1),
	type: z.enum(["auto", "email", "domain", "keyword", "username", "phone", "hash", "phash"]).default("auto"),
})

export async function POST(request: NextRequest) {
	const body = await request.json()
	const { query, type } = requestSchema.parse(body)

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

			const url = `${LEAKCHECK_API_URL}/query/${query}${type !== "auto" ? `?type=${type}` : ""}`

			const response = await fetch(url, {
				method: "GET",
				headers: {
					Accept: "application/json",
					"X-API-Key": process.env.LEAKCHECK_API_KEY || "",
				},
			})

			if (!response.ok) {
				throw new APIError(response.statusText, response.status)
			}

			const data = await response.json()
			return NextResponse.json(data)
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

			console.error("LeakCheck API error:", error)
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
			const url = `${LEAKCHECK_API_URL}/query/${query}${type !== "auto" ? `?type=${type}` : ""}`

			const response = await fetch(url, {
				method: "GET",
				headers: {
					Accept: "application/json",
					"X-API-Key": process.env.LEAKCHECK_API_KEY || "",
				},
			})

			if (!response.ok) {
				throw new APIError(response.statusText, response.status)
			}

			const data = await response.json()
			return NextResponse.json(data)
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

			console.error("LeakCheck API error:", error)
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
