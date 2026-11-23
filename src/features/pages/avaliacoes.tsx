"use client";


import { useMemo, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { HeartPulse } from "lucide-react";

import {
  assessmentsQuery,
  nameOf,
  studentNameMap,
  studentsQuery,
  type Assessment,
} from "@/lib/data";
import { useEditor } from "@/components/editor";
import { AssessmentCard } from "@/components/rows";
import { EmptyState, NativeSelect, PageHeader } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";



function AssessmentsPage() {
  const { data: students } = useSuspenseQuery(studentsQuery);
  const { data: assessments } = useSuspenseQuery(assessmentsQuery);
  const editor = useEditor();
  const [sid, setSid] = useState("");
  const names = useMemo(() => studentNameMap(students), [students]);

  // previous assessment of the same student, to show the change since last time
  const prevOf = useMemo(() => {
    const m = new Map<string, Assessment | undefined>();
    const byStudent = new Map<string, Assessment[]>();
    for (const a of assessments) {
      const k = a.student_id ?? "none";
      const arr = byStudent.get(k) ?? [];
      arr.push(a);
      byStudent.set(k, arr);
    }
    for (const arr of byStudent.values()) arr.forEach((a, i) => m.set(a.id, arr[i + 1]));
    return m;
  }, [assessments]);

  const list = assessments.filter((a) => !sid || a.student_id === sid);

  return (
    <div>
      <PageHeader
        title="Avaliações físicas"
        subtitle="Histórico de medidas — avaliações anteriores nunca são sobrescritas"
        actions={
          <Button
            onClick={() => editor.open({ type: "assessment", ...(sid ? { studentId: sid } : {}) })}
          >
            <HeartPulse /> Nova avaliação
          </Button>
        }
      />
      <NativeSelect
        className="mb-4 md:w-72"
        value={sid}
        onChange={(e) => setSid(e.target.value)}
        options={[
          ["", "Todos os alunos"],
          ...students.map((s): [string, string] => [s.id, s.name]),
        ]}
      />
      {list.length === 0 ? (
        <EmptyState>Nenhuma avaliação registrada.</EmptyState>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {list.map((a) => (
            <AssessmentCard
              key={a.id}
              a={a}
              prev={prevOf.get(a.id)}
              studentName={nameOf(names, a.student_id)}
              onClick={() => editor.open({ type: "assessment", row: a })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default AssessmentsPage;
