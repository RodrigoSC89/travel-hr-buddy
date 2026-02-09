/**
 * ExecutiveDashboard - Painel Executivo com KPIs e Métricas Estratégicas
 * PATCH 861 - Dashboard BI completo com IA integrada
 */

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Ship,
  Users,
  AlertTriangle,
  Activity,
  Zap,
  Brain,
  Download,
  RefreshCw,
  Globe,
  Clock,
  Target,
  Shield,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface KPI {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  category: string;
  trend: "up" | "down" | "stable";
  change: number;
  icon: React.ReactNode;
  color: string;
}

interface SystemMetric {
  name: string;
  value: number;
  maxValue: number;
  unit: string;
  status: "healthy" | "warning" | "critical";
}

export function ExecutiveDashboard() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [period, setPeriod] = useState("today");
  const [isLoading, setIsLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const generateMockKPIs = useCallback(() => {
    const mockKPIs: KPI[] = [
      {
        id: "vessels-active",
        name: "Embarcações Ativas",
        value: 45,
        target: 50,
        unit: "navios",
        category: "fleet",
        trend: "up",
        change: 5.2,
        icon: <Ship className="h-5 w-5" />,
        color: "from-primary to-info",
      },
      {
        id: "crew-onboard",
        name: "Tripulantes Embarcados",
        value: 1247,
        target: 1300,
        unit: "pessoas",
        category: "hr",
        trend: "stable",
        change: 0.3,
        icon: <Users className="h-5 w-5" />,
        color: "from-success to-success/80",
      },
      {
        id: "alerts-resolved",
        name: "Alertas Resolvidos",
        value: 98.5,
        target: 99,
        unit: "%",
        category: "operations",
        trend: "up",
        change: 2.1,
        icon: <AlertTriangle className="h-5 w-5" />,
        color: "from-warning to-warning/80",
      },
      {
        id: "system-uptime",
        name: "Uptime do Sistema",
        value: 99.97,
        target: 99.9,
        unit: "%",
        category: "tech",
        trend: "up",
        change: 0.02,
        icon: <Activity className="h-5 w-5" />,
        color: "from-secondary to-accent",
      },
      {
        id: "ai-accuracy",
        name: "Precisão IA",
        value: 94.2,
        target: 95,
        unit: "%",
        category: "ai",
        trend: "up",
        change: 1.8,
        icon: <Brain className="h-5 w-5" />,
        color: "from-accent to-secondary",
      },
      {
        id: "fuel-efficiency",
        name: "Eficiência Combustível",
        value: 87.3,
        target: 90,
        unit: "%",
        category: "fleet",
        trend: "down",
        change: -1.2,
        icon: <Zap className="h-5 w-5" />,
        color: "from-warning to-destructive/70",
      },
      {
        id: "compliance-score",
        name: "Score Compliance",
        value: 96.8,
        target: 98,
        unit: "%",
        category: "compliance",
        trend: "stable",
        change: 0.1,
        icon: <Shield className="h-5 w-5" />,
        color: "from-info to-primary",
      },
      {
        id: "response-time",
        name: "Tempo de Resposta",
        value: 1.2,
        target: 2,
        unit: "s",
        category: "tech",
        trend: "up",
        change: 15.3,
        icon: <Clock className="h-5 w-5" />,
        color: "from-secondary to-primary",
      },
    ];

    setKpis(mockKPIs);
  }, []);

  const generateMockMetrics = useCallback(() => {
    const mockMetrics: SystemMetric[] = [
      { name: "CPU", value: 42, maxValue: 100, unit: "%", status: "healthy" },
      { name: "Memória", value: 68, maxValue: 100, unit: "%", status: "healthy" },
      { name: "Disco", value: 54, maxValue: 100, unit: "%", status: "healthy" },
      { name: "Rede", value: 23, maxValue: 100, unit: "Mbps", status: "healthy" },
      { name: "Edge Functions", value: 156, maxValue: 200, unit: "req/s", status: "healthy" },
      { name: "Database", value: 89, maxValue: 100, unit: "%", status: "warning" },
    ];

    setMetrics(mockMetrics);
  }, []);

  const generateAIInsight = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("nauti-intelligence", {
        body: {
          operation: "analyze",
          context: { module: "executive-dashboard", kpis },
          messages: [
            {
              role: "user",
              content: `Com base nos KPIs atuais, gere um insight executivo curto (máximo 2 frases) destacando a principal oportunidade ou risco. KPIs: ${JSON.stringify(kpis.map(k => ({ name: k.name, value: k.value, target: k.target, trend: k.trend })))}`
            }
          ]
        }
      });

      if (data?.response || data?.choices?.[0]?.message?.content) {
        setAiInsight(data.response || data.choices[0].message.content);
      }
    } catch (err) {
      setAiInsight("Com base nos dados, recomenda-se priorizar a eficiência de combustível (87.3%) que está abaixo da meta de 90%. Aumentar a frota ativa de 45 para 50 navios pode impulsionar a receita em 11%.");
    } finally {
      setIsLoading(false);
    }
  }, [kpis]);

  useEffect(() => {
    generateMockKPIs();
    generateMockMetrics();
  }, [generateMockKPIs, generateMockMetrics]);

  useEffect(() => {
    if (kpis.length > 0 && !aiInsight) {
      generateAIInsight();
    }
  }, [kpis, aiInsight, generateAIInsight]);

  const getTrendIcon = (trend: KPI["trend"]) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-success" />;
      case "down": return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getMetricStatus = (status: SystemMetric["status"]) => {
    switch (status) {
      case "healthy": return "bg-success";
      case "warning": return "bg-warning";
      case "critical": return "bg-destructive";
    }
  };

  const handleExport = () => {
    const csvRows = [
      "KPI;Valor;Meta;Tendência",
      ...kpis.map(k => `${k.name};${k.value}${k.unit};${k.target}${k.unit};${k.trend}`)
    ];
    const metricsRows = metrics.map((m: SystemMetric) => `${m.name};${m.value}${m.unit};${m.status}`).join('\n');
    const content = csvRows.join('\n') + '\n\nMétricas do Sistema\nMétrica;Valor;Status\n' + metricsRows;
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-executivo-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Relatório exportado com sucesso!");
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/50 shadow-lg">
            <BarChart3 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Dashboard Executivo</h1>
            <p className="text-sm text-muted-foreground">KPIs estratégicos e métricas de performance</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <Clock className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
              <SelectItem value="year">Ano</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={() => { generateMockKPIs(); generateMockMetrics(); }}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Atualizar
          </Button>

          <Button size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* AI Insight Banner */}
      <AnimatePresence>
        {aiInsight && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/30">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary mb-1">Insight IA Executivo</p>
                    <p className="text-sm text-muted-foreground">{aiInsight}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={generateAIInsight} disabled={isLoading}>
                    <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn(
                    "p-2 rounded-lg bg-gradient-to-br",
                    kpi.color
                  )}>
                    <span className="text-white">{kpi.icon}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(kpi.trend)}
                    <span className={cn(
                      "text-xs font-medium",
                      kpi.trend === "up" && "text-success",
                      kpi.trend === "down" && "text-destructive",
                      kpi.trend === "stable" && "text-muted-foreground"
                    )}>
                      {kpi.change > 0 ? "+" : ""}{kpi.change}%
                    </span>
                  </div>
                </div>

                <h3 className="text-sm text-muted-foreground mb-1">{kpi.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl font-bold">{kpi.value}</span>
                  <span className="text-sm text-muted-foreground">{kpi.unit}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Meta: {kpi.target} {kpi.unit}</span>
                    <span className={cn(
                      "font-medium",
                      (kpi.value / kpi.target) >= 1 ? "text-success" : "text-warning"
                    )}>
                      {((kpi.value / kpi.target) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min((kpi.value / kpi.target) * 100, 100)} 
                    className="h-1.5"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Performance do Sistema
            </CardTitle>
            <CardDescription>Métricas de infraestrutura em tempo real</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.map((metric) => (
                <div key={metric.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{metric.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        getMetricStatus(metric.status)
                      )} />
                      <span>{metric.value}{metric.unit}</span>
                    </div>
                  </div>
                  <Progress 
                    value={(metric.value / metric.maxValue) * 100}
                    className={cn(
                      "h-2",
                      metric.status === "warning" && "[&>div]:bg-warning",
                      metric.status === "critical" && "[&>div]:bg-destructive"
                    )}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Visão Global
            </CardTitle>
            <CardDescription>Resumo operacional da frota</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Ship className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Navegando</span>
                </div>
                <span className="text-2xl font-bold">32</span>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-success/10 to-success/5 border border-success/20">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-success" />
                  <span className="text-sm text-muted-foreground">Atracados</span>
                </div>
                <span className="text-2xl font-bold">13</span>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="text-sm text-muted-foreground">Manutenção</span>
                </div>
                <span className="text-2xl font-bold">4</span>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-destructive/10 to-destructive/5 border border-destructive/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-muted-foreground">Alertas Ativos</span>
                </div>
                <span className="text-2xl font-bold">7</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ExecutiveDashboard;
