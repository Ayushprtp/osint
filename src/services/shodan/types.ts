export interface ShodanHostData {
	region_code: string | null
	ip: number
	postal_code: string | null
	country_code: string
	city: string | null
	dma_code: number | null
	last_update: string
	latitude: number
	tags: string[]
	area_code: number | null
	country_name: string
	hostnames: string[]
	org: string
	data: ShodanServiceData[]
	asn: string
	isp: string
	longitude: number
	country_code3: string | null
	domains: string[]
	ip_str: string
	os: string | null
	ports: number[]
}

export interface ShodanServiceData {
	_shodan: {
		id: string
		options: Record<string, any>
		ptr: boolean
		module: string
		crawler: string
	}
	hash: number
	os: string | null
	opts: Record<string, any>
	ip: number
	isp: string
	port: number
	hostnames: string[]
	location: {
		city: string | null
		region_code: string | null
		area_code: number | null
		longitude: number
		country_code3: string | null
		country_name: string
		postal_code: string | null
		dma_code: number | null
		country_code: string
		latitude: number
	}
	dns?: {
		resolver_hostname: string | null
		recursive: boolean
		resolver_id: string | null
		software: string | null
	}
	timestamp: string
	domains: string[]
	org: string
	data: string
	asn: string
	transport: string
	ip_str: string
}

export interface ShodanSearchResponse {
	matches: any[]
	facets: Record<string, Array<{ count: number; value: string }>>
	total: number
}

export interface ErrorResponse {
	error?: string
}
