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
	Loader2,
	Search,
	AlertTriangle,
	Database,
	Info,
	User,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

type OsintSolutionResult = {
	_domain?: string
	email?: string
	hash?: string
	info?: string
	lastip?: string
	provider?: string
	regip?: string
	salt?: string
	source?: string
	username?: string
	[key: string]: any
}

type SearchResponse = {
	success: boolean
	data: OsintSolutionResult[]
	error?: string
}

const ITEMS_PER_PAGE = 15

const searchTypes = [
	{ id: "Leaks" as const, label: "Leaks", placeholder: "Search leaks (email, username, IP...)", Icon: Database },
	{
		id: "DiscordID" as const,
		label: "Discord ID",
		placeholder: "Enter Discord ID (e.g., 123456789012345678)",
		Icon: User,
	},
]

export default function OsintSolutionsPage() {
	const [isSearching, setIsSearching] = useState(false)
	const [query, setQuery] = useState("")
	const [activeSearchType, setActiveSearchType] = useState<(typeof searchTypes)[number]["id"]>(searchTypes[0].id)
	const [resultSearch, setResultSearch] = useState("")
	const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [currentPage, setCurrentPage] = useState(1)

	const handleSearch = useCallback(async () => {
		if (!query.trim()) {
			setError("Please enter a search query")
			return
		}

		setIsSearching(true)
		setError(null)
		setSearchResults(null)
		setCurrentPage(1)

		try {
			const response = await fetch("/api/osintsolutions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ query: query.trim(), searchType: activeSearchType }),
			})

			if (!response.ok) {
				const errorData = await response.json()
				if (response.status === 403 && errorData?.error?.includes("subscription")) {
					throw new Error("SUBSCRIPTION_REQUIRED")
				}
				throw new Error(errorData?.error || "Search failed")
			}

			const data: SearchResponse = await response.json()
			setSearchResults(data)
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
	}, [query, activeSearchType])

	const resultKeys = useMemo(() => {
		if (!searchResults?.data || searchResults.data.length === 0) {
			return []
		}
		const allKeys = new Set<string>()
		searchResults.data.forEach((result) => {
			Object.keys(result).forEach((key) => {
				if (result[key] !== null && result[key] !== undefined && String(result[key]).trim() !== "") {
					allKeys.add(key)
				}
			})
		})
		const orderedKeys = [
			"username",
			"email",
			"password",
			"hash",
			"info",
			"lastip",
			"regip",
			"provider",
			"source",
			"_domain",
		]
		return [
			...orderedKeys.filter((key) => allKeys.has(key)),
			...[...allKeys].filter((key) => !orderedKeys.includes(key)),
		]
	}, [searchResults])

	const filteredResults = useMemo(() => {
		if (!searchResults?.data) return []
		if (!resultSearch.trim()) {
			return searchResults.data
		}
		const searchLower = resultSearch.toLowerCase()
		return searchResults.data.filter((result) => {
			return Object.values(result).some((value) => {
				if (value === null || value === undefined) return false
				return String(value).toLowerCase().includes(searchLower)
			})
		})
	}, [searchResults, resultSearch])

	const paginatedResults = useMemo(() => {
		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
		return filteredResults.slice(startIndex, startIndex + ITEMS_PER_PAGE)
	}, [filteredResults, currentPage])

	const totalPages = useMemo(() => {
		if (!filteredResults.length) return 0
		return Math.ceil(filteredResults.length / ITEMS_PER_PAGE)
	}, [filteredResults])

	const currentSearchTypeConfig = useMemo(() => {
		return searchTypes.find((st) => st.id === activeSearchType) || searchTypes[0]
	}, [activeSearchType])

	const renderSearchForm = () => {
		return (
			<div className="space-y-4">
				<div className="flex flex-wrap gap-2">
					{searchTypes.map((st) => (
						<Button
							key={st.id}
							variant={activeSearchType === st.id ? "default" : "outline"}
							onClick={() => {
								setActiveSearchType(st.id)
								setQuery("")
								setError(null)
								setSearchResults(null)
								setCurrentPage(1)
								setResultSearch("")
							}}
							className="flex items-center"
						>
							<st.Icon className="w-4 h-4 mr-2" />
							{st.label}
						</Button>
					))}
				</div>
				<div className="relative">
					<Input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder={currentSearchTypeConfig.placeholder}
						className="pr-20"
						onKeyDown={(e) => e.key === "Enter" && !isSearching && handleSearch()}
					/>
					<Button
						className="absolute right-0 top-0 h-full rounded-l-none"
						onClick={handleSearch}
						disabled={isSearching || !query.trim()}
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
				<h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
					<Database className="h-8 w-8" />
					OSINT Solutions
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
						OSINT Solutions Search
					</CardTitle>
				</CardHeader>
				<CardContent>{renderSearchForm()}</CardContent>
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
							<AlertTriangle className="h-5 w-5" />
						</div>
						<div className="flex-1">
							<AlertTitle>
								{error.toLowerCase().includes("subscription") ? "Subscription Required" : "Error"}
							</AlertTitle>
							<AlertDescription>{error}</AlertDescription>
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
								{searchResults.data.length > 0 && (
									<Badge variant="secondary" className="ml-2">
										{searchResults.data.length}
										{searchResults.data.length === 1 ? " result" : " results"}
									</Badge>
								)}
							</CardTitle>
						</div>
						{searchResults.data.length > 0 && (
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
							{filteredResults.length > 0 ? (
								<div className="space-y-4">
									<div className="overflow-x-auto">
										<Table>
											<TableHeader>
												<TableRow>
													{resultKeys.map((key) => (
														<TableHead key={key}>
															{key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ")}
														</TableHead>
													))}
												</TableRow>
											</TableHeader>
											<TableBody>
												{paginatedResults.map((result, index) => (
													<TableRow key={index}>
														{resultKeys.map((key) => (
															<TableCell key={`${index}-${key}`}>
																{result[key] !== undefined && result[key] !== null && String(result[key]).trim() !== ""
																	? String(result[key])
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
									<Info className="h-4 w-4" />
									<AlertTitle>No results found</AlertTitle>
									<AlertDescription>
										No data available for <strong>{query || "your search query"}</strong> (
										{currentSearchTypeConfig.label}) in OSINT Solutions.
										{resultSearch && " Try adjusting your filter."}
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
