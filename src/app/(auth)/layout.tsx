"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ScrollText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) return null

	return (
		<div className="relative w-full min-h-screen flex flex-col overflow-hidden">
			{/* Animated background */}
			<div className="absolute inset-0 -z-10">
				<div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
				<motion.div
					className="grid-background absolute inset-0 opacity-[0.02]"
					initial={{ opacity: 0.01 }}
					animate={{ opacity: 0.02 }}
					transition={{ duration: 1.5 }}
				/>

				{/* Background glow effects */}
				<div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-primary/5 rounded-full filter blur-[120px] opacity-30" />
				<div className="absolute bottom-[-20%] right-[10%] w-[500px] h-[500px] bg-primary/5 rounded-full filter blur-[120px] opacity-20" />
			</div>

			{/* Header with logo - styled like the home page */}
			<header
				className="relative z-10 w-full border-b border-rose-800/20"
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

					<div className="flex gap-3 items-center">
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
								<Link href="/">Home</Link>
							</Button>
						</motion.div>
					</div>
				</div>
			</header>

			{/* Main content */}
			<main className="flex-1 flex items-center justify-center p-6 z-10">{children}</main>

			{/* Footer - styled like the home page */}
			<footer className="relative z-10 border-t border-rose-900/50">
				<div className="max-w-7xl mx-auto py-6 px-4">
					<div className="flex flex-col items-center justify-center space-y-4 text-center">
						<motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
							<h3 className="text-xl font-bold bg-gradient-to-r from-rose-400 to-rose-600 bg-clip-text text-transparent">
								TRACKED
							</h3>
						</motion.div>

						<div className="flex items-center gap-4 text-rose-300/80">
							<Link href="/privacy" className="hover:text-rose-200 transition-colors text-sm flex items-center gap-1">
								Privacy Policy
							</Link>
							<Link href="/tos" className="hover:text-rose-200 transition-colors text-sm flex items-center gap-1">
								Terms of Service
							</Link>
							<Link href="/changelog" className="hover:text-rose-200 transition-colors text-sm flex items-center gap-1">
								<ScrollText className="w-3.5 h-3.5" />
								Changelog
							</Link>
						</div>

						<p className="text-xs text-rose-300/60">© {new Date().getFullYear()} All rights reserved.</p>
					</div>
				</div>
			</footer>
		</div>
	)
}
