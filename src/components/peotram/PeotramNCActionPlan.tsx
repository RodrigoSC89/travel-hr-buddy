/**
 * PEOTRAM NC Action Plan Tracker
 * Track NC closure with deadlines, responsible persons, escalation workflow
 * Real competitive advantage — integrates with PEOTRAM audit lifecycle
 */
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertTriangle, CheckCircle, Clock, Plus, Download, Target,
  Users, Calendar, ArrowRight, FileText, Shield, TrendingUp, Eye
} from "lucide-react";
import { toast } from "sonner";

type NCPriority = "A" | "B" | "C" | "D";
type NCStatus = "open" | "in_progress" | "evidence_pending" | "verification" | "closed";

interface NCActionItem {
  id: string;
  ncNumber: string;
  element: number;
  elementName: string;
  itemId: string;
  description: string;
  rootCause: string;
  correctiveAction: string;
  preventiveAction: string;
  priority: NCPriority;
  status: NCStatus;
  responsible: string;
  responsibleEmail: string;
  dueDate: string;
  createdAt: string;
  closedAt: string | null;
  evidenceCount: number;
  verifiedBy: string | null;
  escalated: boolean;
  daysRemaining: number;
  percentComplete: number;
}

const PRIORITY_CONFIG: Record<NCPriority, { label: string; deadline: string; color: string; days: number }> = {
  A: { label: "Crítica", deadline: "10 dias", color: "bg-destructive text-destructive-foreground", days: 10 },
  B: { label: "Maior", deadline: "15 dias", color: "bg-destructive/80 text-destructive-foreground", days: 15 },
  C: { label: "Menor", deadline: "30 dias", color: "bg-warning text-warning-foreground", days: 30 },
  D: { label: "Observação", deadline: "60 dias", color: "bg-muted text-foreground", days: 60 },
};

const STATUS_CONFIG: Record<NCStatus, { label: string; color: string; icon: React.ReactNode }> = {
  open: { label: "Aberta", color: "border-destructive/30 bg-destructive/5", icon: <AlertTriangle className="h-3.5 w-3.5 text-destructive" /> },
  in_progress: { label: "Em Andamento", color: "border-warning/30 bg-warning/5", icon: <Clock className="h-3.5 w-3.5 text-warning" /> },
  evidence_pending: { label: "Aguardando Evidência", color: "border-primary/30 bg-primary/5", icon: <FileText className="h-3.5 w-3.5 text-primary" /> },
  verification: { label: "Em Verificação", color: "border-info/30 bg-info/5", icon: <Eye className="h-3.5 w-3.5 text-info" /> },
  closed: { label: "Fechada", color: "border-success/30 bg-success/5", icon: <CheckCircle className="h-3.5 w-3.5 text-success" /> },
};

