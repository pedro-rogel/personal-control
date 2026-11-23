import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";

import { FormSheet } from "@/components/form-sheet";
import { Field, NativeSelect, Segmented, TextArea, TextInput } from "@/components/ui-kit";
import type { FormProps } from "@/components/forms/student-form";
import { studentsQuery, useSaveRow, type Transaction } from "@/lib/data";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
  num,
  str,
  today,
} from "@/lib/format";

export function TransactionForm({
  row,
  studentId,
  kind: kindProp,
  ...p
}: FormProps & {
  row?: Transaction | undefined;
  studentId?: string | undefined;
  kind?: "receita" | "despesa" | undefined;
}) {
  const save = useSaveRow("transactions");
  const { data: students = [] } = useQuery(studentsQuery);
  const [kind, setKind] = useState<"receita" | "despesa">(
    (row?.kind as "receita" | "despesa" | undefined) ?? kindProp ?? "receita",
  );
  const now = today();
  const defaultCompetence = `${now.slice(5, 7)}/${now.slice(0, 4)}`;
  const studentOptions: Array<[string, string]> = [
    ["", "Sem aluno"],
    ...students
      .filter((s) => s.active || s.id === row?.student_id)
      .map((s): [string, string] => [s.id, s.name]),
  ];
  const categories = kind === "receita" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const amount = num(f.get("amount"));
    if (!amount || amount <= 0) return;
    save.mutate(
      {
        id: row?.id,
        values: {
          kind,
          student_id: kind === "receita" ? str(f.get("student_id")) : null,
          tx_date: String(f.get("tx_date") || today()),
          competence: str(f.get("competence")),
          amount,
          method: str(f.get("method")),
          category: str(f.get("category")),
          description: str(f.get("description")),
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
      title={
        row
          ? "Editar lançamento"
          : kind === "receita"
            ? "Registrar recebimento"
            : "Registrar despesa"
      }
      formId="tx-form"
      saving={save.isPending}
      onDelete={p.onDelete}
    >
      <form
        id="tx-form"
        onSubmit={onSubmit}
        className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <Segmented
            value={kind}
            onChange={setKind}
            options={[
              ["receita", "Receita"],
              ["despesa", "Despesa"],
            ]}
          />
        </div>
        <Field label="Valor (R$) *">
          <TextInput
            name="amount"
            type="number"
            inputMode="decimal"
            required
            min="0.01"
            step="0.01"
            defaultValue={row?.amount ?? ""}
          />
        </Field>
        <Field label={kind === "receita" ? "Data do recebimento *" : "Data da despesa *"}>
          <TextInput name="tx_date" type="date" required defaultValue={row?.tx_date ?? today()} />
        </Field>
        {kind === "receita" ? (
          <>
            <Field label="Aluno">
              <NativeSelect
                name="student_id"
                defaultValue={row?.student_id ?? studentId ?? ""}
                options={studentOptions}
              />
            </Field>
            <Field label="Competência" hint="Mês de referência, ex.: 11/2026">
              <TextInput
                name="competence"
                placeholder="MM/AAAA"
                inputMode="numeric"
                pattern="\d{1,2}/\d{4}"
                defaultValue={row?.competence ?? (row ? "" : defaultCompetence)}
              />
            </Field>
          </>
        ) : (
          <Field label="Descrição" full>
            <TextInput
              name="description"
              defaultValue={row?.description ?? ""}
              placeholder="Ex.: combustível, aluguel de espaço"
            />
          </Field>
        )}
        <Field label="Categoria">
          <NativeSelect
            key={kind}
            name="category"
            defaultValue={row?.category ?? categories[0]}
            options={categories.map((c): [string, string] => [c, c])}
          />
        </Field>
        <Field label="Forma de pagamento">
          <NativeSelect
            name="method"
            defaultValue={row?.method ?? "Pix"}
            options={PAYMENT_METHODS.map((m): [string, string] => [m, m])}
          />
        </Field>
        <Field label="Observações" full>
          <TextArea name="notes" defaultValue={row?.notes ?? ""} />
        </Field>
      </form>
    </FormSheet>
  );
}
