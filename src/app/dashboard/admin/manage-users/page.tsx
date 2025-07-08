"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Trash2, UserPlus, UserCog } from "lucide-react"
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
import type { JSX } from "react/jsx-runtime"

type User = {
	id: string
	name: string
	alias: string
}

type ActionResult = {
	success: boolean
	message: string
	users?: { user: User }
}

type ActionType = "delete-user" | "create-user" | "set-alias"

const ACTION_CONFIG: Record<
	ActionType,
	{
		label: string
		icon: JSX.Element
		getPayload: (fields: UserFormFields) => object
		disabled: (fields: UserFormFields) => boolean
	}
> = {
	"delete-user": {
		label: "Delete User",
		icon: <Trash2 className="mr-2 h-4 w-4" />,
		getPayload: ({ deleteUsername }) => ({ username: deleteUsername }),
		disabled: ({ deleteUsername }) => !deleteUsername.trim(),
	},
	"create-user": {
		label: "Create User",
		icon: <UserPlus className="mr-2 h-4 w-4" />,
		getPayload: ({ createAlias }) => ({ alias: createAlias }),
		disabled: ({ createAlias }) => !createAlias.trim(),
	},
	"set-alias": {
		label: "Set Alias",
		icon: <UserCog className="mr-2 h-4 w-4" />,
		getPayload: ({ setAliasId, setAliasNewAlias }) => ({
			id: setAliasId,
			alias: setAliasNewAlias,
		}),
		disabled: ({ setAliasId, setAliasNewAlias }) => !setAliasId.trim() || !setAliasNewAlias.trim(),
	},
}

type UserFormFields = {
	deleteUsername: string
	createAlias: string
	setAliasId: string
	setAliasNewAlias: string
}

const initialFields: UserFormFields = {
	deleteUsername: "",
	createAlias: "",
	setAliasId: "",
	setAliasNewAlias: "",
}

export default function ManageUsers() {
	const [result, setResult] = useState<ActionResult | null>(null)
	const [isConfirmOpen, setIsConfirmOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [fields, setFields] = useState<UserFormFields>(initialFields)
	const [currentAction, setCurrentAction] = useState<ActionType | null>(null)
	const [activeTab, setActiveTab] = useState<ActionType>("delete-user")

	const handleInputChange = (field: keyof UserFormFields) => (e: React.ChangeEvent<HTMLInputElement>) => {
		setFields((prev) => ({ ...prev, [field]: e.target.value }))
	}

	async function handleAction(action: ActionType) {
		setIsLoading(true)
		try {
			const response = await fetch(`/api/admin/${action}`, {
				method: action === "delete-user" ? "DELETE" : "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(ACTION_CONFIG[action].getPayload(fields)),
			})
			const result = await response.json()
			setResult(result)
			if (result.success) setFields(initialFields)
		} catch (error) {
			console.error(`Error ${action}:`, error)
			setResult({
				success: false,
				message: `Failed to ${ACTION_CONFIG[action].label}`,
			})
		} finally {
			setIsLoading(false)
			setIsConfirmOpen(false)
			setCurrentAction(null)
		}
	}

	const openConfirm = (action: ActionType) => {
		setCurrentAction(action)
		setIsConfirmOpen(true)
	}

	const renderActionButton = (action: ActionType) => {
		const { label, icon, disabled } = ACTION_CONFIG[action]
		return (
			<AlertDialog open={isConfirmOpen && currentAction === action} onOpenChange={setIsConfirmOpen}>
				<AlertDialogTrigger asChild>
					<Button
						variant={action === "delete-user" ? "destructive" : "default"}
						className="w-full"
						disabled={disabled(fields) || isLoading}
						onClick={() => openConfirm(action)}
					>
						{icon}
						{isLoading && currentAction === action ? "Processing..." : label}
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. Please confirm you want to proceed.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={() => handleAction(action)} disabled={isLoading}>
							Confirm
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		)
	}

	return (
		<main className="flex-1 overflow-y-auto">
			<div className="container mx-auto py-8 px-4 space-y-8">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
					<Button variant="outline" asChild>
						<Link href="/dashboard/admin">
							<ArrowLeft className="w-6 h-6 mr-2" />
							Go to Admin Dashboard
						</Link>
					</Button>
				</div>

				<Card className="w-full">
					<CardHeader>
						<CardTitle>User Management</CardTitle>
						<CardDescription>Create, delete, or modify user accounts</CardDescription>
					</CardHeader>
					<CardContent>
						<Tabs
							value={activeTab}
							onValueChange={(val) => {
								setActiveTab(val as ActionType)
								setResult(null)
							}}
						>
							<TabsList className="grid w-full grid-cols-3">
								<TabsTrigger value="delete-user">Delete User</TabsTrigger>
								<TabsTrigger value="create-user">Create User</TabsTrigger>
								<TabsTrigger value="set-alias">Set User Alias</TabsTrigger>
							</TabsList>
							<TabsContent value="delete-user" className="space-y-4">
								<Input
									placeholder="Enter username to delete"
									value={fields.deleteUsername}
									onChange={handleInputChange("deleteUsername")}
								/>
								{renderActionButton("delete-user")}
							</TabsContent>
							<TabsContent value="create-user" className="space-y-4">
								<Input
									placeholder="Enter an alias"
									value={fields.createAlias}
									onChange={handleInputChange("createAlias")}
								/>
								{renderActionButton("create-user")}
							</TabsContent>
							<TabsContent value="set-alias" className="space-y-4">
								<Input
									placeholder="Enter User ID"
									value={fields.setAliasId}
									onChange={handleInputChange("setAliasId")}
								/>
								<Input
									placeholder="Enter New Alias"
									value={fields.setAliasNewAlias}
									onChange={handleInputChange("setAliasNewAlias")}
								/>
								{renderActionButton("set-alias")}
							</TabsContent>
						</Tabs>

						{result && (
							<Alert variant={result.success ? "default" : "destructive"} className="mt-4">
								<AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
								<AlertDescription>{result.users ? result.users.user.name : result.message}</AlertDescription>
							</Alert>
						)}
					</CardContent>
				</Card>
			</div>
		</main>
	)
}
