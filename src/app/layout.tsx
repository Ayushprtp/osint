import { cn } from "@/lib/utils"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Toaster } from "@/components/ui/toaster"
import "@/app/globals.css"
import type { Metadata, Viewport } from "next"
import { DataDomeComponent } from "@datadome/module-nextjs"

interface RootLayoutProps {
	children: React.ReactNode
}

export const metadata: Metadata = {
	title: "TRACKED - OSINT Intelligence Platform",
	description: "The ultimate intelligence platform with zero data retention and ephemeral sessions",
	icons: {
		icon: [
			{ url: "/favicon.svg", type: "image/svg+xml" },
			{ url: "/favicon-192.svg", type: "image/svg+xml", sizes: "192x192" },
		],
		apple: [{ url: "/apple-touch-icon.svg", type: "image/svg+xml" }],
	},
	openGraph: {
		title: "TRACKED - OSINT Intelligence Platform",
		description: "The ultimate intelligence platform with zero data retention and ephemeral sessions",
		images: [{ url: "https://tracked.sh/banner.webp" }],
	},
}

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	themeColor: "#e11d48",
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
	return (
		<html lang="en" suppressHydrationWarning className={cn(GeistSans.variable, GeistMono.variable)}>
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
				<link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
				<link rel="icon" sizes="192x192" href="/favicon-192.svg" type="image/svg+xml" />
				<link href="https://cdn.sell.app/embed/style.css" rel="stylesheet" />
				<meta name="heleket" content="1ffdf577" />
				<DataDomeComponent clientSideKey={"F5CEBAC508E320DC603EE1BD0E1B00"} />
			</head>
			<body className="min-h-screen bg-background font-sans antialiased">
				{children}
				<Toaster />
				<script src="https://cdn.sell.app/embed/script.js" type="module" />
			</body>
		</html>
	)
}
