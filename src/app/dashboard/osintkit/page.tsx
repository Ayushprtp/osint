"use client"

import { useState, useCallback, useMemo } from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
	Search,
	ArrowLeft,
	Loader2,
	User,
	Mail,
	Phone,
	Home,
	FileText,
	AtSign,
	Database,
	Download,
	Info,
	AlertTriangle,
} from "lucide-react"

interface SearchParams {
	type: string
	query: string
}

interface OsintKitResult {
	database_name: string
	names?: string[]
	emails?: string[]
	phones?: string[]
	address?: string[]
	birth_date?: string
	social_networks?: Array<{
		name?: string
		id?: string
		url?: string
		username?: string
		message?: {
			text?: string
			url?: string
			created_at?: string
		}
	}>
	logins?: Array<{
		login?: string
		password?: string
	}>
	documents?: {
		passports?: Array<{
			serial?: string
		}>
		military_ids?: Array<{
			serial?: string
		}>
	}
	forces?: Array<{
		position?: string
		rank?: string
		unit?: string
	}>
	vehicles?: Array<{
		plate_number?: string
		vin?: string
	}>
	inn?: string
	snils?: string
	[key: string]: any
}

interface SearchResponse {
	data: OsintKitResult[]
	metadata: {
		total_records: number
	}
}

const ITEMS_PER_PAGE = 10

const searchTypes = [
	{ value: "username", label: "Username", icon: <User size={14} /> },
	{ value: "email", label: "Email", icon: <Mail size={14} /> },
	{ value: "phone", label: "Phone", icon: <Phone size={14} /> },
	{ value: "name", label: "Name", icon: <User size={14} /> },
	{ value: "address", label: "Address", icon: <Home size={14} /> },
	{ value: "passport", label: "Passport", icon: <FileText size={14} /> },
	{ value: "telegram", label: "Telegram ID", icon: <AtSign size={14} /> },
	{ value: "inn", label: "Tax (INN)", icon: <FileText size={14} /> },
	{ value: "snils", label: "Insurance (SNILS)", icon: <FileText size={14} /> },
	{ value: "birth_date", label: "Birth Date", icon: <FileText size={14} /> },
	{ value: "plate", label: "Vehicle Plate", icon: <FileText size={14} /> },
	{ value: "vin", label: "Vehicle VIN", icon: <FileText size={14} /> },
]

function ResultCard({ item, index, source }: { item: OsintKitResult; index: number; source: string }) {
	const renderValue = (value: any): React.ReactNode => {
		if (Array.isArray(value)) {
			if (value.length === 0) return <span className="text-muted-foreground text-xs italic">empty</span>

			if (typeof value[0] !== "object" || value[0] === null) {
				return value.map((v, i) => (
					<Badge key={i} variant="outline" className="mr-1 mb-1 text-xs">
						{String(v)}
					</Badge>
				))
			}

			return (
				<div className="space-y-2 mt-1">
					{value.map((obj, idx) => (
						<div key={idx} className="pl-2 border-l-2 border-muted">
							{Object.entries(obj).map(([k, v]) => (
								<div
									key={k}
									className="flex items-start text-xs border-b border-muted/50 pb-1 mb-1 last:border-b-0 last:pb-0 last:mb-0"
								>
									<span className="font-medium text-muted-foreground w-1/3 break-words pr-2">
										{k.charAt(0).toUpperCase() + k.slice(1).replace(/_/g, " ")}:
									</span>
									<span className="w-2/3 break-all text-foreground">{renderValue(v)}</span>
								</div>
							))}
						</div>
					))}
				</div>
			)
		}
		if (value && typeof value === "object") {
			return (
				<div className="space-y-1 mt-1">
					{Object.entries(value).map(([k, v]) => (
						<div
							key={k}
							className="flex items-start text-xs border-b border-muted/50 pb-1 mb-1 last:border-b-0 last:pb-0 last:mb-0"
						>
							<span className="font-medium text-muted-foreground w-1/3 break-words pr-2">
								{k.charAt(0).toUpperCase() + k.slice(1).replace(/_/g, " ")}:
							</span>
							<span className="w-2/3 break-all text-foreground">{renderValue(v)}</span>
						</div>
					))}
				</div>
			)
		}

		return String(value)
	}

	return (
		<Card className="overflow-hidden h-full flex flex-col">
			<CardHeader className="bg-muted/30 py-2 px-3 flex flex-row items-center justify-between">
				<CardTitle className="text-sm font-medium flex items-center gap-1.5">
					<Database size={14} className="text-primary flex-shrink-0" />
					<span>{source}</span>
				</CardTitle>
				<Badge variant="outline" className="text-xs">
					#{index + 1}
				</Badge>
			</CardHeader>
			<CardContent className="p-3 text-sm space-y-2 flex-1">
				{Object.entries(item)
					.filter(([key]) => !key.startsWith("_") && key !== "database_name")
					.map(([key, value]) => {
						if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
							return null
						}

						return (
							<div key={key} className="flex items-start">
								<span className="font-medium text-muted-foreground w-1/3 break-words pr-2">
									{key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ")}:
								</span>
								<span className="w-2/3 break-all text-foreground">{renderValue(value)}</span>
							</div>
						)
					})}
			</CardContent>
		</Card>
	)
}

