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
}

export default nextConfig
