"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import {
	Search,
	Database,
	ChevronLeft,
	ChevronRight,
	ArrowLeft,
	Download,
	AlertTriangle,
	Loader2,
	FileText,
	Mail,
	User,
	Globe,
	HelpCircle,
	MapPin,
	Hash,
	Server,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type SearchParams = {
	type: "text" | "breach" | "url" | "ip-info" | "roblox-userinfo" | "discord-to-roblox" | "holhe" | "ghunt"
	query: string
	includeSnus?: boolean
}

type SearchResult = {
	[key: string]: string | number | boolean
}

type SearchResponse = {
	success: boolean
	data?: any
	error?: string
}

const searchTypes: { value: SearchParams["type"]; label: string }[] = [
	{ value: "text", label: "Stealer" },
	{ value: "breach", label: "Breach" },
	{ value: "url", label: "URL" },
	{ value: "ip-info", label: "IP Info" },
	{ value: "roblox-userinfo", label: "Roblox User" },
	{ value: "discord-to-roblox", label: "Discord to Roblox" },
	{ value: "holhe", label: "Holehe" },
	{ value: "ghunt", label: "Google Hunt" },
]

const ITEMS_PER_PAGE = 10

export default function OathNet() {
	const [isSearching, setIsSearching] = useState(false)
	const [searchType, setSearchType] = useState<SearchParams["type"]>("text")
	const [query, setQuery] = useState("")
	const [includeSnus, setIncludeSnus] = useState(false)
	const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [currentPage, setCurrentPage] = useState(1)
	const [resultSearch, setResultSearch] = useState("")

	const searchInputRef = useRef<HTMLInputElement>(null)

	const getResultData = useMemo(() => {
		if (searchResults?.data) {
			if (Array.isArray(searchResults.data)) {
				return searchResults.data
			}
			if (typeof searchResults.data === "object" && searchResults.data !== null) {
				if (searchResults.data.LOGS && Array.isArray(searchResults.data.LOGS)) {
					return searchResults.data.LOGS
				}

				return [searchResults.data]
			}
		}
		return []
	}, [searchResults])

	const getResultKeys = useMemo(() => {
		const data = getResultData
		if (data && data.length > 0) {
			return Object.keys(data[0])
		}
		return []
	}, [getResultData])

	const getPaginatedResults = useMemo(() => {
		const data = getResultData
		if (!data || !Array.isArray(data)) {
			return []
		}

		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
		const paginatedResults = data.slice(startIndex, startIndex + ITEMS_PER_PAGE)
		return paginatedResults
	}, [getResultData, currentPage])

	const filteredResults = useMemo(() => {
		if (!resultSearch.trim()) return getPaginatedResults
		return getPaginatedResults.filter(
			(result) =>
				result &&
				Object.values(result).some(
					(value) =>
						value !== null && value !== undefined && String(value).toLowerCase().includes(resultSearch.toLowerCase()),
				),
		)
	}, [getPaginatedResults, resultSearch])

	const totalPages = useMemo(() => {
		const data = getResultData
		if (!data || !Array.isArray(data)) return 0
		return Math.ceil(data.length / ITEMS_PER_PAGE)
	}, [getResultData])

	useEffect(() => {
		if (searchInputRef.current) {
			searchInputRef.current.focus()
		}
	}, [searchType])

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "/") {
				e.preventDefault()
				if (searchInputRef.current) {
					searchInputRef.current.focus()
				}
			}
		}

		window.addEventListener("keydown", handleKeyDown)
		return () => window.removeEventListener("keydown", handleKeyDown)
	}, [])

	const validateInput = (type: SearchParams["type"], value: string): string | null => {
		if (!value.trim()) {
			return "Please enter a search query"
		}

		switch (type) {
			case "ip-info":
				if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(value)) {
					return "Please enter a valid IP address"
				}
				break
			case "holhe":
			case "ghunt":
				if (!value.includes("@")) {
					return "Please enter a valid email address"
				}
				break
		}

		return null
	}

	const handleSearch = useCallback(async () => {
		const validationError = validateInput(searchType, query)
		if (validationError) {
			setError(validationError)
			return
		}

		setIsSearching(true)
		setError(null)
		setSearchResults(null)

		try {
			const requestBody: any = { type: searchType }

			switch (searchType) {
				case "text":
				case "breach":
				case "url":
					requestBody.query = query
					requestBody.includeSnus = includeSnus
					break
				case "ip-info":
					requestBody.ip = query
					break
				case "roblox-userinfo":
					requestBody.username = query
					break
				case "discord-to-roblox":
					requestBody.discordid = query
					break
				case "holhe":
				case "ghunt":
					requestBody.email = query
					break
			}

			const response = await fetch("/api/oathnet", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestBody),
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

			setResultSearch("")
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
	}, [query, searchType, includeSnus])

	const downloadResults = useCallback(
		(format: "json" | "csv" = "json") => {
			if (!searchResults?.data) return

			let content = ""
			let filename = `oathnet-search-${searchType}-${query}`
			let mimeType = "application/json"
			if (format === "json") {
				content = JSON.stringify(searchResults.data, null, 2)
				filename += ".json"
			} else if (format === "csv") {
				const data = getResultData
				if (data.length > 0) {
					const headers = Object.keys(data[0]).join(",")

					const rows = data.map((row: Record<string, any>) =>
						Object.values(row)
							.map((value) => (typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value))
							.join(","),
					)
					content = [headers, ...rows].join("\n")
					filename += ".csv"
					mimeType = "text/csv"
				}
			}

			const blob = new Blob([content], { type: mimeType })
			const url = URL.createObjectURL(blob)
			const a = document.createElement("a")
			a.href = url
			a.download = filename
			a.click()
		},
		[searchResults, searchType, query, getResultData],
	)

	const getPlaceholder = () => {
		switch (searchType) {
			case "text":
				return "Enter email, username, password or URL"
			case "breach":
				return "Enter Discord ID, username, password or IP..."
			case "url":
				return "Enter URL..."
			case "ip-info":
				return "Enter IP address..."
			case "roblox-userinfo":
				return "Enter Roblox username..."
			case "discord-to-roblox":
				return "Enter Discord ID..."
			case "holhe":
			case "ghunt":
				return "Enter email address..."
			default:
				return "Enter search query..."
		}
	}

	const renderSearchForm = () => {
		const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Enter" && !isSearching && query.trim()) {
				handleSearch()
			}
		}

		return (
			<div className="flex w-full items-center space-x-2">
				<div className="relative flex-1">
					<Input
						ref={searchInputRef}
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder={getPlaceholder()}
						className="pr-10"
						disabled={isSearching}
						autoFocus
						aria-label={`Search ${searchType}`}
					/>
					<Button
						className="absolute right-0 top-0 h-full rounded-l-none"
						onClick={handleSearch}
						disabled={isSearching || !query.trim()}
						aria-label="Search"
					>
						{isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
					</Button>
				</div>
			</div>
		)
	}

	const getSearchTypeIcon = (type: SearchParams["type"]) => {
		switch (type) {
			case "text":
				return <FileText className="h-4 w-4" />
			case "breach":
				return <AlertTriangle className="h-4 w-4" />
			case "url":
				return <Globe className="h-4 w-4" />
			case "ip-info":
				return <MapPin className="h-4 w-4" />
			case "roblox-userinfo":
				return <User className="h-4 w-4" />
			case "discord-to-roblox":
				return <Hash className="h-4 w-4" />
			case "holhe":
				return <Mail className="h-4 w-4" />
			case "ghunt":
				return <Server className="h-4 w-4" />
			default:
				return <Search className="h-4 w-4" />
		}
	}

	const renderSearchTypes = () => {
		return (
			<div className="flex flex-wrap gap-2 mb-2" role="radiogroup" aria-label="Search type">
				{searchTypes.map((type) => (
					<Button
						key={type.value}
						variant={searchType === type.value ? "default" : "outline"}
						size="sm"
						onClick={() => {
							setSearchType(type.value)

							setError(null)

							setTimeout(() => {
								if (searchInputRef.current) {
									searchInputRef.current.focus()
								}
							}, 100)
						}}
						className="flex items-center gap-2"
						aria-pressed={searchType === type.value}
					>
						{getSearchTypeIcon(type.value)}
						{type.label}
					</Button>
				))}
			</div>
		)
	}

	return (
		<div className="container mx-auto py-8 px-4 space-y-8">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-3xl font-bold tracking-tight">OathNet</h1>
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
						Search with {searchTypes.find((st) => st.value === searchType)?.label}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-4">
						{renderSearchTypes()}
						<div className="w-full">{renderSearchForm()}</div>
						{(searchType === "text" || searchType === "breach" || searchType === "url") && (
							<div className="flex items-center space-x-2">
								<Switch id="includeSnus-mode" checked={includeSnus} onCheckedChange={setIncludeSnus} />
								<Label htmlFor="includeSnus-mode">Include Snusbase</Label>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0">
												<HelpCircle className="h-4 w-4" />
												<span className="sr-only">Snusbase info</span>
											</Button>
										</TooltipTrigger>
										<TooltipContent className="max-w-xs">
											<p>
												Enable Snusbase integration to retrieve additional data related to emails, usernames, or IP
												addresses. This can provide enriched context such as breach data or historical user information.
											</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
						)}
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
										? "You need an active subscription to access this feature. Purchase a subscription to continue using OathNet."
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

			{searchResults && (!getResultData || getResultData.length === 0) && (
				<Alert variant={"default"}>
					<div className="flex items-center gap-2 mb-1">
						<AlertTriangle className="h-4 w-4 text-yellow-500" />
						<AlertTitle>No results found</AlertTitle>
					</div>
					<AlertDescription>
						We couldn't find any results for the search query. Please try again with a different query.
					</AlertDescription>
				</Alert>
			)}

			{searchResults?.data && getResultData.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<span className="flex items-center gap-2">
								<Database className="h-5 w-5" />
								Search Results
							</span>
							<div className="flex items-center gap-2">
								{searchResults.data.COUNT && (
									<Badge variant="outline" className="flex items-center gap-2">
										Total Records: {searchResults.data.COUNT}
									</Badge>
								)}
								{searchResults.data.ELAPSED && (
									<Badge variant="outline" className="flex items-center gap-2">
										Time: {searchResults.data.ELAPSED}
									</Badge>
								)}
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
											onClick={() => downloadResults("json")}
											className="flex items-center"
										>
											<FileText className="mr-2 h-4 w-4" />
											JSON
										</Button>
										<Button
											variant="outline"
											disabled={!searchResults}
											onClick={() => downloadResults("csv")}
											className="flex items-center"
										>
											<Download className="mr-2 h-4 w-4" />
											CSV
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
							{getResultData.length > 0 ? (
								<div className="space-y-4">
									<div className="overflow-x-auto">
										<Table>
											<TableHeader>
												<TableRow>
													{getResultKeys.map((key) => (
														<TableHead key={key}>{key}</TableHead>
													))}
												</TableRow>
											</TableHeader>
											<TableBody>
												{filteredResults.map((result, index) => (
													<TableRow key={index}>
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
									{totalPages > 1 && (
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
									)}
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
