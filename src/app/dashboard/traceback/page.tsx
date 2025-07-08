"use client"

import { useState, useCallback, useEffect } from "react"
import {
	Search,
	Database,
	Mail,
	User,
	Key,
	Loader2,
	AlertTriangle,
	Download,
	Check,
	X,
	Filter,
	Shield,
	Globe,
	Info,
	Phone,
	Network,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const SEARCH_TYPES = [
	{ id: "email", name: "Email", icon: <Mail className="h-4 w-4" /> },
	{ id: "username", name: "Username", icon: <User className="h-4 w-4" /> },
	{ id: "password", name: "Password", icon: <Key className="h-4 w-4" /> },
	{ id: "ip_address", name: "IP Address", icon: <Network className="h-4 w-4" /> },
	{ id: "phone", name: "Phone", icon: <Phone className="h-4 w-4" /> },
	{ id: "url", name: "URL", icon: <Globe className="h-4 w-4" /> },
]

interface DatabaseBreachData {
	username?: string
	email?: string
	breach?: string
	source?: string
	[key: string]: any
}

interface LeakOSINTData {
	List?: {
		[databaseName: string]: {
			Data: Array<{
				Date: string
				Email: string
				[key: string]: any
			}>
			InfoLeak: string
			NumOfResults: number
		}
	}
	NumOfDatabase: number
	NumOfResults: number
	price: number
	"search time": number
	[key: string]: any
}

interface LeakCheckData {
	success: boolean
	error?: string
	[key: string]: any
}

interface DatabaseResults {
	success: boolean
	total: number
	results: {
		snusbase?: {
			count: number
			data: DatabaseBreachData[]
		}
		leakosint?: {
			count: number
			data: Array<{
				data: LeakOSINTData
				source: string
				[key: string]: any
			}>
		}
		leakcheck?: {
			count: number
			data: Array<{
				data: LeakCheckData
				source: string
				[key: string]: any
			}>
		}
		[key: string]: any
	}
	[key: string]: any
}

interface EmailDetails {
	deliverable: boolean
	full_inbox: boolean | null
	valid_format: boolean
	minimum_age_months: number
	earliest_profile_date: string
	[key: string]: any
}

interface EmailDomainDetails {
	accept_all: boolean
	created: string
	custom: boolean
	disposable: boolean
	dmarc_enforced: boolean
	domain: string
	expires: string
	free: boolean
	registered: boolean
	registered_to: string | null
	registrar_name: string
	spf_strict: boolean
	suspicious_tld: boolean
	tld: string
	updated: string
	valid_mx: boolean
	website_exists: boolean
	[key: string]: any
}

interface AccountRegistrationCategory {
	registered: number
	checked: number
	[key: string]: any
}

interface AccountAggregates {
	total_registration: number
	business: {
		total_registration: number
		technology: AccountRegistrationCategory
		science_and_education: AccountRegistrationCategory
		jobs_and_employment: AccountRegistrationCategory
		money_transfer_remittance: AccountRegistrationCategory
		[key: string]: any
	}
	personal: {
		total_registration: number
		email_service: AccountRegistrationCategory
		technology: AccountRegistrationCategory
		adult_sites: AccountRegistrationCategory
		delivery: AccountRegistrationCategory
		ecommerce: AccountRegistrationCategory
		entertainment: AccountRegistrationCategory
		health_and_fitness: AccountRegistrationCategory
		social_media: AccountRegistrationCategory
		travel: AccountRegistrationCategory
		[key: string]: any
	}
	[key: string]: any
}

interface SearchResult {
	source: string
	data: any
	timeMs: number
	totalResults: number
	[key: string]: any
}

interface TracebackResponse {
	success: boolean
	results: {
		database?: DatabaseResults
		realtime?: any
		intelx?: any
		[key: string]: any
	}
	[key: string]: any
}

const formatCellValue = (key: string, value: any) => {
	if (value === undefined || value === null) {
		return <span className="text-muted-foreground">-</span>
	}

	if (key === "email" || key.includes("email")) {
		return (
			<div className="flex items-center">
				<Mail className="h-3.5 w-3.5 mr-1.5 text-muted-foreground flex-shrink-0" />
				<span className="truncate">{String(value)}</span>
			</div>
		)
	}

	if (key === "username" || key.includes("username")) {
		return (
			<div className="flex items-center">
				<User className="h-3.5 w-3.5 mr-1.5 text-muted-foreground flex-shrink-0" />
				<span className="truncate">{String(value)}</span>
			</div>
		)
	}

	if (key === "password" || key === "plaintext" || key === "hash") {
		return (
			<div className="flex items-center">
				<Key className="h-3.5 w-3.5 mr-1.5 text-muted-foreground flex-shrink-0" />
				<span className="font-mono text-xs truncate">
					{value === "********" ? <span className="text-muted-foreground">********</span> : String(value)}
				</span>
			</div>
		)
	}

	if (key === "lastip" || key === "regip" || key.includes("ip") || key === "ip_address") {
		return (
			<div className="flex items-center">
				<Network className="h-3.5 w-3.5 mr-1.5 text-muted-foreground flex-shrink-0" />
				<span className="font-mono">{String(value)}</span>
			</div>
		)
	}

	if (key === "_domain" || key === "domain" || key.includes("breach_domain")) {
		return (
			<div className="flex items-center">
				<Globe className="h-3.5 w-3.5 mr-1.5 text-muted-foreground flex-shrink-0" />
				<span className="truncate">{String(value)}</span>
			</div>
		)
	}

	if (key === "phone" || key.includes("phone") || key.includes("mobile") || key === "telephone") {
		return (
			<div className="flex items-center">
				<Phone className="h-3.5 w-3.5 mr-1.5 text-muted-foreground flex-shrink-0" />
				<span className="truncate">{String(value)}</span>
			</div>
		)
	}

	if (typeof value === "boolean") {
		return value ? (
			<Badge variant="default" className="bg-green-500">
				<Check className="h-3 w-3 mr-1" /> Yes
			</Badge>
		) : (
			<Badge variant="outline">
				<X className="h-3 w-3 mr-1" /> No
			</Badge>
		)
	}

	if (Array.isArray(value)) {
		if (value.length === 0) {
			return <span className="text-muted-foreground">None</span>
		}

		if (value.length <= 5 && value.every((item) => typeof item !== "object" || item === null)) {
			return <span>{value.join(", ")}</span>
		}

		return (
			<div className="space-y-1">
				{value.map((item, idx) => (
					<div key={`array-item-${idx}`} className="text-sm pl-2 border-l-2 border-muted">
						{typeof item === "object" && item !== null ? (
							<div className="space-y-1">
								{Object.entries(item).map(
									([itemKey, itemValue], i) =>
										!itemKey.startsWith("_") && (
											<div key={`item-obj-${i}`} className="text-xs">
												<span className="font-medium text-muted-foreground">{itemKey}: </span>
												{formatCellValue(itemKey, itemValue)}
											</div>
										),
								)}
							</div>
						) : (
							<span>{String(item)}</span>
						)}
					</div>
				))}
			</div>
		)
	}

	if (typeof value === "object" && value !== null) {
		const keys = Object.keys(value).filter((k) => !k.startsWith("_"))

		if (keys.length === 0) {
			return <span className="text-muted-foreground">Empty</span>
		}

		if (key === "breach" || key.includes("breach")) {
			return (
				<div className="space-y-1 text-xs">
					{Object.entries(value).map(([objKey, objValue], i) => (
						<div key={`breach-${i}`} className="flex items-start">
							<span className="font-medium text-muted-foreground mr-1">{objKey}:</span>
							{formatCellValue(objKey, objValue)}
						</div>
					))}
				</div>
			)
		}

		if (keys.length <= 5) {
			return (
				<div className="space-y-1 text-xs">
					{Object.entries(value).map(
						([objKey, objValue], i) =>
							!objKey.startsWith("_") && (
								<div key={`obj-${i}`} className="flex items-start">
									<span className="font-medium text-muted-foreground mr-1">{objKey}:</span>
									{formatCellValue(objKey, objValue)}
								</div>
							),
					)}
				</div>
			)
		}

		return (
			<span>
				{keys.length} value{keys.length !== 1 ? "s" : ""}
				<span className="text-xs text-muted-foreground ml-1">
					({keys.slice(0, 3).join(", ")}
					{keys.length > 3 ? ", ..." : ""})
				</span>
			</span>
		)
	}

	if (
		key.includes("date") ||
		key.includes("time") ||
		key.includes("created") ||
		key.includes("updated") ||
		key === "timestamp"
	) {
		try {
			const date = new Date(String(value))
			if (!Number.isNaN(date.getTime())) {
				return (
					<span>
						{date.toLocaleDateString()} {date.toLocaleTimeString()}
					</span>
				)
			}
		} catch (e) {}
	}

	return <span className="truncate">{String(value)}</span>
}

const NOSINTTableDisplay = ({ table }: { table: any }) => {
	if (!table || !table.headers || !table.values || table.values.length === 0) {
		return <span className="text-muted-foreground">No table data</span>
	}

	return (
		<div className="overflow-auto max-h-48 border rounded-md">
			<table className="min-w-full divide-y divide-border">
				<thead className="bg-muted">
					<tr>
						{table.headers.map((header: string, idx: number) => (
							<th
								key={`header-${idx}`}
								className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
							>
								{header}
							</th>
						))}
					</tr>
				</thead>
				<tbody className="bg-card divide-y divide-border">
					{table.values.map((row: any[], rowIdx: number) => (
						<tr key={`row-${rowIdx}`} className={rowIdx % 2 === 0 ? "bg-background" : "bg-muted/40"}>
							{row.map((cell: any, cellIdx: number) => (
								<td key={`cell-${rowIdx}-${cellIdx}`} className="px-3 py-2 whitespace-nowrap text-sm">
									{typeof cell === "object" && cell !== null ? (
										<div className="space-y-1">
											{Object.entries(cell).map(
												([key, value], i) =>
													!key.startsWith("_") && (
														<div key={`obj-${i}`} className="text-xs">
															<span className="font-medium text-muted-foreground">{key}: </span>
															{formatCellValue(key, value)}
														</div>
													),
											)}
										</div>
									) : cell === null ? (
										<span className="text-muted-foreground">-</span>
									) : (
										formatCellValue(table.headers[cellIdx].toLowerCase(), cell)
									)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

const ResultCard = ({ item, index, source }: { item: any; index: number; source: string }) => {
	const [isCopied, setIsCopied] = useState(false)
	const itemSource = item._source || source
	const itemPlugin = item._plugin || ""
	const isNosint = itemPlugin === "NOSINT"

	const displayData = { ...item }

	Object.keys(displayData).forEach((key) => {
		if (key.startsWith("_")) {
			delete displayData[key]
		}
	})

	const hasTable = displayData.table && typeof displayData.table === "object"
	const hasBadges = displayData.badges && Array.isArray(displayData.badges)
	const hasRecovery = displayData.recovery && typeof displayData.recovery === "object"
	const hasDisplay = displayData.display && typeof displayData.display === "object"
	const hasExecTimes = displayData.execution_times && typeof displayData.execution_times === "object"

	if (hasTable) displayData.table = undefined
	if (hasBadges) displayData.badges = undefined
	if (hasRecovery) displayData.recovery = undefined
	if (hasDisplay) displayData.display = undefined
	if (hasExecTimes) displayData.execution_times = undefined

	if (isNosint) {
		displayData.plugin_name = undefined
		displayData.execution_time = undefined
		displayData.service_name = undefined
		displayData.service_link = undefined
	}

	const copyToClipboard = () => {
		navigator.clipboard
			.writeText(JSON.stringify(item, null, 2))
			.then(() => {
				setIsCopied(true)
				setTimeout(() => setIsCopied(false), 2000)
			})
			.catch((err) => console.error("Failed to copy: ", err))
	}

	return (
		<Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
			<CardHeader className="bg-muted/20 py-3 px-4">
				<CardTitle className="text-base flex items-center justify-between">
					<span className="flex items-center gap-2">
						{isNosint && <Shield className="h-4 w-4 text-red-500" />}
						{itemSource === "Traceback" && <Search className="h-4 w-4 text-red-500" />}
						{isNosint ? (
							<span className="font-medium">{item.service_name || item.plugin_name || itemSource}</span>
						) : (
							`Result #${index + 1}`
						)}
					</span>
					<div className="flex items-center gap-2">
						{item.execution_time && (
							<Badge variant="outline" className="text-xs">
								{item.execution_time}
							</Badge>
						)}
						{itemPlugin && (
							<Badge variant="outline" className="font-mono text-xs">
								{itemPlugin}
							</Badge>
						)}
						<Badge variant="secondary" className="ml-2">
							{itemSource}
						</Badge>
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={copyToClipboard}>
										{isCopied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Download className="h-3.5 w-3.5" />}
									</Button>
								</TooltipTrigger>
								<TooltipContent side="left">
									<p>{isCopied ? "Copied!" : "Copy data as JSON"}</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				</CardTitle>
				{isNosint && item.service_link && (
					<CardDescription>
						<a
							href={item.service_link}
							target="_blank"
							rel="noopener noreferrer"
							className="text-blue-500 hover:underline flex items-center gap-1"
						>
							<Globe className="h-3 w-3" /> {item.service_link}
						</a>
					</CardDescription>
				)}
				{isNosint && hasBadges && (
					<div className="flex flex-wrap gap-1 mt-2">
						{item.badges.map((badge: string, i: number) => (
							<Badge key={`badge-${i}`} variant="default" className="bg-red-500/80 text-white">
								{badge}
							</Badge>
						))}
					</div>
				)}
			</CardHeader>
			<CardContent className="p-0">
				{/* Render table specially if present */}
				{hasTable && (
					<div className="p-3 border-b">
						<div className="text-sm font-medium text-muted-foreground mb-2">Table Data:</div>
						<NOSINTTableDisplay table={item.table} />
					</div>
				)}

				{/* Render recovery info specially if present */}
				{hasRecovery && (
					<div className="p-3 border-b">
						<div className="text-sm font-medium text-muted-foreground mb-2">Recovery Information:</div>
						<div className="grid grid-cols-2 gap-2 text-sm">
							{Object.entries(item.recovery).map(([key, value], i) => (
								<div key={`recovery-${i}`}>
									<span className="font-medium text-muted-foreground">{key}: </span>
									{formatCellValue(key, value)}
								</div>
							))}
						</div>
					</div>
				)}

				{/* Render display info specially if present */}
				{hasDisplay && (
					<div className="p-3 border-b">
						<div className="text-sm font-medium text-muted-foreground mb-2">Account Status:</div>
						<div className="grid grid-cols-2 gap-2 text-sm">
							{Object.entries(item.display).map(([key, value], i) => (
								<div key={`display-${i}`}>
									<span className="font-medium text-muted-foreground">{key}: </span>
									{formatCellValue(key, value)}
								</div>
							))}
						</div>
					</div>
				)}

				{/* Render execution times if present */}
				{hasExecTimes && (
					<div className="p-3 border-b">
						<div className="text-sm font-medium text-muted-foreground mb-2">Execution Times:</div>
						<div className="grid grid-cols-2 gap-2 text-sm">
							{Object.entries(item.execution_times).map(([key, value], i) => (
								<div key={`exec-${i}`}>
									<span className="font-medium text-muted-foreground">{key}: </span>
									{formatCellValue(key, value)}
								</div>
							))}
						</div>
					</div>
				)}

				{/* Render remaining fields */}
				{Object.keys(displayData).length > 0 && (
					<div className="divide-y">
						{Object.entries(displayData).map(([key, value]) => (
							<div
								key={`${source}-${key}-${index}`}
								className="flex items-start p-3 hover:bg-muted/20 transition-colors"
							>
								<span className="text-sm font-medium text-muted-foreground w-1/3 truncate pr-2">{key}:</span>
								<span className="text-sm ml-2 flex-1">{formatCellValue(key, value)}</span>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	)
}

export default function TracebackSearch() {
	const [query, setQuery] = useState("")
	const [activeSearchType, setActiveSearchType] = useState<string>("email")
	const [isSearching, setIsSearching] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [currentPage, setCurrentPage] = useState(1)
	const [useWildcard, setUseWildcard] = useState(false)
	const [results, setResults] = useState<SearchResult[]>([])
	const [activeSourceTab, setActiveSourceTab] = useState<string>("all")
	const [rawResponse, setRawResponse] = useState<any>(null)

	const [processedResults, setProcessedResults] = useState<{
		traceback: any[]
	}>({
		traceback: [],
	})

	useEffect(() => {
		setQuery("")
		setError(null)
		setCurrentPage(1)
	}, [activeSearchType])

	useEffect(() => {
		console.log("Processing results, length:", results.length)
		if (!results.length) return
		const tracebackResults: any[] = []

		try {
			results.forEach((result, resultIndex) => {
				console.log(`Processing result ${resultIndex}:`, result)
				console.log(`Result source: ${result.source}`)
				console.log("Result data:", result.data)

				if (result.source === "database") {
					const databaseData = result.data
					console.log("Database data structure:", databaseData)

					if (databaseData?.results && Array.isArray(databaseData.results)) {
						console.log("Found results array with length:", databaseData.results.length)
						databaseData.results.forEach((item: any, index: number) => {
							console.log(`Processing item ${index}:`, item)
							tracebackResults.push({
								...item,
								_source: "Traceback",
								_plugin: "Database",
							})
						})
					} else {
						console.log("No results array found or results is not an array")
						console.log("databaseData.results type:", typeof databaseData?.results)
						console.log("databaseData.results value:", databaseData?.results)
					}
				}
			})

			console.log("Final traceback results:", tracebackResults)
			console.log("Traceback results length:", tracebackResults.length)

			setProcessedResults({
				traceback: tracebackResults,
			})

			if (tracebackResults.length > 0) {
				setActiveSourceTab("traceback")
			} else {
				setActiveSourceTab("all")
			}
		} catch (error) {
			console.error("Error in results processing:", error)
			setError("An error occurred while processing the results. Please try again.")
		}
	}, [results])

	const handleSearch = useCallback(async () => {
		if (!query.trim()) {
			setError(`Please enter a ${activeSearchType} to search`)
			return
		}

		if (activeSearchType === "email" && !query.includes("@")) {
			setError("Please enter a valid email address")
			return
		}

		if (activeSearchType === "ip_address" && !/^(\d{1,3}\.){3}\d{1,3}$/.test(query)) {
			setError("Please enter a valid IP address")
			return
		}

		if (activeSearchType === "url" && !query.includes(".")) {
			setError("Please enter a valid domain")
			return
		}

		setIsSearching(true)
		setError(null)
		setResults([])
		setRawResponse(null)
		setCurrentPage(1)
		setProcessedResults({ traceback: [] })

		try {
			const startTime = performance.now()

			const response = await fetch("/api/traceback", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					query: query,
					field: activeSearchType,
					...(useWildcard && { use_wildcard: true }),
				}),
			})

			if (!response.ok) {
				const errorData = await response.json()
				setError(errorData.error || `API responded with status ${response.status}`)
				setIsSearching(false)
				return
			}

			const data: TracebackResponse = await response.json()
			setRawResponse(data)

			console.log("Full Traceback response:", data)

			const sourceResults: SearchResult[] = []

			if (data?.results) {
				if (data.results.database) {
					sourceResults.push({
						source: "database",
						data: data.results.database,
						timeMs: data.results.database.execution_time || 0,
						totalResults: data.results.database.stats?.total_results || data.results.database.results?.length || 0,
					})
				}

				if (data.results.intelx) {
					sourceResults.push({
						source: "intelx",
						data: data.results.intelx.results || [],
						timeMs: data.results.intelx.time_taken_ms || 0,
						totalResults: data.results.intelx.result_count || 0,
					})
				}
			}

			console.log("Source results:", sourceResults)
			setResults(sourceResults)

			if (sourceResults.length > 0) {
				setActiveSourceTab("all")
			}
		} catch (error) {
			console.error("Error during Traceback search:", error)
			setError("An error occurred while performing the search")
		} finally {
			setIsSearching(false)
		}
	}, [query, activeSearchType, useWildcard])

	const handleExport = useCallback(() => {
		if (!results.length) return

		try {
			const exportData = JSON.stringify(rawResponse, null, 2)
			const blob = new Blob([exportData], { type: "application/json" })
			const url = URL.createObjectURL(blob)
			const link = document.createElement("a")
			link.href = url
			link.download = `traceback-${activeSearchType}-${query}-${Date.now()}.json`
			link.click()
			setTimeout(() => URL.revokeObjectURL(url), 0)
		} catch (error) {
			console.error("Error exporting data:", error)
			setError("Failed to export data. There might be circular references in the result.")
		}
	}, [results, activeSearchType, query, rawResponse])

	const renderResultsBySource = () => {
		const { traceback } = processedResults
		const currentResults = activeSourceTab === "traceback" ? traceback : traceback

		if (!currentResults || currentResults.length === 0) {
			return (
				<Alert>
					<Info className="h-4 w-4" />
					<AlertTitle>No data found</AlertTitle>
					<AlertDescription>No data found for the selected source.</AlertDescription>
				</Alert>
			)
		}

		return (
			<div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
				{currentResults.map((item, index) => (
					<ResultCard
						key={`${item._source || "unknown"}-${index}`}
						item={item}
						index={index}
						source={item._source || (item._plugin ? `${item._plugin}` : "Unknown")}
					/>
				))}
			</div>
		)
	}

	return (
		<div className="container mx-auto py-6 sm:py-10 px-4 space-y-8">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Traceback Search</h1>
			</div>

			<Card className="shadow-sm">
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2 text-xl">
						<Search className="h-5 w-5 text-primary" />
						Search by {SEARCH_TYPES.find((st) => st.id === activeSearchType)?.name}
					</CardTitle>
					<CardDescription>Search across multiple data sources with Traceback</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-4">
						<ScrollArea className="w-full whitespace-nowrap pb-3">
							<div className="flex space-x-2 mb-4">
								{SEARCH_TYPES.map((type) => (
									<Button
										key={type.id}
										variant={activeSearchType === type.id ? "default" : "outline"}
										size="sm"
										onClick={() => setActiveSearchType(type.id)}
										className="flex items-center gap-2 transition-colors"
									>
										{type.icon}
										{type.name}
									</Button>
								))}
							</div>
						</ScrollArea>

						<div className="flex w-full items-center space-x-2">
							<div className="relative flex-1">
								<Input
									type="text"
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									placeholder={`Enter ${activeSearchType}${useWildcard ? " (wildcards supported)" : ""}...`}
									className="pr-10 shadow-sm"
									onKeyDown={(e) => {
										if (e.key === "Enter" && !isSearching) {
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

						<div className="flex flex-col md:flex-row justify-between gap-4 bg-muted/20 p-3 rounded-md">
							<div className="flex flex-wrap items-center gap-4">
								<div className="flex items-center gap-2">
									<Switch id="wildcard-mode" checked={useWildcard} onCheckedChange={setUseWildcard} />
									<Label htmlFor="wildcard-mode" className="cursor-pointer">
										Enable wildcard search
									</Label>
								</div>
							</div>

							<div className="flex items-center gap-2 text-muted-foreground">
								<Filter className="h-4 w-4" />
								<span className="text-sm">Limited to email, password, username, IP, phone, url fields</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{isSearching && (
				<Card className="shadow-sm">
					<CardContent className="p-8">
						<div className="flex flex-col items-center justify-center space-y-4">
							<div className="relative">
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="h-16 w-16 rounded-full border-4 border-primary/30" />
								</div>
								<Loader2 className="h-16 w-16 animate-spin text-primary" />
							</div>
							<div className="text-center">
								<h3 className="text-lg font-medium mb-2">Searching Traceback</h3>
								<p className="text-muted-foreground">This may take a moment to complete</p>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{error && (
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{results.length > 0 && (
				<Card className="shadow-sm">
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center justify-between text-xl">
							<span className="flex items-center gap-2">
								<Database className="h-5 w-5 text-primary" />
								Traceback Results
							</span>
							<div className="flex flex-wrap gap-2">
								<Badge variant="secondary" className="px-2 py-1 text-sm">
									{processedResults.traceback.length} Traceback results
								</Badge>
							</div>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex justify-end mb-4">
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="outline"
											size="sm"
											onClick={handleExport}
											disabled={!rawResponse}
											className="transition-colors"
										>
											<Download className="h-4 w-4 mr-2" />
											Export Raw Data
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<p>Download the complete response as JSON</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>

						<Tabs value={activeSourceTab} onValueChange={setActiveSourceTab} className="w-full">
							<TabsList className="mb-4 bg-muted/50 p-1 rounded-md">
								<TabsTrigger
									value="all"
									disabled={isSearching}
									className="transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
								>
									<div className="flex items-center gap-2">
										<Database className="h-4 w-4" />
										<span>All Sources</span>
										<Badge variant="secondary" className="ml-1">
											{processedResults.traceback.length}
										</Badge>
									</div>
								</TabsTrigger>
								<TabsTrigger
									value="traceback"
									disabled={isSearching}
									className="transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
								>
									<div className="flex items-center gap-2">
										<Search className="h-4 w-4" />
										<span>Traceback</span>
										<Badge variant="secondary" className="ml-1">
											{processedResults.traceback.length}
										</Badge>
									</div>
								</TabsTrigger>
							</TabsList>

							<TabsContent value="all" className="mt-6">
								{renderResultsBySource()}
							</TabsContent>
							<TabsContent value="traceback" className="mt-6">
								{renderResultsBySource()}
							</TabsContent>
						</Tabs>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
