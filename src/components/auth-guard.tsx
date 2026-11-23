"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase-client";
import { AppShell } from "@/components/app-shell";

const UserContext = createContext<User | null>(null);

export function useAuthUser() {
  const user = useContext(UserContext);
  if (!user) throw new Error("Página fora da área autenticada.");
  return { user };
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => {
    let active = true;
    const check = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!active) return;
        if (error && error.name !== "AuthSessionMissingError") { setState("error"); return; }
        if (!data.user) { router.replace("/auth"); return; }
        setUser(data.user);
        setState("ready");
      } catch {
        if (active) setState("error");
      }
    };
    void check();
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") { setUser(null); router.replace("/auth"); }
      else if ((event === "SIGNED_IN" || event === "USER_UPDATED") && session?.user) {
        setUser(session.user);
        setState("ready");
      }
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, [router]);
  if (state === "error") return <div role="alert" className="p-6">Não foi possível verificar sua sessão. Recarregue a página.</div>;
  if (state !== "ready" || !user) return <div className="p-6">Carregando…</div>;
  return <UserContext.Provider value={user}><AppShell>{children}</AppShell></UserContext.Provider>;
}
