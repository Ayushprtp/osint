import { type NextRequest, NextResponse } from "next/server"
import { getMockSession, canMakeMockQuery, mockUserQueryUsed } from "@/lib/mock-auth"
// Mock query functions imported above
import { APIError } from "@/lib/utils"
import { z } from "zod"

export type VehicleSpecs = {
	VIN: string
	Year: string
	Make: string
	Model: string
	Trim: string
	Engine: string
	"Made In": string
	Style: string
	"Steering Type": string
	"Anti-Brake System": string
	"Fuel Type": string
	"Fuel Capacity": string
	"Gross Weight": string
	"Overall Height": string
	"Overall Length": string
	"Overall Width": string
	"Standard Seating": string
	"Optional Seating": string
	"Highway Mileage": string
	"City Mileage": string
	"Invoice Price": string
	MSRP: string
	[key: string]: string
}

export type TitleRecord = {
	vin: string
	state: string
	date: string
	meter: string
	current: boolean
	meterUnit: string
}

export type VinAuditResult = {
	vin: string
	id: string
	date: string
	mode: string
	specs: VehicleSpecs
	titles: TitleRecord[]
	checks: any[]
	jsi: any[]
	accidents: any[]
	salvage: any[]
	thefts: any[]
	lie: any[]
	sales: any[]
	clean: boolean
	error: string
	success: boolean
}

export type VinAuditResponse = {
	success: boolean
	data: VinAuditResult
	error?: string
}

export interface SessionCache {
	cookies: string
	isLoggedIn: boolean
	expiresAt: number
}

export type ReportType = "json" | "pdf"

export type SearchParams = {
	vin: string
	reportType: ReportType
}

export type SearchResponse = {
	success: boolean
	data: VinAuditResult
	error?: string
}

let sessionCache: SessionCache | null = null
const SESSION_CACHE_DURATION = 3600 * 1000

const requestSchema = z.object({
	vin: z.string().regex(/^[A-HJ-NPR-Za-hj-npr-z\d]{17}$/, "Invalid VIN format"),
	reportType: z.enum(["json", "html", "pdf"]).default("json"),
})

const VINAUDIT_USER = process.env.VINAUDIT_USER || ""
const VINAUDIT_PASS = process.env.VINAUDIT_PASS || ""

export async function POST(request: NextRequest) {
	try {
		const user = getMockSession()
		if (!user) throw new APIError("Unauthorized", 401)

		}

		if (!(await canMakeMockQuery())) {
			throw new APIError("Query limit exceeded", 429)
		}

		const body = await request.json()
		const { vin, reportType } = requestSchema.parse(body)

		const { cookies, isLoggedIn } = await getVinauditSession()
		if (!isLoggedIn) {
			throw new APIError("Vinaudit authentication failed", 401)
		}

		await mockUserQueryUsed()

		if (reportType === "pdf") {
			return await handlePdfReport(vin, cookies)
		}

		return await handleJsonReport(vin, cookies)
	} catch (error) {
		return handleError(error)
	}
}

export async function GET(request: NextRequest) {
	try {
		const user = getMockSession()
		if (!user) throw new APIError("Unauthorized", 401)

		}

		const { searchParams } = new URL(request.url)
		const vin = searchParams.get("vin")
		const reportType = (searchParams.get("reportType") as "json" | "html" | "pdf") || "json"
		const reportId = searchParams.get("reportId")

		if (reportId && reportType === "pdf") {
			const { cookies } = await getVinauditSession()
			return await downloadPdfReport(reportId, cookies)
		}

		if (!vin) {
			throw new APIError("VIN is required", 400)
		}

		const vinRegex = /^[A-HJ-NPR-Za-hj-npr-z\d]{17}$/
		if (!vinRegex.test(vin)) {
			throw new APIError("Invalid VIN format", 400)
		}

		if (!(await canMakeMockQuery())) {
			throw new APIError("Query limit exceeded", 429)
		}

		await mockUserQueryUsed()

		if (reportType === "pdf") {
			const { cookies } = await getVinauditSession()
			return await handlePdfReport(vin, cookies)
		}

		const { cookies, isLoggedIn } = await getVinauditSession()
		if (!isLoggedIn) {
			throw new APIError("Vinaudit authentication failed", 401)
		}

		return await handleJsonReport(vin, cookies)
	} catch (error) {
		return handleError(error)
	}
}

