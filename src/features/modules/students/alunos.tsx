"use client";

import { Link } from "@/components/app-link";
import { useMemo, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronRight, Search, UserPlus } from "lucide-react";

import { lessonsQuery, studentsQuery } from "@/lib/data";
import { attendanceRate, isDone } from "@/lib/metrics";
import { BILLING, dateBR, money } from "@/lib/format";
import { useEditor } from "@/components/editor";
import {
  Avatar,
  Card,
  EmptyState,
  PageHeader,
  Pill,
  Segmented,
  TextInput,
} from "@/components/ui-kit";
import { Button } from "@/components/ui/button";



function StudentsPage() {
  const { data: students } = useSuspenseQuery(studentsQuery);
  const { data: lessons } = useSuspenseQuery(lessonsQuery);
  const editor = useEditor();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"ativos" | "arquivados" | "todos">("ativos");

  const stats = useMemo(() => {
    const m = new Map<string, { last: string | null; rate: number | null; done: number }>();
    for (const s of students) {
      const ls = lessons.filter((l) => l.student_id === s.id);
      m.set(s.id, {
        last: ls.find((l) => isDone(l.status))?.lesson_date ?? null,
        rate: attendanceRate(ls),
        done: ls.filter((l) => isDone(l.status)).length,
      });
    }
    return m;
  }, [students, lessons]);

  const list = students
    .filter((s) => (filter === "ativos" ? s.active : filter === "arquivados" ? !s.active : true))
    .filter((s) => {
      const t = q.trim().toLowerCase();
      if (!t) return true;
      return [s.name, s.phone, s.email, s.cpf].some((x) => (x ?? "").toLowerCase().includes(t));
    });

  return (
    <div>
      <PageHeader
        title="Alunos"
        subtitle={`${students.filter((s) => s.active).length} ativo(s)`}
        actions={
          <Button onClick={() => editor.open({ type: "student" })}>
            <UserPlus /> Novo aluno
          </Button>
        }
      />
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <TextInput
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome, telefone…"
            className="pl-9"
            type="search"
          />
        </div>
        <Segmented
          className="sm:w-80"
          value={filter}
          onChange={setFilter}
          options={[
            ["ativos", "Ativos"],
            ["arquivados", "Arquivados"],
            ["todos", "Todos"],
          ]}
        />
      </div>
      {list.length === 0 ? (
        <EmptyState
          action={
            students.length === 0 ? (
              <Button size="sm" onClick={() => editor.open({ type: "student" })}>
                Cadastrar primeiro aluno
              </Button>
            ) : undefined
          }
        >
          {students.length === 0 ? "Nenhum aluno cadastrado ainda." : "Nenhum aluno encontrado."}
        </EmptyState>
      ) : (
        <Card className="p-0 md:p-0">
          <ul className="divide-y divide-border">
            {list.map((s) => {
              const st = stats.get(s.id);
              const value = s.billing === "aula" ? s.lesson_value : s.package_value;
              return (
                <li key={s.id}>
                  <Link
                    to="/alunos/[id]"
                    params={{ id: s.id }}
                    className="flex items-center gap-3 px-4 py-3.5 active:bg-muted"
                  >
                    <Avatar name={s.name} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-semibold">{s.name}</span>
                        {!s.active ? <Pill>Arquivado</Pill> : null}
                      </div>
                      <div className="mt-0.5 truncate text-xs text-muted-foreground">
                        {BILLING[s.billing]} · {money(value)}
                        {st?.last ? ` · última aula ${dateBR(st.last)}` : ""}
                      </div>
                    </div>
                    {st?.rate !== null && st?.rate !== undefined ? (
                      <Pill tone={st.rate >= 0.8 ? "good" : st.rate >= 0.6 ? "mid" : "bad"}>
                        {Math.round(st.rate * 100)}%
                      </Pill>
                    ) : null}
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}

export default StudentsPage;
