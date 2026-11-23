import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import type { Lesson } from "@/lib/data";
import {
  PERF_SCORE,
  performanceByMonth,
  performanceSummary,
  perfLabel,
  ratedLessons,
} from "@/lib/metrics";
import { dateBR, fmtNum, monthLabel } from "@/lib/format";
import { Pill, perfTone } from "@/components/ui-kit";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const SCORE_LABEL: Record<number, string> = { 1: "Ruim", 2: "Médio", 3: "Bom" };
const SCORE_COLOR: Record<number, string> = {
  1: "var(--expense)",
  2: "var(--warning)",
  3: "var(--success)",
};

const lineConfig = { nota: { label: "Rendimento", color: "var(--chart-1)" } } satisfies ChartConfig;
const stackConfig = {
  bom: { label: "Bom", color: "var(--success)" },
  medio: { label: "Médio", color: "var(--warning)" },
  ruim: { label: "Ruim", color: "var(--expense)" },
} satisfies ChartConfig;

function SummaryPills({ lessons }: { lessons: Lesson[] }) {
  const s = performanceSummary(lessons);
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      <Pill tone="good">Bom {s.bom}</Pill>
      <Pill tone="mid">Médio {s.medio}</Pill>
      <Pill tone="bad">Ruim {s.ruim}</Pill>
      <span className="ml-1 text-muted-foreground">
        Média:{" "}
        <b className="text-foreground">
          {s.avg === null ? "—" : `${perfLabel(s.avg)} (${fmtNum(s.avg, "", 1)}/3)`}
        </b>
      </span>
    </div>
  );
}

/** Lesson-by-lesson performance of one student inside one month. */
export function MonthPerformanceChart({ lessons, month }: { lessons: Lesson[]; month: string }) {
  const inMonth = lessons.filter((l) => l.lesson_date.startsWith(month));
  const data = ratedLessons(inMonth)
    .slice()
    .sort((a, b) =>
      (a.lesson_date + (a.start_time ?? "")).localeCompare(b.lesson_date + (b.start_time ?? "")),
    )
    .map((l) => ({
      dia: dateBR(l.lesson_date).slice(0, 5),
      nota: PERF_SCORE[l.performance ?? ""] ?? null,
      grupos: l.muscle_groups.join(", "),
    }));

  return (
    <div>
      <SummaryPills lessons={inMonth} />
      {data.length ? (
        <ChartContainer config={lineConfig} className="mt-3 aspect-auto h-52 w-full">
          <LineChart data={data} margin={{ left: -4, right: 12, top: 12, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="dia" tickLine={false} axisLine={false} />
            <YAxis
              domain={[0.5, 3.5]}
              ticks={[1, 2, 3]}
              tickFormatter={(v: number) => SCORE_LABEL[v] ?? ""}
              tickLine={false}
              axisLine={false}
              width={52}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(v, _n, item) => {
                    const g = (item.payload as { grupos?: string }).grupos;
                    return `${SCORE_LABEL[Number(v)] ?? "—"}${g ? ` · ${g}` : ""}`;
                  }}
                />
              }
            />
            <Line
              dataKey="nota"
              stroke="var(--color-nota)"
              strokeWidth={2.5}
              connectNulls
              isAnimationActive={false}
              dot={(p: {
                cx?: number;
                cy?: number;
                payload?: { nota?: number | null };
                index?: number;
              }) => (
                <circle
                  key={`d-${p.index ?? 0}`}
                  cx={p.cx}
                  cy={p.cy}
                  r={5.5}
                  fill={SCORE_COLOR[p.payload?.nota ?? 0] ?? "var(--chart-1)"}
                  stroke="var(--card)"
                  strokeWidth={2}
                />
              )}
            />
          </LineChart>
        </ChartContainer>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          Nenhuma aula com rendimento avaliado em {monthLabel(month).toLowerCase()}. Marque “Bom”,
          “Médio” ou “Ruim” ao registrar a aula.
        </p>
      )}
    </div>
  );
}

/** Month-by-month distribution of Bom / Médio / Ruim. */
export function PerformanceTrendChart({
  lessons,
  months,
}: {
  lessons: Lesson[];
  months: string[];
}) {
  const data = performanceByMonth(lessons, months).map((m) => ({
    mes: monthLabel(m.month, "short"),
    bom: m.bom,
    medio: m.medio,
    ruim: m.ruim,
  }));
  const any = data.some((d) => d.bom + d.medio + d.ruim > 0);
  return (
    <div>
      <SummaryPills
        lessons={lessons.filter((l) => months.some((m) => l.lesson_date.startsWith(m)))}
      />
      {any ? (
        <ChartContainer config={stackConfig} className="mt-3 aspect-auto h-52 w-full">
          <BarChart data={data} margin={{ left: -20, right: 4, top: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="mes" tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={40} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="bom" stackId="r" fill="var(--color-bom)" />
            <Bar dataKey="medio" stackId="r" fill="var(--color-medio)" />
            <Bar dataKey="ruim" stackId="r" fill="var(--color-ruim)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartContainer>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          Nenhuma aula com rendimento avaliado no período.
        </p>
      )}
    </div>
  );
}

export { perfTone };
