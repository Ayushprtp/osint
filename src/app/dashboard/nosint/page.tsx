"use client"

import type React from "react"
import { useState, useCallback } from "react"
import {
	Search,
	Loader2,
	Download,
	Info,
	AlertTriangle,
	Shield,
	Database,
	User,
	Mail,
	Link,
	Globe,
	ChevronRight,
	ChevronDown,
	Check,
	X,
	Copy,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"

interface NoSINTResponse {
	data: {
		execution_times: {
			json_parsing: string
			plugin_execution: string
			total_time: string
		}
		results: Array<{
			data: {
				avatar?: string | null
				display?: {
					[key: string]: any
					username?: string
				}
				meta?: {
					name?: string
					user_link?: string
				}
				[key: string]: any
			}
			execution_time: string
			plugin_name: string
			[key: string]: any
		}>
		status: string
	}
	meta: {
		creditsLeft: number
		creditsUsed: number
		timestamp: string
	}
}

const PLUGIN_TYPES = [
	{ id: "username", name: "Username", icon: <User className="h-4 w-4" /> },
	{ id: "email", name: "Email", icon: <Mail className="h-4 w-4" /> },
	{ id: "discord", name: "Discord ID", icon: <Shield className="h-4 w-4" /> },
	{ id: "telegram", name: "Telegram", icon: <Globe className="h-4 w-4" /> },
	{ id: "domain", name: "Domain", icon: <Link className="h-4 w-4" /> },
	{ id: "ip_address", name: "IP Address", icon: <Database className="h-4 w-4" /> },
	{ id: "minecraft", name: "Minecraft", icon: <Shield className="h-4 w-4" /> },
]

const CollapsibleSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
	const [isOpen, setIsOpen] = useState(true)

	return (
		<div className="border-b border-muted/50 last:border-b-0">
			<div
				className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/10 transition-colors"
				onClick={() => setIsOpen(!isOpen)}
			>
				<span className="font-medium text-sm">{title}</span>
				<div className="text-muted-foreground">{isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</div>
			</div>
			{isOpen && <div className="p-3 pt-0 bg-muted/5">{children}</div>}
		</div>
	)
}

const DataValue = ({ value, label }: { value: any; label?: string }) => {
	const [isCopied, setIsCopied] = useState(false)

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text).then(() => {
			setIsCopied(true)
			setTimeout(() => setIsCopied(false), 2000)
		})
	}

	if (value === null || value === undefined) {
		return <span className="text-muted-foreground text-sm italic">null</span>
	}

	if (typeof value === "boolean") {
		return (
			<Badge variant={value ? "default" : "outline"} className={`${value ? "bg-primary/90 text-white" : ""} text-xs`}>
				{value ? <Check size={12} className="mr-1" /> : <X size={12} className="mr-1" />}
				{String(value)}
			</Badge>
		)
	}

	if (typeof value === "string" && (value.startsWith("http://") || value.startsWith("https://"))) {
		return (
			<a
				href={value}
				target="_blank"
				rel="noopener noreferrer"
				className="text-primary hover:underline text-sm flex items-center gap-1 group"
			>
				<Globe className="h-3 w-3 flex-shrink-0" />
				<span className="truncate">{value}</span>
				<Button
					variant="ghost"
					size="icon"
					className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
					onClick={(e) => {
						e.preventDefault()
						e.stopPropagation()
						copyToClipboard(value)
					}}
				>
					{isCopied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
				</Button>
			</a>
		)
	}

	if (
		typeof value === "string" &&
		(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value) || /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(value))
	) {
		try {
			const date = new Date(value)
			if (!Number.isNaN(date.getTime())) {
				return (
					<span className="text-sm flex items-center">
						<time dateTime={value} className="text-primary font-mono">
							{date.toLocaleDateString()} {date.toLocaleTimeString()}
						</time>
					</span>
				)
			}
		} catch (e) {}
	}

	if (typeof value === "number") {
		return <span className="text-primary font-mono text-sm">{value}</span>
	}

	if (typeof value === "string" && (value.startsWith("{") || value.startsWith("["))) {
		try {
			const parsed = JSON.parse(value)
			return <ObjectRenderer data={parsed} />
		} catch {}
	}

	if (typeof value === "string" && value.length > 50) {
		return (
			<div className="group relative text-sm">
				<div className="truncate max-w-full">{value}</div>
				<Button
					variant="ghost"
					size="icon"
					className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 right-0 bg-background/80"
					onClick={() => copyToClipboard(value)}
				>
					{isCopied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
				</Button>
			</div>
		)
	}

	if (typeof value === "string") {
		return <span className="text-sm">{value}</span>
	}

	if (typeof value === "object") {
		return <ObjectRenderer data={value} />
	}

	return <span className="text-sm">{String(value)}</span>
}

