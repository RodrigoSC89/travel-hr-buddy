/**
 * CIAI - Central de Inteligência de Acidentes e Investigação
 * Dashboard com análise de padrões e previsão de incidentes
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Shield,
  Target,
  Brain,
  Calendar,
  MapPin,
  Users,
  Activity,
  FileText,
  Lightbulb,
  BarChart3,
  PieChart
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  ScatterChart,
  Scatter
} from "recharts";

// Mock data para incidentes
const incidents = [
  {
    id: "inc-1",
    date: "2025-01-05",
    type: "Quase-acidente",
    category: "Escorregão",
    location: "Deck do motor",
    cause: "Água acumulada próximo à bomba (drenagem obstruída)",
    severity: "low",
    rootCause: "water",
    recurrence: true
  },
  {
    id: "inc-2",
    date: "2024-11-20",
    type: "Lesão",
    category: "Queda",
    location: "Escadaria A",
    cause: "Degrau escorregadio, corrimão insuficiente",
    severity: "medium",
    rootCause: "surface",
    recurrence: true
  },
  {
    id: "inc-3",
    date: "2024-08-15",
    type: "Lesão",
    category: "Escorregão",
    location: "Rampa de carga",
    cause: "Água da chuva, superfície desgastada",
    severity: "high",
    rootCause: "water",
    recurrence: true
  },
  {
    id: "inc-4",
    date: "2024-05-10",
    type: "Quase-acidente",
    category: "Escorregão",
    location: "Deck do motor",
    cause: "Condensação de água",
    severity: "low",
    rootCause: "water",
    recurrence: true
  }
];

const patternAnalysis = {
  mainPattern: "Condições úmidas",
  correlation: 100,
  incidents: 4,
  trend: "increasing",
  rootCauses: [
    { cause: "Água/Umidade", percentage: 80, count: 4 },
    { cause: "Degradação de superfície", percentage: 15, count: 1 },
    { cause: "Defeito de fabricação", percentage: 5, count: 0 }
  ],
  prediction: {
    expectedIncidents: "3-4",
    timeframe: "2025",
    seriousInjuryProbability: 25,
    estimatedCost: 200000
  },
  recommendations: [
    { priority: 1, action: "Tapetes antiderrapantes em zonas de alta umidade", cost: 15000, roi: "93%" },
    { priority: 2, action: "Melhorias no sistema de drenagem", cost: 20000, roi: "88%" },
    { priority: 3, action: "Treinamento de protocolos para clima úmido", cost: 5000, roi: "75%" }
  ]
};

const incidentTrend = [
  { year: "2020", incidents: 2, serious: 0 },
  { year: "2021", incidents: 3, serious: 1 },
  { year: "2022", incidents: 2, serious: 0 },
  { year: "2023", incidents: 3, serious: 1 },
  { year: "2024", incidents: 4, serious: 1 },
  { year: "2025*", incidents: 4, serious: 1 }
];

const categoryDistribution = [
  { name: "Escorregão", value: 45, color: "#3b82f6" },
  { name: "Queda", value: 25, color: "#f59e0b" },
  { name: "Impacto", value: 15, color: "#ef4444" },
  { name: "Ergonômico", value: 10, color: "#8b5cf6" },
  { name: "Outros", value: 5, color: "#6b7280" }
];

const locationHeatmap = [
  { location: "Deck do motor", incidents: 8, x: 20, y: 30 },
  { location: "Escadarias", incidents: 5, x: 45, y: 50 },
  { location: "Rampa de carga", incidents: 4, x: 70, y: 40 },
  { location: "Ponte de comando", incidents: 2, x: 55, y: 20 },
  { location: "Cozinha", incidents: 3, x: 30, y: 60 }
];

export default function AccidentIntelligenceDashboard() {
  const [selectedIncident, setSelectedIncident] = useState(incidents[0]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "text-red-500 bg-red-500/10 border-red-500/20";
      case "medium": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "low": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Shield className="h-8 w-8 text-orange-500" />
            CIAI - Inteligência de Acidentes
          </h1>
          <p className="text-muted-foreground mt-1">
            Análise de padrões e previsão de incidentes com IA
          </p>
        </div>
        <Badge variant="outline" className="text-orange-500 border-orange-500">
          <Brain className="h-3 w-3 mr-1" />
          Análise Ativa
        </Badge>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Incidentes (12m)</p>
                <p className="text-2xl font-bold text-red-500">4</p>
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> +33% vs ano anterior
                </p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Padrões Detectados</p>
                <p className="text-2xl font-bold text-amber-500">3</p>
                <p className="text-xs text-amber-400">100% correlação água</p>
              </div>
              <Target className="h-10 w-10 text-amber-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Precisão Previsão</p>
                <p className="text-2xl font-bold text-blue-500">91%</p>
                <p className="text-xs text-blue-400">Modelo XGBoost</p>
              </div>
              <Brain className="h-10 w-10 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Redução Esperada</p>
                <p className="text-2xl font-bold text-emerald-500">-40%</p>
                <p className="text-xs text-emerald-400">Após intervenções</p>
              </div>
              <TrendingDown className="h-10 w-10 text-emerald-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="patterns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="patterns">Análise de Padrões</TabsTrigger>
          <TabsTrigger value="incidents">Histórico</TabsTrigger>
          <TabsTrigger value="prediction">Previsões</TabsTrigger>
          <TabsTrigger value="actions">Ações Recomendadas</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Padrão Principal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Padrão Principal Detectado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <h4 className="font-bold text-lg text-amber-500">{patternAnalysis.mainPattern}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {patternAnalysis.incidents} incidentes com {patternAnalysis.correlation}% de correlação
                  </p>
                </div>

                <div className="space-y-3">
                  <h5 className="font-medium text-sm">Causas Raiz Identificadas:</h5>
                  {patternAnalysis.rootCauses.map((cause, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{cause.cause}</span>
                        <span className="font-medium">{cause.percentage}%</span>
                      </div>
                      <Progress value={cause.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Distribuição por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Distribuição por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPie>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))" 
                      }}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {categoryDistribution.map((cat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-xs">{cat.name} ({cat.value}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tendência de Incidentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Tendência de Incidentes (2020-2025)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={incidentTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))" 
                    }}
                  />
                  <Bar dataKey="incidents" fill="#f59e0b" name="Total Incidentes" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="serious" fill="#ef4444" name="Lesões Sérias" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Lista de Incidentes */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Histórico de Incidentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {incidents.map((incident) => (
                      <div
                        key={incident.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedIncident.id === incident.id 
                            ? "ring-2 ring-primary bg-primary/5" 
                            : "hover:bg-muted/50"
                        } ${getSeverityColor(incident.severity)}`}
                        onClick={() => setSelectedIncident(incident)}
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {incident.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{incident.date}</span>
                        </div>
                        <p className="font-medium mt-1">{incident.category}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {incident.location}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Detalhes do Incidente */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Detalhes: {selectedIncident.category}
                  </CardTitle>
                  <Badge className={getSeverityColor(selectedIncident.severity)}>
                    {selectedIncident.severity === "high" ? "Alta" : selectedIncident.severity === "medium" ? "Média" : "Baixa"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Data</p>
                    <p className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {selectedIncident.date}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Local</p>
                    <p className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {selectedIncident.location}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-2">Causa Identificada:</p>
                  <p className="font-medium">{selectedIncident.cause}</p>
                </div>

                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-sm text-amber-500 font-medium flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Análise IA
                  </p>
                  <p className="text-sm mt-2">
                    Este incidente faz parte de um padrão recorrente relacionado a 
                    <strong> condições úmidas</strong>. A IA identificou 100% de correlação 
                    com água/umidade como causa raiz principal.
                  </p>
                </div>

                {selectedIncident.recurrence && (
                  <Badge variant="destructive" className="w-full justify-center py-2">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Padrão Recorrente Detectado
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="prediction" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Previsão para 2025
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                    <p className="text-xs text-muted-foreground">Incidentes Esperados</p>
                    <p className="text-3xl font-bold text-red-500">{patternAnalysis.prediction.expectedIncidents}</p>
                    <p className="text-xs text-red-400">sem intervenção</p>
                  </div>
                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                    <p className="text-xs text-muted-foreground">Prob. Lesão Séria</p>
                    <p className="text-3xl font-bold text-amber-500">{patternAnalysis.prediction.seriousInjuryProbability}%</p>
                    <p className="text-xs text-amber-400">se padrão continuar</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Custo Estimado (sem intervenção):</p>
                  <p className="text-2xl font-bold text-red-500">
                    ${patternAnalysis.prediction.estimatedCost.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Inclui: tratamento médico, tempo perdido, substituição, processos
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Mapa de Risco por Local
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" dataKey="x" name="X" stroke="hsl(var(--muted-foreground))" hide />
                    <YAxis type="number" dataKey="y" name="Y" stroke="hsl(var(--muted-foreground))" hide />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))" 
                      }}
                      formatter={(value: number, name: string, props: any) => [
                        `${props.payload.incidents} incidentes`,
                        props.payload.location
                      ]}
                    />
                    <Scatter 
                      data={locationHeatmap} 
                      fill="#ef4444"
                    >
                      {locationHeatmap.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.incidents > 5 ? "#ef4444" : entry.incidents > 3 ? "#f59e0b" : "#10b981"}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-xs">Alto risco (&gt;5)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-xs">Médio (3-5)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs">Baixo (&lt;3)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Ações Recomendadas pela IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patternAnalysis.recommendations.map((rec, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      rec.priority === 1 
                        ? "bg-emerald-500/10 border-emerald-500/20" 
                        : "bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={rec.priority === 1 ? "default" : "outline"}
                          className={rec.priority === 1 ? "bg-emerald-500" : ""}
                        >
                          Prioridade {rec.priority}
                        </Badge>
                        <p className="font-medium">{rec.action}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${rec.cost.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">ROI: {rec.roi}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <h4 className="font-medium text-blue-500 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Resultado Esperado
                </h4>
                <p className="text-sm mt-2">
                  Implementando as 3 ações recomendadas (custo total: $40k), espera-se uma 
                  <strong className="text-emerald-500"> redução de 85% nos incidentes de escorregão</strong>.
                  Comparado ao custo potencial de $200k por lesão grave, o ROI é de 
                  <strong className="text-emerald-500"> 400%</strong>.
                </p>
              </div>

              <div className="flex gap-4 mt-6">
                <Button className="flex-1">
                  Aprovar Todas as Ações
                </Button>
                <Button variant="outline" className="flex-1">
                  Gerar Relatório Completo
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
