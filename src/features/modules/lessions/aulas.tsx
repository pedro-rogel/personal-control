"use client";


import { useMemo, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CalendarCheck, Check, X } from "lucide-react";

import { lessonsQuery, nameOf, studentNameMap, studentsQuery, useSaveRow } from "@/lib/data";
import { attendanceRate, isDone } from "@/lib/metrics";
import { dateLong, today } from "@/lib/format";
import { useEditor } from "@/components/editor";
import { LessonRow } from "@/components/rows";
import {
  Card,
  EmptyState,
  MonthSwitcher,
  NativeSelect,
  PageHeader,
  Segmented,
  StatCard,
} from "@/components/ui-kit";
import { Button } from "@/components/ui/button";



type StatusFilter = "todas" | "agendada" | "feitas" | "falta" | "cancelada";

function LessonsPage() {
  const { data: students } = useSuspenseQuery(studentsQuery);
  const { data: lessons } = useSuspenseQuery(lessonsQuery);
  const editor = useEditor();
  const saveLesson = useSaveRow("lessons");
  const [month, setMonth] = useState(today().slice(0, 7));
  const [status, setStatus] = useState<StatusFilter>("todas");
  const [sid, setSid] = useState("");
  const names = useMemo(() => studentNameMap(students), [students]);

  const inMonth = lessons.filter(
    (l) => l.lesson_date.startsWith(month) && (!sid || l.student_id === sid),
  );
  const filtered = inMonth.filter((l) =>
    status === "todas" ? true : status === "feitas" ? isDone(l.status) : l.status === status,
  );
  const groups = useMemo(() => {
    const m = new Map<string, typeof filtered>();
    for (const l of filtered) {
      const arr = m.get(l.lesson_date) ?? [];
      arr.push(l);
      m.set(l.lesson_date, arr);
    }
    return [...m.entries()];
  }, [filtered]);
  const rate = attendanceRate(inMonth);

  return (
    <div>
      <PageHeader
        title="Aulas e frequência"
        subtitle="Registre presença, rendimento e grupamentos trabalhados"
        actions={
          <Button
            onClick={() => editor.open({ type: "lesson", ...(sid ? { studentId: sid } : {}) })}
          >
            <CalendarCheck /> Registrar aula
          </Button>
        }
      />
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center">
        <MonthSwitcher value={month} onChange={setMonth} />
        <NativeSelect
          className="md:w-64"
          value={sid}
          onChange={(e) => setSid(e.target.value)}
          options={[
            ["", "Todos os alunos"],
            ...students.map((s): [string, string] => [s.id, s.name]),
          ]}
        />
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Realizadas"
          value={inMonth.filter((l) => isDone(l.status)).length}
          note="Inclui reposições"
        />
        <StatCard label="Faltas" value={inMonth.filter((l) => l.status === "falta").length} />
        <StatCard
          label="Canceladas"
          value={inMonth.filter((l) => l.status === "cancelada").length}
        />
        <StatCard
          label="Frequência"
          value={rate === null ? "—" : `${Math.round(rate * 100)}%`}
          tone="accent"
        />
      </div>
      <Segmented
        className="mb-4"
        value={status}
        onChange={setStatus}
        options={[
          ["todas", "Todas"],
          ["agendada", "Agendadas"],
          ["feitas", "Realizadas"],
          ["falta", "Faltas"],
          ["cancelada", "Canceladas"],
        ]}
      />
      {groups.length === 0 ? (
        <EmptyState>Nenhuma aula neste filtro.</EmptyState>
      ) : (
        <div className="space-y-4">
          {groups.map(([date, ls]) => (
            <section key={date}>
              <h2 className="mb-1.5 px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {dateLong(date)}
              </h2>
              <Card className="py-1 md:py-1">
                <div className="divide-y divide-border">
                  {ls.map((l) => (
                    <LessonRow
                      key={l.id}
                      lesson={l}
                      showDate={false}
                      studentName={nameOf(names, l.student_id)}
                      onClick={() => editor.open({ type: "lesson", row: l })}
                      {...(l.status === "agendada"
                        ? {
                            actions: (
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
                                  onClick={() =>
                                    saveLesson.mutate({ id: l.id, values: { status: "falta" } })
                                  }
                                >
                                  <X />
                                </Button>
                              </div>
                            ),
                          }
                        : {})}
                    />
                  ))}
                </div>
              </Card>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

export default LessonsPage;
