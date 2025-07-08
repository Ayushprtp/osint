import { auth } from "@/auth"
import { canMakeQuery, userQueryUsed } from "@/lib/query"
import { headers } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { APIError, isApiChecker } from "@/lib/utils"
import { z } from "zod"
import { getActiveSubscription } from "@/lib/subscription"

const NOSINT_API_URL = "https://nosint.org/api/v1/search"
const INTERNAL_CLI_API_KEY = "c2f7e31f-6f8a-4b9c-8d0e-1a2b3c4d5e6f"

const requestSchema = z.object({
	target: z.string().min(1),
	plugin_type: z.string().min(1),
})

export async function POST(request: NextRequest) {
	const body = await request.json()
	const { target, plugin_type } = requestSchema.parse(body)

	if (!isApiChecker(request)) {
		try {
			const internalApiKeyHeader = request.headers.get("X-Internal-API-Key")

			if (internalApiKeyHeader && internalApiKeyHeader === INTERNAL_CLI_API_KEY) {
				console.log("NoSINT API: CLI access granted via X-Internal-API-Key.")
			} else {
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

				if (!(await canMakeQuery(user.user.id, "nosint"))) {
					throw new APIError("Query limit exceeded", 429)
				}

				await userQueryUsed(user.user.id, "nosint")
			}

			const apiKey = process.env.NOSINT_API_KEY
			if (!apiKey) {
				throw new APIError("External NoSINT API key not configured", 500)
			}

			const response = await fetch(NOSINT_API_URL, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${apiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					target,
					plugin_type,
					report: false,
				}),
			})

			if (!response.ok) {
				const errorText = await response.text()
				console.error(`External NoSINT API Error (${response.status}): ${errorText}`)
				throw new APIError(`Error from NoSINT API: ${response.statusText}`, response.status)
			}

			const data = await response.json()
			return NextResponse.json({ success: true, data })
		} catch (error) {
			if (error instanceof z.ZodError) {
				return NextResponse.json(
					{
						success: false,
						error: "Invalid request data",
						details: error.format(),
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

			console.error("NoSINT API endpoint unhandled error:", error)
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
			const apiKey = process.env.NOSINT_API_KEY
			if (!apiKey) {
				throw new APIError("External NoSINT API key not configured", 500)
			}

			const response = await fetch(NOSINT_API_URL, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${apiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					target,
					plugin_type,
					report: false,
				}),
			})

			if (!response.ok) {
				const errorText = await response.text()
				console.error(`External NoSINT API Error (${response.status}): ${errorText}`)
				throw new APIError(`Error from NoSINT API: ${response.statusText}`, response.status)
			}

			const data = await response.json()
			return NextResponse.json({ success: true, data })
		} catch (error) {
			if (error instanceof z.ZodError) {
				return NextResponse.json(
					{
						success: false,
						error: "Invalid request data",
						details: error.format(),
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

			console.error("NoSINT API endpoint unhandled error:", error)
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
