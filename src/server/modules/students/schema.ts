import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  numeric as num,
  pgTable,
  text,
  timestamp,
  uuid,
  check,
  index,
} from "drizzle-orm/pg-core";

export const students = pgTable(
  "students",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id").notNull(),
    name: text("name").notNull(),
    birthDate: date("birth_date", { mode: "string" }),
    cpf: text("cpf"),
    sex: text("sex"),
    phone: text("phone"),
    email: text("email"),
    heightCm: num("height_cm", { mode: "number" }),
    lessonValue: num("lesson_value", { mode: "number" }),
    packageValue: num("package_value", { mode: "number" }),
    billing: text("billing", { enum: ["monthly", "class"] })
      .notNull()
      .default("monthly"),
    absenceRule: text("absence_rule", { enum: ["makeup", "charge_normally", "not_charge"] })
      .notNull()
      .default("makeup"),
    paymentTiming: text("payment_timing", { enum: ["in_advance", "end_month", "after_lesson"] })
      .notNull()
      .default("in_advance"),
    notes: text("notes"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("students_billing_chk", sql`${table.billing} IN ('monthly', 'class')`),
    check(
      "students_absence_chk",
      sql`${table.absenceRule} IN ('makeup', 'charge_normally', 'not_charge')`,
    ),
    check(
      "students_timing_chk",
      sql`${table.paymentTiming} IN ('in_advance', 'end_month', 'after_lesson')`,
    ),
    check("students_name_len", sql`char_length(${table.name}) BETWEEN 1 AND 200`),
    index("students_owner_idx").on(table.ownerId),
  ],
);
