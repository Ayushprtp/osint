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
	IconWorld,
	IconInfoCircle,
	IconLoader2,
	IconPhone,
	IconSearch,
	IconUser,
	IconAlertTriangle,
	IconLink,
	IconDatabase,
	IconMapPin,
	IconBuilding,
	IconMap,
	IconHome,
	IconCreditCard,
	IconUserCircle,
	IconUsers,
	IconPlus,
	IconTrash,
	IconFilter,
	IconFilterOff,
} from "@tabler/icons-react"
import type { NpdSearchTypes } from "@/lib/text"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type SearchResponse = {
	success: boolean
	data: NpdResult[]
	error?: string
	time_taken?: string
	count?: number
}

type ExportFormat = "json" | "user-pass" | "url-user-pass"

type NpdResult = {
	ID?: string
	firstname?: string
	lastname?: string
	middlename?: string
	name_suff?: string
	dob?: string
	address?: string
	city?: string
	county_name?: string
	st?: string
	zip?: string
	phone1?: string
	ssn?: string
	aka1fullname?: string
	aka2fullname?: string
	aka3fullname?: string
	[key: string]: string | null | undefined
}

type SearchField = {
	field: NpdSearchTypes
	value: string
}

const searchTypes: { value: NpdSearchTypes; label: string; icon: ReactNode }[] = [
	{
		value: "firstname",
		label: "First Name",
		icon: <IconUser className="h-4 w-4" />,
	},
	{
		value: "lastname",
		label: "Last Name",
		icon: <IconUserCircle className="h-4 w-4" />,
	},
	{
		value: "middlename",
		label: "Middle Name",
		icon: <IconUsers className="h-4 w-4" />,
	},
	{
		value: "address",
		label: "Address",
		icon: <IconHome className="h-4 w-4" />,
	},
	{
		value: "city",
		label: "City",
		icon: <IconBuilding className="h-4 w-4" />,
	},
	{
		value: "county_name",
		label: "County",
		icon: <IconMap className="h-4 w-4" />,
	},
	{ value: "st", label: "State", icon: <IconWorld className="h-4 w-4" /> },
	{ value: "zip", label: "ZIP", icon: <IconMapPin className="h-4 w-4" /> },
	{
		value: "ssn",
		label: "SSN",
		icon: <IconCreditCard className="h-4 w-4" />,
	},
	{
		value: "phone1",
		label: "Phone",
		icon: <IconPhone className="h-4 w-4" />,
	},
]

const ITEMS_PER_PAGE = 10

