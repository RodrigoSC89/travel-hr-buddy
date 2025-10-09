import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Ship,
  Building,
  Award,
  Zap,
  Leaf,
  Shield,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react";

interface AnalyticsData {
  complianceTrends: Array<{
    period: string;
    score: number;
    target: number;
    audits: number;
  }>;
  elementPerformance: Array<{
    element: string;
    score: number;
    trend: number;
    audits: number;
  }>;
  nonConformityDistribution: Array<{
    type: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  auditTypeComparison: Array<{
    type: string;
    score: number;
    audits: number;
    target: number;
  }>;
  monthlyProgress: Array<{
    month: string;
    completed: number;
    planned: number;
    efficiency: number;
  }>;
  kpis: {
    averageScore: number;
    totalAudits: number;
    activeNonConformities: number;
    certificationStatus: string;
    tasoScore: number;
    idembScore: number;
    innovationIndex: number;
    timeToResolution: number;
  };
}

const mockAnalyticsData: AnalyticsData = {
  complianceTrends: [
    { period: "Jan 2024", score: 85.2, target: 90, audits: 12 },
    { period: "Fev 2024", score: 86.1, target: 90, audits: 15 },
    { period: "Mar 2024", score: 87.3, target: 90, audits: 18 },
    { period: "Abr 2024", score: 88.7, target: 90, audits: 14 },
    { period: "Mai 2024", score: 87.9, target: 90, audits: 16 },
    { period: "Jun 2024", score: 89.1, target: 90, audits: 20 },
    { period: "Jul 2024", score: 88.5, target: 90, audits: 17 },
    { period: "Ago 2024", score: 90.2, target: 90, audits: 19 },
    { period: "Set 2024", score: 89.8, target: 90, audits: 21 },
    { period: "Out 2024", score: 91.1, target: 90, audits: 23 },
    { period: "Nov 2024", score: 88.9, target: 90, audits: 18 },
    { period: "Dez 2024", score: 87.5, target: 90, audits: 15 },
  ],
  elementPerformance: [
    { element: "Liderança", score: 92.3, trend: 2.1, audits: 45 },
    { element: "Conformidade Legal", score: 88.7, trend: -1.2, audits: 45 },
    { element: "Gestão de Riscos", score: 85.4, trend: 3.4, audits: 43 },
    { element: "Competência", score: 91.8, trend: 1.8, audits: 44 },
    { element: "Segurança Técnica", score: 86.2, trend: 0.7, audits: 42 },
    { element: "Manutenção", score: 89.1, trend: 2.3, audits: 45 },
    { element: "Emergências", score: 87.6, trend: -0.8, audits: 41 },
    { element: "Seg. Operacional", score: 90.4, trend: 1.5, audits: 44 },
    { element: "Meio Ambiente", score: 84.9, trend: 4.2, audits: 40 },
    { element: "Monitoramento", score: 88.3, trend: 1.1, audits: 43 },
  ],
  nonConformityDistribution: [
    { type: "Críticas", count: 2, percentage: 8, color: "hsl(var(--destructive))" },
    { type: "Graves", count: 5, percentage: 20, color: "#ff6b35" },
    { type: "Moderadas", count: 12, percentage: 48, color: "hsl(var(--warning))" },
    { type: "Leves", count: 6, percentage: 24, color: "hsl(var(--info))" },
  ],
  auditTypeComparison: [
    { type: "Embarcações", score: 88.2, audits: 28, target: 90 },
    { type: "Base Terrestre", score: 89.7, audits: 17, target: 90 },
  ],
  monthlyProgress: [
    { month: "Jan", completed: 12, planned: 15, efficiency: 80 },
    { month: "Fev", completed: 15, planned: 16, efficiency: 94 },
    { month: "Mar", completed: 18, planned: 20, efficiency: 90 },
    { month: "Abr", completed: 14, planned: 18, efficiency: 78 },
    { month: "Mai", completed: 16, planned: 16, efficiency: 100 },
    { month: "Jun", completed: 20, planned: 22, efficiency: 91 },
  ],
  kpis: {
    averageScore: 88.9,
    totalAudits: 45,
    activeNonConformities: 25,
    certificationStatus: "Válida",
    tasoScore: 92.3,
    idembScore: 88.7,
    innovationIndex: 75.2,
    timeToResolution: 18.5,
  },
};

export const PeotramAnalyticsPanel: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("2024");
  const [selectedMetric, setSelectedMetric] = useState("compliance");
  const [data, setData] = useState<AnalyticsData>(mockAnalyticsData);

