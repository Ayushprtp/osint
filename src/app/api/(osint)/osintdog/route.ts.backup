import { auth } from "@/auth"
import { canMakeQuery, userQueryUsed } from "@/lib/query"
import { headers } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { OSINTDOG_SEARCH_TYPES } from "@/lib/text"
import { APIError, isApiChecker } from "@/lib/utils"
import { z } from "zod"
import { getActiveSubscription } from "@/lib/subscription"

const requestSchema = z.object({
	query: z.string().min(1),
	searchType: z.enum(OSINTDOG_SEARCH_TYPES),
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

			const body = await request.json()
			const { query, searchType } = requestSchema.parse(body)

			if (!(await canMakeQuery(user.user.id, "osintdog"))) {
				throw new APIError("Query limit exceeded", 429)
			}

			await userQueryUsed(user.user.id, "osintdog")

			const response = await fetch("https://osintdog.com/search/api/search", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-api-key": process.env.OSINTDOG_API_KEY || "",
				},
				body: JSON.stringify({
					field: [{ [searchType]: query }],
				}),
				cache: "no-store",
			})

			if (!response.ok) {
				throw new APIError(response.statusText, response.status)
			}

			const data = await response.json()

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
				return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
			}

			console.error("OSINT Dog API error:", error)
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
			const { query, searchType } = requestSchema.parse(body)

			const response = await fetch("https://osintdog.com/search/api/search", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-api-key": process.env.OSINTDOG_API_KEY || "",
				},
				body: JSON.stringify({
					field: [{ [searchType]: query }],
				}),
				cache: "no-store",
			})

			if (!response.ok) {
				throw new APIError(response.statusText, response.status)
			}

			const data = await response.json()

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
				return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
			}

			console.error("OSINT Dog API error:", error)
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
