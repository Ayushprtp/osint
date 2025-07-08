"use client"

import { useState, useEffect } from "react"
import { Bell, Check, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { authClient } from "@/client"
import { toast } from "sonner"

interface Warning {
	id: number
	message: string
	createdAt: string
	isRead: boolean
}

export function UserWarnings() {
	const [warnings, setWarnings] = useState<Warning[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const session = authClient.useSession()
	const unreadCount = warnings.filter((w) => !w.isRead).length

	const fetchWarnings = async () => {
		if (!session.data?.user?.id) return

		try {
			const response = await fetch(`/api/admin/warnings?userId=${session.data.user.id}`)
			if (!response.ok) throw new Error("Failed to fetch warnings")
			const data = await response.json()
			setWarnings(data.warnings)

			const unreadWarnings = data.warnings.filter((w: Warning) => !w.isRead)
			if (unreadWarnings.length > 0) {
				unreadWarnings.forEach((warning: Warning) => {
					toast.warning(warning.message, {
						description: new Date(warning.createdAt).toLocaleDateString(),
						duration: 5000,
					})
				})
			}
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

	const markAllAsRead = async () => {
		const unreadWarnings = warnings.filter((w) => !w.isRead)
		for (const warning of unreadWarnings) {
			await markAsRead(warning.id)
		}
	}

	if (isLoading || !session.data?.user?.id) return null

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="sm" className="relative">
					<Bell className={unreadCount > 0 ? "text-rose-400" : "text-muted-foreground"} />
					{unreadCount > 0 && (
						<Badge
							variant="destructive"
							className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
						>
							{unreadCount}
						</Badge>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-80 p-0" align="end">
				<Card>
					<CardContent className="p-0">
						<div className="p-4 border-b flex items-center justify-between">
							<h4 className="text-sm font-semibold">Warnings</h4>
							{unreadCount > 0 && (
								<Button variant="ghost" size="sm" className="h-8 text-xs" onClick={markAllAsRead}>
									Mark all as read
								</Button>
							)}
						</div>
						<ScrollArea className="h-[300px]">
							{warnings.length === 0 ? (
								<div className="p-4 text-center text-sm text-muted-foreground">No warnings</div>
							) : (
								<div className="divide-y">
									{warnings.map((warning) => (
										<div key={warning.id} className={`p-4 ${warning.isRead ? "bg-background" : "bg-destructive/5"}`}>
											<div className="flex items-start justify-between gap-2">
												<div className="flex items-start gap-2">
													<AlertTriangle
														className={`h-4 w-4 mt-0.5 ${warning.isRead ? "text-muted-foreground" : "text-destructive"}`}
													/>
													<div>
														<p className={`text-sm ${warning.isRead ? "text-muted-foreground" : "font-medium"}`}>
															{warning.message}
														</p>
														<p className="text-xs text-muted-foreground mt-1">
															{new Date(warning.createdAt).toLocaleString()}
														</p>
													</div>
												</div>
												{!warning.isRead && (
													<Button
														variant="ghost"
														size="sm"
														className="h-6 w-6 p-0 hover:text-green-500"
														onClick={() => markAsRead(warning.id)}
													>
														<Check className="h-4 w-4" />
													</Button>
												)}
											</div>
										</div>
									))}
								</div>
							)}
						</ScrollArea>
					</CardContent>
				</Card>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
