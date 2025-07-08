"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, Info, AlertCircle, X } from "lucide-react"

interface ModuleWarning {
	id: number
	moduleId: string
	message: string
	severity: "info" | "warning" | "error"
	isActive: boolean
	createdAt: string
	expiresAt?: string
}

interface ModuleWarningsProps {
	moduleId: string
}

const severityConfig = {
	error: {
		icon: <AlertTriangle className="h-5 w-5 text-red-600" aria-label="Error" />,
		variant: "destructive" as const,
		title: "Error",
		borderColor: "#dc2626",
	},
	warning: {
		icon: <AlertCircle className="h-5 w-5 text-yellow-600" aria-label="Warning" />,
		variant: "default" as const,
		title: "Warning",
		borderColor: "#facc15",
	},
	info: {
		icon: <Info className="h-5 w-5 text-blue-600" aria-label="Info" />,
		variant: "default" as const,
		title: "Info",
		borderColor: "#2563eb",
	},
}

export function ModuleWarnings({ moduleId }: ModuleWarningsProps) {
	// Authentication disabled - module warnings not available without user session
	return null
}