const MOCK_NCS: NCActionItem[] = [
  {
    id: "NC-001", ncNumber: "PEOTRAM-2026-001", element: 4, elementName: "Operações (OP)", itemId: "4.2.3",
    description: "Procedimentos operacionais de içamento sem revisão conforme NR-34",
    rootCause: "Falta de cronograma de revisão documental periódica",
    correctiveAction: "Revisar e atualizar todos os procedimentos de içamento conforme NR-34 revisão 2025",
    preventiveAction: "Implementar sistema de alertas automáticos para vencimento de revisões documentais",
    priority: "A", status: "in_progress", responsible: "Carlos Silva", responsibleEmail: "carlos@company.com",
    dueDate: "2026-02-25", createdAt: "2026-02-01", closedAt: null,
    evidenceCount: 2, verifiedBy: null, escalated: false, daysRemaining: 10, percentComplete: 60,
  },
  {
    id: "NC-002", ncNumber: "PEOTRAM-2026-002", element: 6, elementName: "Manutenção (MN)", itemId: "6.1.5",
    description: "Sistema de manutenção preventiva sem cobertura de 100% dos equipamentos críticos de segurança",
    rootCause: "Falta de mapeamento completo de equipamentos de segurança no PMS",
    correctiveAction: "Mapear e cadastrar 100% dos equipamentos críticos no sistema PMS",
    preventiveAction: "Auditar cadastro PMS trimestralmente contra inventário físico",
    priority: "B", status: "evidence_pending", responsible: "Pedro Oliveira", responsibleEmail: "pedro@company.com",
    dueDate: "2026-03-02", createdAt: "2026-02-05", closedAt: null,
    evidenceCount: 3, verifiedBy: null, escalated: false, daysRemaining: 15, percentComplete: 75,
  },
  {
    id: "NC-003", ncNumber: "PEOTRAM-2026-003", element: 11, elementName: "Preparação Emergência (PE)", itemId: "11.3.1",
    description: "Simulado de emergência de abandono não realizado dentro do prazo regulamentar",
    rootCause: "Conflito com operações contínuas de produção impediu agendamento",
    correctiveAction: "Realizar simulado de abandono com participação de 100% da tripulação",
    preventiveAction: "Criar calendário fixo de simulados com prioridade sobre operações regulares",
    priority: "A", status: "open", responsible: "João Santos", responsibleEmail: "joao@company.com",
    dueDate: "2026-02-20", createdAt: "2026-02-10", closedAt: null,
    evidenceCount: 0, verifiedBy: null, escalated: true, daysRemaining: 5, percentComplete: 0,
  },
  {
    id: "NC-004", ncNumber: "PEOTRAM-2026-004", element: 12, elementName: "Análise Incidentes (AI)", itemId: "12.2.1",
    description: "Investigação de quase-acidente sem análise de causa raiz completa",
    rootCause: "Metodologia de investigação insuficiente (sem uso de Bow-Tie ou 5 Porquês)",
    correctiveAction: "Retreinar equipe de investigação em metodologias Bow-Tie e 5 Porquês",
    preventiveAction: "Padronizar formulário de investigação com checklist obrigatório de causa raiz",
    priority: "C", status: "verification", responsible: "Ana Martins", responsibleEmail: "ana@company.com",
    dueDate: "2026-03-15", createdAt: "2026-02-01", closedAt: null,
    evidenceCount: 5, verifiedBy: "Cmdt. Roberto", escalated: false, daysRemaining: 28, percentComplete: 90,
  },
  {
    id: "NC-005", ncNumber: "PEOTRAM-2025-089", element: 9, elementName: "Recursos Humanos (RH)", itemId: "9.1.2",
    description: "Treinamento CIPA com deficiência de carga horária",
    rootCause: "Fornecedor de treinamento não cumpriu currículo completo",
    correctiveAction: "Complementar treinamento CIPA com carga horária regulamentar",
    preventiveAction: "Auditar certificados de treinamento contra carga horária mínima exigida",
    priority: "D", status: "closed", responsible: "Maria Lima", responsibleEmail: "maria@company.com",
    dueDate: "2026-01-30", createdAt: "2025-12-15", closedAt: "2026-01-28",
    evidenceCount: 4, verifiedBy: "Cmdt. Roberto", escalated: false, daysRemaining: 0, percentComplete: 100,
  },
];

