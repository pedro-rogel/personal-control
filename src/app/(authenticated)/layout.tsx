import { Suspense, type ReactNode } from "react";
import { AuthGuard } from "@/components/auth-guard";

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return <AuthGuard><Suspense fallback={<div className="p-6">Carregando dados…</div>}>{children}</Suspense></AuthGuard>;
}
