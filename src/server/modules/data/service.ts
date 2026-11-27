import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/server/db/connection";
import { students } from "@/server/modules/students/schema";
import { lessions } from "@/server/modules/lessons/schema";
import { assesments } from "@/server/modules/assesments/schema";
import { transactions } from "@/server/modules/transactions/schema";
import type { TableName } from "@/lib/models";

export class DataError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

const id = z.uuid();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const nullableText = z.string().max(5000).nullable();
const nullableNumber = z.number().finite().nullable();

const studentFields = z
  .object({
    id: id.optional(),
    name: z.string().trim().min(1).max(200).optional(),
    birth_date: date.nullable().optional(),
    cpf: nullableText.optional(),
    sex: nullableText.optional(),
    phone: nullableText.optional(),
    email: nullableText.optional(),
    height_cm: nullableNumber.optional(),
    lesson_value: nullableNumber.optional(),
    package_value: nullableNumber.optional(),
    billing: z.enum(["aula", "mensal"]).optional(),
    absence_rule: z.enum(["cobrar", "nao_cobrar", "repor"]).optional(),
    payment_timing: z.enum(["antecipado", "fim_mes", "por_aula"]).optional(),
    notes: nullableText.optional(),
    active: z.boolean().optional(),
  })
  .strict();

const lessonFields = z
  .object({
    id: id.optional(),
    student_id: id.nullable().optional(),
    lesson_date: date.optional(),
    start_time: z.string().max(20).nullable().optional(),
    end_time: z.string().max(20).nullable().optional(),
    status: z.enum(["agendada", "realizada", "reposta", "falta", "cancelada"]).optional(),
    performance: z.enum(["Bom", "Médio", "Ruim"]).nullable().optional(),
    muscle_groups: z.array(z.string().max(100)).max(50).optional(),
    value: nullableNumber.optional(),
    notes: nullableText.optional(),
  })
  .strict();

const assessmentFields = z
  .object({
    id: id.optional(),
    student_id: id.nullable().optional(),
    assessment_date: date.optional(),
    height_cm: nullableNumber.optional(),
    weight_kg: nullableNumber.optional(),
    body_fat_pct: nullableNumber.optional(),
    muscle_pct: nullableNumber.optional(),
    bmr_kcal: nullableNumber.optional(),
    visceral_fat: nullableNumber.optional(),
    waist_cm: nullableNumber.optional(),
    hip_cm: nullableNumber.optional(),
    chest_cm: nullableNumber.optional(),
    arm_cm: nullableNumber.optional(),
    thigh_cm: nullableNumber.optional(),
    notes: nullableText.optional(),
  })
  .strict();

const transactionFields = z
  .object({
    id: id.optional(),
    kind: z.enum(["receita", "despesa"]).optional(),
    student_id: id.nullable().optional(),
    tx_date: date.optional(),
    competence: nullableText.optional(),
    amount: z.number().finite().positive().optional(),
    method: nullableText.optional(),
    category: nullableText.optional(),
    description: nullableText.optional(),
    notes: nullableText.optional(),
  })
  .strict();

const billing = { aula: "class", mensal: "monthly" } as const;
const billingOut = { class: "aula", monthly: "mensal" } as const;
const absence = { cobrar: "charge_normally", nao_cobrar: "not_charge", repor: "makeup" } as const;
const absenceOut = {
  charge_normally: "cobrar",
  not_charge: "nao_cobrar",
  makeup: "repor",
} as const;
const timing = {
  antecipado: "in_advance",
  fim_mes: "end_month",
  por_aula: "after_lesson",
} as const;
const timingOut = {
  in_advance: "antecipado",
  end_month: "fim_mes",
  after_lesson: "por_aula",
} as const;
const status = {
  agendada: "schedule",
  realizada: "realized",
  reposta: "answer",
  falta: "absence",
  cancelada: "canceled",
} as const;
const statusOut = {
  schedule: "agendada",
  realized: "realizada",
  answer: "reposta",
  absence: "falta",
  canceled: "cancelada",
} as const;
const performance = { Bom: "good", Médio: "regular", Ruim: "bad" } as const;
const performanceOut = { good: "Bom", regular: "Médio", bad: "Ruim" } as const;
const kind = { receita: "revenue", despesa: "expense" } as const;
const kindOut = { revenue: "receita", expense: "despesa" } as const;

const iso = (value: Date) => value.toISOString();

function studentDto(row: typeof students.$inferSelect) {
  return {
    id: row.id,
    owner_id: row.ownerId,
    name: row.name,
    birth_date: row.birthDate,
    cpf: row.cpf,
    sex: row.sex,
    phone: row.phone,
    email: row.email,
    height_cm: row.heightCm,
    lesson_value: row.lessonValue,
    package_value: row.packageValue,
    billing: billingOut[row.billing as keyof typeof billingOut] ?? row.billing,
    absence_rule: absenceOut[row.absenceRule as keyof typeof absenceOut] ?? row.absenceRule,
    payment_timing: timingOut[row.paymentTiming as keyof typeof timingOut] ?? row.paymentTiming,
    notes: row.notes,
    active: row.active,
    created_at: iso(row.createdAt),
    updated_at: iso(row.updatedAt),
  };
}

