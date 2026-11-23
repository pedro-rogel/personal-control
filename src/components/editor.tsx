import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  studentsQuery,
  useDeleteRow,
  type Assessment,
  type Lesson,
  type Student,
  type Transaction,
} from "@/lib/data";
import { ConfirmDelete } from "@/components/ui-kit";
import { StudentForm } from "@/components/forms/student-form";
import { LessonForm } from "@/components/forms/lesson-form";
import { AssessmentForm } from "@/components/forms/assessment-form";
import { TransactionForm } from "@/components/forms/transaction-form";
import { toast } from "sonner";

export type EditorRequest =
  | { type: "student"; row?: Student }
  | { type: "lesson"; row?: Lesson; studentId?: string }
  | { type: "assessment"; row?: Assessment; studentId?: string }
  | { type: "transaction"; row?: Transaction; studentId?: string; kind?: "receita" | "despesa" };

const TABLE = {
  student: "students",
  lesson: "lessons",
  assessment: "assessments",
  transaction: "transactions",
} as const;

interface EditorApi {
  open: (r: EditorRequest) => void;
  confirmDelete: (type: EditorRequest["type"], id: string, onDone?: () => void) => void;
}

const EditorContext = createContext<EditorApi | null>(null);

export function useEditor(): EditorApi {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used inside EditorProvider");
  return ctx;
}

export function EditorProvider({ children }: { children: ReactNode }) {
  const [req, setReq] = useState<EditorRequest | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    type: EditorRequest["type"];
    id: string;
    onDone?: (() => void) | undefined;
  } | null>(null);
  const students = useQuery(studentsQuery);
  const del = useDeleteRow(pendingDelete ? TABLE[pendingDelete.type] : "students");

  const open = useCallback(
    (r: EditorRequest) => {
      const needsStudent = r.type === "lesson" || r.type === "assessment";
      if (needsStudent && !r.row && (students.data?.filter((s) => s.active).length ?? 0) === 0) {
        toast.message("Cadastre um aluno primeiro", {
          description: "Aulas e avaliações precisam estar ligadas a um aluno.",
        });
        setReq({ type: "student" });
        setIsOpen(true);
        return;
      }
      setReq(r);
      setIsOpen(true);
    },
    [students.data],
  );

  const confirmDelete = useCallback<EditorApi["confirmDelete"]>((type, id, onDone) => {
    setPendingDelete({ type, id, onDone });
  }, []);

  const api = useMemo(() => ({ open, confirmDelete }), [open, confirmDelete]);
  const close = () => setIsOpen(false);
  const onDeleteFromForm = req?.row
    ? () => {
        const r = req;
        const id = r.row?.id;
        if (!id) return;
        setPendingDelete({ type: r.type, id, onDone: close });
      }
    : undefined;

  const common = {
    open: isOpen,
    onOpenChange: setIsOpen,
    onDone: close,
    onDelete: onDeleteFromForm,
  };

  return (
    <EditorContext.Provider value={api}>
      {children}
      {req?.type === "student" ? (
        <StudentForm key={req.row?.id ?? "new"} {...common} row={req.row} />
      ) : null}
      {req?.type === "lesson" ? (
        <LessonForm
          key={req.row?.id ?? `new-${req.studentId ?? ""}`}
          {...common}
          row={req.row}
          studentId={req.studentId}
        />
      ) : null}
      {req?.type === "assessment" ? (
        <AssessmentForm
          key={req.row?.id ?? `new-${req.studentId ?? ""}`}
          {...common}
          row={req.row}
          studentId={req.studentId}
        />
      ) : null}
      {req?.type === "transaction" ? (
        <TransactionForm
          key={req.row?.id ?? `new-${req.kind ?? ""}-${req.studentId ?? ""}`}
          {...common}
          row={req.row}
          studentId={req.studentId}
          kind={req.kind}
        />
      ) : null}
      <ConfirmDelete
        open={pendingDelete !== null}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title={pendingDelete?.type === "student" ? "Excluir este aluno?" : "Excluir este registro?"}
        description={
          pendingDelete?.type === "student"
            ? "O cadastro será apagado. Aulas, avaliações e lançamentos ficam no histórico como “Aluno removido”. Se preferir manter o nome, use “Arquivar”."
            : "Esta ação não pode ser desfeita."
        }
        onConfirm={() => {
          if (!pendingDelete) return;
          const { id, onDone } = pendingDelete;
          del.mutate(id, { onSuccess: () => onDone?.() });
          setPendingDelete(null);
        }}
      />
    </EditorContext.Provider>
  );
}
