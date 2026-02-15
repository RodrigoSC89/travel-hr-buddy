/**
 * Dry Dock Planner — Scheduled maintenance period management
 * Work scope, budget tracking, timeline, yard selection
 * Comparable to ABS Nautical Systems / AMOS
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Wrench, Calendar, DollarSign, Ship, Clock, CheckCircle,
  AlertTriangle, Plus, Download, Target, BarChart3, Eye
} from "lucide-react";
import { toast } from "sonner";

type DockStatus = "planned" | "preparation" | "in_dock" | "completed";

interface DryDockProject {
  id: string;
  vesselName: string;
  yardName: string;
  yardLocation: string;
  status: DockStatus;
  startDate: string;
  endDate: string;
  daysPlanned: number;
  daysElapsed: number;
  budgetUSD: number;
  spentUSD: number;
  workItems: { category: string; count: number; completed: number }[];
  classReqs: number;
  classCompleted: number;
  criticalPath: string[];
}

const STATUS_CONFIG: Record<DockStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  planned: { label: "Planejado", variant: "outline" },
  preparation: { label: "Preparação", variant: "secondary" },
  in_dock: { label: "Em Dique", variant: "default" },
  completed: { label: "Concluído", variant: "outline" },
};

const PROJECTS: DryDockProject[] = [
  {
    id: "DD-001", vesselName: "Nautilus Explorer", yardName: "Jurong Shipyard", yardLocation: "Singapura",
    status: "preparation", startDate: "2026-04-15", endDate: "2026-05-15", daysPlanned: 30, daysElapsed: 0,
    budgetUSD: 2800000, spentUSD: 420000,
    workItems: [
      { category: "Hull & Estrutura", count: 18, completed: 3 },
      { category: "Propulsão", count: 12, completed: 1 },
      { category: "Elétrica", count: 8, completed: 0 },
      { category: "Pintura & Coating", count: 6, completed: 2 },
      { category: "Classe (Survey)", count: 15, completed: 4 },
      { category: "Segurança/LSA", count: 10, completed: 2 },
    ],
    classReqs: 15, classCompleted: 4,
    criticalPath: ["Inspeção de casco", "Reparo do sistema de leme", "Survey de classe (SS)", "Teste de propulsão"],
  },
  {
    id: "DD-002", vesselName: "Nautilus Pioneer", yardName: "Keppel Shipyard", yardLocation: "Singapura",
    status: "in_dock", startDate: "2026-02-01", endDate: "2026-03-05", daysPlanned: 32, daysElapsed: 14,
    budgetUSD: 3500000, spentUSD: 1890000,
    workItems: [
      { category: "Hull & Estrutura", count: 22, completed: 15 },
      { category: "Propulsão", count: 14, completed: 8 },
      { category: "Elétrica", count: 10, completed: 7 },
      { category: "Pintura & Coating", count: 8, completed: 3 },
      { category: "Classe (Survey)", count: 18, completed: 12 },
      { category: "Segurança/LSA", count: 12, completed: 9 },
    ],
    classReqs: 18, classCompleted: 12,
    criticalPath: ["Substituição de thruster #2", "Calibração de sensores DP", "Teste de estanqueidade"],
  },
  {
    id: "DD-003", vesselName: "Nautilus Titan", yardName: "DSME", yardLocation: "Coreia do Sul",
    status: "planned", startDate: "2026-09-01", endDate: "2026-10-10", daysPlanned: 39, daysElapsed: 0,
    budgetUSD: 4200000, spentUSD: 0,
    workItems: [
      { category: "Hull & Estrutura", count: 25, completed: 0 },
      { category: "Propulsão", count: 16, completed: 0 },
      { category: "Elétrica", count: 12, completed: 0 },
      { category: "Pintura & Coating", count: 10, completed: 0 },
      { category: "Classe (Survey)", count: 20, completed: 0 },
      { category: "Segurança/LSA", count: 14, completed: 0 },
    ],
    classReqs: 20, classCompleted: 0,
    criticalPath: ["Special Survey (SS)", "Drydocking Survey", "Retrofit sistema de ballast water"],
  },
];

export function DryDockPlanner() {
  const [projects] = useState(PROJECTS);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const totalBudget = projects.reduce((a, p) => a + p.budgetUSD, 0);
  const totalSpent = projects.reduce((a, p) => a + p.spentUSD, 0);
  const activeProjects = projects.filter(p => p.status === "in_dock" || p.status === "preparation").length;

  const viewProject = projects.find(p => p.id === selectedProject);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            Dry Dock Planner
          </h3>
          <p className="text-sm text-muted-foreground">
            Planejamento de docagem • Work scope • Budget • Classe
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1" onClick={() => toast.success("Dry dock report exportado")}>
            <Download className="h-3 w-3" /> Exportar
          </Button>
          <Button size="sm" className="gap-1" onClick={() => toast.info("Nova docagem")}>
            <Plus className="h-3 w-3" /> Nova Docagem
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="pt-4 text-center">
          <Ship className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-2xl font-bold">{projects.length}</p>
          <p className="text-[10px] text-muted-foreground">Projetos</p>
        </CardContent></Card>
        <Card className="border-primary/20"><CardContent className="pt-4 text-center">
          <Wrench className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-2xl font-bold text-primary">{activeProjects}</p>
          <p className="text-[10px] text-muted-foreground">Ativos</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <DollarSign className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-2xl font-bold">${(totalBudget / 1e6).toFixed(1)}M</p>
          <p className="text-[10px] text-muted-foreground">Budget Total</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <BarChart3 className="h-4 w-4 mx-auto mb-1 text-warning" />
          <p className="text-2xl font-bold text-warning">${(totalSpent / 1e6).toFixed(1)}M</p>
          <p className="text-[10px] text-muted-foreground">Gasto</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <Target className="h-4 w-4 mx-auto mb-1 text-success" />
          <p className="text-2xl font-bold">{totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%</p>
          <p className="text-[10px] text-muted-foreground">Utilização</p>
        </CardContent></Card>
      </div>

      {/* Project Cards */}
      <div className="space-y-3">
        {projects.map(project => {
          const totalItems = project.workItems.reduce((a, w) => a + w.count, 0);
          const completedItems = project.workItems.reduce((a, w) => a + w.completed, 0);
          const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
          const budgetPct = project.budgetUSD > 0 ? Math.round((project.spentUSD / project.budgetUSD) * 100) : 0;
          const isOverBudget = budgetPct > 90;
          const isExpanded = selectedProject === project.id;

          return (
            <Card key={project.id} className={
              project.status === "in_dock" ? "border-primary/30" :
              project.status === "preparation" ? "border-warning/20" : ""
            }>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{project.vesselName}</span>
                      <Badge variant={STATUS_CONFIG[project.status].variant} className="text-xs">
                        {STATUS_CONFIG[project.status].label}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{project.id}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Wrench className="h-3 w-3" />{project.yardName}, {project.yardLocation}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{project.startDate} → {project.endDate}</span>
                      <span>{project.daysPlanned}d planejados{project.daysElapsed > 0 ? ` • ${project.daysElapsed}d decorridos` : ""}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1 shrink-0"
                    onClick={() => setSelectedProject(isExpanded ? null : project.id)}>
                    <Eye className="h-3 w-3" /> {isExpanded ? "Fechar" : "Detalhes"}
                  </Button>
                </div>

                {/* Progress bars */}
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progresso: {completedItems}/{totalItems} itens</span>
                      <span className="font-bold">{progressPct}%</span>
                    </div>
                    <Progress value={progressPct} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Budget: ${(project.spentUSD / 1e6).toFixed(2)}M / ${(project.budgetUSD / 1e6).toFixed(2)}M</span>
                      <span className={`font-bold ${isOverBudget ? "text-destructive" : ""}`}>{budgetPct}%</span>
                    </div>
                    <Progress value={budgetPct} className={`h-2 ${isOverBudget ? "[&>div]:bg-destructive" : ""}`} />
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t pt-3 space-y-4">
                    {/* Work Scope */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Work Scope</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {project.workItems.map((w, i) => (
                          <div key={i} className="p-2 rounded border text-xs">
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">{w.category}</span>
                              <span>{w.completed}/{w.count}</span>
                            </div>
                            <Progress value={w.count > 0 ? (w.completed / w.count) * 100 : 0} className="h-1.5" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Class Requirements */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Requisitos de Classe</h4>
                      <div className="flex items-center gap-3">
                        <Progress value={project.classReqs > 0 ? (project.classCompleted / project.classReqs) * 100 : 0} className="flex-1 h-2" />
                        <span className="text-xs font-bold">{project.classCompleted}/{project.classReqs}</span>
                        <Badge variant={project.classCompleted === project.classReqs ? "default" : "secondary"} className="text-xs">
                          {project.classCompleted === project.classReqs ? "Completo" : "Em Progresso"}
                        </Badge>
                      </div>
                    </div>

                    {/* Critical Path */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Caminho Crítico</h4>
                      <div className="space-y-1">
                        {project.criticalPath.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs p-1.5 rounded bg-muted/50">
                            <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{i + 1}</span>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
