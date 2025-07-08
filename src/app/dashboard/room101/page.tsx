"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
	Search,
	ArrowLeft,
	User,
	Loader2,
	AlertTriangle,
	FileText,
	MapPin,
	Briefcase,
	Heart,
	DollarSign,
	Calendar,
	Globe,
	UserCheck,
	Brain,
	Tag,
	Radar,
	Shield,
	Minus,
} from "lucide-react"

type UseCase = "law_enforcement" | "none"

type SearchParams = {
	query: string
	use_case: UseCase
}

type Room101Response = {
	username: string
	age?: string
	sex?: string
	location?: string
	country?: string
	occupation?: string
	relationship?: string
	income_level?: string
	interests?: string[]
	brand_mentions?: string[]
	life_stage?: string
	personality?: string
	sources?: Record<string, any>
}

type SearchResponse = {
	success: boolean
	data?: Room101Response
	error?: string
}

const useCases: {
	value: UseCase
	label: string
	description: string
	icon: React.ReactNode
}[] = [
	{
		value: "law_enforcement",
		label: "Law Enforcement",
		description: "Detailed investigation profile",
		icon: <Shield className="h-4 w-4" />,
	},
	{
		value: "none",
		label: "Standard",
		description: "Basic profile analysis",
		icon: <Minus className="h-4 w-4" />,
	},
]

