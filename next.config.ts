import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	productionBrowserSourceMaps: false,
	poweredByHeader: false,
	images: {
		remotePatterns: [
			{
				hostname: "www.google.com",
				pathname: "/**",
			},
			{
				hostname: "cdn.osint.industries",
				pathname: "/**",
			},
		],
	},
	experimental: {
		nodeMiddleware: true,
	},
}

export default nextConfig
