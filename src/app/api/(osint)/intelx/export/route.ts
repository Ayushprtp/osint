import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Mock response data for export
    const mockResponse = {
      success: true,
      export_id: "mock_export_123",
      status: "completed",
      download_url: "/api/mock-download",
      results_count: 10,
      query: body.query,
      format: body.format || "csv"
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