export default function Room101Page() {
	const [searchParams, setSearchParams] = useState<SearchParams>({
		query: "",
		use_case: "law_enforcement",
	})
	const [results, setResults] = useState<Room101Response | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleSearch = useCallback(async () => {
		if (!searchParams.query.trim()) return

		setIsLoading(true)
		setError(null)
		setResults(null)

		try {
			const requestBody: any = { query: searchParams.query }
			if (searchParams.use_case !== "none") {
				requestBody.use_case = searchParams.use_case
			}

			const response = await fetch("/api/room101", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestBody),
			})

			const data: SearchResponse = await response.json()

			if (data.success && data.data) {
				setResults(data.data)
			} else {
				setError(data.error || "An error occurred during the search")
			}
		} catch (err) {
			setError("Network error occurred")
			console.error("Search error:", err)
		} finally {
			setIsLoading(false)
		}
	}, [searchParams])

	const handleInputChange = useCallback((field: keyof SearchParams, value: string) => {
		setSearchParams((prev) => ({ ...prev, [field]: value }))
	}, [])

	const handleKeyPress = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter") {
				handleSearch()
			}
		},
		[handleSearch],
	)

	const hasResults = results !== null

	const formatFieldValue = (value: string | undefined): string => {
		if (!value || value === "X") return "Not available"
		return value
	}

	const ProfileField = ({
		icon,
		label,
		value,
		className = "",
	}: {
		icon: React.ReactNode
		label: string
		value: string | undefined
		className?: string
	}) => (
		<div className={`flex items-center gap-3 p-3 rounded-lg bg-muted/50 ${className}`}>
			<div className="text-rose-400">{icon}</div>
			<div className="flex-1">
				<div className="text-sm text-muted-foreground">{label}</div>
				<div className="font-medium">{formatFieldValue(value)}</div>
			</div>
		</div>
	)

	return (
		<div className="container mx-auto py-6 px-4 space-y-6">
			<div className="flex items-center gap-4 mb-6">
				<Link
					href="/dashboard"
					className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to Dashboard
				</Link>
			</div>

			<div className="flex items-center gap-3 mb-6">
				<div className="p-2 bg-rose-500/20 rounded-lg">
					<Radar className="h-6 w-6 text-rose-400" />
				</div>
				<div>
					<h1 className="text-2xl font-bold">Room101</h1>
					<p className="text-muted-foreground">Reddit users profiling and behavioral analysis</p>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Search className="h-5 w-5" />
						Profile Search
					</CardTitle>
					<CardDescription>Analyze Reddit usernames for demographic and behavioral insights</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="md:col-span-2">
							<Input
								placeholder="Enter username to analyze..."
								value={searchParams.query}
								onChange={(e) => handleInputChange("query", e.target.value)}
								onKeyPress={handleKeyPress}
								className="w-full"
							/>
						</div>
						<Select
							value={searchParams.use_case}
							onValueChange={(value: UseCase) => handleInputChange("use_case", value)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select analysis type" />
							</SelectTrigger>
							<SelectContent>
								{useCases.map((useCase) => (
									<SelectItem key={useCase.value} value={useCase.value}>
										<div className="flex items-center gap-2">
											<div className="text-rose-400">{useCase.icon}</div>
											<span className="font-medium">{useCase.label}</span>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<Button onClick={handleSearch} disabled={isLoading || !searchParams.query.trim()} className="w-full">
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Analyzing Profile...
							</>
						) : (
							<>
								<Search className="mr-2 h-4 w-4" />
								Analyze Username
							</>
						)}
					</Button>
				</CardContent>
			</Card>

			{error && (
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertTitle>Search Error</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{hasResults && results && (
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<User className="h-5 w-5" />
								Profile Analysis: {results.username}
							</CardTitle>
							<CardDescription>Comprehensive behavioral and demographic profile</CardDescription>
						</CardHeader>
						<CardContent>
							<Tabs defaultValue="demographics" className="w-full">
								<TabsList className="grid w-full grid-cols-4">
									<TabsTrigger value="demographics">Demographics</TabsTrigger>
									<TabsTrigger value="interests">Interests</TabsTrigger>
									<TabsTrigger value="behavior">Behavior</TabsTrigger>
									<TabsTrigger value="raw">Raw Data</TabsTrigger>
								</TabsList>

								<TabsContent value="demographics" className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<ProfileField icon={<Calendar className="h-4 w-4" />} label="Age Range" value={results.age} />
										<ProfileField icon={<UserCheck className="h-4 w-4" />} label="Gender" value={results.sex} />
										<ProfileField icon={<MapPin className="h-4 w-4" />} label="Location" value={results.location} />
										<ProfileField icon={<Globe className="h-4 w-4" />} label="Country" value={results.country} />
										<ProfileField
											icon={<Briefcase className="h-4 w-4" />}
											label="Occupation"
											value={results.occupation}
										/>
										<ProfileField
											icon={<Heart className="h-4 w-4" />}
											label="Relationship Status"
											value={results.relationship}
										/>
										<ProfileField
											icon={<DollarSign className="h-4 w-4" />}
											label="Income Level"
											value={results.income_level}
										/>
										<ProfileField icon={<User className="h-4 w-4" />} label="Life Stage" value={results.life_stage} />
									</div>
								</TabsContent>

								<TabsContent value="interests" className="space-y-4">
									<div className="space-y-4">
										{results.interests && results.interests.length > 0 && (
											<div>
												<h4 className="font-medium mb-2 flex items-center gap-2">
													<Tag className="h-4 w-4 text-rose-400" />
													Interests
												</h4>
												<div className="flex flex-wrap gap-2">
													{results.interests.map((interest, index) => (
														<Badge key={index} variant="secondary">
															{interest}
														</Badge>
													))}
												</div>
											</div>
										)}

										{results.brand_mentions && results.brand_mentions.length > 0 && (
											<div>
												<h4 className="font-medium mb-2 flex items-center gap-2">
													<Tag className="h-4 w-4 text-rose-400" />
													Brand Mentions
												</h4>
												<div className="flex flex-wrap gap-2">
													{results.brand_mentions.map((brand, index) => (
														<Badge key={index} variant="outline">
															{brand}
														</Badge>
													))}
												</div>
											</div>
										)}
									</div>
								</TabsContent>

								<TabsContent value="behavior" className="space-y-4">
									<ProfileField
										icon={<Brain className="h-4 w-4" />}
										label="Personality Profile"
										value={results.personality}
										className="md:col-span-2"
									/>
								</TabsContent>

								<TabsContent value="raw" className="space-y-4">
									<Card>
										<CardHeader>
											<CardTitle className="flex items-center gap-2">
												<FileText className="h-4 w-4" />
												Raw API Response
											</CardTitle>
										</CardHeader>
										<CardContent>
											<pre className="text-sm bg-muted/50 p-4 rounded-lg overflow-auto">
												{JSON.stringify(results, null, 2)}
											</pre>
										</CardContent>
									</Card>
								</TabsContent>
							</Tabs>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	)
}
