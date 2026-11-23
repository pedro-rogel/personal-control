import { queryOptions, useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase-client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Student = Tables<"students">;
export type Lesson = Tables<"lessons">;
export type Assessment = Tables<"assessments">;
export type Transaction = Tables<"transactions">;

export type TableName = "students" | "lessons" | "assessments" | "transactions";

export const studentsQuery = queryOptions({
  queryKey: ["students"],
  queryFn: async (): Promise<Student[]> => {
    const { data, error } = await supabase.from("students").select("*").order("name");
    if (error) throw error;
    return data;
  },
});

export const lessonsQuery = queryOptions({
  queryKey: ["lessons"],
  queryFn: async (): Promise<Lesson[]> => {
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .order("lesson_date", { ascending: false })
      .order("start_time", { ascending: false, nullsFirst: false })
      .limit(5000);
    if (error) throw error;
    return data;
  },
});

export const assessmentsQuery = queryOptions({
  queryKey: ["assessments"],
  queryFn: async (): Promise<Assessment[]> => {
    const { data, error } = await supabase
      .from("assessments")
      .select("*")
      .order("assessment_date", { ascending: false })
      .limit(5000);
    if (error) throw error;
    return data;
  },
});

export const transactionsQuery = queryOptions({
  queryKey: ["transactions"],
  queryFn: async (): Promise<Transaction[]> => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("tx_date", { ascending: false })
      .limit(5000);
    if (error) throw error;
    return data;
  },
});

export const allQueryKeys = [
  studentsQuery.queryKey,
  lessonsQuery.queryKey,
  assessmentsQuery.queryKey,
  transactionsQuery.queryKey,
];

export function ensureAll(qc: QueryClient) {
  return Promise.all([
    qc.ensureQueryData(studentsQuery),
    qc.ensureQueryData(lessonsQuery),
    qc.ensureQueryData(assessmentsQuery),
    qc.ensureQueryData(transactionsQuery),
  ]);
}

function friendlyError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (/network|fetch/i.test(msg)) return "Sem conexão. Verifique a internet e tente novamente.";
  return "Não foi possível salvar. Tente novamente.";
}

/** Insert or update a row; data is written to the cloud immediately (auto-save). */
export function useSaveRow<T extends TableName>(table: T) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string | undefined; values: TablesInsert<T> }) => {
      const q = supabase.from(table) as unknown as {
        insert: (v: unknown) => PromiseLike<{ error: unknown }>;
        update: (v: unknown) => { eq: (c: string, v: string) => PromiseLike<{ error: unknown }> };
      };
      const { error } = id ? await q.update(values).eq("id", id) : await q.insert(values);
      if (error) throw error instanceof Error ? error : new Error(JSON.stringify(error));
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [table] });
      toast.success("Salvo na nuvem");
    },
    onError: (e) => toast.error(friendlyError(e)),
  });
}

export function useDeleteRow(table: TableName) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      // Deleting a student detaches its history, so refresh everything.
      void qc.invalidateQueries();
      toast.success("Registro excluído");
    },
    onError: (e) => toast.error(friendlyError(e)),
  });
}

export function studentNameMap(students: Student[]): Map<string, string> {
  return new Map(students.map((s) => [s.id, s.name]));
}

export function nameOf(map: Map<string, string>, id: string | null): string {
  if (!id) return "Sem aluno";
  return map.get(id) ?? "Aluno removido";
}
