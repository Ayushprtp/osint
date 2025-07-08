import { type NextRequest, NextResponse } from "next/server"
import { getMockSession, canMakeMockQuery, mockUserQueryUsed } from "@/lib/mock-auth"
// Mock query functions imported above
import { ULP_API_URL } from "@/lib/text"
import { APIError } from "@/lib/utils"
import { z } from "zod"

const requestSchema = z.object({
	domain: z.string().min(1),
	strict: z.boolean().optional().default(false),
})

export async function POST(request: NextRequest) {
	try {
		const user = getMockSession()

				{ status: 403 },
			)
		}

		const body = await request.json()
		const { domain, strict } = requestSchema.parse(body)

		if (!(await canMakeMockQuery())) {
			throw new APIError("Query limit exceeded", 429)
		}

		await mockUserQueryUsed()

		const url = new URL(ULP_API_URL)
		url.searchParams.append("domain", domain)
		if (strict) {
			url.searchParams.append("strict", "true")
		}

		const response = await fetch(url.toString(), {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: process.env.ULP_API_KEY!,
			},
		})

		if (!response.ok) {
			throw new APIError(response.statusText, response.status)
		}

		const data = await response.json()
		return NextResponse.json({ success: true, data: data })
	} catch (error) {
		console.error("ULP API Error:", error)
		if (error instanceof APIError) {
			throw new APIError(error.message, error.statusCode)
		}
		throw new APIError("An error occurred while processing your request", 500)
	}
}
