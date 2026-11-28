"use client";

import { Link } from "@/components/app-link";
import { useNavigate } from "@/hooks/use-navigate";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui-kit";



function ResetPassword() {
  const navigate = useNavigate();
  const { data, isPending } = authClient.useSession();
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const currentPassword = String(f.get("current") || "");
    const password = String(f.get("password") || "");
    if (password !== String(f.get("confirm") || "")) {
      toast.error("As senhas não conferem.");
      return;
    }
    setBusy(true);
    const { error } = await authClient.changePassword({ currentPassword, newPassword: password });
    setBusy(false);
    if (error) {
      toast.error("Não foi possível alterar a senha. Confira a senha atual.");
      return;
    }
    toast.success("Senha atualizada");
    void navigate({ to: "/conta", replace: true });
  }

  if (isPending) return <div className="p-6">Carregando…</div>;
  if (!data?.user) return <div className="p-6">Entre na sua conta para alterar a senha. <Link to="/auth">Ir para o login</Link></div>;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6 pt-safe">
      <form onSubmit={onSubmit} className="grid w-full max-w-sm gap-3">
        <h1 className="text-2xl font-bold">Alterar senha</h1>
        <Field label="Senha atual">
          <TextInput name="current" type="password" required autoComplete="current-password" />
        </Field>
        <Field label="Nova senha" hint="Mínimo de 8 caracteres.">
          <TextInput
            name="password"
            type="password"
            minLength={8}
            required
            autoComplete="new-password"
          />
        </Field>
        <Field label="Confirmar senha">
          <TextInput
            name="confirm"
            type="password"
            minLength={8}
            required
            autoComplete="new-password"
          />
        </Field>
        <Button type="submit" size="lg" disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : null}
          Salvar nova senha
        </Button>
        <Link to="/conta" className="text-center text-sm font-semibold text-primary">
          Voltar à conta
        </Link>
      </form>
    </div>
  );
}

export default ResetPassword;
