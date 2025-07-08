"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Search, Loader2, Download, ArrowLeft, Database, AlertTriangle, User, Users } from "lucide-react"
import Link from "next/link"

interface TgScanResult {
	success: boolean
	data: {
		status: string
		result: {
			message?: string | null
			user: {
				id: number
				username: string
				first_name: string
				last_name: string | null
			}
			username_history: string[]
			id_history: Array<{ id: number; date: string }>
			meta: {
				search_query: string
				known_num_groups: number
				num_groups: number
				op_cost: number
			}
			groups: Array<{
				id: number
				username: string
				title: string
				date_updated: string
			}>
		}
	}
}

export default function TgScanSearch() {
	const [data, setData] = useState<TgScanResult | null>(null)
	const [query, setQuery] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [credits, setCredits] = useState<number | null>(null)

	const fetchCredits = useCallback(async () => {
		try {
			const res = await fetch("/api/tgscan/credits")
			if (!res.ok) throw new Error("Failed to fetch credits")
			const { credits } = await res.json()
			setCredits(credits)
		} catch {
			setCredits(null)
		}
	}, [])

	useEffect(() => {
		fetchCredits()
		const id = setInterval(fetchCredits, 300000)
		return () => clearInterval(id)
	}, [fetchCredits])

	const fetchData = useCallback(async () => {
		if (!query.trim()) {
			setError("Please enter a search query")
			return
		}
		setIsLoading(true)
		setError(null)
		try {
			const res = await fetch("/api/tgscan", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ query }),
			})
			if (!res.ok) throw new Error("Failed to fetch data")
			setData(await res.json())
		} catch {
			setError("An error occurred. Please try again.")
		} finally {
			setIsLoading(false)
		}
	}, [query])

	const handleExport = useCallback(() => {
		const username = data?.data.result.user.username
		if (!username) return
		const exportData = JSON.stringify(data, null, 2)
		const blob = new Blob([exportData], { type: "application/json" })
		const url = URL.createObjectURL(blob)
		const link = document.createElement("a")
		link.href = url
		link.download = `tgscan-${username}.json`
		link.click()
		setTimeout(() => URL.revokeObjectURL(url), 0)
	}, [data])

	return (
		<div className="container mx-auto py-8 px-4 space-y-8">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-3xl font-bold tracking-tight">
					TgScan
					<div className="flex justify-between items-center">
						<p className="text-sm text-muted-foreground">
							Available credits: <span className="font-bold">{credits || "N/A"}</span>
						</p>
					</div>
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
					<CardTitle>Search</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col sm:flex-row gap-4">
						<Input
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Enter username or Telegram ID"
							className="flex-1"
						/>
						<Button onClick={fetchData} disabled={isLoading || !query.trim() || !credits || credits < 1}>
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
										? "You need an active subscription to access this feature. Purchase a subscription to continue using TGScan."
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

			{data && data.data.status === "ok" && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<span className="flex items-center gap-2">
								<Database className="h-5 w-5" />
								Search Results
							</span>
							<Button variant="outline" onClick={handleExport}>
								<Download className="mr-2 h-4 w-4" />
								Export
							</Button>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<User className="h-5 w-5" />
										User Information
									</CardTitle>
								</CardHeader>
								<CardContent>
									<Table>
										<TableBody>
											<TableRow>
												<TableCell className="font-medium">ID</TableCell>
												<TableCell>{data.data.result.user.id}</TableCell>
											</TableRow>
											<TableRow>
												<TableCell className="font-medium">Username</TableCell>
												<TableCell>{data.data.result.user.username}</TableCell>
											</TableRow>
											<TableRow>
												<TableCell className="font-medium">First Name</TableCell>
												<TableCell>{data.data.result.user.first_name}</TableCell>
											</TableRow>
											<TableRow>
												<TableCell className="font-medium">Last Name</TableCell>
												<TableCell>{data.data.result.user.last_name || "N/A"}</TableCell>
											</TableRow>
										</TableBody>
									</Table>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<User className="h-5 w-5" />
										ID History
									</CardTitle>
								</CardHeader>
								<CardContent>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>ID</TableHead>
												<TableHead>Date</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{data.data.result.id_history.map((item) => (
												<TableRow key={item.id}>
													<TableCell>{item.id}</TableCell>
													<TableCell>{item.date}</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Users className="h-5 w-5" />
										Groups ({data.data.result.groups.length})
									</CardTitle>
								</CardHeader>
								<CardContent>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>ID</TableHead>
												<TableHead>Username</TableHead>
												<TableHead>Title</TableHead>
												<TableHead>Last Updated</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{data.data.result.groups.map(({ id, username, title, date_updated }) => {
												const link = username ? `https://t.me/${username}` : "#"
												return (
													<TableRow key={id}>
														<TableCell>{id}</TableCell>
														<TableCell>
															<a
																href={link}
																className="text-primary hover:underline transition-colors duration-200 ease-in-out hover:text-primary/80 font-mono"
																target="_blank"
																rel="noreferrer"
															>
																@{username || "N/A"}
															</a>
														</TableCell>
														<TableCell>{title}</TableCell>
														<TableCell>{date_updated}</TableCell>
													</TableRow>
												)
											})}
										</TableBody>
									</Table>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Database className="h-5 w-5" />
										Meta Information
									</CardTitle>
								</CardHeader>
								<CardContent>
									<Table>
										<TableBody>
											<TableRow>
												<TableCell className="font-medium">Search Query</TableCell>
												<TableCell>{data.data.result.meta.search_query}</TableCell>
											</TableRow>
											<TableRow>
												<TableCell className="font-medium">Known Groups</TableCell>
												<TableCell>{data.data.result.meta.known_num_groups}</TableCell>
											</TableRow>
											<TableRow>
												<TableCell className="font-medium">Found Groups</TableCell>
												<TableCell>{data.data.result.meta.num_groups}</TableCell>
											</TableRow>
											<TableRow>
												<TableCell className="font-medium">Operation Cost</TableCell>
												<TableCell>{data.data.result.meta.op_cost}</TableCell>
											</TableRow>
										</TableBody>
									</Table>
								</CardContent>
							</Card>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
