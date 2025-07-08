import type { SVGProps } from "react"

export default function NPDIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
			aria-hidden="true"
		>
			<title>NPD Icon</title>
			<circle cx="12" cy="12" r="8" />

			<path d="M12,4 A8,8 0 0,1 20,12 A8,8 0 0,1 16,18" />

			<path d="M8,18 A8,8 0 0,1 4,12 A8,8 0 0,1 8,6" />

			<path d="M10,9 L10,15 M10,9 L14,15 M14,9 L14,15" />
		</svg>
	)
}
