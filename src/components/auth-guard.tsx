"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { AppShell } from "@/components/app-shell";

type AuthUser = { id: string; email: string; name: string };
const UserContext = createContext<AuthUser | null>(null);

export function useAuthUser() {
  const user = useContext(UserContext);
  if (!user) throw new Error("Página fora da área autenticada.");
  return { user };
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data, isPending, error } = authClient.useSession();
  useEffect(() => {
    if (!isPending && !error && !data?.user) router.replace("/auth");
  }, [data?.user, error, isPending, router]);
  if (error) return <div role="alert" className="p-6">Não foi possível verificar sua sessão. Recarregue a página.</div>;
  if (isPending || !data?.user) return <div className="p-6">Carregando…</div>;
  return <UserContext.Provider value={data.user}><AppShell>{children}</AppShell></UserContext.Provider>;
}
