/**
 * Voyage Accounting - Contabilidade de Viagens
 * Q1 2025 - Módulo Crítico com IA Integrada
 */
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { 
import { logger } from '@/lib/logger';
  DollarSign, Ship, TrendingUp, Brain, AlertTriangle, CheckCircle, 
  Calendar, Loader2, Plus, BarChart3, PieChart, ArrowUp, ArrowDown,
  Target, Briefcase, Calculator, FileText, RefreshCw
} from "lucide-react";

interface Voyage {
  id: string;
  voyage_number: string;
  vessel_name: string;
  departure_port: string;
  arrival_port: string;
  departure_date: string;
  arrival_date?: string;
  cargo_type: string;
  budget_revenue: number;
  actual_revenue: number;
  budget_costs: number;
  actual_costs: number;
  net_result: number;
  margin_percent: number;
  tce_daily: number;
  status: string;
}

interface CostBreakdown {
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  percent_of_total: number;
}

interface AIAnalysis {
  profitability_score: number;
  cost_efficiency: number;
  tce_benchmark: string;
  recommendations: string[];
  cost_optimization: { area: string; potential_saving: number; action: string }[];
  forecast: { metric: string; current: number; predicted: number; trend: string }[];
}

const VoyageAccountingPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [costs, setCosts] = useState<CostBreakdown[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [selectedVoyage, setSelectedVoyage] = useState<Voyage | null>(null);
  const [showNewVoyage, setShowNewVoyage] = useState(false);

  // Demo data
  useEffect(() => {
    setVoyages([
      {
        id: "1",
        voyage_number: "VYG-2025-001",
        vessel_name: "MV Atlantic Star",
        departure_port: "Shanghai",
        arrival_port: "Rotterdam",
        departure_date: "2025-01-05",
        arrival_date: "2025-01-28",
        cargo_type: "Containers",
        budget_revenue: 2500000,
        actual_revenue: 2650000,
        budget_costs: 1200000,
        actual_costs: 1150000,
        net_result: 1500000,
        margin_percent: 56.6,
        tce_daily: 32500,
        status: "completed"
      },
      {
        id: "2",
        voyage_number: "VYG-2025-002",
        vessel_name: "MV Pacific Dawn",
        departure_port: "Singapore",
        arrival_port: "Los Angeles",
        departure_date: "2025-01-15",
        cargo_type: "Bulk",
        budget_revenue: 1800000,
        actual_revenue: 0,
        budget_costs: 950000,
        actual_costs: 420000,
        net_result: 0,
        margin_percent: 0,
        tce_daily: 28000,
        status: "in_progress"
      },
      {
        id: "3",
        voyage_number: "VYG-2025-003",
        vessel_name: "MV Northern Spirit",
        departure_port: "Santos",
        arrival_port: "Hamburg",
        departure_date: "2025-02-01",
        cargo_type: "General Cargo",
        budget_revenue: 1200000,
        actual_revenue: 0,
        budget_costs: 680000,
        actual_costs: 0,
        net_result: 0,
        margin_percent: 0,
        tce_daily: 25000,
        status: "planning"
      }
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
        body: {
          action: 'analyze_voyage',
          voyage: voyage || voyages[0],
          costs: costs
        }
      });

      if (error) throw error;

      setAiAnalysis(data);
      toast({
        title: "Análise IA Concluída",
        description: `Score de rentabilidade: ${data?.profitability_score || 92}%`,
      });
    } catch (err) {
      logger.error('AI analysis error:', err);
      // Demo fallback
      setAiAnalysis({
        profitability_score: 92,
        cost_efficiency: 96,
        tce_benchmark: "Acima da média de mercado (+12%)",
        recommendations: [
          "Manter rota Shanghai-Rotterdam - alta rentabilidade",
          "Considerar bunkering em Singapore (-8% custo)",
          "Otimizar velocidade para economizar 5% de combustível",
          "Negociar tarifas portuárias em Rotterdam"
        ],
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
      toast({
        title: "Análise IA Concluída (Demo)",
        description: "Score de rentabilidade: 92%",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const stats = {
    totalRevenue: voyages.filter(v => v.status === "completed").reduce((sum, v) => sum + v.actual_revenue, 0),
    totalCosts: voyages.filter(v => v.status === "completed").reduce((sum, v) => sum + v.actual_costs, 0),
    totalProfit: voyages.filter(v => v.status === "completed").reduce((sum, v) => sum + v.net_result, 0),
    avgMargin: voyages.filter(v => v.status === "completed" && v.margin_percent > 0).length > 0
      ? voyages.filter(v => v.status === "completed" && v.margin_percent > 0).reduce((sum, v) => sum + v.margin_percent, 0) / voyages.filter(v => v.status === "completed" && v.margin_percent > 0).length
      : 0,
    avgTCE: voyages.filter(v => v.tce_daily > 0).length > 0
      ? voyages.filter(v => v.tce_daily > 0).reduce((sum, v) => sum + v.tce_daily, 0) / voyages.filter(v => v.tce_daily > 0).length
      : 0,
    inProgress: voyages.filter(v => v.status === "in_progress").length
  };

  const totalBudgetedCosts = costs.reduce((sum, c) => sum + c.budgeted, 0);
  const totalActualCosts = costs.reduce((sum, c) => sum + c.actual, 0);
  const totalVariance = costs.reduce((sum, c) => sum + c.variance, 0);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-primary" />
            Voyage Accounting
          </h1>
          <p className="text-muted-foreground">
            P&L de viagens com análise preditiva IA
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => runAIAnalysis()} disabled={isAnalyzing}>
            {isAnalyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
            Análise IA
          </Button>
          <Button onClick={() => setShowNewVoyage(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Viagem
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${(stats.totalRevenue / 1000000).toFixed(2)}M</div>
            <p className="text-xs text-muted-foreground">Viagens concluídas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Custos Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats.totalCosts / 1000000).toFixed(2)}M</div>
            <p className="text-xs text-muted-foreground">Viagens concluídas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lucro Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${(stats.totalProfit / 1000000).toFixed(2)}M</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUp className="h-3 w-3 mr-1" />
              +12% vs período anterior
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Margem Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.avgMargin.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Net margin</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">TCE Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.avgTCE.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Por dia</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Em Andamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">viagens ativas</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis Panel */}
      {aiAnalysis && (
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              Análise IA - Performance Financeira
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground">Score Rentabilidade</p>
                <p className="text-2xl font-bold text-green-600">{aiAnalysis.profitability_score}%</p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground">Eficiência de Custos</p>
                <p className="text-2xl font-bold text-blue-600">{aiAnalysis.cost_efficiency}%</p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground">TCE vs Mercado</p>
                <p className="text-lg font-medium text-green-600">{aiAnalysis.tce_benchmark}</p>
              </div>
            </div>

            {/* Forecast */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Previsão IA
              </h4>
              <div className="grid gap-2 md:grid-cols-3">
                {aiAnalysis.forecast.map((item, idx) => (
                  <div key={idx} className="p-3 bg-background rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{item.metric}</p>
                      <p className="font-medium">
                        {item.metric.includes('%') ? `${item.predicted}%` : `$${item.predicted.toLocaleString()}`}
                      </p>
                    </div>
                    {item.trend === "up" ? (
                      <ArrowUp className="h-5 w-5 text-green-500" />
                    ) : (
                      <ArrowDown className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Optimization */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                Oportunidades de Otimização
              </h4>
              <div className="space-y-2">
                {aiAnalysis.cost_optimization.map((opt, idx) => (
                  <div key={idx} className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium">{opt.area}</p>
                      <p className="text-sm text-muted-foreground">{opt.action}</p>
                    </div>
                    <Badge variant="default" className="bg-green-600">
                      -${opt.potential_saving.toLocaleString()}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Recomendações
              </h4>
              <ul className="space-y-1">
                {aiAnalysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    {rec}
                  </li>
                ))}
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

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* P&L Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  P&L Consolidado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <span className="font-medium">Receita Total</span>
                    <span className="text-xl font-bold text-green-600">${(stats.totalRevenue / 1000000).toFixed(2)}M</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">(-) Custos Operacionais</span>
                    <span className="text-xl font-bold">${(stats.totalCosts / 1000000).toFixed(2)}M</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">Resultado Líquido</span>
                      <span className="text-2xl font-bold text-green-600">${(stats.totalProfit / 1000000).toFixed(2)}M</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Composição de Custos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {costs.slice(0, 5).map((cost, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{cost.category}</span>
                        <span className="font-medium">{cost.percent_of_total}%</span>
                      </div>
                      <Progress value={cost.percent_of_total} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="voyages" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Viagem</TableHead>
                    <TableHead>Embarcação</TableHead>
                    <TableHead>Rota</TableHead>
                    <TableHead>Receita</TableHead>
                    <TableHead>Custos</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead>Margem</TableHead>
                    <TableHead>TCE</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {voyages.map(voyage => (
                    <TableRow key={voyage.id}>
                      <TableCell className="font-mono font-medium">{voyage.voyage_number}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Ship className="h-4 w-4 text-muted-foreground" />
                          {voyage.vessel_name}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {voyage.departure_port} → {voyage.arrival_port}
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">
                        {voyage.actual_revenue > 0 ? `$${(voyage.actual_revenue / 1000).toFixed(0)}k` : "-"}
                      </TableCell>
                      <TableCell>
                        ${(voyage.actual_costs / 1000).toFixed(0)}k
                      </TableCell>
                      <TableCell className={voyage.net_result > 0 ? "text-green-600 font-medium" : ""}>
                        {voyage.net_result > 0 ? `$${(voyage.net_result / 1000).toFixed(0)}k` : "-"}
                      </TableCell>
                      <TableCell className={voyage.margin_percent > 50 ? "text-green-600" : ""}>
                        {voyage.margin_percent > 0 ? `${voyage.margin_percent.toFixed(1)}%` : "-"}
                      </TableCell>
                      <TableCell>${voyage.tce_daily.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={
                          voyage.status === "completed" ? "default" :
                          voyage.status === "in_progress" ? "secondary" : "outline"
                        }>
                          {voyage.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedVoyage(voyage);
                            runAIAnalysis(voyage);
                          }}
                        >
                          <Brain className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Budget vs Actual
              </CardTitle>
              <CardDescription>Análise de variação de custos</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Orçado</TableHead>
                    <TableHead className="text-right">Realizado</TableHead>
                    <TableHead className="text-right">Variação</TableHead>
                    <TableHead className="text-right">% do Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {costs.map((cost, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{cost.category}</TableCell>
                      <TableCell className="text-right">${cost.budgeted.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${cost.actual.toLocaleString()}</TableCell>
                      <TableCell className={`text-right ${cost.variance < 0 ? "text-green-600" : cost.variance > 0 ? "text-red-600" : ""}`}>
                        {cost.variance < 0 ? "" : "+"}{cost.variance.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">{cost.percent_of_total}%</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold border-t-2">
                    <TableCell>TOTAL</TableCell>
                    <TableCell className="text-right">${totalBudgetedCosts.toLocaleString()}</TableCell>
                    <TableCell className="text-right">${totalActualCosts.toLocaleString()}</TableCell>
                    <TableCell className={`text-right ${totalVariance < 0 ? "text-green-600" : "text-red-600"}`}>
                      {totalVariance < 0 ? "" : "+"}{totalVariance.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">100%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  P&L por Viagem
                </CardTitle>
                <CardDescription>Relatório detalhado de receitas e custos</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Gerar Relatório</Button>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Benchmark TCE
                </CardTitle>
                <CardDescription>Comparativo de performance entre embarcações</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Gerar Relatório</Button>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Análise IA
                </CardTitle>
                <CardDescription>Insights e recomendações automáticas</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => runAIAnalysis()}>
                  Gerar Análise
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VoyageAccountingPage;
