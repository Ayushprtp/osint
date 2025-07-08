"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import {
	Info,
	Search,
	Terminal,
	FileText,
	ArrowLeft,
	ExternalLink,
	BookOpen,
	Video,
	HelpCircle,
	ChevronRight,
	Share2,
	Copy,
	Check,
	User,
	Link as LinkIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogClose,
} from "@/components/ui/dialog"

type ResourceCategory = "guide" | "reference" | "tutorial" | "api" | "video"

interface Resource {
	id: string
	title: string
	description: string
	icon: React.ReactNode
	category: ResourceCategory
	updated: string
	content?: string
	url?: string
	isExternal?: boolean
	author?: string
}

export default function ResourcesPage() {
	const resources: Resource[] = [
		{
			id: "getting-started",
			title: "Getting Started with TRACKED",
			description: "Learn the basics of the platform and how to perform your first search",
			icon: <Info size={18} />,
			category: "guide",
			updated: "Feb 25, 2025",
			author: "TRACKED Team",
			content:
				"# Getting Started with TRACKED\n\nWelcome to the **TRACKED Intelligence Matrix** platform. This guide will walk you through the essential features and help you perform your first search.\n\n## Basic Navigation\n\nThe TRACKED platform consists of several key areas:\n\n- **Dashboard**: Overview of system status and data sources  \n- **Search**: Main interface for performing intelligence queries  \n- **Results**: Detailed view of search findings  \n\n## Performing Your First Search\n\n1. Navigate to the **Search** page from the main sidebar.  \n2. Select a data source that best fits your target.  \n3. Enter your query (e.g., email, username—depends on the source).  \n4. Click the **Search** button to initiate your query.  \n5. Review results in the tabular format provided.  \n\n## Understanding Results\n\nSearch results will include:\n\n- **Source** of the information  \n- **Date** the information was indexed, some sources do not transmit this information  \n- **Search results** that may or not be available depending on your target \n\n## Privacy Features\n\nTRACKED operates with a strict **no-logging policy**. Your searches are **never** recorded or stored.",
		},

		{
			id: "data-sources",
			title: "Data Source Specifications",
			description: "Detailed information about each integrated data source",
			icon: <FileText size={18} />,
			category: "reference",
			updated: "Feb 28, 2025",
			author: "TRACKED Team",
			content:
				"# Data Source Specifications\n\n## Snusbase\n- **Records**: 80B+\n- **Content Types**: Emails, usernames, passwords, IP addresses\n- **Coverage**: Global, primarily corporate and service breaches\n\n## LeakOSINT\n- **Records**: 69.1B+\n- **Content Types**: Breach data, credential leaks, dark web dumps\n- **Coverage**: Global\n\n## OSINTCat Suite\n- **Records**: Unified from multiple sources\n- **Content Types**: Public records, social media, breached credentials\n- **Coverage**: Global\n\n## TGScan\n- **Records**: Unknown, but millions added daily\n- **Content Types**: Telegram usernames, group affiliations, user activity\n- **Coverage**: Global\n\n## Endato\n- **Records**: 120B+\n- **Content Types**: Personal records, addresses, contact details\n- **Coverage**: US-focused",
		},
		{
			id: "video-tutorials",
			title: "OSINT in 5 hours, full course",
			description: "Awesome course that teaches you a lot about GEOINT and OSINT in general.",
			icon: <Video size={18} />,
			category: "video",
			updated: "Jan 10, 2022",
			author: "The Cyber Mentor",
			isExternal: true,
			url: "https://www.youtube.com/watch?v=qwA6MmbeGNo",
		},
		{
			id: "client-tools",
			title: "The Impact of OSINT in whistleblowing",
			description: "Great article about ethics in OSINT",
			icon: <LinkIcon size={18} />,
			category: "reference",
			updated: "November 19, 2024",
			author: "Paul Wright, Neal Ysart",
			isExternal: true,
			url: "https://www.osint.uk/content/the-impact-of-osint-in-whistleblowing",
		},
	]

	const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
	const [searchQuery, setSearchQuery] = useState("")
	const [activeCategory, setActiveCategory] = useState<string>("all")
	const [isLoading, setIsLoading] = useState(true)
	const [copied, setCopied] = useState(false)
	const [shareDialogOpen, setShareDialogOpen] = useState(false)
	const [shareUrl, setShareUrl] = useState("")

	useEffect(() => {
		if (typeof window !== "undefined") {
			const urlParams = new URLSearchParams(window.location.search)
			const resourceId = urlParams.get("resource")

			if (resourceId) {
				const resource = resources.find((r) => r.id === resourceId)
				if (resource) {
					setSelectedResource(resource)
				}
			}
		}

		const timer = setTimeout(() => {
			setIsLoading(false)
		}, 500)
		return () => clearTimeout(timer)
	}, [])

	const generateShareableUrl = () => {
		if (!selectedResource) return ""

		const baseUrl = typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}` : ""

		return `${baseUrl}?resource=${selectedResource.id}`
	}

	const handleShare = () => {
		const url = generateShareableUrl()
		setShareUrl(url)
		setShareDialogOpen(true)
	}

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch (err) {
			console.error("Failed to copy text: ", err)
		}
	}

	const filteredResources = resources.filter((resource) => {
		const matchesSearch =
			resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			resource.description.toLowerCase().includes(searchQuery.toLowerCase())
		const matchesCategory = activeCategory === "all" || resource.category === activeCategory
		return matchesSearch && matchesCategory
	})

	const getCategoryIcon = (category: ResourceCategory) => {
		switch (category) {
			case "guide":
				return <Info size={16} />
			case "reference":
				return <FileText size={16} />
			case "tutorial":
				return <BookOpen size={16} />
			case "api":
				return <Terminal size={16} />
			case "video":
				return <Video size={16} />
			default:
				return <HelpCircle size={16} />
		}
	}

	const getCategoryColor = (category: ResourceCategory) => {
		switch (category) {
			case "guide":
				return "bg-blue-400/10 text-blue-400 border-blue-400/20"
			case "reference":
				return "bg-purple-400/10 text-purple-400 border-purple-400/20"
			case "tutorial":
				return "bg-green-400/10 text-green-400 border-green-400/20"
			case "api":
				return "bg-amber-400/10 text-amber-400 border-amber-400/20"
			case "video":
				return "bg-red-400/10 text-red-400 border-red-400/20"
			default:
				return "bg-gray-400/10 text-gray-400 border-gray-400/20"
		}
	}

	const renderMarkdown = (content: string) => {
		if (!content) return null

		let html = content
			.split("\n")
			.map((line) => {
				if (line.startsWith("# ")) {
					return `<h1 class="text-3xl font-bold mt-2 mb-6 text-rose-400">${line.substring(2)}</h1>`
				}
				if (line.startsWith("## ")) {
					return `<h2 class="text-2xl font-semibold mt-8 mb-4 border-b border-muted pb-2">${line.substring(3)}</h2>`
				}
				if (line.startsWith("### ")) {
					return `<h3 class="text-xl font-medium mt-6 mb-3">${line.substring(4)}</h3>`
				}
				if (line.startsWith("- ")) {
					return `<li class="ml-6 list-disc my-1">${formatInlineMarkdown(line.substring(2))}</li>`
				}
				if (/^\d+\.\s/.test(line)) {
					return `<li class="ml-6 list-decimal my-1">${formatInlineMarkdown(line.substring(line.indexOf(" ") + 1))}</li>`
				}
				if (line.startsWith("```")) {
					return line.length > 3
						? '<pre class="bg-black/20 p-4 rounded-md my-4 font-mono text-sm overflow-x-auto">'
						: "</pre>"
				}
				if (line === "") {
					return '<p class="my-2"></p>'
				}
				return `<p class="my-4 leading-relaxed">${formatInlineMarkdown(line)}</p>`
			})
			.join("")

		html = html.replace(
			/<li class="ml-6 list-disc my-1">/g,
			'<ul class="my-4 space-y-2"><li class="ml-6 list-disc my-1">',
		)
		html = html.replace(/<\/li>\n<li class="ml-6 list-disc my-1">/g, '</li>\n<li class="ml-6 list-disc my-1">')
		html = html.replace(/<\/li>\n(?!<li)/g, "</li></ul>\n")

		html = html.replace(
			/<li class="ml-6 list-decimal my-1">/g,
			'<ol class="my-4 space-y-2"><li class="ml-6 list-decimal my-1">',
		)
		html = html.replace(/<\/li>\n<li class="ml-6 list-decimal my-1">/g, '</li>\n<li class="ml-6 list-decimal my-1">')
		html = html.replace(/<\/li>\n(?!<li class="ml-6 list-decimal)/g, "</li></ol>\n")

		return html
	}

	const formatInlineMarkdown = (text: string) => {
		text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-rose-300">$1</strong>')

		text = text.replace(
			/`([^`]+)`/g,
			'<code class="px-1.5 py-0.5 bg-rose-500/10 text-rose-400 rounded text-sm font-mono">$1</code>',
		)

		return text
	}

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	}

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: { type: "spring", stiffness: 100 },
		},
	}

	return (
		<main className="flex-1 overflow-y-auto bg-gradient-to-b from-background to-background/80">
			<AnimatePresence mode="wait">
				{isLoading ? (
					<motion.div
						key="loading"
						className="flex items-center justify-center h-screen"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						<div className="flex flex-col items-center">
							<div className="w-12 h-12 border-4 border-t-rose-500 rounded-full animate-spin mb-4" />
							<p className="text-muted-foreground">Loading resources...</p>
						</div>
					</motion.div>
				) : (
					<motion.div
						key="content"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="container mx-auto py-8 px-4"
					>
						{selectedResource ? (
							<motion.div
								className="space-y-6"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ type: "spring", damping: 25 }}
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<Button
											variant="outline"
											size="icon"
											onClick={() => {
												setSelectedResource(null)

												if (typeof window !== "undefined") {
													const url = new URL(window.location.href)
													url.searchParams.delete("resource")
													window.history.pushState({}, "", url)
												}
											}}
											className="hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
										>
											<ArrowLeft size={16} />
										</Button>
										<h1 className="text-2xl font-bold">{selectedResource.title}</h1>
										<Badge className={`${getCategoryColor(selectedResource.category)}`}>
											<span className="flex items-center gap-1">
												{getCategoryIcon(selectedResource.category)}
												<span>{selectedResource.category}</span>
											</span>
										</Badge>
									</div>

									{/* Share button */}
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="outline"
													size="icon"
													onClick={handleShare}
													className="hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
												>
													<Share2 size={16} />
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<p>Share this resource</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</div>

								<Card className="border border-rose-500/10 shadow-lg shadow-rose-500/5">
									<CardContent className="p-6">
										{/* Author information */}
										{selectedResource.author && (
											<div className="flex items-center gap-2 mb-4 text-muted-foreground">
												<User size={16} />
												<span>
													Author: <span className="text-rose-400">{selectedResource.author}</span>
												</span>
											</div>
										)}

										{selectedResource.isExternal ? (
											<motion.div
												className="flex flex-col items-center justify-center py-12"
												initial={{ scale: 0.95 }}
												animate={{ scale: 1 }}
												transition={{ type: "spring", damping: 20 }}
											>
												<div className={`p-4 rounded-full ${getCategoryColor(selectedResource.category)} mb-4`}>
													{selectedResource.icon}
												</div>
												<h3 className="text-xl font-bold mb-2">{selectedResource.title}</h3>
												<p className="text-muted-foreground mb-6 text-center max-w-md">
													{selectedResource.description}
												</p>
												<Button
													asChild
													className="bg-rose-500 hover:bg-rose-600 text-white transition-all duration-300"
												>
													<a href={selectedResource.url}>
														<ExternalLink size={16} className="mr-2" />
														Access External Resource
													</a>
												</Button>
											</motion.div>
										) : (
											<motion.div
												className="prose prose-invert max-w-none"
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												transition={{ delay: 0.2 }}
											>
												<div
													className="content-wrapper"
													dangerouslySetInnerHTML={{
														__html: renderMarkdown(selectedResource.content || "") ?? "",
													}}
												/>
											</motion.div>
										)}
									</CardContent>
									<CardFooter className="text-xs text-muted-foreground border-t pt-4 flex justify-between items-center">
										<span>Last updated: {selectedResource.updated}</span>
										<div className="flex gap-2">
											<Button variant="outline" size="sm" className="text-xs" onClick={() => window.print()}>
												Print / Save as PDF
											</Button>
											<Button variant="outline" size="sm" className="text-xs" onClick={handleShare}>
												<Share2 size={12} className="mr-1" />
												Share
											</Button>
										</div>
									</CardFooter>
								</Card>
							</motion.div>
						) : (
							<div className="space-y-8">
								<motion.div
									className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
									initial={{ opacity: 0, y: -20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ type: "spring" }}
								>
									<div>
										<h1 className="text-3xl font-bold text-rose-400">Documentation & Resources</h1>
										<p className="text-muted-foreground">
											Guides, tutorials and reference materials for OSINT and TRACKED.
										</p>
										<p className="text-sm text-gray-500 mt-2">
											Here are a variety of external and internal resources that may prove valuable for your research
											and investigations.
										</p>
									</div>
									<Button asChild variant="outline" className="self-start">
										<Link href="/" className="flex items-center gap-2">
											<ArrowLeft size={14} />
											Back to Home
										</Link>
									</Button>
								</motion.div>

								<motion.div
									className="flex flex-col md:flex-row gap-4 items-start md:items-center"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.1 }}
								>
									<div className="relative w-full md:w-64">
										<Search
											className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
											size={16}
										/>
										<Input
											type="text"
											placeholder="Search resources..."
											className="pl-10 border-rose-500/20 focus:border-rose-500/50 transition-colors"
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
										/>
									</div>

									<Tabs defaultValue="all" className="w-full" onValueChange={setActiveCategory}>
										<TabsList className="w-full md:w-auto flex flex-wrap justify-start">
											<TabsTrigger
												value="all"
												className="data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-400"
											>
												All
											</TabsTrigger>
											<TabsTrigger
												value="guide"
												className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
											>
												<Info size={14} className="mr-1" /> Guides
											</TabsTrigger>
											<TabsTrigger
												value="tutorial"
												className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
											>
												<BookOpen size={14} className="mr-1" /> Tutorials
											</TabsTrigger>
											<TabsTrigger
												value="reference"
												className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
											>
												<FileText size={14} className="mr-1" /> Reference
											</TabsTrigger>
											<TabsTrigger
												value="video"
												className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400"
											>
												<Video size={14} className="mr-1" /> Videos
											</TabsTrigger>
										</TabsList>
									</Tabs>
								</motion.div>

								{filteredResources.length === 0 ? (
									<motion.div
										className="flex flex-col items-center justify-center py-16 text-center"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: 0.2 }}
									>
										<HelpCircle size={48} className="text-muted-foreground mb-4" />
										<h3 className="text-xl font-medium mb-2">No resources found</h3>
										<p className="text-muted-foreground max-w-md">
											No resources match your current search criteria. Try adjusting your search or category filter.
										</p>
										<Button
											variant="outline"
											className="mt-4"
											onClick={() => {
												setSearchQuery("")
												setActiveCategory("all")
											}}
										>
											Clear filters
										</Button>
									</motion.div>
								) : (
									<motion.div
										className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
										variants={containerVariants}
										initial="hidden"
										animate="visible"
									>
										{filteredResources.map((resource) => (
											<motion.div key={resource.id} variants={itemVariants}>
												<Card className="h-full flex flex-col border border-rose-500/10 hover:border-rose-400/30 hover:shadow-lg hover:shadow-rose-500/5 transition-all duration-300 group">
													<CardHeader className="pb-2">
														<div className="flex justify-between items-start">
															<div>
																<CardTitle className="group-hover:text-rose-400 transition-colors duration-300">
																	{resource.title}
																</CardTitle>
																<CardDescription className="line-clamp-2 h-10">{resource.description}</CardDescription>
															</div>
															<div className={`p-2 rounded-lg ${getCategoryColor(resource.category)}`}>
																{resource.icon}
															</div>
														</div>
													</CardHeader>
													<CardContent className="flex-grow">
														<div className="flex flex-col gap-2">
															<Badge variant="outline" className={`${getCategoryColor(resource.category)} w-fit`}>
																{resource.category}
															</Badge>
															{resource.author && (
																<div className="flex items-center text-xs text-muted-foreground">
																	<User size={12} className="mr-1" />
																	Author: {resource.author}
																</div>
															)}
															<p className="text-xs text-muted-foreground">Updated: {resource.updated}</p>
														</div>
													</CardContent>
													<CardFooter className="pt-0">
														<Button
															className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 group-hover:bg-rose-500/20 transition-all"
															onClick={() => {
																setIsLoading(true)
																setTimeout(() => {
																	setSelectedResource(resource)

																	if (typeof window !== "undefined") {
																		const url = new URL(window.location.href)
																		url.searchParams.set("resource", resource.id)
																		window.history.pushState({}, "", url)
																	}
																	setIsLoading(false)
																}, 150)
															}}
														>
															<span className="flex items-center justify-center gap-2">
																{resource.isExternal ? (
																	<>
																		<ExternalLink size={14} />
																		Visit Resource
																	</>
																) : (
																	<>
																		<BookOpen size={14} />
																		Read Documentation
																	</>
																)}
																<ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
															</span>
														</Button>
													</CardFooter>
												</Card>
											</motion.div>
										))}
									</motion.div>
								)}
							</div>
						)}
					</motion.div>
				)}
			</AnimatePresence>

			{/* Share Dialog */}
			<Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Share this resource</DialogTitle>
						<DialogDescription>Copy the link below to share this resource with others.</DialogDescription>
					</DialogHeader>
					<div className="flex items-center space-x-2 mt-2">
						<div className="grid flex-1 gap-2">
							<div className="flex items-center border rounded-md overflow-hidden">
								<Input value={shareUrl} readOnly className="border-0 focus-visible:ring-0 text-xs md:text-sm" />
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="h-full aspect-square rounded-none"
									onClick={() => copyToClipboard(shareUrl)}
								>
									{copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
								</Button>
							</div>
						</div>
					</div>
					<div className="flex justify-between items-center mt-4">
						{/* Social sharing buttons could be added here */}
						<DialogFooter className="sm:justify-end">
							<DialogClose asChild>
								<Button type="button" variant="secondary">
									Close
								</Button>
							</DialogClose>
						</DialogFooter>
					</div>
				</DialogContent>
			</Dialog>
		</main>
	)
}
