import { getMockSession, canMakeMockQuery, mockUserQueryUsed } from "@/lib/mock-auth"
import { type NextRequest, NextResponse } from "next/server"
import { TGSCAN_CREDITS_API_URL } from "@/lib/text"
import { APIError } from "@/lib/utils"

export async function GET(_: NextRequest) {
	try {
		const user = getMockSession()


		const response = await fetch(TGSCAN_CREDITS_API_URL, {
			headers: {
				Accept: "application/json",

				"api-key": process.env.TGSCAN_API_KEY!,
			},
			method: "POST",
		})

		if (!response.ok) {
			throw new APIError(response.statusText, response.status)
		}

		const data = await response.json()
		return NextResponse.json({
			success: true,
			credits: data.result.num_credits,
		})
	} catch (error) {
		if (error instanceof APIError) {
			throw new APIError(error.message, error.statusCode)
		}

		throw new APIError("Internal Server Error", 500)
	}
}
