/**
 * SGSO Approvals Table Component
 * Table for QSMS team to approve, edit or reject action plans
 */

import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, Eye } from "lucide-react";
import { SGSOActionPlan } from "@/lib/sgso/export-utils";
import { supabase } from "@/lib/supabase/client";

interface SGSOApprovalsTableProps {
  plans: SGSOActionPlan[];
  onUpdate?: () => void;
}

export function SGSOApprovalsTable({ plans, onUpdate }: SGSOApprovalsTableProps) {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<SGSOActionPlan | null>(null);
  const [approvalNote, setApprovalNote] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">("approve");

  // Filter only pending plans
  const pendingPlans = plans.filter((p) => p.status_approval === "pendente");

  const handleOpenApproval = (plan: SGSOActionPlan, action: "approve" | "reject") => {
    setSelectedPlan(plan);
    setApprovalAction(action);
    setApprovalNote("");
    setShowApprovalDialog(true);
  };

  const handleApproval = async () => {
    if (!selectedPlan) return;

    setIsApproving(true);
    try {
      const { error } = await supabase
        .from("sgso_action_plans")
        .update({
          status_approval: approvalAction === "approve" ? "aprovado" : "recusado",
          approval_note: approvalNote || null,
          approved_by: (await supabase.auth.getUser()).data.user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", selectedPlan.id);

      if (error) throw error;

      toast({
        title: approvalAction === "approve" ? "✅ Plano Aprovado" : "❌ Plano Recusado",
        description: `O plano de ação foi ${approvalAction === "approve" ? "aprovado" : "recusado"} com sucesso.`,
      });

      setShowApprovalDialog(false);
      setSelectedPlan(null);
      setApprovalNote("");
      
      // Trigger refresh
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error updating plan approval:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status de aprovação.",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleViewDetails = (plan: SGSOActionPlan) => {
    setSelectedPlan(plan);
    setShowDetailsDialog(true);
  };

  if (pendingPlans.length === 0) {
    return (
      <div className="p-4 bg-white shadow rounded">
        <h2 className="text-xl font-bold mb-4">✅ Aprovação de Planos SGSO</h2>
        <div className="text-center py-8 text-muted-foreground">
          Nenhum plano pendente de aprovação.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 bg-white shadow rounded">
        <h2 className="text-xl font-bold mb-4">✅ Aprovação de Planos SGSO</h2>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead>Incidente</TableHead>
                <TableHead>Embarcação</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingPlans.map((plan) => (
                <TableRow key={plan.id} className="border-t">
                  <TableCell className="font-medium">
                    <div className="max-w-xs">
                      <div className="truncate">{plan.dp_incidents?.title || plan.incident_id}</div>
                      <div className="text-xs text-muted-foreground">
                        {plan.dp_incidents?.date && new Date(plan.dp_incidents.date).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{plan.dp_incidents?.vessel || "-"}</span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="link"
                      className="text-blue-600 p-0 h-auto"
                      onClick={() => handleViewDetails(plan)}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Ver Detalhes
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{plan.status_approval}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => handleOpenApproval(plan, "approve")}
                    >
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleOpenApproval(plan, "reject")}
                    >
                      <XCircle className="mr-1 h-4 w-4" />
                      Rejeitar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Plano de Ação</DialogTitle>
            <DialogDescription>
              {selectedPlan?.dp_incidents?.title || selectedPlan?.incident_id}
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">✅ Ação Corretiva:</h3>
                <p className="text-sm text-muted-foreground">{selectedPlan.corrective_action}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">🔁 Ação Preventiva:</h3>
                <p className="text-sm text-muted-foreground">{selectedPlan.preventive_action}</p>
              </div>
              {selectedPlan.recommendation && (
                <div>
                  <h3 className="font-semibold mb-1">🧠 Recomendação:</h3>
                  <p className="text-sm text-muted-foreground">{selectedPlan.recommendation}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <span className="text-sm font-medium">Embarcação:</span>
                  <p className="text-sm text-muted-foreground">{selectedPlan.dp_incidents?.vessel || "-"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Local:</span>
                  <p className="text-sm text-muted-foreground">{selectedPlan.dp_incidents?.location || "-"}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === "approve" ? "Aprovar Plano de Ação" : "Rejeitar Plano de Ação"}
            </DialogTitle>
            <DialogDescription>
              {selectedPlan?.dp_incidents?.title || selectedPlan?.incident_id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="approval-note" className="text-sm font-medium">
                Nota (opcional):
              </label>
              <Textarea
                id="approval-note"
                placeholder={
                  approvalAction === "approve"
                    ? "Adicione observações sobre a aprovação..."
                    : "Explique o motivo da rejeição..."
                }
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApprovalDialog(false)}
              disabled={isApproving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleApproval}
              disabled={isApproving}
              variant={approvalAction === "approve" ? "default" : "destructive"}
            >
              {isApproving ? "Processando..." : approvalAction === "approve" ? "Aprovar" : "Rejeitar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
