"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import {
	Search,
	Database,
	Mail,
	User,
	Key,
	UserCircle,
	Loader2,
	ChevronLeft,
	ChevronRight,
	AlertTriangle,
	Download,
	Globe,
	Phone,
	MapPin,
	Hash,
	Shield,
	Check,
	X,
	Clock,
	Copy,
	ExternalLink,
	Eye,
	Target,
	Bug,
	Cat,
	Dog,
	Drill,
	AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CarfaxIcon, SnusbaseIcon, ShodanIcon, CallerAPIIcon, LeakSightIcon } from "@/components/icons"
import { EndatoIcon } from "@/components/icons/EndatoIcon"
import { HunterIcon } from "@/components/icons/HunterIcon"
import { LeakCheckIcon } from "@/components/icons/LeakCheckIcon"
import NPDIcon from "@/components/icons/NPDIcon"
import RutifyIcon from "@/components/icons/RutifyIcon"

type ServiceId = keyof typeof ALL_SERVICES
type SearchType = (typeof SEARCH_TYPES)[number]["id"]

interface SearchResult {
	service: string
	type: string
	data: Record<string, unknown> | string
	timeMs: number
	hasError: boolean
}

const ITEMS_PER_PAGE = 10

const SEARCH_TYPES = [
	{ id: "email", name: "Email", icon: <Mail className="h-4 w-4" /> },
	{ id: "username", name: "Username", icon: <User className="h-4 w-4" /> },
	{ id: "password", name: "Password", icon: <Key className="h-4 w-4" /> },
	{ id: "name", name: "Name", icon: <UserCircle className="h-4 w-4" /> },
	{ id: "phone", name: "Phone", icon: <Phone className="h-4 w-4" /> },
	{ id: "ip", name: "IP Address", icon: <Globe className="h-4 w-4" /> },
	{ id: "domain", name: "Domain", icon: <Globe className="h-4 w-4" /> },
	{ id: "hash", name: "Hash", icon: <Hash className="h-4 w-4" /> },
	{ id: "ssn", name: "SSN", icon: <Shield className="h-4 w-4" /> },
	{ id: "address", name: "Address", icon: <MapPin className="h-4 w-4" /> },
	{ id: "vin", name: "VIN", icon: <CarfaxIcon className="h-4 w-4" /> },
	{ id: "discord", name: "Discord ID", icon: <User className="h-4 w-4" /> },
] as const

const ALL_SERVICES = {
	snusbase: { name: "Snusbase", icon: <SnusbaseIcon className="h-4 w-4" /> },
	intelvault: { name: "IntelVault", icon: <Database className="h-4 w-4" /> },
	leakcheck: { name: "LeakCheck", icon: <LeakCheckIcon className="h-4 w-4" /> },
	osintalternative: { name: "OSINTAlternative", icon: <Globe className="h-4 w-4" /> },
	traceback: { name: "Traceback", icon: <Search className="h-4 w-4" /> },
	ipsearch: { name: "IP Search", icon: <Globe className="h-4 w-4" /> },
	seon: { name: "SEON", icon: <Database className="h-4 w-4" /> },
	rutify: { name: "Rutify", icon: <RutifyIcon className="h-4 w-4" /> },
	leakosint: { name: "LeakOSINT", icon: <Eye className="h-4 w-4" /> },
	tgscan: { name: "TGScan", icon: <Search className="h-4 w-4" /> },
	osintcat: { name: "OSINTCat", icon: <Cat className="h-4 w-4" /> },
	osintdog: { name: "OSINTDog", icon: <Dog className="h-4 w-4" /> },
	shodan: { name: "SHODAN", icon: <ShodanIcon className="h-4 w-4" /> },
	callerapi: { name: "CallerAPI", icon: <CallerAPIIcon className="h-4 w-4" /> },
	breachbase: { name: "BreachBase", icon: <Database className="h-4 w-4" /> },
	endato: { name: "ENDATO", icon: <EndatoIcon className="h-4 w-4" /> },
	hunter: { name: "Hunter", icon: <HunterIcon className="h-4 w-4" /> },
	inf0sec: { name: "Inf0sec", icon: <Eye className="h-4 w-4" /> },
	oathnet: { name: "OATH", icon: <Bug className="h-4 w-4" /> },
	leaksight: { name: "LeakSight", icon: <LeakSightIcon className="h-4 w-4" /> },
	hackcheck: { name: "HackCheck", icon: <Check className="h-4 w-4" /> },
	nosint: { name: "NOSINT", icon: <Target className="h-4 w-4" /> },
	npd: { name: "NPD", icon: <NPDIcon className="h-4 w-4" /> },
	carfax: { name: "Carfax", icon: <CarfaxIcon className="h-4 w-4" /> },
	osintkit: { name: "OsintKit", icon: <Drill className="h-4 w-4" /> },
}

