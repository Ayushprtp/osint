import { type NextRequest, NextResponse } from "next/server"
import { getMockSession, canMakeMockQuery, mockUserQueryUsed } from "@/lib/mock-auth"
import CallerAPIClient from "@/services/callerapi/client"
import { HttpProxyAgent } from "http-proxy-agent"
// Mock query functions imported above
import { APIError, isApiChecker } from "@/lib/utils"
import { z } from "zod"

const requestSchema = z.object({
	phone: z.string().min(1),
})

export async function POST(request: NextRequest) {
	const body = await request.json()
	const { phone } = requestSchema.parse(body)

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

			const apiKey = process.env.CALLERAPI_API_KEY
			if (!apiKey) {
				throw new APIError("CallerAPI API key not configured", 500)
			}

			const client = new CallerAPIClient(apiKey)

			let proxyOptions = {}
			if (process.env.HTTP_PROXY) {
				proxyOptions = {
					agent: new HttpProxyAgent(process.env.HTTP_PROXY),
				}
			}

			const data = await client.getPhoneInfo(phone, proxyOptions)

			return NextResponse.json({ success: true, data })
		} catch (error) {
			console.error("CallerAPI error:", error)

			if (error instanceof z.ZodError) {
				return NextResponse.json(
					{
						success: false,
						error: "Invalid request parameters",
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
			const apiKey = process.env.CALLERAPI_API_KEY
			if (!apiKey) {
				throw new APIError("CallerAPI API key not configured", 500)
			}

			const client = new CallerAPIClient(apiKey)

			let proxyOptions = {}
			if (process.env.HTTP_PROXY) {
				proxyOptions = {
					agent: new HttpProxyAgent(process.env.HTTP_PROXY),
				}
			}

			const data = await client.getPhoneInfo(phone, proxyOptions)

			return NextResponse.json({ success: true, data })
		} catch (error) {
			console.error("CallerAPI error:", error)

			if (error instanceof z.ZodError) {
				return NextResponse.json(
					{
						success: false,
						error: "Invalid request parameters",
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
