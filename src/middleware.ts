import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import arcjet, { detectBot } from "@arcjet/next"
import { auth } from "./auth"

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

	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session && request.nextUrl.pathname.includes("/dashboard")) {
		return NextResponse.redirect(new URL("/sign-in", request.url))
	}

	if (request.nextUrl.pathname.includes("/dashboard/admin")) {
		const roles = session!.user.role?.split(",") || []
		if (!roles.includes("admin")) {
			return NextResponse.redirect(new URL("/dashboard", request.url))
		}
	}

	return NextResponse.next()
}

export const config = {
	runtime: "nodejs",
	matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)", "/dashboard/:path*"],
}
