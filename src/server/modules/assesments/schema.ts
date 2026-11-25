import { sql } from "drizzle-orm";

import { index, pgTable, text, timestamp, uuid, date, numeric as num } from "drizzle-orm/pg-core";
import { students } from "../students/schema";
export const assesments = pgTable(
  "assesments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id"),
    studentId: uuid("student_id").references(() => students.id, {
      onDelete: "set null",
    }),
    assessmentDate: date("assessment_date", { mode: "string" })
      .notNull()
      .default(sql`CURRENT_DATE`),
    heightCm: num("height_cm", { mode: "number" }),
    weightkg: num("weight_kg", { mode: "number" }),
    bodyFat_pct: num("body_fat_pct", { mode: "number" }),
    musclePct: num("muscle_pct", { mode: "number" }),
    bmrKcal: num("bmr_kcal", { mode: "number" }),
    visceralFat: num("visceral_fat", { mode: "number" }),
    waistCm: num("waist_cm", { mode: "number" }),
    hipCm: num("hip_cm", { mode: "number" }),
    chestCm: num("chest_cm", { mode: "number" }),
    armCm: num("arm_cm", { mode: "number" }),
    thighCm: num("thigh_cm", { mode: "number" }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("update_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("assessments_owner_date_idx").on(table.ownerId, table.assessmentDate.desc()),
    index("assessments_student_idx").on(table.studentId),
  ],
);
