"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
	ArrowLeft,
	ExternalLink,
	Heart,
	Shield,
	Handshake,
	Database,
	Lock,
	Award,
	Globe,
	RefreshCw,
	Search,
	Zap,
	Server,
	TrendingUp,
	Layers,
	Dog,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { RutifyIcon } from "@/components/icons/RutifyIcon"
import { IconLock } from "@tabler/icons-react"

interface LogoProps {
	className?: string
	[key: string]: any
}

const partners = [
	{
		name: "KeyScore",
		url: "keysco.re",
		logo: (props: LogoProps) => <IconLock size={28} {...props} />,
		description: "Stealer log broker with real-time indexing and 10.5B+ records. New leaks are indexed in minutes.",
		characteristics: [
			{ icon: Database, text: "10.5B+ Records" },
			{ icon: RefreshCw, text: "Real-time Indexing" },
			{ icon: Zap, text: "Instant Updates" },
			{ icon: Search, text: "Advanced Query System" },
		],
		mainFeature: "Stealer Logs",
		accentColor: "from-rose-400 to-rose-600",
		contribution: "Provided full API access for TRACKED users",
	},
	{
		name: "OsintDog",
		url: "osintdog.com",
		logo: (props: LogoProps) => <Dog size={28} {...props} />,
		description: "Data breach search engine with access to IntelVault, HackCheck, BreachBase, and more.",
		characteristics: [
			{ icon: Database, text: "100B+ Records" },
			{ icon: Layers, text: "Aggregated Sources" },
			{ icon: Server, text: "Efficient Infrastructure" },
			{ icon: TrendingUp, text: "High Availability" },
		],
		mainFeature: "Aggregate Intelligence",
		accentColor: "from-rose-500 to-rose-700",
		contribution: "Provided full API access for TRACKED and helped us with the integration",
	},
	{
		name: "Rutify",
		url: "rutify.fail",
		logo: (props: LogoProps) => <RutifyIcon width={28} height={28} {...props} />,
		description: "Chilean data broker with over 8B+ records. Includes RUT, name, license plate and business data.",
		characteristics: [
			{ icon: Database, text: "8B+ Records" },
			{ icon: Globe, text: "Chilean Focus" },
			{ icon: Search, text: "Comprehensive Data" },
			{ icon: Lock, text: "Secure Access" },
		],
		mainFeature: "Regional Intelligence",
		accentColor: "from-rose-300 to-rose-500",
		contribution: "Complete API access with extended query capabilities",
	},
]

