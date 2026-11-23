import { toISODate } from "./format";
import type { Period } from "./metrics";

export type PeriodPreset = "mes" | "mes_passado" | "3m" | "6m" | "ano" | "tudo" | "custom";

export const PERIOD_LABELS: Record<PeriodPreset, string> = {
  mes: "Este mês",
  mes_passado: "Mês passado",
  "3m": "Últimos 3 meses",
  "6m": "Últimos 6 meses",
  ano: "Este ano",
  tudo: "Todo o período",
  custom: "Personalizado",
};

export function presetPeriod(preset: Exclude<PeriodPreset, "custom">, now = new Date()): Period {
  const y = now.getFullYear();
  const m = now.getMonth();
  const monthEnd = (yy: number, mm: number) => toISODate(new Date(yy, mm + 1, 0));
  switch (preset) {
    case "mes":
      return { from: toISODate(new Date(y, m, 1)), to: monthEnd(y, m) };
    case "mes_passado":
      return { from: toISODate(new Date(y, m - 1, 1)), to: monthEnd(y, m - 1) };
    case "3m":
      return { from: toISODate(new Date(y, m - 2, 1)), to: monthEnd(y, m) };
    case "6m":
      return { from: toISODate(new Date(y, m - 5, 1)), to: monthEnd(y, m) };
    case "ano":
      return { from: `${y}-01-01`, to: `${y}-12-31` };
    case "tudo":
      return { from: "2000-01-01", to: `${y + 1}-12-31` };
  }
}