function lessonDto(row: typeof lessions.$inferSelect) {
  return {
    id: row.id,
    owner_id: row.ownerId,
    student_id: row.studentId,
    lesson_date: row.lessionDate,
    start_time: row.startTime,
    end_time: row.endtTime,
    status: statusOut[row.status as keyof typeof statusOut] ?? row.status,
    performance: row.perfomance
      ? (performanceOut[row.perfomance as keyof typeof performanceOut] ?? row.perfomance)
      : null,
    muscle_groups: row.muscleGroups,
    value: row.value,
    notes: row.notes,
    created_at: iso(row.createdAt),
    updated_at: iso(row.updatedAt),
  };
}

function assessmentDto(row: typeof assesments.$inferSelect) {
  return {
    id: row.id,
    owner_id: row.ownerId,
    student_id: row.studentId,
    assessment_date: row.assessmentDate,
    height_cm: row.heightCm,
    weight_kg: row.weightkg,
    body_fat_pct: row.bodyFat_pct,
    muscle_pct: row.musclePct,
    bmr_kcal: row.bmrKcal,
    visceral_fat: row.visceralFat,
    waist_cm: row.waistCm,
    hip_cm: row.hipCm,
    chest_cm: row.chestCm,
    arm_cm: row.armCm,
    thigh_cm: row.thighCm,
    notes: row.notes,
    created_at: iso(row.createdAt),
    updated_at: iso(row.updatedAt),
  };
}

function transactionDto(row: typeof transactions.$inferSelect) {
  return {
    id: row.id,
    owner_id: row.ownerId,
    kind: kindOut[row.kind as keyof typeof kindOut] ?? row.kind,
    student_id: row.studentId,
    tx_date: row.transactionDate,
    competence: row.competence,
    amount: row.amount,
    method: row.method,
    category: row.category,
    description: row.description,
    notes: row.notes,
    created_at: iso(row.createdAt),
    updated_at: iso(row.updatedAt),
  };
}

async function ownedStudent(ownerId: string, studentId: string | null | undefined) {
  if (!studentId) return;
  const [row] = await db
    .select({ id: students.id })
    .from(students)
    .where(and(eq(students.id, studentId), eq(students.ownerId, ownerId)))
    .limit(1);
  if (!row) throw new DataError("Aluno não pertence à sua conta.", 403);
}

export async function listRows(table: TableName, ownerId: string) {
  switch (table) {
    case "students":
      return (
        await db.select().from(students).where(eq(students.ownerId, ownerId)).orderBy(students.name)
      ).map(studentDto);
    case "lessons":
      return (
        await db
          .select()
          .from(lessions)
          .where(eq(lessions.ownerId, ownerId))
          .orderBy(desc(lessions.lessionDate), desc(lessions.startTime))
          .limit(5000)
      ).map(lessonDto);
    case "assessments":
      return (
        await db
          .select()
          .from(assesments)
          .where(eq(assesments.ownerId, ownerId))
          .orderBy(desc(assesments.assessmentDate))
          .limit(5000)
      ).map(assessmentDto);
    case "transactions":
      return (
        await db
          .select()
          .from(transactions)
          .where(eq(transactions.ownerId, ownerId))
          .orderBy(desc(transactions.transactionDate))
          .limit(5000)
      ).map(transactionDto);
  }
}

