

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE SCHEMA IF NOT EXISTS "drizzle";


ALTER SCHEMA "drizzle" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pgsodium";








ALTER SCHEMA "public" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."regular_execution"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- id = 1 のレコードを更新（存在しない場合は挿入）
  INSERT INTO ping_log (id, executed_at)
  VALUES (1, now())
  ON CONFLICT (id) DO UPDATE
  SET executed_at = EXCLUDED.executed_at;

  RAISE NOTICE 'regular_execution executed at %', now();
END;
$$;


ALTER FUNCTION "public"."regular_execution"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
    "id" integer NOT NULL,
    "hash" "text" NOT NULL,
    "created_at" bigint
);


ALTER TABLE "drizzle"."__drizzle_migrations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "drizzle"."__drizzle_migrations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "drizzle"."__drizzle_migrations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "drizzle"."__drizzle_migrations_id_seq" OWNED BY "drizzle"."__drizzle_migrations"."id";



CREATE TABLE IF NOT EXISTS "public"."article_comments" (
    "id" integer NOT NULL,
    "article_id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."article_comments" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."article_comments_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."article_comments_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."article_comments_id_seq" OWNED BY "public"."article_comments"."id";



CREATE TABLE IF NOT EXISTS "public"."article_images" (
    "id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "article_id" integer NOT NULL
);


ALTER TABLE "public"."article_images" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."article_images_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."article_images_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."article_images_id_seq" OWNED BY "public"."article_images"."id";



CREATE TABLE IF NOT EXISTS "public"."article_labels" (
    "article_id" integer NOT NULL,
    "label_id" integer NOT NULL
);


ALTER TABLE "public"."article_labels" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."article_technologies" (
    "article_id" integer NOT NULL,
    "technology_id" integer NOT NULL
);


ALTER TABLE "public"."article_technologies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."article_view_history" (
    "user_id" integer NOT NULL,
    "article_id" integer NOT NULL,
    "viewed_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."article_view_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."articles" (
    "id" integer NOT NULL,
    "title" character varying(255) NOT NULL,
    "date" "date" NOT NULL,
    "content" "text" NOT NULL,
    "type" character varying(100) NOT NULL
);


ALTER TABLE "public"."articles" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."articles_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."articles_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."articles_id_seq" OWNED BY "public"."articles"."id";



CREATE TABLE IF NOT EXISTS "public"."labels" (
    "id" integer NOT NULL,
    "name" character varying(255) NOT NULL
);


ALTER TABLE "public"."labels" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."labels_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."labels_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."labels_id_seq" OWNED BY "public"."labels"."id";



CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "content" "text" NOT NULL,
    "target_type" character varying(50) NOT NULL,
    "target_id" integer NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "read_flag" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."notifications_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."notifications_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."notifications_id_seq" OWNED BY "public"."notifications"."id";



CREATE TABLE IF NOT EXISTS "public"."ping_log" (
    "id" integer NOT NULL,
    "executed_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ping_log" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."ping_log_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."ping_log_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."ping_log_id_seq" OWNED BY "public"."ping_log"."id";



CREATE TABLE IF NOT EXISTS "public"."technologies" (
    "id" integer NOT NULL,
    "name" character varying(255) NOT NULL
);


ALTER TABLE "public"."technologies" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."technologies_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."technologies_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."technologies_id_seq" OWNED BY "public"."technologies"."id";



CREATE TABLE IF NOT EXISTS "public"."user_articles" (
    "user_id" integer NOT NULL,
    "article_id" integer NOT NULL
);


ALTER TABLE "public"."user_articles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_learning_records" (
    "user_id" integer NOT NULL,
    "date" "date" NOT NULL,
    "learning_hours" integer NOT NULL
);


ALTER TABLE "public"."user_learning_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_works" (
    "user_id" integer NOT NULL,
    "work_id" integer NOT NULL
);


ALTER TABLE "public"."user_works" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" integer NOT NULL,
    "name" character varying(255) NOT NULL,
    "account_name" character varying(255) NOT NULL,
    "icon" "text",
    "email" character varying(255) NOT NULL,
    "birth_date" "date",
    "bio" "text",
    "github_url" "text",
    "type" character varying(100) NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."users_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."users_id_seq" OWNED BY "public"."users"."id";



CREATE TABLE IF NOT EXISTS "public"."work_comments" (
    "id" integer NOT NULL,
    "work_id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."work_comments" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."work_comments_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."work_comments_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."work_comments_id_seq" OWNED BY "public"."work_comments"."id";



CREATE TABLE IF NOT EXISTS "public"."work_labels" (
    "work_id" integer NOT NULL,
    "label_id" integer NOT NULL
);


ALTER TABLE "public"."work_labels" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."work_technologies" (
    "work_id" integer NOT NULL,
    "technology_id" integer NOT NULL
);


ALTER TABLE "public"."work_technologies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."work_view_history" (
    "user_id" integer NOT NULL,
    "work_id" integer NOT NULL,
    "viewed_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."work_view_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."works" (
    "id" integer NOT NULL,
    "name" character varying(255) NOT NULL,
    "date" "date" NOT NULL,
    "url" "text",
    "github_url" "text",
    "icon" "text",
    "description" "text",
    "type" character varying(100) NOT NULL
);


ALTER TABLE "public"."works" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."works_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."works_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."works_id_seq" OWNED BY "public"."works"."id";



ALTER TABLE ONLY "drizzle"."__drizzle_migrations" ALTER COLUMN "id" SET DEFAULT "nextval"('"drizzle"."__drizzle_migrations_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."article_comments" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."article_comments_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."article_images" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."article_images_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."articles" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."articles_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."labels" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."labels_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."notifications" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."notifications_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."ping_log" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."ping_log_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."technologies" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."technologies_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."users" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."users_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."work_comments" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."work_comments_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."works" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."works_id_seq"'::"regclass");



ALTER TABLE ONLY "drizzle"."__drizzle_migrations"
    ADD CONSTRAINT "__drizzle_migrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."article_comments"
    ADD CONSTRAINT "article_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."article_images"
    ADD CONSTRAINT "article_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."articles"
    ADD CONSTRAINT "articles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."labels"
    ADD CONSTRAINT "labels_name_unique" UNIQUE ("name");



ALTER TABLE ONLY "public"."labels"
    ADD CONSTRAINT "labels_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ping_log"
    ADD CONSTRAINT "ping_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."technologies"
    ADD CONSTRAINT "technologies_name_unique" UNIQUE ("name");



ALTER TABLE ONLY "public"."technologies"
    ADD CONSTRAINT "technologies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_account_name_unique" UNIQUE ("account_name");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_unique" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."work_comments"
    ADD CONSTRAINT "work_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."works"
    ADD CONSTRAINT "works_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."article_comments"
    ADD CONSTRAINT "article_comments_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id");



ALTER TABLE ONLY "public"."article_comments"
    ADD CONSTRAINT "article_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."article_images"
    ADD CONSTRAINT "article_images_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id");



ALTER TABLE ONLY "public"."article_images"
    ADD CONSTRAINT "article_images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."article_labels"
    ADD CONSTRAINT "article_labels_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id");



