"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { LeakCheckIcon } from "@/components/icons/LeakCheckIcon"
import type { LEAKCHECK_VALID_SEARCH_TYPES } from "@/lib/text"
import {
	Search,
	ArrowLeft,
	Mail,
	Globe,
	User,
	Phone,
	Hash,
	Key,
	Database,
	Loader2,
	ChevronLeft,
	ChevronRight,
	AlertTriangle,
	FileText,
	FileJson,
} from "lucide-react"

type SearchType = (typeof LEAKCHECK_VALID_SEARCH_TYPES)[number]

type SearchParams = {
	query: string
	type: SearchType
}

type SearchResult = {
	email?: string
	source?: {
		name?: string
		breach_date?: string
		unverified?: number
		passwordless?: number
		compilation?: number
	}
	first_name?: string
	last_name?: string
	username?: string
	password?: string
	fields?: string[]
	[key: string]: any
}

type SearchResponse = {
	success: boolean
	found: number
	quota: number
	result: SearchResult[]
	error?: string
}

type ExportFormat = "json" | "user-pass" | "url-user-pass"

const searchTypes: {
	value: SearchType
	label: string
	icon: React.ReactElement
}[] = [
	{ value: "auto", label: "Auto", icon: <Search className="h-4 w-4" /> },
	{ value: "email", label: "Email", icon: <Mail className="h-4 w-4" /> },
	{ value: "domain", label: "Domain", icon: <Globe className="h-4 w-4" /> },
	{ value: "keyword", label: "Keyword", icon: <Search className="h-4 w-4" /> },
	{ value: "username", label: "Username", icon: <User className="h-4 w-4" /> },
	{ value: "phone", label: "Phone", icon: <Phone className="h-4 w-4" /> },
	{ value: "hash", label: "Hash", icon: <Hash className="h-4 w-4" /> },
	{ value: "phash", label: "Password Hash", icon: <Key className="h-4 w-4" /> },
]

const ITEMS_PER_PAGE = 10

