/**
 * PEOTRAM Audit Countdown - Preparation timeline with action items
 * Tracks readiness for upcoming PEOTRAM audits with urgency-based task management
 */
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, AlertTriangle, CheckCircle, Target, Brain, Zap, FileText, Users, Shield } from "lucide-react";
import { toast } from "sonner";

interface PrepTask {
  id: string;
  category: string;
  element: string;
  task: string;
  responsible: string;
  daysBeforeAudit: number;
  completed: boolean;
  priority: "critical" | "high" | "medium";
  aiSuggestion?: string;
}

const AUDIT_DATE = new Date();
AUDIT_DATE.setDate(AUDIT_DATE.getDate() + 45); // 45 days from now

const PREP_TASKS: PrepTask[] = [
  // 45-30 days
  { id: "P01", category: "Documentação", element: "E1-LGR", task: "Revisar Política de SMS e obter assinatura da alta direção", responsible: "DPA", daysBeforeAudit: 45, completed: false, priority: "high" },
  { id: "P02", category: "Documentação", element: "E2-CL", task: "Atualizar lista de requisitos legais aplicáveis (NORMAM, NRs)", responsible: "Compliance", daysBeforeAudit: 45, completed: false, priority: "high" },
  { id: "P03", category: "Treinamento", element: "E9-RH", task: "Verificar validade de todos certificados STCW da tripulação", responsible: "RH", daysBeforeAudit: 40, completed: false, priority: "critical" },
  { id: "P04", category: "Manutenção", element: "E6-MN", task: "Verificar PMS atualizado e sem manutenções vencidas", responsible: "Ch. Máquinas", daysBeforeAudit: 40, completed: false, priority: "critical" },
  { id: "P05", category: "Operações", element: "E4-OP", task: "Revisar todas as Permissões de Trabalho dos últimos 6 meses", responsible: "QSMS", daysBeforeAudit: 35, completed: false, priority: "critical" },
  { id: "P06", category: "Riscos", element: "E3-GR", task: "Atualizar matriz de riscos e verificar APRs pendentes", responsible: "QSMS", daysBeforeAudit: 35, completed: false, priority: "high" },
  // 30-15 days
  { id: "P07", category: "Emergência", element: "E11-PE", task: "Realizar exercício simulado de abandono com relatório", responsible: "Comandante", daysBeforeAudit: 30, completed: false, priority: "critical", aiSuggestion: "Incluir cenário noturno para máxima pontuação" },
  { id: "P08", category: "Emergência", element: "E11-PE", task: "Verificar equipamentos de combate a incêndio e salvatagem", responsible: "Imediato", daysBeforeAudit: 28, completed: false, priority: "critical" },
  { id: "P09", category: "Investigação", element: "E12-AI", task: "Verificar se todas investigações de incidentes estão concluídas", responsible: "QSMS", daysBeforeAudit: 25, completed: false, priority: "high" },
  { id: "P10", category: "Mudanças", element: "E7-GM", task: "Verificar se MOCs pendentes estão formalizados", responsible: "QSMS", daysBeforeAudit: 25, completed: false, priority: "medium" },
  { id: "P11", category: "Fornecedores", element: "E8-AQ", task: "Atualizar avaliações de fornecedores críticos", responsible: "Suprimentos", daysBeforeAudit: 20, completed: false, priority: "medium" },
  { id: "P12", category: "Documentação", element: "E10-GI", task: "Verificar sistema de comunicação e registros NA DÚVIDA PARE", responsible: "QSMS", daysBeforeAudit: 20, completed: false, priority: "medium" },
  // 15-0 days
  { id: "P13", category: "Melhoria", element: "E13-MC", task: "Consolidar indicadores proativos e reativos do período", responsible: "QSMS", daysBeforeAudit: 15, completed: false, priority: "high" },
  { id: "P14", category: "Treinamento", element: "E9-RH", task: "Briefing da tripulação sobre auditoria PEOTRAM", responsible: "Comandante", daysBeforeAudit: 10, completed: false, priority: "high", aiSuggestion: "Preparar tripulação para entrevistas nos 4 elementos críticos: OP, MN, PE, AI" },
  { id: "P15", category: "Documentação", element: "E5-ST", task: "Verificar ASOG/CAM e documentação de segurança técnica", responsible: "DPO Sênior", daysBeforeAudit: 10, completed: false, priority: "high" },
  { id: "P16", category: "Final", element: "Geral", task: "Pre-audit self-assessment: simular auditoria interna completa", responsible: "QSMS", daysBeforeAudit: 7, completed: false, priority: "critical", aiSuggestion: "Usar checklist completo dos 13 elementos e gerar relatório de gaps" },
  { id: "P17", category: "Final", element: "Geral", task: "Preparar sala de auditoria com toda documentação organizada", responsible: "Admin", daysBeforeAudit: 3, completed: false, priority: "high" },
  { id: "P18", category: "Final", element: "Geral", task: "Reunião kick-off com equipe: cronograma, logística, responsáveis", responsible: "Comandante", daysBeforeAudit: 1, completed: false, priority: "critical" },
];

