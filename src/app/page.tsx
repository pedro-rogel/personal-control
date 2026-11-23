import type { Metadata } from "next";
import Screen from "@/features/pages/landing";

export const metadata: Metadata = { title: "Personal Control — gestão para personal trainers", description: "Alunos, aulas, avaliações físicas e financeiro em um app simples para o seu iPhone." };

export default function Page() {
  return <Screen />;
}
