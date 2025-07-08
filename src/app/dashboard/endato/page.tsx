"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Search, Loader2, Download, ArrowLeft, Mail, AlertTriangle, User, MapPin, Phone, UserPlus } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface Address {
	houseNumber: string
	streetPreDirection: string
	streetName: string
	streetPostDirection: string
	streetType: string
	unit: string
	unitType: string
	city: string
	state: string
	zip: string
	zip4: string
	county: string
	firstReportedDate: string
	lastReportedDate: string
	fullAddress: string
}

interface Phone {
	number?: string
	phoneNumber?: string
	type: string
	isConnected?: boolean
	firstReportedDate?: string
	lastReportedDate?: string
}

interface Email {
	emailAddress: string
	isPremium?: boolean
}
interface Relative {
	firstName: string
	middleName: string
	lastName: string
	dob: string
	relativeType: string
	city: string
	state: string
}
interface SimpleAddress {
	street?: string
	unit?: string
	city?: string
	state?: string
	zip?: string
}

interface SimplePhone {
	phoneNumber?: string
	number?: string
	type?: string
	isConnected?: boolean
	firstReportedDate?: string
	lastReportedDate?: string
}
interface Person {
	name: {
		firstName: string
		middleName: string
		lastName: string
	}
	age: string
	addresses: Address[]
	phoneNumbers: Phone[]
	emailAddresses: Email[]
	relativesSummary: Relative[]
	address?: SimpleAddress
	phone?: SimplePhone
	email?: string
	isEmailValidated?: boolean
	isBusiness?: boolean
}

interface EndatoResult {
	success: boolean
	data: {
		email?: string
		phone?: string
		person?: Person
		persons?: Person[]
	}
	message?: string
}

const searchTypes = [
	{ value: "email", label: "Email" },
	{ value: "phone", label: "Phone" },
	{ value: "person", label: "Person" },
]

