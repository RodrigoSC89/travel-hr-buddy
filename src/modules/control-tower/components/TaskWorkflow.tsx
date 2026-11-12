/**
 * Fluxo de double check das tarefas:
 *   executor → "Enviar para double check" (evidência obrigatória)
 *   revisor  → "Aprovar" (registra aceite do cliente) ou "Devolver para ajuste"
 * O banco valida tudo novamente (trigger ct_tasks_guard).
 */
import * as React from "react";
import { CheckCircle2, RotateCcw, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useEvidences, useSave } from "../api";
import { ACCEPTANCES } from "../constants";
import { useCtContext } from "../context";
import { fmtDateTime, memberName } from "../lib/format";
import type { Acceptance, Task, TaskStatus } from "../types";
import { EvidenceList } from "./EvidenceList";
import { Field, OptionSelect } from "./shared";

export type WorkflowMode = "submit" | "review";

export interface TaskPermissions {
  isExecutor: boolean;
  isReviewer: boolean;
  canSubmit: boolean;
  canReview: boolean;
  canWithdraw: boolean;
  canChangeFreeStatus: boolean;
  reviewBlockReason: string | null;
}

export function taskPermissions(task: Task, meId: string): TaskPermissions {
  const isExecutor = task.executor_id === meId;
  const isReviewer = task.reviewer_id === meId;
  const inReview = task.status === "em_double_check";
  const done = task.status === "concluida";
  let reviewBlockReason: string | null = null;
  if (inReview && !isReviewer) reviewBlockReason = "Somente o revisor designado aprova esta tarefa.";
  if (inReview && task.submitted_by === meId) reviewBlockReason = "Ninguém encerra uma tarefa sozinho: você enviou esta tarefa.";
  return {
    isExecutor,
    isReviewer,
    canSubmit: isExecutor && !inReview && !done,
    canReview: inReview && isReviewer && task.submitted_by !== meId,
    canWithdraw: inReview && task.submitted_by === meId,
    canChangeFreeStatus: !inReview && !done,
    reviewBlockReason,
  };
}

export function useTaskStatusChange() {
  const save = useSave<Task>("ct_tasks", "");
  return {
    isPending: save.isPending,
    change: (task: Task, status: TaskStatus, extra: Partial<Task> = {}) =>
      save.mutateAsync({ id: task.id, status, ...extra }),
  };
}

export function TaskWorkflowDialog({
  task,
  mode,
  onClose,
}: {
  task: Task | null;
  mode: WorkflowMode | null;
  onClose: () => void;
}) {
  const { me, members } = useCtContext();
  const { change, isPending } = useTaskStatusChange();
  const [evidence, setEvidence] = React.useState("");
  const [comment, setComment] = React.useState("");
  const [acceptance, setAcceptance] = React.useState<Acceptance>("Não requerido");
  const { data: files = [] } = useEvidences(task ? { task_id: task.id } : null);

  React.useEffect(() => {
    if (!task) return;
    setEvidence(task.evidence_note ?? "");
    setComment("");
    setAcceptance(task.client_acceptance === "A confirmar" ? "Não requerido" : task.client_acceptance);
  }, [task, mode]);

  if (!task || !mode) return null;
  const perms = taskPermissions(task, me.id);

  const doSubmit = async () => {
    if (!evidence.trim() && files.length === 0) {
      toast.error("Informe a evidência/versão ou anexe um arquivo");
      return;
    }
    await change(task, "em_double_check", { evidence_note: evidence.trim() || null })
      .then(() => {
        toast.success(`${task.code} enviada para double check de ${memberName(members, task.reviewer_id)}`);
        onClose();
      })
      .catch(() => undefined);
  };

  const doApprove = async () => {
    if (["A confirmar", "Pendente", "Recusado"].includes(acceptance)) {
      toast.error("Registre o aceite do cliente (Aceito ou Não requerido) para concluir");
      return;
    }
    await change(task, "concluida", { client_acceptance: acceptance, review_comment: comment.trim() || null })
      .then(() => {
        toast.success(`${task.code} aprovada e concluída`);
        onClose();
      })
      .catch(() => undefined);
  };

  const doReturn = async () => {
    if (!comment.trim()) {
      toast.error("Descreva o que precisa ser ajustado");
      return;
    }
    await change(task, "em_ajuste", { review_comment: comment.trim() })
      .then(() => {
        toast.success(`${task.code} devolvida para ajuste`);
        onClose();
      })
      .catch(() => undefined);
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto">
        {mode === "submit" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-violet-500" /> Enviar para double check
              </DialogTitle>
              <DialogDescription>
                {task.code} · {task.title}
              </DialogDescription>
            </DialogHeader>
            {!perms.canSubmit ? (
              <Alert>
                <AlertDescription>
                  Somente o executor principal ({memberName(members, task.executor_id)}) pode enviar esta tarefa para revisão.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <Field label="Evidência / versão *" hint="Ex.: REL-SEA-05 Rev01 enviado por e-mail em 12/11, link da pasta, protocolo…">
                  <Textarea rows={3} value={evidence} onChange={(e) => setEvidence(e.target.value)} />
                </Field>
                <Field label="Arquivos de evidência">
                  <EvidenceList parent={{ task_id: task.id }} />
                </Field>
                <p className="text-xs text-muted-foreground">
                  Revisor: <strong>{memberName(members, task.reviewer_id)}</strong>. A tarefa só é concluída após a aprovação dele(a).
                </p>
              </div>
            )}
            <DialogFooter>
              <Button variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={doSubmit} disabled={!perms.canSubmit || isPending}>
                <Send className="mr-2 h-4 w-4" /> Enviar
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" /> Double check
              </DialogTitle>
              <DialogDescription>
                {task.code} · {task.title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <p>
                  <span className="text-muted-foreground">Executado por </span>
                  <strong>{memberName(members, task.submitted_by)}</strong>
                  <span className="text-muted-foreground"> em {fmtDateTime(task.submitted_at)}</span>
                </p>
                <p className="mt-2 whitespace-pre-wrap">{task.evidence_note || <em className="text-muted-foreground">Sem nota de evidência</em>}</p>
              </div>
              <Field label="Arquivos de evidência">
                <EvidenceList parent={{ task_id: task.id }} readOnly />
              </Field>
              {perms.reviewBlockReason ? (
                <Alert>
                  <AlertDescription>{perms.reviewBlockReason}</AlertDescription>
                </Alert>
              ) : (
                <>
                  <Field label="Aceite do cliente" hint="Revisão interna não substitui o aceite externo quando aplicável">
                    <OptionSelect<Acceptance> value={acceptance} onChange={(v) => setAcceptance(v ?? "Não requerido")} options={ACCEPTANCES} />
                  </Field>
                  <Field label="Comentário da revisão" hint="Obrigatório para devolver para ajuste">
                    <Textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
                  </Field>
                </>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={onClose}>
                Fechar
              </Button>
              <Button variant="outline" onClick={doReturn} disabled={!perms.canReview || isPending}>
                <RotateCcw className="mr-2 h-4 w-4" /> Devolver para ajuste
              </Button>
              <Button onClick={doApprove} disabled={!perms.canReview || isPending} className="bg-emerald-600 hover:bg-emerald-700">
                <CheckCircle2 className="mr-2 h-4 w-4" /> Aprovar e concluir
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
