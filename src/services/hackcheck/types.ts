import type { HACKCHECK_VALID_SEARCH_TYPES } from "@/lib/text"

export type HackCheckSearchType = (typeof HACKCHECK_VALID_SEARCH_TYPES)[number]

export interface HackCheckSearchParams {
	query: string
	searchType: HackCheckSearchType
}

export interface HackCheckSearchResult {
	[key: string]: string | number | boolean
}

export interface HackCheckApiResponse {
	data: {
		[database: string]: HackCheckSearchResult[]
	}
}

export interface HackCheckSearchResponse {
	success: boolean
	data: HackCheckApiResponse
}
