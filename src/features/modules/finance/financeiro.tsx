"use client";


import { useMemo, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Receipt, TrendingDown } from "lucide-react";

import { lessonsQuery, nameOf, studentNameMap, studentsQuery, transactionsQuery } from "@/lib/data";
import { balance, expectedForMonth, receivedForMonth, sumKind } from "@/lib/metrics";
import { BILLING, money, today } from "@/lib/format";
import { useEditor } from "@/components/editor";
import { TxRow } from "@/components/rows";
import {
  Avatar,
  Card,
  EmptyState,
  MonthSwitcher,
  PageHeader,
  Pill,
  Segmented,
  StatCard,
} from "@/components/ui-kit";
import { Button } from "@/components/ui/button";



function FinancePage() {
  const { data: students } = useSuspenseQuery(studentsQuery);
  const { data: lessons } = useSuspenseQuery(lessonsQuery);
  const { data: txs } = useSuspenseQuery(transactionsQuery);
  const editor = useEditor();
  const [month, setMonth] = useState(today().slice(0, 7));
  const [view, setView] = useState<"lancamentos" | "alunos">("lancamentos");
  const [kind, setKind] = useState<"todos" | "receita" | "despesa">("todos");
  const names = useMemo(() => studentNameMap(students), [students]);

  const monthTx = txs.filter((t) => t.tx_date.startsWith(month));
  const shown = monthTx.filter((t) => kind === "todos" || t.kind === kind);
  const perStudent = students
    .filter((s) => s.active)
    .map((s) => {
      const expected = expectedForMonth(s, lessons, month);
      const received = receivedForMonth(s.id, txs, month);
      return { s, expected, received };
    });
  const toReceive = perStudent.reduce((a, r) => a + Math.max(0, r.expected - r.received), 0);

  return (
    <div>
      <PageHeader
        title="Financeiro"
        subtitle="Receitas, despesas e valores previstos x recebidos"
        actions={
          <>
            <Button onClick={() => editor.open({ type: "transaction", kind: "receita" })}>
              <Receipt /> Recebimento
            </Button>
            <Button
              variant="soft"
              onClick={() => editor.open({ type: "transaction", kind: "despesa" })}
            >
              <TrendingDown /> Despesa
            </Button>
          </>
        }
      />
      <div className="mb-4">
        <MonthSwitcher value={month} onChange={setMonth} />
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Receitas" value={money(sumKind(monthTx, "receita"))} tone="income" />
        <StatCard label="Despesas" value={money(sumKind(monthTx, "despesa"))} tone="expense" />
        <StatCard label="Saldo" value={money(balance(monthTx))} tone="accent" />
        <StatCard
          label="A receber (estimado)"
          value={money(toReceive)}
          note={`${students.filter((s) => s.active && s.billing === "mensal").length} aluno(s) com pacote`}
        />
      </div>
      <Segmented
        className="mb-4"
        value={view}
        onChange={setView}
        options={[
          ["lancamentos", "Lançamentos"],
          ["alunos", "Previsto x recebido"],
        ]}
      />
      {view === "lancamentos" ? (
        <>
          <Segmented
            className="mb-3 md:w-96"
            value={kind}
            onChange={setKind}
            options={[
              ["todos", "Todos"],
              ["receita", "Receitas"],
              ["despesa", "Despesas"],
            ]}
          />
          {shown.length === 0 ? (
            <EmptyState>Nenhum lançamento neste mês.</EmptyState>
          ) : (
            <Card className="py-1 md:py-1">
              <div className="divide-y divide-border">
                {shown.map((t) => (
                  <TxRow
                    key={t.id}
                    tx={t}
                    studentName={t.student_id ? nameOf(names, t.student_id) : null}
                    onClick={() => editor.open({ type: "transaction", row: t })}
                  />
                ))}
              </div>
            </Card>
          )}
        </>
      ) : perStudent.length === 0 ? (
        <EmptyState>Cadastre alunos ativos para acompanhar os valores previstos.</EmptyState>
      ) : (
        <Card className="py-1 md:py-1">
          <p className="py-2 text-xs text-muted-foreground">
            Pacote mensal: valor do pacote. Por aula: aulas realizadas no mês (e faltas, quando a
            regra é “cobrar”). Recebimentos contam pela competência informada.
          </p>
          <ul className="divide-y divide-border">
            {perStudent.map(({ s, expected, received }) => {
              const tone =
                expected === 0
                  ? "neutral"
                  : received >= expected
                    ? "good"
                    : received > 0
                      ? "mid"
                      : "bad";
              const label =
                expected === 0
                  ? "Sem previsão"
                  : received >= expected
                    ? "Pago"
                    : received > 0
                      ? "Parcial"
                      : "Pendente";
              return (
                <li key={s.id} className="flex items-center gap-3 py-3">
                  <Avatar name={s.name} className="size-9 text-xs" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{s.name}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {BILLING[s.billing]} · previsto {money(expected)} · recebido {money(received)}
                    </div>
                  </div>
                  <Pill tone={tone}>{label}</Pill>
                  {received < expected ? (
                    <Button
                      size="sm"
                      variant="soft"
                      onClick={() =>
                        editor.open({ type: "transaction", kind: "receita", studentId: s.id })
                      }
                    >
                      Registrar
                    </Button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}

export default FinancePage;