export default function OsintKit() {
	const [isSearching, setIsSearching] = useState(false)
	const [searchType, setSearchType] = useState<SearchParams["type"]>("username")
	const [query, setQuery] = useState("")
	const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [currentPage, setCurrentPage] = useState(1)
	const [resultSearch, setResultSearch] = useState("")
	const [activeTab, setActiveTab] = useState("all")

	const flattenedResults = useMemo(() => {
		if (!searchResults?.data) return []
		return searchResults.data.map((item: OsintKitResult) => [item.database_name, item] as [string, OsintKitResult])
	}, [searchResults])

	const resultKeys = useMemo(() => {
		if (!flattenedResults.length) return []
		return Array.from(new Set(flattenedResults.flatMap(([, row]: [string, OsintKitResult]) => Object.keys(row))))
	}, [flattenedResults])

	const filteredResults = useMemo(() => {
		if (!resultSearch.trim()) return flattenedResults
		const term = resultSearch.toLowerCase()
		return flattenedResults.filter(([, row]: [string, OsintKitResult]) =>
			Object.values(row || {}).some((val) => val && String(val).toLowerCase().includes(term)),
		)
	}, [flattenedResults, resultSearch])

	const totalPages = useMemo(() => {
		return Math.ceil(filteredResults.length / ITEMS_PER_PAGE)
	}, [filteredResults])

	const paginatedResults = useMemo(() => {
		const start = (currentPage - 1) * ITEMS_PER_PAGE
		return filteredResults.slice(start, start + ITEMS_PER_PAGE)
	}, [filteredResults, currentPage])

	const sourceResults = useMemo(() => {
		const groupedResults: Record<string, [string, OsintKitResult][]> = {}

		filteredResults.forEach((result: [string, OsintKitResult]) => {
			const [source, data] = result
			if (!groupedResults[source]) {
				groupedResults[source] = []
			}
			groupedResults[source].push([source, data])
		})

		return groupedResults
	}, [filteredResults])

	const handleSearch = useCallback(async () => {
		if (!query.trim()) {
			setError("Please enter a search query")
			return
		}

		if (searchType === "birth_date") {
			const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/
			if (!dateRegex.test(query)) {
				setError("Birth date must be in DD.MM.YYYY format")
				return
			}
		}

		setIsSearching(true)
		setError(null)
		setSearchResults(null)
		try {
			const res = await fetch("/api/osintkit", {
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
			setActiveTab("all")
		} catch (err: unknown) {
			console.error("Error fetching data:", err)

			if (err instanceof Error) {
				if (err.message === "SUBSCRIPTION_REQUIRED") {
					setError("Active subscription required. Please purchase a subscription to continue using this service.")
				} else {
					setError(err.message || "An unknown error occurred")
				}
			} else {
				setError("An unknown error occurred")
			}
		} finally {
			setIsSearching(false)
		}
	}, [query, searchType])

	const handleExport = useCallback(() => {
		if (!searchResults) return

		try {
			const exportData = JSON.stringify(searchResults, null, 2)
			const blob = new Blob([exportData], { type: "application/json" })
			const url = URL.createObjectURL(blob)
			const link = document.createElement("a")
			link.href = url
			link.download = `osintkit-${searchType}-${query}-${Date.now()}.json`
			link.click()
			setTimeout(() => URL.revokeObjectURL(url), 0)
		} catch (error) {
			console.error("Error exporting data:", error)
			setError("Failed to export data. There might be circular references in the result.")
		}
	}, [searchResults, searchType, query])

	const renderResultTabs = () => {
		const sources = Object.keys(sourceResults)
		const allCount = filteredResults.length

		return (
			<Card className="overflow-hidden">
				<CardHeader className="p-0 border-b bg-muted/30">
					<div className="flex overflow-x-auto px-3">
						<button
							onClick={() => setActiveTab("all")}
							disabled={isSearching}
							className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                ${activeTab === "all" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
						>
							<Database size={14} />
							<span>All Sources</span>
							<Badge variant={activeTab === "all" ? "default" : "secondary"} className="ml-1 h-5 px-1.5 text-xs">
								{allCount}
							</Badge>
						</button>

						{sources.map((source) => (
							<button
								key={source}
								onClick={() => setActiveTab(source)}
								disabled={isSearching}
								className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                  ${activeTab === source ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
							>
								<Database size={14} />
								<span>{source}</span>
								<Badge variant={activeTab === source ? "default" : "secondary"} className="ml-1 h-5 px-1.5 text-xs">
									{sourceResults[source].length}
								</Badge>
							</button>
						))}
					</div>
				</CardHeader>

				<CardContent className="p-4">
					{activeTab === "all" && (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{paginatedResults.map(([source, result], index) => (
								<ResultCard key={`${source}-all-${index}`} item={result} index={index} source={source} />
							))}
						</div>
					)}

					{sources.map(
						(source) =>
							activeTab === source && (
								<div key={source} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{sourceResults[source].map(([sourceName, result], index) => (
										<ResultCard key={`${sourceName}-${index}`} item={result} index={index} source={sourceName} />
									))}
								</div>
							),
					)}
				</CardContent>
			</Card>
		)
	}

	const renderPagination = () => {
		if (totalPages <= 1) return null

		return (
			<div className="flex justify-center items-center mt-6 gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
					disabled={currentPage === 1}
				>
					Previous
				</Button>
				<span className="text-sm text-muted-foreground">
					Page {currentPage} of {totalPages}
				</span>
				<Button
					variant="outline"
					size="sm"
					onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
					disabled={currentPage === totalPages}
				>
					Next
				</Button>
			</div>
		)
	}

	return (
		<div className="container mx-auto py-6 px-4 space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">OsintKit Search</h1>
				<Button variant="outline" size="sm" asChild>
					<a href="/dashboard" className="flex items-center">
						<ArrowLeft className="w-4 h-4 mr-2" />
						<span>Back to Dashboard</span>
					</a>
				</Button>
			</div>

			<Card>
				<CardHeader className="pb-4">
					<CardTitle className="text-lg flex items-center gap-2">
						<Search className="h-5 w-5 text-primary" />
						<span>Search by {searchTypes.find((st) => st.value === searchType)?.label}</span>
					</CardTitle>
					<CardDescription className="text-sm">Search across multiple data sources with OsintKit</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex flex-wrap gap-2">
						{searchTypes.map((type) => (
							<Button
								key={type.value}
								variant={searchType === type.value ? "default" : "outline"}
								size="sm"
								className={`flex items-center gap-1.5 h-8 ${searchType === type.value ? "bg-red-600 hover:bg-red-700 text-white border-red-700" : ""}`}
								onClick={() => setSearchType(type.value)}
							>
								{type.icon}
								{type.label}
							</Button>
						))}
					</div>

					<div className="relative flex items-center">
						<Input
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder={`Enter ${searchType}...`}
							className="pr-11 h-10 text-base"
							onKeyDown={(e) => {
								if (e.key === "Enter" && !isSearching) {
									handleSearch()
								}
							}}
						/>
						<Button
							size="icon"
							onClick={handleSearch}
							disabled={isSearching}
							className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 bg-red-600 hover:bg-red-700"
						>
							{isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
						</Button>
					</div>
				</CardContent>
			</Card>

			{isSearching && !searchResults && (
				<Card>
					<CardContent className="p-8">
						<div className="flex flex-col items-center justify-center space-y-4">
							<Loader2 className="h-12 w-12 animate-spin text-primary" />
							<div className="text-center">
								<h3 className="text-lg font-medium mb-1">Searching OsintKit</h3>
								<p className="text-muted-foreground text-sm">This may take a moment...</p>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{error && (
				<Alert
					variant={error.toLowerCase().includes("subscription") ? "default" : "destructive"}
					className={
						error.toLowerCase().includes("subscription")
							? "border-yellow-500/50 text-yellow-500 dark:border-yellow-500"
							: ""
					}
				>
					<AlertTriangle
						className={`h-4 w-4 ${error.toLowerCase().includes("subscription") ? "text-yellow-500" : ""}`}
					/>
					<AlertTitle>{error.toLowerCase().includes("subscription") ? "Subscription Required" : "Error"}</AlertTitle>
					<AlertDescription>
						{error}
						{error.toLowerCase().includes("subscription") && (
							<div className="mt-2">
								<button
									data-sell-store="57872"
									data-sell-product="282137"
									data-sell-darkmode="true"
									data-sell-theme="e11d48"
									className="bg-red-600 hover:bg-red-700 text-white h-8 rounded-md px-3 text-xs font-medium border-0 transition-colors duration-200 flex items-center gap-1.5"
								>
									View Subscription Plans
								</button>
							</div>
						)}
					</AlertDescription>
				</Alert>
			)}

			{searchResults && (
				<div className="space-y-6">
					{filteredResults.length > 0 ? (
						<>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Database className="h-5 w-5 text-primary" />
									<h2 className="text-xl font-bold">OsintKit Results ({filteredResults.length})</h2>
								</div>
								<div className="flex gap-2">
									<Input
										type="text"
										placeholder="Filter results..."
										value={resultSearch}
										onChange={(e) => setResultSearch(e.target.value)}
										className="max-w-[200px] h-9"
									/>
									<Button variant="outline" size="sm" onClick={handleExport} className="h-9">
										<Download className="h-4 w-4 mr-2" />
										Export
									</Button>
								</div>
							</div>

							{renderResultTabs()}
							{renderPagination()}
						</>
					) : (
						<Alert>
							<Info className="h-4 w-4" />
							<AlertTitle>No results found</AlertTitle>
							<AlertDescription>
								No data was found for your query. Try adjusting your search terms or search type.
							</AlertDescription>
						</Alert>
					)}
				</div>
			)}
		</div>
	)
}
