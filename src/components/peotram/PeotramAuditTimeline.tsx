/**
 * PEOTRAM Audit Timeline - Connected to Supabase
 * Real persistence for audit milestones
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Calendar, CheckCircle, Clock, AlertTriangle, Target,
  Plus, ChevronRight, Flag, Zap, Loader2
} from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: string;
  category: string;
  element?: string;
  priority: string;
  completedDate?: string;
  assignee?: string;
  progress: number;
}

const categoryConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  documentation: { label: "Documentação", color: "bg-info", icon: Target },
  inspection: { label: "Inspeção", color: "bg-warning", icon: Flag },
  training: { label: "Treinamento", color: "bg-success", icon: Zap },
  corrective_action: { label: "Ação Corretiva", color: "bg-destructive", icon: AlertTriangle },
  review: { label: "Revisão", color: "bg-accent", icon: CheckCircle },
};

const priorityConfig: Record<string, { label: string; variant: "destructive" | "default" | "secondary" | "outline" }> = {
  critical: { label: "Crítico", variant: "destructive" },
  high: { label: "Alto", variant: "default" },
  medium: { label: "Médio", variant: "secondary" },
  low: { label: "Baixo", variant: "outline" },
};

export const PeotramAuditTimeline: React.FC = () => {
  const [filter, setFilter] = useState<string>("all");
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: milestones = [], isLoading } = useQuery({
    queryKey: ["peotram-audit-milestones"],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)("peotram_audit_milestones")
        .select("*")
        .order("due_date", { ascending: true });
      if (error) throw error;
      return (data || []).map((r: Record<string, unknown>) => ({
        id: String(r.id),
        title: String(r.title || ""),
        description: String(r.description || ""),
        dueDate: String(r.due_date || ""),
        status: String(r.status || "pending"),
        category: String(r.category || "documentation"),
        element: r.element ? String(r.element) : undefined,
        priority: String(r.priority || "medium"),
        completedDate: r.completed_date ? String(r.completed_date) : undefined,
        assignee: r.assignee ? String(r.assignee) : undefined,
        progress: Number(r.progress || 0),
      })) as Milestone[];
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string; currentStatus: string }) => {
      const next = currentStatus === "pending" ? "in_progress" : currentStatus === "in_progress" ? "completed" : currentStatus;
      const update: Record<string, unknown> = { status: next };
      if (next === "completed") { update.progress = 100; update.completed_date = new Date().toISOString(); }
      else if (next === "in_progress") { update.progress = 50; }
      const { error } = await (supabase.from as Function)("peotram_audit_milestones")
        .update(update as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["peotram-audit-milestones"] });
      toast.success("Milestone atualizado");
    },
  });

  const filtered = milestones.filter(m => filter === "all" || m.status === filter);
  const stats = {
    total: milestones.length,
    completed: milestones.filter(m => m.status === "completed").length,
    overdue: milestones.filter(m => m.status !== "completed" && m.dueDate < today).length,
    inProgress: milestones.filter(m => m.status === "in_progress").length,
    pending: milestones.filter(m => m.status === "pending").length,
  };
  const readiness = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const getDaysLeft = (dueDate: string) => Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

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
              <span className={`text-4xl font-bold ${readiness >= 80 ? "text-success" : readiness >= 50 ? "text-warning" : "text-destructive"}`}>
                {readiness}%
              </span>
              <p className="text-xs text-muted-foreground">Prontidão Geral</p>
            </div>
          </div>
          <Progress value={readiness} className="h-3" />
          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="text-center p-2 rounded-lg bg-success/10"><span className="text-lg font-bold text-success">{stats.completed}</span><p className="text-xs text-muted-foreground">Concluídos</p></div>
            <div className="text-center p-2 rounded-lg bg-primary/10"><span className="text-lg font-bold text-primary">{stats.inProgress}</span><p className="text-xs text-muted-foreground">Em Andamento</p></div>
            <div className="text-center p-2 rounded-lg bg-muted"><span className="text-lg font-bold">{stats.pending}</span><p className="text-xs text-muted-foreground">Pendentes</p></div>
            <div className="text-center p-2 rounded-lg bg-destructive/10"><span className="text-lg font-bold text-destructive">{stats.overdue}</span><p className="text-xs text-muted-foreground">Atrasados</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex gap-2">
        {[{ value: "all", label: "Todos" }, { value: "pending", label: "Pendentes" }, { value: "in_progress", label: "Em Andamento" }, { value: "completed", label: "Concluídos" }].map(f => (
          <Button key={f.value} size="sm" variant={filter === f.value ? "default" : "outline"} onClick={() => setFilter(f.value)}>{f.label}</Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="pt-8 pb-8 text-center text-muted-foreground">Nenhum milestone encontrado.</CardContent></Card>
      ) : (
        <div className="relative space-y-0">
          {filtered.map((milestone, idx) => {
            const cat = categoryConfig[milestone.category] || categoryConfig.documentation;
            const pri = priorityConfig[milestone.priority] || priorityConfig.medium;
            const daysLeft = getDaysLeft(milestone.dueDate);
            const isOverdue = milestone.status !== "completed" && daysLeft < 0;
            const Icon = cat.icon;

            return (
              <div key={milestone.id} className="relative flex gap-4 pb-8">
                {idx < filtered.length - 1 && <div className="absolute left-5 top-10 w-0.5 h-full bg-border" />}
                <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  milestone.status === "completed" ? "bg-success border-success text-white" :
                  isOverdue ? "bg-destructive border-destructive text-white" :
                  milestone.status === "in_progress" ? "bg-primary border-primary text-white" : "bg-muted border-border"
                }`}>
                  {milestone.status === "completed" ? <CheckCircle className="h-5 w-5" /> : isOverdue ? <AlertTriangle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <Card className={`flex-1 ${isOverdue ? "border-destructive/40 bg-destructive/5" : ""} ${milestone.status === "completed" ? "opacity-75" : ""}`}>
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`font-semibold ${milestone.status === "completed" ? "line-through text-muted-foreground" : ""}`}>{milestone.title}</h4>
                          <Badge variant={pri.variant} className="text-[10px] px-1.5 py-0">{pri.label}</Badge>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1"><div className={`w-1.5 h-1.5 rounded-full ${cat.color}`} />{cat.label}</Badge>
                          {milestone.element && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Elem. {milestone.element}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{milestone.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />{new Date(milestone.dueDate).toLocaleDateString("pt-BR")}</div>
                        {milestone.status !== "completed" && (
                          <span className={`text-xs font-medium ${isOverdue ? "text-destructive" : daysLeft <= 7 ? "text-warning" : "text-muted-foreground"}`}>
                            {isOverdue ? `${Math.abs(daysLeft)}d atrasado` : `${daysLeft}d restantes`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 flex-1">
                        {milestone.assignee && <span className="text-xs text-muted-foreground">👤 {milestone.assignee}</span>}
                        <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                          <Progress value={milestone.progress} className="h-1.5" />
                          <span className="text-xs text-muted-foreground">{milestone.progress}%</span>
                        </div>
                      </div>
                      {milestone.status !== "completed" && (
                        <Button size="sm" variant="ghost" className="gap-1 text-xs h-7" onClick={() => toggleMutation.mutate({ id: milestone.id, currentStatus: milestone.status })}>
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
      )}
    </div>
  );
};
