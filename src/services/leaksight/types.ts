interface TokenStatusResponse {
	token: string
	is_valid: boolean
	is_expired: boolean
	is_revoked: boolean
	is_admin: boolean
	created_at: string
	expires_at: string
	queries_used: string[]
}

interface UsernameResponse {
	time: string
	stealer_json: any[]
	database_url: any[]
	bigcomboCombolist: any[]
}

interface UrlCredential {
	host: string
	path: string
	user: string
	pass: string
}

interface UrlResponse {
	total: number
	sucess: UrlCredential[]
}

interface IpResponse {
	[key: string]: any
}

interface HwidResponse {
	[key: string]: any
}

interface SubdomainsResponse {
	[key: string]: any
}

interface ProxyDetectResponse {
	[key: string]: any
}

interface PortScanResponse {
	[key: string]: any
}

interface ErrorResponse {
	error: string
	status: number
}

export type {
	TokenStatusResponse,
	UsernameResponse,
	UrlResponse,
	UrlCredential,
	IpResponse,
	HwidResponse,
	SubdomainsResponse,
	ProxyDetectResponse,
	PortScanResponse,
	ErrorResponse,
}
