import { auth } from "@/auth"
import { canMakeQuery, userQueryUsed } from "@/lib/query"
import { headers } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { LEAKOSINT_API_URL } from "@/lib/text"
import { APIError, isApiChecker } from "@/lib/utils"
import { z } from "zod"
import { getActiveSubscription } from "@/lib/subscription"

const requestSchema = z.object({
	query: z.string().min(1),
})

export async function POST(request: NextRequest) {
	const body = await request.json()
	const { query } = requestSchema.parse(body)

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

			if (!(await canMakeQuery(user.user.id, "leakosint"))) {
				throw new APIError("Query limit exceeded", 429)
			}

			await userQueryUsed(user.user.id, "leakosint")

			const response = await fetch(LEAKOSINT_API_URL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					token: process.env.LEAKOSINT_API_TOKEN,
					request: query,
					limit: 100,
					lang: "en",
				}),
			})

			if (!response.ok) {
				throw new APIError(response.statusText, response.status)
			}

			const data = await response.json()

			return NextResponse.json({ success: true, data })
		} catch (error) {
			if (error instanceof z.ZodError) {
				throw new APIError("Invalid request", 400)
			}

			if (error instanceof APIError) {
				throw new APIError(error.message, error.statusCode)
			}

			throw new APIError("Internal server error", 500)
		}
	}

	const response = await fetch(LEAKOSINT_API_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			token: process.env.LEAKOSINT_API_TOKEN,
			request: query,
			limit: 100,
			lang: "en",
		}),
	})

	if (!response.ok) {
		throw new APIError(response.statusText, response.status)
	}

	const data = await response.json()

	return NextResponse.json({ success: true, data })
}
