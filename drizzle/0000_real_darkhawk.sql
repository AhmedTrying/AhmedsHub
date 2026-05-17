CREATE TABLE "activity" (
	"id" text PRIMARY KEY NOT NULL,
	"who" text NOT NULL,
	"what" text NOT NULL,
	"on_label" text NOT NULL,
	"when_label" text DEFAULT '' NOT NULL,
	"icon" text DEFAULT '' NOT NULL,
	"at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_state" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text
);
--> statement-breakpoint
CREATE TABLE "checklist_items" (
	"id" text PRIMARY KEY NOT NULL,
	"site_visit_id" text NOT NULL,
	"group_name" text NOT NULL,
	"text" text NOT NULL,
	"done" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"contact" text,
	"email" text,
	"phone" text
);
--> statement-breakpoint
CREATE TABLE "estimate_items" (
	"id" text PRIMARY KEY NOT NULL,
	"estimate_id" text NOT NULL,
	"item" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"unit" text NOT NULL,
	"qty" real DEFAULT 0 NOT NULL,
	"cost" real DEFAULT 0 NOT NULL,
	"markup" real DEFAULT 0 NOT NULL,
	"notes" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "estimates" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"name" text NOT NULL,
	"version" text NOT NULL,
	"quotation_number" text NOT NULL,
	"validity" text NOT NULL,
	"payment_terms" text NOT NULL,
	"cover_letter" text DEFAULT '' NOT NULL,
	"include_assumptions" boolean DEFAULT true NOT NULL,
	"updated_at" bigint NOT NULL,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"project_id" text,
	"pinned" boolean DEFAULT false NOT NULL,
	"when_label" text DEFAULT '' NOT NULL,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"text" text NOT NULL,
	"done" boolean DEFAULT false NOT NULL,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"client_id" text DEFAULT '' NOT NULL,
	"client" text NOT NULL,
	"location" text NOT NULL,
	"scope" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text NOT NULL,
	"value" real DEFAULT 0 NOT NULL,
	"updated" text DEFAULT '' NOT NULL,
	"owner" text NOT NULL,
	"priority" text NOT NULL,
	"due_date" text DEFAULT '' NOT NULL,
	"next" text DEFAULT '' NOT NULL,
	"estimate_id" text,
	"pinned" boolean DEFAULT false NOT NULL,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"unit" text NOT NULL,
	"rate" real DEFAULT 0 NOT NULL,
	"last" text DEFAULT '' NOT NULL,
	"source" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rfqs" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text DEFAULT '' NOT NULL,
	"name" text NOT NULL,
	"client" text NOT NULL,
	"status" text NOT NULL,
	"value" real DEFAULT 0 NOT NULL,
	"priority" text NOT NULL,
	"due_date" text DEFAULT '' NOT NULL,
	"next" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" text PRIMARY KEY NOT NULL,
	"personal_name" text DEFAULT 'Ahmed H.' NOT NULL,
	"currency" text DEFAULT 'AED' NOT NULL,
	"default_markup" real DEFAULT 20 NOT NULL,
	"working_hours" text DEFAULT '06:00 – 18:00' NOT NULL,
	"theme" text DEFAULT 'light' NOT NULL,
	"export_default" text DEFAULT 'PDF' NOT NULL,
	"notifications" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_visits" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text,
	"title" text NOT NULL,
	"date" text DEFAULT '' NOT NULL,
	"contact" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"gfa" text DEFAULT '' NOT NULL,
	"hours" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"icon" text DEFAULT '' NOT NULL,
	"color" text DEFAULT '' NOT NULL,
	"rows" integer DEFAULT 0 NOT NULL,
	"used" integer DEFAULT 0 NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"kind" text NOT NULL
);
