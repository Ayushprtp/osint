import { retryWithBackoff } from "@/lib/helpers"
import type { ShodanHostData, ShodanSearchResponse, ErrorResponse } from "./types"
import type { HttpProxyAgent } from "http-proxy-agent"

interface RequestOptions {
	agent?: HttpProxyAgent<string>
	minify?: boolean
	history?: boolean
}

class ShodanClient {
	private readonly apiKey: string
	private readonly baseUrl: string

	constructor(apiKey: string) {
		this.apiKey = apiKey
		this.baseUrl = "https://api.shodan.io"
	}

	private async request<T>(method: string, endpoint: string, options?: RequestOptions): Promise<T> {
		const url = new URL(`${this.baseUrl}${endpoint}`)

		url.searchParams.append("key", this.apiKey)

		if (options?.minify !== undefined) {
			url.searchParams.append("minify", options.minify.toString())
		}

		if (options?.history !== undefined) {
			url.searchParams.append("history", options.history.toString())
		}

		const fetchOptions: RequestInit = {
			method,
			headers: {
				"Content-Type": "application/json",
			},
		}

		return retryWithBackoff(
			async () => {
				const response = await fetch(url.toString(), fetchOptions)
				if (!response.ok) {
					const errorData: ErrorResponse = await response.json().catch(() => ({}))
					throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
				}
				return response.json()
			},
			{
				maxRetries: 3,
				baseDelay: 1000,
			},
		)
	}

	async getHostInfo(ip: string, options?: RequestOptions): Promise<ShodanHostData> {
		return this.request<ShodanHostData>("GET", `/shodan/host/${ip}`, options)
	}

	async searchHosts(
		query: string,
		options?: RequestOptions & {
			facets?: string
			page?: number
		},
	): Promise<ShodanSearchResponse> {
		const url = new URL(`${this.baseUrl}/shodan/host/search`)

		url.searchParams.append("key", this.apiKey)
		url.searchParams.append("query", query)

		if (options?.minify !== undefined) {
			url.searchParams.append("minify", options.minify.toString())
		}

		if (options?.facets) {
			url.searchParams.append("facets", options.facets)
		}

		if (options?.page) {
			url.searchParams.append("page", options.page.toString())
		}

		const fetchOptions: RequestInit = {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		}

		return retryWithBackoff(
			async () => {
				const response = await fetch(url.toString(), fetchOptions)
				if (!response.ok) {
					const errorData: ErrorResponse = await response.json().catch(() => ({}))
					throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
				}
				return response.json()
			},
			{
				maxRetries: 3,
				baseDelay: 1000,
			},
		)
	}

	async getHostCount(
		query: string,
		options?: RequestOptions & {
			facets?: string
		},
	): Promise<ShodanSearchResponse> {
		const url = new URL(`${this.baseUrl}/shodan/host/count`)

		url.searchParams.append("key", this.apiKey)
		url.searchParams.append("query", query)

		if (options?.facets) {
			url.searchParams.append("facets", options.facets)
		}

		const fetchOptions: RequestInit = {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		}

		return retryWithBackoff(
			async () => {
				const response = await fetch(url.toString(), fetchOptions)
				if (!response.ok) {
					const errorData: ErrorResponse = await response.json().catch(() => ({}))
					throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
				}
				return response.json()
			},
			{
				maxRetries: 3,
				baseDelay: 1000,
			},
		)
	}
}

export default ShodanClient
