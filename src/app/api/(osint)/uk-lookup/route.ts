import { getMockSession, canMakeMockQuery, mockUserQueryUsed } from "@/lib/mock-auth"
// Mock query functions imported above
import { APIError, isApiChecker } from "@/lib/utils"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

function parseLeakPeekResponse(text: string) {
	const nameMatch = text.match(/NAME:\s*\n([\s\S]*?)\s*\nADDRESS:/)
	const addressMatch = text.match(/ADDRESS:\s*\n([\s\S]*?)\s*\nDATE OF BIRTH:/)
	const dobMatch = text.match(/Year of birth\s*:(\d{4})/)
	const phoneMatch = text.match(/PHONE INFORMATION:\s*\n([\s\S]*?)\s*\nCOMPANY DIRECTOR INFORMATION:/)
	const salePriceMatch = text.match(/PREVIOUS HOUSE SALE PRICE:\s*\n\s*Sold\s*(\d+\s+\d+\s+\d+)\s*£([\d,.]+)/)
	const residencyMatch = text.match(/PREVIOUS ADDRESS RESIDENCY:\s*\n\s*(\d{4})/)

	return {
		name: nameMatch?.[1]?.replace(/\s+/g, " ").trim() || null,
		address: addressMatch?.[1]?.replace(/\s+/g, " ").trim() || null,
		yearOfBirth: dobMatch?.[1] || null,
		phoneInfo: phoneMatch?.[1]?.replace(/\s+/g, " ").trim() || null,
		previousHouseSale: salePriceMatch
			? {
					date: salePriceMatch[1].replace(/\s+/g, " ").trim(),
					price: salePriceMatch[2],
				}
			: null,
		previousResidencyYear: residencyMatch?.[1] || null,
	}
}

const requestSchema = z.object({
	fname: z.string().min(1),
	sname: z.string().min(1),
	location: z.string().min(1),
})

export async function POST(req: NextRequest) {
	if (!isApiChecker(req)) {
		try {
			const user = getMockSession()
			if (!user) throw new APIError("Unauthorized", 401)

					{ status: 403 },
				)
			}

			if (!(await canMakeMockQuery())) {
				throw new APIError("Query limit exceeded", 429)
			}

			await mockUserQueryUsed()

			const body = await req.json()
			const { fname, sname, location } = requestSchema.parse(body)

			const capitalizedFname = fname.charAt(0).toUpperCase() + fname.slice(1)
			const capitalizedSname = sname.charAt(0).toUpperCase() + sname.slice(1)
			const capitalizedLocation = location.charAt(0).toUpperCase() + location.slice(1)

			const response = await fetch(
				`https://leakpeek.com/ob/uksearch_query?fname=${encodeURIComponent(capitalizedFname)}&sname=${encodeURIComponent(capitalizedSname)}&location=${encodeURIComponent(capitalizedLocation)}`,
				{
					headers: {
						accept: "*/*",
						"accept-language": "es-419,es;q=0.9",
						cookie: "PHPSESSID=hc7qgenshq332c0g4srkj9ok17;",
						priority: "u=1, i",
						referer: "https://leakpeek.com/uksearch",
						"sec-ch-ua": '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
						"sec-ch-ua-mobile": "?0",
						"sec-ch-ua-platform": '"Windows"',
						"sec-fetch-dest": "empty",
						"sec-fetch-mode": "cors",
						"sec-fetch-site": "same-origin",
						"user-agent":
							"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
						"x-requested-with": "XMLHttpRequest",
					},
					method: "GET",
				},
			)

			const text = await response.text()
			if (!text) {
				return NextResponse.json({ success: false, error: "No data found" }, { status: 404 })
			}
			console.log(text)
			const parsed = parseLeakPeekResponse(text)

			const result = {
				fname: capitalizedFname,
				sname: capitalizedSname,
				full_name: parsed.name,
				location: capitalizedLocation,
				address: parsed.address,
				year_of_birth: parsed.yearOfBirth,
				phone_info: parsed.phoneInfo,
				previous_house_sale: parsed.previousHouseSale,
				previous_residency_year: parsed.previousResidencyYear,
			}

			return NextResponse.json({ success: true, data: result })
		} catch (error) {
			console.error("Error in uk-lookup route:", error)

			if (error instanceof z.ZodError) {
				return NextResponse.json(
					{
						success: false,
						error: "Invalid request data",
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
					error: "An error occurred while processing your request",
				},
				{ status: 500 },
			)
		}
	} else {
		try {
			const body = await req.json()
			const { fname, sname, location } = requestSchema.parse(body)

			const capitalizedFname = fname.charAt(0).toUpperCase() + fname.slice(1)
			const capitalizedSname = sname.charAt(0).toUpperCase() + sname.slice(1)
			const capitalizedLocation = location.charAt(0).toUpperCase() + location.slice(1)

			const response = await fetch(
				`https://leakpeek.com/ob/uksearch_query?fname=${encodeURIComponent(capitalizedFname)}&sname=${encodeURIComponent(capitalizedSname)}&location=${encodeURIComponent(capitalizedLocation)}`,
				{
					headers: {
						accept: "*/*",
						"accept-language": "es-419,es;q=0.9",
						cookie: "PHPSESSID=hc7qgenshq332c0g4srkj9ok17;",
						priority: "u=1, i",
						referer: "https://leakpeek.com/uksearch",
						"sec-ch-ua": '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
						"sec-ch-ua-mobile": "?0",
						"sec-ch-ua-platform": '"Windows"',
						"sec-fetch-dest": "empty",
						"sec-fetch-mode": "cors",
						"sec-fetch-site": "same-origin",
						"user-agent":
							"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
						"x-requested-with": "XMLHttpRequest",
					},
					method: "GET",
				},
			)

			const text = await response.text()
			if (!text) {
				return NextResponse.json({ success: false, error: "No data found" }, { status: 404 })
			}
			console.log(text)
			const parsed = parseLeakPeekResponse(text)

			const result = {
				fname: capitalizedFname,
				sname: capitalizedSname,
				full_name: parsed.name,
				location: capitalizedLocation,
				address: parsed.address,
				year_of_birth: parsed.yearOfBirth,
				phone_info: parsed.phoneInfo,
				previous_house_sale: parsed.previousHouseSale,
				previous_residency_year: parsed.previousResidencyYear,
			}

			return NextResponse.json({ success: true, data: result })
		} catch (error) {
			console.error("Error in uk-lookup route:", error)

			if (error instanceof z.ZodError) {
				return NextResponse.json(
					{
						success: false,
						error: "Invalid request data",
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
					error: "An error occurred while processing your request",
				},
				{ status: 500 },
			)
		}
	}
}
