import type { Metadata } from "next";
import Screen from "@/features/pages/auth";

export const metadata: Metadata = { title: "Entrar — Personal Control", description: "Acesse sua conta do Personal Control.", robots: { index: false } };

export default function Page() {
  return <Screen />;
}
