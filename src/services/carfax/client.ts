import { retryWithBackoff } from "@/lib/helpers"
import type { CarfaxVehicleBase, CarfaxVehicleResponse, CarfaxVehicleHistoryResponse, ErrorResponse } from "./types"
import type { HttpProxyAgent } from "http-proxy-agent"

interface RequestOptions {
	agent?: HttpProxyAgent<string>
}

class CarfaxClient {
	private readonly apiKey: string
	private readonly baseUrl: string
	private readonly headers: HeadersInit

	constructor(apiKey: string, baseUrl?: string) {
		this.apiKey = apiKey
		this.baseUrl = baseUrl || process.env.CARFAX_API_URL || "http://localhost:5000/api"
		this.headers = {
			"X-API-Key": this.apiKey,
			"Content-Type": "application/json",
		}
	}

	private async request<T>(method: string, endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
		const url = new URL(`${this.baseUrl}${endpoint}`)

		const fetchOptions: RequestInit = {
			method,
			headers: this.headers,
		}

		if (body) {
			fetchOptions.body = JSON.stringify(body)
		}

		return retryWithBackoff(
			async () => {
				const response = await fetch(url.toString(), fetchOptions)

				if (!response.ok) {
					const errorData: ErrorResponse = await response.json()
					throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
				}

				return response.json()
			},
			{
				maxRetries: 3,
				baseDelay: 1000,
			},
		)
	}

	async lookupByPlate(plate: string, state: string, options?: RequestOptions): Promise<CarfaxVehicleBase[]> {
		const response = await this.request<CarfaxVehicleResponse>("POST", "/lookup/plate", { plate, state }, options)

		return response.vehicles || []
	}

	async getVehicleHistory(vin: string, options?: RequestOptions): Promise<CarfaxVehicleHistoryResponse> {
		return this.request<CarfaxVehicleHistoryResponse>("POST", "/vehicle/history", { vin }, options)
	}

	async lookupPlateWithHistory(
		plate: string,
		state: string,
		options?: RequestOptions,
	): Promise<CarfaxVehicleHistoryResponse | null> {
		try {
			const vehicles = await this.lookupByPlate(plate, state, options)

			if (!vehicles.length || !vehicles[0].vin) {
				return null
			}

			const vin = vehicles[0].vin

			return await this.getVehicleHistory(vin, options)
		} catch (error) {
			console.error("Error in lookupPlateWithHistory:", error)
			throw error
		}
	}

	async lookupByPartialPlate(plate: string, state: string, options?: RequestOptions): Promise<CarfaxVehicleBase[]> {
		const response = await this.request<CarfaxVehicleResponse>(
			"POST",
			"/lookup/partial-plate",
			{ plate, state },
			options,
		)

		return response.vehicles || []
	}

	async healthCheck(): Promise<{ status: string; message: string }> {
		return this.request<{ status: string; message: string }>("GET", "/health", undefined)
	}
}

export default CarfaxClient
