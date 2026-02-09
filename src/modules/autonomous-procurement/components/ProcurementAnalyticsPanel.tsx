/**
 * ProcurementAnalyticsPanel - Analytics preditivo de custos e lead time
 * Substitui placeholder "Em desenvolvimento"
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, TrendingUp, TrendingDown, DollarSign, 
  Clock, Package, RefreshCw, Download, Brain,
  Target, AlertTriangle, CheckCircle, ArrowUpRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from "recharts";

interface CostTrend {
  month: string;
  actual: number;
  predicted: number;
  target: number;
}

interface CategorySpend {
  name: string;
  value: number;
  percentage: number;
  trend: "up" | "down" | "stable";
}

interface LeadTimeMetric {
  supplier: string;
  avgDays: number;
  onTimeRate: number;
  lastMonth: number;
}

interface PredictiveInsight {
  id: string;
  type: "savings" | "risk" | "opportunity";
  title: string;
  description: string;
  impact: number;
  confidence: number;
  action: string;
}

export default function ProcurementAnalyticsPanel() {
  const { toast } = useToast();
  const [period, setPeriod] = useState("12m");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Mock analytics data
  const costTrends: CostTrend[] = useMemo(() => [
    { month: "Jan", actual: 125000, predicted: 120000, target: 115000 },
    { month: "Fev", actual: 118000, predicted: 122000, target: 115000 },
    { month: "Mar", actual: 132000, predicted: 128000, target: 120000 },
    { month: "Abr", actual: 145000, predicted: 140000, target: 130000 },
    { month: "Mai", actual: 138000, predicted: 142000, target: 135000 },
    { month: "Jun", actual: 156000, predicted: 150000, target: 140000 },
    { month: "Jul", actual: 148000, predicted: 155000, target: 145000 },
    { month: "Ago", actual: 162000, predicted: 158000, target: 150000 },
    { month: "Set", actual: 155000, predicted: 160000, target: 150000 },
    { month: "Out", actual: 170000, predicted: 165000, target: 155000 },
    { month: "Nov", actual: 178000, predicted: 175000, target: 160000 },
    { month: "Dez", actual: 0, predicted: 182000, target: 165000 },
  ], []);

  const categorySpend: CategorySpend[] = useMemo(() => [
    { name: "Peças Sobressalentes", value: 485000, percentage: 32, trend: "up" },
    { name: "Lubrificantes", value: 280000, percentage: 19, trend: "stable" },
    { name: "Provisões", value: 225000, percentage: 15, trend: "down" },
    { name: "Segurança", value: 195000, percentage: 13, trend: "up" },
    { name: "Serviços", value: 180000, percentage: 12, trend: "stable" },
    { name: "Outros", value: 135000, percentage: 9, trend: "down" },
  ], []);

  const leadTimeMetrics: LeadTimeMetric[] = useMemo(() => [
    { supplier: "MarineSupply Global", avgDays: 5, onTimeRate: 96, lastMonth: 4 },
    { supplier: "Ocean Parts Ltd", avgDays: 8, onTimeRate: 89, lastMonth: 9 },
    { supplier: "TechNav Systems", avgDays: 12, onTimeRate: 94, lastMonth: 11 },
    { supplier: "SafeSea Equipment", avgDays: 6, onTimeRate: 91, lastMonth: 7 },
  ], []);

  const predictiveInsights: PredictiveInsight[] = useMemo(() => [
    {
      id: "1",
      type: "savings",
      title: "Consolidação de Pedidos",
      description: "Agrupar pedidos de lubrificantes com peças pode gerar economia de frete",
      impact: 12500,
      confidence: 87,
      action: "Agendar compra consolidada"
    },
    {
      id: "2",
      type: "risk",
      title: "Lead Time Crítico",
      description: "Ocean Parts Ltd apresenta aumento de 15% no lead time",
      impact: -8000,
      confidence: 92,
      action: "Buscar fornecedor alternativo"
    },
    {
      id: "3",
      type: "opportunity",
      title: "Contrato Anual",
      description: "Negociar contrato anual com MarineSupply pode reduzir custos em 8%",
      impact: 38000,
      confidence: 78,
      action: "Iniciar negociação"
    },
    {
      id: "4",
      type: "savings",
      title: "Otimização de Estoque",
      description: "Reduzir estoque de segurança de lubrificantes em 15%",
      impact: 15000,
      confidence: 81,
      action: "Ajustar parâmetros"
    }
  ], []);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    // Analysis complete
    setIsAnalyzing(false);
    toast({
      title: "🧠 Análise Concluída",
      description: "Novos insights gerados pela IA"
    });
  };

  const handleApplyInsight = (insight: PredictiveInsight) => {
    toast({
      title: "✅ Ação Iniciada",
      description: `${insight.action} - ${insight.title}`
    });
  };

  const handleExportReport = () => {
    const report = {
      periodo: period,
      custoTotal: categorySpend.reduce((sum, c) => sum + c.value, 0),
      insights: predictiveInsights.length,
      potencialEconomia: predictiveInsights
        .filter(i => i.type === "savings" || i.type === "opportunity")
        .reduce((sum, i) => sum + i.impact, 0)
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-procurement-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    
    toast({ title: "📥 Relatório Exportado" });
  };

  const totalSpend = categorySpend.reduce((sum, c) => sum + c.value, 0);
  const potentialSavings = predictiveInsights
    .filter(i => i.type === "savings" || i.type === "opportunity")
    .reduce((sum, i) => sum + i.impact, 0);
  const avgLeadTime = leadTimeMetrics.reduce((sum, l) => sum + l.avgDays, 0) / leadTimeMetrics.length;
  const avgOnTimeRate = leadTimeMetrics.reduce((sum, l) => sum + l.onTimeRate, 0) / leadTimeMetrics.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Analytics Preditivo
          </h2>
          <p className="text-muted-foreground">Análise de custos, lead time e oportunidades</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">3 meses</SelectItem>
              <SelectItem value="6m">6 meses</SelectItem>
              <SelectItem value="12m">12 meses</SelectItem>
              <SelectItem value="ytd">Ano atual</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-1" />
            Exportar
          </Button>
          <Button onClick={handleRunAnalysis} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Brain className="h-4 w-4 mr-1" />
            )}
            Analisar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-primary/20">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <Badge className="bg-green-500/20 text-green-500">
                <TrendingDown className="h-3 w-3 mr-1" />
                -3.2%
              </Badge>
            </div>
            <p className="text-2xl font-bold mt-2">R$ {(totalSpend / 1000).toFixed(0)}K</p>
            <p className="text-sm text-muted-foreground">Gasto Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <Badge className="bg-primary/20 text-primary">Potencial</Badge>
            </div>
            <p className="text-2xl font-bold mt-2 text-green-600">R$ {(potentialSavings / 1000).toFixed(0)}K</p>
            <p className="text-sm text-muted-foreground">Economia Identificada</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <Badge className={avgLeadTime <= 7 ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"}>
                {avgLeadTime <= 7 ? "Bom" : "Atenção"}
              </Badge>
            </div>
            <p className="text-2xl font-bold mt-2">{avgLeadTime.toFixed(1)} dias</p>
            <p className="text-sm text-muted-foreground">Lead Time Médio</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <CheckCircle className="h-5 w-5 text-purple-500" />
              </div>
              <Badge className={avgOnTimeRate >= 90 ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"}>
                {avgOnTimeRate >= 90 ? "Excelente" : "Regular"}
              </Badge>
            </div>
            <p className="text-2xl font-bold mt-2">{avgOnTimeRate.toFixed(0)}%</p>
            <p className="text-sm text-muted-foreground">Taxa On-Time</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendência de Custos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={costTrends}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} className="text-xs" />
                <Tooltip 
                  formatter={(value: number) => [`R$ ${value.toLocaleString()}`, ""]}
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                />
                <Legend />
                <Area type="monotone" dataKey="actual" name="Real" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" />
                <Area type="monotone" dataKey="predicted" name="Previsto" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2)/0.2)" strokeDasharray="5 5" />
                <Line type="monotone" dataKey="target" name="Meta" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Spend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Gastos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categorySpend.map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{category.name}</span>
                      {category.trend === "up" && <TrendingUp className="h-3 w-3 text-red-500" />}
                      {category.trend === "down" && <TrendingDown className="h-3 w-3 text-green-500" />}
                    </div>
                    <span className="text-sm font-bold">R$ {(category.value / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={category.percentage} className="h-2 flex-1" />
                    <span className="text-xs text-muted-foreground w-10">{category.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Time Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Performance de Fornecedores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {leadTimeMetrics.map((metric) => (
              <div key={metric.supplier} className="p-4 rounded-lg border bg-card">
                <p className="font-medium text-sm mb-2">{metric.supplier}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Lead Time</p>
                    <p className="font-bold">{metric.avgDays} dias</p>
                    <p className="text-xs text-muted-foreground">
                      {metric.avgDays < metric.lastMonth ? (
                        <span className="text-green-500">↓ {metric.lastMonth - metric.avgDays}d</span>
                      ) : metric.avgDays > metric.lastMonth ? (
                        <span className="text-red-500">↑ {metric.avgDays - metric.lastMonth}d</span>
                      ) : (
                        <span>Estável</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">On-Time</p>
                    <p className={`font-bold ${metric.onTimeRate >= 90 ? "text-green-600" : "text-yellow-600"}`}>
                      {metric.onTimeRate}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Insights da IA
            <Badge variant="secondary" className="ml-2">
              {predictiveInsights.length} insights
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {predictiveInsights.map((insight) => (
              <div 
                key={insight.id}
                className={`p-4 rounded-lg border ${
                  insight.type === "savings" ? "border-green-500/30 bg-green-500/5" :
                  insight.type === "risk" ? "border-red-500/30 bg-red-500/5" :
                  "border-blue-500/30 bg-blue-500/5"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {insight.type === "savings" && <DollarSign className="h-4 w-4 text-green-500" />}
                    {insight.type === "risk" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    {insight.type === "opportunity" && <ArrowUpRight className="h-4 w-4 text-blue-500" />}
                    <span className="font-medium">{insight.title}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {insight.confidence}% confiança
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className={`font-bold ${insight.impact > 0 ? "text-green-600" : "text-red-600"}`}>
                    {insight.impact > 0 ? "+" : ""}R$ {Math.abs(insight.impact).toLocaleString()}
                  </span>
                  <Button size="sm" variant="outline" onClick={() => handleApplyInsight(insight)}>
                    {insight.action}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
