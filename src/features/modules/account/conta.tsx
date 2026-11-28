"use client";

import { useNavigate } from "@/hooks/use-navigate";
import { useAuthUser } from "@/components/auth-guard";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Download, Loader2, LogOut, Share, ShieldCheck, SquarePlus, Upload } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { Link } from "@/components/app-link";
import {
  allQueryKeys,
  assessmentsQuery,
  importRows,
  lessonsQuery,
  studentsQuery,
  transactionsQuery,
} from "@/lib/data";
import { parseBackup, toExport } from "@/lib/backup";
import { today } from "@/lib/format";
import { Card, CardTitle, PageHeader } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";



function AccountPage() {
  const { user } = useAuthUser();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"export" | "import" | null>(null);

  async function exportBackup() {
    setBusy("export");
    try {
      const [students, lessons, assessments, transactions] = await Promise.all([
        qc.fetchQuery(studentsQuery),
        qc.fetchQuery(lessonsQuery),
        qc.fetchQuery(assessmentsQuery),
        qc.fetchQuery(transactionsQuery),
      ]);
      const blob = new Blob(
        [JSON.stringify(toExport({ students, lessons, assessments, transactions }), null, 2)],
        {
          type: "application/json",
        },
      );
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `personal-control-backup-${today()}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } catch {
      toast.error("Não foi possível gerar o backup.");
    } finally {
      setBusy(null);
    }
  }

  async function importBackup(file: File) {
    setBusy("import");
    try {
      const rows = parseBackup(JSON.parse(await file.text()));
      const total =
        rows.students.length +
        rows.lessons.length +
        rows.assessments.length +
        rows.transactions.length;
      if (total === 0) {
        toast.message("O arquivo não tem registros para importar.");
        return;
      }
      await importRows(rows);
      await Promise.all(allQueryKeys.map((queryKey) => qc.invalidateQueries({ queryKey })));
      toast.success(
        `Importado: ${rows.students.length} aluno(s), ${rows.lessons.length} aula(s), ${rows.assessments.length} avaliação(ões), ${rows.transactions.length} lançamento(s).`,
      );
    } catch {
      toast.error("Não foi possível importar. Confira se é um backup do Personal Control.");
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function signOut() {
    await authClient.signOut();
    qc.clear();
    void navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Conta e backup" subtitle={user.email ?? ""} />

      <Card>
        <CardTitle>Seus dados</CardTitle>
        <div className="flex items-start gap-3 rounded-xl bg-success-soft p-3 text-sm text-success">
          <ShieldCheck className="mt-0.5 size-5 shrink-0" />
          <p>
            Tudo é salvo automaticamente no banco local a cada alteração e só pode ser acessado pela sua
            conta. Seus alunos nunca ficam visíveis publicamente.
          </p>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Button variant="secondary" onClick={() => void exportBackup()} disabled={busy !== null}>
            {busy === "export" ? <Loader2 className="animate-spin" /> : <Download />} Exportar
            backup
          </Button>
          <Button
            variant="secondary"
            onClick={() => fileRef.current?.click()}
            disabled={busy !== null}
          >
            {busy === "import" ? <Loader2 className="animate-spin" /> : <Upload />} Importar backup
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void importBackup(f);
            }}
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          A importação aceita o arquivo “Exportar backup” da versão antiga (Personal_Control_v1) e
          desta versão. Os registros são adicionados aos que já existem.
        </p>
      </Card>

      <Card>
        <CardTitle>Instalar no iPhone</CardTitle>
        <ol className="space-y-2.5 text-sm">
          <li className="flex gap-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
              1
            </span>
            Abra este site no Safari.
          </li>
          <li className="flex gap-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
              2
            </span>
            <span>
              Toque em Compartilhar <Share className="inline size-4 align-text-bottom" />.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
              3
            </span>
            <span>
              Escolha “Adicionar à Tela de Início”{" "}
              <SquarePlus className="inline size-4 align-text-bottom" />.
            </span>
          </li>
        </ol>
      </Card>

      <Button asChild variant="secondary" className="w-full sm:w-auto">
        <Link to="/reset-password">Alterar senha</Link>
      </Button>

      <Button variant="danger" className="w-full sm:w-auto" onClick={() => void signOut()}>
        <LogOut /> Sair da conta
      </Button>
    </div>
  );
}

export default AccountPage;
