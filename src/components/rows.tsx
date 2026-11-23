import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

import type { Assessment, Lesson, Transaction } from "@/lib/data";
import { LESSON_STATUS, dateBR, dateLong, fmtNum, money, timeShort } from "@/lib/format";
import { Avatar, Pill, perfTone, statusTone } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export function LessonRow({
  lesson,
  studentName,
  onClick,
  showDate = true,
  actions,
}: {
  lesson: Lesson;
  studentName: string;
  onClick?: () => void;
  showDate?: boolean;
  actions?: ReactNode;
}) {
  const time = [timeShort(lesson.start_time), timeShort(lesson.end_time)].filter(Boolean).join("–");
  return (
    <div className="flex items-center gap-3 py-3">
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <Avatar name={studentName} className="size-9 text-xs" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold">{studentName}</span>
          </div>
          <div className="mt-0.5 truncate text-xs text-muted-foreground">
            {[
              showDate ? dateLong(lesson.lesson_date) : null,
              time || null,
              lesson.muscle_groups.join(", ") || null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            <Pill tone={statusTone(lesson.status)}>
              {LESSON_STATUS[lesson.status] ?? lesson.status}
            </Pill>
            {lesson.performance ? (
              <Pill tone={perfTone(lesson.performance)}>{lesson.performance}</Pill>
            ) : null}
          </div>
        </div>
      </button>
      {actions ?? (
        <div className="shrink-0 text-right text-sm font-semibold tabular text-muted-foreground">
          {lesson.value ? money(lesson.value) : ""}
        </div>
      )}
    </div>
  );
}

export function TxRow({
  tx,
  studentName,
  onClick,
}: {
  tx: Transaction;
  studentName: string | null;
  onClick?: () => void;
}) {
  const income = tx.kind === "receita";
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 py-3 text-left"
    >
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold",
          income ? "bg-success-soft text-income" : "bg-danger-soft text-expense",
        )}
      >
        {income ? "+" : "−"}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">
          {income
            ? (studentName ?? tx.category ?? "Receita")
            : (tx.description ?? tx.category ?? "Despesa")}
        </div>
        <div className="mt-0.5 truncate text-xs text-muted-foreground">
          {[
            dateBR(tx.tx_date),
            tx.category,
            tx.method,
            tx.competence ? `Ref. ${tx.competence}` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </div>
      </div>
      <div
        className={cn(
          "shrink-0 text-sm font-bold tabular",
          income ? "text-income" : "text-expense",
        )}
      >
        {income ? "" : "−"}
        {money(tx.amount)}
      </div>
    </button>
  );
}

function Delta({
  cur,
  prev,
  unit,
  invert,
}: {
  cur: number | null;
  prev: number | null;
  unit: string;
  invert?: boolean;
}) {
  if (cur === null || prev === null) return null;
  const d = cur - prev;
  if (Math.abs(d) < 0.05) return <span className="text-[10px] text-muted-foreground">=</span>;
  const good = invert ? d < 0 : d > 0;
  return (
    <span className={cn("text-[10px] font-bold", good ? "text-success" : "text-expense")}>
      {d > 0 ? "+" : "−"}
      {fmtNum(Math.abs(d), unit)}
    </span>
  );
}

export function AssessmentCard({
  a,
  prev,
  studentName,
  onClick,
}: {
  a: Assessment;
  prev?: Assessment | undefined;
  studentName?: string;
  onClick?: () => void;
}) {
  const items: Array<[string, number | null, string, number | null, boolean]> = [
    ["Peso", a.weight_kg, " kg", prev?.weight_kg ?? null, true],
    ["Gordura", a.body_fat_pct, "%", prev?.body_fat_pct ?? null, true],
    ["Músculo", a.muscle_pct, "%", prev?.muscle_pct ?? null, false],
    ["Basal", a.bmr_kcal, " kcal", prev?.bmr_kcal ?? null, false],
    ["Visceral", a.visceral_fat, "", prev?.visceral_fat ?? null, true],
    ["Cintura", a.waist_cm, " cm", prev?.waist_cm ?? null, true],
  ];
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-border bg-card p-4 text-left shadow-card"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          {studentName ? <div className="truncate text-sm font-semibold">{studentName}</div> : null}
          <div className="text-xs text-muted-foreground">{dateBR(a.assessment_date)}</div>
        </div>
        <ChevronRight className="size-4 text-muted-foreground" />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {items.map(([l, v, u, p, inv]) => (
          <div key={l} className="rounded-xl bg-muted px-2.5 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {l}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold tabular">{fmtNum(v, u)}</span>
              <Delta cur={v} prev={p} unit={u} invert={inv} />
            </div>
          </div>
        ))}
      </div>
      {a.notes ? (
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{a.notes}</p>
      ) : null}
    </button>
  );
}
