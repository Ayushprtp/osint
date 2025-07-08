"use client"

import { useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Search, ChevronDown, ChevronUp, Loader2, Download, ArrowLeft, Database, AlertTriangle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WebsiteIcon } from "@/components/website-icon"
import Link from "next/link"

interface LeakData {
	Data: { [key: string]: string }[]
	InfoLeak: string
	NumOfResults: number
}

interface ApiResponse {
	success: boolean
	data: {
		List: { [key: string]: LeakData }
		NumOfDatabase: number
		NumOfResults: number
		free_requests_left: number
		price: number
		search_time: number
	}
}

export default function LeakOsint() {
	const [data, setData] = useState<ApiResponse["data"] | null>(null)
	const [query, setQuery] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [expandedModules, setExpandedModules] = useState<string[]>([])
	const [sortBy, setSortBy] = useState<"name" | "results">("name")
	const [filterQuery, setFilterQuery] = useState("")

	const fetchData = useCallback(async () => {
		if (!query.trim()) {
			setError("Please enter a search query")
			return
		}

		setIsLoading(true)
		setError(null)

		try {
			const response = await fetch("/api/leakosint", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ query }),
			})

			if (!response.ok) {
				const errorData = await response.json()

				if (response.status === 403 && errorData?.error?.includes("subscription")) {
					throw new Error("SUBSCRIPTION_REQUIRED")
				}

				throw new Error(errorData?.error || "Failed to fetch data")
			}

			const jsonData: ApiResponse = await response.json()
			setData(jsonData.data)
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
			setIsLoading(false)
		}
	}, [query])

	const toggleExpand = (module: string) => {
		setExpandedModules((prev) => (prev.includes(module) ? prev.filter((m) => m !== module) : [...prev, module]))
	}

	const renderPropertyValue = (value: string | boolean | number | null | undefined) => {
		if (typeof value === "boolean") {
			return value ? "Yes" : "No"
		}
		if (typeof value === "string") {
			if (value.startsWith("http://") || value.startsWith("https://")) {
				return (
					<a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
						{value.replace(/^https?:\/\//, "").replace(/\/$/, "")}
					</a>
				)
			}
			return value
		}
		return JSON.stringify(value)
	}

	const sortedAndFilteredData = useMemo(() => {
		if (!data) return []

		return Object.entries(data.List)
			.filter(
				([databaseName, leakData]) =>
					databaseName.toLowerCase().includes(filterQuery.toLowerCase()) ||
					leakData.InfoLeak.toLowerCase().includes(filterQuery.toLowerCase()),
			)
			.sort((a, b) => {
				if (sortBy === "name") {
					return a[0].localeCompare(b[0])
				}
				return b[1].NumOfResults - a[1].NumOfResults
			})
	}, [data, sortBy, filterQuery])

	const handleExport = () => {
		const dataToExport = sortedAndFilteredData.map(([databaseName, leakData]) => ({
			Database: databaseName,
			InfoLeak: leakData.InfoLeak,
			NumOfResults: leakData.NumOfResults,
			Data: leakData.Data.map((item) =>
				Object.fromEntries(Object.entries(item).map(([key, value]) => [key, renderPropertyValue(value)])),
			),
		}))

		const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
			type: "application/json",
		})
		const url = URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = url
		a.download = "leakosint-export.json"
		a.click()
	}

	return (
		<div className="container mx-auto py-8 px-4 space-y-8">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-3xl font-bold tracking-tight">LeakOsint</h1>
				<Button variant="outline" asChild>
					<Link href="/dashboard" className="flex items-center">
						<ArrowLeft className="w-4 h-4 mr-2" />
						<span>Back to Dashboard</span>
					</Link>
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Search</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col sm:flex-row gap-4">
						<Input
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Enter search query..."
							className="flex-1"
						/>
						<Button onClick={fetchData} disabled={isLoading}>
							{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
							Search
						</Button>
					</div>
				</CardContent>
			</Card>

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
										? "You need an active subscription to access this feature. Purchase a subscription to continue using LeakOSINT."
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
			{data && Object.keys(data.List).length === 0 && !isLoading && (
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

			{data && Object.keys(data.List).length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<span className="flex items-center gap-2">
								<Database className="h-5 w-5" />
								Search Results
							</span>
							<div className="flex items-center gap-2">
								<Badge variant="outline" className="flex items-center gap-2">
									Total Databases: {data.NumOfDatabase}
								</Badge>
							</div>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
								<div className="flex flex-wrap gap-2">
									<Button variant="outline" disabled={isLoading || !data.NumOfResults} onClick={handleExport}>
										<Download className="mr-2 h-4 w-4" />
										Export
									</Button>
									<Select value={sortBy} onValueChange={(value) => setSortBy(value as "name" | "results")}>
										<SelectTrigger className="w-[180px]">
											<SelectValue placeholder="Sort by" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="name">Sort by Name</SelectItem>
											<SelectItem value="results">Sort by Results</SelectItem>
										</SelectContent>
									</Select>
									<Input
										type="text"
										value={filterQuery}
										onChange={(e) => setFilterQuery(e.target.value)}
										placeholder="Filter databases..."
										className="w-full sm:w-[200px]"
									/>
								</div>
							</div>
							{sortedAndFilteredData.map(([databaseName, leakData]) => (
								<Card key={databaseName}>
									<CardHeader>
										<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
											<CardTitle className="flex items-center gap-2">
												<WebsiteIcon domain={databaseName.toLowerCase()} size={24} />
												{databaseName}
											</CardTitle>
											<Badge variant="outline" className="flex items-center gap-2">
												Results: {leakData.NumOfResults}
											</Badge>
										</div>
									</CardHeader>
									<CardContent>
										<p className="text-sm text-muted-foreground mb-4">{leakData.InfoLeak}</p>
										<div className="flex justify-start sm:justify-between items-center mb-4">
											<Button variant="outline" size="sm" onClick={() => toggleExpand(databaseName)}>
												{expandedModules.includes(databaseName) ? (
													<ChevronUp className="h-4 w-4 mr-2" />
												) : (
													<ChevronDown className="h-4 w-4 mr-2" />
												)}
												{expandedModules.includes(databaseName) ? "Hide" : "Show"} Details
											</Button>
										</div>
										{expandedModules.includes(databaseName) && (
											<div className="space-y-4 overflow-x-auto">
												{leakData.Data.map((item) => (
													<Table key={databaseName}>
														<TableHeader>
															<TableRow>
																<TableHead className="w-1/3">Property</TableHead>
																<TableHead className="w-2/3">Value</TableHead>
															</TableRow>
														</TableHeader>
														<TableBody>
															{Object.entries(item).map(([key, value]) => (
																<TableRow key={key}>
																	<TableCell className="font-medium break-all">{key}</TableCell>
																	<TableCell className="font-mono break-all">{renderPropertyValue(value)}</TableCell>
																</TableRow>
															))}
														</TableBody>
													</Table>
												))}
											</div>
										)}
									</CardContent>
								</Card>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
