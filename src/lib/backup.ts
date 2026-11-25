/**
 * Converts backups to rows for the application database.
 * Supports the original Personal Control v1 file (localStorage export:
 * { students, classes, assessments, payments }) and this app's own export (version 2).
 */
import type { TablesInsert } from "@/lib/models";

type Obj = Record<string, unknown>;

export interface ImportRows {
  students: TablesInsert<"students">[];
  lessons: TablesInsert<"lessons">[];
  assessments: TablesInsert<"assessments">[];
  transactions: TablesInsert<"transactions">[];
}

const n = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const x = Number(String(v).replace(",", "."));
  return Number.isFinite(x) ? x : null;
};
const s = (v: unknown): string | null => {
  if (v === null || v === undefined) return null;
  const t = String(v).trim();
  return t === "" ? null : t;
};
const d = (v: unknown): string | null => {
  const t = s(v);
  return t && /^\d{4}-\d{2}-\d{2}/.test(t) ? t.slice(0, 10) : null;
};
const tm = (v: unknown): string | null => {
  const t = s(v);
  return t && /^\d{1,2}:\d{2}/.test(t) ? t : null;
};
const oneOf = (v: unknown, allowed: string[], fallback: string): string => {
  const t = s(v);
  return t && allowed.includes(t) ? t : fallback;
};
const arr = (v: unknown): Obj[] =>
  Array.isArray(v) ? (v.filter((x) => x && typeof x === "object") as Obj[]) : [];

export function parseBackup(
  raw: unknown,
  newId: () => string = () => crypto.randomUUID(),
): ImportRows {
  if (!raw || typeof raw !== "object") throw new Error("Arquivo inválido");
  const b = raw as Obj;
  const isV2 = b["version"] === 2;
  const idMap = new Map<string, string>();
  const mapId = (old: unknown): string | null => {
    const k = s(old);
    return k ? (idMap.get(k) ?? null) : null;
  };

  const students = arr(b["students"]).map((x): TablesInsert<"students"> => {
    const id = newId();
    const old = s(x["id"]);
    if (old) idMap.set(old, id);
    return {
      id,
      name: s(x["name"]) ?? "Sem nome",
      birth_date: d(isV2 ? x["birth_date"] : x["birth"]),
      cpf: s(x["cpf"]),
      sex: s(x["sex"]),
      phone: s(x["phone"]),
      email: s(x["email"]),
      height_cm: n(isV2 ? x["height_cm"] : x["height"]),
      lesson_value: n(isV2 ? x["lesson_value"] : x["hourValue"]),
      package_value: n(isV2 ? x["package_value"] : x["packageValue"]),
      billing: oneOf(x["billing"], ["aula", "mensal"], "mensal"),
      absence_rule: oneOf(
        isV2 ? x["absence_rule"] : x["absence"],
        ["cobrar", "nao_cobrar", "repor"],
        "repor",
      ),
      payment_timing: oneOf(
        isV2 ? x["payment_timing"] : x["paymentTiming"],
        ["antecipado", "fim_mes", "por_aula"],
        "antecipado",
      ),
      notes: s(x["notes"]),
      active: x["active"] !== false,
    };
  });

  const PERF = ["Bom", "Médio", "Ruim"];
  const lessons = arr(isV2 ? b["lessons"] : b["classes"]).map((x): TablesInsert<"lessons"> => {
    const perf = s(x["performance"]);
    const groups = isV2 ? x["muscle_groups"] : x["groups"];
    return {
      student_id: mapId(x["student_id"] ?? x["studentId"]),
      lesson_date: d(isV2 ? x["lesson_date"] : x["date"]) ?? new Date().toISOString().slice(0, 10),
      start_time: tm(isV2 ? x["start_time"] : x["start"]),
      end_time: tm(isV2 ? x["end_time"] : x["end"]),
      status: oneOf(
        x["status"],
        ["realizada", "falta", "cancelada", "reposta", "agendada"],
        "realizada",
      ),
      performance: perf && PERF.includes(perf) ? perf : null,
      muscle_groups: Array.isArray(groups) ? groups.map(String) : [],
      value: n(x["value"]),
      notes: s(x["notes"]),
    };
  });

  const assessments = arr(b["assessments"]).map((x): TablesInsert<"assessments"> => ({
    student_id: mapId(x["student_id"] ?? x["studentId"]),
    assessment_date:
      d(isV2 ? x["assessment_date"] : x["date"]) ?? new Date().toISOString().slice(0, 10),
    height_cm: n(isV2 ? x["height_cm"] : x["height"]),
    weight_kg: n(isV2 ? x["weight_kg"] : x["weight"]),
    body_fat_pct: n(isV2 ? x["body_fat_pct"] : x["fat"]),
    muscle_pct: n(isV2 ? x["muscle_pct"] : x["muscle"]),
    bmr_kcal: n(isV2 ? x["bmr_kcal"] : x["bmr"]),
    visceral_fat: n(isV2 ? x["visceral_fat"] : x["visceral"]),
    waist_cm: n(x["waist_cm"]),
    hip_cm: n(x["hip_cm"]),
    chest_cm: n(x["chest_cm"]),
    arm_cm: n(x["arm_cm"]),
    thigh_cm: n(x["thigh_cm"]),
    notes: s(x["notes"]),
  }));

  const transactions = arr(isV2 ? b["transactions"] : b["payments"])
    .map((x): TablesInsert<"transactions"> => ({
      kind: isV2 ? oneOf(x["kind"], ["receita", "despesa"], "receita") : "receita",
      student_id: mapId(x["student_id"] ?? x["studentId"]),
      tx_date: d(isV2 ? x["tx_date"] : x["date"]) ?? new Date().toISOString().slice(0, 10),
      competence: s(x["competence"]),
      amount: n(x["amount"]) ?? 0,
      method: s(x["method"]),
      category: isV2 ? s(x["category"]) : "Mensalidade",
      description: s(x["description"]),
      notes: s(x["notes"]),
    }))
    .filter((t) => t.amount > 0);

  return { students, lessons, assessments, transactions };
}

const STRIP = ["owner_id", "created_at", "updated_at"];
export function toExport(
  data: Record<"students" | "lessons" | "assessments" | "transactions", object[]>,
) {
  const clean = (rows: object[]) =>
    rows.map((r) => Object.fromEntries(Object.entries(r).filter(([k]) => !STRIP.includes(k))));
  return {
    version: 2,
    exported_at: new Date().toISOString(),
    students: clean(data.students),
    lessons: clean(data.lessons),
    assessments: clean(data.assessments),
    transactions: clean(data.transactions),
  };
}
