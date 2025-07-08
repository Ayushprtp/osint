"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Search, Loader2, ArrowLeft, AlertTriangle, Phone, Mail, Shield, User, FileText, Globe } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

type QueryType = "aml" | "email" | "phone" | "ip"

interface SanctionListSource {
	source_name: string
	source_full_name: string
	source_version: string
}

interface CrimeListEntry {
	found: string
	id: number
	name: string
	scores: {
		relevancy_score: number
	}
	source: {
		source_name: string
		source_full_name: string
		source_version: string
	}
	attributes: Array<{
		key: string
		value: string
	}>
	warn_informations: Array<{
		description: string
		updated_at: string
	}>
}

interface AmlResultPayload {
	searched_at: string
	sanctionlist_sources: SanctionListSource[]
	watchlist_entries: unknown[]
	sanctionlist_entries: unknown[]
	crimelist_entries: CrimeListEntry[]
	pep_entries: unknown[]
}

interface AmlData {
	has_watchlist_match: boolean
	has_pep_match: boolean
	has_sanction_match: boolean
	has_crimelist_match: boolean
	result_payload: AmlResultPayload
}

interface IpDetails {
	ip?: string
	score?: number
	country?: string
	state_prov?: string
	city?: string
	timezone_offset?: string
	isp_name?: string
	latitude?: number
	longitude?: number
	type?: string
	open_ports?: number[]
	tor?: boolean
	harmful?: boolean
	vpn?: boolean
	web_proxy?: boolean
	public_proxy?: boolean
	spam_number?: number
	spam_urls?: string[]
	applied_rules?: Array<{
		id: string
		name: string
		operation: string
		score: number
	}>
}

interface SeonData {
	id?: string
	email?: string
	phone?: number
	user_fullname?: string
	risk_scores?: {
		global_network_score?: number
	}
	account_aggregates?: {
		total_registration?: number
		business?: {
			total_registration?: number
			[key: string]: unknown
		}
		personal?: {
			total_registration?: number
			[key: string]: unknown
		}
	}
	provider_carrier_details?: {
		carrier?: string
		country?: string
		disposable?: boolean
		phone_is_valid?: boolean
		type?: string
	}
	email_details?: Record<string, unknown>
	email_domain_details?: Record<string, unknown>
	breach_details?: {
		breaches?: Array<Record<string, unknown>>
		first_breach?: string
		haveibeenpwned_listed?: boolean
		number_of_breaches?: number
	}
	associated_domain_registrations?: {
		exists?: boolean
		number_of_domains?: number
		domains?: Array<Record<string, unknown>>
		first_registration_date?: string
	}
	aml_details?: AmlData
	result_payload?: AmlResultPayload
	ip_details?: IpDetails
}

