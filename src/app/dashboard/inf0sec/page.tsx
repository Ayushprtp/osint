"use client"

import { useState, useCallback, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
	ArrowLeft,
	ChevronLeft,
	ChevronRight,
	Download,
	Eye,
	FileText,
	Globe,
	Loader2,
	Phone,
	Search,
	User,
	AlertTriangle,
	Link as LinkIcon,
	Database,
} from "lucide-react"
import type { Inf0secModules } from "@/lib/text"
import { Badge } from "@/components/ui/badge"

type Module = Inf0secModules

type SearchParams = {
	query: string
	module: Module
}

type SearchResponse = {
	success: boolean
	data: any
	error?: string
	time_taken?: string
	count?: number
}

type ExportFormat = "json" | "user-pass" | "url-user-pass"

type LeaksResult = {
	username?: string
	email?: string
	password?: string
	url?: string
	domain?: string
	name?: string
	id?: string
	label?: string
	date?: string
	[key: string]: any
}

type HlrResult = {
	active?: boolean
	number?: string
	country?: string
	country_code?: string
	network_provider?: string
	type?: string
	description?: string
	mobile_country_code?: string
	mobile_network_code?: string
	is_ported?: boolean
	is_roaming?: boolean
	is_mobile?: boolean
	[key: string]: any
}

type UsernameResult = {
	username?: string
	email?: string
	platform?: string
	usernames?: string[]
	emails?: string[]
	[key: string]: any
}

type DomainResult = {
	host?: string
	title?: string
	ip?: string
	location?: {
		country?: string
		city?: string
	}
	asn?: number
	response?: string
	cloudflare?: boolean
	timestamp?: number
	[key: string]: any
}

type DiscordIdResult = {
	username?: string
	ip?: string
	isvpn?: boolean
	timestamp?: string
	usercreatedat?: string
	displayname?: string | null
	avatar?: string
	country?: string
	city?: string
	provider?: string
	type?: string
	risk?: number
	[key: string]: any
}

type ResultType = LeaksResult | HlrResult | UsernameResult | DomainResult | DiscordIdResult

const searchTypes: { value: Module; label: string; icon: React.ReactNode }[] = [
	{ value: "leaks", label: "Leaks", icon: <FileText className="h-4 w-4" /> },
	{ value: "hlr", label: "HLR Lookup", icon: <Phone className="h-4 w-4" /> },
	{ value: "username", label: "Username", icon: <User className="h-4 w-4" /> },
	{ value: "domain", label: "Domain", icon: <Globe className="h-4 w-4" /> },
	{
		value: "discord",
		label: "Discord ID",
		icon: <LinkIcon className="h-4 w-4" />,
	},
]

const ITEMS_PER_PAGE = 10

