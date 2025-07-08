"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Send, Info, AlertCircle } from "lucide-react"
import { DATA_SOURCES } from "@/config/dataSources"

interface ActionResult {
	success: boolean
	message: string
}

export function ModuleWarningManager() {
	const [selectedModules, setSelectedModules] = useState<string[]>([])
	const [message, setMessage] = useState("")
	const [severity, setSeverity] = useState<"info" | "warning" | "error">("info")
	const [expiresAt, setExpiresAt] = useState("")
	const [result, setResult] = useState<ActionResult | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	const availableModules = DATA_SOURCES.filter(
		(source) => !["dashboard", "resources"].includes(source.category) && source.id !== "unified",
	)

	const handleModuleSelection = (moduleId: string) => {
		setSelectedModules((prev) => (prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)
		setResult(null)

		try {
			if (selectedModules.length === 0) {
				throw new Error("Please select at least one module")
			}

			if (!message.trim()) {
				throw new Error("Please enter a warning message")
			}

			const response = await fetch("/api/admin/module-warnings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					moduleIds: selectedModules,
					message: message.trim(),
					severity,
					expiresAt: expiresAt || null,
				}),
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || "Failed to create module warnings")
			}

			setResult({
				success: true,
				message: `Successfully created warnings for ${selectedModules.length} module(s)`,
			})
			setSelectedModules([])
			setMessage("")
			setSeverity("info")
			setExpiresAt("")
		} catch (err) {
			setResult({
				success: false,
				message: err instanceof Error ? err.message : "Failed to create module warnings",
			})
		} finally {
			setIsLoading(false)
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

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-xl font-semibold">Module Warnings</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<label className="text-sm font-medium">Select Modules</label>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
							{availableModules.map((module) => (
								<div
									key={module.id}
									className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
										selectedModules.includes(module.id)
											? "bg-primary/10 border border-primary/20"
											: "bg-muted/50 hover:bg-muted"
									}`}
									onClick={() => handleModuleSelection(module.id)}
								>
									<input
										type="checkbox"
										checked={selectedModules.includes(module.id)}
										onChange={() => handleModuleSelection(module.id)}
										className="rounded"
									/>
									<span className="text-sm font-medium">{module.name}</span>
								</div>
							))}
						</div>
						<p className="text-xs text-muted-foreground">Selected: {selectedModules.length} module(s)</p>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">Severity</label>
						<Select value={severity} onValueChange={(value: "info" | "warning" | "error") => setSeverity(value)}>
							<SelectTrigger>
								<SelectValue placeholder="Select severity" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="info">
									<div className="flex items-center space-x-2">
										<Info className="h-4 w-4 text-blue-500" />
										<span>Info</span>
									</div>
								</SelectItem>
								<SelectItem value="warning">
									<div className="flex items-center space-x-2">
										<AlertCircle className="h-4 w-4 text-yellow-500" />
										<span>Warning</span>
									</div>
								</SelectItem>
								<SelectItem value="error">
									<div className="flex items-center space-x-2">
										<AlertTriangle className="h-4 w-4 text-red-500" />
										<span>Error</span>
									</div>
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">Warning Message</label>
						<Textarea
							placeholder="Enter warning message"
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							disabled={isLoading}
							rows={4}
						/>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">Expires At (Optional)</label>
						<Input
							type="datetime-local"
							value={expiresAt}
							onChange={(e) => setExpiresAt(e.target.value)}
							disabled={isLoading}
						/>
						<p className="text-xs text-muted-foreground">Leave empty for permanent warning</p>
					</div>

					{result && (
						<Alert variant={result.success ? "default" : "destructive"}>
							{getSeverityIcon(severity)}
							<AlertDescription>{result.message}</AlertDescription>
						</Alert>
					)}

					<Button
						type="submit"
						className="w-full"
						disabled={isLoading || selectedModules.length === 0 || !message.trim()}
					>
						<Send className="mr-2 h-4 w-4" />
						Create Module Warnings
					</Button>
				</form>
			</CardContent>
		</Card>
	)
}
