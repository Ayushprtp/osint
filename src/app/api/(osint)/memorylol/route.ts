import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { canMakeQuery, userQueryUsed } from "@/lib/query";
import { APIError } from "@/lib/utils";
import { z } from "zod";

const MEMORYLOL_API_URL = "https://api.memory.lol/v1";

const requestSchema = z.object({
  query: z.string().min(1),
  type: z.enum(["tw"]).default("tw"),
});

export async function POST(request: NextRequest) {
  try {
    const user = await auth.api.getSession({ headers: await headers() });
    if (!user) {
      throw new APIError("Unauthorized", 401);
    }

    const body = await request.json();
    const { query, type } = requestSchema.parse(body);

    if (!(await canMakeQuery(user.user.id, "memorylol"))) {
      throw new APIError("Query limit exceeded", 429);
    }

    await userQueryUsed(user.user.id, "memorylol");

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