export default function SeonOsint() {
	const [data, setData] = useState<SeonData | null>(null)
	const [query, setQuery] = useState("")
	const [queryType, setQueryType] = useState<QueryType>("email")
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const fetchData = useCallback(async () => {
		if (!query.trim()) {
			setError("Please enter a search query")
			return
		}

		setIsLoading(true)
		setError(null)

		try {
			const response = await fetch("/api/seon", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					type: queryType,
					data: queryType === "aml" ? { user_fullname: query } : { [queryType]: query },
				}),
			})

			if (!response.ok) {
				const errorData = await response.json()

				if (response.status === 403 && errorData?.error?.includes("subscription")) {
					throw new Error("SUBSCRIPTION_REQUIRED")
				}

				throw new Error(errorData?.error || "Failed to fetch data")
			}

			const jsonData = await response.json()

			if (queryType === "ip") {
				setData({
					ip_details: jsonData.data.data,
				})
			} else {
				setData(jsonData.data.data)
			}
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
			setIsLoading(false)
		}
	}, [query, queryType])

	const renderPropertyValue = (value: unknown): React.ReactNode => {
		if (typeof value === "boolean") {
			return value ? "Yes" : "No"
		}
		if (typeof value === "string") {
			if (value.startsWith("http://") || value.startsWith("https://")) {
				return (
					<a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
						{value}
					</a>
				)
			}
			return value
		}
		if (Array.isArray(value)) {
			return value.join(", ")
		}
		if (typeof value === "object" && value !== null) {
			return JSON.stringify(value)
		}
		return String(value)
	}

	const renderDataCard = (title: string, icon: React.ReactNode, content: React.ReactNode) => (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					{icon}
					<span>{title}</span>
				</CardTitle>
			</CardHeader>
			<CardContent>{content}</CardContent>
		</Card>
	)

	const renderTable = (data: Record<string, unknown>) => (
		<Table>
			<TableBody>
				{Object.entries(data).map(([key, value]) => (
					<TableRow key={key}>
						<TableCell className="font-medium">{key}</TableCell>
						<TableCell>{renderPropertyValue(value)}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	)

	const renderAmlDetails = (amlData: AmlData) => (
		<>
			<Table>
				<TableBody>
					<TableRow>
						<TableCell className="font-medium">Watchlist Match</TableCell>
						<TableCell>{amlData.has_watchlist_match ? "Yes" : "No"}</TableCell>
					</TableRow>
					<TableRow>
						<TableCell className="font-medium">PEP Match</TableCell>
						<TableCell>{amlData.has_pep_match ? "Yes" : "No"}</TableCell>
					</TableRow>
					<TableRow>
						<TableCell className="font-medium">Sanction Match</TableCell>
						<TableCell>{amlData.has_sanction_match ? "Yes" : "No"}</TableCell>
					</TableRow>
					<TableRow>
						<TableCell className="font-medium">Crime List Match</TableCell>
						<TableCell>{amlData.has_crimelist_match ? "Yes" : "No"}</TableCell>
					</TableRow>
				</TableBody>
			</Table>
			{amlData.result_payload && (
				<div className="mt-4">
					<h4 className="text-md font-semibold mb-2">Entries</h4>
					<div className="flex flex-wrap gap-2">
						<Badge variant={amlData.result_payload.watchlist_entries.length > 0 ? "default" : "secondary"}>
							Watchlist: {amlData.result_payload.watchlist_entries.length}
						</Badge>
						<Badge variant={amlData.result_payload.sanctionlist_entries.length > 0 ? "default" : "secondary"}>
							Sanction List: {amlData.result_payload.sanctionlist_entries.length}
						</Badge>
						<Badge variant={amlData.result_payload.crimelist_entries.length > 0 ? "default" : "secondary"}>
							Crime List: {amlData.result_payload.crimelist_entries.length}
						</Badge>
						<Badge variant={amlData.result_payload.pep_entries.length > 0 ? "default" : "secondary"}>
							PEP: {amlData.result_payload.pep_entries.length}
						</Badge>
					</div>
				</div>
			)}
		</>
	)

	const renderSanctionListSources = (sources: SanctionListSource[]) => (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Source Name</TableHead>
					<TableHead>Full Name</TableHead>
					<TableHead>Version</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{sources.map((source) => (
					<TableRow key={source.source_name}>
						<TableCell>{source.source_name}</TableCell>
						<TableCell>{source.source_full_name}</TableCell>
						<TableCell>{source.source_version}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	)

	const renderCrimeListEntries = (entries: CrimeListEntry[]) => (
		<div className="space-y-4">
			{entries.map((entry) => (
				<Card key={entry.id}>
					<CardContent className="pt-6">
						<h3 className="text-lg font-semibold mb-2">{entry.name}</h3>
						<Table>
							<TableBody>
								<TableRow>
									<TableCell className="font-medium">ID</TableCell>
									<TableCell>{entry.id}</TableCell>
								</TableRow>
								<TableRow>
									<TableCell className="font-medium">Relevancy Score</TableCell>
									<TableCell>{entry.scores.relevancy_score}</TableCell>
								</TableRow>
								<TableRow>
									<TableCell className="font-medium">Source</TableCell>
									<TableCell>{entry.source.source_full_name}</TableCell>
								</TableRow>
								{entry.attributes.map((attr) => (
									<TableRow key={attr.key}>
										<TableCell className="font-medium">{attr.key}</TableCell>
										<TableCell>{attr.value}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
						{entry.warn_informations.length > 0 && (
							<div className="mt-4">
								<h4 className="text-md font-semibold mb-2">Warnings</h4>
								{entry.warn_informations.map((warning) => (
									<Alert key={warning.description}>
										<AlertTitle>{warning.description}</AlertTitle>
										<AlertDescription>Updated at: {warning.updated_at}</AlertDescription>
									</Alert>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			))}
		</div>
	)
	const renderIpDetails = (ipData: IpDetails) => (
		<Table>
			<TableBody>
				<TableRow>
					<TableCell className="font-medium">IP Address</TableCell>
					<TableCell>{ipData.ip}</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-medium">Risk Score</TableCell>
					<TableCell>{ipData.score?.toFixed(1)}</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-medium">Country</TableCell>
					<TableCell>
						{ipData.country} ({ipData.state_prov})
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-medium">City</TableCell>
					<TableCell>{ipData.city}</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-medium">Coordinates</TableCell>
					<TableCell>
						{ipData.latitude}, {ipData.longitude}
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-medium">ISP</TableCell>
					<TableCell>{ipData.isp_name}</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-medium">Timezone</TableCell>
					<TableCell>UTC{ipData.timezone_offset}</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-medium">IP Type</TableCell>
					<TableCell>{ipData.type}</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-medium">Open Ports</TableCell>
					<TableCell>{(ipData.open_ports || []).join(", ")}</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-medium">VPN</TableCell>
					<TableCell>{ipData.vpn ? "Yes" : "No"}</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-medium">Web Proxy</TableCell>
					<TableCell>{ipData.web_proxy ? "Yes" : "No"}</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-medium">Public Proxy</TableCell>
					<TableCell>{ipData.public_proxy ? "Yes" : "No"}</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-medium">Tor Node</TableCell>
					<TableCell>{ipData.tor ? "Yes" : "No"}</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="font-medium">Spam Count</TableCell>
					<TableCell>{ipData.spam_number}</TableCell>
				</TableRow>
				{ipData.spam_urls && ipData.spam_urls.length > 0 && (
					<TableRow>
						<TableCell className="font-medium">Spam URLs</TableCell>
						<TableCell>
							<div className="flex flex-col gap-1">
								{ipData.spam_urls.map((url, index) => (
									<div key={index} className="flex gap-2">
										<span>{url}</span>
									</div>
								))}
							</div>
						</TableCell>
					</TableRow>
				)}
				{ipData.applied_rules && ipData.applied_rules.length > 0 && (
					<TableRow>
						<TableCell className="font-medium">Applied Rules</TableCell>
						<TableCell>
							<div className="flex flex-col gap-1">
								{ipData.applied_rules.map((rule) => (
									<div key={rule.id} className="flex gap-2">
										<span className="font-medium">{rule.id}:</span>
										<span>{rule.name}</span>
										<span>(Score: {rule.score.toFixed(1)})</span>
									</div>
								))}
							</div>
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	)

	return (
		<div className="container mx-auto py-8 px-4 space-y-8">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-3xl font-bold tracking-tight">SEON</h1>
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
							fetchData()
						}}
						className="flex flex-col sm:flex-row gap-4"
					>
						<div className="flex-1">
							<Input
								type="text"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder={
									queryType === "aml"
										? "Enter full name..."
										: queryType === "ip"
											? "Enter IP address..."
											: `Enter ${queryType}...`
								}
								className="w-full"
							/>
						</div>
						<div className="flex gap-2">
							<Select value={queryType} onValueChange={(value: QueryType) => setQueryType(value)}>
								<SelectTrigger className="w-[120px]">
									<SelectValue placeholder="Query Type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="aml">AML</SelectItem>
									<SelectItem value="email">Email</SelectItem>
									<SelectItem value="phone">Phone</SelectItem>
									<SelectItem value="ip">IP Address</SelectItem>
								</SelectContent>
							</Select>
							<Button type="submit" disabled={isLoading}>
								{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
								Search
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>

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
										? "You need an active subscription to access this feature. Purchase a subscription to continue using SEON."
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
			{data && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{queryType === "ip" ? (
						renderDataCard("IP Address Details", <Globe className="h-5 w-5" />, renderIpDetails(data.ip_details || {}))
					) : queryType === "aml" ? (
						<>
							{renderDataCard("AML Details", <User className="h-5 w-5" />, renderAmlDetails(data as AmlData))}
							{data.result_payload?.sanctionlist_sources &&
								renderDataCard(
									"Sanction List Sources",
									<FileText className="h-5 w-5" />,
									renderSanctionListSources(data.result_payload.sanctionlist_sources),
								)}
							{data.result_payload?.crimelist_entries &&
								data.result_payload.crimelist_entries.length > 0 &&
								renderDataCard(
									"Crime List Entries",
									<AlertTriangle className="h-5 w-5" />,
									renderCrimeListEntries(data.result_payload.crimelist_entries),
								)}
						</>
					) : (
						<>
							{renderDataCard(
								"Basic Information",
								<Shield className="h-5 w-5" />,
								<Table>
									<TableBody>
										{data.email && (
											<TableRow>
												<TableCell className="font-medium">Email</TableCell>
												<TableCell>{data.email}</TableCell>
											</TableRow>
										)}
										{data.phone && (
											<TableRow>
												<TableCell className="font-medium">Phone</TableCell>
												<TableCell>{data.phone}</TableCell>
											</TableRow>
										)}
										{data.user_fullname && (
											<TableRow>
												<TableCell className="font-medium">Full Name</TableCell>
												<TableCell>{data.user_fullname}</TableCell>
											</TableRow>
										)}
										{data.risk_scores?.global_network_score !== undefined && (
											<TableRow>
												<TableCell className="font-medium">Global Network Score</TableCell>
												<TableCell>{data.risk_scores.global_network_score}</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>,
							)}

							{data.provider_carrier_details &&
								renderDataCard(
									"Provider Carrier Details",
									<Phone className="h-5 w-5" />,
									renderTable(data.provider_carrier_details),
								)}

							{data.email_details &&
								renderDataCard("Email Details", <Mail className="h-5 w-5" />, renderTable(data.email_details))}

							{data.email_domain_details &&
								renderDataCard(
									"Email Domain Details",
									<Mail className="h-5 w-5" />,
									renderTable(data.email_domain_details),
								)}

							{data.aml_details &&
								renderDataCard("AML Details", <User className="h-5 w-5" />, renderAmlDetails(data.aml_details))}

							{data.aml_details?.result_payload.sanctionlist_sources &&
								renderDataCard(
									"Sanction List Sources",
									<FileText className="h-5 w-5" />,
									renderSanctionListSources(data.aml_details.result_payload.sanctionlist_sources),
								)}

							{data.aml_details?.result_payload.crimelist_entries &&
								data.aml_details.result_payload.crimelist_entries.length > 0 &&
								renderDataCard(
									"Crime List Entries",
									<AlertTriangle className="h-5 w-5" />,
									renderCrimeListEntries(data.aml_details.result_payload.crimelist_entries),
								)}

							{data.account_aggregates &&
								renderDataCard(
									"Account Aggregates",
									<Shield className="h-5 w-5" />,
									<Table>
										<TableBody>
											<TableRow>
												<TableCell className="font-medium">Total Registration</TableCell>
												<TableCell>{data.account_aggregates.total_registration}</TableCell>
											</TableRow>
											<TableRow>
												<TableCell className="font-medium">Business Registrations</TableCell>
												<TableCell>{data.account_aggregates.business?.total_registration}</TableCell>
											</TableRow>
											<TableRow>
												<TableCell className="font-medium">Personal Registrations</TableCell>
												<TableCell>{data.account_aggregates.personal?.total_registration}</TableCell>
											</TableRow>
										</TableBody>
									</Table>,
								)}

							{data.breach_details &&
								renderDataCard(
									"Breach Details",
									<AlertTriangle className="h-5 w-5" />,
									<>
										<Table>
											<TableBody>
												<TableRow>
													<TableCell className="font-medium">Number of Breaches</TableCell>
													<TableCell>{data.breach_details.number_of_breaches}</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-medium">First Breach</TableCell>
													<TableCell>{data.breach_details.first_breach}</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-medium">HaveIBeenPwned Listed</TableCell>
													<TableCell>{renderPropertyValue(data.breach_details.haveibeenpwned_listed)}</TableCell>
												</TableRow>
											</TableBody>
										</Table>
										{data.breach_details.breaches && data.breach_details.breaches.length > 0 && (
											<div className="mt-4">
												<h4 className="text-md font-semibold mb-2">Breach List</h4>
												<Table>
													<TableHeader>
														<TableRow>
															<TableHead>Date</TableHead>
															<TableHead>Domain</TableHead>
															<TableHead>Name</TableHead>
														</TableRow>
													</TableHeader>
													<TableBody>
														{data.breach_details.breaches.map((breach) => (
															<TableRow key={`${breach.date}-${breach.domain}-${breach.name}`}>
																<TableCell>{renderPropertyValue(breach.date)}</TableCell>
																<TableCell>{renderPropertyValue(breach.domain)}</TableCell>
																<TableCell>{renderPropertyValue(breach.name)}</TableCell>
															</TableRow>
														))}
													</TableBody>
												</Table>
											</div>
										)}
									</>,
								)}

							{data.associated_domain_registrations?.exists &&
								renderDataCard(
									"Associated Domain Registrations",
									<Shield className="h-5 w-5" />,
									<>
										<Table>
											<TableBody>
												<TableRow>
													<TableCell className="font-medium">Number of Domains</TableCell>
													<TableCell>{data.associated_domain_registrations.number_of_domains}</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-medium">First Registration Date</TableCell>
													<TableCell>{data.associated_domain_registrations.first_registration_date}</TableCell>
												</TableRow>
											</TableBody>
										</Table>
										{data.associated_domain_registrations.domains?.map((domain) => (
											<div key={String(domain.domain_name)} className="mt-4">
												<h4 className="text-md font-semibold mb-2">Domain: {String(domain.domain_name)}</h4>
												{renderTable(domain)}
											</div>
										))}
									</>,
								)}
						</>
					)}
				</div>
			)}
		</div>
	)
}
