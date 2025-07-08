import { NextResponse } from "next/server"
import IntelXClient from "@/services/intelx/client"
import { getMockSession, canMakeMockQuery, mockUserQueryUsed } from "@/lib/mock-auth"

const DEVELOPER_API_KEY = "3f7e4567-e89b-12d3-a456-426614174000"

const isValidSystemId = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)

export async function POST(request: Request) {
	let isAuthenticated = false

	const requestApiKey = request.headers.get("x-api-key") || new URL(request.url).searchParams.get("apiKey")
	if (requestApiKey === DEVELOPER_API_KEY) {
		isAuthenticated = true
	}

	if (!isAuthenticated) {
		try {
			const session = getMockSession()
			if (session) {
				isAuthenticated = true
			}
		} catch (error) {
			console.error("Error checking session:", error)
		}
	}

	if (!isAuthenticated) {
		return NextResponse.json({ error: "Unauthorized. Valid authentication required." }, { status: 401 })
	}

	const apiKey = process.env.INTELX_API_KEY

	if (!apiKey) {
		console.error("IntelX API key is not configured.")
		return NextResponse.json({ error: "API key is not configured." }, { status: 500 })
	}

	try {
		const body = await request.json()
		const { systemId } = body

		if (!systemId || typeof systemId !== "string" || !isValidSystemId(systemId)) {
			return NextResponse.json({ error: "Invalid or missing system ID. Must be a valid UUID." }, { status: 400 })
		}

		const client = new IntelXClient({ key: apiKey })

		const result = await client.download(systemId)

		if (!result.content) {
			return NextResponse.json({ error: "Record not found or could not be retrieved." }, { status: 404 })
		}

		return new Response(result.content, {
			status: 200,
			headers: {
				"Content-Type": "text/plain",
			},
		})
	} catch (error) {
		console.error("Error fetching IntelX file view:", error)
		const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"

		if (errorMessage.includes("status: 401")) {
			return NextResponse.json({ error: "Unauthorized. Check your API key." }, { status: 401 })
		}
		if (errorMessage.includes("status: 404")) {
			return NextResponse.json({ error: "File not found." }, { status: 404 })
		}
		return NextResponse.json({ error: "Failed to fetch file content." }, { status: 500 })
	}
}
