"use client";

import { Link } from "@/components/app-link";
import { useNavigate } from "@/hooks/use-navigate";
import { useEffect } from "react";
import { BarChart3, CalendarCheck, HeartPulse, ShieldCheck, Users, Wallet } from "lucide-react";

import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";



const FEATURES = [
  { icon: Users, label: "Alunos" },
  { icon: CalendarCheck, label: "Aulas e frequência" },
  { icon: HeartPulse, label: "Avaliações físicas" },
  { icon: Wallet, label: "Receitas e despesas" },
  { icon: BarChart3, label: "Relatórios" },
  { icon: ShieldCheck, label: "Dados protegidos" },
];

function Index() {
  const navigate = useNavigate();
  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/painel", replace: true });
    });
  }, [navigate]);

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-deep pt-safe text-deep-foreground">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-safe">
        <div className="flex flex-1 flex-col justify-center py-10">
          <img
            src="/icons/icon-192.png"
            alt=""
            width={72}
            height={72}
            className="size-[72px] rounded-[22px] shadow-float"
          />
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.05]">Personal Control</h1>
          <p className="mt-3 text-base text-deep-muted">
            Sua rotina de personal trainer organizada: alunos, aulas, avaliações e financeiro,
            salvos com segurança na nuvem.
          </p>
          <ul className="mt-8 grid grid-cols-2 gap-2">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 rounded-xl bg-deep-raised px-3 py-2.5 text-sm font-semibold"
              >
                <Icon className="size-4 text-sidebar-primary" />
                {label}
              </li>
            ))}
          </ul>
        </div>
        <div className="pb-8">
          <Button
            asChild
            size="lg"
            className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
          >
            <Link to="/auth">Entrar ou criar conta</Link>
          </Button>
          <p className="mt-3 text-center text-xs text-deep-muted">
            No iPhone: toque em Compartilhar → “Adicionar à Tela de Início”.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Index;
