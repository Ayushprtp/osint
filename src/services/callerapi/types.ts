interface CallerAPIResponse {
	status: string
	callerapi: {
		name: string | null
		spam_count: number
		block_count: number
		is_spam: boolean
		spam_score: number
	}
	truecaller: {
		number: string
		is_valid: boolean
		country_code: number
		national_number: number
		country: string
		number_type: number
		number_type_label: string
		provider: string
		time_zones: string[]
	}
	eyecon: string
	callapp: {
		name: string
		websites: {
			websiteUrl: string
		}[]
		addresses: {
			type: number
			street: string
		}[]
		photoUrl: string
		categories: {
			name: string
		}[]
		avgRating: number
		priceRange: number
		description: string
		openingHours: {
			[key: string]: string[]
		}
		facebookID?: { id: string; sure: boolean; version: number }
		linkedinPubProfileUrl?: { id: string; sure: boolean; version: number }
		twitterScreenName?: { id: string; sure: boolean; version: number }
		googlePlusID?: { id: string; sure: boolean; version: number }
		foursquareID?: { id: string; sure: boolean; version: number }
		instagramID?: { id: string; sure: boolean; version: number }
		pinterestID?: { id: string; sure: boolean; version: number }
		lat: number
		lng: number
		url: string
		googlePlacesId: string
		huaweiPlacesId: string
		spamScore: number
		priority: number
	}
	viewcaller: {
		name: string
		prefix: string
		number: string
		spamCounter: number
		spam: boolean
		names: {
			name: string
			occurrences: number
			isSpam: boolean
		}[]
		namesCount: number
	}[]
	hiya: {
		name: string
		type: string
		is_spam: boolean
		reputation: string
		spam_score: number
		reputation_score: number
		category: string
		comments: {
			reports: {
				id: string
				phone: string
				timestamp: string
				comment: {
					languageTag: string
					str: string
				}
				category: number
			}[]
		}
	}
}

interface ErrorResponse {
	status: string
	error: string
}

export type { CallerAPIResponse, ErrorResponse }
