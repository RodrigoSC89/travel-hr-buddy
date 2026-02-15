/**
 * PEOTRAM Audit Timeline - Visual preparation milestones tracker
 * Shows deadline-driven timeline for audit readiness
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Calendar, CheckCircle, Clock, AlertTriangle, Target,
  Plus, ChevronRight, Flag, ArrowRight, Zap
} from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: "pending" | "in_progress" | "completed" | "overdue";
  category: "documentation" | "inspection" | "training" | "corrective_action" | "review";
  element?: string;
  priority: "critical" | "high" | "medium" | "low";
  completedDate?: string;
  assignee?: string;
  progress: number;
}

const INITIAL_MILESTONES: Milestone[] = [
  {
    id: "m1", title: "Revisão Documentação SGI", description: "Verificar todos os procedimentos e manuais do SGI estão atualizados",
    dueDate: "2025-02-01", status: "completed", category: "documentation", priority: "critical", progress: 100, completedDate: "2025-01-28", assignee: "Coord. QSMS"
  },
  {
    id: "m2", title: "Inspeção Elementos Críticos (4,6,11,12)", description: "Pré-auditoria dos 4 elementos críticos do PEOTRAM",
    dueDate: "2025-02-15", status: "completed", category: "inspection", priority: "critical", element: "4,6,11,12", progress: 100, completedDate: "2025-02-14", assignee: "Auditor Líder"
  },
  {
    id: "m3", title: "Treinamento Tripulação - Procedimentos Emergência", description: "Reciclagem em PE e simulados conforme Elemento 11",
    dueDate: "2025-03-01", status: "in_progress", category: "training", priority: "high", element: "11", progress: 65, assignee: "Oficial de Segurança"
  },
  {
    id: "m4", title: "Ações Corretivas NCs Ciclo Anterior", description: "Fechamento das 5 NCs pendentes do ciclo 2024",
    dueDate: "2025-03-10", status: "in_progress", category: "corrective_action", priority: "critical", progress: 40, assignee: "Coord. QSMS"
  },
  {
    id: "m5", title: "Evidências Fotográficas Atualizadas", description: "Registro fotográfico de equipamentos, sinalização e áreas críticas",
    dueDate: "2025-03-15", status: "pending", category: "inspection", priority: "medium", progress: 0, assignee: "Técnico QSMS"
  },
  {
    id: "m6", title: "Calibração de Instrumentos", description: "Verificar certificados de calibração válidos - Elemento 6 (Manutenção)",
    dueDate: "2025-03-20", status: "pending", category: "documentation", priority: "high", element: "6", progress: 0, assignee: "Sup. Manutenção"
  },
  {
    id: "m7", title: "Simulado Pré-Auditoria Completo", description: "Auditoria interna simulando condições reais da Petrobras",
    dueDate: "2025-04-01", status: "pending", category: "review", priority: "critical", progress: 0, assignee: "Auditor Líder"
  },
  {
    id: "m8", title: "Relatório Final de Prontidão", description: "Compilar relatório consolidado com score geral e gaps residuais",
    dueDate: "2025-04-10", status: "pending", category: "review", priority: "high", progress: 0, assignee: "Coord. QSMS"
  },
];

const categoryConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  documentation: { label: "Documentação", color: "bg-blue-500", icon: Target },
  inspection: { label: "Inspeção", color: "bg-amber-500", icon: Flag },
  training: { label: "Treinamento", color: "bg-green-500", icon: Zap },
  corrective_action: { label: "Ação Corretiva", color: "bg-red-500", icon: AlertTriangle },
  review: { label: "Revisão", color: "bg-purple-500", icon: CheckCircle },
};

const priorityConfig: Record<string, { label: string; variant: "destructive" | "default" | "secondary" | "outline" }> = {
  critical: { label: "Crítico", variant: "destructive" },
  high: { label: "Alto", variant: "default" },
  medium: { label: "Médio", variant: "secondary" },
  low: { label: "Baixo", variant: "outline" },
};

export const PeotramAuditTimeline: React.FC = () => {
  const [milestones, setMilestones] = useState<Milestone[]>(INITIAL_MILESTONES);
  const [filter, setFilter] = useState<string>("all");

  const today = new Date().toISOString().split("T")[0];

  const filtered = milestones.filter(m => filter === "all" || m.status === filter);
  const sorted = [...filtered].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const stats = {
    total: milestones.length,
    completed: milestones.filter(m => m.status === "completed").length,
    overdue: milestones.filter(m => m.status !== "completed" && m.dueDate < today).length,
    inProgress: milestones.filter(m => m.status === "in_progress").length,
    pending: milestones.filter(m => m.status === "pending").length,
  };
  const readiness = Math.round((stats.completed / stats.total) * 100);

  const toggleStatus = (id: string) => {
    setMilestones(prev => prev.map(m => {
      if (m.id !== id) return m;
      const next = m.status === "pending" ? "in_progress" : m.status === "in_progress" ? "completed" : m.status;
      return { ...m, status: next, progress: next === "completed" ? 100 : m.progress, completedDate: next === "completed" ? today : m.completedDate };
    }));
  };

  const getDaysLeft = (dueDate: string) => {
    const diff = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-6">
      {/* Readiness Header */}
      <Card className="border-warning/30 bg-gradient-to-r from-warning/5 to-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold">Prontidão para Auditoria PEOTRAM</h3>
              <p className="text-sm text-muted-foreground">Cronograma de preparação com marcos e prazos</p>
            </div>
            <div className="text-right">
              <span className={`text-4xl font-bold ${readiness >= 80 ? "text-green-500" : readiness >= 50 ? "text-warning" : "text-destructive"}`}>
                {readiness}%
              </span>
              <p className="text-xs text-muted-foreground">Prontidão Geral</p>
            </div>
          </div>
          <Progress value={readiness} className="h-3" />
          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="text-center p-2 rounded-lg bg-green-500/10">
              <span className="text-lg font-bold text-green-500">{stats.completed}</span>
              <p className="text-xs text-muted-foreground">Concluídos</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-blue-500/10">
              <span className="text-lg font-bold text-blue-500">{stats.inProgress}</span>
              <p className="text-xs text-muted-foreground">Em Andamento</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted">
              <span className="text-lg font-bold">{stats.pending}</span>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-destructive/10">
              <span className="text-lg font-bold text-destructive">{stats.overdue}</span>
              <p className="text-xs text-muted-foreground">Atrasados</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { value: "all", label: "Todos" },
          { value: "pending", label: "Pendentes" },
          { value: "in_progress", label: "Em Andamento" },
          { value: "completed", label: "Concluídos" },
        ].map(f => (
          <Button key={f.value} size="sm" variant={filter === f.value ? "default" : "outline"} onClick={() => setFilter(f.value)}>
            {f.label}
          </Button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative space-y-0">
        {sorted.map((milestone, idx) => {
          const cat = categoryConfig[milestone.category];
          const pri = priorityConfig[milestone.priority];
          const daysLeft = getDaysLeft(milestone.dueDate);
          const isOverdue = milestone.status !== "completed" && daysLeft < 0;
          const Icon = cat.icon;

          return (
            <div key={milestone.id} className="relative flex gap-4 pb-8">
              {/* Timeline Line */}
              {idx < sorted.length - 1 && (
                <div className="absolute left-5 top-10 w-0.5 h-full bg-border" />
              )}

              {/* Timeline Dot */}
              <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                milestone.status === "completed" ? "bg-green-500 border-green-500 text-white" :
                isOverdue ? "bg-destructive border-destructive text-white" :
                milestone.status === "in_progress" ? "bg-primary border-primary text-white" :
                "bg-muted border-border"
              }`}>
                {milestone.status === "completed" ? <CheckCircle className="h-5 w-5" /> :
                 isOverdue ? <AlertTriangle className="h-5 w-5" /> :
                 <Icon className="h-5 w-5" />}
              </div>

              {/* Content */}
              <Card className={`flex-1 ${isOverdue ? "border-destructive/40 bg-destructive/5" : ""} ${milestone.status === "completed" ? "opacity-75" : ""}`}>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`font-semibold ${milestone.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                          {milestone.title}
                        </h4>
                        <Badge variant={pri.variant} className="text-[10px] px-1.5 py-0">{pri.label}</Badge>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${cat.color}`} />
                          {cat.label}
                        </Badge>
                        {milestone.element && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            Elem. {milestone.element}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{milestone.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(milestone.dueDate).toLocaleDateString("pt-BR")}
                      </div>
                      {milestone.status !== "completed" && (
                        <span className={`text-xs font-medium ${isOverdue ? "text-destructive" : daysLeft <= 7 ? "text-warning" : "text-muted-foreground"}`}>
                          {isOverdue ? `${Math.abs(daysLeft)}d atrasado` : `${daysLeft}d restantes`}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 flex-1">
                      {milestone.assignee && (
                        <span className="text-xs text-muted-foreground">👤 {milestone.assignee}</span>
                      )}
                      <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                        <Progress value={milestone.progress} className="h-1.5" />
                        <span className="text-xs text-muted-foreground">{milestone.progress}%</span>
                      </div>
                    </div>
                    {milestone.status !== "completed" && (
                      <Button size="sm" variant="ghost" className="gap-1 text-xs h-7" onClick={() => toggleStatus(milestone.id)}>
                        {milestone.status === "pending" ? "Iniciar" : "Concluir"} <ChevronRight className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};
