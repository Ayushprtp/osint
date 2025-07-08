import { db } from "../src/db"
import { apiStatus } from "../src/db/schema"

const SEARCH_TYPES = [
	{ id: "email", name: "Email" },
	{ id: "username", name: "Username" },
	{ id: "password", name: "Password" },
	{ id: "name", name: "Name" },
	{ id: "phone", name: "Phone" },
	{ id: "ip", name: "IP Address" },
	{ id: "domain", name: "Domain" },
	{ id: "hash", name: "Hash" },
	{ id: "ssn", name: "SSN" },
	{ id: "address", name: "Address" },
	{ id: "vin", name: "VIN" },
	{ id: "discord", name: "Discord ID" },
	{ id: "passport", name: "Passport" },
	{ id: "telegram", name: "Telegram ID" },
	{ id: "inn", name: "INN" },
	{ id: "snils", name: "SNILS" },
	{ id: "birth_date", name: "Birth Date" },
	{ id: "plate", name: "License Plate" },
	{ id: "leaks", name: "Leaks" },
	{ id: "hlr", name: "HLR Lookup" },
] as const

type SearchType = (typeof SEARCH_TYPES)[number]["id"]

interface ServiceConfig {
	name: string
	supportedSearchTypes: SearchType[]
	endpoint: string
	method: "GET" | "POST"
	buildRequestBody: (data: TestData, searchType: SearchType) => Record<string, unknown>
	validateResponse: (data: unknown) => { isValid: boolean; errorMessage?: string }
}

interface TestData {
	email?: string
	username?: string
	password?: string
	name?: { firstName: string; lastName: string }
	phone?: string
	ip?: string
	domain?: string
	hash?: string
	ssn?: string
	address?: string
	vin?: string
	discord?: string
	passport?: string
	telegram?: string
	inn?: string
	snils?: string
	birth_date?: string
	plate?: string
	leaks?: string
	hlr?: string
}

interface ApiResponse {
	status: boolean
	responseTime: number
	error: string | null
}

interface CheckResult {
	service: string
	status: boolean
	responseTime: number
	error: string | null
}

const TEST_DATA_SETS: TestData[] = [
	{
		email: "test@example.com",
		username: "testuser1",
		password: "password123",
		name: { firstName: "John", lastName: "Doe" },
		phone: "+1234567890",
		ip: "8.8.8.8",
		domain: "example.com",
		hash: "5f4dcc3b5aa765d61d8327deb882cf99",
		ssn: "123-45-6789",
		address: "123 Main St, Anytown, USA",
		vin: "1C4BJWKGXDL508578",
		discord: "326237293612367873",
		passport: "X12345678",
		telegram: "123456789",
		inn: "123456789012",
		snils: "123-456-789 01",
		birth_date: "1990-01-01",
		plate: "ABC123",
		leaks: "testleak",
		hlr: "1234567890",
	},
	{
		email: "user2@domain.com",
		username: "user2test",
		password: "secure456",
		name: { firstName: "Jane", lastName: "Smith" },
		phone: "+19876543210",
		ip: "1.1.1.1",
		domain: "example.org",
		hash: "098f6bcd4621d373cade4e832627b4f6",
		ssn: "987-65-4321",
		address: "456 Oak Ave, Somewhere, USA",
		vin: "2C3CDXHG8JH123456",
		discord: "987654321098765432",
		passport: "Y98765432",
		telegram: "987654321",
		inn: "987654321098",
		snils: "987-654-321 09",
		birth_date: "1985-06-15",
		plate: "XYZ789",
		leaks: "anotherleak",
		hlr: "9876543210",
	},
]

