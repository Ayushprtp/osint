import { retryWithBackoff } from "@/lib/helpers"
import type {
	TokenStatusResponse,
	UsernameResponse,
	UrlResponse,
	IpResponse,
	HwidResponse,
	SubdomainsResponse,
	ProxyDetectResponse,
	PortScanResponse,
	ErrorResponse,
} from "./types"

class LeakSightClient {
	private readonly token: string
	private readonly baseUrl: string

	constructor(token: string) {
		this.token = token
		this.baseUrl = "https://api.unileverbelgium.com"
	}

	private async request<T>(endpoint: string, query?: string): Promise<T> {
		const url = new URL(`${this.baseUrl}${endpoint}`)
		url.searchParams.append("token", this.token)

		if (query) {
			url.searchParams.append("text", query)
		}

		return retryWithBackoff(async () => {
			const response = await fetch(url.toString(), {
				headers: {
					"User-Agent":
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
					Accept: "*/*",
					Referer: "https://unileverbelgium.com/good/find.html",
				},
			})

			if (response.status === 404) {
				throw new Error("API endpoint not found or token is invalid")
			}

			if (!response.ok) {
				const errorData: ErrorResponse = await response.json().catch(() => ({
					error: `HTTP error! status: ${response.status}`,
					status: response.status,
				}))

				throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
			}

			return response.json()
		})
	}

	async checkToken(): Promise<TokenStatusResponse> {
		return this.request<TokenStatusResponse>(`/token/${this.token}`)
	}

	async searchUsername(username: string): Promise<UsernameResponse> {
		return this.request<UsernameResponse>("/osint/username", username)
	}

	async searchUrl(url: string): Promise<UrlResponse> {
		return this.request<UrlResponse>("/osint/url", url)
	}

	async searchUrl2(url: string): Promise<any> {
		return this.request<any>("/osint/url2", url)
	}

	async searchUrlAllDatabases(url: string): Promise<any> {
		return this.request<any>("/osint/search_url_all_database", url)
	}

	async searchUrlCombined(url: string): Promise<any> {
		try {
			const [urlResult, url2Result, urlAllResult] = await Promise.allSettled([
				this.searchUrl(url),
				this.searchUrl2(url),
				this.searchUrlAllDatabases(url),
			])

			return {
				url: urlResult.status === "fulfilled" ? urlResult.value : null,
				url2: url2Result.status === "fulfilled" ? url2Result.value : null,
				urlAll: urlAllResult.status === "fulfilled" ? urlAllResult.value : null,
			}
		} catch (error) {
			console.error("Error in combined URL search:", error)
			throw error
		}
	}

	async searchIp(ip: string): Promise<IpResponse> {
		return this.request<IpResponse>("/osint/ip", ip)
	}

	async searchHwid(hwid: string): Promise<HwidResponse> {
		return this.request<HwidResponse>("/osint/hwid", hwid)
	}

	async scanSubdomainsForLeaks(domain: string): Promise<any> {
		return this.request<any>("/osint/subdomainsearch", domain)
	}

	async getSubdomains(domain: string): Promise<SubdomainsResponse> {
		return this.request<SubdomainsResponse>("/osint/subdmains", domain)
	}

	async detectProxy(ip: string): Promise<ProxyDetectResponse> {
		return this.request<ProxyDetectResponse>("/osint/proxydetect", ip)
	}

	async scanPorts(ip: string): Promise<PortScanResponse> {
		return this.request<PortScanResponse>("/osint/portscam", ip)
	}
}

export default LeakSightClient
