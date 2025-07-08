import type { DocResource } from "@/config/docResources"

interface DocResourceItemProps extends DocResource {}

export const DocResourceItem = ({ title, description, icon, category }: DocResourceItemProps) => {
	const getCategoryColor = (category: string) => {
		switch (category) {
			case "guide":
				return "bg-blue-400/10 text-blue-400 border-blue-400/20"
			case "reference":
				return "bg-purple-400/10 text-purple-400 border-purple-400/20"
			case "tutorial":
				return "bg-green-400/10 text-green-400 border-green-400/20"
			case "api":
				return "bg-amber-400/10 text-amber-400 border-amber-400/20"
			case "video":
				return "bg-red-400/10 text-red-400 border-red-400/20"
			default:
				return "bg-gray-400/10 text-gray-400 border-gray-400/20"
		}
	}

	return (
		<div className="flex items-start justify-between py-3 border-b last:border-0">
			<div className="flex items-start gap-3">
				<div className={`p-1.5 rounded-lg ${getCategoryColor(category)}`}>{icon}</div>
				<div>
					<p className="font-medium">{title}</p>
					<p className="text-xs text-muted-foreground mt-1">{description}</p>
				</div>
			</div>
			<div className={`text-xs font-medium px-2 py-1 rounded-full ${getCategoryColor(category)}`}>{category}</div>
		</div>
	)
}
