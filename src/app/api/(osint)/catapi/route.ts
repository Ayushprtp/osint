import { type NextRequest, NextResponse } from "next/server";
import { getMockSession, canMakeMockQuery, mockUserQueryUsed } from "@/lib/mock-auth";
// Mock query functions imported above;
import { APIError } from "@/lib/utils";
import { z } from "zod";
const KEYSCORE_API_URL = "https://api.keysco.re/search";
const VALID_SEARCH_TYPES = [
	"email",
	"password",
	"url",
	"username",
	"discord_id",
	"uuid",
] as const;
const requestSchema = z.object({
	query: z.string().min(1),
	searchType: z.enum(VALID_SEARCH_TYPES),
	wildcard: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
	try {
		const user = getMockSession();

				{ status: 403 },
			);
		}

		const body = await request.json();
		const { query, searchType, wildcard } = requestSchema.parse(body);

		if (!(await canMakeMockQuery())) {
			throw new APIError("Query limit exceeded", 429);
		}

		await mockUserQueryUsed();

		const response = await fetch(KEYSCORE_API_URL, {
			method: "POST",
			body: JSON.stringify({
				terms: [query],
				types: [searchType],
				source: searchType === "uuid" ? "xkeyscore" : "both",
				wildcard: wildcard || false,
			}),
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${process.env.KEYSCORE_API_KEY}`,
			},
		});

		if (!response.ok) {
			throw new APIError(response.statusText, response.status);
		}

		const data = await response.json();
		return NextResponse.json({ success: true, data: data });
	} catch (error) {
		if (error instanceof APIError) {
			throw new APIError(error.message, error.statusCode);
		}
		throw new APIError("An error occurred while processing your request", 500);
	}
} 
