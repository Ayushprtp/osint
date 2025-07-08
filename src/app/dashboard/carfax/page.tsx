"use client"

import { useState, useCallback, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
	ArrowLeft,
	FileText,
	Loader2,
	Search,
	AlertTriangle,
	Car,
	FileDown,
	Info,
	Gauge,
	MapPin,
	History,
	Shield,
	Clock,
	Key,
	Tag,
	CircleCheck,
	CircleAlert,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type SearchType = "plate" | "vin" | "partial-plate"

interface Vehicle {
	vin: string
	year?: string | number
	make?: string
	model?: string
	plate?: string
	state?: string
	last_reported_odometer?: string
}

interface ServiceRecord {
	date: string
	mileage: string
	services: string[]
}

interface OwnerRecord {
	owner_number: number
	type: string
	location?: string
	last_reported_odometer: string
}

interface VehicleData {
	vehicle?: Vehicle
	vehicles?: Vehicle[]
	highlights?: string[]
	service_history?: ServiceRecord[]
	ownership_history?: OwnerRecord[]
	data?: VehicleData
}

interface SearchResponse {
	success: boolean
	data: VehicleData
	error?: string
}

export default function Carfax() {
	const [isSearching, setIsSearching] = useState(false)
	const [searchType, setSearchType] = useState<SearchType>("plate")
	const [plate, setPlate] = useState("")
	const [state, setState] = useState("")
	const [vin, setVin] = useState("")
	const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [activeTab, setActiveTab] = useState("overview")

	const handleSearch = useCallback(async () => {
		let validationError = null

		if (searchType === "plate" || searchType === "partial-plate") {
			if (!plate.trim()) {
				validationError = "Please enter a license plate"
			}
			if (!state.trim()) {
				validationError = "Please select a state"
			}
		} else if (searchType === "vin") {
			if (!vin.trim()) {
				validationError = "Please enter a VIN"
			} else if (vin.trim().length !== 17) {
				validationError = "VIN must be 17 characters"
			}
		}

		if (validationError) {
			setError(validationError)
			return
		}

		setIsSearching(true)
		setError(null)
		setSearchResults(null)

		try {
			const requestBody = {
				type: searchType,
				...(searchType === "vin" ? { vin } : { plate, state }),
			}

			const response = await fetch("/api/carfax", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestBody),
			})

			if (!response.ok) {
				const errorData = await response.json()

				if (response.status === 403 && errorData?.error?.includes("subscription")) {
					throw new Error("SUBSCRIPTION_REQUIRED")
				}

				throw new Error(errorData?.error || `HTTP error! status: ${response.status}`)
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
	}, [searchType, plate, state, vin])

	const vehicleData = useMemo(() => {
		if (!searchResults?.data) return null

		return searchResults.data.data || searchResults.data
	}, [searchResults])

	const downloadResults = useCallback(() => {
		if (!searchResults) return

		const content = JSON.stringify(searchResults, null, 2)
		const filename = `carfax-${searchType === "vin" ? vin : plate}-${new Date().toISOString().split("T")[0]}.json`
		const mimeType = "application/json"

		const blob = new Blob([content], { type: mimeType })
		const url = URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = url
		a.download = filename
		a.click()
		URL.revokeObjectURL(url)
	}, [searchResults, searchType, vin, plate])

	const renderSearchForm = () => {
		return (
			<div className="flex flex-col space-y-4">
				<div className="flex flex-col space-y-2">
					<Label htmlFor="search-type">Search Type</Label>
					<div className="flex space-x-2">
						<Button
							variant={searchType === "plate" ? "default" : "outline"}
							size="sm"
							onClick={() => setSearchType("plate")}
							className="flex items-center gap-2"
						>
							<Tag className="h-4 w-4" />
							License Plate
						</Button>
						<Button
							variant={searchType === "vin" ? "default" : "outline"}
							size="sm"
							onClick={() => setSearchType("vin")}
							className="flex items-center gap-2"
						>
							<Key className="h-4 w-4" />
							VIN
						</Button>
						<Button
							variant={searchType === "partial-plate" ? "default" : "outline"}
							size="sm"
							onClick={() => setSearchType("partial-plate")}
							className="flex items-center gap-2"
						>
							<Tag className="h-4 w-4" />
							Partial Plate
						</Button>
					</div>
				</div>

				{(searchType === "plate" || searchType === "partial-plate") && (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="flex flex-col space-y-2">
							<Label htmlFor="plate">License Plate</Label>
							<Input
								id="plate"
								type="text"
								value={plate}
								onChange={(e) => setPlate(e.target.value.toUpperCase())}
								placeholder={
									searchType === "partial-plate"
										? "Enter partial plate (e.g. ABC1_ or _BC1234)"
										: "Enter license plate..."
								}
							/>
							{searchType === "partial-plate" && (
								<p className="text-xs text-muted-foreground">Use underscore (_) as a wildcard character</p>
							)}
						</div>
						<div className="flex flex-col space-y-2">
							<Label htmlFor="state">State</Label>
							<Select value={state} onValueChange={setState}>
								<SelectTrigger id="state">
									<SelectValue placeholder="Select state" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="AL">Alabama</SelectItem>
									<SelectItem value="AK">Alaska</SelectItem>
									<SelectItem value="AZ">Arizona</SelectItem>
									<SelectItem value="AR">Arkansas</SelectItem>
									<SelectItem value="CA">California</SelectItem>
									<SelectItem value="CO">Colorado</SelectItem>
									<SelectItem value="CT">Connecticut</SelectItem>
									<SelectItem value="DE">Delaware</SelectItem>
									<SelectItem value="FL">Florida</SelectItem>
									<SelectItem value="GA">Georgia</SelectItem>
									<SelectItem value="HI">Hawaii</SelectItem>
									<SelectItem value="ID">Idaho</SelectItem>
									<SelectItem value="IL">Illinois</SelectItem>
									<SelectItem value="IN">Indiana</SelectItem>
									<SelectItem value="IA">Iowa</SelectItem>
									<SelectItem value="KS">Kansas</SelectItem>
									<SelectItem value="KY">Kentucky</SelectItem>
									<SelectItem value="LA">Louisiana</SelectItem>
									<SelectItem value="ME">Maine</SelectItem>
									<SelectItem value="MD">Maryland</SelectItem>
									<SelectItem value="MA">Massachusetts</SelectItem>
									<SelectItem value="MI">Michigan</SelectItem>
									<SelectItem value="MN">Minnesota</SelectItem>
									<SelectItem value="MS">Mississippi</SelectItem>
									<SelectItem value="MO">Missouri</SelectItem>
									<SelectItem value="MT">Montana</SelectItem>
									<SelectItem value="NE">Nebraska</SelectItem>
									<SelectItem value="NV">Nevada</SelectItem>
									<SelectItem value="NH">New Hampshire</SelectItem>
									<SelectItem value="NJ">New Jersey</SelectItem>
									<SelectItem value="NM">New Mexico</SelectItem>
									<SelectItem value="NY">New York</SelectItem>
									<SelectItem value="NC">North Carolina</SelectItem>
									<SelectItem value="ND">North Dakota</SelectItem>
									<SelectItem value="OH">Ohio</SelectItem>
									<SelectItem value="OK">Oklahoma</SelectItem>
									<SelectItem value="OR">Oregon</SelectItem>
									<SelectItem value="PA">Pennsylvania</SelectItem>
									<SelectItem value="RI">Rhode Island</SelectItem>
									<SelectItem value="SC">South Carolina</SelectItem>
									<SelectItem value="SD">South Dakota</SelectItem>
									<SelectItem value="TN">Tennessee</SelectItem>
									<SelectItem value="TX">Texas</SelectItem>
									<SelectItem value="UT">Utah</SelectItem>
									<SelectItem value="VT">Vermont</SelectItem>
									<SelectItem value="VA">Virginia</SelectItem>
									<SelectItem value="WA">Washington</SelectItem>
									<SelectItem value="WV">West Virginia</SelectItem>
									<SelectItem value="WI">Wisconsin</SelectItem>
									<SelectItem value="WY">Wyoming</SelectItem>
									<SelectItem value="DC">District of Columbia</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				)}

				{searchType === "vin" && (
					<div className="flex flex-col space-y-2">
						<Label htmlFor="vin">Vehicle Identification Number (VIN)</Label>
						<Input
							id="vin"
							type="text"
							value={vin}
							onChange={(e) => setVin(e.target.value.toUpperCase())}
							placeholder="Enter VIN (17 characters)..."
							maxLength={17}
						/>
					</div>
				)}

				<Button className="w-full" onClick={handleSearch} disabled={isSearching}>
					{isSearching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
					Search
				</Button>
			</div>
		)
	}

	const renderOverview = () => {
		if (!vehicleData) return null

		if (searchType === "partial-plate") {
			return renderPartialPlateResults()
		}

		const vehicle = vehicleData.vehicle
		if (!vehicle) {
			return (
				<Alert>
					<AlertTitle>Vehicle data unavailable</AlertTitle>
					<AlertDescription>No detailed vehicle information is available.</AlertDescription>
				</Alert>
			)
		}

		const highlights = vehicleData.highlights || []
		const hasAccidents = highlights.some((h: string) => h.toLowerCase().includes("accident"))
		const safeVehicle = highlights.some((h: string) => h.toLowerCase().includes("no accidents"))

		const vehicleScore = safeVehicle ? 90 : hasAccidents ? 60 : 75
		const scoreColor = vehicleScore > 80 ? "bg-green-500" : vehicleScore > 60 ? "bg-amber-500" : "bg-red-500"

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

						<div className="w-full h-3 bg-muted rounded-full overflow-hidden">
							<div className={`h-full ${scoreColor}`} style={{ width: `${vehicleScore}%` }} />
						</div>

						<div className="flex justify-between text-xs text-muted-foreground px-1">
							<span>Poor</span>
							<span>Good</span>
							<span>Excellent</span>
						</div>

						<div className="grid grid-cols-2 gap-4 mt-4">
							<Card className={`p-3 border-l-4 ${safeVehicle ? "border-l-green-500" : "border-l-amber-500"}`}>
								<div className="flex items-center gap-2">
									<Shield className={`h-5 w-5 ${safeVehicle ? "text-green-500" : "text-amber-500"}`} />
									<div>
										<p className="text-sm font-medium">Accident History</p>
										<p className="text-lg font-semibold">
											{safeVehicle ? "Clean" : hasAccidents ? "Accidents" : "Unknown"}
										</p>
									</div>
								</div>
							</Card>

							<Card className="p-3 border-l-4 border-l-blue-500">
								<div className="flex items-center gap-2">
									<History className="h-5 w-5 text-blue-500" />
									<div>
										<p className="text-sm font-medium">Ownership</p>
										<p className="text-lg font-semibold">
											{vehicleData.ownership_history ? `${vehicleData.ownership_history.length} owner(s)` : "Unknown"}
										</p>
									</div>
								</div>
							</Card>

							<Card className="p-3 border-l-4 border-l-purple-500">
								<div className="flex items-center gap-2">
									<Gauge className="h-5 w-5 text-purple-500" />
									<div>
										<p className="text-sm font-medium">Odometer</p>
										<p className="text-lg font-semibold">{vehicle.last_reported_odometer || "Unknown"}</p>
									</div>
								</div>
							</Card>

							<Card className="p-3 border-l-4 border-l-indigo-500">
								<div className="flex items-center gap-2">
									<Clock className="h-5 w-5 text-indigo-500" />
									<div>
										<p className="text-sm font-medium">Service Records</p>
										<p className="text-lg font-semibold">
											{vehicleData.service_history ? `${vehicleData.service_history.length} records` : "None"}
										</p>
									</div>
								</div>
							</Card>
						</div>

						<div className="mt-4">
							<h3 className="text-lg font-semibold mb-2">Vehicle Highlights</h3>
							<Card className="p-4">
								<ul className="space-y-2">
									{highlights.length > 0 ? (
										highlights.map((highlight: string, index: number) => (
											<li key={index} className="flex items-start gap-2">
												{highlight.toLowerCase().includes("no accident") ||
												highlight.toLowerCase().includes("no damage") ? (
													<CircleCheck className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
												) : highlight.toLowerCase().includes("accident") ||
													highlight.toLowerCase().includes("damage") ? (
													<CircleAlert className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
												) : (
													<Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
												)}
												<span>{highlight}</span>
											</li>
										))
									) : (
										<li className="text-muted-foreground">No highlights available</li>
									)}
								</ul>
							</Card>
						</div>
					</div>

					<div className="flex flex-col space-y-4">
						<div className="bg-card rounded-lg overflow-hidden border shadow-sm">
							<div className="p-4 bg-muted/50">
								<h3 className="text-lg font-semibold flex items-center gap-2">
									<Car className="h-5 w-5" />
									{vehicle.year} {vehicle.make} {vehicle.model}
								</h3>
								<p className="text-sm text-muted-foreground">VIN: {vehicle.vin}</p>
							</div>
							<div className="p-6 flex justify-center">
								<Car className="h-24 w-24 text-primary/70" />
							</div>
						</div>

						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-lg">Vehicle Information</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 gap-y-2">
									<div className="font-medium">Year:</div>
									<div>{vehicle.year || "N/A"}</div>

									<div className="font-medium">Make:</div>
									<div>{vehicle.make || "N/A"}</div>

									<div className="font-medium">Model:</div>
									<div>{vehicle.model || "N/A"}</div>

									<div className="font-medium">VIN:</div>
									<div className="font-mono">{vehicle.vin}</div>

									{vehicle.last_reported_odometer && (
										<>
											<div className="font-medium">Last Odometer:</div>
											<div>{vehicle.last_reported_odometer}</div>
										</>
									)}
								</div>
							</CardContent>
							<CardFooter className="flex justify-end gap-2">
								<Button variant="outline" size="sm" onClick={downloadResults} className="flex items-center gap-1">
									<FileDown className="h-4 w-4" />
									Export JSON
								</Button>
							</CardFooter>
						</Card>
					</div>
				</div>
			</div>
		)
	}

	const renderPartialPlateResults = () => {
		if (!vehicleData || !vehicleData.vehicles || !Array.isArray(vehicleData.vehicles)) {
			return (
				<Alert>
					<AlertTitle>No vehicles found</AlertTitle>
					<AlertDescription>No vehicles matching the partial plate were found.</AlertDescription>
				</Alert>
			)
		}

		return (
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<h3 className="text-xl font-semibold">Matching Vehicles ({vehicleData.vehicles.length})</h3>
					<Button variant="outline" size="sm" onClick={downloadResults} className="flex items-center gap-1">
						<FileDown className="h-4 w-4 mr-1" />
						Export JSON
					</Button>
				</div>

				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>VIN</TableHead>
								<TableHead>Year</TableHead>
								<TableHead>Make</TableHead>
								<TableHead>Model</TableHead>
								<TableHead>Plate</TableHead>
								<TableHead>State</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{vehicleData.vehicles.map((vehicle: Vehicle, index: number) => (
								<TableRow key={index}>
									<TableCell className="font-mono">{vehicle.vin}</TableCell>
									<TableCell>{vehicle.year || "N/A"}</TableCell>
									<TableCell>{vehicle.make || "N/A"}</TableCell>
									<TableCell>{vehicle.model || "N/A"}</TableCell>
									<TableCell>{vehicle.plate || "N/A"}</TableCell>
									<TableCell>{vehicle.state || "N/A"}</TableCell>
									<TableCell>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => {
												setIsSearching(true)
												setError(null)
												setSearchResults(null)
												setVin(vehicle.vin)
												setSearchType("vin")

												setTimeout(() => {
													const doSearch = async () => {
														try {
															const response = await fetch("/api/carfax", {
																method: "POST",
																headers: {
																	"Content-Type": "application/json",
																},
																body: JSON.stringify({
																	type: "vin",
																	vin: vehicle.vin,
																}),
															})

															if (!response.ok) {
																const errorData = await response.json()
																throw new Error(errorData?.error || `HTTP error! status: ${response.status}`)
															}

															const data = await response.json()

															if (!data.success) {
																throw new Error(data.error || "An error occurred during the search")
															}

															setSearchResults(data)
															setActiveTab("overview")
														} catch (error) {
															console.error("Error fetching vehicle details:", error)
															setError(error instanceof Error ? error.message : "Failed to load vehicle details")
														} finally {
															setIsSearching(false)
														}
													}

													doSearch()
												}, 100)
											}}
										>
											View Details
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>
		)
	}

	const renderServiceHistory = () => {
		if (!vehicleData || !vehicleData.vehicle) {
			return (
				<Alert>
					<AlertTitle>Vehicle data unavailable</AlertTitle>
					<AlertDescription>No vehicle information is available. Please try your search again.</AlertDescription>
				</Alert>
			)
		}

		if (
			!vehicleData.service_history ||
			!Array.isArray(vehicleData.service_history) ||
			vehicleData.service_history.length === 0
		) {
			return (
				<Alert>
					<AlertTitle>No service history</AlertTitle>
					<AlertDescription>No service history available for this vehicle.</AlertDescription>
				</Alert>
			)
		}

		return (
			<div className="space-y-6">
				<h3 className="text-xl font-semibold">Service Records History</h3>

				<div className="relative mt-6">
					{/* Timeline */}
					<div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

					{vehicleData.service_history.map((record: ServiceRecord, index: number) => (
						<div key={index} className="relative pl-10 pb-8">
							<div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
								<Clock className="h-4 w-4 text-primary-foreground" />
							</div>
							<div className="bg-card rounded-lg p-4 shadow-sm border">
								<div className="flex justify-between items-start">
									<div>
										<div className="font-semibold text-lg">
											{new Date(record.date).toLocaleDateString("en-US", {
												year: "numeric",
												month: "long",
												day: "numeric",
											})}
										</div>
										<div className="text-muted-foreground">Odometer: {record.mileage}</div>
									</div>
								</div>
								<div className="mt-2">
									<h4 className="text-sm font-medium mb-1">Services Performed:</h4>
									<ul className="list-disc list-inside space-y-1 text-sm pl-1">
										{record.services ? (
											record.services.map((service: string, serviceIndex: number) => (
												<li key={serviceIndex}>{service}</li>
											))
										) : (
											<li>No service details available</li>
										)}
									</ul>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		)
	}

	const renderOwnershipHistory = () => {
		if (!vehicleData || !vehicleData.vehicle) {
			return (
				<Alert>
					<AlertTitle>Vehicle data unavailable</AlertTitle>
					<AlertDescription>No vehicle information is available. Please try your search again.</AlertDescription>
				</Alert>
			)
		}

		if (
			!vehicleData.ownership_history ||
			!Array.isArray(vehicleData.ownership_history) ||
			vehicleData.ownership_history.length === 0
		) {
			return (
				<Alert>
					<AlertTitle>No ownership history</AlertTitle>
					<AlertDescription>No ownership history available for this vehicle.</AlertDescription>
				</Alert>
			)
		}

		return (
			<div className="space-y-6">
				<h3 className="text-xl font-semibold">Ownership History</h3>

				<div className="relative mt-6">
					{/* Timeline */}
					<div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

					{vehicleData.ownership_history.map((owner: OwnerRecord, index: number) => (
						<div key={index} className="relative pl-10 pb-8">
							<div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
								<MapPin className="h-4 w-4 text-primary-foreground" />
							</div>
							<div className="bg-card rounded-lg p-4 shadow-sm border">
								<div className="flex justify-between items-start">
									<div>
										<div className="font-semibold text-lg">
											Owner {owner.owner_number}
											{index === 0 && (
												<Badge variant="default" className="ml-2">
													Current
												</Badge>
											)}
										</div>
										<div className="text-muted-foreground">Type: {owner.type}</div>
										{owner.location && <div className="text-muted-foreground">Location: {owner.location}</div>}
									</div>
									<div className="text-right">
										<div className="font-medium">Odometer</div>
										<div className="text-lg">{owner.last_reported_odometer}</div>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		)
	}

	return (
		<div className="container mx-auto py-8 px-4 space-y-8">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-3xl font-bold tracking-tight flex items-center">
					<Car className="h-7 w-7 mr-2" />
					CARFAX Vehicle History
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
					<CardDescription>
						Enter a license plate, partial plate, or VIN to retrieve vehicle history information
					</CardDescription>
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

			{searchResults?.success && vehicleData && searchType !== "partial-plate" && (
				<Card className="overflow-hidden">
					<CardHeader className="bg-primary/5 pb-2">
						<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
							<CardTitle className="flex items-center gap-2">
								<Car className="h-5 w-5" />
								{vehicleData.vehicle ? (
									<>
										{vehicleData.vehicle.year} {vehicleData.vehicle.make} {vehicleData.vehicle.model}
										<Badge variant="secondary" className="ml-2">
											{vehicleData.vehicle.vin}
										</Badge>
									</>
								) : (
									<span>Vehicle Information</span>
								)}
							</CardTitle>
							<div className="flex items-center gap-2">
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button variant="outline" size="sm" onClick={downloadResults} className="flex items-center">
												<FileText className="mr-2 h-4 w-4" />
												Export JSON
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p>Download raw JSON data</p>
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
									<Info className="h-4 w-4" />
									Overview
								</TabsTrigger>
								<TabsTrigger value="serviceHistory" className="flex items-center gap-2">
									<Clock className="h-4 w-4" />
									Service History
								</TabsTrigger>
								<TabsTrigger value="ownership" className="flex items-center gap-2">
									<History className="h-4 w-4" />
									Ownership
								</TabsTrigger>
							</TabsList>
						</div>

						<TabsContent value="overview" className="p-6">
							{renderOverview()}
						</TabsContent>

						<TabsContent value="serviceHistory" className="p-6">
							{renderServiceHistory()}
						</TabsContent>

						<TabsContent value="ownership" className="p-6">
							{renderOwnershipHistory()}
						</TabsContent>
					</Tabs>
				</Card>
			)}

			{searchResults?.success && vehicleData && searchType === "partial-plate" && (
				<Card className="overflow-hidden">
					<CardHeader className="bg-primary/5 pb-2">
						<div className="flex justify-between items-center">
							<CardTitle className="flex items-center gap-2">
								<Car className="h-5 w-5" />
								Partial Plate Search Results
								<Badge variant="secondary" className="ml-2">
									{plate} ({state})
								</Badge>
							</CardTitle>
						</div>
					</CardHeader>
					<CardContent className="p-6">{renderPartialPlateResults()}</CardContent>
				</Card>
			)}
		</div>
	)
}
