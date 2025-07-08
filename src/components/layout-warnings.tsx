"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, X } from "lucide-react"
import { authClient } from "@/client"

interface Warning {
	id: number
	message: string
	createdAt: string
	isRead: boolean
}

export function LayoutWarnings() {
	const [warnings, setWarnings] = useState<Warning[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const session = authClient.useSession()

	const fetchWarnings = async () => {
		if (!session.data?.user?.id) return

		try {
			const response = await fetch(`/api/admin/warnings?userId=${session.data.user.id}`)
			if (!response.ok) throw new Error("Failed to fetch warnings")
			const data = await response.json()
			setWarnings(data.warnings)
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to fetch warnings")
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		fetchWarnings()

		const interval = setInterval(fetchWarnings, 60000)
		return () => clearInterval(interval)
	}, [session.data?.user?.id])

	const markAsRead = async (warningId: number) => {
		try {
			const response = await fetch("/api/admin/warnings", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ warningId }),
			})

			if (!response.ok) throw new Error("Failed to mark warning as read")

			setWarnings(warnings.map((warning) => (warning.id === warningId ? { ...warning, isRead: true } : warning)))
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to mark warning as read")
		}
	}

	if (isLoading || !session.data?.user?.id) return null

	const unreadWarnings = warnings.filter((w) => !w.isRead)
	if (unreadWarnings.length === 0) return null

	return (
		<>
			{unreadWarnings.map((warning) => (
				<div
					key={warning.id}
					className="mx-4 mt-4 px-4 py-3 rounded-lg border border-rose-800/50 bg-gradient-to-r from-rose-900/30 to-rose-950/40 backdrop-blur-sm transition-all hover:border-rose-700/60 shadow-sm"
				>
					<div className="flex items-start gap-3">
						<AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
						<div className="flex-1 text-rose-200/90 text-sm whitespace-pre-line">
							{warning.message}
							<div className="text-xs text-rose-300/60 mt-1">{new Date(warning.createdAt).toLocaleString()}</div>
						</div>
						<button
							onClick={() => markAsRead(warning.id)}
							className="text-rose-400/70 hover:text-rose-300 transition-colors flex-shrink-0"
							aria-label="Mark warning as read"
						>
							<X className="w-5 h-5" />
						</button>
					</div>
				</div>
			))}
		</>
	)
}
