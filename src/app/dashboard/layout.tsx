"use client"
import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, X } from "lucide-react"
import { LayoutWarnings } from "@/components/layout-warnings"
import { ModuleWarnings } from "@/components/module-warnings"

type DashboardLayoutProps = {
	children: React.ReactNode
}

const formatTextWithLinks = (text: string) => {
	if (!text) return null

	const urlRegex = /(https?:\/\/[^\s]+)/g

	const matches: { url: string; index: number }[] = []
	let match

	while ((match = urlRegex.exec(text)) !== null) {
		matches.push({
			url: match[0],
			index: match.index,
		})
	}

	if (matches.length === 0) {
		return text
	}

	const result: (string | React.ReactElement)[] = []
	let lastIndex = 0

	matches.forEach((match, i) => {
		if (match.index > lastIndex) {
			result.push(text.substring(lastIndex, match.index))
		}

		result.push(
			<a
				key={i}
				href={match.url}
				target="_blank"
				rel="noopener noreferrer"
				className="text-rose-300 hover:text-rose-200 border-b border-rose-300/40 hover:border-rose-200/60 transition-colors inline-block"
			>
				{match.url}
			</a>,
		)

		lastIndex = match.index + match.url.length
	})

	if (lastIndex < text.length) {
		result.push(text.substring(lastIndex))
	}

	return result
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	const [alert, setAlert] = useState("")
	const [isLoading, setIsLoading] = useState(true)
	const [isVisible, setIsVisible] = useState(true)
	const pathname = usePathname()

	const { moduleId, isModulePage } = useMemo(() => {
		const extractedModuleId = pathname.startsWith("/dashboard/") ? pathname.split("/")[2] : null

		const isModule =
			extractedModuleId && extractedModuleId !== "admin" && !pathname.includes("/admin/") && pathname !== "/dashboard"

		return {
			moduleId: extractedModuleId,
			isModulePage: isModule,
		}
	}, [pathname])

	useEffect(() => {
		const fetchAlert = async () => {
			try {
				const response = await fetch("/api/alert")
				const { data } = await response.json()
				setAlert(data.text)
			} catch (err) {
				console.error("Error fetching alert:", err)
				setAlert("Error fetching alert")
			} finally {
				setIsLoading(false)
			}
		}
		fetchAlert()
	}, [])

	const handleDismiss = () => {
		setIsVisible(false)
	}

	return (
		<SidebarProvider>
			<div className="flex min-h-screen bg-background">
				<AppSidebar />
				<div className="flex w-full flex-1 flex-col">
					<Header />
					<main className="flex-1 overflow-y-auto p-0">
						{isLoading ? (
							<Skeleton className="h-14 mx-4 mt-4 bg-rose-900/30" />
						) : (
							alert &&
							isVisible && (
								<div className="mx-4 mt-4 px-4 py-3 rounded-lg border border-rose-800/50 bg-gradient-to-r from-rose-900/30 to-rose-950/40 backdrop-blur-sm transition-all hover:border-rose-700/60 shadow-sm">
									<div className="flex items-start gap-3">
										<AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
										<div className="flex-1 text-rose-200/90 text-sm whitespace-pre-line">
											{formatTextWithLinks(alert)}
										</div>
										<button
											onClick={handleDismiss}
											className="text-rose-400/70 hover:text-rose-300 transition-colors flex-shrink-0"
											aria-label="Dismiss alert"
										>
											<X className="w-5 h-5" />
										</button>
									</div>
								</div>
							)
						)}
						<LayoutWarnings />
						{isModulePage && moduleId && <ModuleWarnings moduleId={moduleId} />}
						<div className="min-h-[calc(100vh-4rem)]">{children}</div>
					</main>
				</div>
			</div>
		</SidebarProvider>
	)
}
