/**
 * DrydockPlanningTimeline - Planejamento de Docagem de Classe
 * Enterprise-grade drydock scheduling with class society integration
 */

import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Anchor, Calendar, DollarSign, Clock, CheckCircle2, AlertTriangle, 
  Ship, FileText, TrendingUp, Building2, Wrench, ClipboardCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DrydockProject {
  id: string;
  vessel: string;
  vesselId: string;
  classSociety: "DNV" | "Lloyds" | "ABS" | "BV" | "ClassNK";
  type: "special_survey" | "intermediate" | "annual" | "emergency";
  status: "planning" | "approved" | "in_progress" | "completed" | "delayed";
  shipyard: string;
  startDate: Date;
  endDate: Date;
  budgetEstimated: number;
  budgetActual: number;
  completionPercent: number;
  workItems: WorkItem[];
}

interface WorkItem {
  id: string;
  category: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "issue";
  estimatedCost: number;
  actualCost?: number;
  daysRequired: number;
}

const fallbackProjects: DrydockProject[] = [
  {
    id: "1",
    vessel: "MV Atlantic Star",
    vesselId: "v1",
    classSociety: "DNV",
    type: "special_survey",
    status: "in_progress",
    shipyard: "Sembcorp Marine - Singapore",
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    budgetEstimated: 2500000,
    budgetActual: 1800000,
    completionPercent: 45,
    workItems: [
      { id: "w1", category: "Hull", description: "Inspeção de Casco e Pintura", status: "completed", estimatedCost: 450000, actualCost: 420000, daysRequired: 8 },
      { id: "w2", category: "Propulsion", description: "Overhaul de Hélice e Eixo", status: "in_progress", estimatedCost: 320000, daysRequired: 5 },
      { id: "w3", category: "Engine", description: "Revisão Motor Principal", status: "in_progress", estimatedCost: 680000, daysRequired: 12 },
      { id: "w4", category: "Safety", description: "Teste de Equipamentos de Salvatagem", status: "pending", estimatedCost: 85000, daysRequired: 2 },
      { id: "w5", category: "Electrical", description: "Certificação de Instalações Elétricas", status: "pending", estimatedCost: 120000, daysRequired: 3 },
    ],
  },
  {
    id: "2",
    vessel: "MV Pacific Dawn",
    vesselId: "v2",
    classSociety: "Lloyds",
    type: "intermediate",
    status: "planning",
    shipyard: "Damen Shipyards - Netherlands",
    startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    budgetEstimated: 1200000,
    budgetActual: 0,
    completionPercent: 0,
    workItems: [
      { id: "w6", category: "Hull", description: "Inspeção Intermediária de Casco", status: "pending", estimatedCost: 180000, daysRequired: 4 },
      { id: "w7", category: "Tanks", description: "Limpeza e Inspeção de Tanques", status: "pending", estimatedCost: 95000, daysRequired: 3 },
    ],
  },
];

const classSocietyLogos: Record<string, string> = {
  DNV: "🔷",
  Lloyds: "🔶",
  ABS: "🔵",
  BV: "🟢",
  ClassNK: "🔴",
};

const statusConfig = {
  planning: { label: "Planejamento", color: "bg-blue-100 text-blue-700" },
  approved: { label: "Aprovado", color: "bg-green-100 text-green-700" },
  in_progress: { label: "Em Execução", color: "bg-amber-100 text-amber-700" },
  completed: { label: "Concluído", color: "bg-green-100 text-green-700" },
  delayed: { label: "Atrasado", color: "bg-red-100 text-red-700" },
};

const typeLabels = {
  special_survey: "Special Survey (5 anos)",
  intermediate: "Intermediate Survey",
  annual: "Annual Survey",
  emergency: "Docagem Emergencial",
};

