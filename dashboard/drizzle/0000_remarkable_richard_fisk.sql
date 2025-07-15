CREATE TABLE "task_executions" (
	"id" text PRIMARY KEY NOT NULL,
	"task_id" uuid NOT NULL,
	"secrets" text,
	"included_file_names" text,
	"save_browser_data" boolean DEFAULT false,
	"status" text NOT NULL,
	"output" text,
	"live_url" text,
	"public_share_url" text,
	"output_files" text,
	"screenshots" text,
	"recordings" text,
	"steps" text,
	"browser_data" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"finished_at" timestamp,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"allowed_domains" text,
	"structured_output_json" text,
	"llm_model" text,
	"use_adblock" boolean DEFAULT true,
	"use_proxy" boolean DEFAULT true,
	"proxy_country_code" text DEFAULT 'US',
	"highlight_elements" boolean DEFAULT true,
	"browser_viewport_width" integer DEFAULT 1280,
	"browser_viewport_height" integer DEFAULT 960,
	"max_agent_steps" integer DEFAULT 75,
	"enable_public_share" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "task_executions" ADD CONSTRAINT "task_executions_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;