"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function SetServiceLimit() {
	const [result, setResult] = useState<{
		success: boolean
		data?: { service: string; dailyLimit: number }
		error?: string
	}>()
	const [dailyLimit, setDailyLimit] = useState("")
	const [service, setService] = useState("")
	const [isConfirmOpen, setIsConfirmOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	async function handleSetLimit(service: string, dailyLimit: string) {
		if (!service.trim() || !dailyLimit.trim()) return

		setIsLoading(true)
		try {
			const response = await fetch("/api/admin/set-limit", {
				headers: { "Content-Type": "application/json" },
				method: "POST",
				body: JSON.stringify({
					service,
					dailyLimit: Number.parseInt(dailyLimit, 10),
				}),
			})
			const data = await response.json()
			setResult(data)
		} catch (error) {
			console.error("Error setting limit:", error)
			setResult({
				success: false,
				error: "Error setting service limit",
			})
		} finally {
			setIsLoading(false)
			setIsConfirmOpen(false)
		}
	}

	return (
		<main className="flex-1 overflow-y-auto">
			<div className="container mx-auto py-8 px-4 space-y-8">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<h1 className="text-3xl font-bold tracking-tight">Set Service Limit</h1>
					<div className="flex flex-col sm:flex-row gap-4">
						<Button variant="outline" asChild>
							<Link href="/dashboard/admin" passHref>
								<ArrowLeft className="w-6 h-6 mr-2" />
								Go to Admin Dashboard
							</Link>
						</Button>
					</div>
				</div>

				<Card className="w-full">
					<CardHeader>
						<CardTitle>Set Service Limit</CardTitle>
						<CardDescription>Set the daily query limit for a service</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Input
								placeholder="Enter Service Name"
								value={service}
								onChange={(e) => setService(e.target.value)}
								className="mb-2"
							/>
							<Input
								placeholder="Enter Daily Limit"
								value={dailyLimit}
								onChange={(e) => setDailyLimit(e.target.value)}
								type="number"
								className="mb-2"
							/>
						</div>

						{result && (
							<Alert variant={result.success ? "default" : "destructive"} className="mt-4">
								<AlertTitle>{result.success ? "Success!" : "Error"}</AlertTitle>
								<AlertDescription>
									{result.success
										? `Service ${result.data?.service} limit set to ${result.data?.dailyLimit} queries per day.`
										: result.error}
								</AlertDescription>
							</Alert>
						)}

						<Button
							className="w-full mt-4"
							onClick={() => setIsConfirmOpen(true)}
							disabled={!dailyLimit || !service || isLoading}
						>
							{isLoading ? "Processing..." : "Set Limit"}
						</Button>
					</CardContent>
				</Card>

				<AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Confirm Limit Change</AlertDialogTitle>
						</AlertDialogHeader>
						<AlertDialogDescription>
							Are you sure you want to set the daily limit for {service} to {dailyLimit} queries?
						</AlertDialogDescription>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction onClick={() => handleSetLimit(service, dailyLimit)} disabled={isLoading}>
								Confirm
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</main>
	)
}
