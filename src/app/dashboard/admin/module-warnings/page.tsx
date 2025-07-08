"use client"

import { ModuleWarningsManager } from "@/components/admin/module-warnings-manager"

export default function ModuleWarningsPage() {
	return (
		<main className="container max-w-7xl py-6">
			<div className="grid gap-6">
				<div className="flex items-center justify-between">
					<h1 className="text-3xl font-bold">Module Warnings Management</h1>
				</div>

				<ModuleWarningsManager />
			</div>
		</main>
	)
}