const SERVICES_BY_TYPE: Record<string, Array<{ id: ServiceId; name: string; icon: React.ReactNode }>> = {
	email: [
		{ id: "snusbase", name: ALL_SERVICES.snusbase.name, icon: ALL_SERVICES.snusbase.icon },
		{ id: "intelvault", name: ALL_SERVICES.intelvault.name, icon: ALL_SERVICES.intelvault.icon },
		{ id: "leakcheck", name: ALL_SERVICES.leakcheck.name, icon: ALL_SERVICES.leakcheck.icon },
		{ id: "osintalternative", name: ALL_SERVICES.osintalternative.name, icon: ALL_SERVICES.osintalternative.icon },
		{ id: "traceback", name: ALL_SERVICES.traceback.name, icon: ALL_SERVICES.traceback.icon },
		{ id: "leakosint", name: ALL_SERVICES.leakosint.name, icon: ALL_SERVICES.leakosint.icon },
		{ id: "breachbase", name: ALL_SERVICES.breachbase.name, icon: ALL_SERVICES.breachbase.icon },
		{ id: "hackcheck", name: ALL_SERVICES.hackcheck.name, icon: ALL_SERVICES.hackcheck.icon },
		{ id: "nosint", name: ALL_SERVICES.nosint.name, icon: ALL_SERVICES.nosint.icon },
		{ id: "hunter", name: ALL_SERVICES.hunter.name, icon: ALL_SERVICES.hunter.icon },
		{ id: "endato", name: ALL_SERVICES.endato.name, icon: ALL_SERVICES.endato.icon },
		{ id: "osintcat", name: ALL_SERVICES.osintcat.name, icon: ALL_SERVICES.osintcat.icon },
		{ id: "osintdog", name: ALL_SERVICES.osintdog.name, icon: ALL_SERVICES.osintdog.icon },
		{ id: "inf0sec", name: ALL_SERVICES.inf0sec.name, icon: ALL_SERVICES.inf0sec.icon },
	],
	username: [
		{ id: "snusbase", name: ALL_SERVICES.snusbase.name, icon: ALL_SERVICES.snusbase.icon },
		{ id: "intelvault", name: ALL_SERVICES.intelvault.name, icon: ALL_SERVICES.intelvault.icon },
		{ id: "leakcheck", name: ALL_SERVICES.leakcheck.name, icon: ALL_SERVICES.leakcheck.icon },
		{ id: "traceback", name: ALL_SERVICES.traceback.name, icon: ALL_SERVICES.traceback.icon },
		{ id: "leakosint", name: ALL_SERVICES.leakosint.name, icon: ALL_SERVICES.leakosint.icon },
		{ id: "breachbase", name: ALL_SERVICES.breachbase.name, icon: ALL_SERVICES.breachbase.icon },
		{ id: "hackcheck", name: ALL_SERVICES.hackcheck.name, icon: ALL_SERVICES.hackcheck.icon },
		{ id: "nosint", name: ALL_SERVICES.nosint.name, icon: ALL_SERVICES.nosint.icon },
		{ id: "osintcat", name: ALL_SERVICES.osintcat.name, icon: ALL_SERVICES.osintcat.icon },
		{ id: "osintdog", name: ALL_SERVICES.osintdog.name, icon: ALL_SERVICES.osintdog.icon },
		{ id: "inf0sec", name: ALL_SERVICES.inf0sec.name, icon: ALL_SERVICES.inf0sec.icon },
	],
	password: [
		{ id: "snusbase", name: ALL_SERVICES.snusbase.name, icon: ALL_SERVICES.snusbase.icon },
		{ id: "intelvault", name: ALL_SERVICES.intelvault.name, icon: ALL_SERVICES.intelvault.icon },
		{ id: "leakosint", name: ALL_SERVICES.leakosint.name, icon: ALL_SERVICES.leakosint.icon },
		{ id: "hackcheck", name: ALL_SERVICES.hackcheck.name, icon: ALL_SERVICES.hackcheck.icon },
		{ id: "osintcat", name: ALL_SERVICES.osintcat.name, icon: ALL_SERVICES.osintcat.icon },
		{ id: "leakcheck", name: ALL_SERVICES.leakcheck.name, icon: ALL_SERVICES.leakcheck.icon },
		{ id: "breachbase", name: ALL_SERVICES.breachbase.name, icon: ALL_SERVICES.breachbase.icon },
	],
	name: [
		{ id: "intelvault", name: ALL_SERVICES.intelvault.name, icon: ALL_SERVICES.intelvault.icon },
		{ id: "rutify", name: ALL_SERVICES.rutify.name, icon: ALL_SERVICES.rutify.icon },
		{ id: "endato", name: ALL_SERVICES.endato.name, icon: ALL_SERVICES.endato.icon },
		{ id: "npd", name: ALL_SERVICES.npd.name, icon: ALL_SERVICES.npd.icon },
		{ id: "osintkit", name: ALL_SERVICES.osintkit.name, icon: ALL_SERVICES.osintkit.icon },
		{ id: "snusbase", name: ALL_SERVICES.snusbase.name, icon: ALL_SERVICES.snusbase.icon },
		{ id: "hackcheck", name: ALL_SERVICES.hackcheck.name, icon: ALL_SERVICES.hackcheck.icon },
		{ id: "breachbase", name: ALL_SERVICES.breachbase.name, icon: ALL_SERVICES.breachbase.icon },
	],
	phone: [
		{ id: "intelvault", name: ALL_SERVICES.intelvault.name, icon: ALL_SERVICES.intelvault.icon },
		{ id: "leakcheck", name: ALL_SERVICES.leakcheck.name, icon: ALL_SERVICES.leakcheck.icon },
		{ id: "seon", name: ALL_SERVICES.seon.name, icon: ALL_SERVICES.seon.icon },
		{ id: "callerapi", name: ALL_SERVICES.callerapi.name, icon: ALL_SERVICES.callerapi.icon },
		{ id: "endato", name: ALL_SERVICES.endato.name, icon: ALL_SERVICES.endato.icon },
		{ id: "osintcat", name: ALL_SERVICES.osintcat.name, icon: ALL_SERVICES.osintcat.icon },
		{ id: "osintdog", name: ALL_SERVICES.osintdog.name, icon: ALL_SERVICES.osintdog.icon },
		{ id: "hackcheck", name: ALL_SERVICES.hackcheck.name, icon: ALL_SERVICES.hackcheck.icon },
		{ id: "breachbase", name: ALL_SERVICES.breachbase.name, icon: ALL_SERVICES.breachbase.icon },
	],
	ip: [
		{ id: "snusbase", name: ALL_SERVICES.snusbase.name, icon: ALL_SERVICES.snusbase.icon },
		{ id: "intelvault", name: ALL_SERVICES.intelvault.name, icon: ALL_SERVICES.intelvault.icon },
		{ id: "ipsearch", name: ALL_SERVICES.ipsearch.name, icon: ALL_SERVICES.ipsearch.icon },
		{ id: "shodan", name: ALL_SERVICES.shodan.name, icon: ALL_SERVICES.shodan.icon },
		{ id: "leaksight", name: ALL_SERVICES.leaksight.name, icon: ALL_SERVICES.leaksight.icon },
		{ id: "osintdog", name: ALL_SERVICES.osintdog.name, icon: ALL_SERVICES.osintdog.icon },
		{ id: "hackcheck", name: ALL_SERVICES.hackcheck.name, icon: ALL_SERVICES.hackcheck.icon },
		{ id: "osintcat", name: ALL_SERVICES.osintcat.name, icon: ALL_SERVICES.osintcat.icon },
		{ id: "breachbase", name: ALL_SERVICES.breachbase.name, icon: ALL_SERVICES.breachbase.icon },
	],
	ssn: [
		{ id: "intelvault", name: ALL_SERVICES.intelvault.name, icon: ALL_SERVICES.intelvault.icon },
		{ id: "npd", name: ALL_SERVICES.npd.name, icon: ALL_SERVICES.npd.icon },
	],
	address: [
		{ id: "intelvault", name: ALL_SERVICES.intelvault.name, icon: ALL_SERVICES.intelvault.icon },
		{ id: "npd", name: ALL_SERVICES.npd.name, icon: ALL_SERVICES.npd.icon },
	],
	vin: [{ id: "carfax", name: ALL_SERVICES.carfax.name, icon: ALL_SERVICES.carfax.icon }],
	discord: [{ id: "inf0sec", name: ALL_SERVICES.inf0sec.name, icon: ALL_SERVICES.inf0sec.icon }],
}

