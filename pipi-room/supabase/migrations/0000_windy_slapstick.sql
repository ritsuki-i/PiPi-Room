CREATE TABLE "article_labels" (
	"article_id" uuid,
	"label_id" uuid
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"date" date NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "labels" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "labels_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user_articles" (
	"user_id" uuid,
	"article_id" uuid
);
--> statement-breakpoint
CREATE TABLE "user_learning_records" (
	"user_id" uuid,
	"date" date NOT NULL,
	"learning_hours" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_works" (
	"user_id" uuid,
	"work_id" uuid
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"account_name" varchar(255) NOT NULL,
	"icon" text,
	"email" varchar(255),
	"birth_date" date,
	"bio" text,
	"github_url" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_account_name_unique" UNIQUE("account_name")
);
--> statement-breakpoint
CREATE TABLE "work_labels" (
	"work_id" uuid,
	"label_id" uuid
);
--> statement-breakpoint
CREATE TABLE "works" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"date" date NOT NULL,
	"url" text NOT NULL,
	"icon" text,
	"description" text
);
--> statement-breakpoint
ALTER TABLE "article_labels" ADD CONSTRAINT "article_labels_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_labels" ADD CONSTRAINT "article_labels_label_id_labels_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."labels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_articles" ADD CONSTRAINT "user_articles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_articles" ADD CONSTRAINT "user_articles_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_learning_records" ADD CONSTRAINT "user_learning_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_works" ADD CONSTRAINT "user_works_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_works" ADD CONSTRAINT "user_works_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_labels" ADD CONSTRAINT "work_labels_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_labels" ADD CONSTRAINT "work_labels_label_id_labels_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."labels"("id") ON DELETE cascade ON UPDATE no action;