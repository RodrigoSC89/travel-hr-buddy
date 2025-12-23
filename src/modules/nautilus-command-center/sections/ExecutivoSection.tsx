/**
 * Seção: Análise Executiva
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Target, DollarSign, BarChart3,
  Lightbulb, AlertTriangle, CheckCircle, Download, Brain,
  ArrowUpRight, ArrowDownRight, FileText, Zap
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from "recharts";
import type { SystemStatus } from "../index";

interface ExecutivoSectionProps {
  systemStatus: SystemStatus;
  isLoading: boolean;
}

const revenueData = [
  { month: "Jan", receita: 35.2, custos: 28.1, lucro: 7.1 },
  { month: "Fev", receita: 38.5, custos: 29.2, lucro: 9.3 },
  { month: "Mar", receita: 42.1, custos: 30.5, lucro: 11.6 },
  { month: "Abr", receita: 39.8, custos: 29.8, lucro: 10.0 },
  { month: "Mai", receita: 44.2, custos: 31.2, lucro: 13.0 },
  { month: "Jun", receita: 41.5, custos: 30.8, lucro: 10.7 },
  { month: "Jul", receita: 45.8, custos: 32.1, lucro: 13.7 },
  { month: "Ago", receita: 48.2, custos: 33.5, lucro: 14.7 },
  { month: "Set", receita: 46.5, custos: 32.8, lucro: 13.7 },
  { month: "Out", receita: 49.8, custos: 34.2, lucro: 15.6 },
  { month: "Nov", receita: 52.1, custos: 35.1, lucro: 17.0 },
  { month: "Dez", receita: 55.0, custos: 36.5, lucro: 18.5 }
];

const benchmarkData = [
  { metric: "Eficiência", empresa: 94.2, industria: 87.5 },
  { metric: "NPS", empresa: 87, industria: 72 },
  { metric: "Retenção", empresa: 95, industria: 88 },
  { metric: "Compliance", empresa: 96.8, industria: 91.2 }
];

export function ExecutivoSection({ systemStatus, isLoading }: ExecutivoSectionProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("12m");

  const kpis = [
    {
      title: "Receita Total",
      value: "R$ 488.7M",
      target: "R$ 500M",
      progress: 97.7,
      period: "anual",
      trend: "up",
      change: "+12.3%"
    },
    {
      title: "ROI",
      value: "328%",
      comparison: "vs ano anterior",
      trend: "up",
      change: "+45%"
    },
    {
      title: "Eficiência Operacional",
      value: "94.2%",
      benchmark: "Indústria: 87%",
      trend: "up",
      change: "+2.1%"
    },
    {
      title: "NPS",
      value: "87",
      category: "Excelente",
      trend: "stable",
      change: "+3 pts"
    }
  ];

  const insights = [
    {
      type: "opportunity" as const,
      title: "Oportunidade de Redução de Custos",
      description: "IA identificou potencial de redução de 15% em custos operacionais através de otimização de rotas",
      impact: "R$ 2.4M/ano",
      confidence: 92
    },
    {
      type: "risk" as const,
      title: "Risco de Aumento de Demanda",
      description: "Previsão de aumento de 30% na demanda em 45 dias - preparar capacidade",
      impact: "Alta",
      confidence: 87
    },
    {
      type: "optimization" as const,
      title: "Otimização de Tripulação",
      description: "Rebalanceamento sugerido pode aumentar eficiência em 8%",
      impact: "R$ 800K/ano",
      confidence: 94
    }
  ];

  return (
    <div className="space-y-6">
      {/* KPIs Estratégicos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.title}</p>
                    <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                    {kpi.target && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Meta: {kpi.target}</span>
                          <span className="text-emerald-600">{kpi.progress}%</span>
                        </div>
                        <Progress value={kpi.progress} className="h-1.5" />
                      </div>
                    )}
                    {kpi.benchmark && (
                      <p className="text-xs text-muted-foreground mt-2">{kpi.benchmark}</p>
                    )}
                    {kpi.comparison && (
                      <p className="text-xs text-muted-foreground mt-2">{kpi.comparison}</p>
                    )}
                    {kpi.category && (
                      <Badge variant="outline" className="mt-2 bg-emerald-50 text-emerald-700 border-emerald-200">
                        {kpi.category}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {kpi.trend === "up" ? (
                      <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    ) : kpi.trend === "down" ? (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    ) : null}
                    <span className={`text-xs ${kpi.trend === "up" ? "text-emerald-600" : "text-muted-foreground"}`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Gráficos de Tendência */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Análise de Tendências */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Análise de Tendências</CardTitle>
                <CardDescription>Receita, custos e lucro (últimos 12 meses)</CardDescription>
              </div>
              <div className="flex gap-1">
                {["3m", "6m", "12m"].map((period) => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? "default" : "ghost"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setSelectedPeriod(period)}
                  >
                    {period}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => `R$ ${value}M`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="receita" stroke="#10B981" strokeWidth={2} name="Receita" />
                  <Line type="monotone" dataKey="custos" stroke="#EF4444" strokeWidth={2} name="Custos" />
                  <Line type="monotone" dataKey="lucro" stroke="#3B82F6" strokeWidth={2} name="Lucro" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Comparativo com Benchmarks */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Benchmark vs Indústria</CardTitle>
            <CardDescription>Performance comparativa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={benchmarkData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="metric" type="category" className="text-xs" width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="empresa" fill="#3B82F6" name="Empresa" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="industria" fill="#94A3B8" name="Indústria" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights da IA */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Insights da IA
              </CardTitle>
              <CardDescription>Análises e recomendações automatizadas</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Zap className="h-3 w-3 mr-1" /> Gerar Novos Insights
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <motion.div
                key={insight.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`border-l-4 ${
                  insight.type === "opportunity" ? "border-l-emerald-500" :
                  insight.type === "risk" ? "border-l-amber-500" :
                  "border-l-blue-500"
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2 mb-2">
                      {insight.type === "opportunity" ? (
                        <Lightbulb className="h-4 w-4 text-emerald-500 mt-0.5" />
                      ) : insight.type === "risk" ? (
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                      ) : (
                        <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{insight.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <Badge variant="outline" className="text-xs">
                        Impacto: {insight.impact}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Confiança: {insight.confidence}%
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full mt-2 text-xs">
                      Ver Detalhes
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" /> Relatório Executivo
        </Button>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Exportar Dados
        </Button>
        <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600">
          <Brain className="h-4 w-4" /> Gerar Relatório com IA
        </Button>
      </div>
    </div>
  );
}
