import { getMockSession, canMakeMockQuery, mockUserQueryUsed } from "@/lib/mock-auth"
// Mock query functions imported above
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { APIError, isApiChecker } from "@/lib/utils"

const SEON_API_BASE_URL = "https://api.seon.io/SeonRestService"

const requestSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("aml"),
		data: z.object({ user_fullname: z.string().min(1) }),
	}),
	z.object({
		type: z.literal("email"),
		data: z.object({ email: z.string().email() }),
	}),
	z.object({
		type: z.literal("phone"),
		data: z.object({ phone: z.string() }),
	}),
	z.object({
		type: z.literal("ip"),
		data: z.object({ ip: z.string().min(1) }),
	}),
])

export async function POST(request: NextRequest) {
	const body = await request.json()
	const { type, data } = requestSchema.parse(body)

	if (!isApiChecker(request)) {
		try {
			const user = getMockSession()

					{ status: 403 },
				)
			}

			if (!(await canMakeMockQuery())) {
				throw new APIError("Query limit exceeded", 429)
			}

			let endpoint: string
			switch (type) {
				case "aml":
					endpoint = `${SEON_API_BASE_URL}/aml-api/v1`
					break
				case "email":
					endpoint = `${SEON_API_BASE_URL}/email-api/v3`
					break
				case "phone":
					endpoint = `${SEON_API_BASE_URL}/phone-api/v2`
					break
				case "ip":
					endpoint = `${SEON_API_BASE_URL}/ip-api/v1/${data.ip}`
					break
			}

			await mockUserQueryUsed()

			const fetchOptions: RequestInit = {
				method: type === "ip" ? "GET" : "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-KEY": process.env.SEON_API_KEY!,
					"Cache-Control": "no-cache",
				},
			}

			if (type !== "ip") {
				fetchOptions.body = JSON.stringify(data)
			}

			const response = await fetch(endpoint, fetchOptions)

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}))
				throw new APIError(errorData.error?.message || response.statusText, response.status)
			}

			const responseData = await response.json()
			return NextResponse.json({ success: true, data: responseData })
		} catch (error) {
			if (error instanceof z.ZodError) {
				throw new APIError("Invalid request body", 400)
			}

			if (error instanceof APIError) {
				throw new APIError(error.message, error.statusCode)
			}

			console.error("SEON API Error:", error)
			throw new APIError("Internal server error", 500)
		}
	} else {
		try {
			let endpoint: string
			switch (type) {
				case "aml":
					endpoint = `${SEON_API_BASE_URL}/aml-api/v1`
					break
				case "email":
					endpoint = `${SEON_API_BASE_URL}/email-api/v3`
					break
				case "phone":
					endpoint = `${SEON_API_BASE_URL}/phone-api/v2`
					break
				case "ip":
					endpoint = `${SEON_API_BASE_URL}/ip-api/v1/${data.ip}`
					break
			}

			const fetchOptions: RequestInit = {
				method: type === "ip" ? "GET" : "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-KEY": process.env.SEON_API_KEY!,
					"Cache-Control": "no-cache",
				},
			}

			if (type !== "ip") {
				fetchOptions.body = JSON.stringify(data)
			}

			const response = await fetch(endpoint, fetchOptions)

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}))
				throw new APIError(errorData.error?.message || response.statusText, response.status)
			}

			const responseData = await response.json()
			return NextResponse.json({ success: true, data: responseData })
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

			console.error("SEON API Error:", error)
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
