import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Mock response data
    const mockResponse = {
      success: true,
      results: [
        {
          query: body.query || "example@domain.com",
          source: "CatAPI Demo",
          found: true,
          data: {
            email: body.query,
            breaches: ["Demo Breach 2024"],
            last_seen: "2024-01-01"
          }
        }
      ],
      total: 1
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}