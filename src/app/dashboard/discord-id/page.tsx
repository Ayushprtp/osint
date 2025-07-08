"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import {
	Search,
	Loader2,
	Download,
	ArrowLeft,
	Database,
	AlertTriangle,
	User,
	Gamepad,
	Shield,
	ExternalLink,
	CheckCircle,
} from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface DiscordSearchResult {
	oathnetBreachData?: any
	oathnetRobloxData?: any
	oathnetRobloxUserInfo?: any
	keyscoreData?: {
		results: Array<{
			source: string
			type: string
			data: any
		}>
	}
	inf0secData?: any
	rustGameData?: any
	rustSteamData?: any
	osintsolutionsData?: any
	searchQuery: string
}

export default function DiscordIDSearch() {
	const [data, setData] = useState<DiscordSearchResult | null>(null)
	const [query, setQuery] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [searchStatus, setSearchStatus] = useState({
		oathnetBreachComplete: false,
		oathnetRobloxComplete: false,
		robloxUserInfoComplete: false,
		keyscoreComplete: false,
		inf0secComplete: false,
		rustDiscordComplete: false,
		rustSteamComplete: false,
		osintsolutionsComplete: false,
	})

	const searchOathnetBreach = async (discordId: string) => {
		try {
			const res = await fetch("/api/oathnet", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					type: "breach",
					query: discordId,
				}),
			})

			if (!res.ok) throw new Error("Failed to fetch Oathnet breach data")
			const result = await res.json()

			let processedData = null
			if (result.data?.LOGS) {
				processedData = result.data.LOGS.map((log: any) => ({
					...log,
					source: log.dbname || result.data.dbname || result.data["Search Provided by"] || "OathNet",
				}))
			} else {
				processedData = result.data
			}

			setData(
				(prev) =>
					({
						...prev,
						oathnetBreachData: processedData,
						searchQuery: discordId,
					}) as DiscordSearchResult,
			)
			setSearchStatus((prev) => ({ ...prev, oathnetBreachComplete: true }))
			return processedData
		} catch (error) {
			console.error("Oathnet breach search error:", error)
			setSearchStatus((prev) => ({ ...prev, oathnetBreachComplete: true }))
			return null
		}
	}

	const searchOathnetRoblox = async (discordId: string) => {
		try {
			const res = await fetch("/api/oathnet", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					type: "discord-to-roblox",
					discordid: discordId,
				}),
			})

			if (!res.ok) throw new Error("Failed to fetch Oathnet Roblox data")
			const result = await res.json()

			const robloxData = result.data || null

			setData(
				(prev) =>
					({
						...prev,
						oathnetRobloxData: robloxData,
						searchQuery: discordId,
					}) as DiscordSearchResult,
			)

			setSearchStatus((prev) => ({ ...prev, oathnetRobloxComplete: true }))
			return robloxData
		} catch (error) {
			console.error("Oathnet Roblox search error:", error)
			setSearchStatus((prev) => ({ ...prev, oathnetRobloxComplete: true }))
			return null
		}
	}

	const fetchRobloxUserInfo = async (username: string) => {
		if (!username) {
			setSearchStatus((prev) => ({ ...prev, robloxUserInfoComplete: true }))
			return null
		}

		try {
			console.log("Fetching Roblox user info for username:", username)

			const res = await fetch("/api/oathnet", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					type: "roblox-userinfo",
					username: username,
				}),
			})

			if (!res.ok) {
				console.error("Roblox user info API error:", res.status, res.statusText)
				throw new Error("Failed to fetch Roblox user info")
			}

			const result = await res.json()
			console.log("Roblox user info result:", result)

			const userInfo = result.data || null

			setData(
				(prev) =>
					({
						...prev,
						oathnetRobloxUserInfo: userInfo,
						searchQuery: prev?.searchQuery || query,
					}) as DiscordSearchResult,
			)

			setSearchStatus((prev) => ({ ...prev, robloxUserInfoComplete: true }))
			return userInfo
		} catch (error) {
			console.error("Roblox user info error:", error)
			setSearchStatus((prev) => ({ ...prev, robloxUserInfoComplete: true }))
			return null
		}
	}

	const searchKeyscore = async (discordId: string) => {
		try {
			const res = await fetch("/api/keyscore", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					query: discordId,
					searchType: "discord_id",
					wildcard: false,
				}),
			})

			if (!res.ok) throw new Error("Failed to fetch Keyscore data")
			const result = await res.json()

			const processedData = {
				results: [] as Array<{ source: string; type: string; data: any }>,
			}
			if (result.data?.results) {
				const resultsArray = Object.entries(result.data.results).flatMap(([source, entries]) => {
					if (Array.isArray(entries)) {
						return entries.map((entry: any) => ({
							source,
							type: "breach",
							data: entry,
						}))
					}
					return []
				})

				processedData.results = resultsArray
			}

			setData(
				(prev) =>
					({
						...prev,
						keyscoreData: processedData,
						searchQuery: discordId,
					}) as DiscordSearchResult,
			)
			setSearchStatus((prev) => ({ ...prev, keyscoreComplete: true }))
			return processedData
		} catch (error) {
			console.error("Keyscore search error:", error)
			setSearchStatus((prev) => ({ ...prev, keyscoreComplete: true }))
			return null
		}
	}

	const searchInf0sec = async (discordId: string) => {
		try {
			const res = await fetch("/api/discord-id", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					type: "inf0sec",
					query: discordId,
				}),
			})

			if (!res.ok) throw new Error("Failed to fetch Inf0sec data")
			const result = await res.json()

			setData(
				(prev) =>
					({
						...prev,
						inf0secData: result.data,
						searchQuery: discordId,
					}) as DiscordSearchResult,
			)

			setSearchStatus((prev) => ({ ...prev, inf0secComplete: true }))
			return result.data
		} catch (error) {
			console.error("Inf0sec search error:", error)
			setSearchStatus((prev) => ({ ...prev, inf0secComplete: true }))
			return null
		}
	}

	const searchRustDiscord = async (discordId: string) => {
		try {
			const res = await fetch("/api/discord-id", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					type: "rust-discord-lookup",
					query: discordId,
				}),
			})

			if (!res.ok) throw new Error("Failed to fetch Rust Discord data")
			const result = await res.json()

			setData(
				(prev) =>
					({
						...prev,
						rustGameData: result.data,
						searchQuery: discordId,
					}) as DiscordSearchResult,
			)

			setSearchStatus((prev) => ({ ...prev, rustDiscordComplete: true }))
			return result.data
		} catch (error) {
			console.error("Rust Discord lookup error:", error)
			setSearchStatus((prev) => ({ ...prev, rustDiscordComplete: true }))
			return null
		}
	}

	const searchRustSteam = async (steamId: string) => {
		try {
			const res = await fetch("/api/discord-id", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					type: "rust-steam-lookup",
					query: steamId,
				}),
			})

			if (!res.ok) throw new Error("Failed to fetch Rust Steam data")
			const result = await res.json()

			setData(
				(prev) =>
					({
						...prev,
						rustSteamData: result.data,
						searchQuery: prev?.searchQuery || "",
					}) as DiscordSearchResult,
			)

			setSearchStatus((prev) => ({ ...prev, rustSteamComplete: true }))
			return result.data
		} catch (error) {
			console.error("Rust Steam lookup error:", error)
			setSearchStatus((prev) => ({ ...prev, rustSteamComplete: true }))
			return null
		}
	}

	const searchOsintSolutions = async (discordId: string) => {
		try {
			const res = await fetch("/api/discord-id", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					type: "osintsolutions-discord-lookup",
					query: discordId,
				}),
			})

			if (!res.ok) throw new Error("Failed to fetch OSINTsolutions data")
			const result = await res.json()

			setData(
				(prev) =>
					({
						...prev,
						osintsolutionsData: result.data,
						searchQuery: discordId,
					}) as DiscordSearchResult,
			)

			setSearchStatus((prev) => ({ ...prev, osintsolutionsComplete: true }))
			return result.data
		} catch (error) {
			console.error("OSINTsolutions search error:", error)
			setSearchStatus((prev) => ({ ...prev, osintsolutionsComplete: true }))
			return null
		}
	}

	const fetchData = useCallback(async () => {
		if (!query.trim()) {
			setError("Please enter a Discord ID")
			return
		}

		setIsLoading(true)
		setError(null)
		setData(null)
		setSearchStatus({
			oathnetBreachComplete: false,
			oathnetRobloxComplete: false,
			robloxUserInfoComplete: false,
			keyscoreComplete: false,
			inf0secComplete: false,
			rustDiscordComplete: false,
			rustSteamComplete: false,
			osintsolutionsComplete: false,
		})

		try {
			const oathnetBreachPromise = searchOathnetBreach(query)
			const oathnetRobloxPromise = searchOathnetRoblox(query)
			const keyscorePromise = searchKeyscore(query)
			const inf0secPromise = searchInf0sec(query)
			const rustDiscordPromise = searchRustDiscord(query)
			const osintSolutionsPromise = searchOsintSolutions(query)

			const robloxData = await oathnetRobloxPromise

			const rustData = await rustDiscordPromise
			if (rustData?.steam_id && rustData.steam_id.length > 0) {
				const steamId = rustData.steam_id[0]
				await searchRustSteam(steamId)
			} else {
				setSearchStatus((prev) => ({ ...prev, rustSteamComplete: true }))
			}

			if (robloxData) {
				let username = null

				if (typeof robloxData === "object") {
					if (robloxData.username) {
						username = robloxData.username
					} else if (robloxData.Username) {
						username = robloxData.Username
					} else if (robloxData.user) {
						username = typeof robloxData.user === "string" ? robloxData.user : robloxData.user.username
					} else if (robloxData.name) {
						username = robloxData.name
					} else if (robloxData.data) {
						const data = robloxData.data
						if (typeof data === "object") {
							username = data.username || data.Username || data.name || data.user
						} else if (typeof data === "string") {
							username = data
						}
					}
				}

				if (username) {
					await fetchRobloxUserInfo(username)
				} else {
					setSearchStatus((prev) => ({
						...prev,
						robloxUserInfoComplete: true,
					}))
				}
			} else {
				setSearchStatus((prev) => ({ ...prev, robloxUserInfoComplete: true }))
			}

			await Promise.allSettled([oathnetBreachPromise, keyscorePromise, inf0secPromise, osintSolutionsPromise])
		} catch (error) {
			console.error("Error during data fetching:", error)
			setError("An error occurred while processing your request. Please try again.")
		} finally {
			setIsLoading(false)
		}
	}, [query])

	const handleExport = useCallback(() => {
		if (!data) return

		const exportData = JSON.stringify(data, null, 2)
		const blob = new Blob([exportData], { type: "application/json" })
		const url = URL.createObjectURL(blob)
		const link = document.createElement("a")
		link.href = url
		link.download = `discord-id-search-${data.searchQuery}.json`
		link.click()
		setTimeout(() => URL.revokeObjectURL(url), 0)
	}, [data])

	const allSearchesComplete = useCallback(() => {
		return Object.values(searchStatus).every((status) => status)
	}, [searchStatus])

	const hasData = useCallback(() => {
		return (
			data &&
			(data.oathnetBreachData ||
				data.oathnetRobloxData ||
				data.oathnetRobloxUserInfo ||
				data.keyscoreData ||
				data.inf0secData ||
				data.rustGameData ||
				data.rustSteamData ||
				data.osintsolutionsData)
		)
	}, [data])

	useEffect(() => {
		if (data) {
			console.log("Data updated:", {
				hasBreachData: !!data.oathnetBreachData,
				hasRobloxData: !!data.oathnetRobloxData,
				hasRobloxUserInfo: !!data.oathnetRobloxUserInfo,
				hasKeyscoreData: !!data.keyscoreData,
			})
		}
		console.log("Search status:", searchStatus)
	}, [data, searchStatus])

	return (
		<div className="container mx-auto py-8 px-4 space-y-8">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-3xl font-bold tracking-tight">
					Discord ID Search
					<div className="flex justify-between items-center">
						<p className="text-sm text-muted-foreground" />
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
					<CardTitle>Search Discord ID</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col sm:flex-row gap-4">
						<Input
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Enter Discord ID (e.g., 123456789012345678)"
							className="flex-1"
						/>
						<Button onClick={fetchData} disabled={isLoading || !query.trim()}>
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
										? "You need an active subscription to access this feature. Purchase a subscription to continue using Discord ID Search."
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

			{isLoading && (
				<Card>
					<CardContent className="p-8">
						<div className="flex flex-col items-center justify-center space-y-4">
							<Loader2 className="h-12 w-12 animate-spin text-primary" />
							<div className="text-center">
								<h3 className="text-lg font-medium mb-2">Searching Multiple APIs</h3>
								<div className="space-y-2 text-sm text-muted-foreground">
									<div className="flex items-center space-x-2">
										<Badge variant={searchStatus.oathnetBreachComplete ? "outline" : "secondary"}>
											{searchStatus.oathnetBreachComplete ? "Complete" : "Processing"}
										</Badge>
										<span>OathNet Breach Search</span>
									</div>
									<div className="flex items-center space-x-2">
										<Badge variant={searchStatus.oathnetRobloxComplete ? "outline" : "secondary"}>
											{searchStatus.oathnetRobloxComplete ? "Complete" : "Processing"}
										</Badge>
										<span>Discord to Roblox Resolution</span>
									</div>
									<div className="flex items-center space-x-2">
										<Badge variant={searchStatus.robloxUserInfoComplete ? "outline" : "secondary"}>
											{searchStatus.robloxUserInfoComplete ? "Complete" : "Processing"}
										</Badge>
										<span>Roblox User Information</span>
									</div>
									<div className="flex items-center space-x-2">
										<Badge variant={searchStatus.keyscoreComplete ? "outline" : "secondary"}>
											{searchStatus.keyscoreComplete ? "Complete" : "Processing"}
										</Badge>
										<span>KeyScore Search</span>
									</div>
									<div className="flex items-center space-x-2">
										<Badge variant={searchStatus.inf0secComplete ? "outline" : "secondary"}>
											{searchStatus.inf0secComplete ? "Complete" : "Processing"}
										</Badge>
										<span>Inf0sec Search</span>
									</div>
									<div className="flex items-center space-x-2">
										<Badge variant={searchStatus.rustDiscordComplete ? "outline" : "secondary"}>
											{searchStatus.rustDiscordComplete ? "Complete" : "Processing"}
										</Badge>
										<span>Rust Game Data</span>
									</div>
									<div className="flex items-center space-x-2">
										<Badge variant={searchStatus.rustSteamComplete ? "outline" : "secondary"}>
											{searchStatus.rustSteamComplete ? "Complete" : "Processing"}
										</Badge>
										<span>Steam Account Data</span>
									</div>
									<div className="flex items-center space-x-2">
										<Badge variant={searchStatus.osintsolutionsComplete ? "outline" : "secondary"}>
											{searchStatus.osintsolutionsComplete ? "Complete" : "Processing"}
										</Badge>
										<span>OSINTsolutions Search</span>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{!isLoading && allSearchesComplete() && hasData() && (
				<>
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-xl font-semibold flex items-center gap-2">
							<Database className="h-5 w-5" />
							Search Results
						</h2>
						<Button variant="outline" onClick={handleExport}>
							<Download className="mr-2 h-4 w-4" />
							Export
						</Button>
					</div>

					<Tabs defaultValue="roblox" className="w-full mb-6">
						<TabsList className="grid grid-cols-5 mb-6">
							<TabsTrigger value="roblox" className="flex items-center gap-2">
								<Gamepad className="h-4 w-4" />
								<span>Roblox Info</span>
							</TabsTrigger>
							<TabsTrigger value="breaches" className="flex items-center gap-2">
								<Shield className="h-4 w-4" />
								<span>Breach Data</span>
							</TabsTrigger>
							<TabsTrigger value="rustgame" className="flex items-center gap-2">
								<Gamepad className="h-4 w-4" />
								<span>Rust Game</span>
							</TabsTrigger>
							<TabsTrigger value="osintsolutions" className="flex items-center gap-2">
								<Database className="h-4 w-4" />
								<span>OSINTsolutions</span>
							</TabsTrigger>
							<TabsTrigger value="metadata" className="flex items-center gap-2">
								<Database className="h-4 w-4" />
								<span>Metadata</span>
							</TabsTrigger>
						</TabsList>

						<TabsContent value="roblox">
							{data?.oathnetRobloxData || data?.oathnetRobloxUserInfo ? (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{data?.oathnetRobloxData && (
										<Card className="h-full">
											<CardHeader>
												<CardTitle className="flex items-center gap-2">
													<Gamepad className="h-5 w-5" />
													Roblox Account Information
												</CardTitle>
											</CardHeader>
											<CardContent>
												<Table>
													<TableBody>
														{Object.entries(data.oathnetRobloxData).map(([key, value]) => (
															<TableRow key={key}>
																<TableCell className="font-medium">{key}</TableCell>
																<TableCell>
																	{typeof value === "string" && value.startsWith("http") ? (
																		<a
																			href={value as string}
																			target="_blank"
																			rel="noreferrer"
																			className="text-primary hover:underline flex items-center gap-1"
																		>
																			{value as string} <ExternalLink className="h-3 w-3" />
																		</a>
																	) : (
																		String(value || "N/A")
																	)}
																</TableCell>
															</TableRow>
														))}
													</TableBody>
												</Table>
											</CardContent>
										</Card>
									)}

									{data?.oathnetRobloxUserInfo && (
										<Card className="h-full">
											<CardHeader>
												<CardTitle className="flex items-center gap-2">
													<User className="h-5 w-5" />
													Detailed Roblox User Information
												</CardTitle>
											</CardHeader>
											<CardContent>
												<Table>
													<TableBody>
														{Object.entries(data.oathnetRobloxUserInfo).map(([key, value]) => (
															<TableRow key={key}>
																<TableCell className="font-medium">{key}</TableCell>
																<TableCell>
																	{typeof value === "string" && value.startsWith("http") ? (
																		<a
																			href={value as string}
																			target="_blank"
																			rel="noreferrer"
																			className="text-primary hover:underline flex items-center gap-1"
																		>
																			{value as string} <ExternalLink className="h-3 w-3" />
																		</a>
																	) : (
																		String(value || "N/A")
																	)}
																</TableCell>
															</TableRow>
														))}
													</TableBody>
												</Table>
											</CardContent>
										</Card>
									)}
								</div>
							) : (
								<Alert>
									<AlertTriangle className="h-4 w-4" />
									<AlertTitle>No Roblox Data Found</AlertTitle>
									<AlertDescription>We couldn't find any Roblox account linked to this Discord ID.</AlertDescription>
								</Alert>
							)}
						</TabsContent>

						<TabsContent value="breaches">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{data?.oathnetBreachData && (
									<Card className="h-full">
										<CardHeader>
											<CardTitle className="flex items-center gap-2">
												<Shield className="h-5 w-5" />
												OathNet Breach Data
											</CardTitle>
										</CardHeader>
										<CardContent>
											{Array.isArray(data.oathnetBreachData) && data.oathnetBreachData.length > 0 ? (
												<Table>
													<TableHeader>
														<TableRow>
															<TableHead>Source</TableHead>
															<TableHead>Field</TableHead>
															<TableHead>Value</TableHead>
														</TableRow>
													</TableHeader>
													<TableBody>
														{data.oathnetBreachData.map((breach, breachIndex) =>
															Object.entries(breach)
																.filter(([key]) => key !== "source" && key !== "dbname")
																.map(([key, value], valueIndex) => (
																	<TableRow key={`${breachIndex}-${valueIndex}`}>
																		{valueIndex === 0 && (
																			<TableCell rowSpan={Object.keys(breach).length - (breach.source ? 2 : 1)}>
																				{breach.source || breach.dbname || "OathNet"}
																			</TableCell>
																		)}
																		<TableCell className="font-medium">{key}</TableCell>
																		<TableCell>{String(value || "")}</TableCell>
																	</TableRow>
																)),
														)}
													</TableBody>
												</Table>
											) : (
												<Alert>
													<AlertTriangle className="h-4 w-4" />
													<AlertTitle>No Breach Data Found</AlertTitle>
													<AlertDescription>
														No breaches containing this Discord ID were found in the OathNet database.
													</AlertDescription>
												</Alert>
											)}
										</CardContent>
									</Card>
								)}
								{data?.keyscoreData && (
									<Card className="h-full">
										<CardHeader>
											<CardTitle className="flex items-center gap-2">
												<Shield className="h-5 w-5" />
												KeyScore Data
											</CardTitle>
										</CardHeader>
										<CardContent>
											{data.keyscoreData.results && data.keyscoreData.results.length > 0 ? (
												<Table>
													<TableHeader>
														<TableRow>
															<TableHead>Source</TableHead>
															<TableHead>Field</TableHead>
															<TableHead>Value</TableHead>
														</TableRow>
													</TableHeader>
													<TableBody>
														{data.keyscoreData.results.map((result, resultIndex) =>
															Object.entries(result.data).map(([key, value], valueIndex) => (
																<TableRow key={`keyscore-${resultIndex}-${valueIndex}`}>
																	{valueIndex === 0 && (
																		<TableCell rowSpan={Object.keys(result.data).length}>
																			{result.source || "Unknown"}
																		</TableCell>
																	)}
																	<TableCell className="font-medium">{key}</TableCell>
																	<TableCell>{String(value || "")}</TableCell>
																</TableRow>
															)),
														)}
													</TableBody>
												</Table>
											) : (
												<Alert>
													<AlertTriangle className="h-4 w-4" />
													<AlertTitle>No KeyScore Data Found</AlertTitle>
													<AlertDescription>
														No data containing this Discord ID was found in the KeyScore database.
													</AlertDescription>
												</Alert>
											)}
										</CardContent>
									</Card>
								)}
								{data?.inf0secData && (
									<Card className="h-full">
										<CardHeader>
											<CardTitle className="flex items-center gap-2">
												<Shield className="h-5 w-5" />
												Inf0sec Data
											</CardTitle>
										</CardHeader>
										<CardContent>
											{data.inf0secData.success && data.inf0secData.results && data.inf0secData.results.length > 0 ? (
												<Table>
													<TableHeader>
														<TableRow>
															<TableHead>Field</TableHead>
															<TableHead>Value</TableHead>
														</TableRow>
													</TableHeader>
													<TableBody>
														{data.inf0secData.results.map((result: any, index: number) =>
															Object.entries(result).map(([key, value], valueIndex) => (
																<TableRow key={`inf0sec-${index}-${valueIndex}`}>
																	<TableCell className="font-medium">{key}</TableCell>
																	<TableCell>{String(value || "")}</TableCell>
																</TableRow>
															)),
														)}
													</TableBody>
												</Table>
											) : (
												<Alert>
													<AlertTriangle className="h-4 w-4" />
													<AlertTitle>No Inf0sec Data Found</AlertTitle>
													<AlertDescription>
														No data containing this Discord ID was found in the Inf0sec database.
													</AlertDescription>
												</Alert>
											)}
										</CardContent>
									</Card>
								)}
							</div>
						</TabsContent>

						<TabsContent value="rustgame">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{data?.rustGameData && (
									<Card className="h-full">
										<CardHeader>
											<CardTitle className="flex items-center gap-2">
												<Gamepad className="h-5 w-5" />
												Rust Game Data
											</CardTitle>
										</CardHeader>
										<CardContent>
											<Table>
												<TableBody>
													{Object.entries(data.rustGameData).map(([key, value]) => {
														let displayValue
														if (Array.isArray(value)) {
															displayValue = value.join(", ")
														} else if (value === null) {
															displayValue = "N/A"
														} else if (typeof value === "object") {
															try {
																displayValue = JSON.stringify(value)
															} catch (e) {
																displayValue = "[Complex Object]"
															}
														} else {
															displayValue = String(value)
														}

														return (
															<TableRow key={key}>
																<TableCell className="font-medium">{key}</TableCell>
																<TableCell>{displayValue}</TableCell>
															</TableRow>
														)
													})}
												</TableBody>
											</Table>
										</CardContent>
									</Card>
								)}

								{data?.rustSteamData && (
									<Card className="h-full">
										<CardHeader>
											<CardTitle className="flex items-center gap-2">
												<User className="h-5 w-5" />
												Steam Account Data
											</CardTitle>
										</CardHeader>
										<CardContent>
											<Table>
												<TableBody>
													{Object.entries(data.rustSteamData).map(([key, value]) => {
														let displayValue
														if (Array.isArray(value)) {
															displayValue = value.join(", ")
														} else if (value === null) {
															displayValue = "N/A"
														} else if (typeof value === "object") {
															try {
																displayValue = JSON.stringify(value)
															} catch (e) {
																displayValue = "[Complex Object]"
															}
														} else {
															displayValue = String(value)
														}

														return (
															<TableRow key={key}>
																<TableCell className="font-medium">{key}</TableCell>
																<TableCell>{displayValue}</TableCell>
															</TableRow>
														)
													})}
												</TableBody>
											</Table>
										</CardContent>
									</Card>
								)}

								{!data?.rustGameData && !data?.rustSteamData && (
									<Alert className="col-span-2">
										<AlertTriangle className="h-4 w-4" />
										<AlertTitle>No Rust Game Data Found</AlertTitle>
										<AlertDescription>We couldn't find any Rust game data linked to this Discord ID.</AlertDescription>
									</Alert>
								)}
							</div>
						</TabsContent>

						<TabsContent value="osintsolutions">
							{data?.osintsolutionsData ? (
								<Card className="h-full">
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Database className="h-5 w-5" />
											OSINTsolutions Data
										</CardTitle>
									</CardHeader>
									<CardContent>
										{Array.isArray(data.osintsolutionsData) && data.osintsolutionsData.length > 0 ? (
											<Table>
												<TableHeader>
													<TableRow>
														<TableHead>Date</TableHead>
														<TableHead>IP Address</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{data.osintsolutionsData.map((item: any, index: number) => (
														<TableRow key={`osintsolutions-${index}`}>
															<TableCell className="font-medium">{item.date || "N/A"}</TableCell>
															<TableCell>{item.ip || "N/A"}</TableCell>
														</TableRow>
													))}
												</TableBody>
											</Table>
										) : (
											<Alert>
												<AlertTriangle className="h-4 w-4" />
												<AlertTitle>No OSINTsolutions Data Found or Data is Not an Array</AlertTitle>
												<AlertDescription>
													We couldn't find any data from OSINTsolutions for this Discord ID, or the data format was
													unexpected.
												</AlertDescription>
											</Alert>
										)}
									</CardContent>
								</Card>
							) : (
								<Alert>
									<AlertTriangle className="h-4 w-4" />
									<AlertTitle>No OSINTsolutions Data Found</AlertTitle>
									<AlertDescription>
										We couldn't find any data from OSINTsolutions for this Discord ID.
									</AlertDescription>
								</Alert>
							)}
						</TabsContent>

						<TabsContent value="metadata">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<Card className="h-full">
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Database className="h-5 w-5" />
											Search Metadata
										</CardTitle>
									</CardHeader>
									<CardContent>
										<Table>
											<TableBody>
												<TableRow>
													<TableCell className="font-medium">Search Query</TableCell>
													<TableCell>{data?.searchQuery || "N/A"}</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-medium">Search Timestamp</TableCell>
													<TableCell>{new Date().toISOString()}</TableCell>
												</TableRow>
											</TableBody>
										</Table>
									</CardContent>
								</Card>

								<Card className="h-full">
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Database className="h-5 w-5" />
											Search Status
										</CardTitle>
									</CardHeader>
									<CardContent>
										<Table>
											<TableBody>
												<TableRow>
													<TableCell className="font-medium">OathNet Breach Search</TableCell>
													<TableCell className="flex items-center gap-1">
														<Badge variant={data?.oathnetBreachData ? "outline" : "secondary"}>
															{data?.oathnetBreachData ? "Complete" : "No results"}
														</Badge>
														{data?.oathnetBreachData && <CheckCircle className="h-4 w-4 text-green-500 ml-1" />}
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-medium">Discord to Roblox Resolution</TableCell>
													<TableCell className="flex items-center gap-1">
														<Badge variant={data?.oathnetRobloxData ? "outline" : "secondary"}>
															{data?.oathnetRobloxData ? "Complete" : "No results"}
														</Badge>
														{data?.oathnetRobloxData && <CheckCircle className="h-4 w-4 text-green-500 ml-1" />}
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-medium">Roblox User Information</TableCell>
													<TableCell className="flex items-center gap-1">
														<Badge variant={data?.oathnetRobloxUserInfo ? "outline" : "secondary"}>
															{data?.oathnetRobloxUserInfo ? "Complete" : "No results"}
														</Badge>
														{data?.oathnetRobloxUserInfo && <CheckCircle className="h-4 w-4 text-green-500 ml-1" />}
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-medium">KeyScore Search</TableCell>
													<TableCell className="flex items-center gap-1">
														<Badge variant={data?.keyscoreData ? "outline" : "secondary"}>
															{data?.keyscoreData ? "Complete" : "No results"}
														</Badge>
														{data?.keyscoreData && <CheckCircle className="h-4 w-4 text-green-500 ml-1" />}
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-medium">Inf0sec Search</TableCell>
													<TableCell className="flex items-center gap-1">
														<Badge variant={data?.inf0secData ? "outline" : "secondary"}>
															{data?.inf0secData ? "Complete" : "No results"}
														</Badge>
														{data?.inf0secData && <CheckCircle className="h-4 w-4 text-green-500 ml-1" />}
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-medium">Rust Game Data</TableCell>
													<TableCell className="flex items-center gap-1">
														<Badge variant={data?.rustGameData ? "outline" : "secondary"}>
															{data?.rustGameData ? "Complete" : "No results"}
														</Badge>
														{data?.rustGameData && <CheckCircle className="h-4 w-4 text-green-500 ml-1" />}
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-medium">Steam Account Data</TableCell>
													<TableCell className="flex items-center gap-1">
														<Badge variant={data?.rustSteamData ? "outline" : "secondary"}>
															{data?.rustSteamData ? "Complete" : "No results"}
														</Badge>
														{data?.rustSteamData && <CheckCircle className="h-4 w-4 text-green-500 ml-1" />}
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-medium">OSINTsolutions Search</TableCell>
													<TableCell className="flex items-center gap-1">
														<Badge variant={data?.osintsolutionsData ? "outline" : "secondary"}>
															{data?.osintsolutionsData ? "Complete" : "No results"}
														</Badge>
														{data?.osintsolutionsData && <CheckCircle className="h-4 w-4 text-green-500 ml-1" />}
													</TableCell>
												</TableRow>
											</TableBody>
										</Table>
									</CardContent>
								</Card>
							</div>
						</TabsContent>
					</Tabs>
				</>
			)}

			{!isLoading && allSearchesComplete() && !hasData() && (
				<Alert>
					<AlertTriangle className="h-5 w-5" />
					<AlertTitle>No Results Found</AlertTitle>
					<AlertDescription>
						We couldn't find any information related to this Discord ID across our data sources. Try searching for
						another Discord ID or check if the ID is entered correctly.
					</AlertDescription>
				</Alert>
			)}
		</div>
	)
}
