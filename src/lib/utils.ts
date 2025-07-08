import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export async function fetchAdminStats() {
	try {
		const response = await fetch("/api/admin/stats")
		if (!response.ok) {
			throw new Error("Failed to fetch stats")
		}
		return await response.json()
	} catch (error) {
		console.error("Failed to fetch stats:", error)
		return {
			activeSubscriptions: 0,
			revenueThisMonth: 0,
			pendingPayments: 0,
		}
	}
}

export class APIError extends Error {
	constructor(
		message: string,
		public statusCode: number,
	) {
		super(message)
		this.name = "APIError"
	}
}

export function isApiChecker(req: Request): boolean {
	const userAgent = req.headers.get("user-agent") || ""
	return userAgent.includes("OSINT-Dashboard-API-Checker")
}
