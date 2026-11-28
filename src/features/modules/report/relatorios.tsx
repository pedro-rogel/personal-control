"use client";


import { useMemo, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Printer } from "lucide-react";

import {
  ensureAll,
  assessmentsQuery,
  lessonsQuery,
  nameOf,
  studentNameMap,
  studentsQuery,
  transactionsQuery,
} from "@/lib/data";
import {
  attendanceRate,
  balance,
  inPeriod,
  isDone,
  monthsInPeriod,
  sumKind,
  type Period,
  performanceSummary,
  perfLabel,
} from "@/lib/metrics";
import { PERIOD_LABELS, presetPeriod, type PeriodPreset } from "@/lib/period";
import { dateBR, fmtNum, monthLabel, money } from "@/lib/format";
import { MonthPerformanceChart, PerformanceTrendChart } from "@/components/performance-charts";
import {
  Card,
  CardTitle,
  EmptyState,
  Field,
  NativeSelect,
  PageHeader,
  Pill,
  perfTone,
  StatCard,
  TextInput,
} from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";



const finChart = {
  receitas: { label: "Receitas", color: "var(--income)" },
  despesas: { label: "Despesas", color: "var(--expense)" },
} satisfies ChartConfig;
const evoChart = {
  peso: { label: "Peso (kg)", color: "var(--chart-1)" },
  gordura: { label: "Gordura (%)", color: "var(--chart-2)" },
} satisfies ChartConfig;