async function handlePdfReport(vin: string, cookies: string): Promise<NextResponse> {
	try {
		const reportId = await getReportId(vin, cookies)
		if (!reportId) {
			throw new APIError("Failed to get report ID", 500)
		}

		return await downloadPdfReport(reportId, cookies)
	} catch (error) {
		console.error("PDF fetch error:", error)
		throw new APIError("Failed to fetch PDF report", 502)
	}
}

async function downloadPdfReport(reportId: string, cookies: string): Promise<NextResponse> {
	const pdfUrl = `https://api.vinaudit.com/report.php?type=USA&format=pdf&id=${reportId}`

	const pdfResponse = await fetch(pdfUrl, {
		headers: {
			Cookie: cookies,
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0",
			Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
			"Accept-Language": "en-US,en;q=0.5",
			"Upgrade-Insecure-Requests": "1",
			"Sec-Fetch-Dest": "document",
			"Sec-Fetch-Mode": "navigate",
			"Sec-Fetch-Site": "same-site",
			"Sec-Fetch-User": "?1",
		},
		referrer: `https://www.vinaudit.com/report?id=${reportId}&popup=1`,
	})

	if (!pdfResponse.ok) {
		throw new APIError(`Failed to fetch PDF report: ${pdfResponse.status} ${pdfResponse.statusText}`, 502)
	}

	const pdfBuffer = await pdfResponse.arrayBuffer()

	return new NextResponse(pdfBuffer, {
		status: 200,
		headers: {
			"Content-Type": "application/pdf",
			"Content-Disposition": `attachment; filename="vinaudit-report-${reportId}.pdf"`,
		},
	})
}

async function handleJsonReport(vin: string, cookies: string): Promise<NextResponse> {
	const apiUrl = new URL("https://www.vinaudit.com/members/apipull.php")
	apiUrl.searchParams.append("mode", "null")
	apiUrl.searchParams.append("flags", "null")
	apiUrl.searchParams.append("id", generateRequestId())
	apiUrl.searchParams.append("user", VINAUDIT_USER)
	apiUrl.searchParams.append("key", VINAUDIT_PASS)
	apiUrl.searchParams.append("callback", "VA_OnPullData")
	apiUrl.searchParams.append("vin", vin)
	apiUrl.searchParams.append("server", "api.vinaudit.com")
	apiUrl.searchParams.append("rd", String(Math.random()))
	apiUrl.searchParams.append("try", "0")

	const response = await fetch(apiUrl.toString(), {
		headers: {
			Cookie: cookies,
			"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
			Accept: "application/json, text/javascript, */*; q=0.01",
			"Accept-Language": "en-US,en;q=0.9",
			Referer: "https://www.vinaudit.com/",
			"X-Requested-With": "XMLHttpRequest",
		},
	})

	if (!response.ok) {
		throw new APIError(`VinAudit API error: ${response.status} ${response.statusText}`, 502)
	}

	const text = await response.text()
	console.log("VinAudit API response:", `${text.substring(0, 200)}...`)

	const data = parseVinAuditResponse(text)

	if (!data) {
		throw new APIError("Invalid response format from Vinaudit", 502)
	}

	if (!data.success) {
		throw new APIError(data.error || "Vinaudit API error", 500)
	}

	console.log("Successfully fetched VinAudit data")

	return NextResponse.json({
		success: true,
		data: data,
	})
}

function parseVinAuditResponse(text: string): VinAuditResponse | null {
	const callbackPrefix = "VA_OnPullData("
	const callbackSuffix = ");"

	if (text.startsWith(callbackPrefix) && text.endsWith(callbackSuffix)) {
		try {
			const jsonStr = text.slice(callbackPrefix.length, -callbackSuffix.length)
			const data = JSON.parse(jsonStr)
			console.log("Successfully parsed JSON from callback format")
			return data
		} catch (e) {
			console.error("Failed to parse JSON from callback format:", e)
		}
	} else {
		console.error("Response doesn't match expected format:", text.substring(0, 50))
	}

	return null
}

