"use client"

import { useState, useMemo, useCallback, useRef } from "react"
import {
	Search,
	Database,
	ChevronLeft,
	ChevronRight,
	ArrowLeft,
	Download,
	AlertTriangle,
	Loader2,
	AtSign,
	UserCircle,
	Lock,
	Binary,
	TextCursor,
	Satellite,
	HelpCircle,
	MapPin,
	Shield,
	Wifi,
	Server,
	X,
	Globe,
	Radar,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import type { SearchResult, SearchParams } from "@/services/snusbase/types"

type SearchResponse = {
	success: boolean
	data: {
		results: Record<string, SearchResult[]>
		size: number
		took: number
	}
}

type IPInfo = {
	service_type: string
	reported_spam: boolean
	vpn_service: boolean
	ASN: string
	Subnetwork: string
	Provider: string
	hostname: string
	geo_result: {
		ipAddress: string
		latitude: number
		longitude: number
		countryName: string
		countryCode: string
		timeZone: string
		zipCode: string
		cityName: string
		regionName: string
	}
	vpn_port_scan: {
		tcp: Record<string, boolean>
		udp: Record<string, boolean>
	}
}

const searchTypes: { value: SearchParams["type"]; label: string }[] = [
	{ value: "email", label: "Email" },
	{ value: "username", label: "Username" },
	{ value: "lastip", label: "IP Address" },
	{ value: "name", label: "Name" },
	{ value: "password", label: "Password" },
	{ value: "hash", label: "Password Hash" },
	{ value: "_domain", label: "Domain" },
]

const ITEMS_PER_PAGE = 10

const isValidIP = (str: string): boolean => {
	const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

	const ipv6Pattern = /^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/i

	return ipv4Pattern.test(str) || ipv6Pattern.test(str)
}

export default function Snusbase() {
	const [isSearching, setIsSearching] = useState(false)
	const [searchType, setSearchType] = useState<SearchParams["type"]>("email")
	const [query, setQuery] = useState("")
	const [wildcard, setWildcard] = useState(false)
	const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
	const ipInfoCardRef = useRef<HTMLDivElement | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [currentPage, setCurrentPage] = useState(1)
	const [resultSearch, setResultSearch] = useState("")

	const [selectedIP, setSelectedIP] = useState<string | null>(null)
	const [ipInfo, setIpInfo] = useState<IPInfo | null>(null)
	const [isLoadingIpInfo, setIsLoadingIpInfo] = useState(false)
	const [ipInfoError, setIpInfoError] = useState<string | null>(null)
	const [showIPDetails, setShowIPDetails] = useState(false)

	const [batchIpMode, setBatchIpMode] = useState(false)
	const [batchIpResults, setBatchIpResults] = useState<Record<string, IPInfo>>({})
	const [batchIpProgress, setBatchIpProgress] = useState({
		current: 0,
		total: 0,
	})

	const flattenedResults = useMemo(() => {
		if (!searchResults?.data.results) return []
		return Object.entries(searchResults.data.results).flatMap(([dbName, rows]) =>
			Array.isArray(rows) ? rows.map((row) => [dbName, row] as [string, SearchResult]) : [],
		)
	}, [searchResults])

	const resultKeys = useMemo(() => {
		if (!flattenedResults.length) return []
		return Array.from(new Set(flattenedResults.flatMap(([, row]) => Object.keys(row))))
	}, [flattenedResults])

	const filteredResults = useMemo(() => {
		if (!resultSearch.trim()) return flattenedResults
		const term = resultSearch.toLowerCase()
		return flattenedResults.filter(([, row]) =>
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

	const renderSearchForm = () => {
		return (
			<div className="flex w-full items-center space-x-2">
				<div className="relative flex-1">
					<Input
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder={`Enter ${searchType}${wildcard ? " (wildcards: * and ?)" : ""}...`}
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

	const ipColumns = useMemo(() => {
		return resultKeys.filter((key) =>
			["ip", "lastip", "ipaddress", "ip_address", "last_ip"].includes(key.toLowerCase()),
		)
	}, [resultKeys])

	const scrollToIPInfo = useCallback(() => {
		if (ipInfoCardRef.current) {
			;(ipInfoCardRef.current as HTMLElement).scrollIntoView({
				behavior: "smooth",
				block: "start",
			})
		}
	}, [])

	const ipAddresses = useMemo(() => {
		const ips = new Set<string>()

		filteredResults.forEach(([, row]) => {
			ipColumns.forEach((key) => {
				const value = String(row[key] || "")
				if (value && isValidIP(value)) {
					ips.add(value)
				}
			})
		})

		return Array.from(ips)
	}, [filteredResults, ipColumns])

	const analyzeBatchIPs = useCallback(async () => {
		if (ipAddresses.length === 0) return

		setBatchIpMode(true)
		setBatchIpProgress({ current: 0, total: ipAddresses.length })
		setBatchIpResults({})
		const results: Record<string, IPInfo> = {}

		for (let i = 0; i < ipAddresses.length; i++) {
			const ip = ipAddresses[i]
			setBatchIpProgress({ current: i + 1, total: ipAddresses.length })

			try {
				const res = await fetch("/api/ipsearch", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ ip }),
				})

				if (res.ok) {
					const data = await res.json()
					if (data.success) {
						results[ip] = data.data
					}
				}
			} catch (error) {
				console.error(`Error analyzing IP ${ip}:`, error)
			}
		}

		setBatchIpResults(results)
	}, [ipAddresses])

	const handleSearch = useCallback(async () => {
		if (!query.trim()) {
			setError("Please enter a search query")
			return
		}
		setIsSearching(true)
		setError(null)
		setSearchResults(null)
		try {
			const res = await fetch("/api/snusbase", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ query, searchType, wildcard }),
			})

			if (!res.ok) {
				const errorData = await res.json()

				if (res.status === 403 && errorData?.error?.includes("subscription")) {
					throw new Error("SUBSCRIPTION_REQUIRED")
				}

				throw new Error(errorData?.error || "An error occurred during the search")
			}

			const data: SearchResponse = await res.json()
			setSearchResults(data)
			setCurrentPage(1)
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
	}, [query, searchType, wildcard])

	const getSearchTypeIcon = (type: SearchParams["type"]) => {
		switch (type) {
			case "email":
				return <AtSign className="h-4 w-4" />
			case "password":
				return <Lock className="h-4 w-4" />
			case "lastip":
				return <Satellite className="h-4 w-4" />
			case "username":
				return <UserCircle className="h-4 w-4" />
			case "name":
				return <TextCursor className="h-4 w-4" />
			case "hash":
				return <Binary className="h-4 w-4" />
			default:
				return <Radar className="h-4 w-4" />
		}
	}

	const downloadResults = useCallback(() => {
		if (!searchResults) return
		const blob = new Blob([JSON.stringify(searchResults, null, 2)], {
			type: "application/json",
		})
		const url = URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = url
		a.download = `snusbase-search-${searchType}-${query}.json`
		a.click()
	}, [searchResults, searchType, query])

	const fetchIPInfo = useCallback(async (ip: string) => {
		setIsLoadingIpInfo(true)
		setIpInfoError(null)
		setIpInfo(null)

		try {
			const res = await fetch("/api/ipsearch", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ip }),
			})

			if (!res.ok) {
				throw new Error(`Failed to fetch IP info: ${res.statusText}`)
			}

			const data = await res.json()
			if (!data.success) {
				throw new Error(data.message || "Failed to fetch IP information")
			}

			setIpInfo(data.data)
		} catch (err) {
			setIpInfoError(err instanceof Error ? err.message : "Failed to fetch IP information")
		} finally {
			setIsLoadingIpInfo(false)
		}
	}, [])

	const handleIPSelect = useCallback(
		(ip: string) => {
			setSelectedIP(ip)
			setShowIPDetails(true)
			fetchIPInfo(ip)
		},
		[fetchIPInfo],
	)

	const formatIPCell = useCallback(
		(value: string | undefined | null) => {
			if (!value) return "-"
			if (isValidIP(value)) {
				return (
					<div className="flex items-center space-x-2">
						<span>{value}</span>
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="sm"
										className="h-6 w-6 p-0"
										onClick={(e) => {
											e.stopPropagation()
											handleIPSelect(value)
											scrollToIPInfo()
										}}
									>
										<MapPin className="h-3.5 w-3.5" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>View IP information</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				)
			}
			return value
		},
		[handleIPSelect, scrollToIPInfo],
	)

	return (
		<div className="container mx-auto py-8 px-4 space-y-8">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-3xl font-bold tracking-tight">Snusbase</h1>
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
						<div className="flex items-center space-x-2">
							<Switch id="wildcard-mode" checked={wildcard} onCheckedChange={setWildcard} />
							<Label htmlFor="wildcard-mode">Enable Wildcard Search</Label>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0">
											<HelpCircle className="h-4 w-4" />
											<span className="sr-only">Wildcard info</span>
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
										? "You need an active subscription to access this feature. Purchase a subscription to continue using Snusbase."
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

			{searchResults && Object.keys(searchResults?.data.results).length === 0 && (
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

			{/* Batch IP Analysis Results Card */}
			{batchIpMode && (
				<Card className="border-2 border-primary/10">
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<span>
								IP Analysis Results ({Object.keys(batchIpResults).length}/{ipAddresses.length})
							</span>
							<Button variant="ghost" size="sm" onClick={() => setBatchIpMode(false)}>
								<X className="h-4 w-4" />
							</Button>
						</CardTitle>
					</CardHeader>
					<CardContent>
						{batchIpProgress.current < batchIpProgress.total && (
							<div className="mb-4">
								<div className="flex justify-between mb-2">
									<span>Analyzing IPs...</span>
									<span>
										{batchIpProgress.current}/{batchIpProgress.total}
									</span>
								</div>
								<div className="w-full bg-secondary h-2 rounded-full">
									<div
										className="bg-primary h-2 rounded-full"
										style={{
											width: `${(batchIpProgress.current / batchIpProgress.total) * 100}%`,
										}}
									/>
								</div>
							</div>
						)}

						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>IP Address</TableHead>
									<TableHead>Location</TableHead>
									<TableHead>ISP/ASN</TableHead>
									<TableHead>Security Flags</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{Object.entries(batchIpResults).map(([ip, info]) => (
									<TableRow key={ip}>
										<TableCell>{ip}</TableCell>
										<TableCell>
											{info.geo_result.cityName}, {info.geo_result.countryName} ({info.geo_result.countryCode})
										</TableCell>
										<TableCell>
											{info.Provider} / {info.ASN}
										</TableCell>
										<TableCell>
											<div className="flex gap-1 flex-wrap">
												{info.vpn_service && <Badge variant="secondary">VPN</Badge>}

												{info.reported_spam && <Badge variant="destructive">Spam</Badge>}
											</div>
										</TableCell>
										<TableCell>
											<Button
												variant="outline"
												size="sm"
												onClick={() => {
													setSelectedIP(ip)
													setIpInfo(info)
													setShowIPDetails(true)
													setTimeout(() => {
														scrollToIPInfo()
													}, 100)
												}}
											>
												Details
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>

						<div className="mt-4 space-y-4">
							<div className="flex flex-wrap gap-2">
								<Button variant="outline" size="sm" onClick={() => setBatchIpMode(false)}>
									Close Analysis
								</Button>

								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										const blob = new Blob([JSON.stringify(batchIpResults, null, 2)], {
											type: "application/json",
										})
										const url = URL.createObjectURL(blob)
										const a = document.createElement("a")
										a.href = url
										a.download = `ip-analysis-${new Date().toISOString()}.json`
										a.click()
									}}
								>
									<Download className="mr-2 h-3 w-3" />
									Export Analysis
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{searchResults && Object.keys(searchResults?.data.results).length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<span className="flex items-center gap-2">
								<Database className="h-5 w-5" />
								Search Results
							</span>
							<div className="flex items-center gap-2">
								<Badge variant="outline" className="flex items-center gap-2">
									Total Databases: {Object.keys(searchResults?.data.results).length}
								</Badge>
								{ipAddresses.length > 0 && (
									<Badge variant="secondary" className="flex items-center gap-2">
										<MapPin className="h-3 w-3" />
										IP Addresses: {ipAddresses.length}
									</Badge>
								)}
							</div>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
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

								{/* Replace the Analyze IP Addresses button with the new one */}
								{ipAddresses.length > 0 && (
									<Button
										variant="secondary"
										onClick={analyzeBatchIPs}
										className="flex items-center gap-2"
										disabled={isSearching || batchIpMode}
									>
										<Globe className="h-4 w-4" />
										Analyze All {ipAddresses.length} IP Addresses
									</Button>
								)}
							</div>
							{searchResults?.data.results && Object.keys(searchResults?.data.results).length > 0 ? (
								<div className="space-y-4">
									<div className="overflow-x-auto">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Database</TableHead>
													{resultKeys.map((key) => (
														<TableHead key={key}>{key}</TableHead>
													))}
												</TableRow>
											</TableHeader>
											<TableBody>
												{paginatedResults.map(([databaseName, result], rowIndex) => (
													<TableRow key={`${databaseName}-${rowIndex}`}>
														<TableCell>{databaseName}</TableCell>
														{resultKeys.map((key) => (
															<TableCell key={`${databaseName}-${rowIndex}-${key}`}>
																{ipColumns.includes(key) ? formatIPCell(result[key]) : result[key] || "-"}
															</TableCell>
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
					{ipAddresses.length > 0 && (
						<CardFooter className="flex flex-wrap gap-2 border-t pt-6">
							<div className="text-sm text-muted-foreground mb-2 w-full">IP Addresses found:</div>
							<div className="flex flex-wrap gap-2">
								{ipAddresses.slice(0, 8).map((ip) => (
									<Button
										key={ip}
										variant="outline"
										size="sm"
										onClick={() => handleIPSelect(ip)}
										className="flex items-center gap-1"
									>
										<MapPin className="h-3 w-3" />
										{ip}
									</Button>
								))}
								{ipAddresses.length > 8 && (
									<Badge variant="outline" className="ml-2">
										+{ipAddresses.length - 8} more
									</Badge>
								)}
							</div>
						</CardFooter>
					)}
				</Card>
			)}

			{/* IP Information Card - Replacement for Dialog */}

			{showIPDetails && (
				<Card ref={ipInfoCardRef} className="border-2 border-primary/10 shadow-lg scroll-mt-16">
					<CardHeader className="pb-2 flex flex-row items-center justify-between">
						<CardTitle className="text-xl flex items-center gap-2">
							<Globe className="h-5 w-5" />
							IP Information: {selectedIP}
						</CardTitle>
						<Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowIPDetails(false)}>
							<X className="h-4 w-4" />
						</Button>
					</CardHeader>
					<CardContent>
						{isLoadingIpInfo && (
							<div className="flex justify-center items-center p-8">
								<Loader2 className="h-8 w-8 animate-spin" />
							</div>
						)}

						{ipInfoError && (
							<Alert variant="destructive">
								<AlertTitle>Error</AlertTitle>
								<AlertDescription>{ipInfoError}</AlertDescription>
							</Alert>
						)}

						{ipInfo && !isLoadingIpInfo && (
							<div className="space-y-6">
								{/* Geo Location Information */}
								<Card>
									<CardHeader className="pb-2">
										<CardTitle className="text-sm flex items-center gap-2">
											<MapPin className="h-4 w-4" />
											Geographic Information
										</CardTitle>
									</CardHeader>
									<CardContent className="grid grid-cols-2 gap-2 pt-0">
										<div className="text-sm">
											<span className="text-muted-foreground">Country:</span>
											<div className="font-medium">
												{ipInfo.geo_result.countryName} ({ipInfo.geo_result.countryCode})
											</div>
										</div>
										<div className="text-sm">
											<span className="text-muted-foreground">City:</span>
											<div className="font-medium">
												{ipInfo.geo_result.cityName}, {ipInfo.geo_result.regionName}
											</div>
										</div>
										<div className="text-sm">
											<span className="text-muted-foreground">Zip Code:</span>
											<div className="font-medium">{ipInfo.geo_result.zipCode}</div>
										</div>
										<div className="text-sm">
											<span className="text-muted-foreground">Time Zone:</span>
											<div className="font-medium">{ipInfo.geo_result.timeZone}</div>
										</div>
										<div className="text-sm col-span-2">
											<span className="text-muted-foreground">Coordinates:</span>
											<div className="font-medium">
												{ipInfo.geo_result.latitude}, {ipInfo.geo_result.longitude}
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Network Information */}
								<Card>
									<CardHeader className="pb-2">
										<CardTitle className="text-sm flex items-center gap-2">
											<Server className="h-4 w-4" />
											Network Information
										</CardTitle>
									</CardHeader>
									<CardContent className="grid grid-cols-2 gap-2 pt-0">
										<div className="text-sm">
											<span className="text-muted-foreground">Hostname:</span>
											<div className="font-medium">{ipInfo.hostname || "N/A"}</div>
										</div>
										<div className="text-sm">
											<span className="text-muted-foreground">ASN:</span>
											<div className="font-medium">{ipInfo.ASN}</div>
										</div>
										<div className="text-sm">
											<span className="text-muted-foreground">Provider:</span>
											<div className="font-medium">{ipInfo.Provider}</div>
										</div>
										<div className="text-sm">
											<span className="text-muted-foreground">Subnetwork:</span>
											<div className="font-medium">{ipInfo.Subnetwork}</div>
										</div>
									</CardContent>
								</Card>

								{/* Security Information */}
								<Card>
									<CardHeader className="pb-2">
										<CardTitle className="text-sm flex items-center gap-2">
											<Shield className="h-4 w-4" />
											Security Assessment
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4 pt-0">
										<div className="grid grid-cols-2 gap-2">
											<div className="text-sm">
												<span className="text-muted-foreground">Service Type:</span>
												<div className="font-medium">{ipInfo.service_type || "Unknown"}</div>
											</div>
											<div className="text-sm">
												<span className="text-muted-foreground">VPN Service:</span>
												<div className="font-medium flex items-center">
													{ipInfo.vpn_service ? (
														<Badge variant="destructive" className="gap-1">
															<Wifi className="h-3 w-3" />
															Yes
														</Badge>
													) : (
														<Badge variant="outline" className="gap-1">
															<X className="h-3 w-3" />
															No
														</Badge>
													)}
												</div>
											</div>
											<div className="text-sm">
												<span className="text-muted-foreground">Reported as Spam:</span>
												<div className="font-medium">
													{ipInfo.reported_spam ? (
														<Badge variant="destructive" className="gap-1">
															<AlertTriangle className="h-3 w-3" />
															Yes
														</Badge>
													) : (
														<Badge variant="outline" className="gap-1">
															<X className="h-3 w-3" />
															No
														</Badge>
													)}
												</div>
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Port Scan Information */}
								<Card>
									<CardHeader className="pb-2">
										<CardTitle className="text-sm flex items-center gap-2">
											<Wifi className="h-4 w-4" />
											Port Scan Results
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4 pt-0">
										<div className="text-sm">
											<Badge variant="secondary" className="mb-2">
												TCP
											</Badge>
											<div className="grid grid-cols-3 gap-1">
												{Object.entries(ipInfo?.vpn_port_scan?.tcp || {}).map(([port, isOpen]) => (
													<div key={`tcp-${port}`} className="flex items-center gap-1">
														<Badge variant={isOpen ? "default" : "outline"} className="text-xs px-1">
															{port}
														</Badge>
													</div>
												))}
											</div>
										</div>
										<div className="text-sm">
											<Badge variant="secondary" className="mb-2">
												UDP
											</Badge>
											<div className="grid grid-cols-3 gap-1">
												{Object.entries(ipInfo?.vpn_port_scan?.udp || {}).map(([port, isOpen]) => (
													<div key={`udp-${port}`} className="flex items-center gap-1">
														<Badge variant={isOpen ? "default" : "outline"} className="text-xs px-1">
															{port}
														</Badge>
													</div>
												))}
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						)}

						{ipAddresses.length > 1 && (
							<div className="flex flex-wrap gap-2 w-full mt-6 pt-4 border-t">
								<div className="text-sm text-muted-foreground mb-1 w-full">Other IP Addresses:</div>
								{ipAddresses
									.filter((ip) => ip !== selectedIP)
									.slice(0, 5)
									.map((ip) => (
										<Button
											key={ip}
											variant="outline"
											size="sm"
											onClick={() => {
												setSelectedIP(ip)
												fetchIPInfo(ip)
											}}
											className="text-xs"
										>
											{ip}
										</Button>
									))}
							</div>
						)}
					</CardContent>
					<CardFooter className="justify-end">
						<Button onClick={() => setShowIPDetails(false)} className="w-full sm:w-auto">
							Close
						</Button>
					</CardFooter>
				</Card>
			)}
		</div>
	)
}
