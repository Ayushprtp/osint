import { Info, LinkIcon, Video, FileText } from "lucide-react"

export interface DocResource {
	title: string
	description: string
	icon: React.ReactNode
	category: "guide" | "reference" | "tutorial" | "video"
}

export const docResources: DocResource[] = [
	{
		title: "Getting Started with TRACKED",
		description: "Learn the basics of the platform and how to perform your first search",
		icon: <Info size={14} />,
		category: "guide",
	},
	{
		title: "The Impact of OSINT in whistleblowing",
		description: "Learn about risk and ethics in OSINT",
		icon: <LinkIcon size={14} />,
		category: "reference",
	},
	{
		title: "OSINT in five hours",
		description: "Detailed video that teaches you a lot about GEOINT",
		icon: <Video size={14} />,
		category: "video",
	},
	{
		title: "Data Source Specifications",
		description: "Detailed information about each integrated data source in TRACKED",
		icon: <FileText size={14} />,
		category: "reference",
	},
]
