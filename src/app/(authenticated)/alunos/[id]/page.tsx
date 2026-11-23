import type { Metadata } from "next";
import ClientPage from "./client-page";

export const metadata: Metadata = { title: "Aluno — Personal Control", description: "Ficha do aluno com aulas, avaliações e pagamentos.", robots: { index: false } };

export default function Page() {
  return <ClientPage />;
}
