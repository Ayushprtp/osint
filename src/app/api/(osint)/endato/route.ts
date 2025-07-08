import { auth } from "@/auth"
import { canMakeQuery, userQueryUsed } from "@/lib/query"
import { headers } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { APIError, isApiChecker } from "@/lib/utils"
import { z } from "zod"
import { getActiveSubscription } from "@/lib/subscription"

const ENDATO_BASE_URL = "https://devapi.endato.com"

const requestSchema = z.object({
	endpoint: z.string().min(1),
	searchType: z.string().optional(),
	data: z.record(z.any()),
})

export async function POST(request: NextRequest) {
	if (!isApiChecker(request)) {
		try {
			const user = await auth.api.getSession({ headers: await headers() })
			if (!user) {
				throw new APIError("Unauthorized", 401)
			}

			const subscription = await getActiveSubscription(user.user.id)
			if (!subscription) {
				return NextResponse.json(
					{
						success: false,
						error: "Active subscription required",
					},
					{ status: 403 },
				)
			}

			if (!(await canMakeQuery(user.user.id, "endato"))) {
				throw new APIError("Query limit exceeded", 429)
			}

			await userQueryUsed(user.user.id, "endato")

			const body = await request.json()
			const { endpoint, searchType, data } = requestSchema.parse(body)

			const requestHeaders: Record<string, string> = {
				accept: "application/json",
				"content-type": "application/json",
				"galaxy-ap-name": process.env.ENDATO_AP_NAME || "11",
				"galaxy-ap-password": process.env.ENDATO_AP_PASSWORD || "11",
			}

			if (searchType) {
				requestHeaders["galaxy-search-type"] = searchType
			}

			const fullUrl = `${ENDATO_BASE_URL}/${endpoint.startsWith("/") ? endpoint.substring(1) : endpoint}`

			const response = await fetch(fullUrl, {
				method: "POST",
				headers: requestHeaders,
				body: JSON.stringify(data),
			})

			if (!response.ok) {
				throw new APIError(response.statusText, response.status)
			}

			const responseData = await response.json()
			return NextResponse.json({ success: true, data: responseData })
		} catch (error) {
			if (error instanceof z.ZodError) {
				return NextResponse.json(
					{ success: false, error: "Invalid request data", details: error.errors },
					{ status: 400 },
				)
			}

			if (error instanceof APIError) {
				return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
			}

			return NextResponse.json(
				{ success: false, error: "An error occurred while processing your request" },
				{ status: 500 },
			)
		}
	} else {
		try {
			const body = await request.json()
			const { endpoint, searchType, data } = requestSchema.parse(body)

			const requestHeaders: Record<string, string> = {
				accept: "application/json",
				"content-type": "application/json",
				"galaxy-ap-name": process.env.ENDATO_AP_NAME || "11",
				"galaxy-ap-password": process.env.ENDATO_AP_PASSWORD || "11",
			}

			if (searchType) {
				requestHeaders["galaxy-search-type"] = searchType
			}

			const fullUrl = `${ENDATO_BASE_URL}/${endpoint.startsWith("/") ? endpoint.substring(1) : endpoint}`

			const response = await fetch(fullUrl, {
				method: "POST",
				headers: requestHeaders,
				body: JSON.stringify(data),
			})

			if (!response.ok) {
				throw new APIError(response.statusText, response.status)
			}

			const responseData = await response.json()
			return NextResponse.json({ success: true, data: responseData })
		} catch (error) {
			if (error instanceof z.ZodError) {
				return NextResponse.json(
					{ success: false, error: "Invalid request data", details: error.errors },
					{ status: 400 },
				)
			}

			if (error instanceof APIError) {
				return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
			}

			return NextResponse.json(
				{ success: false, error: "An error occurred while processing your request" },
				{ status: 500 },
			)
		}
	}
}
