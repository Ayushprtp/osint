export interface SkipTracerSearchParams {
	firstName?: string
	lastName?: string
	middleName?: string
	street?: string
	city?: string
	state?: string
	zip?: string
}

export interface AddressHistoryItem {
	address: string
	dates: string
}

export interface SkipTracerSearchResult {
	Name: string
	Emails: string[]
	Relatives: string[]
	Associates: string[]
	Indicators: string[]
	AddressHistory: AddressHistoryItem[]
	PhoneSearch: string[]
}

export interface SkipTracerResponse {
	success: boolean
	data: SkipTracerSearchResult[]
	error?: string
}
