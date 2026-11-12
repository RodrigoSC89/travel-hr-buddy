import * as React from "react";
import { History, Pencil, RotateCcw, Send, ShieldCheck, Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useContracts, useDeliverables, useRemove, useTaskHistory } from "../api";
import { FREE_TASK_STATUSES, TASK_STATUSES, priorityTone, taskStatusLabel, taskStatusTone } from "../constants";
import { useCtContext } from "../context";
import { deadlineLabel, deadlineTone, fmtDate, fmtDateTime, memberName, taskDeadline } from "../lib/format";
import type { Task, TaskStatus } from "../types";
import { EvidenceList } from "./EvidenceList";
import { TaskFormDialog } from "./TaskFormDialog";
import { TaskWorkflowDialog, taskPermissions, useTaskStatusChange, type WorkflowMode } from "./TaskWorkflow";
import { MemberAvatar, OptionSelect, Tone } from "./shared";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2 py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words">{children}</span>
    </div>
  );
}

export function TaskSheet({ task, onClose }: { task: Task | null; onClose: () => void }) {
  const { me, members } = useCtContext();
  const { data: contracts = [] } = useContracts();
  const { data: deliverables = [] } = useDeliverables();
  const { data: history = [] } = useTaskHistory(task?.id);
  const { change, isPending } = useTaskStatusChange();
  const remove = useRemove("ct_tasks");
  const [editing, setEditing] = React.useState(false);
  const [mode, setMode] = React.useState<WorkflowMode | null>(null);

  if (!task) return null;
  const perms = taskPermissions(task, me.id);
  const dl = taskDeadline(task);
  const contract = contracts.find((c) => c.id === task.contract_id);
  const deliverable = deliverables.find((d) => d.id === task.deliverable_id);

  const setFree = (s: TaskStatus | null) => {
    if (!s || s === task.status) return;
    change(task, s).then(() => toast.success(`Status: ${taskStatusLabel(s)}`)).catch(() => undefined);
  };

  return (
    <>
      <Sheet open onOpenChange={(v) => !v && onClose()}>
        <SheetContent className="w-full max-w-full overflow-y-auto p-5 pt-10 sm:max-w-xl sm:p-6 sm:pt-10">
          <SheetHeader className="space-y-2 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">{task.code}</span>
              <Tone className={priorityTone(task.priority)}>{task.priority}</Tone>
              <Tone className={taskStatusTone(task.status)}>{taskStatusLabel(task.status)}</Tone>
              <span className={`text-xs ${deadlineTone[dl]}`}>{deadlineLabel[dl]}</span>
            </div>
            <SheetTitle className="text-lg leading-snug">{task.title}</SheetTitle>
          </SheetHeader>

          {/* Ações do fluxo */}
          <div className="mt-4 flex flex-wrap gap-2">
            {perms.canSubmit && (
              <Button size="sm" onClick={() => setMode("submit")}>
                <Send className="mr-2 h-4 w-4" /> Enviar para double check
              </Button>
            )}
            {task.status === "em_double_check" && (
              <Button size="sm" variant={perms.canReview ? "default" : "outline"} onClick={() => setMode("review")}>
                <ShieldCheck className="mr-2 h-4 w-4" /> {perms.canReview ? "Revisar agora" : "Ver revisão"}
              </Button>
            )}
            {perms.canWithdraw && (
              <Button size="sm" variant="outline" disabled={isPending} onClick={() => setFree("em_andamento")}>
                <Undo2 className="mr-2 h-4 w-4" /> Recolher
              </Button>
            )}
            {task.status === "concluida" && (
              <Button size="sm" variant="outline" disabled={isPending} onClick={() => setFree("em_ajuste")}>
                <RotateCcw className="mr-2 h-4 w-4" /> Reabrir
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </Button>
          </div>

          {perms.canChangeFreeStatus && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Status de trabalho:</span>
              <OptionSelect<TaskStatus>
                className="h-8 w-[200px]"
                value={task.status}
                onChange={setFree}
                options={TASK_STATUSES.filter((s) => FREE_TASK_STATUSES.includes(s.value))}
              />
            </div>
          )}

          {task.status === "em_ajuste" && task.review_comment && (
            <div className="mt-4 rounded-lg border border-orange-500/40 bg-orange-500/10 p-3 text-sm">
              <p className="mb-1 text-xs font-medium text-orange-700 dark:text-orange-300">
                Ajuste solicitado por {memberName(members, task.reviewed_by)} · {fmtDateTime(task.reviewed_at)}
              </p>
              <p className="whitespace-pre-wrap">{task.review_comment}</p>
            </div>
          )}

          <Separator className="my-4" />

          <div className="space-y-0.5">
            <Row label="Executor">
              <span className="inline-flex items-center gap-2">
                <MemberAvatar id={task.executor_id} /> {memberName(members, task.executor_id)}
              </span>
            </Row>
            {task.executor_part && <Row label="Parte executor">{task.executor_part}</Row>}
            <Row label="Revisor">
              <span className="inline-flex items-center gap-2">
                <MemberAvatar id={task.reviewer_id} /> {memberName(members, task.reviewer_id)}
              </span>
            </Row>
            {task.reviewer_part && <Row label="Parte revisor">{task.reviewer_part}</Row>}
            <Row label="Cliente / frente">{task.front || "—"}</Row>
            <Row label="Contrato">{contract ? `${contract.code} · ${contract.client}` : "—"}</Row>
            <Row label="Entregável">{deliverable ? `${deliverable.code} · ${deliverable.package}` : "—"}</Row>
            <Row label="Início / prazo">
              {fmtDate(task.start_date)} → <span className={deadlineTone[dl]}>{fmtDate(task.due_date)}</span>
            </Row>
            <Row label="Horas est.">
              {task.hours_executor ?? "—"} h exec · {task.hours_reviewer ?? "—"} h rev
            </Row>
            <Row label="Aceite cliente">{task.client_acceptance}</Row>
            <Row label="Próxima ação">{task.next_action || "—"}</Row>
            {task.notes && <Row label="Observações">{task.notes}</Row>}
          </div>

          <Separator className="my-4" />

          <h3 className="mb-2 text-sm font-semibold">Double check</h3>
          <div className="space-y-0.5">
            <Row label="Evidência">{task.evidence_note || "—"}</Row>
            <Row label="Enviado por">
              {memberName(members, task.submitted_by)} · {fmtDateTime(task.submitted_at)}
            </Row>
            <Row label="Revisado por">
              {memberName(members, task.reviewed_by)} · {fmtDateTime(task.reviewed_at)}
            </Row>
            {task.review_comment && task.status !== "em_ajuste" && <Row label="Comentário">{task.review_comment}</Row>}
          </div>

          <h3 className="mb-2 mt-5 text-sm font-semibold">Arquivos de evidência</h3>
          <EvidenceList parent={{ task_id: task.id }} readOnly={task.status === "concluida"} />

          <h3 className="mb-2 mt-6 flex items-center gap-2 text-sm font-semibold">
            <History className="h-4 w-4" /> Histórico
          </h3>
          <ol className="relative space-y-3 border-l pl-4">
            {history.map((h) => (
              <li key={h.id} className="text-sm">
                <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full border bg-background" />
                <p>
                  <strong>{h.action}</strong>
                  {h.to_status && h.from_status && (
                    <span className="text-muted-foreground">
                      {" "}
                      · {taskStatusLabel(h.from_status)} → {taskStatusLabel(h.to_status)}
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {h.actor_id ? memberName(members, h.actor_id) : "Sistema"} · {fmtDateTime(h.created_at)}
                </p>
                {h.comment && <p className="mt-1 whitespace-pre-wrap rounded bg-muted/40 px-2 py-1 text-xs">{h.comment}</p>}
              </li>
            ))}
          </ol>

          <div className="mt-8 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                // eslint-disable-next-line no-alert
                if (window.confirm(`Excluir ${task.code}? O histórico também será removido.`)) {
                  remove.mutateAsync(task.id).then(onClose).catch(() => undefined);
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Excluir tarefa
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      <TaskFormDialog open={editing} onOpenChange={setEditing} task={task} />
      <TaskWorkflowDialog task={mode ? task : null} mode={mode} onClose={() => setMode(null)} />
    </>
  );
}
