"use client";

import { Link } from "@/components/app-link";
import { useNavigate } from "@/hooks/use-navigate";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui-kit";



function ResetPassword() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const password = String(f.get("password") || "");
    if (password !== String(f.get("confirm") || "")) {
      toast.error("As senhas não conferem.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error("O link expirou ou é inválido. Peça um novo na tela de login.");
      return;
    }
    toast.success("Senha atualizada");
    void navigate({ to: "/painel", replace: true });
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6 pt-safe">
      <form onSubmit={onSubmit} className="grid w-full max-w-sm gap-3">
        <h1 className="text-2xl font-bold">Criar nova senha</h1>
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
        <Link to="/auth" className="text-center text-sm font-semibold text-primary">
          O link expirou? Pedir um novo
        </Link>
      </form>
    </div>
  );
}

export default ResetPassword;