export function PeotramAuditCountdown() {
  const [tasks, setTasks] = useState(PREP_TASKS);

  const now = new Date();
  const daysRemaining = Math.ceil((AUDIT_DATE.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const completedCount = tasks.filter(t => t.completed).length;
  const progressPct = Math.round((completedCount / tasks.length) * 100);

  const overdueTasks = tasks.filter(t => !t.completed && (daysRemaining <= t.daysBeforeAudit));
  const upcomingTasks = tasks.filter(t => !t.completed && (daysRemaining > t.daysBeforeAudit));
  const criticalPending = tasks.filter(t => !t.completed && t.priority === "critical").length;

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) {
      toast.success(`✓ ${task.task.slice(0, 40)}...`);
    }
  };

  const urgencyColor = daysRemaining <= 7 ? "text-destructive" : daysRemaining <= 15 ? "text-warning" : daysRemaining <= 30 ? "text-primary" : "text-success";

  return (
    <div className="space-y-4">
      {/* Countdown Header */}
      <Card className={`bg-gradient-to-r ${daysRemaining <= 7 ? "from-destructive/10 to-destructive/5 border-destructive/30" : daysRemaining <= 15 ? "from-warning/10 to-warning/5 border-warning/30" : "from-primary/10 to-primary/5 border-primary/20"}`}>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className={`text-5xl font-bold ${urgencyColor}`}>{daysRemaining}</p>
                <p className="text-sm text-muted-foreground">dias restantes</p>
              </div>
              <div>
                <p className="font-semibold">Auditoria PEOTRAM</p>
                <p className="text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3 inline mr-1" />
                  {AUDIT_DATE.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{progressPct}%</p>
                <p className="text-xs text-muted-foreground">preparação</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-destructive">{criticalPending}</p>
                <p className="text-xs text-muted-foreground">críticos pendentes</p>
              </div>
            </div>
          </div>
          <Progress value={progressPct} className="h-2 mt-4" />
        </CardContent>
      </Card>

      {/* Overdue / Now Tasks */}
      {overdueTasks.length > 0 && (
        <Card className="border-warning/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-warning"><AlertTriangle className="h-4 w-4" /> Tarefas para agora ({overdueTasks.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {overdueTasks.map(task => (
              <div key={task.id} className="flex items-start gap-3 p-2 rounded border bg-background hover:bg-muted/50">
                <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(task.id)} className="mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{task.task}</span>
                    <Badge variant={task.priority === "critical" ? "destructive" : task.priority === "high" ? "secondary" : "outline"} className="text-xs">{task.priority}</Badge>
                    <Badge variant="outline" className="text-xs">{task.element}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span><Users className="h-3 w-3 inline mr-1" />{task.responsible}</span>
                    <span><Clock className="h-3 w-3 inline mr-1" />{task.daysBeforeAudit}d antes</span>
                  </div>
                  {task.aiSuggestion && (
                    <div className="mt-1.5 p-1.5 rounded bg-primary/5 border border-primary/20 flex items-start gap-1">
                      <Brain className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                      <span className="text-xs text-primary">{task.aiSuggestion}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Upcoming Tasks */}
      {upcomingTasks.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> Próximas tarefas ({upcomingTasks.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingTasks.map(task => (
              <div key={task.id} className="flex items-start gap-3 p-2 rounded border opacity-70 hover:opacity-100">
                <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(task.id)} className="mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{task.task}</span>
                    <Badge variant="outline" className="text-xs">{task.element}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{task.responsible}</span>
                    <span>D-{task.daysBeforeAudit}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Completed */}
      {completedCount > 0 && (
        <Card className="border-success/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-success"><CheckCircle className="h-4 w-4" /> Concluídas ({completedCount})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {tasks.filter(t => t.completed).map(task => (
              <div key={task.id} className="flex items-center gap-3 p-1.5 text-sm line-through text-muted-foreground">
                <Checkbox checked onCheckedChange={() => toggleTask(task.id)} />
                <span>{task.task}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
