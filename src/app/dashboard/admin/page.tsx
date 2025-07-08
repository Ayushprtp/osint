"use client"

import { useState, useEffect } from "react"
import { Users, DollarSign, Clock, BarChart3, AlertTriangle, Settings, Key, Search, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchAdminStats } from "@/lib/utils"
import { WarningManager } from "@/components/admin/warning-manager"
import { ModuleWarningManager } from "@/components/admin/module-warning-manager"

interface AdminStats {
	activeSubscriptions: number
	revenueThisMonth: number
	pendingPayments: number
}

interface StatCardProps {
	label: string
	value: string | number
	icon: React.ElementType
	description: string
}

interface ActionCardProps {
	title: string
	icon: React.ElementType
	description: string
	onClick: () => void
}

export default function AdminDashboard() {
	const [stats, setStats] = useState<AdminStats>({
		activeSubscriptions: 0,
		revenueThisMonth: 0,
		pendingPayments: 0,
	})

	useEffect(() => {
		fetchAdminStats().then(setStats)
	}, [])

	const statCards: StatCardProps[] = [
		{
			label: "Active Subscribers",
			value: stats.activeSubscriptions,
			icon: Users,
			description: "Total number of current active subscriptions",
		},
		{
			label: "Monthly Revenue",
			value: `$${stats.revenueThisMonth.toLocaleString()}`,
			icon: DollarSign,
			description: "Total revenue generated this month",
		},
		{
			label: "Pending Transactions",
			value: stats.pendingPayments,
			icon: Clock,
			description: "Number of transactions awaiting processing",
		},
	]

	const actions: ActionCardProps[] = [
		{
			title: "Analytics Report",
			icon: BarChart3,
			description: "Access detailed usage analytics and metrics",
			onClick: () => (window.location.href = "/dashboard/admin/analytics"),
		},
		{
			title: "System Alerts",
			icon: AlertTriangle,
			description: "Manage and configure system alerts",
			onClick: () => (window.location.href = "/dashboard/admin/alerts"),
		},
		{
			title: "Usage Limits",
			icon: Settings,
			description: "Configure query and service limits",
			onClick: () => (window.location.href = "/dashboard/admin/usage-limits"),
		},
		{
			title: "Generate Keys",
			icon: Key,
			description: "Generate new subscription keys",
			onClick: () => (window.location.href = "/dashboard/admin/keys"),
		},
		{
			title: "Key Lookup",
			icon: Search,
			description: "Look up details for specific subscription keys",
			onClick: () => (window.location.href = "/dashboard/admin/key-lookup"),
		},
		{
			title: "Module Warnings",
			icon: Shield,
			description: "Manage active module warnings and alerts",
			onClick: () => (window.location.href = "/dashboard/admin/module-warnings"),
		},
	]

	return (
		<main className="container max-w-7xl py-6">
			<div className="grid gap-6">
				<div className="flex items-center justify-between">
					<h1 className="text-3xl font-bold">Admin Dashboard</h1>
				</div>

				<div className="grid gap-6 md:grid-cols-3">
					{statCards.map((card, index) => (
						<StatCard key={index} {...card} />
					))}
				</div>

				<div className="grid gap-6 md:grid-cols-2">
					<div className="space-y-6">
						<h2 className="text-2xl font-semibold">User Management</h2>
						<div className="grid gap-4">
							{actions.map((action, index) => (
								<ActionCard key={index} {...action} />
							))}
						</div>
					</div>
					<div className="space-y-6">
						<h2 className="text-2xl font-semibold">User Warnings</h2>
						<WarningManager />
					</div>
				</div>

				<div className="grid gap-6 md:grid-cols-1">
					<div className="space-y-6">
						<h2 className="text-2xl font-semibold">Module Warnings</h2>
						<ModuleWarningManager />
					</div>
				</div>
			</div>
		</main>
	)
}

function StatCard({ label, value, icon: Icon, description }: StatCardProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{label}</CardTitle>
				<Icon className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{value}</div>
				<p className="text-xs text-muted-foreground">{description}</p>
			</CardContent>
		</Card>
	)
}

function ActionCard({ title, icon: Icon, description, onClick }: ActionCardProps) {
	return (
		<Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={onClick}>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				<Icon className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<p className="text-xs text-muted-foreground">{description}</p>
			</CardContent>
		</Card>
	)
}
