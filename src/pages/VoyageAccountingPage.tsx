/**
 * Voyage Accounting - Refactored Orchestrator
 * (~200 lines from 615)
 */
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';
import {
  DollarSign, Brain, CheckCircle, Loader2, Plus, ArrowUp, ArrowDown, Target, TrendingUp
} from "lucide-react";
import { VoyageAccountingTabs } from "./voyage/VoyageAccountingTabs";

interface Voyage {
  id: string; voyage_number: string; vessel_name: string; departure_port: string; arrival_port: string;
  departure_date: string; arrival_date?: string; cargo_type: string; budget_revenue: number;
  actual_revenue: number; budget_costs: number; actual_costs: number; net_result: number;
  margin_percent: number; tce_daily: number; status: string;
}

interface CostBreakdown {
  category: string; budgeted: number; actual: number; variance: number; percent_of_total: number;
}

interface AIAnalysis {
  profitability_score: number; cost_efficiency: number; tce_benchmark: string;
  recommendations: string[];
  cost_optimization: { area: string; potential_saving: number; action: string }[];
  forecast: { metric: string; current: number; predicted: number; trend: string }[];
}

const VoyageAccountingPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [costs, setCosts] = useState<CostBreakdown[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [selectedVoyage, setSelectedVoyage] = useState<Voyage | null>(null);
  const [showNewVoyage, setShowNewVoyage] = useState(false);

  useEffect(() => {
    setVoyages([
      { id: "1", voyage_number: "VYG-2025-001", vessel_name: "MV Atlantic Star", departure_port: "Shanghai", arrival_port: "Rotterdam", departure_date: "2025-01-05", arrival_date: "2025-01-28", cargo_type: "Containers", budget_revenue: 2500000, actual_revenue: 2650000, budget_costs: 1200000, actual_costs: 1150000, net_result: 1500000, margin_percent: 56.6, tce_daily: 32500, status: "completed" },
      { id: "2", voyage_number: "VYG-2025-002", vessel_name: "MV Pacific Dawn", departure_port: "Singapore", arrival_port: "Los Angeles", departure_date: "2025-01-15", cargo_type: "Bulk", budget_revenue: 1800000, actual_revenue: 0, budget_costs: 950000, actual_costs: 420000, net_result: 0, margin_percent: 0, tce_daily: 28000, status: "in_progress" },
      { id: "3", voyage_number: "VYG-2025-003", vessel_name: "MV Northern Spirit", departure_port: "Santos", arrival_port: "Hamburg", departure_date: "2025-02-01", cargo_type: "General Cargo", budget_revenue: 1200000, actual_revenue: 0, budget_costs: 680000, actual_costs: 0, net_result: 0, margin_percent: 0, tce_daily: 25000, status: "planning" },
    ]);
    setCosts([
      { category: "Bunker", budgeted: 480000, actual: 455000, variance: -25000, percent_of_total: 39.6 },
      { category: "Port Costs", budgeted: 180000, actual: 195000, variance: 15000, percent_of_total: 17.0 },
      { category: "Crew", budgeted: 220000, actual: 220000, variance: 0, percent_of_total: 19.1 },
      { category: "Maintenance", budgeted: 120000, actual: 105000, variance: -15000, percent_of_total: 9.1 },
      { category: "Insurance", budgeted: 95000, actual: 95000, variance: 0, percent_of_total: 8.3 },
      { category: "Agency", budgeted: 45000, actual: 42000, variance: -3000, percent_of_total: 3.7 },
      { category: "Other", budgeted: 60000, actual: 38000, variance: -22000, percent_of_total: 3.3 },
    ]);
  }, []);

  const runAIAnalysis = async (voyage?: Voyage) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('voyage-accounting-ai', {
        body: { action: 'analyze_voyage', voyage: voyage || voyages[0], costs }
      });
      if (error) throw error;
      setAiAnalysis(data);
      toast({ title: "Análise IA Concluída", description: `Score de rentabilidade: ${data?.profitability_score || 92}%` });
    } catch (err) {
      logger.error('AI analysis error:', err);
      setAiAnalysis({
        profitability_score: 92, cost_efficiency: 96, tce_benchmark: "Acima da média de mercado (+12%)",
        recommendations: ["Manter rota Shanghai-Rotterdam - alta rentabilidade", "Considerar bunkering em Singapore (-8% custo)", "Otimizar velocidade para economizar 5% de combustível", "Negociar tarifas portuárias em Rotterdam"],
        cost_optimization: [
          { area: "Bunker", potential_saving: 45000, action: "Slow steaming + bunkering otimizado" },
          { area: "Port Costs", potential_saving: 18000, action: "Renegociar com agentes" },
          { area: "Agency", potential_saving: 5000, action: "Consolidar serviços" }
        ],
        forecast: [
          { metric: "Net Result", current: 1500000, predicted: 1620000, trend: "up" },
          { metric: "TCE Daily", current: 32500, predicted: 34800, trend: "up" },
          { metric: "Margin %", current: 56.6, predicted: 58.2, trend: "up" }
        ]
      });
      toast({ title: "Análise IA Concluída (Demo)", description: "Score de rentabilidade: 92%" });
    } finally { setIsAnalyzing(false); }
  };

  const completedVoyages = voyages.filter(v => v.status === "completed");
  const stats = {
    totalRevenue: completedVoyages.reduce((sum, v) => sum + v.actual_revenue, 0),
    totalCosts: completedVoyages.reduce((sum, v) => sum + v.actual_costs, 0),
    totalProfit: completedVoyages.reduce((sum, v) => sum + v.net_result, 0),
    avgMargin: completedVoyages.filter(v => v.margin_percent > 0).length > 0
      ? completedVoyages.filter(v => v.margin_percent > 0).reduce((sum, v) => sum + v.margin_percent, 0) / completedVoyages.filter(v => v.margin_percent > 0).length : 0,
    avgTCE: voyages.filter(v => v.tce_daily > 0).length > 0
      ? voyages.filter(v => v.tce_daily > 0).reduce((sum, v) => sum + v.tce_daily, 0) / voyages.filter(v => v.tce_daily > 0).length : 0,
    inProgress: voyages.filter(v => v.status === "in_progress").length
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3"><DollarSign className="h-8 w-8 text-primary" />Voyage Accounting</h1>
          <p className="text-muted-foreground">P&L de viagens com análise preditiva IA</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => runAIAnalysis()} disabled={isAnalyzing}>
            {isAnalyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}Análise IA
          </Button>
          <Button onClick={() => setShowNewVoyage(true)}><Plus className="h-4 w-4 mr-2" />Nova Viagem</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        {[
          { label: "Receita Total", value: `$${(stats.totalRevenue / 1000000).toFixed(2)}M`, sub: "Viagens concluídas", color: "text-success" },
          { label: "Custos Total", value: `$${(stats.totalCosts / 1000000).toFixed(2)}M`, sub: "Viagens concluídas" },
          { label: "Lucro Líquido", value: `$${(stats.totalProfit / 1000000).toFixed(2)}M`, sub: "+12% vs período anterior", color: "text-success", trend: true },
          { label: "Margem Média", value: `${stats.avgMargin.toFixed(1)}%`, sub: "Net margin", color: "text-primary" },
          { label: "TCE Médio", value: `$${stats.avgTCE.toLocaleString()}`, sub: "Por dia" },
          { label: "Em Andamento", value: String(stats.inProgress), sub: "viagens ativas", color: "text-warning" },
        ].map(s => (
          <Card key={s.label}>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle></CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${s.color || ""}`}>{s.value}</div>
              {s.trend ? (
                <div className="flex items-center text-xs text-success"><ArrowUp className="h-3 w-3 mr-1" />{s.sub}</div>
              ) : (
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Analysis Panel */}
      {aiAnalysis && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary" />Análise IA - Performance Financeira</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-background rounded-lg"><p className="text-sm text-muted-foreground">Score Rentabilidade</p><p className="text-2xl font-bold text-success">{aiAnalysis.profitability_score}%</p></div>
              <div className="p-4 bg-background rounded-lg"><p className="text-sm text-muted-foreground">Eficiência de Custos</p><p className="text-2xl font-bold text-primary">{aiAnalysis.cost_efficiency}%</p></div>
              <div className="p-4 bg-background rounded-lg"><p className="text-sm text-muted-foreground">TCE vs Mercado</p><p className="text-lg font-medium text-success">{aiAnalysis.tce_benchmark}</p></div>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-info" />Previsão IA</h4>
              <div className="grid gap-2 md:grid-cols-3">
                {aiAnalysis.forecast.map((item) => (
                  <div key={item.metric} className="p-3 bg-background rounded-lg flex items-center justify-between">
                    <div><p className="text-sm text-muted-foreground">{item.metric}</p><p className="font-medium">{item.metric.includes('%') ? `${item.predicted}%` : `$${item.predicted.toLocaleString()}`}</p></div>
                    {item.trend === "up" ? <ArrowUp className="h-5 w-5 text-success" /> : <ArrowDown className="h-5 w-5 text-destructive" />}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2"><Target className="h-4 w-4 text-success" />Oportunidades de Otimização</h4>
              <div className="space-y-2">
                {aiAnalysis.cost_optimization.map((opt) => (
                  <div key={opt.area} className="p-3 bg-success/5 rounded-lg flex items-center justify-between">
                    <div><p className="font-medium">{opt.area}</p><p className="text-sm text-muted-foreground">{opt.action}</p></div>
                    <Badge variant="default" className="bg-success">-${opt.potential_saving.toLocaleString()}</Badge>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" />Recomendações</h4>
              <ul className="space-y-1">
                {aiAnalysis.recommendations.map((rec) => (<li key={rec} className="text-sm flex items-start gap-2"><span className="text-success">•</span>{rec}</li>))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="voyages">Viagens</TabsTrigger>
          <TabsTrigger value="costs">Análise de Custos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <VoyageAccountingTabs
          voyages={voyages}
          costs={costs}
          stats={stats}
          onSelectVoyage={setSelectedVoyage}
          onRunAIAnalysis={runAIAnalysis}
        />
      </Tabs>
    </div>
  );
};

export default VoyageAccountingPage;
