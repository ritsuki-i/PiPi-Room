CREATE TABLE "article_comments" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"article_id" bigint NOT NULL,
	"user_id" varchar(255),
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "article_images" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" varchar(255),
	"article_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "article_labels" (
	"article_id" bigint NOT NULL,
	"label_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "article_technologies" (
	"article_id" bigint NOT NULL,
	"technologie_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "article_view_history" (
	"user_id" varchar(255),
	"article_id" bigint NOT NULL,
	"viewed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"date" date NOT NULL,
	"content" text NOT NULL,
	"type" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "labels" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "labels_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" varchar(255),
	"content" text NOT NULL,
	"target_type" varchar(50) NOT NULL,
	"target_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"read_flag" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ping_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"executed_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "technologies" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "technologies_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user_articles" (
	"user_id" varchar(255),
	"article_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_learning_records" (
	"user_id" varchar(255),
	"date" date NOT NULL,
	"learning_hours" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_works" (
	"user_id" varchar(255),
	"work_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"account_name" varchar(255) NOT NULL,
	"icon" text,
	"email" varchar(255),
	"enrollment_year" bigserial NOT NULL,
	"bio" text,
	"portfolio_url" text,
	"github_url" text,
	"type" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_account_name_unique" UNIQUE("account_name")
);
--> statement-breakpoint
CREATE TABLE "work_comments" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"work_id" bigint NOT NULL,
	"user_id" varchar(255),
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_labels" (
	"work_id" bigint NOT NULL,
	"label_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_technologies" (
	"work_id" bigint NOT NULL,
	"technologie_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_view_history" (
	"user_id" varchar(255),
	"work_id" bigint NOT NULL,
	"viewed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "works" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"date" date NOT NULL,
	"url" text,
	"icon" text,
	"description" text,
	"github_url" text,
	"type" varchar(100) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "article_comments" ADD CONSTRAINT "article_comments_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_comments" ADD CONSTRAINT "article_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_images" ADD CONSTRAINT "article_images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_images" ADD CONSTRAINT "article_images_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_labels" ADD CONSTRAINT "article_labels_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_labels" ADD CONSTRAINT "article_labels_label_id_labels_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."labels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_technologies" ADD CONSTRAINT "article_technologies_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_technologies" ADD CONSTRAINT "article_technologies_technologie_id_technologies_id_fk" FOREIGN KEY ("technologie_id") REFERENCES "public"."technologies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_view_history" ADD CONSTRAINT "article_view_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_view_history" ADD CONSTRAINT "article_view_history_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_articles" ADD CONSTRAINT "user_articles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_articles" ADD CONSTRAINT "user_articles_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_learning_records" ADD CONSTRAINT "user_learning_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_works" ADD CONSTRAINT "user_works_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_works" ADD CONSTRAINT "user_works_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_comments" ADD CONSTRAINT "work_comments_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_comments" ADD CONSTRAINT "work_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_labels" ADD CONSTRAINT "work_labels_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_labels" ADD CONSTRAINT "work_labels_label_id_labels_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."labels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_technologies" ADD CONSTRAINT "work_technologies_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_technologies" ADD CONSTRAINT "work_technologies_technologie_id_technologies_id_fk" FOREIGN KEY ("technologie_id") REFERENCES "public"."technologies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_view_history" ADD CONSTRAINT "work_view_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_view_history" ADD CONSTRAINT "work_view_history_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;