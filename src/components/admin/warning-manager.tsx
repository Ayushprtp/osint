"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Send } from "lucide-react"

interface ActionResult {
	success: boolean
	message: string
}

export function WarningManager() {
	const [userHashes, setUserHashes] = useState("")
	const [message, setMessage] = useState("")
	const [result, setResult] = useState<ActionResult | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)
		setResult(null)

		try {
			const hashList = userHashes
				.split(",")
				.map((hash) => hash.trim())
				.filter(Boolean)

			if (hashList.length === 0) {
				throw new Error("Please enter at least one user hash")
			}

			const response = await fetch("/api/admin/warnings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					usernames: hashList,
					message: message.trim(),
				}),
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || "Failed to send warnings")
			}

			setResult({
				success: true,
				message: `Successfully sent warnings to ${hashList.length} user(s)`,
			})
			setUserHashes("")
			setMessage("")
		} catch (err) {
			setResult({
				success: false,
				message: err instanceof Error ? err.message : "Failed to send warnings",
			})
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-xl font-semibold">Send Warnings</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<label className="text-sm font-medium">User Hashes</label>
						<Input
							placeholder="Enter user hashes (comma-separated)"
							value={userHashes}
							onChange={(e) => setUserHashes(e.target.value)}
							disabled={isLoading}
						/>
						<p className="text-xs text-muted-foreground">
							Enter multiple user hashes separated by commas (e.g., abc123, xyz789)
						</p>
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

					{result && (
						<Alert variant={result.success ? "default" : "destructive"}>
							<AlertTriangle className="h-4 w-4" />
							<AlertDescription>{result.message}</AlertDescription>
						</Alert>
					)}

					<Button type="submit" className="w-full" disabled={isLoading || !userHashes.trim() || !message.trim()}>
						<Send className="mr-2 h-4 w-4" />
						Send Warnings
					</Button>
				</form>
			</CardContent>
		</Card>
	)
}
