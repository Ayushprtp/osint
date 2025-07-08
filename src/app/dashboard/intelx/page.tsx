"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Search, Download, FileText, ArrowLeft, AlertTriangle, User, File } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function IntelXDownloader() {
	const [activeTab, setActiveTab] = useState("search")
	const [searchTerm, setSearchTerm] = useState("")
	const [maxResults, setMaxResults] = useState("50")
	const [dateFrom, setDateFrom] = useState("")
	const [dateTo, setDateTo] = useState("")
	const [searchResults, setSearchResults] = useState<any[]>([])
	const [totalResults, setTotalResults] = useState(0)
	const [isLoading, setIsLoading] = useState(false)
	const { toast } = useToast()

	const [sid, setSid] = useState("")
	const [fileContent, setFileContent] = useState("")
	const [systemIdError, setSystemIdError] = useState("")
	const [isLoadingFile, setIsLoadingFile] = useState(false)
	const [fileSize, setFileSize] = useState("")
	const [error, setError] = useState("")

	const handleIdentitySearch = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault()
			if (!searchTerm.trim()) {
				toast({
					title: "Invalid Search Term",
					description: "Please enter a valid search term",
					variant: "destructive",
				})
				return
			}

			setIsLoading(true)
			setError("")

			try {
				const response = await fetch("/api/intelx/search", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						term: searchTerm,
						maxresults: Number.parseInt(maxResults),
						datefrom: dateFrom || null,
						dateto: dateTo || null,
					}),
				})

				if (!response.ok) {
					const data = await response.json()
					throw new Error(data.error || "An error occurred while searching")
				}

				const data = await response.json()
				setSearchResults(data.records)
				setTotalResults(data.total)
				toast({
					title: "Success",
					description: `Found ${data.total} results`,
				})
			} catch (err: unknown) {
				console.error("Error searching:", err)
				const errorMessage = err instanceof Error ? err.message : "An error occurred while searching"

				setError(errorMessage)
				toast({
					title: "Error",
					description: errorMessage,
					variant: "destructive",
				})
			} finally {
				setIsLoading(false)
			}
		},
		[searchTerm, maxResults, dateFrom, dateTo, toast],
	)

	const handleExportAccounts = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault()
			if (!searchTerm.trim()) {
				toast({
					title: "Invalid Domain",
					description: "Please enter a valid domain",
					variant: "destructive",
				})
				return
			}

			setIsLoading(true)
			setError("")

			try {
				const response = await fetch("/api/intelx/export", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						term: searchTerm,
						maxresults: Number.parseInt(maxResults),
						datefrom: dateFrom || null,
						dateto: dateTo || null,
					}),
				})

				if (!response.ok) {
					const data = await response.json()
					throw new Error(data.error || "An error occurred while exporting accounts")
				}

				const data = await response.json()
				setSearchResults(data.records)
				setTotalResults(data.total)
				toast({
					title: "Success",
					description: `Exported ${data.total} accounts`,
				})
			} catch (err: unknown) {
				console.error("Error exporting accounts:", err)
				const errorMessage = err instanceof Error ? err.message : "An error occurred while exporting accounts"

				setError(errorMessage)
				toast({
					title: "Error",
					description: errorMessage,
					variant: "destructive",
				})
			} finally {
				setIsLoading(false)
			}
		},
		[searchTerm, maxResults, dateFrom, dateTo, toast],
	)

	const handleFileViewSearch = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!sid) {
			setSystemIdError("System ID is required")
			return
		}

		const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
		if (!uuidPattern.test(sid)) {
			setSystemIdError("Invalid System ID format. Must be a valid UUID.")
			return
		}

		setIsLoadingFile(true)
		setFileContent("")
		setSystemIdError("")
		setFileSize("")
		setError("")

		try {
			const response = await fetch("/api/intelx/fileview", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					systemId: sid,
				}),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || `Error: ${response.status}`)
			}

			const content = await response.text()
			setFileContent(content)
			setFileSize(`${content.length} bytes`)
			toast({
				title: "Success",
				description: "File content retrieved successfully",
			})
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Failed to fetch file content"
			setSystemIdError(errorMessage)
			setError(errorMessage)
			console.error("Error fetching file content:", err)
			toast({
				title: "Error",
				description: errorMessage,
				variant: "destructive",
			})
		} finally {
			setIsLoadingFile(false)
		}
	}

	const handleDownloadFile = useCallback(() => {
		if (!fileContent) return

		const blob = new Blob([fileContent], { type: "text/plain" })
		const url = URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = url
		a.download = `intelx-file-${sid.substring(0, 8)}.txt`
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		URL.revokeObjectURL(url)

		toast({
			title: "Success",
			description: "File downloaded successfully",
		})
	}, [fileContent, sid, toast])

	const downloadResults = useCallback((results: any[], filename: string) => {
		const content = JSON.stringify(results, null, 2)
		const element = document.createElement("a")
		const file = new Blob([content], { type: "application/json" })
		element.href = URL.createObjectURL(file)
		element.download = filename
		document.body.appendChild(element)
		element.click()
		document.body.removeChild(element)
	}, [])

	return (
		<div className="container mx-auto py-8 px-4 space-y-8">
			<Alert variant={"default"}>
				<div className="flex items-center gap-2 mb-1">
					<AlertTriangle className="h-4 w-4 text-yellow-500" />
					<AlertTitle>Warning</AlertTitle>
				</div>
				<AlertDescription>
					Don't flood the API with requests. Use this tool responsibly. The API is rate-limited and you may be banned if
					you abuse it.
				</AlertDescription>
			</Alert>

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
										? "You need an active subscription to access this feature. Purchase a subscription to continue using IntelX."
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

			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-3xl font-bold tracking-tight">IntelX</h1>
				<Button variant="outline" asChild>
					<Link href="/dashboard" className="flex items-center">
						<ArrowLeft className="w-4 h-4 mr-2" />
						<span>Back to Dashboard</span>
					</Link>
				</Button>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="search" className="flex items-center gap-2">
						<Search className="h-4 w-4" />
						Identity Search
					</TabsTrigger>
					<TabsTrigger value="export" className="flex items-center gap-2">
						<User className="h-4 w-4" />
						Export Accounts
					</TabsTrigger>
					<TabsTrigger value="systemid" className="flex items-center gap-2">
						<File className="h-4 w-4" />
						System ID
					</TabsTrigger>
				</TabsList>

				<TabsContent value="search">
					<Card>
						<CardHeader>
							<CardTitle>Identity Search</CardTitle>
							<CardDescription>
								Search for identities using email addresses, domains, or other selectors.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleIdentitySearch} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="search-term">Search Term</Label>
									<div className="flex gap-2">
										<Input
											id="search-term"
											type="text"
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											placeholder="Email, domain, or other selector"
											required
											className="flex-grow"
										/>
										<Button type="submit" disabled={isLoading} className="flex-shrink-0">
											{isLoading ? (
												<>
													<Skeleton className="h-4 w-4 mr-2 rounded-full animate-spin" />
													Searching...
												</>
											) : (
												<>
													<Search className="h-4 w-4 mr-2" />
													Search
												</>
											)}
										</Button>
									</div>
								</div>
							</form>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="export">
					<Card>
						<CardHeader>
							<CardTitle>Export Accounts</CardTitle>
							<CardDescription>Export accounts associated with a domain or other selector.</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleExportAccounts} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="domain">Domain or Selector</Label>
									<div className="flex gap-2">
										<Input
											id="domain"
											type="text"
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											placeholder="example.com"
											required
											className="flex-grow"
										/>
										<Button type="submit" disabled={isLoading} className="flex-shrink-0">
											{isLoading ? (
												<>
													<Skeleton className="h-4 w-4 mr-2 rounded-full animate-spin" />
													Exporting...
												</>
											) : (
												<>
													<User className="h-4 w-4 mr-2" />
													Export
												</>
											)}
										</Button>
									</div>
								</div>
							</form>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="systemid">
					<Card>
						<CardHeader>
							<CardTitle>System ID Search</CardTitle>
							<CardDescription>Retrieve file contents using the System ID from search results</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleFileViewSearch} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="sid">System ID</Label>
									<div className="flex gap-2">
										<Input
											id="sid"
											value={sid}
											onChange={(e) => setSid(e.target.value)}
											placeholder="e.g., 12345678-1234-1234-1234-123456789abc"
											required
											className="flex-grow"
										/>
										<Button type="submit" disabled={isLoadingFile} className="flex-shrink-0">
											{isLoadingFile ? (
												<>
													<Skeleton className="h-4 w-4 mr-2 rounded-full animate-spin" />
													Fetching...
												</>
											) : (
												<>
													<File className="h-4 w-4 mr-2" />
													Fetch
												</>
											)}
										</Button>
									</div>
									{systemIdError && !error && <p className="text-sm text-destructive mt-2">{systemIdError}</p>}
								</div>
							</form>
						</CardContent>
					</Card>

					{fileContent && (
						<Card className="mt-6">
							<CardHeader className="pb-2">
								<div className="flex justify-between items-center">
									<CardTitle className="flex items-center gap-2 text-base">
										<FileText className="h-4 w-4 text-rose-400" />
										File Content
									</CardTitle>
									<Badge variant="outline" className="ml-2 font-mono text-xs">
										{fileSize}
									</Badge>
								</div>
								<CardDescription className="text-xs">System ID: {sid}</CardDescription>
							</CardHeader>
							<CardContent>
								<ScrollArea className="h-[400px] rounded-md border">
									<pre className="p-4 text-xs whitespace-pre-wrap">{fileContent}</pre>
								</ScrollArea>
							</CardContent>
							<CardFooter className="pt-2 flex justify-end">
								<Button onClick={handleDownloadFile} variant="outline" size="sm" className="flex items-center">
									<Download className="h-4 w-4 mr-2" />
									Download File
								</Button>
							</CardFooter>
						</Card>
					)}
				</TabsContent>
			</Tabs>

			{searchResults.length > 0 && activeTab !== "systemid" && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<span className="flex items-center gap-2">
								<FileText className="h-5 w-5" />
								Results
							</span>
							<Badge variant="secondary">{totalResults} found</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ScrollArea className="h-[400px]">
							<Table>
								<TableHeader>
									<TableRow>
										{activeTab === "search" && (
											<>
												<TableHead>Name</TableHead>
												<TableHead>System ID</TableHead>
												<TableHead>Line</TableHead>
												<TableHead>Description</TableHead>
											</>
										)}
										{activeTab === "export" && (
											<>
												<TableHead>User</TableHead>
												<TableHead>Password</TableHead>
												<TableHead>Type</TableHead>
												<TableHead>Bucket</TableHead>
												<TableHead>Date</TableHead>
												<TableHead>Source</TableHead>
											</>
										)}
									</TableRow>
								</TableHeader>
								<TableBody>
									{searchResults.map((result, index) => (
										<TableRow key={index}>
											{activeTab === "search" && (
												<>
													<TableCell>{result.name}</TableCell>
													<TableCell>{result.systemid}</TableCell>
													<TableCell className="max-w-[300px] truncate">{result.name}</TableCell>
													<TableCell>{result.description}</TableCell>
												</>
											)}
											{activeTab === "export" && (
												<>
													<TableCell>{result.user}</TableCell>
													<TableCell>{result.password}</TableCell>
													<TableCell>{result.passwordtype}</TableCell>
													<TableCell>{result.bucket}</TableCell>
													<TableCell>{new Date(result.date).toLocaleDateString()}</TableCell>
													<TableCell className="max-w-[300px] truncate">{result.sourceshort}</TableCell>
												</>
											)}
										</TableRow>
									))}
								</TableBody>
							</Table>
						</ScrollArea>
					</CardContent>
					<CardFooter className="flex justify-end">
						<Button
							onClick={() =>
								downloadResults(
									searchResults,
									`intelx-${activeTab}-${searchTerm.replace(/[^a-z0-9]/gi, "-")}-${Date.now()}.json`,
								)
							}
							variant="outline"
							className="flex items-center"
						>
							<Download className="h-4 w-4 mr-2" />
							Download Results
						</Button>
					</CardFooter>
				</Card>
			)}
		</div>
	)
}
