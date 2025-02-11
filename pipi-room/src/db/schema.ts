import { pgTable, varchar, text, date, timestamp, integer } from "drizzle-orm/pg-core";

// users テーブル
export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  accountName: varchar("account_name", { length: 255 }).unique().notNull(),
  icon: text("icon"),
  email: varchar("email", { length: 255 }),
  birthDate: date("birth_date"),
  bio: text("bio"),
  githubUrl: text("github_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// articles テーブル
export const articles = pgTable("articles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  date: date("date").notNull(),
  content: text("content").notNull(),
});

// works テーブル
export const works = pgTable("works", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  date: date("date").notNull(),
  url: text("url"),
  icon: text("icon"),
  description: text("description"),
});

// labels テーブル
export const labels = pgTable("labels", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).unique().notNull(),
});

// user_articles（ユーザーと記事の中間テーブル）
export const userArticles = pgTable("user_articles", {
  userId: varchar("user_id", { length: 255 }).references(() => users.id, { onDelete: "cascade" }),
  articleId: varchar("article_id", { length: 255 }).references(() => articles.id, { onDelete: "cascade" }),
});

// user_works（ユーザーとアプリの中間テーブル）
export const userWorks = pgTable("user_works", {
  userId: varchar("user_id", { length: 255 }).references(() => users.id, { onDelete: "cascade" }),
  workId: varchar("work_id", { length: 255 }).references(() => works.id, { onDelete: "cascade" }),
});

// article_labels（記事とラベルの中間テーブル）
export const articleLabels = pgTable("article_labels", {
  articleId: varchar("article_id", { length: 255 }).references(() => articles.id, { onDelete: "cascade" }),
  labelId: varchar("label_id", { length: 255 }).references(() => labels.id, { onDelete: "cascade" }),
});

// work_labels（アプリとラベルの中間テーブル）
export const workLabels = pgTable("work_labels", {
  workId: varchar("work_id", { length: 255 }).references(() => works.id, { onDelete: "cascade" }),
  labelId: varchar("label_id", { length: 255 }).references(() => labels.id, { onDelete: "cascade" }),
});

// user_learning_records（ユーザーの学習記録）
export const userLearningRecords = pgTable("user_learning_records", {
  userId: varchar("user_id", { length: 255 }).references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  learningHours: integer("learning_hours").notNull(),
});
