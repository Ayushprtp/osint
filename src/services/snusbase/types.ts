interface AuthResponse {
	success: boolean
	message?: string
	token?: string
}

interface SearchParams {
	terms: string[]
	type?: "email" | "username" | "lastip" | "password" | "hash" | "name" | "_domain"
	tables?: string[]
	group_by?: string | boolean
	wildcard?: boolean
}

interface SearchResult {
	[key: string]: string | undefined
}

interface SearchResponse {
	took: number
	size: number
	results: SearchResult[]
	errors?: string[]
}

interface DatabaseStats {
	total_entries: number
	total_databases: number
	latest_addition: string
	last_updated: string
}

interface WhoisResponse {
	took: number
	size: number
	results: {
		[ip: string]: {
			as: string
			asname: string
			city: string
			continent: string
			continentCode: string
			country: string
			countryCode: string
			hosting: boolean
			isp: string
			lat: number
			lon: number
			mobile: boolean
			org: string
			proxy: boolean
			region: string
			regionName: string
			status: string
			timezone: string
		}
	}
	errors: Record<string, unknown>
}

interface ErrorResponse {
	success: false
	error: string
	code: number
}

interface RateLimitInfo {
	limit: number
	remaining: number
	reset: number
}

export type {
	AuthResponse,
	SearchParams,
	SearchResult,
	SearchResponse,
	DatabaseStats,
	WhoisResponse,
	ErrorResponse,
	RateLimitInfo,
}
