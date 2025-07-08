"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import {
	Shield,
	Book,
	FileText,
	ChevronLeft,
	Gavel,
	Scale,
	AlertTriangle,
	Fingerprint,
	Heart,
	Lock,
} from "lucide-react"
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

export default function TermsOfService() {
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
							<Book className="w-5 h-5" />
							<span className="text-xs mt-1">Summary</span>
						</a>
					</li>
					<li>
						<a
							href="#license"
							className="flex flex-col items-center justify-center text-rose-400 hover:text-rose-300 transition-colors"
						>
							<Fingerprint className="w-5 h-5" />
							<span className="text-xs mt-1">License</span>
						</a>
					</li>
					<li>
						<a
							href="#usage"
							className="flex flex-col items-center justify-center text-rose-400 hover:text-rose-300 transition-colors"
						>
							<Gavel className="w-5 h-5" />
							<span className="text-xs mt-1">Usage</span>
						</a>
					</li>
					<li>
						<a
							href="#liability"
							className="flex flex-col items-center justify-center text-rose-400 hover:text-rose-300 transition-colors"
						>
							<Scale className="w-5 h-5" />
							<span className="text-xs mt-1">Liability</span>
						</a>
					</li>
					<li>
						<a
							href="#conduct"
							className="flex flex-col items-center justify-center text-rose-400 hover:text-rose-300 transition-colors"
						>
							<Shield className="w-5 h-5" />
							<span className="text-xs mt-1">Conduct</span>
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
							<Gavel className="w-16 h-16 text-rose-400" />
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
						Terms of Service
					</h1>
					<p className="text-rose-300/80 max-w-lg">
						Please read these terms carefully before using TRACKED. By accessing or using our service, you agree to be
						bound by these terms.
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
						<Book className="w-6 h-6 text-rose-400" />
						<h2 className="text-2xl font-bold text-rose-100">TL;DR: Key Points</h2>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{[
							{
								icon: <Fingerprint className="w-10 h-10 text-rose-400 mb-3" />,
								title: "License",
								desc: "Transferable, but cannot be resold",
							},
							{
								icon: <Gavel className="w-10 h-10 text-rose-400 mb-3" />,
								title: "Legal Use",
								desc: "You must use TRACKED for lawful purposes only",
							},
							{
								icon: <Scale className="w-10 h-10 text-rose-400 mb-3" />,
								title: "Liability",
								desc: "Service provided 'as is' without warranties",
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
							<span className="font-semibold text-rose-300">Important:</span> Using TRACKED for illegal activities or in
							violation of these terms may result in immediate termination of your account without refund.
						</p>
					</motion.div>
				</motion.div>

				<motion.div
					id="license"
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
						<Fingerprint className="w-6 h-6 text-rose-400" />
						<h2 className="text-2xl font-bold text-rose-100">License & Account</h2>
					</div>

					<div className="space-y-4 text-rose-200/90 relative">
						<motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
							TRACKED grants you a personal, transferable, non-exclusive license to use our platform in accordance with
							these Terms. This license is tied to your unique account credentials and may be transferred to another
							individual or entity. However, sharing of the same account between two individuals is prohibited, and the
							license cannot be resold for monetary gain.
						</motion.p>
						<motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
							Each account is permitted a limited number of queries per day based on your subscription tier. Attempts to
							circumvent these limitations through technical means or by creating multiple accounts may result in
							immediate suspension of service.
						</motion.p>
						<motion.div
							className="p-5 bg-rose-900/30 rounded-lg border border-rose-800/40 mt-6"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.5 }}
							whileHover={{ y: -3 }}
						>
							<h3 className="text-lg font-semibold text-rose-300 mb-3">Account Responsibilities:</h3>
							<ul className="list-none space-y-3">
								{[
									"You are responsible for maintaining the confidentiality of your account credentials",
									"You agree to notify us immediately of any unauthorized access to your account",
									"You are solely responsible for all activities that occur under your account",
								].map((item, i) => (
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
								))}
							</ul>
						</motion.div>
					</div>
				</motion.div>

				<motion.div
					id="usage"
					custom={3}
					variants={fadeInUpVariant}
					initial="hidden"
					animate="visible"
					className="p-8 bg-rose-900/20 backdrop-blur-lg rounded-xl border border-rose-800/30 mb-10"
				>
					<div className="flex items-center gap-3 mb-6">
						<Gavel className="w-6 h-6 text-rose-400" />
						<h2 className="text-2xl font-bold text-rose-100">Acceptable Use</h2>
					</div>
					<div className="space-y-4 text-rose-200/90">
						<p>
							You agree to use TRACKED only for lawful purposes and in accordance with these Terms. TRACKED is designed
							as an OSINT (Open Source Intelligence) tool for legitimate security research, personal data monitoring,
							and authorized investigations.
						</p>
						<p className="font-semibold text-rose-300">You expressly agree NOT to use TRACKED to:</p>
						<ul className="list-disc pl-6 space-y-2">
							<li>Violate any applicable law or regulation</li>
							<li>Infringe upon the rights of others, including privacy and intellectual property rights</li>
							<li>Engage in harassment, stalking, or any form of malicious targeting of individuals</li>
							<li>
								Conduct unauthorized penetration testing against systems you do not own or have permission to test
							</li>
							<li>Engage in any activity that could reasonably be considered illegal in your jurisdiction</li>
						</ul>

						<p>
							We reserve the right to terminate accounts that we reasonably believe are being used for prohibited
							activities.
						</p>
					</div>
				</motion.div>

				<motion.div
					id="liability"
					custom={4}
					variants={fadeInUpVariant}
					initial="hidden"
					animate="visible"
					className="p-8 bg-rose-900/20 backdrop-blur-lg rounded-xl border border-rose-800/30 mb-10"
				>
					<div className="flex items-center gap-3 mb-6">
						<Scale className="w-6 h-6 text-rose-400" />
						<h2 className="text-2xl font-bold text-rose-100">Limitation of Liability</h2>
					</div>
					<div className="space-y-4 text-rose-200/90">
						<p>
							TRACKED is provided on an "as is" and "as available" basis. We make no warranties, expressed or implied,
							regarding the reliability, availability, or accuracy of the service or the data it provides.
						</p>
						<p>
							In no event shall TRACKED, its operators, or its data providers be liable for any indirect, incidental,
							special, consequential or punitive damages, including without limitation, loss of profits, data, use,
							goodwill, or other intangible losses, resulting from your access to or use of or inability to access or
							use the service.
						</p>
						<motion.div
							className="p-5 bg-rose-900/30 rounded-lg border border-rose-800/40 mt-4"
							whileHover={{ y: -3 }}
							transition={{ type: "spring", stiffness: 300, damping: 15 }}
						>
							<h3 className="text-lg font-semibold text-rose-300 mb-3">Important Disclaimers:</h3>
							<p className="text-sm">
								We do not guarantee the completeness or accuracy of data provided through our service. TRACKED
								aggregates information from various public sources and databases, which may contain errors or be
								incomplete. You acknowledge that you use any data obtained through our service at your own risk.
							</p>
						</motion.div>
					</div>
				</motion.div>

				<motion.div
					id="conduct"
					custom={5}
					variants={fadeInUpVariant}
					initial="hidden"
					animate="visible"
					className="p-8 bg-rose-900/20 backdrop-blur-lg rounded-xl border border-rose-800/30 mb-10"
				>
					<div className="flex items-center gap-3 mb-6">
						<Shield className="w-6 h-6 text-rose-400" />
						<h2 className="text-2xl font-bold text-rose-100">Code of Conduct</h2>
					</div>
					<div className="space-y-4 text-rose-200/90">
						<p>
							TRACKED serves a community of security researchers, privacy advocates, and OSINT professionals. We expect
							all users to adhere to ethical standards when using our platform.
						</p>
						<p>
							We believe in responsible disclosure and ethical use of information. In cases where you discover sensitive
							information through our platform, we encourage you to handle it responsibly and, when appropriate,
							disclose vulnerabilities through proper channels.
						</p>
						<motion.div
							className="p-5 bg-rose-900/30 rounded-lg border border-rose-800/40 mt-4 flex items-start gap-3"
							whileHover={{ y: -3 }}
							transition={{ type: "spring", stiffness: 300, damping: 15 }}
						>
							<Heart className="w-6 h-6 text-rose-400 flex-shrink-0 mt-1" />
							<div>
								<h3 className="text-lg font-semibold text-rose-300 mb-2">Our Community Values:</h3>
								<p className="text-sm">
									We value privacy, security, and ethical conduct. TRACKED is designed for legitimate security research
									and personal privacy monitoring. We take a strong stance against illegal activities and explicitly
									prohibit using our platform for harassment, stalking, or any form of targeted harm against
									individuals.
								</p>
							</div>
						</motion.div>
					</div>
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
						<FileText className="w-6 h-6 text-rose-400" />
						<h2 className="text-2xl font-bold text-rose-100">Contact Us</h2>
					</div>

					<div className="space-y-4 text-rose-200/90 relative">
						<p>For questions regarding these Terms of Service, please contact us via:</p>
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
							<Link href="/privacy" className="text-rose-300/80 hover:text-rose-400 transition-colors text-sm">
								Privacy Policy
							</Link>
							<Link
								href="https://t.me/osint_dashboard"
								className="text-rose-300/80 hover:text-rose-400 transition-colors text-sm"
							>
								Telegram
							</Link>
							<Link href="/tos" className="text-rose-400 transition-colors text-sm">
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
