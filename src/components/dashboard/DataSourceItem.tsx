"use client"

import { Database, CheckCircle2, RefreshCw, Clock } from "lucide-react"
import type { DataSource } from "@/config/dataSources"
import { useEffect, useState } from "react"

interface DataSourceItemProps extends DataSource {}

interface ApiStatus {
	service: string
	status: boolean
	lastChecked: string
	error?: string
	responseTime?: number
}

export const DataSourceItem = ({ name, records, lastVerified, icon: Icon = Database, id }: DataSourceItemProps) => {
	const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const fetchApiStatus = async () => {
			try {
				const response = await fetch("/api/api-status")
				const data = await response.json()
				if (data.success) {
					const status = data.data.find((s: ApiStatus) => s.service === id)
					setApiStatus(status || null)
				}
			} catch (error) {
				console.error("Error fetching API status:", error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchApiStatus()
	}, [id])

	const getStatusColor = () => {
		if (isLoading) return "text-gray-500"
		if (apiStatus?.status === false) return "text-red-500"
		if (apiStatus?.status === true) return "text-green-500"
		return "text-gray-500"
	}

	const getStatusBg = () => {
		if (isLoading) return "bg-gray-500/10"
		if (apiStatus?.status === false) return "bg-red-500/10"
		if (apiStatus?.status === true) return "bg-green-500/10"
		return "bg-gray-500/10"
	}

	const getStatusIcon = () => {
		if (isLoading) return <RefreshCw className="w-3 h-3 text-gray-500 animate-spin" />
		if (apiStatus?.status === false) return <CheckCircle2 className="w-3 h-3 text-red-500" />
		if (apiStatus?.status === true) return <CheckCircle2 className="w-3 h-3 text-green-500" />
		return null
	}

	const getStatusText = () => {
		if (isLoading) return "Checking..."
		if (apiStatus?.status === false) return "Offline"
		if (apiStatus?.status === true) return "Online"
		return "Unknown"
	}

	return (
		<div className="flex flex-col p-3 bg-card border rounded-md hover:shadow-md hover:border-rose-400/50 transition-all duration-300">
			<div className="flex items-center justify-between mb-2">
				<div className="flex items-center gap-2">
					<div className="p-2 rounded-lg bg-gradient-to-br from-rose-500/20 to-rose-400/10 backdrop-blur-sm">
						<Icon className="w-4 h-4 text-rose-400" />
					</div>
					<p className="font-medium">{name}</p>
				</div>
				<div className={`flex items-center gap-0.5 pl-0.3 pr-1 py-0.5 rounded-full ${getStatusBg()}`}>
					<div className={`w-1.5 h-1.5 rounded-full ${getStatusColor()}`} />
					{getStatusIcon()}
					<span className={`text-xs font-medium pl-0.5 ${getStatusColor()}`}>{getStatusText()}</span>
				</div>
			</div>
			<div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-border/40">
				<div className="flex items-center gap-1">
					<div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
					<span>{records} records</span>
				</div>
				<div className="flex items-center gap-1">
					<Clock className="w-3 h-3 text-muted-foreground" />
					<span className="text-muted-foreground">
						{apiStatus?.lastChecked
							? `Last checked ${new Date(apiStatus.lastChecked).toLocaleString()}`
							: `Verified ${lastVerified}`}
					</span>
				</div>
			</div>
			{apiStatus?.error && <div className="mt-2 text-xs text-red-500">Error: {apiStatus.error}</div>}
			{apiStatus?.responseTime && (
				<div className="mt-1 text-xs text-muted-foreground">Response time: {apiStatus.responseTime}ms</div>
			)}
		</div>
	)
}
