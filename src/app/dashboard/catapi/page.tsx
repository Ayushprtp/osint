"use client";

import { useState, useMemo, useCallback } from "react";
import {
	Search,
	Database,
	ChevronLeft,
	ChevronRight,
	ArrowLeft,
	Download,
	AlertTriangle,
	Loader2,
	FileText,
	Link as LinkIcon,
	Mail,
	User,
	Lock,
	Hash,
	Fingerprint,
	MessageSquareText,
	ScanSearch,
	Globe,
	HelpCircle,
	Key,
	ShieldQuestion,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

type SearchParams = {
	query: string;
	type: "email" | "password" | "url" | "username" | "discord_id" | "uuid";
	wildcard: boolean;
};
type SearchResult = {
	[key: string]: string | number | boolean;
};

type SearchResponse = {
	success: boolean;
	data: {
		results: Record<string, SearchResult[]>;
		size: number;
		took: number;
	};
};

type ExportFormat = "json" | "user-pass" | "url-user-pass";

const searchTypes: { value: SearchParams["type"]; label: string }[] = [
	{ value: "email", label: "Email" },
	{ value: "password", label: "Password" },
	{ value: "url", label: "URL" },
	{ value: "username", label: "Username" },
	{ value: "discord_id", label: "Discord ID" },
	{ value: "uuid", label: "UUID" },
];
const ITEMS_PER_PAGE = 10;

export default function CatAPI() {
	const [isSearching, setIsSearching] = useState(false);
	const [searchType, setSearchType] = useState<SearchParams["type"]>("email");
	const [query, setQuery] = useState("");
	const [wildcard, setWildcard] = useState(false);
	const [searchResults, setSearchResults] = useState<SearchResponse | null>(
		null,
	);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [resultSearch, setResultSearch] = useState("");

	const getResultKeys = useMemo(() => {
		if (
			searchResults?.data.results &&
			typeof searchResults?.data.results === "object"
		) {
			const allKeys = new Set<string>();
			for (const database of Object.values(searchResults?.data.results)) {
				if (Array.isArray(database) && database.length > 0) {
					for (const key of Object.keys(database[0])) {
						allKeys.add(key);
					}
				}
			}
			return Array.from(allKeys);
		}
		return [];
	}, [searchResults]);

	const getPaginatedResults = useMemo(() => {
		if (!searchResults || !searchResults?.data.results) {
			return [];
		}

		const allResults = Object.entries(searchResults?.data.results).flatMap(
			([databaseName, results]) => {
				if (Array.isArray(results)) {
					return results.map(
						(result) => [databaseName, result] as [string, SearchResult],
					);
				}
				return [];
			},
		);

		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
		const paginatedResults = allResults.slice(
			startIndex,
			startIndex + ITEMS_PER_PAGE,
		);
		return paginatedResults;
	}, [searchResults, currentPage]);

	const allResults = useMemo(() => {
		if (!searchResults || !searchResults?.data.results) {
			return [];
		}

		return Object.entries(searchResults?.data.results).flatMap(
			([databaseName, results]) => {
				if (Array.isArray(results)) {
					return results.map(
						(result) => [databaseName, result] as [string, SearchResult],
					);
				}
				return [];
			},
		);
	}, [searchResults]);

	const filteredResults = useMemo(() => {
		if (!resultSearch.trim()) return getPaginatedResults;
		return getPaginatedResults.filter(
			([_, result]) =>
				result &&
				Object.values(result).some(
					(value) =>
						value !== null &&
						value !== undefined &&
						String(value).toLowerCase().includes(resultSearch.toLowerCase()),
				),
		);
	}, [getPaginatedResults, resultSearch]);

	const totalPages = useMemo(() => {
		if (!searchResults || !searchResults?.data.results) return 0;
		const totalResults = Object.values(searchResults?.data.results).reduce(
			(sum, dbResults) => {
				return sum + (Array.isArray(dbResults) ? dbResults.length : 0);
			},
			0,
		);
		return Math.ceil(totalResults / ITEMS_PER_PAGE);
	}, [searchResults]);

	const handleSearch = useCallback(async () => {
		if (!query.trim()) {
			setError("Please enter a search query");
			return;
		}

		setIsSearching(true);
		setError(null);
		setSearchResults(null);

		try {
			const response = await fetch("/api/catapi", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ query, searchType, wildcard }),
			});

			if (!response.ok) {
				const errorData = await response.json();

				// Check specifically for subscription-related errors
				if (
					response.status === 403 &&
					errorData?.error?.includes("subscription")
				) {
					throw new Error("SUBSCRIPTION_REQUIRED");
				}

				throw new Error(
					errorData?.error || "An error occurred during the search",
				);
			}

			const data: SearchResponse = await response.json();
			setSearchResults(data);
			setCurrentPage(1);
		} catch (error) {
			console.error("Error fetching data:", error);

			// Check for subscription error message
			if (error instanceof Error) {
				if (error.message === "SUBSCRIPTION_REQUIRED") {
					setError(
						"Active subscription required. Please purchase a subscription to continue using this service.",
					);
				} else {
					setError(
						error.message ||
							"An error occurred while fetching data. Please try again.",
					);
				}
			} else {
				setError("An error occurred while fetching data. Please try again.");
			}
		} finally {
			setIsSearching(false);
		}
	}, [query, searchType, wildcard]);

	const downloadResults = useCallback(
		(format: ExportFormat = "json") => {
			if (!searchResults) return;

			let content = "";
			let filename = `catapi-search-${searchType}-${query}`;
			let mimeType = "application/json";

			if (format === "json") {
				content = JSON.stringify(searchResults, null, 2);
				filename += ".json";
			} else {
				// Extract all results for text formats
				const formattedLines = allResults
					.map(([_, result]) => {
						// Handle missing fields gracefully
						const login = result.login || result.email || result.username || "";
						const password = result.password || "";
						const url = result.url || "";

						if (format === "user-pass") {
							return `${login}:${password}`;
						}
						if (format === "url-user-pass") {
							return `${url}:${login}:${password}`;
						}
						return "";
					})
					.filter((line) => line.trim() !== "");

				content = formattedLines.join("\n");
				filename += ".txt";
				mimeType = "text/plain";
			}

			const blob = new Blob([content], { type: mimeType });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = filename;
			a.click();
		},
		[searchResults, searchType, query, allResults],
	);

	// Render search form with new UI
	const renderSearchForm = () => {
		return (
			<div className="flex w-full items-center space-x-2">
				<div className="relative flex-1">
					<Input
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder={`Enter ${searchType}...`}
						className="pr-10"
					/>
					<Button
						className="absolute right-0 top-0 h-full rounded-l-none"
						onClick={handleSearch}
						disabled={isSearching}
					>
						{isSearching ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Search className="h-4 w-4" />
						)}
					</Button>
				</div>
			</div>
		);
	};

	// Get icon for search type
	const getSearchTypeIcon = (type: SearchParams["type"]) => {
		switch (type) {
			case "email":
				return <Mail className="h-4 w-4" />;
			case "password":
				return <Lock className="h-4 w-4" />;
			case "url":
				return <Globe className="h-4 w-4" />;
			case "username":
				return <User className="h-4 w-4" />;
			case "discord_id":
				return <MessageSquareText className="h-4 w-4" />;
			case "uuid":
				return <Fingerprint className="h-4 w-4" />;
			default:
				return <Search className="h-4 w-4" />;
		}
	};

	return (
		<div className="container mx-auto py-8 px-4 space-y-8">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-3xl font-bold tracking-tight">CatAPI</h1>
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
									{getSearchTypeIcon(type.value)}
									{type.label}
								</Button>
							))}
						</div>
						<div className="w-full">{renderSearchForm()}</div>
						<div className="flex items-center space-x-2">
							<Switch
								id="wildcard-mode"
								checked={wildcard}
								onCheckedChange={setWildcard}
							/>
							<Label htmlFor="wildcard-mode">Enable Wildcard Search</Label>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="h-6 w-6 rounded-full p-0"
										>
											<HelpCircle className="h-4 w-4" />
											<span className="sr-only">Wildcard info</span>
										</Button>
									</TooltipTrigger>
									<TooltipContent className="max-w-xs">
										<p>
											Use <strong>*</strong> to match any number of characters
											and <strong>?</strong> to match a single character.
											<br />
											Examples:
											<br />- <code>john*</code> matches "john", "johnny", etc.
											<br />- <code>*smith</code> matches "smith", "joesmith",
											etc.
											<br />- <code>jo?n</code> matches "john", "joan", etc.
										</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>
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
					variant={
						error.toLowerCase().includes("subscription")
							? "default"
							: "destructive"
					}
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
									{error.toLowerCase().includes("subscription")
										? "Subscription Required"
										: "Error Occurred"}
								</AlertTitle>
								<AlertDescription className="text-sm text-muted-foreground mt-1">
									{error.toLowerCase().includes("subscription")
										? "You need an active subscription to access this feature. Purchase a subscription to continue using CatAPI."
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

			{searchResults &&
				Object.keys(searchResults?.data.results).length === 0 && (
					<Alert variant={"default"}>
						<div className="flex items-center gap-2 mb-1">
							<AlertTriangle className="h-4 w-4 text-yellow-500" />
							<AlertTitle>No results found</AlertTitle>
						</div>
						<AlertDescription>
							We couldn't find any results for the search query. Please try
							again with a different query.
						</AlertDescription>
					</Alert>
				)}

			{searchResults && Object.keys(searchResults?.data.results).length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<span className="flex items-center gap-2">
								<Database className="h-5 w-5" />
								Search Results
							</span>
							<div className="flex items-center gap-2">
								<Badge variant="outline" className="flex items-center gap-2">
									Total Databases:{" "}
									{Object.keys(searchResults?.data.results).length}
								</Badge>
							</div>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
								<div className="flex flex-wrap gap-2">
									<div className="flex gap-2">
										<Button
											variant="outline"
											disabled={!searchResults}
											onClick={() => downloadResults("json")}
											className="flex items-center"
										>
											<FileText className="mr-2 h-4 w-4" />
											JSON
										</Button>
										<Button
											variant="outline"
											disabled={!searchResults}
											onClick={() => downloadResults("user-pass")}
											className="flex items-center"
										>
											<Download className="mr-2 h-4 w-4" />
											USER:PASS
										</Button>
										<Button
											variant="outline"
											disabled={!searchResults}
											onClick={() => downloadResults("url-user-pass")}
											className="flex items-center"
										>
											<LinkIcon className="mr-2 h-4 w-4" />
											URL:USER:PASS
										</Button>
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
							{searchResults?.data.results &&
							Object.keys(searchResults?.data.results).length > 0 ? (
								<div className="space-y-4">
									<div className="overflow-x-auto">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Database</TableHead>
													{getResultKeys.map((key) => (
														<TableHead key={key}>{key}</TableHead>
													))}
												</TableRow>
											</TableHeader>
											<TableBody>
												{filteredResults.map(
													([databaseName, result], index) => (
														<TableRow key={`${databaseName}-${index}`}>
															<TableCell>{databaseName}</TableCell>
															{getResultKeys.map((key) => (
																<TableCell key={key}>
																	{result[key] || "-"}
																</TableCell>
															))}
														</TableRow>
													),
												)}
											</TableBody>
										</Table>
									</div>
									<div className="flex justify-between items-center mt-4">
										<Button
											onClick={() =>
												setCurrentPage((prev) => Math.max(1, prev - 1))
											}
											disabled={currentPage === 1}
										>
											<ChevronLeft className="h-4 w-4 mr-2" />
											Previous
										</Button>
										<span>
											Page {currentPage} of {totalPages}
										</span>
										<Button
											onClick={() =>
												setCurrentPage((prev) => Math.min(totalPages, prev + 1))
											}
											disabled={currentPage === totalPages}
										>
											Next
											<ChevronRight className="h-4 w-4 ml-2" />
										</Button>
									</div>
								</div>
							) : (
								<Alert>
									<AlertTitle>No results found</AlertTitle>
									<AlertDescription>
										No data available for{" "}
										<strong>{query || "your search query"}</strong>. Try a
										different search term.
									</AlertDescription>
								</Alert>
							)}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
} 
