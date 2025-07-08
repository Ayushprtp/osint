"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, SearchSlash } from "lucide-react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "./ui/button"
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
	sticky?: boolean
}

const Logo = () => (
	<div className="flex items-center gap-2">
		<SearchSlash
			width={28}
			height={20}
			className="text-white/80 hover:text-white/90 transition-colors duration-200 ease-in-out cursor-pointer"
		/>
		<span className="text-lg font-bold text-white/80 hover:text-white/90 transition-colors duration-200 ease-in-out cursor-pointer">
			OSINT Dashboard
		</span>
		<Separator orientation="vertical" className="ml-1 h-6" />
	</div>
)

const NavigationBreadcrumbs = ({ items }: { items: Array<{ href: string; label: string }> }) => (
	<Breadcrumb className="hidden md:block">
		<BreadcrumbList>
			<BreadcrumbItem>
				<Link href="/">Home</Link>
			</BreadcrumbItem>
			{items.map((item, index) => (
				<React.Fragment key={item.href}>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						{index === items.length - 1 ? (
							<BreadcrumbPage className="capitalize">{item.label}</BreadcrumbPage>
						) : (
							<Link href={item.href} className="capitalize">
								{item.label}
							</Link>
						)}
					</BreadcrumbItem>
				</React.Fragment>
			))}
		</BreadcrumbList>
	</Breadcrumb>
)

export const Header = React.forwardRef<HTMLElement, HeaderProps>(({ className, sticky, ...props }, ref) => {
	const [offset, setOffset] = React.useState(0)
	const pathname = usePathname()

	const breadcrumbItems = React.useMemo(() => {
		if (pathname === "/") return []
		const segments = pathname.split("/").slice(1)
		return segments.map((segment, index) => ({
			href: `/${segments.slice(0, index + 1).join("/")}`,
			label: segment.replace(/-/g, " "),
		}))
	}, [pathname])

	React.useEffect(() => {
		const handleScroll = () => setOffset(window.scrollY)
		window.addEventListener("scroll", handleScroll, { passive: true })
		return () => window.removeEventListener("scroll", handleScroll)
	}, [])

	return (
		<header
			ref={ref}
			className={cn(
				"flex items-center gap-3 sm:gap-4 p-4 h-16 border-b border-border bg-background/80 backdrop-blur-md",
				sticky && "sticky top-0 z-20",
				offset > 10 && sticky ? "shadow" : "shadow-none",
				className,
			)}
			{...props}
		>
			{pathname === "/" ? (
				<Logo />
			) : (
				<>
					<SidebarTrigger variant="outline" className="scale-125 sm:scale-100" />
					<Separator orientation="vertical" className="h-6" />
				</>
			)}

			<NavigationBreadcrumbs items={breadcrumbItems} />

			<div className="flex gap-2 ml-auto">
				<Button size="sm" variant="outline" asChild>
					<Link href="/dashboard">
						<Home className="mr-2 w-5 h-5" />
						Dashboard
					</Link>
				</Button>
			</div>
		</header>
	)
})

Header.displayName = "Header"
