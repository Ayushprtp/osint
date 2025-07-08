"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import {
	Search,
	ChevronLeft,
	ChevronRight,
	ArrowLeft,
	AlertTriangle,
	Loader2,
	Mail,
	User,
	Lock,
	Phone,
	Globe,
	Network,
	Hash,
	UserSquare,
	Database,
	FileJson,
	FileText,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader } from "@/components/ui/table"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import type { HackCheckSearchType } from "@/services/hackcheck/types"

interface HackCheckResult {
	email?: string
	username?: string
	password?: string
	full_name?: string
	ip_address?: string
	phone_number?: string
	hash?: string
	id?: string
	other_fields?: Record<string, any> | null
	sensitive_fields?: Record<string, any> | null
	source?: {
		name?: string
		date?: string
		unverified?: number
		passwordless?: number
		compilation?: number
	}
	[key: string]: any
}

interface ApiResponse {
	success: boolean
	data: {
		found: number
		databases: number
		first_seen: string
		last_seen: string
		elapsed: string
		results: HackCheckResult[]
	}
}

type SearchType = {
	value: HackCheckSearchType
	label: string
	icon: React.ReactElement
}

const ITEMS_PER_PAGE = 10

export default function HackCheck() {
	const [isSearching, setIsSearching] = useState(false)
	const [searchType, setSearchType] = useState<HackCheckSearchType>("email")
	const [query, setQuery] = useState("")
	const [searchResults, setSearchResults] = useState<ApiResponse["data"] | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [resultSearch, setResultSearch] = useState("")
	const [currentPage, setCurrentPage] = useState(1)

	useEffect(() => {
		setSearchResults(null)
		setError(null)
	}, [searchType])

	const searchTypes: SearchType[] = [
		{ value: "email", label: "Email", icon: <Mail className="h-4 w-4" /> },
		{ value: "username", label: "Username", icon: <User className="h-4 w-4" /> },
		{ value: "password", label: "Password", icon: <Lock className="h-4 w-4" /> },
		{ value: "full_name", label: "Full Name", icon: <UserSquare className="h-4 w-4" /> },
		{ value: "ip_address", label: "IP Address", icon: <Network className="h-4 w-4" /> },
		{ value: "phone_number", label: "Phone Number", icon: <Phone className="h-4 w-4" /> },
		{ value: "hash", label: "Hash", icon: <Hash className="h-4 w-4" /> },
		{ value: "domain", label: "Domain", icon: <Globe className="h-4 w-4" /> },
	]

	const getResultKeys = useMemo(() => {
		if (!searchResults || !searchResults.results.length) return []

		const allKeys = new Set<string>()

		for (const result of searchResults.results) {
			Object.keys(result).forEach((key) => {
				if (key !== "source" && key !== "other_fields" && key !== "sensitive_fields") {
					allKeys.add(key)
				}
			})

			if (result.source) {
				Object.keys(result.source).forEach((key) => {
					allKeys.add(`source_${key}`)
				})
			}

			if (result.other_fields && typeof result.other_fields === "object") {
				Object.keys(result.other_fields).forEach((key) => {
					allKeys.add(`other_${key}`)
				})
			}
		}

		return Array.from(allKeys)
	}, [searchResults])

	const getPaginatedResults = useMemo(() => {
		if (!searchResults?.results || !Array.isArray(searchResults?.results)) {
			return []
		}

		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
		const paginatedResults = searchResults.results.slice(startIndex, startIndex + ITEMS_PER_PAGE)
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
		if (!searchResults?.results || !Array.isArray(searchResults?.results)) return 0
		return Math.ceil(searchResults.results.length / ITEMS_PER_PAGE)
	}, [searchResults])

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
			const response = await fetch("/api/hackcheck", {
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

	const formatResultValue = (result: HackCheckResult, key: string) => {
		if (key.startsWith("source_")) {
			const sourceKey = key.replace("source_", "") as keyof typeof result.source
			return result.source?.[sourceKey] ?? "-"
		}

		if (key.startsWith("other_")) {
			const otherKey = key.replace("other_", "")
			if (result.other_fields && otherKey in result.other_fields) {
				const value = result.other_fields[otherKey]

				if (typeof value === "object" && value !== null) {
					return JSON.stringify(value)
				}

				return String(value)
			}
			return "-"
		}

		const value = result[key]

		if (value === null || value === undefined) {
			return "-"
		}

		if (typeof value === "object") {
			return JSON.stringify(value)
		}

		return String(value)
	}

	const downloadResults = useCallback(() => {
		if (!searchResults) return
		const blob = new Blob([JSON.stringify(searchResults, null, 2)], {
			type: "application/json",
		})
		const url = URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = url
		a.download = `hackcheck-search-${searchType}-${query}.json`
		a.click()
		URL.revokeObjectURL(url)
	}, [searchResults, searchType, query])

	const downloadUserPass = useCallback(() => {
		if (!searchResults || !searchResults.results.length) return

		const lines = searchResults.results
			.filter((result) => result.email && result.password)
			.map((result) => `${result.email}:${result.password}`)

		if (!lines.length) return

		const content = lines.join("\n")
		const blob = new Blob([content], { type: "text/plain" })
		const url = URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = url
		a.download = `hackcheck-user-pass-${query}.txt`
		a.click()
		URL.revokeObjectURL(url)
	}, [searchResults, query])

	const renderSearchForm = () => {
		return (
			<div className="relative">
				<Input
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder={`Enter ${searchType.replace(/_/g, " ")}...`}
					className="pr-20"
					onKeyDown={(e) => e.key === "Enter" && handleSearch()}
				/>
				<Button className="absolute right-0 top-0 h-full rounded-l-none" onClick={handleSearch} disabled={isSearching}>
					{isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
				</Button>
			</div>
		)
	}

	return (
		<div className="container mx-auto py-8 px-4 space-y-8">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
					<Search className="h-8 w-8" />
					HackCheck
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
										? "You need an active subscription to access this feature. Purchase a subscription to continue using HackCheck."
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
								<div className="flex gap-2">
									<Button variant="outline" size="sm" onClick={downloadResults} className="flex items-center gap-1">
										<FileJson className="h-4 w-4" />
										JSON
									</Button>
									<Button variant="outline" size="sm" onClick={downloadUserPass} className="flex items-center gap-1">
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
														<TableHead key={key}>
															{key.replace("source_", "source.").replace("other_", "other.")}
														</TableHead>
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
									{searchResults.results.length > ITEMS_PER_PAGE && (
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
