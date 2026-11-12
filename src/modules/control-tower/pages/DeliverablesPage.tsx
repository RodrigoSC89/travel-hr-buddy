import * as React from "react";
import { CheckCircle2, Pencil, Plus, Send, Undo2, XCircle } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useContracts, useDeliverableProgress, useDeliverables, useLots, useRemove, useSave } from "../api";
import { ACCEPTANCES, DELIVERABLE_STATUSES, EXTERNAL_ACCEPTANCES, LOT_STATUSES } from "../constants";
import { useCtContext } from "../context";
import { deadlineTone, deadlineState, fmtDate, fmtDateTime, memberName } from "../lib/format";
import { exportExcel } from "../lib/export";
import { useExportData } from "../hooks";
import type { Acceptance, Deliverable, DeliverableLot, DeliverableStatus, ExternalAcceptance } from "../types";
import { EvidenceList } from "../components/EvidenceList";
import { EmptyRow, Field, MemberSelect, OptionSelect, PageHeader, Tone } from "../components/shared";

function DeliverableDialog({ open, onOpenChange, item }: { open: boolean; onOpenChange: (v: boolean) => void; item: Deliverable | null }) {
  const { data: contracts = [] } = useContracts();
  const save = useSave<Deliverable>("ct_deliverables", item ? "Entregável atualizado" : "Entregável criado");
  const [d, setD] = React.useState<Partial<Deliverable>>({});
  React.useEffect(() => {
    if (open) setD(item ? { ...item } : { status: "A iniciar", client_acceptance: "A confirmar" });
  }, [open, item]);
  const set = <K extends keyof Deliverable>(k: K, v: Deliverable[K] | null) => setD((p) => ({ ...p, [k]: v }));
  const same = !!d.executor_id && d.executor_id === d.reviewer_id;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await save.mutateAsync({ ...d, id: item?.id }).then(() => onOpenChange(false)).catch(() => undefined);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? `Editar ${item.code}` : "Novo entregável"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Field label="ID *">
            <Input value={d.code ?? ""} onChange={(e) => set("code", e.target.value.toUpperCase())} required placeholder="SEA-15" />
          </Field>
          <Field label="Contrato">
            <OptionSelect value={d.contract_id} onChange={(v) => set("contract_id", v)} allowEmpty options={contracts.map((c) => ({ value: c.id, label: `${c.code} · ${c.client}` }))} />
          </Field>
          <Field label="Pacote / entregável *" className="sm:col-span-2">
            <Input value={d.package ?? ""} onChange={(e) => set("package", e.target.value)} required />
          </Field>
          <Field label="Unidade / embarcação">
            <Input value={d.unit ?? ""} onChange={(e) => set("unit", e.target.value)} />
          </Field>
          <Field label="Meta (quantidade)" hint="Deixe vazio quando o volume não é fixado">
            <Input type="number" min="0" value={d.target_qty ?? ""} onChange={(e) => set("target_qty", e.target.value === "" ? null : Number(e.target.value))} />
          </Field>
          <Field label="Gatilho / regra" className="sm:col-span-2">
            <Input value={d.rule ?? ""} onChange={(e) => set("rule", e.target.value)} />
          </Field>
          <Field label="Prazo aprovado">
            <Input type="date" value={d.due_date ?? ""} onChange={(e) => set("due_date", e.target.value || null)} />
          </Field>
          <Field label="Status">
            <OptionSelect<DeliverableStatus> value={d.status} onChange={(v) => set("status", v ?? "A iniciar")} options={DELIVERABLE_STATUSES} />
          </Field>
          <Field label="Executor">
            <MemberSelect value={d.executor_id} onChange={(v) => set("executor_id", v)} allowEmpty />
          </Field>
          <Field label="Revisor" hint={same ? "Deve ser diferente do executor" : undefined}>
            <MemberSelect value={d.reviewer_id} onChange={(v) => set("reviewer_id", v)} allowEmpty exclude={d.executor_id} />
          </Field>
          <Field label="Aceite do cliente">
            <OptionSelect<Acceptance> value={d.client_acceptance} onChange={(v) => set("client_acceptance", v ?? "A confirmar")} options={ACCEPTANCES} />
          </Field>
          <Field label="Fonte">
            <Input value={d.source ?? ""} onChange={(e) => set("source", e.target.value)} />
          </Field>
          <Field label="Observações / critério de aceite" className="sm:col-span-2">
            <Textarea rows={3} value={d.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
          </Field>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={save.isPending || same || !d.code || !d.package}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function LotCard({ lot }: { lot: DeliverableLot }) {
  const { me, members } = useCtContext();
  const save = useSave<DeliverableLot>("ct_deliverable_lots", "");
  const remove = useRemove("ct_deliverable_lots");
  const [evidence, setEvidence] = React.useState(lot.evidence_note ?? "");
  const [comment, setComment] = React.useState("");
  const meta = LOT_STATUSES.find((s) => s.value === lot.status);
  const isExec = lot.executor_id === me.id;
  const canReview = lot.status === "em_double_check" && lot.submitted_by !== me.id;
  const act = (patch: Partial<DeliverableLot>, msg: string) =>
    save.mutateAsync({ id: lot.id, ...patch }).then(() => toast.success(msg)).catch(() => undefined);

  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">
          {lot.description} <span className="text-muted-foreground">· {lot.qty} un.</span>
        </p>
        <Tone className={meta?.tone}>{meta?.label}</Tone>
      </div>
      <p className="text-xs text-muted-foreground">
        Executor {memberName(members, lot.executor_id)}
        {lot.submitted_at && ` · enviado ${fmtDateTime(lot.submitted_at)}`}
        {lot.reviewed_at && ` · revisado por ${memberName(members, lot.reviewed_by)} em ${fmtDateTime(lot.reviewed_at)}`}
      </p>
      {lot.review_comment && <p className="rounded bg-muted/50 px-2 py-1 text-xs">{lot.review_comment}</p>}

      {(lot.status === "rascunho" || lot.status === "reprovado") && isExec && (
        <div className="space-y-2">
          <Textarea rows={2} placeholder="Evidência / versão (obrigatório)" value={evidence} onChange={(e) => setEvidence(e.target.value)} />
          <EvidenceList parent={{ lot_id: lot.id }} />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => act({ status: "em_double_check", evidence_note: evidence.trim() || null }, "Lote enviado para double check")}>
              <Send className="mr-2 h-3.5 w-3.5" /> Enviar para double check
            </Button>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove.mutate(lot.id)}>
              Excluir
            </Button>
          </div>
        </div>
      )}
      {lot.status !== "rascunho" && lot.evidence_note && <p className="text-xs"><span className="text-muted-foreground">Evidência: </span>{lot.evidence_note}</p>}
      {lot.status !== "rascunho" && lot.status !== "reprovado" && <EvidenceList parent={{ lot_id: lot.id }} readOnly />}

      {lot.status === "em_double_check" && (
        canReview ? (
          <div className="space-y-2 rounded-md border border-violet-500/40 bg-violet-500/5 p-2">
            <Textarea rows={2} placeholder="Comentário (obrigatório para reprovar)" value={comment} onChange={(e) => setComment(e.target.value)} />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => act({ status: "aprovado", review_comment: comment.trim() || null }, "Lote aprovado")}>
                <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Aprovar
              </Button>
              <Button size="sm" variant="outline" onClick={() => act({ status: "reprovado", review_comment: comment.trim() }, "Lote reprovado")}>
                <XCircle className="mr-2 h-3.5 w-3.5" /> Reprovar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-violet-600 dark:text-violet-300">Aguardando revisão de outra pessoa.</p>
            {lot.submitted_by === me.id && (
              <Button size="sm" variant="ghost" onClick={() => act({ status: "rascunho" }, "Lote recolhido")}>
                <Undo2 className="mr-2 h-3.5 w-3.5" /> Recolher
              </Button>
            )}
          </div>
        )
      )}

      {lot.status === "aprovado" && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Aceite externo:</span>
          <OptionSelect<ExternalAcceptance>
            className="h-8 w-44"
            value={lot.external_acceptance}
            onChange={(v) => v && act({ external_acceptance: v }, `Aceite externo: ${v}`)}
            options={EXTERNAL_ACCEPTANCES}
          />
        </div>
      )}
    </div>
  );
}

