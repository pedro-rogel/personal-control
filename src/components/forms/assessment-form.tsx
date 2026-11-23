import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";

import { FormSheet } from "@/components/form-sheet";
import { Field, NativeSelect, TextArea, TextInput } from "@/components/ui-kit";
import type { FormProps } from "@/components/forms/student-form";
import { studentsQuery, useSaveRow, type Assessment } from "@/lib/data";
import { num, str, today } from "@/lib/format";

const NUMERIC: Array<[keyof Assessment, string, string]> = [
  ["weight_kg", "Peso (kg)", "0.1"],
  ["body_fat_pct", "Gordura corporal (%)", "0.1"],
  ["muscle_pct", "Músculo (%)", "0.1"],
  ["bmr_kcal", "Gasto calórico basal (kcal)", "1"],
  ["visceral_fat", "Gordura visceral", "0.1"],
];
const MEASURES: Array<[keyof Assessment, string]> = [
  ["waist_cm", "Cintura (cm)"],
  ["hip_cm", "Quadril (cm)"],
  ["chest_cm", "Tórax (cm)"],
  ["arm_cm", "Braço (cm)"],
  ["thigh_cm", "Coxa (cm)"],
];

export function AssessmentForm({
  row,
  studentId,
  ...p
}: FormProps & { row?: Assessment | undefined; studentId?: string | undefined }) {
  const save = useSaveRow("assessments");
  const { data: students = [] } = useQuery(studentsQuery);
  const firstId = row?.student_id ?? studentId ?? students.find((s) => s.active)?.id ?? "";
  const [sid, setSid] = useState(firstId);
  const studentHeight = students.find((s) => s.id === sid)?.height_cm ?? null;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const n = (k: string) => num(f.get(k));
    save.mutate(
      {
        id: row?.id,
        values: {
          student_id: sid || null,
          assessment_date: String(f.get("assessment_date") || today()),
          height_cm: n("height_cm"),
          weight_kg: n("weight_kg"),
          body_fat_pct: n("body_fat_pct"),
          muscle_pct: n("muscle_pct"),
          bmr_kcal: n("bmr_kcal"),
          visceral_fat: n("visceral_fat"),
          waist_cm: n("waist_cm"),
          hip_cm: n("hip_cm"),
          chest_cm: n("chest_cm"),
          arm_cm: n("arm_cm"),
          thigh_cm: n("thigh_cm"),
          notes: str(f.get("notes")),
        },
      },
      { onSuccess: p.onDone },
    );
  }

  const v = (k: keyof Assessment) => {
    const x = row?.[k];
    return x === null || x === undefined ? "" : String(x);
  };

  return (
    <FormSheet
      open={p.open}
      onOpenChange={p.onOpenChange}
      title={row ? "Editar avaliação" : "Nova avaliação física"}
      description="Cada avaliação fica no histórico — as anteriores não são sobrescritas."
      formId="assessment-form"
      saving={save.isPending}
      onDelete={p.onDelete}
    >
      <form
        id="assessment-form"
        onSubmit={onSubmit}
        className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2"
      >
        <Field label="Aluno *" full>
          <NativeSelect
            value={sid}
            required
            onChange={(e) => setSid(e.target.value)}
            options={students
              .filter((s) => s.active || s.id === row?.student_id)
              .map((s) => [s.id, s.name])}
          />
        </Field>
        <Field label="Data da avaliação *">
          <TextInput
            name="assessment_date"
            type="date"
            required
            defaultValue={row?.assessment_date ?? today()}
          />
        </Field>
        <Field label="Altura (cm)">
          <TextInput
            key={sid}
            name="height_cm"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.1"
            defaultValue={row ? v("height_cm") : (studentHeight?.toString() ?? "")}
          />
        </Field>
        {NUMERIC.map(([k, l, step]) => (
          <Field key={k} label={l}>
            <TextInput
              name={k}
              type="number"
              inputMode="decimal"
              min={0}
              step={step}
              defaultValue={v(k)}
            />
          </Field>
        ))}
        <div className="pt-2 text-xs font-bold uppercase tracking-wide text-muted-foreground sm:col-span-2">
          Circunferências (opcional)
        </div>
        {MEASURES.map(([k, l]) => (
          <Field key={k} label={l}>
            <TextInput
              name={k}
              type="number"
              inputMode="decimal"
              min={0}
              step="0.1"
              defaultValue={v(k)}
            />
          </Field>
        ))}
        <Field label="Observações" full>
          <TextArea name="notes" defaultValue={row?.notes ?? ""} />
        </Field>
      </form>
    </FormSheet>
  );
}