export default function Partners() {
	const [isScrolled, setIsScrolled] = useState(false)
	const { scrollYProgress } = useScroll()
	const background = useTransform(
		scrollYProgress,
		[0, 1],
		["linear-gradient(0deg, #0F0A0B 0%, #1A0E12 100%)", "linear-gradient(180deg, #0F0A0B 0%, #1A0E12 100%)"],
	)

	const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
	const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
	const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 50)
		}
		window.addEventListener("scroll", handleScroll)
		return () => window.removeEventListener("scroll", handleScroll)
	}, [])

	useEffect(() => {
		if (typeof window !== "undefined") {
			document.body.style.visibility = "visible"
		}
	}, [])

	useEffect(() => {
		const initLenis = async () => {
			const Lenis = (await import("lenis")).default

			const lenis = new Lenis({
				duration: 1.2,
				easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
				orientation: "vertical",
				smoothWheel: true,
			})

			function raf(time: number) {
				lenis.raf(time)
				requestAnimationFrame(raf)
			}

			requestAnimationFrame(raf)

			return () => {
				lenis.destroy()
			}
		}

		const cleanup = initLenis()

		return () => {
			if (cleanup instanceof Promise) {
				cleanup.then((cleanupFn) => {
					if (cleanupFn) cleanupFn()
				})
			}
		}
	}, [])

	return (
		<motion.main
			className="text-white min-h-screen relative"
			style={{ background }}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
		>
			{/* Enhanced Grid Background with Subtle Gradient Overlay */}
			<div className="fixed inset-0 pointer-events-none">
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: `
                linear-gradient(to right, rgba(244, 63, 94, 0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(244, 63, 94, 0.05) 1px, transparent 1px)
              `,
						backgroundSize: "4rem 4rem",
					}}
				/>
				<div
					className="absolute inset-0"
					style={{
						background: "radial-gradient(circle at 50% 50%, transparent 0%, rgba(15, 10, 11, 0.9) 100%)",
					}}
				/>
				<motion.div
					className="absolute inset-0"
					animate={{
						background: [
							"radial-gradient(800px circle at 0% 0%, rgba(244,63,94,0.07) 0%, transparent 80%)",
							"radial-gradient(800px circle at 100% 100%, rgba(244,63,94,0.07) 0%, transparent 80%)",
						],
					}}
					transition={{
						duration: 15,
						repeat: Number.POSITIVE_INFINITY,
						repeatType: "reverse",
						ease: "easeInOut",
					}}
				/>
			</div>

			{/* Back to Home Button */}
			<div className="fixed top-6 left-6 z-50">
				<motion.div
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					transition={{ type: "spring", stiffness: 400, damping: 10 }}
				>
					<Button
						asChild
						variant="ghost"
						className="text-rose-300/90 hover:bg-rose-500/10 hover:text-rose-100 transition-colors"
					>
						<Link href="/" className="flex items-center gap-2">
							<ArrowLeft className="w-4 h-4" />
							Back to Home
						</Link>
					</Button>
				</motion.div>
			</div>

			{/* Hero Section */}
			<section className="relative min-h-[50vh] flex items-center justify-center px-4 pt-20 pb-10">
				<div className="relative z-10 text-center max-w-4xl mx-auto">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className="space-y-8"
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.5, delay: 0.2 }}
							className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-rose-500/10 border border-rose-400/20 mb-6"
						>
							<Handshake className="w-5 h-5 text-rose-400" />
							<span className="text-rose-200 font-medium">Our Valued Partners</span>
						</motion.div>

						<h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 bg-clip-text text-transparent relative z-10 tracking-tight">
							<motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }}>
								Thank You
							</motion.span>{" "}
							<motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.6 }}>
								To Our Partners
							</motion.span>
						</h1>

						<motion.p
							className="text-xl md:text-2xl text-rose-100/80 max-w-3xl mx-auto leading-relaxed"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.8 }}
						>
							TRACKED is powered by exclusive partnerships with{" "}
							<span className="text-rose-400 font-semibold">KeyScore</span>,{" "}
							<span className="text-rose-400 font-semibold">Traceback</span>, and{" "}
							<span className="text-rose-400 font-semibold">Rutify</span>. Their generous API access enables our
							comprehensive intelligence matrix, providing you with unparalleled OSINT capabilities.
						</motion.p>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 1 }}
							className="flex flex-wrap justify-center gap-2 pt-4"
						>
							<Badge className="bg-rose-500/20 text-rose-200 px-3 py-1.5 border-rose-500/30">Zero data retention</Badge>
							<Badge className="bg-rose-500/20 text-rose-200 px-3 py-1.5 border-rose-500/30">Ephemeral sessions</Badge>
							<Badge className="bg-rose-500/20 text-rose-200 px-3 py-1.5 border-rose-500/30">500B+ records</Badge>
							<Badge className="bg-rose-500/20 text-rose-200 px-3 py-1.5 border-rose-500/30">
								Made possible by partners
							</Badge>
						</motion.div>
					</motion.div>
				</div>
			</section>

			{/* Partners Section */}
			<section className="py-12 px-4 relative z-10">
				<div className="max-w-7xl mx-auto space-y-20">
					{partners.map((partner, idx) => (
						<motion.div
							key={partner.name}
							initial={{ opacity: 0, y: 40 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-100px" }}
							transition={{
								duration: 0.8,
								delay: idx * 0.1,
							}}
							className="relative"
						>
							{/* Enhanced Background Glow */}
							<motion.div
								className={`absolute -inset-10 bg-gradient-to-br ${partner.accentColor} opacity-5 blur-[100px] rounded-full`}
								animate={{
									opacity: [0.05, 0.1, 0.05],
									scale: [0.8, 1, 0.8],
								}}
								transition={{
									duration: 8,
									repeat: Number.POSITIVE_INFINITY,
									ease: "easeInOut",
								}}
							/>

							<div className="grid md:grid-cols-2 gap-8 items-center">
								{/* Left Column - Enhanced Info */}
								<div className="space-y-8 order-2 md:order-1">
									<div className="space-y-4">
										<div className="flex items-center gap-3">
											<motion.div
												whileHover={{ rotate: [0, -5, 5, -5, 5, 0], scale: 1.05 }}
												transition={{ duration: 0.5 }}
												className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl font-bold bg-gradient-to-br ${partner.accentColor} text-white relative group overflow-hidden shadow-lg shadow-rose-500/20`}
											>
												<motion.div
													className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"
													whileHover={{ scale: 1.5, rotate: 12 }}
												/>
												{partner.logo({ className: "text-white" })}
											</motion.div>
											<div>
												<motion.h2
													className="text-3xl font-bold text-rose-100"
													whileHover={{ x: 3 }}
													transition={{ type: "spring", stiffness: 300 }}
												>
													{partner.name}
												</motion.h2>
												<motion.div
													className="flex items-center gap-2 text-rose-300/70"
													whileHover={{ y: -2 }}
													transition={{ type: "spring", stiffness: 300 }}
												>
													<Globe className="w-4 h-4" />
													<a
														href={`https://${partner.url}`}
														target="_blank"
														rel="noopener noreferrer"
														className="hover:text-rose-300 transition-colors flex items-center gap-1"
													>
														{partner.url}
														<motion.span whileHover={{ x: 2 }} transition={{ type: "spring", stiffness: 300 }}>
															<ExternalLink className="w-3.5 h-3.5 ml-1 opacity-50" />
														</motion.span>
													</a>
												</motion.div>
											</div>
										</div>

										<motion.p
											className="text-rose-200/80 text-lg leading-relaxed"
											whileInView={{ opacity: [0, 1], y: [10, 0] }}
											viewport={{ once: true }}
											transition={{ duration: 0.5 }}
										>
											{partner.description}
										</motion.p>

										<motion.div
											className="flex flex-wrap gap-3 pt-2"
											initial={{ opacity: 0 }}
											whileInView={{ opacity: 1 }}
											viewport={{ once: true }}
											transition={{ delay: 0.2 }}
										>
											<Badge className="bg-rose-500/20 text-rose-200 px-3 py-1.5 text-sm border-rose-500/30">
												Strategic Partner
											</Badge>
											<Badge className="bg-rose-500/10 text-rose-300 px-3 py-1.5 text-sm border-rose-500/20">
												{partner.mainFeature}
											</Badge>
										</motion.div>
									</div>

									<motion.div
										initial={{ opacity: 0, y: 20 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{ delay: 0.3 }}
									>
										<h3 className="text-xl font-semibold text-rose-200 mb-4 flex items-center gap-2">
											<Award className="w-5 h-5 text-rose-400" />
											Contribution
										</h3>
										<motion.div
											whileHover={{ scale: 1.02 }}
											transition={{ type: "spring", stiffness: 300 }}
											className="relative group"
										>
											<div className="absolute -inset-1 bg-gradient-to-r from-rose-500/20 to-rose-400/20 rounded-lg blur-sm opacity-75 group-hover:opacity-100 transition duration-200" />
											<p className="relative text-rose-100 leading-relaxed bg-rose-500/10 p-4 rounded-lg border border-rose-500/20">
												{partner.name === "KeyScore" && (
													<>
														<span className="font-semibold">KeyScore</span> has provided TRACKED with exclusive,
														unlimited API access to their cutting-edge stealer log database. This integration enables
														real-time search across 10.5B+ records with millisecond response times, dramatically
														enhancing our intelligence matrix.
													</>
												)}
												{partner.name === "OsintDog" && (
													<>
														<span className="font-semibold">OsintDog</span> has integrated their powerful aggregation
														engine directly with TRACKED, providing us API access with a wide range of search types and
														all their features.
													</>
												)}
												{partner.name === "Rutify" && (
													<>
														<span className="font-semibold">Rutify</span> has granted TRACKED complete API access to
														their comprehensive Chilean database, including extended query capabilities not available to
														standard users. This partnership significantly expands our global intelligence reach with
														high-quality regional data.
													</>
												)}
											</p>
										</motion.div>
									</motion.div>

									{/* Thank You Message */}
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{ delay: 0.4 }}
										className="bg-gradient-to-br from-rose-900/30 to-rose-950/30 p-4 rounded-lg border border-rose-500/10"
									>
										<div className="flex items-start gap-3">
											<Heart className="w-5 h-5 text-rose-400 mt-1 flex-shrink-0" />
											<p className="text-rose-200/80 text-sm italic">
												{partner.name === "KeyScore" &&
													`The KeyScore team has been instrumental in providing secure, real-time access to valuable
											intelligence data. Their cutting-edge stealer log indexing capabilities have significantly
											enhanced our platform's effectiveness.`}
												{partner.name === "OsintDog" &&
													`OsintDog's ever growing database has been a game-changer for our platform. Their exceptional
											team has worked closely with us to ensure seamless integration and optimal performance.`}
												{partner.name === "Rutify" &&
													`Rutify's regional expertise and comprehensive Chilean database have expanded our global
											intelligence capabilities significantly. Their dedicated support and robust API have made
											integration smooth and effective.`}
											</p>
										</div>
									</motion.div>
								</div>

								{/* Right Column - Enhanced Characteristics Card */}
								<div className="relative order-1 md:order-2">
									<motion.div
										className="absolute -inset-4 bg-rose-500/5 rounded-xl blur-xl"
										whileHover={{ scale: 1.02 }}
										animate={{
											opacity: [0.5, 0.8, 0.5],
										}}
										transition={{
											duration: 3,
											repeat: Number.POSITIVE_INFINITY,
											ease: "easeInOut",
										}}
									/>
									<Card className="bg-rose-900/30 backdrop-blur-lg border-rose-800/30 overflow-hidden relative group h-full shadow-xl shadow-rose-500/5">
										<motion.div
											className={`absolute inset-0 bg-gradient-to-br ${partner.accentColor} opacity-5`}
											animate={{
												opacity: [0.05, 0.1, 0.05],
											}}
											transition={{
												duration: 4,
												repeat: Number.POSITIVE_INFINITY,
												ease: "easeInOut",
											}}
										/>

										<CardHeader className="pb-2">
											<CardTitle className="text-xl text-rose-100">Key Capabilities</CardTitle>
											<CardDescription className="text-rose-300/70">
												What makes {partner.name} exceptional
											</CardDescription>
										</CardHeader>

										<CardContent className="space-y-6">
											<div className="grid grid-cols-2 gap-6">
												{partner.characteristics.map((char, i) => (
													<motion.div
														key={char.text}
														whileHover={{ y: -5, scale: 1.03 }}
														transition={{ type: "spring", stiffness: 300, damping: 15 }}
														initial={{ opacity: 0, y: 10 }}
														whileInView={{ opacity: 1, y: 0 }}
														viewport={{ once: true }}
														className="flex flex-col items-center text-center gap-3 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 hover:border-rose-400/40 hover:bg-rose-500/15 transition duration-300"
													>
														<motion.div
															animate={{ rotate: [0, 5, 0, -5, 0], scale: [1, 1.1, 1, 1.1, 1] }}
															transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, delay: i * 0.5 }}
														>
															<char.icon className={"w-8 h-8 text-rose-400"} />
														</motion.div>
														<span className="text-rose-100 font-medium text-sm">{char.text}</span>
													</motion.div>
												))}
											</div>

											<div className="pt-4">
												<motion.div
													whileHover={{ scale: 1.03 }}
													whileTap={{ scale: 0.98 }}
													className="relative group overflow-hidden rounded-lg"
												>
													<motion.div
														className="absolute inset-0 bg-gradient-to-r from-rose-400/0 via-rose-400/30 to-rose-400/0 -z-10"
														initial={{ x: "-100%", opacity: 0 }}
														whileHover={{ x: "100%", opacity: 1 }}
														transition={{ duration: 0.8 }}
													/>
													<Button
														asChild
														className={`w-full relative bg-gradient-to-r ${partner.accentColor} hover:saturate-150 text-white py-6 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-rose-500/20 z-10`}
													>
														<a
															href={`https://${partner.url}`}
															target="_blank"
															rel="noopener noreferrer"
															className="flex items-center justify-center gap-2"
														>
															<span>Visit {partner.name}</span>
															<motion.span
																animate={{ x: [0, 5, 0] }}
																transition={{
																	duration: 1,
																	repeat: Number.POSITIVE_INFINITY,
																}}
															>
																<ExternalLink className="w-4 h-4" />
															</motion.span>
														</a>
													</Button>
												</motion.div>
											</div>
										</CardContent>
									</Card>
								</div>
							</div>

							{idx < partners.length - 1 && <Separator className="my-20 bg-rose-800/30" />}
						</motion.div>
					))}
				</div>
			</section>

			{/* Collaboration Banner */}
			<section className="py-20 px-4 relative z-10">
				<div className="max-w-5xl mx-auto">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
						className="p-8 md:p-12 rounded-2xl bg-gradient-to-br from-rose-900/40 to-rose-950/60 border border-rose-800/40 relative overflow-hidden"
					>
						<div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-20" />

						{/* Enhanced glowing effect */}
						<motion.div
							className="absolute -inset-40 bg-rose-500/10 blur-[100px] rounded-full"
							animate={{
								opacity: [0.1, 0.2, 0.1],
								scale: [0.8, 1, 0.8],
							}}
							transition={{
								duration: 8,
								repeat: Number.POSITIVE_INFINITY,
								ease: "easeInOut",
							}}
						/>

						{/* Floating particles */}
						{Array.from({ length: 20 }).map((_, i) => (
							<motion.div
								key={i}
								className="absolute w-1 h-1 rounded-full bg-rose-400"
								style={{
									left: `${Math.random() * 100}%`,
									top: `${Math.random() * 100}%`,
								}}
								animate={{
									opacity: [0.1, 0.8, 0.1],
									scale: [1, 1.5, 1],
									y: [0, -20, 0],
								}}
								transition={{
									duration: 3 + Math.random() * 5,
									repeat: Number.POSITIVE_INFINITY,
									delay: Math.random() * 5,
									ease: "easeInOut",
								}}
							/>
						))}

						<div className="relative space-y-8 flex flex-col items-center text-center">
							<motion.div
								initial={{ scale: 0.8, opacity: 0 }}
								whileInView={{ scale: 1, opacity: 1 }}
								viewport={{ once: true }}
								transition={{ type: "spring", stiffness: 400, damping: 10 }}
							>
								<Heart className="w-14 h-14 text-rose-400" />
							</motion.div>

							<motion.h2
								className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-rose-300 to-rose-500 bg-clip-text text-transparent"
								initial={{ y: 20, opacity: 0 }}
								whileInView={{ y: 0, opacity: 1 }}
								viewport={{ once: true }}
								transition={{ delay: 0.2 }}
							>
								Become a Partner
							</motion.h2>

							<motion.p
								className="text-xl text-rose-100/80 max-w-2xl"
								initial={{ y: 20, opacity: 0 }}
								whileInView={{ y: 0, opacity: 1 }}
								viewport={{ once: true }}
								transition={{ delay: 0.3 }}
							>
								Join our exclusive network of intelligence providers and help build the most comprehensive OSINT
								platform available. Your contribution makes a real difference.
							</motion.p>

							<motion.div
								initial={{ y: 20, opacity: 0 }}
								whileInView={{ y: 0, opacity: 1 }}
								viewport={{ once: true }}
								transition={{ delay: 0.4 }}
								className="flex flex-col sm:flex-row gap-4"
							>
								<motion.div
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									transition={{ type: "spring", stiffness: 400, damping: 10 }}
								>
									<Button
										asChild
										size="lg"
										className="bg-gradient-to-r from-rose-500/90 to-rose-700/90 hover:shadow-[0_0_30px_rgba(244,63,94,0.3)] transition-all duration-500 text-lg w-full sm:w-auto relative overflow-hidden group"
									>
										<a href="mailto:james@tracked.sh" className="flex items-center gap-2 px-8 py-6 relative z-10">
											Partner with Us
											<motion.span
												animate={{ x: [0, 5, 0] }}
												transition={{
													duration: 1,
													repeat: Number.POSITIVE_INFINITY,
												}}
											>
												→
											</motion.span>
											<motion.div
												className="absolute inset-0 bg-gradient-to-r from-rose-400/0 via-rose-400/30 to-rose-400/0 -z-10"
												initial={{ x: "-100%", opacity: 0 }}
												whileHover={{ x: "100%", opacity: 1 }}
												transition={{ duration: 0.8 }}
											/>
										</a>
									</Button>
								</motion.div>
							</motion.div>
						</div>
					</motion.div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-rose-900/30 py-10 relative z-10">
				<div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
					<div className="flex items-center gap-2">
						<motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
							<Link href="/" className="flex items-center gap-2">
								<span className="text-2xl font-black bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 bg-clip-text text-transparent">
									TRACKED
								</span>
								<Badge variant="secondary" className="bg-rose-500/10 text-rose-300 text-xs">
									OSINT
								</Badge>
							</Link>
						</motion.div>
					</div>

					<div className="text-rose-200/50 text-sm flex items-center gap-2">
						<Shield className="w-4 h-4 text-rose-400/70" />
						<span>Zero retention | Ephemeral sessions | Secure intelligence</span>
					</div>

					<div>
						<Button
							asChild
							variant="ghost"
							className="text-rose-300/90 hover:bg-rose-500/10 hover:text-rose-100 transition-colors"
						>
							<Link href="/" className="flex items-center gap-2">
								<ArrowLeft className="w-4 h-4" />
								Back to Home
							</Link>
						</Button>
					</div>
				</div>
			</footer>
		</motion.main>
	)
}
