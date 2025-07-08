"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import {
	Shield,
	Activity,
	Fingerprint,
	Crosshair,
	RefreshCw,
	Lock,
	Clock,
	User,
	GitCommit,
	LinkIcon,
	ChevronLeft,
	ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { getLatestVersion, getRecentChangelogs } from "@/lib/changelog"
import { DATA_SOURCES, getAllDataSources } from "@/config/dataSources"
import { docResources } from "@/config/docResources"
import { DataSourceItem } from "@/components/dashboard/DataSourceItem"
import { DocResourceItem } from "@/components/dashboard/DocResourceItem"
import { MetricCard } from "@/components/dashboard/MetricCard"

const formatLargeNumber = (num: string | number): string => {
	if (typeof num === "string") {
		if (num.includes("B+") || num.includes("M+")) return num

		num = Number.parseFloat(num.replace(/[^0-9.]/g, ""))
		if (Number.isNaN(num)) return "0"
	}

	if (num >= 1e9) {
		return `${(num / 1e9).toFixed(1)}B+`
	}
	if (num >= 1e6) {
		return `${(num / 1e6).toFixed(1)}M+`
	}
	if (num >= 1e3) {
		return `${(num / 1e3).toFixed(1)}K+`
	}
	return num.toString()
}

const calculateTotalRecords = (sources: typeof DATA_SOURCES): string => {
	let total = 0

	sources.forEach((source) => {
		if (source.category === "dashboard" || source.category === "resources" || source.category === "changelog") return

		if (
			!source.records ||
			source.records === "0" ||
			source.records === "0 records" ||
			source.records === "0+" ||
			source.records === "0K" ||
			source.records === "0M" ||
			source.records === "0B"
		)
			return

		const value = source.records.replace(/[^0-9.]/g, "")
		const suffix = source.records.replace(/[0-9.]/g, "").trim()

		let multiplier = 1
		if (suffix.includes("B")) multiplier = 1e9
		else if (suffix.includes("M")) multiplier = 1e6
		else if (suffix.includes("K")) multiplier = 1e3

		total += Number.parseFloat(value) * multiplier
	})

	return formatLargeNumber(total)
}

