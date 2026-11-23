"use client";

import { Link } from "@/components/app-link";
import { useNavigate } from "@/hooks/use-navigate";
import {
  useEffect,
  useId,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { Eye, EyeOff, Loader2, Lock, Mail, MailCheck, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";



const GOOGLE_SVG = (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
    />
  </svg>
);

type Mode = "entrar" | "criar" | "esqueci";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("entrar");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [sentKind, setSentKind] = useState<"signup" | "recovery">("signup");
  const [unconfirmed, setUnconfirmed] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  async function resendConfirmation(email: string, kind: "signup" | "recovery" = "signup") {
    setResending(true);
    try {
      const { error } =
        kind === "recovery"
          ? await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: `${window.location.origin}/reset-password`,
            })
          : await supabase.auth.resend({
              type: "signup",
              email,
              options: { emailRedirectTo: `${window.location.origin}/auth` },
            });
      if (error) {
        toast.error(
          error.status === 429 || /rate|seconds/i.test(error.message)
            ? "Aguarde alguns minutos antes de pedir outro e-mail."
            : "Não foi possível reenviar o e-mail. Tente novamente.",
        );
        return;
      }
      toast.success("E-mail reenviado.");
      setSentKind(kind);
      setSent(email);
      setUnconfirmed(null);
    } finally {
      setResending(false);
    }
  }

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/painel", replace: true });
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) void navigate({ to: "/painel", replace: true });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") || "").trim();
    const password = String(f.get("password") || "");
    setBusy(true);
    try {
      if (mode === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (/confirm/i.test(error.message)) {
            setUnconfirmed(email);
            toast.error("Confirme seu e-mail antes de entrar.");
          } else {
            toast.error("E-mail ou senha incorretos.");
          }
          return;
        }
        void navigate({ to: "/painel", replace: true });
      } else if (mode === "criar") {
        const name = String(f.get("name") || "").trim();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: { full_name: name },
          },
        });
        if (error) {
          toast.error(
            /registered|exists/i.test(error.message) ? "Este e-mail já tem conta." : error.message,
          );
          return;
        }
        if (data.session) void navigate({ to: "/painel", replace: true });
        else if (data.user && data.user.identities?.length === 0) {
          toast.error("Este e-mail já tem conta. Entre ou use “Esqueci minha senha”.");
          setMode("entrar");
        } else {
          setSentKind("signup");
          setSent(email);
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) {
          toast.error("Não foi possível enviar o e-mail. Tente novamente.");
          return;
        }
        setSentKind("recovery");
        setSent(email);
      }
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/painel` },
    });
    if (error) toast.error("Não foi possível entrar com o Google.");
  }

  const title =
    mode === "criar" ? "Crie sua conta" : mode === "esqueci" ? "Redefinir senha" : "Bem-vindo de volta";

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-hidden bg-gradient-auth pt-safe md:justify-center">
      {/* Decorative pattern */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-auth-dots [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
        <div className="absolute -right-28 -top-28 size-80 rounded-full border border-auth-ink/10" />
        <div className="absolute -right-14 -top-14 size-52 rounded-full border border-auth-ink/[0.07]" />
        <div className="absolute -left-24 top-40 size-56 rounded-full border border-auth-ink/[0.06]" />
      </div>

      <header className="relative flex shrink-0 flex-col items-center px-6 pb-7 pt-8 text-center animate-auth-fade short:pb-5 short:pt-4">
        <Link to="/" aria-label="Personal Control — início">
          <img
            src="/icons/icon-192.png"
            alt=""
            width={72}
            height={72}
            className="size-[72px] rounded-[22px] shadow-cta short:size-14 short:rounded-[18px]"
          />
        </Link>
        <span className="mt-3 font-display text-[22px] font-bold tracking-tight text-auth-ink short:mt-2 short:text-xl">
          Personal Control
        </span>
        <p className="mt-1 max-w-[20rem] text-balance text-sm leading-snug text-auth-ink/80">
          Gerencie alunos, aulas e finanças em um só lugar
        </p>
      </header>

      <main className="relative flex flex-1 flex-col rounded-t-[28px] bg-card px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6 shadow-auth-card animate-auth-rise short:pt-5 md:mx-auto md:mb-10 md:w-full md:max-w-md md:flex-none md:rounded-[28px] md:pb-6">
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col">
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-accent text-accent-foreground">
                <MailCheck className="size-7" />
              </span>
              <h1 className="text-xl font-bold">Verifique seu e-mail</h1>
              <p className="text-sm text-muted-foreground">
                Enviamos um link para <b className="text-foreground">{sent}</b>.{" "}
                {sentKind === "signup"
                  ? "Confirme o cadastro e depois entre aqui."
                  : "Abra o link para criar uma nova senha."}
              </p>
              <p className="rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                Não chegou? Procure na caixa de <b>Spam</b> ou <b>Lixo eletrônico</b> — pode
                levar alguns minutos para chegar.
              </p>
              <Button
                variant="outline"
                className="w-full"
                disabled={resending}
                onClick={() => void resendConfirmation(sent, sentKind)}
              >
                {resending ? <Loader2 className="animate-spin" /> : null}
                Reenviar e-mail
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setSent(null);
                  setMode("entrar");
                }}
              >
                Voltar para o login
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-[22px] font-bold text-foreground short:text-xl">{title}</h1>
              {mode === "esqueci" ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  Informe seu e-mail e enviaremos um link para criar uma nova senha.
                </p>
              ) : (
                <div
                  role="tablist"
                  aria-label="Entrar ou criar conta"
                  className="mt-4 grid grid-cols-2 rounded-full bg-secondary p-1 short:mt-3"
                >
                  {(
                    [
                      ["entrar", "Entrar"],
                      ["criar", "Criar conta"],
                    ] as const
                  ).map(([v, l]) => (
                    <button
                      key={v}
                      type="button"
                      role="tab"
                      aria-selected={mode === v}
                      onClick={() => setMode(v)}
                      className={cn(
                        "h-8 rounded-full text-[13px] font-semibold transition",
                        mode === v
                          ? "bg-card text-foreground shadow-card"
                          : "text-muted-foreground",
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={onSubmit} className="mt-5 grid gap-3 short:mt-4 short:gap-2.5">
                {mode === "criar" ? (
                  <IconInput
                    icon={<User />}
                    label="Seu nome"
                    name="name"
                    autoComplete="name"
                    placeholder="Seu nome"
                  />
                ) : null}
                <IconInput
                  icon={<Mail />}
                  label="E-mail"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="seu@email.com"
                  required
                />
                {mode !== "esqueci" ? (
                  <div>
                    <PasswordInput
                      isNew={mode === "criar"}
                      placeholder={mode === "criar" ? "Crie uma senha (mín. 8)" : "Sua senha"}
                    />
                    {mode === "entrar" ? (
                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setMode("esqueci")}
                          className="text-xs font-semibold text-primary"
                        >
                          Esqueci minha senha
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                <button
                  type="submit"
                  disabled={busy}
                  aria-busy={busy}
                  className="mt-1 inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary text-[15px] font-semibold text-primary-foreground shadow-cta transition-[transform,filter] duration-150 hover:brightness-105 active:scale-[0.98] active:brightness-95 disabled:cursor-wait disabled:opacity-80"
                >
                  {busy ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : null}
                  {busy
                    ? mode === "entrar"
                      ? "Entrando…"
                      : mode === "criar"
                        ? "Criando conta…"
                        : "Enviando…"
                    : mode === "entrar"
                      ? "Entrar"
                      : mode === "criar"
                        ? "Criar conta"
                        : "Enviar link"}
                </button>
              </form>

              {mode === "entrar" && unconfirmed ? (
                <div className="mt-4 rounded-xl border border-border bg-muted p-3 text-sm">
                  <p className="text-muted-foreground">
                    O e-mail <b className="text-foreground">{unconfirmed}</b> ainda não foi
                    confirmado. Verifique o Spam ou peça um novo link.
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-2 w-full"
                    disabled={resending}
                    onClick={() => void resendConfirmation(unconfirmed)}
                  >
                    {resending ? <Loader2 className="animate-spin" /> : null}
                    Reenviar e-mail de confirmação
                  </Button>
                </div>
              ) : null}

              {mode === "esqueci" ? (
                <button
                  type="button"
                  onClick={() => setMode("entrar")}
                  className="mt-4 w-full text-center text-sm font-semibold text-primary"
                >
                  Voltar para o login
                </button>
              ) : (
                <>
                  <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground short:my-4">
                    <span className="h-px flex-1 bg-border" />
                    ou continuar com
                    <span className="h-px flex-1 bg-border" />
                  </div>
                  <button
                    type="button"
                    onClick={() => void google()}
                    className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-2xl border border-google-border bg-google-surface px-3 text-sm font-medium leading-5 text-google-ink transition active:scale-[0.98]"
                  >
                    {GOOGLE_SVG}
                    Continuar com Google
                  </button>
                </>
              )}
            </>
          )}

          <p className="mt-auto flex items-center justify-center gap-1.5 pt-5 text-[11px] text-muted-foreground short:pt-4">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            Seus dados ficam protegidos
          </p>
        </div>
      </main>
    </div>
  );
}

const authControl =
  "h-[52px] w-full min-w-0 rounded-2xl border border-input bg-card pl-11 text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/15";

function IconInput({
  icon,
  label,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { icon: ReactNode; label: string }) {
  const id = useId();
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground [&_svg]:size-[18px]"
      >
        {icon}
      </span>
      <input id={id} className={cn(authControl, "pr-4", className)} {...props} />
    </div>
  );
}

function PasswordInput({ isNew, placeholder }: { isNew: boolean; placeholder: string }) {
  const id = useId();
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        Senha
      </label>
      <Lock
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground"
      />
      <input
        id={id}
        name="password"
        type={show ? "text" : "password"}
        required
        minLength={isNew ? 8 : undefined}
        autoComplete={isNew ? "new-password" : "current-password"}
        placeholder={placeholder}
        className={cn(authControl, "pr-12")}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Ocultar senha" : "Mostrar senha"}
        aria-pressed={show}
        className="absolute right-1.5 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-xl text-muted-foreground transition hover:text-foreground active:scale-95"
      >
        {show ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
      </button>
    </div>
  );
}

export default AuthPage;
