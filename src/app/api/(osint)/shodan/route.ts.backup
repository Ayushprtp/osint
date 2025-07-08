import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { headers } from "next/headers"
import ShodanClient from "@/services/shodan/client"
import { HttpProxyAgent } from "http-proxy-agent"
import { canMakeQuery, userQueryUsed } from "@/lib/query"
import { APIError, isApiChecker } from "@/lib/utils"
import { z } from "zod"
import { getActiveSubscription } from "@/lib/subscription"

const hostInfoRequestSchema = z.object({
	type: z.literal("host_info"),
	ip: z.string().min(1),
	minify: z.boolean().optional(),
	history: z.boolean().optional(),
})

const searchRequestSchema = z.object({
	type: z.literal("search"),
	query: z.string().min(1),
	facets: z.string().optional(),
	page: z.number().optional(),
	minify: z.boolean().optional(),
})

const countRequestSchema = z.object({
	type: z.literal("count"),
	query: z.string().min(1),
	facets: z.string().optional(),
})

const requestSchema = z.discriminatedUnion("type", [hostInfoRequestSchema, searchRequestSchema, countRequestSchema])

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

			if (!(await canMakeQuery(user.user.id, "shodan"))) {
				throw new APIError("Query limit exceeded", 429)
			}

			const apiKey = process.env.SHODAN_API_KEY
			if (!apiKey) {
				throw new APIError("Shodan API key not configured", 500)
			}

			const client = new ShodanClient(apiKey)

			let proxyOptions = {}
			if (process.env.HTTP_PROXY) {
				proxyOptions = {
					agent: new HttpProxyAgent(process.env.HTTP_PROXY),
				}
			}

			await userQueryUsed(user.user.id, "shodan")

			let data
			switch (parsedBody.type) {
				case "host_info":
					data = await client.getHostInfo(parsedBody.ip, {
						...proxyOptions,
						minify: parsedBody.minify,
						history: parsedBody.history,
					})
					break
				case "search":
					data = await client.searchHosts(parsedBody.query, {
						...proxyOptions,
						facets: parsedBody.facets,
						page: parsedBody.page,
						minify: parsedBody.minify,
					})
					break
				case "count":
					data = await client.getHostCount(parsedBody.query, {
						...proxyOptions,
						facets: parsedBody.facets,
					})
					break
			}

			return NextResponse.json({ success: true, data })
		} catch (error) {
			console.error("Shodan API error:", error)

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
			const apiKey = process.env.SHODAN_API_KEY
			if (!apiKey) {
				throw new APIError("Shodan API key not configured", 500)
			}

			const client = new ShodanClient(apiKey)

			let proxyOptions = {}
			if (process.env.HTTP_PROXY) {
				proxyOptions = {
					agent: new HttpProxyAgent(process.env.HTTP_PROXY),
				}
			}

			let data
			switch (parsedBody.type) {
				case "host_info":
					data = await client.getHostInfo(parsedBody.ip, {
						...proxyOptions,
						minify: parsedBody.minify,
						history: parsedBody.history,
					})
					break
				case "search":
					data = await client.searchHosts(parsedBody.query, {
						...proxyOptions,
						facets: parsedBody.facets,
						page: parsedBody.page,
						minify: parsedBody.minify,
					})
					break
				case "count":
					data = await client.getHostCount(parsedBody.query, {
						...proxyOptions,
						facets: parsedBody.facets,
					})
					break
			}

			return NextResponse.json({ success: true, data })
		} catch (error) {
			console.error("Shodan API error:", error)

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
