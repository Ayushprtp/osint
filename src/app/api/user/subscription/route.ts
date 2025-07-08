import { NextResponse } from "next/server"

export async function GET() {
    // Authentication disabled - admin functionality not available
    return NextResponse.json({ 
        success: false, 
        error: "Admin functionality disabled - authentication system has been removed" 
    }, { status: 501 })
}

export async function POST() {
    // Authentication disabled - admin functionality not available
    return NextResponse.json({ 
        success: false, 
        error: "Admin functionality disabled - authentication system has been removed" 
    }, { status: 501 })
}

export async function PATCH() {
    // Authentication disabled - admin functionality not available
    return NextResponse.json({ 
        success: false, 
        error: "Admin functionality disabled - authentication system has been removed" 
    }, { status: 501 })
}

export async function DELETE() {
    // Authentication disabled - admin functionality not available
    return NextResponse.json({ 
        success: false, 
        error: "Admin functionality disabled - authentication system has been removed" 
    }, { status: 501 })
}
