import { auth } from "@/auth"
import { canMakeQuery, userQueryUsed } from "@/lib/query"
import { headers } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { APIError, isApiChecker } from "@/lib/utils"
import { z } from "zod"
import { BREACHBASE_API_URL, BREACHBASE_VALID_SEARCH_TYPES } from "@/lib/text"

const requestSchema = z.object({
	input: z.array(z.string()).min(1),
	type: z.enum(BREACHBASE_VALID_SEARCH_TYPES),
	page: z.number().int().positive().optional().default(1),
})

export async function POST(request: NextRequest) {
	if (!isApiChecker(request)) {
		try {
			const user = await auth.api.getSession({ headers: await headers() })
			if (!user) throw new APIError("Unauthorized", 401)

			const body = await request.json()
			const { input, type, page } = requestSchema.parse(body)

			if (!(await canMakeQuery(user.user.id, "breachbase"))) {
				throw new APIError("Query limit exceeded", 429)
			}

			await userQueryUsed(user.user.id, "breachbase")

			const apiUrl = BREACHBASE_API_URL
			const apiKey = process.env.BREACHBASE_API_KEY!

			const response = await fetch(apiUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ api_key: apiKey, input, type, page }),
			})

			const data = await response.json()

			if (data.status !== "success") {
				throw new APIError(data.error || "API error", 500)
			}

			const pageSize = 100
			const total = typeof data.found === "number" ? data.found : 0
			const totalPages = Math.ceil(total / pageSize)

			return NextResponse.json({
				success: true,
				data: data.content || [],
				pagination: {
					page,
					pageSize,
					total,
					totalPages,
				},
				took: data.took,
			})
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
			const { input, type, page } = requestSchema.parse(body)

			const apiUrl = BREACHBASE_API_URL
			const apiKey = process.env.BREACHBASE_API_KEY!

			const response = await fetch(apiUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ api_key: apiKey, input, type, page }),
			})

			const data = await response.json()

			if (data.status !== "success") {
				throw new APIError(data.error || "API error", 500)
			}

			const pageSize = 100
			const total = typeof data.found === "number" ? data.found : 0
			const totalPages = Math.ceil(total / pageSize)

			return NextResponse.json({
				success: true,
				data: data.content || [],
				pagination: {
					page,
					pageSize,
					total,
					totalPages,
				},
				took: data.took,
			})
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
