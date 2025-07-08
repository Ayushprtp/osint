import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { headers } from "next/headers"
import { canMakeQuery, userQueryUsed } from "@/lib/query"
import { APIError, isApiChecker } from "@/lib/utils"
import { z } from "zod"
import { getActiveSubscription } from "@/lib/subscription"

const requestSchema = z.object({
	query: z.string().min(1),
	searchType: z.string(),
})

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const { query, searchType } = requestSchema.parse(body)

		const apiKey = process.env.OSINTKIT_API_KEY
		if (!apiKey) {
			return NextResponse.json({ error: "API key not configured" }, { status: 500 })
		}

		let filterParam
		switch (searchType) {
			case "email":
				filterParam = "filters[emails]"
				break
			case "username":
				filterParam = "filters[logins.login]"
				break
			case "password":
				filterParam = "filters[logins.password]"
				break
			case "phone":
				filterParam = "filters[phones]"
				break
			case "name":
				filterParam = "filters[names]"
				break
			case "address":
				filterParam = "filters[address]"
				break
			case "passport":
				filterParam = "filters[documents.passports.serial]"
				break
			case "telegram":
				filterParam = "filters[social_networks.id]"
				break
			case "inn":
				filterParam = "filters[inn]"
				break
			case "snils":
				filterParam = "filters[snils]"
				break
			case "birth_date":
				filterParam = "filters[birth_date]"
				break
			case "plate":
				filterParam = "filters[vehicles.plate_number]"
				break
			case "vin":
				filterParam = "filters[vehicles.vin]"
				break
			default:
				console.warn(`Unsupported searchType received: ${searchType}, falling back to 'name'`)
				filterParam = "filters[names]"
		}

		const url = `https://api.osintkit.net/v1/search?${filterParam}=${encodeURIComponent(query)}`

		if (isApiChecker(request)) {
			const response = await fetch(url, {
				method: "GET",
				headers: {
					Accept: "application/json",
					"X-API-KEY": apiKey,
				},
			})

			if (!response.ok) {
				const errorData = await response.json()
				return NextResponse.json(
					{ error: errorData.message || `API responded with status ${response.status}` },
					{ status: response.status },
				)
			}

			const data = await response.json()
			return NextResponse.json(data)
		}

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

		if (!(await canMakeQuery(user.user.id, "osintkit"))) {
			throw new APIError("Query limit exceeded", 429)
		}

		await userQueryUsed(user.user.id, "osintkit")

		const response = await fetch(url, {
			method: "GET",
			headers: {
				Accept: "application/json",
				"X-API-KEY": apiKey,
			},
		})

		if (!response.ok) {
			const errorData = await response.json()
			return NextResponse.json(
				{ error: errorData.message || `API responded with status ${response.status}` },
				{ status: response.status },
			)
		}

		const data = await response.json()
		return NextResponse.json(data)
	} catch (error) {
		console.error("Error in OsintKit API:", error)
		return NextResponse.json({ error: "An error occurred while processing your request" }, { status: 500 })
	}
}