ALTER TABLE ONLY "public"."article_labels"
    ADD CONSTRAINT "article_labels_label_id_labels_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."labels"("id");



ALTER TABLE ONLY "public"."article_technologies"
    ADD CONSTRAINT "article_technologies_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id");



ALTER TABLE ONLY "public"."article_technologies"
    ADD CONSTRAINT "article_technologies_technology_id_technologies_id_fk" FOREIGN KEY ("technology_id") REFERENCES "public"."technologies"("id");



ALTER TABLE ONLY "public"."article_view_history"
    ADD CONSTRAINT "article_view_history_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id");



ALTER TABLE ONLY "public"."article_view_history"
    ADD CONSTRAINT "article_view_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."user_articles"
    ADD CONSTRAINT "user_articles_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id");



ALTER TABLE ONLY "public"."user_articles"
    ADD CONSTRAINT "user_articles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."user_learning_records"
    ADD CONSTRAINT "user_learning_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."user_works"
    ADD CONSTRAINT "user_works_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."user_works"
    ADD CONSTRAINT "user_works_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id");



ALTER TABLE ONLY "public"."work_comments"
    ADD CONSTRAINT "work_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."work_comments"
    ADD CONSTRAINT "work_comments_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id");



ALTER TABLE ONLY "public"."work_labels"
    ADD CONSTRAINT "work_labels_label_id_labels_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."labels"("id");



ALTER TABLE ONLY "public"."work_labels"
    ADD CONSTRAINT "work_labels_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id");



ALTER TABLE ONLY "public"."work_technologies"
    ADD CONSTRAINT "work_technologies_technology_id_technologies_id_fk" FOREIGN KEY ("technology_id") REFERENCES "public"."technologies"("id");



ALTER TABLE ONLY "public"."work_technologies"
    ADD CONSTRAINT "work_technologies_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id");



ALTER TABLE ONLY "public"."work_view_history"
    ADD CONSTRAINT "work_view_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."work_view_history"
    ADD CONSTRAINT "work_view_history_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id");





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;






















































































































































































































































RESET ALL;
