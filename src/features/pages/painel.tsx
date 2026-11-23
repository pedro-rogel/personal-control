"use client";

import { Link } from "@/components/app-link";
import { useAuthUser } from "@/components/auth-guard";
import { useMemo } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  CalendarCheck,
  Check,
  HeartPulse,
  Percent,
  Plus,
  TrendingUp,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import {
  ensureAll,
  assessmentsQuery,
  lessonsQuery,
  nameOf,
  studentNameMap,
  studentsQuery,
  transactionsQuery,
  useSaveRow,
} from "@/lib/data";
import {
  attendanceRate,
  balance,
  expectedForMonth,
  isDone,
  receivedForMonth,
  sumKind,
  txMonth,
} from "@/lib/metrics";
import { monthLabel, money, shiftMonth, toISODate, today } from "@/lib/format";
import { useEditor } from "@/components/editor";
import { LessonRow } from "@/components/rows";
import { Card, CardTitle, EmptyState, PageHeader, StatCard } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";



const financeChart = {
  receitas: { label: "Receitas", color: "var(--income)" },
  despesas: { label: "Despesas", color: "var(--expense)" },
} satisfies ChartConfig;
const lessonsChart = {
  aulas: { label: "Aulas realizadas", color: "var(--chart-1)" },
} satisfies ChartConfig;

function startOfWeek(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (x.getDay() + 6) % 7; // Monday = 0
  x.setDate(x.getDate() - day);
  return x;
}

