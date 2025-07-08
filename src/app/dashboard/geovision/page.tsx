"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import {
	MapPin,
	Upload,
	AlertTriangle,
	Loader2,
	Download,
	Info,
	Globe,
	Send,
	Maximize2,
	Copy,
	ChevronDown,
	ChevronUp,
	Eye,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useToast } from "@/hooks/use-toast"

type AnalysisResponse = {
	analysis: {
		analysis: {
			confidence: string
			reasoning: string
			visualElements: string[]
		}
		location: {
			coordinates: {
				latitude: number
				longitude: number
			}
			name: string
		}
	}
	model_locations: [number, number][]
	reverseImages: any[]
}

export default function GeoVisionPage() {
	const { toast } = useToast()
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [selectedImage, setSelectedImage] = useState<File | null>(null)
	const [previewUrl, setPreviewUrl] = useState<string | null>(null)
	const [additionalInfo, setAdditionalInfo] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const [results, setResults] = useState<AnalysisResponse | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [activeTab, setActiveTab] = useState("upload")
	const [isMapExpanded, setIsMapExpanded] = useState(false)
	const [isDetailExpanded, setIsDetailExpanded] = useState(true)
	const [showAllLocations, setShowAllLocations] = useState(false)
	const [currentViewCoords, setCurrentViewCoords] = useState<{ lat: number; lng: number } | null>(null)

	useEffect(() => {
		if (results && !currentViewCoords && results.analysis?.location?.coordinates) {
			const { latitude, longitude } = results.analysis.location.coordinates
			setCurrentViewCoords({
				lat: latitude,
				lng: longitude,
			})
		}
	}, [results, currentViewCoords])

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null

		setResults(null)
		setCurrentViewCoords(null)
		setShowAllLocations(false)
		setIsDetailExpanded(true)
		setError(null)
		setSelectedImage(file)

		if (file) {
			const url = URL.createObjectURL(file)
			setPreviewUrl(url)

			setActiveTab("upload")
		} else {
			setPreviewUrl(null)
		}
	}

	const handleUploadClick = () => {
		fileInputRef.current?.click()
	}

	const copyCoordinates = (lat: number, lng: number) => {
		navigator.clipboard.writeText(`${lat}, ${lng}`)
		toast({
			title: "Coordinates copied",
			description: `${lat}, ${lng} copied to clipboard`,
		})
	}

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault()

			if (!selectedImage) {
				setError("Please select an image to analyze")
				return
			}

			setIsLoading(true)
			setError(null)

			try {
				const formData = new FormData()
				formData.append("image", selectedImage)

				if (additionalInfo.trim()) {
					formData.append("additional_info", additionalInfo)
				}

				const response = await fetch("/api/geovision", {
					method: "POST",
					body: formData,
				})

				if (!response.ok) {
					const errorData = await response.json()
					throw new Error(errorData.error || "Failed to process image")
				}

				const responseJson = await response.json()

				const data = responseJson.data || responseJson
				setResults(data)

				setActiveTab("results")
			} catch (err) {
				console.error("Error analyzing image:", err)
				setError(err instanceof Error ? err.message : "An error occurred while analyzing the image")
			} finally {
				setIsLoading(false)
			}
		},
		[selectedImage, additionalInfo, toast],
	)

	const handleExportJSON = useCallback(() => {
		if (!results) return

		const jsonString = JSON.stringify(results, null, 2)
		const blob = new Blob([jsonString], { type: "application/json" })
		const url = URL.createObjectURL(blob)

		const a = document.createElement("a")
		a.href = url
		a.download = `image-location-analysis-${Date.now()}.json`
		document.body.appendChild(a)
		a.click()

		document.body.removeChild(a)
		URL.revokeObjectURL(url)

		toast({
			title: "Export successful",
			description: "Results exported as JSON",
		})
	}, [results, toast])

	const getStreetViewEmbedUrl = (lat: number, lng: number) => {
		return `https://www.google.com/maps/embed/v1/streetview?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&location=${lat},${lng}&heading=210&pitch=10&fov=90`
	}

	const openInGoogleStreetView = useCallback((lat: number, lng: number) => {
		window.open(`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`, "_blank")
	}, [])

	const updateStreetView = useCallback(
		(lat: number, lng: number) => {
			setCurrentViewCoords({ lat, lng })
			toast({
				title: "Street View updated",
				description: `Viewing coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
			})
		},
		[toast],
	)

	const renderUploadForm = () => {
		return (
			<form onSubmit={handleSubmit} className="space-y-4">
				<div
					className={`border-2 border-dashed rounded-lg p-4 text-center ${
						previewUrl ? "border-primary" : "border-border"
					} hover:border-primary transition-colors cursor-pointer`}
					onClick={handleUploadClick}
				>
					{previewUrl ? (
						<div className="space-y-2">
							<div className="relative mx-auto max-w-xs overflow-hidden rounded-lg">
								<img src={previewUrl} alt="Selected preview" className="h-36 w-auto mx-auto object-cover" />
							</div>
							<div className="text-sm text-muted-foreground">{selectedImage?.name}</div>
						</div>
					) : (
						<div className="space-y-2">
							<div className="mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center">
								<Upload className="h-5 w-5 text-muted-foreground" />
							</div>
							<div>
								<p className="text-sm font-medium">Upload image or drag and drop</p>
								<p className="text-xs text-muted-foreground mt-1">JPG, JPEG, PNG, GIF</p>
							</div>
						</div>
					)}
					<input
						ref={fileInputRef}
						type="file"
						accept="image/jpeg,image/jpg,image/png,image/gif"
						onChange={handleFileChange}
						className="hidden"
					/>
				</div>

				<div className="space-y-2">
					<label htmlFor="additional-info" className="text-sm font-medium">
						Additional Context (optional)
					</label>
					<Textarea
						id="additional-info"
						placeholder="Add any additional context (e.g., 'This appears to be a hotel in Miami')"
						value={additionalInfo}
						onChange={(e) => setAdditionalInfo(e.target.value)}
						className="min-h-[80px]"
					/>
				</div>

				<div className="flex gap-2">
					<Button type="submit" className="flex-1" disabled={isLoading || !selectedImage}>
						{isLoading ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Analyzing...
							</>
						) : (
							<>
								<MapPin className="h-4 w-4 mr-2" />
								Find Location
							</>
						)}
					</Button>

					{results && (
						<Button type="button" variant="outline" onClick={() => setActiveTab("results")}>
							View Results
						</Button>
					)}
				</div>
			</form>
		)
	}

	const renderResults = () => {
		if (!results) return null

		const { analysis, model_locations } = results
		const { latitude, longitude } = analysis.location.coordinates

		const displayCoords = currentViewCoords || { lat: latitude, lng: longitude }

		return (
			<div className="space-y-4">
				{/* Interactive Street View Section */}
				<div
					className={`relative rounded-lg border overflow-hidden transition-all duration-300 ${isMapExpanded ? "h-[600px]" : "h-[350px]"}`}
				>
					<div className="absolute inset-0">
						<iframe
							title="Location Street View"
							width="100%"
							height="100%"
							style={{ border: 0 }}
							loading="lazy"
							allowFullScreen
							src={getStreetViewEmbedUrl(displayCoords.lat, displayCoords.lng)}
						/>
					</div>
					<div className="absolute bottom-2 right-2 flex gap-1">
						<Button
							size="sm"
							variant="secondary"
							className="h-8 bg-background/80 backdrop-blur-sm"
							onClick={() => setIsMapExpanded(!isMapExpanded)}
						>
							<Maximize2 className="h-4 w-4" />
						</Button>
						<Button
							size="sm"
							variant="secondary"
							className="h-8 bg-background/80 backdrop-blur-sm"
							onClick={() => openInGoogleStreetView(displayCoords.lat, displayCoords.lng)}
						>
							<Eye className="h-4 w-4" />
						</Button>
					</div>
					<div className="absolute top-2 left-2 flex flex-col gap-1">
						<Badge className="bg-background/80 backdrop-blur-sm text-foreground">{analysis.location.name}</Badge>
						{currentViewCoords && currentViewCoords.lat !== latitude && currentViewCoords.lng !== longitude && (
							<Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-foreground">
								Viewing Alternative Location
							</Badge>
						)}
					</div>
					{currentViewCoords && currentViewCoords.lat !== latitude && currentViewCoords.lng !== longitude && (
						<div className="absolute top-2 right-2">
							<Button
								size="sm"
								variant="outline"
								className="h-7 bg-background/80 backdrop-blur-sm text-xs"
								onClick={() => updateStreetView(latitude, longitude)}
							>
								Return to primary location
							</Button>
						</div>
					)}
				</div>

				{/* Street View Note */}
				<Alert className="py-2">
					<Info className="h-4 w-4" />
					<AlertDescription className="text-xs text-muted-foreground">
						Some coordinates may not have been visited by Google Street View and will appear as a black screen. Try
						alternative locations if available.
					</AlertDescription>
				</Alert>

				{/* Results Summary */}
				<div className="flex flex-wrap gap-2 justify-between items-center">
					<div className="flex gap-2 flex-wrap">
						<Badge variant="outline" className="capitalize">
							{analysis.analysis.confidence} confidence
						</Badge>
						<Badge variant="secondary">
							{latitude.toFixed(4)}, {longitude.toFixed(4)}
							<Button
								variant="ghost"
								size="sm"
								className="h-4 w-4 p-0 ml-1"
								onClick={() => copyCoordinates(latitude, longitude)}
							>
								<Copy className="h-3 w-3" />
							</Button>
						</Badge>
					</div>
					<Button variant="outline" size="sm" onClick={handleExportJSON}>
						<Download className="h-4 w-4 mr-1" />
						Export
					</Button>
				</div>

				{/* Visual Elements */}
				<div className="flex flex-wrap gap-1.5">
					{analysis.analysis.visualElements.map((element, index) => (
						<Badge key={index} variant="outline" className="text-xs">
							{element}
						</Badge>
					))}
				</div>

				{/* Analysis Details Collapsible */}
				<Collapsible open={isDetailExpanded} onOpenChange={setIsDetailExpanded} className="border rounded-md">
					<div className="flex items-center justify-between p-2">
						<h3 className="text-sm font-medium">Analysis Details</h3>
						<CollapsibleTrigger asChild>
							<Button variant="ghost" size="sm" className="p-1 h-auto">
								{isDetailExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
							</Button>
						</CollapsibleTrigger>
					</div>
					<CollapsibleContent>
						<div className="p-3 pt-0 space-y-3">
							<div>
								<h4 className="text-xs font-medium text-muted-foreground mb-1">Reasoning</h4>
								<p className="text-sm">{analysis.analysis.reasoning}</p>
							</div>

							<div>
								<h4 className="text-xs font-medium text-muted-foreground mb-1">Coordinates</h4>
								<div className="text-sm font-mono flex justify-between">
									<span>Latitude: {latitude}</span>
									<span>Longitude: {longitude}</span>
								</div>
							</div>
						</div>
					</CollapsibleContent>
				</Collapsible>

				{/* Alternative Locations */}
				{model_locations && model_locations.length > 0 && (
					<div className="border rounded-md overflow-hidden">
						<div className="flex items-center justify-between p-2 bg-muted/50">
							<h3 className="text-sm font-medium">Alternative Locations ({model_locations.length})</h3>
						</div>
						<div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
							{(showAllLocations ? model_locations : model_locations.slice(0, 4)).map(([lat, lng], index) => (
								<div key={index} className="border rounded p-2 flex justify-between items-center text-sm">
									<span className="font-mono text-xs">
										{lat.toFixed(4)}, {lng.toFixed(4)}
									</span>
									<div className="flex gap-1">
										<Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyCoordinates(lat, lng)}>
											<Copy className="h-3 w-3" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											className={`h-6 w-6 p-0 ${
												currentViewCoords && currentViewCoords.lat === lat && currentViewCoords.lng === lng
													? "bg-primary/10 text-primary"
													: ""
											}`}
											onClick={() => updateStreetView(lat, lng)}
										>
											<Eye className="h-3 w-3" />
										</Button>
									</div>
								</div>
							))}

							{!showAllLocations && model_locations.length > 4 && (
								<Button
									variant="ghost"
									className="border rounded p-2 text-sm text-muted-foreground col-span-full text-center justify-center h-auto"
									onClick={() => setShowAllLocations(true)}
								>
									+ {model_locations.length - 4} more locations
								</Button>
							)}

							{showAllLocations && model_locations.length > 4 && (
								<Button
									variant="ghost"
									className="border rounded p-2 text-sm text-muted-foreground col-span-full text-center justify-center h-auto"
									onClick={() => setShowAllLocations(false)}
								>
									Show fewer locations
								</Button>
							)}
						</div>
					</div>
				)}
			</div>
		)
	}

	return (
		<div className="container p-4 max-w-screen-xl mx-auto">
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-2xl font-bold">GeoVision AI</h1>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
				<div className="flex justify-between items-center">
					<TabsList>
						<TabsTrigger value="upload" className="flex gap-1 items-center">
							<Upload className="h-4 w-4" />
							<span>Upload</span>
						</TabsTrigger>
						<TabsTrigger value="results" disabled={!results} className="flex gap-1 items-center">
							<MapPin className="h-4 w-4" />
							<span>Results</span>
						</TabsTrigger>
					</TabsList>

					{error && (
						<Alert variant="destructive" className="py-1 px-2 h-auto">
							<AlertTriangle className="h-4 w-4" />
							<AlertDescription className="text-xs">{error}</AlertDescription>
						</Alert>
					)}
				</div>

				<TabsContent value="upload" className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<Card className="md:col-span-2">
							<CardHeader className="pb-2">
								<CardTitle className="text-lg">Upload Image</CardTitle>
								<CardDescription>Upload an image to analyze its geographic location</CardDescription>
							</CardHeader>
							<CardContent>{renderUploadForm()}</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-lg">How it works</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<Alert>
									<Info className="h-4 w-4" />
									<AlertDescription className="text-xs">
										GeoVision AI uses advanced geospatial intelligence and machine learning to analyze visual elements
										in images and determine their geographic location.
									</AlertDescription>
								</Alert>

								<div className="space-y-2">
									<div className="flex gap-2 items-start">
										<div className="bg-primary/10 rounded-full p-1 mt-0.5">
											<Upload className="h-3.5 w-3.5 text-primary" />
										</div>
										<div className="text-sm">
											<p className="font-medium">Upload a clear image</p>
											<p className="text-xs text-muted-foreground">Of landmarks, buildings, or distinctive locations</p>
										</div>
									</div>

									<div className="flex gap-2 items-start">
										<div className="bg-primary/10 rounded-full p-1 mt-0.5">
											<Send className="h-3.5 w-3.5 text-primary" />
										</div>
										<div className="text-sm">
											<p className="font-medium">Add context (optional)</p>
											<p className="text-xs text-muted-foreground">Any details you know about the location</p>
										</div>
									</div>

									<div className="flex gap-2 items-start">
										<div className="bg-primary/10 rounded-full p-1 mt-0.5">
											<Globe className="h-3.5 w-3.5 text-primary" />
										</div>
										<div className="text-sm">
											<p className="font-medium">Get precise coordinates</p>
											<p className="text-xs text-muted-foreground">And see the location on an interactive map</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="results">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="md:col-span-2">
							{results ? (
								renderResults()
							) : (
								<div className="text-center py-12 border rounded-lg">
									<MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
									<h3 className="text-lg font-medium">No results available</h3>
									<p className="text-sm text-muted-foreground">Upload an image to see results</p>
									<Button className="mt-4" variant="outline" onClick={() => setActiveTab("upload")}>
										Go to Upload
									</Button>
								</div>
							)}
						</div>

						<div>
							<Card>
								<CardHeader className="pb-2">
									<CardTitle className="text-lg">Image Preview</CardTitle>
								</CardHeader>
								<CardContent>
									{previewUrl ? (
										<div className="rounded-md overflow-hidden border">
											<img src={previewUrl} alt="Analyzed image" className="w-full h-auto object-contain" />
										</div>
									) : (
										<div className="border rounded-md h-48 flex items-center justify-center">
											<p className="text-sm text-muted-foreground">No image preview</p>
										</div>
									)}
								</CardContent>
								<CardFooter className="flex justify-end pt-0">
									<Button variant="ghost" size="sm" onClick={() => setActiveTab("upload")}>
										Upload new image
									</Button>
								</CardFooter>
							</Card>
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	)
}
