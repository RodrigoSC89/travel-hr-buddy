import * as React from "react";
import { Pencil, Plus } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useContracts, useDeliverableProgress, useDeliverables, useSave, useTasks } from "../api";
import { CT_BASE, YES_NO, taskStatusLabel, taskStatusTone } from "../constants";
import { useCtContext } from "../context";
import { fmtDate, memberName } from "../lib/format";
import { exportExcel } from "../lib/export";
import { useExportData } from "../hooks";
import type { Contract, YesNo } from "../types";
import { EvidenceList } from "../components/EvidenceList";
import { EmptyRow, Field, MemberSelect, OptionSelect, PageHeader, Tone } from "../components/shared";

const ynTone = (v: YesNo) =>
  v === "Sim" ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-300" : v === "Não" ? "border-red-500/40 text-red-700 dark:text-red-300" : "border-amber-500/40 text-amber-700 dark:text-amber-300";

function ContractDialog({ open, onOpenChange, contract }: { open: boolean; onOpenChange: (v: boolean) => void; contract: Contract | null }) {
  const save = useSave<Contract>("ct_contracts", contract ? "Contrato atualizado" : "Contrato criado");
  const [d, setD] = React.useState<Partial<Contract>>({});
  React.useEffect(() => {
    if (open) setD(contract ? { ...contract } : { status_informed: "Vigente (informado)", signed_status: "A confirmar", scope_status: "A confirmar", finance_status: "Não" });
  }, [open, contract]);
  const set = <K extends keyof Contract>(k: K, v: Contract[K] | null) => setD((p) => ({ ...p, [k]: v }));
  const same = !!d.leader_id && d.leader_id === d.reviewer_id;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rest: Partial<Contract> = { ...d };
    delete rest.updated_at;
    await save.mutateAsync({ ...rest, id: contract?.id }).then(() => onOpenChange(false)).catch(() => undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{contract ? `Editar ${contract.code}` : "Novo contrato"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Field label="ID contrato *">
            <Input value={d.code ?? ""} onChange={(e) => set("code", e.target.value.toUpperCase())} placeholder="CTR-XXX" required />
          </Field>
          <Field label="Cliente *">
            <Input value={d.client ?? ""} onChange={(e) => set("client", e.target.value)} required />
          </Field>
          <Field label="Status informado">
            <Input value={d.status_informed ?? ""} onChange={(e) => set("status_informed", e.target.value)} />
          </Field>
          <Field label="Contrato assinado conferido?" hint="Ata ou proposta não substitui contrato assinado">
            <OptionSelect<YesNo> value={d.signed_status} onChange={(v) => set("signed_status", v ?? "A confirmar")} options={YES_NO} />
          </Field>
          <Field label="Fonte / versão" className="sm:col-span-2">
            <Input value={d.source_version ?? ""} onChange={(e) => set("source_version", e.target.value)} />
          </Field>
          <Field label="Início">
            <Input type="date" value={d.start_date ?? ""} onChange={(e) => set("start_date", e.target.value || null)} />
          </Field>
          <Field label="Fim">
            <Input type="date" value={d.end_date ?? ""} onChange={(e) => set("end_date", e.target.value || null)} />
          </Field>
          <Field label="Líder MB">
            <MemberSelect value={d.leader_id} onChange={(v) => set("leader_id", v)} allowEmpty />
          </Field>
          <Field label="Revisor MB" hint={same ? "Deve ser diferente do líder" : undefined}>
            <MemberSelect value={d.reviewer_id} onChange={(v) => set("reviewer_id", v)} allowEmpty exclude={d.leader_id} />
          </Field>
          <Field label="Ponto focal do cliente" className="sm:col-span-2">
            <Input value={d.client_focal ?? ""} onChange={(e) => set("client_focal", e.target.value)} />
          </Field>
          <Field label="Escopo operacionalizado?">
            <OptionSelect<YesNo> value={d.scope_status} onChange={(v) => set("scope_status", v ?? "A confirmar")} options={YES_NO} />
          </Field>
          <Field label="Financeiro conciliado?">
            <OptionSelect<YesNo> value={d.finance_status} onChange={(v) => set("finance_status", v ?? "Não")} options={YES_NO} />
          </Field>
          <Field label="Próximo marco">
            <Input value={d.next_milestone ?? ""} onChange={(e) => set("next_milestone", e.target.value)} />
          </Field>
          <Field label="Próxima ação">
            <Input value={d.next_action ?? ""} onChange={(e) => set("next_action", e.target.value)} />
          </Field>
          <Field label="Observações / lacunas" className="sm:col-span-2">
            <Textarea rows={3} value={d.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
          </Field>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={save.isPending || same || !d.code || !d.client}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ContractsPage() {
  const { members } = useCtContext();
  const { data: contracts = [], isLoading } = useContracts();
  const { data: deliverables = [] } = useDeliverables();
  const { data: progress = [] } = useDeliverableProgress();
  const { data: tasks = [] } = useTasks();
  const exportData = useExportData();
  const [params, setParams] = useSearchParams();
  const [editing, setEditing] = React.useState<Contract | null | undefined>(undefined);
  const selected = contracts.find((c) => c.id === params.get("c")) ?? null;
  const select = (c: Contract | null) => setParams(c ? { c: c.id } : {}, { replace: true });

  return (
    <div>
      <PageHeader
        title="Contratos"
        subtitle="Diferenciar contrato vigente informado de instrumento assinado efetivamente conferido."
        actions={
          <>
            <Button variant="outline" size="sm" disabled={!exportData} onClick={() => exportData && exportExcel(exportData, "Contratos")}>
              Exportar Excel
            </Button>
            <Button size="sm" onClick={() => setEditing(null)}>
              <Plus className="mr-2 h-4 w-4" /> Novo contrato
            </Button>
          </>
        }
      />
      {isLoading ? (
        <EmptyRow text="Carregando…" />
      ) : contracts.length === 0 ? (
        <EmptyRow />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {contracts.map((c) => {
            const ds = deliverables.filter((d) => d.contract_id === c.id);
            const ts = tasks.filter((t) => t.contract_id === c.id && t.status !== "concluida");
            const tgt = ds.reduce((s, d) => s + Number(d.target_qty ?? 0), 0);
            const rel = ds.reduce((s, d) => s + Number(progress.find((p) => p.deliverable_id === d.id)?.released_qty ?? 0), 0);
            return (
              <Card key={c.id} className="cursor-pointer transition hover:border-primary/40" onClick={() => select(c)}>
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-lg font-semibold">{c.client}</p>
                      <p className="font-mono text-xs text-muted-foreground">{c.code}</p>
                    </div>
                    <Tone className="border-blue-500/40 text-blue-700 dark:text-blue-300">{c.status_informed}</Tone>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Tone className={ynTone(c.signed_status)}>Assinado: {c.signed_status}</Tone>
                    <Tone className={ynTone(c.scope_status)}>Escopo: {c.scope_status}</Tone>
                    <Tone className={ynTone(c.finance_status)}>Financeiro: {c.finance_status}</Tone>
                  </div>
                  <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/40 p-2 text-center">
                    <div>
                      <p className="text-lg font-semibold">{ds.length}</p>
                      <p className="text-[10px] text-muted-foreground">entregáveis</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{ts.length}</p>
                      <p className="text-[10px] text-muted-foreground">tarefas abertas</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">
                        {rel}
                        <span className="text-xs text-muted-foreground">/{tgt}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground">unid. liberadas</p>
                    </div>
                  </div>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Próximo marco: </span>
                    {c.next_milestone || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Líder {memberName(members, c.leader_id)} · Revisor {memberName(members, c.reviewer_id)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selected && (
        <Sheet open onOpenChange={(v) => !v && select(null)}>
          <SheetContent className="w-full max-w-full overflow-y-auto p-5 pt-10 sm:max-w-xl sm:p-6 sm:pt-10">
            <SheetHeader className="text-left">
              <p className="font-mono text-xs text-muted-foreground">{selected.code}</p>
              <SheetTitle>{selected.client}</SheetTitle>
            </SheetHeader>
            <Button size="sm" variant="outline" className="mt-3" onClick={() => setEditing(selected)}>
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </Button>
            <dl className="mt-4 grid grid-cols-[150px_1fr] gap-x-2 gap-y-1.5 text-sm">
              {(
                [
                  ["Status informado", selected.status_informed],
                  ["Assinado conferido", selected.signed_status],
                  ["Fonte / versão", selected.source_version],
                  ["Vigência", `${fmtDate(selected.start_date)} → ${fmtDate(selected.end_date)}`],
                  ["Líder / revisor", `${memberName(members, selected.leader_id)} / ${memberName(members, selected.reviewer_id)}`],
                  ["Ponto focal", selected.client_focal],
                  ["Escopo operacionalizado", selected.scope_status],
                  ["Financeiro conciliado", selected.finance_status],
                  ["Próximo marco", selected.next_milestone],
                  ["Próxima ação", selected.next_action],
                  ["Observações", selected.notes],
                ] as [string, string | null][]
              ).map(([k, v]) => (
                <React.Fragment key={k}>
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="break-words">{v || "—"}</dd>
                </React.Fragment>
              ))}
            </dl>

            <h3 className="mb-2 mt-6 text-sm font-semibold">Instrumentos e documentos</h3>
            <EvidenceList parent={{ contract_id: selected.id }} />

            <h3 className="mb-2 mt-6 text-sm font-semibold">Entregáveis</h3>
            <div className="space-y-1">
              {deliverables
                .filter((d) => d.contract_id === selected.id)
                .map((d) => (
                  <Link key={d.id} to={`${CT_BASE}/entregaveis?d=${d.id}`} className="flex gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted">
                    <span className="font-mono text-xs text-muted-foreground">{d.code}</span>
                    <span className="flex-1 truncate">{d.package}</span>
                    <span className="text-xs text-muted-foreground">{d.unit}</span>
                  </Link>
                ))}
            </div>

            <h3 className="mb-2 mt-6 text-sm font-semibold">Tarefas</h3>
            <div className="space-y-1">
              {tasks
                .filter((t) => t.contract_id === selected.id)
                .map((t) => (
                  <Link key={t.id} to={`${CT_BASE}/tarefas?task=${t.id}`} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted">
                    <span className="font-mono text-xs text-muted-foreground">{t.code}</span>
                    <span className="flex-1 truncate">{t.title}</span>
                    <Tone className={cn("text-[10px]", taskStatusTone(t.status))}>{taskStatusLabel(t.status)}</Tone>
                  </Link>
                ))}
            </div>
          </SheetContent>
        </Sheet>
      )}
      <ContractDialog open={editing !== undefined} onOpenChange={(v) => !v && setEditing(undefined)} contract={editing ?? null} />
    </div>
  );
}
