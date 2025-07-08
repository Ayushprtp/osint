import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { headers } from "next/headers"
import { canMakeQuery, userQueryUsed } from "@/lib/query"
import { APIError, isApiChecker } from "@/lib/utils"
import { z } from "zod"
import { getActiveSubscription } from "@/lib/subscription"
import { NPD_SEARCH_URL, NPD_VALID_SEARCH_TYPES } from "@/lib/text"

const requestSchema = z.object({
	query: z.string().min(1),
	module: z.union([
		z.enum(NPD_VALID_SEARCH_TYPES),
		z.array(
			z.object({
				field: z.enum(NPD_VALID_SEARCH_TYPES),
				value: z.string().min(1),
			}),
		),
	]),
})

export async function POST(request: NextRequest) {
	const body = await request.json()
	const { query, module } = requestSchema.parse(body)

	if (!isApiChecker(request)) {
		try {
			const user = await auth.api.getSession({ headers: await headers() })
			if (!user) {
				throw new APIError("Unauthorized", 401)
			}

			const subscription = await getActiveSubscription(user.user.id)
			if (!subscription) {
				return NextResponse.json(
					{
						success: false,
						error: "Active subscription required",
					},
					{ status: 403 },
				)
			}

			if (!(await canMakeQuery(user.user.id, "npd"))) {
				throw new APIError("Query limit exceeded", 429)
			}

			await userQueryUsed(user.user.id, "npd")

			const url = `${NPD_SEARCH_URL}/npd/_search?pretty`

			let queryBody

			if (typeof module === "string") {
				queryBody = {
					query: {
						match: {
							[module]: query,
						},
					},
				}
			} else {
				queryBody = {
					query: {
						bool: {
							must: module.map((item) => ({
								match: {
									[item.field]: item.value,
								},
							})),
						},
					},
				}
			}

			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Basic ${btoa("elastic:CyObTfAvDxDiAkv7F2rGGZO59mJ8AjXc46lRn99wsOX0YPampW")}`,
				},
				body: JSON.stringify(queryBody),
			})

			if (!response.ok) {
				throw new APIError(response.statusText, response.status)
			}

			const data = await response.json()

			const hits = data.hits.hits.map((hit: { _source: any }) => hit._source)
			for (const hit of hits) {
				hit.log = undefined
				hit.host = undefined
				hit.event = undefined
				hit.message = undefined

				if (hit.ssn) {
					hit.ssn = `${hit.ssn.slice(0, -4)}XXXX`
				}
			}
			return NextResponse.json({
				success: true,
				data: hits,
				time_taken: data.took ? (data.took / 1000).toFixed(2) : undefined,
				count: data.hits.total?.value,
			})
		} catch (error) {
			console.error("NPD API error:", error)

			if (error instanceof z.ZodError) {
				return NextResponse.json(
					{
						success: false,
						error: "Invalid request parameters",
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

			return NextResponse.json(
				{
					success: false,
					error: error instanceof Error ? error.message : "Unknown error occurred",
				},
				{ status: 500 },
			)
		}
	} else {
		try {
			const url = `${NPD_SEARCH_URL}/npd/_search?pretty`

			let queryBody

			if (typeof module === "string") {
				queryBody = {
					query: {
						match: {
							[module]: query,
						},
					},
				}
			} else {
				queryBody = {
					query: {
						bool: {
							must: module.map((item) => ({
								match: {
									[item.field]: item.value,
								},
							})),
						},
					},
				}
			}

			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Basic ${btoa("elastic:CyObTfAvDxDiAkv7F2rGGZO59mJ8AjXc46lRn99wsOX0YPampW")}`,
				},
				body: JSON.stringify(queryBody),
			})

			if (!response.ok) {
				throw new APIError(response.statusText, response.status)
			}

			const data = await response.json()

			const hits = data.hits.hits.map((hit: { _source: any }) => hit._source)
			for (const hit of hits) {
				hit.log = undefined
				hit.host = undefined
				hit.event = undefined
				hit.message = undefined

				if (hit.ssn) {
					hit.ssn = `${hit.ssn.slice(0, -4)}XXXX`
				}
			}
			return NextResponse.json({
				success: true,
				data: hits,
				time_taken: data.took ? (data.took / 1000).toFixed(2) : undefined,
				count: data.hits.total?.value,
			})
		} catch (error) {
			console.error("NPD API error:", error)

			if (error instanceof z.ZodError) {
				return NextResponse.json(
					{
						success: false,
						error: "Invalid request parameters",
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

			return NextResponse.json(
				{
					success: false,
					error: error instanceof Error ? error.message : "Unknown error occurred",
				},
				{ status: 500 },
			)
		}
	}
}
