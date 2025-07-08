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
	Mail,
	User,
	Loader2,
	Search,
	AlertTriangle,
	Database,
	Phone,
	LockIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { BreachBaseSearchTypes } from "@/lib/text"

type SearchParams = {
	input: string[]
	type: BreachBaseSearchTypes
	page: number
}

type BreachResult = {
	email?: string
	username?: string
	password?: string
	ip?: string
	origin?: string
	name?: string
	phone?: string
	[key: string]: any
}

type BreachBaseApiResponse = {
	success: boolean
	data: BreachResult[]
	pagination: {
		page: number
		pageSize: number
		total: number
		totalPages: number
	}
	took: number
	error?: string
}

const ITEMS_PER_PAGE = 15

export default function BreachBase() {
	const [isSearching, setIsSearching] = useState(false)
	const [searchType, setSearchType] = useState<BreachBaseSearchTypes>("username")
	const [query, setQuery] = useState("")
	const [resultSearch, setResultSearch] = useState("")
	const [searchResults, setSearchResults] = useState<BreachBaseApiResponse | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [currentPage, setCurrentPage] = useState(1)

	const fetchPage = useCallback(
		async (page: number) => {
			setIsSearching(true)
			setError(null)
			try {
				const response = await fetch("/api/breachbase", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						input: [query.trim()],
						type: searchType,
						page,
					}),
				})
				if (!response.ok) {
					const errorData = await response.json()
					if (response.status === 403 && errorData?.error?.includes("subscription")) {
						throw new Error("SUBSCRIPTION_REQUIRED")
					}
					throw new Error(errorData?.error || "Search failed")
				}
				const data = await response.json()
				setSearchResults(data)
				setCurrentPage(page)
			} catch (error) {
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
		},
		[query, searchType],
	)

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
			const response = await fetch("/api/breachbase", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					input: [query.trim()],
					type: searchType,
					page: 1,
				}),
			})
			if (!response.ok) {
				const errorData = await response.json()
				if (response.status === 403 && errorData?.error?.includes("subscription")) {
					throw new Error("SUBSCRIPTION_REQUIRED")
				}
				throw new Error(errorData?.error || "Search failed")
			}
			const data = await response.json()
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
	}, [query, searchType])

	const resultKeys = useMemo(() => {
		if (!searchResults?.data || searchResults.data.length === 0) {
			return []
		}

		const allKeys = new Set<string>()
		for (const result of searchResults.data) {
			Object.keys(result).forEach((key) => {
				if (result[key] !== null && result[key] !== undefined && result[key] !== "") {
					allKeys.add(key)
				}
			})
		}

		const orderedKeys = ["username", "email", "password", "ip", "origin", "name", "phone"]
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
		return searchResults.data.filter((result: BreachResult) => {
			return Object.entries(result).some(([key, value]) => {
				if (value === null || value === undefined) return false
				return String(value).toLowerCase().includes(searchLower)
			})
		})
	}, [searchResults, resultSearch])

	const searchTypes = [
		{ value: "username" as BreachBaseSearchTypes, label: "Username", icon: <User className="h-4 w-4" /> },
		{ value: "email" as BreachBaseSearchTypes, label: "Email", icon: <Mail className="h-4 w-4" /> },
		{ value: "ip" as BreachBaseSearchTypes, label: "IP", icon: <Database className="h-4 w-4" /> },
		{ value: "phone" as BreachBaseSearchTypes, label: "Phone", icon: <Phone className="h-4 w-4" /> },
		{ value: "name" as BreachBaseSearchTypes, label: "Name", icon: <User className="h-4 w-4" /> },
		{ value: "password" as BreachBaseSearchTypes, label: "Password", icon: <LockIcon className="h-4 w-4" /> },
	]

	const renderSearchForm = () => {
		return (
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
				<div className="relative">
					<Input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder={`Enter ${searchType}...`}
						className="pr-20"
						onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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
				<h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
					<Database className="h-8 w-8" />
					BreachBase
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
						</div>
					</div>
				</Alert>
			)}

			{searchResults?.data && (
				<Card>
					<CardHeader>
						<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
							<CardTitle className="flex items-center gap-2">
								<Database className="h-5 w-5" />
								Search Results
								{searchResults.pagination?.total > 0 && (
									<Badge variant="secondary" className="ml-2">
										{searchResults.pagination.total} {searchResults.pagination.total === 1 ? "result" : "results"}
									</Badge>
								)}
							</CardTitle>
						</div>
						{searchResults.pagination?.total > 0 && (
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
													{resultKeys.map((key: string) => (
														<TableHead key={key}>
															{key.charAt(0).toUpperCase() + key.slice(1).replace("_", " ")}
														</TableHead>
													))}
												</TableRow>
											</TableHeader>
											<TableBody>
												{filteredResults.map((result: BreachResult, index: number) => (
													<TableRow key={index}>
														{resultKeys.map((key: string) => (
															<TableCell key={`${index}-${key}`}>
																{result[key] !== undefined && result[key] !== null && result[key] !== ""
																	? typeof result[key] === "boolean"
																		? result[key]
																			? "Yes"
																			: "No"
																		: String(result[key])
																	: "-"}
															</TableCell>
														))}
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>
									{searchResults.pagination.totalPages > 1 && (
										<div className="flex justify-between items-center mt-4">
											<Button
												onClick={() => fetchPage(searchResults.pagination.page - 1)}
												disabled={searchResults.pagination.page === 1 || isSearching}
											>
												<ChevronLeft className="h-4 w-4 mr-2" />
												Previous
											</Button>
											<span>
												Page {searchResults.pagination.page} of {searchResults.pagination.totalPages}
											</span>
											<Button
												onClick={() => fetchPage(searchResults.pagination.page + 1)}
												disabled={searchResults.pagination.page === searchResults.pagination.totalPages || isSearching}
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
