import type { Metadata } from "next";
import ClientPage from "./client-page";

export const metadata: Metadata = { title: "Conta e backup — Personal Control", description: "Sua conta, cópia de segurança e instalação no iPhone.", robots: { index: false } };

export default function Page() {
  return <ClientPage />;
}
