import type React from "react"

export function RutifyIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width={32}
			height={32}
			viewBox="0 0 2048 2048"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			aria-label="Rutify icon"
			{...props}
		>
			<path
				d="M2048,410.877C2048,184.108 1863.89,0 1637.12,0L410.877,0C184.108,0 0,184.108 0,410.877L0,1637.12C0,1863.89 184.108,2048 410.877,2048L1637.12,2048C1863.89,2048 2048,1863.89 2048,1637.12L2048,410.877Z"
				style={{ fill: "currentColor", opacity: 0.2 }}
			/>
			<g transform="matrix(0.63859,0,0,0.63859,-148.596,381.96)">
				<g transform="matrix(2187.6,0,0,2187.6,306,1782)">
					<rect x="0.23" y="-0.138" width="0.14" height="0.138" style={{ fill: "currentColor", fillRule: "nonzero" }} />
				</g>
				<g transform="matrix(2187.6,0,0,2187.6,1618.56,1782)">
					<path
						d="M0.094,-0.53L0.244,-0.53L0.244,0L0.094,0L0.094,-0.53ZM0.244,-0.53L0.514,-0.53L0.514,-0.38L0.244,-0.38L0.244,-0.53Z"
						style={{ fill: "currentColor", fillRule: "nonzero" }}
					/>
				</g>
			</g>
		</svg>
	)
}

export default RutifyIcon
