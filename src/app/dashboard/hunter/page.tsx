"use client"

import { useState, useCallback, useEffect } from "react"
import {
	Search,
	ArrowLeft,
	AlertTriangle,
	Loader2,
	User,
	Building2,
	Mail,
	MapPin,
	Globe,
	Briefcase,
	Clock,
	Info,
	Share2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import {} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

type SearchType = "people" | "companies"

type SearchResponse = {
	success: boolean
	data: any
	error?: string
}

const searchTypes: {
	value: SearchType
	label: string
	icon: React.ReactNode
}[] = [
	{
		value: "people",
		label: "Email",
		icon: <Mail className="h-4 w-4" />,
	},
	{
		value: "companies",
		label: "Company Domain",
		icon: <Building2 className="h-4 w-4" />,
	},
]
const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
	<div className="flex flex-col space-y-1">
		<span className="text-sm text-muted-foreground">{label}</span>
		<span className="font-medium">{value || "N/A"}</span>
	</div>
)

const PersonCard = ({ data }: { data: any }) => (
	<div className="space-y-6">
		<Card>
			<CardHeader>
				<div className="flex items-start gap-4">
					<div className="flex-shrink-0">
						{data.avatar ? (
							<img src={data.avatar} alt="Avatar" className="h-16 w-16 rounded-full" />
						) : (
							<div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
								<User className="h-8 w-8 text-muted-foreground" />
							</div>
						)}
					</div>
					<div className="space-y-2">
						<h2 className="text-2xl font-semibold">
							{data.name.fullName || `${data.name.givenName || ""} ${data.name.familyName || ""}`.trim()}
						</h2>
						<div className="flex items-center gap-2 text-muted-foreground">
							<Mail className="h-4 w-4" />
							<span>{data.email}</span>
						</div>
						{data.location && (
							<div className="flex items-center gap-2 text-muted-foreground">
								<MapPin className="h-4 w-4" />
								<span>{data.location}</span>
							</div>
						)}
					</div>
				</div>
			</CardHeader>
			<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<DetailItem label="Phone" value={data.phone} />
				<DetailItem label="Time Zone" value={data.timeZone} />
				<DetailItem label="UTC Offset" value={`UTC ${data.utcOffset >= 0 ? "+" : ""}${data.utcOffset}`} />
				<DetailItem label="Email Provider" value={data.emailProvider} />
			</CardContent>
		</Card>

		{data.employment && (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Briefcase className="h-5 w-5" />
						Employment Details
					</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<DetailItem label="Company" value={data.employment.name} />
					<DetailItem label="Title" value={data.employment.title} />
					<DetailItem label="Domain" value={data.employment.domain} />
					<DetailItem label="Role" value={data.employment.role} />
				</CardContent>
			</Card>
		)}

		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Share2 className="h-5 w-5" />
					Social Profiles
				</CardTitle>
			</CardHeader>
			<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<DetailItem
					label="Twitter"
					value={
						data.twitter?.handle ? (
							<a
								href={`https://twitter.com/${data.twitter.handle}`}
								className="text-primary hover:underline"
								target="_blank"
								rel="noopener noreferrer"
							>
								@{data.twitter.handle}
							</a>
						) : (
							"N/A"
						)
					}
				/>
				<DetailItem
					label="LinkedIn"
					value={
						data.linkedin?.handle ? (
							<a
								href={`https://linkedin.com/in/${data.linkedin.handle}`}
								className="text-primary hover:underline"
								target="_blank"
								rel="noopener noreferrer"
							>
								View Profile
							</a>
						) : (
							"N/A"
						)
					}
				/>
				<DetailItem label="GitHub" value={data.github?.handle || "N/A"} />
				<DetailItem label="Facebook" value={data.facebook?.handle || "N/A"} />
			</CardContent>
		</Card>
	</div>
)
const CompanyCard = ({ data }: { data: any }) => (
	<div className="space-y-6">
		<Card>
			<CardHeader>
				<div className="flex items-start gap-4">
					{data.logo && <img src={data.logo} alt="Company Logo" className="h-16 w-16 rounded-lg object-contain" />}
					<div className="space-y-2">
						{/* Corrected line: Handle object or string name */}
						<h2 className="text-2xl font-semibold">{data.name?.fullName || data.name || "N/A"}</h2>
						{/* Rest of the CompanyCard remains the same */}
						<div className="flex items-center gap-2 text-muted-foreground">
							<Globe className="h-4 w-4" />
							<a href={`https://${data.domain}`} className="hover:underline" target="_blank" rel="noopener noreferrer">
								{data.domain}
							</a>
						</div>
						{data.foundedYear && (
							<div className="flex items-center gap-2 text-muted-foreground">
								<Clock className="h-4 w-4" />
								<span>Founded {data.foundedYear}</span>
							</div>
						)}
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{data.description && <p className="text-muted-foreground">{data.description}</p>}
				{data.tags?.length > 0 && (
					<div className="flex flex-wrap gap-2">
						{data.tags.map((tag: string) => (
							<Badge key={tag} variant="outline">
								{tag}
							</Badge>
						))}
					</div>
				)}
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<MapPin className="h-5 w-5" />
					Location
				</CardTitle>
			</CardHeader>
			<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<DetailItem label="City" value={data.geo?.city} />
				<DetailItem label="State" value={data.geo?.state} />
				<DetailItem label="Country" value={data.geo?.country} />
				<DetailItem
					label="Coordinates"
					value={data.geo?.lat && data.geo?.lng ? `${data.geo.lat}, ${data.geo.lng}` : "N/A"}
				/>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Briefcase className="h-5 w-5" />
					Company Details
				</CardTitle>
			</CardHeader>
			<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<DetailItem label="Industry" value={data.category?.industry} />
				<DetailItem label="Sector" value={data.category?.sector} />
				<DetailItem label="Employees" value={data.metrics?.employees} />
				<DetailItem label="Type" value={data.type} />
				<DetailItem label="Phone" value={data.phone} />
				<DetailItem
					label="Tech Stack"
					value={
						data.tech?.length > 0 ? (
							<div className="flex flex-wrap gap-2">
								{data.tech.map((tech: string) => (
									<Badge key={tech} variant="outline">
										{tech}
									</Badge>
								))}
							</div>
						) : (
							"N/A"
						)
					}
				/>
			</CardContent>
		</Card>
	</div>
)

