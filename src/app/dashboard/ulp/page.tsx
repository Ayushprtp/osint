"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import {
	Search,
	Database,
	ChevronLeft,
	ChevronRight,
	ArrowLeft,
	AlertTriangle,
	Loader2,
	FileText,
	Mail,
	Globe,
	HelpCircle,
	Clock,
	BarChart3,
	Link as LinkIcon,
	User,
	Lock,
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

type SearchParams = {
	domain: string
	strict: boolean
}

type SearchResponse = {
	success: boolean
	data: {
		domain: string
		total: number
		offset: number
		limit: number
		results: string[]
		max_reached: boolean
		time_ms: number
	}
}

type ParsedResult = {
	url: string
	email_username: string
	password: string
}

type ExportFormat = "json" | "txt" | "url-user-pass" | "user-pass"

const ITEMS_PER_PAGE = 10

export default function ULP() {
	const [isSearching, setIsSearching] = useState(false)
	const [domain, setDomain] = useState("")
	const [strict, setStrict] = useState(false)
	const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [currentPage, setCurrentPage] = useState(1)
	const [resultSearch, setResultSearch] = useState("")

	const parseResults = useMemo(() => {
		if (!searchResults?.data.results) {
			return []
		}

		return searchResults.data.results.map((result): ParsedResult => {
			if (result.startsWith("http://") || result.startsWith("https://")) {
				const protocolEndIndex = result.indexOf("://") + 3
				const remainingString = result.substring(protocolEndIndex)
				const nextColonIndex = remainingString.indexOf(":")

				if (nextColonIndex !== -1) {
					const url = result.substring(0, protocolEndIndex + nextColonIndex)
					const rest = result.substring(protocolEndIndex + nextColonIndex + 1)
					const restParts = rest.split(":")

					return {
						url: url,
						email_username: restParts[0] || "",
						password: restParts.slice(1).join(":") || "",
					}
				}
				return { url: result, email_username: "", password: "" }
			}
			if (result.startsWith("//")) {
				const parts = result.split(":")
				if (parts.length >= 3) {
					let urlPart = parts[0]
					let emailIndex = 1

					if (parts[1] && !parts[1].includes("@") && (parts[1].includes("/") || parts[1].length < 20)) {
						urlPart = `${parts[0]}:${parts[1]}`
						emailIndex = 2
					}

					return {
						url: urlPart,
						email_username: parts[emailIndex] || "",
						password: parts.slice(emailIndex + 1).join(":") || "",
					}
				}
				if (parts.length === 2) {
					return { url: parts[0], email_username: parts[1], password: "" }
				}
			} else {
				const parts = result.split(":")

				if (parts.length === 2) {
					if (parts[0].includes("@")) {
						return { url: "", email_username: parts[0], password: parts[1] }
					}
					if (parts[0].includes(".") && !parts[0].includes("@")) {
						return { url: parts[0], email_username: parts[1], password: "" }
					}
					return { url: "", email_username: parts[0], password: parts[1] }
				}
				if (parts.length >= 3) {
					if (parts[0].includes(".") && !parts[0].includes("@")) {
						return {
							url: parts[0],
							email_username: parts[1],
							password: parts.slice(2).join(":"),
						}
					}
					return {
						url: "",
						email_username: parts[0],
						password: parts.slice(1).join(":"),
					}
				}
			}

			return { url: "", email_username: result, password: "" }
		})
	}, [searchResults])

	const filteredResults = useMemo(() => {
		if (!resultSearch.trim()) return parseResults
		return parseResults.filter(
			(result) =>
				result.url.toLowerCase().includes(resultSearch.toLowerCase()) ||
				result.email_username.toLowerCase().includes(resultSearch.toLowerCase()) ||
				result.password.toLowerCase().includes(resultSearch.toLowerCase()),
		)
	}, [parseResults, resultSearch])

	const getPaginatedResults = useMemo(() => {
		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
		const paginatedResults = filteredResults.slice(startIndex, startIndex + ITEMS_PER_PAGE)
		return paginatedResults
	}, [filteredResults, currentPage])

	const totalPages = useMemo(() => {
		return Math.ceil(filteredResults.length / ITEMS_PER_PAGE)
	}, [filteredResults])

	const copyToClipboard = useCallback(async (text: string) => {
		if (!text) return

		try {
			await navigator.clipboard.writeText(text)
		} catch (err) {
			console.error("Failed to copy text: ", err)
			const textArea = document.createElement("textarea")
			textArea.value = text
			document.body.appendChild(textArea)
			textArea.select()
			document.execCommand("copy")
			document.body.removeChild(textArea)
		}
	}, [])

	useEffect(() => {
		setCurrentPage(1)
	}, [resultSearch])

	const handleSearch = useCallback(async () => {
		if (!domain.trim()) {
			setError("Please enter a domain to search")
			return
		}

		setIsSearching(true)
		setError(null)
		setSearchResults(null)

		try {
			const response = await fetch("/api/ulp", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ domain, strict }),
			})

			if (!response.ok) {
				const errorData = await response.json()

				if (response.status === 403 && errorData?.error?.includes("subscription")) {
					throw new Error("SUBSCRIPTION_REQUIRED")
				}

				throw new Error(errorData?.error || "An error occurred during the search")
			}

			const data: SearchResponse = await response.json()
			setSearchResults(data)
			setCurrentPage(1)
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
	}, [domain, strict])

	const downloadResults = useCallback(
		(format: ExportFormat = "json") => {
			if (!searchResults) return

			let content = ""
			let filename = `ulp-search-${domain}`
			let mimeType = "application/json"

			if (format === "json") {
				content = JSON.stringify(searchResults, null, 2)
				filename += ".json"
			} else if (format === "txt") {
				content = searchResults.data.results.join("\n")
				filename += ".txt"
				mimeType = "text/plain"
			} else if (format === "url-user-pass") {
				const formattedLines = parseResults
					.map((result) => {
						if (result.url) {
							return `${result.url}:${result.email_username}:${result.password}`
						}
						return `${result.email_username}:${result.password}`
					})
					.filter((line) => line.trim() !== "" && !line.endsWith(":"))
				content = formattedLines.join("\n")
				filename += ".txt"
				mimeType = "text/plain"
			} else if (format === "user-pass") {
				const formattedLines = parseResults
					.map((result) => `${result.email_username}:${result.password}`)
					.filter((line) => line.trim() !== "" && line !== ":" && !line.endsWith(":"))
				content = formattedLines.join("\n")
				filename += ".txt"
				mimeType = "text/plain"
			}

			const blob = new Blob([content], { type: mimeType })
			const url = URL.createObjectURL(blob)
			const a = document.createElement("a")
			a.href = url
			a.download = filename
			a.click()
		},
		[searchResults, domain, parseResults],
	)

	const renderSearchForm = () => {
		return (
			<div className="flex w-full items-center space-x-2">
				<div className="relative flex-1">
					<Input
						type="text"
						value={domain}
						onChange={(e) => setDomain(e.target.value)}
						placeholder="Enter domain (e.g., gmail.com)..."
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
				<h1 className="text-3xl font-bold tracking-tight">ULP.me</h1>
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
						<Globe className="h-5 w-5" />
						Domain Email Search
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-4">
						<div className="w-full">{renderSearchForm()}</div>
						<div className="flex items-center space-x-2">
							<Switch id="strict-mode" checked={strict} onCheckedChange={setStrict} />
							<Label htmlFor="strict-mode">Enable Strict Search</Label>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0">
											<HelpCircle className="h-4 w-4" />
											<span className="sr-only">Strict search info</span>
										</Button>
									</TooltipTrigger>
									<TooltipContent className="max-w-xs">
										<p>
											<strong>Strict mode:</strong> Only exact domain matches are returned.
											<br />
											<strong>Non-strict mode:</strong> Partial domain matches are allowed.
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
										? "You need an active subscription to access this feature. Purchase a subscription to continue using ULP.me."
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

			{searchResults && searchResults.data.results.length === 0 && (
				<Alert variant={"default"}>
					<div className="flex items-center gap-2 mb-1">
						<AlertTriangle className="h-4 w-4 text-yellow-500" />
						<AlertTitle>No results found</AlertTitle>
					</div>
					<AlertDescription>
						We couldn't find any results for the domain "{domain}". Please try again with a different domain.
					</AlertDescription>
				</Alert>
			)}

			{searchResults && searchResults.data.results.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<span className="flex items-center gap-2">
								<Database className="h-5 w-5" />
								Search Results
							</span>
							<div className="flex items-center gap-2">
								<Badge variant="outline" className="flex items-center gap-2">
									<Mail className="h-3 w-3" />
									{searchResults.data.total} results
								</Badge>
								<Badge variant="outline" className="flex items-center gap-2">
									<Clock className="h-3 w-3" />
									{searchResults.data.time_ms}ms
								</Badge>
								{searchResults.data.max_reached && (
									<Badge variant="secondary" className="flex items-center gap-2">
										<BarChart3 className="h-3 w-3" />
										Limit reached
									</Badge>
								)}
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
											className="flex items-center"
										>
											<FileText className="mr-2 h-4 w-4" />
											JSON
										</Button>
										<Button
											variant="outline"
											disabled={!searchResults}
											onClick={() => downloadResults("user-pass")}
											className="flex items-center"
										>
											<User className="mr-2 h-4 w-4" />
											USER:PASS
										</Button>
										<Button
											variant="outline"
											disabled={!searchResults}
											onClick={() => downloadResults("url-user-pass")}
											className="flex items-center"
										>
											<LinkIcon className="mr-2 h-4 w-4" />
											URL:USER:PASS
										</Button>
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
							<div className="space-y-4">
								<div className="overflow-x-auto">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>URL</TableHead>
												<TableHead>
													<span className="flex items-center gap-1">
														<Mail className="h-3 w-3" />
														Email/Username
														<span className="text-xs opacity-60">• click to copy</span>
													</span>
												</TableHead>
												<TableHead>
													<span className="flex items-center gap-1">
														<Lock className="h-3 w-3" />
														Password
														<span className="text-xs opacity-60">• click to copy</span>
													</span>
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{getPaginatedResults.map((result, index) => (
												<TableRow key={`result-${index}`}>
													<TableCell className="font-mono text-sm">{result.url || "-"}</TableCell>
													<TableCell
														className="font-mono text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
														onClick={() => copyToClipboard(result.email_username)}
														title="Click to copy"
													>
														{result.email_username || "-"}
													</TableCell>
													<TableCell
														className="font-mono text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
														onClick={() => copyToClipboard(result.password)}
														title="Click to copy"
													>
														{result.password || "-"}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
								<div className="flex justify-between items-center mt-4">
									<Button onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1}>
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
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
