import React from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Sparkles,
  BarChart3,
  PieChart,
  Activity,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  Ship,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  Zap,
} from "lucide-react";

const insights = [
  {
    id: 1,
    title: "Otimização de Rotas Detectada",
    description: "A rota atual pode ser otimizada economizando 15% em combustível",
    type: "opportunity",
    impact: "Alto",
    confidence: 94,
    category: "Operações",
    status: "pending",
    estimatedValue: "R$ 45.000/mês",
  },
  {
    id: 2,
    title: "Manutenção Preventiva Recomendada",
    description: "Motor principal necessita inspeção baseado em padrões de vibração",
    type: "warning",
    impact: "Crítico",
    confidence: 87,
    category: "Manutenção",
    status: "in_progress",
    estimatedValue: "R$ 120.000 economia",
  },
  {
    id: 3,
    title: "Eficiência de Tripulação Acima da Média",
    description: "Performance 23% acima do benchmark do setor",
    type: "success",
    impact: "Médio",
    confidence: 91,
    category: "RH",
    status: "completed",
    estimatedValue: "+12% produtividade",
  },
  {
    id: 4,
    title: "Tendência de Mercado Identificada",
    description: "Aumento de 40% na demanda por transporte na região Sul",
    type: "opportunity",
    impact: "Alto",
    confidence: 78,
    category: "Mercado",
    status: "pending",
    estimatedValue: "R$ 200.000 potencial",
  },
  {
    id: 5,
    title: "Risco Regulatório Detectado",
    description: "Novas regulamentações ANTAQ entram em vigor em 90 dias",
    type: "warning",
    impact: "Médio",
    confidence: 100,
    category: "Compliance",
    status: "pending",
    estimatedValue: "Evitar multas",
  },
];

const kpis = [
  {
    title: "ROI Total",
    value: "247%",
    change: "+18%",
    trend: "up",
    icon: DollarSign,
    color: "text-emerald-500",
  },
  {
    title: "Insights Gerados",
    value: "342",
    change: "+45",
    trend: "up",
    icon: Lightbulb,
    color: "text-amber-500",
  },
  {
    title: "Ações Executadas",
    value: "89%",
    change: "+12%",
    trend: "up",
    icon: CheckCircle2,
    color: "text-blue-500",
  },
  {
    title: "Economia Gerada",
    value: "R$ 1.2M",
    change: "+R$ 180K",
    trend: "up",
    icon: TrendingUp,
    color: "text-purple-500",
  },
];

const trends = [
  { category: "Operações", score: 85, change: 12 },
  { category: "Finanças", score: 78, change: -3 },
  { category: "Manutenção", score: 92, change: 8 },
  { category: "RH", score: 71, change: 15 },
  { category: "Compliance", score: 88, change: 5 },
];

export default function BusinessInsights() {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "opportunity":
        return <Lightbulb className="h-5 w-5 text-amber-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      default:
        return <Activity className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-emerald-100 text-emerald-700">Concluído</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-700">Em Progresso</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-700">Pendente</Badge>;
    }
  };

  return (
    <ModulePageWrapper gradient="green">
      <ModuleHeader
        icon={TrendingUp}
        title="Insights de Negócio"
        description="Inteligência artificial para decisões estratégicas e análise de tendências"
        gradient="green"
        badges={[
          { icon: Sparkles, label: "IA Generativa" },
          { icon: Brain, label: "Machine Learning" },
          { icon: Target, label: "Análise Preditiva" },
        ]}
      />

      <div className="space-y-6">
        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                    <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {kpi.trend === "up" ? (
                        <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          kpi.trend === "up" ? "text-emerald-500" : "text-red-500"
                        }`}
                      >
                        {kpi.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full bg-muted ${kpi.color}`}>
                    <kpi.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="insights" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="insights">Insights Ativos</TabsTrigger>
            <TabsTrigger value="trends">Tendências</TabsTrigger>
            <TabsTrigger value="predictions">Previsões</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-4">
            <div className="grid gap-4">
              {insights.map((insight) => (
                <Card key={insight.id} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-muted">{getTypeIcon(insight.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{insight.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {insight.description}
                            </p>
                          </div>
                          {getStatusBadge(insight.status)}
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{insight.category}</Badge>
                            <Badge
                              className={
                                insight.impact === "Crítico"
                                  ? "bg-red-100 text-red-700"
                                  : insight.impact === "Alto"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-blue-100 text-blue-700"
                              }
                            >
                              {insight.impact}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Sparkles className="h-4 w-4" />
                            <span>{insight.confidence}% confiança</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                            <Zap className="h-4 w-4" />
                            <span>{insight.estimatedValue}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm">Analisar</Button>
                          <Button size="sm" variant="outline">
                            Implementar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    Performance por Área
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {trends.map((trend, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{trend.category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{trend.score}%</span>
                          <span
                            className={`text-xs ${
                              trend.change >= 0 ? "text-emerald-500" : "text-red-500"
                            }`}
                          >
                            {trend.change >= 0 ? "+" : ""}
                            {trend.change}%
                          </span>
                        </div>
                      </div>
                      <Progress value={trend.score} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-purple-500" />
                    Distribuição de Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-amber-500" />
                        <span className="font-medium">Oportunidades</span>
                      </div>
                      <Badge className="bg-amber-100 text-amber-700">147</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        <span className="font-medium">Alertas</span>
                      </div>
                      <Badge className="bg-orange-100 text-orange-700">89</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        <span className="font-medium">Sucessos</span>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700">106</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-500" />
                    Previsão de Receita
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-500">R$ 4.8M</div>
                  <p className="text-sm text-muted-foreground mt-1">Próximo trimestre</p>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm text-emerald-500">+22% vs atual</span>
                  </div>
                  <Progress value={78} className="h-2 mt-4" />
                  <p className="text-xs text-muted-foreground mt-2">78% de confiança</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ship className="h-5 w-5 text-blue-500" />
                    Demanda de Frota
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-500">+3 embarcações</div>
                  <p className="text-sm text-muted-foreground mt-1">Necessidade estimada</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-blue-500">Em 6 meses</span>
                  </div>
                  <Progress value={85} className="h-2 mt-4" />
                  <p className="text-xs text-muted-foreground mt-2">85% de confiança</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-500" />
                    Necessidade de Pessoal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-500">+45 tripulantes</div>
                  <p className="text-sm text-muted-foreground mt-1">Contratação prevista</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-purple-500">Expansão Q2</span>
                  </div>
                  <Progress value={72} className="h-2 mt-4" />
                  <p className="text-xs text-muted-foreground mt-2">72% de confiança</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios de Inteligência</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Análise Mensal de Performance", date: "Dez 2024", type: "PDF" },
                    { name: "Relatório de Tendências de Mercado", date: "Nov 2024", type: "Excel" },
                    { name: "Dashboard Executivo Q4", date: "Out 2024", type: "PDF" },
                    { name: "Previsões Operacionais 2025", date: "Dez 2024", type: "PowerPoint" },
                  ].map((report, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <BarChart3 className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">{report.name}</p>
                          <p className="text-sm text-muted-foreground">{report.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{report.type}</Badge>
                        <Button size="sm" variant="outline">
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ModulePageWrapper>
  );
}