const ObjectRenderer = ({ data }: { data: any }) => {
	const [isExpanded, setIsExpanded] = useState(false)

	if (!data || (typeof data === "object" && Object.keys(data).length === 0)) {
		return <span className="text-muted-foreground text-sm">{Array.isArray(data) ? "[ ]" : "{ }"}</span>
	}

	if (Array.isArray(data)) {
		if (data.length === 0) return <span className="text-muted-foreground text-sm">[ ]</span>

		const isSimpleArray = data.every((item) => typeof item !== "object" || item === null)

		if (isSimpleArray && data.length <= 5) {
			return (
				<div className="flex gap-1 flex-wrap">
					{data.map((item, i) => (
						<Badge key={i} variant="outline" className="text-xs">
							<DataValue value={item} />
						</Badge>
					))}
				</div>
			)
		}

		return (
			<div className="mt-1">
				<div
					className="text-xs flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
					onClick={() => setIsExpanded(!isExpanded)}
				>
					{isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
					<span className="font-mono">[{data.length} items]</span>
				</div>

				{isExpanded && (
					<div className="pl-3 border-l border-muted mt-1 space-y-1">
						{data.map((item, index) => (
							<div key={index} className="text-xs">
								<DataValue value={item} />
							</div>
						))}
					</div>
				)}
			</div>
		)
	}

	if (data.headers && Array.isArray(data.headers) && data.values && Array.isArray(data.values)) {
		const isNestedTable = Array.isArray(data.headers[0]) && data.table_names && Array.isArray(data.table_names)

		if (isNestedTable) {
			return (
				<div className="mt-2 space-y-3">
					{data.table_names.map((tableName: string, tableIndex: number) => {
						const headers = data.headers[tableIndex] as string[]
						const tableValues = data.values[tableIndex] || []

						return (
							<div key={`table-${tableIndex}`} className="bg-muted/10 rounded-md border overflow-hidden">
								<div className="bg-muted/30 px-3 py-2 font-medium text-sm border-b">{tableName}</div>
								<div className="p-2">
									{/* For boolean values like account status flags */}
									{headers.length === tableValues[0]?.length &&
										headers.every((h: string) => typeof tableValues[0][headers.indexOf(h)] === "boolean") && (
											<div
												className="grid gap-2"
												style={{ gridTemplateColumns: `repeat(${Math.min(headers.length, 3)}, 1fr)` }}
											>
												{headers.map((header: string, i: number) => {
													const value = tableValues[0][i]
													return (
														<div
															key={`status-${i}`}
															className="flex flex-col items-center p-2 rounded-md bg-background border"
														>
															<span className="text-xs text-muted-foreground mb-1">{header}</span>
															{typeof value === "boolean" ? (
																<Badge
																	variant={value ? "default" : "outline"}
																	className={`${value ? "bg-primary/90 text-white" : "bg-muted"} w-full py-1 flex justify-center`}
																>
																	{value ? <Check size={14} className="mr-1" /> : <X size={14} className="mr-1" />}
																	{value ? "Yes" : "No"}
																</Badge>
															) : (
																<DataValue value={value} />
															)}
														</div>
													)
												})}
											</div>
										)}

									{/* For numeric stats like followers, following */}
									{headers.length === tableValues[0]?.length &&
										headers.every((h: string) => typeof tableValues[0][headers.indexOf(h)] === "number") && (
											<div
												className="grid gap-2"
												style={{ gridTemplateColumns: `repeat(${Math.min(headers.length, 4)}, 1fr)` }}
											>
												{headers.map((header: string, i: number) => {
													const value = tableValues[0][i]
													return (
														<div
															key={`stat-${i}`}
															className="flex flex-col items-center p-2 rounded-md bg-background border"
														>
															<span className="text-xs text-muted-foreground mb-1">{header}</span>
															<span className="text-lg font-semibold text-primary">{value}</span>
														</div>
													)
												})}
											</div>
										)}

									{/* Fallback for other types of data */}
									{!(headers.length === tableValues[0]?.length) && (
										<table className="min-w-full divide-y divide-border text-xs">
											<thead className="bg-muted/30">
												<tr>
													{headers.map((header: string, i: number) => (
														<th key={i} className="px-2 py-1.5 text-left font-medium text-muted-foreground">
															{header}
														</th>
													))}
												</tr>
											</thead>
											<tbody className="divide-y divide-border/50">
												{tableValues.map((row: any[], rowIndex: number) => (
													<tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-background" : "bg-muted/10"}>
														{row.map((cell, cellIndex) => (
															<td key={cellIndex} className="px-2 py-1.5">
																<DataValue value={cell} />
															</td>
														))}
													</tr>
												))}
											</tbody>
										</table>
									)}
								</div>
							</div>
						)
					})}
				</div>
			)
		}

		return (
			<div className="mt-2 overflow-x-auto border rounded-md bg-background">
				<table className="min-w-full divide-y divide-border text-xs">
					<thead className="bg-muted/30">
						<tr>
							{data.headers.map((header: string, i: number) => (
								<th key={i} className="px-2 py-1.5 text-left font-medium text-muted-foreground">
									{header}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-border/50">
						{data.values.map((row: any[], rowIndex: number) => (
							<tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-background" : "bg-muted/10"}>
								{row.map((cell, cellIndex) => (
									<td key={cellIndex} className="px-2 py-1.5">
										<DataValue value={cell} />
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		)
	}

	if (
		(data.created || data.last_seen) &&
		Object.keys(data).filter((key) => !["avatar", "display", "meta", "badges", "recovery", "table"].includes(key))
			.length <= 3
	) {
		return (
			<div className="mt-2 space-y-2">
				{data.created && (
					<div className="flex items-center gap-2 p-2 rounded-md bg-muted/10 border">
						<span className="text-xs font-medium uppercase tracking-wide text-muted-foreground min-w-[90px]">
							CREATED:
						</span>
						<div className="text-primary font-mono text-sm ml-2">
							<DataValue value={data.created} />
						</div>
					</div>
				)}
				{data.last_seen && (
					<div className="flex items-center gap-2 p-2 rounded-md bg-muted/10 border">
						<span className="text-xs font-medium uppercase tracking-wide text-muted-foreground min-w-[90px]">
							LAST_SEEN:
						</span>
						<div className="text-primary font-mono text-sm ml-2">
							<DataValue value={data.last_seen} />
						</div>
					</div>
				)}
				{Object.entries(data)
					.filter(
						([key]) =>
							!["created", "last_seen", "avatar", "display", "meta", "badges", "recovery", "table"].includes(key),
					)
					.map(([key, value], i) => (
						<div key={i} className="flex items-center gap-2 p-2 rounded-md bg-muted/10 border">
							<span className="text-xs font-medium uppercase tracking-wide text-muted-foreground min-w-[90px]">
								{key}:
							</span>
							<div className="ml-2">
								<DataValue value={value} />
							</div>
						</div>
					))}
			</div>
		)
	}

	return (
		<div className="mt-1">
			<div
				className="text-xs flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
				onClick={() => setIsExpanded(!isExpanded)}
			>
				{isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
				<span className="font-mono">Object with {Object.keys(data).length} properties</span>
			</div>

			{isExpanded && (
				<div className="mt-1 grid grid-cols-1 gap-1 pl-3 border-l border-muted">
					{Object.entries(data).map(([key, value], i) => (
						<div key={i} className="text-xs flex">
							<span className="font-medium text-muted-foreground mr-1">{key}:</span>
							<div className="flex-1">
								<DataValue value={value} />
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

export default function NoSINTSearch() {
	const [query, setQuery] = useState("")
	const [pluginType, setPluginType] = useState<string>("username")
	const [isSearching, setIsSearching] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [results, setResults] = useState<NoSINTResponse | null>(null)

	const handleSearch = useCallback(async () => {
		if (!query.trim()) {
			setError(`Please enter a ${pluginType} to search`)
			return
		}

		setIsSearching(true)
		setError(null)
		setResults(null)

		try {
			const response = await fetch("/api/nosint", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					target: query,
					plugin_type: pluginType,
				}),
			})

			if (!response.ok) {
				const errorData = await response.json()
				setError(errorData.error || `API responded with status ${response.status}`)
				setIsSearching(false)
				return
			}

			const data = await response.json()
			setResults(data.data)
		} catch (error) {
			console.error("Error during NoSINT search:", error)
			setError("An error occurred while performing the search")
		} finally {
			setIsSearching(false)
		}
	}, [query, pluginType])

	const handleExport = useCallback(() => {
		if (!results) return

		try {
			const exportData = JSON.stringify(results, null, 2)
			const blob = new Blob([exportData], { type: "application/json" })
			const url = URL.createObjectURL(blob)
			const link = document.createElement("a")
			link.href = url
			link.download = `nosint-${pluginType}-${query}-${Date.now()}.json`
			link.click()
			setTimeout(() => URL.revokeObjectURL(url), 0)
		} catch (error) {
			console.error("Error exporting data:", error)
			setError("Failed to export data")
		}
	}, [results, pluginType, query])

	const renderResultItem = (result: any, index: number) => {
		const { data, execution_time, plugin_name } = result
		const avatar = data.avatar
		const display = data.display || {}
		const meta = data.meta || {}
		const serviceName = meta.name || plugin_name
		const userLink = meta.user_link

		const badges = data.badges || []

		const recovery = data.recovery || {}

		const tableData = data.table || null

		const otherData = Object.entries(data).filter(
			([key]) =>
				!["avatar", "display", "meta", "badges", "recovery", "table", "created", "last_seen"].includes(key) &&
				data[key] !== null &&
				data[key] !== undefined,
		)

		const dateFields: Record<string, string | number | Date> = {}
		if (data.created) dateFields.created = data.created
		if (data.last_seen) dateFields.last_seen = data.last_seen

		return (
			<Card
				key={`${plugin_name}-${index}`}
				className="overflow-hidden hover:shadow-md transition-shadow duration-300 h-full flex flex-col"
			>
				<CardHeader className="bg-gradient-to-r from-muted/30 to-muted/5 py-3 px-4">
					<CardTitle className="text-base flex items-center justify-between">
						<span className="flex items-center gap-2">
							<Shield className="h-4 w-4 text-primary flex-shrink-0" />
							<span className="font-medium truncate">{serviceName}</span>
						</span>
						<div className="flex items-center gap-2 flex-shrink-0">
							<Badge variant="outline" className="text-xs whitespace-nowrap">
								{execution_time}
							</Badge>
							<Badge variant="secondary" className="ml-2 text-xs whitespace-nowrap">
								{plugin_name}
							</Badge>
						</div>
					</CardTitle>
					{userLink && (
						<CardDescription>
							<a
								href={userLink}
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary hover:underline flex items-center gap-1 truncate"
							>
								<Globe className="h-3 w-3 flex-shrink-0" />
								<span className="truncate">{userLink}</span>
							</a>
						</CardDescription>
					)}

					{/* Show badges if present */}
					{badges.length > 0 && (
						<div className="flex flex-wrap gap-1 mt-2">
							{badges.map((badge: string, i: number) => (
								<Badge key={`badge-${i}`} variant="default" className="bg-primary/80 text-white text-xs">
									{badge}
								</Badge>
							))}
						</div>
					)}
				</CardHeader>
				<CardContent className="p-0 flex-1 flex flex-col">
					{/* Avatar if available */}
					{avatar && (
						<div className="p-4 flex justify-center">
							<img
								src={avatar}
								alt={`${serviceName} profile`}
								className="h-20 w-20 rounded-full object-cover border-2 border-muted"
							/>
						</div>
					)}

					<div className="flex-1 flex flex-col">
						{/* Date fields if available */}
						{Object.keys(dateFields).length > 0 && (
							<CollapsibleSection title="Timestamps">
								<div className="grid grid-cols-1 gap-2">
									{Object.entries(dateFields).map(([key, value], i) => (
										<div key={`date-${i}`} className="flex items-start">
											<span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mr-2 min-w-[90px]">
												{key}:
											</span>
											<div className="flex-1">
												<DataValue value={value} />
											</div>
										</div>
									))}
								</div>
							</CollapsibleSection>
						)}

						{/* Table data if available */}
						{tableData && (
							<CollapsibleSection title="Account Statistics">
								<div className="mt-1">
									<DataValue value={tableData} />
								</div>
							</CollapsibleSection>
						)}

						{/* Display info if available */}
						{Object.keys(display).length > 0 && (
							<CollapsibleSection title="Account Information">
								<div className="grid grid-cols-1 gap-2">
									{Object.entries(display).map(([key, value], i) => (
										<div key={`display-${i}`} className="flex items-start">
											<span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mr-2 min-w-[90px]">
												{key}:
											</span>
											<div className="flex-1">
												<DataValue value={value} />
											</div>
										</div>
									))}
								</div>
							</CollapsibleSection>
						)}

						{/* Recovery info if available */}
						{Object.keys(recovery).length > 0 && (
							<CollapsibleSection title="Recovery Information">
								<div className="grid grid-cols-1 gap-2">
									{Object.entries(recovery).map(([key, value], i) => (
										<div key={`recovery-${i}`} className="flex items-start">
											<span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mr-2 min-w-[90px]">
												{key}:
											</span>
											<div className="flex-1">
												<DataValue value={value} />
											</div>
										</div>
									))}
								</div>
							</CollapsibleSection>
						)}

						{/* Other data properties */}
						{otherData.length > 0 && (
							<CollapsibleSection title="Additional Data">
								<div className="grid grid-cols-1 gap-3">
									{otherData.map(([key, value], i) => (
										<div key={`data-${i}`} className="flex items-start">
											<span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mr-2 min-w-[90px]">
												{key}:
											</span>
											<div className="flex-1">
												<DataValue value={value} />
											</div>
										</div>
									))}
								</div>
							</CollapsibleSection>
						)}
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="container mx-auto py-6 sm:py-10 px-4 space-y-8">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">NoSINT Search</h1>
			</div>

			<Card className="shadow-sm">
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2 text-xl">
						<Search className="h-5 w-5 text-primary" />
						Search by {PLUGIN_TYPES.find((type) => type.id === pluginType)?.name}
					</CardTitle>
					<CardDescription>Search across multiple platforms with NoSINT</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-4">
						<ScrollArea className="w-full whitespace-nowrap pb-3">
							<div className="flex space-x-2 mb-4">
								{PLUGIN_TYPES.map((type) => (
									<Button
										key={type.id}
										variant={pluginType === type.id ? "default" : "outline"}
										size="sm"
										onClick={() => setPluginType(type.id)}
										className="flex items-center gap-2 transition-colors"
									>
										{type.icon}
										{type.name}
									</Button>
								))}
							</div>
						</ScrollArea>

						<div className="relative flex-1">
							<Input
								type="text"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder={`Enter ${pluginType}...`}
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
								<h3 className="text-lg font-medium mb-2">Searching NoSINT</h3>
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

			{results?.data?.results && results.data.results.length > 0 && (
				<Card className="shadow-sm">
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center justify-between text-xl">
							<span className="flex items-center gap-2">
								<Database className="h-5 w-5 text-primary" />
								NoSINT Results
							</span>
							<div className="flex items-center gap-2">
								<Badge variant="secondary" className="px-2 py-1 text-sm">
									{results.data.results.length} results found
								</Badge>
								{results.meta && (
									<Badge variant="outline" className="px-2 py-1 text-sm">
										{results.meta.creditsUsed} credits used
									</Badge>
								)}
							</div>
						</CardTitle>
						<CardDescription>Search completed in {results.data.execution_times.total_time}</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex justify-end mb-4">
							<Button
								variant="outline"
								size="sm"
								onClick={handleExport}
								disabled={!results}
								className="transition-colors"
							>
								<Download className="h-4 w-4 mr-2" />
								Export Results
							</Button>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{results.data.results
								.filter((result) => result.plugin_name !== "SnusbasePlugin")
								.map((result, index) => renderResultItem(result, index))}
						</div>
					</CardContent>
				</Card>
			)}

			{results?.data && (!results.data.results || results.data.results.length === 0) && (
				<Alert>
					<Info className="h-4 w-4" />
					<AlertTitle>No Results Found</AlertTitle>
					<AlertDescription>
						No data was found for your search query. Try a different search term or plugin type.
					</AlertDescription>
				</Alert>
			)}
		</div>
	)
}
