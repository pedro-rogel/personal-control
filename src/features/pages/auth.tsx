"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Lock, Mail, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/components/app-link";
import { useNavigate } from "@/hooks/use-navigate";
import { authClient } from "@/lib/auth-client";

type Mode = "entrar" | "criar";

export default function AuthPage() {
  const navigate = useNavigate();
  const { data } = authClient.useSession();
  const [mode, setMode] = useState<Mode>("entrar");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data?.session) void navigate({ to: "/painel", replace: true });
  }, [data?.session, navigate]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "").trim();
    setBusy(true);
    try {
      const result = mode === "entrar"
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ email, password, name });
      if (result.error) {
        toast.error(mode === "entrar" ? "E-mail ou senha incorretos." : (result.error.message ?? "Não foi possível criar a conta."));
        return;
      }
      void navigate({ to: "/painel", replace: true });
    } catch {
      toast.error("Não foi possível conectar ao servidor.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-auth pt-safe md:justify-center">
      <header className="px-6 pb-7 pt-8 text-center">
        <Link to="/" aria-label="Personal Control — início">
          <img src="/icons/icon-192.png" alt="" width={72} height={72} className="mx-auto size-[72px] rounded-[22px] shadow-cta" />
        </Link>
        <span className="mt-3 block font-display text-[22px] font-bold text-auth-ink">Personal Control</span>
        <p className="mt-1 text-sm text-auth-ink/80">Gerencie alunos, aulas e finanças em um só lugar</p>
      </header>
      <main className="flex flex-1 flex-col rounded-t-[28px] bg-card px-6 pb-8 pt-7 shadow-auth-card md:mx-auto md:mb-10 md:w-full md:max-w-md md:flex-none md:rounded-[28px]">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-center text-2xl font-bold">{mode === "entrar" ? "Bem-vindo de volta" : "Crie sua conta"}</h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">Acesso por e-mail e senha no seu servidor</p>
          <div className="mt-6 flex rounded-full bg-muted p-1" role="tablist" aria-label="Acesso à conta">
            {(["entrar", "criar"] as const).map((value) => (
              <button key={value} type="button" role="tab" aria-selected={mode === value} onClick={() => setMode(value)}
                className={`h-9 flex-1 rounded-full text-sm font-semibold ${mode === value ? "bg-card text-foreground shadow-card" : "text-muted-foreground"}`}>
                {value === "entrar" ? "Entrar" : "Criar conta"}
              </button>
            ))}
          </div>
          <form onSubmit={onSubmit} className="mt-5 grid gap-4">
            {mode === "criar" && (
              <label className="grid gap-1.5 text-sm font-medium">
                Seu nome
                <span className="relative"><User className="absolute left-3 top-3 size-5 text-muted-foreground" aria-hidden="true" />
                  <input name="name" autoComplete="name" required maxLength={200} className="h-11 w-full rounded-xl border border-input bg-card pl-10 pr-3 outline-none focus:ring-2 focus:ring-primary" /></span>
              </label>
            )}
            <label className="grid gap-1.5 text-sm font-medium">
              E-mail
              <span className="relative"><Mail className="absolute left-3 top-3 size-5 text-muted-foreground" aria-hidden="true" />
                <input name="email" type="email" autoComplete="email" required className="h-11 w-full rounded-xl border border-input bg-card pl-10 pr-3 outline-none focus:ring-2 focus:ring-primary" /></span>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Senha
              <span className="relative"><Lock className="absolute left-3 top-3 size-5 text-muted-foreground" aria-hidden="true" />
                <input name="password" type="password" autoComplete={mode === "criar" ? "new-password" : "current-password"}
                  required minLength={mode === "criar" ? 8 : undefined} className="h-11 w-full rounded-xl border border-input bg-card pl-10 pr-3 outline-none focus:ring-2 focus:ring-primary" /></span>
            </label>
            <button type="submit" disabled={busy} aria-busy={busy}
              className="mt-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-primary font-semibold text-primary-foreground shadow-cta disabled:opacity-60">
              {busy && <Loader2 className="size-5 animate-spin" aria-hidden="true" />}
              {mode === "entrar" ? "Entrar" : "Criar conta"}
            </button>
          </form>
          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4" aria-hidden="true" /> Seus dados ficam protegidos pela sua conta
          </p>
        </div>
      </main>
    </div>
  );
}
