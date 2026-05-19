import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  boolean,
  bigint,
  primaryKey,
} from "drizzle-orm/mysql-core";

// --- Users (local username + bcrypt password auth) ---
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// --- Categories ---
export const categories = mysqlTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// --- Tags ---
export const tags = mysqlTable("tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Tag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;

// --- Articles ---
export const articles = mysqlTable("articles", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content"),
  coverImage: varchar("cover_image", { length: 500 }),
  categoryId: bigint("category_id", { mode: "number", unsigned: true }),
  status: mysqlEnum("status", ["draft", "published"]).default("draft").notNull(),
  originalUrl: varchar("original_url", { length: 500 }),
  viewCount: int("view_count").default(0),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

// --- Article Tags (many-to-many) ---
export const articleTags = mysqlTable(
  "article_tags",
  {
    articleId: bigint("article_id", { mode: "number", unsigned: true }).notNull(),
    tagId: bigint("tag_id", { mode: "number", unsigned: true }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.articleId, table.tagId] }),
  })
);

export type ArticleTag = typeof articleTags.$inferSelect;

// --- Tool Recommendations ---
export const tools = mysqlTable("tools", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: varchar("description", { length: 500 }),
  icon: varchar("icon", { length: 500 }),
  url: varchar("url", { length: 500 }).notNull(),
  platform: mysqlEnum("platform", ["mac", "windows", "ios", "android", "web", "all"])
    .default("all")
    .notNull(),
  category: varchar("category", { length: 50 }),
  isFree: boolean("is_free").default(true),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Tool = typeof tools.$inferSelect;
export type InsertTool = typeof tools.$inferInsert;

// --- Online Tools (self-built) ---
export const onlineTools = mysqlTable("online_tools", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: varchar("description", { length: 500 }),
  icon: varchar("icon", { length: 500 }),
  route: varchar("route", { length: 100 }).notNull(),
  isActive: boolean("is_active").default(true),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OnlineTool = typeof onlineTools.$inferSelect;
export type InsertOnlineTool = typeof onlineTools.$inferInsert;

// --- Friend Links ---
export const links = mysqlTable("links", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  description: varchar("description", { length: 255 }),
  icon: varchar("icon", { length: 500 }),
  sortOrder: int("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Link = typeof links.$inferSelect;
export type InsertLink = typeof links.$inferInsert;

// --- Site Settings (key-value) ---
export const settings = mysqlTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  description: varchar("description", { length: 255 }),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;

// --- Tutiantian Tables (shared MySQL database) ---

// Packages (subscription plans for 兔填填)
export const packages = mysqlTable("packages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  billingType: varchar("billing_type", { length: 20 }).default("quota"),
  quota: int("quota").default(0),
  price: varchar("price", { length: 20 }).default("0"),
  periodDays: int("period_days"),
  maxTemplates: int("max_templates").default(10),
  maxFileSize: int("max_file_size").default(10485760),
  isFeatured: boolean("is_featured").default(false),
  sortOrder: int("sort_order").default(0),
  status: varchar("status", { length: 20 }).default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Package = typeof packages.$inferSelect;

// User balances (兔填填 user balance)
export const userBalances = mysqlTable("user_balances", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull().unique(),
  balance: int("balance").default(0),
  purchasedBalance: int("purchased_balance").default(0),
  totalUsage: int("total_usage").default(0),
  isNewUser: boolean("is_new_user").default(true),
  emailVerified: boolean("email_verified").default(false),
  emailCode: varchar("email_code", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type UserBalance = typeof userBalances.$inferSelect;

// Orders (兔填填 orders)
export const tutiantianOrders = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  packageId: bigint("package_id", { mode: "number", unsigned: true }).notNull(),
  orderNo: varchar("order_no", { length: 64 }).notNull().unique(),
  price: varchar("price", { length: 20 }).default("0"),
  paymentStatus: varchar("payment_status", { length: 20 }).default("pending"),
  paymentMethod: varchar("payment_method", { length: 20 }),
  paidAt: timestamp("paid_at"),
  wechatTransactionId: varchar("wechat_transaction_id", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type TutiantianOrder = typeof tutiantianOrders.$inferSelect;

// Usage logs (兔填填 usage records)
export const usageLogs = mysqlTable("usage_logs", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  changeAmount: int("change_amount").default(0),
  balanceBefore: int("balance_before").default(0),
  balanceAfter: int("balance_after").default(0),
  description: varchar("description", { length: 255 }),
  relatedOrder: varchar("related_order", { length: 64 }),
  templateId: int("template_id"),
  taskId: varchar("task_id", { length: 64 }),
  status: varchar("status", { length: 20 }).default("success"),
  errorMessage: text("error_message"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UsageLog = typeof usageLogs.$inferSelect;
