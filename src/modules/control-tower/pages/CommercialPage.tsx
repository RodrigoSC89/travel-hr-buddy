import * as React from "react";
import { DndContext, PointerSensor, TouchSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { CalendarClock, Plus, ShieldAlert, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useOpportunities, useRemove, useSave } from "../api";
import { CAPACITY_GATED_PHASES, OPPORTUNITY_PHASES, PIPELINE_STAGES, YES_NO } from "../constants";
import { useCtContext } from "../context";
import { deadlineState, deadlineTone, fmtShort } from "../lib/format";
import { exportExcel } from "../lib/export";
import { useExportData } from "../hooks";
import type { Opportunity, OpportunityPhase, YesNo } from "../types";
import { Field, MemberAvatar, MemberSelect, OptionSelect, PageHeader, Tone } from "../components/shared";

const brl = (v: number | null) => (v == null ? null : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }));

function OppDialog({ open, onOpenChange, item }: { open: boolean; onOpenChange: (v: boolean) => void; item: Opportunity | null }) {
  const { me, members } = useCtContext();
  const save = useSave<Opportunity>("ct_opportunities", item ? "Oportunidade atualizada" : "Oportunidade criada");
  const remove = useRemove("ct_opportunities");
  const [d, setD] = React.useState<Partial<Opportunity>>({});
  React.useEffect(() => {
    if (!open) return;
    const other = members.find((m) => m.id !== me.id);
    setD(item ? { ...item } : { phase: "A contatar", owner_id: me.id, reviewer_id: other?.id ?? null, meeting_confirmed: "Não", proposal_sent: "Não", capacity_checked: "Não" });
  }, [open, item, me.id, members]);
  const set = <K extends keyof Opportunity>(k: K, v: Opportunity[K] | null) => setD((p) => ({ ...p, [k]: v }));
  const gated = !!d.phase && CAPACITY_GATED_PHASES.includes(d.phase) && d.capacity_checked !== "Sim";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (gated) return void toast.error("Confirme a capacidade antes de enviar proposta / negociar");
    await save.mutateAsync({ ...d, id: item?.id }).then(() => onOpenChange(false)).catch(() => undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? `${item.code} · ${item.account}` : "Nova oportunidade"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Conta *">
            <Input value={d.account ?? ""} onChange={(e) => set("account", e.target.value)} required />
          </Field>
          <Field label="Contato">
            <Input value={d.contact ?? ""} onChange={(e) => set("contact", e.target.value)} />
          </Field>
          <Field label="Fase real">
            <OptionSelect<OpportunityPhase> value={d.phase} onChange={(v) => set("phase", v ?? "A contatar")} options={OPPORTUNITY_PHASES} />
          </Field>
          <Field label="Follow-up">
            <Input type="date" value={d.follow_up_date ?? ""} onChange={(e) => set("follow_up_date", e.target.value || null)} />
          </Field>
          <Field label="Oportunidade / demanda" className="sm:col-span-2">
            <Input value={d.demand ?? ""} onChange={(e) => set("demand", e.target.value)} />
          </Field>
          <Field label="Próxima ação" className="sm:col-span-2">
            <Input value={d.next_action ?? ""} onChange={(e) => set("next_action", e.target.value)} />
          </Field>
          <Field label="Responsável">
            <MemberSelect value={d.owner_id} onChange={(v) => set("owner_id", v)} allowEmpty />
          </Field>
          <Field label="Revisor">
            <MemberSelect value={d.reviewer_id} onChange={(v) => set("reviewer_id", v)} allowEmpty exclude={d.owner_id} />
          </Field>
          <Field label="Reunião confirmada?">
            <OptionSelect<YesNo> value={d.meeting_confirmed} onChange={(v) => set("meeting_confirmed", v ?? "Não")} options={YES_NO} />
          </Field>
          <Field label="Proposta enviada?">
            <OptionSelect<"Sim" | "Não"> value={d.proposal_sent} onChange={(v) => set("proposal_sent", v ?? "Não")} options={["Sim", "Não"]} />
          </Field>
          <Field label="Capacidade checada?" hint="Obrigatório antes de proposta, negociação ou ganho">
            <OptionSelect<"Sim" | "Não"> value={d.capacity_checked} onChange={(v) => set("capacity_checked", v ?? "Não")} options={["Sim", "Não"]} />
          </Field>
          <Field label="Valor estimado (R$)">
            <Input type="number" min="0" value={d.estimated_value ?? ""} onChange={(e) => set("estimated_value", e.target.value === "" ? null : Number(e.target.value))} />
          </Field>
          <Field label="Status da evidência" className="sm:col-span-2">
            <Input value={d.evidence_status ?? ""} onChange={(e) => set("evidence_status", e.target.value)} placeholder="Registro em ata, e-mail, proposta Rev…" />
          </Field>
          <Field label="Observações" className="sm:col-span-2">
            <Textarea rows={3} value={d.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
          </Field>
          {gated && (
            <p className="flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-300 sm:col-span-2">
              <ShieldAlert className="h-4 w-4" /> Contato não é contrato: capacidade + escopo + proposta revisada antes de comprometer.
            </p>
          )}
          <DialogFooter className="gap-2 sm:col-span-2">
            {item && (
              <Button type="button" variant="ghost" className="mr-auto text-destructive" onClick={() => remove.mutateAsync(item.id).then(() => onOpenChange(false)).catch(() => undefined)}>
                <Trash2 className="mr-2 h-4 w-4" /> Excluir
              </Button>
            )}
            <Button type="submit" disabled={save.isPending || !d.account}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function OppCard({ o, onOpen }: { o: Opportunity; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: o.id });
  const dl = deadlineState(o.follow_up_date, ["Ganha", "Perdida"].includes(o.phase));
  return (
    // dnd-kit `attributes` provide role="button" and tabIndex for keyboard access
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onOpen}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined}
      className={cn("cursor-grab touch-none rounded-lg border bg-card p-3 shadow-sm transition hover:border-primary/50", isDragging && "z-50 shadow-lg ring-2 ring-primary")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium">{o.account}</p>
          {o.contact && <p className="truncate text-xs text-muted-foreground">{o.contact}</p>}
        </div>
        <MemberAvatar id={o.owner_id} />
      </div>
      <Tone className="mt-2 text-[10px]">{o.phase}</Tone>
      {o.next_action && <p className="mt-2 line-clamp-2 text-xs">{o.next_action}</p>}
      <div className="mt-2 flex items-center justify-between text-[11px]">
        <span className={cn("flex items-center gap-1", deadlineTone[dl])}>
          <CalendarClock className="h-3 w-3" /> {o.follow_up_date ? fmtShort(o.follow_up_date) : "sem follow-up"}
        </span>
        {o.estimated_value != null && <span className="font-medium">{brl(o.estimated_value)}</span>}
      </div>
      {o.capacity_checked === "Sim" && <p className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400">Capacidade checada</p>}
    </div>
  );
}

function Stage({ stage, items, onOpen }: { stage: (typeof PIPELINE_STAGES)[number]; items: Opportunity[]; onOpen: (o: Opportunity) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.key });
  const total = items.reduce((s, o) => s + Number(o.estimated_value ?? 0), 0);
  return (
    <div ref={setNodeRef} className={cn("flex w-[78vw] max-w-[300px] shrink-0 flex-col rounded-xl border bg-muted/30 sm:w-[270px]", isOver && "border-primary bg-primary/5")}>
      <div className="flex items-center justify-between border-b px-3 py-2.5">
        <span className="text-sm font-semibold">{stage.label}</span>
        <span className="text-xs text-muted-foreground">
          {items.length}
          {total > 0 && ` · ${brl(total)}`}
        </span>
      </div>
      <div className="flex min-h-[120px] flex-col gap-2 p-2">
        {items.map((o) => (
          <OppCard key={o.id} o={o} onOpen={() => onOpen(o)} />
        ))}
      </div>
    </div>
  );
}

export default function CommercialPage() {
  const { data: opps = [] } = useOpportunities();
  const exportData = useExportData();
  const save = useSave<Opportunity>("ct_opportunities", "");
  const [editing, setEditing] = React.useState<Opportunity | null | undefined>(undefined);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }));

  const onDragEnd = (e: DragEndEvent) => {
    const o = opps.find((x) => x.id === e.active.id);
    const stage = PIPELINE_STAGES.find((s) => s.key === e.over?.id);
    if (!o || !stage || stage.phases.includes(o.phase)) return;
    const phase = stage.phases[0];
    if (CAPACITY_GATED_PHASES.includes(phase) && o.capacity_checked !== "Sim") {
      toast.error("Contato não é contrato: confirme a capacidade antes de avançar para proposta");
      return setEditing(o);
    }
    save.mutateAsync({ id: o.id, phase }).then(() => toast.success(`${o.account} → ${phase}`)).catch(() => undefined);
  };

  const pipelineValue = opps.filter((o) => !["Ganha", "Perdida"].includes(o.phase)).reduce((s, o) => s + Number(o.estimated_value ?? 0), 0);

  return (
    <div>
      <PageHeader
        title="Comercial"
        subtitle={`Propostas e prospecção · ${opps.length} contas${pipelineValue ? ` · pipeline ${brl(pipelineValue)}` : ""}. Novo cliente: demanda → escopo → horas → capacidade → preço → double check → proposta.`}
        actions={
          <>
            <Button variant="outline" size="sm" disabled={!exportData} onClick={() => exportData && exportExcel(exportData, "Comercial")}>
              Exportar Excel
            </Button>
            <Button size="sm" onClick={() => setEditing(null)}>
              <Plus className="mr-2 h-4 w-4" /> Nova oportunidade
            </Button>
          </>
        }
      />
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
          {PIPELINE_STAGES.map((s) => (
            <Stage key={s.key} stage={s} items={opps.filter((o) => s.phases.includes(o.phase))} onOpen={setEditing} />
          ))}
        </div>
      </DndContext>
      <OppDialog open={editing !== undefined} onOpenChange={(v) => !v && setEditing(undefined)} item={editing ?? null} />
    </div>
  );
}
