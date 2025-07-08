"use client"

import { useState } from "react"
import {
	Search,
	User,
	Home,
	Phone,
	AlertTriangle,
	Loader2,
	Download,
	MapPin,
	DollarSign,
	FileText,
	Calendar,
	Activity,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"

export default function REISkipPage() {
	const [isSearching, setIsSearching] = useState(false)
	const [address, setAddress] = useState("")
	const [searchResults, setSearchResults] = useState<any | null>(null)
	const [error, setError] = useState<string | null>(null)

	const handleSearch = async () => {
		if (!address.trim()) {
			setError("Please enter a full address (e.g. 2248 Bartlett Street Houston TX 77098)")
			return
		}
		setIsSearching(true)
		setError(null)
		setSearchResults(null)
		try {
			const response = await fetch("/api/reiskip", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ address: address.trim() }),
			})
			const data = await response.json()
			if (!response.ok || !data.success) {
				throw new Error(data.error || "An error occurred during the search")
			}
			setSearchResults(data.data)
		} catch (err) {
			setError(err instanceof Error ? err.message : "An unknown error occurred")
		} finally {
			setIsSearching(false)
		}
	}

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") handleSearch()
	}

	const downloadResults = () => {
		if (!searchResults) return
		const dataStr = JSON.stringify(searchResults, null, 2)
		const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`
		const exportFileName = `house_lookup_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.json`
		const linkElement = document.createElement("a")
		linkElement.setAttribute("href", dataUri)
		linkElement.setAttribute("download", exportFileName)
		linkElement.click()
	}

	return (
		<div className="container mx-auto p-4 space-y-6">
			<Card className="overflow-hidden border shadow-sm bg-card">
				<CardHeader className="bg-card border-b">
					<CardTitle className="text-xl font-bold flex items-center gap-2">
						<Home className="h-5 w-5 text-primary" />
						REISkip
					</CardTitle>
					<div className="text-sm text-muted-foreground">
						Enter a full address to retrieve property and resident information.
					</div>
				</CardHeader>
				<CardContent className="p-6">
					<div className="space-y-4">
						<Label htmlFor="address">Address</Label>
						<Input
							id="address"
							placeholder="2248 Bartlett Street Houston TX 77098"
							value={address}
							onChange={(e) => setAddress(e.target.value)}
							onKeyPress={handleKeyPress}
							className="mb-4"
						/>
						<div className="flex flex-col sm:flex-row gap-2 justify-end">
							{searchResults && (
								<Button variant="outline" onClick={downloadResults} className="sm:w-auto w-full">
									<Download className="mr-2 h-4 w-4" />
									Export Results
								</Button>
							)}
							<Button onClick={handleSearch} disabled={isSearching} className="sm:w-auto w-full">
								{isSearching ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Searching...
									</>
								) : (
									<>
										<Search className="mr-2 h-4 w-4" />
										Search by Address
									</>
								)}
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{isSearching && (
				<Card className="border shadow-sm bg-card p-8">
					<div className="flex flex-col items-center justify-center text-center space-y-4">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
						<div>
							<p className="font-medium">Searching the database...</p>
							<p className="text-sm text-muted-foreground mt-1">This may take a few moments</p>
						</div>
					</div>
				</Card>
			)}

			{error && (
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{searchResults && !isSearching && (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<Card className="border shadow-sm">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Home className="h-5 w-5 text-primary" />
								Property Details
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2 text-sm">
							<div>
								<span className="font-medium">Address:</span>{" "}
								{searchResults.Output?.Property?.PropertyAddress?.Formatted ||
									searchResults.Output?.Identity?.Address?.FullAddress ||
									address}
							</div>
							{searchResults.Output?.Property?.Legal?.Subdivision && (
								<div>
									<span className="font-medium">Subdivision:</span> {searchResults.Output.Property.Legal.Subdivision}
								</div>
							)}
							{searchResults.Output?.Property?.PropertyUseInfo?.YearBuilt && (
								<div>
									<span className="font-medium">Year Built:</span>{" "}
									{searchResults.Output.Property.PropertyUseInfo.YearBuilt}
								</div>
							)}
							{searchResults.Output?.Property?.PropertyDetails?.PropertyType && (
								<div>
									<span className="font-medium">Type:</span>{" "}
									{searchResults.Output.Property.PropertyDetails.PropertyType}
								</div>
							)}
							{searchResults.Output?.Property?.PropertyDetails?.LandUse && (
								<div>
									<span className="font-medium">Land Use:</span> {searchResults.Output.Property.PropertyDetails.LandUse}
								</div>
							)}
							{searchResults.Output?.Property?.PropertyDetails?.Occupancy && (
								<div>
									<span className="font-medium">Occupancy:</span>{" "}
									{searchResults.Output.Property.PropertyDetails.Occupancy}
								</div>
							)}
							{searchResults.Output?.Property?.PropertySize?.LivingSqFt && (
								<div>
									<span className="font-medium">Living SqFt:</span>{" "}
									{searchResults.Output.Property.PropertySize.LivingSqFt}
								</div>
							)}
							{searchResults.Output?.Property?.PropertySize?.AreaLotSF && (
								<div>
									<span className="font-medium">Lot Size:</span> {searchResults.Output.Property.PropertySize.AreaLotSF}{" "}
									sqft
								</div>
							)}
							{searchResults.Output?.Property?.PropertySize?.AreaLotAcres && (
								<div>
									<span className="font-medium">Lot Size (Acres):</span>{" "}
									{searchResults.Output.Property.PropertySize.AreaLotAcres} acres
								</div>
							)}
							{searchResults.Output?.Property?.IntRoomInfo?.BedroomsCount && (
								<div>
									<span className="font-medium">Bedrooms:</span>{" "}
									{searchResults.Output.Property.IntRoomInfo.BedroomsCount}
								</div>
							)}
							{searchResults.Output?.Property?.IntRoomInfo?.BathCount && (
								<div>
									<span className="font-medium">Bathrooms:</span> {searchResults.Output.Property.IntRoomInfo.BathCount}
								</div>
							)}
							{searchResults.Output?.Property?.IntRoomInfo?.RoomsCount && (
								<div>
									<span className="font-medium">Total Rooms:</span>{" "}
									{searchResults.Output.Property.IntRoomInfo.RoomsCount}
								</div>
							)}
							{searchResults.Output?.Property?.Pool?.Pool && (
								<div>
									<span className="font-medium">Pool:</span>{" "}
									{searchResults.Output.Property.Pool.Pool === "Y" ? "Yes" : "No"}
								</div>
							)}
							{searchResults.Output?.Property?.PropertySize?.ParkingGarage && (
								<div>
									<span className="font-medium">Garage:</span>{" "}
									{searchResults.Output.Property.PropertySize.ParkingGarage === "Y" ? "Yes" : "No"}
								</div>
							)}
							{searchResults.Output?.Property?.PropertySize?.ParkingType && (
								<div>
									<span className="font-medium">Parking Type:</span>{" "}
									{searchResults.Output.Property.PropertySize.ParkingType}
								</div>
							)}
							{searchResults.Output?.Property?.Utilities?.Energy && (
								<div>
									<span className="font-medium">Energy:</span> {searchResults.Output.Property.Utilities.Energy}
								</div>
							)}
							{searchResults.Output?.Property?.Utilities?.Fuel && (
								<div>
									<span className="font-medium">Fuel:</span> {searchResults.Output.Property.Utilities.Fuel}
								</div>
							)}
						</CardContent>
					</Card>

					<Card className="border shadow-sm">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<User className="h-5 w-5 text-primary" />
								Owner & Demographics
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2 text-sm">
							{searchResults.Output?.Demographics?.Names?.map((n: any, i: number) => (
								<div key={i}>
									<span className="font-medium">Name:</span> {n.FullName}{" "}
									{n.LastSeen && <span className="text-muted-foreground">(Last Seen: {n.LastSeen})</span>}
								</div>
							))}
							{searchResults.Output?.Property?.PrimaryOwner?.Name1Full && (
								<div>
									<span className="font-medium">Primary Owner:</span>{" "}
									{searchResults.Output.Property.PrimaryOwner.Name1Full}
								</div>
							)}
							{searchResults.Output?.Property?.PrimaryOwner?.Name2Full && (
								<div>
									<span className="font-medium">Co-Owner:</span> {searchResults.Output.Property.PrimaryOwner.Name2Full}
								</div>
							)}
							{searchResults.Output?.Property?.PrimaryOwner?.Type && (
								<div>
									<span className="font-medium">Owner Type:</span> {searchResults.Output.Property.PrimaryOwner.Type}
								</div>
							)}
							{searchResults.Output?.Property?.PrimaryOwner?.CompanyFlag && (
								<div>
									<span className="font-medium">Company Owned:</span>{" "}
									{searchResults.Output.Property.PrimaryOwner.CompanyFlag === "Y" ? "Yes" : "No"}
								</div>
							)}
							{searchResults.Output?.Demographics?.Gender && (
								<div>
									<span className="font-medium">Gender:</span> {searchResults.Output.Demographics.Gender}
								</div>
							)}
							{searchResults.Output?.Demographics?.Age && (
								<div>
									<span className="font-medium">Age:</span> {searchResults.Output.Demographics.Age}
								</div>
							)}
							{searchResults.Output?.Demographics?.Dob && (
								<div>
									<span className="font-medium">DOB:</span> {searchResults.Output.Demographics.Dob}
								</div>
							)}
							{searchResults.Output?.Demographics?.Jobs?.length > 0 && (
								<div>
									<span className="font-medium">Occupation:</span>{" "}
									{searchResults.Output.Demographics.Jobs.map((j: any) => j.Display).join(", ")}
								</div>
							)}
							{searchResults.Output?.Demographics?.Deceased && (
								<div>
									<Badge variant="destructive">Deceased</Badge>
								</div>
							)}
						</CardContent>
					</Card>

					<Card className="border shadow-sm">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Phone className="h-5 w-5 text-primary" />
								Contact Info
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2 text-sm">
							{searchResults.Output?.Identity?.Phones?.length > 0 ? (
								searchResults.Output.Identity.Phones.map((p: any, i: number) => (
									<div key={i}>
										<span className="font-medium">Phone:</span> {p.PhoneDisplay || p.Phone}{" "}
										{p.DoNotCall && (
											<Badge variant="destructive" className="ml-2">
												DNC
											</Badge>
										)}
										{p.PhoneType && <span className="text-muted-foreground">({p.PhoneType})</span>}
									</div>
								))
							) : (
								<div className="text-muted-foreground">No phone numbers available</div>
							)}
							{searchResults.Output?.Identity?.Emails?.length > 0 ? (
								searchResults.Output.Identity.Emails.map((e: any, i: number) => (
									<div key={i}>
										<span className="font-medium">Email:</span> {e.Email}{" "}
										{e.EmailType && <span className="text-muted-foreground">({e.EmailType})</span>}
									</div>
								))
							) : (
								<div className="text-muted-foreground">No email addresses available</div>
							)}
						</CardContent>
					</Card>

					<Card className="border shadow-sm">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<MapPin className="h-5 w-5 text-primary" />
								Address History
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2 text-sm">
							{searchResults.Output?.Identity?.AddressHistory?.length > 0 ? (
								searchResults.Output.Identity.AddressHistory.map((a: any, i: number) => (
									<div key={i}>
										{a.FullAddress}{" "}
										{a.LastSeen && <span className="text-muted-foreground">(Last Seen: {a.LastSeen})</span>}
									</div>
								))
							) : (
								<div className="text-muted-foreground">No previous addresses found</div>
							)}
						</CardContent>
					</Card>

					<Card className="border shadow-sm">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<DollarSign className="h-5 w-5 text-primary" />
								Financial & Deed Info
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2 text-sm">
							{searchResults.Output?.Property?.EstimatedValue?.EstimatedValue && (
								<div>
									<span className="font-medium">Estimated Value:</span>{" "}
									<Badge variant="outline">
										${Number(searchResults.Output.Property.EstimatedValue.EstimatedValue).toLocaleString()}
									</Badge>
								</div>
							)}
							{searchResults.Output?.Property?.EstimatedValue?.EstimatedMinValue && (
								<div>
									<span className="font-medium">Estimated Min Value:</span> $
									{Number(searchResults.Output.Property.EstimatedValue.EstimatedMinValue).toLocaleString()}
								</div>
							)}
							{searchResults.Output?.Property?.EstimatedValue?.EstimatedMaxValue && (
								<div>
									<span className="font-medium">Estimated Max Value:</span> $
									{Number(searchResults.Output.Property.EstimatedValue.EstimatedMaxValue).toLocaleString()}
								</div>
							)}
							{searchResults.Output?.Property?.CurrentDeed?.LenderName && (
								<div>
									<span className="font-medium">Lender:</span> {searchResults.Output.Property.CurrentDeed.LenderName}
								</div>
							)}
							{searchResults.Output?.Property?.CurrentDeed?.MortgageAmount && (
								<div>
									<span className="font-medium">Mortgage Amount:</span> $
									{Number(searchResults.Output.Property.CurrentDeed.MortgageAmount).toLocaleString()}
								</div>
							)}
							{searchResults.Output?.Property?.CurrentDeed?.MortgageDate && (
								<div>
									<span className="font-medium">Mortgage Date:</span>{" "}
									{new Date(searchResults.Output.Property.CurrentDeed.MortgageDate).toLocaleDateString()}
								</div>
							)}
							{searchResults.Output?.Property?.CurrentDeed?.MortgageDueDate && (
								<div>
									<span className="font-medium">Mortgage Due:</span>{" "}
									{new Date(searchResults.Output.Property.CurrentDeed.MortgageDueDate).toLocaleDateString()}
								</div>
							)}
							{searchResults.Output?.Property?.CurrentDeed?.MortgageLoanTypeCode && (
								<div>
									<span className="font-medium">Mortgage Type:</span>{" "}
									{searchResults.Output.Property.CurrentDeed.MortgageLoanTypeCode}
								</div>
							)}
							{searchResults.Output?.Property?.CurrentDeed?.MortgageTerm && (
								<div>
									<span className="font-medium">Mortgage Term:</span>{" "}
									{searchResults.Output.Property.CurrentDeed.MortgageTerm}{" "}
									{searchResults.Output.Property.CurrentDeed.MortgageTermCode}
								</div>
							)}
							{searchResults.Output?.Property?.CurrentDeed?.EquityPercentage && (
								<div>
									<span className="font-medium">Equity %:</span>{" "}
									{searchResults.Output.Property.CurrentDeed.EquityPercentage}%
								</div>
							)}
							{searchResults.Output?.Property?.CurrentDeed?.LoanToValue && (
								<div>
									<span className="font-medium">Loan to Value:</span>{" "}
									{searchResults.Output.Property.CurrentDeed.LoanToValue}%
								</div>
							)}
							{searchResults.Output?.Property?.Tax?.TaxBilledAmount && (
								<div>
									<span className="font-medium">Tax Billed:</span> $
									{Number(searchResults.Output.Property.Tax.TaxBilledAmount).toLocaleString()}
								</div>
							)}
							{searchResults.Output?.Property?.Tax?.TaxFiscalYear && (
								<div>
									<span className="font-medium">Tax Year:</span> {searchResults.Output.Property.Tax.TaxFiscalYear}
								</div>
							)}
							{searchResults.Output?.Property?.Tax?.AssessedValueTotal && (
								<div>
									<span className="font-medium">Assessed Value Total:</span> $
									{Number(searchResults.Output.Property.Tax.AssessedValueTotal).toLocaleString()}
								</div>
							)}
							{searchResults.Output?.Property?.Tax?.MarketValueTotal && (
								<div>
									<span className="font-medium">Market Value Total:</span> $
									{Number(searchResults.Output.Property.Tax.MarketValueTotal).toLocaleString()}
								</div>
							)}
						</CardContent>
					</Card>

					<Card className="border shadow-sm">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Calendar className="h-5 w-5 text-primary" />
								Sale Information
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2 text-sm">
							{searchResults.Output?.Property?.SaleInfo?.AssessorLastSaleDate && (
								<div>
									<span className="font-medium">Last Sale Date:</span>{" "}
									{new Date(searchResults.Output.Property.SaleInfo.AssessorLastSaleDate).toLocaleDateString()}
								</div>
							)}
							{searchResults.Output?.Property?.SaleInfo?.AssessorLastSaleAmount && (
								<div>
									<span className="font-medium">Last Sale Amount:</span> $
									{Number(searchResults.Output.Property.SaleInfo.AssessorLastSaleAmount).toLocaleString()}
								</div>
							)}
							{searchResults.Output?.Property?.SaleInfo?.AssessorPriorSaleDate && (
								<div>
									<span className="font-medium">Prior Sale Date:</span>{" "}
									{new Date(searchResults.Output.Property.SaleInfo.AssessorPriorSaleDate).toLocaleDateString()}
								</div>
							)}
							{searchResults.Output?.Property?.SaleInfo?.AssessorPriorSaleAmount && (
								<div>
									<span className="font-medium">Prior Sale Amount:</span> $
									{Number(searchResults.Output.Property.SaleInfo.AssessorPriorSaleAmount).toLocaleString()}
								</div>
							)}
							{searchResults.Output?.Property?.SaleInfo?.AssessorSellerName && (
								<div>
									<span className="font-medium">Seller Name:</span>{" "}
									{searchResults.Output.Property.SaleInfo.AssessorSellerName}
								</div>
							)}
							{searchResults.Output?.Property?.SaleInfo?.LastSaleType && (
								<div>
									<span className="font-medium">Last Sale Type:</span>{" "}
									{searchResults.Output.Property.SaleInfo.LastSaleType}
								</div>
							)}
							{searchResults.Output?.Property?.SaleInfo?.PreviousSaleType && (
								<div>
									<span className="font-medium">Previous Sale Type:</span>{" "}
									{searchResults.Output.Property.SaleInfo.PreviousSaleType}
								</div>
							)}
						</CardContent>
					</Card>

					<Card className="border shadow-sm">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<FileText className="h-5 w-5 text-primary" />
								Parcel & Legal Info
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2 text-sm">
							{searchResults.Output?.Property?.Parcel?.FormattedAPN && (
								<div>
									<span className="font-medium">APN:</span> {searchResults.Output.Property.Parcel.FormattedAPN}
								</div>
							)}
							{searchResults.Output?.Property?.Parcel?.CensusTract && (
								<div>
									<span className="font-medium">Census Tract:</span> {searchResults.Output.Property.Parcel.CensusTract}
								</div>
							)}
							{searchResults.Output?.Property?.Legal?.Description && (
								<div>
									<span className="font-medium">Legal Description:</span>{" "}
									{searchResults.Output.Property.Legal.Description}
								</div>
							)}
							{searchResults.Output?.Property?.Legal?.TractNumber && (
								<div>
									<span className="font-medium">Tract Number:</span> {searchResults.Output.Property.Legal.TractNumber}
								</div>
							)}
						</CardContent>
					</Card>

					<Card className="border shadow-sm">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Activity className="h-5 w-5 text-primary" />
								Stats
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2 text-sm">
							{searchResults.Output?.Stats && (
								<div className="flex flex-wrap gap-2">
									{Object.entries(searchResults.Output.Stats).map(([k, v]) => (
										<div key={k}>
											<span className="font-medium">{k}:</span> {String(v)}
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	)
}
