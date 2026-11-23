import type { Metadata } from "next";
import ClientPage from "./client-page";

export const metadata: Metadata = { title: "Alunos — Personal Control", description: "Cadastro e acompanhamento individual dos alunos.", robots: { index: false } };

export default function Page() {
  return <ClientPage />;
}
