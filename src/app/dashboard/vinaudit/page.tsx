"use client"

import { useState, useCallback, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
	ArrowLeft,
	FileText,
	Loader2,
	Search,
	AlertTriangle,
	Car,
	Database,
	FileDown,
	Info,
	Calendar,
	Gauge,
	MapPin,
	CheckCircle,
	XCircle,
	BarChart4,
	Shield,
	History,
	Award,
	Zap,
	Truck,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
// import type { ReportType } from "@/app/api/(osint)/vinaudit/route" // Temporarily disabled
type ReportType = "basic" | "full" | "json" | "pdf" // Temporary type definition

interface SearchResponse {
	success: boolean
	data: any
	error?: string
}

export default function VinAudit() {
	const [isSearching, setIsSearching] = useState(false)
	const [reportType, setReportType] = useState<ReportType>("json")
	const [vin, setVin] = useState("")
	const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [activeTab, setActiveTab] = useState("overview")

	const handleSearch = useCallback(async () => {
		if (!vin.trim()) {
			setError("Please enter a VIN")
			return
		}

		const vinRegex = /^[A-HJ-NPR-Za-hj-npr-z\d]{17}$/
		if (!vinRegex.test(vin)) {
			setError("Invalid VIN format. VIN must be 17 characters (no I, O, or Q)")
			return
		}

		setIsSearching(true)
		setError(null)
		setSearchResults(null)

		try {
			if (reportType === "pdf") {
				const jsonResponse = await fetch("/api/vinaudit", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						vin,
						reportType: "json",
					}),
				})

				if (!jsonResponse.ok) {
					const errorData = await jsonResponse.json()
					throw new Error(errorData?.error || "An error occurred during the search")
				}

				const data = await jsonResponse.json()

				if (!data.success) {
					throw new Error(data.error || "An error occurred during the search")
				}

				const reportId = data.data.id
				window.open(`/api/vinaudit?reportId=${reportId}&reportType=pdf`, "_blank")

				setSearchResults(data)
				setIsSearching(false)
				return
			}

			const response = await fetch("/api/vinaudit", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					vin,
					reportType,
				}),
			})

			if (!response.ok) {
				const errorData = await response.json()

				if (response.status === 403 && errorData?.error?.includes("subscription")) {
					throw new Error("SUBSCRIPTION_REQUIRED")
				}

				throw new Error(errorData?.error || "An error occurred during the search")
			}

			const data = await response.json()

			if (!data.success) {
				throw new Error(data.error || "An error occurred during the search")
			}

			setSearchResults(data)
			setActiveTab("overview")
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
	}, [vin, reportType])

	const vehicleData = useMemo(() => {
		if (!searchResults?.data) return null
		return searchResults.data
	}, [searchResults])

	const downloadResults = useCallback(() => {
		if (!searchResults) return

		const content = JSON.stringify(searchResults, null, 2)
		const filename = `vinaudit-${vin}.json`
		const mimeType = "application/json"

		const blob = new Blob([content], { type: mimeType })
		const url = URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = url
		a.download = filename
		a.click()
	}, [searchResults, vin])

	const getVehicleIcon = useMemo(() => {
		if (!vehicleData?.specs) return <Car className="h-24 w-24 text-muted-foreground/70" />

		const model = vehicleData.specs.Model.toLowerCase()
		const style = vehicleData.specs.Style?.toLowerCase() || ""

		if (model.includes("suv") || style.includes("suv") || model.includes("expedition")) {
			return <Car className="h-24 w-24 text-primary/70" />
		}
		if (model.includes("truck") || model.includes("pickup") || style.includes("truck")) {
			return <Truck className="h-24 w-24 text-primary/70" />
		}

		return <Car className="h-24 w-24 text-primary/70" />
	}, [vehicleData])

	const renderSearchForm = () => {
		return (
			<div className="flex flex-col space-y-4">
				<div className="flex flex-col space-y-2">
					<Label htmlFor="report-type">Report Type</Label>
					<div className="flex space-x-2">
						<Button
							variant={reportType === "json" ? "default" : "outline"}
							size="sm"
							onClick={() => setReportType("json")}
							className="flex items-center gap-2"
						>
							<FileText className="h-4 w-4" />
							JSON Data
						</Button>
						<Button
							variant={reportType === "pdf" ? "default" : "outline"}
							size="sm"
							onClick={() => setReportType("pdf")}
							className="flex items-center gap-2"
						>
							<FileDown className="h-4 w-4" />
							PDF Report
						</Button>
					</div>
				</div>

				<div className="flex w-full items-center space-x-2">
					<div className="relative flex-1">
						<Input
							type="text"
							value={vin}
							onChange={(e) => setVin(e.target.value.toUpperCase())}
							placeholder="Enter Vehicle Identification Number (VIN)..."
							className="pr-10"
							maxLength={17}
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
			</div>
		)
	}

	const renderOverview = () => {
		if (!vehicleData) return null

		const specs = vehicleData.specs
		const hasTitles = vehicleData.titles && vehicleData.titles.length > 0
		const hasAccidents = vehicleData.accidents && vehicleData.accidents.length > 0
		const hasSalvage = vehicleData.salvage && vehicleData.salvage.length > 0
		const hasThefts = vehicleData.thefts && vehicleData.thefts.length > 0

		const vehicleScore = vehicleData.clean ? 90 : 70

		return (
			<div className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="flex flex-col space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-xl font-semibold">Vehicle Score</h3>
							<Badge variant={vehicleScore > 80 ? "default" : "secondary"} className="text-lg px-3 py-1">
								{vehicleScore}/100
							</Badge>
						</div>

						<Progress value={vehicleScore} className="h-3" />

						<div className="grid grid-cols-2 gap-4 mt-4">
							<Card className="p-3 border-l-4 border-l-green-500">
								<div className="flex items-center gap-2">
									<Shield className="h-5 w-5 text-green-500" />
									<div>
										<p className="text-sm font-medium">Title Status</p>
										<p className="text-lg font-semibold">Clean</p>
									</div>
								</div>
							</Card>

							<Card className="p-3 border-l-4 border-l-blue-500">
								<div className="flex items-center gap-2">
									<History className="h-5 w-5 text-blue-500" />
									<div>
										<p className="text-sm font-medium">Title Records</p>
										<p className="text-lg font-semibold">{hasTitles ? vehicleData.titles.length : 0}</p>
									</div>
								</div>
							</Card>

							<Card className={`p-3 border-l-4 ${hasAccidents ? "border-l-red-500" : "border-l-green-500"}`}>
								<div className="flex items-center gap-2">
									<AlertTriangle className={`h-5 w-5 ${hasAccidents ? "text-red-500" : "text-green-500"}`} />
									<div>
										<p className="text-sm font-medium">Accidents</p>
										<p className="text-lg font-semibold">{hasAccidents ? vehicleData.accidents.length : "None"}</p>
									</div>
								</div>
							</Card>

							<Card className={`p-3 border-l-4 ${hasSalvage || hasThefts ? "border-l-red-500" : "border-l-green-500"}`}>
								<div className="flex items-center gap-2">
									<Award className={`h-5 w-5 ${hasSalvage || hasThefts ? "text-red-500" : "text-green-500"}`} />
									<div>
										<p className="text-sm font-medium">Issues</p>
										<p className="text-lg font-semibold">{hasSalvage || hasThefts ? "Found" : "None"}</p>
									</div>
								</div>
							</Card>
						</div>

						<div className="mt-4">
							<h3 className="text-lg font-semibold mb-2">Vehicle Summary</h3>
							<Card className="p-4">
								<div className="grid grid-cols-2 gap-y-2">
									<div className="font-medium">Year:</div>
									<div>{specs.Year || "N/A"}</div>

									<div className="font-medium">Make:</div>
									<div>{specs.Make || "N/A"}</div>

									<div className="font-medium">Model:</div>
									<div>{specs.Model || "N/A"}</div>

									<div className="font-medium">Trim:</div>
									<div>{specs.Trim || "N/A"}</div>

									<div className="font-medium">Engine:</div>
									<div>{specs.Engine || "N/A"}</div>

									<div className="font-medium">Style:</div>
									<div>{specs.Style || "N/A"}</div>
								</div>
							</Card>
						</div>
					</div>

					<div className="flex flex-col space-y-4">
						<div className="bg-card rounded-lg overflow-hidden border shadow-sm">
							<div className="p-4 bg-muted/50">
								<h3 className="text-lg font-semibold flex items-center gap-2">
									<Car className="h-5 w-5" />
									{specs.Year} {specs.Make} {specs.Model}
								</h3>
								<p className="text-sm text-muted-foreground">VIN: {vehicleData.vin}</p>
							</div>
							<div className="p-4 flex justify-center">{getVehicleIcon}</div>
						</div>

						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-lg">Report Information</CardTitle>
								<CardDescription>Report ID: {vehicleData.id}</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 gap-y-2">
									<div className="font-medium">Report Date:</div>
									<div>{new Date(vehicleData.date).toLocaleDateString()}</div>

									<div className="font-medium">Mode:</div>
									<div>{vehicleData.mode}</div>
								</div>
							</CardContent>
							<CardFooter className="flex justify-end gap-2">
								<Button variant="outline" size="sm" onClick={downloadResults} className="flex items-center gap-1">
									<FileText className="h-4 w-4" />
									JSON
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										window.open(`/api/vinaudit?reportId=${vehicleData.id}&reportType=pdf`, "_blank")
									}}
									className="flex items-center gap-1"
								>
									<FileDown className="h-4 w-4" />
									PDF
								</Button>
							</CardFooter>
						</Card>
					</div>
				</div>
			</div>
		)
	}

	const renderVehicleSpecs = () => {
		if (!vehicleData?.specs) return null

		const specs = vehicleData.specs

		return (
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="flex flex-col space-y-4">
					<div className="flex flex-col space-y-2">
						<h3 className="text-lg font-semibold flex items-center">
							<Car className="h-5 w-5 mr-2" />
							Vehicle Information
						</h3>
						<Separator />
						<div className="grid grid-cols-2 gap-2">
							<div className="font-medium">Year:</div>
							<div>{specs.Year || "N/A"}</div>

							<div className="font-medium">Make:</div>
							<div>{specs.Make || "N/A"}</div>

							<div className="font-medium">Model:</div>
							<div>{specs.Model || "N/A"}</div>

							<div className="font-medium">Trim:</div>
							<div>{specs.Trim || "N/A"}</div>

							<div className="font-medium">Style:</div>
							<div>{specs.Style || "N/A"}</div>

							<div className="font-medium">Made In:</div>
							<div>{specs["Made In"] || "N/A"}</div>
						</div>
					</div>

					<div className="flex flex-col space-y-2">
						<h3 className="text-lg font-semibold flex items-center">
							<Gauge className="h-5 w-5 mr-2" />
							Engine & Performance
						</h3>
						<Separator />
						<div className="grid grid-cols-2 gap-2">
							<div className="font-medium">Engine:</div>
							<div>{specs.Engine || "N/A"}</div>

							<div className="font-medium">Fuel Type:</div>
							<div>{specs["Fuel Type"] || "N/A"}</div>

							<div className="font-medium">Fuel Capacity:</div>
							<div>{specs["Fuel Capacity"] || "N/A"}</div>

							<div className="font-medium">City MPG:</div>
							<div>{specs["City Mileage"] || "N/A"}</div>

							<div className="font-medium">Highway MPG:</div>
							<div>{specs["Highway Mileage"] || "N/A"}</div>
						</div>
					</div>
				</div>

				<div className="flex flex-col space-y-4">
					<div className="flex flex-col space-y-2">
						<h3 className="text-lg font-semibold flex items-center">
							<BarChart4 className="h-5 w-5 mr-2" />
							Dimensions & Capacity
						</h3>
						<Separator />
						<div className="grid grid-cols-2 gap-2">
							<div className="font-medium">Length:</div>
							<div>{specs["Overall Length"] || "N/A"}</div>

							<div className="font-medium">Width:</div>
							<div>{specs["Overall Width"] || "N/A"}</div>

							<div className="font-medium">Height:</div>
							<div>{specs["Overall Height"] || "N/A"}</div>

							<div className="font-medium">Gross Weight:</div>
							<div>{specs["Gross Weight"] || "N/A"}</div>

							<div className="font-medium">Seating:</div>
							<div>{specs["Standard Seating"] || "N/A"}</div>
						</div>
					</div>

					<div className="flex flex-col space-y-2">
						<h3 className="text-lg font-semibold flex items-center">
							<Info className="h-5 w-5 mr-2" />
							Pricing Information
						</h3>
						<Separator />
						<div className="grid grid-cols-2 gap-2">
							<div className="font-medium">MSRP:</div>
							<div>{specs.MSRP || "N/A"}</div>

							<div className="font-medium">Invoice Price:</div>
							<div>{specs["Invoice Price"] || "N/A"}</div>
						</div>
					</div>

					<div className="mt-4">
						<h3 className="text-lg font-semibold">Vehicle Description</h3>
						<Card className="p-4">
							<p>{specs.Description || "No description available"}</p>
						</Card>
					</div>
				</div>
			</div>
		)
	}

	const renderTitleHistory = () => {
		if (!vehicleData?.titles || vehicleData.titles.length === 0) {
			return (
				<Alert>
					<AlertTitle>No title history</AlertTitle>
					<AlertDescription>No title history available for this vehicle.</AlertDescription>
				</Alert>
			)
		}

		const sortedTitles = [...vehicleData.titles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

		return (
			<div className="space-y-6">
				<div className="flex flex-col space-y-2">
					<h3 className="text-lg font-semibold flex items-center">
						<Calendar className="h-5 w-5 mr-2" />
						Title History Timeline
					</h3>
					<Separator />

					<div className="relative mt-6">
						{/* Timeline */}
						<div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

						{sortedTitles.map((title, index) => (
							<div key={index} className="relative pl-10 pb-8">
								<div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
									<MapPin className="h-4 w-4 text-primary-foreground" />
								</div>
								<div className="bg-card rounded-lg p-4 shadow-sm border">
									<div className="flex justify-between items-start">
										<div>
											<div className="font-semibold text-lg">
												{title.state} Title
												{title.current && (
													<Badge variant="default" className="ml-2">
														Current
													</Badge>
												)}
											</div>
											<div className="text-muted-foreground">
												{new Date(title.date).toLocaleDateString("en-US", {
													year: "numeric",
													month: "long",
													day: "numeric",
												})}
											</div>
										</div>
										<div className="text-right">
											<div className="font-medium">Odometer</div>
											<div className="text-lg">
												{title.meter} {title.meterUnit === "M" ? "miles" : "km"}
											</div>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="flex flex-col space-y-2">
					<h3 className="text-lg font-semibold flex items-center">
						<Database className="h-5 w-5 mr-2" />
						Title Records
					</h3>
					<Separator />

					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>State</TableHead>
								<TableHead>Date</TableHead>
								<TableHead>Odometer</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{sortedTitles.map((title, index) => (
								<TableRow key={index}>
									<TableCell className="font-medium">{title.state}</TableCell>
									<TableCell>{title.date}</TableCell>
									<TableCell>
										{title.meter} {title.meterUnit === "M" ? "miles" : "km"}
									</TableCell>
									<TableCell>
										{title.current ? (
											<Badge className="flex items-center gap-1">
												<CheckCircle className="h-3 w-3" />
												Current
											</Badge>
										) : (
											<Badge variant="outline" className="flex items-center gap-1">
												<XCircle className="h-3 w-3" />
												Previous
											</Badge>
										)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>
		)
	}

	return (
		<div className="container mx-auto py-8 px-4 space-y-8">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-3xl font-bold tracking-tight flex items-center">
					<Car className="h-7 w-7 mr-2" />
					VIN Audit
				</h1>
				<Button variant="outline" asChild>
					<Link href="/dashboard" className="flex items-center">
						<ArrowLeft className="w-4 h-4 mr-2" />
						<span>Back to Dashboard</span>
					</Link>
				</Button>
			</div>

			<Card className="border-2 border-primary/10">
				<CardHeader className="bg-primary/5">
					<CardTitle className="flex items-center gap-2">
						<Search className="h-5 w-5" />
						Vehicle History Search
					</CardTitle>
					<CardDescription>Enter a VIN to retrieve vehicle history information and generate reports</CardDescription>
				</CardHeader>
				<CardContent className="pt-6">
					<div className="flex flex-col gap-4">
						<div className="w-full">{renderSearchForm()}</div>
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
										? "You need an active subscription to access this feature."
										: error}
								</AlertDescription>
							</div>

							{error.toLowerCase().includes("subscription") && (
								<div className="flex items-center gap-3 mt-3">
									<Button variant="outline" size="sm" asChild>
										<Link href="/dashboard">Return to Dashboard</Link>
									</Button>
								</div>
							)}
						</div>
					</div>
				</Alert>
			)}

			{vehicleData && (
				<Card className="overflow-hidden">
					<CardHeader className="bg-primary/5 pb-2">
						<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
							<CardTitle className="flex items-center gap-2">
								<Car className="h-5 w-5" />
								{vehicleData.specs.Year} {vehicleData.specs.Make} {vehicleData.specs.Model}
								<Badge variant="secondary" className="ml-2">
									{vehicleData.vin}
								</Badge>
							</CardTitle>
							<div className="flex items-center gap-2">
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button variant="outline" size="sm" onClick={downloadResults} className="flex items-center">
												<FileText className="mr-2 h-4 w-4" />
												JSON
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p>Download raw JSON data</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>

								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant="outline"
												size="sm"
												onClick={() => {
													const reportId = vehicleData.id
													window.open(`/api/vinaudit?reportId=${reportId}&reportType=pdf`, "_blank")
												}}
												className="flex items-center"
											>
												<FileDown className="mr-2 h-4 w-4" />
												PDF
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p>Download PDF report</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
						</div>
					</CardHeader>

					<Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
						<div className="px-6 pt-2">
							<TabsList className="grid w-full grid-cols-3">
								<TabsTrigger value="overview" className="flex items-center gap-2">
									<Zap className="h-4 w-4" />
									Overview
								</TabsTrigger>
								<TabsTrigger value="specs" className="flex items-center gap-2">
									<Car className="h-4 w-4" />
									Vehicle Specs
								</TabsTrigger>
								<TabsTrigger value="titles" className="flex items-center gap-2">
									<Calendar className="h-4 w-4" />
									Title History
								</TabsTrigger>
							</TabsList>
						</div>

						<TabsContent value="overview" className="p-6">
							{renderOverview()}
						</TabsContent>

						<TabsContent value="specs" className="p-6">
							{renderVehicleSpecs()}
						</TabsContent>

						<TabsContent value="titles" className="p-6">
							{renderTitleHistory()}
						</TabsContent>
					</Tabs>
				</Card>
			)}
		</div>
	)
}
