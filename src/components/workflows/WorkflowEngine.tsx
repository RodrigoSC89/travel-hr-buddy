/**
 * WorkflowEngine - Configurable approval workflows with SLA tracking
 * Supports multi-level approvals, escalation chains and notifications
 */
import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  CheckCircle, XCircle, Clock, AlertTriangle, ArrowRight, 
  MessageSquare, Timer, ChevronRight, User, Shield
} from "lucide-react";

export interface WorkflowStep {
  id: string;
  level: number;
  role: string;
  label: string;
  slaHours: number;
  status: "pending" | "approved" | "rejected" | "escalated" | "skipped";
  approvedBy?: string;
  approvedAt?: string;
  comments?: string;
}

export interface WorkflowConfig {
  id: string;
  name: string;
  module: string;
  entityType: string;
  entityId: string;
  entityTitle: string;
  steps: WorkflowStep[];
  currentLevel: number;
  status: "draft" | "in_review" | "approved" | "rejected" | "escalated";
  createdAt: string;
  createdBy: string;
  metadata?: Record<string, unknown>;
}

// SLA status computation
function getSLAStatus(step: WorkflowStep, createdAt: string) {
  if (step.status !== "pending") return null;
  const deadline = new Date(createdAt).getTime() + step.slaHours * 3600000;
  const now = Date.now();
  const remaining = deadline - now;
  const hoursLeft = Math.floor(remaining / 3600000);
  
  if (remaining <= 0) return { color: "destructive" as const, label: "SLA Expirado", hoursLeft: 0 };
  if (hoursLeft <= 4) return { color: "warning" as const, label: `${hoursLeft}h restantes`, hoursLeft };
  return { color: "success" as const, label: `${hoursLeft}h restantes`, hoursLeft };
}

const stepStatusConfig = {
  pending: { icon: Clock, color: "text-warning", bg: "bg-warning/10", label: "Pendente" },
  approved: { icon: CheckCircle, color: "text-success", bg: "bg-success/10", label: "Aprovado" },
  rejected: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Rejeitado" },
  escalated: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", label: "Escalado" },
  skipped: { icon: ArrowRight, color: "text-muted-foreground", bg: "bg-muted/30", label: "Ignorado" },
};

interface WorkflowTimelineProps {
  workflow: WorkflowConfig;
  onApprove?: (stepId: string, comments: string) => void;
  onReject?: (stepId: string, comments: string) => void;
  onEscalate?: (stepId: string) => void;
  canAct?: boolean;
}