export function PeotramNCActionPlan() {
  const [ncs, setNcs] = useState(MOCK_NCS);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const filtered = useMemo(() => ncs.filter(nc =>
    (filterStatus === "all" || nc.status === filterStatus) &&
    (filterPriority === "all" || nc.priority === filterPriority)
  ), [ncs, filterStatus, filterPriority]);

  const openNCs = ncs.filter(nc => nc.status !== "closed");
  const overdueNCs = openNCs.filter(nc => nc.daysRemaining <= 0);
  const criticalNCs = openNCs.filter(nc => nc.priority === "A");
  const closedNCs = ncs.filter(nc => nc.status === "closed");
  const closureRate = ncs.length > 0 ? Math.round((closedNCs.length / ncs.length) * 100) : 0;
  const avgCompletion = openNCs.length > 0 ? Math.round(openNCs.reduce((a, nc) => a + nc.percentComplete, 0) / openNCs.length) : 0;

  const updateStatus = (id: string, status: NCStatus) => {
    setNcs(prev => prev.map(nc => nc.id === id ? {
      ...nc, status,
      closedAt: status === "closed" ? new Date().toISOString().split("T")[0] : nc.closedAt,
      percentComplete: status === "closed" ? 100 : nc.percentComplete,
    } : nc));
    toast.success(`NC ${id} atualizada para: ${STATUS_CONFIG[status].label}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Plano de Ação — Não Conformidades
          </h3>
          <p className="text-sm text-muted-foreground">
            Rastreamento de NCs com prazos, responsáveis e escalação automática
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1" onClick={() => toast.success("Plano de ação exportado")}>
            <Download className="h-3 w-3" /> Exportar
          </Button>
          <Button size="sm" className="gap-1" onClick={() => toast.info("Nova NC — preencha os dados")}>
            <Plus className="h-3 w-3" /> Nova NC
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold">{ncs.length}</p>
          <p className="text-[10px] text-muted-foreground">Total NCs</p>
        </CardContent></Card>
        <Card className="border-destructive/20"><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-destructive">{openNCs.length}</p>
          <p className="text-[10px] text-muted-foreground">Abertas</p>
        </CardContent></Card>
        <Card className={overdueNCs.length > 0 ? "border-destructive/40 bg-destructive/5" : ""}><CardContent className="pt-4 text-center">
          <p className={`text-2xl font-bold ${overdueNCs.length > 0 ? "text-destructive" : ""}`}>{overdueNCs.length}</p>
          <p className="text-[10px] text-muted-foreground">Vencidas</p>
        </CardContent></Card>
        <Card className="border-warning/20"><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-warning">{criticalNCs.length}</p>
          <p className="text-[10px] text-muted-foreground">Críticas (A)</p>
        </CardContent></Card>
        <Card className="border-success/20"><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-success">{closureRate}%</p>
          <p className="text-[10px] text-muted-foreground">Taxa Fechamento</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold">{avgCompletion}%</p>
          <p className="text-[10px] text-muted-foreground">Progresso Médio</p>
        </CardContent></Card>
      </div>

      {/* Overdue Alert */}
      {overdueNCs.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-3 space-y-1">
            {overdueNCs.map(nc => (
              <div key={nc.id} className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                <Badge variant="destructive" className="text-[10px]">{nc.ncNumber}</Badge>
                <span className="font-medium">{nc.elementName}</span>
                <span className="text-muted-foreground">— {Math.abs(nc.daysRemaining)}d vencida</span>
                <span className="text-muted-foreground">• {nc.responsible}</span>
                {nc.escalated && <Badge variant="outline" className="text-[10px] border-destructive text-destructive">ESCALADA</Badge>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Prioridade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Prioridades</SelectItem>
            {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
              <SelectItem key={k} value={k}>{k} — {v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* NC Cards */}
      <div className="space-y-3">
        {filtered.map(nc => (
          <Card key={nc.id} className={`${STATUS_CONFIG[nc.status].color} ${nc.escalated ? "ring-1 ring-destructive/40" : ""}`}>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {STATUS_CONFIG[nc.status].icon}
                    <Badge variant="outline" className="text-xs font-mono">{nc.ncNumber}</Badge>
                    <Badge className={`text-[10px] ${PRIORITY_CONFIG[nc.priority].color}`}>{nc.priority} — {PRIORITY_CONFIG[nc.priority].label}</Badge>
                    <Badge variant="outline" className="text-xs">Elem. {nc.element} ({nc.elementName})</Badge>
                    <Badge variant="outline" className="text-xs">Item {nc.itemId}</Badge>
                    {nc.escalated && <Badge variant="destructive" className="text-[10px]">ESCALADA</Badge>}
                  </div>
                  <p className="text-sm font-medium">{nc.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-lg font-bold ${nc.daysRemaining < 0 ? "text-destructive" : nc.daysRemaining <= 5 ? "text-warning" : ""}`}>
                    {nc.status === "closed" ? "✓" : nc.daysRemaining < 0 ? `${Math.abs(nc.daysRemaining)}d vencida` : `${nc.daysRemaining}d`}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Prazo: {nc.dueDate}</p>
                </div>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-3">
                <Progress value={nc.percentComplete} className="flex-1 h-2" />
                <span className="text-xs font-bold w-10 text-right">{nc.percentComplete}%</span>
              </div>

              {/* Details Grid */}
              <div className="grid md:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1.5">
                  <div><span className="text-muted-foreground">Causa Raiz:</span> <span>{nc.rootCause}</span></div>
                  <div><span className="text-muted-foreground">Ação Corretiva:</span> <span>{nc.correctiveAction}</span></div>
                  <div><span className="text-muted-foreground">Ação Preventiva:</span> <span>{nc.preventiveAction}</span></div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1"><Users className="h-3 w-3 text-muted-foreground" /> <span className="text-muted-foreground">Responsável:</span> <span className="font-medium">{nc.responsible}</span></div>
                  <div className="flex items-center gap-1"><Calendar className="h-3 w-3 text-muted-foreground" /> <span className="text-muted-foreground">Criada:</span> {nc.createdAt} • <span className="text-muted-foreground">Prazo:</span> {nc.dueDate}</div>
                  <div className="flex items-center gap-1"><FileText className="h-3 w-3 text-muted-foreground" /> {nc.evidenceCount} evidência(s) {nc.verifiedBy && <span>• Verificado por: {nc.verifiedBy}</span>}</div>
                </div>
              </div>

              {/* Actions */}
              {nc.status !== "closed" && (
                <div className="flex gap-2 flex-wrap pt-1 border-t">
                  {nc.status === "open" && (
                    <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => updateStatus(nc.id, "in_progress")}>
                      <ArrowRight className="h-3 w-3" /> Iniciar
                    </Button>
                  )}
                  {nc.status === "in_progress" && (
                    <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => updateStatus(nc.id, "evidence_pending")}>
                      <FileText className="h-3 w-3" /> Enviar Evidências
                    </Button>
                  )}
                  {nc.status === "evidence_pending" && (
                    <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => updateStatus(nc.id, "verification")}>
                      <Eye className="h-3 w-3" /> Solicitar Verificação
                    </Button>
                  )}
                  {nc.status === "verification" && (
                    <Button size="sm" className="gap-1 text-xs h-7 bg-success hover:bg-success/90" onClick={() => updateStatus(nc.id, "closed")}>
                      <CheckCircle className="h-3 w-3" /> Fechar NC
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
