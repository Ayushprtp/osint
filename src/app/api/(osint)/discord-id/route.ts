import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { headers } from "next/headers"
import { canMakeQuery, userQueryUsed } from "@/lib/query"
import { APIError } from "@/lib/utils"
import { z } from "zod"
import { getActiveSubscription } from "@/lib/subscription"
import { INF0SEC_API_URL } from "@/lib/text"

const RUST_API_URL = "http://167.99.206.172:5000"
const OSINTSOLUTIONS_API_URL = "https://osintsolutions.org/api/searchusygdytafsdytasfdastdfytasdtrasdidhfuyfdgyd"

export async function POST(request: NextRequest) {
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

		const requestType = body.type

		if (requestType === "discord-to-roblox") {
			const discordIdSchema = z
				.string()
				.trim()
				.regex(/^\d{17,20}$/)

			try {
				const discordId = discordIdSchema.parse(body.discordid)

				if (!(await canMakeQuery(user.user.id, "discord-search"))) {
					throw new APIError("Query limit exceeded", 429)
				}

				await userQueryUsed(user.user.id, "discord-search")

				const apiResponse = await fetch(`https://oathnet.ru/api/discord-to-roblox?discordid=${discordId}`, {
					headers: {
						Authorization: `Bearer ${process.env.OATHNET_API_KEY}`,
					},
				})

				if (!apiResponse.ok) {
					throw new APIError(`OathNet API Error: ${apiResponse.statusText}`, apiResponse.status)
				}

				const responseData = await apiResponse.json()

				return NextResponse.json({
					success: true,
					data: responseData,
				})
			} catch (validationError) {
				if (validationError instanceof APIError) {
					throw validationError
				}

				return NextResponse.json(
					{
						success: false,
						error: "Invalid Discord ID format. Discord IDs are typically 17-20 digit numbers.",
					},
					{ status: 400 },
				)
			}
		} else if (requestType === "breach") {
			const discordIdSchema = z
				.string()
				.trim()
				.regex(/^\d{17,20}$/)

			try {
				const discordId = discordIdSchema.parse(body.query)

				if (!(await canMakeQuery(user.user.id, "discord-search"))) {
					throw new APIError("Query limit exceeded", 429)
				}

				await userQueryUsed(user.user.id, "discord-search")

				const apiResponse = await fetch(`https://oathnet.ru/api/breach?query=${discordId}`, {
					headers: {
						Authorization: `Bearer ${process.env.OATHNET_API_KEY}`,
					},
				})

				if (!apiResponse.ok) {
					throw new APIError(`OathNet API Error: ${apiResponse.statusText}`, apiResponse.status)
				}

				const responseData = await apiResponse.json()

				return NextResponse.json({
					success: true,
					data: responseData,
				})
			} catch (validationError) {
				if (validationError instanceof APIError) {
					throw validationError
				}

				return NextResponse.json(
					{
						success: false,
						error: "Invalid Discord ID format. Discord IDs are typically 17-20 digit numbers.",
					},
					{ status: 400 },
				)
			}
		} else if (requestType === "roblox-userinfo") {
			const usernameSchema = z.string().min(3)

			try {
				const username = usernameSchema.parse(body.username)

				if (!(await canMakeQuery(user.user.id, "roblox-search"))) {
					throw new APIError("Query limit exceeded", 429)
				}

				await userQueryUsed(user.user.id, "roblox-search")

				const apiResponse = await fetch(
					`https://oathnet.ru/api/roblox-userinfo?username=${encodeURIComponent(username)}`,
					{
						headers: {
							Authorization: `Bearer ${process.env.OATHNET_API_KEY}`,
						},
					},
				)

				if (!apiResponse.ok) {
					throw new APIError(`OathNet API Error: ${apiResponse.statusText}`, apiResponse.status)
				}

				const responseData = await apiResponse.json()

				return NextResponse.json({
					success: true,
					data: responseData,
				})
			} catch (validationError) {
				if (validationError instanceof APIError) {
					throw validationError
				}

				return NextResponse.json(
					{
						success: false,
						error: "Invalid Roblox username format. Usernames must be at least 3 characters.",
					},
					{ status: 400 },
				)
			}
		} else if (requestType === "inf0sec") {
			const discordIdSchema = z
				.string()
				.trim()
				.regex(/^\d{17,20}$/)

			try {
				const discordId = discordIdSchema.parse(body.query)

				if (!(await canMakeQuery(user.user.id, "inf0sec"))) {
					throw new APIError("Query limit exceeded", 429)
				}

				await userQueryUsed(user.user.id, "inf0sec")

				const url = `${INF0SEC_API_URL}?module=discord&q=${encodeURIComponent(discordId)}&apikey=${process.env.INF0SEC_API_KEY}`

				const apiResponse = await fetch(url)

				if (!apiResponse.ok) {
					throw new APIError(`Inf0sec API Error: ${apiResponse.statusText}`, apiResponse.status)
				}

				const responseData = await apiResponse.json()

				return NextResponse.json({
					success: true,
					data: responseData,
				})
			} catch (validationError) {
				if (validationError instanceof APIError) {
					throw validationError
				}

				return NextResponse.json(
					{
						success: false,
						error: "Invalid Discord ID format. Discord IDs are typically 17-20 digit numbers.",
					},
					{ status: 400 },
				)
			}
		} else if (requestType === "rust-discord-lookup") {
			const discordIdSchema = z
				.string()
				.trim()
				.regex(/^\d{17,20}$/)

			try {
				const discordId = discordIdSchema.parse(body.query)

				if (!(await canMakeQuery(user.user.id, "discord-search"))) {
					throw new APIError("Query limit exceeded", 429)
				}

				await userQueryUsed(user.user.id, "discord-search")

				const url = `${RUST_API_URL}/api/discord/lookup?key=${process.env.RUST_API_KEY}&id=${discordId}`

				const apiResponse = await fetch(url)

				if (!apiResponse.ok) {
					throw new APIError(`Rust API Error: ${apiResponse.statusText}`, apiResponse.status)
				}

				const responseData = await apiResponse.json()

				return NextResponse.json({
					success: true,
					data: responseData.data,
				})
			} catch (validationError) {
				if (validationError instanceof APIError) {
					throw validationError
				}

				return NextResponse.json(
					{
						success: false,
						error: "Invalid Discord ID format. Discord IDs are typically 17-20 digit numbers.",
					},
					{ status: 400 },
				)
			}
		} else if (requestType === "rust-steam-lookup") {
			const steamIdSchema = z.string().regex(/^\d+$/)

			try {
				const steamId = steamIdSchema.parse(body.query)

				if (!(await canMakeQuery(user.user.id, "steam-search"))) {
					throw new APIError("Query limit exceeded", 429)
				}

				await userQueryUsed(user.user.id, "steam-search")

				const url = `${RUST_API_URL}/api/steam/lookup?key=${process.env.RUST_API_KEY}&id=${steamId}`

				const apiResponse = await fetch(url)

				if (!apiResponse.ok) {
					throw new APIError(`Rust API Error: ${apiResponse.statusText}`, apiResponse.status)
				}

				const responseData = await apiResponse.json()

				return NextResponse.json({
					success: true,
					data: responseData.data,
				})
			} catch (validationError) {
				if (validationError instanceof APIError) {
					throw validationError
				}

				return NextResponse.json(
					{
						success: false,
						error: "Invalid Steam ID format.",
					},
					{ status: 400 },
				)
			}
		} else if (requestType === "osintsolutions-discord-lookup") {
			try {
				const discordId = body.query

				if (!(await canMakeQuery(user.user.id, "osintsolutions-search"))) {
					throw new APIError("Query limit exceeded for OSINTsolutions search", 429)
				}

				await userQueryUsed(user.user.id, "osintsolutions-search")

				const url = `${OSINTSOLUTIONS_API_URL}?apikey=${process.env.OSINTSOLUTIONS_API_KEY}&query=${encodeURIComponent(discordId)}`
				const apiResponse = await fetch(url)

				if (!apiResponse.ok) {
					let errorBody = `OSINTsolutions API Error: ${apiResponse.statusText}`
					try {
						const tempError = (await apiResponse.json()) as { error?: string; message?: string }
						errorBody = tempError.error || tempError.message || apiResponse.statusText
					} catch (e) {}
					throw new APIError(errorBody, apiResponse.status)
				}

				const responseData = await apiResponse.json()
				let actualResultsData

				if (responseData && Array.isArray(responseData.results)) {
					actualResultsData = responseData.results
				} else if (Array.isArray(responseData)) {
					actualResultsData = responseData
				} else {
					console.warn(
						"OSINTsolutions DiscordID response from external API was not in the expected format or no 'results' array found. Response:",
						responseData,
					)
					actualResultsData = []
				}

				return NextResponse.json({
					success: true,
					data: actualResultsData,
				})
			} catch (error) {
				if (error instanceof APIError) {
					throw error
				}
				console.error("Error processing OSINTsolutions request in discord-id route:", error)
				return NextResponse.json(
					{
						success: false,
						error: "An unexpected error occurred while fetching data from OSINTsolutions.",
					},
					{ status: 500 },
				)
			}
		} else {
			return NextResponse.json(
				{
					success: false,
					error:
						"Invalid request type. Supported types: 'discord-to-roblox', 'breach', 'roblox-userinfo', 'inf0sec', 'rust-discord-lookup', 'rust-steam-lookup', 'osintsolutions-discord-lookup'",
				},
				{ status: 400 },
			)
		}
	} catch (error) {
		if (error instanceof APIError) {
			return NextResponse.json(
				{
					success: false,
					error: error.message,
				},
				{ status: error.statusCode },
			)
		}

		console.error("Unhandled error:", error)
		return NextResponse.json(
			{
				success: false,
				error: "An unexpected error occurred",
			},
			{ status: 500 },
		)
	}
}
