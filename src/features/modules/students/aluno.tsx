"use client";

import { Link } from "@/components/app-link";
import { useNavigate } from "@/hooks/use-navigate";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  CalendarCheck,
  HeartPulse,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  Receipt,
  Trash2,
} from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  ensureAll,
  assessmentsQuery,
  lessonsQuery,
  studentsQuery,
  transactionsQuery,
  useSaveRow,
} from "@/lib/data";
import { attendanceRate, bmi, expectedForMonth, isDone, receivedForMonth } from "@/lib/metrics";
import {
  ABSENCE,
  BILLING,
  TIMING,
  age,
  dateBR,
  fmtNum,
  money,
  shiftMonth,
  today,
} from "@/lib/format";
import { MonthPerformanceChart, PerformanceTrendChart } from "@/components/performance-charts";
import { useEditor } from "@/components/editor";
import { AssessmentCard, LessonRow, TxRow } from "@/components/rows";
import {
  Avatar,
  Card,
  CardTitle,
  EmptyState,
  MonthSwitcher,
  Pill,
  Segmented,
  StatCard,
} from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";



const evoChart = {
  peso: { label: "Peso (kg)", color: "var(--chart-1)" },
  gordura: { label: "Gordura (%)", color: "var(--chart-2)" },
  musculo: { label: "Músculo (%)", color: "var(--chart-3)" },
} satisfies ChartConfig;

