/**
import { useState, useMemo, useCallback } from "react";;
 * Execution Roadmap Page - PATCH 980
 * Technical execution roadmap for 7, 15, and 30 days
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar, CheckCircle2, Clock, Target, Zap, 
  AlertTriangle, ArrowRight, Download
} from "lucide-react";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description: string;
  module: string;
  priority: "high" | "medium" | "low";
  effort: string;
  completed: boolean;
  day: number;
}

const ROADMAP_TASKS: Task[] = [
  // Dias 1-7: Ajustes Críticos
  { id: "1", title: "Validar todos os fluxos de autenticação", description: "Testar login, logout, refresh token, permissões", module: "Auth", priority: "high", effort: "4h", completed: false, day: 1 },
  { id: "2", title: "Testar sincronização offline completa", description: "Simular 24h offline com múltiplas operações", module: "Offline", priority: "high", effort: "8h", completed: false, day: 1 },
  { id: "3", title: "Validar resolução de conflitos", description: "Criar conflitos propositais e verificar resolução", module: "Sync", priority: "high", effort: "4h", completed: false, day: 2 },
  { id: "4", title: "Testar compressão de dados", description: "Verificar economia de espaço em datasets reais", module: "Storage", priority: "medium", effort: "2h", completed: false, day: 2 },
  { id: "5", title: "Validar cache de IA", description: "Testar hit rate e respostas semânticas", module: "AI", priority: "high", effort: "4h", completed: false, day: 3 },
  { id: "6", title: "Testar dashboards com dados reais", description: "Verificar performance com 10k+ registros", module: "Dashboard", priority: "high", effort: "6h", completed: false, day: 3 },
  { id: "7", title: "Validar geração de relatórios", description: "Gerar todos os tipos de relatório em PDF/Excel", module: "Reports", priority: "medium", effort: "4h", completed: false, day: 4 },
  { id: "8", title: "Testar fluxo de manutenção completo", description: "Da criação ao fechamento de OS", module: "Maintenance", priority: "high", effort: "6h", completed: false, day: 4 },
  { id: "9", title: "Validar compliance MLC/SOLAS", description: "Verificar checklists e alertas de vencimento", module: "Compliance", priority: "high", effort: "4h", completed: false, day: 5 },
  { id: "10", title: "Testar gestão de certificações", description: "Cadastro, alertas e renovações", module: "HR", priority: "medium", effort: "4h", completed: false, day: 5 },
  { id: "11", title: "Audit de segurança básico", description: "Verificar RLS, permissões, sanitização", module: "Security", priority: "high", effort: "8h", completed: false, day: 6 },
  { id: "12", title: "Testar notificações e alertas", description: "Push, email, priorização", module: "Notifications", priority: "medium", effort: "4h", completed: false, day: 6 },
  { id: "13", title: "Validar documentação embutida", description: "FAQ, tutoriais, assistente", module: "Help", priority: "low", effort: "2h", completed: false, day: 7 },
  { id: "14", title: "Executar benchmark de performance", description: "Medir métricas em dispositivos reais", module: "Performance", priority: "medium", effort: "4h", completed: false, day: 7 },
  
  // Dias 8-15: Refinamentos
  { id: "15", title: "Otimizar queries lentas", description: "Identificar e otimizar top 10 queries", module: "Database", priority: "high", effort: "8h", completed: false, day: 8 },
  { id: "16", title: "Melhorar UX mobile", description: "Ajustar layouts responsivos", module: "UI", priority: "medium", effort: "6h", completed: false, day: 9 },
  { id: "17", title: "Implementar lazy loading adicional", description: "Otimizar carregamento de módulos", module: "Performance", priority: "medium", effort: "4h", completed: false, day: 10 },
  { id: "18", title: "Adicionar mais templates de IA", description: "Expandir respostas rápidas", module: "AI", priority: "low", effort: "4h", completed: false, day: 11 },
  { id: "19", title: "Testar em diferentes navegadores", description: "Chrome, Firefox, Safari, Edge", module: "QA", priority: "high", effort: "6h", completed: false, day: 12 },
  { id: "20", title: "Documentar APIs internas", description: "Swagger/OpenAPI para endpoints", module: "Docs", priority: "medium", effort: "8h", completed: false, day: 13 },
  { id: "21", title: "Criar testes E2E críticos", description: "Playwright para fluxos principais", module: "QA", priority: "high", effort: "12h", completed: false, day: 14 },
  { id: "22", title: "Revisar logs e métricas", description: "Configurar monitoramento em produção", module: "DevOps", priority: "medium", effort: "6h", completed: false, day: 15 },
  
  // Dias 16-30: Estabilização e Preparação
  { id: "23", title: "Teste de carga simulado", description: "100+ usuários simultâneos", module: "Performance", priority: "high", effort: "8h", completed: false, day: 16 },
  { id: "24", title: "Validar backup e recuperação", description: "Testar restore de banco", module: "Database", priority: "high", effort: "4h", completed: false, day: 18 },
  { id: "25", title: "Treinar equipe de suporte", description: "Documentação e sessões", module: "Training", priority: "medium", effort: "8h", completed: false, day: 20 },
  { id: "26", title: "Preparar ambiente de produção", description: "Configurar infra final", module: "DevOps", priority: "high", effort: "8h", completed: false, day: 22 },
  { id: "27", title: "Teste de aceitação do usuário", description: "UAT com stakeholders", module: "QA", priority: "high", effort: "16h", completed: false, day: 25 },
  { id: "28", title: "Correção de bugs do UAT", description: "Resolver issues identificados", module: "Dev", priority: "high", effort: "16h", completed: false, day: 27 },
  { id: "29", title: "Preparar release notes", description: "Documentar versão final", module: "Docs", priority: "low", effort: "4h", completed: false, day: 29 },
  { id: "30", title: "Deploy para produção", description: "Go-live!", module: "DevOps", priority: "high", effort: "8h", completed: false, day: 30 },
];

export default function ExecutionRoadmap() {
  const [tasks, setTasks] = useState<Task[]>(ROADMAP_TASKS);
  const [activePhase, setActivePhase] = useState("week1");

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const getPhaseStats = (startDay: number, endDay: number) => {
    const phaseTasks = tasks.filter(t => t.day >= startDay && t.day <= endDay);
    const completed = phaseTasks.filter(t => t.completed).length;
    return {
      total: phaseTasks.length,
      completed,
      percentage: Math.round((completed / phaseTasks.length) * 100) || 0
    };
  };

  const week1Stats = getPhaseStats(1, 7);
  const week2Stats = getPhaseStats(8, 15);
  const week3_4Stats = getPhaseStats(16, 30);
  const totalStats = {
    completed: tasks.filter(t => t.completed).length,
    total: tasks.length,
    percentage: Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)
  };

  const exportRoadmap = () => {
    let content = "# Roteiro de Execução Técnica\n\n";
    content += `Gerado em: ${new Date().toLocaleString("pt-BR")}\n\n`;
    content += `## Progresso Geral: ${totalStats.percentage}%\n\n`;
    
    [{ name: "Semana 1 (Dias 1-7)", start: 1, end: 7 },
      { name: "Semana 2 (Dias 8-15)", start: 8, end: 15 },
      { name: "Semanas 3-4 (Dias 16-30)", start: 16, end: 30 }
    ].forEach(phase => {
      content += `### ${phase.name}\n\n`;
      tasks.filter(t => t.day >= phase.start && t.day <= phase.end).forEach(t => {
        content += `- [${t.completed ? "x" : " "}] **Dia ${t.day}**: ${t.title}\n`;
        content += `  - Módulo: ${t.module} | Prioridade: ${t.priority} | Esforço: ${t.effort}\n`;
        content += `  - ${t.description}\n\n`;
  };
  };
    
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `roteiro-execucao-${new Date().toISOString().split("T")[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Roteiro exportado!");
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "high": return "bg-red-500";
    case "medium": return "bg-yellow-500";
    default: return "bg-blue-500";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Roteiro de Execução</h1>
          <p className="text-muted-foreground">
            Planejamento técnico para 7, 15 e 30 dias
          </p>
        </div>
        <Button onClick={exportRoadmap}>
          <Download className="h-4 w-4 mr-2" />
          Exportar Roteiro
        </Button>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Progresso Total</span>
              <Target className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold">{totalStats.percentage}%</p>
            <Progress value={totalStats.percentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {totalStats.completed}/{totalStats.total} tarefas
            </p>
          </CardContent>
        </Card>

        <Card className={activePhase === "week1" ? "ring-2 ring-primary" : ""}>
          <CardContent className="pt-6 cursor-pointer" onClick={handleSetActivePhase}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Semana 1</span>
              <Calendar className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-2xl font-bold">{week1Stats.percentage}%</p>
            <Progress value={week1Stats.percentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {week1Stats.completed}/{week1Stats.total} tarefas
            </p>
          </CardContent>
        </Card>

        <Card className={activePhase === "week2" ? "ring-2 ring-primary" : ""}>
          <CardContent className="pt-6 cursor-pointer" onClick={handleSetActivePhase}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Semana 2</span>
              <Calendar className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold">{week2Stats.percentage}%</p>
            <Progress value={week2Stats.percentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {week2Stats.completed}/{week2Stats.total} tarefas
            </p>
          </CardContent>
        </Card>

        <Card className={activePhase === "week3_4" ? "ring-2 ring-primary" : ""}>
          <CardContent className="pt-6 cursor-pointer" onClick={handleSetActivePhase}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Semanas 3-4</span>
              <Calendar className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold">{week3_4Stats.percentage}%</p>
            <Progress value={week3_4Stats.percentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {week3_4Stats.completed}/{week3_4Stats.total} tarefas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks */}
      <Tabs value={activePhase} onValueChange={setActivePhase}>
        <TabsList>
          <TabsTrigger value="week1">Dias 1-7 (Críticos)</TabsTrigger>
          <TabsTrigger value="week2">Dias 8-15 (Refinamento)</TabsTrigger>
          <TabsTrigger value="week3_4">Dias 16-30 (Estabilização)</TabsTrigger>
        </TabsList>

        <TabsContent value="week1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Ajustes Críticos - Dias 1 a 7
              </CardTitle>
              <CardDescription>
                Foco em validação, testes de integração e correção de bugs críticos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TaskList 
                tasks={tasks.filter(t => t.day >= 1 && t.day <= 7)} 
                onToggle={toggleTask}
                getPriorityColor={getPriorityColor}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="week2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Refinamentos - Dias 8 a 15
              </CardTitle>
              <CardDescription>
                Otimizações de performance, UX e documentação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TaskList 
                tasks={tasks.filter(t => t.day >= 8 && t.day <= 15)} 
                onToggle={toggleTask}
                getPriorityColor={getPriorityColor}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="week3_4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Estabilização e Go-Live - Dias 16 a 30
              </CardTitle>
              <CardDescription>
                Testes finais, UAT e preparação para produção
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TaskList 
                tasks={tasks.filter(t => t.day >= 16 && t.day <= 30)} 
                onToggle={toggleTask}
                getPriorityColor={getPriorityColor}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TaskList({ 
  tasks, 
  onToggle, 
  getPriorityColor 
}: { 
  tasks: Task[]; 
  onToggle: (id: string) => void;
  getPriorityColor: (p: string) => string;
}) {
  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-3">
        {tasks.map((task) => (
          <div 
            key={task.id} 
            className={`flex items-start gap-3 p-4 rounded-lg border ${
              task.completed ? "bg-green-500/5 border-green-500/20" : ""
            }`}
          >
            <Checkbox 
              checked={task.completed}
              onCheckedChange={() => onToggle(task.id}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline">Dia {task.day}</Badge>
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
                <Badge variant="secondary">{task.module}</Badge>
                <span className="text-sm text-muted-foreground ml-auto">
                  <Clock className="h-3 w-3 inline mr-1" />
                  {task.effort}
                </span>
              </div>
              <p className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                {task.title}
              </p>
              <p className="text-sm text-muted-foreground">{task.description}</p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
