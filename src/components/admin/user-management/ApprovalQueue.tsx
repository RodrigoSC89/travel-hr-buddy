/**
 * Approval Queue - Workflow de aprovação de usuários
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2, XCircle, Clock, Shield, UserCheck, AlertTriangle,
  MessageSquare, ChevronRight, Sparkles, Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp } from "@/lib/animations/motion-variants";

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
  aiRecommendation?: string;
}

const MOCK_APPROVALS: PendingApproval[] = [
  {
    id: "1", name: "Ana Costa", email: "ana.costa@mbmaritime.com.br",
    requestedRole: "hr_manager", department: "RH", requestedAt: "2026-02-23T14:30:00Z",
    requestedBy: "Rodrigo Silva", reason: "Promoção para gerência de RH da frota Sul",
    riskLevel: "medium",
    aiRecommendation: "Usuário tem 2 anos na organização com histórico limpo. Recomendação: Aprovar com período probatório de 30 dias.",
  },
  {
    id: "2", name: "Carlos Mendes", email: "carlos.mendes@mbmaritime.com.br",
    requestedRole: "admin", department: "TI", requestedAt: "2026-02-22T09:15:00Z",
    requestedBy: "Auto-registro", reason: "Acesso administrativo para configuração de integrações",
    riskLevel: "high",
    aiRecommendation: "⚠️ Solicitação de role Admin por auto-registro. Risco elevado. Recomendação: Solicitar justificativa adicional e aprovação de 2 níveis.",
  },
  {
    id: "3", name: "Marina Oliveira", email: "marina.oliveira@mbmaritime.com.br",
    requestedRole: "coordinator", department: "Operações", requestedAt: "2026-02-24T08:00:00Z",
    requestedBy: "João Santos", reason: "Nova contratação — coordenadora de operações portuárias",
    riskLevel: "low",
    aiRecommendation: "Perfil consistente com o cargo solicitado. Departamento tem vaga aberta. Recomendação: Aprovar.",
  },
];

const riskConfig = {
  low: { color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", label: "Baixo", icon: CheckCircle2 },
  medium: { color: "bg-amber-500/10 text-amber-600 border-amber-500/20", label: "Médio", icon: AlertTriangle },
  high: { color: "bg-red-500/10 text-red-600 border-red-500/20", label: "Alto", icon: XCircle },
};

const roleLabels: Record<string, string> = {
  admin: "Administrador", hr_manager: "Gerente de RH", manager: "Gerente",
  coordinator: "Coordenador", supervisor: "Supervisor", employee: "Colaborador",
};

export const ApprovalQueue: React.FC = () => {
  const [approvals, setApprovals] = useState(MOCK_APPROVALS);
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const handleApprove = (id: string) => {
    setApprovals(prev => prev.filter(a => a.id !== id));
    setShowDetailDialog(false);
    setReviewComment("");
  };

  const handleReject = (id: string) => {
    setApprovals(prev => prev.filter(a => a.id !== id));
    setShowDetailDialog(false);
    setReviewComment("");
  };

  const openDetail = (approval: PendingApproval) => {
    setSelectedApproval(approval);
    setShowDetailDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{approvals.length}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Aprovados (30d)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Rejeitados (30d)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Fila de Aprovação
          </CardTitle>
          <CardDescription>Solicitações de acesso e alterações de permissão pendentes de revisão</CardDescription>
        </CardHeader>
        <CardContent>
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
                    <motion.div
                      key={approval.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="group relative rounded-xl border p-4 hover:bg-muted/30 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="h-11 w-11 ring-2 ring-primary/10">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {approval.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold">{approval.name}</p>
                            <Badge variant="outline" className={risk.color}>
                              <RiskIcon className="h-3 w-3 mr-1" />
                              Risco {risk.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{approval.email}</p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <Badge variant="secondary" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              {roleLabels[approval.requestedRole] || approval.requestedRole}
                            </Badge>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{approval.department}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              Solicitado por {approval.requestedBy}
                            </span>
                          </div>
                          {approval.aiRecommendation && (
                            <div className="mt-2 p-2 rounded-lg bg-primary/5 border border-primary/10 text-xs flex items-start gap-2">
                              <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                              <span className="text-muted-foreground">{approval.aiRecommendation}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button variant="ghost" size="sm" onClick={() => openDetail(approval)}>
                            <Eye className="h-4 w-4 mr-1" />Detalhes
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10"
                            onClick={() => handleApprove(approval.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-500/20 hover:bg-red-500/10"
                            onClick={() => handleReject(approval.id)}
                          >
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
        </CardContent>
      </Card>

      {/* Detail Dialog */}
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
                <div>
                  <p className="font-semibold">{selectedApproval.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedApproval.email}</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Role Solicitada</p>
                  <p className="font-medium">{roleLabels[selectedApproval.requestedRole]}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Departamento</p>
                  <p className="font-medium">{selectedApproval.department}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Solicitado por</p>
                  <p className="font-medium">{selectedApproval.requestedBy}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Data</p>
                  <p className="font-medium">{new Date(selectedApproval.requestedAt).toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Justificativa</p>
                <p className="text-sm bg-muted/50 rounded-lg p-3">{selectedApproval.reason}</p>
              </div>
              {selectedApproval.aiRecommendation && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">Análise IA</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedApproval.aiRecommendation}</p>
                </div>
              )}
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4" />Comentário do Revisor
                </p>
                <Textarea
                  placeholder="Adicione um comentário (obrigatório para rejeição)..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>Cancelar</Button>
            <Button
              variant="outline"
              className="text-red-600 border-red-500/20 hover:bg-red-500/10"
              onClick={() => selectedApproval && handleReject(selectedApproval.id)}
            >
              <XCircle className="h-4 w-4 mr-1" />Rejeitar
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => selectedApproval && handleApprove(selectedApproval.id)}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />Aprovar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