const formatCellValue = (_key: string, value: unknown): React.ReactNode => {
	if (value === undefined || value === null) {
		return "-"
	}

	if (typeof value === "object") {
		try {
			return JSON.stringify(value)
		} catch (error) {
			return "[Object]"
		}
	}

	return String(value)
}
const getResultCount = (result: SearchResult): number => {
	if (!result?.data) return 0
	const { service, data } = result

	try {
		if (typeof data === "string") {
			if (service === "nosint") {
				return (data.match(/data: {"status":"batch_results"/g) || []).length
			}
			return 0
		}

		const objData = data as Record<string, unknown>

		switch (service) {
			case "snusbase":
				if (objData.results && typeof objData.results === "object") {
					return Object.values(objData.results as Record<string, unknown[]>).reduce(
						(count, entries) => count + (Array.isArray(entries) ? entries.length : 0),
						0,
					)
				}
				break

			case "intelvault":
				if (objData.results && Array.isArray(objData.results)) {
					return (
						(objData.results as Array<{ data?: unknown[] }>).reduce(
							(count, result) => count + (Array.isArray(result?.data) ? result.data.length : 0),
							0,
						) || 0
					)
				}
				break

			case "leakosint":
				if (objData.List && typeof objData.List === "object") {
					return Object.values(objData.List as Record<string, { Data?: unknown[] }>).reduce(
						(count, dbData) => count + (Array.isArray(dbData?.Data) ? dbData.Data.length : 0),
						0,
					)
				}
				break

			case "leakcheck":
				if (typeof objData.found === "number") {
					return objData.found as number
				}
				if (Array.isArray(objData.result)) {
					return objData.result.length
				}
				break

			case "inf0sec":
				if (typeof objData.count === "number") {
					return objData.count as number
				}
				if (objData.results && typeof objData.results === "object") {
					return Object.values(objData.results as Record<string, unknown[]>).reduce(
						(count, entries) => count + (Array.isArray(entries) ? entries.length : 0),
						0,
					)
				}
				break
		}

		if (Array.isArray(objData)) return objData.length
		if (Array.isArray(objData.results)) return objData.results.length
		if (Array.isArray(objData.result)) return objData.result.length
		if (Array.isArray(objData.data)) return objData.data.length
		if (Array.isArray(objData.records)) return objData.records.length

		return 0
	} catch (error) {
		console.warn(`Error calculating result count for ${service}:`, error)
		return 0
	}
}

const processResultData = (result: SearchResult): Record<string, unknown>[] => {
	if (!result?.data) return []
	const { service, data } = result
	let rows: Record<string, unknown>[] = []

	try {
		if (typeof data === "string") {
			if (service === "nosint") {
				const parsedBatchResults: Array<any> = []
				let creditsLeft: number | undefined

				const events = data.split("\n\n").filter(Boolean)
				for (const event of events) {
					const dataLine = event.split("\n").find((line: string) => line.trim().startsWith("data:"))
					if (!dataLine) continue
					try {
						const jsonStr = dataLine.trim().substring(5).trim()
						const parsedEvent = JSON.parse(jsonStr)

						if (parsedEvent.creditsLeft || parsedEvent.status === "completed") {
							creditsLeft = parsedEvent.creditsLeft
						}

						if (parsedEvent.status === "batch_results" && Array.isArray(parsedEvent.results)) {
							parsedBatchResults.push(parsedEvent)
						}
					} catch (eventError) {
						console.warn("Failed to parse NOSINT event:", eventError)
					}
				}

				for (const batch of parsedBatchResults) {
					if (batch?.results && Array.isArray(batch.results)) {
						batch.results.forEach((plugin: any) => {
							if (!plugin?.data && !plugin?.plugin_name) return

							const pluginData = plugin.data || plugin
							const plugin_name = plugin.plugin_name || "unknown"
							const execution_time = plugin.execution_time || pluginData.execution_time || "unknown"

							if (pluginData.table?.headers && pluginData.table.values) {
								pluginData.table.values.forEach((tableRow: unknown[]) => {
									const rowData: Record<string, unknown> = {}
									pluginData.table.headers.forEach((header: string, index: number) => {
										rowData[header] = tableRow[index]
									})

									rows.push({
										plugin: plugin_name,
										execution_time,
										...(pluginData.badges
											? { badges: Array.isArray(pluginData.badges) ? pluginData.badges.join(", ") : pluginData.badges }
											: {}),
										...(pluginData.last_seen ? { last_seen: pluginData.last_seen } : {}),
										...(pluginData.meta?.name ? { service: pluginData.meta.name } : {}),
										...rowData,
									})
								})
							} else if (pluginData.is_registered || pluginData.is_regstered) {
								const row: Record<string, unknown> = {
									plugin: plugin_name,
									execution_time,
									registered: pluginData.is_registered || pluginData.is_regstered || false,
								}

								if (pluginData.display) {
									Object.entries(pluginData.display).forEach(([key, value]) => {
										row[key] = value
									})
								}

								if (pluginData.recovery) {
									Object.entries(pluginData.recovery).forEach(([key, value]) => {
										row[`recovery_${key}`] = value
									})
								}

								if (pluginData.meta?.name) {
									row.service = pluginData.meta.name
								}

								if (pluginData.badges) {
									row.badges = Array.isArray(pluginData.badges) ? pluginData.badges.join(", ") : pluginData.badges
								}

								rows.push(row)
							} else if (pluginData.badges || pluginData.meta) {
								rows.push({
									plugin: plugin_name,
									execution_time,
									service: pluginData.meta?.name || plugin_name,
									...(pluginData.badges
										? { badges: Array.isArray(pluginData.badges) ? pluginData.badges.join(", ") : pluginData.badges }
										: {}),
									...(pluginData.meta || {}),
								})
							} else {
								rows.push({
									plugin: plugin_name,
									execution_time,
									...pluginData,
								})
							}
						})
					}
				}

				if (rows.length === 0) {
					rows.push({
						plugin: "NOSINT",
						message: "No results found",
					})
				}

				return rows
			}

			return [{ raw_data: data }]
		}

		switch (service) {
			case "snusbase":
				if (data?.results && typeof data.results === "object") {
					Object.entries(data.results as Record<string, unknown[]>).forEach(([db, entries]) => {
						if (Array.isArray(entries)) {
							rows.push(...entries.map((entry) => ({ database: db, ...(entry as Record<string, unknown>) })))
						}
					})
				}
				break

			case "intelvault":
				if (data?.results && Array.isArray(data.results)) {
					data.results.forEach((r) => {
						if (r.data && Array.isArray(r.data)) {
							rows.push(
								...r.data.map((item: unknown) => ({
									database: r.index,
									...(item as Record<string, unknown>),
								})),
							)
						}
					})
				}
				break

			case "leakcheck":
				if (data?.result && Array.isArray(data.result)) {
					rows = data.result.map((item: any) => {
						const result: Record<string, unknown> = { ...item }
						if (item.source && typeof item.source === "object") {
							result.source_name = item.source.name || "Unknown"
							result.breach_date = item.source.breach_date || "Unknown"
							result.is_verified = item.source.unverified ? "No" : "Yes"
							result.has_passwords = item.source.passwordless ? "No" : "Yes"
							result.is_compilation = item.source.compilation ? "Yes" : "No"
						}
						if (Array.isArray(item.fields)) {
							result.available_fields = item.fields.join(", ")
						}
						return result
					})
				}
				break

			case "leakosint":
				if (data?.List && typeof data.List === "object") {
					Object.entries(data.List as Record<string, { Data?: unknown[] }>).forEach(([db, dbData]) => {
						if (dbData?.Data && Array.isArray(dbData.Data)) {
							rows.push(
								...dbData.Data.map((item) => ({
									database: db,
									...(item as Record<string, unknown>),
								})),
							)
						}
					})
				}
				break

			case "traceback": {
				const tracebackResults = data as { results?: { database?: { results?: Record<string, { data?: unknown[] }> } } }
				const dbResults = tracebackResults?.results?.database?.results
				if (dbResults && typeof dbResults === "object") {
					Object.entries(dbResults).forEach(([source, sourceData]) => {
						if (sourceData?.data && Array.isArray(sourceData.data)) {
							rows.push(
								...sourceData.data.map((item) => ({
									source,
									...(item as Record<string, unknown>),
								})),
							)
						}
					})
				}
				break
			}

			case "breachbase": {
				if (
					data &&
					typeof data === "object" &&
					"data" in data &&
					data.data &&
					typeof data.data === "object" &&
					data.data !== null &&
					"content" in data.data &&
					Array.isArray((data.data as { content?: unknown }).content)
				) {
					rows = (data.data as { content: Record<string, unknown>[] }).content
				}
				break
			}

			case "inf0sec": {
				const inf0secData = data as {
					success: boolean
					time_taken: string
					count: number
					results: Record<string, any[]>
				}

				if (inf0secData?.results && typeof inf0secData.results === "object") {
					Object.entries(inf0secData.results).forEach(([platform, platformResults]) => {
						if (Array.isArray(platformResults)) {
							platformResults.forEach((result) => {
								const usernames = Array.isArray(result.usernames) ? result.usernames : []
								const emails = Array.isArray(result.emails) ? result.emails : []

								if (usernames.length === 0 && emails.length === 0) {
									rows.push({
										platform,
										found: false,
										message: "No results found",
									})
								} else {
									usernames.forEach((username: string) => {
										rows.push({
											platform,
											type: "username",
											value: username,
											time_taken: inf0secData.time_taken,
										})
									})

									emails.forEach((email: string) => {
										rows.push({
											platform,
											type: "email",
											value: email,
											time_taken: inf0secData.time_taken,
										})
									})
								}
							})
						}
					})
				}

				if (rows.length === 0) {
					rows.push({
						service: "inf0sec",
						message: "No results found",
						time_taken: inf0secData.time_taken,
					})
				}
				break
			}

			case "osintkit":
				if (data?.data && Array.isArray(data.data)) {
					rows = data.data as Record<string, unknown>[]
				}
				break

			case "osintcat": {
				const osintcatData = data as { results?: Array<{ source: string; matches: Array<Record<string, unknown>> }> }
				if (osintcatData?.results && Array.isArray(osintcatData.results)) {
					osintcatData.results.forEach((sourceItem) => {
						if (sourceItem.matches && Array.isArray(sourceItem.matches)) {
							const processedMatches = sourceItem.matches.flatMap((match) => {
								if (Array.isArray(match.logs)) {
									return match.logs.map((log) => ({
										source: sourceItem.source,
										...(match as Record<string, unknown>),
										...(log as Record<string, unknown>),
									}))
								}
								return [
									{
										source: sourceItem.source,
										...(match as Record<string, unknown>),
									},
								]
							})
							rows.push(...processedMatches)
						}
					})
				}
				break
			}

			case "osintalternative":
				if (data?.modules && typeof data.modules === "object") {
					rows = Object.entries(data.modules as Record<string, Record<string, unknown>>)
						.filter(([, moduleData]) => moduleData && typeof moduleData === "object")
						.map(([moduleName, moduleData]) => ({ module: moduleName, ...moduleData }))
				}
				break
			case "nosint": {
				try {
					const parsedBatchResults: Array<any> = []
					let creditsLeft: number | undefined

					if (typeof data === "string" && data) {
						const events = String(data).split("\n\n").filter(Boolean)
						for (const event of events) {
							const dataLine = event.split("\n").find((line: string) => line.trim().startsWith("data:"))
							if (!dataLine) continue
							try {
								const jsonStr = dataLine.trim().substring(5).trim()
								const parsedEvent = JSON.parse(jsonStr)

								if (parsedEvent.creditsLeft || parsedEvent.status === "completed") {
									creditsLeft = parsedEvent.creditsLeft
								}

								if (parsedEvent.status === "batch_results" && Array.isArray(parsedEvent.results)) {
									parsedBatchResults.push(parsedEvent)
								}
							} catch (eventError) {
								console.warn("Failed to parse NOSINT event:", eventError)
							}
						}
					} else if (data && typeof data === "object") {
						if ("creditsLeft" in data) {
							creditsLeft = data.creditsLeft as number
						}

						if (Array.isArray(data.batch_results)) {
							parsedBatchResults.push(...data.batch_results)
						} else if (Array.isArray(data.results)) {
							const resultsWithPluginInfo = data.results.map((result: any) => ({
								...result,
								plugin_name: result.plugin_name || "unknown",
							}))
							parsedBatchResults.push({ status: "batch_results", results: resultsWithPluginInfo })
						} else {
							const batchResults = Object.values(data).filter(
								(item: any) =>
									item &&
									typeof item === "object" &&
									((item.status === "batch_results" && Array.isArray(item.results)) ||
										(Array.isArray(item) && item.length > 0 && item[0].plugin_name)),
							)

							if (batchResults.length > 0) {
								batchResults.forEach((batch: any) => {
									if (Array.isArray(batch)) {
										parsedBatchResults.push({ status: "batch_results", results: batch })
									} else {
										parsedBatchResults.push(batch)
									}
								})
							} else if (typeof data.data === "object" && data.data !== null) {
								const dataContent = data.data as Record<string, any>
								if (Array.isArray(dataContent.results)) {
									parsedBatchResults.push({
										status: "batch_results",
										results: dataContent.results,
									})
								} else if (dataContent.plugin_name) {
									parsedBatchResults.push({
										status: "batch_results",
										results: [data.data],
									})
								}
							}
						}
					}

					for (const batch of parsedBatchResults) {
						if (batch?.results && Array.isArray(batch.results)) {
							batch.results.forEach((plugin: any) => {
								if (!plugin?.data && !plugin?.plugin_name) return

								const pluginData = plugin.data || plugin
								const plugin_name = plugin.plugin_name || "unknown"
								const execution_time = plugin.execution_time || pluginData.execution_time || "unknown"

								if (pluginData.table?.headers && pluginData.table.values) {
									pluginData.table.values.forEach((row: unknown[]) => {
										const rowData: Record<string, unknown> = {}
										pluginData.table.headers.forEach((header: string, index: number) => {
											rowData[header] = row[index]
										})

										rows.push({
											plugin: plugin_name,
											execution_time,
											...(pluginData.badges
												? {
														badges: Array.isArray(pluginData.badges) ? pluginData.badges.join(", ") : pluginData.badges,
													}
												: {}),
											...(pluginData.last_seen ? { last_seen: pluginData.last_seen } : {}),
											...(pluginData.meta?.name ? { service: pluginData.meta.name } : {}),
											...rowData,
										})
									})
								} else if (pluginData.is_registered || pluginData.is_regstered) {
									const row: Record<string, unknown> = {
										plugin: plugin_name,
										execution_time,
										registered: pluginData.is_registered || pluginData.is_regstered || false,
									}

									if (pluginData.display) {
										Object.entries(pluginData.display).forEach(([key, value]) => {
											row[key] = value
										})
									}

									if (pluginData.recovery) {
										Object.entries(pluginData.recovery).forEach(([key, value]) => {
											row[`recovery_${key}`] = value
										})
									}

									if (pluginData.meta?.name) {
										row.service = pluginData.meta.name
									}

									if (pluginData.badges) {
										row.badges = Array.isArray(pluginData.badges) ? pluginData.badges.join(", ") : pluginData.badges
									}

									rows.push(row)
								} else if (pluginData.badges || pluginData.meta) {
									rows.push({
										plugin: plugin_name,
										execution_time,
										service: pluginData.meta?.name || plugin_name,
										...(pluginData.badges
											? { badges: Array.isArray(pluginData.badges) ? pluginData.badges.join(", ") : pluginData.badges }
											: {}),
										...(pluginData.meta || {}),
									})
								} else {
									rows.push({
										plugin: plugin_name,
										execution_time,
										...pluginData,
									})
								}
							})
						}
					}

					if (rows.length === 0) {
						rows.push({
							plugin: "NOSINT",
							message: "No results found",
						})
					}
				} catch (error) {
					console.error("Error processing NOSINT data:", error)

					rows.push({
						plugin: "NOSINT",
						message: "Error processing results",
						error: String(error),
					})
				}
				break
			}
			default:
				if (Array.isArray(data)) {
					rows = data as Record<string, unknown>[]
				} else if (data?.results && Array.isArray(data.results)) {
					rows = data.results as Record<string, unknown>[]
				} else if (data?.result && Array.isArray(data.result)) {
					rows = data.result as Record<string, unknown>[]
				} else if (data?.data && Array.isArray(data.data)) {
					rows = data.data as Record<string, unknown>[]
				} else if (data?.records && Array.isArray(data.records)) {
					rows = data.records as Record<string, unknown>[]
				} else if (data && typeof data === "object") {
					const metadataKeys = [
						"success",
						"took",
						"timeTaken",
						"size",
						"quota",
						"found",
						"price",
						"NumOfDatabase",
						"NumOfResults",
						"search time",
					]
					const filtered = Object.fromEntries(
						Object.entries(data as Record<string, unknown>).filter(([key]) => !metadataKeys.includes(key)),
					)
					if (Object.keys(filtered).length) rows = [filtered]
				}
		}

		return rows.map((item) => {
			const cleanedRow: Record<string, unknown> = {}

			Object.entries(item).forEach(([key, value]) => {
				if (["_id", "__v", "internal_id", "raw"].includes(key)) return

				if (value && typeof value === "object" && !Array.isArray(value)) {
					const serialized = JSON.stringify(value)
					cleanedRow[key] = serialized.length < 100 ? serialized : "[Complex Object]"
				} else if (Array.isArray(value)) {
					if (value.length === 0) {
						cleanedRow[key] = "[]"
					} else if (value.length < 3 && typeof value[0] !== "object") {
						cleanedRow[key] = value.join(", ")
					} else {
						cleanedRow[key] = `[Array(${value.length})]`
					}
				} else if (
					(typeof value === "string" || typeof value === "number") &&
					/date|created|updated|timestamp|lastactive|regdate/i.test(key)
				) {
					const date = new Date(value)
					cleanedRow[key] = !Number.isNaN(date.getTime()) ? date.toISOString().split("T")[0] : value
				} else {
					cleanedRow[key] = value
				}
			})

			return cleanedRow
		})
	} catch (error) {
		console.error(`Error processing data for ${service}:`, error)
		return []
	}
}
export default function UnifiedSearch() {
	const [query, setQuery] = useState("")
	const [activeSearchType, setActiveSearchType] = useState<SearchType>("email")
	const [enabledServices, setEnabledServices] = useState<string[]>(SERVICES_BY_TYPE.email.map((service) => service.id))
	const [isSearching, setIsSearching] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [currentPage, setCurrentPage] = useState(1)
	const [useWildcard, setUseWildcard] = useState(false)
	const [firstName, setFirstName] = useState("")
	const [lastName, setLastName] = useState("")
	const [results, setResults] = useState<SearchResult[]>([])
	const [activeResultTab, setActiveResultTab] = useState<string | null>(null)
	const [processedResults, setProcessedResults] = useState<Record<string, unknown>[]>([])

	useEffect(() => {
		setQuery("")
		setFirstName("")
		setLastName("")
		setError(null)
		setCurrentPage(1)

		const availableServices = SERVICES_BY_TYPE[activeSearchType] || []
		setEnabledServices(availableServices.map((service) => service.id))
	}, [activeSearchType])

	useEffect(() => {
		if (results.length > 0) {
			const availableServices = [...new Set(results.map((result) => result.service))]
			if (availableServices.length > 0 && !activeResultTab) {
				setActiveResultTab(availableServices[0])
			}
		}
	}, [results, activeResultTab])

	useEffect(() => {
		if (isSearching) {
			const completedServices = results.filter((r) => r.timeMs > 0).length
			const totalServices = enabledServices.length
			document.title = `(${completedServices}/${totalServices}) Unified Search`
		} else {
			document.title = "Unified Search"
		}

		return () => {
			document.title = "Unified Search"
		}
	}, [isSearching, results, enabledServices])

	useEffect(() => {
		setCurrentPage(1)

		if (activeResultTab) {
			const currentResult = results.find((result) => result.service === activeResultTab)
			if (currentResult) {
				const data = processResultData(currentResult)
				setProcessedResults(data)
			} else {
				setProcessedResults([])
			}
		} else {
			setProcessedResults([])
		}
	}, [activeResultTab, results])

	const handleServiceToggle = (serviceId: string) => {
		setEnabledServices((prev) => {
			if (prev.includes(serviceId)) {
				return prev.filter((id) => id !== serviceId)
			}
			return [...prev, serviceId]
		})
	}

	const handleSearch = useCallback(async () => {
		if (enabledServices.length === 0) {
			setError("Please select at least one service to search")
			return
		}

		if (activeSearchType === "email" && !query.includes("@")) {
			setError("Please enter a valid email address")
			return
		}

		if (activeSearchType === "name" && (!firstName.trim() || !lastName.trim())) {
			setError("Please enter both first and last name")
			return
		}

		if (activeSearchType !== "name" && !query.trim()) {
			setError(`Please enter a ${activeSearchType} to search`)
			return
		}

		setIsSearching(true)
		setError(null)
		setResults([])
		setActiveResultTab(null)
		setProcessedResults([])
		setCurrentPage(1)

		try {
			const searchPromises = enabledServices.map(async (serviceId) => {
				const startTime = performance.now()

				try {
					let apiUrl = ""
					let apiBody: Record<string, unknown> = {}
					let method: "GET" | "POST" = "POST"
					let urlParams = ""

					switch (serviceId) {
						case "snusbase":
							apiUrl = "/api/snusbase"
							apiBody = {
								query: query,
								searchType:
									activeSearchType === "ip" ? "lastip" : activeSearchType === "domain" ? "_domain" : activeSearchType,
								wildcard: useWildcard,
							}
							break

						case "intelvault":
							apiUrl = "/api/intelvault"
							if (activeSearchType === "name") {
								apiBody = {
									fields: [{ first_name: firstName }, { last_name: lastName }],
									useWildcard,
								}
							} else {
								apiBody = {
									fields: [{ [activeSearchType]: query }],
									useWildcard,
								}
							}
							break
						case "leakcheck":
							apiUrl = "/api/leakcheck"
							apiBody = {
								query: query,
								type: activeSearchType,
							}
							break

						case "osintalternative":
							apiUrl = "/api/osintalternative"
							method = "GET"
							urlParams = `?email=${encodeURIComponent(query)}`
							break

						case "traceback":
							apiUrl = "/api/traceback"
							apiBody = {
								query: query,
								field: activeSearchType,
								limit: 10000,
								use_wildcard: useWildcard,
							}
							break

						case "ipsearch":
							apiUrl = "/api/ipsearch"
							apiBody = {
								ip: query,
								type: "info",
							}
							break

						case "seon":
							apiUrl = "/api/seon"
							apiBody = {
								type: activeSearchType,
								data: { [activeSearchType]: query },
							}
							break

						case "rutify":
							apiUrl = "/api/rutify"
							apiBody = {
								query: `${firstName} ${lastName}`,
								type: "name",
							}
							break

						case "leakosint":
							apiUrl = "/api/leakosint"
							apiBody = {
								query: query,
								type: activeSearchType,
							}
							break

						case "tgscan":
							apiUrl = "/api/tgscan"
							apiBody = {
								query: query,
								type: activeSearchType,
							}
							break

						case "shodan":
							apiUrl = "/api/shodan"
							apiBody = {
								type: activeSearchType === "ip" ? "host_info" : "search",
								query: query,
								ip: activeSearchType === "ip" ? query : undefined,
							}
							break

						case "callerapi":
							apiUrl = "/api/callerapi"
							apiBody = {
								phone: query,
							}
							break

						case "breachbase":
							apiUrl = "/api/breachbase"
							apiBody = {
								input: [query],
								type: activeSearchType,
								page: 1,
							}
							break

						case "endato": {
							apiUrl = "/api/endato"
							let endpoint = ""
							let searchTypeValue = ""
							let requestData: Record<string, unknown> = {}

							switch (activeSearchType) {
								case "email":
									endpoint = "Email/Enrich"
									searchTypeValue = "DevAPIEmailID"
									requestData = { email: query }
									break
								case "phone":
									endpoint = "Phone/Enrich"
									searchTypeValue = "DevAPICallerID"
									requestData = { phone: query }
									break
								case "name":
									endpoint = "PersonSearch"
									searchTypeValue = "Person"
									requestData = {
										FirstName: firstName,
										MiddleName: "",
										LastName: lastName,
										Dob: "",
										Addresses: [],
										Page: 1,
										ResultsPerPage: 10,
									}
									break
								default:
									endpoint = "Unknown"
									searchTypeValue = activeSearchType
									requestData = { query }
							}

							apiBody = {
								endpoint,
								searchType: searchTypeValue,
								data: requestData,
							}
							break
						}

						case "hunter":
							apiUrl = "/api/hunter"
							apiBody = {
								query: query,
								type: activeSearchType,
							}
							break

						case "inf0sec":
							apiUrl = "/api/inf0sec"
							apiBody = {
								query: query,
								module: activeSearchType,
							}
							break

						case "oathnet":
							apiUrl = "/api/oathnet"
							apiBody = {
								type: activeSearchType === "email" ? "ghunt" : "text",
								query: query,
								email: activeSearchType === "email" ? query : undefined,
							}
							break

						case "leaksight": {
							apiUrl = "/api/leaksight"

							let leaksightSearchType: string = activeSearchType
							if (activeSearchType === "domain") {
								leaksightSearchType = "subdomainScan"
							} else if (activeSearchType === "username" || activeSearchType === "ip") {
								leaksightSearchType = activeSearchType
							} else {
								leaksightSearchType = "username"
							}
							apiBody = {
								query: query,
								searchType: leaksightSearchType,
							}
							break
						}

						case "hackcheck":
							apiUrl = "/api/hackcheck"
							apiBody = {
								query: query,
								searchType: activeSearchType,
							}
							break

						case "nosint":
							apiUrl = "/api/nosint"
							apiBody = {
								target: query,
								plugin_type: activeSearchType,
							}
							break

						case "npd":
							apiUrl = "/api/npd"
							if (activeSearchType === "name") {
								apiBody = {
									query: `${firstName} ${lastName}`.trim(),
									module: [
										{ field: "firstname", value: firstName },
										{ field: "lastname", value: lastName },
									],
								}
							} else if (activeSearchType === "ssn") {
								apiBody = {
									query: query,
									module: "ssn",
								}
							} else if (activeSearchType === "address") {
								apiBody = {
									query: query,
									module: "address",
								}
							} else {
								apiBody = {
									query: query,
									module: activeSearchType,
								}
							}
							break

						case "carfax":
							apiUrl = "/api/carfax"
							apiBody = {
								type: "vin",
								vin: query,
							}
							break

						case "osintkit":
							apiUrl = "/api/osintkit"
							apiBody = {
								query: activeSearchType === "name" ? `${firstName} ${lastName}` : query,
								type: activeSearchType,
							}
							break

						case "osintcat":
							apiUrl = "/api/osintcat"
							apiBody = {
								query: activeSearchType === "name" ? `${firstName} ${lastName}` : query,
								searchType: activeSearchType,
							}
							break

						case "osintdog":
							apiUrl = "/api/osintdog"
							apiBody = {
								query: activeSearchType === "name" ? `${firstName} ${lastName}` : query,
								searchType: activeSearchType,
							}
							break

						default:
							throw new Error(`Service ${serviceId} is not supported, please contact an administrator`)
					}

					let response
					if (method === "GET") {
						response = await fetch(apiUrl + urlParams, {
							method: "GET",
							headers: { "Content-Type": "application/json" },
						})
					} else {
						response = await fetch(apiUrl, {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify(apiBody),
						})
					}

					if (!response.ok) {
						throw new Error(`HTTP error! status: ${response.status}`)
					}
					let data: any

					if (response.headers.get("Content-Type")?.includes("text/event-stream")) {
						try {
							const reader = response.body?.getReader()
							if (!reader) throw new Error("Response body reader could not be obtained")

							const decoder = new TextDecoder("utf-8")
							let buffer = ""

							while (true) {
								const { done, value } = await reader.read()
								if (done) break

								buffer += decoder.decode(value, { stream: true })
							}

							const events = buffer
								.split("\n\n")
								.filter((event) => event.trim())
								.map((event) => {
									const dataMatch = event.match(/^data: (.+)$/m)
									if (!dataMatch?.[1]) return null

									try {
										return JSON.parse(dataMatch[1].trim())
									} catch (err) {
										console.error(`Failed to parse SSE data: ${dataMatch[1]}`, err)
										return null
									}
								})
								.filter(Boolean)

							if (serviceId === "nosint") {
								data = buffer
							} else {
								data =
									events.length > 0
										? events[events.length - 1] || { error: "Invalid event data" }
										: { error: "No valid events received" }
							}
						} catch (err: any) {
							console.error("Error processing SSE stream:", err)
							data = { error: `Failed to process stream: ${err.message || "Unknown error"}` }
						}
					} else {
						try {
							data = await response.json()
						} catch (err: any) {
							console.error("Error parsing JSON response:", err)
							data = { error: `Failed to parse response: ${err.message || "Unknown error"}` }
						}
					}

					const endTime = performance.now()

					if (typeof data === "string" && serviceId === "nosint") {
						const result = {
							service: serviceId,
							type: activeSearchType,
							data: data,
							timeMs: Math.round(endTime - startTime),
							hasError: false,
						}
						setResults((prev) => [...prev, result])
						return result
					}

					if (data.error || data.success === false || data.statusCode >= 400 || data.status === "error") {
						const errorMessage =
							data.message ||
							data.error ||
							data.errorMessage ||
							(typeof data.details === "string" ? data.details : "Unknown error")

						const result = {
							service: serviceId,
							type: activeSearchType,
							data: {
								error: errorMessage,
								details: data.details || data.errorDetails || data.description,
								code: data.code || data.statusCode || data.status_code,
							},
							timeMs: Math.round(endTime - startTime),
							hasError: true,
						}

						setResults((prev) => [...prev, result])
						return result
					}

					const result = {
						service: serviceId,
						type: activeSearchType,
						data: data.data || data,
						timeMs: Math.round(endTime - startTime),
						hasError: false,
					}

					setResults((prev) => {
						const newResults = [...prev, result]

						if (!activeResultTab && !result.hasError) {
							setActiveResultTab(serviceId)
							setProcessedResults(processResultData(result))
						}

						return newResults
					})

					return result
				} catch (error) {
					console.error(`Error searching ${serviceId}:`, error)
					const result = {
						service: serviceId,
						type: activeSearchType,
						data: { error: String(error) },
						timeMs: 0,
						hasError: true,
					}

					setResults((prev) => [...prev, result])
					return result
				}
			})

			await Promise.all(searchPromises)

			if (!activeResultTab && results.length > 0) {
				setActiveResultTab(results[0].service)
				setProcessedResults(processResultData(results[0]))
			}
		} catch (error) {
			console.error("Error in search:", error)
			setError(String(error))
		} finally {
			setIsSearching(false)
		}
	}, [activeSearchType, enabledServices, query, firstName, lastName, useWildcard, activeResultTab])

	const handleExport = useCallback(() => {
		if (!results.length) return

		try {
			const seen = new WeakSet()
			const exportData = JSON.stringify(
				results,
				(_key, value) => {
					if (typeof value === "object" && value !== null) {
						if (seen.has(value)) {
							return "[Circular Reference]"
						}
						seen.add(value)
					}
					return value
				},
				2,
			)

			const blob = new Blob([exportData], { type: "application/json" })
			const url = URL.createObjectURL(blob)
			const link = document.createElement("a")
			link.href = url
			link.download = `unified-search-${activeSearchType}-${Date.now()}.json`
			link.click()
			setTimeout(() => URL.revokeObjectURL(url), 0)
		} catch (error) {
			console.error("Error exporting data:", error)
			setError("Failed to export data. There might be circular references in the result.")
		}
	}, [results, activeSearchType])

	const copyToClipboard = useCallback((item: Record<string, unknown>) => {
		try {
			const seen = new WeakSet()
			const safeJson = JSON.stringify(
				item,
				(_key, value) => {
					if (typeof value === "object" && value !== null) {
						if (seen.has(value)) {
							return "[Circular Reference]"
						}
						seen.add(value)
					}
					return value
				},
				2,
			)

			navigator.clipboard
				.writeText(safeJson)
				.then(() => {
					console.log("Copied to clipboard")
				})
				.catch((err) => {
					console.error("Failed to copy: ", err)
				})
		} catch (error) {
			console.error("Error stringifying object for clipboard:", error)
		}
	}, [])

	const renderSearchForm = () => {
		if (activeSearchType === "name") {
			return (
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<Input
						type="text"
						value={firstName}
						onChange={(e) => setFirstName(e.target.value)}
						placeholder="First Name"
						aria-label="First Name"
					/>
					<Input
						type="text"
						value={lastName}
						onChange={(e) => setLastName(e.target.value)}
						placeholder="Last Name"
						aria-label="Last Name"
					/>
					<div className="col-span-1 sm:col-span-2 flex justify-end">
						<Button onClick={handleSearch} disabled={isSearching}>
							{isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
							Search
						</Button>
					</div>
				</div>
			)
		}

		return (
			<div className="flex w-full items-center space-x-2">
				<div className="relative flex-1">
					<Input
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder={`Enter ${activeSearchType}${useWildcard ? " (wildcards supported)" : ""}...`}
						className="pr-10"
						aria-label={`Search ${activeSearchType}`}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !isSearching) {
								handleSearch()
							}
						}}
					/>
					<Button
						className="absolute right-0 top-0 h-full rounded-l-none"
						onClick={handleSearch}
						disabled={isSearching}
						aria-label="Search"
					>
						{isSearching ? (
							<div className="flex items-center">
								<Loader2 className="h-4 w-4 animate-spin mr-2" />
								<span className="sr-only">Searching...</span>
							</div>
						) : (
							<Search className="h-4 w-4" />
						)}
					</Button>
				</div>
			</div>
		)
	}

	const renderResultContent = () => {
		if (!activeResultTab) {
			if (isSearching) {
				return (
					<div className="p-8 text-center">
						<Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
						<p className="text-muted-foreground">Waiting for first results...</p>
					</div>
				)
			}
			return <div className="p-8 text-center text-muted-foreground">Select a service to view results</div>
		}

		const currentResult = results.find((result) => result.service === activeResultTab)
		if (!currentResult) {
			return <div className="p-8 text-center text-muted-foreground">No results available for this service</div>
		}

		const serviceName = ALL_SERVICES[currentResult.service as ServiceId]?.name || currentResult.service

		if (typeof currentResult.data === "string") {
			if (processedResults.length > 0) {
			} else {
				return (
					<Alert className="mt-4">
						<AlertTitle>Raw data from {serviceName}</AlertTitle>
						<AlertDescription>
							<div className="mt-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										navigator.clipboard
											.writeText(currentResult.data as string)
											.then(() => console.log("Raw data copied to clipboard"))
											.catch((err) => console.error("Failed to copy raw data:", err))
									}}
								>
									<Copy className="h-4 w-4 mr-2" />
									Copy Raw Data
								</Button>
							</div>
						</AlertDescription>
					</Alert>
				)
			}
		}

		if (
			currentResult.hasError ||
			(typeof currentResult.data === "object" && currentResult.data !== null && "error" in currentResult.data)
		) {
			const errorObj = currentResult.data as Record<string, unknown>
			const errorMessage = errorObj?.error ? String(errorObj.error) : "An error occurred with this service"
			const errorDetails = errorObj?.details || null
			const errorCode = errorObj?.code || null
			return (
				<Alert variant="destructive" className="mt-4">
					<AlertTriangle className="h-4 w-4" />
					<AlertTitle>Error in {serviceName}</AlertTitle>
					<AlertDescription className="mt-2">
						<div className="font-medium">{errorMessage}</div>
						{errorCode && <div className="mt-2 text-sm text-muted-foreground">Error code: {String(errorCode)}</div>}
						{errorDetails && (
							<pre className="mt-2 p-2 bg-muted/10 rounded-md text-sm overflow-x-auto">
								{typeof errorDetails === "string" ? errorDetails : JSON.stringify(errorDetails, null, 2)}
							</pre>
						)}
					</AlertDescription>
				</Alert>
			)
		}

		if (processedResults.length === 0) {
			return (
				<Alert className="mt-4">
					<AlertTitle>No results found in {serviceName}</AlertTitle>
					<AlertDescription>Try a different search term or check other services</AlertDescription>
				</Alert>
			)
		}

		const allKeys = Array.from(new Set(processedResults.flatMap((item) => Object.keys(item))))
		const paginatedData = processedResults.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
		const totalPages = Math.ceil(processedResults.length / ITEMS_PER_PAGE)

		return (
			<>
				<div className="overflow-x-auto rounded-md border max-h-[600px] relative">
					<Table>
						<TableHeader className="sticky top-0 bg-background z-10">
							<TableRow className="bg-muted/50">
								{allKeys.map((key) => (
									<TableHead key={key} className="font-semibold">
										{key}
									</TableHead>
								))}
								<TableHead className="w-[80px] text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{paginatedData.length === 0 ? (
								<TableRow>
									<TableCell colSpan={allKeys.length + 1} className="h-24 text-center">
										No results found
									</TableCell>
								</TableRow>
							) : (
								paginatedData.map((item, index) => {
									const rowKey = `row-${item.id || item.email || item.username || item.source || index}`
									return (
										<TableRow
											key={rowKey}
											className={`transition-colors hover:bg-muted/50 ${
												index % 2 === 0 ? "bg-background" : "bg-muted/20"
											}`}
										>
											{allKeys.map((key) => {
												const cellKey = `${rowKey}-${key}`
												return <TableCell key={cellKey}>{formatCellValue(key, item[key])}</TableCell>
											})}
											<TableCell className="text-right">
												<div className="flex justify-end space-x-1">
													<TooltipProvider>
														<Tooltip>
															<TooltipTrigger asChild>
																<Button
																	variant="ghost"
																	size="icon"
																	className="h-7 w-7"
																	onClick={() => copyToClipboard(item)}
																	aria-label="Copy row data"
																>
																	<Copy className="h-3.5 w-3.5" />
																</Button>
															</TooltipTrigger>
															<TooltipContent>
																<p>Copy row data</p>
															</TooltipContent>
														</Tooltip>
													</TooltipProvider>
													<TooltipProvider>
														<Tooltip>
															<TooltipTrigger asChild>
																<Button variant="ghost" size="icon" className="h-7 w-7" aria-label="View details">
																	<ExternalLink className="h-3.5 w-3.5" />
																</Button>
															</TooltipTrigger>
															<TooltipContent>
																<p>View details</p>
															</TooltipContent>
														</Tooltip>
													</TooltipProvider>
												</div>
											</TableCell>
										</TableRow>
									)
								})
							)}
						</TableBody>
					</Table>
				</div>

				<div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-2">
					<div className="flex items-center space-x-2 text-sm text-muted-foreground order-2 sm:order-1">
						{processedResults.length > 0 ? (
							<>
								Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
								{Math.min(currentPage * ITEMS_PER_PAGE, processedResults.length)} of {processedResults.length} results
							</>
						) : (
							<>No results found</>
						)}
					</div>

					<div className="flex items-center space-x-2 order-1 sm:order-2">
						<Button
							onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
							disabled={currentPage === 1}
							variant="outline"
							size="sm"
							className="h-8 w-8 p-0 sm:h-8 sm:w-auto sm:px-3"
							aria-label="Previous page"
						>
							<ChevronLeft className="h-4 w-4 sm:mr-2" />
							<span className="hidden sm:inline">Previous</span>
						</Button>
						<span className="text-sm whitespace-nowrap">
							Page {currentPage} of {totalPages}
						</span>
						<Button
							onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
							disabled={currentPage === totalPages}
							variant="outline"
							size="sm"
							className="h-8 w-8 p-0 sm:h-8 sm:w-auto sm:px-3"
							aria-label="Next page"
						>
							<span className="hidden sm:inline">Next</span>
							<ChevronRight className="h-4 w-4 sm:ml-2" />
						</Button>
					</div>
				</div>
			</>
		)
	}

	return (
		<div className="container mx-auto py-4 sm:py-8 px-4 space-y-6 sm:space-y-8">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Unified Search</h1>
			</div>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2 text-xl">
						<Search className="h-5 w-5" />
						Search by {SEARCH_TYPES.find((st) => st.id === activeSearchType)?.name}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-4">
						<div className="w-full mb-4">
							<div
								className="flex flex-nowrap gap-2 pb-2 no-scrollbar"
								style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}
							>
								{SEARCH_TYPES.map((type) => {
									const isActive = activeSearchType === type.id
									return (
										<TooltipProvider key={type.id}>
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														variant={isActive ? "default" : "outline"}
														size="sm"
														onClick={() => setActiveSearchType(type.id)}
														style={{ minWidth: 90 }}
													>
														{type.icon}
														<span className="hidden sm:inline">{type.name}</span>
													</Button>
												</TooltipTrigger>
												<TooltipContent>{type.name}</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									)
								})}
							</div>
							<style jsx global>{`
								.no-scrollbar {
									scrollbar-width: none;
									-ms-overflow-style: none;
								}
								.no-scrollbar::-webkit-scrollbar {
									display: none;
								}
							`}</style>
						</div>
						<div className="w-full mb-4">{renderSearchForm()}</div>

						<Separator className="my-2" />

						<div className="flex flex-col md:flex-row justify-between gap-4">
							<div className="space-y-2">
								<Label htmlFor="services-select" className="text-sm font-medium">
									Services for {SEARCH_TYPES.find((st) => st.id === activeSearchType)?.name} search
								</Label>
								<Select
									value="custom"
									onValueChange={(value) => {
										if (value === "all") {
											setEnabledServices((SERVICES_BY_TYPE[activeSearchType] || []).map((s) => s.id))
										} else if (value === "none") {
											setEnabledServices([])
										}
									}}
								>
									<SelectTrigger id="services-select" className="mb-2 w-[180px]">
										<SelectValue placeholder="Select services" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All services</SelectItem>
										<SelectItem value="none">No services</SelectItem>
										<SelectItem value="custom">Custom selection</SelectItem>
									</SelectContent>
								</Select>

								<ScrollArea className="w-full pb-3">
									<div className="flex flex-wrap gap-2 mt-2">
										{(SERVICES_BY_TYPE[activeSearchType] || []).map((service) => (
											<Button
												key={service.id}
												variant={enabledServices.includes(service.id) ? "secondary" : "outline"}
												size="sm"
												onClick={() => handleServiceToggle(service.id)}
												className="flex items-center gap-2 transition-all duration-200"
												aria-pressed={enabledServices.includes(service.id)}
											>
												{enabledServices.includes(service.id) ? (
													<Check className="h-4 w-4 text-green-500" />
												) : (
													<X className="h-4 w-4 text-muted-foreground" />
												)}
												{service.name}
											</Button>
										))}
									</div>
								</ScrollArea>
							</div>

							<div className="flex items-center gap-2 mt-4 md:mt-0 md:self-end">
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<div className="flex items-center gap-2">
												<Switch
													id="wildcard-mode"
													checked={useWildcard}
													onCheckedChange={setUseWildcard}
													aria-label="Enable wildcard search"
												/>
												<Label htmlFor="wildcard-mode">Enable wildcard search</Label>
											</div>
										</TooltipTrigger>
										<TooltipContent>
											<p>Use * for multiple characters and ? for single character</p>
											<p>Example: john*.doe@* or john.doe@*.com</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{isSearching && (
				<Card className="relative overflow-hidden">
					<CardContent className="p-6 sm:p-8">
						<div className="flex flex-col items-center justify-center space-y-4">
							<div className="relative">
								<div className="absolute inset-0 flex items-center justify-center">
									<span className="text-xs font-semibold">
										{results.filter((r) => r.timeMs > 0).length}/{enabledServices.length}
									</span>
								</div>
								<Loader2 className="h-12 w-12 animate-spin text-primary" />
								<svg className="absolute -top-1 -left-1 h-14 w-14 -rotate-90" viewBox="0 0 100 100">
									<circle
										className="text-muted stroke-current"
										strokeWidth="4"
										fill="transparent"
										r="44"
										cx="50"
										cy="50"
									/>
									<circle
										className="text-primary stroke-current transition-all duration-300 ease-in-out"
										strokeWidth="4"
										strokeLinecap="round"
										fill="transparent"
										r="44"
										cx="50"
										cy="50"
										strokeDasharray="276.5"
										strokeDashoffset={
											276.5 - 276.5 * (results.filter((r) => r.timeMs > 0).length / Math.max(1, enabledServices.length))
										}
									/>
								</svg>
							</div>

							<div className="text-center">
								<h3 className="text-lg font-medium mb-2">Searching Multiple Services</h3>
								<p className="text-muted-foreground mb-4">
									{results.filter((r) => r.timeMs > 0).length} of {enabledServices.length} services completed
								</p>

								<div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
									{results.slice(0, 5).map((result) => (
										<Badge
											key={result.service}
											variant={result.hasError ? "destructive" : "outline"}
											className="animate-fadeIn"
										>
											{result.timeMs === 0 ? (
												<Loader2 className="h-3 w-3 mr-1 animate-spin" />
											) : result.hasError ? (
												<AlertCircle className="h-3 w-3 mr-1" />
											) : (
												<Check className="h-3 w-3 mr-1" />
											)}
											{ALL_SERVICES[result.service as ServiceId]?.name || result.service}
										</Badge>
									))}

									{results.length > 5 && <Badge variant="secondary">+{results.length - 5} more</Badge>}
								</div>
							</div>
						</div>
					</CardContent>

					<div
						className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-300 ease-out"
						style={{
							width: `${(results.filter((r) => r.timeMs > 0).length / Math.max(1, enabledServices.length)) * 100}%`,
						}}
					/>
				</Card>
			)}

			{error && (
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{results.length > 0 && (
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center justify-between text-xl">
							<span className="flex items-center gap-2">
								<Database className="h-5 w-5" />
								Search Results
							</span>
							<div className="flex items-center gap-2">
								{isSearching && (
									<Badge variant="outline" className="animate-pulse">
										<Loader2 className="h-3 w-3 animate-spin mr-1" />
										{results.length}/{enabledServices.length} services
									</Badge>
								)}
								<Badge variant="secondary">
									{results.length} {results.length === 1 ? "service" : "services"} queried
								</Badge>
							</div>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col md:flex-row gap-4">
							<div className="md:w-56 w-full flex-shrink-0">
								<ScrollArea className="border rounded-md bg-muted/30 md:h-[520px] h-[320px]">
									<div className="p-2">
										<div className="flex md:flex-col flex-row flex-wrap md:space-y-1 gap-1 md:gap-0">
											{results
												.sort((a, b) => {
													if (a.timeMs > 0 && b.timeMs === 0) return -1
													if (a.timeMs === 0 && b.timeMs > 0) return 1
													if (!a.hasError && b.hasError) return -1
													if (a.hasError && !b.hasError) return 1
													if (!a.hasError && !b.hasError) {
														return getResultCount(b) - getResultCount(a)
													}
													return 0
												})
												.map((result) => {
													const serviceName =
														ALL_SERVICES[result.service as keyof typeof ALL_SERVICES]?.name || result.service
													const serviceIcon = ALL_SERVICES[result.service as keyof typeof ALL_SERVICES]?.icon || (
														<Database className="h-4 w-4" />
													)
													const resultCount = getResultCount(result)
													const isActive = activeResultTab === result.service
													const isLoading = result.timeMs === 0
													const hasError = result.hasError

													return (
														<Button
															key={result.service}
															variant={isActive ? "secondary" : "ghost"}
															size="sm"
															className={`flex items-center justify-start w-full transition-all duration-200 ${
																isActive ? "bg-secondary font-medium" : ""
															} ${hasError ? "text-yellow-600 hover:text-yellow-700" : ""}`}
															onClick={() => setActiveResultTab(result.service)}
															disabled={isSearching && isLoading}
															aria-label={`${serviceName} ${
																isLoading ? "loading" : hasError ? "error" : `${resultCount} results`
															}`}
															aria-pressed={isActive}
														>
															<div className="flex items-center gap-2 w-full overflow-hidden">
																<span className="flex-shrink-0">
																	{isLoading ? (
																		<Loader2 className="h-4 w-4 animate-spin" />
																	) : hasError ? (
																		<AlertTriangle className="h-4 w-4 text-yellow-500" />
																	) : (
																		serviceIcon
																	)}
																</span>
																<span className="truncate flex-1">{serviceName}</span>
																{!isLoading && !hasError && resultCount > 0 && (
																	<Badge
																		variant="outline"
																		className="ml-auto px-1.5 py-0 h-5 min-w-[20px] text-xs flex-shrink-0"
																	>
																		{resultCount}
																	</Badge>
																)}
															</div>
														</Button>
													)
												})}
										</div>
									</div>
								</ScrollArea>
							</div>

							<div className="flex-1 min-w-0">
								{activeResultTab && (
									<div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-3">
										<div className="flex items-center gap-2">
											<Badge variant="outline" className="flex items-center font-medium">
												<Clock className="h-3.5 w-3.5 mr-1.5" />
												<span>
													Query time: {results.find((r) => r.service === activeResultTab)?.timeMs.toFixed(0) || 0}ms
												</span>
											</Badge>
											{!results.find((r) => r.service === activeResultTab)?.hasError && (
												<Badge variant="secondary" className="flex items-center">
													<Database className="h-3.5 w-3.5 mr-1.5" />
													<span>
														{getResultCount(results.find((r) => r.service === activeResultTab) as SearchResult)} results
													</span>
												</Badge>
											)}
										</div>

										<div className="flex items-center gap-2">
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<Button
															variant="outline"
															size="sm"
															onClick={() => {
																const currentResult = results.find((r) => r.service === activeResultTab)
																if (currentResult) {
																	try {
																		if (typeof currentResult.data === "string") {
																			navigator.clipboard
																				.writeText(currentResult.data)
																				.then(() => alert("Data copied to clipboard"))
																				.catch((err) => console.error("Failed to copy data:", err))
																		} else {
																			copyToClipboard(currentResult.data as Record<string, unknown>)
																		}
																	} catch (err) {
																		console.error("Copy operation failed:", err)
																	}
																}
															}}
															aria-label="Copy all data"
														>
															<Copy className="h-4 w-4 mr-2" />
															<span className="hidden sm:inline">Copy All</span>
														</Button>
													</TooltipTrigger>
													<TooltipContent>Copy all data to clipboard</TooltipContent>
												</Tooltip>
											</TooltipProvider>

											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<Button variant="outline" size="sm" onClick={handleExport} aria-label="Export data">
															<Download className="h-4 w-4 mr-2" />
															<span className="hidden sm:inline">Export</span>
														</Button>
													</TooltipTrigger>
													<TooltipContent>Export data as JSON file</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										</div>
									</div>
								)}
								{renderResultContent()}
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