const ALL_SERVICES: Record<string, ServiceConfig> = {
	snusbase: {
		name: "Snusbase",
		supportedSearchTypes: ["email", "username", "password", "name", "phone", "ip", "domain", "hash"],
		endpoint: "/api/snusbase",
		method: "POST",
		buildRequestBody: (data, searchType) => ({
			query: typeof data[searchType] === "object" ? data[searchType]?.firstName : data[searchType],
			searchType: searchType === "ip" ? "lastip" : searchType === "domain" ? "_domain" : searchType,
			wildcard: false,
		}),
		validateResponse: (data: any) => ({
			isValid: data.status !== "error" && !data.message?.includes("error"),
			errorMessage: data.message || data.error,
		}),
	},
	intelvault: {
		name: "IntelVault",
		supportedSearchTypes: ["email", "username", "name", "phone", "ip", "domain"],
		endpoint: "/api/intelvault",
		method: "POST",
		buildRequestBody: (data, searchType) => {
			if (searchType === "name" && data.name) {
				return {
					fields: [{ first_name: data.name.firstName }, { last_name: data.name.lastName }],
					useWildcard: false,
				}
			}
			return {
				fields: [{ [searchType]: data[searchType] }],
				useWildcard: false,
			}
		},
		validateResponse: (data: any) => ({
			isValid: data.status !== "error" && !data.message?.includes("error"),
			errorMessage: data.message || data.error,
		}),
	},
	leakcheck: {
		name: "LeakCheck",
		supportedSearchTypes: ["email", "username", "password", "phone", "name", "address", "vin", "discord"],
		endpoint: "/api/leakcheck",
		method: "POST",
		buildRequestBody: (data, searchType) => ({
			query: typeof data[searchType] === "object" ? data[searchType]?.firstName : data[searchType],
			type: searchType,
		}),
		validateResponse: (data: any) => ({
			isValid: data.status !== "error" && !data.message?.includes("error"),
			errorMessage: data.message || data.error,
		}),
	},
	osintalternative: {
		name: "OSINTAlternative",
		supportedSearchTypes: ["email"],
		endpoint: "/api/osintalternative",
		method: "GET",
		buildRequestBody: () => ({}),
		validateResponse: (data: any) => ({
			isValid: data.status !== "error" && !data.message?.includes("error"),
			errorMessage: data.message || data.error,
		}),
	},
	traceback: {
		name: "Traceback",
		supportedSearchTypes: ["email", "username", "name", "phone", "ip", "domain"],
		endpoint: "/api/traceback",
		method: "POST",
		buildRequestBody: (data, searchType) => ({
			query: typeof data[searchType] === "object" ? data[searchType]?.firstName : data[searchType],
			field: searchType,
			limit: 10,
			use_wildcard: false,
		}),
		validateResponse: (data: any) => ({
			isValid: data.status !== "error" && !data.message?.includes("error"),
			errorMessage: data.message || data.error,
		}),
	},
	ipsearch: {
		name: "IP Search",
		supportedSearchTypes: ["ip"],
		endpoint: "/api/ipsearch",
		method: "POST",
		buildRequestBody: (data) => ({
			ip: data.ip,
		}),
		validateResponse: (data: any) => ({
			isValid: data.status !== "error" && !data.message?.includes("error"),
			errorMessage: data.message || data.error,
		}),
	},
	seon: {
		name: "SEON",
		supportedSearchTypes: ["email", "phone", "ip", "name"],
		endpoint: "/api/seon",
		method: "POST",
		buildRequestBody: (data, searchType) => {
			let seonType = "email"
			let seonData: Record<string, string> = { email: data.email || "" }

			switch (searchType) {
				case "email":
					seonType = "email"
					seonData = { email: data.email || "" }
					break
				case "phone":
					seonType = "phone"
					seonData = { phone: data.phone || "" }
					break
				case "ip":
					seonType = "ip"
					seonData = { ip: data.ip || "" }
					break
				case "name":
					seonType = "aml"
					seonData = data.name
						? { user_fullname: `${data.name.firstName} ${data.name.lastName}` }
						: { user_fullname: "" }
					break
			}

			return {
				type: seonType,
				data: seonData,
			}
		},
		validateResponse: (data: any) => ({
			isValid: data.status !== "error" && !data.message?.includes("error"),
			errorMessage: data.message || data.error,
		}),
	},
	rutify: {
		name: "Rutify",
		supportedSearchTypes: ["name"],
		endpoint: "/api/rutify",
		method: "POST",
		buildRequestBody: (data) => ({
			query: data.name ? `${data.name.firstName} ${data.name.lastName}` : "",
			type: "name",
		}),
		validateResponse: (data: any) => ({
			isValid: data.status !== "error" && !data.message?.includes("error"),
			errorMessage: data.message || data.error,
		}),
	},
	leakosint: {
		name: "LeakOSINT",
		supportedSearchTypes: ["email", "username", "name", "phone", "ip", "domain"],
		endpoint: "/api/leakosint",
		method: "POST",
		buildRequestBody: (data, searchType) => ({
			query: typeof data[searchType] === "object" ? data[searchType]?.firstName : data[searchType],
			type: searchType,
			limit: 10,
		}),
		validateResponse: (data: any) => ({
			isValid: data.status !== "error" && !data.message?.includes("error"),
			errorMessage: data.message || data.error,
		}),
	},
	osintcat: {
		name: "OSINTCat",
		supportedSearchTypes: ["email", "username", "name", "phone", "ip", "domain"],
		endpoint: "/api/osintcat",
		method: "POST",
		buildRequestBody: (data, searchType) => ({
			query:
				typeof data[searchType] === "object"
					? `${data[searchType]?.firstName} ${data[searchType]?.lastName}`
					: String(data[searchType]),
			searchType,
		}),
		validateResponse: (data: any) => ({
			isValid: data.status !== "error" && !data.message?.includes("error"),
			errorMessage: data.message || data.error,
		}),
	},
	osintdog: {
		name: "OSINTDog",
		supportedSearchTypes: ["email", "username", "name", "phone", "ip", "domain"],
		endpoint: "/api/osintdog",
		method: "POST",
		buildRequestBody: (data, searchType) => ({
			query:
				searchType === "name" && data.name ? `${data.name.firstName} ${data.name.lastName}` : data[searchType] || "",
			searchType: searchType,
			limit: 10,
		}),
		validateResponse: (data: any) => ({
			isValid: data.status !== "error" && !data.message?.includes("error"),
			errorMessage: data.message || data.error,
		}),
	},
	shodan: {
		name: "SHODAN",
		supportedSearchTypes: ["ip", "domain"],
		endpoint: "/api/shodan",
		method: "POST",
		buildRequestBody: (data, searchType) => {
			if (searchType === "ip") {
				return {
					type: "host_info",
					ip: data.ip,
					minify: true,
				}
			}
			return {
				type: "search",
				query: data[searchType],
				minify: true,
			}
		},
		validateResponse: (data: any) => ({
			isValid: data.status !== "error" && !data.message?.includes("error"),
			errorMessage: data.message || data.error,
		}),
	},
	callerapi: {
		name: "CallerAPI",
		supportedSearchTypes: ["phone"],
		endpoint: "/api/callerapi",
		method: "POST",
		buildRequestBody: (data) => ({
			phone: data.phone,
			limit: 10,
		}),
		validateResponse: (data: any) => ({
			isValid: data.status !== "error" && !data.message?.includes("error"),
			errorMessage: data.message || data.error,
		}),
	},
	breachbase: {
		name: "BreachBase",
		supportedSearchTypes: ["email", "username", "name", "phone", "ip", "domain"],
		endpoint: "/api/breachbase",
		method: "POST",
		buildRequestBody: (data, searchType) => ({
			input: [typeof data[searchType] === "object" ? data[searchType]?.firstName : data[searchType]],
			type: searchType,
			page: 1,
			limit: 10,
		}),
		validateResponse: (data: any) => ({
			isValid: data.status !== "error" && !data.message?.includes("error"),
			errorMessage: data.message || data.error,
		}),
	},
	endato: {
		name: "ENDATO",
		supportedSearchTypes: ["email"],
		endpoint: "/api/endato",
		method: "POST",
		buildRequestBody: (data) => ({
			endpoint: "Email/Enrich",
			searchType: "DevAPIEmailID",
			data: { email: data.email },
			limit: 10,
		}),
		validateResponse: (data: any) => ({
			isValid: data.status !== "error" && !data.message?.includes("error"),
			errorMessage: data.message || data.error,
		}),
	},
	hunter: {
		name: "Hunter",
		supportedSearchTypes: ["email"],
		endpoint: "/api/hunter",
		method: "POST",
		buildRequestBody: (data) => ({
			type: "people",
			email: data.email,
		}),
		validateResponse: (data: any) => ({
			isValid: data.status !== "error" && !data.message?.includes("error"),
			errorMessage: data.message || data.error,
		}),
	},
	inf0sec: {
		name: "Inf0sec",
		supportedSearchTypes: ["leaks", "hlr", "username", "domain", "discord"],
		endpoint: "/api/inf0sec",
		method: "POST",
		buildRequestBody: (data, searchType) => {
			const moduleMap: Record<string, string> = {
				leaks: "leaks",
				hlr: "hlr",
				username: "username",
				domain: "domain",
				discord: "discord",
			}
			const module = moduleMap[searchType] || "email"
			return {
				query:
					typeof data[searchType] === "object"
						? `${data[searchType]?.firstName} ${data[searchType]?.lastName}`
						: String(data[searchType]),
				module,
			}
		},
		validateResponse: (data: any) => ({
			isValid: data.status !== "error" && !data.message?.includes("error"),
			errorMessage: data.message || data.error,
		}),
	},
	oathnet: {
		name: "OATH",
		supportedSearchTypes: ["email", "username", "name", "phone", "ip", "domain"],
		endpoint: "/api/oathnet",
		method: "POST",
		buildRequestBody: (data, searchType) => ({
			type: "text",
			query: data[searchType],
			limit: 10,
		}),
		validateResponse: (data: any) => ({
			isValid: data.status !== "error" && !data.message?.includes("error"),
			errorMessage: data.message || data.error,
		}),
	},
	leaksight: {
		name: "LeakSight",
		supportedSearchTypes: ["email", "username", "name", "phone", "ip", "domain"],
		endpoint: "/api/leaksight",
		method: "POST",
		buildRequestBody: (data, searchType) => {
			type LeakSightSearchType = "subdomainScan" | "username" | "ip"
			let leaksightSearchType: LeakSightSearchType = "username"
			if (searchType === "domain") {
				leaksightSearchType = "subdomainScan"
			} else if (searchType === "username" || searchType === "ip") {
				leaksightSearchType = searchType
			}
			return {
				query: typeof data[searchType] === "object" ? data[searchType]?.firstName : data[searchType],
				searchType: leaksightSearchType,
			}
		},
		validateResponse: (data: any) => ({
			isValid: data.status !== "error" && !data.message?.includes("error"),
			errorMessage: data.message || data.error,
		}),
	},
	hackcheck: {
		name: "HackCheck",
		supportedSearchTypes: ["email", "username", "name", "phone", "ip", "domain"],
		endpoint: "/api/hackcheck",
		method: "POST",
		buildRequestBody: (data, searchType) => ({
			query:
				typeof data[searchType] === "object"
					? `${data[searchType]?.firstName} ${data[searchType]?.lastName}`
					: String(data[searchType]),
			searchType,
		}),
		validateResponse: (data: any) => ({
			isValid: data.status !== "error" && !data.message?.includes("error"),
			errorMessage: data.message || data.error,
		}),
	},
	nosint: {
		name: "NOSINT",
		supportedSearchTypes: ["email", "username", "name", "phone", "ip", "domain"],
		endpoint: "/api/nosint",
		method: "POST",
		buildRequestBody: (data, searchType) => ({
			target: typeof data[searchType] === "object" ? data[searchType]?.firstName : data[searchType],
			plugin_type: searchType,
			limit: 10,
		}),
		validateResponse: (data: any) => ({
			isValid: data.status !== "error" && !data.message?.includes("error"),
			errorMessage: data.message || data.error,
		}),
	},
	npd: {
		name: "NPD",
		supportedSearchTypes: ["name", "phone", "address", "ssn"],
		endpoint: "/api/npd",
		method: "POST",
		buildRequestBody: (data, searchType) => {
			const searchTypeMap: Record<string, string> = {
				email: "firstname",
				phone: "phone1",
				address: "address",
				name: "firstname",
				ssn: "ssn",
			}
			const mappedType = searchTypeMap[searchType] || "firstname"

			if (searchType === "name" && data.name) {
				return {
					query: `${data.name.firstName} ${data.name.lastName}`.trim(),
					module: [
						{ field: "firstname", value: data.name.firstName },
						{ field: "lastname", value: data.name.lastName },
					],
				}
			}
			return {
				query: String(data[searchType]),
				module: mappedType,
			}
		},
		validateResponse: (data: any) => ({
			isValid: data.status !== "error" && !data.message?.includes("error"),
			errorMessage: data.message || data.error,
		}),
	},
	carfax: {
		name: "Carfax",
		supportedSearchTypes: ["vin"],
		endpoint: "/api/carfax",
		method: "POST",
		buildRequestBody: (data) => ({
			type: "vin",
			vin: data.vin,
			limit: 10,
		}),
		validateResponse: (data: any) => ({
			isValid: data.status !== "error" && !data.message?.includes("error"),
			errorMessage: data.message || data.error,
		}),
	},
	osintkit: {
		name: "OsintKit",
		supportedSearchTypes: ["email", "username", "password", "phone", "name", "address", "vin", "discord"],
		endpoint: "/api/osintkit",
		method: "POST",
		buildRequestBody: (data, searchType) => ({
			query:
				typeof data[searchType] === "object"
					? `${data[searchType]?.firstName} ${data[searchType]?.lastName}`
					: String(data[searchType]),
			searchType: searchType,
		}),
		validateResponse: (data: any) => ({
			isValid: data.status !== "error" && !data.message?.includes("error"),
			errorMessage: data.message || data.error,
		}),
	},
}

