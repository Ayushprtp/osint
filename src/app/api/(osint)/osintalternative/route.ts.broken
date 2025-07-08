import { getMockSession, canMakeMockQuery, mockUserQueryUsed } from "@/lib/mock-auth"
import { APIError, isApiChecker } from "@/lib/utils"
// Mock query functions imported above
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const requestSchema = z.object({
	email: z.string().email(),
	module: z.string().optional().nullable(),
})

const OSINT_API_BASE_URL = process.env.OSINT_API_BASE_URL || "https://vertex.osintx.net/api"
const OSINT_API_KEY = process.env.OSINT_API_KEY

export async function GET(request: NextRequest) {
	if (!isApiChecker(request)) {
		try {
			const user = getMockSession()

					{ status: 403 },
				)
			}

			const searchParams = request.nextUrl.searchParams
			const email = searchParams.get("email")
			const module = searchParams.get("module")

			const { email: validatedEmail, module: validatedModule } = requestSchema.parse({
				email,
				module,
			})

			if (!(await canMakeMockQuery())) {
				throw new APIError("Query limit exceeded", 429)
			}

			await mockUserQueryUsed()

			let apiUrl = `${OSINT_API_BASE_URL}/modules/email/${validatedEmail}`
			if (validatedModule) {
				apiUrl = `${OSINT_API_BASE_URL}/modules/${validatedModule}/${validatedEmail}`
			}

			const response = await fetch(apiUrl, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"api-key": OSINT_API_KEY || "",
				},
			})

			if (!response.ok) {
				throw new APIError(response.statusText || "Error fetching data from OSINT API", response.status)
			}

			const data = await response.json()

			return NextResponse.json({ success: true, data })
		} catch (error) {
			console.error("OSINT API error:", error)

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
			const searchParams = request.nextUrl.searchParams
			const email = searchParams.get("email")
			const module = searchParams.get("module")

			const { email: validatedEmail, module: validatedModule } = requestSchema.parse({
				email,
				module,
			})

			let apiUrl = `${OSINT_API_BASE_URL}/modules/email/${validatedEmail}`
			if (validatedModule) {
				apiUrl = `${OSINT_API_BASE_URL}/modules/${validatedModule}/${validatedEmail}`
			}

			const response = await fetch(apiUrl, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"api-key": OSINT_API_KEY || "",
				},
			})

			if (!response.ok) {
				throw new APIError(response.statusText || "Error fetching data from OSINT API", response.status)
			}

			const data = await response.json()

			return NextResponse.json({ success: true, data })
		} catch (error) {
			console.error("OSINT API error:", error)

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
