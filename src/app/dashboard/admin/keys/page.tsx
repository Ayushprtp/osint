"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Key, Copy, Timer } from "lucide-react"
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
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type ActionResult = {
	success: boolean
	message: string
	key?: string
	keys?: string[]
}

const DEFAULT_DURATION = "30"
const DEFAULT_BULK_COUNT = "10"

export default function GenerateKeys() {
	const [result, setResult] = useState<ActionResult | null>(null)
	const [isConfirmOpen, setIsConfirmOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [copied, setCopied] = useState(false)

	const [singleDuration, setSingleDuration] = useState(DEFAULT_DURATION)
	const [bulkDuration, setBulkDuration] = useState(DEFAULT_DURATION)
	const [bulkCount, setBulkCount] = useState(DEFAULT_BULK_COUNT)

	const handleAction = async (action: "single" | "bulk", data: object) => {
		setIsLoading(true)
		try {
			const response = await fetch("/api/admin/generate-keys", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			})

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const responseData = await response.json()

			setResult({
				success: true,
				message: `Successfully generated ${action === "bulk" ? "keys" : "key"}`,
				key: action === "single" ? responseData.key : undefined,
				keys: action === "bulk" ? responseData.keys : undefined,
			})
		} catch (error) {
			console.error(`Error generating ${action} key:`, error)
			setResult({
				success: false,
				message: `Failed to generate ${action} key: ${error instanceof Error ? error.message : String(error)}`,
			})
		} finally {
			setIsLoading(false)
			setIsConfirmOpen(false)
		}
	}

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	const renderActionButton = (action: "single" | "bulk", label: string, icon: React.ReactNode, disabled = false) => (
		<AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
			<AlertDialogTrigger asChild>
				<Button className="w-full" disabled={disabled || isLoading}>
					{icon}
					{isLoading ? "Processing..." : label}
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Confirm Key Generation</AlertDialogTitle>
					<AlertDialogDescription>
						{action === "single"
							? `Generate a ${singleDuration}-day subscription key?`
							: `Generate ${bulkCount} keys for ${bulkDuration} days each?`}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={() => {
							if (action === "single") {
								handleAction(action, {
									durationDays: Number.parseInt(singleDuration),
								})
							} else {
								handleAction(action, {
									durationDays: Number.parseInt(bulkDuration),
									count: Number.parseInt(bulkCount),
								})
							}
						}}
					>
						Generate
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)

	const renderResultAlert = () =>
		result && (
			<Alert variant={result.success ? "default" : "destructive"} className="mt-4">
				<AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
				<AlertDescription className="space-y-2">
					<p>{result.message}</p>
					{result.key && (
						<div className="flex items-center justify-between p-2 mt-2 border rounded-md bg-muted">
							<code className="font-mono">{result.key}</code>
							<Button variant="ghost" size="icon" onClick={() => copyToClipboard(result.key!)}>
								<Copy className={`h-4 w-4 ${copied ? "text-green-500" : ""}`} />
							</Button>
						</div>
					)}
					{result.keys && (
						<div className="space-y-2 mt-2">
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium">Generated {result.keys.length} keys:</span>
								<Button variant="outline" size="sm" onClick={() => copyToClipboard((result.keys ?? []).join("\n"))}>
									<Copy className={`h-4 w-4 mr-2 ${copied ? "text-green-500" : ""}`} />
									Copy All
								</Button>
							</div>
							<textarea
								className="w-full h-40 p-2 font-mono text-sm border rounded-md bg-muted"
								readOnly
								value={(result.keys ?? []).join("\n")}
							/>
						</div>
					)}
				</AlertDescription>
			</Alert>
		)

	return (
		<main className="flex-1 overflow-y-auto">
			<div className="container mx-auto py-8 px-4 space-y-8">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<h1 className="text-3xl font-bold tracking-tight">Generate Keys</h1>
					<Button variant="outline" asChild>
						<Link href="/dashboard/admin">
							<ArrowLeft className="w-6 h-6 mr-2" />
							Go to Admin Dashboard
						</Link>
					</Button>
				</div>

				<Card className="w-full">
					<CardHeader>
						<CardTitle>Subscription Key Generation</CardTitle>
						<CardDescription>Generate single or bulk subscription keys</CardDescription>
					</CardHeader>
					<CardContent>
						<Tabs defaultValue="single">
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="single">Single Key</TabsTrigger>
								<TabsTrigger value="bulk">Bulk Keys</TabsTrigger>
							</TabsList>

							<TabsContent value="single" className="space-y-4">
								<div className="flex items-center space-x-2">
									<Input
										type="number"
										placeholder="Duration in days"
										value={singleDuration}
										min={1}
										onChange={(e) => setSingleDuration(e.target.value)}
									/>
									<span className="text-sm text-muted-foreground whitespace-nowrap">days</span>
								</div>
								{renderActionButton(
									"single",
									"Generate Key",
									<Key className="mr-2 h-4 w-4" />,
									!singleDuration || Number.parseInt(singleDuration) <= 0,
								)}
							</TabsContent>

							<TabsContent value="bulk" className="space-y-4">
								<div className="flex items-center space-x-2">
									<Input
										type="number"
										placeholder="Number of keys"
										value={bulkCount}
										min={1}
										onChange={(e) => setBulkCount(e.target.value)}
									/>
									<span className="text-sm text-muted-foreground whitespace-nowrap">keys for</span>
									<Input
										type="number"
										placeholder="Duration in days"
										value={bulkDuration}
										min={1}
										onChange={(e) => setBulkDuration(e.target.value)}
									/>
									<span className="text-sm text-muted-foreground whitespace-nowrap">days each</span>
								</div>
								{renderActionButton(
									"bulk",
									"Generate Keys",
									<Timer className="mr-2 h-4 w-4" />,
									!bulkDuration || Number.parseInt(bulkDuration) <= 0 || !bulkCount || Number.parseInt(bulkCount) <= 0,
								)}
							</TabsContent>
						</Tabs>

						{renderResultAlert()}
					</CardContent>
				</Card>
			</div>
		</main>
	)
}