function NewLot({ deliverable }: { deliverable: Deliverable }) {
  const { me } = useCtContext();
  const save = useSave<DeliverableLot>("ct_deliverable_lots", "Lote criado");
  const [description, setDescription] = React.useState("");
  const [qty, setQty] = React.useState("1");
  const [external, setExternal] = React.useState<ExternalAcceptance>(deliverable.client_acceptance === "Não requerido" ? "Não requerido" : "Pendente");
  const [executor, setExecutor] = React.useState<string | null>(deliverable.executor_id ?? me.id);
  const create = () => {
    if (!description.trim() || !Number(qty) || !executor) return toast.error("Informe descrição, quantidade e executor");
    save
      .mutateAsync({ deliverable_id: deliverable.id, description: description.trim(), qty: Number(qty), executor_id: executor, external_acceptance: external })
      .then(() => {
        setDescription("");
        setQty("1");
      })
      .catch(() => undefined);
  };
  return (
    <div className="grid gap-2 rounded-lg border border-dashed p-3 sm:grid-cols-[1fr_80px]">
      <Input placeholder="Descrição do lote (ex.: Turma 01 · 12 relatórios)" value={description} onChange={(e) => setDescription(e.target.value)} />
      <Input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} aria-label="Quantidade" />
      <div className="grid gap-2 sm:col-span-2 sm:grid-cols-3">
        <MemberSelect value={executor} onChange={setExecutor} />
        <OptionSelect<ExternalAcceptance> value={external} onChange={(v) => setExternal(v ?? "Não requerido")} options={EXTERNAL_ACCEPTANCES} />
        <Button onClick={create} disabled={save.isPending}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar lote
        </Button>
      </div>
    </div>
  );
}

