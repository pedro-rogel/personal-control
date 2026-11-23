import type { Metadata } from "next";
import ClientPage from "./client-page";

export const metadata: Metadata = { title: "Financeiro — Personal Control", description: "Receitas, despesas e valores previstos por aluno.", robots: { index: false } };

export default function Page() {
  return <ClientPage />;
}
