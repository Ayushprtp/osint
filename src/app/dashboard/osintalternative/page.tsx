"use client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Toggle } from "@/components/ui/toggle"
import { pluralize } from "@/lib/text"
import {
	AlertTriangle,
	ArrowLeft,
	ChevronDown,
	ChevronUp,
	Database,
	Grid2X2,
	LayoutList,
	Loader2,
	Search,
	User,
	Globe,
	Mail,
	Twitter,
	Facebook,
	Instagram,
	Linkedin,
	Github,
	Youtube,
	FileText,
	Hash,
	MapPin,
	Phone,
	Shield,
	Calendar,
	Clock,
	Briefcase,
	AtSign,
} from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

interface ModuleData {
	[key: string]: any
}

interface OsintResponse {
	modules: {
		basic: string[]
		[key: string]: any
	}
}

const getModuleIcon = (moduleName: string) => {
	const iconMap: Record<string, React.ReactNode> = {
		email: <Mail className="w-5 h-5" />,
		twitter: <Twitter className="w-5 h-5" />,
		facebook: <Facebook className="w-5 h-5" />,
		instagram: <Instagram className="w-5 h-5" />,
		linkedin: <Linkedin className="w-5 h-5" />,
		github: <Github className="w-5 h-5" />,
		youtube: <Youtube className="w-5 h-5" />,
		domain: <Globe className="w-5 h-5" />,
		document: <FileText className="w-5 h-5" />,
		location: <MapPin className="w-5 h-5" />,
		phone: <Phone className="w-5 h-5" />,
		security: <Shield className="w-5 h-5" />,
		profile: <User className="w-5 h-5" />,
		social: <AtSign className="w-5 h-5" />,
		work: <Briefcase className="w-5 h-5" />,
		date: <Calendar className="w-5 h-5" />,
		time: <Clock className="w-5 h-5" />,
	}

	for (const [key, icon] of Object.entries(iconMap)) {
		if (moduleName.toLowerCase().includes(key)) {
			return icon
		}
	}

	return <Hash className="w-5 h-5" />
}

