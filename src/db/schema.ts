import { serial, varchar } from "drizzle-orm/pg-core"

import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core"

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	alias: text("alias").notNull().default("SET_ALIAS"),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified")
		.$defaultFn(() => false)
		.notNull(),
	image: text("image"),
	createdAt: timestamp("created_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	role: text("role"),
	banned: boolean("banned"),
	banReason: text("ban_reason"),
	banExpires: timestamp("ban_expires"),
})

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	impersonatedBy: text("impersonated_by"),
})

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
})

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").$defaultFn(() => /* @__PURE__ */ new Date()),
	updatedAt: timestamp("updated_at").$defaultFn(() => /* @__PURE__ */ new Date()),
})

export const userQueries = pgTable("user_queries", {
	userId: text("user_id").primaryKey(),
	queriesUsed: integer("queries_used").notNull().default(0),
	lastUpdated: timestamp("last_updated").notNull().defaultNow(),
})

export const userSearches = pgTable("user_searches", {
	id: serial("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	searchType: text("search_type").notNull(),
	addedAt: timestamp("added_at").notNull().defaultNow(),
})

export const userSubscription = pgTable("user_subscription", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	userName: text("user_name").notNull().default("SET_USER_NAME"),
	isActive: boolean("is_active").notNull().default(false),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
})

export const alerts = pgTable("alerts", {
	id: serial("id").primaryKey(),
	text: text("text"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const dailyServiceQueries = pgTable("daily_service_queries", {
	id: serial("id").primaryKey(),
	userId: varchar("user_id").notNull(),
	service: varchar("service").notNull(),
	queriesUsed: integer("queries_used").notNull().default(0),
	date: timestamp("date").notNull().defaultNow(),
})

export const serviceQueryLimits = pgTable("service_query_limits", {
	id: serial("id").primaryKey(),
	service: varchar("service").notNull().unique(),
	dailyLimit: integer("daily_limit").notNull(),
})

export const subscriptionKeys = pgTable("subscription_keys", {
	id: text("id").primaryKey(),
	key: text("key").notNull().unique(),
	durationDays: integer("duration_days").notNull(),
	isUsed: boolean("is_used").notNull().default(false),
	usedBy: text("used_by"),
	usedAt: text("used_at"),
	createdAt: text("created_at").notNull(),
})

export const subscriptions = pgTable("subscriptions", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	startDate: text("start_date").notNull(),
	expiryDate: text("expiry_date").notNull(),
	status: text("status").notNull().default("active"),
})

export const sessionIps = pgTable("session_ips", {
	sessionId: text("session_id").primaryKey(),
	ip: text("ip").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	expiresAt: timestamp("expires_at").notNull(),
})

export const userWarnings = pgTable("user_warnings", {
	id: serial("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	message: text("message").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	createdBy: text("created_by")
		.notNull()
		.references(() => user.id),
	isRead: boolean("is_read").notNull().default(false),
})

export const moduleWarnings = pgTable("module_warnings", {
	id: serial("id").primaryKey(),
	moduleId: text("module_id").notNull(),
	message: text("message").notNull(),
	severity: text("severity").notNull().default("info"),
	isActive: boolean("is_active").notNull().default(true),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	createdBy: text("created_by")
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp("expires_at"),
})

export const apiStatus = pgTable("api_status", {
	id: serial("id").primaryKey(),
	service: varchar("service").notNull().unique(),
	status: boolean("status").notNull(),
	lastChecked: timestamp("last_checked").notNull().defaultNow(),
	error: text("error"),
	responseTime: integer("response_time"),
})
