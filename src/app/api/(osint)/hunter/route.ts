import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { headers } from "next/headers"
import { canMakeQuery, userQueryUsed } from "@/lib/query"
import { APIError, isApiChecker } from "@/lib/utils"
import { z } from "zod"
import { getActiveSubscription } from "@/lib/subscription"
import * as fs from "node:fs/promises"
import * as path from "node:path"

const HUNTER_API_BASE_URL = "https://api.hunter.io/v2"
const KEYS_FILE_PATH = path.join(process.cwd(), "src", "app", "api", "(osint)", "hunter", "keys.txt")

const peopleRequestSchema = z.object({
	type: z.literal("people"),
	email: z.string().email(),
})

const companyRequestSchema = z.object({
	type: z.literal("companies"),
	domain: z.string(),
})

const requestSchema = z.discriminatedUnion("type", [peopleRequestSchema, companyRequestSchema])

async function readApiKeys(): Promise<string[]> {
	try {
		const keysContent = await fs.readFile(KEYS_FILE_PATH, "utf-8")
		return keysContent
			.trim()
			.split("\n")
			.filter((key) => key.trim() !== "")
	} catch (error) {
		console.error("Error reading API keys:", error)
		return []
	}
}

async function writeApiKeys(keys: string[]): Promise<void> {
	try {
		await fs.writeFile(KEYS_FILE_PATH, keys.join("\n"))
	} catch (error) {
		console.error("Error writing API keys:", error)
	}
}

export async function POST(request: NextRequest) {
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

			const body = await request.json()
			const parsedBody = requestSchema.parse(body)

			if (!(await canMakeQuery(user.user.id, "hunter"))) {
				throw new APIError("Query limit exceeded", 429)
			}

			const apiKeys = await readApiKeys()
			let lastError: Error | null = null

			if (apiKeys.length === 0) {
				throw new APIError("No API keys available", 500)
			}

			for (let i = 0; i < apiKeys.length; i++) {
				const currentKey = apiKeys[i]

				try {
					let url: string
					if (parsedBody.type === "people") {
						url = `${HUNTER_API_BASE_URL}/people/find?email=${parsedBody.email}&api_key=${currentKey}`
					} else {
						url = `${HUNTER_API_BASE_URL}/companies/find?domain=${parsedBody.domain}&api_key=${currentKey}`
					}

					const response = await fetch(url)

					if (response.ok) {
						const data = await response.json()

						await userQueryUsed(user.user.id, "hunter")

						return NextResponse.json({
							success: true,
							data: data.data,
						})
					}
					if (response.status === 401 || response.status === 403) {
						apiKeys.splice(i, 1)
						i--
						await writeApiKeys(apiKeys)
					} else {
						lastError = new Error(`Unexpected error: ${response.statusText}`)
					}
				} catch (error) {
					lastError = error instanceof Error ? error : new Error(String(error))
				}
			}

			if (apiKeys.length === 0) {
				throw new APIError("No valid API keys remain", 500)
			}

			throw new APIError(lastError?.message || "Failed to process request with available API keys", 500)
		} catch (error) {
			if (error instanceof APIError) {
				throw error
			}
			throw new APIError("An error occurred while processing your request", 500)
		}
	} else {
		try {
			const body = await request.json()
			const parsedBody = requestSchema.parse(body)

			const apiKeys = await readApiKeys()
			let lastError: Error | null = null

			if (apiKeys.length === 0) {
				throw new APIError("No API keys available", 500)
			}

			for (let i = 0; i < apiKeys.length; i++) {
				const currentKey = apiKeys[i]

				try {
					let url: string
					if (parsedBody.type === "people") {
						url = `${HUNTER_API_BASE_URL}/people/find?email=${parsedBody.email}&api_key=${currentKey}`
					} else {
						url = `${HUNTER_API_BASE_URL}/companies/find?domain=${parsedBody.domain}&api_key=${currentKey}`
					}

					const response = await fetch(url)

					if (response.ok) {
						const data = await response.json()

						return NextResponse.json({
							success: true,
							data: data.data,
						})
					}
					if (response.status === 401 || response.status === 403) {
						apiKeys.splice(i, 1)
						i--
						await writeApiKeys(apiKeys)
					} else {
						lastError = new Error(`Unexpected error: ${response.statusText}`)
					}
				} catch (error) {
					lastError = error instanceof Error ? error : new Error(String(error))
				}
			}

			if (apiKeys.length === 0) {
				throw new APIError("No valid API keys remain", 500)
			}

			throw new APIError(lastError?.message || "Failed to process request with available API keys", 500)
		} catch (error) {
			if (error instanceof APIError) {
				throw error
			}
			throw new APIError("An error occurred while processing your request", 500)
		}
	}
}
