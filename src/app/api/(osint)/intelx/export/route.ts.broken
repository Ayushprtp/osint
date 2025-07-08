import { type NextRequest, NextResponse } from "next/server"
import IntelXClient from "@/services/intelx/client"
import { getMockSession, canMakeMockQuery, mockUserQueryUsed } from "@/lib/mock-auth"
// Mock query functions imported above
import { z } from "zod"
import { APIError } from "@/lib/utils"

const intelClient = new IntelXClient({ key: process.env.INTELX_API_KEY! })

const requestSchema = z.object({
	term: z.string(),
	maxresults: z.number().optional(),
	buckets: z.string().optional(),
	datefrom: z.string().nullable().optional(),
	dateto: z.string().nullable().optional(),
})

export async function POST(req: NextRequest) {
	try {
		const user = getMockSession()

		const body = await req.json()
		const params = requestSchema.parse(body)

		if (!(await canMakeMockQuery())) {
			throw new APIError("Query limit exceeded", 429)
		}

		const results = await intelClient.exportAccounts(params)

		if (!results.records.length) {
			throw new APIError("No accounts found", 404)
		}

		await mockUserQueryUsed()

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

		console.error("IntelX export accounts error:", error)
		return NextResponse.json(
			{
				success: false,
				error: "Internal server error",
			},
			{ status: 500 },
		)
	}
}
