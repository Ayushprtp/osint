"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
	React.ElementRef<typeof CheckboxPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, forwardedRef) => {
	const handleRef = React.useCallback(
		(instance: React.ElementRef<typeof CheckboxPrimitive.Root> | null) => {
			if (typeof forwardedRef === "function") {
				forwardedRef(instance)
			} else if (forwardedRef && "current" in forwardedRef) {
				forwardedRef.current = instance
			}
		},
		[forwardedRef],
	)

	return (
		<CheckboxPrimitive.Root
			ref={handleRef}
			className={cn(
				"peer h-4 w-4 shrink-0 rounded-sm border border-rose-500/20 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-rose-500 data-[state=checked]:text-primary-foreground",
				className,
			)}
			{...props}
		>
			<CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
				<Check className="h-4 w-4 text-white" />
			</CheckboxPrimitive.Indicator>
		</CheckboxPrimitive.Root>
	)
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