export default function DashboardPage() {
	const [currentVersion, setCurrentVersion] = useState("")
	const [expiresAt, setExpiresAt] = useState("17-06-2025")
	const [subscriptionType, setSubscriptionType] = useState("31-Day License")
	const [currentPage, setCurrentPage] = useState(1)
	const sourcesPerPage = 8

	useEffect(() => {
		setCurrentVersion(`v${getLatestVersion()}`)
	}, [])

	const getMetrics = (version: string) => {
		const activeDataSources = getAllDataSources().filter(
			(source) =>
				source.status === "active" &&
				source.category !== "dashboard" &&
				source.category !== "resources" &&
				source.category !== "changelog" &&
				source.records &&
				source.records !== "0" &&
				source.records !== "0 records" &&
				source.records !== "0+" &&
				source.records !== "0K" &&
				source.records !== "0M" &&
				source.records !== "0B",
		)

		return [
			{
				label: "System Status",
				value: "Active",
				icon: <Activity className="w-4 h-4 text-green-500" />,
				color: "bg-green-500/10",
			},
			{
				label: "Current Version",
				value: version || "Unknown",
				icon: <GitCommit className="w-4 h-4 text-amber-500" />,
				color: "bg-amber-500/10",
			},
			{
				label: "Data Sources",
				value: `${activeDataSources.length} Active`,
				icon: <Shield className="w-4 h-4 text-blue-500" />,
				color: "bg-blue-500/10",
			},
			{
				label: "Privacy Mode",
				value: "No Logging",
				icon: <Shield className="w-4 h-4 text-rose-500" />,
				color: "bg-rose-500/10",
			},
		]
	}

	const changelogEntries = getRecentChangelogs(5)

	useEffect(() => {
		const fetchSubscriptionInfo = async () => {
			try {
				const response = await fetch("/api/status")
				const data = await response.json()

				if (data?.expiryDate) {
					setExpiresAt(new Date(data.expiryDate).toLocaleDateString())
					setSubscriptionType(`${data.daysLeft} Day License`)
				} else {
					setExpiresAt("No active license")
					setSubscriptionType("No License")
				}
			} catch (error) {
				console.error("Error fetching subscription info:", error)
				setExpiresAt("Error fetching license")
				setSubscriptionType("Unknown")
			}
		}
		fetchSubscriptionInfo()
	}, [])

	const totalPages = Math.ceil(
		getAllDataSources().filter(
			(source) =>
				source.category !== "dashboard" &&
				source.category !== "resources" &&
				source.category !== "changelog" &&
				source.records &&
				source.records !== "0" &&
				source.records !== "0 records" &&
				source.records !== "0+" &&
				source.records !== "0K" &&
				source.records !== "0M" &&
				source.records !== "0B",
		).length / sourcesPerPage,
	)
	const indexOfLastSource = currentPage * sourcesPerPage
	const indexOfFirstSource = indexOfLastSource - sourcesPerPage
	const currentSources = getAllDataSources()
		.filter(
			(source) =>
				source.category !== "dashboard" &&
				source.category !== "resources" &&
				source.category !== "changelog" &&
				source.records &&
				source.records !== "0" &&
				source.records !== "0 records" &&
				source.records !== "0+" &&
				source.records !== "0K" &&
				source.records !== "0M" &&
				source.records !== "0B",
		)
		.slice(indexOfFirstSource, indexOfLastSource)

	const nextPage = () => {
		setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev))
	}

	const prevPage = () => {
		setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev))
	}

	return (
		<main className="flex-1 overflow-y-auto bg-gradient-to-b from-background to-background/80">
			<div className="container mx-auto py-8 px-4 space-y-6">
				<Card className="border-rose-400/30 bg-gradient-to-r from-rose-950/20 to-rose-900/10 backdrop-blur-sm">
					<CardContent className="p-6">
						<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-rose-500/20 rounded-lg">
									<Fingerprint className="w-4 h-4 text-rose-400" />
								</div>
								<div>
									<h2 className="text-xl font-bold">TRACKED Intelligence Matrix</h2>
									<p className="text-sm text-muted-foreground">No data collection or search logging</p>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<div className="flex items-center gap-2 bg-background/50 rounded p-2">
									<Clock className="w-4 h-4 text-rose-400" />
									<span className="text-xs">Last updated: Mar 1, 2025</span>
								</div>
								<div className="px-3 py-2 bg-rose-500/20 rounded-lg text-sm flex items-center gap-2">
									<Lock className="w-4 h-4" />
									<span>Private Mode Active</span>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{getMetrics(currentVersion).map((metric) => (
						<MetricCard key={metric.label} {...metric} />
					))}
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<Card className="lg:col-span-2 border-rose-400/20 shadow-sm hover:shadow-md transition-all duration-300">
						<CardHeader className="pb-2">
							<div className="flex justify-between items-center">
								<div>
									<CardTitle className="flex items-center gap-2">
										<Shield className="w-4 h-4 text-rose-400" />
										Data Sources
									</CardTitle>
									<CardDescription>Status of connected intelligence sources</CardDescription>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-xs bg-rose-400/10 text-rose-400 px-2 py-1 rounded-full">
										{getAllDataSources().length} Total
									</span>
									<button className="p-2 bg-muted rounded-md hover:bg-muted/80 transition-colors">
										<RefreshCw className="w-4 h-4" />
									</button>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
								{currentSources.map((source) => (
									<DataSourceItem key={source.name} {...source} />
								))}
							</div>

							{totalPages > 1 && (
								<div className="flex justify-center items-center mt-6">
									<div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
										<button
											onClick={prevPage}
											disabled={currentPage === 1}
											className="p-1.5 bg-gradient-to-r from-rose-500/30 to-rose-400/40 rounded-md hover:from-rose-500/40 hover:to-rose-400/50 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:scale-100 disabled:shadow-none disabled:from-transparent disabled:to-transparent"
										>
											<ChevronLeft className="w-4 h-4 text-rose-50" />
										</button>
										<span className="text-xs px-2">
											{currentPage} / {totalPages}
										</span>
										<button
											onClick={nextPage}
											disabled={currentPage === totalPages}
											className="p-1.5 bg-gradient-to-r from-rose-500/30 to-rose-400/40 rounded-md hover:from-rose-500/40 hover:to-rose-400/50 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:scale-100 disabled:shadow-none disabled:from-transparent disabled:to-transparent"
										>
											<ChevronRight className="w-4 h-4 text-rose-50" />
										</button>
									</div>
								</div>
							)}
						</CardContent>
						<CardFooter>
							<p className="text-xs text-muted-foreground">
								Integration status with external data sources. Verification dates indicate when data was last confirmed
								available.
							</p>
						</CardFooter>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Help</CardTitle>
							<CardDescription>Resources and guides to OSINT</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-0">
								{docResources.map((resource, index) => (
									<DocResourceItem key={index} {...resource} />
								))}
							</div>
						</CardContent>
						<CardFooter>
							<Link
								href="/resources"
								className="w-full px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg transition-all text-sm flex items-center justify-center gap-2"
							>
								<LinkIcon size={12} />
								View All Guides
							</Link>
						</CardFooter>
					</Card>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Card>
						<CardHeader>
							<CardTitle>Coverage Stats</CardTitle>
							<CardDescription>TRACKED intelligence matrix scope</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{[
									{ label: "Total Records Accessible", value: calculateTotalRecords(DATA_SOURCES) },
									{
										label: "Active Data Sources",
										value: DATA_SOURCES.filter((s) => s.status === "active").length.toString(),
									},
									{ label: "Unique Datasets", value: "1,450+" },
									{ label: "Last Platform Update", value: "17-05-2025" },
								].map((stat, index) => (
									<div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
										<span className="text-sm">{stat.label}</span>
										<span className="font-mono font-medium">{stat.value}</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Access Information</CardTitle>
							<CardDescription>Your current TRACKED subscription</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="p-4 bg-rose-950/40 rounded-lg border border-rose-800/20 mb-4">
								<div className="flex items-center gap-3 mb-3">
									<div className="p-2 bg-rose-900/50 rounded-lg">
										<Crosshair className="w-4 h-4 text-rose-400" />
									</div>
									<div>
										<h4 className="text-sm font-semibold">
											{subscriptionType === "No License" ? "No Active Subscription" : "Professional Tier"}
										</h4>
										<p className="text-xs text-muted-foreground">
											{subscriptionType === "No License" ? "Limited access" : "Full-featured access"}
										</p>
									</div>
								</div>
								<div className="space-y-2">
									<div className="flex justify-between items-baseline text-sm">
										<span>Subscription Type</span>
										<span className="font-mono">{subscriptionType}</span>
									</div>
									<div className="flex justify-between items-baseline text-sm">
										<span>Expires At</span>
										<span className="font-mono">{expiresAt}</span>
									</div>
								</div>
							</div>
							<div className="flex justify-center">
								<button
									onClick={() => (window.location.href = "https://tracked.sell.app/")}
									className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg transition-all text-sm flex items-center gap-2"
								>
									<User className="w-4 h-4" />
									Purchase New Plan
								</button>
							</div>
						</CardContent>
					</Card>
				</div>

				<Card className="bg-black/10">
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<Lock className="w-4 h-4 text-rose-400" />
							<p className="text-xs text-muted-foreground">
								TRACKED operates with a strict no-logging policy. No search history or user activity is recorded.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</main>
	)
}
