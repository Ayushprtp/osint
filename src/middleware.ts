import { type NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
	// Authentication disabled - allow all requests to proceed
	// Bot protection and authentication checks have been disabled for demo purposes
	// Previously this middleware would:
	// - Check for bot traffic using Arcjet
	// - Redirect users to /sign-in if not authenticated  
	// - Check admin roles for /dashboard/admin routes
	
	return NextResponse.next()
}

export const config = {
	runtime: "nodejs",
	matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)", "/dashboard/:path*"],
}
