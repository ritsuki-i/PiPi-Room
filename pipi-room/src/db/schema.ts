import { pgTable, varchar, text, timestamp, integer, boolean, date, bigserial, bigint, serial } from "drizzle-orm/pg-core";

// ユーザー情報
export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  accountName: varchar("account_name", { length: 255 }).notNull().unique(),
  icon: text("icon"),
  email: varchar("email", { length: 255 }),
  enrollmentYear: bigserial("enrollment_year", { mode: "number" }),
  bio: text("bio"),
  portfolioUrl: text("portfolio_url"),
  githubUrl: text("github_url"),
  type: varchar("type", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 記事情報
export const articles = pgTable("articles", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  date: date("date").notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 100 }).notNull(),
});

// アプリ情報
export const works = pgTable("works", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  date: date("date").notNull(),
  url: text("url"),
  icon: text("icon"),
  description: text("description"),
  githubUrl: text("github_url"),
  type: varchar("type", { length: 100 }).notNull(),
});

// ラベル情報
export const labels = pgTable("labels", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  name: varchar("name", { length: 255 }).unique().notNull(),
});

// 使用技術情報
export const technologies = pgTable("technologies", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  name: varchar("name", { length: 255 }).unique().notNull(),
});

// ユーザと記事の中間テーブル
export const userArticles = pgTable("user_articles", {
  userId: varchar("user_id", { length: 255 }).references(() => users.id, { onDelete: "cascade" }),

  articleId: bigint("article_id", { mode: "number" })
    .references(() => articles.id, { onDelete: "cascade" })
    .notNull(),
});

// ユーザとアプリの中間テーブル
export const userWorks = pgTable("user_works", {
  userId: varchar("user_id", { length: 255 }).references(() => users.id, { onDelete: "cascade" }),

  workId: bigint("work_id", { mode: "number" })
    .references(() => works.id, { onDelete: "cascade" })
    .notNull(),
});

// 記事とラベルの中間テーブル
export const articleLabels = pgTable("article_labels", {
  articleId: bigint("article_id", { mode: "number" })
    .references(() => articles.id, { onDelete: "cascade" })
    .notNull(),

  labelId: bigint("label_id", { mode: "number" })
    .references(() => labels.id, { onDelete: "cascade" })
    .notNull(),
});

// 記事と使用技術の中間テーブル
export const articleTechnologies = pgTable("article_technologies", {
  articleId: bigint("article_id", { mode: "number" })
    .references(() => articles.id, { onDelete: "cascade" })
    .notNull(),

  technologieId: bigint("technologie_id", { mode: "number" })
    .references(() => technologies.id, { onDelete: "cascade" })
    .notNull(),
});

// アプリとラベルの中間テーブル
export const workLabels = pgTable("work_labels", {
  workId: bigint("work_id", { mode: "number" })
    .references(() => works.id, { onDelete: "cascade" })
    .notNull(),

  labelId: bigint("label_id", { mode: "number" })
    .references(() => labels.id, { onDelete: "cascade" })
    .notNull(),
});


// アプリと使用技術の中間テーブル
export const workTechnologies = pgTable("work_technologies", {
  workId: bigint("work_id", { mode: "number" })
    .references(() => works.id, { onDelete: "cascade" })
    .notNull(),

  technologieId: bigint("technologie_id", { mode: "number" })
    .references(() => technologies.id, { onDelete: "cascade" })
    .notNull(),
});

// ユーザーの学習記録
export const userLearningRecords = pgTable("user_learning_records", {
  userId: varchar("user_id", { length: 255 }).references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  learningHours: integer("learning_hours").notNull(),
});

// 記事閲覧履歴（最新5件）
export const articleViewHistory = pgTable("article_view_history", {
  userId: varchar("user_id", { length: 255 }).references(() => users.id, { onDelete: "cascade" }),
  articleId: bigint("article_id", { mode: "number" })
    .references(() => articles.id, { onDelete: "cascade" })
    .notNull(),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
});

// 作品閲覧履歴（最新5件）
export const workViewHistory = pgTable("work_view_history", {
  userId: varchar("user_id", { length: 255 }).references(() => users.id, { onDelete: "cascade" }),
  workId: bigint("work_id", { mode: "number" })
    .references(() => works.id, { onDelete: "cascade" })
    .notNull(),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
});

// 記事のコメント
export const articleComments = pgTable("article_comments", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  articleId: bigint("article_id", { mode: "number" })
    .references(() => articles.id, { onDelete: "cascade" })
    .notNull(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 作品のコメント
export const workComments = pgTable("work_comments", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  workId: bigint("work_id", { mode: "number" })
    .references(() => works.id, { onDelete: "cascade" })
    .notNull(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 記事の写真
export const articleImages = pgTable("article_images", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id, { onDelete: "cascade" }),
  articleId: integer("article_id").notNull().references(() => articles.id),
});

// 通知情報
export const notifications = pgTable("notifications", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  targetType: varchar("target_type", { length: 50 }).notNull(),
  targetId: integer("target_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readFlag: boolean("read_flag").default(false).notNull(),
});

//更新ログ
export const pingLog = pgTable("ping_log", {
  id: serial("id").primaryKey(),
  executedAt: timestamp("executed_at", { withTimezone: true }).defaultNow(),
});