export default function HunterSearch() {
	const [isSearching, setIsSearching] = useState(false)
	const [searchType, setSearchType] = useState<SearchType>("people")
	const [query, setQuery] = useState("")
	const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
	const [error, setError] = useState<string | null>(null)
	useEffect(() => {
		setSearchResults(null)
		setQuery("")
		setError(null)
	}, [searchType])
	const handleSearch = useCallback(async () => {
		if (!query.trim()) {
			setError("Please enter a search query")
			return
		}

		setIsSearching(true)
		setError(null)
		setSearchResults(null)

		try {
			const response = await fetch("/api/hunter", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					type: searchType,
					[searchType === "people" ? "email" : "domain"]: query,
				}),
			})

			const data: SearchResponse = await response.json()

			if (!response.ok) {
				throw new Error(data.error || "An error occurred during the search")
			}

			setSearchResults(data)
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
	}, [query, searchType])

	const renderSearchForm = () => {
		return (
			<div className="flex w-full items-center space-x-2">
				<div className="relative flex-1">
					<Input
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder={`Enter ${searchType === "people" ? "email" : "domain"}...`}
						className="pr-10"
					/>
					{searchType === "people" && (
						<div className="text-xs text-muted-foreground mt-1 ml-1">
							Note: Search works best with professional email addresses (e.g., example@google.com)
						</div>
					)}
					<Button
						className="absolute right-0 top-0 h-full rounded-l-none"
						onClick={handleSearch}
						disabled={isSearching}
					>
						{isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
					</Button>
				</div>
			</div>
		)
	}

	const renderResultContent = () => {
		if (!searchResults?.data) return null

		return (
			<div className="space-y-6">
				{searchType === "people" ? <PersonCard data={searchResults.data} /> : <CompanyCard data={searchResults.data} />}

				{/* Additional Details Card */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Info className="h-5 w-5" />
							Additional Technical Details
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
							<DetailItem label="Indexed At" value={searchResults.data.indexedAt} />
							<DetailItem label="UTCOffset" value={searchResults.data.utcOffset} />
							<DetailItem label="Email Provider" value={searchResults.data.emailProvider} />
							<DetailItem label="Data Source" value="Hunter.io" />
						</div>
					</CardContent>
				</Card>
			</div>
		)
	}

	return (
		<div className="container mx-auto py-8 px-4 space-y-8">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-3xl font-bold tracking-tight">Hunter Search</h1>
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
						Search by {searchTypes.find((st) => st.value === searchType)?.label}
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
									onClick={() => setSearchType(type.value)}
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
									{error.toLowerCase().includes("subscription") ? "Subscription Required" : "No Results Found"}
								</AlertTitle>
								<AlertDescription className="text-sm text-muted-foreground mt-1">
									{error.toLowerCase().includes("subscription")
										? "You need an active subscription to access this feature. Purchase a subscription to continue using Hunter."
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

			{searchResults?.success && renderResultContent()}
		</div>
	)
}
