import * as React from "react";
import type { ReactNode } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { initials, monthLabel, shiftMonth } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string | undefined;
  actions?: ReactNode | undefined;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2 no-print">{actions}</div> : null}
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-2xl border border-border bg-card p-4 shadow-card md:p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h3 className="text-[15px] font-semibold text-foreground">{children}</h3>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  note,
  tone = "default",
  icon,
}: {
  label: string;
  value: ReactNode;
  note?: string | undefined;
  tone?: "default" | "income" | "expense" | "accent";
  icon?: ReactNode | undefined;
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-2xl border border-border bg-card p-4 shadow-card",
        tone === "accent" && "border-transparent bg-gradient-mint",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-medium text-muted-foreground">{label}</span>
        {icon ? <span className="text-accent-foreground [&_svg]:size-4">{icon}</span> : null}
      </div>
      <div
        className={cn(
          "mt-2 truncate font-display text-[22px] font-bold tabular md:text-2xl",
          tone === "income" && "text-income",
          tone === "expense" && "text-expense",
        )}
      >
        {value}
      </div>
      {note ? (
        <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{note}</div>
      ) : null}
    </div>
  );
}

export function EmptyState({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-input px-4 py-8 text-center text-sm text-muted-foreground">
      <p>{children}</p>
      {action}
    </div>
  );
}

export function Field({
  label,
  children,
  full,
  hint,
  error,
}: {
  label: string;
  children: ReactNode;
  full?: boolean | undefined;
  hint?: string | undefined;
  error?: string | null | undefined;
}) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1.5", full && "sm:col-span-2")}>
      <span className="text-xs font-semibold text-secondary-foreground">{label}</span>
      {children}
      {error ? (
        <span className="text-[11px] font-medium text-destructive">{error}</span>
      ) : hint ? (
        <span className="text-[11px] text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}

const controlClass =
  "h-11 w-full max-w-full min-w-0 rounded-xl border border-input bg-card px-3 text-foreground shadow-none outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:opacity-60";

export const TextInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(controlClass, className)} {...props} />
));
TextInput.displayName = "TextInput";

export const NativeSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { options: Array<[string, string]> }
>(({ className, options, ...props }, ref) => (
  <div className={cn("relative min-w-0", className)}>
    <select ref={ref} className={cn(controlClass, "appearance-none bg-card pr-9")} {...props}>
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
  </div>
));
NativeSelect.displayName = "NativeSelect";

export const TextArea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(controlClass, "min-h-[84px] py-2.5", className)} {...props} />
));
TextArea.displayName = "TextArea";

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "mid" | "bad" | "accent";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-bold",
        tone === "neutral" && "bg-muted text-muted-foreground",
        tone === "good" && "bg-success-soft text-success",
        tone === "mid" && "bg-warning-soft text-warning",
        tone === "bad" && "bg-danger-soft text-destructive",
        tone === "accent" && "bg-accent text-accent-foreground",
      )}
    >
      {children}
    </span>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<[T, string]>;
  className?: string | undefined;
}) {
  return (
    <div
      className={cn(
        "flex gap-1 overflow-x-auto rounded-xl bg-secondary p-1 scrollbar-none",
        className,
      )}
    >
      {options.map(([v, l]) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={cn(
            "h-9 flex-1 whitespace-nowrap rounded-lg px-3 text-xs font-semibold transition",
            v === value ? "bg-card text-foreground shadow-card" : "text-muted-foreground",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export function MonthSwitcher({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-1 rounded-xl border border-border bg-card p-1 md:inline-flex">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Mês anterior"
        onClick={() => onChange(shiftMonth(value, -1))}
      >
        <ChevronLeft />
      </Button>
      <span className="min-w-[9.5rem] text-center text-sm font-semibold">{monthLabel(value)}</span>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Próximo mês"
        onClick={() => onChange(shiftMonth(value, 1))}
      >
        <ChevronRight />
      </Button>
    </div>
  );
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full bg-accent font-display text-sm font-bold text-accent-foreground",
        className,
      )}
    >
      {initials(name) || "?"}
    </span>
  );
}

export function ConfirmDelete({
  open,
  onOpenChange,
  onConfirm,
  title = "Excluir este registro?",
  description = "Esta ação não pode ser desfeita.",
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: () => void;
  title?: string | undefined;
  description?: string | undefined;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirm}
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function perfTone(p: string | null | undefined): "good" | "mid" | "bad" | "neutral" {
  return p === "Bom" ? "good" : p === "Médio" ? "mid" : p === "Ruim" ? "bad" : "neutral";
}

export function statusTone(s: string): "good" | "mid" | "bad" | "neutral" | "accent" {
  if (s === "realizada" || s === "reposta") return "good";
  if (s === "falta") return "bad";
  if (s === "agendada") return "accent";
  return "neutral";
}
