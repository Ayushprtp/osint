export interface QueryUsageData {
	totalQueries: number
	uniqueUsers: number
	averageQueriesPerUser: number
	topUsers: Array<{
		username: string
		alias: string
		queryCount: number
	}>
	queryCountByDay: Array<{
		date: string
		count: number
	}>
	latestUserSearches: Array<{
		username: string
		alias: string
		type: string
	}>
	userSearchTypes: Array<{
		username: string
		alias: string
		searchTypes: Array<{
			type: string
			count: number
		}>
	}>
}

export async function fetchQueryUsage(timeRange: string): Promise<QueryUsageData | null> {
	try {
		const response = await fetch(`/api/admin/query-usage?range=${timeRange}`)
		if (response.ok) {
			return await response.json()
		}
		console.error("Failed to fetch query usage data")
		return null
	} catch (error) {
		console.error("Error fetching query usage data:", error)
		return null
	}
}
