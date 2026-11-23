import { useState, type FormEvent } from "react";

import { FormSheet } from "@/components/form-sheet";
import { Field, NativeSelect, TextArea, TextInput } from "@/components/ui-kit";
import { useSaveRow, type Student } from "@/lib/data";
import { CPF_HINT, cpfIssue } from "@/lib/cpf";
import { ABSENCE, BILLING, TIMING, num, str } from "@/lib/format";

export interface FormProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onDone: () => void;
  onDelete?: (() => void) | undefined;
}

export function StudentForm({ row, ...p }: FormProps & { row?: Student | undefined }) {
  const save = useSaveRow("students");
  const s = row;
  const [cpfError, setCpfError] = useState<string | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = str(f.get("name"));
    if (!name) return;
    const cpf = str(f.get("cpf"));
    const issue = cpfIssue(cpf);
    if (issue) {
      setCpfError(issue);
      return;
    }
    setCpfError(null);
    save.mutate(
      {
        id: s?.id,
        values: {
          name,
          birth_date: str(f.get("birth_date")),
          cpf: str(f.get("cpf")),
          sex: str(f.get("sex")),
          phone: str(f.get("phone")),
          email: str(f.get("email")),
          height_cm: num(f.get("height_cm")),
          lesson_value: num(f.get("lesson_value")),
          package_value: num(f.get("package_value")),
          billing: String(f.get("billing") || "mensal"),
          absence_rule: String(f.get("absence_rule") || "repor"),
          payment_timing: String(f.get("payment_timing") || "antecipado"),
          notes: str(f.get("notes")),
          active: s ? s.active : true,
        },
      },
      { onSuccess: p.onDone },
    );
  }

  return (
    <FormSheet
      open={p.open}
      onOpenChange={p.onOpenChange}
      title={s ? "Editar aluno" : "Novo aluno"}
      description="Dados pessoais ficam protegidos e visíveis só para você."
      formId="student-form"
      saving={save.isPending}
      onDelete={p.onDelete}
    >
      <form
        id="student-form"
        onSubmit={onSubmit}
        className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2"
      >
        <Field label="Nome completo *" full>
          <TextInput
            name="name"
            required
            maxLength={200}
            defaultValue={s?.name ?? ""}
            autoComplete="off"
          />
        </Field>
        <Field label="Telefone / WhatsApp">
          <TextInput name="phone" type="tel" inputMode="tel" defaultValue={s?.phone ?? ""} />
        </Field>
        <Field label="E-mail">
          <TextInput name="email" type="email" inputMode="email" defaultValue={s?.email ?? ""} />
        </Field>
        <Field label="Data de nascimento">
          <TextInput name="birth_date" type="date" defaultValue={s?.birth_date ?? ""} />
        </Field>
        <Field label="CPF" hint={CPF_HINT} error={cpfError}>
          <TextInput
            name="cpf"
            inputMode="numeric"
            maxLength={18}
            placeholder="Somente números ou formatado"
            defaultValue={s?.cpf ?? ""}
            aria-invalid={cpfError ? true : undefined}
            onChange={() => setCpfError(null)}
          />
        </Field>
        <Field label="Sexo">
          <NativeSelect
            name="sex"
            defaultValue={s?.sex ?? ""}
            options={[
              ["", "Não informado"],
              ["Feminino", "Feminino"],
              ["Masculino", "Masculino"],
              ["Outro", "Outro"],
            ]}
          />
        </Field>
        <Field label="Altura (cm)">
          <TextInput
            name="height_cm"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.1"
            defaultValue={s?.height_cm ?? ""}
          />
        </Field>
        <Field label="Modelo de cobrança">
          <NativeSelect
            name="billing"
            defaultValue={s?.billing ?? "mensal"}
            options={Object.entries(BILLING)}
          />
        </Field>
        <Field label="Valor por aula (R$)">
          <TextInput
            name="lesson_value"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            defaultValue={s?.lesson_value ?? ""}
          />
        </Field>
        <Field label="Valor do pacote mensal (R$)">
          <TextInput
            name="package_value"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            defaultValue={s?.package_value ?? ""}
          />
        </Field>
        <Field label="Regra para faltas">
          <NativeSelect
            name="absence_rule"
            defaultValue={s?.absence_rule ?? "repor"}
            options={Object.entries(ABSENCE)}
          />
        </Field>
        <Field label="Momento do pagamento">
          <NativeSelect
            name="payment_timing"
            defaultValue={s?.payment_timing ?? "antecipado"}
            options={Object.entries(TIMING)}
          />
        </Field>
        <Field label="Observações" full>
          <TextArea
            name="notes"
            defaultValue={s?.notes ?? ""}
            placeholder="Objetivos, restrições, histórico de lesões…"
          />
        </Field>
      </form>
    </FormSheet>
  );
}
