"use client"
import { useState, useMemo, useCallback } from "react"
import {
	Search,
	Database,
	ChevronLeft,
	ChevronRight,
	ArrowLeft,
	Download,
	AlertTriangle,
	Loader2,
	Mail,
	User,
	Key,
	Phone,
	Globe,
	Wifi,
	Hash,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader } from "@/components/ui/table"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface ApiResponse {
	success: boolean
	data: {
		failed_sources: string[]
		query: {
			term: string
			time_taken_ms: number
			total_results: number
			type: string
		}
		results: {
			source: string
			matches: Array<Record<string, unknown>>
		}[]
	}
}

interface SearchType {
	value: "email" | "username" | "password" | "phone" | "domain" | "ip_address" | "hash"
	label: string
}

const ITEMS_PER_PAGE = 10

export default function OSINTCat() {
	const [isSearching, setIsSearching] = useState(false)
	const [searchType, setSearchType] = useState<SearchType["value"]>("email")
	const [query, setQuery] = useState("")
	const [searchResults, setSearchResults] = useState<ApiResponse["data"] | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [resultSearch, setResultSearch] = useState("")
	const [currentPages, setCurrentPages] = useState<{ [key: string]: number }>({})

	const searchTypes: SearchType[] = [
		{ value: "email", label: "Email" },
		{ value: "username", label: "Username" },
		{ value: "password", label: "Password" },
		{ value: "phone", label: "Phone" },
		{ value: "domain", label: "Domain" },
		{ value: "ip_address", label: "IP Address" },
		{ value: "hash", label: "Hash" },
	]

	const getSearchTypeIcon = (type: SearchType["value"]) => {
		switch (type) {
			case "email":
				return <Mail className="h-4 w-4" />
			case "username":
				return <User className="h-4 w-4" />
			case "password":
				return <Key className="h-4 w-4" />
			case "phone":
				return <Phone className="h-4 w-4" />
			case "domain":
				return <Globe className="h-4 w-4" />
			case "ip_address":
				return <Wifi className="h-4 w-4" />
			case "hash":
				return <Hash className="h-4 w-4" />
			default:
				return <Search className="h-4 w-4" />
		}
	}

	const getResultKeys = useCallback((matches: Array<Record<string, unknown>>) => {
		const allKeys = new Set<string>(["source", "label"])

		for (const match of matches) {
			for (const key of Object.keys(match)) {
				if (key !== "logs" && key !== "id") {
					allKeys.add(key)
				} else if (Array.isArray(match.logs)) {
					for (const log of match.logs) {
						if (typeof log === "object" && log !== null) {
							for (const logKey of Object.keys(log)) {
								if (logKey !== "id") {
									allKeys.add(logKey)
								}
							}
						}
					}
				}
			}
		}

		const keys = Array.from(allKeys)
		if (keys.includes("source")) {
			keys.splice(keys.indexOf("source"), 1)
			keys.unshift("source")
		}
		if (keys.includes("label")) {
			keys.splice(keys.indexOf("label"), 1)
			keys.unshift("label")
		}

		return keys
	}, [])

	const flattenResults = useCallback((results: ApiResponse["data"]["results"]) => {
		if (!results) return []
		if (results.length === 0) return []
		const filteredResults = results.filter((source) => source.matches.length > 0)

		return filteredResults.map((source) => ({
			...source,
			matches: source.matches
				.flatMap((match) => {
					if (Array.isArray(match.logs)) {
						return match.logs.map((log) => ({
							...match,
							...log,
						}))
					}
					return [match]
				})
				.filter((match) => match.label !== "NO MONEY"),
		}))
	}, [])

	const filteredResults = useMemo(() => {
		if (!searchResults) return []
		const flattened = flattenResults(searchResults.results)
		return flattened
			.map((source) => ({
				...source,
				matches: source.matches.filter((item) =>
					Object.values(item).some((v) => String(v).toLowerCase().includes(resultSearch.toLowerCase())),
				),
			}))
			.filter((source) => source.matches.length > 0)
	}, [searchResults, resultSearch, flattenResults])

	const getPaginatedResults = useCallback(
		(matches: Array<Record<string, unknown>>, source: string) => {
			const currentPage = currentPages[source] || 1
			const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
			return matches.slice(startIndex, startIndex + ITEMS_PER_PAGE)
		},
		[currentPages],
	)

	const handleSearch = useCallback(async () => {
		if (!query.trim()) {
			setError("Please enter a search query")
			return
		}
		setIsSearching(true)
		setError(null)
		setSearchResults(null)
		setCurrentPages({})
		try {
			const response = await fetch("/api/osintcat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ query, searchType }),
			})

			if (!response.ok) {
				const errorData = await response.json()

				if (response.status === 403 && errorData?.error?.includes("subscription")) {
					throw new Error("SUBSCRIPTION_REQUIRED")
				}

				throw new Error(errorData?.error || "Search failed")
			}

			const data: ApiResponse = await response.json()
			setSearchResults(data.data)
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

	const downloadResults = useCallback(() => {
		if (!searchResults) return
		const blob = new Blob([JSON.stringify(searchResults, null, 2)], {
			type: "application/json",
		})
		const url = URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = url
		a.download = `osintcat-search-${searchType}-${query}.json`
		a.click()
	}, [searchResults, searchType, query])

	const handlePageChange = useCallback(
		(source: string, delta: number) => {
			setCurrentPages((prev) => {
				const currentPage = prev[source] || 1
				const srcData = filteredResults.find((r) => r.source === source)
				const totalPages = Math.ceil((srcData?.matches.length || 0) / ITEMS_PER_PAGE)
				return {
					...prev,
					[source]: Math.max(1, Math.min(currentPage + delta, totalPages)),
				}
			})
		},
		[filteredResults],
	)

	const renderCellContent = useCallback((value: unknown) => {
		if (value === null || value === undefined) {
			return "-"
		}
		if (typeof value === "object") {
			return JSON.stringify(value, null, 2)
		}
		return String(value)
	}, [])

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
				<h1 className="text-3xl font-bold tracking-tight">OSINTCat</h1>
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
									{getSearchTypeIcon(type.value)}
									{type.label}
								</Button>
							))}
						</div>
						<div className="w-full">{renderSearchForm()}</div>
						<div className="flex items-center space-x-2" />
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
										? "You need an active subscription to access this feature. Purchase a subscription to continue using OSINTCat."
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

			{searchResults && filteredResults.length === 0 && (
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

			{searchResults && filteredResults.length > 0 && (
				<div className="space-y-6">
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
						<div className="flex flex-wrap gap-2">
							<Button variant="outline" disabled={!searchResults} onClick={downloadResults}>
								<Download className="mr-2 h-4 w-4" />
								Export
							</Button>
							<Input
								type="text"
								value={resultSearch}
								onChange={(e) => setResultSearch(e.target.value)}
								placeholder="Filter results..."
								className="w-full sm:w-[200px]"
							/>
						</div>
						<Badge variant="outline" className="flex items-center gap-2">
							<span>Total sources: {filteredResults.length}</span>
						</Badge>
					</div>

					{filteredResults.map((sourceData) => (
						<Card key={sourceData.source} className="bg-background border-border">
							<CardHeader className="pb-0">
								<CardTitle className="flex items-center gap-2 text-base font-medium">
									<Database className="h-5 w-5" />
									{sourceData.source} ({sourceData.matches.length})
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="overflow-x-auto">
									<Table>
										<TableHeader>
											<TableRow>
												{getResultKeys(sourceData.matches).map((key) => (
													<TableHead
														key={`${sourceData.source}-header-${key}`}
														className="whitespace-nowrap font-medium"
													>
														{key}
													</TableHead>
												))}
											</TableRow>
										</TableHeader>
										<TableBody>
											{getPaginatedResults(sourceData.matches, sourceData.source).map((result) => {
												const rowKey = `${sourceData.source}-${result.id || result.email || JSON.stringify(result)}`
												return (
													<TableRow key={rowKey}>
														{getResultKeys(sourceData.matches).map((key) => (
															<TableCell key={`${rowKey}-${key}`} className="whitespace-nowrap">
																{renderCellContent(result[key])}
															</TableCell>
														))}
													</TableRow>
												)
											})}
										</TableBody>
									</Table>
								</div>
								<div className="flex justify-between items-center mt-4">
									<Button
										variant="outline"
										onClick={() => handlePageChange(sourceData.source, -1)}
										disabled={currentPages[sourceData.source] === 1}
									>
										<ChevronLeft className="h-4 w-4 mr-2" />
										Previous
									</Button>
									<span className="text-sm">
										Page {currentPages[sourceData.source] || 1} of{" "}
										{Math.ceil(sourceData.matches.length / ITEMS_PER_PAGE)}
									</span>
									<Button
										variant="outline"
										onClick={() => handlePageChange(sourceData.source, 1)}
										disabled={
											(currentPages[sourceData.source] || 1) === Math.ceil(sourceData.matches.length / ITEMS_PER_PAGE)
										}
									>
										Next
										<ChevronRight className="h-4 w-4 ml-2" />
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	)
}
