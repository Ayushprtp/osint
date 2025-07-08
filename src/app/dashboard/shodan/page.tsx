"use client"

import { useState, useCallback } from "react"
import {
	Search,
	AlertTriangle,
	Loader2,
	Globe,
	Server,
	Download,
	Network,
	Pencil,
	Database,
	Clock,
	GitBranch,
	MapPin,
	Info,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ShodanHostData, ShodanSearchResponse } from "@/services/shodan/types"
import { SHODAN_SEARCH_FACETS } from "@/lib/text"

type SearchMode = "host_info" | "search" | "count"

type SearchResponse = {
	success: boolean
	data: ShodanHostData | ShodanSearchResponse
	error?: string
}

type SearchResults = {
	mode: SearchMode
	data: ShodanHostData | ShodanSearchResponse
}

const DetailItem = ({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) => (
	<div className="flex justify-between items-center py-2">
		<span className="text-muted-foreground flex items-center gap-2">
			{icon}
			{label}
		</span>
		<span className="font-medium">{value || "N/A"}</span>
	</div>
)

export default function ShodanPage() {
	const [searchMode, setSearchMode] = useState<SearchMode>("host_info")
	const [isSearching, setIsSearching] = useState(false)
	const [ipAddress, setIpAddress] = useState("")
	const [query, setQuery] = useState("")
	const [facets, setFacets] = useState<string[]>([])
	const [minify, setMinify] = useState(false)
	const [history, setHistory] = useState(false)
	const [results, setResults] = useState<SearchResults | null>(null)
	const [error, setError] = useState<string | null>(null)

	const handleSearch = useCallback(async () => {
		if (searchMode === "host_info" && !ipAddress.trim()) {
			setError("Please enter an IP address")
			return
		}

		if ((searchMode === "search" || searchMode === "count") && !query.trim()) {
			setError("Please enter a search query")
			return
		}

		setIsSearching(true)
		setError(null)
		setResults(null)

		try {
			let requestBody: Record<string, any> = {}

			switch (searchMode) {
				case "host_info":
					requestBody = {
						type: "host_info",
						ip: ipAddress.trim(),
						minify,
						history,
					}
					break
				case "search":
					requestBody = {
						type: "search",
						query: query.trim(),
						minify,
						facets: facets.length > 0 ? facets.join(",") : undefined,
					}
					break
				case "count":
					requestBody = {
						type: "count",
						query: query.trim(),
						facets: facets.length > 0 ? facets.join(",") : undefined,
					}
					break
			}

			const response = await fetch("/api/shodan", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestBody),
			})

			const data: SearchResponse = await response.json()

			if (!response.ok || !data.success) {
				throw new Error(data.error || "An error occurred during the search")
			}

			setResults({
				mode: searchMode,
				data: data.data,
			})
		} catch (error) {
			console.error("Error fetching data:", error)

			if (error instanceof Error) {
				setError(error.message || "An error occurred while fetching data. Please try again.")
			} else {
				setError("An error occurred while fetching data. Please try again.")
			}
		} finally {
			setIsSearching(false)
		}
	}, [searchMode, ipAddress, query, facets, minify, history])

	const handleExportJSON = useCallback(() => {
		if (!results) return

		const jsonString = JSON.stringify(results.data, null, 2)
		const blob = new Blob([jsonString], { type: "application/json" })
		const url = URL.createObjectURL(blob)

		const a = document.createElement("a")
		a.href = url
		a.download = `shodan_${results.mode === "host_info" ? ipAddress : encodeURIComponent(query)}.json`
		document.body.appendChild(a)
		a.click()

		document.body.removeChild(a)
		URL.revokeObjectURL(url)
	}, [results, ipAddress, query])

	const renderSearchForm = () => {
		return (
			<div className="flex flex-col gap-4">
				<div className="flex flex-wrap gap-2 mb-2">
					<Button
						variant={searchMode === "host_info" ? "default" : "outline"}
						size="sm"
						onClick={() => setSearchMode("host_info")}
						className="flex items-center gap-2"
					>
						<Server className="h-4 w-4" />
						Host Info
					</Button>
					<Button
						variant={searchMode === "search" ? "default" : "outline"}
						size="sm"
						onClick={() => setSearchMode("search")}
						className="flex items-center gap-2"
					>
						<Search className="h-4 w-4" />
						Search
					</Button>
					<Button
						variant={searchMode === "count" ? "default" : "outline"}
						size="sm"
						onClick={() => setSearchMode("count")}
						className="flex items-center gap-2"
					>
						<Database className="h-4 w-4" />
						Count
					</Button>
				</div>

				{searchMode === "host_info" && (
					<div className="space-y-4">
						<div className="flex w-full items-center space-x-2">
							<div className="relative flex-1">
								<Input
									type="text"
									value={ipAddress}
									onChange={(e) => setIpAddress(e.target.value)}
									placeholder="Enter IP address (e.g., 8.8.8.8)"
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

						<div className="flex flex-col space-y-2">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="minify-host"
									checked={minify}
									onCheckedChange={(checked) => setMinify(checked as boolean)}
								/>
								<Label htmlFor="minify-host">Minify (only return ports and general info, no banners)</Label>
							</div>

							<div className="flex items-center space-x-2">
								<Checkbox
									id="history-host"
									checked={history}
									onCheckedChange={(checked) => setHistory(checked as boolean)}
								/>
								<Label htmlFor="history-host">Include historical data</Label>
							</div>
						</div>
					</div>
				)}

				{searchMode === "search" && (
					<div className="space-y-4">
						<div className="flex w-full items-center space-x-2">
							<div className="relative flex-1">
								<Input
									type="text"
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									placeholder="Search query (e.g., apache country:US)"
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

						<div className="flex flex-col space-y-2">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="minify-search"
									checked={minify}
									onCheckedChange={(checked) => setMinify(checked as boolean)}
								/>
								<Label htmlFor="minify-search">Minify results</Label>
							</div>

							<div className="space-y-2">
								<Label htmlFor="facets">Facets (Analytics)</Label>
								<Select
									onValueChange={(value) => {
										if (!facets.includes(value)) {
											setFacets([...facets, value])
										}
									}}
								>
									<SelectTrigger>
										<SelectValue placeholder="Add a facet..." />
									</SelectTrigger>
									<SelectContent>
										{SHODAN_SEARCH_FACETS.filter((f) => !facets.includes(f)).map((facet) => (
											<SelectItem key={facet} value={facet}>
												{facet}
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								{facets.length > 0 && (
									<div className="flex flex-wrap gap-2 mt-2">
										{facets.map((facet) => (
											<Badge key={facet} variant="secondary" className="flex items-center gap-1">
												{facet}
												<button
													onClick={() => setFacets(facets.filter((f) => f !== facet))}
													className="ml-1 rounded-full hover:bg-muted p-0.5"
												>
													<svg
														width="12"
														height="12"
														viewBox="0 0 12 12"
														fill="none"
														xmlns="http://www.w3.org/2000/svg"
													>
														<path
															d="M2 2L10 10M2 10L10 2"
															stroke="currentColor"
															strokeWidth="1.5"
															strokeLinecap="round"
															strokeLinejoin="round"
														/>
													</svg>
												</button>
											</Badge>
										))}
									</div>
								)}
							</div>
						</div>
					</div>
				)}

				{searchMode === "count" && (
					<div className="space-y-4">
						<div className="flex w-full items-center space-x-2">
							<div className="relative flex-1">
								<Input
									type="text"
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									placeholder="Search query (e.g., port:22)"
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

						<div className="space-y-2">
							<Label htmlFor="facets">Facets (Analytics)</Label>
							<Select
								onValueChange={(value) => {
									if (!facets.includes(value)) {
										setFacets([...facets, value])
									}
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder="Add a facet..." />
								</SelectTrigger>
								<SelectContent>
									{SHODAN_SEARCH_FACETS.filter((f) => !facets.includes(f)).map((facet) => (
										<SelectItem key={facet} value={facet}>
											{facet}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							{facets.length > 0 && (
								<div className="flex flex-wrap gap-2 mt-2">
									{facets.map((facet) => (
										<Badge key={facet} variant="secondary" className="flex items-center gap-1">
											{facet}
											<button
												onClick={() => setFacets(facets.filter((f) => f !== facet))}
												className="ml-1 rounded-full hover:bg-muted p-0.5"
											>
												<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
													<path
														d="M2 2L10 10M2 10L10 2"
														stroke="currentColor"
														strokeWidth="1.5"
														strokeLinecap="round"
														strokeLinejoin="round"
													/>
												</svg>
											</button>
										</Badge>
									))}
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		)
	}

	const renderHostInfoResults = () => {
		if (!results || results.mode !== "host_info") return null

		const hostData = results.data as ShodanHostData

		return (
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<h2 className="text-2xl font-bold">Host Information</h2>
					<Button variant="outline" onClick={handleExportJSON}>
						<Download className="h-4 w-4 mr-2" />
						Export JSON
					</Button>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Globe className="h-5 w-5" />
							Host Overview
						</CardTitle>
						<CardDescription>Details about {hostData.ip_str}</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-4">
								<div>
									<h3 className="text-sm font-medium">Basic Information</h3>
									<Separator className="my-2" />
									<div className="space-y-2">
										<DetailItem label="IP Address" value={hostData.ip_str} icon={<Network className="h-4 w-4" />} />
										<DetailItem label="Organization" value={hostData.org} icon={<Server className="h-4 w-4" />} />
										<DetailItem label="ISP" value={hostData.isp} icon={<Database className="h-4 w-4" />} />
										<DetailItem label="ASN" value={hostData.asn} icon={<GitBranch className="h-4 w-4" />} />
										<DetailItem
											label="Last Update"
											value={new Date(hostData.last_update).toLocaleString()}
											icon={<Clock className="h-4 w-4" />}
										/>
										<DetailItem
											label="Operating System"
											value={hostData.os || "Unknown"}
											icon={<Pencil className="h-4 w-4" />}
										/>
									</div>
								</div>
							</div>

							<div className="space-y-4">
								<div>
									<h3 className="text-sm font-medium">Location</h3>
									<Separator className="my-2" />
									<div className="space-y-2">
										<DetailItem label="Country" value={hostData.country_name} icon={<MapPin className="h-4 w-4" />} />
										<DetailItem label="City" value={hostData.city || "Unknown"} icon={<MapPin className="h-4 w-4" />} />
										<DetailItem
											label="Coordinates"
											value={`${hostData.latitude}, ${hostData.longitude}`}
											icon={<MapPin className="h-4 w-4" />}
										/>
										<DetailItem
											label="Region Code"
											value={hostData.region_code || "Unknown"}
											icon={<Info className="h-4 w-4" />}
										/>
										<DetailItem
											label="Postal Code"
											value={hostData.postal_code || "Unknown"}
											icon={<Info className="h-4 w-4" />}
										/>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{hostData.hostnames && hostData.hostnames.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Globe className="h-5 w-5" />
								Hostnames & Domains
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{hostData.hostnames && hostData.hostnames.length > 0 && (
									<div>
										<h3 className="text-sm font-medium">Hostnames</h3>
										<div className="flex flex-wrap gap-2 mt-2">
											{hostData.hostnames.map((hostname) => (
												<Badge key={hostname} variant="outline">
													{hostname}
												</Badge>
											))}
										</div>
									</div>
								)}

								{hostData.domains && hostData.domains.length > 0 && (
									<div className="mt-4">
										<h3 className="text-sm font-medium">Domains</h3>
										<div className="flex flex-wrap gap-2 mt-2">
											{hostData.domains.map((domain) => (
												<Badge key={domain}>{domain}</Badge>
											))}
										</div>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				)}

				{hostData.ports && hostData.ports.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Server className="h-5 w-5" />
								Open Ports
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-wrap gap-2">
								{hostData.ports.map((port) => (
									<Badge key={port} variant="secondary">
										{port}
									</Badge>
								))}
							</div>
						</CardContent>
					</Card>
				)}

				{hostData.data && hostData.data.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Server className="h-5 w-5" />
								Services
							</CardTitle>
							<CardDescription>{hostData.data.length} services found</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-6">
								{hostData.data.map((service, index) => (
									<div key={index} className="border rounded-lg p-4">
										<div className="flex justify-between items-center mb-2">
											<h3 className="font-medium">
												{service.port} ({service.transport})
											</h3>
											<Badge>{service._shodan.module}</Badge>
										</div>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<p className="text-sm text-muted-foreground">Module: {service._shodan.module}</p>
												<p className="text-sm text-muted-foreground">
													Timestamp: {new Date(service.timestamp).toLocaleString()}
												</p>
											</div>
											{service.data && (
												<div>
													<p className="text-sm font-medium">Data:</p>
													<pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">{service.data}</pre>
												</div>
											)}
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		)
	}

	const renderSearchResults = () => {
		if (!results || results.mode !== "search") return null

		const searchData = results.data as ShodanSearchResponse

		return (
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<h2 className="text-2xl font-bold">Search Results</h2>
					<Button variant="outline" onClick={handleExportJSON}>
						<Download className="h-4 w-4 mr-2" />
						Export JSON
					</Button>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Results Overview</CardTitle>
						<CardDescription>
							Found {searchData.total} matches for "{query}"
						</CardDescription>
					</CardHeader>
					<CardContent>
						{searchData.total === 0 ? (
							<Alert>
								<AlertTriangle className="h-4 w-4" />
								<AlertTitle>No results found</AlertTitle>
								<AlertDescription>Try changing your search query or adding filters.</AlertDescription>
							</Alert>
						) : (
							<div className="space-y-4">
								<div className="flex flex-col gap-2">
									<div className="flex justify-between">
										<span className="font-medium">Total Results:</span>
										<span>{searchData.total.toLocaleString()}</span>
									</div>
									<div className="flex justify-between">
										<span className="font-medium">Results Shown:</span>
										<span>{searchData.matches.length}</span>
									</div>
								</div>

								{searchData.matches.length > 0 && (
									<div className="mt-6">
										<h3 className="text-sm font-medium mb-2">Matched Hosts</h3>
										<div className="space-y-4">
											{searchData.matches.map((match: any, index) => (
												<div key={index} className="border rounded-lg p-4">
													<div className="flex justify-between items-center mb-2">
														<h3 className="font-medium">
															{match.ip_str} - Port {match.port}
														</h3>
														{match.transport && <Badge>{match.transport}</Badge>}
													</div>
													<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
														<div>
															<p className="text-sm text-muted-foreground">Organization: {match.org || "Unknown"}</p>
															<p className="text-sm text-muted-foreground">
																Location: {match.location?.country_name || "Unknown"}
																{match.location?.city ? `, ${match.location.city}` : ""}
															</p>
															{match.hostnames && match.hostnames.length > 0 && (
																<p className="text-sm text-muted-foreground">Hostname: {match.hostnames[0]}</p>
															)}
														</div>
														{match.data && (
															<div>
																<p className="text-sm font-medium">Data:</p>
																<pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
																	{match.data.substring(0, 200)}
																	{match.data.length > 200 ? "..." : ""}
																</pre>
															</div>
														)}
													</div>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						)}
					</CardContent>
				</Card>

				{searchData.facets && Object.keys(searchData.facets).length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle>Analytics</CardTitle>
							<CardDescription>Facet analysis of the search results</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-6">
								{Object.entries(searchData.facets).map(([facetName, facetData]) => (
									<div key={facetName}>
										<h3 className="text-sm font-medium capitalize mb-2">{facetName}</h3>
										<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
											{facetData.map((item, index) => (
												<div key={index} className="border rounded-lg p-2 flex justify-between">
													<span className="text-sm truncate max-w-[70%]" title={item.value}>
														{item.value || "Unknown"}
													</span>
													<Badge variant="secondary">{item.count.toLocaleString()}</Badge>
												</div>
											))}
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		)
	}

	const renderCountResults = () => {
		if (!results || results.mode !== "count") return null

		const countData = results.data as ShodanSearchResponse

		return (
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<h2 className="text-2xl font-bold">Count Results</h2>
					<Button variant="outline" onClick={handleExportJSON}>
						<Download className="h-4 w-4 mr-2" />
						Export JSON
					</Button>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Count Overview</CardTitle>
						<CardDescription>Total count for "{query}"</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="rounded-lg bg-accent p-6 text-center">
							<div className="text-2xl font-bold">{countData.total.toLocaleString()}</div>
							<div className="text-sm text-muted-foreground">Total matching results</div>
						</div>
					</CardContent>
				</Card>

				{countData.facets && Object.keys(countData.facets).length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle>Analytics</CardTitle>
							<CardDescription>Facet analysis of the search results</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-6">
								{Object.entries(countData.facets).map(([facetName, facetData]) => (
									<div key={facetName}>
										<h3 className="text-sm font-medium capitalize mb-2">{facetName}</h3>
										<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
											{facetData.map((item, index) => (
												<div key={index} className="border rounded-lg p-2 flex justify-between">
													<span className="text-sm truncate max-w-[70%]" title={item.value}>
														{item.value || "Unknown"}
													</span>
													<Badge variant="secondary">{item.count.toLocaleString()}</Badge>
												</div>
											))}
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		)
	}

	const renderResults = () => {
		if (!results) return null

		switch (results.mode) {
			case "host_info":
				return renderHostInfoResults()
			case "search":
				return renderSearchResults()
			case "count":
				return renderCountResults()
			default:
				return null
		}
	}

	return (
		<div className="container p-4 space-y-8 max-w-screen-xl mx-auto">
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold">Shodan</h1>
			</div>

			<div className="grid grid-cols-1 gap-8">
				<Card>
					<CardHeader>
						<CardTitle>
							{searchMode === "host_info"
								? "Search by Host Info"
								: searchMode === "search"
									? "Search by Query"
									: "Count by Query"}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">{renderSearchForm()}</CardContent>
				</Card>
			</div>

			{error && (
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{renderResults()}
		</div>
	)
}