export function WorkflowTimeline({ workflow, onApprove, onReject, onEscalate, canAct = true }: WorkflowTimelineProps) {
  const [actionDialog, setActionDialog] = useState<{ stepId: string; action: "approve" | "reject" } | null>(null);
  const [comments, setComments] = useState("");

  const handleAction = () => {
    if (!actionDialog) return;
    if (actionDialog.action === "approve") {
      onApprove?.(actionDialog.stepId, comments);
    } else {
      if (!comments.trim()) {
        toast.error("Comentário obrigatório para rejeição");
        return;
      }
      onReject?.(actionDialog.stepId, comments);
    }
    setActionDialog(null);
    setComments("");
  };

  return (
    <>
      <Card className="bg-card border-border/40">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">{workflow.name}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{workflow.entityTitle}</p>
            </div>
            <Badge variant="outline" className={cn(
              "text-xs",
              workflow.status === "approved" && "border-success/40 text-success",
              workflow.status === "rejected" && "border-destructive/40 text-destructive",
              workflow.status === "in_review" && "border-primary/40 text-primary",
              workflow.status === "escalated" && "border-warning/40 text-warning",
            )}>
              {workflow.status === "in_review" ? "Em Análise" : 
               workflow.status === "approved" ? "Aprovado" :
               workflow.status === "rejected" ? "Rejeitado" :
               workflow.status === "escalated" ? "Escalado" : "Rascunho"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {workflow.steps.map((step, i) => {
              const config = stepStatusConfig[step.status];
              const Icon = config.icon;
              const sla = getSLAStatus(step, workflow.createdAt);
              const isCurrent = step.level === workflow.currentLevel && step.status === "pending";

              return (
                <div key={step.id} className="flex items-start gap-3">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "flex items-center justify-center h-8 w-8 rounded-full border-2 transition-all",
                      isCurrent ? "border-primary bg-primary/10 ring-2 ring-primary/20" : "border-border/40",
                      config.bg
                    )}>
                      <Icon className={cn("h-4 w-4", config.color)} />
                    </div>
                    {i < workflow.steps.length - 1 && (
                      <div className={cn("w-0.5 h-8", step.status === "approved" ? "bg-success/40" : "bg-border/30")} />
                    )}
                  </div>

                  {/* Step content */}
                  <div className="flex-1 pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-medium", isCurrent ? "text-foreground" : "text-muted-foreground")}>
                          {step.label}
                        </span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          <User className="h-2.5 w-2.5 mr-0.5" />{step.role}
                        </Badge>
                      </div>
                      {sla && (
                        <Badge variant="outline" className={cn(
                          "text-[10px] gap-1",
                          sla.color === "destructive" && "border-destructive/40 text-destructive",
                          sla.color === "warning" && "border-warning/40 text-warning",
                          sla.color === "success" && "border-success/40 text-success",
                        )}>
                          <Timer className="h-2.5 w-2.5" />{sla.label}
                        </Badge>
                      )}
                    </div>

                    {step.comments && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />{step.comments}
                      </p>
                    )}
                    {step.approvedBy && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Por {step.approvedBy} em {new Date(step.approvedAt || "").toLocaleDateString("pt-BR")}
                      </p>
                    )}

                    {/* Actions for current step */}
                    {isCurrent && canAct && (
                      <div className="flex items-center gap-2 mt-2">
                        <Button size="sm" variant="default" className="h-7 text-xs gap-1" onClick={() => setActionDialog({ stepId: step.id, action: "approve" })}>
                          <CheckCircle className="h-3 w-3" />Aprovar
                        </Button>
                        <Button size="sm" variant="destructive" className="h-7 text-xs gap-1" onClick={() => setActionDialog({ stepId: step.id, action: "reject" })}>
                          <XCircle className="h-3 w-3" />Rejeitar
                        </Button>
                        {onEscalate && (
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onEscalate(step.id)}>
                            <AlertTriangle className="h-3 w-3" />Escalar
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => { setActionDialog(null); setComments(""); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">
              {actionDialog?.action === "approve" ? "Aprovar Etapa" : "Rejeitar Etapa"}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder={actionDialog?.action === "reject" ? "Motivo da rejeição (obrigatório)..." : "Comentários (opcional)..."}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="min-h-[80px]"
          />
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setActionDialog(null)}>Cancelar</Button>
            <Button
              size="sm"
              variant={actionDialog?.action === "approve" ? "default" : "destructive"}
              onClick={handleAction}
            >
              {actionDialog?.action === "approve" ? "Confirmar Aprovação" : "Confirmar Rejeição"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** 
 * Factory for standard maritime approval chains
 */
export function createApprovalChain(
  name: string,
  module: string,
  entityType: string,
  entityId: string,
  entityTitle: string,
  levels: Array<{ role: string; label: string; slaHours: number }>,
): WorkflowConfig {
  return {
    id: crypto.randomUUID(),
    name,
    module,
    entityType,
    entityId,
    entityTitle,
    steps: levels.map((l, i) => ({
      id: crypto.randomUUID(),
      level: i + 1,
      role: l.role,
      label: l.label,
      slaHours: l.slaHours,
      status: i === 0 ? "pending" : "pending",
    })),
    currentLevel: 1,
    status: "in_review",
    createdAt: new Date().toISOString(),
    createdBy: "current_user",
  };
}

// Presets for common maritime workflows
export const WORKFLOW_PRESETS = {
  purchaseOrder: (entityId: string, title: string, amount: number) => createApprovalChain(
    "Aprovação de Compra",
    "procurement",
    "purchase_order",
    entityId,
    title,
    [
      { role: "Supervisor", label: "Aprovação Técnica", slaHours: 24 },
      ...(amount > 5000 ? [{ role: "Coordenador", label: "Aprovação Coordenação", slaHours: 48 }] : []),
      ...(amount > 25000 ? [{ role: "Gerente", label: "Aprovação Gerencial", slaHours: 72 }] : []),
      ...(amount > 100000 ? [{ role: "Diretor", label: "Aprovação Diretoria", slaHours: 96 }] : []),
    ]
  ),
  documentApproval: (entityId: string, title: string) => createApprovalChain(
    "Aprovação de Documento",
    "documents",
    "document",
    entityId,
    title,
    [
      { role: "Revisor", label: "Revisão Técnica", slaHours: 48 },
      { role: "DPA", label: "Aprovação DPA", slaHours: 72 },
    ]
  ),
  crewChange: (entityId: string, title: string) => createApprovalChain(
    "Aprovação de Troca de Tripulação",
    "crew",
    "crew_change",
    entityId,
    title,
    [
      { role: "HR Officer", label: "Validação RH", slaHours: 24 },
      { role: "Master", label: "Aprovação Comandante", slaHours: 48 },
      { role: "Superintendent", label: "Aprovação Superintendente", slaHours: 72 },
    ]
  ),
};

export default WorkflowTimeline;
