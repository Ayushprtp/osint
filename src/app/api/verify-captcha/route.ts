import { NextResponse } from "next/server"

export async function POST(req: Request) {
	try {
		const { token } = await req.json()

		if (!token) {
			return NextResponse.json({ success: false, message: "CAPTCHA token is required" }, { status: 400 })
		}

		const hcaptchaSecret = process.env.HCAPTCHA_SECRET_KEY || "ES_6c1f303d9f2947619e6bbf8831407eaf"

		const verificationResponse = await fetch("https://hcaptcha.com/siteverify", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams({
				secret: hcaptchaSecret,
				response: token,
			}),
		})

		const verificationData = await verificationResponse.json()

		if (verificationData.success) {
			return NextResponse.json({ success: true })
		}
		return NextResponse.json({ success: false, message: "CAPTCHA verification failed" }, { status: 400 })
	} catch (error) {
		console.error("CAPTCHA verification error:", error)
		return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
	}
}
