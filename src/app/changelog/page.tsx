"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import {
	Star,
	Clock,
	RefreshCw,
	ArrowLeft,
	GitBranch,
	GitCommit,
	Shield,
	Search,
	ChevronDown,
	ChevronUp,
	Filter,
	Calendar,
	Rocket,
} from "lucide-react"
import { changelogEntries, type ChangelogEntry } from "@/lib/changelog"

interface ReleaseGroup {
	month: string
	releases: ChangelogEntry[]
}

export default function ChangelogPage() {
	const [isLoading, setIsLoading] = useState(true)
	const [expandedVersions, setExpandedVersions] = useState<string[]>([])
	const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
	const [searchQuery, setSearchQuery] = useState("")

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsLoading(false)

			setExpandedVersions([changelogEntries[0].version])
		}, 800)

		return () => clearTimeout(timer)
	}, [])

	const groupReleasesByMonth = (entries: ChangelogEntry[]): ReleaseGroup[] => {
		const groups: { [key: string]: ChangelogEntry[] } = {}

		entries.forEach((entry) => {
			const date = new Date(entry.date)

			const monthYear = `${date.toLocaleString("default", { month: "long", timeZone: "UTC" })} ${date.getUTCFullYear()}`

			if (!groups[monthYear]) {
				groups[monthYear] = []
			}

			groups[monthYear].push(entry)
		})

		return Object.keys(groups).map((month) => ({
			month,
			releases: groups[month],
		}))
	}

	const filteredEntries = changelogEntries.filter((entry) => {
		const matchesFilter = !selectedFilter || entry.type === selectedFilter
		const matchesSearch =
			!searchQuery ||
			entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
			entry.details?.some((detail) => detail.toLowerCase().includes(searchQuery.toLowerCase()))

		return matchesFilter && matchesSearch
	})

	const releaseGroups = groupReleasesByMonth(filteredEntries)

	const toggleExpanded = (version: string) => {
		setExpandedVersions((prev) => (prev.includes(version) ? prev.filter((v) => v !== version) : [...prev, version]))
	}

	const isExpanded = (version: string) => expandedVersions.includes(version)

	const getTypeIcon = (type: string) => {
		switch (type) {
			case "feature":
				return <Star size={14} />
			case "fix":
				return <Clock size={14} />
			case "update":
				return <RefreshCw size={14} />
			case "security":
				return <Shield size={14} />
			case "release":
				return <Rocket size={14} />
			default:
				return null
		}
	}

	const getTypeColor = (type: string) => {
		switch (type) {
			case "feature":
				return "bg-green-400/10 text-green-400"
			case "fix":
				return "bg-blue-400/10 text-blue-400"
			case "update":
				return "bg-amber-400/10 text-amber-400"
			case "security":
				return "bg-red-400/10 text-red-400"
			case "release":
				return "bg-purple-400/10 text-purple-400"
			default:
				return "bg-gray-400/10 text-gray-400"
		}
	}

	const cardVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
		exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
	}

	const detailsVariants = {
		hidden: { opacity: 0, height: 0 },
		visible: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
		exit: { opacity: 0, height: 0, transition: { duration: 0.2 } },
	}

	const filterOptions = [
		{ value: "feature", label: "Features" },
		{ value: "fix", label: "Fixes" },
		{ value: "update", label: "Updates" },
		{ value: "security", label: "Security" },
		{ value: "release", label: "Releases" },
	]

	return (
		<main className="flex-1 overflow-y-auto bg-gradient-to-b from-background to-background/80">
			<div className="container mx-auto py-8 px-4">
				{isLoading ? (
					<div className="flex flex-col items-center justify-center py-20 space-y-4">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-400" />
						<p className="text-muted-foreground">Loading changelog...</p>
					</div>
				) : (
					<motion.div
						className="space-y-6"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5 }}
					>
						{/* Header and navigation */}
						<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
							<div>
								<h1 className="text-3xl font-bold tracking-tight">Complete Changelog</h1>
								<p className="text-muted-foreground">Full version history and release notes</p>
							</div>
							<Link
								href="/"
								className="group px-4 py-2 bg-muted rounded-md hover:bg-muted/80 transition-colors text-sm flex items-center gap-2"
							>
								<ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform duration-200" />
								<span>Back to Home</span>
							</Link>
						</div>

						{/* Current version card */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: 0.1 }}
						>
							<Card className="border-rose-400/30 bg-gradient-to-r from-rose-950/20 to-rose-900/10 backdrop-blur-sm overflow-hidden">
								<CardContent className="p-6">
									<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
										<div className="flex items-center gap-3">
											<div className="p-3 bg-rose-500/20 rounded-lg">
												<GitCommit size={22} className="text-rose-400" />
											</div>
											<div>
												<h2 className="text-xl font-bold">Current Version: {changelogEntries[0].version}</h2>
												<p className="text-sm text-muted-foreground">Released on {changelogEntries[0].date}</p>
											</div>
										</div>
										<div className="flex items-center gap-3 flex-wrap">
											<div className="flex items-center gap-2 bg-background/50 rounded-full px-3 py-1.5">
												<Calendar size={14} className="text-rose-400" />
												<span className="text-xs font-medium">{changelogEntries.length} Releases</span>
											</div>
											<div className="px-3 py-1.5 bg-rose-500/20 rounded-full text-sm flex items-center gap-2">
												<GitBranch size={14} />
												<span className="font-medium">main</span>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</motion.div>

						{/* Search and filter section */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: 0.2 }}
							className="flex flex-col md:flex-row gap-4"
						>
							<div className="relative flex-grow">
								<Search
									size={16}
									className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
								/>
								<input
									type="text"
									placeholder="Search changelog..."
									className="w-full py-2 pl-10 pr-4 bg-muted rounded-md border border-transparent focus:border-rose-400/50 focus:outline-none transition-colors"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
							</div>
							<div className="flex gap-2 flex-wrap">
								<div className="flex items-center bg-muted p-1 rounded-md">
									<Filter size={14} className="text-muted-foreground ml-2" />
									{filterOptions.map((option) => (
										<button
											key={option.value}
											className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
												selectedFilter === option.value ? getTypeColor(option.value) : "hover:bg-background/80"
											}`}
											onClick={() => setSelectedFilter(selectedFilter === option.value ? null : option.value)}
										>
											{option.label}
										</button>
									))}
								</div>
							</div>
						</motion.div>

						{/* Empty state */}
						{releaseGroups.length === 0 && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className="flex flex-col items-center justify-center py-16 space-y-3"
							>
								<Search size={40} className="text-muted-foreground opacity-40" />
								<p className="text-muted-foreground font-medium">No matching releases found</p>
								<button
									className="text-sm text-rose-400 hover:text-rose-300 transition-colors"
									onClick={() => {
										setSearchQuery("")
										setSelectedFilter(null)
									}}
								>
									Clear filters
								</button>
							</motion.div>
						)}

						{/* Release groups */}
						<AnimatePresence>
							{releaseGroups.map((group, groupIndex) => (
								<motion.div
									key={group.month}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -20 }}
									transition={{ duration: 0.4, delay: 0.1 + groupIndex * 0.05 }}
									className="space-y-4"
								>
									<h2 className="text-xl font-semibold px-2 pt-4 flex items-center gap-2">
										<Calendar size={16} className="text-rose-400" />
										{group.month}
									</h2>

									<AnimatePresence>
										{group.releases.map((release, releaseIndex) => (
											<motion.div
												key={release.version}
												variants={cardVariants}
												initial="hidden"
												animate="visible"
												exit="exit"
												transition={{ delay: releaseIndex * 0.05 }}
											>
												<Card
													className={`border hover:border-rose-400/30 transition-all duration-300 cursor-pointer ${
														isExpanded(release.version) ? "border-rose-400/30 shadow-md" : ""
													}`}
													onClick={() => toggleExpanded(release.version)}
												>
													<CardHeader className="pb-2">
														<div className="flex justify-between items-start">
															<div>
																<div className="flex items-center gap-2">
																	<CardTitle>Version {release.version}</CardTitle>
																	<div
																		className={`text-xs font-medium px-2 py-0.5 rounded-full ${getTypeColor(release.type)}`}
																	>
																		{release.type}
																	</div>
																</div>
																<CardDescription>Released on {release.date}</CardDescription>
															</div>
															<div className="flex items-center gap-3">
																<div className={`p-2 rounded-lg ${getTypeColor(release.type)}`}>
																	{getTypeIcon(release.type)}
																</div>
																{isExpanded(release.version) ? (
																	<ChevronUp size={16} className="text-muted-foreground" />
																) : (
																	<ChevronDown size={16} className="text-muted-foreground" />
																)}
															</div>
														</div>
													</CardHeader>
													<CardContent>
														<h3 className="text-base font-semibold mb-2">{release.description}</h3>

														<AnimatePresence>
															{isExpanded(release.version) && (
																<motion.div
																	variants={detailsVariants}
																	initial="hidden"
																	animate="visible"
																	exit="hidden"
																	className="overflow-hidden"
																>
																	<ul className="space-y-3 pt-2">
																		{release.details?.map((detail, detailIndex) => (
																			<motion.li
																				key={detailIndex}
																				initial={{ opacity: 0, x: -10 }}
																				animate={{ opacity: 1, x: 0 }}
																				transition={{
																					delay: 0.1 + detailIndex * 0.05,
																				}}
																				className="flex items-start gap-3 group"
																			>
																				<div className="min-w-4 mt-1.5">
																					<div className="w-2 h-2 rounded-full bg-rose-400 group-hover:scale-125 transition-transform" />
																				</div>
																				<span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
																					{detail}
																				</span>
																			</motion.li>
																		))}
																	</ul>
																</motion.div>
															)}
														</AnimatePresence>
													</CardContent>
												</Card>
											</motion.div>
										))}
									</AnimatePresence>
								</motion.div>
							))}
						</AnimatePresence>
					</motion.div>
				)}
			</div>
		</main>
	)
}
