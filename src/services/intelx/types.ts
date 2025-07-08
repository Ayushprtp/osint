interface IntelXClientOptions {
	key: string
}

interface SearchParams {
	term: string
	maxresults?: number
	timeout?: number
	datefrom?: string
	dateto?: string
	sort?: number
	media?: number
	buckets?: string | string[]
	terminate?: string[]
}

interface SearchResult {
	records: unknown[]
	total: number
}

interface DownloadResult {
	content: string | null
	record: Record<string, unknown> | null
	name: string | null
}

interface IdentitySearchParams {
	term: string
	maxresults?: number
	buckets?: string
	timeout?: number
	datefrom?: string
	dateto?: string
	terminate?: string[]
	analyze?: boolean
	skipInvalid?: boolean
}

interface ExportAccountsParams {
	term: string
	maxresults?: number
	buckets?: string
	datefrom?: string | null
	dateto?: string | null
	terminate?: string[] | null
}

export type {
	IntelXClientOptions,
	SearchParams,
	SearchResult,
	DownloadResult,
	IdentitySearchParams,
	ExportAccountsParams,
}