const createRequestOptions = (
	config: ServiceConfig,
	testData: TestData,
	searchType: SearchType,
): { url: string; options: RequestInit } => {
	const url = `${process.env.BETTER_AUTH_URL}${config.endpoint}`
	const options: RequestInit = {
		method: config.method,
		headers: {
			"Content-Type": "application/json",
			"User-Agent": "OSINT-Dashboard-API-Checker",
		},
		signal: AbortSignal.timeout(60000),
	}

	if (config.method === "POST") {
		options.body = JSON.stringify(config.buildRequestBody(testData, searchType))
	} else {
		const testValue = testData[searchType]
		const query = encodeURIComponent(
			typeof testValue === "object" && testValue ? `${testValue.firstName} ${testValue.lastName}` : testValue || "",
		)
		return { url: `${url}?${searchType}=${query}`, options }
	}

	return { url, options }
}

const updateApiStatus = async (service: string, result: ApiResponse) => {
	try {
		await db
			.insert(apiStatus)
			.values({
				service,
				...result,
				lastChecked: new Date(),
			})
			.onConflictDoUpdate({
				target: apiStatus.service,
				set: {
					status: result.status,
					responseTime: result.responseTime,
					error: result.error,
					lastChecked: new Date(),
				},
			})
	} catch (error) {
		console.error(`Failed to update ${service} status:`, error)
	}
}

