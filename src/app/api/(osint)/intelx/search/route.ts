import { type NextRequest, NextResponse } from "next/server"
import IntelXClient from "@/services/intelx/client"
import { headers } from "next/headers"
import { auth } from "@/auth"
import { canMakeQuery, userQueryUsed } from "@/lib/query"
import { z } from "zod"
import { APIError } from "@/lib/utils"

const intelClient = new IntelXClient({ key: process.env.INTELX_API_KEY! })

const requestSchema = z.object({
	term: z.string(),
})

export async function POST(req: NextRequest) {
	try {
		const user = await auth.api.getSession({ headers: await headers() })
		if (!user) {
			throw new APIError("Unauthorized", 401)
		}

		const body = await req.json()
		const params = requestSchema.parse(body)

		if (!(await canMakeQuery(user.user.id, "intelx"))) {
			throw new APIError("Query limit exceeded", 429)
		}

		const results = await intelClient.idSearch({
			term: params.term,
		})

		await userQueryUsed(user.user.id, "intelx")

		return NextResponse.json({
			success: true,
			records: results.records,
			total: results.total,
		})
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid request",
					details: error.errors,
				},
				{ status: 400 },
			)
		}

		if (error instanceof APIError) {
			return NextResponse.json(
				{
					success: false,
					error: error.message,
				},
				{ status: error.statusCode },
			)
		}

		console.error("IntelX identity search error:", error)
		return NextResponse.json(
			{
				success: false,
				error: "Internal server error",
			},
			{ status: 500 },
		)
	}
}
