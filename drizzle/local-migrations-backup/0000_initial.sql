CREATE TABLE "assesments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid,
	"student_id" uuid,
	"assessment_date" date DEFAULT CURRENT_DATE NOT NULL,
	"height_cm" numeric,
	"weight_kg" numeric,
	"body_fat_pct" numeric,
	"muscle_pct" numeric,
	"bmr_kcal" numeric,
	"visceral_fat" numeric,
	"waist_cm" numeric,
	"hip_cm" numeric,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"update_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"student_id" uuid,
	"lession_date" date DEFAULT now() NOT NULL,
	"start_time" time with time zone,
	"end_time" time with time zone,
	"status" text DEFAULT 'realized' NOT NULL,
	"performance" text,
	"muscle_groups" text[] DEFAULT '{}' NOT NULL,
	"value" numeric,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"update_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lessons_status_chk" CHECK ("lessions"."status" IN ('realized', 'canceled', 'answer', 'schedule', 'absence')),
	CONSTRAINT "lessons_perf_chk" CHECK ("lessions"."performance" IS NULL OR "lessions"."performance" IN ('good', 'regular', 'bad'))
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" text NOT NULL,
	"birth_date" date,
	"cpf" text,
	"sex" text,
	"phone" text,
	"email" text,
	"height_cm" numeric,
	"lesson_value" numeric,
	"package_value" numeric,
	"billing" text DEFAULT 'monthly' NOT NULL,
	"absence_rule" text DEFAULT 'makeup' NOT NULL,
	"payment_timing" text DEFAULT 'in_advance' NOT NULL,
	"notes" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "students_billing_chk" CHECK ("students"."billing" IN ('monthly', 'class')),
	CONSTRAINT "students_absence_chk" CHECK ("students"."absence_rule" IN ('makeup', 'charge_normally', 'not_charge')),
	CONSTRAINT "students_timing_chk" CHECK ("students"."payment_timing" IN ('in_advance', 'end_month', 'after_lesson')),
	CONSTRAINT "students_name_len" CHECK (char_length("students"."name" BETWEEN 1 AND 200))
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"kind" text DEFAULT 'revenue' NOT NULL,
	"student_id" uuid,
	"transaction_date" date DEFAULT now() NOT NULL,
	"competence" text,
	"amount" numeric NOT NULL,
	"method" text,
	"category" text,
	"description" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"update_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "transactions_kind_chk" CHECK ("transactions"."kind" IN ('revenue', 'expense')),
	CONSTRAINT "transactions_amount_chk" CHECK ("transactions"."amount" > 0)
);
--> statement-breakpoint
ALTER TABLE "assesments" ADD CONSTRAINT "assesments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessions" ADD CONSTRAINT "lessions_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assessments_owner_date_idx" ON "assesments" USING btree ("owner_id","assessment_date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "assessments_student_idx" ON "assesments" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "lessons_owner_date_idx" ON "lessions" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "lessons_student_idx" ON "lessions" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "students_owner_idx" ON "students" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "transactions_owner_date_idx" ON "transactions" USING btree ("owner_id","transaction_date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "transactions_student_idx" ON "transactions" USING btree ("student_id");