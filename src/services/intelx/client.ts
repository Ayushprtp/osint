import { decodeHtmlEntities } from "@/lib/text"
import type {
	IntelXClientOptions,
	SearchParams,
	SearchResult,
	IdentitySearchParams,
	ExportAccountsParams,
} from "./types"

interface FileViewParams {
	ctype: number
	mediatype: number
	sid: string
	bucket?: string
	escape?: number
}

export type DownloadResult = {
	content: string | null
	name: string | null
}

class IntelXClient {
	private readonly key: string
	private readonly identityUrl: string
	private readonly apiRoot: string
	private readonly apiRateLimit: number = 1000
	private readonly headers: Record<string, string>

	/**
	 * Creates a new instance of IntelXClient.
	 * @param {IntelXClientOptions} param0 - Configuration options, including the API key.
	 */
	constructor({ key }: IntelXClientOptions) {
		this.key = key
		this.identityUrl = "http://135.181.78.92"
		this.apiRoot = "http://135.181.78.92"
		this.headers = {
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0",
			Accept: "*/*",
			"Accept-Language": "en-US,en;q=0.5",
			"Accept-Encoding": "gzip, deflate, br, zstd",
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
			Origin: "https://intelx.io",
			Connection: "keep-alive",
			Referer: "https://intelx.io/",
			"Sec-Fetch-Dest": "empty",
			"Sec-Fetch-Mode": "cors",
			"Sec-Fetch-Site": "same-site",
			Priority: "u=0",
			"x-key": this.key,
		}
	}

	/**
	 * Performs a fetch request with default headers and returns the typed response.
	 * @template T
	 * @param {string} url - The URL to request.
	 * @param {RequestInit} [options={}] - Fetch options.
	 * @param {boolean} [isString=false] - If true, returns the body as a string; if false, as JSON.
	 * @returns {Promise<T>} The typed response.
	 * @private
	 */
	private async fetchWithHeaders<T>(url: string, options: RequestInit = {}, isString = false): Promise<T> {
		const headers = {
			...this.headers,
			"Content-Type": options.method === "POST" ? "application/json" : this.headers["Content-Type"],
			...options.headers,
		}
		const response = await fetch(url, { ...options, headers })
		if (!response.ok && response.status !== 204) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}
		if (response.status === 204) {
			return null as T
		}
		const data = isString ? await response.text() : await response.json()
		return data as T
	}

	/**
	 * Performs an identity search in IntelX.
	 * @param {IdentitySearchParams} params - Search parameters.
	 * @returns {Promise<SearchResult>} Search results.
	 */
	async idSearch(params: IdentitySearchParams): Promise<SearchResult> {
		const { term } = params
		const newSearchParams = new URLSearchParams({
			searchterm: term,
		})
		const response = await this.fetchWithHeaders<{ records: unknown[] }>(
			`${this.identityUrl}/intelxtoplu.php?${newSearchParams}`,
			{ method: "GET" },
		)
		const records = response.records || []
		return { records: records, total: records.length }
	}

	/**
	 * Exports accounts from IntelX based on the given parameters.
	 * @param {ExportAccountsParams} params - Export parameters.
	 * @returns {Promise<SearchResult>} Export results.
	 */
	async exportAccounts(params: ExportAccountsParams): Promise<SearchResult> {
		const { term, maxresults = 10, buckets = "", datefrom = "", dateto = "" } = params
		const newSearchParamsObject: Record<string, string> = {
			searchterm: term,
			limit: maxresults.toString(),
		}
		if (buckets) {
			newSearchParamsObject.bucket = buckets
		}
		if (datefrom !== null && datefrom !== undefined) newSearchParamsObject.datefrom = datefrom
		if (dateto !== null && dateto !== undefined) newSearchParamsObject.dateto = dateto
		const newSearchParams = new URLSearchParams(newSearchParamsObject)
		const response = await this.fetchWithHeaders<{ records: unknown[]; total?: number }>(
			`${this.identityUrl}/intelxtoplu.php?${newSearchParams}`,
			{ method: "GET" },
		)
		const records = response.records || []
		return { records: records, total: response.total ?? records.length }
	}

	/**
	 * Views the content of a file in IntelX.
	 * @param {FileViewParams} params - Parameters for viewing the file.
	 * @returns {Promise<string>} File content as a string.
	 */
	async fileView(params: FileViewParams): Promise<string> {
		const { ctype, mediatype, sid, bucket = "", escape = 0 } = params
		const formatMap: Record<number, number> = {
			23: 7,
			9: 7,
			15: 6,
			16: 8,
			18: 10,
			25: 11,
			17: 9,
		}
		const format = ctype === 1 ? 0 : formatMap[mediatype] || 1
		await new Promise((resolve) => setTimeout(resolve, this.apiRateLimit))
		const newFileViewParams = new URLSearchParams({
			id: sid,
			f: format.toString(),
			bucket: bucket,
			escape: escape.toString(),
			k: this.key,
			license: "enterprise",
		})
		const url = `${this.apiRoot}/intelx?${newFileViewParams}`
		const response = await fetch(url, {
			method: "GET",
			headers: {
				"User-Agent": this.headers["User-Agent"],
				Accept: this.headers.Accept,
				"Accept-Language": this.headers["Accept-Language"],
				"Accept-Encoding": this.headers["Accept-Encoding"],
				Origin: this.headers.Origin,
				Connection: this.headers.Connection,
				Referer: this.headers.Referer,
				"Sec-Fetch-Dest": this.headers["Sec-Fetch-Dest"],
				"Sec-Fetch-Mode": this.headers["Sec-Fetch-Mode"],
				"Sec-Fetch-Site": this.headers["Sec-Fetch-Site"],
			},
		})
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`)
		}
		const responseText = await response.text()
		return responseText
	}

	/**
	 * Downloads the content of a file by its ID from IntelX.
	 * @param {string} id - The file identifier to download.
	 * @returns {Promise<DownloadResult>} Download result, including content and name.
	 */
	async download(id: string): Promise<DownloadResult> {
		const url = `${this.apiRoot}/allahben.php?authkey=SayLog&id=${encodeURIComponent(id)}`
		try {
			const content = await this.fetchWithHeaders<string>(url, { method: "GET" }, true)
			if (typeof content === "string" && content.trim() === "<pre>Content could not be retrieved</pre>") {
				return { content: null, name: null }
			}
			if (!content) {
				return { content: null, name: null }
			}
			return {
				content: decodeHtmlEntities(content),
				name: `${id}.txt`,
			}
		} catch (error) {
			console.error(`Error downloading file with id ${id}:`, error)
			return { content: null, name: null }
		}
	}

	/**
	 * Performs a general search in IntelX.
	 * @param {SearchParams} params - Search parameters.
	 * @returns {Promise<SearchResult>} Search results.
	 */
	async search(params: SearchParams): Promise<SearchResult> {
		const { term, maxresults = 10, timeout = 5, datefrom, dateto, sort = 4, media = 0 } = params
		const searchResponse = await this.fetchWithHeaders<{ id: string }>(`${this.apiRoot}/intelligent/search`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				term,
				buckets: [],
				lookuplevel: 0,
				maxresults,
				timeout,
				datefrom,
				dateto,
				sort,
				media,
				terminate: [],
			}),
		})
		const results = await this.fetchWithHeaders<{ records: unknown[] }>(
			`${this.apiRoot}/intelligent/search/result?id=${searchResponse.id}&limit=${maxresults}`,
		)
		return {
			records: results.records || [],
			total: results.records ? results.records.length : 0,
		}
	}
}

export default IntelXClient
