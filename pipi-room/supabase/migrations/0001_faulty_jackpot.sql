ALTER TABLE "article_labels" ALTER COLUMN "article_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "article_labels" ALTER COLUMN "label_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "articles" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "labels" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "user_articles" ALTER COLUMN "user_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "user_articles" ALTER COLUMN "article_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "user_learning_records" ALTER COLUMN "user_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "user_works" ALTER COLUMN "user_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "user_works" ALTER COLUMN "work_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "work_labels" ALTER COLUMN "work_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "work_labels" ALTER COLUMN "label_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "works" ALTER COLUMN "id" SET DATA TYPE varchar(255);