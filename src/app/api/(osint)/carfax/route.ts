import { type NextRequest, NextResponse } from "next/server"
import { getMockSession, canMakeMockQuery, mockUserQueryUsed } from "@/lib/mock-auth"
import CarfaxClient from "@/services/carfax/client"
import { HttpProxyAgent } from "http-proxy-agent"
// Mock query functions imported above
import { APIError, isApiChecker } from "@/lib/utils"
import { z } from "zod"

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
			const user = getMockSession()

					{ status: 403 },
				)
			}

			if (!(await canMakeMockQuery())) {
				throw new APIError("Query limit exceeded", 429)
			}

			await mockUserQueryUsed()

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
