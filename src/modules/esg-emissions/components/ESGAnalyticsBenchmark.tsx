/**
 * ESG Analytics & Benchmarking Panel
 * Análise avançada, benchmarking interno/externo e cenários
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Globe,
  Ship,
  Gauge,
  Activity,
  Sparkles,
  Brain,
  LineChart,
  PieChart,
  Layers,
  Zap,
  Download,
  Filter,
  Calendar,
  RefreshCcw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart as RechartsLine,
  Line,
  ScatterChart,
  Scatter,
  ZAxis
} from "recharts";

// Mock data
const esgScoreHistory = [
  { month: "Jan", overall: 78, environmental: 75, social: 80, governance: 82 },
  { month: "Fev", overall: 79, environmental: 76, social: 81, governance: 82 },
  { month: "Mar", overall: 80, environmental: 78, social: 81, governance: 83 },
  { month: "Abr", overall: 82, environmental: 80, social: 82, governance: 84 },
  { month: "Mai", overall: 84, environmental: 82, social: 84, governance: 85 },
  { month: "Jun", overall: 86, environmental: 85, social: 85, governance: 88 }
];

const benchmarkData = [
  { metric: "CII Rating", company: "B", industry: "C", topPerformer: "A" },
  { metric: "CO2 Intensity", company: 8.2, industry: 12.5, topPerformer: 6.8 },
  { metric: "LTIFR", company: 0.42, industry: 1.2, topPerformer: 0.15 },
  { metric: "MLC Compliance", company: 96, industry: 88, topPerformer: 99 },
  { metric: "Training Hours", company: 42, industry: 28, topPerformer: 60 }
];

const peerComparison = [
  { name: "NAUTI ONE", esg: 86, environmental: 85, social: 85, governance: 88, size: 15 },
  { name: "Peer A", esg: 82, environmental: 80, social: 82, governance: 84, size: 20 },
  { name: "Peer B", esg: 78, environmental: 75, social: 80, governance: 80, size: 18 },
  { name: "Peer C", esg: 75, environmental: 72, social: 78, governance: 76, size: 12 },
  { name: "Industry Avg", esg: 70, environmental: 68, social: 72, governance: 72, size: 25 }
];

const materialityMatrix = [
  { issue: "Emissões GEE", stakeholder: 95, business: 90, priority: "high" },
  { issue: "Segurança Tripulação", stakeholder: 92, business: 88, priority: "high" },
  { issue: "Poluição Marinha", stakeholder: 88, business: 82, priority: "high" },
  { issue: "Condições de Trabalho", stakeholder: 85, business: 75, priority: "medium" },
  { issue: "Eficiência Energética", stakeholder: 78, business: 95, priority: "high" },
  { issue: "Biodiversidade", stakeholder: 72, business: 55, priority: "medium" },
  { issue: "Ética nos Negócios", stakeholder: 70, business: 85, priority: "high" },
  { issue: "Resíduos", stakeholder: 65, business: 60, priority: "medium" },
  { issue: "Diversidade", stakeholder: 60, business: 50, priority: "low" }
];

const scenarioAnalysis = [
  {
    scenario: "Business as Usual",
    description: "Sem mudanças significativas",
    co2_2030: 85,
    co2_2050: 70,
    investment: 0,
    risk: "high"
  },
  {
    scenario: "Slow Steaming + Eficiência",
    description: "Otimização operacional",
    co2_2030: 60,
    co2_2050: 40,
    investment: 5000000,
    risk: "low"
  },
  {
    scenario: "LNG Transition",
    description: "Conversão parcial para LNG",
    co2_2030: 55,
    co2_2050: 35,
    investment: 25000000,
    risk: "medium"
  },
  {
    scenario: "Full Decarbonization",
    description: "Ammonia/Hydrogen + Carbon Capture",
    co2_2030: 45,
    co2_2050: 10,
    investment: 80000000,
    risk: "high"
  }
];

const predictiveInsights = [
  {
    type: "regulatory",
    title: "EU ETS Maritime 2027",
    description: "Custo estimado de €2.5M/ano para compliance com EU ETS marítimo expandido",
    confidence: 92,
    impact: "high",
    action: "Iniciar hedge de carbono"
  },
  {
    type: "performance",
    title: "CII Downgrade Risk - MV Nordic Star",
    description: "75% probabilidade de downgrade para Rating E se medidas não forem tomadas",
    confidence: 87,
    impact: "high",
    action: "Implementar slow steaming"
  },
  {
    type: "opportunity",
    title: "Green Financing Opportunity",
    description: "Elegibilidade para green bonds com economia de 50bps em financiamentos",
    confidence: 78,
    impact: "medium",
    action: "Preparar framework"
  }
];

const externalRatings = [
  { agency: "MSCI ESG", rating: "AA", trend: "stable", lastUpdate: "2025-12-15" },
  { agency: "Sustainalytics", rating: "Low Risk (15.2)", trend: "improving", lastUpdate: "2025-11-20" },
  { agency: "CDP Climate", rating: "B", trend: "improving", lastUpdate: "2025-10-30" },
  { agency: "Poseidon Principles", rating: "92% Aligned", trend: "improving", lastUpdate: "2026-01-10" }
];

export const ESGAnalyticsBenchmark: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("ytd");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Analytics & Benchmarking ESG
          </h2>
          <p className="text-muted-foreground">Análise avançada, comparativos e projeções</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="qtd">Este Trimestre</SelectItem>
              <SelectItem value="ytd">Este Ano</SelectItem>
              <SelectItem value="12m">Últimos 12 Meses</SelectItem>
              <SelectItem value="3y">Últimos 3 Anos</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* ESG Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/20 border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">ESG Score Geral</p>
              <Award className="h-5 w-5 text-primary" />
            </div>
            <p className="text-4xl font-bold">86</p>
            <div className="flex items-center text-sm text-success mt-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+8 pontos YTD</span>
            </div>
            <Progress value={86} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Environmental</p>
              <Gauge className="h-5 w-5 text-success" />
            </div>
            <p className="text-4xl font-bold text-success">85</p>
            <p className="text-xs text-muted-foreground mt-1">Emissões, Energia, Resíduos</p>
            <Progress value={85} className="mt-2 h-2 [&>div]:bg-success" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Social</p>
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <p className="text-4xl font-bold text-primary">85</p>
            <p className="text-xs text-muted-foreground mt-1">Segurança, Bem-estar, Diversidade</p>
            <Progress value={85} className="mt-2 h-2 [&>div]:bg-primary" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Governance</p>
              <Globe className="h-5 w-5 text-accent-foreground" />
            </div>
            <p className="text-4xl font-bold text-accent-foreground">88</p>
            <p className="text-xs text-muted-foreground mt-1">Compliance, Ética, Risco</p>
            <Progress value={88} className="mt-2 h-2 [&>div]:bg-accent" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full max-w-4xl grid-cols-5">
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="benchmark" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Benchmark
          </TabsTrigger>
          <TabsTrigger value="materiality" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Materialidade
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Cenários
          </TabsTrigger>
          <TabsTrigger value="predictive" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            IA Preditiva
          </TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Evolução do Score ESG</CardTitle>
                <CardDescription>Tendência mensal por dimensão</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={esgScoreHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[60, 100]} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="overall" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} name="Geral" />
                    <Area type="monotone" dataKey="environmental" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.3} name="Environmental" />
                    <Area type="monotone" dataKey="social" stroke="hsl(var(--info))" fill="hsl(var(--info))" fillOpacity={0.3} name="Social" />
                    <Area type="monotone" dataKey="governance" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.3} name="Governance" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* External Ratings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Ratings Externos
                </CardTitle>
                <CardDescription>Avaliações de agências ESG</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {externalRatings.map((rating) => (
                    <div key={rating.agency} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{rating.agency}</span>
                        <Badge className={
                          rating.trend === "improving" ? "bg-success" :
                          rating.trend === "stable" ? "bg-primary" : "bg-warning"
                        }>
                          {rating.rating}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {rating.trend === "improving" && <TrendingUp className="h-3 w-3 text-success" />}
                          {rating.trend === "stable" && <ArrowUpRight className="h-3 w-3 text-primary" />}
                          <span className="capitalize">{rating.trend}</span>
                        </div>
                        <span>Atualizado: {new Date(rating.lastUpdate).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Benchmark Tab */}
        <TabsContent value="benchmark" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Industry Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Comparativo com Indústria</CardTitle>
                <CardDescription>Performance vs média do setor e top performers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {benchmarkData.map((item) => (
                    <div key={item.metric} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{item.metric}</span>
                        {typeof item.company === "string" ? (
                          <Badge className="bg-success">{item.company}</Badge>
                        ) : (
                          <span className="font-bold">{item.company}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Indústria:</span>
                          <span>{item.industry}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Top:</span>
                          <span className="text-success font-medium">{item.topPerformer}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Peer Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Comparativo com Peers</CardTitle>
                <CardDescription>Posicionamento no setor marítimo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={peerComparison} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="environmental" fill="#22c55e" name="E" stackId="a" />
                    <Bar dataKey="social" fill="#3b82f6" name="S" stackId="a" />
                    <Bar dataKey="governance" fill="#a855f7" name="G" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Materiality Tab */}
        <TabsContent value="materiality" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Matriz de Materialidade</CardTitle>
              <CardDescription>Importância para stakeholders vs impacto nos negócios</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="business" name="Impacto no Negócio" domain={[40, 100]} />
                  <YAxis type="number" dataKey="stakeholder" name="Importância Stakeholders" domain={[50, 100]} />
                  <ZAxis type="number" range={[100, 500]} />
                  <Tooltip 
                    formatter={(value, name) => [value, name === "business" ? "Negócio" : "Stakeholder"]}
                    labelFormatter={(label) => materialityMatrix.find(m => m.business === label)?.issue || ""}
                  />
                  <Scatter 
                    name="Temas Materiais" 
                    data={materialityMatrix} 
                    fill="#8884d8"
                  >
                    {materialityMatrix.map((entry, index) => (
                      <rect
                        key={`cell-${index}`}
                        fill={
                          entry.priority === "high" ? "#ef4444" :
                          entry.priority === "medium" ? "#f59e0b" : "#22c55e"
                        }
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              
              <div className="mt-4 grid grid-cols-3 gap-4">
                {materialityMatrix.filter(m => m.priority === "high").slice(0, 6).map((item) => (
                  <div key={item.issue} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{item.issue}</span>
                      <Badge variant="destructive" className="text-xs">Alta</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Cenários de Descarbonização</CardTitle>
              <CardDescription>Projeções 2030/2050 e investimentos necessários</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {scenarioAnalysis.map((scenario) => (
                  <Card key={scenario.scenario} className={`border-2 ${
                    scenario.scenario === "Slow Steaming + Eficiência" ? "border-green-500" : ""
                  }`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{scenario.scenario}</CardTitle>
                      <CardDescription className="text-xs">{scenario.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="text-xs text-muted-foreground">2030</p>
                          <p className="font-bold">-{100 - scenario.co2_2030}%</p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="text-xs text-muted-foreground">2050</p>
                          <p className="font-bold">-{100 - scenario.co2_2050}%</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground">Investimento</p>
                        <p className="font-bold">
                          {scenario.investment === 0 ? "-" : 
                            scenario.investment >= 1000000 
                              ? `R$ ${(scenario.investment / 1000000).toFixed(0)}M`
                              : `R$ ${(scenario.investment / 1000).toFixed(0)}K`
                          }
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Risco</p>
                        <Badge variant={
                          scenario.risk === "low" ? "default" :
                          scenario.risk === "medium" ? "secondary" : "destructive"
                        }>
                          {scenario.risk === "low" ? "Baixo" : scenario.risk === "medium" ? "Médio" : "Alto"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictive Tab */}
        <TabsContent value="predictive" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {predictiveInsights.map((insight) => (
              <Card key={insight.title} className={`border-l-4 ${
                insight.impact === "high" ? "border-l-red-500" :
                insight.impact === "medium" ? "border-l-yellow-500" : "border-l-green-500"
              }`}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Brain className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{insight.title}</CardTitle>
                      <Badge variant="outline" className="mt-1">{insight.confidence}% confiança</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{insight.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant={
                      insight.impact === "high" ? "destructive" :
                      insight.impact === "medium" ? "secondary" : "default"
                    }>
                      Impacto {insight.impact === "high" ? "Alto" : insight.impact === "medium" ? "Médio" : "Baixo"}
                    </Badge>
                    <Button size="sm">
                      <Sparkles className="h-4 w-4 mr-2" />
                      {insight.action}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ESGAnalyticsBenchmark;
