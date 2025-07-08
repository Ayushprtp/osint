import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { headers } from "next/headers"
import CarfaxClient from "@/services/carfax/client"
import { HttpProxyAgent } from "http-proxy-agent"
import { canMakeQuery, userQueryUsed } from "@/lib/query"
import { APIError, isApiChecker } from "@/lib/utils"
import { z } from "zod"
import { getActiveSubscription } from "@/lib/subscription"

const plateRequestSchema = z.object({
	type: z.literal("plate"),
	plate: z.string().min(1),
	state: z.string().length(2),
})

const partialPlateRequestSchema = z.object({
	type: z.literal("partial-plate"),
	plate: z.string().min(1),
	state: z.string().length(2),
})

const vinRequestSchema = z.object({
	type: z.literal("vin"),
	vin: z.string().length(17),
})

const requestSchema = z.discriminatedUnion("type", [plateRequestSchema, partialPlateRequestSchema, vinRequestSchema])

export async function POST(request: NextRequest) {
	const body = await request.json()
	const parsedBody = requestSchema.parse(body)

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

			if (!(await canMakeQuery(user.user.id, "carfax"))) {
				throw new APIError("Query limit exceeded", 429)
			}

			await userQueryUsed(user.user.id, "carfax")

			const apiKey = process.env.CARFAX_API_KEY
			if (!apiKey) {
				throw new APIError("Carfax API key not configured", 500)
			}

			const client = new CarfaxClient(apiKey)

			let proxyOptions = {}
			if (process.env.HTTP_PROXY) {
				proxyOptions = {
					agent: new HttpProxyAgent(process.env.HTTP_PROXY),
				}
			}

			let result

			switch (parsedBody.type) {
				case "plate":
					result = await client.lookupPlateWithHistory(parsedBody.plate, parsedBody.state, proxyOptions)
					break

				case "partial-plate": {
					const vehicles = await client.lookupByPartialPlate(parsedBody.plate, parsedBody.state, proxyOptions)
					result = { vehicles }
					break
				}

				case "vin":
					result = await client.getVehicleHistory(parsedBody.vin, proxyOptions)
					break
			}

			return NextResponse.json({ success: true, data: result })
		} catch (error) {
			console.error("Carfax API error:", error)

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
			const apiKey = process.env.CARFAX_API_KEY
			if (!apiKey) {
				throw new APIError("Carfax API key not configured", 500)
			}

			const client = new CarfaxClient(apiKey)

			let proxyOptions = {}
			if (process.env.HTTP_PROXY) {
				proxyOptions = {
					agent: new HttpProxyAgent(process.env.HTTP_PROXY),
				}
			}

			let result

			switch (parsedBody.type) {
				case "plate":
					result = await client.lookupPlateWithHistory(parsedBody.plate, parsedBody.state, proxyOptions)
					break

				case "partial-plate": {
					const vehicles = await client.lookupByPartialPlate(parsedBody.plate, parsedBody.state, proxyOptions)
					result = { vehicles }
					break
				}

				case "vin":
					result = await client.getVehicleHistory(parsedBody.vin, proxyOptions)
					break
			}

			return NextResponse.json({ success: true, data: result })
		} catch (error) {
			console.error("Carfax API error:", error)

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
