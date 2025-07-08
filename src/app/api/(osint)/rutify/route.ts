import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { headers } from "next/headers"
import { canMakeQuery, userQueryUsed } from "@/lib/query"
import { APIError, isApiChecker } from "@/lib/utils"
import { z } from "zod"
import { getActiveSubscription } from "@/lib/subscription"

const RUTIFY_API_URL = "https://api.rutify.fail/v1"

const requestSchema = z.object({
	query: z.string().min(1),
	type: z.enum(["rut", "name", "licensePlate", "sii"]),
})

const endpointSchemas = {
	rut: z.object({ rut: z.union([z.string(), z.number()]) }),
	name: z.object({ name: z.string().min(2) }),
	licensePlate: z.object({ plate: z.string().min(2) }),
	sii: z.object({ rut: z.union([z.string(), z.number()]) }),
}

const typeToEndpoint: Record<"rut" | "name" | "licensePlate" | "sii", { endpoint: string; bodyKey: string }> = {
	rut: { endpoint: `${RUTIFY_API_URL}/rut`, bodyKey: "rut" },
	name: { endpoint: `${RUTIFY_API_URL}/name`, bodyKey: "name" },
	licensePlate: { endpoint: `${RUTIFY_API_URL}/car`, bodyKey: "plate" },
	sii: { endpoint: `${RUTIFY_API_URL}/sii`, bodyKey: "rut" },
}

export async function POST(request: NextRequest) {
	const body = await request.json()
	const { query, type } = requestSchema.parse(body)

	if (!isApiChecker(request)) {
		try {
			const user = await auth.api.getSession({ headers: await headers() })
			if (!user) throw new APIError("Unauthorized", 401)

			const subscription = await getActiveSubscription(user.user.id)
			if (!subscription) {
				return NextResponse.json({ success: false, error: "Active subscription required" }, { status: 403 })
			}

			const endpointInfo = typeToEndpoint[type]
			if (!endpointInfo) throw new APIError("Invalid type", 400)

			const endpointSchema = endpointSchemas[type]
			endpointSchema.parse({ [endpointInfo.bodyKey]: query })

			if (!(await canMakeQuery(user.user.id, "rutify"))) {
				throw new APIError("Query limit exceeded", 429)
			}

			await userQueryUsed(user.user.id, "rutify")

			const response = await fetch(endpointInfo.endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-api-key": process.env.RUTIFY_API_KEY ?? "",
				},
				body: JSON.stringify({ [endpointInfo.bodyKey]: query }),
			})

			if (!response.ok) {
				if (response.status === 403) {
					return NextResponse.json({ success: false, error: "Invalid token" }, { status: 403 })
				}
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

			console.error("Rutify API error:", error)
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
			const endpointInfo = typeToEndpoint[type]
			if (!endpointInfo) throw new APIError("Invalid type", 400)

			const endpointSchema = endpointSchemas[type]
			endpointSchema.parse({ [endpointInfo.bodyKey]: query })

			const response = await fetch(endpointInfo.endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-api-key": process.env.RUTIFY_API_KEY ?? "",
				},
				body: JSON.stringify({ [endpointInfo.bodyKey]: query }),
			})

			if (!response.ok) {
				if (response.status === 403) {
					return NextResponse.json({ success: false, error: "Invalid token" }, { status: 403 })
				}
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

			console.error("Rutify API error:", error)
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
