import { queryOptions, useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ImportRows } from "@/lib/backup";
import type { Assessment, Lesson, Student, TableName, TablesInsert, Transaction } from "@/lib/models";

export type { Assessment, Lesson, Student, Transaction } from "@/lib/models";

async function request<T>(method: string, table: TableName, payload?: Record<string, unknown>): Promise<T> {
  const url = method === "GET" ? `/api/records?table=${table}` : "/api/records";
  const response = await fetch(url, {
    method,
    credentials: "same-origin",
    cache: "no-store",
    headers: payload ? { "Content-Type": "application/json" } : undefined,
    body: payload ? JSON.stringify({ table, ...payload }) : undefined,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? `Falha na solicitação (${response.status}).`);
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}

export const studentsQuery = queryOptions({
  queryKey: ["students"],
  queryFn: (): Promise<Student[]> => request("GET", "students"),
});

export const lessonsQuery = queryOptions({
  queryKey: ["lessons"],
  queryFn: (): Promise<Lesson[]> => request("GET", "lessons"),
});

export const assessmentsQuery = queryOptions({
  queryKey: ["assessments"],
  queryFn: (): Promise<Assessment[]> => request("GET", "assessments"),
});

export const transactionsQuery = queryOptions({
  queryKey: ["transactions"],
  queryFn: (): Promise<Transaction[]> => request("GET", "transactions"),
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
  if (/network|fetch/i.test(msg)) return "Sem conexão. Verifique o servidor e tente novamente.";
  return msg;
}

/** Insert or update a row immediately through the local server. */
export function useSaveRow<T extends TableName>(table: T) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string | undefined; values: TablesInsert<T> }) => {
      await request(id ? "PATCH" : "POST", table, { ...(id && { id }), values });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [table] });
      toast.success("Salvo");
    },
    onError: (e) => toast.error(friendlyError(e)),
  });
}

export function useDeleteRow(table: TableName) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await request("DELETE", table, { id });
    },
    onSuccess: () => {
      // Deleting a student detaches its history, so refresh everything.
      void qc.invalidateQueries();
      toast.success("Registro excluído");
    },
    onError: (e) => toast.error(friendlyError(e)),
  });
}

export async function importRows(rows: ImportRows) {
  for (const table of ["students", "lessons", "assessments", "transactions"] as const) {
    for (const values of rows[table]) await request("POST", table, { values });
  }
}

export function studentNameMap(students: Student[]): Map<string, string> {
  return new Map(students.map((s) => [s.id, s.name]));
}

export function nameOf(map: Map<string, string>, id: string | null): string {
  if (!id) return "Sem aluno";
  return map.get(id) ?? "Aluno removido";
}