export default function LeakCheck() {
	const [isSearching, setIsSearching] = useState(false)
	const [searchType, setSearchType] = useState<SearchType>("auto")
	const [query, setQuery] = useState("")
	const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [currentPage, setCurrentPage] = useState(1)
	const [resultSearch, setResultSearch] = useState("")

	useEffect(() => {
		setSearchResults(null)
		setError(null)
	}, [searchType])

	const getResultKeys = useMemo(() => {
		if (searchResults?.result && Array.isArray(searchResults?.result) && searchResults?.result.length > 0) {
			const allKeys = new Set<string>()

			for (const result of searchResults.result) {
				Object.keys(result).forEach((key) => {
					if (key !== "source" && key !== "fields") {
						allKeys.add(key)
					}
				})

				if (result.source) {
					Object.keys(result.source).forEach((key) => {
						allKeys.add(`source_${key}`)
					})
				}
			}

			return Array.from(allKeys)
		}
		return []
	}, [searchResults])

	const getPaginatedResults = useMemo(() => {
		if (!searchResults?.result || !Array.isArray(searchResults?.result)) {
			return []
		}

		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
		const paginatedResults = searchResults.result.slice(startIndex, startIndex + ITEMS_PER_PAGE)
		return paginatedResults
	}, [searchResults, currentPage])

	const filteredResults = useMemo(() => {
		if (!resultSearch.trim()) return getPaginatedResults

		return getPaginatedResults.filter((result) => {
			const searchIn = (obj: any): boolean => {
				for (const key in obj) {
					if (typeof obj[key] === "object" && obj[key] !== null) {
						if (searchIn(obj[key])) return true
					} else if (
						obj[key] !== null &&
						obj[key] !== undefined &&
						String(obj[key]).toLowerCase().includes(resultSearch.toLowerCase())
					) {
						return true
					}
				}
				return false
			}

			return searchIn(result)
		})
	}, [getPaginatedResults, resultSearch])

	const totalPages = useMemo(() => {
		if (!searchResults?.result || !Array.isArray(searchResults?.result)) return 0
		return Math.ceil(searchResults.result.length / ITEMS_PER_PAGE)
	}, [searchResults])

	const handleSearch = useCallback(async () => {
		if (!query.trim()) {
			setError("Please enter a search query")
			return
		}

		setIsSearching(true)
		setError(null)
		setSearchResults(null)

		try {
			const response = await fetch("/api/leakcheck", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ query, type: searchType }),
			})

			if (!response.ok) {
				const errorData = await response.json()

				if (response.status === 403 && errorData?.error?.includes("subscription")) {
					throw new Error("SUBSCRIPTION_REQUIRED")
				}

				throw new Error(errorData?.error || "An error occurred during the search")
			}

			const data: SearchResponse = await response.json()

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
	}, [query, searchType])

	const downloadResults = useCallback(
		(format: ExportFormat = "json") => {
			if (!searchResults?.result) return

			let content = ""
			let filename = `leakcheck-search-${searchType}-${query}`
			let mimeType = "application/json"

			if (format === "json") {
				content = JSON.stringify(searchResults, null, 2)
				filename += ".json"
			} else {
				const formattedLines = searchResults.result
					.map((result) => {
						const login = result.email || result.username || ""
						const password = result.password || ""
						const url = result.source?.name || ""

						if (format === "user-pass") {
							return `${login}:${password}`
						}
						if (format === "url-user-pass") {
							return `${url}:${login}:${password}`
						}
						return ""
					})
					.filter((line) => line.trim() !== "")

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
		[searchResults, searchType, query],
	)

	const renderSearchForm = () => {
		return (
			<div className="flex w-full items-center space-x-2">
				<div className="relative flex-1">
					<Input
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder={`Enter ${searchType}...`}
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

	const formatResultValue = (result: SearchResult, key: string) => {
		if (key.startsWith("source_")) {
			const sourceKey = key.replace("source_", "") as keyof typeof result.source
			return result.source?.[sourceKey] ?? "-"
		}

		if (key === "fields" && Array.isArray(result.fields)) {
			return result.fields.join(", ")
		}

		return result[key] ?? "-"
	}

	return (
		<div className="container mx-auto py-8 px-4 space-y-8">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
					<LeakCheckIcon className="h-8 w-8" />
					LeakCheck
				</h1>
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
									onClick={() => setSearchType(type.value)}
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
										? "You need an active subscription to access this feature. Purchase a subscription to continue using LeakCheck."
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

			{searchResults && (
				<Card>
					<CardHeader>
						<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
							<CardTitle className="flex items-center gap-2">
								<Database className="h-5 w-5" />
								Search Results
								{searchResults.found > 0 && (
									<Badge variant="secondary" className="ml-2">
										{searchResults.found} {searchResults.found === 1 ? "result" : "results"}
									</Badge>
								)}
							</CardTitle>
							<div className="flex items-center gap-2">
								<div className="text-sm text-muted-foreground">Quota: {searchResults.quota} remaining</div>
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => downloadResults("json")}
										className="flex items-center gap-1"
									>
										<FileJson className="h-4 w-4" />
										JSON
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => downloadResults("user-pass")}
										className="flex items-center gap-1"
									>
										<FileText className="h-4 w-4" />
										User:Pass
									</Button>
								</div>
							</div>
						</div>
						{searchResults.found > 0 && (
							<div className="mt-2">
								<Input
									placeholder="Filter results..."
									value={resultSearch}
									onChange={(e) => setResultSearch(e.target.value)}
									className="max-w-md"
								/>
							</div>
						)}
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{searchResults.found > 0 ? (
								<div className="space-y-4">
									<div className="overflow-x-auto">
										<Table>
											<TableHeader>
												<TableRow>
													{getResultKeys.map((key) => (
														<TableHead key={key}>{key.replace("source_", "source.")}</TableHead>
													))}
												</TableRow>
											</TableHeader>
											<TableBody>
												{filteredResults.map((result, index) => (
													<TableRow key={index}>
														{getResultKeys.map((key) => (
															<TableCell key={key}>{formatResultValue(result, key)}</TableCell>
														))}
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>
									{searchResults.result.length > ITEMS_PER_PAGE && (
										<div className="flex justify-between items-center mt-4">
											<Button
												onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
												disabled={currentPage === 1}
											>
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
									)}
								</div>
							) : (
								<Alert>
									<AlertTitle>No results found</AlertTitle>
									<AlertDescription>
										No data available for <strong>{query || "your search query"}</strong>. Try a different search term
										or search type.
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
