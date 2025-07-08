"use client"

import { useState, useCallback, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { ReactNode } from "react"
import {
	IconArrowLeft,
	IconChevronLeft,
	IconChevronRight,
	IconDownload,
	IconFileText,
	IconInfoCircle,
	IconLoader2,
	IconSearch,
	IconUser,
	IconAlertTriangle,
	IconDatabase,
	IconCar,
	IconBuildingStore,
} from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"

type RutResult = {
	name: string | null
	firstName: string | null
	lastName: string | null
	rut: string | null
	gender: string | null
	address: string | null
	city: string | null
	phoneNumber: string | null
	emailAddress: string | null
	birthDate: string | null
}

type NameResult = {
	name: string
	firstName: string
	lastName: string
	rut: string
	gender: string
	address: string
	city: string
}

type LicensePlateResult = {
	plate: string | null
	dv: string | null
	make: string | null
	model: string | null
	version: string | null
	year: number | null
	type: string | null
	engine: string | null
	engine_size?: string | null
	chassis?: string | null
	color?: string | null
	doors?: number | null
	transmission?: string | null
	kilometers?: number | null
	valuation?: number | null
	gas_type?: string | null
	owner: {
		fullname: string | null
		documentNumber: string | null
	} | null
	[key: string]: string | number | null | { fullname: string | null; documentNumber: string | null } | undefined
}

type SiiResult = {
	rut: string | number
	verificationDigit: string
	businessName: string
	validFromDate: string
	validUntilDate: string | null
	addresses: {
		validity: boolean
		addressDate: string
		addressType: string
		street: string
		streetNumber: string | null
		block: string | null
		apartment: string | null
		neighborhood: string | null
		city: string | null
		district: string
		region: string
	}[]
	activities: {
		activityCode: string
		activityDescription: string
		activityDate: string
		ivaAffects: boolean
		taxCategory: string
	}[]
}

type RutifySearchTypes = "rut" | "name" | "car" | "sii"

type SearchResponse = {
	success: boolean
	data: RutResult | NameResult[] | LicensePlateResult | SiiResult
	error?: string
	message?: string
	time_taken?: string
	count?: number
}

const searchTypes: {
	value: RutifySearchTypes
	label: string
	icon: ReactNode
}[] = [
	{
		value: "rut",
		label: "RUT",
		icon: <IconUser className="h-4 w-4" />,
	},
	{
		value: "name",
		label: "Name",
		icon: <IconUser className="h-4 w-4" />,
	},
	{
		value: "car",
		label: "License Plate",
		icon: <IconCar className="h-4 w-4" />,
	},
	{
		value: "sii",
		label: "Business (SII)",
		icon: <IconBuildingStore className="h-4 w-4" />,
	},
]

const ITEMS_PER_PAGE = 10

export default function Rutify() {
	const [isSearching, setIsSearching] = useState(false)
	const [searchModule, setSearchModule] = useState<RutifySearchTypes>("rut")
	const [query, setQuery] = useState("")
	const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [currentPage, setCurrentPage] = useState(1)
	const [resultSearch, setResultSearch] = useState("")

	const handleModuleChange = (module: RutifySearchTypes) => {
		setSearchModule(module)
		setSearchResults(null)
		setError(null)
		setQuery("")
	}

	const handleSearch = useCallback(async () => {
		if (!query.trim()) {
			setError("Please enter a search query")
			return
		}

		setIsSearching(true)
		setError(null)
		setSearchResults(null)

		try {
			const response = await fetch("/api/rutify", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					query,
					type: searchModule,
				}),
			})

			const data = await response.json()

			if (!response.ok) {
				const errMsg = data?.error || data?.message || "An error occurred during the search"
				throw new Error(errMsg)
			}

			const wrappedData: SearchResponse = {
				success: true,
				data: data,
				time_taken: undefined,
				count: Array.isArray(data) ? data.length : undefined,
			}

			setSearchResults(wrappedData)
			setCurrentPage(1)
		} catch (error) {
			console.error("Error fetching data:", error)
			if (error instanceof Error) {
				setError(error.message || "An error occurred while fetching data. Please try again.")
			} else {
				setError("An error occurred while fetching data. Please try again.")
			}
		} finally {
			setIsSearching(false)
		}
	}, [query, searchModule])

	const getResultsArray = useMemo(() => {
		if (!searchResults?.data) return []
		return Array.isArray(searchResults.data) ? searchResults.data : [searchResults.data]
	}, [searchResults])

	const getPaginatedResults = useMemo(() => {
		if (getResultsArray.length === 0) return []

		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
		return getResultsArray.slice(startIndex, startIndex + ITEMS_PER_PAGE)
	}, [getResultsArray, currentPage])

	const filteredResults = useMemo(() => {
		if (!resultSearch.trim()) return getPaginatedResults

		return getPaginatedResults.filter((result) =>
			Object.entries(result).some(
				([_, value]) =>
					value !== null &&
					value !== undefined &&
					typeof value !== "object" &&
					String(value).toLowerCase().includes(resultSearch.toLowerCase()),
			),
		)
	}, [getPaginatedResults, resultSearch])

	const totalPages = useMemo(() => {
		return Math.ceil(getResultsArray.length / ITEMS_PER_PAGE)
	}, [getResultsArray])

	const downloadResults = useCallback(
		(format = "json") => {
			if (!searchResults) return

			let content = ""
			let filename = `rutify-${searchModule}-${query}`
			let mimeType = "application/json"

			if (format === "json") {
				content = JSON.stringify(searchResults, null, 2)
				filename += ".json"
			} else {
				mimeType = "text/plain"
				filename += ".txt"

				if (searchModule === "rut") {
					const result = searchResults.data as RutResult
					content = `Full Name: ${result.name || "N/A"}\nPhone: ${result.phoneNumber || "N/A"}\nEmail: ${result.emailAddress || "N/A"}\nBirth Date: ${result.birthDate || "N/A"}\nAddress: ${result.address || "N/A"}\nCity: ${result.city || "N/A"}\nRUT: ${result.rut || "N/A"}`
				} else if (searchModule === "name") {
					content = (searchResults.data as NameResult[])
						.map(
							(r) =>
								`Name: ${r.name || "N/A"}, RUT: ${r.rut || "N/A"}, Address: ${r.address || "N/A"}, City: ${r.city || "N/A"}`,
						)
						.join("\n")
				} else if (searchModule === "car") {
					const result = searchResults.data as LicensePlateResult
					content = `Plate: ${result.plate || "N/A"}, Owner: ${result.owner?.fullname || "N/A"}, RUT: ${result.owner?.documentNumber || "N/A"}, Make: ${result.make || "N/A"}, Model: ${result.model || "N/A"}, Year: ${result.year || "N/A"}`
				} else if (searchModule === "sii") {
					const result = searchResults.data as SiiResult
					content = `Business: ${result.businessName || "N/A"}\nRUT: ${result.rut}-${result.verificationDigit}\nFrom: ${result.validFromDate || "N/A"}\nUntil: ${result.validUntilDate || "N/A"}`
					if (result.addresses?.length > 0) {
						const currentAddress = result.addresses.find((a) => a.validity)
						if (currentAddress) {
							content += `\nCurrent Address: ${currentAddress.street} ${currentAddress.streetNumber || ""}, ${currentAddress.district}, ${currentAddress.region}`
						}
					}
				}
			}

			const blob = new Blob([content], { type: mimeType })
			const url = URL.createObjectURL(blob)
			const a = document.createElement("a")
			a.href = url
			a.download = filename
			a.click()
		},
		[searchResults, searchModule, query],
	)

	const renderSearchForm = () => (
		<div className="flex w-full items-center space-x-2">
			<div className="relative flex-1">
				<Input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder={`Enter ${
						searchModule === "rut"
							? "RUT number"
							: searchModule === "name"
								? "person name"
								: searchModule === "car"
									? "license plate"
									: "business RUT"
					}...`}
					className="pr-10"
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							handleSearch()
						}
					}}
				/>
				<Button className="absolute right-0 top-0 h-full rounded-l-none" onClick={handleSearch} disabled={isSearching}>
					{isSearching ? <IconLoader2 className="h-4 w-4 animate-spin" /> : <IconSearch className="h-4 w-4" />}
				</Button>
			</div>
		</div>
	)

	const renderRutResults = (result: RutResult) => (
		<Card className="mt-4">
			<CardContent className="pt-6">
				<div className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<h3 className="font-semibold text-sm text-muted-foreground">Full Name</h3>
							<p className="text-lg">{result.name || "-"}</p>
						</div>
						<div>
							<h3 className="font-semibold text-sm text-muted-foreground">Birth Date</h3>
							<p className="text-lg">{result.birthDate || "-"}</p>
						</div>
						<div>
							<h3 className="font-semibold text-sm text-muted-foreground">Gender</h3>
							<p className="text-lg">{result.gender || "-"}</p>
						</div>
						<div>
							<h3 className="font-semibold text-sm text-muted-foreground">Phone Number</h3>
							<p className="text-lg">{result.phoneNumber || "-"}</p>
						</div>
						<div>
							<h3 className="font-semibold text-sm text-muted-foreground">Email Address</h3>
							<p className="text-lg">{result.emailAddress || "-"}</p>
						</div>
						<div>
							<h3 className="font-semibold text-sm text-muted-foreground">Address</h3>
							<p className="text-lg">{result.address || "-"}</p>
						</div>
						<div>
							<h3 className="font-semibold text-sm text-muted-foreground">City</h3>
							<p className="text-lg">{result.city || "-"}</p>
						</div>
						<div>
							<h3 className="font-semibold text-sm text-muted-foreground">RUT</h3>
							<p className="text-lg">{result.rut || "-"}</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	)

	const renderNameResults = () => (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Name</TableHead>
					<TableHead>RUT</TableHead>
					<TableHead>Gender</TableHead>
					<TableHead>Address</TableHead>
					<TableHead>City</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{filteredResults.map((result, index) => {
					const nameResult = result as NameResult
					return (
						<TableRow key={`name-result-${nameResult.rut || index}`}>
							<TableCell>{nameResult.name || "-"}</TableCell>
							<TableCell>{nameResult.rut || "-"}</TableCell>
							<TableCell>{nameResult.gender || "-"}</TableCell>
							<TableCell>{nameResult.address || "-"}</TableCell>
							<TableCell>{nameResult.city || "-"}</TableCell>
						</TableRow>
					)
				})}
			</TableBody>
		</Table>
	)

	const renderLicensePlateResults = () => (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>License Plate</TableHead>
					<TableHead>Owner</TableHead>
					<TableHead>RUT</TableHead>
					<TableHead>Make</TableHead>
					<TableHead>Model</TableHead>
					<TableHead>Type</TableHead>
					<TableHead>Year</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{filteredResults.map((result, index) => {
					const carResult = result as LicensePlateResult
					return (
						<TableRow key={`plate-result-${carResult.plate || index}`}>
							<TableCell>{carResult.plate || "-"}</TableCell>
							<TableCell>{carResult.owner?.fullname || "-"}</TableCell>
							<TableCell>{carResult.owner?.documentNumber || "-"}</TableCell>
							<TableCell>{carResult.make || "-"}</TableCell>
							<TableCell>{carResult.model || "-"}</TableCell>
							<TableCell>{carResult.type || "-"}</TableCell>
							<TableCell>{carResult.year || "-"}</TableCell>
						</TableRow>
					)
				})}
			</TableBody>
		</Table>
	)

	const renderSiiResults = (result: SiiResult) => (
		<div className="space-y-6">
			<Card className="mt-4">
				<CardHeader>
					<CardTitle>Business Information</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<h3 className="font-semibold text-sm text-muted-foreground">Business Name</h3>
							<p className="text-lg">{result.businessName || "Not available"}</p>
						</div>
						<div>
							<h3 className="font-semibold text-sm text-muted-foreground">RUT</h3>
							<p className="text-lg">
								{result.rut}-{result.verificationDigit}
							</p>
						</div>
						<div>
							<h3 className="font-semibold text-sm text-muted-foreground">Start Date</h3>
							<p className="text-lg">{result.validFromDate || "Not available"}</p>
						</div>
						<div>
							<h3 className="font-semibold text-sm text-muted-foreground">End Date</h3>
							<p className="text-lg">{result.validUntilDate || "Active"}</p>
						</div>
						{result.addresses?.length > 0 && result.addresses.find((a) => a.validity) && (
							<div className="col-span-2">
								<h3 className="font-semibold text-sm text-muted-foreground">Current Address</h3>
								{(() => {
									const currentAddress = result.addresses.find((a) => a.validity)
									return currentAddress ? (
										<p className="text-lg">
											{`${currentAddress.street} ${currentAddress.streetNumber || ""}, ${currentAddress.district}, ${currentAddress.region}`}
										</p>
									) : (
										"Not available"
									)
								})()}
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{result.addresses && result.addresses.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Registered Addresses</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Date</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Address</TableHead>
									<TableHead>Location</TableHead>
									<TableHead>Current</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{result.addresses.map((address) => (
									<TableRow key={`address-${address.street}-${address.streetNumber}`}>
										<TableCell>{address.addressDate}</TableCell>
										<TableCell>{address.addressType}</TableCell>
										<TableCell>{`${address.street} ${address.streetNumber || ""} ${address.apartment ? `Apt ${address.apartment}` : ""}`}</TableCell>
										<TableCell>{[address.city, address.district, address.region].filter(Boolean).join(", ")}</TableCell>
										<TableCell>
											{address.validity ? (
												<Badge variant="default">Current</Badge>
											) : (
												<Badge variant="outline">Historical</Badge>
											)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}

			{result.activities && result.activities.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Business Activities</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Date</TableHead>
									<TableHead>Code</TableHead>
									<TableHead>Description</TableHead>
									<TableHead>Tax Category</TableHead>
									<TableHead>IVA Affected</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{result.activities.map((activity, index) => (
									<TableRow key={`activity-${activity.activityCode}-${index}`}>
										<TableCell>{activity.activityDate}</TableCell>
										<TableCell>{activity.activityCode}</TableCell>
										<TableCell>{activity.activityDescription}</TableCell>
										<TableCell>{activity.taxCategory}</TableCell>
										<TableCell>
											{activity.ivaAffects ? <Badge variant="default">Yes</Badge> : <Badge variant="outline">No</Badge>}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}
		</div>
	)

	const renderResults = () => {
		if (!searchResults || !searchResults.data) return null

		switch (searchModule) {
			case "rut":
				return renderRutResults(searchResults.data as RutResult)
			case "name":
				return renderNameResults()
			case "car":
				return renderLicensePlateResults()
			case "sii":
				return renderSiiResults(searchResults.data as SiiResult)
			default:
				return null
		}
	}

	const renderPagination = () => {
		if (totalPages <= 1) return null

		return (
			<div className="flex justify-between items-center mt-4">
				<Button
					onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
					disabled={currentPage === 1}
					variant="outline"
				>
					<IconChevronLeft className="h-4 w-4 mr-2" />
					Previous
				</Button>
				<span className="text-sm font-medium">
					Page {currentPage} of {totalPages}
				</span>
				<Button
					onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
					disabled={currentPage === totalPages}
					variant="outline"
				>
					Next
					<IconChevronRight className="h-4 w-4 ml-2" />
				</Button>
			</div>
		)
	}

	return (
		<div className="container mx-auto py-8 px-4 space-y-8">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-3xl font-bold tracking-tight">Rutify Search</h1>
				<Button variant="outline" asChild>
					<Link href="/dashboard" className="flex items-center">
						<IconArrowLeft className="w-4 h-4 mr-2" />
						<span>Back to Dashboard</span>
					</Link>
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<IconDatabase className="h-5 w-5" />
						Search by {searchTypes.find((st) => st.value === searchModule)?.label}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-4">
						<div className="flex flex-wrap gap-2 mb-2">
							{searchTypes.map((type) => (
								<Button
									key={type.value}
									variant={searchModule === type.value ? "default" : "outline"}
									size="sm"
									onClick={() => handleModuleChange(type.value)}
									className="flex items-center gap-2"
								>
									{type.icon}
									{type.label}
								</Button>
							))}
						</div>
						<div className="w-full">{renderSearchForm()}</div>
					</div>
				</CardContent>
			</Card>

			{isSearching && !searchResults && (
				<div className="flex justify-center items-center p-8">
					<IconLoader2 className="h-8 w-8 animate-spin" />
				</div>
			)}

			{error && (
				<Alert variant="destructive" className="animate-in fade-in duration-300">
					<div className="flex items-start gap-3">
						<div className="flex-shrink-0 mt-0.5">
							<IconAlertTriangle className="h-5 w-5 text-red-500" />
						</div>
						<div className="flex-1 space-y-2">
							<div className="flex flex-col">
								<AlertTitle className="text-base font-semibold">Error Occurred</AlertTitle>
								<AlertDescription className="text-sm text-muted-foreground mt-1">{error}</AlertDescription>
							</div>
						</div>
					</div>
				</Alert>
			)}

			{searchResults?.success && searchResults.data && (
				<Card>
					<CardHeader>
						<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
							<CardTitle className="flex items-center gap-2">
								<IconDatabase className="h-5 w-5" />
								Search Results
								<Badge variant="secondary" className="ml-2">
									{getResultsArray.length} {getResultsArray.length === 1 ? "result" : "results"}
								</Badge>
								{searchResults.time_taken && (
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Badge variant="outline" className="ml-2">
													<IconInfoCircle className="h-3 w-3 mr-1" />
													{searchResults.time_taken}s
												</Badge>
											</TooltipTrigger>
											<TooltipContent>
												<p>Time taken to complete search</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								)}
							</CardTitle>
						</div>
						<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
							<div className="flex flex-wrap gap-2">
								<div className="flex gap-2">
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="outline"
													size="sm"
													disabled={!searchResults}
													onClick={() => downloadResults("json")}
													className="flex items-center"
												>
													<IconFileText className="mr-2 h-4 w-4" />
													JSON
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<p>Download full results as JSON</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>

									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="outline"
													size="sm"
													disabled={!searchResults}
													onClick={() => downloadResults("text")}
													className="flex items-center"
												>
													<IconDownload className="mr-2 h-4 w-4" />
													TEXT
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<p>Download as formatted text</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</div>
								{searchModule === "name" && (
									<Input
										type="text"
										value={resultSearch}
										onChange={(e) => setResultSearch(e.target.value)}
										placeholder="Filter results..."
										className="w-full sm:w-[200px]"
									/>
								)}
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{getResultsArray.length > 0 ? (
								<div className="space-y-4">
									<div className="overflow-x-auto">{renderResults()}</div>
									{searchModule === "name" && renderPagination()}
								</div>
							) : (
								<Alert>
									<IconInfoCircle className="h-5 w-5" />
									<AlertTitle>No results found</AlertTitle>
									<AlertDescription>
										No data available for <strong>{query || "your search query"}</strong>. Try a different search term.
									</AlertDescription>
								</Alert>
							)}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
