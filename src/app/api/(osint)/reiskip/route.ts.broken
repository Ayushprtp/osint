import { type NextRequest, NextResponse } from "next/server"
import { getMockSession, canMakeMockQuery, mockUserQueryUsed } from "@/lib/mock-auth"
// Mock query functions imported above
import { APIError, isApiChecker } from "@/lib/utils"
import { z } from "zod"

const HOUSE_LOOKUP_API_URL = "http://rapek.ink:8000/api/house_lookup"
const HOUSE_LOOKUP_API_KEY = process.env.HOUSE_LOOKUP_API_KEY || "c0130c44559b56b1a684d57688f88d68"

const requestSchema = z.object({
	address: z.string().min(5, "Address is required"),
})

export async function POST(request: NextRequest) {
	if (!isApiChecker(request)) {
		try {
			const user = getMockSession()

					{ status: 403 },
				)
			}

			const body = await request.json()
			const { address } = requestSchema.parse(body)

			if (!address) {
				throw new APIError("Address is required", 400)
			}

			if (!(await canMakeMockQuery())) {
				throw new APIError("Query limit exceeded", 429)
			}

			await mockUserQueryUsed()

			const searchResponse = await fetch(HOUSE_LOOKUP_API_URL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-api-key": HOUSE_LOOKUP_API_KEY,
				},
				body: JSON.stringify({ address }),
			})

			const data = await searchResponse.json()

			if (!searchResponse.ok || data.code !== 200) {
				throw new APIError(
					data.message || data.error || `API request failed with status ${searchResponse.status}`,
					searchResponse.status,
				)
			}

			return NextResponse.json({
				success: true,
				data: data.data,
			})
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

			console.error("House Lookup API error:", error)
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
			const { address } = requestSchema.parse(body)

			if (!address) {
				throw new APIError("Address is required", 400)
			}

			const searchResponse = await fetch(HOUSE_LOOKUP_API_URL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-api-key": HOUSE_LOOKUP_API_KEY,
				},
				body: JSON.stringify({ address }),
			})

			const data = await searchResponse.json()

			if (!searchResponse.ok || data.code !== 200) {
				throw new APIError(
					data.message || data.error || `API request failed with status ${searchResponse.status}`,
					searchResponse.status,
				)
			}

			return NextResponse.json({
				success: true,
				data: data.data,
			})
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

			console.error("House Lookup API error:", error)
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
