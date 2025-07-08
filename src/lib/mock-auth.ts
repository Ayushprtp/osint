// Mock authentication system for when authentication is disabled
// This provides fake user sessions to maintain compatibility with existing code

export interface MockUser {
	id: string
	email: string
	name: string
	role: string
}

export interface MockSession {
	user: MockUser
}

// Mock user data to use when authentication is disabled
const MOCK_USER: MockUser = {
	id: "mock-user-1",
	email: "user@example.com", 
	name: "Demo User",
	role: "admin,user"
}

// Mock session that always returns the same fake user
export function getMockSession(): MockSession {
	return {
		user: MOCK_USER
	}
}

// Mock subscription check that always returns true 
export async function getMockSubscription() {
	return {
		active: true,
		expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
		daysLeft: 365
	}
}

// Mock query limits that always allow queries
export async function canMakeMockQuery(): Promise<boolean> {
	return true
}

export async function mockUserQueryUsed(): Promise<void> {
	// No-op when authentication is disabled
	return
}