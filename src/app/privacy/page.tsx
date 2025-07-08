"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { Shield, Lock, Eye, FileText, ChevronLeft, Database, Clock, User, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const fadeInUpVariant = {
	hidden: { opacity: 0, y: 20 },
	visible: (index: number) => ({
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.7,
			ease: [0.22, 1, 0.36, 1],
			delay: 0.1 * index,
		},
	}),
}

export default function PrivacyPolicy() {
	useEffect(() => {
		if (typeof window !== "undefined") {
			document.body.style.visibility = "visible"

			document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
				anchor.addEventListener("click", (e) => {
					e.preventDefault()
					const href = anchor.getAttribute("href")
					if (href)
						document.querySelector(href)?.scrollIntoView({
							behavior: "smooth",
						})
				})
			})
		}
	}, [])

	return (
		<motion.main
			className="text-white min-h-screen relative"
			style={{
				background: "linear-gradient(135deg, #0F0A0B 0%, #1A0E12 50%, #2D121B 100%)",
			}}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.8 }}
		>
			{/* Animated grid background */}
			<motion.div
				className="fixed inset-0 pointer-events-none"
				style={{
					backgroundImage: `
            linear-gradient(to right, rgba(244, 63, 94, 0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(244, 63, 94, 0.07) 1px, transparent 1px)
          `,
					backgroundSize: "4rem 4rem",
				}}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 1.5 }}
			>
				{/* Radial gradient overlay */}
				<div
					className="absolute inset-0"
					style={{
						background: "radial-gradient(circle at center, transparent 30%, #0F0A0B 90%)",
					}}
				/>
			</motion.div>

			{/* Animated particles */}
			<div className="particle-container fixed inset-0 pointer-events-none overflow-hidden">
				{[...Array(15)].map((_, i) => (
					<motion.div
						key={i}
						className="absolute rounded-full bg-rose-400/20 w-2 h-2"
						initial={{
							x: `${Math.random() * 100}%`,
							y: `${Math.random() * 100}%`,
							opacity: Math.random() * 0.5 + 0.1,
						}}
						animate={{
							y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
							x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
							opacity: [0.1, 0.5, 0.1],
						}}
						transition={{
							repeat: Number.POSITIVE_INFINITY,
							duration: 20 + Math.random() * 30,
							ease: "linear",
						}}
					/>
				))}
			</div>

			<nav className="bg-rose-950/30 backdrop-blur-lg border-b border-rose-800/30 sticky top-0 z-50">
				<div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
					<Link href="/" className="group flex items-center gap-2">
						<motion.div whileHover={{ x: -3 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
							<ChevronLeft className="w-5 h-5 text-rose-400 group-hover:text-rose-300 transition-colors" />
						</motion.div>
						<motion.span
							className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-rose-600 bg-clip-text text-transparent"
							whileHover={{ scale: 1.05 }}
							transition={{ type: "spring", stiffness: 400, damping: 10 }}
						>
							TRACKED
						</motion.span>
					</Link>

					<div className="flex gap-3">
						<motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
							<Button
								asChild
								className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white 
                shadow-lg hover:shadow-rose-500/40 transition-all"
							>
								<Link href="/dashboard">Dashboard</Link>
							</Button>
						</motion.div>
					</div>
				</div>
			</nav>

			{/* Quick navigation sidebar */}
			<motion.div
				className="hidden lg:block fixed left-4 top-1/2 transform -translate-y-1/2 bg-rose-950/40 backdrop-blur-lg rounded-xl border border-rose-800/30 py-4 px-2 z-40"
				initial={{ opacity: 0, x: -20 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ delay: 0.8, duration: 0.5 }}
			>
				<ul className="space-y-4">
					<li>
						<a
							href="#summary"
							className="flex flex-col items-center justify-center text-rose-400 hover:text-rose-300 transition-colors"
						>
							<Eye className="w-5 h-5" />
							<span className="text-xs mt-1">Summary</span>
						</a>
					</li>
					<li>
						<a
							href="#retention"
							className="flex flex-col items-center justify-center text-rose-400 hover:text-rose-300 transition-colors"
						>
							<Database className="w-5 h-5" />
							<span className="text-xs mt-1">Retention</span>
						</a>
					</li>
					<li>
						<a
							href="#collection"
							className="flex flex-col items-center justify-center text-rose-400 hover:text-rose-300 transition-colors"
						>
							<Lock className="w-5 h-5" />
							<span className="text-xs mt-1">Collection</span>
						</a>
					</li>
					<li>
						<a
							href="#third-party"
							className="flex flex-col items-center justify-center text-rose-400 hover:text-rose-300 transition-colors"
						>
							<FileText className="w-5 h-5" />
							<span className="text-xs mt-1">Third Parties</span>
						</a>
					</li>
					<li>
						<a
							href="#security"
							className="flex flex-col items-center justify-center text-rose-400 hover:text-rose-300 transition-colors"
						>
							<Shield className="w-5 h-5" />
							<span className="text-xs mt-1">Security</span>
						</a>
					</li>
				</ul>
			</motion.div>

			<div className="max-w-4xl mx-auto px-4 py-12">
				<motion.div
					custom={0}
					variants={fadeInUpVariant}
					initial="hidden"
					animate="visible"
					className="mb-12 flex flex-col items-center justify-center text-center"
				>
					<div className="relative mb-4">
						<motion.div
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{
								type: "spring",
								stiffness: 100,
								delay: 0.3,
							}}
						>
							<Shield className="w-16 h-16 text-rose-400" />
						</motion.div>
						<motion.div
							className="absolute inset-0 bg-rose-400/20 rounded-full blur-xl"
							animate={{
								scale: [1, 1.2, 1],
								opacity: [0.3, 0.5, 0.3],
							}}
							transition={{
								duration: 3,
								repeat: Number.POSITIVE_INFINITY,
								ease: "easeInOut",
							}}
						/>
					</div>

					<h1 className="text-5xl font-bold bg-gradient-to-r from-rose-400 to-rose-600 bg-clip-text text-transparent mb-3">
						Privacy Policy
					</h1>
					<p className="text-rose-300/80 max-w-lg">
						At TRACKED, we prioritize your privacy with our minimal data retention approach. Here's everything you need
						to know about how we protect your data.
					</p>
				</motion.div>

				{/* Quick Summary Section */}
				<motion.div
					id="summary"
					custom={1}
					variants={fadeInUpVariant}
					initial="hidden"
					animate="visible"
					className="p-8 bg-rose-950/40 backdrop-blur-lg rounded-xl border border-rose-400/30 mb-10 shadow-lg relative overflow-hidden"
				>
					{/* Background glow effect */}
					<div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl" />

					<div className="flex items-center gap-3 mb-6 relative">
						<Eye className="w-6 h-6 text-rose-400" />
						<h2 className="text-2xl font-bold text-rose-100">TL;DR: What We Store</h2>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{[
							{
								icon: <Database className="w-10 h-10 text-rose-400 mb-3" />,
								title: "Data Source",
								desc: "Which providers were queried in your search",
							},
							{
								icon: <Clock className="w-10 h-10 text-rose-400 mb-3" />,
								title: "Timestamps",
								desc: "When searches were performed",
							},
							{
								icon: <User className="w-10 h-10 text-rose-400 mb-3" />,
								title: "User ID",
								desc: "Your license identifier for authentication",
							},
						].map((item, index) => (
							<motion.div
								key={index}
								className="bg-rose-900/30 p-5 rounded-lg border border-rose-800/40 flex flex-col items-center group"
								whileHover={{
									y: -5,
									boxShadow: "0 10px 25px -5px rgba(244, 63, 94, 0.2)",
								}}
								transition={{ type: "spring", stiffness: 300, damping: 15 }}
							>
								<motion.div
									initial={{ scale: 1 }}
									whileHover={{ scale: 1.1, rotate: 5 }}
									transition={{ type: "spring", stiffness: 300, damping: 10 }}
								>
									{item.icon}
								</motion.div>
								<h3 className="text-lg font-semibold text-rose-100 mb-2">{item.title}</h3>
								<p className="text-rose-200/90 text-center text-sm">{item.desc}</p>
							</motion.div>
						))}
					</div>

					<motion.div
						className="mt-6 p-4 bg-rose-400/10 rounded-lg border border-rose-400/20 flex items-start gap-3"
						whileHover={{ scale: 1.01 }}
						transition={{ type: "spring", stiffness: 300, damping: 20 }}
					>
						<AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
						<p className="text-rose-200/90 text-sm">
							<span className="font-semibold text-rose-300">Important:</span> We never store your search queries, search
							types, results, or any content you view. This data is only retained to prevent abuse, API reselling, and
							spamming.
						</p>
					</motion.div>
				</motion.div>

				<motion.div
					id="retention"
					custom={2}
					variants={fadeInUpVariant}
					initial="hidden"
					animate="visible"
					className="p-8 bg-rose-900/20 backdrop-blur-lg rounded-xl border border-rose-800/30 mb-10 relative overflow-hidden"
				>
					{/* Background subtle pattern */}
					<div className="absolute inset-0 opacity-5 pointer-events-none">
						<div
							className="absolute inset-0"
							style={{
								backgroundImage:
									"url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FB7185' fill-opacity='0.5' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1.5'/%3E%3Ccircle cx='13' cy='13' r='1.5'/%3E%3C/g%3E%3C/svg%3E\")",
								backgroundSize: "20px 20px",
							}}
						/>
					</div>

					<div className="flex items-center gap-3 mb-6 relative">
						<Eye className="w-6 h-6 text-rose-400" />
						<h2 className="text-2xl font-bold text-rose-100">Zero Retention Policy</h2>
					</div>

					<div className="space-y-4 text-rose-200/90 relative">
						<motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
							TRACKED operates on a strict minimal-retention policy. We do not store search queries, search types,
							search results, or session content beyond what is necessary for security and abuse prevention.
						</motion.p>
						<motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
							Our ephemeral session architecture ensures that your OSINT activities leave minimal digital footprint on
							our infrastructure. When you close your session, all sensitive data is permanently deleted from our
							systems.
						</motion.p>
						<motion.div
							className="p-5 bg-rose-900/30 rounded-lg border border-rose-800/40 mt-6"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.5 }}
							whileHover={{ y: -3 }}
						>
							<h3 className="text-lg font-semibold text-rose-300 mb-3">What We DO Store:</h3>
							<ul className="list-none space-y-3">
								{["Data sources accessed", "Timestamps of searches", "User ID (your license identifier)"].map(
									(item, i) => (
										<motion.li
											key={i}
											className="flex items-start gap-2"
											initial={{ opacity: 0, x: -10 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: 0.6 + i * 0.1 }}
										>
											<div className="mt-1 w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
											<span>{item}</span>
										</motion.li>
									),
								)}
							</ul>
							<p className="mt-4 text-sm text-rose-300">
								This minimal information is retained solely to prevent abuse, unauthorized API reselling, and service
								spamming.
							</p>
						</motion.div>
					</div>
				</motion.div>

				{/* Additional sections with the same pattern... (I'll keep this part concise) */}
				<motion.div
					id="collection"
					custom={3}
					variants={fadeInUpVariant}
					initial="hidden"
					animate="visible"
					className="p-8 bg-rose-900/20 backdrop-blur-lg rounded-xl border border-rose-800/30 mb-10"
				>
					<div className="flex items-center gap-3 mb-6">
						<Lock className="w-6 h-6 text-rose-400" />
						<h2 className="text-2xl font-bold text-rose-100">Information Collection</h2>
					</div>
					<div className="space-y-4 text-rose-200/90">
						<h3 className="text-lg font-semibold text-rose-300">Account Information</h3>
						<p>We collect minimal information required for account creation and authentication, including:</p>
						<ul className="list-disc pl-6 space-y-2">
							<li>License key/authentication token</li>
							<li>IP address during active sessions (used only for security purposes)</li>
						</ul>

						<h3 className="text-lg font-semibold text-rose-300 mt-6">Payment Information</h3>
						<p>
							TRACKED uses third-party payment processors. We do not retain any payment data whatsover, as this data is
							never transmitted to us.
						</p>

						<h3 className="text-lg font-semibold text-rose-300 mt-6">Usage Analytics</h3>
						<p>We collect only the minimal data needed to prevent abuse:</p>
						<ul className="list-disc pl-6 space-y-2">
							<li>Data sources accessed</li>
							<li>Timestamps of searches</li>
							<li>User ID for authentication</li>
						</ul>
						<p className="mt-2">
							We <span className="font-bold underline text-rose-300">do not</span> store actual search queries, search
							types, results, or any content you view.
						</p>
					</div>
					{/* Content remains similar to original but with micro-interactions */}
				</motion.div>

				<motion.div
					id="third-party"
					custom={4}
					variants={fadeInUpVariant}
					initial="hidden"
					animate="visible"
					className="p-8 bg-rose-900/20 backdrop-blur-lg rounded-xl border border-rose-800/30 mb-10"
				>
					<div className="flex items-center gap-3 mb-6">
						<FileText className="w-6 h-6 text-rose-400" />
						<h2 className="text-2xl font-bold text-rose-100">Third-Party Services</h2>
					</div>
					<div className="space-y-4 text-rose-200/90">
						<p>
							TRACKED integrates with multiple intelligence and data sources as detailed on our website. These include
							but are not limited to Snusbase, LeakOSINT, and others. When you use our platform, your queries are
							processed through these services on your behalf.
						</p>
						<p>
							While we do not share your personal information with these services beyond what is necessary to execute
							your queries, each third-party service may have its own logging and retention policies beyond our control.
							We select providers with security-conscious practices, but we encourage users to review the privacy
							policies of these individual services if concerned.
						</p>
					</div>
					{/* Content remains similar */}
				</motion.div>

				<motion.div
					id="security"
					custom={5}
					variants={fadeInUpVariant}
					initial="hidden"
					animate="visible"
					className="p-8 bg-rose-900/20 backdrop-blur-lg rounded-xl border border-rose-800/30 mb-10"
				>
					<div className="flex items-center gap-3 mb-6">
						<Shield className="w-6 h-6 text-rose-400" />
						<h2 className="text-2xl font-bold text-rose-100">Data Security</h2>
					</div>
					<div className="space-y-4 text-rose-200/90">
						<p>We implement advanced security measures to protect the limited data we do collect:</p>
						<ul className="list-disc pl-6 space-y-2">
							<li>End-to-end encryption for all communications</li>
							<li>Secure memory handling to prevent data leakage</li>
							<li>Regular security audits and penetration testing</li>
							<li>Immediate sensitive data destruction after use</li>
						</ul>
						<p>
							Our minimal-retention policy is our primary security feature, ensuring that even in the unlikely event of
							a security breach, only the most basic non-sensitive user data would be compromised.
						</p>
					</div>
					{/* Content remains similar */}
				</motion.div>

				{/* Contact Section with enhanced styling */}
				<motion.div
					custom={8}
					variants={fadeInUpVariant}
					initial="hidden"
					animate="visible"
					className="p-8 bg-rose-900/20 backdrop-blur-lg rounded-xl border border-rose-800/30 relative overflow-hidden"
				>
					{/* Decorative element */}
					<div className="absolute -bottom-10 -right-10 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl" />

					<div className="flex items-center gap-3 mb-6 relative">
						<Lock className="w-6 h-6 text-rose-400" />
						<h2 className="text-2xl font-bold text-rose-100">Contact Us</h2>
					</div>

					<div className="space-y-4 text-rose-200/90 relative">
						<p>For privacy inquiries or concerns, please contact us via:</p>
						<div className="flex flex-col sm:flex-row gap-4 mt-4">
							<motion.a
								href="https://t.me/james_martingale"
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 p-4 bg-rose-900/40 rounded-lg border border-rose-800/40 group hover:bg-rose-800/40 transition-all"
								whileHover={{ y: -3, x: 3 }}
								whileTap={{ y: 0, x: 0 }}
							>
								<svg
									className="w-5 h-5 text-rose-400 group-hover:text-rose-300"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M22.0717 3.32217C21.5776 2.89344 20.8952 2.75711 20.1469 2.93344C19.3791 3.11428 2.86852 8.81344 2.00658 9.1375C1.20025 9.44384 0.324414 9.85272 0.324414 10.6897C0.324414 11.3437 0.828641 11.9 1.82397 12.2062C2.87936 12.5329 5.32358 13.2428 6.35497 13.5C6.67219 14.4562 7.49825 16.76 7.66936 17.2344C7.79481 17.5655 8.00369 18.0464 8.35147 18.1583C8.66869 18.2797 8.98591 18.1814 9.19931 18.0219L11.9427 15.5366L15.6849 18.5312C15.801 18.625 15.9361 18.6953 16.0759 18.743C16.2156 18.7906 16.3599 18.8151 16.5049 18.8156C16.7469 18.8156 17.028 18.7312 17.239 18.4609C17.4679 18.1656 17.5699 17.7828 17.6155 17.4703C17.6611 17.1578 22.4146 4.73594 22.4146 4.73594C22.6151 3.99217 22.4146 3.65 22.0717 3.32217Z"
										fill="currentColor"
									/>
								</svg>
								<span className="font-medium text-rose-300 group-hover:text-rose-100">@james_martingale</span>
							</motion.a>
							<motion.a
								href="https://t.me/osint_dashboard"
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 p-4 bg-rose-900/40 rounded-lg border border-rose-800/40 group hover:bg-rose-800/40 transition-all"
								whileHover={{ y: -3, x: 3 }}
								whileTap={{ y: 0, x: 0 }}
							>
								<svg
									className="w-5 h-5 text-rose-400 group-hover:text-rose-300"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M22.0717 3.32217C21.5776 2.89344 20.8952 2.75711 20.1469 2.93344C19.3791 3.11428 2.86852 8.81344 2.00658 9.1375C1.20025 9.44384 0.324414 9.85272 0.324414 10.6897C0.324414 11.3437 0.828641 11.9 1.82397 12.2062C2.87936 12.5329 5.32358 13.2428 6.35497 13.5C6.67219 14.4562 7.49825 16.76 7.66936 17.2344C7.79481 17.5655 8.00369 18.0464 8.35147 18.1583C8.66869 18.2797 8.98591 18.1814 9.19931 18.0219L11.9427 15.5366L15.6849 18.5312C15.801 18.625 15.9361 18.6953 16.0759 18.743C16.2156 18.7906 16.3599 18.8151 16.5049 18.8156C16.7469 18.8156 17.028 18.7312 17.239 18.4609C17.4679 18.1656 17.5699 17.7828 17.6155 17.4703C17.6611 17.1578 22.4146 4.73594 22.4146 4.73594C22.6151 3.99217 22.4146 3.65 22.0717 3.32217Z"
										fill="currentColor"
									/>
								</svg>
								<span className="font-medium text-rose-300 group-hover:text-rose-100">@osint_dashboard</span>
							</motion.a>
						</div>
					</div>
				</motion.div>
			</div>

			{/* Back to top button */}
			<motion.a
				href="#"
				className="fixed bottom-8 right-8 bg-rose-900/80 hover:bg-rose-800 text-rose-200 p-3 rounded-full shadow-lg backdrop-blur-sm z-50 border border-rose-800/50"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 1 }}
				whileHover={{ y: -3 }}
				whileTap={{ y: 0 }}
			>
				<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
					<path
						fillRule="evenodd"
						d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
						clipRule="evenodd"
					/>
				</svg>
			</motion.a>

			<footer className="border-t border-rose-900/50 mt-12">
				<div className="max-w-7xl mx-auto px-4 py-8">
					<div className="flex flex-col md:flex-row justify-between items-center gap-4">
						<div className="text-rose-300/80 text-sm">© 2025 TRACKED. All rights reserved.</div>
						<div className="flex items-center gap-4">
							<Link href="/privacy" className="text-rose-400 transition-colors text-sm">
								Privacy Policy
							</Link>
							<Link
								href="https://t.me/osint_dashboard"
								className="text-rose-300/80 hover:text-rose-400 transition-colors text-sm"
							>
								Telegram
							</Link>
							<Link href="/tos" className="text-rose-300/80 hover:text-rose-400 transition-colors text-sm">
								Terms of Service
							</Link>
							<Link
								href="https://t.me/james_martingale"
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-1 text-rose-300/80 hover:text-rose-400 transition-colors text-sm"
							>
								<Lock className="w-4 h-4" />
								Support
							</Link>
						</div>
					</div>
				</div>
			</footer>
		</motion.main>
	)
}