export function DrydockPlanningTimeline() {
  const [projects, setProjects] = useState<DrydockProject[]>(fallbackProjects);
  const [selectedProject, setSelectedProject] = useState<DrydockProject>(fallbackProjects[0]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from("maintenance_tasks")
          .select("id, title, description, status, scheduled_date, due_date, estimated_cost, progress_percent, vessel_id")
          .eq("task_type", "drydock")
          .limit(10);

        if (data && data.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase row mapping
          const mapped = data.map((t: any) => ({
            id: t.id,
            vessel: t.title || "Embarcação",
            vesselId: t.vessel_id || "v1",
            classSociety: "DNV" as const,
            type: "special_survey" as const,
            status: (t.status === "completed" ? "completed" : t.status === "in_progress" ? "in_progress" : "planning") as DrydockProject["status"],
            shipyard: t.description || "TBD",
            startDate: new Date(t.scheduled_date || Date.now()),
            endDate: new Date(t.due_date || Date.now()),
            budgetEstimated: t.estimated_cost || 0,
            budgetActual: 0,
            completionPercent: t.progress_percent || 0,
            workItems: []
          }));
          setProjects(mapped);
          setSelectedProject(mapped[0]);
        }
      } catch { /* keep fallback */ }
    };
    load();
  }, []);

  const daysRemaining = differenceInDays(selectedProject.endDate, new Date());
  const totalDays = differenceInDays(selectedProject.endDate, selectedProject.startDate);
  const budgetVariance = ((selectedProject.budgetActual / selectedProject.budgetEstimated) * 100) - 100;

  return (
    <div className="space-y-6">
      {/* Project Selector */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className={`min-w-[280px] cursor-pointer transition-all ${
                selectedProject.id === project.id ? "ring-2 ring-primary" : "hover:border-primary/50"
              }`}
              onClick={() => setSelectedProject(project)}
            >
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{classSocietyLogos[project.classSociety]}</span>
                    <span className="font-semibold">{project.vessel}</span>
                  </div>
                  <Badge className={statusConfig[project.status].color}>
                    {statusConfig[project.status].label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{typeLabels[project.type]}</p>
                <div className="mt-3">
                  <Progress value={project.completionPercent} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">{project.completionPercent}% concluído</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Ship className="h-5 w-5" />
                    {selectedProject.vessel} - {typeLabels[selectedProject.type]}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Building2 className="h-4 w-4" />
                    {selectedProject.shipyard}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-2xl">
                    {classSocietyLogos[selectedProject.classSociety]}
                    <span className="font-bold">{selectedProject.classSociety}</span>
                  </div>
                  <Badge className={statusConfig[selectedProject.status].color}>
                    {statusConfig[selectedProject.status].label}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="budget">Orçamento</TabsTrigger>
                  <TabsTrigger value="inspection">Inspeções</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Data Início</p>
                      <p className="font-semibold">{format(selectedProject.startDate, "dd/MM/yyyy", { locale: ptBR })}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Data Término</p>
                      <p className="font-semibold">{format(selectedProject.endDate, "dd/MM/yyyy", { locale: ptBR })}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Dias Restantes</p>
                      <p className={`font-semibold ${daysRemaining < 5 ? "text-red-600" : ""}`}>{daysRemaining} dias</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Progresso</p>
                      <p className="font-semibold">{selectedProject.completionPercent}%</p>
                    </div>
                  </div>

                  {/* Work Items Summary */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <ClipboardCheck className="h-4 w-4" />
                      Itens de Trabalho
                    </h4>
                    {selectedProject.workItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{item.category}</Badge>
                          <span className="text-sm">{item.description}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">{item.daysRequired} dias</span>
                          <Badge className={
                            item.status === "completed" ? "bg-green-100 text-green-700" :
                            item.status === "in_progress" ? "bg-amber-100 text-amber-700" :
                            item.status === "issue" ? "bg-red-100 text-red-700" :
                            "bg-gray-100 text-gray-700"
                          }>
                            {item.status === "completed" ? "Concluído" :
                             item.status === "in_progress" ? "Em Andamento" :
                             item.status === "issue" ? "Problema" : "Pendente"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="timeline" className="mt-4">
                  <div className="relative">
                    {/* Timeline visualization */}
                    <div className="h-4 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${selectedProject.completionPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>{format(selectedProject.startDate, "dd/MM", { locale: ptBR })}</span>
                      <span>Hoje</span>
                      <span>{format(selectedProject.endDate, "dd/MM", { locale: ptBR })}</span>
                    </div>

                    {/* Gantt-like work items */}
                    <div className="mt-6 space-y-2">
                      {selectedProject.workItems.map((item, index) => {
                        const startOffset = (index * 15) % 100;
                        const width = (item.daysRequired / totalDays) * 100;
                        
                        return (
                          <div key={item.id} className="flex items-center gap-4">
                            <div className="w-40 text-sm truncate">{item.category}</div>
                            <div className="flex-1 h-6 bg-muted/50 rounded relative">
                              <div 
                                className={`absolute h-full rounded transition-all ${
                                  item.status === "completed" ? "bg-green-500" :
                                  item.status === "in_progress" ? "bg-amber-500" :
                                  "bg-gray-300"
                                }`}
                                style={{ 
                                  left: `${startOffset}%`, 
                                  width: `${Math.min(width, 100 - startOffset)}%` 
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="budget" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Orçamento Estimado</p>
                          <p className="text-3xl font-bold">
                            ${(selectedProject.budgetEstimated / 1000000).toFixed(2)}M
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Gasto Atual</p>
                          <p className="text-3xl font-bold">
                            ${(selectedProject.budgetActual / 1000000).toFixed(2)}M
                          </p>
                          <Badge className={budgetVariance > 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}>
                            {budgetVariance > 0 ? "+" : ""}{budgetVariance.toFixed(1)}% vs orçamento
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold mb-4">Breakdown por Categoria</h4>
                    {selectedProject.workItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <span className="text-sm">{item.description}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            ${(item.estimatedCost / 1000).toFixed(0)}K est.
                          </span>
                          {item.actualCost && (
                            <span className={`text-sm font-medium ${
                              item.actualCost > item.estimatedCost ? "text-red-600" : "text-green-600"
                            }`}>
                              ${(item.actualCost / 1000).toFixed(0)}K real
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="inspection" className="mt-4">
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border border-amber-200 bg-amber-50">
                      <div className="flex items-center gap-2 text-amber-700">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-semibold">ESP (Enhanced Survey Programme)</span>
                      </div>
                      <p className="text-sm text-amber-600 mt-1">
                        Inspeção de casco e tanques conforme IACS UR Z10.2
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" className="h-auto py-4">
                        <div className="text-left">
                          <FileText className="h-5 w-5 mb-2" />
                          <p className="font-semibold">Relatório de Espessura</p>
                          <p className="text-xs text-muted-foreground">Thickness Measurement Report</p>
                        </div>
                      </Button>
                      <Button variant="outline" className="h-auto py-4">
                        <div className="text-left">
                          <ClipboardCheck className="h-5 w-5 mb-2" />
                          <p className="font-semibold">Checklist de Classe</p>
                          <p className="text-xs text-muted-foreground">Class Survey Checklist</p>
                        </div>
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Orçamento Total</span>
                <span className="font-bold">${(selectedProject.budgetEstimated / 1000000).toFixed(2)}M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Gasto até agora</span>
                <span className="font-bold">${(selectedProject.budgetActual / 1000000).toFixed(2)}M</span>
              </div>
              <Progress value={(selectedProject.budgetActual / selectedProject.budgetEstimated) * 100} />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Disponível</span>
                <span className="font-bold text-green-600">
                  ${((selectedProject.budgetEstimated - selectedProject.budgetActual) / 1000000).toFixed(2)}M
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Contatos do Projeto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium text-sm">Superintendente Técnico</p>
                <p className="text-xs text-muted-foreground">Eng. Roberto Almeida</p>
                <p className="text-xs text-primary">+55 11 99999-0001</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium text-sm">Gerente de Estaleiro</p>
                <p className="text-xs text-muted-foreground">Mr. Lee Wei Ming</p>
                <p className="text-xs text-primary">+65 8888-0002</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium text-sm">Surveyor {selectedProject.classSociety}</p>
                <p className="text-xs text-muted-foreground">Capt. Hans Mueller</p>
                <p className="text-xs text-primary">+47 777-0003</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <DollarSign className="h-4 w-4 mr-2" />
                Adicionar Custo
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Atualizar Status
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DrydockPlanningTimeline;
