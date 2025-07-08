import { retryWithBackoff } from "@/lib/helpers"
import type { CallerAPIResponse, ErrorResponse } from "./types"
import type { HttpProxyAgent } from "http-proxy-agent"

interface RequestOptions {
	agent?: HttpProxyAgent<string>
}

class CallerAPIClient {
	private readonly apiKey: string
	private readonly baseUrl: string
	private readonly headers: HeadersInit

	constructor(apiKey: string) {
		this.apiKey = apiKey
		this.baseUrl = "https://callerapi.com/api"
		this.headers = {
			"X-Auth": this.apiKey,
			"Content-Type": "application/json",
		}
	}

	private async request<T>(method: string, endpoint: string, options?: RequestOptions): Promise<T> {
		const url = new URL(`${this.baseUrl}${endpoint}`)

		const fetchOptions: RequestInit = {
			method,
			headers: this.headers,
		}

		return retryWithBackoff(
			async () => {
				const response = await fetch(url.toString(), fetchOptions)
				if (!response.ok) {
					const errorData: ErrorResponse = await response.json()
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

	async getPhoneInfo(phone: string, options?: RequestOptions): Promise<CallerAPIResponse> {
		const digitsOnly = phone.replace(/[^\d]/g, "")

		if (phone.startsWith("+")) {
			return this.request<CallerAPIResponse>("GET", `/phone/info/${phone}`, options)
		}
		if (digitsOnly.startsWith("1") && digitsOnly.length === 11) {
			return this.request<CallerAPIResponse>("GET", `/phone/info/${digitsOnly}`, options)
		}

		return this.request<CallerAPIResponse>("GET", `/phone/info/${digitsOnly}`, options)
	}
}

export default CallerAPIClient