export async function saveRow(table: TableName, ownerId: string, raw: unknown, rowId?: string) {
  if (rowId && !id.safeParse(rowId).success) throw new DataError("ID inválido.");
  switch (table) {
    case "students": {
      const { id: requestedId, ...input } = studentFields.parse(raw);
      if (!rowId && !input.name) throw new DataError("Nome é obrigatório.");
      const studentValues = {
        name: input.name,
        birthDate: input.birth_date,
        cpf: input.cpf,
        sex: input.sex,
        phone: input.phone,
        email: input.email,
        heightCm: input.height_cm,
        lessonValue: input.lesson_value,
        packageValue: input.package_value,
        billing: input.billing ? billing[input.billing] : undefined,
        absenceRule: input.absence_rule ? absence[input.absence_rule] : undefined,
        paymentTiming: input.payment_timing ? timing[input.payment_timing] : undefined,
        notes: input.notes,
        active: input.active,
      };
      if (rowId) {
        const [row] = await db
          .update(students)
          .set({ ...studentValues, updatedAt: new Date() })
          .where(and(eq(students.id, rowId), eq(students.ownerId, ownerId)))
          .returning();
        if (!row) throw new DataError("Registro não encontrado.", 404);
        return studentDto(row);
      }
      const [row] = await db
        .insert(students)
        .values({
          ...studentValues,
          name: input.name!,
          ownerId,
          ...(requestedId && { id: requestedId }),
        })
        .returning();
      return studentDto(row!);
    }
    case "lessons": {
      const { id: requestedId, ...input } = lessonFields.parse(raw);
      await ownedStudent(ownerId, input.student_id);
      const values = {
        studentId: input.student_id,
        lessionDate: input.lesson_date,
        startTime: input.start_time,
        endtTime: input.end_time,
        status: input.status ? status[input.status] : undefined,
        perfomance: input.performance ? performance[input.performance] : input.performance,
        muscleGroups: input.muscle_groups,
        value: input.value,
        notes: input.notes,
      };
      if (rowId) {
        const [row] = await db
          .update(lessions)
          .set({ ...values, updatedAt: new Date() })
          .where(and(eq(lessions.id, rowId), eq(lessions.ownerId, ownerId)))
          .returning();
        if (!row) throw new DataError("Registro não encontrado.", 404);
        return lessonDto(row);
      }
      const [row] = await db
        .insert(lessions)
        .values({ ...values, ownerId, ...(requestedId && { id: requestedId }) })
        .returning();
      return lessonDto(row!);
    }
    case "assessments": {
      const { id: requestedId, ...input } = assessmentFields.parse(raw);
      await ownedStudent(ownerId, input.student_id);
      const values = {
        studentId: input.student_id,
        assessmentDate: input.assessment_date,
        heightCm: input.height_cm,
        weightkg: input.weight_kg,
        bodyFat_pct: input.body_fat_pct,
        musclePct: input.muscle_pct,
        bmrKcal: input.bmr_kcal,
        visceralFat: input.visceral_fat,
        waistCm: input.waist_cm,
        hipCm: input.hip_cm,
        chestCm: input.chest_cm,
        armCm: input.arm_cm,
        thighCm: input.thigh_cm,
        notes: input.notes,
      };
      if (rowId) {
        const [row] = await db
          .update(assesments)
          .set({ ...values, updatedAt: new Date() })
          .where(and(eq(assesments.id, rowId), eq(assesments.ownerId, ownerId)))
          .returning();
        if (!row) throw new DataError("Registro não encontrado.", 404);
        return assessmentDto(row);
      }
      const [row] = await db
        .insert(assesments)
        .values({ ...values, ownerId, ...(requestedId && { id: requestedId }) })
        .returning();
      return assessmentDto(row!);
    }
    case "transactions": {
      const { id: requestedId, ...input } = transactionFields.parse(raw);
      await ownedStudent(ownerId, input.student_id);
      if (!rowId && input.amount === undefined) throw new DataError("Valor é obrigatório.");
      const values = {
        kind: input.kind ? kind[input.kind] : undefined,
        studentId: input.student_id,
        transactionDate: input.tx_date,
        competence: input.competence,
        amount: input.amount,
        method: input.method,
        category: input.category,
        description: input.description,
        notes: input.notes,
      };
      if (rowId) {
        const [row] = await db
          .update(transactions)
          .set({ ...values, updatedAt: new Date() })
          .where(and(eq(transactions.id, rowId), eq(transactions.ownerId, ownerId)))
          .returning();
        if (!row) throw new DataError("Registro não encontrado.", 404);
        return transactionDto(row);
      }
      const [row] = await db
        .insert(transactions)
        .values({
          ...values,
          amount: input.amount!,
          ownerId,
          ...(requestedId && { id: requestedId }),
        })
        .returning();
      return transactionDto(row!);
    }
  }
}

export async function deleteRow(table: TableName, ownerId: string, rowId: string) {
  if (!id.safeParse(rowId).success) throw new DataError("ID inválido.");
  let deleted: { id: string }[];
  switch (table) {
    case "students":
      deleted = await db
        .delete(students)
        .where(and(eq(students.id, rowId), eq(students.ownerId, ownerId)))
        .returning({ id: students.id });
      break;
    case "lessons":
      deleted = await db
        .delete(lessions)
        .where(and(eq(lessions.id, rowId), eq(lessions.ownerId, ownerId)))
        .returning({ id: lessions.id });
      break;
    case "assessments":
      deleted = await db
        .delete(assesments)
        .where(and(eq(assesments.id, rowId), eq(assesments.ownerId, ownerId)))
        .returning({ id: assesments.id });
      break;
    case "transactions":
      deleted = await db
        .delete(transactions)
        .where(and(eq(transactions.id, rowId), eq(transactions.ownerId, ownerId)))
        .returning({ id: transactions.id });
      break;
  }
  if (!deleted.length) throw new DataError("Registro não encontrado.", 404);
}
