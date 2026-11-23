import {
  check,
  date,
  index,
  numeric,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { students } from "../students/schema";
import { sql } from "drizzle-orm";

export const lessions = pgTable(
  "lessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id").notNull(),
    studentId: uuid("student_id").references(() => students.id, {
      onDelete: "set null",
    }),
    lessionDate: date("lession_date", { mode: "string" }).notNull().defaultNow(),
    startTime: time("start_time", { withTimezone: true }),
    endtTime: time("end_time", { withTimezone: true }),
    status: text("status", { enum: ["realized", "canceled", "answer", "schedule", "absence"] })
      .notNull()
      .default("realized"),
    perfomance: text("performance", { enum: ["good", "regular", "bad"] }),
    muscleGroups: text("muscle_groups").array().notNull().default([]),
    value: numeric("value"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("update_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check(
      "lessons_status_chk",
      sql`${table.status} IN ('realized', 'canceled', 'answer', 'schedule', 'absence')`,
    ),
    check(
      "lessons_perf_chk",
      sql`${table.perfomance} IS NULL OR ${table.perfomance} IN ('good', 'regular', 'bad')`,
    ),
    index("lessons_owner_date_idx").on(table.ownerId),
    index("lessons_student_idx").on(table.studentId),
  ],
);
