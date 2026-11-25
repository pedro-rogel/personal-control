"use client";

import type { ReactNode } from "react";
import { Link } from "@/components/app-link";
import { usePathname } from "next/navigation";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import {
  BarChart3,
  CalendarCheck,
  Database,
  HeartPulse,
  Home,
  Plus,
  Receipt,
  TrendingDown,
  UserPlus,
  Users,
  UserCircle,
  Wallet,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { EditorProvider, useEditor } from "@/components/editor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV = [
  { to: "/painel", label: "Início", icon: Home },
  { to: "/alunos", label: "Alunos", icon: Users },
  { to: "/aulas", label: "Aulas", icon: CalendarCheck },
  { to: "/avaliacoes", label: "Avaliações", icon: HeartPulse },
  { to: "/financeiro", label: "Finanças", icon: Wallet },
] as const;

const EXTRA = [
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/conta", label: "Conta e backup", icon: UserCircle },
] as const;

function SyncBadge({ className }: { className?: string }) {
  const fetching = useIsFetching();
  const mutating = useIsMutating();
  const busy = mutating > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-semibold text-deep-muted",
        className,
      )}
    >
      <Database className={cn("size-3.5", busy && "animate-pulse")} />
      {busy ? "Salvando…" : fetching > 0 ? "Atualizando…" : "Salvo no servidor"}
    </span>
  );
}

function Logo() {
  return (
    <img src="/icons/icon-192.png" alt="" width={36} height={36} className="size-9 rounded-xl" />
  );
}

function QuickAdd({ className }: { className?: string }) {
  const editor = useEditor();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Adicionar"
          className={cn(
            "grid size-13 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-float transition active:scale-95",
            className,
          )}
        >
          <Plus className="size-6" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="w-56 rounded-2xl p-1.5">
        <DropdownMenuItem
          className="h-11 rounded-xl"
          onSelect={() => editor.open({ type: "lesson" })}
        >
          <CalendarCheck /> Registrar aula
        </DropdownMenuItem>
        <DropdownMenuItem
          className="h-11 rounded-xl"
          onSelect={() => editor.open({ type: "student" })}
        >
          <UserPlus /> Novo aluno
        </DropdownMenuItem>
        <DropdownMenuItem
          className="h-11 rounded-xl"
          onSelect={() => editor.open({ type: "assessment" })}
        >
          <HeartPulse /> Nova avaliação
        </DropdownMenuItem>
        <DropdownMenuItem
          className="h-11 rounded-xl"
          onSelect={() => editor.open({ type: "transaction", kind: "receita" })}
        >
          <Receipt /> Registrar recebimento
        </DropdownMenuItem>
        <DropdownMenuItem
          className="h-11 rounded-xl"
          onSelect={() => editor.open({ type: "transaction", kind: "despesa" })}
        >
          <TrendingDown /> Registrar despesa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const isActive = (to: string) => path === to || path.startsWith(`${to}/`);

  return (
    <EditorProvider>
      <div className="min-h-dvh md:flex">
        {/* Desktop sidebar */}
        <aside className="no-print sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-gradient-deep p-4 text-deep-foreground md:flex">
          <div className="flex items-center gap-3 px-2 py-3">
            <Logo />
            <div>
              <div className="font-display text-base font-bold leading-tight">Personal Control</div>
              <SyncBadge />
            </div>
          </div>
          <nav className="mt-6 flex flex-col gap-1">
            {[...NAV, ...EXTRA].map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition",
                  isActive(to)
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-deep-muted hover:bg-deep-raised hover:text-deep-foreground",
                )}
              >
                <Icon className="size-[18px]" />
                {label === "Finanças" ? "Financeiro" : label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto">
            <QuickAdd className="h-12 w-full" />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile top bar */}
          <header className="no-print sticky top-0 z-30 bg-deep pt-safe text-deep-foreground md:hidden">
            <div className="flex h-14 items-center justify-between gap-3 px-4">
              <Link to="/painel" className="flex items-center gap-2.5">
                <Logo />
                <div className="leading-tight">
                  <div className="font-display text-[15px] font-bold">Personal Control</div>
                  <SyncBadge />
                </div>
              </Link>
              <div className="flex items-center gap-1">
                {EXTRA.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    aria-label={label}
                    className={cn(
                      "grid size-10 place-items-center rounded-xl transition",
                      isActive(to)
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-deep-muted",
                    )}
                  >
                    <Icon className="size-5" />
                  </Link>
                ))}
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-nav pt-5 md:px-8 md:pb-10 md:pt-8">
            {children}
          </main>

          {/* Mobile quick add */}
          <div className="no-print fixed bottom-[calc(env(safe-area-inset-bottom)+5rem)] right-4 z-40 md:hidden">
            <QuickAdd />
          </div>

          {/* Mobile tab bar */}
          <nav className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-safe shadow-float backdrop-blur-md md:hidden">
            <div className="grid grid-cols-5">
              {NAV.map(({ to, label, icon: Icon }) => {
                const on = isActive(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      "flex h-16 flex-col items-center justify-center gap-1 text-[10.5px] font-semibold transition",
                      on ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-7 w-12 place-items-center rounded-full transition",
                        on && "bg-accent",
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    {label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </EditorProvider>
  );
}
