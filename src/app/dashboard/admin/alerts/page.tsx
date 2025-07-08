"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Textarea } from "@/components/ui/textarea"

export default function alertManagement() {
	const [alertText, setAlertText] = useState<string>("")
	const [result, setResult] = useState<{
		success: boolean
	}>()
	const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false)

	async function handleSetAlert() {
		try {
			const response = await fetch("/api/admin/set-alert", {
				method: "POST",
				body: JSON.stringify({ alertText }),
				headers: { "Content-Type": "application/json" },
			})
			const data = await response.json()
			setResult(data)
		} catch (error) {
			console.error("Error creating user:", error)
			setResult({ success: false })
		}
		setIsConfirmOpen(false)
	}

	return (
		<main className="flex-1 overflow-y-auto">
			<div className="container mx-auto py-8 px-4 space-y-8">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<h1 className="text-3xl font-bold tracking-tight">Alert Management</h1>
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
						<CardTitle>Alert Managment</CardTitle>
						<CardDescription>Manage alerts for the dashboard.</CardDescription>
					</CardHeader>
					<CardContent>
						<Textarea
							className="font-mono mb-4"
							value={alertText || ""}
							onChange={(e) => setAlertText(e.target.value)}
							placeholder="Alert text"
						/>
						{result && (
							<Alert variant={result.success ? "default" : "destructive"} className="mb-4">
								<AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
								<AlertDescription>{result.success ? "Alert set" : "Error setting alert"}</AlertDescription>
							</Alert>
						)}

						<AlertDialog open={isConfirmOpen}>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Confirm</AlertDialogTitle>
								</AlertDialogHeader>
								<AlertDialogDescription>Are you sure you want to set this alert?</AlertDialogDescription>
								<AlertDialogFooter>
									<AlertDialogAction onClick={handleSetAlert}>Yes</AlertDialogAction>
									<AlertDialogCancel onClick={() => setIsConfirmOpen(false)}>No</AlertDialogCancel>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>

						<Button onClick={() => setIsConfirmOpen(true)}>Set Alert</Button>
					</CardContent>
				</Card>
			</div>
		</main>
	)
}
