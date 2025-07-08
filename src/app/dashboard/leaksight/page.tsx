"use client"

import { useState, useCallback, useMemo } from "react"
import {
	Search,
	Database,
	ChevronLeft,
	ChevronRight,
	ArrowLeft,
	AlertTriangle,
	Loader2,
	FileText,
	AtSign,
	Globe,
	Wifi,
	Server,
	Shield,
	Fingerprint,
	Eye,
	Copy,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type SearchParams = {
	query: string
	searchType: "username" | "url" | "ip" | "hwid" | "subdomains" | "subdomainScan" | "proxyDetect" | "portScan"
}

const ITEMS_PER_PAGE = 10

const searchTypes = [
	{ value: "url", label: "URL", icon: <Globe className="h-4 w-4" /> },
	{ value: "username", label: "Username/Email", icon: <AtSign className="h-4 w-4" /> },
	{ value: "ip", label: "IP Address", icon: <Wifi className="h-4 w-4" /> },
	{ value: "hwid", label: "HWID", icon: <Fingerprint className="h-4 w-4" /> },
	{ value: "subdomains", label: "Subdomains", icon: <Globe className="h-4 w-4" /> },
	{ value: "subdomainScan", label: "Subdomain Scan", icon: <Eye className="h-4 w-4" /> },
	{ value: "proxyDetect", label: "Proxy Detection", icon: <Shield className="h-4 w-4" /> },
	{ value: "portScan", label: "Port Scan", icon: <Server className="h-4 w-4" /> },
]

export default function LeakSight() {
	const [isSearching, setIsSearching] = useState(false)
	const [searchType, setSearchType] = useState<SearchParams["searchType"]>("url")
	const [query, setQuery] = useState("")
	const [searchResults, setSearchResults] = useState<any>(null)
	const [error, setError] = useState<string | null>(null)
	const [currentPage, setCurrentPage] = useState(1)
	const [resultSearch, setResultSearch] = useState("")

	const parseCredential = (buffer: string) => {
		const cleanBuffer = buffer.replace(/^https?:\/\//, "")

		let parts: string[] = []
		if (cleanBuffer.includes(":")) {
			parts = cleanBuffer.split(":")
		} else if (cleanBuffer.includes(";")) {
			parts = cleanBuffer.split(";")
		} else {
			return { domain: cleanBuffer, username: "", password: "" }
		}

		let domain = parts[0]
		let path = ""

		if (domain.includes("/")) {
			const domainParts = domain.split("/")
			domain = domainParts[0]
			path = `/${domainParts.slice(1).join("/")}`
		}

		return {
			domain,
			path,
			username: parts.length > 1 ? parts[1] : "",
			password: parts.length > 2 ? parts[2] : "",
		}
	}

	const handleSearch = useCallback(async () => {
		if (!query.trim()) {
			setError("Please enter a search query")
			return
		}
		setIsSearching(true)
		setError(null)
		setSearchResults(null)

		try {
			const res = await fetch("/api/leaksight", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ query, searchType }),
			})

			if (!res.ok) {
				const errorData = await res.json()

				if (res.status === 403 && errorData?.error?.includes("subscription")) {
					throw new Error("SUBSCRIPTION_REQUIRED")
				}

				throw new Error(errorData?.error || "An error occurred during the search")
			}

			const data = await res.json()
			setSearchResults(data)
			setCurrentPage(1)
		} catch (err: unknown) {
			console.error("Error fetching data:", err)

			if (err instanceof Error) {
				if (err.message === "SUBSCRIPTION_REQUIRED") {
					setError("Active subscription required. Please purchase a subscription to continue using this service.")
				} else {
					setError(err.message || "An error occurred while fetching data. Please try again.")
				}
			} else {
				setError("An error occurred while fetching data. Please try again.")
			}
		} finally {
			setIsSearching(false)
		}
	}, [query, searchType])

	const downloadResults = useCallback(() => {
		if (!searchResults) return
		const blob = new Blob([JSON.stringify(searchResults.data, null, 2)], {
			type: "application/json",
		})
		const url = URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = url
		a.download = `leaksight-search-${searchType}-${query}.json`
		a.click()
	}, [searchResults, searchType, query])

	const copyToClipboard = (text: string) => {
		navigator.clipboard
			.writeText(text)
			.then(() => toast.success("Copied to clipboard"))
			.catch(() => toast.error("Failed to copy"))
	}

	const renderSearchForm = () => {
		return (
			<div className="flex w-full items-center space-x-2">
				<div className="relative flex-1">
					<Input
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder={`Enter ${searchTypes.find((st) => st.value === searchType)?.label}...`}
						className="pr-10"
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								handleSearch()
							}
						}}
					/>
					<Button
						className="absolute right-0 top-0 h-full rounded-l-none"
						onClick={handleSearch}
						disabled={isSearching}
					>
						{isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
					</Button>
				</div>
			</div>
		)
	}

	const getProcessedUrlResults = useMemo(() => {
		if (!searchResults?.data) return { bigDatabaseEntries: [], urlSearchEntries: [] }

		const data = searchResults.data
		let bigDatabaseEntries: any[] = []
		let urlSearchEntries: any[] = []

		if (data.url2) {
			if (data.url2.sucess && Array.isArray(data.url2.sucess)) {
				urlSearchEntries = [...urlSearchEntries, ...data.url2.sucess]
			} else if (data.url2.total && Array.isArray(data.url2.sucess)) {
				bigDatabaseEntries = [...bigDatabaseEntries, ...data.url2.sucess]
			} else if (data.url2.Message) {
				if (data.url2.Message.BIGDATABASE && Array.isArray(data.url2.Message.BIGDATABASE)) {
					bigDatabaseEntries = [...bigDatabaseEntries, ...data.url2.Message.BIGDATABASE]
				}
				if (data.url2.Message.URLSEARCH && Array.isArray(data.url2.Message.URLSEARCH)) {
					urlSearchEntries = [...urlSearchEntries, ...data.url2.Message.URLSEARCH]
				}
			}
		}

		if (data.urlAll?.Message) {
			if (data.urlAll.Message.BIGDATABASE && Array.isArray(data.urlAll.Message.BIGDATABASE)) {
				bigDatabaseEntries = [...bigDatabaseEntries, ...data.urlAll.Message.BIGDATABASE]
			}
			if (data.urlAll.Message.URLSEARCH && Array.isArray(data.urlAll.Message.URLSEARCH)) {
				urlSearchEntries = [...urlSearchEntries, ...data.urlAll.Message.URLSEARCH]
			}
		}

		if (data.url?.sucess && Array.isArray(data.url.sucess)) {
			urlSearchEntries = [...urlSearchEntries, ...data.url.sucess]
		}

		console.log("Processed results:", { bigDatabaseEntries, urlSearchEntries })
		return { bigDatabaseEntries, urlSearchEntries }
	}, [searchResults])

	const totalUrlResults = useMemo(() => {
		const { bigDatabaseEntries, urlSearchEntries } = getProcessedUrlResults
		return bigDatabaseEntries.length + urlSearchEntries.length
	}, [getProcessedUrlResults])

	const paginatedUrlResults = useMemo(() => {
		const { bigDatabaseEntries, urlSearchEntries } = getProcessedUrlResults

		const allResults = [
			...bigDatabaseEntries.map((entry) => ({ type: "bigdb", data: entry })),
			...urlSearchEntries.map((entry) => ({ type: "url", data: entry })),
		]

		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
		const endIndex = startIndex + ITEMS_PER_PAGE

		return allResults.slice(startIndex, endIndex)
	}, [getProcessedUrlResults, currentPage])

	const totalPages = useMemo(() => {
		return Math.ceil(totalUrlResults / ITEMS_PER_PAGE)
	}, [totalUrlResults])

	const renderDynamicTable = (
		data: any,
		options: {
			preferredKeys?: string[]
			ignoredKeys?: string[]
			keyMapping?: Record<string, string>
			maxDepth?: number
			valueFormatters?: Record<string, (val: any) => React.ReactNode>
			tableName?: string
			copyFormat?: (row: any) => string
			emptyMessage?: string
		} = {},
	) => {
		const {
			preferredKeys = [],
			ignoredKeys = [],
			keyMapping = {},
			maxDepth = 1,
			valueFormatters = {},
			tableName = "item",
			copyFormat,
			emptyMessage = "No data available",
		} = options

		if (!data || (Array.isArray(data) && data.length === 0)) {
			return (
				<Alert>
					<AlertTriangle className="h-5 w-5" />
					<AlertTitle>No results found</AlertTitle>
					<AlertDescription>{emptyMessage}</AlertDescription>
				</Alert>
			)
		}

		if (typeof data !== "object" || data === null) {
			return <div className="p-4">{String(data)}</div>
		}

		if (Array.isArray(data)) {
			const allKeys = new Set<string>()

			data.forEach((item) => {
				if (item && typeof item === "object") {
					Object.keys(item).forEach((key) => {
						if (!ignoredKeys.includes(key)) {
							allKeys.add(key)
						}
					})
				}
			})

			const sortedKeys = [
				...preferredKeys.filter((key) => allKeys.has(key)),
				...[...allKeys].filter((key) => !preferredKeys.includes(key)),
			]

			if (sortedKeys.length === 0) {
				return (
					<div className="space-y-4 max-h-[600px] overflow-y-auto border rounded-md p-4">
						<pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(data, null, 2)}</pre>
					</div>
				)
			}

			return (
				<Table>
					<TableHeader>
						<TableRow>
							{sortedKeys.map((key) => (
								<TableHead key={key}>{keyMapping[key] || key}</TableHead>
							))}
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.map((item, index) => (
							<TableRow key={`${tableName}-${index}`}>
								{sortedKeys.map((key) => {
									const value = item[key]

									let cellContent

									if (valueFormatters[key] && value !== undefined) {
										cellContent = valueFormatters[key](value)
									} else if (value === undefined || value === null) {
										cellContent = "-"
									} else if (typeof value === "object") {
										if (maxDepth > 0) {
											cellContent = renderDynamicTable(value, {
												...options,
												maxDepth: maxDepth - 1,
												tableName: `${tableName}-${key}-${index}`,
											})
										} else {
											cellContent = <span className="text-xs font-mono">{JSON.stringify(value)}</span>
										}
									} else if (["password", "pass", "secret", "token"].includes(key.toLowerCase())) {
										cellContent = (
											<span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">{String(value)}</span>
										)
									} else {
										cellContent = String(value)
									}

									return (
										<TableCell key={`${index}-${key}`} className={key === sortedKeys[0] ? "font-medium" : ""}>
											{cellContent}
										</TableCell>
									)
								})}
								<TableCell className="text-right">
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8"
													onClick={() => {
														let copyText = ""

														if (copyFormat) {
															copyText = copyFormat(item)
														} else if (typeof item === "object") {
															const user = item.username || item.user || item.email || ""
															const pass = item.password || item.pass || ""
															const url = item.url || item.URL || item.domain || item.host || ""

															if (user && pass) {
																copyText = url ? `${url}:${user}:${pass}` : `${user}:${pass}`
															} else {
																copyText = JSON.stringify(item)
															}
														} else {
															copyText = String(item)
														}

														copyToClipboard(copyText)
													}}
												>
													<Copy className="h-4 w-4" />
													<span className="sr-only">Copy</span>
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<p className="text-xs">Copy data</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)
		}

		return (
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Property</TableHead>
						<TableHead>Value</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{Object.entries(data)
						.filter(([key]) => !ignoredKeys.includes(key))

						.sort(([keyA], [keyB]) => {
							const indexA = preferredKeys.indexOf(keyA)
							const indexB = preferredKeys.indexOf(keyB)

							if (indexA !== -1 && indexB !== -1) return indexA - indexB

							if (indexA !== -1) return -1

							if (indexB !== -1) return 1

							return keyA.localeCompare(keyB)
						})
						.map(([key, value]) => {
							let valueContent

							if (valueFormatters[key] && value !== undefined) {
								valueContent = valueFormatters[key](value)
							} else if (Array.isArray(value) && maxDepth > 0) {
								valueContent = renderDynamicTable(value, {
									...options,
									maxDepth: maxDepth - 1,
									tableName: `${tableName}-${key}`,
								})
							} else if (typeof value === "object" && value !== null && maxDepth > 0) {
								valueContent = renderDynamicTable(value, {
									...options,
									maxDepth: maxDepth - 1,
									tableName: `${tableName}-${key}`,
								})
							} else if (value === undefined || value === null) {
								valueContent = "-"
							} else if (["password", "pass", "secret", "token"].includes(key.toLowerCase())) {
								valueContent = <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">{String(value)}</span>
							} else if (typeof value === "object") {
								valueContent = <span className="text-xs font-mono">{JSON.stringify(value)}</span>
							} else {
								valueContent = String(value)
							}

							return (
								<TableRow key={key}>
									<TableCell className="font-medium">{keyMapping[key] || key}</TableCell>
									<TableCell>{valueContent}</TableCell>
								</TableRow>
							)
						})}
				</TableBody>
			</Table>
		)
	}

	const tableConfigs = {
		url: {
			preferredKeys: ["domain", "host", "path", "username", "user", "password", "pass"],
			keyMapping: {
				domain: "Domain",
				host: "Host",
				path: "Path",
				username: "Username",
				user: "Username",
				password: "Password",
				pass: "Password",
			},
			copyFormat: (item: any) => {
				if (item.host && item.user && item.pass) {
					return `${item.host}:${item.user}:${item.pass}`
				}
				if (item.domain && item.username && item.password) {
					return `${item.domain}:${item.username}:${item.password}`
				}
				if (item.buffer) {
					const cred = parseCredential(item.buffer)
					return `${cred.domain}:${cred.username}:${cred.password}`
				}
				return JSON.stringify(item)
			},
			emptyMessage: "No leaked credentials were found for this URL.",
		},
		stealer: {
			preferredKeys: ["url", "URL", "username", "user", "email", "password", "pass", "source", "database"],
			emptyMessage: "No stealer data was found for this username/email.",
		},
		database: {
			preferredKeys: ["url", "link", "source", "database"],
			emptyMessage: "No database URLs were found for this username/email.",
		},
		combo: {
			preferredKeys: ["username", "user", "email", "password", "pass", "source", "database"],
			emptyMessage: "No combo lists were found for this username/email.",
		},
		ip: {
			preferredKeys: ["ip", "country", "countryCode", "region", "regionName", "city", "zip", "isp", "org", "as"],
			keyMapping: {
				ip: "IP Address",
				countryCode: "Country Code",
				regionName: "Region Name",
				isp: "ISP",
				org: "Organization",
			},
			emptyMessage: "No IP information was found.",
		},
		subdomain: {
			preferredKeys: ["subdomain", "name", "host", "ip", "address"],
			keyMapping: {
				subdomain: "Subdomain",
				name: "Subdomain",
				host: "Subdomain",
				ip: "IP Address",
				address: "IP Address",
			},
			emptyMessage: "No subdomains were found for this domain.",
		},
		port: {
			preferredKeys: ["port", "number", "protocol", "service", "name", "state"],
			keyMapping: {
				port: "Port",
				number: "Port",
				service: "Service",
				name: "Service",
				state: "State",
			},
			emptyMessage: "No open ports were found for this host.",
		},
	}

	const processUsernameSearchResults = (data: any) => {
		if (!data) return { stealerData: null, databaseUrls: null, comboLists: null }

		const result = {
			stealerData: [] as any[],
			databaseUrls: data.database_url || [],
			comboLists: data.bigcomboCombolist || [],
		}

		if (data.stealer_json && data.stealer_json.length > 0) {
			result.stealerData = data.stealer_json.map((entry: any) => {
				const processedEntry: Record<string, any> = {}

				const userInfo = entry.Information || {}
				if (userInfo) {
					processedEntry.username = userInfo.Username || ""
					processedEntry.country = userInfo.Country || ""
					processedEntry.ip = userInfo.ip || ""
					processedEntry.hwid = userInfo.HWID || ""
					processedEntry.dateBreached = userInfo.DateBreach || ""
				}

				if (entry.Autofills) {
					if (typeof entry.Autofills === "string") {
						processedEntry.autofills = entry.Autofills.split("\n").filter(Boolean)
					} else {
						processedEntry.autofills = entry.Autofills
					}
				}

				if (entry.passwords && Array.isArray(entry.passwords)) {
					processedEntry.credentials = entry.passwords
				}

				processedEntry._raw = entry

				return processedEntry
			})
		}

		return result
	}

	const renderUsernameSearch = (data: any) => {
		if (!data) return null

		const processed = processUsernameSearchResults(data)

		return (
			<Tabs defaultValue="stealer" className="w-full">
				<TabsList className="w-full rounded-none border-b px-4">
					<TabsTrigger value="stealer">
						Stealer Data {processed.stealerData?.length ? `(${processed.stealerData.length})` : ""}
					</TabsTrigger>
					<TabsTrigger value="database">
						Database URLs {processed.databaseUrls?.length ? `(${processed.databaseUrls.length})` : ""}
					</TabsTrigger>
					<TabsTrigger value="combo">
						Combo Lists {processed.comboLists?.length ? `(${processed.comboLists.length})` : ""}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="stealer" className="p-4">
					<div className="space-y-4 max-h-[600px] overflow-y-auto">
						{processed.stealerData && processed.stealerData.length > 0 ? (
							processed.stealerData.map((entry, idx) => (
								<Card key={`stealer-entry-${idx}`} className="mb-6">
									<CardHeader className="pb-2">
										<CardTitle className="text-lg flex justify-between items-center">
											<span>
												{entry.username || `User #${idx + 1}`}
												{entry.country && (
													<Badge variant="outline" className="ml-2">
														{entry.country}
													</Badge>
												)}
											</span>
											<Badge variant="outline">Breached: {entry.dateBreached || "Unknown"}</Badge>
										</CardTitle>
									</CardHeader>
									<CardContent className="pb-4 pt-0">
										<div className="grid grid-cols-1 gap-6">
											{/* User Information */}
											{entry.Information && (
												<div>
													<h3 className="text-sm font-semibold mb-2">System Information</h3>
													<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
														{Object.entries(entry.Information)
															.filter(([key]) => !["Username", "DateBreach"].includes(key))
															.map(([key, value]) => (
																<div key={key} className="flex">
																	<span className="font-medium mr-2">{key}:</span>
																	<span className="text-muted-foreground break-all">
																		{typeof value === "string" ? value : JSON.stringify(value)}
																	</span>
																</div>
															))}
													</div>
												</div>
											)}

											{/* Autofills */}
											{entry.autofills && entry.autofills.length > 0 && (
												<div>
													<h3 className="text-sm font-semibold mb-2">Autofill Emails</h3>
													<div className="grid grid-cols-1 gap-1">
														{Array.isArray(entry.autofills) ? (
															entry.autofills.map((email: string, i: number) => (
																<div
																	key={i}
																	className="flex justify-between items-center py-1 px-2 rounded-md hover:bg-muted/50"
																>
																	<span className="text-sm">{email}</span>
																	<Button
																		variant="ghost"
																		size="icon"
																		className="h-6 w-6"
																		onClick={() => copyToClipboard(email)}
																	>
																		<Copy className="h-3 w-3" />
																	</Button>
																</div>
															))
														) : (
															<div className="text-sm text-muted-foreground">{entry.autofills}</div>
														)}
													</div>
												</div>
											)}

											{/* Passwords/Credentials */}
											{entry.credentials && entry.credentials.length > 0 && (
												<div>
													<h3 className="text-sm font-semibold mb-2">Stored Credentials</h3>
													<Table>
														<TableHeader>
															<TableRow>
																<TableHead>URL/Service</TableHead>
																<TableHead>Username</TableHead>
																<TableHead>Password</TableHead>
																<TableHead className="text-right">Actions</TableHead>
															</TableRow>
														</TableHeader>
														<TableBody>
															{entry.credentials.map((cred: any, i: number) => (
																<TableRow key={i}>
																	<TableCell className="font-medium break-all">{cred.url || "-"}</TableCell>
																	<TableCell>{cred.user || cred.username || "-"}</TableCell>
																	<TableCell>
																		<span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
																			{cred.password || cred.pass || "-"}
																		</span>
																	</TableCell>
																	<TableCell className="text-right">
																		<TooltipProvider>
																			<Tooltip>
																				<TooltipTrigger asChild>
																					<Button
																						variant="ghost"
																						size="icon"
																						className="h-8 w-8"
																						onClick={() => {
																							const user = cred.user || cred.username || ""
																							const pass = cred.password || cred.pass || ""
																							const url = cred.url || ""
																							copyToClipboard(`${url ? `${url}:` : ""}${user}:${pass}`)
																						}}
																					>
																						<Copy className="h-4 w-4" />
																					</Button>
																				</TooltipTrigger>
																				<TooltipContent>
																					<p className="text-xs">Copy credentials</p>
																				</TooltipContent>
																			</Tooltip>
																		</TooltipProvider>
																	</TableCell>
																</TableRow>
															))}
														</TableBody>
													</Table>
												</div>
											)}

											{/* Additional fields with dynamic tables */}
											{Object.entries(entry._raw || {})
												.filter(
													([key]) =>
														!["Information", "Autofills", "passwords", "_raw"].includes(key) &&
														key !== entry._raw.passwords,
												)
												.map(([key, value]) => {
													if (value === null || value === undefined) return null

													return (
														<div key={key}>
															<h3 className="text-sm font-semibold mb-2">{key}</h3>
															{typeof value === "object" ? (
																renderDynamicTable(value, {
																	tableName: key,
																	maxDepth: 1,
																})
															) : (
																<div className="text-sm text-muted-foreground whitespace-pre-wrap">
																	{typeof value === "object" ? JSON.stringify(value) : String(value)}
																</div>
															)}
														</div>
													)
												})}
										</div>
									</CardContent>
								</Card>
							))
						) : (
							<Alert>
								<AlertTriangle className="h-5 w-5" />
								<AlertTitle>No stealer data found</AlertTitle>
								<AlertDescription>No stealer data was found for this username/email.</AlertDescription>
							</Alert>
						)}
					</div>
				</TabsContent>

				<TabsContent value="database" className="p-4">
					<div className="space-y-4 max-h-[500px] overflow-y-auto">
						{renderDynamicTable(processed.databaseUrls, tableConfigs.database)}
					</div>
				</TabsContent>

				<TabsContent value="combo" className="p-4">
					<div className="space-y-4 max-h-[500px] overflow-y-auto">
						{renderDynamicTable(processed.comboLists, tableConfigs.combo)}
					</div>
				</TabsContent>
			</Tabs>
		)
	}

	const processDataForTable = (data: any, searchType: string) => {
		if (!data) return null

		if (searchType === "url") {
			const { bigDatabaseEntries, urlSearchEntries } = getProcessedUrlResults

			if (bigDatabaseEntries.length === 0 && urlSearchEntries.length === 0) {
				return (
					<Alert variant="default">
						<div className="flex items-center gap-2 mb-1">
							<AlertTriangle className="h-4 w-4 text-yellow-500" />
							<AlertTitle>No results found</AlertTitle>
						</div>
						<AlertDescription>No leaked credentials were found for this URL.</AlertDescription>
					</Alert>
				)
			}

			const allResults = [
				...bigDatabaseEntries.map((entry) => ({ type: "bigdb", data: entry })),
				...urlSearchEntries.map((entry) => ({ type: "url", data: entry })),
			]

			const processedData = paginatedUrlResults
				.map((item) => {
					if (item.type === "bigdb") {
						const cred = parseCredential(item.data.buffer)
						return {
							domain: cred.domain,
							path: cred.path || "-",
							username: cred.username,
							password: cred.password || "-",
							source: "Big Database",
							_raw: item.data,
						}
					}
					const entry = item.data
					if (entry.buffer) {
						const cred = parseCredential(entry.buffer)
						return {
							domain: cred.domain,
							path: cred.path || "-",
							username: cred.username,
							password: cred.password || "-",
							source: "URL Search",
							_raw: entry,
						}
					}
					if (entry.host) {
						return {
							domain: entry.host,
							path: entry.path || "-",
							username: entry.user,
							password: entry.pass,
							source: "URL Search",
							_raw: entry,
						}
					}
					return null
				})
				.filter(Boolean)

			return renderDynamicTable(processedData, {
				...tableConfigs.url,
				tableName: "credential",
			})
		}

		if (searchType === "username") {
			return renderUsernameSearch(data)
		}

		if (searchType === "ip") {
			return renderDynamicTable(data, {
				...tableConfigs.ip,
				tableName: "ip",
			})
		}

		if (searchType === "subdomains" || searchType === "subdomainScan") {
			return renderDynamicTable(data, {
				...tableConfigs.subdomain,
				tableName: "subdomain",
			})
		}

		if (searchType === "portScan") {
			const ports =
				data.ports || data.open_ports || (data.results?.ports ? data.results.ports : Array.isArray(data) ? data : [])

			return renderDynamicTable(ports, {
				...tableConfigs.port,
				tableName: "port",
			})
		}

		return renderDynamicTable(data, {
			tableName: searchType,
			emptyMessage: `No results found for ${searchType}.`,
		})
	}

	return (
		<div className="container mx-auto py-8 px-4 space-y-8">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-3xl font-bold tracking-tight">LeakSight</h1>
				<Button variant="outline" asChild>
					<Link href="/dashboard" className="flex items-center">
						<ArrowLeft className="w-4 h-4 mr-2" />
						<span>Back to Dashboard</span>
					</Link>
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Search className="h-5 w-5" />
						Search by {searchTypes.find((st) => st.value === searchType)?.label}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-4">
						<div className="flex flex-wrap gap-2 mb-2">
							{searchTypes.map((type) => (
								<Button
									key={type.value}
									variant={searchType === type.value ? "default" : "outline"}
									size="sm"
									onClick={() => setSearchType(type.value as SearchParams["searchType"])}
									className="flex items-center gap-2"
								>
									{type.icon}
									{type.label}
								</Button>
							))}
						</div>
						<div className="w-full">{renderSearchForm()}</div>
					</div>
				</CardContent>
			</Card>

			{isSearching && !searchResults && (
				<div className="flex justify-center items-center p-8">
					<Loader2 className="h-8 w-8 animate-spin" />
				</div>
			)}

			{error && (
				<Alert
					variant={error.toLowerCase().includes("subscription") ? "default" : "destructive"}
					className="animate-in fade-in duration-300"
				>
					<div className="flex items-start gap-3">
						<div className="flex-shrink-0 mt-0.5">
							{error.toLowerCase().includes("subscription") ? (
								<AlertTriangle className="h-5 w-5 text-amber-500" />
							) : (
								<AlertTriangle className="h-5 w-5 text-red-500" />
							)}
						</div>
						<div className="flex-1 space-y-2">
							<div className="flex flex-col">
								<AlertTitle className="text-base font-semibold">
									{error.toLowerCase().includes("subscription") ? "Subscription Required" : "Error Occurred"}
								</AlertTitle>
								<AlertDescription className="text-sm text-muted-foreground mt-1">
									{error.toLowerCase().includes("subscription")
										? "You need an active subscription to access this feature. Purchase a subscription to continue using LeakSight."
										: error}
								</AlertDescription>
							</div>

							{error.toLowerCase().includes("subscription") && (
								<div className="flex items-center gap-3 mt-3">
									<button
										data-sell-store="57872"
										data-sell-product="282137"
										data-sell-darkmode="true"
										data-sell-theme="e11d48"
										className="bg-gradient-to-r from-rose-500/90 to-rose-700/90 text-white h-9 rounded-md px-3 py-2 text-sm font-medium border-0 hover:shadow-[0_0_8px_rgba(244,63,94,0.6)] transition-all duration-300 flex items-center gap-2"
									>
										<span>View Pricing Plans</span>
									</button>

									<Button variant="outline" size="sm" asChild>
										<Link href="/dashboard">Return to Dashboard</Link>
									</Button>
								</div>
							)}
						</div>
					</div>
				</Alert>
			)}

			{searchResults && searchType === "url" && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<span className="flex items-center gap-2">
								<Database className="h-5 w-5" />
								URL Search Results
							</span>
							<div className="flex items-center gap-2">
								<Badge variant="outline" className="flex items-center gap-2">
									Total Results: {totalUrlResults}
								</Badge>
							</div>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
								<div className="flex flex-wrap gap-2">
									<div className="flex gap-2">
										<Button
											variant="outline"
											disabled={!searchResults}
											onClick={downloadResults}
											className="flex items-center"
										>
											<FileText className="mr-2 h-4 w-4" />
											JSON
										</Button>
									</div>
									<Input
										type="text"
										value={resultSearch}
										onChange={(e) => setResultSearch(e.target.value)}
										placeholder="Filter results..."
										className="w-full sm:w-[200px]"
									/>
								</div>
							</div>
							<div className="space-y-4">
								<div className="overflow-x-auto">{processDataForTable(searchResults.data, searchType)}</div>
								<div className="flex justify-between items-center mt-4">
									<Button onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1}>
										<ChevronLeft className="h-4 w-4 mr-2" />
										Previous
									</Button>
									<span>
										Page {currentPage} of {totalPages}
									</span>
									<Button
										onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
										disabled={currentPage === totalPages}
									>
										Next
										<ChevronRight className="h-4 w-4 ml-2" />
									</Button>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{searchResults && searchType === "username" && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<span className="flex items-center gap-2">
								<Database className="h-5 w-5" />
								Username/Email Search Results
							</span>
							<div className="flex items-center gap-2">
								<Badge variant="outline" className="flex items-center gap-2">
									Total Data Sources:{" "}
									{(searchResults.data?.stealer_json?.length > 0 ? 1 : 0) +
										(searchResults.data?.database_url?.length > 0 ? 1 : 0) +
										(searchResults.data?.bigcomboCombolist?.length > 0 ? 1 : 0)}
								</Badge>
							</div>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
								<div className="flex flex-wrap gap-2">
									<Button
										variant="outline"
										disabled={!searchResults}
										onClick={downloadResults}
										className="flex items-center"
									>
										<FileText className="mr-2 h-4 w-4" />
										JSON
									</Button>
								</div>
							</div>

							{processDataForTable(searchResults.data, searchType)}
						</div>
					</CardContent>
				</Card>
			)}

			{searchResults && !["url", "username"].includes(searchType) && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<span className="flex items-center gap-2">
								<Database className="h-5 w-5" />
								{searchType === "ip" && "IP Search Results"}
								{searchType === "hwid" && "HWID Search Results"}
								{searchType === "subdomains" && "Subdomains Results"}
								{searchType === "subdomainScan" && "Subdomain Scan Results"}
								{searchType === "proxyDetect" && "Proxy Detection Results"}
								{searchType === "portScan" && "Port Scan Results"}
							</span>
							<div className="flex items-center gap-2">
								<Badge variant="outline" className="flex items-center gap-2">
									{searchType.toUpperCase()}
								</Badge>
							</div>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
								<div className="flex flex-wrap gap-2">
									<Button
										variant="outline"
										disabled={!searchResults}
										onClick={downloadResults}
										className="flex items-center"
									>
										<FileText className="mr-2 h-4 w-4" />
										JSON
									</Button>
								</div>
							</div>

							<div className="overflow-x-auto">{processDataForTable(searchResults.data, searchType)}</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
