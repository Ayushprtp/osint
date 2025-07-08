import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { headers } from "next/headers"
import { APIError } from "@/lib/utils"
import { db } from "@/db"
import { moduleWarnings } from "@/db/schema"
import { eq, and } from "drizzle-orm"

export async function POST(request: Request) {
	const userSession = await auth.api.getSession({
		headers: await headers(),
	})

	const hasAdminPermission = await auth.api.userHasPermission({
		body: {
			userId: userSession?.user?.id,
			permissions: { user: ["list"] },
		},
	})

	if (!userSession || !hasAdminPermission) {
		throw new APIError("Unauthorized", 401)
	}

	const { moduleIds, message, severity = "info", expiresAt } = await request.json()

	if (!moduleIds || !Array.isArray(moduleIds) || moduleIds.length === 0) {
		throw new APIError("Module IDs are required", 400)
	}

	if (!message || typeof message !== "string") {
		throw new APIError("Warning message is required", 400)
	}

	if (!["info", "warning", "error"].includes(severity)) {
		throw new APIError("Invalid severity level", 400)
	}

	try {
		const warnings = await db
			.insert(moduleWarnings)
			.values(
				moduleIds.map((moduleId: string) => ({
					moduleId,
					message,
					severity,
					createdBy: userSession.user.id,
					expiresAt: expiresAt ? new Date(expiresAt) : null,
				})),
			)
			.returning()

		return NextResponse.json({ success: true, warnings })
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error"
		throw new APIError(`Failed to create module warnings: ${errorMessage}`, 500)
	}
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const moduleId = searchParams.get("moduleId")

	if (!moduleId) {
		throw new APIError("Module ID is required", 400)
	}

	try {
		const warnings = await db
			.select()
			.from(moduleWarnings)
			.where(and(eq(moduleWarnings.moduleId, moduleId), eq(moduleWarnings.isActive, true)))
			.orderBy(moduleWarnings.createdAt)

		const activeWarnings = warnings.filter((warning) => !warning.expiresAt || warning.expiresAt > new Date())

		return NextResponse.json({ success: true, warnings: activeWarnings })
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error"
		throw new APIError(`Failed to fetch module warnings: ${errorMessage}`, 500)
	}
}

export async function PATCH(request: Request) {
	const userSession = await auth.api.getSession({
		headers: await headers(),
	})

	const hasAdminPermission = await auth.api.userHasPermission({
		body: {
			userId: userSession?.user?.id,
			permissions: { user: ["list"] },
		},
	})

	if (!userSession || !hasAdminPermission) {
		throw new APIError("Unauthorized", 401)
	}

	const { warningId, isActive } = await request.json()

	if (!warningId) {
		throw new APIError("Warning ID is required", 400)
	}

	try {
		const [warning] = await db.select().from(moduleWarnings).where(eq(moduleWarnings.id, warningId))

		if (!warning) {
			throw new APIError("Module warning not found", 404)
		}

		const updatedWarning = await db
			.update(moduleWarnings)
			.set({ isActive: isActive ?? false })
			.where(eq(moduleWarnings.id, warningId))
			.returning()

		return NextResponse.json({ success: true, warning: updatedWarning[0] })
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error"
		throw new APIError(`Failed to update module warning: ${errorMessage}`, 500)
	}
}