function ReportsPage() {
  const { data: students } = useSuspenseQuery(studentsQuery);
  const { data: lessons } = useSuspenseQuery(lessonsQuery);
  const { data: assessments } = useSuspenseQuery(assessmentsQuery);
  const { data: txs } = useSuspenseQuery(transactionsQuery);
  const [preset, setPreset] = useState<PeriodPreset>("mes");
  const [custom, setCustom] = useState<Period>(presetPeriod("mes"));
  const [sid, setSid] = useState("");
  const names = useMemo(() => studentNameMap(students), [students]);

  const period: Period = preset === "custom" ? custom : presetPeriod(preset);
  const pLessons = lessons.filter(
    (l) => inPeriod(l.lesson_date, period) && (!sid || l.student_id === sid),
  );
  const pTx = txs.filter((t) => inPeriod(t.tx_date, period) && (!sid || t.student_id === sid));
  const pAssess = assessments.filter(
    (a) => inPeriod(a.assessment_date, period) && (!sid || a.student_id === sid),
  );
  const rate = attendanceRate(pLessons);

  const months = useMemo(() => {
    if (preset === "tudo") {
      const dates = [...lessons.map((l) => l.lesson_date), ...txs.map((t) => t.tx_date)].sort();
      if (!dates.length) return [];
      return monthsInPeriod({
        from: dates[0] ?? period.from,
        to: dates[dates.length - 1] ?? period.to,
      });
    }
    return monthsInPeriod(period);
  }, [preset, period, lessons, txs]);

  const monthly = months.map((m) => {
    const t = pTx.filter((x) => x.tx_date.startsWith(m));
    return {
      mes: monthLabel(m, "short"),
      receitas: sumKind(t, "receita"),
      despesas: sumKind(t, "despesa"),
    };
  });

  const perStudent = students
    .filter((s) => (sid ? s.id === sid : true))
    .map((s) => {
      const ls = pLessons.filter((l) => l.student_id === s.id);
      const lastA = assessments.find((a) => a.student_id === s.id);
      return {
        s,
        done: ls.filter((l) => isDone(l.status)).length,
        faltas: ls.filter((l) => l.status === "falta").length,
        rate: attendanceRate(ls),
        recebido: pTx
          .filter((t) => t.kind === "receita" && t.student_id === s.id)
          .reduce((a, t) => a + Number(t.amount), 0),
        lastA,
        perf: performanceSummary(ls),
      };
    })
    .filter((r) => r.done + r.faltas > 0 || r.recebido > 0 || r.s.active);

  const groupCount = new Map<string, number>();
  for (const l of pLessons.filter((x) => isDone(x.status)))
    for (const g of l.muscle_groups) groupCount.set(g, (groupCount.get(g) ?? 0) + 1);
  const groupsSorted = [...groupCount.entries()].sort((a, b) => b[1] - a[1]);
  const maxGroup = groupsSorted[0]?.[1] ?? 1;

  const expenseByCat = new Map<string, number>();
  for (const t of pTx.filter((x) => x.kind === "despesa"))
    expenseByCat.set(
      t.category ?? "Outro",
      (expenseByCat.get(t.category ?? "Outro") ?? 0) + Number(t.amount),
    );

  const evo = sid
    ? [...assessments.filter((a) => a.student_id === sid && inPeriod(a.assessment_date, period))]
        .reverse()
        .map((a) => ({
          data: dateBR(a.assessment_date).slice(0, 5),
          peso: a.weight_kg,
          gordura: a.body_fat_pct,
        }))
    : [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Relatórios"
        subtitle={
          preset === "tudo" ? "Todo o período" : `${dateBR(period.from)} a ${dateBR(period.to)}`
        }
        actions={
          <Button variant="soft" onClick={() => window.print()}>
            <Printer /> Imprimir / PDF
          </Button>
        }
      />
      <Card className="no-print">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-4">
          <Field label="Período">
            <NativeSelect
              value={preset}
              onChange={(e) => setPreset(e.target.value as PeriodPreset)}
              options={Object.entries(PERIOD_LABELS) as Array<[PeriodPreset, string]>}
            />
          </Field>
          {preset === "custom" ? (
            <>
              <Field label="De">
                <TextInput
                  type="date"
                  value={custom.from}
                  onChange={(e) => setCustom((c) => ({ ...c, from: e.target.value }))}
                />
              </Field>
              <Field label="Até">
                <TextInput
                  type="date"
                  value={custom.to}
                  onChange={(e) => setCustom((c) => ({ ...c, to: e.target.value }))}
                />
              </Field>
            </>
          ) : null}
          <Field label="Aluno">
            <NativeSelect
              value={sid}
              onChange={(e) => setSid(e.target.value)}
              options={[
                ["", "Todos os alunos"],
                ...students.map((s): [string, string] => [s.id, s.name]),
              ]}
            />
          </Field>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Aulas realizadas"
          value={pLessons.filter((l) => isDone(l.status)).length}
          note={`${pLessons.filter((l) => l.status === "reposta").length} reposição(ões)`}
        />
        <StatCard
          label="Faltas / canceladas"
          value={`${pLessons.filter((l) => l.status === "falta").length} / ${pLessons.filter((l) => l.status === "cancelada").length}`}
        />
        <StatCard
          label="Frequência"
          value={rate === null ? "—" : `${Math.round(rate * 100)}%`}
          tone="accent"
        />
        <StatCard label="Avaliações" value={pAssess.length} />
        <StatCard label="Receitas" value={money(sumKind(pTx, "receita"))} tone="income" />
        <StatCard label="Despesas" value={money(sumKind(pTx, "despesa"))} tone="expense" />
        <StatCard label="Saldo" value={money(balance(pTx))} />
        <StatCard
          label="Ticket médio por aula"
          value={money(
            pLessons.filter((l) => isDone(l.status)).length
              ? sumKind(pTx, "receita") / pLessons.filter((l) => isDone(l.status)).length
              : 0,
          )}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>Receitas x despesas por mês</CardTitle>
          {monthly.length ? (
            <ChartContainer config={finChart} className="aspect-auto h-56 w-full">
              <BarChart data={monthly} margin={{ left: -8, right: 4, top: 4 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  tickFormatter={(v: number) => (v >= 1000 ? `${v / 1000}k` : String(v))}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="receitas" fill="var(--color-receitas)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="despesas" fill="var(--color-despesas)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <p className="text-sm text-muted-foreground">Sem lançamentos no período.</p>
          )}
        </Card>
        <Card>
          <CardTitle>Grupamentos mais trabalhados</CardTitle>
          {groupsSorted.length ? (
            <div className="space-y-2.5">
              {groupsSorted.slice(0, 8).map(([g, n]) => (
                <div key={g} className="flex items-center gap-3 text-sm">
                  <span className="w-32 truncate text-muted-foreground">{g}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(n / maxGroup) * 100}%` }}
                    />
                  </div>
                  <b className="w-6 text-right tabular">{n}</b>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum grupamento registrado no período.
            </p>
          )}
        </Card>
      </div>

      <Card>
        <CardTitle>
          Rendimento nas aulas{sid ? ` — ${nameOf(names, sid)}` : " — todos os alunos"}
        </CardTitle>
        {sid && months.length === 1 && months[0] ? (
          <MonthPerformanceChart lessons={pLessons} month={months[0]} />
        ) : (
          <PerformanceTrendChart lessons={pLessons} months={months} />
        )}
        {!sid ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Escolha um aluno no filtro para ver o rendimento aula a aula.
          </p>
        ) : null}
      </Card>

      {sid ? (
        <Card>
          <CardTitle>Evolução de {nameOf(names, sid)}</CardTitle>
          {evo.length >= 2 ? (
            <ChartContainer config={evoChart} className="aspect-auto h-56 w-full">
              <LineChart data={evo} margin={{ left: -16, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="data" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={40} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  dataKey="peso"
                  stroke="var(--color-peso)"
                  strokeWidth={2.5}
                  dot
                  connectNulls
                />
                <Line
                  dataKey="gordura"
                  stroke="var(--color-gordura)"
                  strokeWidth={2.5}
                  dot
                  connectNulls
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <p className="text-sm text-muted-foreground">
              São necessárias ao menos duas avaliações no período para o gráfico.
            </p>
          )}
        </Card>
      ) : null}

      <Card>
        <CardTitle>Resumo por aluno</CardTitle>
        {perStudent.length ? (
          <div className="-mx-4 overflow-x-auto px-4 md:-mx-5 md:px-5">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-2 font-semibold">Aluno</th>
                  <th className="py-2 pr-2 text-right font-semibold">Aulas</th>
                  <th className="py-2 pr-2 text-right font-semibold">Faltas</th>
                  <th className="py-2 pr-2 text-right font-semibold">Frequência</th>
                  <th className="py-2 pr-2 text-right font-semibold">Rendimento</th>
                  <th className="py-2 pr-2 text-right font-semibold">Recebido</th>
                  <th className="py-2 text-right font-semibold">Último peso</th>
                </tr>
              </thead>
              <tbody>
                {perStudent.map((r) => (
                  <tr key={r.s.id} className="border-b border-border last:border-0">
                    <td className="py-2.5 pr-2 font-semibold">{r.s.name}</td>
                    <td className="py-2.5 pr-2 text-right tabular">{r.done}</td>
                    <td className="py-2.5 pr-2 text-right tabular">{r.faltas}</td>
                    <td className="py-2.5 pr-2 text-right">
                      {r.rate === null ? (
                        "—"
                      ) : (
                        <Pill tone={r.rate >= 0.8 ? "good" : r.rate >= 0.6 ? "mid" : "bad"}>
                          {Math.round(r.rate * 100)}%
                        </Pill>
                      )}
                    </td>
                    <td className="py-2.5 pr-2 text-right">
                      {r.perf.avg === null ? (
                        "—"
                      ) : (
                        <Pill tone={perfTone(perfLabel(r.perf.avg))}>{perfLabel(r.perf.avg)}</Pill>
                      )}
                    </td>
                    <td className="py-2.5 pr-2 text-right tabular">{money(r.recebido)}</td>
                    <td className="py-2.5 text-right text-xs text-muted-foreground">
                      {r.lastA?.weight_kg
                        ? `${fmtNum(r.lastA.weight_kg, " kg")} (${dateBR(r.lastA.assessment_date)})`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState>Cadastre alunos para gerar o relatório.</EmptyState>
        )}
      </Card>

      {expenseByCat.size ? (
        <Card>
          <CardTitle>Despesas por categoria</CardTitle>
          <ul className="divide-y divide-border text-sm">
            {[...expenseByCat.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([c, v]) => (
                <li key={c} className="flex justify-between py-2">
                  <span>{c}</span>
                  <b className="tabular text-expense">{money(v)}</b>
                </li>
              ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}

export default ReportsPage;
