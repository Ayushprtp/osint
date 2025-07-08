"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, Info, AlertCircle, X } from "lucide-react"

interface ModuleWarning {
	id: number
	moduleId: string
	message: string
	severity: "info" | "warning" | "error"
	isActive: boolean
	createdAt: string
	expiresAt?: string
}

interface ModuleWarningsProps {
	moduleId: string
}

const severityConfig = {
	error: {
		icon: <AlertTriangle className="h-5 w-5 text-red-600" aria-label="Error" />,
		variant: "destructive" as const,
		title: "Error",
		borderColor: "#dc2626",
	},
	warning: {
		icon: <AlertCircle className="h-5 w-5 text-yellow-600" aria-label="Warning" />,
		variant: "default" as const,
		title: "Warning",
		borderColor: "#facc15",
	},
	info: {
		icon: <Info className="h-5 w-5 text-blue-600" aria-label="Info" />,
		variant: "default" as const,
		title: "Info",
		borderColor: "#2563eb",
	},
}

export function ModuleWarnings({ moduleId }: ModuleWarningsProps) {
	const [warnings, setWarnings] = useState<ModuleWarning[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [dismissedIds, setDismissedIds] = useState<number[]>([])

	useEffect(() => {
		let isMounted = true
		fetch(`/api/admin/module-warnings?moduleId=${moduleId}`)
			.then((res) => (res.ok ? res.json() : { warnings: [] }))
			.then((data) => {
				if (isMounted) setWarnings(data.warnings || [])
			})
			.catch((e) => console.error("Failed to fetch module warnings:", e))
			.finally(() => {
				if (isMounted) setIsLoading(false)
			})
		return () => {
			isMounted = false
		}
	}, [moduleId])

	const activeWarnings = warnings.filter(
		(w) => w.isActive && (!w.expiresAt || new Date(w.expiresAt) > new Date()) && !dismissedIds.includes(w.id),
	)

	const handleDismiss = (id: number) => {
		setDismissedIds((ids) => [...ids, id])
	}

	if (isLoading || !activeWarnings.length) return null

	return (
		<div className="space-y-4 mb-8">
			{activeWarnings.map((w) => {
				const { icon, title } = severityConfig[w.severity] || severityConfig.info
				return (
					<div
						key={w.id}
						className="mx-4 mt-4 px-4 py-3 rounded-lg border border-rose-800/50 bg-gradient-to-r from-rose-900/30 to-rose-950/40 backdrop-blur-sm transition-all hover:border-rose-700/60 shadow-sm"
					>
						<div className="flex items-start gap-3">
							<span className="pt-1">{icon}</span>
							<div className="flex-1 text-rose-200/90 text-sm whitespace-pre-line">
								<span className="font-semibold mb-1 block">{title}</span>
								{w.message}
								{w.expiresAt && (
									<div className="text-xs text-gray-400 mt-1">Expires: {new Date(w.expiresAt).toLocaleString()}</div>
								)}
							</div>
							<button
								onClick={() => handleDismiss(w.id)}
								className="text-rose-400/70 hover:text-rose-300 transition-colors flex-shrink-0"
								aria-label="Dismiss alert"
							>
								<X className="w-5 h-5" />
							</button>
						</div>
					</div>
				)
			})}
		</div>
	)
}
