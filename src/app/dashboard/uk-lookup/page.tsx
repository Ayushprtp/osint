"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { User, Search, Loader2, MapPin, Home, Phone, Calendar, FileText, ArrowLeft } from "lucide-react"
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table"
import Link from "next/link"

const FIELD_LABELS: Record<string, string> = {
	fname: "First Name",
	sname: "Last Name",
	full_name: "Full Name",
	location: "Location",
	address: "Address",
	year_of_birth: "Year of Birth",
	phone_info: "Phone Info",
	previous_house_sale: "Previous House Sale",
	previous_residency_year: "Previous Residency Year",
}

function FieldRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
	return (
		<div className="flex items-center gap-2 py-1">
			{icon}
			<span className="font-medium min-w-[120px]">{label}:</span>
			<span className="text-primary">{value || <span className="italic text-muted-foreground">No data</span>}</span>
		</div>
	)
}

function HouseSale({ sale }: { sale: { date?: string; price?: string } }) {
	if (!sale) return null
	return (
		<Table>
			<TableBody>
				<TableRow>
					<TableCell className="font-medium">Date</TableCell>
					<TableCell>{sale.date || <span className="italic text-muted-foreground">No data</span>}</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-medium">Price</TableCell>
					<TableCell>
						{sale.price ? (
							<>£{Number(sale.price).toLocaleString()}</>
						) : (
							<span className="italic text-muted-foreground">No data</span>
						)}
					</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	)
}

function ExtraFields({ result }: { result: any }) {
	const exclude = [
		"fname",
		"sname",
		"full_name",
		"location",
		"address",
		"year_of_birth",
		"phone_info",
		"previous_house_sale",
		"previous_residency_year",
	]
	const entries = Object.entries(result).filter(([key]) => !exclude.includes(key))
	if (!entries.length) return null
	return (
		<Card>
			<CardHeader className="bg-muted/30 py-2 px-4">
				<CardTitle className="flex items-center gap-2 text-base">
					<FileText className="h-4 w-4 text-primary" />
					<span>Other Information</span>
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-4">
				<Table>
					<TableBody>
						{entries.map(([key, value]) => (
							<TableRow key={key}>
								<TableCell className="font-medium">{key.replace(/_/g, " ")}</TableCell>
								<TableCell>
									{typeof value === "string" || typeof value === "number" ? (
										value
									) : (
										<span className="italic text-muted-foreground">No data</span>
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	)
}

function SkeletonCard() {
	return (
		<Card>
			<CardHeader className="bg-muted/30 py-2 px-4 animate-pulse">
				<div className="h-5 w-32 bg-muted rounded" />
			</CardHeader>
			<CardContent className="pt-4 space-y-2">
				<div className="h-4 w-48 bg-muted rounded" />
				<div className="h-4 w-24 bg-muted rounded" />
			</CardContent>
		</Card>
	)
}

export default function UkLookup() {
	const [fname, setFname] = useState("")
	const [sname, setSname] = useState("")
	const [location, setLocation] = useState("")
	const [isSearching, setIsSearching] = useState(false)
	const [result, setResult] = useState<any | null>(null)
	const [error, setError] = useState<string | null>(null)

	const handleSearch = useCallback(async () => {
		if (!fname.trim() || !sname.trim() || !location.trim()) {
			setError("Please enter first name, last name, and location.")
			return
		}
		setIsSearching(true)
		setError(null)
		setResult(null)
		try {
			const response = await fetch("/api/uk-lookup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ fname, sname, location }),
			})
			const data = await response.json()
			if (data.success) {
				setResult(data.data)
			} else {
				setError(data.error || "Unknown error")
			}
		} catch {
			setError("Network or server error")
		} finally {
			setIsSearching(false)
		}
	}, [fname, sname, location])

	return (
		<div className="container mx-auto py-8 px-4 space-y-8">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-3xl font-bold tracking-tight">UK Lookup</h1>
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
					<form
						onSubmit={(e) => {
							e.preventDefault()
							handleSearch()
						}}
						className="flex flex-col sm:flex-row gap-4"
					>
						<div className="flex-1 flex flex-col gap-2">
							<Input
								id="fname"
								value={fname}
								onChange={(e) => setFname(e.target.value)}
								required
								placeholder="First Name (e.g. Gordon)"
								className="w-full"
							/>
							<Input
								id="sname"
								value={sname}
								onChange={(e) => setSname(e.target.value)}
								required
								placeholder="Last Name (e.g. Ramsay)"
								className="w-full"
							/>
							<Input
								id="location"
								value={location}
								onChange={(e) => setLocation(e.target.value)}
								required
								placeholder="Location (e.g. London)"
								className="w-full"
							/>
						</div>
						<div className="flex gap-2 items-end">
							<Button type="submit" disabled={isSearching} className="h-10">
								{isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
								Search
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
			{error && (
				<Alert variant="destructive">
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}
			{isSearching && (
				<div className="space-y-6 mt-6">
					<SkeletonCard />
					<SkeletonCard />
				</div>
			)}
			{result && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
					<Card className="shadow-md col-span-2">
						<CardHeader className="bg-muted/30 py-3 px-6 border-b flex flex-row items-center justify-between">
							<CardTitle className="flex items-center gap-3 text-xl font-semibold">
								<User className="h-6 w-6 text-primary" />
								<span>{result.full_name || `${result.fname || ""} ${result.sname || ""}`.trim() || "Person"}</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-6 pb-2 px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
							<FieldRow
								icon={<Calendar className="h-4 w-4 text-primary" />}
								label="Year of Birth"
								value={result.year_of_birth}
							/>
							<FieldRow icon={<MapPin className="h-4 w-4 text-primary" />} label="Location" value={result.location} />
							<FieldRow icon={<Home className="h-4 w-4 text-primary" />} label="Address" value={result.address} />
							<FieldRow
								icon={<Phone className="h-4 w-4 text-primary" />}
								label="Phone"
								value={
									result.phone_info === "No phone listing" ? (
										<span className="italic text-muted-foreground">{result.phone_info}</span>
									) : (
										result.phone_info
									)
								}
							/>
							{result.previous_residency_year && (
								<FieldRow
									icon={<Calendar className="h-4 w-4 text-primary" />}
									label="Previous Residency Year"
									value={result.previous_residency_year}
								/>
							)}
						</CardContent>
					</Card>
					{result.previous_house_sale && (
						<Card className="shadow-sm col-span-2">
							<CardHeader className="bg-muted/30 py-2 px-6 border-b">
								<CardTitle className="flex items-center gap-2 text-lg">
									<Home className="h-5 w-5 text-primary" />
									<span>Previous House Sale</span>
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-4 px-6">
								<HouseSale sale={result.previous_house_sale} />
							</CardContent>
						</Card>
					)}
					<ExtraFields result={result} />
				</div>
			)}
		</div>
	)
}