function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: students } = useSuspenseQuery(studentsQuery);
  const { data: allLessons } = useSuspenseQuery(lessonsQuery);
  const { data: allAssessments } = useSuspenseQuery(assessmentsQuery);
  const { data: allTx } = useSuspenseQuery(transactionsQuery);
  const editor = useEditor();
  const save = useSaveRow("students");
  const [tab, setTab] = useState<"aulas" | "rendimento" | "avaliacoes" | "financeiro" | "dados">(
    "aulas",
  );
  const [perfMonth, setPerfMonth] = useState(today().slice(0, 7));

  const s = students.find((x) => x.id === id);
  const lessons = useMemo(() => allLessons.filter((l) => l.student_id === id), [allLessons, id]);
  const assessments = useMemo(
    () => allAssessments.filter((a) => a.student_id === id),
    [allAssessments, id],
  );
  const txs = useMemo(() => allTx.filter((t) => t.student_id === id), [allTx, id]);

  if (!s) {
    return <EmptyState>Aluno não encontrado.</EmptyState>;
  }

  const month = today().slice(0, 7);
  const expected = expectedForMonth(s, allLessons, month);
  const received = receivedForMonth(s.id, allTx, month);
  const rate = attendanceRate(lessons);
  const last = assessments[0];
  const years = age(s.birth_date);
  const evo = [...assessments].reverse().map((a) => ({
    data: dateBR(a.assessment_date).slice(0, 5),
    peso: a.weight_kg,
    gordura: a.body_fat_pct,
    musculo: a.muscle_pct,
  }));
  const phoneDigits = (s.phone ?? "").replace(/\D/g, "");

  return (
    <div className="space-y-4">
      <Link
        to="/alunos"
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
      >
        <ArrowLeft className="size-4" /> Alunos
      </Link>

      <Card className="bg-gradient-mint border-transparent">
        <div className="flex items-start gap-4">
          <Avatar name={s.name} className="size-14 bg-card text-lg" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold md:text-2xl">{s.name}</h1>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {!s.active ? <Pill>Arquivado</Pill> : <Pill tone="good">Ativo</Pill>}
              <Pill tone="accent">{BILLING[s.billing]}</Pill>
              {years !== null ? <Pill>{years} anos</Pill> : null}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {phoneDigits ? (
                <>
                  <Button asChild size="sm" variant="secondary">
                    <a href={`tel:${phoneDigits}`}>
                      <Phone /> Ligar
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="secondary">
                    <a
                      href={`https://wa.me/${phoneDigits.length <= 11 ? `55${phoneDigits}` : phoneDigits}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle /> WhatsApp
                    </a>
                  </Button>
                </>
              ) : null}
              {s.email ? (
                <Button asChild size="sm" variant="secondary">
                  <a href={`mailto:${s.email}`}>
                    <Mail /> E-mail
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border/60 pt-4">
          <Button size="sm" onClick={() => editor.open({ type: "student", row: s })}>
            <Pencil /> Editar
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => save.mutate({ id: s.id, values: { name: s.name, active: !s.active } })}
          >
            {s.active ? <Archive /> : <ArchiveRestore />} {s.active ? "Arquivar" : "Reativar"}
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() =>
              editor.confirmDelete("student", s.id, () => void navigate({ to: "/alunos" }))
            }
          >
            <Trash2 /> Excluir
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Aulas realizadas"
          value={lessons.filter((l) => isDone(l.status)).length}
          note={`${lessons.filter((l) => l.status === "falta").length} falta(s)`}
        />
        <StatCard
          label="Frequência"
          value={rate === null ? "—" : `${Math.round(rate * 100)}%`}
          note="Realizadas ÷ (realizadas + faltas)"
        />
        <StatCard
          label="Previsto no mês"
          value={money(expected)}
          note={`Recebido ${money(received)}`}
          tone={received >= expected ? "income" : "default"}
        />
        <StatCard
          label="Último peso"
          value={fmtNum(last?.weight_kg, " kg")}
          note={last ? dateBR(last.assessment_date) : "Sem avaliação"}
        />
      </div>

      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          ["aulas", "Aulas"],
          ["rendimento", "Rendimento"],
          ["avaliacoes", "Avaliações"],
          ["financeiro", "Pagamentos"],
          ["dados", "Dados"],
        ]}
      />

      {tab === "aulas" ? (
        <Card>
          <CardTitle
            action={
              <Button size="sm" onClick={() => editor.open({ type: "lesson", studentId: s.id })}>
                <CalendarCheck /> Registrar
              </Button>
            }
          >
            Histórico de aulas
          </CardTitle>
          {lessons.length ? (
            <div className="divide-y divide-border">
              {lessons.map((l) => (
                <LessonRow
                  key={l.id}
                  lesson={l}
                  studentName={s.name}
                  onClick={() => editor.open({ type: "lesson", row: l })}
                />
              ))}
            </div>
          ) : (
            <EmptyState>Nenhuma aula registrada.</EmptyState>
          )}
        </Card>
      ) : null}

      {tab === "rendimento" ? (
        <div className="space-y-3">
          <Card>
            <CardTitle>Rendimento nos treinos do mês</CardTitle>
            <div className="mb-3">
              <MonthSwitcher value={perfMonth} onChange={setPerfMonth} />
            </div>
            <MonthPerformanceChart lessons={lessons} month={perfMonth} />
          </Card>
          <Card>
            <CardTitle>Evolução do rendimento (6 meses)</CardTitle>
            <PerformanceTrendChart
              lessons={lessons}
              months={Array.from({ length: 6 }, (_, i) => shiftMonth(perfMonth, i - 5))}
            />
          </Card>
        </div>
      ) : null}

      {tab === "avaliacoes" ? (
        <div className="space-y-3">
          <Card>
            <CardTitle
              action={
                <Button
                  size="sm"
                  onClick={() => editor.open({ type: "assessment", studentId: s.id })}
                >
                  <HeartPulse /> Nova
                </Button>
              }
            >
              Evolução
            </CardTitle>
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
                  <Line
                    dataKey="musculo"
                    stroke="var(--color-musculo)"
                    strokeWidth={2.5}
                    dot
                    connectNulls
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <p className="text-sm text-muted-foreground">
                Registre ao menos duas avaliações para ver o gráfico de evolução.
              </p>
            )}
            {last ? (
              <p className="mt-3 text-xs text-muted-foreground">
                IMC na última avaliação:{" "}
                <b className="text-foreground">
                  {fmtNum(bmi(last.weight_kg, last.height_cm ?? s.height_cm))}
                </b>
              </p>
            ) : null}
          </Card>
          {assessments.length ? (
            assessments.map((a, i) => (
              <AssessmentCard
                key={a.id}
                a={a}
                prev={assessments[i + 1]}
                onClick={() => editor.open({ type: "assessment", row: a })}
              />
            ))
          ) : (
            <EmptyState>Nenhuma avaliação registrada.</EmptyState>
          )}
        </div>
      ) : null}

      {tab === "financeiro" ? (
        <Card>
          <CardTitle
            action={
              <Button
                size="sm"
                onClick={() =>
                  editor.open({ type: "transaction", kind: "receita", studentId: s.id })
                }
              >
                <Receipt /> Registrar
              </Button>
            }
          >
            Recebimentos
          </CardTitle>
          {txs.length ? (
            <div className="divide-y divide-border">
              {txs.map((t) => (
                <TxRow
                  key={t.id}
                  tx={t}
                  studentName={s.name}
                  onClick={() => editor.open({ type: "transaction", row: t })}
                />
              ))}
            </div>
          ) : (
            <EmptyState>Nenhum recebimento registrado.</EmptyState>
          )}
        </Card>
      ) : null}

      {tab === "dados" ? (
        <Card>
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            {(
              [
                ["Nascimento", dateBR(s.birth_date)],
                ["CPF", s.cpf ?? "—"],
                ["Sexo", s.sex ?? "—"],
                ["Telefone", s.phone ?? "—"],
                ["E-mail", s.email ?? "—"],
                ["Altura", fmtNum(s.height_cm, " cm")],
                ["Valor por aula", money(s.lesson_value)],
                ["Pacote mensal", money(s.package_value)],
                ["Regra para faltas", ABSENCE[s.absence_rule] ?? s.absence_rule],
                ["Momento do pagamento", TIMING[s.payment_timing] ?? s.payment_timing],
                ["Cadastrado em", dateBR(s.created_at)],
              ] as Array<[string, string]>
            ).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-b border-border pb-2">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="text-right font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          {s.notes ? (
            <p className="mt-4 whitespace-pre-wrap rounded-xl bg-muted p-3 text-sm">{s.notes}</p>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}

export default StudentDetail;
