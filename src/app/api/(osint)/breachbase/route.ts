import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Mock response data
    const mockResponse = {
      success: true,
      results: [
        {
          email: body.query || "example@domain.com",
          source: "BreachBase Demo",
          breach_date: "2024-01-01",
          confidence: "High",
          data_classes: ["Email", "Username", "Password"]
        }
      ],
      total: 1,
      query: body.query,
      search_type: body.search_type || "email"
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