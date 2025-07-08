"use client"

import { useEffect, useState } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import {
	Lock,
	Shield,
	Terminal,
	Database,
	Key,
	BookOpen,
	ScrollText,
	ChevronDown,
	ChevronRight,
	ChevronLeft,
	CheckCircle2,
	Mail,
	MessageSquare,
	HeartHandshake,
	Search,
	Timer,
	Handshake,
	Info,
	ShoppingCart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { PriceComparison } from "@/components/PriceComparison"
import { getAllDataSources } from "@/config/dataSources"

const rotatingWords = [
	{ text: "digital footprints", impact: true },
	{ text: "threat actors", impact: true },
	{ text: "hidden connections", impact: true },
	{ text: "vulnerabilities", impact: true },
	{ text: "darknet presence", impact: true },
	{ text: "anyone", impact: true, glow: true },
]

export interface Provider {
	icon: React.ComponentType<{ className?: string }>
	name: string
	description: string
	price: string
}

const providers = getAllDataSources().filter(
	(source) =>
		source.status === "active" &&
		source.records &&
		source.records !== "0" &&
		source.records !== "0 records" &&
		source.records !== "0+" &&
		source.records !== "0K" &&
		source.records !== "0M" &&
		source.records !== "0B",
)

export default function Home() {
	const [providerIndex, setProviderIndex] = useState(0)
	const providersPerPage = 6
	const [currentWordIndex, setCurrentWordIndex] = useState(0)
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
		const initLenis = async () => {
			const Lenis = (await import("lenis")).default

			const lenis = new Lenis({
				duration: 1.2,
				easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
				orientation: "vertical",
				smoothWheel: true,
			})

			lenis.on("scroll", (e) => {})

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

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 50)
		}
		window.addEventListener("scroll", handleScroll)
		return () => window.removeEventListener("scroll", handleScroll)
	}, [])

	useEffect(() => {
		const timing = rotatingWords[currentWordIndex].impact ? 2000 : 1500
		const interval = setInterval(() => {
			setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length)
		}, timing)
		return () => clearInterval(interval)
	}, [currentWordIndex])

	useEffect(() => {
		if (typeof window !== "undefined") {
			document.body.style.visibility = "visible"
		}
	}, [])

	interface WordProps {
		impact?: boolean
		glow?: boolean
	}

	const nextProviders = () => {
		setProviderIndex((prev) => (prev + providersPerPage >= providers.length ? 0 : prev + providersPerPage))
	}

	const prevProviders = () => {
		setProviderIndex((prev) =>
			prev === 0 ? Math.floor((providers.length - 1) / providersPerPage) * providersPerPage : prev - providersPerPage,
		)
	}

	const visibleProviders = providers.slice(providerIndex, Math.min(providerIndex + providersPerPage, providers.length))

	const wordStyles = (word: WordProps) => ({
		className: `absolute inset-0 flex items-center justify-center ${
			word.impact ? "text-rose-400 font-extrabold" : "text-rose-300"
		} ${word.glow ? "animate-pulse shadow-glow" : ""}`,
	})

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

			{/* Enhanced Navigation */}
			<motion.nav
				initial={false}
				animate={{
					y: isScrolled ? 0 : -100,
					backdropFilter: isScrolled ? "blur(16px)" : "blur(0px)",
				}}
				transition={{ duration: 0.3 }}
				className="fixed top-0 left-0 right-0 z-50 border-b border-rose-800/20"
				style={{
					background: "linear-gradient(to bottom, rgba(159, 18, 57, 0.1), rgba(159, 18, 57, 0.03))",
				}}
			>
				<div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
					<motion.div
						className="flex items-center gap-2"
						whileHover={{ scale: 1.05 }}
						transition={{ type: "spring", stiffness: 400, damping: 10 }}
					>
						<Link href="/" className="flex items-center gap-2">
							<span className="text-2xl font-black bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 bg-clip-text text-transparent">
								TRACKED
							</span>
							<Badge variant="secondary" className="bg-rose-500/10 text-rose-300 text-xs">
								OSINT
							</Badge>
						</Link>
					</motion.div>
					<div className="hidden md:flex gap-6 items-center">
						{[
							{ name: "Features", href: "#features" },
							{ name: "Matrix", href: "#matrix" },
							{ name: "Pricing", href: "#pricing" },
							{ name: "Partners", href: "/partners", icon: Handshake },
							{ name: "Resources", href: "/resources", icon: BookOpen },
							{ name: "Changelog", href: "/changelog", icon: ScrollText },
						].map((item) => (
							<motion.div
								key={item.name}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								transition={{ type: "spring", stiffness: 400, damping: 10 }}
							>
								<Button
									asChild
									variant="ghost"
									className="text-rose-300/90 hover:bg-rose-500/10 hover:text-rose-100 transition-colors"
								>
									<Link href={item.href} className="flex items-center gap-2">
										{item.icon && <item.icon className="w-4 h-4" />}
										{item.name}
									</Link>
								</Button>
							</motion.div>
						))}
					</div>
					<div className="flex gap-3">
						<motion.div
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							transition={{ type: "spring", stiffness: 400, damping: 10 }}
						>
							<Button
								asChild
								className="bg-gradient-to-r from-rose-500/90 to-rose-600/90 hover:from-rose-600/90 hover:to-rose-700/90 text-white 
								shadow-lg hover:shadow-rose-500/20 transition-all flex items-center gap-2 px-6"
							>
								<Link href="/dashboard">
									<Terminal className="w-4 h-4" />
									Dashboard
								</Link>
							</Button>
						</motion.div>
					</div>
				</div>
			</motion.nav>

			{/* Floating CTA Button */}
			<motion.div
				className="fixed bottom-6 right-6 z-50"
				initial={{ opacity: 0, scale: 0.8 }}
				animate={{
					opacity: isScrolled ? 1 : 0,
					scale: isScrolled ? 1 : 0.8,
					y: isScrolled ? 0 : 20,
				}}
				transition={{ duration: 0.3 }}
			>
				<motion.div
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					transition={{ type: "spring", stiffness: 400, damping: 10 }}
				>
					<Button
						asChild
						size="lg"
						className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white 
						shadow-xl hover:shadow-rose-500/30 transition-all flex items-center gap-2 px-6 rounded-full"
					>
						<a href="#pricing" className="flex items-center gap-2">
							Get Access
							<motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}>
								→
							</motion.span>
						</a>
					</Button>
				</motion.div>
			</motion.div>

			{/* Enhanced Hero Section with Psychological Triggers */}
			<motion.section
				className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pb-20"
				style={{ y, opacity, scale }}
			>
				{/* Animated Particles Background */}
				<motion.div
					className="absolute inset-0 z-0 opacity-40"
					initial={{ opacity: 0 }}
					animate={{ opacity: 0.4 }}
					transition={{ duration: 1.5 }}
				>
					{Array.from({ length: 50 }).map((_, i) => {
						const leftPos = `${(i * 7) % 100}%`
						const topPos = `${(i * 11) % 100}%`
						const duration = 3 + ((i * 13) % 5)
						const delay = (i * 17) % 5

						return (
							<motion.div
								key={i}
								className="absolute w-1 h-1 rounded-full bg-rose-400"
								style={{
									left: leftPos,
									top: topPos,
								}}
								animate={{
									opacity: [0.1, 0.8, 0.1],
									scale: [1, 1.5, 1],
								}}
								transition={{
									duration: duration,
									repeat: Number.POSITIVE_INFINITY,
									delay: delay,
								}}
							/>
						)
					})}
				</motion.div>

				<div className="relative z-10 text-center max-w-4xl mx-auto">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className="space-y-8"
					>
						<motion.div
							className="relative inline-block"
							whileHover={{ scale: 1.02 }}
							transition={{ type: "spring", stiffness: 400, damping: 10 }}
						>
							<span className="text-6xl md:text-8xl font-black bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 bg-clip-text text-transparent relative z-10 tracking-tight">
								TRACKED
							</span>
							<motion.div
								className="absolute inset-0 bg-rose-500/10 blur-[100px] -z-10 transform scale-150"
								animate={{
									opacity: [0.5, 0.8, 0.5],
									scale: [1.5, 1.7, 1.5],
								}}
								transition={{
									duration: 4,
									repeat: Number.POSITIVE_INFINITY,
									ease: "easeInOut",
								}}
							/>
						</motion.div>

						<div className="space-y-6">
							<h1 className="text-3xl md:text-5xl font-bold">
								<motion.div
									className="mb-4 text-rose-100/90"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.2 }}
								>
									Uncover the truth about
								</motion.div>
								<div className="h-20 md:h-24 relative">
									<AnimatePresence mode="wait">
										<motion.div
											key={currentWordIndex}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -20 }}
											transition={{
												duration: 0.4,
												ease: "easeInOut",
											}}
											{...wordStyles(rotatingWords[currentWordIndex])}
										>
											{rotatingWords[currentWordIndex].text}
										</motion.div>
									</AnimatePresence>
								</div>
							</h1>

							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.5 }}
								className="relative space-y-8"
							>
								<motion.p
									className="text-xl md:text-2xl text-rose-100/80 max-w-3xl mx-auto leading-relaxed"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.7 }}
								>
									The <span className="text-rose-400 font-semibold">ultimate intelligence platform</span> with{" "}
									<span className="text-rose-400 font-semibold">zero data retention</span> and{" "}
									<span className="text-rose-400 font-semibold">ephemeral sessions</span> for professionals who need
									answers now.
								</motion.p>

								<div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
									<motion.div
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										transition={{ type: "spring", stiffness: 400, damping: 10 }}
									>
										<Button
											asChild
											size="lg"
											className="px-8 py-7 relative group bg-gradient-to-r from-rose-500/90 to-rose-700/90 hover:shadow-[0_0_30px_rgba(244,63,94,0.3)] transition-all duration-500 text-lg w-full sm:w-auto"
										>
											<a href="#pricing" className="flex items-center gap-2">
												Access Now
												<motion.span
													animate={{ x: [0, 5, 0] }}
													transition={{
														duration: 1,
														repeat: Number.POSITIVE_INFINITY,
													}}
												>
													→
												</motion.span>
											</a>
										</Button>
									</motion.div>

									<motion.div
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										transition={{ type: "spring", stiffness: 400, damping: 10 }}
									>
										<Button
											asChild
											size="lg"
											variant="outline"
											className="px-8 py-7 border-rose-500/20 hover:bg-rose-500/10 text-rose-300 hover:text-rose-200 transition-all duration-300 text-lg w-full sm:w-auto"
										>
											<a href="#matrix" className="flex items-center gap-2">
												Explore Intelligence Matrix
											</a>
										</Button>
									</motion.div>
								</div>

								{/* Enhanced Social Proof */}
								<motion.div
									className="flex flex-wrap justify-center gap-6 mt-12 text-rose-300/60"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.9 }}
								>
									<div className="flex items-center gap-2">
										<Shield className="w-5 h-5" />
										<span>15+ Intelligence Sources</span>
									</div>
									<div className="flex items-center gap-2">
										<Database className="w-5 h-5" />
										<span>500B+ Records</span>
									</div>
									<div className="flex items-center gap-2">
										<Lock className="w-5 h-5" />
										<span>Zero Retention</span>
									</div>
									<div className="flex items-center gap-2">
										<Timer className="w-5 h-5" />
										<span>Instant Results</span>
									</div>
								</motion.div>
							</motion.div>
						</div>
					</motion.div>
				</div>

				{/* Enhanced Scroll Indicator */}
				<motion.div
					className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 2 }}
				>
					<motion.div
						animate={{
							y: [0, 10, 0],
							opacity: [0.3, 0.8, 0.3],
						}}
						transition={{
							duration: 2,
							repeat: Number.POSITIVE_INFINITY,
							ease: "easeInOut",
						}}
						className="flex flex-col items-center gap-2 text-rose-400/60 cursor-pointer group"
						onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
					>
						<ChevronDown className="w-6 h-6 group-hover:text-rose-400 transition-colors" />
						<span className="text-sm font-medium tracking-wide group-hover:text-rose-400 transition-colors">
							Explore Features
						</span>
					</motion.div>
				</motion.div>
			</motion.section>

			{/* Enhanced Features Section */}
			<section id="features" className="py-20 px-4 relative z-10">
				<div className="max-w-4xl mx-auto text-center space-y-20">
					{/* Core Value Proposition */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
						className="space-y-8"
					>
						<h2 className="text-4xl md:text-5xl font-bold">
							<span className="bg-gradient-to-r from-rose-400 to-rose-600 bg-clip-text text-transparent">
								One Platform. Unlimited Intelligence.
							</span>
						</h2>
						<p className="text-rose-200/80 text-xl max-w-2xl mx-auto leading-relaxed">
							TRACKED unifies premium OSINT sources into a single, powerful interface that delivers results in seconds,
							not hours.
						</p>
					</motion.div>

					{/* Trust Signals */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
						className="grid md:grid-cols-3 gap-8"
					>
						{[
							{
								icon: Shield,
								title: "Zero Retention",
								description:
									"Your searches are never stored. Every session is completely ephemeral for maximum privacy.",
							},
							{
								icon: Database,
								title: "500B+ Records",
								description:
									"Access the largest collection of intelligence data through one unified interface with instant results.",
							},
							{
								icon: Lock,
								title: "Secure Access",
								description: "End-to-end encryption and ephemeral sessions protect your research from prying eyes.",
							},
						].map((feature, idx) => (
							<motion.div
								key={feature.title}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: idx * 0.2 }}
								className="relative group"
								whileHover={{ y: -5 }}
							>
								<div className="absolute inset-0 bg-rose-500/5 rounded-xl blur-xl group-hover:bg-rose-500/10 transition-all duration-500" />
								<div className="relative space-y-4 p-6">
									<feature.icon className="w-8 h-8 text-rose-400 mx-auto" />
									<h3 className="text-xl font-semibold text-rose-100">{feature.title}</h3>
									<p className="text-rose-200/70 text-sm leading-relaxed">{feature.description}</p>
								</div>
							</motion.div>
						))}
					</motion.div>
				</div>
			</section>

			{/* Intelligence Matrix Section */}
			<section id="matrix" className="py-20 px-4">
				<div className="max-w-7xl mx-auto">
					<motion.div
						className="text-center mb-16 space-y-4"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
					>
						<h2 className="text-4xl md:text-5xl font-bold">
							<span className="bg-gradient-to-r from-rose-400 to-rose-600 bg-clip-text text-transparent">
								Intelligence Matrix
							</span>
						</h2>
						<p className="text-rose-200/80 text-lg max-w-3xl mx-auto">
							Access {providers.length}+ premium intelligence sources through one unified interface. New sources are
							added regularly through our{" "}
							<Link href="/partners" className="text-rose-400 hover:text-rose-300 transition-colors">
								strategic partnerships
							</Link>
							.
						</p>
					</motion.div>

					<div className="relative">
						{/* Navigation Arrows with Enhanced Styling */}
						<div className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 z-10">
							<motion.button
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
								onClick={prevProviders}
								className="w-12 h-12 rounded-full bg-rose-900/50 flex items-center justify-center text-rose-100 hover:bg-rose-800/70 transition-all hover:shadow-lg hover:shadow-rose-500/20"
							>
								<ChevronLeft className="w-6 h-6" />
							</motion.button>
						</div>

						<div className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 z-10">
							<motion.button
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
								onClick={nextProviders}
								className="w-12 h-12 rounded-full bg-rose-900/50 flex items-center justify-center text-rose-100 hover:bg-rose-800/70 transition-all hover:shadow-lg hover:shadow-rose-500/20"
							>
								<ChevronRight className="w-6 h-6" />
							</motion.button>
						</div>

						{/* Enhanced Providers Grid */}
						<AnimatePresence mode="wait">
							<motion.div
								key={providerIndex}
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -20 }}
								transition={{ duration: 0.3 }}
								className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
							>
								{visibleProviders.map((provider, idx) => (
									<motion.div
										key={provider.name}
										initial={{ opacity: 0, y: 20 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{
											duration: 0.5,
											delay: idx * 0.1,
										}}
										whileHover={{
											scale: 1.02,
											transition: { duration: 0.2 },
										}}
									>
										<Card className="bg-rose-900/20 backdrop-blur-lg border-rose-800/30 hover:border-rose-400/50 transition-all group h-full relative overflow-hidden">
											<motion.div
												className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent"
												animate={{
													opacity: [0.1, 0.2, 0.1],
												}}
												transition={{
													duration: 4,
													repeat: Number.POSITIVE_INFINITY,
													ease: "easeInOut",
												}}
											/>
											<CardContent className="pt-6 relative">
												<div className="flex items-start gap-4">
													<div className="flex-shrink-0">
														<provider.icon className="w-10 h-10 text-rose-400 mt-1 group-hover:text-rose-300 transition-colors hover:animate-spin" />
													</div>
													<div>
														<h3 className="text-xl font-semibold mb-2 text-rose-100 group-hover:text-rose-200 transition-colors">
															{provider.name}
														</h3>
														<p className="text-rose-200/70 text-sm leading-relaxed">{provider.description}</p>
														<p className="text-rose-100/90 text-sm mt-3 font-medium">
															Price:{" "}
															<span className="font-bold text-rose-400">
																{provider.price}
																{provider.priceType && `/${provider.priceType}`}
															</span>
														</p>
													</div>
												</div>
											</CardContent>
										</Card>
									</motion.div>
								))}
							</motion.div>
						</AnimatePresence>

						{/* Enhanced Pagination Indicators */}
						<div className="flex justify-center mt-12 gap-3">
							{Array.from({
								length: Math.ceil(providers.length / providersPerPage),
							}).map((_, idx) => (
								<motion.button
									key={idx}
									onClick={() => setProviderIndex(idx * providersPerPage)}
									className={`h-2 rounded-full transition-all ${
										Math.floor(providerIndex / providersPerPage) === idx
											? "bg-rose-400 w-8"
											: "bg-rose-700/50 w-2 hover:bg-rose-600/70"
									}`}
									whileHover={{ scale: 1.2 }}
									whileTap={{ scale: 0.9 }}
									aria-label={`Go to slide ${idx + 1}`}
								/>
							))}
						</div>
					</div>

					<PriceComparison className="mt-16" />
				</div>
			</section>

			{/* Enhanced Pricing Section */}
			<section id="pricing" className="py-20 px-4 relative z-10">
				<div className="max-w-7xl mx-auto">
					<motion.div
						className="text-center mb-16 space-y-6"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
					>
						<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-400/20">
							<Shield className="w-5 h-5 text-rose-400" />
							<span className="text-rose-200 font-medium">Secure & Private Access</span>
						</div>
						<h2 className="text-5xl md:text-6xl font-black">
							<span className="bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 bg-clip-text text-transparent">
								Access The Intelligence Matrix
							</span>
						</h2>
						<p className="text-rose-200/80 text-xl max-w-2xl mx-auto leading-relaxed">
							All plans include free updates, full intelligence matrix access, and zero-retention security
						</p>
					</motion.div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto relative">
						{/* Glowing Background Effect */}
						<motion.div
							className="absolute -inset-40 bg-rose-500/20 blur-[100px] rounded-full"
							animate={{
								opacity: [0.3, 0.5, 0.3],
								scale: [0.8, 1, 0.8],
							}}
							transition={{
								duration: 8,
								repeat: Number.POSITIVE_INFINITY,
								ease: "easeInOut",
							}}
						/>

						{[
							{
								duration: "24h",
								price: 5,
								storeId: "57872",
								productId: "282137",
								variantId: "292249",
								description: "Perfect for quick investigations",
								features: ["Instant access", "All intelligence sources", "Free updates", "24/7 support"],
								marketplaceLink: "https://shop.qyzar.eu/product?id=prod_SN7hFAONN5ux9Q",
								marketplaceStock: 10,
							},
							{
								duration: "7 Days",
								price: 10,
								storeId: "57872",
								productId: "282137",
								variantId: "292253",
								description: "Ideal for thorough research",
								features: ["Extended access", "All intelligence sources", "Free updates", "24/7 support"],
								marketplaceLink: "https://shop.qyzar.eu/product?id=prod_SN7gtn8fse339U",
								marketplaceStock: 10,
							},
							{
								duration: "30 Days",
								price: 18,
								storeId: "57872",
								productId: "282137",
								variantId: "292254",
								description: "Most flexible option",
								features: ["Full month access", "All intelligence sources", "Free updates", "Priority support"],
								marketplaceLink: "https://shop.qyzar.eu/product?id=prod_SN7fgYJb24v7cX",
								marketplaceStock: 10,
							},
							{
								duration: "Yearly",
								price: 90,
								storeId: "57872",
								productId: "282137",
								variantId: "292255",
								popular: true,
								description: "Best value for professionals",
								features: ["Yearly access", "All intelligence sources", "Free updates", "VIP support"],
								badge: "BEST VALUE",
								marketplaceLink: "https://shop.qyzar.eu/product?id=prod_SN7cdcmgS1oFyr",
								marketplaceStock: 10,
							},
						].map((tier, idx) => (
							<motion.div
								key={tier.duration}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{
									duration: 0.5,
									delay: idx * 0.1,
								}}
								className="relative group"
							>
								{/* Enhanced Glow Effect */}
								<motion.div
									className={`absolute inset-0 bg-gradient-to-b ${
										tier.popular ? "from-rose-500/30 to-rose-900/30" : "from-rose-500/10 to-rose-900/10"
									} rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500`}
									animate={{
										opacity: [0.5, 0.8, 0.5],
									}}
									transition={{
										duration: 4,
										repeat: Number.POSITIVE_INFINITY,
										ease: "easeInOut",
									}}
								/>

								<Card
									className={`relative backdrop-blur-xl ${
										tier.popular
											? "border-rose-400/50 bg-gradient-to-b from-rose-900/80 to-rose-950/80"
											: "border-rose-800/30 bg-gradient-to-b from-rose-900/40 to-rose-950/40"
									} hover:border-rose-400/70 transition-all h-full overflow-hidden`}
								>
									{tier.popular && (
										<div className="absolute -top-px left-0 right-0">
											<div className="bg-rose-500 text-white text-xs font-bold py-1 text-center">{tier.badge}</div>
										</div>
									)}
									<CardContent className="p-6 relative flex flex-col h-full">
										<div className="mb-6 text-center space-y-4">
											<h3 className={`text-2xl font-bold ${tier.popular ? "text-rose-100" : "text-rose-200"}`}>
												{tier.duration}
											</h3>
											<div className="flex items-center justify-center">
												<div className="flex items-start">
													<span
														className={`text-3xl font-bold mt-1 ${tier.popular ? "text-rose-400" : "text-rose-300"}`}
													>
														$
													</span>
													<span
														className={`text-6xl font-black tracking-tight ${
															tier.popular ? "text-rose-400" : "text-rose-300"
														}`}
													>
														{tier.price}
													</span>
												</div>
											</div>
											<p className="text-rose-300/70 text-sm">{tier.description}</p>
										</div>

										<div className="space-y-4 mb-8">
											<div className="space-y-3">
												{tier.features.map((feature) => (
													<motion.div
														key={feature}
														className="flex items-center gap-2 text-rose-200/90"
														whileHover={{ x: 2 }}
														transition={{
															type: "spring",
															stiffness: 400,
															damping: 10,
														}}
													>
														<CheckCircle2
															className={`w-4 h-4 ${tier.popular ? "text-rose-400" : "text-rose-500/70"}`}
														/>
														<span className="text-sm">{feature}</span>
													</motion.div>
												))}
											</div>
										</div>

										<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative mt-auto">
											<div
												className={`absolute inset-0 rounded-lg ${
													tier.popular ? "bg-rose-400/40" : "bg-rose-500/20"
												} blur-sm group-hover:blur-md transition-all duration-300 opacity-75`}
											/>

											<button
												data-sell-store={tier.storeId}
												data-sell-product={tier.productId}
												data-sell-variant={tier.variantId}
												data-sell-darkmode="true"
												data-sell-theme="e11d48"
												className={`relative w-full h-11 ${
													tier.popular
														? "bg-gradient-to-r from-rose-500/80 to-rose-600/80 hover:from-rose-600/80 hover:to-rose-700/80 text-white"
														: "bg-rose-800/50 hover:bg-rose-700/60 text-rose-100"
												} transition-all duration-300 border-0 rounded-md flex items-center justify-center gap-2`}
											>
												Get Access
												<motion.span
													animate={{ x: [0, 4, 0] }}
													transition={{
														duration: 1.5,
														repeat: Number.POSITIVE_INFINITY,
														ease: "easeInOut",
													}}
													className="opacity-75"
												>
													→
												</motion.span>
											</button>
										</motion.div>

										{tier.marketplaceLink && (
											<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative mt-3">
												<div
													className={`absolute inset-0 rounded-lg ${
														tier.popular ? "bg-rose-400/40" : "bg-rose-500/20"
													} blur-sm group-hover:blur-md transition-all duration-300 opacity-75`}
												/>
												<Button
													asChild
													className={`relative w-full h-11 ${
														tier.popular
															? "bg-gradient-to-r from-rose-500/80 to-rose-600/80 hover:from-rose-600/80 hover:to-rose-700/80 text-white"
															: "bg-rose-800/50 hover:bg-rose-700/60 text-rose-100"
													} transition-all duration-300 border-0 rounded-md flex items-center justify-center gap-2`}
												>
													<Link
														href={tier.marketplaceLink}
														target="_blank"
														rel="noopener noreferrer"
														className="flex items-center gap-2"
													>
														<ShoppingCart className="w-4 h-4" />
														More Payment Options
													</Link>
												</Button>
											</motion.div>
										)}
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
					{/* Disclaimer for Alternative Purchase Option */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="mt-10 max-w-3xl mx-auto p-6 rounded-xl relative overflow-hidden"
					>
						<div className="absolute inset-0 bg-rose-500/5 rounded-xl blur-sm" />
						<div className="relative flex items-center gap-4 text-rose-200/80 text-sm">
							<div className="p-3 rounded-full bg-rose-500/10 flex-shrink-0">
								<Info className="w-5 h-5 text-rose-300" />
							</div>
							<p>
								Having issues with payment buttons? You can purchase directly through our provider at{" "}
								<Link 
									href="https://tracked.sell.app" 
									target="_blank" 
									rel="noopener noreferrer"
									className="text-rose-400 hover:text-rose-300 transition-colors font-medium"
								>
									tracked.sell.app
								</Link>
							</p>
						</div>
					</motion.div>

					{/* Enhanced Trust Signals */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
						className="mt-20 text-center space-y-12"
					>
						<div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
							{[
								{
									icon: Shield,
									stat: "Zero",
									label: "Data Retention",
									description: "Your searches are never stored",
								},
								{
									icon: Database,
									stat: "500B+",
									label: "Records Indexed",
									description: "Largest intelligence database",
								},
								{
									icon: Lock,
									stat: "100%",
									label: "Secure",
									description: "Protected request proxying",
								},
							].map((item, idx) => (
								<motion.div
									key={item.label}
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ delay: idx * 0.1 }}
									className="relative group"
								>
									<motion.div
										className="absolute inset-0 bg-rose-500/5 rounded-xl blur-xl group-hover:bg-rose-500/10"
										animate={{
											scale: [1, 1.05, 1],
											opacity: [0.5, 0.8, 0.5],
										}}
										transition={{
											duration: 4,
											repeat: Number.POSITIVE_INFINITY,
											ease: "easeInOut",
										}}
									/>
									<div className="relative p-6 space-y-2">
										<item.icon className="w-8 h-8 text-rose-400 mx-auto mb-4" />
										<div className="text-3xl font-black bg-gradient-to-r from-rose-400 to-rose-600 bg-clip-text text-transparent">
											{item.stat}
										</div>
										<div className="text-rose-100 font-medium">{item.label}</div>
										<div className="text-rose-200/70 text-sm">{item.description}</div>
									</div>
								</motion.div>
							))}
						</div>

						{/* Money-back Guarantee */}
						<motion.div
							className="max-w-3xl mx-auto p-8 rounded-2xl relative overflow-hidden"
							whileHover={{ scale: 1.02 }}
							transition={{ type: "spring", stiffness: 400, damping: 10 }}
						>
							<div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 via-rose-600/10 to-rose-500/10" />
							<div className="relative flex flex-col items-center gap-4">
								<HeartHandshake className="w-12 h-12 text-rose-400" />
								<h3 className="text-2xl font-bold text-rose-100">24/7 Support Available</h3>
								<p className="text-rose-200/80 text-center max-w-xl">
									Get help anytime through our dedicated support channels. Contact us via Telegram or email for
									immediate assistance.
								</p>
								<div className="flex flex-col sm:flex-row gap-4">
									<motion.div
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										transition={{ type: "spring", stiffness: 400, damping: 10 }}
									>
										<Button asChild variant="secondary" className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-100">
											<a
												href="https://t.me/james_martingale"
												target="_blank"
												rel="noopener noreferrer"
												className="flex items-center gap-2"
											>
												<MessageSquare className="w-4 h-4" />
												Telegram Support
											</a>
										</Button>
									</motion.div>
									<motion.div
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										transition={{ type: "spring", stiffness: 400, damping: 10 }}
									>
										<Button asChild variant="secondary" className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-100">
											<a
												href="mailto:support@tracked.sh"
												target="_blank"
												rel="noopener noreferrer"
												className="flex items-center gap-2"
											>
												<Mail className="w-4 h-4" />
												Email Support
											</a>
										</Button>
									</motion.div>
								</div>
							</div>
						</motion.div>
					</motion.div>
				</div>
			</section>

			{/* Partners Highlight Section */}
			<section className="py-16 px-4 relative z-10">
				<div className="max-w-6xl mx-auto">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
						className="text-center mb-12 space-y-4"
					>
						<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-400/20">
							<Handshake className="w-5 h-5 text-rose-400" />
							<span className="text-rose-200 font-medium">Strategic Collaborations</span>
						</div>
						<h2 className="text-4xl md:text-5xl font-bold">
							<span className="bg-gradient-to-r from-rose-400 to-rose-600 bg-clip-text text-transparent">
								Powered by Partners
							</span>
						</h2>
						<p className="text-rose-200/80 text-lg max-w-2xl mx-auto">
							TRACKED is made possible through exclusive partnerships with premier intelligence providers.
						</p>
					</motion.div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
						{[
							{
								name: "Traceback",
								url: "traceback.sh",
								description: "Stealer log aggregator with Snusbase and NOSINT included. Over 2.1B records.",
								icon: <Search className="w-6 h-6 text-white" />,
								accentColor: "from-rose-500 to-rose-700",
							},
							{
								name: "Rutify",
								url: "rutify.fail",
								description: "Chilean data broker with over 8B+ records including RUT data.",
								icon: <Database className="w-6 h-6 text-white" />,
								accentColor: "from-rose-300 to-rose-500",
							},
							{
								name: "OSINTDog",
								url: "osintdog.com",
								description: "Multiple APIs proxy with a combined amount of over 100B records.",
								icon: <Database className="w-6 h-6 text-white" />,
								accentColor: "from-rose-300 to-rose-900",
							},
						].map((partner, idx) => (
							<motion.div
								key={partner.name}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: idx * 0.1 }}
								whileHover={{ y: -5 }}
								className="bg-rose-900/20 backdrop-blur-sm border border-rose-800/30 hover:border-rose-400/30 rounded-xl p-6 relative group"
							>
								<motion.div
									className={`absolute inset-0 bg-gradient-to-br ${partner.accentColor} opacity-5 group-hover:opacity-10 transition-all duration-300`}
									animate={{
										opacity: [0.05, 0.1, 0.05],
									}}
									transition={{
										duration: 4,
										repeat: Number.POSITIVE_INFINITY,
										ease: "easeInOut",
									}}
								/>
								<div className="flex flex-col items-center text-center relative">
									<div className={`p-3 rounded-xl bg-gradient-to-br ${partner.accentColor} mb-4`}>{partner.icon}</div>
									<h3 className="text-xl font-bold text-rose-100 mb-2">{partner.name}</h3>
									<p className="text-rose-200/80 text-sm mb-4">{partner.description}</p>
									<div className="mt-auto pt-4">
										<Link
											href="/partners"
											className="text-rose-400 hover:text-rose-300 text-sm flex items-center justify-center gap-1"
										>
											Learn more
											<motion.span
												animate={{ x: [0, 3, 0] }}
												transition={{
													duration: 1.5,
													repeat: Number.POSITIVE_INFINITY,
												}}
											>
												→
											</motion.span>
										</Link>
									</div>
								</div>
							</motion.div>
						))}
					</div>

					<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex justify-center">
						<Button
							asChild
							size="lg"
							className="bg-gradient-to-r from-rose-500/80 to-rose-600/80 hover:from-rose-500/90 hover:to-rose-600/90 text-white shadow-lg hover:shadow-rose-500/20 transition-all"
						>
							<Link href="/partners" className="px-8 py-2 flex items-center gap-2">
								<Handshake className="w-5 h-5" />
								Meet Our Partners
								<motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}>
									→
								</motion.span>
							</Link>
						</Button>
					</motion.div>
				</div>
			</section>

			{/* Free Access Section */}
			<section className="py-20 px-4 relative z-10">
				<div className="max-w-7xl mx-auto">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
						className="text-center mb-12 space-y-4"
					>
						<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-400/20">
							<HeartHandshake className="w-5 h-5 text-rose-400" />
							<span className="text-rose-200 font-medium">Community Support</span>
						</div>
						<h2 className="text-4xl md:text-5xl font-bold">
							<span className="bg-gradient-to-r from-rose-400 to-rose-600 bg-clip-text text-transparent">
								Free Access Programs
							</span>
						</h2>
						<p className="text-rose-200/80 text-lg max-w-2xl mx-auto">
							We believe in making OSINT tools accessible to those working for the greater good.
						</p>
					</motion.div>

					<div className="grid md:grid-cols-2 gap-8">
						{/* Free Access Card - Social Proof */}
						<Card className="p-8 bg-rose-900/20 backdrop-blur-lg rounded-xl border border-rose-800/30 hover:border-rose-400/50 transition-all group hover:shadow-rose-500/20 hover:shadow-xl relative overflow-hidden">
							<motion.div
								className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-transparent"
								animate={{
									opacity: [0.1, 0.2, 0.1],
								}}
								transition={{
									duration: 4,
									repeat: Number.POSITIVE_INFINITY,
									ease: "easeInOut",
								}}
							/>
							<CardContent className="p-0 relative">
								<Shield className="w-12 h-12 text-rose-400 mx-auto mb-6" />
								<h2 className="text-3xl font-bold text-rose-100 mb-4">Free Access for Activists</h2>
								<p className="text-rose-200/90 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
									Join the community of journalists, researchers, and activists using TRACKED to make a difference. We
									provide free access to those working for the greater good.
								</p>
								<motion.div
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									transition={{ type: "spring", stiffness: 400, damping: 10 }}
								>
									<Button
										asChild
										variant="secondary"
										className="bg-rose-700/30 hover:bg-rose-700/50 text-white px-8 py-6 text-lg"
									>
										<a
											href="mailto:james@tracked.sh"
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-2"
										>
											<Mail className="w-5 h-5" />
											Apply for Free Access
										</a>
									</Button>
								</motion.div>
							</CardContent>
						</Card>

						{/* API Key Contribution Card */}
						<Card className="p-8 bg-rose-900/20 backdrop-blur-lg rounded-xl border border-rose-800/30 hover:border-rose-400/50 transition-all group hover:shadow-rose-500/20 hover:shadow-xl relative overflow-hidden">
							<motion.div
								className="absolute inset-0 bg-gradient-to-r from-transparent via-rose-500/10 to-transparent"
								animate={{
									opacity: [0.1, 0.2, 0.1],
									x: ["-100%", "100%"],
								}}
								transition={{
									duration: 8,
									repeat: Number.POSITIVE_INFINITY,
									ease: "easeInOut",
								}}
							/>
							<CardContent className="p-0 relative">
								<Key className="w-12 h-12 text-rose-400 mx-auto mb-6" />
								<h2 className="text-3xl font-bold text-rose-100 mb-4">Contribute & Get Free Access</h2>
								<p className="text-rose-200/90 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
									Help expand our intelligence matrix by contributing OSINT-related API keys. Get{" "}
									<span className="text-rose-400 font-semibold">unlimited access</span> while your key is active.
								</p>
								<motion.div
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									transition={{ type: "spring", stiffness: 400, damping: 10 }}
								>
									<Button
										asChild
										variant="secondary"
										className="bg-rose-700/30 hover:bg-rose-700/50 text-white px-8 py-6 text-lg"
									>
										<a
											href="mailto:james@tracked.sh"
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-2"
										>
											<Mail className="w-5 h-5" />
											Submit Your API Key
										</a>
									</Button>
								</motion.div>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			<footer className="relative z-10 border-t border-rose-900/50 mt-20">
				<div className="max-w-7xl mx-auto py-12 px-4">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
					>
						<div className="space-y-4">
							<motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
								<h3 className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-rose-600 bg-clip-text text-transparent">
									TRACKED
								</h3>
							</motion.div>
							<p className="text-rose-200/80 text-sm leading-relaxed">
								The definitive OSINT convergence platform with ephemeral sessions and zero data retention.
							</p>
						</div>

						<div className="space-y-4">
							<h4 className="font-semibold text-rose-100">Quick Links</h4>
							<ul className="space-y-2">
								{[
									{ label: "Dashboard", href: "/dashboard", icon: Terminal },
									{ label: "Partners", href: "/partners", icon: Handshake },
									{ label: "Resources", href: "/resources", icon: BookOpen },
									{ label: "Changelog", href: "/changelog", icon: ScrollText },
									{
										label: "Telegram Support",
										href: "https://t.me/james_martingale",
										icon: MessageSquare,
										external: true,
									},
									{
										label: "Email Support",
										href: "mailto:support@tracked.sh",
										icon: Mail,
										external: true,
									},
								].map((link) => (
									<motion.li
										key={link.label}
										whileHover={{ x: 5 }}
										transition={{ type: "spring", stiffness: 400, damping: 10 }}
									>
										<Link
											href={link.href}
											className="text-rose-300/80 hover:text-rose-200 transition-colors flex items-center gap-2 text-sm"
											{...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
										>
											<link.icon className="w-4 h-4" />
											{link.label}
										</Link>
									</motion.li>
								))}
							</ul>
						</div>

						<div className="space-y-4">
							<h4 className="font-semibold text-rose-100">Legal</h4>
							<ul className="space-y-2">
								{[
									{ label: "Terms of Service", href: "/tos" },
									{ label: "Privacy Policy", href: "/privacy" },
								].map((link) => (
									<motion.li
										key={link.label}
										whileHover={{ x: 5 }}
										transition={{ type: "spring", stiffness: 400, damping: 10 }}
									>
										<Link href={link.href} className="text-rose-300/80 hover:text-rose-200 transition-colors text-sm">
											{link.label}
										</Link>
									</motion.li>
								))}
							</ul>
						</div>

						<div className="space-y-4">
							<h4 className="font-semibold text-rose-100">Security</h4>
							<ul className="space-y-3">
								{[
									{ icon: Shield, text: "Zero data retention" },
									{ icon: Lock, text: "Secure request proxying" },
									{ icon: Key, text: "Protected API access" },
								].map((item) => (
									<motion.li
										key={item.text}
										className="flex items-center gap-2 text-rose-300/80 text-sm"
										whileHover={{ scale: 1.02 }}
										transition={{ type: "spring", stiffness: 400, damping: 10 }}
									>
										<item.icon className="w-4 h-4 text-rose-400" />
										{item.text}
									</motion.li>
								))}
							</ul>
						</div>
					</motion.div>

					<motion.div
						className="mt-12 pt-8 border-t border-rose-900/50 text-center text-rose-300/60 text-sm"
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ delay: 0.2 }}
					>
						<div className="flex flex-col items-center gap-2">
							<span className="text-xl font-black bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 bg-clip-text text-transparent">
								TRACKED
							</span>
							<p>© {new Date().getFullYear()} All rights reserved.</p>
						</div>
					</motion.div>
				</div>
			</footer>
		</motion.main>
	)
}
