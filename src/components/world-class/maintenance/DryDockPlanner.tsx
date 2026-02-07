/**
 * Dry Dock Planner - M051
 * Planning and scheduling for dry dock operations with cost estimation
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Anchor, Brain, Calendar, CheckCircle, Clock, DollarSign,
  Hammer, MapPin, RefreshCw, Ship, Sparkles, Target,
  TrendingUp, Wrench, AlertTriangle, BarChart3,
} from "lucide-react";
import { maintenanceIntelligence, DryDockProject, DryDockWorkItem } from "@/services/maintenance";
import { toast } from "sonner";

const categoryConfig: Record<DryDockWorkItem["category"], { icon: React.ElementType; color: string }> = {
  hull: { icon: Ship, color: "text-blue-500" },
  machinery: { icon: Wrench, color: "text-orange-500" },
  piping: { icon: Anchor, color: "text-cyan-500" },
  electrical: { icon: Target, color: "text-yellow-500" },
  painting: { icon: Hammer, color: "text-purple-500" },
  survey: { icon: CheckCircle, color: "text-emerald-500" },
  safety: { icon: AlertTriangle, color: "text-red-500" },
};

const priorityColors: Record<string, string> = {
  critical: "bg-red-500/10 text-red-500 border-red-500/30",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/30",
  medium: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  low: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
};

export function DryDockPlanner() {
  const [projects, setProjects] = useState<DryDockProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiPlan, setAiPlan] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await maintenanceIntelligence.getDryDockProjects();
      setProjects(data);
    } catch (err) {
      toast.error("Erro ao carregar projetos de doca seca");
    } finally {
      setLoading(false);
    }
  };

  const runAIDryDockPlanning = async () => {
    setAnalyzing(true);
    try {
      const result = await maintenanceIntelligence.runOptimization("drydock_planning");
      setAiPlan(result);
      toast.success("Planejamento AI de doca seca concluído");
    } catch (err) {
      toast.error("Erro na análise AI");
    } finally {
      setAnalyzing(false);
    }
  };

  const project = projects[0];

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* AI Planner */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Planejamento Inteligente de Doca Seca</p>
              <p className="text-sm text-muted-foreground">
                AI analisa backlog, custos e estaleiros para criar plano otimizado
              </p>
            </div>
          </div>
          <Button onClick={runAIDryDockPlanning} disabled={analyzing} className="gap-2">
            {analyzing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {analyzing ? "Planejando..." : "Gerar Plano AI"}
          </Button>
        </CardContent>
      </Card>

      {/* AI Plan Results */}
      {aiPlan?.drydock_plan && (
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Plano AI Recomendado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {aiPlan.drydock_plan.recommended_date && (
                <div className="p-3 rounded-lg border border-border/50 bg-muted/20 text-center">
                  <Calendar className="h-4 w-4 mx-auto text-primary mb-1" />
                  <p className="text-sm font-bold">{aiPlan.drydock_plan.recommended_date}</p>
                  <p className="text-xs text-muted-foreground">Data Recomendada</p>
                </div>
              )}
              {aiPlan.drydock_plan.estimated_duration_days > 0 && (
                <div className="p-3 rounded-lg border border-border/50 bg-muted/20 text-center">
                  <Clock className="h-4 w-4 mx-auto text-primary mb-1" />
                  <p className="text-sm font-bold">{aiPlan.drydock_plan.estimated_duration_days} dias</p>
                  <p className="text-xs text-muted-foreground">Duração Estimada</p>
                </div>
              )}
              {aiPlan.drydock_plan.estimated_cost_usd > 0 && (
                <div className="p-3 rounded-lg border border-border/50 bg-muted/20 text-center">
                  <DollarSign className="h-4 w-4 mx-auto text-primary mb-1" />
                  <p className="text-sm font-bold">${aiPlan.drydock_plan.estimated_cost_usd.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Custo Estimado</p>
                </div>
              )}
              {aiPlan.drydock_plan.scope_items?.length > 0 && (
                <div className="p-3 rounded-lg border border-border/50 bg-muted/20 text-center">
                  <Wrench className="h-4 w-4 mx-auto text-primary mb-1" />
                  <p className="text-sm font-bold">{aiPlan.drydock_plan.scope_items.length}</p>
                  <p className="text-xs text-muted-foreground">Itens de Escopo</p>
                </div>
              )}
            </div>
            {aiPlan.drydock_plan.yard_recommendations?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {aiPlan.drydock_plan.yard_recommendations.map((yard: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-xs">{yard}</Badge>
                ))}
              </div>
            )}
            {aiPlan.summary && (
              <p className="mt-3 text-sm text-muted-foreground italic">{aiPlan.summary}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Project Overview */}
      {project ? (
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Ship className="h-4 w-4 text-primary" />
                {project.vesselName} — Projeto {project.id}
              </CardTitle>
              <Badge variant="outline">{project.status.replace("_", " ").toUpperCase()}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="scope" className="space-y-4">
              <TabsList className="grid grid-cols-3 w-full max-w-sm">
                <TabsTrigger value="scope">Escopo</TabsTrigger>
                <TabsTrigger value="schedule">Cronograma</TabsTrigger>
                <TabsTrigger value="costs">Custos</TabsTrigger>
              </TabsList>

              {/* Scope Tab */}
              <TabsContent value="scope">
                <ScrollArea className="h-[350px]">
                  <div className="space-y-2">
                    {project.scopeItems.map((item) => {
                      const cfg = categoryConfig[item.category] || categoryConfig.safety;
                      const Icon = cfg.icon;

                      return (
                        <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-muted/10">
                          <div className="p-1.5 rounded bg-muted/50">
                            <Icon className={`h-4 w-4 ${cfg.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium truncate">{item.description}</p>
                              <Badge variant="outline" className={`text-xs ${priorityColors[item.priority]}`}>
                                {item.priority}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{item.category}</span>
                              <span>{item.estimatedHours}h</span>
                              <span>${item.estimatedCost.toLocaleString()}</span>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs">{item.status}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Schedule Tab */}
              <TabsContent value="schedule">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-4 rounded-lg border border-border/50 bg-muted/20 text-center">
                    <Calendar className="h-5 w-5 mx-auto text-primary mb-1" />
                    <p className="text-lg font-bold">{project.scheduledDate.toLocaleDateString("pt-BR")}</p>
                    <p className="text-xs text-muted-foreground">Data Programada</p>
                  </div>
                  <div className="p-4 rounded-lg border border-border/50 bg-muted/20 text-center">
                    <Clock className="h-5 w-5 mx-auto text-primary mb-1" />
                    <p className="text-lg font-bold">{project.estimatedDuration} dias</p>
                    <p className="text-xs text-muted-foreground">Duração Estimada</p>
                  </div>
                  <div className="p-4 rounded-lg border border-border/50 bg-muted/20 text-center">
                    <Wrench className="h-5 w-5 mx-auto text-primary mb-1" />
                    <p className="text-lg font-bold">{project.totalHours}h</p>
                    <p className="text-xs text-muted-foreground">Total Homem-Hora</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Progresso Geral
                  </p>
                  <Progress value={project.progress} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">{project.progress}% concluído</p>
                </div>
              </TabsContent>

              {/* Costs Tab */}
              <TabsContent value="costs">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-4 rounded-lg border border-border/50 bg-muted/20 text-center">
                    <DollarSign className="h-5 w-5 mx-auto text-primary mb-1" />
                    <p className="text-xl font-bold">${project.estimatedCost.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Custo Total Estimado</p>
                  </div>
                  <div className="p-4 rounded-lg border border-border/50 bg-muted/20 text-center">
                    <MapPin className="h-5 w-5 mx-auto text-primary mb-1" />
                    <p className="text-lg font-bold">{project.yardName}</p>
                    <p className="text-xs text-muted-foreground">Estaleiro</p>
                  </div>
                </div>
                {/* Cost by category */}
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" /> Custo por Categoria
                  </p>
                  {Object.entries(
                    project.scopeItems.reduce<Record<string, number>>((acc, item) => {
                      acc[item.category] = (acc[item.category] || 0) + item.estimatedCost;
                      return acc;
                    }, {})
                  ).sort(([, a], [, b]) => b - a).map(([category, cost]) => {
                    const percentage = Math.round((cost / project.estimatedCost) * 100);
                    const cfg = categoryConfig[category as DryDockWorkItem["category"]] || categoryConfig.safety;

                    return (
                      <div key={category} className="flex items-center gap-3">
                        <span className="w-20 text-xs text-muted-foreground capitalize">{category}</span>
                        <div className="flex-1">
                          <Progress value={percentage} className="h-2" />
                        </div>
                        <span className="text-xs font-medium w-24 text-right">${cost.toLocaleString()} ({percentage}%)</span>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/50 bg-card/80">
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Ship className="h-12 w-12 mb-3 opacity-30" />
            <p className="font-medium">Nenhum projeto de doca seca programado</p>
            <p className="text-sm">Execute a análise AI para gerar um plano</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
