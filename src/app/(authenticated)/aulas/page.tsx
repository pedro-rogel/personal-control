import type { Metadata } from "next";
import ClientPage from "./client-page";

export const metadata: Metadata = { title: "Aulas e frequência — Personal Control", description: "Registro de presença, rendimento e grupamentos trabalhados.", robots: { index: false } };

export default function Page() {
  return <ClientPage />;
}
