import Link from "next/link"
import { AlertCircle } from "lucide-react"

const ErrorMessage = {
	title: "404 - Page Not Found",
	description: "The requested page could not be found.",
	details: "We're sorry, but the page you're looking for doesn't exist or has been moved.",
}

const ErrorIcon = () => (
	<div className="flex h-8 w-8 items-center justify-center rounded-sm border border-border bg-accent p-2">
		<AlertCircle className="h-5 w-5 text-destructive" />
	</div>
)

const HomeButton = () => (
	<Link
		href="/"
		className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 transition-colors"
	>
		Go back home
	</Link>
)

export default function NotFound() {
	return (
		<main className="absolute inset-0 flex items-center justify-center">
			<div className="flex flex-col items-center justify-center gap-4 text-destructive">
				<ErrorIcon />
				<div className="flex flex-col items-center justify-center gap-2">
					<h1 className="text-base font-medium">{ErrorMessage.title}</h1>
					<h2 className="text-center text-sm font-normal text-muted-foreground font-mono">
						{ErrorMessage.description}
					</h2>
					<p className="text-center text-xs font-normal text-muted-foreground">{ErrorMessage.details}</p>
				</div>
				<HomeButton />
			</div>
		</main>
	)
}
