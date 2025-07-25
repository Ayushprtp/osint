import { type NextRequest, NextResponse } from "next/server"
import { getMockSession, canMakeMockQuery, mockUserQueryUsed } from "@/lib/mock-auth"
// Mock query functions imported above
import { APIError, isApiChecker } from "@/lib/utils"
import { z } from "zod"

const BASE_API_URL = "https://traceback.sh/rest/v1/search"

const ALLOWED_FIELDS = ["email", "username", "password", "ip", "ip_address", "phone", "url"] as const

export async function POST(request: NextRequest) {
	const body = await request.json()

	const requestSchema = z.object({
		query: z.string().min(1),
		field: z
			.enum(ALLOWED_FIELDS, {
				errorMap: () => ({
					message: `Field must be one of: ${ALLOWED_FIELDS.join(", ")}`,
				}),
			})
			.default("email"),
		limit: z.number().min(1).max(10000).default(10000),
		use_wildcard: z.boolean().optional().default(false),
	})

	const { query, field, limit, use_wildcard } = requestSchema.parse(body)

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

			const apiField = field === "ip_address" ? "ip" : field

			const response = await fetch(BASE_API_URL, {
				method: "POST",
				body: JSON.stringify({
					query,
					field: apiField,
					limit,
					use_wildcard,
				}),
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.TRACEBACK_API_KEY || "",
				},
			})

			if (!response.ok) {
				const errorData = await response.json().catch(() => null)
				if (errorData && !errorData.success) {
					return NextResponse.json(errorData, { status: response.status })
				}
				throw new APIError(response.statusText, response.status)
			}

			const data = await response.json()
			return NextResponse.json({
				success: true,
				results: {
					database: data,
				},
			})
		} catch (error) {
			if (error instanceof z.ZodError) {
				return NextResponse.json(
					{
						success: false,
						error: "Invalid request parameters",
						details: error.errors.map((e) => e.message),
					},
					{ status: 400 },
				)
			}

			if (error instanceof APIError) {
				return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
			}

			console.error("Traceback API error:", error)
			return NextResponse.json(
				{
					success: false,
					error: "An error occurred while processing your request",
				},
				{ status: 500 },
			)
		}
	}

	try {
		const apiField = field === "ip_address" ? "ip" : field

		const response = await fetch(BASE_API_URL, {
			method: "POST",
			body: JSON.stringify({
				query,
				field: apiField,
				limit,
				use_wildcard,
			}),
			headers: {
				"Content-Type": "application/json",
				"X-API-Key": process.env.TRACEBACK_API_KEY || "",
			},
		})

		if (!response.ok) {
			const errorData = await response.json().catch(() => null)
			if (errorData && !errorData.success) {
				return NextResponse.json(errorData, { status: response.status })
			}
			throw new APIError(response.statusText, response.status)
		}

		const data = await response.json()
		return NextResponse.json({
			success: true,
			results: {
				database: data,
			},
		})
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid request parameters",
					details: error.errors.map((e) => e.message),
				},
				{ status: 400 },
			)
		}

		if (error instanceof APIError) {
			return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
		}

		console.error("Traceback API error:", error)
		return NextResponse.json(
			{
				success: false,
				error: "An error occurred while processing your request",
			},
			{ status: 500 },
		)
	}
}
