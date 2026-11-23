import { describe, expect, it } from "vitest";

import {
  attendanceRate,
  balance,
  expectedForMonth,
  receivedForMonth,
  txMonth,
} from "@/lib/metrics";
import { parseBackup } from "@/lib/backup";
import { CPF_INVALID, cpfIssue, isValidCpf, normalizeCpf } from "@/lib/cpf";
import { presetPeriod } from "@/lib/period";

const lesson = (
  status: string,
  date = "2026-11-05",
  value: number | null = 100,
  student_id = "s1",
) => ({
  student_id,
  lesson_date: date,
  status,
  value,
});

describe("frequência", () => {
  it("conta reposições como aulas realizadas e ignora canceladas/agendadas", () => {
    const rate = attendanceRate([
      lesson("realizada"),
      lesson("reposta"),
      lesson("falta"),
      lesson("cancelada"),
      lesson("agendada"),
    ]);
    expect(rate).toBeCloseTo(2 / 3);
  });
  it("sem aulas realizadas nem faltas não há taxa", () => {
    expect(attendanceRate([lesson("cancelada")])).toBeNull();
  });
});

describe("financeiro", () => {
  it("saldo = receitas − despesas", () => {
    expect(
      balance([
        { kind: "receita", amount: 500, tx_date: "2026-11-01", student_id: null },
        { kind: "despesa", amount: 120, tx_date: "2026-11-02", student_id: null },
      ]),
    ).toBe(380);
  });

  it("aluno de pacote mensal deve o valor do pacote", () => {
    const s = {
      id: "s1",
      active: true,
      billing: "mensal",
      absence_rule: "repor",
      lesson_value: 80,
      package_value: 600,
    };
    expect(expectedForMonth(s, [lesson("realizada")], "2026-11")).toBe(600);
  });

  it("aluno por aula deve as aulas realizadas; faltas só quando a regra é cobrar", () => {
    const lessons = [lesson("realizada"), lesson("reposta"), lesson("falta"), lesson("cancelada")];
    const base = { id: "s1", active: true, billing: "aula", lesson_value: 80, package_value: null };
    expect(expectedForMonth({ ...base, absence_rule: "repor" }, lessons, "2026-11")).toBe(200);
    expect(expectedForMonth({ ...base, absence_rule: "cobrar" }, lessons, "2026-11")).toBe(300);
  });

  it("aula sem valor usa o valor padrão do aluno", () => {
    const s = {
      id: "s1",
      active: true,
      billing: "aula",
      absence_rule: "repor",
      lesson_value: 90,
      package_value: null,
    };
    expect(expectedForMonth(s, [lesson("realizada", "2026-11-05", null)], "2026-11")).toBe(90);
  });

  it("recebimento conta pela competência MM/AAAA quando informada", () => {
    const tx = {
      kind: "receita",
      amount: 600,
      tx_date: "2026-12-02",
      student_id: "s1",
      competence: "11/2026",
    };
    expect(txMonth(tx)).toBe("2026-11");
    expect(receivedForMonth("s1", [tx], "2026-11")).toBe(600);
    expect(receivedForMonth("s1", [tx], "2026-12")).toBe(0);
  });
});

describe("períodos", () => {
  it("mês passado cobre o mês anterior inteiro", () => {
    expect(presetPeriod("mes_passado", new Date(2026, 0, 15))).toEqual({
      from: "2025-12-01",
      to: "2025-12-31",
    });
  });
});

describe("importação do arquivo antigo", () => {
  it("converte o backup v1 mantendo os vínculos com o aluno", () => {
    let i = 0;
    const rows = parseBackup(
      {
        students: [
          {
            id: "old1",
            name: "Ana",
            hourValue: "90",
            packageValue: "",
            billing: "aula",
            absence: "cobrar",
          },
        ],
        classes: [
          {
            id: "c1",
            studentId: "old1",
            date: "2026-11-03",
            status: "realizada",
            groups: ["Peito"],
            value: "90",
          },
        ],
        assessments: [
          { id: "a1", studentId: "old1", date: "2026-11-01", weight: "61.5", fat: "24" },
        ],
        payments: [
          {
            id: "p1",
            studentId: "old1",
            date: "2026-11-04",
            amount: "90",
            method: "Pix",
            competence: "11/2026",
          },
        ],
      },
      () => `new${++i}`,
    );
    expect(rows.students[0]).toMatchObject({
      id: "new1",
      name: "Ana",
      lesson_value: 90,
      package_value: null,
      billing: "aula",
      absence_rule: "cobrar",
    });
    expect(rows.lessons[0]).toMatchObject({
      student_id: "new1",
      muscle_groups: ["Peito"],
      value: 90,
    });
    expect(rows.assessments[0]).toMatchObject({
      student_id: "new1",
      weight_kg: 61.5,
      body_fat_pct: 24,
    });
    expect(rows.transactions[0]).toMatchObject({
      student_id: "new1",
      kind: "receita",
      amount: 90,
      competence: "11/2026",
    });
  });
});

describe("rendimento", () => {
  it("média usa Ruim=1, Médio=2, Bom=3 e ignora aulas não realizadas ou sem avaliação", async () => {
    const { performanceSummary, perfLabel } = await import("@/lib/metrics");
    const s = performanceSummary([
      { ...lesson("realizada"), performance: "Bom" },
      { ...lesson("reposta"), performance: "Médio" },
      { ...lesson("realizada"), performance: "Bom" },
      { ...lesson("falta"), performance: "Ruim" },
      { ...lesson("realizada"), performance: null },
    ]);
    expect(s).toMatchObject({ bom: 2, medio: 1, ruim: 0, total: 3 });
    expect(s.avg).toBeCloseTo(8 / 3);
    expect(perfLabel(s.avg)).toBe("Bom");
  });

  it("separa o rendimento por mês", async () => {
    const { performanceByMonth } = await import("@/lib/metrics");
    const rows = performanceByMonth(
      [
        { ...lesson("realizada", "2027-01-05"), performance: "Ruim" },
        { ...lesson("realizada", "2027-02-05"), performance: "Bom" },
      ],
      ["2027-01", "2027-02"],
    );
    expect(rows.map((r) => [r.month, r.ruim, r.bom])).toEqual([
      ["2027-01", 1, 0],
      ["2027-02", 0, 1],
    ]);
  });
});
