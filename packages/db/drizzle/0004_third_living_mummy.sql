CREATE TABLE "models" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "models_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "generation_jobs" ADD COLUMN "model_id" uuid;--> statement-breakpoint
ALTER TABLE "problems" ADD COLUMN "generated_by_model_id" uuid;--> statement-breakpoint
ALTER TABLE "problems" ADD COLUMN "generated_by_user_id" text;--> statement-breakpoint
ALTER TABLE "generation_jobs" ADD CONSTRAINT "generation_jobs_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problems" ADD CONSTRAINT "problems_generated_by_model_id_models_id_fk" FOREIGN KEY ("generated_by_model_id") REFERENCES "public"."models"("id") ON DELETE no action ON UPDATE no action;