import type { Metadata } from "next";
import ClientPage from "./client-page";

export const metadata: Metadata = { title: "Relatórios — Personal Control", description: "Indicadores de frequência, evolução e finanças por período.", robots: { index: false } };

export default function Page() {
  return <ClientPage />;
}
