import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { captcha } from "better-auth/plugins"
import { db } from "@/db"
import * as schema from "@/db/schema"
import { admin } from "better-auth/plugins"

export const auth = betterAuth({
	trustedOrigins: [process.env.BETTER_AUTH_URL!, "https://localhost:3000", "http://localhost:3000"],
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: schema,
	}),
	emailAndPassword: {
		enabled: true,
		autoSignIn: true,
	},
	plugins: [
		captcha({
			provider: "hcaptcha",
			secretKey: process.env.HCAPTCHA_SECRET_KEY!,
		}),
		admin(),
	],
})
