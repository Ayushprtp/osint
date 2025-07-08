/**
 * A record of common HTML entities and their corresponding characters.
 */
const HTML_ENTITIES: Record<string, string> = {
	"&quot;": '"',
	"&amp;": "&",
	"&apos;": "'",
	"&lt;": "<",
	"&gt;": ">",
	"&nbsp;": " ",
	"&iexcl;": "¡",
	"&cent;": "¢",
	"&pound;": "£",
	"&euro;": "€",
	"&copy;": "©",
	"&reg;": "®",
}

/**
 * Pluralizes a word based on a count.
 *
 * @param {string} word - The singular form of the word.
 * @param {number} count - The count to determine pluralization.
 * @param {string} [suffix='s'] - Optional custom suffix for pluralization.
 * @returns {string} The word, pluralized if necessary.
 *
 * @example
 * pluralize('cat', 1);
 * pluralize('dog', 2);
 * pluralize('child', 3, 'ren');
 */
export const pluralize = (word: string, count: number, suffix = "s"): string => (count > 1 ? `${word}${suffix}` : word)

/**
 * Decodes HTML entities in a string.
 *
 * @param {string} str - The string containing HTML entities.
 * @returns {string} The decoded string.
 *
 * @example
 * decodeHtmlEntities("&lt;div&gt;Hello &amp; welcome&lt;/div&gt;");
 *
 */
export const decodeHtmlEntities = (str: string): string =>
	str.replace(/&[a-z]+;|&#\d+;/gi, (entity) => {
		if (entity.charAt(1) === "#") {
			return String.fromCharCode(Number.parseInt(entity.slice(2, -1), 10))
		}
		return HTML_ENTITIES[entity] || entity
	})

/**
 * Removes content within brackets (square or round) from a string.
 *
 * @param {string} str - The input string.
 * @returns {string} The string with bracket content removed.
 *
 * @example
 * removeBracketContent("Hello (world) [example]");
 *
 */
export const removeBracketContent = (str: string): string => str.replace(/$$[^()]*$$|\[[^[\]]*]/g, "").trim()

export const OSINTDOG_API_URL = "https://osintdog.com/search/api/search"
export const OSINTDOG_SEARCH_TYPES = ["email", "username", "phone", "ip", "domain"] as const
export const LEAKCHECK_API_URL = "https://leakcheck.io/api/v2"
export const LEAKCHECK_VALID_SEARCH_TYPES = [
	"auto",
	"email",
	"domain",
	"keyword",
	"username",
	"phone",
	"hash",
	"phash",
] as const
export const LEAKOSINT_API_URL = "https://leakosintapi.com/"
export const OSINT_INDUSTRIES_API_URL = "https://api.intelfetch.net/osintindustries"
export const OSINT_INDUSTRIES_VALID_SEARCH_TYPES = ["email", "username", "phone"] as const
export const OSINT_INDUSTRIES_VALID_EXPORT_FORMATS = ["json", "csv", "pdf"] as const
export const OSINT_INDUSTRIES_CREDITS_URL = "https://api.osint.industries/misc/credits"
export const SNUSBASE_VALID_SEARCH_TYPES = [
	"hash",
	"email",
	"username",
	"lastip",
	"password",
	"name",
	"_domain",
] as const
export const TGSCAN_SEARCH_API_URL = "https://api.tgdev.io/tgscan/v1/search"
export const TGSCAN_CREDITS_API_URL = "https://api.tgdev.io/tgscan/v1/balance"
export const OSINTCAT_API_URL = "https://osintcat.com/search"
export const OSINTCAT_SEARCH_TYPES = ["email", "username", "password", "phone", "domain", "ip_address", "hash"] as const
export const NPD_VALID_SEARCH_TYPES = [
	"phone1",
	"address",
	"county_name",
	"firstname",
	"middlename",
	"lastname",
	"city",
	"zip",
	"st",
	"ssn",
] as const
export const HACKCHECK_API_URL = "https://api.hackcheck.io/search"
export const HACKCHECK_VALID_SEARCH_TYPES = [
	"email",
	"password",
	"username",
	"full_name",
	"ip_address",
	"phone_number",
	"hash",
	"domain",
] as const
export const ULP_API_URL = "https://api.delict.xyz/search"
export const ULP_VALID_SEARCH_TYPES = ["domain"] as const
export const INF0SEC_API_URL = "https://inf0sec.top/api/v1/query"
export const INF0SEC_VALID_MODULES = ["leaks", "hlr", "username", "domain", "discord"] as const
export const NPD_SEARCH_URL = "https://vpn.cdn.how"
export const SHODAN_API_BASE_URL = "https://api.shodan.io"
export const SHODAN_SEARCH_FACETS = [
	"asn",
	"country",
	"isp",
	"org",
	"os",
	"port",
	"domain",
	"device",
	"service",
	"product",
	"version",
	"cloud",
	"vuln",
] as const
export const BREACHBASE_API_URL = "https://breachbase.com/api/search"
export const BREACHBASE_VALID_SEARCH_TYPES = ["email", "username", "ip", "phone", "name", "password"] as const

export type NpdSearchTypes = (typeof NPD_VALID_SEARCH_TYPES)[number]

export type Inf0secModules = (typeof INF0SEC_VALID_MODULES)[number]

export type SnusbaseSearchTypes = (typeof SNUSBASE_VALID_SEARCH_TYPES)[number]

export type LeakCheckSearchTypes = (typeof LEAKCHECK_VALID_SEARCH_TYPES)[number]

export type osintalternativeExportFormat = (typeof OSINT_INDUSTRIES_VALID_EXPORT_FORMATS)[number]

export type BreachBaseSearchTypes = (typeof BREACHBASE_VALID_SEARCH_TYPES)[number]

export type UlpSearchTypes = (typeof ULP_VALID_SEARCH_TYPES)[number]