export default function EndatoSearch() {
	const [data, setData] = useState<EndatoResult | null>(null)
	const [query, setQuery] = useState("")
	const [searchType, setSearchType] = useState<"email" | "phone" | "person">("email")
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const [firstName, setFirstName] = useState("")
	const [middleName, setMiddleName] = useState("")
	const [lastName, setLastName] = useState("")
	const [dob, setDob] = useState("")
	const [addressLine2, setAddressLine2] = useState("")

	const [selectedPersonIndex, setSelectedPersonIndex] = useState(0)
	const isEmailWithPremium = (email: Email | string): email is Email => {
		return typeof email === "object" && "isPremium" in email
	}
	const isPhoneObject = (phone: any): phone is Phone => {
		return (
			typeof phone === "object" &&
			("type" in phone || "isConnected" in phone || "phoneNumber" in phone || "number" in phone)
		)
	}
	const validateInput = () => {
		switch (searchType) {
			case "email":
				if (!query.includes("@") || !query.includes(".")) {
					setError("Please enter a valid email address")
					return false
				}
				break
			case "phone":
				if (!/^\d{10}$/.test(query)) {
					setError("Please enter a valid 10-digit phone number")
					return false
				}
				break
			case "person":
				if (!firstName.trim() || !lastName.trim()) {
					setError("First name and last name are required")
					return false
				}
				break
		}
		return true
	}

	const fetchData = useCallback(async () => {
		if (searchType === "email" || searchType === "phone") {
			if (!query.trim()) {
				setError(`Please enter a ${searchType === "email" ? "email address" : "phone number"}`)
				return
			}
		}

		if (!validateInput()) {
			return
		}

		setIsLoading(true)
		setError(null)

		try {
			let endpoint
			let searchTypeValue
			let requestData

			switch (searchType) {
				case "email":
					endpoint = "Email/Enrich"
					searchTypeValue = "DevAPIEmailID"
					requestData = { email: query }
					break
				case "phone":
					endpoint = "Phone/Enrich"
					searchTypeValue = "DevAPICallerID"
					requestData = { phone: query }
					break
				case "person":
					endpoint = "PersonSearch"
					searchTypeValue = "Person"
					requestData = {
						FirstName: firstName,
						MiddleName: middleName,
						LastName: lastName,
						Dob: dob,
						Addresses: addressLine2 ? [{ AddressLine2: addressLine2 }] : [],
						Page: 1,
						ResultsPerPage: 10,
					}
					break
			}

			const res = await fetch("/api/endato", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					endpoint,
					searchType: searchTypeValue,
					data: requestData,
				}),
			})

			if (!res.ok) {
				const errorData = await res.json()

				if (res.status === 403 && errorData?.error?.includes("subscription")) {
					throw new Error("SUBSCRIPTION_REQUIRED")
				}

				throw new Error(errorData?.error || "Failed to fetch data")
			}

			const responseData = await res.json()

			if (responseData.success) {
				const hasNoResults =
					responseData.data.error?.warnings?.some(
						(warning: string | string[]) =>
							typeof warning === "string" &&
							(warning.includes("returned no results") || warning.includes("Criteria search returned no results")),
					) ||
					(searchType === "person" && (!responseData.data.persons || responseData.data.persons.length === 0)) ||
					((searchType === "email" || searchType === "phone") && !responseData.data.person)

				if (hasNoResults) {
					setError("No results found for your search. Please try different search criteria.")
					setData(null)
					setIsLoading(false)
					return
				}

				if (searchType === "person" && responseData.data.persons && responseData.data.persons.length > 0) {
					setSelectedPersonIndex(0)
				}

				setData(responseData)
			} else {
				if (responseData.message) {
					setError(responseData.message)
				} else {
					setError("No results found or an error occurred")
				}
			}
		} catch (error) {
			console.error("Fetch error:", error)

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
			setIsLoading(false)
		}
	}, [query, searchType, firstName, middleName, lastName, dob, addressLine2])

	const handleExport = useCallback(() => {
		if (!data) return

		let identifier
		if (data.data.email) {
			identifier = data.data.email.replace("@", "-at-")
		} else if (data.data.phone) {
			identifier = data.data.phone
		} else if (data.data.person) {
			identifier = `${data.data.person.name.firstName}-${data.data.person.name.lastName}`.toLowerCase()
		} else if (data.data.persons && data.data.persons.length > 0) {
			const person = data.data.persons[selectedPersonIndex]
			identifier = `${person.name.firstName}-${person.name.lastName}`.toLowerCase()
		}

		const exportData = JSON.stringify(data, null, 2)
		const blob = new Blob([exportData], { type: "application/json" })
		const url = URL.createObjectURL(blob)
		const link = document.createElement("a")
		link.href = url
		link.download = `endato-${identifier}.json`
		link.click()
		setTimeout(() => URL.revokeObjectURL(url), 0)
	}, [data, selectedPersonIndex])

	const getCurrentPerson = () => {
		if (!data || !data.success) return null

		if (data.data.person) {
			const person = data.data.person

			let phoneNumbers: Phone[] = []
			let emailAddresses: Email[] = []

			if (searchType === "phone" && data.data.phone) {
				phoneNumbers = [
					{
						phoneNumber: data.data.phone,
						type: person.phone?.type || "",
						isConnected: person.phone?.isConnected || false,
						firstReportedDate: person.phone?.firstReportedDate || "",
						lastReportedDate: person.phone?.lastReportedDate || "",
					},
				]
			} else if (person.phone?.number) {
				phoneNumbers = [
					{
						phoneNumber: person.phone.number,
						type: person.phone.type || "",
						isConnected: person.phone.isConnected || false,
						firstReportedDate: person.phone.firstReportedDate || "",
						lastReportedDate: person.phone.lastReportedDate || "",
					},
				]
			} else if (person.phoneNumbers) {
				phoneNumbers = person.phoneNumbers.map((phone) => {
					if (typeof phone === "string") {
						return {
							phoneNumber: phone,
							type: "",
							isConnected: false,
							firstReportedDate: "",
							lastReportedDate: "",
						}
					}
					if (typeof phone === "object") {
						return {
							phoneNumber: phone.phoneNumber || "",
							type: phone.type || "",
							isConnected: phone.isConnected || false,
							firstReportedDate: phone.firstReportedDate || "",
							lastReportedDate: phone.lastReportedDate || "",
						}
					}

					return {
						phoneNumber: String(phone),
						type: "",
						isConnected: false,
						firstReportedDate: "",
						lastReportedDate: "",
					}
				})
			}

			if (searchType === "email" && data.data.email) {
				emailAddresses = [
					{
						emailAddress: data.data.email,
						isPremium: typeof person.isEmailValidated === "boolean" ? person.isEmailValidated : false,
					},
				]
			} else if (person.email) {
				emailAddresses = [
					{
						emailAddress: person.email,
						isPremium: typeof person.isEmailValidated === "boolean" ? person.isEmailValidated : false,
					},
				]
			} else if (person.emailAddresses) {
				emailAddresses = person.emailAddresses.map((email) => {
					if (typeof email === "string") {
						return {
							emailAddress: email,
							isPremium: false,
						}
					}
					if (typeof email === "object") {
						return {
							emailAddress: email.emailAddress || "",
							isPremium: email.isPremium || false,
						}
					}

					return {
						emailAddress: String(email),
						isPremium: false,
					}
				})
			}

			const addresses = person.address
				? [
						{
							fullAddress: `${person.address.street || ""}, ${person.address.city || ""}, ${person.address.state || ""} ${person.address.zip || ""}`,
							city: person.address.city || "",
							state: person.address.state || "",
							zip: person.address.zip || "",
							houseNumber: "",
							streetName: person.address.street || "",
							streetType: "",
							streetPreDirection: "",
							streetPostDirection: "",
							unit: person.address.unit || "",
							unitType: "",
							zip4: "",
							county: "",
							firstReportedDate: "",
							lastReportedDate: "",
						},
					]
				: person.addresses || []

			return {
				...person,
				addresses,
				phoneNumbers,
				emailAddresses,
				relativesSummary: person.relativesSummary || [],
			}
		}
		if (data.data.persons && data.data.persons.length > 0) {
			const person = data.data.persons[selectedPersonIndex]

			const phoneNumbers = person.phoneNumbers
				? person.phoneNumbers.map((phone) => {
						if (typeof phone === "string") {
							return {
								phoneNumber: phone,
								type: "",
								isConnected: false,
								firstReportedDate: "",
								lastReportedDate: "",
							}
						}
						if (typeof phone === "object") {
							return {
								phoneNumber: phone.phoneNumber || "",
								type: phone.type || "",
								isConnected: phone.isConnected || false,
								firstReportedDate: phone.firstReportedDate || "",
								lastReportedDate: phone.lastReportedDate || "",
							}
						}
						return {
							phoneNumber: String(phone),
							type: "",
							isConnected: false,
							firstReportedDate: "",
							lastReportedDate: "",
						}
					})
				: []

			const emailAddresses = person.emailAddresses
				? person.emailAddresses.map((email) => {
						if (typeof email === "string") {
							return {
								emailAddress: email,
								isPremium: false,
							}
						}
						if (typeof email === "object") {
							return {
								emailAddress: email.emailAddress || "",
								isPremium: email.isPremium || false,
							}
						}
						return {
							emailAddress: String(email),
							isPremium: false,
						}
					})
				: []

			return {
				...person,
				phoneNumbers,
				emailAddresses,
			}
		}

		return null
	}
	const currentPerson = getCurrentPerson()
	const hasAddresses = currentPerson && currentPerson.addresses?.length > 0
	const hasPhones = currentPerson && currentPerson.phoneNumbers?.length > 0
	const hasEmails = currentPerson && currentPerson.emailAddresses?.length > 0
	const hasRelatives = currentPerson && currentPerson.relativesSummary?.length > 0
	const primaryIdentifier = data?.data?.email || data?.data?.phone
	const totalPersons = data?.data?.persons?.length || 0

	const formatPhoneNumber = (phoneNumber: string | number | null | undefined): string => {
		if (!phoneNumber) return ""

		const phoneStr = phoneNumber.toString().replace(/\D/g, "")

		if (phoneNumber.toString().includes("(") && phoneNumber.toString().includes(")")) {
			return phoneNumber.toString()
		}

		if (phoneStr.length === 10) {
			return `(${phoneStr.slice(0, 3)}) ${phoneStr.slice(3, 6)}-${phoneStr.slice(6)}`
		}

		return phoneStr
	}

	interface Address {
		fullAddress?: string
		houseNumber?: string
		streetPreDirection?: string
		streetName?: string
		streetType?: string
		unit?: string
		unitType?: string
		city?: string
		state?: string
		zip?: string
		zip4?: string
	}

	const formatAddress = (address: Address | null | undefined): string => {
		if (!address) return ""

		if (address.fullAddress) {
			return address.fullAddress
		}

		let formattedAddress = ""

		if (address.houseNumber) {
			formattedAddress += `${address.houseNumber} `
		}

		if (address.streetPreDirection) {
			formattedAddress += `${address.streetPreDirection} `
		}

		if (address.streetName) {
			formattedAddress += `${address.streetName} `
		}

		if (address.streetType) {
			formattedAddress += `${address.streetType}, `
		}

		if (address.unit) {
			formattedAddress += `${address.unitType} ${address.unit}; `
		}

		if (address.city) {
			formattedAddress += `${address.city}, `
		}

		if (address.state) {
			formattedAddress += `${address.state} `
		}

		if (address.zip) {
			formattedAddress += address.zip
			if (address.zip4) {
				formattedAddress += `-${address.zip4}`
			}
		}

		return formattedAddress
	}

	const renderSearchForm = () => {
		switch (searchType) {
			case "email":
			case "phone":
				return (
					<div className="flex w-full items-center space-x-2">
						<div className="relative flex-1">
							<Input
								type="text"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder={searchType === "email" ? "Enter email address" : "Enter phone number (e.g., 1234567890)"}
								className="pr-10"
							/>
							<Button className="absolute right-0 top-0 h-full rounded-l-none" onClick={fetchData} disabled={isLoading}>
								{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
							</Button>
						</div>
					</div>
				)
			case "person":
				return (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
						<Input
							type="text"
							value={firstName}
							onChange={(e) => setFirstName(e.target.value)}
							placeholder="First Name"
						/>
						<Input
							type="text"
							value={middleName}
							onChange={(e) => setMiddleName(e.target.value)}
							placeholder="Middle Name (optional)"
						/>
						<Input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" />
						<Input
							type="text"
							value={dob}
							onChange={(e) => setDob(e.target.value)}
							placeholder="Date of Birth (e.g., 1/1/1980) (optional)"
						/>
						<Input
							type="text"
							value={addressLine2}
							onChange={(e) => setAddressLine2(e.target.value)}
							placeholder="City, State (e.g., Sacramento, CA) (optional)"
							className="sm:col-span-2"
						/>
						<div className="lg:col-span-3 flex justify-end">
							<Button onClick={fetchData} disabled={isLoading}>
								{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
								Search
							</Button>
						</div>
					</div>
				)
			default:
				return null
		}
	}

	const renderPersonSelector = () => {
		if (!data?.data?.persons || data.data.persons.length <= 1) return null

		return (
			<Card className="mb-4">
				<CardHeader className="pb-2">
					<CardTitle className="text-base">Found {data.data.persons.length} matching persons</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
							{data.data.persons.map((person, index) => (
								<Button
									key={index}
									variant={index === selectedPersonIndex ? "default" : "outline"}
									className="justify-start overflow-hidden"
									onClick={() => setSelectedPersonIndex(index)}
								>
									<div className="truncate">
										{person.name.firstName} {person.name.lastName}
										{person.age && <span className="ml-2 text-xs">({person.age})</span>}
									</div>
								</Button>
							))}
						</div>
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="container mx-auto py-8 px-4 space-y-8">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-3xl font-bold tracking-tight">Endato Search</h1>
				<Button variant="outline" asChild>
					<Link href="/dashboard" className="flex items-center">
						<ArrowLeft className="w-4 h-4 mr-2" />
						<span>Back to Dashboard</span>
					</Link>
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Search className="h-5 w-5" />
						Search by {searchType === "person" ? "Person" : searchType === "email" ? "Email" : "Phone"}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-4">
						<div className="flex flex-wrap gap-2 mb-2">
							{searchTypes.map((type) => (
								<Button
									key={type.value}
									variant={searchType === type.value ? "default" : "outline"}
									size="sm"
									onClick={() => setSearchType(type.value as "email" | "phone" | "person")}
									className="flex items-center gap-2"
								>
									{type.value === "email" && <Mail className="h-4 w-4" />}
									{type.value === "phone" && <Phone className="h-4 w-4" />}
									{type.value === "person" && <User className="h-4 w-4" />}
									{type.label}
								</Button>
							))}
						</div>
						<div className="w-full">{renderSearchForm()}</div>
					</div>
				</CardContent>
			</Card>

			{error && (
				<Alert
					variant={
						error.toLowerCase().includes("subscription")
							? "default"
							: error.toLowerCase().includes("Criteria search returned no results")
								? "default"
								: "destructive"
					}
					className="animate-in fade-in duration-300"
				>
					<div className="flex items-start gap-3">
						<div className="flex-shrink-0 mt-0.5">
							{error.toLowerCase().includes("subscription") ? (
								<AlertTriangle className="h-5 w-5 text-amber-500" />
							) : error.toLowerCase().includes("no results") ? (
								<AlertTriangle className="h-5 w-5 text-yellow-500" />
							) : (
								<AlertTriangle className="h-5 w-5 text-red-500" />
							)}
						</div>
						<div className="flex-1 space-y-2">
							<div className="flex flex-col">
								<AlertTitle className="text-base font-semibold">
									{error.toLowerCase().includes("subscription")
										? "Subscription Required"
										: error.toLowerCase().includes("no results")
											? "No Results Found"
											: "Error Occurred"}
								</AlertTitle>
								<AlertDescription className="text-sm text-muted-foreground mt-1">{error}</AlertDescription>
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

							{/* Removed the "no results" button and div here */}
						</div>
					</div>
				</Alert>
			)}

			{data?.success && !error && (
				<>
					{renderPersonSelector()}

					{currentPerson && (
						<Tabs defaultValue="overview" className="w-full">
							<TabsList className="grid grid-cols-6 mb-4">
								<TabsTrigger value="overview">Overview</TabsTrigger>
								<TabsTrigger value="addresses">Addresses</TabsTrigger>
								<TabsTrigger value="phones">Phones</TabsTrigger>
								<TabsTrigger value="emails">Emails</TabsTrigger>
								{hasRelatives && <TabsTrigger value="relatives">Relatives</TabsTrigger>}
								<TabsTrigger value="json">Raw Data</TabsTrigger>
							</TabsList>

							<TabsContent value="overview" className="space-y-4">
								<Card>
									<CardHeader className="bg-muted/50">
										<CardTitle className="flex items-center justify-between">
											<span className="flex items-center gap-2">
												<User className="h-5 w-5" />
												Person Information
											</span>
											<Button variant="outline" onClick={handleExport}>
												<Download className="mr-2 h-4 w-4" />
												Export
											</Button>
										</CardTitle>
									</CardHeader>
									<CardContent className="pt-6">
										<div className="grid md:grid-cols-2 gap-6">
											<Card>
												<CardHeader className="pb-2">
													<CardTitle className="text-base flex items-center gap-2">
														<User className="h-4 w-4" />
														Identity
													</CardTitle>
												</CardHeader>
												<CardContent>
													<div className="space-y-4">
														<div>
															<h3 className="font-semibold text-lg mb-1">
																{currentPerson.name.firstName || "N/A"}{" "}
																{currentPerson.name.middleName && `${currentPerson.name.middleName} `}
																{currentPerson.name.lastName || ""}
															</h3>
															<p className="text-muted-foreground">{primaryIdentifier}</p>
														</div>
														{currentPerson.age && (
															<div className="flex items-center gap-2">
																<Badge variant="outline">{currentPerson.age} years old</Badge>
															</div>
														)}
													</div>
												</CardContent>
											</Card>

											<Card>
												<CardHeader className="pb-2">
													<CardTitle className="text-base flex items-center gap-2">
														<MapPin className="h-4 w-4" />
														Primary Address
													</CardTitle>
												</CardHeader>
												<CardContent>
													{hasAddresses ? (
														<div className="space-y-1">
															<p className="font-medium">{formatAddress(currentPerson.addresses[0])}</p>
															<p className="text-sm text-muted-foreground mt-2">
																Last reported: {currentPerson.addresses[0].lastReportedDate || "N/A"}
															</p>
														</div>
													) : (
														<p className="text-muted-foreground">No address information available</p>
													)}
												</CardContent>
											</Card>

											<Card>
												<CardHeader className="pb-2">
													<CardTitle className="text-base flex items-center gap-2">
														<Phone className="h-4 w-4" />
														Primary Phone
													</CardTitle>
												</CardHeader>
												<CardContent>
													{hasPhones ? (
														<div className="space-y-2">
															<p className="font-medium text-lg">
																{formatPhoneNumber(
																	typeof currentPerson.phoneNumbers[0] === "string"
																		? currentPerson.phoneNumbers[0]
																		: (currentPerson.phoneNumbers[0] as Phone).phoneNumber,
																)}
															</p>
															{typeof currentPerson.phoneNumbers[0] === "object" &&
																currentPerson.phoneNumbers[0].type && (
																	<Badge variant="outline">{currentPerson.phoneNumbers[0].type}</Badge>
																)}
														</div>
													) : (
														<p className="text-muted-foreground">No phone information available</p>
													)}
												</CardContent>
											</Card>

											<Card>
												<CardHeader className="pb-2">
													<CardTitle className="text-base flex items-center gap-2">
														<Mail className="h-4 w-4" />
														Primary Email
													</CardTitle>
												</CardHeader>
												<CardContent>
													{hasEmails ? (
														<div className="space-y-1">
															<p className="font-medium">{currentPerson.emailAddresses[0].emailAddress}</p>
															{isEmailWithPremium(currentPerson.emailAddresses[0]) && (
																<Badge className="mt-1">Premium</Badge>
															)}
														</div>
													) : (
														<p className="text-muted-foreground">No email information available</p>
													)}
												</CardContent>
											</Card>
										</div>
									</CardContent>
								</Card>
							</TabsContent>

							<TabsContent value="addresses">
								<Card>
									<CardHeader className="bg-muted/50">
										<CardTitle className="flex items-center gap-2">
											<MapPin className="h-5 w-5" />
											Address History ({currentPerson.addresses?.length || 0})
										</CardTitle>
									</CardHeader>
									<CardContent className="pt-6">
										{hasAddresses ? (
											<Table>
												<TableHeader>
													<TableRow>
														<TableHead>Address</TableHead>
														<TableHead>City</TableHead>
														<TableHead>State</TableHead>
														<TableHead>ZIP</TableHead>
														<TableHead>First Reported</TableHead>
														<TableHead>Last Reported</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{currentPerson.addresses.map((address, index) => (
														<TableRow key={index}>
															<TableCell>{formatAddress(address)}</TableCell>
															<TableCell>{address.city || "N/A"}</TableCell>
															<TableCell>{address.state || "N/A"}</TableCell>
															<TableCell>{address.zip || "N/A"}</TableCell>
															<TableCell>{address.firstReportedDate || "N/A"}</TableCell>
															<TableCell>{address.lastReportedDate || "N/A"}</TableCell>
														</TableRow>
													))}
												</TableBody>
											</Table>
										) : (
											<div className="text-center py-8">
												<p className="text-muted-foreground">No address information available</p>
											</div>
										)}
									</CardContent>
								</Card>
							</TabsContent>
							<TabsContent value="phones">
								<Card>
									<CardHeader className="pb-2">
										<CardTitle className="text-base flex items-center gap-2">
											<Phone className="h-4 w-4" />
											Primary Phone
										</CardTitle>
									</CardHeader>
									<CardContent>
										{currentPerson.phoneNumbers && currentPerson.phoneNumbers.length > 0 ? (
											<div className="space-y-2">
												<p className="font-medium text-lg">
													{formatPhoneNumber(
														currentPerson.phoneNumbers[0].phoneNumber ||
															currentPerson.phoneNumbers[0].phoneNumber ||
															"",
													)}
												</p>
												{currentPerson.phoneNumbers[0].type && (
													<Badge variant="outline">{currentPerson.phoneNumbers[0].type}</Badge>
												)}
											</div>
										) : (
											<p className="text-muted-foreground">No phone information available</p>
										)}
									</CardContent>
								</Card>
							</TabsContent>

							<TabsContent value="emails">
								<Card>
									<CardHeader className="bg-muted/50">
										<CardTitle className="flex items-center gap-2">
											<Mail className="h-5 w-5" />
											Email History ({currentPerson.emailAddresses?.length || 0})
										</CardTitle>
									</CardHeader>
									<CardContent className="pt-6">
										{hasEmails ? (
											<Table>
												<TableHeader>
													<TableRow>
														<TableHead>Email</TableHead>
														<TableHead>Premium</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{currentPerson.emailAddresses.map((email, index) => (
														<TableRow key={index}>
															<TableCell className="font-medium">{email.emailAddress}</TableCell>
															<TableCell>
																{isEmailWithPremium(email) && (
																	<Badge variant={email.isPremium ? "default" : "outline"}>
																		{email.isPremium ? "Premium" : "Standard"}
																	</Badge>
																)}
															</TableCell>
														</TableRow>
													))}
												</TableBody>
											</Table>
										) : (
											<div className="text-center py-8">
												<p className="text-muted-foreground">No email information available</p>
											</div>
										)}
									</CardContent>
								</Card>
							</TabsContent>

							{hasRelatives && (
								<TabsContent value="relatives">
									<Card>
										<CardHeader className="bg-muted/50">
											<CardTitle className="flex items-center gap-2">
												<UserPlus className="h-5 w-5" />
												Relatives ({currentPerson.relativesSummary?.length || 0})
											</CardTitle>
										</CardHeader>
										<CardContent className="pt-6">
											<Table>
												<TableHeader>
													<TableRow>
														<TableHead>Name</TableHead>
														<TableHead>DOB</TableHead>
														<TableHead>Relationship</TableHead>
														<TableHead>Location</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{currentPerson.relativesSummary.map((relative, index) => (
														<TableRow key={index}>
															<TableCell className="font-medium">
																{relative.firstName} {relative.middleName} {relative.lastName}
															</TableCell>
															<TableCell>{relative.dob || "N/A"}</TableCell>
															<TableCell>{relative.relativeType}</TableCell>
															<TableCell>
																{relative.city && relative.state ? `${relative.city}, ${relative.state}` : "N/A"}
															</TableCell>
														</TableRow>
													))}
												</TableBody>
											</Table>
										</CardContent>
									</Card>
								</TabsContent>
							)}

							<TabsContent value="json">
								<Card>
									<CardHeader className="bg-muted/50 relative z-10">
										<CardTitle className="flex items-center justify-between">
											<span>Raw JSON Data</span>
											<Button variant="outline" onClick={handleExport}>
												<Download className="mr-2 h-4 w-4" />
												Export
											</Button>
										</CardTitle>
									</CardHeader>
									<CardContent className="pt-6">
										<pre className="bg-muted p-4 rounded-md overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>
									</CardContent>
								</Card>
							</TabsContent>
						</Tabs>
					)}
				</>
			)}
		</div>
	)
}
