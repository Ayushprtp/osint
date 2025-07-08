import { type NextRequest, NextResponse } from "next/server"
import { getMockSession, canMakeMockQuery, mockUserQueryUsed } from "@/lib/mock-auth"
// Mock query functions imported above
import { APIError, isApiChecker } from "@/lib/utils"
import { z } from "zod"

const requestSchema = z.object({
	ip: z.string().ip().optional(),
})

async function fetchIPInfo(ip: string) {
	try {
		const url = `https://api.vot.wtf/ipinfo?ip=${ip}`
		const response = await fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
		})

		if (!response.ok) {
			const errorText = await response.text().catch(() => "Unknown error")
			console.error(`API request failed with status ${response.status}: ${errorText}`)
			throw new Error(`API request failed with status ${response.status}: ${errorText}`)
		}

		return await response.json()
	} catch (error) {
		console.error("Error fetching IP info:", error)
		throw error
	}
}

export async function POST(request: NextRequest) {
	if (!isApiChecker(request)) {
		try {
			const user = getMockSession()


			const body = await request.json()
			const { ip } = requestSchema.parse(body)

			const forwardedFor = request.headers.get("x-forwarded-for")
			const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1"
			const ipAddress = ip || clientIp

			if (!(await canMakeMockQuery())) {
				throw new APIError("Query limit exceeded", 429)
			}

			await mockUserQueryUsed()

			try {
				const ipInfoData = await fetchIPInfo(ipAddress)
				return NextResponse.json({ success: true, data: ipInfoData })
			} catch (error) {
				throw new APIError("Failed to fetch IP information", 500)
			}
		} catch (error) {
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
			const body = await request.json()
			const { ip } = requestSchema.parse(body)

			const forwardedFor = request.headers.get("x-forwarded-for")
			const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1"
			const ipAddress = ip || clientIp

			const ipInfoData = await fetchIPInfo(ipAddress)
			return NextResponse.json({ success: true, data: ipInfoData })
		} catch (error) {
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
