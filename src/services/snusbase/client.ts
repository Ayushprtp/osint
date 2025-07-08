import { retryWithBackoff } from "@/lib/helpers"
import type { AuthResponse, SearchParams, SearchResponse, WhoisResponse, ErrorResponse, DatabaseStats } from "./types"
import type { HttpProxyAgent } from "http-proxy-agent"

interface RequestOptions {
	agent?: HttpProxyAgent<string>
}

interface EnhancedSearchParams extends SearchParams {
	wildcard?: boolean
}

class SnusbaseClient {
	private readonly apiKey: string
	private readonly baseUrl: string
	private readonly headers: HeadersInit

	constructor(apiKey: string) {
		this.apiKey = apiKey
		this.baseUrl = "https://api.snusbase.com"
		this.headers = {
			Auth: this.apiKey,
			"Content-Type": "application/json",
		}
	}

	private async request<T>(
		method: string,
		endpoint: string,
		params?: Record<string, string>,
		data?: unknown,
		options?: RequestOptions,
	): Promise<T> {
		const url = new URL(`${this.baseUrl}${endpoint}`)
		if (params) {
			for (const [key, value] of Object.entries(params)) {
				url.searchParams.append(key, value)
			}
		}

		const fetchOptions: RequestInit = {
			method,
			headers: this.headers,
			body: data ? JSON.stringify(data) : undefined,
		}

		return retryWithBackoff(async () => {
			const response = await fetch(url.toString(), fetchOptions)
			if (!response.ok) {
				const errorData: ErrorResponse = await response.json()
				throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
			}
			return response.json()
		})
	}

	async authenticate(): Promise<AuthResponse> {
		return this.request<AuthResponse>("GET", "/auth")
	}

	async search(params: EnhancedSearchParams, options?: RequestOptions): Promise<SearchResponse> {
		return this.request<SearchResponse>("POST", "/data/search", undefined, params, options)
	}

	async hashLookup(hash: string, options?: RequestOptions): Promise<SearchResponse> {
		return this.search({ terms: [hash], type: "hash" }, options)
	}

	async ipLookup(ip: string, options?: RequestOptions): Promise<WhoisResponse> {
		return this.request<WhoisResponse>("POST", "/tools/ip-whois", undefined, { terms: [ip] }, options)
	}

	async searchByType(
		term: string,
		type: "hash" | "email" | "username" | "lastip" | "password" | "name" | "_domain",
		wildcard = false,
		options?: RequestOptions,
	): Promise<SearchResponse> {
		return this.search({ terms: [term], type, wildcard }, options)
	}

	async getDatabaseStats(options?: RequestOptions): Promise<DatabaseStats> {
		return this.request<DatabaseStats>("GET", "/data/stats", undefined, undefined, options)
	}
}

export default SnusbaseClient
