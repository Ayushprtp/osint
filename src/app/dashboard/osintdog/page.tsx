"use client"
import { useState, useMemo, useCallback } from "react"
import {
	Search,
	Database,
	ArrowLeft,
	Download,
	AlertTriangle,
	Loader2,
	Mail,
	User,
	Phone,
	Globe,
	Wifi,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader } from "@/components/ui/table"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

interface ApiResponse {
	success: boolean
	data: {
		success: boolean
		credit: string
		intelvault_results?: {
			success: boolean
			time_taken: number
			results: Array<{
				index: string
				data: Array<Record<string, unknown>>
			}>
		}
		snusbase_results?: {
			took: number
			size: number
			results: Record<string, Array<Record<string, unknown>>>
		}
		leakcheck_results?: {
			success: boolean
			quota: number
			found: number
			result: Array<Record<string, unknown>>
		}
		breachbase_results?: {
			code: number
			data: {
				content: Array<Record<string, unknown>>
				status: string
			}
			message: string
		}
		hackcheck_results?: {
			code: number
			data: {
				data: {
					databases: number
					elapsed: string
					found: number
					results: Array<Record<string, unknown>>
				}
			}
			message: string
		}
	}
}

interface SearchType {
	value: "email" | "username" | "phone" | "ip" | "domain"
	label: string
}

const ITEMS_PER_PAGE = 10

export default function OSINTDog() {
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
		{ value: "phone", label: "Phone" },
		{ value: "ip", label: "IP Address" },
		{ value: "domain", label: "Domain" },
	]

	const getSearchTypeIcon = (type: SearchType["value"]) => {
		switch (type) {
			case "email":
				return <Mail className="h-4 w-4" />
			case "username":
				return <User className="h-4 w-4" />
			case "phone":
				return <Phone className="h-4 w-4" />
			case "domain":
				return <Globe className="h-4 w-4" />
			case "ip":
				return <Wifi className="h-4 w-4" />
			default:
				return <Search className="h-4 w-4" />
		}
	}

	const getResultKeys = useCallback((results: Array<Record<string, unknown>>) => {
		const allKeys = new Set<string>()

		for (const result of results) {
			if (result.data && typeof result.data === "object") {
				const data = result.data as Record<string, unknown>
				for (const key of Object.keys(data)) {
					allKeys.add(key)
				}
			}
		}

		return Array.from(allKeys)
	}, [])

	const filteredResults = useMemo(() => {
		if (!searchResults) return []

		const allResults: Array<{ source: string; data: Record<string, unknown> }> = []

		if (searchResults.intelvault_results?.results) {
			searchResults.intelvault_results.results.forEach((result) => {
				result.data.forEach((item) => {
					allResults.push({
						source: `IntellVault - ${result.index}`,
						data: item,
					})
				})
			})
		}

		if (searchResults.snusbase_results?.results) {
			Object.entries(searchResults.snusbase_results.results).forEach(([source, items]) => {
				items.forEach((item) => {
					allResults.push({
						source: `Snusbase - ${source}`,
						data: item,
					})
				})
			})
		}

		if (searchResults.leakcheck_results?.result) {
			searchResults.leakcheck_results.result.forEach((item) => {
				allResults.push({
					source: `LeakCheck - ${(item.source as { name?: string })?.name || "Unknown"}`,
					data: item,
				})
			})
		}

		if (searchResults.hackcheck_results?.data?.data?.results) {
			searchResults.hackcheck_results.data.data.results.forEach((item) => {
				allResults.push({
					source: `HackCheck - ${(item.source as { name?: string })?.name || "Unknown"}`,
					data: item,
				})
			})
		}

		if (resultSearch) {
			return allResults.filter((result) =>
				Object.values(result.data).some((value) => String(value).toLowerCase().includes(resultSearch.toLowerCase())),
			)
		}

		return allResults
	}, [searchResults, resultSearch])

	const getPaginatedResults = useCallback(
		(results: Array<Record<string, unknown>>, source: string) => {
			const currentPage = currentPages[source] || 1
			const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
			return results.slice(startIndex, startIndex + ITEMS_PER_PAGE)
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
			const response = await fetch("/api/osintdog", {
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
		a.download = `osintdog-search-${searchType}-${query}.json`
		a.click()
	}, [searchResults, searchType, query])

	const handlePageChange = useCallback(
		(source: string, delta: number) => {
			setCurrentPages((prev) => {
				const currentPage = prev[source] || 1
				const totalResults = filteredResults.length
				const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE)
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
				<h1 className="text-3xl font-bold tracking-tight">OSINTDog</h1>
				<Button variant="outline" asChild>
					<a href="/dashboard" className="flex items-center">
						<ArrowLeft className="w-4 h-4 mr-2" />
						<span>Back to Dashboard</span>
					</a>
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
										? "You need an active subscription to access this feature. Purchase a subscription to continue using OSINTDog."
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
										<a href="/dashboard">Return to Dashboard</a>
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
							<span>Total results: {filteredResults.length}</span>
						</Badge>
					</div>

					{filteredResults.map((result, idx) => (
						<Card key={`${result.source}-${idx}`} className="bg-background border-border">
							<CardHeader className="pb-0">
								<CardTitle className="flex items-center gap-2 text-base font-medium">
									<Database className="h-5 w-5" />
									{result.source}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="overflow-x-auto">
									<Table>
										<TableHeader>
											<TableRow>
												{Object.keys(result.data || {})
													.filter((key) => key !== "source" && typeof result.data[key] !== "object")
													.map((key) => (
														<TableHead key={`${result.source}-header-${key}`} className="whitespace-nowrap font-medium">
															{key}
														</TableHead>
													))}
											</TableRow>
										</TableHeader>
										<TableBody>
											<TableRow>
												{Object.entries(result.data || {})
													.filter(([key, value]) => key !== "source" && typeof value !== "object")
													.map(([key, value]) => (
														<TableCell key={`${result.source}-cell-${key}`} className="whitespace-nowrap">
															{renderCellContent(value)}
														</TableCell>
													))}
											</TableRow>
										</TableBody>
									</Table>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	)
}
