/**
 * PredictiveMaintenanceAI - REAL DATA from Supabase: ai_maintenance_predictions, maintenance_tasks, vessels
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wrench, AlertTriangle, CheckCircle2, Clock, TrendingUp,
  Activity, Cpu, Thermometer, Gauge, Zap, Brain, Sparkles,
  BarChart3, Target, ArrowRight, Calendar, Ship, Settings,
  RefreshCw, Download, Eye, Bell, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer
} from "recharts";

function RiskBadge({ level }: { level: string }) {
  const config: Record<string, { label: string; className: string }> = {
    low: { label: "Baixo", className: "bg-success/10 text-success" },
    medium: { label: "Médio", className: "bg-warning/10 text-warning" },
    high: { label: "Alto", className: "bg-destructive/10 text-destructive" },
    critical: { label: "Crítico", className: "bg-destructive text-destructive-foreground animate-pulse" },
  };
  const c = config[level] || config.low;
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>;
}

export default function PredictiveMaintenanceAI() {
  const [activeTab, setActiveTab] = useState("equipment");

  // Real predictions from ai_maintenance_predictions
  const { data: predictions = [], isLoading: loadingPredictions } = useQuery({
    queryKey: ["predictive-maintenance-ai"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_maintenance_predictions")
        .select("*, vessels(name)")
        .order("failure_probability", { ascending: false })
        .limit(20);
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase join returns dynamic shape
      return (data || []).map((p: Record<string, any>) => ({
        id: p.id,
        equipment: p.equipment_name,
        equipmentId: p.equipment_id,
        vessel: p.vessels?.name || "N/A",
        failureType: p.recommended_action || "Falha prevista",
        probability: Math.round(p.failure_probability * 100),
        predictedDate: p.predicted_failure_date || "N/A",
        impact: p.failure_probability >= 0.7 ? "high" : p.failure_probability >= 0.4 ? "medium" : "low",
        recommendation: p.recommended_action || "Monitorar",
        riskLevel: p.failure_probability >= 0.7 ? "high" : p.failure_probability >= 0.4 ? "medium" : "low",
        confidence: p.confidence || 0,
        riskFactors: p.risk_factors || {},
        status: p.status || "active",
      }));
    },
  });

  // Real maintenance tasks as equipment health
  const { data: equipment = [], isLoading: loadingEquipment } = useQuery({
    queryKey: ["predictive-maintenance-equipment"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_tasks")
        .select("id, title, component_name, status, priority, vessel_id, due_date, vessels(name)")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase join returns dynamic shape
      return (data || []).map((t: Record<string, any>) => {
        const healthScore = t.status === "completed" ? 95 : t.priority === "critical" ? 35 : t.priority === "high" ? 55 : t.priority === "medium" ? 75 : 90;
        const riskLevel = healthScore < 50 ? "high" : healthScore < 70 ? "medium" : "low";
        return {
          id: t.id,
          name: t.component_name || t.title,
          type: t.title,
          vessel: t.vessels?.name || "N/A",
          healthScore,
          riskLevel,
          status: t.status,
          priority: t.priority,
          dueDate: t.due_date,
        };
      });
    },
  });

  // Trend data from maintenance history
  const { data: trendData = [] } = useQuery({
    queryKey: ["predictive-maintenance-trend"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_tasks")
        .select("status, created_at")
        .order("created_at", { ascending: true })
        .limit(200);
      if (error) return [];
      // Group by month
      const months: Record<string, { total: number; completed: number }> = {};
      (data || []).forEach((t) => {
        const month = new Date(t.created_at).toLocaleDateString("pt-BR", { month: "short" });
        if (!months[month]) months[month] = { total: 0, completed: 0 };
        months[month].total++;
        if (t.status === "completed") months[month].completed++;
      });
      return Object.entries(months).slice(-6).map(([month, v]) => ({
        month,
        health: v.total > 0 ? Math.round((v.completed / v.total) * 100) : 0,
        tasks: v.total,
      }));
    },
  });

  const isLoading = loadingPredictions || loadingEquipment;

  const stats = {
    avgHealth: equipment.length > 0 ? Math.round(equipment.reduce((acc, e) => acc + e.healthScore, 0) / equipment.length) : 0,
    highRisk: equipment.filter(e => e.riskLevel === "high" || e.riskLevel === "critical").length,
    predictions: predictions.length,
    potentialSavings: predictions.length * 15000,
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-muted-foreground">Health Score Médio</p><p className="text-2xl font-bold" style={{ color: stats.avgHealth > 80 ? 'hsl(var(--success))' : 'hsl(var(--warning))' }}>{stats.avgHealth}%</p></div>
              <Activity className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-muted-foreground">Alto Risco</p><p className="text-2xl font-bold text-destructive">{stats.highRisk}</p></div>
              <AlertTriangle className="h-8 w-8 text-destructive opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-muted-foreground">Previsões IA</p><p className="text-2xl font-bold text-primary">{stats.predictions}</p></div>
              <Brain className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-muted-foreground">Economia Potencial</p><p className="text-lg font-bold text-success">R$ {(stats.potentialSavings / 1000).toFixed(0)}K</p></div>
              <Target className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Trend Chart */}
      {trendData.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" />Tendência de Saúde da Frota</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                <Area type="monotone" dataKey="health" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} name="Health Score" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />Manutenção Preditiva IA</CardTitle>
              <CardDescription>Análise inteligente de equipamentos e previsão de falhas</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="equipment">Equipamentos ({equipment.length})</TabsTrigger>
              <TabsTrigger value="predictions">Previsões ({predictions.length})</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="equipment">
              <ScrollArea className="h-[500px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {equipment.map((eq) => (
                    <motion.div key={eq.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-lg border hover:border-primary/50 hover:bg-accent/30 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2"><RiskBadge level={eq.riskLevel} /><Badge variant="outline">{eq.status}</Badge></div>
                          <h4 className="font-medium mt-2">{eq.name}</h4>
                          <p className="text-sm text-muted-foreground flex items-center gap-1"><Ship className="h-3 w-3" />{eq.vessel}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold" style={{ color: eq.healthScore > 80 ? 'hsl(var(--success))' : eq.healthScore > 60 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))' }}>{eq.healthScore}%</div>
                          <p className="text-xs text-muted-foreground">Health Score</p>
                        </div>
                      </div>
                      {eq.dueDate && (
                        <div className="mt-3 p-2 rounded bg-muted/50 text-xs flex items-center gap-1"><Calendar className="h-3 w-3" />Próxima manutenção: {new Date(eq.dueDate).toLocaleDateString("pt-BR")}</div>
                      )}
                    </motion.div>
                  ))}
                </div>
                {equipment.length === 0 && <p className="text-center py-8 text-muted-foreground">Nenhuma tarefa de manutenção encontrada</p>}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="predictions">
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {predictions.map((pred) => (
                    <motion.div key={pred.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-4 rounded-lg border hover:bg-accent/30 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={pred.impact === "high" ? "destructive" : pred.impact === "medium" ? "secondary" : "outline"}>
                              {pred.impact === "high" ? "Alto Impacto" : pred.impact === "medium" ? "Médio Impacto" : "Baixo Impacto"}
                            </Badge>
                            <Badge variant="outline">{pred.probability}% prob.</Badge>
                          </div>
                          <h4 className="font-medium mt-2">{pred.equipment}</h4>
                          <p className="text-sm text-muted-foreground">{pred.failureType} • {pred.vessel}</p>
                          {pred.predictedDate !== "N/A" && <p className="text-xs text-muted-foreground mt-1">Falha prevista: {pred.predictedDate}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Confiança</p>
                          <p className="text-lg font-bold text-primary">{Math.round(pred.confidence * 100)}%</p>
                        </div>
                      </div>
                      <div className="mt-3 p-2 rounded bg-muted/50">
                        <p className="text-xs text-muted-foreground">Recomendação IA:</p>
                        <p className="text-sm mt-1">{pred.recommendation}</p>
                      </div>
                      <Button size="sm" className="w-full mt-3 gap-1"><Wrench className="h-3 w-3" />Criar Ordem de Serviço</Button>
                    </motion.div>
                  ))}
                  {predictions.length === 0 && <p className="text-center py-8 text-muted-foreground">Nenhuma predição de falha encontrada</p>}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Equipamentos Monitorados</p><p className="text-3xl font-bold">{equipment.length}</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Predições Ativas</p><p className="text-3xl font-bold text-primary">{predictions.length}</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Taxa de Prevenção</p><p className="text-3xl font-bold text-success">{equipment.length > 0 ? Math.round((equipment.filter(e => e.status === "completed").length / equipment.length) * 100) : 0}%</p></CardContent></Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
