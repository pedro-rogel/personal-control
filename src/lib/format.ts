export function money(n: number | string | null | undefined): string {
  return Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function dateBR(d: string | null | undefined): string {
  if (!d) return "—";
  const x = new Date(`${d.slice(0, 10)}T12:00:00`);
  return Number.isNaN(x.getTime()) ? d : x.toLocaleDateString("pt-BR");
}

export function dateLong(d: string): string {
  const x = new Date(`${d.slice(0, 10)}T12:00:00`);
  return x.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
}

/** Local date as YYYY-MM-DD (never UTC, so late-evening entries stay on the right day). */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function today(): string {
  return toISODate(new Date());
}

export function monthKey(d: string): string {
  return d.slice(0, 7);
}

export function monthLabel(key: string, style: "long" | "short" = "long"): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y ?? 2000, (m ?? 1) - 1, 1);
  const label = d.toLocaleDateString("pt-BR", {
    month: style,
    year: style === "long" ? "numeric" : "2-digit",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function shiftMonth(key: string, delta: number): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y ?? 2000, (m ?? 1) - 1 + delta, 1);
  return toISODate(d).slice(0, 7);
}

export function timeShort(t: string | null | undefined): string {
  return t ? t.slice(0, 5) : "";
}

export function age(birth: string | null | undefined): number | null {
  if (!birth) return null;
  const b = new Date(`${birth}T12:00:00`);
  if (Number.isNaN(b.getTime())) return null;
  const now = new Date();
  let a = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a--;
  return a;
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}

export function num(v: FormDataEntryValue | string | number | null | undefined): number | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim().replace(",", ".");
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function str(v: FormDataEntryValue | string | null | undefined): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

export function fmtNum(n: number | null | undefined, unit = "", digits = 1): string {
  if (n === null || n === undefined) return "—";
  return `${Number(n).toLocaleString("pt-BR", { maximumFractionDigits: digits })}${unit}`;
}

export const LESSON_STATUS: Record<string, string> = {
  agendada: "Agendada",
  realizada: "Realizada",
  reposta: "Reposição realizada",
  falta: "Falta",
  cancelada: "Cancelada",
};

export const BILLING: Record<string, string> = { aula: "Por aula", mensal: "Pacote mensal" };
export const ABSENCE: Record<string, string> = {
  cobrar: "Cobrar normalmente",
  nao_cobrar: "Não cobrar",
  repor: "Gerar reposição",
};
export const TIMING: Record<string, string> = {
  antecipado: "Antecipado",
  fim_mes: "Fim do mês",
  por_aula: "Após cada aula",
};

export const MUSCLE_GROUPS = [
  "Peito",
  "Costas",
  "Ombros",
  "Bíceps",
  "Tríceps",
  "Quadríceps",
  "Posterior de coxa",
  "Glúteos",
  "Panturrilha",
  "Abdômen",
  "Cardio",
  "Corpo inteiro",
];

export const PAYMENT_METHODS = ["Pix", "Dinheiro", "Cartão", "Transferência", "Outro"];

export const INCOME_CATEGORIES = ["Mensalidade", "Aula avulsa", "Avaliação física", "Outro"];
export const EXPENSE_CATEGORIES = [
  "Transporte",
  "Combustível",
  "Equipamentos",
  "Academia / espaço",
  "Cursos e certificações",
  "Marketing",
  "Impostos e taxas",
  "Alimentação",
  "Outro",
];
