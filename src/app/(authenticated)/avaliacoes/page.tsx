import type { Metadata } from "next";
import ClientPage from "./client-page";

export const metadata: Metadata = { title: "Avaliações físicas — Personal Control", description: "Histórico de medidas corporais dos alunos.", robots: { index: false } };

export default function Page() {
  return <ClientPage />;
}
