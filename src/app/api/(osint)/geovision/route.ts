import { type NextRequest, NextResponse } from "next/server"
import { getMockSession, canMakeMockQuery, mockUserQueryUsed } from "@/lib/mock-auth"
import { APIError, isApiChecker } from "@/lib/utils"
// Mock query functions imported above

const API_KEY = process.env.GEOVISION_API_KEY
const API_URL = process.env.GEOVISION_API_URL || "http://176.100.39.202:3939/api/locate"
const MAX_FILE_SIZE = 10 * 1024 * 1024

export async function POST(request: NextRequest) {
	if (!isApiChecker(request)) {
		try {
			const user = getMockSession()

					{ status: 403 },
				)
			}

			if (!(await canMakeMockQuery())) {
				throw new APIError("Query limit exceeded", 429)
			}

			const formData = await request.formData()
			const image = formData.get("image") as File | null
			const additionalInfo = formData.get("additional_info") as string | null

			if (!image) {
				return NextResponse.json({ success: false, error: "No image file provided" }, { status: 400 })
			}

			if (image.size > MAX_FILE_SIZE) {
				return NextResponse.json({ success: false, error: "File size exceeds the 10MB limit" }, { status: 400 })
			}

			if (!API_KEY) {
				throw new APIError("Geovision API key not configured", 500)
			}

			await mockUserQueryUsed()

			const apiFormData = new FormData()

			apiFormData.append("image", image)

			if (additionalInfo?.trim()) {
				apiFormData.append("additional_info", additionalInfo)
			}

			const response = await fetch(API_URL, {
				method: "POST",
				headers: {
					"X-API-Key": API_KEY,
				},
				body: apiFormData,
			})

			if (!response.ok) {
				throw new APIError(`API returned ${response.status}: ${response.statusText}`, response.status)
			}

			const result = await response.json()

			return NextResponse.json({ success: true, data: result })
		} catch (error) {
			console.error("Error processing image:", error)

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
			const formData = await request.formData()
			const image = formData.get("image") as File | null
			const additionalInfo = formData.get("additional_info") as string | null

			if (!image) {
				return NextResponse.json({ success: false, error: "No image file provided" }, { status: 400 })
			}

			if (image.size > MAX_FILE_SIZE) {
				return NextResponse.json({ success: false, error: "File size exceeds the 10MB limit" }, { status: 400 })
			}

			if (!API_KEY) {
				throw new APIError("Geovision API key not configured", 500)
			}

			const apiFormData = new FormData()

			apiFormData.append("image", image)

			if (additionalInfo?.trim()) {
				apiFormData.append("additional_info", additionalInfo)
			}

			const response = await fetch(API_URL, {
				method: "POST",
				headers: {
					"X-API-Key": API_KEY,
				},
				body: apiFormData,
			})

			if (!response.ok) {
				throw new APIError(`API returned ${response.status}: ${response.statusText}`, response.status)
			}

			const result = await response.json()

			return NextResponse.json({ success: true, data: result })
		} catch (error) {
			console.error("Error processing image:", error)

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
