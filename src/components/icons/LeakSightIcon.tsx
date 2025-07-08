import type React from "react"

export const LeakSightIcon = (props: React.SVGProps<SVGSVGElement>) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}
		>
			<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
			<path d="M12 16v.01" />
			<path d="M8 9h8" />
			<path d="M8 13h5" />
			<path d="M16 9v4h.01" />
		</svg>
	)
}