export default function osintalternative() {
	const [data, setData] = useState<OsintResponse | null>(null)
	const [query, setQuery] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const [hasSearched, setHasSearched] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [expandedModules, setExpandedModules] = useState<string[]>([])
	const [filterQuery, setFilterQuery] = useState("")
	const [isGridView, setIsGridView] = useState(false)

	const fetchData = useCallback(async () => {
		if (!query.trim()) {
			setError("Please enter a search query")
			return
		}

		setIsLoading(true)
		setHasSearched(true)
		setError(null)
		setData(null)

		try {
			const response = await fetch(`/api/osintalternative?email=${encodeURIComponent(query)}`, {
				headers: {
					"Content-Type": "application/json",
				},
			})
			if (!response.ok) {
				throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`)
			}

			const jsonData = await response.json()
			setData(jsonData)
		} catch (error) {
			console.error("Error fetching data:", error)
			setError("An error occurred while fetching data. Please try again.")
		} finally {
			setIsLoading(false)
		}
	}, [query])

	const toggleExpand = useCallback((module: string) => {
		setExpandedModules((prev) => (prev.includes(module) ? prev.filter((m) => m !== module) : [...prev, module]))
	}, [])

	const generateRandomKey = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 11)}`

	const renderPropertyValue = useCallback((key: string, value: any) => {
		if (typeof value === "object" && value !== null) {
			return JSON.stringify(value)
		}

		if (key.includes("picture") || key.includes("profile_picture") || key.includes("avatar")) {
			return (
				<Avatar>
					<AvatarImage src={value as string} alt="User avatar" />
					<AvatarFallback>
						<User />
					</AvatarFallback>
				</Avatar>
			)
		}

		if (key.includes("url") || key.includes("website") || key.includes("link")) {
			return (
				<a href={value as string} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
					{String(value)
						.replace(/^https?:\/\//, "")
						.replace(/\/$/, "")}
				</a>
			)
		}

		return value
	}, [])

	const moduleEntries = data ? Object.entries(data.modules).filter(([key]) => key !== "basic") : []
	const foundResults = moduleEntries.length
	const basicModules = data?.modules.basic || []

	const exportData = useCallback(() => {
		if (!data) return

		const jsonContent = JSON.stringify(data, null, 2)
		const blob = new Blob([jsonContent], { type: "application/json" })
		const url = URL.createObjectURL(blob)
		const link = document.createElement("a")
		link.href = url
		link.download = "osint-export.json"
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
		URL.revokeObjectURL(url)
	}, [data])

	useEffect(() => {
		if (isGridView && data) {
			const expandedModules = Object.keys(data.modules).filter((key) => key !== "basic")
			setExpandedModules(expandedModules)
		} else {
			setExpandedModules([])
		}
	}, [isGridView, data])

	return (
		<div className="container mx-auto py-8 px-4 space-y-8">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-3xl font-bold tracking-tight">Data Intelligence</h1>
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
							type="email"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Enter email to search..."
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
				<Alert variant={"destructive"}>
					<div className="flex items-center gap-2 mb-1">
						<AlertTriangle className="h-4 w-4 text-red-500" />
						<AlertTitle>Error</AlertTitle>
					</div>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{hasSearched && (!data || (data && Object.keys(data.modules).length <= 1)) && !isLoading && !error && (
				<Alert variant={"default"}>
					<div className="flex items-center gap-2 mb-1">
						<AlertTriangle className="h-4 w-4 text-yellow-500" />
						<AlertTitle>No results found</AlertTitle>
					</div>
					<AlertDescription>
						We couldn't find any results for the search query. Please try again with a different email address.
					</AlertDescription>
				</Alert>
			)}

			{data && moduleEntries.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<span className="flex items-center gap-2">
								<Database className="h-5 w-5" />
								Search Results
							</span>
							<Badge variant="secondary">
								{foundResults} {pluralize("module", foundResults)} found
							</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
								<div className="flex flex-wrap items-center gap-2">
									<Button onClick={exportData} variant="outline">
										Export as JSON
									</Button>
									<Input
										type="text"
										value={filterQuery}
										onChange={(e) => setFilterQuery(e.target.value)}
										placeholder="Filter results..."
										className="w-full sm:w-[200px]"
									/>
									<Toggle pressed={isGridView} onPressedChange={setIsGridView} aria-label="Toggle grid view">
										{isGridView ? <Grid2X2 className="h-4 w-4" /> : <LayoutList className="h-4 w-4" />}
									</Toggle>
								</div>
								{basicModules.length > 0 && (
									<Badge variant={"outline"}>
										{basicModules.length} basic {pluralize("module", basicModules.length)} available
									</Badge>
								)}
							</div>

							{basicModules.length > 0 && (
								<Card>
									<CardHeader>
										<CardTitle>Basic Modules</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="flex flex-wrap gap-2">
											{basicModules.map((module) => (
												<Badge key={module} variant="secondary">
													{module}
												</Badge>
											))}
										</div>
									</CardContent>
								</Card>
							)}

							<div className={isGridView ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
								{moduleEntries
									.filter(([moduleName]) => {
										const searchTerm = filterQuery.toLowerCase()
										return moduleName.toLowerCase().includes(searchTerm)
									})
									.map(([moduleName, moduleData]) => (
										<Card key={generateRandomKey(moduleName)} className={isGridView ? "flex flex-col h-full" : ""}>
											<CardHeader className="flex-none">
												<div className="flex justify-between items-center">
													<CardTitle className="flex items-center gap-2">
														<div className="flex items-center justify-center w-10 h-10 bg-muted rounded-sm">
															{getModuleIcon(moduleName)}
														</div>
														{moduleName}
													</CardTitle>
												</div>
											</CardHeader>
											<CardContent className={isGridView ? "flex-1 overflow-auto" : ""}>
												{!isGridView && (
													<div className="flex justify-end mb-4">
														<Button variant="outline" size="sm" onClick={() => toggleExpand(moduleName)}>
															{expandedModules.includes(moduleName) ? (
																<ChevronUp className="h-4 w-4 mr-2" />
															) : (
																<ChevronDown className="h-4 w-4 mr-2" />
															)}
															{expandedModules.includes(moduleName) ? "Hide" : "Show"} Details
														</Button>
													</div>
												)}
												{(isGridView || expandedModules.includes(moduleName)) && (
													<div className={isGridView ? "max-h-[500px] overflow-y-auto" : "space-y-4"}>
														<Table>
															<TableHeader>
																<TableRow>
																	<TableHead>Property</TableHead>
																	<TableHead>Value</TableHead>
																</TableRow>
															</TableHeader>
															<TableBody>
																{Object.entries(moduleData).map(([key, value]) => (
																	<TableRow key={generateRandomKey(`${moduleName}_${key}`)}>
																		<TableCell className="font-medium">{key}</TableCell>
																		<TableCell>{renderPropertyValue(key, value)}</TableCell>
																	</TableRow>
																))}
															</TableBody>
														</Table>
													</div>
												)}
											</CardContent>
										</Card>
									))}
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