async function checkApi(
	service: keyof typeof ALL_SERVICES,
	testData: TestData,
	searchType?: SearchType,
): Promise<ApiResponse> {
	const startTime = Date.now()

	try {
		const config = ALL_SERVICES[service]
		if (!config) throw new Error(`Service ${service} is not supported`)

		const effectiveSearchType = searchType || config.supportedSearchTypes[0]
		if (!config.supportedSearchTypes.includes(effectiveSearchType)) {
			return {
				status: false,
				responseTime: Date.now() - startTime,
				error: `Search type ${effectiveSearchType} not supported for ${config.name}`,
			}
		}

		const { url, options } = createRequestOptions(config, testData, effectiveSearchType)
		const response = await fetch(url, options)
		const responseTime = Date.now() - startTime

		if (!response.ok) {
			return {
				status: false,
				responseTime,
				error: `HTTP error ${response.status}`,
			}
		}

		const data = await response.json()
		const { isValid, errorMessage } = config.validateResponse(data)

		return {
			status: isValid,
			responseTime,
			error: isValid ? null : errorMessage || "Unknown error",
		}
	} catch (error) {
		return {
			status: false,
			responseTime: Date.now() - startTime,
			error: error instanceof Error ? error.message : "Request failed",
		}
	}
}

async function main() {
	console.log("Starting API health check...")
	const startTime = Date.now()
	const results: CheckResult[] = []

	for (const testData of TEST_DATA_SETS) {
		const testResults = await Promise.all(
			Object.keys(ALL_SERVICES).map(async (service) => {
				try {
					const result = await checkApi(service as keyof typeof ALL_SERVICES, testData)
					await updateApiStatus(service, result)
					return { service, ...result }
				} catch (error) {
					const errorResult = {
						service,
						status: false,
						error: String(error),
						responseTime: 0,
					}
					await updateApiStatus(service, errorResult)
					return errorResult
				}
			}),
		)
		results.push(...testResults)
	}

	const totalTime = Date.now() - startTime
	const successful = results.filter((r) => r.status).length
	const failed = results.length - successful

	const aggregatedResults = Object.keys(ALL_SERVICES).map((service) => {
		const serviceResults = results.filter((r) => r.service === service)
		const status = serviceResults.some((r) => r.status)
		const avgResponseTime = serviceResults.reduce((sum, r) => sum + r.responseTime, 0) / serviceResults.length
		const error = status ? null : serviceResults[0]?.error || "Unknown error"

		return {
			service,
			status,
			responseTime: Math.round(avgResponseTime),
			error,
		}
	})

	console.log({
		event: "health_check_completed",
		totalTime: `${totalTime}ms`,
		successful,
		failed,
		testsPerService: TEST_DATA_SETS.length,
	})

	console.table(
		aggregatedResults
			.sort((a, b) => (a.status === b.status ? a.responseTime - b.responseTime : b.status ? 1 : -1))
			.map(({ service, status, responseTime, error }) => ({
				Service: ALL_SERVICES[service].name,
				Status: status ? "✅" : "❌",
				Time: `${responseTime}ms`,
				Error: error || "",
			})),
		["Service", "Status", "Time", "Error"],
	)
}

main().catch((error) => {
	console.error("Health check failed:", error)
	process.exit(1)
})
