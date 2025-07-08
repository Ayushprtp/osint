import * as React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const cardComponents = {
	Card: React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
		<div
			ref={ref}
			className={cn(
				"rounded-xl border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md",
				className,
			)}
			{...props}
		/>
	)),

	Header: React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
		<div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
	)),

	Title: React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
		<h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
	)),

	Description: React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
		<p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
	)),

	Content: React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
		<div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
	)),

	Footer: React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
		<div ref={ref} className={cn("flex items-center justify-between p-6 pt-0", className)} {...props} />
	)),
}

for (const [key, component] of Object.entries(cardComponents)) {
	component.displayName = `Card${key}`
}

export const {
	Card,
	Header: CardHeader,
	Title: CardTitle,
	Description: CardDescription,
	Content: CardContent,
	Footer: CardFooter,
} = cardComponents