async function getReportId(vin: string, cookies: string): Promise<string | null> {
	try {
		const apiUrl = new URL("https://www.vinaudit.com/members/apipull.php")
		apiUrl.searchParams.append("mode", "null")
		apiUrl.searchParams.append("flags", "null")
		apiUrl.searchParams.append("id", generateRequestId())
		apiUrl.searchParams.append("user", VINAUDIT_USER)
		apiUrl.searchParams.append("key", VINAUDIT_PASS)
		apiUrl.searchParams.append("callback", "VA_OnPullData")
		apiUrl.searchParams.append("vin", vin)
		apiUrl.searchParams.append("server", "api.vinaudit.com")
		apiUrl.searchParams.append("rd", String(Math.random()))
		apiUrl.searchParams.append("try", "0")

		const response = await fetch(apiUrl.toString(), {
			headers: {
				Cookie: cookies,
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
				Accept: "application/json, text/javascript, */*; q=0.01",
				"Accept-Language": "en-US,en;q=0.9",
				Referer: "https://www.vinaudit.com/",
				"X-Requested-With": "XMLHttpRequest",
			},
		})

		if (!response.ok) {
			console.error(`Failed to get report ID: ${response.status} ${response.statusText}`)
			return null
		}

		const text = await response.text()
		const data = parseVinAuditResponse(text)

		if (!data || !data.success) {
			console.error("Failed to get valid data for report ID")
			return null
		}

		return data.data.id
	} catch (error) {
		console.error("Error getting report ID:", error)
		return null
	}
}

