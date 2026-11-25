ALTER TABLE "students" DROP CONSTRAINT "students_name_len";--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_name_len" CHECK (char_length("students"."name") BETWEEN 1 AND 200);