function Dashboard() {
  const { data: students } = useSuspenseQuery(studentsQuery);
  const { data: lessons } = useSuspenseQuery(lessonsQuery);
  const { data: assessments } = useSuspenseQuery(assessmentsQuery);
  const { data: txs } = useSuspenseQuery(transactionsQuery);
  const editor = useEditor();
  const saveLesson = useSaveRow("lessons");
  const { user } = useAuthUser();

  const names = useMemo(() => studentNameMap(students), [students]);
  const now = today();
  const month = now.slice(0, 7);
  const active = students.filter((s) => s.active);
  const monthLessons = lessons.filter((l) => l.lesson_date.startsWith(month));
  const monthDone = monthLessons.filter((l) => isDone(l.status));
  const monthTx = txs.filter((t) => t.tx_date.startsWith(month));
  const rate = attendanceRate(monthLessons);

  const toReceive = active.reduce((acc, s) => {
    const diff = expectedForMonth(s, lessons, month) - receivedForMonth(s.id, txs, month);
    return acc + (diff > 0 ? diff : 0);
  }, 0);

  const financeData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => shiftMonth(month, i - 5)).map((m) => {
      const t = txs.filter((x) => x.tx_date.startsWith(m));
      return {
        mes: monthLabel(m, "short"),
        receitas: sumKind(t, "receita"),
        despesas: sumKind(t, "despesa"),
      };
    });
  }, [txs, month]);

  const weekData = useMemo(() => {
    const base = startOfWeek(new Date());
    return Array.from({ length: 8 }, (_, i) => {
      const s = new Date(base);
      s.setDate(s.getDate() - (7 - i) * 7);
      const e = new Date(s);
      e.setDate(e.getDate() + 6);
      const from = toISODate(s);
      const to = toISODate(e);
      return {
        semana: `${String(s.getDate()).padStart(2, "0")}/${String(s.getMonth() + 1).padStart(2, "0")}`,
        aulas: lessons.filter(
          (l) => isDone(l.status) && l.lesson_date >= from && l.lesson_date <= to,
        ).length,
      };
    });
  }, [lessons]);

  const rated = monthDone.filter((l) => l.performance);
  const perf = (["Bom", "Médio", "Ruim"] as const).map(
    (k) => [k, rated.filter((l) => l.performance === k).length] as const,
  );

  const upcoming = lessons
    .filter((l) => l.status === "agendada" && l.lesson_date >= now)
    .sort((a, b) =>
      (a.lesson_date + (a.start_time ?? "")).localeCompare(b.lesson_date + (b.start_time ?? "")),
    )
    .slice(0, 5);
  const overdue = lessons.filter((l) => l.status === "agendada" && l.lesson_date < now).length;
  const recent = lessons.filter((l) => l.status !== "agendada").slice(0, 6);

  const firstName = String(user.user_metadata?.["full_name"] ?? "").split(" ")[0];
  const hello =
    new Date().getHours() < 12 ? "Bom dia" : new Date().getHours() < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="space-y-5">
      <PageHeader
        title={firstName ? `${hello}, ${firstName}` : hello}
        subtitle={`Resumo de ${monthLabel(month).toLowerCase()}`}
        actions={
          <>
            <Button onClick={() => editor.open({ type: "lesson" })}>
              <CalendarCheck /> Registrar aula
            </Button>
            <Button variant="soft" onClick={() => editor.open({ type: "student" })}>
              <UserPlus /> Novo aluno
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Alunos ativos"
          value={active.length}
          note="Cadastros ativos"
          icon={<Users />}
        />
        <StatCard
          label="Aulas no mês"
          value={monthDone.length}
          note="Inclui reposições realizadas"
          icon={<CalendarCheck />}
        />
        <StatCard
          label="Frequência no mês"
          value={rate === null ? "—" : `${Math.round(rate * 100)}%`}
          note={`${monthLessons.filter((l) => l.status === "falta").length} falta(s)`}
          icon={<Percent />}
        />
        <StatCard
          label="Avaliações físicas"
          value={assessments.length}
          note="Histórico acumulado"
          icon={<HeartPulse />}
        />
        <StatCard
          label="Recebido no mês"
          value={money(sumKind(monthTx, "receita"))}
          tone="income"
        />
        <StatCard
          label="Despesas no mês"
          value={money(sumKind(monthTx, "despesa"))}
          tone="expense"
        />
        <StatCard
          label="Saldo do mês"
          value={money(balance(monthTx))}
          tone="accent"
          icon={<TrendingUp />}
        />
        <StatCard
          label="A receber (estimado)"
          value={money(toReceive)}
          note="Previsto − recebido dos alunos"
        />
      </div>

      {upcoming.length > 0 || overdue > 0 ? (
        <Card>
          <CardTitle
            action={
              <Link to="/aulas" className="text-xs font-semibold text-primary">
                Ver aulas
              </Link>
            }
          >
            Próximas aulas
          </CardTitle>
          {overdue > 0 ? (
            <p className="mb-2 rounded-xl bg-warning-soft px-3 py-2 text-xs font-semibold text-warning">
              {overdue} aula(s) agendada(s) já passaram sem registro de presença.
            </p>
          ) : null}
          <div className="divide-y divide-border">
            {upcoming.map((l) => (
              <LessonRow
                key={l.id}
                lesson={l}
                studentName={nameOf(names, l.student_id)}
                onClick={() => editor.open({ type: "lesson", row: l })}
                actions={
                  <div className="flex shrink-0 gap-1.5">
                    <Button
                      size="icon"
                      variant="soft"
                      aria-label="Marcar presença"
                      onClick={() =>
                        saveLesson.mutate({ id: l.id, values: { status: "realizada" } })
                      }
                    >
                      <Check />
                    </Button>
                    <Button
                      size="icon"
                      variant="danger"
                      aria-label="Marcar falta"
                      onClick={() => saveLesson.mutate({ id: l.id, values: { status: "falta" } })}
                    >
                      <X />
                    </Button>
                  </div>
                }
              />
            ))}
          </div>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>Receitas x despesas (6 meses)</CardTitle>
          {financeData.some((point) => point.receitas !== 0 || point.despesas !== 0) ? (
            <ChartContainer config={financeChart} className="aspect-auto h-56 w-full">
              <BarChart data={financeData} margin={{ left: -8, right: 4, top: 4 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  tickFormatter={(v: number) => (v >= 1000 ? `${v / 1000}k` : String(v))}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(v, n) =>
                        `${financeChart[n as keyof typeof financeChart]?.label ?? n}: ${money(Number(v))}`
                      }
                    />
                  }
                />
                <Bar dataKey="receitas" fill="var(--color-receitas)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="despesas" fill="var(--color-despesas)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex h-56 flex-col items-center justify-center gap-4 text-center">
              <TrendingUp className="size-9 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">Sem dados ainda</p>
              <Button
                size="sm"
                onClick={() => editor.open({ type: "transaction", kind: "receita" })}
              >
                <Plus /> Registrar primeiro lançamento
              </Button>
            </div>
          )}
        </Card>
        <Card>
          <CardTitle>Aulas realizadas por semana</CardTitle>
          {weekData.some((point) => point.aulas > 0) ? (
            <ChartContainer config={lessonsChart} className="aspect-auto h-56 w-full">
              <BarChart data={weekData} margin={{ left: -20, right: 4, top: 4 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="semana" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={40} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="aulas" fill="var(--color-aulas)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex h-56 flex-col items-center justify-center gap-4 text-center">
              <CalendarCheck className="size-9 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">Sem dados ainda</p>
              <Button size="sm" onClick={() => editor.open({ type: "lesson" })}>
                <Plus /> Registrar primeira aula
              </Button>
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardTitle
            action={
              <Link to="/aulas" className="text-xs font-semibold text-primary">
                Ver todas
              </Link>
            }
          >
            Últimas aulas
          </CardTitle>
          {recent.length ? (
            <div className="divide-y divide-border">
              {recent.map((l) => (
                <LessonRow
                  key={l.id}
                  lesson={l}
                  studentName={nameOf(names, l.student_id)}
                  onClick={() => editor.open({ type: "lesson", row: l })}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              action={
                <Button size="sm" onClick={() => editor.open({ type: "lesson" })}>
                  Registrar aula
                </Button>
              }
            >
              Registre sua primeira aula para ver o resumo.
            </EmptyState>
          )}
        </Card>
        <Card>
          <CardTitle>Desempenho nas aulas do mês</CardTitle>
          {rated.length ? (
            <div className="space-y-3">
              {perf.map(([k, n]) => (
                <div key={k} className="flex items-center gap-3 text-sm">
                  <span className="w-14 text-muted-foreground">{k}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={
                        k === "Bom"
                          ? "h-full rounded-full bg-success"
                          : k === "Médio"
                            ? "h-full rounded-full bg-warning"
                            : "h-full rounded-full bg-expense"
                      }
                      style={{ width: `${(n / rated.length) * 100}%` }}
                    />
                  </div>
                  <b className="w-6 text-right tabular">{n}</b>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Ainda não há avaliações de rendimento neste mês.
            </p>
          )}
          <div className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
            Recebimentos com competência de {monthLabel(month).toLowerCase()}:{" "}
            <b className="text-foreground">
              {money(
                txs
                  .filter((t) => t.kind === "receita" && txMonth(t) === month)
                  .reduce((a, t) => a + Number(t.amount), 0),
              )}
            </b>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
