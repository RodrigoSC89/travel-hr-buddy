/**
 * Approval Queue - Real data from action_items table
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Clock, Shield, UserCheck, AlertTriangle, MessageSquare, Sparkles, Eye, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp } from "@/lib/animations/motion-variants";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { toast } from "sonner";

interface PendingApproval {
  id: string;
  name: string;
  email: string;
  requestedRole: string;
  department: string;
  requestedAt: string;
  requestedBy: string;
  reason: string;
  riskLevel: "low" | "medium" | "high";
}

const riskConfig = {
  low: { color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", label: "Baixo", icon: CheckCircle2 },
  medium: { color: "bg-amber-500/10 text-amber-600 border-amber-500/20", label: "Médio", icon: AlertTriangle },
  high: { color: "bg-red-500/10 text-red-600 border-red-500/20", label: "Alto", icon: XCircle },
};

const roleLabels: Record<string, string> = {
  admin: "Administrador", hr_manager: "Gerente de RH", manager: "Gerente",
  coordinator: "Coordenador", supervisor: "Supervisor", employee: "Colaborador", user: "Usuário",
};

export const ApprovalQueue: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ["approval-queue"],
    queryFn: async () => {
      const { data, error } = await fromUntyped("action_items")
        .select("id, title, description, priority, status, created_at, assigned_to_name, assigned_to_email, source_module")
        .eq("status", "pending")
        .eq("source_module", "user_approval")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []).map((item: Record<string, unknown>) => ({
        id: String(item.id),
        name: String(item.assigned_to_name || item.title || "Usuário"),
        email: String(item.assigned_to_email || ""),
        requestedRole: "user",
        department: String(item.source_module || "—"),
        requestedAt: String(item.created_at || ""),
        requestedBy: "Sistema",
        reason: String(item.description || "Solicitação de acesso"),
        riskLevel: item.priority === "high" || item.priority === "critical" ? "high" : item.priority === "medium" ? "medium" : "low",
      })) as PendingApproval[];
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: stats } = useQuery({
    queryKey: ["approval-stats"],
    queryFn: async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
      const { count: approved } = await fromUntyped("action_items")
        .select("id", { count: "exact", head: true })
        .eq("source_module", "user_approval")
        .eq("status", "completed")
        .gte("updated_at", thirtyDaysAgo);
      const { count: rejected } = await fromUntyped("action_items")
        .select("id", { count: "exact", head: true })
        .eq("source_module", "user_approval")
        .eq("status", "cancelled")
        .gte("updated_at", thirtyDaysAgo);
      return { approved: approved || 0, rejected: rejected || 0 };
    },
    staleTime: 1000 * 60 * 10,
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "completed" | "cancelled" }) => {
      const { error } = await fromUntyped("action_items")
        .update({ status: action, completion_date: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      toast.success(vars.action === "completed" ? "Aprovado com sucesso" : "Rejeitado");
      queryClient.invalidateQueries({ queryKey: ["approval-queue"] });
      queryClient.invalidateQueries({ queryKey: ["approval-stats"] });
      setShowDetailDialog(false);
      setReviewComment("");
    },
    onError: () => toast.error("Erro ao processar solicitação"),
  });

  const handleApprove = (id: string) => actionMutation.mutate({ id, action: "completed" });
  const handleReject = (id: string) => actionMutation.mutate({ id, action: "cancelled" });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10"><Clock className="h-5 w-5 text-amber-600" /></div>
              <div><p className="text-2xl font-bold">{approvals.length}</p><p className="text-sm text-muted-foreground">Pendentes</p></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10"><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div>
              <div><p className="text-2xl font-bold">{stats?.approved ?? 0}</p><p className="text-sm text-muted-foreground">Aprovados (30d)</p></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10"><XCircle className="h-5 w-5 text-red-600" /></div>
              <div><p className="text-2xl font-bold">{stats?.rejected ?? 0}</p><p className="text-sm text-muted-foreground">Rejeitados (30d)</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5" />Fila de Aprovação</CardTitle>
          <CardDescription>Solicitações de acesso pendentes de revisão</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <AnimatePresence mode="popLayout">
              {approvals.length === 0 ? (
                <motion.div {...fadeUp} className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-500 mb-4" />
                  <p className="text-lg font-medium">Nenhuma aprovação pendente</p>
                  <p className="text-sm text-muted-foreground">Todas as solicitações foram processadas</p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {approvals.map((approval) => {
                    const risk = riskConfig[approval.riskLevel];
                    const RiskIcon = risk.icon;
                    return (
                      <motion.div key={approval.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }}
                        className="group relative rounded-xl border p-4 hover:bg-muted/30 transition-all">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-11 w-11 ring-2 ring-primary/10">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {approval.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold">{approval.name}</p>
                              <Badge variant="outline" className={risk.color}><RiskIcon className="h-3 w-3 mr-1" />Risco {risk.label}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{approval.email}</p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <Badge variant="secondary" className="text-xs"><Shield className="h-3 w-3 mr-1" />{roleLabels[approval.requestedRole] || approval.requestedRole}</Badge>
                              <span className="text-xs text-muted-foreground">Solicitado por {approval.requestedBy}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedApproval(approval); setShowDetailDialog(true); }}>
                              <Eye className="h-4 w-4 mr-1" />Detalhes
                            </Button>
                            <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10"
                              onClick={() => handleApprove(approval.id)} disabled={actionMutation.isPending}>
                              <CheckCircle2 className="h-4 w-4 mr-1" />Aprovar
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-500/20 hover:bg-red-500/10"
                              onClick={() => handleReject(approval.id)} disabled={actionMutation.isPending}>
                              <XCircle className="h-4 w-4 mr-1" />Rejeitar
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Revisão de Solicitação</DialogTitle>
            <DialogDescription>Analise os detalhes antes de aprovar ou rejeitar</DialogDescription>
          </DialogHeader>
          {selectedApproval && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {selectedApproval.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div><p className="font-semibold">{selectedApproval.name}</p><p className="text-sm text-muted-foreground">{selectedApproval.email}</p></div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">Role Solicitada</p><p className="font-medium">{roleLabels[selectedApproval.requestedRole]}</p></div>
                <div><p className="text-muted-foreground">Data</p><p className="font-medium">{new Date(selectedApproval.requestedAt).toLocaleDateString("pt-BR")}</p></div>
              </div>
              <div><p className="text-sm text-muted-foreground mb-1">Justificativa</p><p className="text-sm bg-muted/50 rounded-lg p-3">{selectedApproval.reason}</p></div>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-1.5"><MessageSquare className="h-4 w-4" />Comentário do Revisor</p>
                <Textarea placeholder="Adicione um comentário..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows={3} />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>Cancelar</Button>
            <Button variant="outline" className="text-red-600 border-red-500/20 hover:bg-red-500/10"
              onClick={() => selectedApproval && handleReject(selectedApproval.id)} disabled={actionMutation.isPending}>
              <XCircle className="h-4 w-4 mr-1" />Rejeitar
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => selectedApproval && handleApprove(selectedApproval.id)} disabled={actionMutation.isPending}>
              <CheckCircle2 className="h-4 w-4 mr-1" />Aprovar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
