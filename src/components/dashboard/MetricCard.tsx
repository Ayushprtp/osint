import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReactNode } from "react"

interface MetricCardProps {
	label: string
	value: string
	icon: ReactNode
	color: string
}

export const MetricCard = ({ label, value, icon, color }: MetricCardProps) => (
	<Card className="shadow hover:shadow-md transition-all hover:border-rose-400/30 duration-300">
		<CardHeader className="pb-2">
			<div className="flex justify-between items-center">
				<CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
				<div className={`p-2 rounded-lg ${color}`}>{icon}</div>
			</div>
		</CardHeader>
		<CardContent>
			<p className="text-2xl font-bold">{value}</p>
		</CardContent>
	</Card>
)