  const refreshData = () => {
    // Simular atualização dos dados
    console.log("Atualizando dados de analytics...");
  };

  const exportData = () => {
    // Implementar exportação dos dados
    console.log("Exportando dados de analytics...");
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-success" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Activity className="w-4 h-4 text-muted-foreground" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-success";
    if (trend < 0) return "text-destructive";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics PEOTRAM</h2>
          <p className="text-muted-foreground">Análise avançada de performance e tendências</p>
        </div>

        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="all">Todos</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>

          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-card to-success/5 border-success/20">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-6 h-6 text-success" />
            </div>
            <div className="text-2xl font-bold text-foreground">{data.kpis.averageScore}%</div>
            <p className="text-sm text-muted-foreground">Score Médio</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-info/5 border-info/20">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <BarChart3 className="w-6 h-6 text-info" />
            </div>
            <div className="text-2xl font-bold text-foreground">{data.kpis.totalAudits}</div>
            <p className="text-sm text-muted-foreground">Total Auditorias</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-warning/5 border-warning/20">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="w-6 h-6 text-warning" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {data.kpis.activeNonConformities}
            </div>
            <p className="text-sm text-muted-foreground">NC Ativas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">{data.kpis.timeToResolution}d</div>
            <p className="text-sm text-muted-foreground">Tempo Médio Resolução</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="compliance">Conformidade</TabsTrigger>
          <TabsTrigger value="elements">Elementos</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tendência de Conformidade */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Evolução da Conformidade
                </CardTitle>
                <CardDescription>Score de conformidade vs meta ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.complianceTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="hsl(var(--success))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: "hsl(var(--success))", strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribuição de Não Conformidades */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  Distribuição de Não Conformidades
                </CardTitle>
                <CardDescription>Classificação por nível de criticidade</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.nonConformityDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {data.nonConformityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {data.nonConformityDistribution.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">
                        {item.type}: {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparação por Tipo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Comparação: Embarcações vs Base Terrestre
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.auditTypeComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="type" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar
                    dataKey="target"
                    fill="hsl(var(--success))"
                    radius={[4, 4, 0, 0]}
                    opacity={0.7}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="elements" className="space-y-6">
          {/* Performance por Elemento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Performance por Elemento PEOTRAM
              </CardTitle>
              <CardDescription>Score e tendência de cada elemento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.elementPerformance.map((element, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{element.element}</h4>
                        <p className="text-sm text-muted-foreground">
                          {element.audits} auditorias realizadas
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-bold">{element.score}%</div>
                        <div
                          className={`text-sm flex items-center gap-1 ${getTrendColor(element.trend)}`}
                        >
                          {getTrendIcon(element.trend)}
                          {Math.abs(element.trend).toFixed(1)}%
                        </div>
                      </div>
                      <div className="w-24">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${element.score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Progresso Mensal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Progresso Mensal de Auditorias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.monthlyProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="planned"
                    stackId="1"
                    stroke="hsl(var(--muted))"
                    fill="hsl(var(--muted))"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stackId="2"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.8}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Indicadores Especiais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="w-5 h-5 text-info" />
                  TASO
                </CardTitle>
                <CardDescription>Taxa de Acidentes de Segurança Operacional</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-info mb-2">{data.kpis.tasoScore}</div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-info h-2 rounded-full transition-all duration-500"
                    style={{ width: `${data.kpis.tasoScore}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Ship className="w-5 h-5 text-warning" />
                  IDEMB
                </CardTitle>
                <CardDescription>Índice de Disponibilidade de Embarcação</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-warning mb-2">{data.kpis.idembScore}</div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-warning h-2 rounded-full transition-all duration-500"
                    style={{ width: `${data.kpis.idembScore}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="w-5 h-5 text-success" />
                  Inovação
                </CardTitle>
                <CardDescription>Índice de Práticas Inovadoras</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success mb-2">
                  {data.kpis.innovationIndex}
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-success h-2 rounded-full transition-all duration-500"
                    style={{ width: `${data.kpis.innovationIndex}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
