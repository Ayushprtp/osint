"use client"

import { useState, useCallback } from "react"
import {
	PhoneIcon,
	Search,
	AlertTriangle,
	ArrowLeft,
	Loader2,
	Building,
	MapPin,
	Globe,
	Users,
	ExternalLink,
	CheckCircle,
	User,
	MessageSquare,
	Clock3,
	AlertCircle,
	Download,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import type { CallerAPIResponse } from "@/services/callerapi/types"

type SearchResponse = {
	success: boolean
	data: CallerAPIResponse
	error?: string
}

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
	<div className="flex justify-between items-center py-2">
		<span className="text-muted-foreground">{label}</span>
		<span className="font-medium">{value || "N/A"}</span>
	</div>
)

export default function CallerAPIPage() {
	const [isSearching, setIsSearching] = useState(false)
	const [phone, setPhone] = useState("")
	const [results, setResults] = useState<CallerAPIResponse | null>(null)
	const [error, setError] = useState<string | null>(null)

	const handleSearch = useCallback(async () => {
		if (!phone.trim()) {
			setError("Please enter a phone number")
			return
		}

		setIsSearching(true)
		setError(null)
		setResults(null)

		try {
			const response = await fetch("/api/callerapi", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					phone: phone.trim(),
				}),
			})

			const data: SearchResponse = await response.json()

			if (!response.ok || !data.success) {
				throw new Error(data.error || "An error occurred during the search")
			}

			setResults(data.data)
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
	}, [phone])

	const handleExportJSON = useCallback(() => {
		if (!results) return

		const jsonString = JSON.stringify(results, null, 2)
		const blob = new Blob([jsonString], { type: "application/json" })
		const url = URL.createObjectURL(blob)

		const a = document.createElement("a")
		a.href = url
		a.download = `callerapi_${phone.replace(/[^\d+]/g, "")}.json`
		document.body.appendChild(a)
		a.click()

		document.body.removeChild(a)
		URL.revokeObjectURL(url)
	}, [results, phone])

	const renderSearchForm = () => {
		return (
			<div className="flex w-full items-center space-x-2">
				<div className="relative flex-1">
					<Input
						type="text"
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						placeholder="Enter phone number (e.g., +18006927753)"
						className="pr-10"
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
		)
	}

	const renderResults = () => {
		if (!results) return null

		return (
			<div className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<PhoneIcon className="h-5 w-5" />
							Phone Information
						</CardTitle>
						<CardDescription>Details about {results.truecaller.number}</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-4">
								<div>
									<h3 className="text-sm font-medium">Basic Information</h3>
									<Separator className="my-2" />
									<div className="space-y-2">
										<DetailItem label="Number" value={results.truecaller.number} />
										<DetailItem label="Country" value={results.truecaller.country} />
										<DetailItem label="Type" value={results.truecaller.number_type_label} />
										<DetailItem label="Provider" value={results.truecaller.provider || "Unknown"} />
									</div>
								</div>
							</div>

							<div className="space-y-4">
								<div>
									<h3 className="text-sm font-medium">Reputation</h3>
									<Separator className="my-2" />
									<div className="space-y-2">
										<DetailItem
											label="Name"
											value={
												results.hiya.name ||
												results.callerapi.name ||
												results.callapp.name ||
												results.eyecon ||
												"Unknown"
											}
										/>
										<DetailItem label="Type" value={results.hiya.type || "Unknown"} />
										<DetailItem label="Category" value={results.hiya.category || "Unknown"} />
										<DetailItem
											label="Spam Status"
											value={
												results.callerapi.is_spam || results.hiya.is_spam ? (
													<Badge variant="destructive" className="flex items-center gap-1">
														<AlertTriangle className="h-3 w-3" />
														Spam
													</Badge>
												) : (
													<Badge variant="outline" className="flex items-center gap-1">
														<CheckCircle className="h-3 w-3" />
														Not Spam
													</Badge>
												)
											}
										/>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{(results.callapp.name || results.callapp.description) && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Building className="h-5 w-5" />
								Business Information
							</CardTitle>
							<CardDescription>Details about the business associated with this number</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-6">
								{results.callapp.name && (
									<div>
										<h3 className="font-medium">{results.callapp.name}</h3>
										{results.callapp.description && (
											<p className="mt-1 text-muted-foreground">{results.callapp.description}</p>
										)}
									</div>
								)}

								<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
									{results.callapp.categories && results.callapp.categories.length > 0 && (
										<div>
											<h4 className="text-sm font-medium">Categories</h4>
											<div className="mt-2 flex flex-wrap gap-2">
												{results.callapp.categories.map((category, index) => (
													<Badge key={index} variant="secondary">
														{category.name}
													</Badge>
												))}
											</div>
										</div>
									)}

									{results.callapp.addresses && results.callapp.addresses.length > 0 && (
										<div>
											<h4 className="text-sm font-medium">Addresses</h4>
											<div className="mt-2 space-y-2">
												{results.callapp.addresses.map((address, index) => (
													<div key={index} className="flex items-start gap-2">
														<MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
														<span>{address.street}</span>
													</div>
												))}
											</div>
										</div>
									)}
								</div>

								{results.callapp.websites && results.callapp.websites.length > 0 && (
									<div>
										<h4 className="text-sm font-medium">Websites</h4>
										<div className="mt-2 space-y-2">
											{results.callapp.websites.map((website, index) => (
												<div key={index} className="flex items-center gap-2">
													<Globe className="h-4 w-4" />
													<a
														href={website.websiteUrl}
														target="_blank"
														rel="noopener noreferrer"
														className="text-primary hover:underline"
													>
														{website.websiteUrl}
													</a>
												</div>
											))}
										</div>
									</div>
								)}

								{results.callapp.openingHours && Object.keys(results.callapp.openingHours).length > 0 && (
									<div>
										<h4 className="text-sm font-medium">Opening Hours</h4>
										<div className="mt-2 space-y-2">
											{Object.entries(results.callapp.openingHours).map(([day, hours]) => (
												<div key={day} className="flex justify-between">
													<span className="capitalize">{day}</span>
													<span>{hours.join(", ")}</span>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				)}

				<Tabs defaultValue="viewcaller">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="viewcaller">Community Names</TabsTrigger>
						<TabsTrigger value="reports">User Reports</TabsTrigger>
						<TabsTrigger value="social">Social Profiles</TabsTrigger>
					</TabsList>

					<TabsContent value="viewcaller" className="mt-4">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Users className="h-5 w-5" />
									Community-Sourced Names
								</CardTitle>
								<CardDescription>Names reported by community members</CardDescription>
							</CardHeader>
							<CardContent>
								{results.viewcaller && results.viewcaller.length > 0 ? (
									<div className="space-y-4">
										{results.viewcaller.map((entry, index) => (
											<div key={index} className="rounded-lg border p-4">
												<div className="flex items-center justify-between">
													<h3 className="font-medium">{entry.name}</h3>
													{entry.spam ? (
														<Badge variant="destructive" className="flex items-center gap-1">
															<AlertTriangle className="h-3 w-3" />
															Spam
														</Badge>
													) : (
														<Badge variant="outline" className="flex items-center gap-1">
															<CheckCircle className="h-3 w-3" />
															Not Spam
														</Badge>
													)}
												</div>

												{entry.names && entry.names.length > 0 && (
													<div className="mt-3">
														<h4 className="text-sm font-medium">Reported Names</h4>
														<div className="mt-2 space-y-2">
															{entry.names.map((name, idx) => (
																<div key={idx} className="flex items-center justify-between">
																	<span>{name.name}</span>
																	<div className="flex items-center gap-2">
																		<Badge variant="secondary">{name.occurrences} reports</Badge>
																		{name.isSpam && (
																			<Badge variant="destructive" className="flex items-center gap-1">
																				<AlertTriangle className="h-3 w-3" />
																				Spam
																			</Badge>
																		)}
																	</div>
																</div>
															))}
														</div>
													</div>
												)}
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-6 text-muted-foreground">
										No community-sourced names available for this number
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="reports" className="mt-4">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<MessageSquare className="h-5 w-5" />
									User Reports
								</CardTitle>
								<CardDescription>Comments and feedback from users about this phone number</CardDescription>
							</CardHeader>
							<CardContent>
								{results.hiya.comments?.reports && results.hiya.comments.reports.length > 0 ? (
									<div className="space-y-4">
										{results.hiya.comments.reports.map((report, index) => (
											<div key={index} className="rounded-lg border p-4">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<User className="h-4 w-4" />
														<span className="font-medium">Anonymous User</span>
													</div>
													<div className="flex items-center gap-2 text-muted-foreground">
														<Clock3 className="h-3 w-3" />
														<span className="text-xs">{new Date(report.timestamp).toLocaleDateString()}</span>
													</div>
												</div>
												<div className="mt-2">
													<p>{report.comment.str}</p>
												</div>
												<div className="mt-3 flex items-center gap-2">
													<Badge variant="outline">Category: {getCategoryLabel(report.category)}</Badge>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-6 text-muted-foreground">
										No user reports available for this number
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="social" className="mt-4">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Globe className="h-5 w-5" />
									Social Media Profiles
								</CardTitle>
								<CardDescription>Connected social media accounts</CardDescription>
							</CardHeader>
							<CardContent>
								{hasSocialProfiles(results.callapp) ? (
									<div className="space-y-4">
										{results.callapp.facebookID && (
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<span className="font-medium">Facebook</span>
												</div>
												<Button variant="outline" size="sm" asChild>
													<a
														href={`https://facebook.com/${results.callapp.facebookID.id}`}
														target="_blank"
														rel="noopener noreferrer"
														className="flex items-center gap-1"
													>
														<span>View Profile</span>
														<ExternalLink className="h-3 w-3" />
													</a>
												</Button>
											</div>
										)}

										{results.callapp.twitterScreenName && (
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<span className="font-medium">Twitter</span>
												</div>
												<Button variant="outline" size="sm" asChild>
													<a
														href={`https://twitter.com/${results.callapp.twitterScreenName.id}`}
														target="_blank"
														rel="noopener noreferrer"
														className="flex items-center gap-1"
													>
														<span>View Profile</span>
														<ExternalLink className="h-3 w-3" />
													</a>
												</Button>
											</div>
										)}

										{results.callapp.instagramID && (
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<span className="font-medium">Instagram</span>
												</div>
												<Button variant="outline" size="sm" asChild>
													<a
														href={`https://instagram.com/${results.callapp.instagramID.id}`}
														target="_blank"
														rel="noopener noreferrer"
														className="flex items-center gap-1"
													>
														<span>View Profile</span>
														<ExternalLink className="h-3 w-3" />
													</a>
												</Button>
											</div>
										)}

										{results.callapp.linkedinPubProfileUrl && (
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<span className="font-medium">LinkedIn</span>
												</div>
												<Button variant="outline" size="sm" asChild>
													<a
														href={results.callapp.linkedinPubProfileUrl.id}
														target="_blank"
														rel="noopener noreferrer"
														className="flex items-center gap-1"
													>
														<span>View Profile</span>
														<ExternalLink className="h-3 w-3" />
													</a>
												</Button>
											</div>
										)}
									</div>
								) : (
									<div className="text-center py-6 text-muted-foreground">
										No social media profiles found for this number
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		)
	}

	return (
		<div className="container mx-auto py-8 px-4 space-y-8">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-3xl font-bold tracking-tight">CallerAPI</h1>
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
						<span>Phone Number Lookup</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-4">
						{renderSearchForm()}

						{error && (
							<Alert variant="destructive">
								<AlertCircle className="h-4 w-4" />
								<AlertTitle>Error</AlertTitle>
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						{results && (
							<div className="flex justify-end">
								<Button variant="outline" size="sm" onClick={handleExportJSON} className="flex items-center gap-2">
									<Download className="h-4 w-4" />
									Export as JSON
								</Button>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{results && renderResults()}
		</div>
	)
}

function getCategoryLabel(category: number): string {
	switch (category) {
		case 1:
			return "Not Spam"
		case 2:
			return "General Spam"
		case 3:
			return "Debt Collector"
		case 4:
			return "Political"
		case 5:
			return "Nonprofit"
		case 6:
			return "Telemarketer"
		case 7:
			return "Survey"
		case 8:
			return "Fraud"
		case 10:
			return "Robocaller"
		default:
			return "Unknown"
	}
}

function hasSocialProfiles(callapp: any): boolean {
	return !!(
		callapp.facebookID ||
		callapp.linkedinPubProfileUrl ||
		callapp.twitterScreenName ||
		callapp.googlePlusID ||
		callapp.foursquareID ||
		callapp.instagramID ||
		callapp.pinterestID
	)
}