async function getVinauditSession(): Promise<{
	cookies: string
	isLoggedIn: boolean
}> {
	if (sessionCache && sessionCache.expiresAt > Date.now()) {
		console.log("Using cached VinAudit session")
		return {
			cookies: sessionCache.cookies,
			isLoggedIn: sessionCache.isLoggedIn,
		}
	}

	console.log("Creating new VinAudit session")

	const initialResponse = await fetch("https://www.vinaudit.com/members/login.php", {
		headers: {
			"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
			Accept:
				"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
			"Accept-Language": "en-US,en;q=0.9",
			"Cache-Control": "max-age=0",
			"Sec-Fetch-Dest": "document",
			"Sec-Fetch-Mode": "navigate",
			"Sec-Fetch-Site": "none",
			"Sec-Fetch-User": "?1",
			"Upgrade-Insecure-Requests": "1",
		},
	})

	const initialCookieHeader = initialResponse.headers.get("set-cookie") || ""
	const initialCookies = parseCookiesFromHeader(initialCookieHeader)

	const loginResponse = await fetch("https://www.vinaudit.com/members/login.php", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
			Accept:
				"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
			"Accept-Language": "en-US,en;q=0.9",
			"Cache-Control": "max-age=0",
			Origin: "https://www.vinaudit.com",
			Referer: "https://www.vinaudit.com/members/login.php",
			"Sec-Fetch-Dest": "document",
			"Sec-Fetch-Mode": "navigate",
			"Sec-Fetch-Site": "same-origin",
			"Sec-Fetch-User": "?1",
			"Upgrade-Insecure-Requests": "1",
			Cookie: initialCookies,
		},
		body: new URLSearchParams({
			url: "/account-dashboard",
			user: VINAUDIT_USER,
			pass: VINAUDIT_PASS,
			avia_generated_form1: "1",
			remember: "1",
		}),
		redirect: "manual",
	})

	const loginCookieHeader = loginResponse.headers.get("set-cookie") || ""
	const loginCookies = parseCookiesFromHeader(loginCookieHeader)

	let allCookies = mergeCookieStrings(initialCookies, loginCookies)
	let isLoggedIn = false

	if (loginResponse.status === 302) {
		const redirectLocation = loginResponse.headers.get("location")

		if (redirectLocation) {
			const redirectUrl = new URL(redirectLocation, "https://www.vinaudit.com").toString()

			const redirectResponse = await fetch(redirectUrl, {
				headers: {
					"User-Agent":
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
					Accept:
						"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
					"Accept-Language": "en-US,en;q=0.9",
					Referer: "https://www.vinaudit.com/members/login.php",
					"Sec-Fetch-Dest": "document",
					"Sec-Fetch-Mode": "navigate",
					"Sec-Fetch-Site": "same-origin",
					"Sec-Fetch-User": "?1",
					"Upgrade-Insecure-Requests": "1",
					Cookie: allCookies,
				},
				redirect: "manual",
			})

			const redirectCookieHeader = redirectResponse.headers.get("set-cookie") || ""
			const redirectCookies = parseCookiesFromHeader(redirectCookieHeader)

			allCookies = mergeCookieStrings(allCookies, redirectCookies)

			if (redirectResponse.status === 200) {
				const redirectText = await redirectResponse.text()
				const hasLogoutLink = redirectText.includes("logout")
				const hasAccountDashboard = redirectText.includes("Account Dashboard")
				const hasUserName = redirectText.includes(VINAUDIT_USER)

				if (hasLogoutLink || hasAccountDashboard || hasUserName) {
					isLoggedIn = true
				}
			}

			if (!isLoggedIn) {
				const apiTestUrl = "https://www.vinaudit.com/members/apipull.php?mode=null&flags=null"
				const apiTestResponse = await fetch(apiTestUrl, {
					headers: {
						"User-Agent":
							"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
						Accept: "application/json, text/javascript, */*; q=0.01",
						"Accept-Language": "en-US,en;q=0.9",
						Referer: "https://www.vinaudit.com/account-dashboard",
						"X-Requested-With": "XMLHttpRequest",
						Cookie: allCookies,
					},
				})

				if (apiTestResponse.status === 200) {
					isLoggedIn = true
				}
			}
		}
	}

	if (isLoggedIn) {
		sessionCache = {
			cookies: allCookies,
			isLoggedIn: true,
			expiresAt: Date.now() + SESSION_CACHE_DURATION,
		}
	}

	return {
		cookies: allCookies,
		isLoggedIn,
	}
}

function parseCookiesFromHeader(setCookieHeader: string): string {
	if (!setCookieHeader) return ""

	const cookieHeaders = setCookieHeader.split(/,(?=[^ =;]+=[^;]+)/).map((header) => header.trim())

	const cookies = cookieHeaders
		.map((header) => {
			const match = header.match(/^([^=]+)=([^;]+)/)
			return match ? `${match[1]}=${match[2]}` : ""
		})
		.filter(Boolean)

	return cookies.join("; ")
}

function mergeCookieStrings(cookies1: string, cookies2: string): string {
	if (!cookies1) return cookies2
	if (!cookies2) return cookies1

	const cookieMap = new Map<string, string>()

	cookies1.split("; ").forEach((cookie) => {
		const parts = cookie.split("=")
		if (parts.length >= 2) {
			const name = parts[0]
			const value = parts.slice(1).join("=")
			cookieMap.set(name, value)
		}
	})

	cookies2.split("; ").forEach((cookie) => {
		const parts = cookie.split("=")
		if (parts.length >= 2) {
			const name = parts[0]
			const value = parts.slice(1).join("=")
			cookieMap.set(name, value)
		}
	})

	return Array.from(cookieMap.entries())
		.map(([name, value]) => `${name}=${value}`)
		.join("; ")
}

function generateRequestId(): string {
	return String(Date.now() + Math.floor(Math.random() * 10000))
}

function handleError(error: unknown) {
	console.error("VinAudit API error:", error)

	if (error instanceof z.ZodError) {
		return NextResponse.json({ success: false, error: "Invalid parameters", details: error.errors }, { status: 400 })
	}

	if (error instanceof APIError) {
		return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode })
	}

	return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
}
