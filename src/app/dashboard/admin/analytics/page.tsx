"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import {
	ArrowLeft,
	BarChart3,
	Clock,
	Users,
	Zap,
	Search,
	FileBarChart,
	UserCircle2,
	Calendar,
	AlertTriangle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchQueryUsage, type QueryUsageData } from "@/lib/billing"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const timeRangeOptions = [
	{ value: "1d", label: "Last 24 hours" },
	{ value: "7d", label: "Last 7 days" },
	{ value: "30d", label: "Last 30 days" },
	{ value: "90d", label: "Last 90 days" },
]

function Header({ timeRange, setTimeRange }: { timeRange: string; setTimeRange: (timeRange: string) => void }) {
	return (
		<div className="flex items-center justify-between">
			<div className="flex items-center space-x-4">
				<Link href="/dashboard/admin" className="text-muted-foreground hover:text-primary">
					<ArrowLeft className="h-6 w-6" />
				</Link>
				<h1 className="text-2xl font-bold">Query Usage Analytics</h1>
			</div>
			<Select value={timeRange} onValueChange={setTimeRange}>
				<SelectTrigger className="w-[180px]">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{timeRangeOptions.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	)
}

function StatCards({ queryUsage }: { queryUsage: QueryUsageData | null }) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
			<StatCard
				icon={<Users className="h-6 w-6" />}
				title="Active Users"
				value={queryUsage?.uniqueUsers.toString() ?? "0"}
				description="Unique users in the period"
			/>
			<StatCard
				icon={<Zap className="h-6 w-6" />}
				title="Total Queries"
				value={queryUsage?.totalQueries.toString() ?? "0"}
				description="Queries executed"
			/>
			<StatCard
				icon={<BarChart3 className="h-6 w-6" />}
				title="Avg. Queries/User"
				value={queryUsage?.averageQueriesPerUser.toFixed(2) ?? "0"}
				description="Average usage per user"
			/>
			<StatCard
				icon={<Calendar className="h-6 w-6" />}
				title="Peak Usage Date"
				value={
					queryUsage?.queryCountByDay.reduce((max, day) => (day.count > max.count ? day : max), {
						date: "N/A",
						count: 0,
					}).date ?? "N/A"
				}
				description="Date with highest activity"
			/>
		</div>
	)
}

function StatCard({
	icon,
	title,
	value,
	description,
}: {
	icon: React.ReactNode
	title: string
	value: string
	description: string
}) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				{icon}
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{value}</div>
				<p className="text-xs text-muted-foreground">{description}</p>
			</CardContent>
		</Card>
	)
}

export default function QueryUsageReport() {
	const [queryUsage, setQueryUsage] = useState<QueryUsageData | null>(null)
	const [timeRange, setTimeRange] = useState("1d")
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true)
			setError(null)
			try {
				const data = await fetchQueryUsage(timeRange)
				if (data) {
					setQueryUsage(data)
				} else {
					setError("Failed to fetch query usage data. Please try again later.")
				}
			} catch (error) {
				console.error("Failed to fetch query usage:", error)
				setError("An error occurred while fetching query usage data.")
			} finally {
				setIsLoading(false)
			}
		}

		fetchData()
	}, [timeRange])

	return (
		<main className="container mx-auto py-8 px-4 space-y-8">
			<Header timeRange={timeRange} setTimeRange={setTimeRange} />
			{isLoading ? (
				<div className="space-y-4">
					<Skeleton className="h-[200px] w-full" />
					<Skeleton className="h-[400px] w-full" />
				</div>
			) : error ? (
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			) : queryUsage ? (
				<>
					<StatCards queryUsage={queryUsage} />
					<Tabs defaultValue="overview" className="w-full">
						<TabsList>
							<TabsTrigger value="overview">Overview</TabsTrigger>
							<TabsTrigger value="user-specific">User-Specific Data</TabsTrigger>
						</TabsList>
						<TabsContent value="overview">
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
								<DataTable
									title="Top Users"
									icon={<UserCircle2 className="h-5 w-5" />}
									headers={["Username", "Alias", "Query Count"]}
									data={queryUsage.topUsers.map((user) => [
										user.username,
										user.alias === "SET_ALIAS" ? "N/A" : user.alias,
										user.queryCount.toString(),
									])}
								/>
								<DataTable
									title="Daily Query Trends"
									icon={<FileBarChart className="h-5 w-5" />}
									headers={["Date", "Query Count"]}
									data={queryUsage.queryCountByDay.map((day) => [day.date, day.count.toString()])}
								/>
								<DataTable
									title="Recent User Activities"
									icon={<Clock className="h-5 w-5" />}
									headers={["Username", "Alias", "Search Type"]}
									data={queryUsage.latestUserSearches.map((search) => [
										search.username,
										search.alias === "SET_ALIAS" ? "N/A" : search.alias,
										search.type,
									])}
								/>
							</div>
						</TabsContent>
						<TabsContent value="user-specific">
							<UserSearchTypesTable data={queryUsage.userSearchTypes} />
						</TabsContent>
					</Tabs>
				</>
			) : (
				<Alert>
					<AlertTriangle className="h-4 w-4" />
					<AlertTitle>No Data Available</AlertTitle>
					<AlertDescription>There is no query usage data for the selected time range.</AlertDescription>
				</Alert>
			)}
		</main>
	)
}

function DataTable({
	title,
	icon,
	headers,
	data,
}: {
	title: string
	icon: React.ReactNode
	headers: string[]
	data?: string[][]
}) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center space-x-2">
					{icon}
					<CardTitle>{title}</CardTitle>
				</div>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							{headers.map((header) => (
								<TableHead key={header}>{header}</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{data?.map((row) => (
							<TableRow key={row.join("-")}>
								{row.map((cell) => (
									<TableCell key={cell}>{cell}</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	)
}

function UserSearchTypesTable({
	data,
}: {
	data: QueryUsageData["userSearchTypes"]
}) {
	const [searchTerm, setSearchTerm] = useState("")
	const [selectedUser, setSelectedUser] = useState<string | null>(null)

	const filteredData = useMemo(() => {
		return data.filter(
			(user) =>
				user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
				user.alias.toLowerCase().includes(searchTerm.toLowerCase()),
		)
	}, [data, searchTerm])

	const selectedUserData = useMemo(() => {
		if (!selectedUser) return null
		return data.find((user) => user.username === selectedUser)
	}, [selectedUser, data])

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center space-x-2">
					<UserCircle2 className="h-5 w-5" />
					<CardTitle>User-Specific Search Patterns</CardTitle>
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex items-center space-x-2 mb-4">
					<Search className="h-5 w-5 text-muted-foreground" />
					<Input
						placeholder="Search users by name or alias..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="flex-1"
					/>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Username</TableHead>
								<TableHead>Alias</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredData.map((user) => (
								<TableRow
									key={user.username}
									className={user.username === selectedUser ? "bg-muted" : ""}
									onClick={() => setSelectedUser(user.username === selectedUser ? null : user.username)}
									style={{ cursor: "pointer" }}
								>
									<TableCell>{user.username}</TableCell>
									<TableCell>{user.alias === "SET_ALIAS" ? "N/A" : user.alias}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					{selectedUserData && (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Search Type</TableHead>
									<TableHead>Count</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{selectedUserData.searchTypes.map((type) => (
									<TableRow key={type.type}>
										<TableCell>{type.type}</TableCell>
										<TableCell>{type.count}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</div>
			</CardContent>
		</Card>
	)
}
