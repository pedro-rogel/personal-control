import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";

import { FormSheet } from "@/components/form-sheet";
import { Field, NativeSelect, TextArea, TextInput } from "@/components/ui-kit";
import type { FormProps } from "@/components/forms/student-form";
import { studentsQuery, useSaveRow, type Lesson } from "@/lib/data";
import { LESSON_STATUS, MUSCLE_GROUPS, num, str, today } from "@/lib/format";
import { cn } from "@/lib/utils";

export function LessonForm({
  row,
  studentId,
  ...p
}: FormProps & { row?: Lesson | undefined; studentId?: string | undefined }) {
  const save = useSaveRow("lessons");
  const { data: students = [] } = useQuery(studentsQuery);
  const options = students.filter((s) => s.active || s.id === row?.student_id);
  const firstId = row?.student_id ?? studentId ?? options[0]?.id ?? "";
  const [sid, setSid] = useState(firstId);
  const defaultValue = (id: string) => students.find((s) => s.id === id)?.lesson_value ?? null;
  const [value, setValue] = useState<string>(
    row ? (row.value?.toString() ?? "") : (defaultValue(firstId)?.toString() ?? ""),
  );
  const [groups, setGroups] = useState<string[]>(row?.muscle_groups ?? []);
  const [status, setStatus] = useState(row?.status ?? "realizada");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    save.mutate(
      {
        id: row?.id,
        values: {
          student_id: sid || null,
          lesson_date: String(f.get("lesson_date") || today()),
          start_time: str(f.get("start_time")),
          end_time: str(f.get("end_time")),
          status,
          performance: str(f.get("performance")),
          muscle_groups: groups,
          value: num(value),
          notes: str(f.get("notes")),
        },
      },
      { onSuccess: p.onDone },
    );
  }

  return (
    <FormSheet
      open={p.open}
      onOpenChange={p.onOpenChange}
      title={row ? "Editar aula" : "Registrar aula"}
      description="Presença, rendimento e grupamentos trabalhados."
      formId="lesson-form"
      saving={save.isPending}
      onDelete={p.onDelete}
    >
      <form
        id="lesson-form"
        onSubmit={onSubmit}
        className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2"
      >
        <Field label="Aluno *" full>
          <NativeSelect
            value={sid}
            required
            onChange={(e) => {
              setSid(e.target.value);
              if (!row) setValue(defaultValue(e.target.value)?.toString() ?? "");
            }}
            options={options.map((s) => [s.id, s.name])}
          />
        </Field>
        <Field label="Status" full>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
            {Object.entries(LESSON_STATUS).map(([k, l]) => (
              <button
                key={k}
                type="button"
                onClick={() => setStatus(k)}
                className={cn(
                  "h-10 rounded-xl border px-2 text-xs font-semibold transition",
                  status === k
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-card text-secondary-foreground",
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Data da aula *" full>
          <TextInput
            name="lesson_date"
            type="date"
            required
            defaultValue={row?.lesson_date ?? today()}
          />
        </Field>
        <Field label="Início">
          <TextInput
            name="start_time"
            type="time"
            defaultValue={row?.start_time?.slice(0, 5) ?? ""}
          />
        </Field>
        <Field label="Término">
          <TextInput name="end_time" type="time" defaultValue={row?.end_time?.slice(0, 5) ?? ""} />
        </Field>
        <Field label="Rendimento">
          <NativeSelect
            name="performance"
            defaultValue={row?.performance ?? ""}
            options={[
              ["", "Não avaliado"],
              ["Bom", "Bom"],
              ["Médio", "Médio"],
              ["Ruim", "Ruim"],
            ]}
          />
        </Field>
        <Field label="Valor da aula (R$)">
          <TextInput
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </Field>
        <Field label="Grupamentos trabalhados" full>
          <div className="flex flex-wrap gap-1.5">
            {MUSCLE_GROUPS.map((g) => {
              const on = groups.includes(g);
              return (
                <button
                  key={g}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    setGroups((cur) => (on ? cur.filter((x) => x !== g) : [...cur, g]))
                  }
                  className={cn(
                    "inline-flex h-9 items-center gap-1 rounded-full border px-3 text-xs font-semibold transition",
                    on
                      ? "border-transparent bg-accent text-accent-foreground"
                      : "border-input bg-card text-muted-foreground",
                  )}
                >
                  {on ? <Check className="size-3.5" /> : null}
                  {g}
                </button>
              );
            })}
          </div>
        </Field>
        <Field label="Observações" full>
          <TextArea name="notes" defaultValue={row?.notes ?? ""} />
        </Field>
      </form>
    </FormSheet>
  );
}