export default function DeliverablesPage() {
  const { members } = useCtContext();
  const { data: items = [], isLoading } = useDeliverables();
  const { data: contracts = [] } = useContracts();
  const { data: progress = [] } = useDeliverableProgress();
  const { data: lots = [] } = useLots();
  const exportData = useExportData();
  const [params, setParams] = useSearchParams();
  const [editing, setEditing] = React.useState<Deliverable | null | undefined>(undefined);
  const [contractFilter, setContractFilter] = React.useState<string | null>(null);
  const selected = items.find((d) => d.id === params.get("d")) ?? null;
  const select = (d: Deliverable | null) => setParams(d ? { d: d.id } : {}, { replace: true });
  const prog = (id: string) => progress.find((p) => p.deliverable_id === id);

  const shown = items.filter((d) => !contractFilter || d.contract_id === contractFilter);

  return (
    <div>
      <PageHeader
        title="Entregáveis"
        subtitle="Quantidade concluída vem exclusivamente de lotes aprovados no double check (e aceitos, quando exigido)."
        actions={
          <>
            <Button variant="outline" size="sm" disabled={!exportData} onClick={() => exportData && exportExcel(exportData, "Entregaveis")}>
              Exportar Excel
            </Button>
            <Button size="sm" onClick={() => setEditing(null)}>
              <Plus className="mr-2 h-4 w-4" /> Novo entregável
            </Button>
          </>
        }
      />
      <div className="mb-4 w-full sm:w-64">
        <OptionSelect
          value={contractFilter}
          onChange={setContractFilter}
          allowEmpty
          placeholder="Todos os contratos"
          options={contracts.map((c) => ({ value: c.id, label: `${c.code} · ${c.client}` }))}
        />
      </div>
      {isLoading ? (
        <EmptyRow text="Carregando…" />
      ) : shown.length === 0 ? (
        <EmptyRow />
      ) : (
        <Card className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">ID</TableHead>
                <TableHead>Pacote / entregável</TableHead>
                <TableHead className="hidden lg:table-cell">Unidade</TableHead>
                <TableHead className="w-44">Progresso</TableHead>
                <TableHead className="hidden md:table-cell">Exec · Rev</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prazo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shown.map((d) => {
                const p = prog(d.id);
                const rel = Number(p?.released_qty ?? 0);
                const tgt = d.target_qty != null ? Number(d.target_qty) : null;
                const dl = deadlineState(d.due_date, d.status === "Concluído");
                return (
                  <TableRow key={d.id} className="cursor-pointer" onClick={() => select(d)}>
                    <TableCell className="font-mono text-xs">{d.code}</TableCell>
                    <TableCell className="min-w-[220px]">
                      <p className="font-medium">{d.package}</p>
                      <p className="text-xs text-muted-foreground">{contracts.find((c) => c.id === d.contract_id)?.client}</p>
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">{d.unit}</TableCell>
                    <TableCell>
                      {tgt ? (
                        <div className="flex items-center gap-2">
                          <Progress value={(rel / tgt) * 100} className="h-1.5" />
                          <span className="shrink-0 text-xs tabular-nums">
                            {rel}/{tgt}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">{rel} liberados · sem meta</span>
                      )}
                      {Number(p?.in_review_qty ?? 0) > 0 && <p className="text-[10px] text-violet-600 dark:text-violet-300">{p?.in_review_qty} em double check</p>}
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap text-sm md:table-cell">
                      {memberName(members, d.executor_id)} · {memberName(members, d.reviewer_id)}
                    </TableCell>
                    <TableCell>
                      <Tone>{d.status}</Tone>
                    </TableCell>
                    <TableCell className={cn("whitespace-nowrap text-sm", deadlineTone[dl])}>{fmtDate(d.due_date)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {selected && (
        <Sheet open onOpenChange={(v) => !v && select(null)}>
          <SheetContent className="w-full max-w-full overflow-y-auto p-5 pt-10 sm:max-w-xl sm:p-6 sm:pt-10">
            <SheetHeader className="text-left">
              <p className="font-mono text-xs text-muted-foreground">
                {selected.code} · {contracts.find((c) => c.id === selected.contract_id)?.client ?? "sem contrato"}
              </p>
              <SheetTitle>{selected.package}</SheetTitle>
            </SheetHeader>
            <Button size="sm" variant="outline" className="mt-3" onClick={() => setEditing(selected)}>
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </Button>
            <dl className="mt-4 grid grid-cols-[130px_1fr] gap-x-2 gap-y-1.5 text-sm">
              {(
                [
                  ["Unidade", selected.unit],
                  ["Meta", selected.target_qty != null ? String(selected.target_qty) : "Não fixada"],
                  ["Liberados", String(prog(selected.id)?.released_qty ?? 0)],
                  ["Regra / gatilho", selected.rule],
                  ["Prazo", fmtDate(selected.due_date)],
                  ["Executor / revisor", `${memberName(members, selected.executor_id)} / ${memberName(members, selected.reviewer_id)}`],
                  ["Status", selected.status],
                  ["Aceite cliente", selected.client_acceptance],
                  ["Fonte", selected.source],
                  ["Observações", selected.notes],
                ] as [string, string | null][]
              ).map(([k, v]) => (
                <React.Fragment key={k}>
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="break-words">{v || "—"}</dd>
                </React.Fragment>
              ))}
            </dl>
            <h3 className="mb-2 mt-6 text-sm font-semibold">Lotes · aceites e double check</h3>
            <div className="space-y-3">
              {lots
                .filter((l) => l.deliverable_id === selected.id)
                .map((l) => (
                  <LotCard key={l.id} lot={l} />
                ))}
              <NewLot deliverable={selected} />
            </div>
          </SheetContent>
        </Sheet>
      )}
      <DeliverableDialog open={editing !== undefined} onOpenChange={(v) => !v && setEditing(undefined)} item={editing ?? null} />
    </div>
  );
}
