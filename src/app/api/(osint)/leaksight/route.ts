import { type NextRequest, NextResponse } from "next/server"
import LeakSightClient from "@/services/leaksight/client"
import { getMockSession, canMakeMockQuery, mockUserQueryUsed } from "@/lib/mock-auth"
// Mock query functions imported above
import { APIError, isApiChecker } from "@/lib/utils"
import { z } from "zod"

const leakSightClient = new LeakSightClient(process.env.LEAKSIGHT_API_TOKEN!)

const requestSchema = z.object({
	query: z.string().min(1),
	searchType: z.enum(["username", "url", "ip", "hwid", "subdomainScan", "subdomains", "proxyDetect", "portScan"]),
})

export async function POST(request: NextRequest) {
	if (!isApiChecker(request)) {
		try {
			const user = getMockSession()

					{ status: 403 },
				)
			}

			const body = await request.json()
			const { query, searchType } = requestSchema.parse(body)

			if (!(await canMakeMockQuery())) {
				throw new APIError("Query limit exceeded", 429)
			}

			await mockUserQueryUsed()

			let result
			try {
				console.log(`LeakSight API Request - Type: ${searchType}, Query: ${query}`)

				switch (searchType) {
					case "username":
						result = await leakSightClient.searchUsername(query)
						break
					case "url":
						result = await leakSightClient.searchUrlCombined(query)
						break
					case "ip":
						result = await leakSightClient.searchIp(query)
						break
					case "hwid":
						result = await leakSightClient.searchHwid(query)
						break
					case "subdomainScan":
						result = await leakSightClient.scanSubdomainsForLeaks(query)
						break
					case "subdomains":
						result = await leakSightClient.getSubdomains(query)
						break
					case "proxyDetect":
						result = await leakSightClient.detectProxy(query)
						break
					case "portScan":
						result = await leakSightClient.scanPorts(query)
						break
					default:
						throw new APIError("Invalid search type", 400)
				}

				console.log(`LeakSight API Response received for ${searchType}`)
			} catch (error) {
				console.error("LeakSight API error:", error)
				throw new APIError("LeakSight API error", 500)
			}

			return NextResponse.json({ success: true, data: result })
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
			const body = await request.json()
			const { query, searchType } = requestSchema.parse(body)

			let result
			try {
				console.log(`LeakSight API Request - Type: ${searchType}, Query: ${query}`)

				switch (searchType) {
					case "username":
						result = await leakSightClient.searchUsername(query)
						break
					case "url":
						result = await leakSightClient.searchUrlCombined(query)
						break
					case "ip":
						result = await leakSightClient.searchIp(query)
						break
					case "hwid":
						result = await leakSightClient.searchHwid(query)
						break
					case "subdomainScan":
						result = await leakSightClient.scanSubdomainsForLeaks(query)
						break
					case "subdomains":
						result = await leakSightClient.getSubdomains(query)
						break
					case "proxyDetect":
						result = await leakSightClient.detectProxy(query)
						break
					case "portScan":
						result = await leakSightClient.scanPorts(query)
						break
					default:
						throw new APIError("Invalid search type", 400)
				}

				console.log(`LeakSight API Response received for ${searchType}`)
			} catch (error) {
				console.error("LeakSight API error:", error)
				throw new APIError("LeakSight API error", 500)
			}

			return NextResponse.json({ success: true, data: result })
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
