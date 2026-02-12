/**
 * Travel Command Dashboard - Premium Experience
 * Central de comando avançada para gestão de viagens e mobilidade de tripulação
 */

import React, { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Plane, Hotel, Car, Ship, Users, Calendar, Clock, MapPin,
  AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, DollarSign,
  Leaf, Brain, Sparkles, RefreshCw, Download, Plus, Search,
  Globe, Navigation, Target, Activity, BarChart3, PieChart,
  Send, Bot, Zap, Shield, Bell, Eye, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// Types
interface TripMetrics {
  totalTrips: number;
  activeTrips: number;
  completedTrips: number;
  delayedFlights: number;
  totalCost: number;
  costSavings: number;
  carbonFootprint: number;
  carbonReduction: number;
  onTimeRate: number;
  satisfactionScore: number;
}

interface FlightAlert {
  id: string;
  type: "delay" | "cancellation" | "gate_change" | "boarding";
  severity: "low" | "medium" | "high" | "critical";
  flight: string;
  crewMember: string;
  message: string;
  time: string;
}

interface AIRecommendation {
  id: string;
  type: "cost_saving" | "route_optimization" | "carbon_reduction" | "schedule";
  title: string;
  description: string;
  impact: string;
  confidence: number;
  action: string;
}

// Mock data for premium dashboard
const metrics: TripMetrics = {
  totalTrips: 156,
  activeTrips: 23,
  completedTrips: 127,
  delayedFlights: 4,
  totalCost: 485000,
  costSavings: 42500,
  carbonFootprint: 12450,
  carbonReduction: 18,
  onTimeRate: 94.2,
  satisfactionScore: 4.7,
};

const flightAlerts: FlightAlert[] = [
  {
    id: "1",
    type: "delay",
    severity: "high",
    flight: "LA3421",
    crewMember: "Carlos Silva",
    message: "Voo atrasado 2h - Nova previsão: 10:30",
    time: "5 min atrás",
  },
  {
    id: "2",
    type: "gate_change",
    severity: "medium",
    flight: "G3 1045",
    crewMember: "Ana Santos",
    message: "Mudança de portão: A15 → B22",
    time: "12 min atrás",
  },
  {
    id: "3",
    type: "boarding",
    severity: "low",
    flight: "AD4521",
    crewMember: "Roberto Lima",
    message: "Embarque iniciado - Portão C8",
    time: "20 min atrás",
  },
];

const aiRecommendations: AIRecommendation[] = [
  {
    id: "1",
    type: "cost_saving",
    title: "Otimização de Tarifas Aéreas",
    description: "Reserva antecipada de 14 dias pode economizar R$ 12.400 nos próximos voos para Macaé",
    impact: "-15% custo",
    confidence: 92,
    action: "Aplicar",
  },
  {
    id: "2",
    type: "carbon_reduction",
    title: "Rota de Baixo Carbono",
    description: "Voo direto GIG→MCE disponível - reduz 45kg CO₂ vs conexão atual",
    impact: "-45kg CO₂",
    confidence: 88,
    action: "Alterar Rota",
  },
  {
    id: "3",
    type: "schedule",
    title: "Consolidação de Transfers",
    description: "3 tripulantes com embarque similar - consolidar transfer economiza R$ 850",
    impact: "-R$ 850",
    confidence: 95,
    action: "Consolidar",
  },
];

const monthlyTrendData = [
  { month: "Jan", viagens: 45, custo: 125000, carbono: 3200 },
  { month: "Fev", viagens: 52, custo: 142000, carbono: 3500 },
  { month: "Mar", viagens: 48, custo: 138000, carbono: 3100 },
  { month: "Abr", viagens: 61, custo: 165000, carbono: 4100 },
  { month: "Mai", viagens: 55, custo: 152000, carbono: 3800 },
  { month: "Jun", viagens: 58, custo: 158000, carbono: 3600 },
];

const tripTypeDistribution = [
  { name: "Mobilização", value: 45, color: "hsl(var(--chart-1))" },
  { name: "Desmobilização", value: 38, color: "hsl(var(--chart-2))" },
  { name: "Treinamento", value: 12, color: "hsl(var(--chart-3))" },
  { name: "Administrativo", value: 5, color: "hsl(var(--chart-4))" },
];

const routePerformance = [
  { route: "GIG → MCE", trips: 78, onTime: 96, avgCost: 2450, carbon: 89 },
  { route: "GRU → MCE", trips: 45, onTime: 92, avgCost: 2180, carbon: 95 },
  { route: "VCP → MCE", trips: 32, onTime: 98, avgCost: 1890, carbon: 62 },
  { route: "SSA → MCE", trips: 18, onTime: 88, avgCost: 3200, carbon: 145 },
];

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

const TravelCommandDashboard: React.FC = () => {
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", content: "Olá! Sou o assistente de viagens IA. Posso ajudar com otimização de rotas, análise de custos e recomendações de economia. Como posso ajudar?" },
  ]);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    setChatHistory(prev => [
      ...prev,
      { role: "user", content: chatMessage },
      { role: "assistant", content: "Analisando sua solicitação... Com base nos dados atuais, identifiquei 3 oportunidades de otimização para viagens à Bacia de Santos. Posso detalhar?" },
    ]);
    setChatMessage("");
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-destructive text-destructive-foreground";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Command Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
            <Navigation className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Travel Command Center
              <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500">
                <Sparkles className="h-3 w-3 mr-1" />
                PREMIUM
              </Badge>
            </h2>
            <p className="text-sm text-muted-foreground">
              Gestão inteligente de viagens e mobilidade de tripulação
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { window.location.reload(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            const csv = "Mês,Viagens,Custo,Carbono\n" + monthlyTrendData.map(d => `${d.month},${d.viagens},${d.custo},${d.carbono}`).join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = "travel-command-export.csv"; a.click();
            URL.revokeObjectURL(url);
            toast.success("Relatório exportado", { description: "Arquivo CSV gerado com sucesso." });
          }}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground" onClick={() => toast.success("Para criar nova viagem, use a aba Passagens ou Hotéis abaixo.")}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Viagem
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Viagens Ativas</p>
                  <p className="text-2xl font-bold text-blue-600">{metrics.activeTrips}</p>
                  <p className="text-xs text-muted-foreground">de {metrics.totalTrips} total</p>
                </div>
                <Plane className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className={`border-l-4 hover:shadow-lg transition-all ${metrics.delayedFlights > 0 ? "border-l-orange-500 bg-orange-50 dark:bg-orange-950/20" : "border-l-green-500"}`}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Voos Atrasados</p>
                  <p className={`text-2xl font-bold ${metrics.delayedFlights > 0 ? "text-orange-600" : "text-green-600"}`}>
                    {metrics.delayedFlights}
                  </p>
                  <p className="text-xs text-muted-foreground">{metrics.onTimeRate}% pontualidade</p>
                </div>
                <AlertTriangle className={`h-8 w-8 opacity-50 ${metrics.delayedFlights > 0 ? "text-orange-500" : "text-green-500"}`} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-all">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Custo Total</p>
                  <p className="text-2xl font-bold">R$ {(metrics.totalCost / 1000).toFixed(0)}k</p>
                  <div className="flex items-center text-xs text-green-600">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    {formatCurrency(metrics.costSavings)} economia
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="border-l-4 border-l-emerald-500 hover:shadow-lg transition-all">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">CO₂ Emitido</p>
                  <p className="text-2xl font-bold">{(metrics.carbonFootprint / 1000).toFixed(1)}t</p>
                  <div className="flex items-center text-xs text-emerald-600">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    -{metrics.carbonReduction}% vs meta
                  </div>
                </div>
                <Leaf className="h-8 w-8 text-emerald-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-all">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Satisfação</p>
                  <p className="text-2xl font-bold">{metrics.satisfactionScore}/5</p>
                  <div className="flex items-center text-xs text-purple-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +0.3 este mês
                  </div>
                </div>
                <Target className="h-8 w-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="border-l-4 border-l-cyan-500 hover:shadow-lg transition-all">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Concluídas</p>
                  <p className="text-2xl font-bold text-cyan-600">{metrics.completedTrips}</p>
                  <p className="text-xs text-muted-foreground">este mês</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-cyan-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Alerts & AI */}
        <div className="space-y-6">
          {/* Flight Alerts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5 text-orange-500" />
                Alertas em Tempo Real
                {flightAlerts.length > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {flightAlerts.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-3">
                  {flightAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${getAlertColor(alert.severity)}`}>
                          <Plane className="h-3 w-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{alert.flight}</span>
                            <span className="text-xs text-muted-foreground">• {alert.crewMember}</span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {alert.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast(`Alerta: ${alert.flight}`, { description: alert.message, duration: 5000 })}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="h-5 w-5 text-primary" />
                Recomendações IA
                <Badge variant="secondary" className="ml-auto">
                  <Sparkles className="h-3 w-3 mr-1" />
                  GPT-4
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {aiRecommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-lg border bg-background/50 hover:bg-background/80 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{rec.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {rec.confidence}% confiança
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {rec.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                            {rec.impact}
                          </Badge>
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toast.success(`${rec.action}`, { description: `${rec.title}: economia estimada de ${rec.impact}. Recomendação aplicada com sucesso.` })}>
                             {rec.action}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center Column - Charts */}
        <div className="space-y-6">
          {/* Monthly Trend */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
                Tendência Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={monthlyTrendData}>
                  <defs>
                    <linearGradient id="colorViagens" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="viagens"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorViagens)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Trip Type Distribution */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <PieChart className="h-5 w-5 text-primary" />
                Tipos de Viagem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPie>
                  <Pie
                    data={tripTypeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {tripTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </RechartsPie>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Routes & AI Chat */}
        <div className="space-y-6">
          {/* Route Performance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5 text-primary" />
                Performance por Rota
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {routePerformance.map((route, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{route.route}</span>
                      <Badge variant="outline">{route.trips} viagens</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Pontualidade</span>
                        <p className={`font-semibold ${route.onTime >= 95 ? "text-green-600" : route.onTime >= 90 ? "text-yellow-600" : "text-red-600"}`}>
                          {route.onTime}%
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Custo Médio</span>
                        <p className="font-semibold">R$ {route.avgCost}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">CO₂ (kg)</span>
                        <p className="font-semibold">{route.carbon}</p>
                      </div>
                    </div>
                    <Progress value={route.onTime} className="h-1 mt-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Assistant */}
          <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bot className="h-5 w-5 text-blue-500" />
                Assistente de Viagem IA
                <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 ml-auto">
                  Online
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[150px] mb-4 p-3 bg-background/50 rounded-lg">
                <div className="space-y-3">
                  {chatHistory.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-lg text-sm ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex gap-2">
                <Input
                  placeholder="Pergunte sobre rotas, custos, otimização..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button size="icon" onClick={handleSendMessage} className="bg-blue-500 hover:bg-blue-600">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TravelCommandDashboard;
