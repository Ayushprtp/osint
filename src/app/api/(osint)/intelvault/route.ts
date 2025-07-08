import { type NextRequest, NextResponse } from "next/server"
import { getMockSession, canMakeMockQuery, mockUserQueryUsed } from "@/lib/mock-auth"
// Mock query functions imported above
import { APIError, isApiChecker } from "@/lib/utils"
import { z } from "zod"

const INTELVAULT_API_URL = "https://api.intelvault.cc/api/v1/tools/breaches"
const VALID_SEARCH_FIELDS = [
	"email",
	"username",
	"first_name",
	"last_name",
	"city",
	"state",
	"post_code",
	"full_name",
	"ssn",
	"ip",
	"address_line_1",
	"phone",
	"vin",
	"domain",
	"password",
] as const

type SearchField = (typeof VALID_SEARCH_FIELDS)[number]

const fieldSchema = z.record(z.enum(VALID_SEARCH_FIELDS), z.string().min(1))

const requestSchema = z.object({
	fields: z.array(fieldSchema).min(1),
	useWildcard: z.boolean().optional().default(false),
})

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const { fields, useWildcard } = requestSchema.parse(body)

		if (!isApiChecker(request)) {
			const user = getMockSession()

					{ status: 403 },
				)
			}

			if (!(await canMakeMockQuery())) {
				throw new APIError("Query limit exceeded", 429)
			}

			await mockUserQueryUsed()
		}

		const fieldQueries = fields.map((field) => {
			const key = Object.keys(field)[0] as SearchField
			return { [key]: field[key] }
		})

		const response = await fetch(INTELVAULT_API_URL, {
			method: "POST",
			body: JSON.stringify({
				apiKey: process.env.INTELVAULT_API_KEY,
				field: fieldQueries,
				useWildcard: useWildcard || false,
			}),
			headers: {
				"Content-Type": "application/json",
			},
		})

		if (!response.ok) {
			throw new APIError(response.statusText, response.status)
		}

		const data = await response.json()

		if (!data.success) {
			throw new APIError(data.error.error || "IntelVault API error", 500)
		}

		return NextResponse.json({
			success: true,
			timeTaken: data.time_taken,
			results: data.results,
		})
	} catch (error) {
		if (error instanceof APIError) {
			throw new APIError(error.message, error.statusCode)
		}
		throw new APIError("An error occurred while processing your request", 500)
	}
}
