import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { headers } from "next/headers"
import { canMakeQuery, userQueryUsed } from "@/lib/query"
import { APIError, isApiChecker } from "@/lib/utils"
import { z } from "zod"
import { getActiveSubscription } from "@/lib/subscription"

const OATHNET_API_BASE_URL = "https://oathnet.ru/api"
const INTERNAL_CLI_API_KEY = "c2f7e31f-6f8a-4b9c-8d0e-1a2b3c4d5e6f"

const searchRequestSchema = z.object({
	type: z.enum(["text", "breach", "url"]),
	query: z.string(),
	includeSnus: z.boolean().optional().default(false),
})

const ipInfoRequestSchema = z.object({
	type: z.literal("ip-info"),
	ip: z.string(),
})

const robloxUserInfoRequestSchema = z.object({
	type: z.literal("roblox-userinfo"),
	username: z.string(),
})

const discordToRobloxRequestSchema = z.object({
	type: z.literal("discord-to-roblox"),
	discordid: z.string(),
})

const holheRequestSchema = z.object({
	type: z.literal("holhe"),
	email: z.string().email(),
})

const ghuntRequestSchema = z.object({
	type: z.literal("ghunt"),
	email: z.string().email(),
})

const requestSchema = z.discriminatedUnion("type", [
	searchRequestSchema,
	ipInfoRequestSchema,
	robloxUserInfoRequestSchema,
	discordToRobloxRequestSchema,
	holheRequestSchema,
	ghuntRequestSchema,
])

export async function POST(request: NextRequest) {
	const body = await request.json()
	const parsedBody = requestSchema.parse(body)

	if (!isApiChecker(request)) {
		try {
			const internalApiKeyHeader = request.headers.get("X-Internal-API-Key")

			if (internalApiKeyHeader && internalApiKeyHeader === INTERNAL_CLI_API_KEY) {
				console.log("OathNet API: CLI access granted via X-Internal-API-Key.")
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

				if (!(await canMakeQuery(user.user.id, "oathnet"))) {
					throw new APIError("Query limit exceeded", 429)
				}

				await userQueryUsed(user.user.id, "oathnet")
			}

			const apiKey = process.env.OATH_API_KEY
			if (!apiKey) {
				throw new APIError("API key configuration error", 500)
			}

			try {
				let url: string
				const options: RequestInit = {
					headers: {
						Authorization: `Bearer ${apiKey}`,
						"Content-Type": "application/json",
					},
				}

				switch (parsedBody.type) {
					case "text":
					case "breach":
					case "url":
						url = `${OATHNET_API_BASE_URL}/search`
						options.method = "POST"
						options.body = JSON.stringify({
							query: parsedBody.query,
							type: parsedBody.type,
							includeSnus: parsedBody.includeSnus,
						})
						break
					case "ip-info":
						url = `${OATHNET_API_BASE_URL}/ip-info?ip=${encodeURIComponent(parsedBody.ip)}`
						options.method = "GET"
						break
					case "roblox-userinfo":
						url = `${OATHNET_API_BASE_URL}/roblox-userinfo?username=${encodeURIComponent(parsedBody.username)}`
						options.method = "GET"
						break
					case "discord-to-roblox":
						url = `${OATHNET_API_BASE_URL}/discord-to-roblox?discordid=${encodeURIComponent(parsedBody.discordid)}`
						options.method = "GET"
						break
					case "holhe":
						url = `${OATHNET_API_BASE_URL}/holhe?email=${encodeURIComponent(parsedBody.email)}`
						options.method = "GET"
						break
					case "ghunt":
						url = `${OATHNET_API_BASE_URL}/ghunt`
						options.method = "POST"
						options.body = JSON.stringify({
							email: parsedBody.email,
						})
						break
					default:
						throw new APIError("Unsupported endpoint type", 400)
				}

				const response = await fetch(url, options)

				if (!response.ok) {
					throw new APIError(`OathNet API error: ${response.statusText}`, response.status)
				}

				const data = await response.json()

				return NextResponse.json({
					success: true,
					data,
				})
			} catch (error) {
				if (error instanceof APIError) {
					throw error
				}
				throw new APIError(error instanceof Error ? error.message : String(error), 500)
			}
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

			console.error("OathNet API endpoint unhandled error:", error)
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
			const apiKey = process.env.OATH_API_KEY
			if (!apiKey) {
				throw new APIError("API key configuration error", 500)
			}

			let url: string
			const options: RequestInit = {
				headers: {
					Authorization: `Bearer ${apiKey}`,
					"Content-Type": "application/json",
				},
			}

			switch (parsedBody.type) {
				case "text":
				case "breach":
				case "url":
					url = `${OATHNET_API_BASE_URL}/search`
					options.method = "POST"
					options.body = JSON.stringify({
						query: parsedBody.query,
						type: parsedBody.type,
						includeSnus: parsedBody.includeSnus,
					})
					break
				case "ip-info":
					url = `${OATHNET_API_BASE_URL}/ip-info?ip=${encodeURIComponent(parsedBody.ip)}`
					options.method = "GET"
					break
				case "roblox-userinfo":
					url = `${OATHNET_API_BASE_URL}/roblox-userinfo?username=${encodeURIComponent(parsedBody.username)}`
					options.method = "GET"
					break
				case "discord-to-roblox":
					url = `${OATHNET_API_BASE_URL}/discord-to-roblox?discordid=${encodeURIComponent(parsedBody.discordid)}`
					options.method = "GET"
					break
				case "holhe":
					url = `${OATHNET_API_BASE_URL}/holhe?email=${encodeURIComponent(parsedBody.email)}`
					options.method = "GET"
					break
				case "ghunt":
					url = `${OATHNET_API_BASE_URL}/ghunt`
					options.method = "POST"
					options.body = JSON.stringify({
						email: parsedBody.email,
					})
					break
				default:
					throw new APIError("Unsupported endpoint type", 400)
			}

			const response = await fetch(url, options)

			if (!response.ok) {
				throw new APIError(`OathNet API error: ${response.statusText}`, response.status)
			}

			const data = await response.json()

			return NextResponse.json({
				success: true,
				data,
			})
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

			console.error("OathNet API endpoint unhandled error:", error)
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
