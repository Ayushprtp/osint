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
	FileText,
	Filter,
	Mail,
	User,
	Globe,
	MapPin,
	Phone,
	Hash,
	Building,
	Home,
	Car,
	Key,
	X,
	UserCircle,
	HelpCircle,
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

type SearchField = {
	field: string
	value: string
}

type ResultItem = {
	breach: string
	[key: string]: any
}

type SearchResponse = {
	success: boolean
	timeTaken: number
	results: {
		index: string
		data: Record<string, any>[]
	}[]
}

const SEARCH_FIELDS = [
	{ value: "username", label: "Username", icon: <User size={16} /> },
	{ value: "password", label: "Password", icon: <Key size={16} /> },
	{ value: "first_name", label: "First Name", icon: <UserCircle size={16} /> },
	{ value: "email", label: "Email", icon: <Mail size={16} /> },
	{ value: "last_name", label: "Last Name", icon: <UserCircle size={16} /> },
	{ value: "ip", label: "IP Address", icon: <Globe size={16} /> },
	{ value: "domain", label: "Domain", icon: <Globe size={16} /> },
	{ value: "vin", label: "VIN", icon: <Car size={16} /> },
	{ value: "ssn", label: "SSN", icon: <Hash size={16} /> },
	{ value: "post_code", label: "Postal Code", icon: <MapPin size={16} /> },
	{ value: "state", label: "State", icon: <MapPin size={16} /> },
	{ value: "city", label: "City", icon: <Building size={16} /> },
	{ value: "address_line_1", label: "Address", icon: <Home size={16} /> },
	{ value: "phone", label: "Phone", icon: <Phone size={16} /> },
	{ value: "full_name", label: "Full Name", icon: <UserCircle size={16} /> },
]

const ITEMS_PER_PAGE = 10