export default function NPD() {
	const [isSearching, setIsSearching] = useState(false)
	const [searchModule, setSearchModule] = useState<NpdSearchTypes>("firstname")
	const [query, setQuery] = useState("")
	const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [currentPage, setCurrentPage] = useState(1)
	const [resultSearch, setResultSearch] = useState("")
	const [isMultiSearch, setIsMultiSearch] = useState(false)
	const [searchFields, setSearchFields] = useState<SearchField[]>([{ field: "firstname", value: "" }])

	const handleModuleChange = (module: NpdSearchTypes) => {
		setSearchModule(module)
		setSearchResults(null)
		setError(null)
		setQuery("")
	}

	const toggleSearchMode = () => {
		setIsMultiSearch(!isMultiSearch)
		setSearchResults(null)
		setError(null)

		if (!isMultiSearch) {
			setSearchFields([{ field: searchModule, value: query }])
		} else {
			const firstField = searchFields[0]
			setSearchModule(firstField?.field || "firstname")
			setQuery(firstField?.value || "")
		}
	}

	const addSearchField = () => {
		const usedFields = searchFields.map((f) => f.field)
		const availableField = searchTypes.find((type) => !usedFields.includes(type.value))

		if (availableField) {
			setSearchFields([...searchFields, { field: availableField.value, value: "" }])
		}
	}

	const removeSearchField = (index: number) => {
		if (searchFields.length > 1) {
			const newFields = [...searchFields]
			newFields.splice(index, 1)
			setSearchFields(newFields)
		}
	}

	const updateSearchField = (index: number, field: NpdSearchTypes, value: string) => {
		const newFields = [...searchFields]
		newFields[index] = { field, value }
		setSearchFields(newFields)
	}

	const handleSearch = useCallback(async () => {
		if (isMultiSearch) {
			const emptyFields = searchFields.filter((f) => !f.value.trim())
			if (emptyFields.length > 0) {
				setError("Please enter values for all search fields")
				return
			}

			const fieldNames = searchFields.map((f) => f.field)
			if (new Set(fieldNames).size !== fieldNames.length) {
				setError("Duplicate search fields are not allowed")
				return
			}
		} else if (!query.trim()) {
			setError("Please enter a search query")
			return
		}

		setIsSearching(true)
		setError(null)
		setSearchResults(null)

		try {
			const response = await fetch("/api/npd", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(
					isMultiSearch
						? {
								query: "multi-search",
								module: searchFields,
							}
						: {
								query,
								module: searchModule,
							},
				),
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
			setCurrentPage(1)
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
	}, [query, searchModule, isMultiSearch, searchFields])

	const getResultsArray = useMemo(() => {
		if (!searchResults?.data) return []
		return searchResults.data
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
				([key, value]) =>
					value !== null &&
					value !== undefined &&
					!key.startsWith("@") &&
					!key.startsWith("host") &&
					!key.startsWith("event") &&
					!key.startsWith("log") &&
					!key.startsWith("message") &&
					String(value).toLowerCase().includes(resultSearch.toLowerCase()),
			),
		)
	}, [getPaginatedResults, resultSearch])

	const totalPages = useMemo(() => {
		return Math.ceil(getResultsArray.length / ITEMS_PER_PAGE)
	}, [getResultsArray])

	const censorSSN = (ssn: string | undefined | null) => {
		if (!ssn) return "-"
		return `${ssn.slice(0, -4)}XXXX`
	}

	const downloadResults = useCallback(
		(format: ExportFormat = "json") => {
			if (!searchResults) return

			let content = ""
			let filename = isMultiSearch ? "npd-multi-search" : `npd-${searchModule}-${query}`
			let mimeType = "application/json"

			if (format === "json") {
				const censoredResults = {
					...searchResults,
					data: searchResults.data.map((result) => ({
						...result,
						ssn: result.ssn ? `${result.ssn.slice(0, -4)}XXXX` : result.ssn,
					})),
				}
				content = JSON.stringify(censoredResults, null, 2)
				filename += ".json"
			} else {
				const formattedLines = getResultsArray
					.map((result: NpdResult) => {
						const name = `${result.firstname || ""} ${result.lastname || ""}`.trim()
						const ssn = result.ssn ? `${result.ssn.slice(0, -4)}XXXX` : ""
						const address = result.address || ""

						if (format === "user-pass") {
							return `${name}:${ssn}`
						}
						if (format === "url-user-pass") {
							return `${name}:${ssn}:${address}`
						}
						return ""
					})
					.filter((line: string) => line.trim() !== "")

				content = formattedLines.join("\n")
				filename += ".txt"
				mimeType = "text/plain"
			}

			const blob = new Blob([content], { type: mimeType })
			const url = URL.createObjectURL(blob)
			const a = document.createElement("a")
			a.href = url
			a.download = filename
			a.click()
		},
		[searchResults, searchModule, query, getResultsArray, isMultiSearch],
	)

	const renderSearchForm = () => {
		if (isMultiSearch) {
			return (
				<div className="space-y-3">
					{searchFields.map((field, index) => (
						<div key={index} className="flex items-center space-x-2">
							<Select
								value={field.field}
								onValueChange={(value) => updateSearchField(index, value as NpdSearchTypes, field.value)}
							>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Select field" />
								</SelectTrigger>
								<SelectContent>
									{searchTypes.map((type) => (
										<SelectItem key={type.value} value={type.value}>
											<div className="flex items-center gap-2">
												{type.icon}
												{type.label}
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Input
								type="text"
								value={field.value}
								onChange={(e) => updateSearchField(index, field.field, e.target.value)}
								placeholder={`Enter ${
									field.field === "firstname" || field.field === "lastname" || field.field === "middlename"
										? field.field
										: field.field === "address" ||
												field.field === "city" ||
												field.field === "county_name" ||
												field.field === "st" ||
												field.field === "zip"
											? field.field.replace("_name", "")
											: field.field === "ssn"
												? "SSN"
												: "phone number"
								}...`}
								className="flex-1"
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										handleSearch()
									}
								}}
							/>
							<Button
								variant="outline"
								size="icon"
								onClick={() => removeSearchField(index)}
								disabled={searchFields.length <= 1}
							>
								<IconTrash className="h-4 w-4" />
							</Button>
						</div>
					))}
					<div className="flex justify-between">
						<Button
							variant="outline"
							size="sm"
							onClick={addSearchField}
							disabled={searchFields.length >= searchTypes.length}
							className="flex items-center gap-2"
						>
							<IconPlus className="h-4 w-4" />
							Add Field
						</Button>
						<Button onClick={handleSearch} disabled={isSearching} className="flex items-center gap-2">
							{isSearching ? <IconLoader2 className="h-4 w-4 animate-spin" /> : <IconSearch className="h-4 w-4" />}
							Search
						</Button>
					</div>
				</div>
			)
		}

		return (
			<div className="flex w-full items-center space-x-2">
				<div className="relative flex-1">
					<Input
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder={`Enter ${
							searchModule === "firstname" || searchModule === "lastname" || searchModule === "middlename"
								? searchModule
								: searchModule === "address" ||
										searchModule === "city" ||
										searchModule === "county_name" ||
										searchModule === "st" ||
										searchModule === "zip"
									? searchModule.replace("_name", "")
									: searchModule === "ssn"
										? "SSN"
										: "phone number"
						}...`}
						className="pr-10"
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								handleSearch()
							}
						}}
					/>
					<Button
						className="absolute right-0 top-0 h-full rounded-l-none"
						onClick={handleSearch}
						disabled={isSearching}
					>
						{isSearching ? <IconLoader2 className="h-4 w-4 animate-spin" /> : <IconSearch className="h-4 w-4" />}
					</Button>
				</div>
			</div>
		)
	}

	return (
		<div className="container mx-auto py-8 px-4 space-y-8">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-3xl font-bold tracking-tight">NPD Search</h1>
				<Button variant="outline" asChild>
					<Link href="/dashboard" className="flex items-center">
						<IconArrowLeft className="w-4 h-4 mr-2" />
						<span>Back to Dashboard</span>
					</Link>
				</Button>
			</div>

			<Card>
				<CardHeader>
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
						<CardTitle className="flex items-center gap-2">
							<IconDatabase className="h-5 w-5" />
							{isMultiSearch
								? "Multi-Field Search"
								: `Search by ${searchTypes.find((st) => st.value === searchModule)?.label}`}
						</CardTitle>
						<Button variant="outline" size="sm" onClick={toggleSearchMode} className="flex items-center gap-2">
							{isMultiSearch ? (
								<>
									<IconFilterOff className="h-4 w-4" />
									<span>Single Field Search</span>
								</>
							) : (
								<>
									<IconFilter className="h-4 w-4" />
									<span>Multi-Field Search</span>
								</>
							)}
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-4">
						{!isMultiSearch && (
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
						)}
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
				<Alert
					variant={error.toLowerCase().includes("subscription") ? "default" : "destructive"}
					className="animate-in fade-in duration-300"
				>
					<div className="flex items-start gap-3">
						<div className="flex-shrink-0 mt-0.5">
							{error.toLowerCase().includes("subscription") ? (
								<IconAlertTriangle className="h-5 w-5 text-amber-500" />
							) : (
								<IconAlertTriangle className="h-5 w-5 text-red-500" />
							)}
						</div>
						<div className="flex-1 space-y-2">
							<div className="flex flex-col">
								<AlertTitle className="text-base font-semibold">
									{error.toLowerCase().includes("subscription") ? "Subscription Required" : "Error Occurred"}
								</AlertTitle>
								<AlertDescription className="text-sm text-muted-foreground mt-1">
									{error.toLowerCase().includes("subscription")
										? "You need an active subscription to access this feature. NPD requires a one-time purchase for lifetime access."
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
													onClick={() => downloadResults("user-pass")}
													className="flex items-center"
												>
													<IconDownload className="mr-2 h-4 w-4" />
													NAME:SSN
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<p>Download as NAME:SSN format</p>
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
													onClick={() => downloadResults("url-user-pass")}
													className="flex items-center"
												>
													<IconLink className="mr-2 h-4 w-4" />
													NAME:SSN:ADDRESS
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<p>Download as NAME:SSN:ADDRESS format</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</div>
								<Input
									type="text"
									value={resultSearch}
									onChange={(e) => setResultSearch(e.target.value)}
									placeholder="Filter results..."
									className="w-full sm:w-[200px]"
								/>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{getResultsArray.length > 0 ? (
								<div className="space-y-4">
									<div className="overflow-x-auto">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>First Name</TableHead>
													<TableHead>Last Name</TableHead>
													<TableHead>Middle Name</TableHead>
													<TableHead>Date of Birth</TableHead>
													<TableHead>SSN</TableHead>
													<TableHead>Phone</TableHead>
													<TableHead>Address</TableHead>
													<TableHead>City</TableHead>
													<TableHead>County</TableHead>
													<TableHead>State</TableHead>
													<TableHead>ZIP</TableHead>
													<TableHead>AKA 1</TableHead>
													<TableHead>AKA 2</TableHead>
													<TableHead>AKA 3</TableHead>
													<TableHead>Start Date</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{filteredResults.map((result, index) => (
													<TableRow key={`${result.ID || ""}-${index}`}>
														<TableCell>{result.firstname || "-"}</TableCell>
														<TableCell>{result.lastname || "-"}</TableCell>
														<TableCell>{result.middlename || "-"}</TableCell>
														<TableCell>{result.dob || "-"}</TableCell>
														<TableCell>{censorSSN(result.ssn)}</TableCell>
														<TableCell>{result.phone1 || "-"}</TableCell>
														<TableCell>{result.address || "-"}</TableCell>
														<TableCell>{result.city || "-"}</TableCell>
														<TableCell>{result.county_name || "-"}</TableCell>
														<TableCell>{result.st || "-"}</TableCell>
														<TableCell>{result.zip || "-"}</TableCell>
														<TableCell>{result.aka1fullname || "-"}</TableCell>
														<TableCell>{result.aka2fullname || "-"}</TableCell>
														<TableCell>{result.aka3fullname || "-"}</TableCell>
														<TableCell>{result.StartDat || "-"}</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>
									<div className="flex justify-between items-center mt-4">
										<Button
											onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
											disabled={currentPage === 1}
										>
											<IconChevronLeft className="h-4 w-4 mr-2" />
											Previous
										</Button>
										<span>
											Page {currentPage} of {totalPages || 1}
										</span>
										<Button
											onClick={() => setCurrentPage((prev) => Math.min(totalPages || 1, prev + 1))}
											disabled={currentPage === (totalPages || 1)}
										>
											Next
											<IconChevronRight className="h-4 w-4 ml-2" />
										</Button>
									</div>
								</div>
							) : (
								<Alert>
									<IconInfoCircle className="h-5 w-5" />
									<AlertTitle>No results found</AlertTitle>
									<AlertDescription>
										No data available for{" "}
										{isMultiSearch ? <>your multi-field search</> : <strong>{query || "your search query"}</strong>}.
										Try a different search term.
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
