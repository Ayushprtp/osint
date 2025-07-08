"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Info, AlertCircle, Trash2 } from "lucide-react"
import { DATA_SOURCES } from "@/config/dataSources"

interface ModuleWarning {
	id: number
	moduleId: string
	message: string
	severity: "info" | "warning" | "error"
	isActive: boolean
	createdAt: string
	createdBy: string
	expiresAt?: string
}

export function ModuleWarningsManager() {
	const [warnings, setWarnings] = useState<ModuleWarning[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		fetchAllModuleWarnings()
	}, [])

	const fetchAllModuleWarnings = async () => {
		try {
			const moduleIds = DATA_SOURCES.filter(
				(source) => !["dashboard", "resources"].includes(source.category) && source.id !== "unified",
			).map((source) => source.id)

			const allWarnings: ModuleWarning[] = []

			for (const moduleId of moduleIds) {
				try {
					const response = await fetch(`/api/admin/module-warnings?moduleId=${moduleId}`)
					if (response.ok) {
						const data = await response.json()
						allWarnings.push(...(data.warnings || []))
					}
				} catch (error) {
					console.error(`Failed to fetch warnings for module ${moduleId}:`, error)
				}
			}

			setWarnings(allWarnings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
		} catch (error) {
			console.error("Failed to fetch module warnings:", error)
		} finally {
			setIsLoading(false)
		}
	}

	const deactivateWarning = async (warningId: number) => {
		try {
			const response = await fetch("/api/admin/module-warnings", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					warningId,
					isActive: false,
				}),
			})

			if (response.ok) {
				setWarnings((prev) =>
					prev.map((warning) => (warning.id === warningId ? { ...warning, isActive: false } : warning)),
				)
			}
		} catch (error) {
			console.error("Failed to deactivate warning:", error)
		}
	}

	const getSeverityIcon = (severity: string) => {
		switch (severity) {
			case "error":
				return <AlertTriangle className="h-4 w-4 text-red-500" />
			case "warning":
				return <AlertCircle className="h-4 w-4 text-yellow-500" />
			default:
				return <Info className="h-4 w-4 text-blue-500" />
		}
	}

	const getSeverityColor = (severity: string) => {
		switch (severity) {
			case "error":
				return "destructive"
			case "warning":
				return "secondary"
			default:
				return "default"
		}
	}

	const getModuleName = (moduleId: string) => {
		const module = DATA_SOURCES.find((source) => source.id === moduleId)
		return module?.name || moduleId
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		})
	}

	const isExpired = (expiresAt?: string) => {
		return expiresAt && new Date(expiresAt) <= new Date()
	}

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Active Module Warnings</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">Loading warnings...</p>
				</CardContent>
			</Card>
		)
	}

	const activeWarnings = warnings.filter((warning) => warning.isActive && !isExpired(warning.expiresAt))
	const inactiveWarnings = warnings.filter((warning) => !warning.isActive || isExpired(warning.expiresAt))

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						Active Module Warnings
						<Badge variant="secondary">{activeWarnings.length}</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent>
					{activeWarnings.length === 0 ? (
						<p className="text-muted-foreground">No active module warnings</p>
					) : (
						<div className="space-y-4">
							{activeWarnings.map((warning) => (
								<div key={warning.id} className="flex items-start justify-between p-4 border rounded-lg">
									<div className="flex-1 space-y-2">
										<div className="flex items-center space-x-2">
											{getSeverityIcon(warning.severity)}
											<Badge variant={getSeverityColor(warning.severity)}>{warning.severity.toUpperCase()}</Badge>
											<Badge variant="outline">{getModuleName(warning.moduleId)}</Badge>
										</div>
										<p className="text-sm">{warning.message}</p>
										<div className="flex items-center space-x-4 text-xs text-muted-foreground">
											<span>Created: {formatDate(warning.createdAt)}</span>
											{warning.expiresAt && <span>Expires: {formatDate(warning.expiresAt)}</span>}
										</div>
									</div>
									<Button variant="outline" size="sm" onClick={() => deactivateWarning(warning.id)}>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{inactiveWarnings.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							Inactive/Expired Warnings
							<Badge variant="secondary">{inactiveWarnings.length}</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{inactiveWarnings.slice(0, 10).map((warning) => (
								<div key={warning.id} className="flex items-start justify-between p-4 border rounded-lg opacity-60">
									<div className="flex-1 space-y-2">
										<div className="flex items-center space-x-2">
											{getSeverityIcon(warning.severity)}
											<Badge variant={getSeverityColor(warning.severity)}>{warning.severity.toUpperCase()}</Badge>
											<Badge variant="outline">{getModuleName(warning.moduleId)}</Badge>
											{isExpired(warning.expiresAt) && <Badge variant="destructive">EXPIRED</Badge>}
											{!warning.isActive && <Badge variant="secondary">DEACTIVATED</Badge>}
										</div>
										<p className="text-sm">{warning.message}</p>
										<div className="flex items-center space-x-4 text-xs text-muted-foreground">
											<span>Created: {formatDate(warning.createdAt)}</span>
											{warning.expiresAt && <span>Expires: {formatDate(warning.expiresAt)}</span>}
										</div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