export default function IntelVault() {
	const [searchFields, setSearchFields] = useState<SearchField[]>([{ field: "email", value: "" }])
	const [activeField, setActiveField] = useState("username")
	const [useWildcard, setUseWildcard] = useState(false)
	const [isSearching, setIsSearching] = useState(false)
	const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
	const [error, setError] = useState<string | null>(null)

	const [currentPage, setCurrentPage] = useState(1)
	const [resultSearch, setResultSearch] = useState("")
	const [activeFilters, setActiveFilters] = useState<string[]>([])

	const updateActiveFieldValue = useCallback(
		(value: string) => {
			const index = searchFields.findIndex((field) => field.field === activeField)
			if (index !== -1) {
				const newFields = [...searchFields]
				newFields[index].value = value
				setSearchFields(newFields)
			} else {
				setSearchFields([...searchFields, { field: activeField, value }])
			}
		},
		[searchFields, activeField],
	)

	const getActiveFieldValue = useCallback(() => {
		const field = searchFields.find((field) => field.field === activeField)
		return field ? field.value : ""
	}, [searchFields, activeField])

	const setFieldType = useCallback(
		(fieldType: string) => {
			setActiveField(fieldType)

			if (!searchFields.some((field) => field.field === fieldType)) {
				setSearchFields([...searchFields.filter((field) => field.value !== ""), { field: fieldType, value: "" }])
			}
		},
		[searchFields],
	)

	const getFieldIcon = useCallback((fieldType: string) => {
		const field = SEARCH_FIELDS.find((f) => f.value === fieldType)
		return field?.icon || <Search size={16} />
	}, [])

	const resultFields = useMemo(() => {
		if (!searchResults?.results) return []

		const fields = new Set<string>()
		searchResults.results.forEach((breach) => {
			breach.data.forEach((item) => {
				Object.keys(item).forEach((key) => fields.add(key))
			})
		})

		return Array.from(fields)
	}, [searchResults])

	const allResults = useMemo(() => {
		if (!searchResults?.results) return []

		return searchResults.results.flatMap((breach) =>
			breach.data.map(
				(item) =>
					({
						breach: breach.index,
						...item,
					}) as ResultItem,
			),
		)
	}, [searchResults])

	const paginatedResults = useMemo(() => {
		if (!allResults.length) return []

		let filtered = allResults
		if (activeFilters.length > 0) {
			filtered = allResults.filter((item) => {
				return activeFilters.some((filter) => item.breach === filter)
			})
		}

		if (resultSearch) {
			filtered = filtered.filter((item) =>
				Object.entries(item).some(
					([key, value]) => value && String(value).toLowerCase().includes(resultSearch.toLowerCase()),
				),
			)
		}

		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
		return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE)
	}, [allResults, currentPage, resultSearch, activeFilters])

	const totalPages = useMemo(() => {
		let filteredCount = allResults.length

		if (activeFilters.length > 0) {
			filteredCount = allResults.filter((item) => activeFilters.some((filter) => item.breach === filter)).length
		}

		if (resultSearch) {
			filteredCount = allResults.filter((item) =>
				Object.entries(item).some(
					([key, value]) => value && String(value).toLowerCase().includes(resultSearch.toLowerCase()),
				),
			).length
		}

		return Math.ceil(filteredCount / ITEMS_PER_PAGE)
	}, [allResults, resultSearch, activeFilters])

	const breachNames = useMemo(() => {
		if (!searchResults?.results) return []
		return [...new Set(searchResults.results.map((breach) => breach.index))]
	}, [searchResults])
	const handleSearch = useCallback(async () => {
		const hasValue = searchFields.some((field) => field.value.trim() !== "")
		if (!hasValue) {
			setError("Please enter at least one search value")
			return
		}

		setIsSearching(true)
		setError(null)
		setSearchResults(null)
		setCurrentPage(1)
		setActiveFilters([])

		try {
			const fields = searchFields
				.filter((field) => field.value.trim() !== "")
				.map((field) => ({ [field.field]: field.value.trim() }))

			const response = await fetch("/api/intelvault", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					fields,
					useWildcard,
				}),
			})

			if (!response.ok) {
				if (response.status === 500) {
					throw new Error("No results found from your query. Try modifying your search terms.")
				}

				const errorData = await response.json().catch(() => ({}))

				if (response.status === 403 && errorData?.error?.includes("subscription")) {
					throw new Error("SUBSCRIPTION_REQUIRED")
				}

				throw new Error(errorData?.error || "An error occurred during the search")
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
	}, [searchFields, useWildcard])

	const renderSearchForm = useCallback(() => {
		return (
			<div className="flex w-full items-center space-x-2">
				<div className="relative flex-1">
					<Input
						type="text"
						value={getActiveFieldValue()}
						onChange={(e) => updateActiveFieldValue(e.target.value)}
						placeholder={`Enter ${SEARCH_FIELDS.find((f) => f.value === activeField)?.label || activeField}...`}
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
	}, [getActiveFieldValue, updateActiveFieldValue, activeField, isSearching, handleSearch])

	const activeSearchTerms = useMemo(() => {
		return searchFields.filter((field) => field.value.trim() !== "")
	}, [searchFields])

	const removeSearchTerm = useCallback((field: string) => {
		setSearchFields((prev) => prev.filter((f) => f.field !== field))
	}, [])

	const toggleFilter = useCallback((breachName: string) => {
		setActiveFilters((prev) => {
			if (prev.includes(breachName)) {
				return prev.filter((name) => name !== breachName)
			}
			return [...prev, breachName]
		})
	}, [])

	const downloadResults = useCallback(
		(format: "json" | "csv" = "json") => {
			if (!searchResults) return

			let content = ""
			let filename = `intelvault-search-${new Date().toISOString().slice(0, 10)}`
			let mimeType = "application/json"

			if (format === "json") {
				content = JSON.stringify(searchResults, null, 2)
				filename += ".json"
			} else if (format === "csv") {
				const headers = resultFields
				content = `${["breach", ...headers].join(",")}\n`

				allResults.forEach((item) => {
					const row = ["breach", ...headers].map((field) => {
						if (field === "breach") return item.breach || ""
						return item[field] ? `"${String(item[field]).replace(/"/g, '""')}"` : ""
					})
					content += `${row.join(",")}\n`
				})

				filename += ".csv"
				mimeType = "text/csv"
			}

			const blob = new Blob([content], { type: mimeType })
			const url = URL.createObjectURL(blob)
			const a = document.createElement("a")
			a.href = url
			a.download = filename
			a.click()
		},
		[searchResults, resultFields, allResults],
	)

	return (
		<div className="container mx-auto py-8 px-4 space-y-8">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-3xl font-bold tracking-tight">IntelVault</h1>
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
						IntelVault Search by {SEARCH_FIELDS.find((st) => st.value === activeField)?.label}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-4">
						{/* Search Type Buttons */}
						<div className="flex flex-wrap gap-2 mb-2">
							{SEARCH_FIELDS.map((type) => (
								<Button
									key={type.value}
									variant={activeField === type.value ? "default" : "outline"}
									size="sm"
									onClick={() => setFieldType(type.value)}
									className="flex items-center gap-2"
								>
									{type.icon}
									{type.label}
								</Button>
							))}
						</div>

						{/* Search Input */}
						<div className="w-full">{renderSearchForm()}</div>

						{/* Active Search Terms */}
						{activeSearchTerms.length > 0 && (
							<div className="flex flex-wrap gap-2 mt-2">
								{activeSearchTerms.map((term) => (
									<Badge key={term.field} variant="secondary" className="flex items-center gap-1">
										{getFieldIcon(term.field)}
										<span>
											{SEARCH_FIELDS.find((f) => f.value === term.field)?.label}: {term.value}
										</span>
										<Button
											variant="ghost"
											size="icon"
											className="h-4 w-4 ml-1 p-0"
											onClick={() => removeSearchTerm(term.field)}
										>
											<X className="h-3 w-3" />
										</Button>
									</Badge>
								))}
								{activeSearchTerms.length > 0 && (
									<Button variant="outline" size="sm" className="text-xs" onClick={() => setSearchFields([])}>
										Clear All
									</Button>
								)}
							</div>
						)}

						{/* Wildcard Toggle */}
						<div className="flex items-center space-x-2">
							<Switch id="wildcard-mode" checked={useWildcard} onCheckedChange={setUseWildcard} />
							<Label htmlFor="wildcard-mode">Enable Wildcard Search</Label>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0">
											<HelpCircle className="h-4 w-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent className="max-w-xs">
										<p>
											Use <strong>*</strong> to match any number of characters and <strong>?</strong> to match a single
											character.
											<br />
											Examples:
											<br />- <code>john*</code> matches "john", "johnny", etc.
											<br />- <code>*smith</code> matches "smith", "joesmith", etc.
											<br />- <code>jo?n</code> matches "john", "joan", etc.
										</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>
					</div>
				</CardContent>
			</Card>

			{isSearching && !searchResults && (
				<div className="flex justify-center items-center p-8">
					<Loader2 className="h-8 w-8 animate-spin" />
					<span className="ml-2">Searching data breaches...</span>
				</div>
			)}

			{error && (
				<Alert
					variant={
						error.toLowerCase().includes("subscription")
							? "default"
							: error.toLowerCase().includes("no results")
								? "default"
								: "destructive"
					}
					className="animate-in fade-in duration-300"
				>
					<div className="flex items-start gap-3">
						<div className="flex-shrink-0 mt-0.5">
							{error.toLowerCase().includes("subscription") ? (
								<AlertTriangle className="h-5 w-5 text-amber-500" />
							) : error.toLowerCase().includes("no results") ? (
								<AlertTriangle className="h-5 w-5 text-yellow-500" />
							) : (
								<AlertTriangle className="h-5 w-5 text-red-500" />
							)}
						</div>
						<div className="flex-1 space-y-2">
							<div className="flex flex-col">
								<AlertTitle className="text-base font-semibold">
									{error.toLowerCase().includes("subscription")
										? "Subscription Required"
										: error.toLowerCase().includes("no results")
											? "No Results Found"
											: "Error Occurred"}
								</AlertTitle>
								<AlertDescription className="text-sm text-muted-foreground mt-1">
									{error.toLowerCase().includes("subscription")
										? "You need an active subscription to access this feature. Purchase a subscription to continue using IntelVault."
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

			{searchResults && searchResults.results.length === 0 && (
				<Alert variant="default">
					<div className="flex items-center gap-2 mb-1">
						<AlertTriangle className="h-4 w-4 text-yellow-500" />
						<AlertTitle>No results found</AlertTitle>
					</div>
					<AlertDescription>
						We couldn't find any matches in our database. Try broadening your search terms or adding different fields.
					</AlertDescription>
				</Alert>
			)}

			{searchResults && searchResults.results.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<span className="flex items-center gap-2">
								<Database className="h-5 w-5" />
								Search Results
							</span>
							<div className="flex items-center gap-2">
								<Badge variant="outline" className="flex items-center gap-2">
									Total Breaches: {breachNames.length}
								</Badge>
								<Badge variant="outline" className="flex items-center gap-2">
									Records Found: {allResults.length}
								</Badge>
								<Badge variant="outline" className="flex items-center gap-2">
									Search Time: {searchResults.timeTaken}ms
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
											onClick={() => downloadResults("json")}
											className="flex items-center gap-2"
										>
											<FileText className="h-4 w-4" />
											JSON
										</Button>
										<Button
											variant="outline"
											disabled={!searchResults}
											onClick={() => downloadResults("csv")}
											className="flex items-center gap-2"
										>
											<Download className="h-4 w-4" />
											CSV
										</Button>
										<Sheet>
											<SheetTrigger asChild>
												<Button variant="outline" className={activeFilters.length > 0 ? "bg-blue-100" : ""}>
													<Filter className="h-4 w-4 mr-2" />
													Filter
													{activeFilters.length > 0 && (
														<Badge variant="secondary" className="ml-2">
															{activeFilters.length}
														</Badge>
													)}
												</Button>
											</SheetTrigger>
											<SheetContent>
												<SheetHeader>
													<SheetTitle>Filter Results</SheetTitle>
													<SheetDescription>Filter results by breach sources</SheetDescription>
												</SheetHeader>
												<div className="py-4">
													<div className="space-y-4">
														{breachNames.map((breach) => (
															<div key={breach} className="flex items-center space-x-2">
																<Switch
																	id={`filter-${breach}`}
																	checked={activeFilters.includes(breach)}
																	onCheckedChange={() => toggleFilter(breach)}
																/>
																<Label htmlFor={`filter-${breach}`}>{breach}</Label>
															</div>
														))}
													</div>
													{activeFilters.length > 0 && (
														<Button variant="outline" className="mt-4" onClick={() => setActiveFilters([])}>
															<X className="h-4 w-4 mr-2" />
															Clear Filters
														</Button>
													)}
												</div>
											</SheetContent>
										</Sheet>
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

							{paginatedResults.length > 0 ? (
								<div className="space-y-4">
									<div className="overflow-x-auto">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Breach Source</TableHead>
													{resultFields.map((field) => (
														<TableHead key={field}>
															{SEARCH_FIELDS.find((f) => f.value === field)?.label || field}
														</TableHead>
													))}
												</TableRow>
											</TableHeader>
											<TableBody>
												{paginatedResults.map((result, index) => (
													<TableRow key={index}>
														<TableCell className="font-medium">{result.breach}</TableCell>
														{resultFields.map((field) => (
															<TableCell key={field}>{result[field] || "-"}</TableCell>
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
											disabled={currentPage === totalPages || totalPages === 0}
										>
											Next
											<ChevronRight className="h-4 w-4 ml-2" />
										</Button>
									</div>
								</div>
							) : (
								<Alert>
									<AlertTriangle className="h-4 w-4 mr-2" />
									<AlertTitle>No matching results</AlertTitle>
									<AlertDescription>
										Your filter criteria don't match any results. Try adjusting your filters.
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
