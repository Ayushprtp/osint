import { type NextRequest, NextResponse } from "next/server"
import SnusbaseClient from "@/services/snusbase/client"
import { getMockSession, canMakeMockQuery, mockUserQueryUsed } from "@/lib/mock-auth"
// Mock query functions imported above
import { SNUSBASE_VALID_SEARCH_TYPES } from "@/lib/text"
import { APIError, isApiChecker } from "@/lib/utils"
import { z } from "zod"
import { HttpProxyAgent } from "http-proxy-agent"

type SearchType = (typeof SNUSBASE_VALID_SEARCH_TYPES)[number]

interface RequestBody {
	query: string
	searchType: SearchType
	wildcard?: boolean
}

const transformWildcardToRegex = (query: string): string => {
	const regexPattern = query
		.replace(/[.+^${}()|[\]\\]/g, "\\$&")
		.replace(/\*/g, ".*")
		.replace(/\?/g, ".")
	return `^${regexPattern}$`
}

const primarySnusbaseClient = new SnusbaseClient(process.env.SNUSBASE_API_KEY!)
const secondarySnusbaseClient = new SnusbaseClient(process.env.SNUSBASE_API_KEY_SECONDARY!)
const proxyUrl = "http://rla663ls:qln6u6y2@residential.tokenu.to:1337"
const proxyAgent = new HttpProxyAgent<string>(proxyUrl)
proxyAgent.options.rejectUnauthorized = false

const requestSchema = z.object({
	query: z.string().min(1),
	searchType: z.enum(SNUSBASE_VALID_SEARCH_TYPES),
	wildcard: z.boolean().optional().default(false),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
	try {
		const body: RequestBody = await request.json()
		const { query, searchType, wildcard } = requestSchema.parse(body)

		if (!isApiChecker(request)) {
			const authHeader = request.headers.get("authorization")
			if (!authHeader?.startsWith("Bearer ")) {
				return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
			}
			const user = getMockSession()
			}
			}
			if (!(await canMakeMockQuery())) {
				return NextResponse.json({ success: false, error: "Query limit exceeded" }, { status: 429 })
			}
			await mockUserQueryUsed()
		}

		const { searchQuery, useRegex } =
			wildcard && (query.includes("*") || query.includes("?"))
				? { searchQuery: transformWildcardToRegex(query), useRegex: true }
				: { searchQuery: query, useRegex: false }

		let snusbaseData
		try {
			snusbaseData = await primarySnusbaseClient.searchByType(searchQuery, searchType, useRegex)
		} catch (primaryError) {
			if (primaryError instanceof Error) {
				try {
					snusbaseData = await secondarySnusbaseClient.searchByType(searchQuery, searchType, useRegex, {
						agent: proxyAgent,
					})
				} catch (secondaryError) {
					if (secondaryError instanceof Error) {
						console.error("Secondary Snusbase Client Error:", secondaryError)
						return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
					}
					throw secondaryError
				}
			} else {
				throw primaryError
			}
		}

		return NextResponse.json({ success: true, data: snusbaseData })
	} catch (error) {
		if (error instanceof z.ZodError) {
			console.error("Zod Validation Error:", error.errors)
			return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 })
		}

		console.error("API Error:", error)
		const statusCode = error instanceof APIError ? error.statusCode : 500
		const message = error instanceof APIError ? error.message : "Internal server error"

		return NextResponse.json({ success: false, error: message }, { status: statusCode })
	}
}
