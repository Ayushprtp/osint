"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { SearchSlash, ChevronRight, AlertTriangle, CheckCircle2, ChevronDown, LogOut } from "lucide-react"
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { authClient } from "@/client"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { toast } from "sonner"
import { DATA_SOURCES, DATA_SOURCE_CATEGORIES, type DataSource } from "@/config/dataSources"
import { cn } from "@/lib/utils"

export function AppSidebar() {
	const pathname = usePathname()
	const session = authClient.useSession()
	const userName = session.data?.user.name
	const [isLoading, setIsLoading] = useState(true)
	const [hoveredItem, setHoveredItem] = useState<string | null>(null)
	const [showFullHash, setShowFullHash] = useState(false)
	const [hasSubscription, setHasSubscription] = useState(false)
	const [isScrollable, setIsScrollable] = useState(false)
	const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
		"Breach Data": true,
		"OSINT Tools": true,
		"Specialized Data": true,
		Account: true,
		Resources: true,
	})
	const router = useRouter()

	useEffect(() => {
		const fetchSubscription = async () => {
			if (session.data?.user.id) {
				try {
					const response = await fetch(`/api/user/subscription?userId=${session.data.user.id}`)
					const data = await response.json()
					setHasSubscription(!!data.subscription)
				} catch (error) {
					console.error("Failed to fetch subscription:", error)
					setHasSubscription(false)
				}
			}
		}

		if (session.data) {
			fetchSubscription()
		}
	}, [session.data])

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsLoading(false)
		}, 300)
		return () => clearTimeout(timer)
	}, [])

	useEffect(() => {
		const checkScrollability = () => {
			const sidebarContent = document.getElementById("sidebar-scrollable-content")
			if (sidebarContent) {
				setIsScrollable(sidebarContent.scrollHeight > sidebarContent.clientHeight)
			}
		}

		checkScrollability()
		window.addEventListener("resize", checkScrollability)
		return () => window.removeEventListener("resize", checkScrollability)
	}, [])

	const itemVariants = {
		hidden: { opacity: 0, x: -20 },
		visible: {
			opacity: 1,
			x: 0,
			transition: {
				duration: 0.2,
				type: "spring",
				stiffness: 100,
			},
		},
	}

	const standaloneItemVariants = {
		hidden: { opacity: 0, x: -20 },
		visible: (i: number) => ({
			opacity: 1,
			x: 0,
			transition: {
				delay: i * 0.03,
				duration: 0.2,
				type: "spring",
				stiffness: 100,
			},
		}),
	}

	const getItemsByCategory = () => {
		const categorizedItems: Record<string, DataSource[]> = {}

		DATA_SOURCES.forEach((item) => {
			if (item.category) {
				if (!categorizedItems[item.category]) {
					categorizedItems[item.category] = []
				}
				categorizedItems[item.category].push(item)
			}
		})

		return categorizedItems
	}

	const categorizedItems = getItemsByCategory()
	const dashboardItem = DATA_SOURCES.find((item) => item.category === "dashboard")

	const renderBadge = (isNew?: boolean, isPopular?: boolean, isFree?: boolean) => {
		if (isNew) {
			return <Badge className="ml-auto text-xs bg-blue-400/10 text-blue-400 border-blue-400/20">NEW</Badge>
		}
		if (isPopular) {
			return <Badge className="ml-auto text-xs bg-rose-400/10 text-rose-400 border-rose-400/20">HOT</Badge>
		}
		if (isFree) {
			return <Badge className="ml-auto text-xs bg-green-400/10 text-green-400 border-green-400/20">FREE</Badge>
		}
		return null
	}

	const toggleCategory = (category: string) => {
		setTimeout(() => {
			setExpandedCategories((prev) => ({
				...prev,
				[category]: !prev[category],
			}))
		}, 50)
	}

	const renderNavItem = (item: DataSource, index: number, isStandalone = false) => {
		const isActive = pathname === item.path
		const isActiveParent = !isActive && pathname.startsWith(`${item.path}/`)

		return (
			<motion.div
				key={item.path}
				variants={isStandalone ? standaloneItemVariants : itemVariants}
				custom={index}
				initial="hidden"
				animate="visible"
				whileHover={{ x: 3 }}
				transition={{ duration: 0.2 }}
				className="overflow-hidden"
			>
				<SidebarMenuItem>
					<Tooltip>
						<TooltipTrigger asChild>
							<SidebarMenuButton asChild isActive={isActive || isActiveParent}>
								<Link
									href={item.path}
									className={`group inline-flex h-9 w-full items-center justify-between rounded-md px-3 text-sm font-medium transition-colors hover:bg-rose-500/10 hover:text-rose-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${
										isActive
											? "bg-rose-500/20 text-rose-400"
											: isActiveParent
												? "bg-rose-500/10 text-rose-300"
												: "text-muted-foreground"
									}`}
									onMouseEnter={() => setHoveredItem(item.path)}
									onMouseLeave={() => setHoveredItem(null)}
								>
									<div className="flex items-center gap-2.5">
										<div
											className={`flex items-center justify-center w-5 h-5 ${isActive || isActiveParent ? "text-rose-400" : "text-muted-foreground"}`}
										>
											<item.icon className="h-4 w-4" />
										</div>
										<span>{item.name}</span>
									</div>
									<div className="flex items-center">
										{renderBadge(item.isNew, item.isPopular, item.isFree)}
										{hoveredItem === item.path && !isActive && (
											<ChevronRight
												size={14}
												className="ml-1 opacity-50 transition-transform group-hover:translate-x-1"
											/>
										)}
									</div>
								</Link>
							</SidebarMenuButton>
						</TooltipTrigger>
						<TooltipContent side="right" className="bg-black/90 border-rose-500/20" style={{ maxWidth: "200px" }}>
							<div className="max-w-[200px]">
								<p className="font-medium text-rose-400">{item.name}</p>
								<p className="text-xs text-muted-foreground">{item.description}</p>
							</div>
						</TooltipContent>
					</Tooltip>
				</SidebarMenuItem>
			</motion.div>
		)
	}

	const handleLogout = async () => {
		try {
			await authClient.signOut()
			toast.success("Logged out successfully")
			router.push("/")
		} catch (error) {
			console.error("Logout error:", error)
			toast.error("An error occurred during logout")
		}
	}

	return (
		<AnimatePresence mode="wait">
			{isLoading ? (
				<motion.div
					key="loading"
					className="fixed top-0 left-0 z-40 h-screen w-[250px] border-r bg-background flex items-center justify-center overflow-hidden"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
				>
					<div className="flex flex-col items-center">
						<div className="w-8 h-8 border-3 border-t-rose-500 rounded-full animate-spin mb-4" />
						<p className="text-muted-foreground text-sm">Loading...</p>
					</div>
				</motion.div>
			) : (
				<Sidebar className="fixed top-0 left-0 z-40 h-screen w-[250px] border-r border-rose-500/10 bg-background/95 backdrop-blur-sm transition-all duration-300 overflow-hidden">
					<motion.div
						className="flex h-full flex-col justify-between p-4 overflow-hidden"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.3 }}
					>
						<div className="flex flex-col h-full overflow-hidden">
							{/* Sidebar header (fixed at top) */}
							<SidebarHeader className="mb-6 flex-shrink-0">
								<Link href="/" className="group flex items-center space-x-2 px-2">
									<motion.div
										initial={{ rotate: -10, scale: 0.9 }}
										animate={{ rotate: 0, scale: 1 }}
										transition={{
											type: "spring",
											stiffness: 260,
											damping: 20,
											delay: 0.3,
										}}
										className="bg-rose-500/10 p-1.5 rounded-md"
									>
										<SearchSlash
											width={24}
											height={24}
											className="text-rose-400 transition-colors duration-200 group-hover:text-rose-300"
										/>
									</motion.div>
									<motion.span
										className="text-lg font-bold text-white/90 transition-colors duration-200 group-hover:text-rose-400"
										initial={{ opacity: 0, x: -10 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: 0.4, duration: 0.3 }}
									>
										TRACKED
									</motion.span>
								</Link>
							</SidebarHeader>

							{/* Scrollable content area */}
							<div
								id="sidebar-scrollable-content"
								className={cn("flex-grow overflow-y-auto pr-2 -mr-2", {
									"scrollbar-thin scrollbar-track-rose-500/5 scrollbar-thumb-rose-500/20 hover:scrollbar-thumb-rose-500/30":
										isScrollable,
								})}
							>
								<SidebarContent className="overflow-hidden">
									{/* Dashboard item at top level */}
									{dashboardItem && (
										<div className="mb-4">
											<SidebarMenu className="overflow-hidden">
												<TooltipProvider delayDuration={300}>{renderNavItem(dashboardItem, 0, true)}</TooltipProvider>
											</SidebarMenu>
										</div>
									)}

									{/* Main categories */}
									{Object.entries(DATA_SOURCE_CATEGORIES).map(([categoryKey, category], categoryIndex) => {
										if (categoryKey === "dashboard" || categoryKey === "resources") return null

										const categoryItems = categorizedItems[categoryKey] || []
										if (categoryItems.length === 0) return null

										return (
											<div
												key={categoryKey}
												className={`mb-3 ${categoryIndex > 0 ? "pt-2 border-t border-rose-500/5" : ""}`}
											>
												<Collapsible
													open={expandedCategories[category.name]}
													onOpenChange={() => toggleCategory(category.name)}
													className="space-y-1"
												>
													<CollapsibleTrigger asChild>
														<button className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-rose-300/80 uppercase tracking-wider hover:text-rose-300 transition-colors rounded-md hover:bg-rose-500/5">
															<div className="flex items-center gap-2">
																<div className="w-5 h-5 flex items-center justify-center bg-rose-500/10 rounded-md">
																	<category.icon className="h-3.5 w-3.5 text-rose-400" />
																</div>
																<span>{category.name}</span>
																{categoryItems.length > 1 && (
																	<span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400/80">
																		{categoryItems.length}
																	</span>
																)}
															</div>
															<ChevronDown
																className={`h-3.5 w-3.5 transition-transform duration-200 ${
																	expandedCategories[category.name] ? "rotate-0" : "-rotate-90"
																}`}
															/>
														</button>
													</CollapsibleTrigger>
													<CollapsibleContent className="space-y-1 overflow-hidden">
														<div className="py-1">
															<SidebarMenu className="overflow-hidden">
																<TooltipProvider delayDuration={300}>
																	<motion.div
																		initial={{ opacity: 0 }}
																		animate={{ opacity: 1 }}
																		transition={{ duration: 0.2 }}
																	>
																		{categoryItems.map((item, index) => renderNavItem(item, index))}
																	</motion.div>
																</TooltipProvider>
															</SidebarMenu>
														</div>
													</CollapsibleContent>
												</Collapsible>
											</div>
										)
									})}

									{/* Resources section */}
									<div className="mt-2 border-t border-rose-500/10 pt-3">
										<div className="px-3 py-1.5">
											<p className="text-xs font-medium text-rose-300/70 uppercase tracking-wider">Resources</p>
										</div>
										<SidebarMenu className="overflow-hidden">
											<TooltipProvider delayDuration={300}>
												{categorizedItems.resources?.map((item, index) => renderNavItem(item, index, true))}
											</TooltipProvider>
										</SidebarMenu>
									</div>
								</SidebarContent>
							</div>

							{/* Overflow indicator */}
							{isScrollable && (
								<div className="absolute bottom-20 left-0 right-0 flex justify-center pointer-events-none">
									<motion.div
										animate={{
											y: [0, 5, 0],
											opacity: [0.4, 0.7, 0.4],
										}}
										transition={{
											repeat: Number.POSITIVE_INFINITY,
											duration: 1.5,
											ease: "easeInOut",
										}}
										className="bg-rose-500/10 rounded-full p-1"
									>
										<ChevronDown size={14} className="text-rose-400 opacity-70" />
									</motion.div>
								</div>
							)}
						</div>

						{/* User info section (fixed at bottom) */}
						{userName && (
							<div className="mt-4 px-2 max-w-full flex-shrink-0">
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.5 }}
									className={`flex items-center gap-3 rounded-md p-3 border overflow-hidden relative ${
										hasSubscription ? "border-rose-500/30" : "border-slate-800/60"
									}`}
									style={
										hasSubscription
											? {
													background: "linear-gradient(135deg, rgba(40,20,30,0.6) 0%, rgba(60,30,45,0.6) 100%)",
													boxShadow: "0 4px 15px -3px rgba(244,63,94,0.15), inset 0 1px 0px rgba(244,63,94,0.1)",
												}
											: {
													background: "linear-gradient(135deg, rgba(20,20,20,0.6) 0%, rgba(25,25,25,0.6) 100%)",
													boxShadow: "inset 0 1px 0px rgba(255,255,255,0.03)",
												}
									}
								>
									{/* User avatar */}
									<div
										className={`h-8 w-8 rounded-full flex items-center justify-center relative z-10 ${
											hasSubscription
												? "bg-gradient-to-br from-rose-400/50 to-rose-600/70 text-white"
												: "bg-slate-800 text-slate-400"
										}`}
										style={
											hasSubscription
												? {
														boxShadow:
															"0 0 0 1px rgba(244,63,94,0.3), 0 0 0 3px rgba(244,63,94,0.1), 0 0 10px rgba(244,63,94,0.2)",
													}
												: {}
										}
									>
										<span className="relative z-10 font-semibold">{userName.charAt(0).toUpperCase()}</span>
									</div>

									<div className="overflow-hidden flex-1 relative z-10">
										<div className="flex items-center justify-between gap-2 w-full">
											<p
												className={`text-sm font-medium truncate ${hasSubscription ? "text-rose-50" : "text-slate-300"}`}
											>
												{showFullHash ? userName : `${userName.slice(0, -5)}*****`}
											</p>
											<button
												onClick={() => setShowFullHash(!showFullHash)}
												className="text-xs transition-colors whitespace-nowrap text-rose-400/70 hover:text-rose-300"
											>
												{showFullHash ? "Hide" : "Show"}
											</button>
										</div>
										<div className="flex items-center gap-1">
											{hasSubscription ? (
												<>
													<CheckCircle2 size={12} className="text-rose-400" />
													<p className="text-xs font-medium text-rose-300/80">Premium</p>
												</>
											) : (
												<>
													<AlertTriangle size={12} className="text-amber-400" />
													<p className="text-xs text-slate-400">Free User</p>
												</>
											)}
										</div>
									</div>
								</motion.div>

								{/* Add Logout Button */}
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.6 }}
									className="mt-2"
								>
									<button
										onClick={handleLogout}
										className="flex items-center justify-center gap-1.5 w-full text-center text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 py-2 rounded-md transition-colors"
									>
										<LogOut size={14} />
										Logout
									</button>
								</motion.div>

								{/* Subscription CTA for non-subscribers */}
								{!hasSubscription && (
									<motion.div
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.7 }}
										className="mt-2"
									>
										<Link
											href="/dashboard/claim"
											className="block w-full text-center text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 py-2 rounded-md transition-colors"
										>
											Upgrade to Premium
										</Link>
									</motion.div>
								)}
							</div>
						)}
					</motion.div>
				</Sidebar>
			)}
		</AnimatePresence>
	)
}
