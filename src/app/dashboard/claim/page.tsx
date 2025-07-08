"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft, Timer, Key, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface SubscriptionStatus {
	active: boolean
	expiryDate?: string
	daysLeft?: number
}

export default function ClaimKey() {
	const [key, setKey] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [status, setStatus] = useState<SubscriptionStatus | null>(null)
	const router = useRouter()

	const fetchStatus = useCallback(async () => {
		try {
			const res = await fetch("/api/status")
			if (!res.ok) throw new Error("Failed to fetch subscription status")
			const data = await res.json()
			setStatus(data)
		} catch {
			setStatus(null)
		}
	}, [])

	useEffect(() => {
		fetchStatus()
	}, [fetchStatus])

	const handleSubmit = async () => {
		if (!key.trim()) {
			setError("Please enter a subscription key")
			return
		}
		setIsLoading(true)
		setError(null)

		try {
			const res = await fetch("/api/validate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ key: key.trim() }),
			})

			if (!res.ok) {
				const data = await res.json()
				throw new Error(data.error || "Failed to validate key")
			}

			await fetchStatus()
			setKey("")
			router.refresh()
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred")
		} finally {
			setIsLoading(false)
		}
	}

	const formatKey = (input: string) => {
		const cleaned = input.replace(/[^A-Za-z0-9]/g, "")
		const upper = cleaned.toUpperCase()
		const formatted = upper.match(/.{1,4}/g)?.join("-") || upper
		return formatted.slice(0, 19)
	}

	return (
		<div className="container mx-auto py-8 px-4 space-y-8">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-3xl font-bold tracking-tight">
					Subscription
					{status && (
						<div className="flex justify-between items-center">
							<p className="text-sm text-muted-foreground">
								Status:{" "}
								<span className="font-bold">
									{status.active ? (
										<>
											Active ({status.daysLeft} days left)
											<span className="block text-xs">
												Expires: {new Date(status.expiryDate!).toLocaleDateString()}
											</span>
										</>
									) : (
										"Inactive"
									)}
								</span>
							</p>
						</div>
					)}
				</h1>
				<Button variant="outline" asChild>
					<Link href="/dashboard" className="flex items-center">
						<ArrowLeft className="w-4 h-4 mr-2" />
						<span>Back to Dashboard</span>
					</Link>
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Key className="h-5 w-5" />
						Claim Subscription Key
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col sm:flex-row gap-4">
						<Input
							type="text"
							value={key}
							onChange={(e) => setKey(formatKey(e.target.value))}
							placeholder="XXXX-XXXX-XXXX-XXXX"
							className="flex-1 font-mono uppercase"
							maxLength={19}
						/>
						<Button onClick={handleSubmit} disabled={isLoading || !key.trim()} className="sm:w-[140px]">
							{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Timer className="mr-2 h-4 w-4" />}
							Activate
						</Button>
					</div>
				</CardContent>
			</Card>

			{error && (
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}
		</div>
	)
}
