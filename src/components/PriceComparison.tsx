"use client"

import { motion } from "framer-motion"
import { Database, Shield, TrendingDown, CheckCircle2, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getAllDataSources } from "@/config/dataSources"
import { useState, useEffect, useMemo } from "react"

interface PriceComparisonProps {
	className?: string
}

export function PriceComparison({ className }: PriceComparisonProps) {
	const providers = useMemo(() => {
		return getAllDataSources().filter(
			(source) =>
				source.status === "active" &&
				source.records &&
				!["0", "0 records", "0+", "0K", "0M", "0B"].includes(source.records) &&
				source.price &&
				!source.isFree,
		)
	}, [])

	const [individualCosts, setIndividualCosts] = useState({ setup: 0, monthly: 0 })

	useEffect(() => {
		const calculateCosts = () => {
			let setupCost = 0
			let monthlyCost = 0

			for (const provider of providers) {
				if (!provider.price) continue

				const price = Number.parseFloat(provider.price.replace(/[^0-9.]/g, "").replace(/,/g, ""))

				switch (provider.priceType) {
					case "one-time":
						setupCost += price
						break
					case "monthly":
						setupCost += price
						monthlyCost += price
						break
					case "yearly":
						setupCost += price
						monthlyCost += price / 12
						break
					case "per-report":
						setupCost += price * 10
						monthlyCost += price * 10
						break
				}
			}

			setIndividualCosts({
				setup: Math.round(setupCost),
				monthly: Math.round(monthlyCost),
			})
		}

		calculateCosts()
	}, [providers])

	const TRACKED_MONTHLY_PRICE = 16

	const priceComparison = {
		individual: {
			...individualCosts,
			features: [
				"Multiple tool subscriptions",
				"Separate dashboards",
				"Manual data correlation",
				"Limited integration",
				"Higher total cost",
			],
		},
		tracked: {
			monthly: TRACKED_MONTHLY_PRICE,
			features: ["Unified dashboard", "Simple interface", "Advanced analytics", "Exclusive data"],
		},
	} as const

	const monthlySavings = Math.max(0, priceComparison.individual.monthly - TRACKED_MONTHLY_PRICE)
	const setupSavings = priceComparison.individual.setup

	return (
		<div className={className}>
			<motion.div
				initial="hidden"
				whileInView="visible"
				viewport={{
					once: true,
					amount: 0.3,
				}}
				variants={{
					hidden: { opacity: 0, y: 20 },
					visible: { opacity: 1, y: 0 },
				}}
				transition={{ duration: 0.6 }}
				className="p-6 md:p-8 bg-rose-900/20 backdrop-blur-lg rounded-xl border border-rose-800/30"
			>
				<h3 className="text-3xl md:text-4xl font-bold text-rose-100 text-center mb-6 md:mb-8 flex items-center justify-center gap-3">
					<Database className="w-6 h-6 md:w-8 md:h-8 text-rose-400" />
					ROI Comparison
				</h3>

				<div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
					<Card className="bg-rose-950/40 border-rose-800/20 h-full">
						<CardHeader className="pb-2">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-rose-900/50 rounded-lg">
									<X className="w-5 h-5 text-rose-400" />
								</div>
								<div>
									<CardTitle className="text-lg font-semibold text-rose-300">Individual Tools</CardTitle>
									<CardDescription className="text-rose-400/70">Traditional Approach</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-3">
								<div className="flex justify-between items-baseline">
									<span className="text-sm text-rose-300/80">Initial Setup</span>
									<span className="font-mono text-xl text-rose-400">
										${priceComparison.individual.setup.toLocaleString()}
									</span>
								</div>
								<div className="flex justify-between items-baseline">
									<span className="text-sm text-rose-300/80">Monthly Cost</span>
									<span className="font-mono text-xl text-rose-400">
										${priceComparison.individual.monthly.toLocaleString()}
									</span>
								</div>
							</div>

							<div className="space-y-3 pt-2">
								{priceComparison.individual.features.map((feature, idx) => (
									<div key={idx} className="flex items-start gap-2 text-sm text-rose-300/70">
										<X className="w-4 h-4 text-rose-400/50 mt-0.5 flex-shrink-0" />
										<span>{feature}</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					<Card className="bg-gradient-to-br from-rose-900/40 to-rose-950/60 border-rose-400/20 relative overflow-hidden h-full">
						<div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-60" />
						<CardHeader className="pb-2 relative">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-rose-400/20 rounded-lg">
									<Shield className="w-5 h-5 text-rose-400" />
								</div>
								<div>
									<CardTitle className="text-lg font-semibold text-rose-100">With TRACKED</CardTitle>
									<CardDescription className="text-rose-400">Unified Solution</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent className="space-y-6 relative">
							<div>
								<div className="flex justify-between items-center p-4 bg-rose-900/30 rounded-lg">
									<span className="text-sm text-rose-300">Monthly Cost</span>
									<div className="flex items-center gap-2">
										<span className="font-mono text-3xl text-rose-400">${priceComparison.tracked.monthly}</span>
										<span className="text-xs text-rose-400/80">/mo</span>
									</div>
								</div>
							</div>

							<div className="space-y-4">
								<div className="p-4 bg-rose-900/30 rounded-lg">
									<div className="flex items-center gap-2 mb-3">
										<TrendingDown className="w-4 h-4 text-green-400" />
										<h5 className="text-sm font-semibold text-rose-100">Your Savings</h5>
									</div>
									<div className="space-y-2">
										<div className="flex justify-between items-center text-sm">
											<span className="text-rose-300/80">First Month</span>
											<span className="font-mono text-green-400">${setupSavings.toLocaleString()}</span>
										</div>
										<div className="flex justify-between items-center text-sm">
											<span className="text-rose-300/80">Monthly</span>
											<span className="font-mono text-green-400">${monthlySavings.toLocaleString()}</span>
										</div>
									</div>
								</div>

								<div className="space-y-3">
									{priceComparison.tracked.features.map((feature) => (
										<div key={feature} className="flex items-start gap-2 text-sm text-rose-100">
											<CheckCircle2 className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
											<span>{feature}</span>
										</div>
									))}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="mt-6 md:mt-8 p-4 bg-rose-400/10 rounded-lg max-w-2xl mx-auto">
					<p className="text-center text-rose-300/80 text-sm">
						All plans include full access to our intelligence matrix and ephemeral session security with zero data
						retention.
					</p>
				</div>
			</motion.div>
		</div>
	)
}