export default function Inf0sec() {
	const [isSearching, setIsSearching] = useState(false)
	const [searchModule, setSearchModule] = useState<Module>("leaks")
	const [query, setQuery] = useState("")
	const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [currentPage, setCurrentPage] = useState(1)
	const [resultSearch, setResultSearch] = useState("")

	const handleModuleChange = (module: Module) => {
		setSearchModule(module)
		setSearchResults(null)
		setError(null)
		setQuery("")
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
			const response = await fetch("/api/inf0sec", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					query,
					module: searchModule,
				}),
			})

			if (!response.ok) {
				const errorData = await response.json()

				if (response.status === 403 && errorData?.error?.includes("subscription")) {
					throw new Error("SUBSCRIPTION_REQUIRED")
				}

				throw new Error(errorData?.error || "An error occurred during the search")
			}

			const data = await response.json()

			if (!data.success) {
				throw new Error(data.error || "An error occurred during the search")
			}

			setSearchResults(data)
			setCurrentPage(1)
		} catch (error) {
			console.error("Error fetching data:", error)

			if (error instanceof Error) {
				if (error.message === "SUBSCRIPTION_REQUIRED") {
					setError("Active subscription required. Please purchase a subscription to continue using this service.")
				} else {
					setError(error.message || "An error occurred while fetching data. Please try again.")
				}
			} else {
				setError("An error occurred while fetching data. Please try again.")
			}
		} finally {
			setIsSearching(false)
		}
	}, [query, searchModule])

	const getResultsArray = useMemo(() => {
		if (!searchResults?.data) return []

		if (searchModule === "leaks" && searchResults.data.results) {
			const flattenedResults: LeaksResult[] = []
			for (const result of searchResults.data.results) {
				if (result.logs && Array.isArray(result.logs)) {
					for (const log of result.logs) {
						flattenedResults.push({
							...log,
							label: result.label,
							date: result.date,
						})
					}
				}
			}
			return flattenedResults
		}
		if (searchModule === "hlr" && searchResults.data.result) {
			return [searchResults.data.result] as HlrResult[]
		}
		if (searchModule === "username" && searchResults.data.results) {
			const flattenedResults: UsernameResult[] = []
			for (const [platform, results] of Object.entries(searchResults.data.results)) {
				if (Array.isArray(results)) {
					for (const result of results) {
						flattenedResults.push({
							platform,
							...result,
						})
					}
				}
			}
			return flattenedResults
		}
		if (searchModule === "domain" && searchResults.data.results) {
			return searchResults.data.results as DomainResult[]
		}
		if (searchModule === "discord" && searchResults.data.results) {
			return searchResults.data.results as DiscordIdResult[]
		}

		return []
	}, [searchResults, searchModule])

	const getResultKeys = useMemo(() => {
		if (getResultsArray.length === 0) return []

		const allKeys = new Set<string>()
		for (const result of getResultsArray) {
			for (const key of Object.keys(result)) {
				allKeys.add(key)
			}
		}
		return Array.from(allKeys)
	}, [getResultsArray])

	const getPaginatedResults = useMemo(() => {
		if (getResultsArray.length === 0) return []

		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
		return getResultsArray.slice(startIndex, startIndex + ITEMS_PER_PAGE)
	}, [getResultsArray, currentPage])

	const filteredResults = useMemo(() => {
		if (!resultSearch.trim()) return getPaginatedResults

		return getPaginatedResults.filter((result) =>
			Object.values(result).some(
				(value) =>
					value !== null && value !== undefined && String(value).toLowerCase().includes(resultSearch.toLowerCase()),
			),
		)
	}, [getPaginatedResults, resultSearch])

	const totalPages = useMemo(() => {
		return Math.ceil(getResultsArray.length / ITEMS_PER_PAGE)
	}, [getResultsArray])

	const downloadResults = useCallback(
		(format: ExportFormat = "json") => {
			if (!searchResults) return

			let content = ""
			let filename = `inf0sec-${searchModule}-${query}`
			let mimeType = "application/json"

			if (format === "json") {
				content = JSON.stringify(searchResults, null, 2)
				filename += ".json"
			} else {
				const formattedLines = getResultsArray
					.map((result: ResultType) => {
						if (searchModule === "leaks") {
							const username = result.username || result.email || ""
							const password = (result as LeaksResult).password || ""
							const url = (result as LeaksResult).url || (result as LeaksResult).domain || ""

							if (format === "user-pass") {
								return `${username}:${password}`
							}
							if (format === "url-user-pass") {
								return `${url}:${username}:${password}`
							}
						} else if (searchModule === "username") {
							const username = result.username || ""
							const email = (result as UsernameResult).email || ""
							const platform = (result as UsernameResult).platform || ""

							if (format === "user-pass") {
								return `${username}:${email}`
							}
							if (format === "url-user-pass") {
								return `${platform}:${username}:${email}`
							}
						} else if (searchModule === "domain") {
							const host = (result as DomainResult).host || ""
							const ip = (result as DomainResult).ip || ""
							const title = (result as DomainResult).title || ""

							if (format === "user-pass") {
								return `${host}:${ip}`
							}
							if (format === "url-user-pass") {
								return `${host}:${ip}:${title}`
							}
						} else if (searchModule === "discord") {
							const username = (result as DiscordIdResult).username || ""
							const ip = (result as DiscordIdResult).ip || ""
							const country = (result as DiscordIdResult).country || ""

							if (format === "user-pass") {
								return `${username}:${ip}`
							}
							if (format === "url-user-pass") {
								return `${username}:${ip}:${country}`
							}
						}
						return ""
					})
					.filter((line: string) => line.trim() !== "")

				content = formattedLines.join("\n")
				filename += ".txt"
				mimeType = "text/plain"
			}

			const blob = new Blob([content], { type: mimeType })
			const url = URL.createObjectURL(blob)
			const a = document.createElement("a")
			a.href = url
			a.download = filename
			a.click()
		},
		[searchResults, searchModule, query, getResultsArray],
	)

	const renderSearchForm = () => {
		return (
			<div className="flex w-full items-center space-x-2">
				<div className="relative flex-1">
					<Input
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder={`Enter ${
							searchModule === "leaks"
								? "email/username"
								: searchModule === "hlr"
									? "phone number"
									: searchModule === "username"
										? "username"
										: searchModule === "discord"
											? "Discord ID"
											: "domain"
						}...`}
						className="pr-10"
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

	return (
		<div className="container mx-auto py-8 px-4 space-y-8">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-3xl font-bold tracking-tight">Inf0sec</h1>
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
						<Eye className="h-5 w-5" />
						Search by {searchTypes.find((st) => st.value === searchModule)?.label}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-4">
						<div className="flex flex-wrap gap-2 mb-2">
							{searchTypes.map((type) => (
								<Button
									key={type.value}
									variant={searchModule === type.value ? "default" : "outline"}
									size="sm"
									onClick={() => handleModuleChange(type.value)}
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
										? "You need an active subscription to access this feature. Inf0sec requires a one-time purchase of $500 for lifetime access."
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

			{searchResults?.success && searchResults.data && (
				<Card>
					<CardHeader>
						<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
							<CardTitle className="flex items-center gap-2">
								<Database className="h-5 w-5" />
								Search Results
								{searchResults.data.count > 0 && (
									<Badge variant="secondary" className="ml-2">
										{searchResults.data.count} {searchResults.data.count === 1 ? "result" : "results"}
									</Badge>
								)}
							</CardTitle>
							<div className="flex items-center gap-2">
								{searchResults.data.time_taken && (
									<div className="text-sm text-muted-foreground">Search took {searchResults.data.time_taken}</div>
								)}
							</div>
						</div>
						<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
							<div className="flex flex-wrap gap-2">
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										disabled={!searchResults}
										onClick={() => downloadResults("json")}
										className="flex items-center"
									>
										<FileText className="mr-2 h-4 w-4" />
										JSON
									</Button>
									<Button
										variant="outline"
										size="sm"
										disabled={!searchResults}
										onClick={() => downloadResults("user-pass")}
										className="flex items-center"
									>
										<Download className="mr-2 h-4 w-4" />
										USER:PASS
									</Button>
									<Button
										variant="outline"
										size="sm"
										disabled={!searchResults}
										onClick={() => downloadResults("url-user-pass")}
										className="flex items-center"
									>
										<LinkIcon className="mr-2 h-4 w-4" />
										URL:USER:PASS
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
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{getResultsArray.length > 0 ? (
								<div className="space-y-4">
									<div className="overflow-x-auto">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Source</TableHead>
													{getResultKeys.map((key) => (
														<TableHead key={key}>{key}</TableHead>
													))}
												</TableRow>
											</TableHeader>
											<TableBody>
												{filteredResults.map((result: ResultType, index: number) => (
													<TableRow key={index}>
														<TableCell>inf0sec</TableCell>
														{getResultKeys.map((key) => (
															<TableCell key={key}>
																{result[key] !== undefined
																	? typeof result[key] === "object"
																		? JSON.stringify(result[key])
																		: String(result[key])
																	: "-"}
															</TableCell>
														))}
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>
									<div className="flex justify-between items-center mt-4">
										<Button
											onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
											disabled={currentPage === 1}
										>
											<ChevronLeft className="h-4 w-4 mr-2" />
											Previous
										</Button>
										<span>
											Page {currentPage} of {totalPages || 1}
										</span>
										<Button
											onClick={() => setCurrentPage((prev) => Math.min(totalPages || 1, prev + 1))}
											disabled={currentPage === (totalPages || 1)}
										>
											Next
											<ChevronRight className="h-4 w-4 ml-2" />
										</Button>
									</div>
								</div>
							) : (
								<Alert>
									<AlertTitle>No results found</AlertTitle>
									<AlertDescription>
										No data available for <strong>{query || "your search query"}</strong>. Try a different search term.
									</AlertDescription>
								</Alert>
							)}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
