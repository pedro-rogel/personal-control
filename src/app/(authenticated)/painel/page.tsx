import type { Metadata } from "next";
import ClientPage from "./client-page";

export const metadata: Metadata = { title: "Visão geral — Personal Control", description: "Resumo de alunos, aulas, frequência e finanças do mês.", robots: { index: false } };

export default function Page() {
  return <ClientPage />;
}
