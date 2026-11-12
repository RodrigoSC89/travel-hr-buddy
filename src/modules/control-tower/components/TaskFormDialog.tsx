import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useContracts, useDeliverables, useSave } from "../api";
import { ACCEPTANCES, PRIORITIES } from "../constants";
import { useCtContext } from "../context";
import type { Acceptance, Priority, Task } from "../types";
import { Field, MemberSelect, OptionSelect } from "./shared";

type Draft = Partial<Task>;

const EDITABLE: (keyof Task)[] = [
  "priority",
  "front",
  "contract_id",
  "deliverable_id",
  "title",
  "executor_id",
  "reviewer_id",
  "executor_part",
  "reviewer_part",
  "start_date",
  "due_date",
  "hours_executor",
  "hours_reviewer",
  "client_acceptance",
  "next_action",
  "notes",
];

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  defaults,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  task?: Task | null;
  defaults?: Draft;
}) {
  const { me, members } = useCtContext();
  const { data: contracts = [] } = useContracts();
  const { data: deliverables = [] } = useDeliverables();
  const save = useSave<Task>("ct_tasks", task ? "Tarefa atualizada" : "Tarefa criada");
  const [d, setD] = React.useState<Draft>({});

  React.useEffect(() => {
    if (!open) return;
    if (task) setD({ ...task });
    else {
      const other = members.find((m) => m.id !== me.id && m.active);
      setD({ priority: "P2", executor_id: me.id, reviewer_id: other?.id, client_acceptance: "Não requerido", ...defaults });
    }
  }, [open, task, defaults, me.id, members]);

  const set = <K extends keyof Task>(k: K, v: Task[K] | null) => setD((p) => ({ ...p, [k]: v }));
  const sameReviewer = !!d.executor_id && d.executor_id === d.reviewer_id;
  const locked = task?.status === "em_double_check";
  const valid = !!d.title?.trim() && !!d.executor_id && !!d.reviewer_id && !sameReviewer;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const payload: Draft = { id: task?.id };
    for (const k of EDITABLE) (payload as Record<string, unknown>)[k] = d[k] ?? null;
    await save.mutateAsync(payload).then(() => onOpenChange(false)).catch(() => undefined);
  };

  const filteredDeliverables = d.contract_id ? deliverables.filter((x) => x.contract_id === d.contract_id) : deliverables;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? `Editar ${task.code}` : "Nova tarefa"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Tarefa / resultado esperado *" className="sm:col-span-2">
            <Input value={d.title ?? ""} onChange={(e) => set("title", e.target.value)} required />
          </Field>
          <Field label="Prioridade">
            <OptionSelect<Priority> value={d.priority} onChange={(v) => set("priority", v ?? "P2")} options={PRIORITIES} />
          </Field>
          <Field label="Cliente / frente">
            <Input value={d.front ?? ""} onChange={(e) => set("front", e.target.value)} placeholder="SEAGEMS, Corporativo…" />
          </Field>
          <Field label="Contrato">
            <OptionSelect
              value={d.contract_id}
              onChange={(v) => setD((p) => ({ ...p, contract_id: v, deliverable_id: null }))}
              allowEmpty
              options={contracts.map((c) => ({ value: c.id, label: `${c.code} · ${c.client}` }))}
            />
          </Field>
          <Field label="Entregável vinculado">
            <OptionSelect
              value={d.deliverable_id}
              onChange={(v) => set("deliverable_id", v)}
              allowEmpty
              options={filteredDeliverables.map((x) => ({ value: x.id, label: `${x.code} · ${x.package}` }))}
            />
          </Field>

          <div className="grid gap-4 rounded-lg border bg-muted/20 p-3 sm:col-span-2 sm:grid-cols-2">
            <Field label="Executor principal *" hint={locked ? "Bloqueado durante o double check" : undefined}>
              {locked ? (
                <Input disabled value={members.find((m) => m.id === d.executor_id)?.short_name ?? ""} />
              ) : (
                <MemberSelect value={d.executor_id} onChange={(v) => set("executor_id", v as string)} />
              )}
            </Field>
            <Field label="Revisor cruzado *" hint={sameReviewer ? "O revisor precisa ser outra pessoa" : "Quem aprova o double check"}>
              {locked ? (
                <Input disabled value={members.find((m) => m.id === d.reviewer_id)?.short_name ?? ""} />
              ) : (
                <MemberSelect value={d.reviewer_id} onChange={(v) => set("reviewer_id", v as string)} exclude={d.executor_id} />
              )}
            </Field>
            <Field label="Parte do executor">
              <Textarea rows={2} value={d.executor_part ?? ""} onChange={(e) => set("executor_part", e.target.value)} />
            </Field>
            <Field label="Parte do revisor">
              <Textarea rows={2} value={d.reviewer_part ?? ""} onChange={(e) => set("reviewer_part", e.target.value)} />
            </Field>
            <Field label="Horas estimadas (executor)">
              <Input
                type="number"
                step="0.25"
                min="0"
                value={d.hours_executor ?? ""}
                onChange={(e) => set("hours_executor", e.target.value === "" ? null : Number(e.target.value))}
              />
            </Field>
            <Field label="Horas estimadas (revisor)">
              <Input
                type="number"
                step="0.25"
                min="0"
                value={d.hours_reviewer ?? ""}
                onChange={(e) => set("hours_reviewer", e.target.value === "" ? null : Number(e.target.value))}
              />
            </Field>
          </div>

          <Field label="Início previsto">
            <Input type="date" value={d.start_date ?? ""} onChange={(e) => set("start_date", e.target.value || null)} />
          </Field>
          <Field label="Data limite">
            <Input type="date" value={d.due_date ?? ""} onChange={(e) => set("due_date", e.target.value || null)} />
          </Field>
          <Field label="Aceite do cliente" hint="Revisão interna dupla não substitui o aceite externo">
            <OptionSelect<Acceptance> value={d.client_acceptance} onChange={(v) => set("client_acceptance", v ?? "Não requerido")} options={ACCEPTANCES} />
          </Field>
          <Field label="Próxima ação">
            <Input value={d.next_action ?? ""} onChange={(e) => set("next_action", e.target.value)} />
          </Field>
          <Field label="Observações" className="sm:col-span-2">
            <Textarea rows={3} value={d.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
          </Field>

          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!valid || save.isPending}>
              {task ? "Salvar" : "Criar tarefa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
