import { type NextRequest, NextResponse } from "next/server"
import arcjet, { detectBot } from "@arcjet/next"

const aj = arcjet({
	key: "ajkey_01jx3581wjf32vmaadrqpygatk",
	rules: [
		detectBot({
			mode: "LIVE",
			allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:MONITOR", "CATEGORY:PREVIEW"],
		}),
	],
})

export async function middleware(request: NextRequest) {
	const decision = await aj.protect(request)

	if (decision.isDenied()) {
		return NextResponse.json({ error: "Bot detected" }, { status: 403 })
	}

	// Authentication disabled - allow all requests to proceed
	// Previously this middleware would redirect users to /sign-in if not authenticated
	// and check admin roles for /dashboard/admin routes
	
	return NextResponse.next()
}

export const config = {
	runtime: "nodejs",
	matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)", "/dashboard/:path*"],
}
