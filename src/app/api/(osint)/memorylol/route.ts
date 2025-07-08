import { type NextRequest, NextResponse } from "next/server";
import { getMockSession, canMakeMockQuery, mockUserQueryUsed } from "@/lib/mock-auth";
// Mock query functions imported above;
import { APIError } from "@/lib/utils";
import { z } from "zod";

const MEMORYLOL_API_URL = "https://api.memory.lol/v1";

const requestSchema = z.object({
  query: z.string().min(1),
  type: z.enum(["tw"]).default("tw"),
});

export async function POST(request: NextRequest) {
  try {
    const user = getMockSession();

    const body = await request.json();
    const { query, type } = requestSchema.parse(body);

    if (!(await canMakeMockQuery())) {
      throw new APIError("Query limit exceeded", 429);
    }

    await mockUserQueryUsed();

    const url = `${MEMORYLOL_API_URL}/${type}/${query}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new APIError(response.statusText, response.status);
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      result: data,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request parameters",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    if (error instanceof APIError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error("Memory.lol API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred while processing your request",
      },
      { status: 500 }
    );
  }
} 
