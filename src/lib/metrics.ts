/**
 * Pure business rules shared by the dashboard, finance and reports screens.
 * Kept free of React/Supabase so they can be unit-tested.
 */

export interface LessonLike {
  student_id: string | null;
  lesson_date: string;
  status: string;
  value: number | null;
  performance?: string | null;
  muscle_groups?: string[];
}
export interface TxLike {
  kind: string;
  amount: number;
  tx_date: string;
  student_id: string | null;
  competence?: string | null;
}
export interface StudentLike {
  id: string;
  active: boolean;
  billing: string;
  absence_rule: string;
  lesson_value: number | null;
  package_value: number | null;
}

export interface Period {
  from: string; // YYYY-MM-DD inclusive
  to: string; // YYYY-MM-DD inclusive
}

/** Lessons that count as "done": performed or make-up performed. */
export const DONE_STATUSES = ["realizada", "reposta"] as const;

export function isDone(status: string): boolean {
  return (DONE_STATUSES as readonly string[]).includes(status);
}

export function inPeriod(date: string, p: Period): boolean {
  const d = date.slice(0, 10);
  return d >= p.from && d <= p.to;
}

/** Attendance = done / (done + absences). Cancelled and scheduled lessons don't count. */
export function attendanceRate(lessons: LessonLike[]): number | null {
  const done = lessons.filter((l) => isDone(l.status)).length;
  const missed = lessons.filter((l) => l.status === "falta").length;
  const total = done + missed;
  return total === 0 ? null : done / total;
}

export function sumKind(txs: TxLike[], kind: "receita" | "despesa"): number {
  return txs.filter((t) => t.kind === kind).reduce((a, t) => a + Number(t.amount || 0), 0);
}

export function balance(txs: TxLike[]): number {
  return sumKind(txs, "receita") - sumKind(txs, "despesa");
}

/** "MM/AAAA" competence → "YYYY-MM"; falls back to the transaction date month. */
export function txMonth(t: TxLike): string {
  const c = (t.competence || "").trim();
  const m = /^(\d{1,2})\/(\d{4})$/.exec(c);
  if (m && m[1] && m[2]) return `${m[2]}-${m[1].padStart(2, "0")}`;
  return t.tx_date.slice(0, 7);
}

/**
 * Expected amount a student owes for a month:
 * - monthly package: the package value (active students only)
 * - per lesson: each done lesson, plus absences when the rule is "cobrar".
 *   Lesson value falls back to the student's default lesson value.
 */
export function expectedForMonth(
  student: StudentLike,
  lessons: LessonLike[],
  month: string,
): number {
  if (student.billing === "mensal") {
    return student.active ? Number(student.package_value || 0) : 0;
  }
  return lessons
    .filter((l) => l.student_id === student.id && l.lesson_date.startsWith(month))
    .filter((l) => isDone(l.status) || (l.status === "falta" && student.absence_rule === "cobrar"))
    .reduce((a, l) => a + Number(l.value ?? student.lesson_value ?? 0), 0);
}

export function receivedForMonth(studentId: string, txs: TxLike[], month: string): number {
  return txs
    .filter((t) => t.kind === "receita" && t.student_id === studentId && txMonth(t) === month)
    .reduce((a, t) => a + Number(t.amount || 0), 0);
}

/** List of YYYY-MM keys covering a period, oldest first. */
export function monthsInPeriod(p: Period): string[] {
  const out: string[] = [];
  let [y, m] = p.from.slice(0, 7).split("-").map(Number) as [number, number];
  const end = p.to.slice(0, 7);
  for (let guard = 0; guard < 240; guard++) {
    const key = `${y}-${String(m).padStart(2, "0")}`;
    out.push(key);
    if (key >= end) break;
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
}

export function bmi(weightKg: number | null, heightCm: number | null): number | null {
  if (!weightKg || !heightCm) return null;
  const h = heightCm / 100;
  return weightKg / (h * h);
}

/** Performance ratings: Ruim = 1, Médio = 2, Bom = 3. Only done lessons with a rating count. */
export const PERF_SCORE: Record<string, number> = { Ruim: 1, Médio: 2, Bom: 3 };

export function ratedLessons<T extends LessonLike>(lessons: T[]): T[] {
  return lessons.filter(
    (l) => isDone(l.status) && !!l.performance && PERF_SCORE[l.performance] !== undefined,
  );
}

export interface PerfSummary {
  bom: number;
  medio: number;
  ruim: number;
  total: number;
  /** average score 1–3, null when nothing rated */
  avg: number | null;
}

export function performanceSummary(lessons: LessonLike[]): PerfSummary {
  const r = ratedLessons(lessons);
  const bom = r.filter((l) => l.performance === "Bom").length;
  const medio = r.filter((l) => l.performance === "Médio").length;
  const ruim = r.filter((l) => l.performance === "Ruim").length;
  const total = r.length;
  const avg = total
    ? r.reduce((a, l) => a + (PERF_SCORE[l.performance ?? ""] ?? 0), 0) / total
    : null;
  return { bom, medio, ruim, total, avg };
}

export function performanceByMonth(lessons: LessonLike[], months: string[]) {
  return months.map((m) => ({
    month: m,
    ...performanceSummary(lessons.filter((l) => l.lesson_date.startsWith(m))),
  }));
}

export function perfLabel(avg: number | null): string {
  if (avg === null) return "—";
  return avg >= 2.5 ? "Bom" : avg >= 1.75 ? "Médio" : "Ruim";
}
