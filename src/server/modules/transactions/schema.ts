import { check, date, index, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { students } from "../students/schema";
import { sql } from "drizzle-orm";

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id").notNull(),
    kind: text("kind", { enum: ["revenue", "expense"] })
      .notNull()
      .default("revenue"),
    studentId: uuid("student_id").references(() => students.id, {
      onDelete: "set null",
    }),
    transactionDate: date("transaction_date", { mode: "string" }).notNull().defaultNow(),
    competence: text("competence"),
    amount: numeric("amount", { mode: "number" }).notNull(),
    method: text("method"),
    category: text("category"),
    description: text("description"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("update_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("transactions_kind_chk", sql`${table.kind} IN ('revenue', 'expense')`),
    check("transactions_amount_chk", sql`${table.amount} > 0`),
    index("transactions_owner_date_idx").on(table.ownerId, table.transactionDate.desc()),
    index("transactions_student_idx").on(table.studentId),
  ],
);
