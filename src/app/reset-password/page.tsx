import type { Metadata } from "next";
import Screen from "@/features/pages/reset-password";

export const metadata: Metadata = { title: "Nova senha — Personal Control", description: "Defina uma nova senha para sua conta.", robots: { index: false } };

export default function Page() {
  return <Screen />;
}
