/**
 * ESG Command Center - Premium Dashboard
 * Centro de comando avançado para monitoramento ESG e gestão de emissões
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Leaf, Factory, Globe, Droplets, Zap, BarChart3, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle2, Target, Activity, Ship, Fuel, Wind,
  Thermometer, Cloud, Brain, Sparkles, RefreshCw, Download, FileText,
  Send, Bot, Shield, Bell, Eye, ArrowUpRight, ArrowDownRight, Award,
  PieChart, LineChart as LineChartIcon, Gauge, AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";

// Types
interface EmissionsMetrics {
  totalCO2: number;
  targetCO2: number;
  reduction: number;
  fleetCII: string;
  ciiTrend: "improving" | "stable" | "declining";
  sox: number;
  nox: number;
  eexiCompliance: number;
  seempScore: number;
  sustainabilityScore: number;
}

interface VesselEmission {
  id: string;
  name: string;
  co2: number;
  sox: number;
  nox: number;
  cii: string;
  trend: "up" | "down" | "stable";
  efficiency: number;
  fuelConsumption: number;
}

interface ComplianceItem {
  id: string;
  regulation: string;
  status: "compliant" | "pending" | "at_risk" | "non_compliant";
  deadline: string;
  progress: number;
  actions: number;
}

interface AIInsight {
  id: string;
  type: "warning" | "opportunity" | "achievement" | "prediction";
  title: string;
  description: string;
  impact: string;
  confidence: number;
  action?: string;
}

// Mock data
const metrics: EmissionsMetrics = {
  totalCO2: 12450,
  targetCO2: 15000,
  reduction: 17,
  fleetCII: "B",
  ciiTrend: "improving",
  sox: 245,
  nox: 890,
  eexiCompliance: 100,
  seempScore: 94,
  sustainabilityScore: 87,
};

const vesselEmissions: VesselEmission[] = [
  { id: "1", name: "MV Atlântico Sul", co2: 3200, sox: 45, nox: 120, cii: "A", trend: "down", efficiency: 94, fuelConsumption: 12.5 },
  { id: "2", name: "MV Pacífico Norte", co2: 2800, sox: 38, nox: 98, cii: "B", trend: "stable", efficiency: 88, fuelConsumption: 10.8 },
  { id: "3", name: "PSV Oceano Azul", co2: 2100, sox: 28, nox: 75, cii: "A", trend: "down", efficiency: 92, fuelConsumption: 8.2 },
  { id: "4", name: "AHTS Maré Alta", co2: 4350, sox: 62, nox: 185, cii: "C", trend: "up", efficiency: 76, fuelConsumption: 18.4 },
];

const complianceItems: ComplianceItem[] = [
  { id: "1", regulation: "IMO 2020 Sulfur Cap", status: "compliant", deadline: "2025-01-01", progress: 100, actions: 0 },
  { id: "2", regulation: "MARPOL Annex VI", status: "compliant", deadline: "2025-06-30", progress: 100, actions: 0 },
  { id: "3", regulation: "EU MRV Reporting", status: "pending", deadline: "2025-03-31", progress: 75, actions: 3 },
  { id: "4", regulation: "CII Rating Target", status: "compliant", deadline: "2025-12-31", progress: 85, actions: 2 },
  { id: "5", regulation: "EEXI Compliance", status: "compliant", deadline: "2025-01-01", progress: 100, actions: 0 },
  { id: "6", regulation: "EU ETS Phase", status: "at_risk", deadline: "2025-06-01", progress: 45, actions: 5 },
];

const aiInsights: AIInsight[] = [
  {
    id: "1",
    type: "warning",
    title: "AHTS Maré Alta - CII Degradação",
    description: "Tendência de consumo indica risco de rebaixamento para rating D em 60 dias",
    impact: "Rating CII",
    confidence: 88,
    action: "Otimizar Rota",
  },
  {
    id: "2",
    type: "opportunity",
    title: "Economia de Combustível",
    description: "Ajuste de velocidade em 3 embarcações pode reduzir 8% do consumo",
    impact: "-R$ 125k/mês",
    confidence: 92,
    action: "Implementar",
  },
  {
    id: "3",
    type: "achievement",
    title: "Meta CO₂ Superada",
    description: "Frota atingiu 17% de redução vs meta de 15%",
    impact: "+2% vs meta",
    confidence: 100,
  },
  {
    id: "4",
    type: "prediction",
    title: "Projeção Trimestral",
    description: "Modelo prevê manutenção do rating B+ se mantiver operação atual",
    impact: "CII B+",
    confidence: 85,
  },
];

const monthlyEmissionsData = [
  { month: "Jan", co2: 2100, sox: 42, nox: 145, target: 2500 },
  { month: "Fev", co2: 1950, sox: 38, nox: 132, target: 2450 },
  { month: "Mar", co2: 2200, sox: 45, nox: 158, target: 2400 },
  { month: "Abr", co2: 1850, sox: 35, nox: 125, target: 2350 },
  { month: "Mai", co2: 2050, sox: 40, nox: 140, target: 2300 },
  { month: "Jun", co2: 1900, sox: 36, nox: 128, target: 2250 },
];

const esgRadarData = [
  { subject: "Emissões CO₂", A: 92, fullMark: 100 },
  { subject: "SOx/NOx", A: 88, fullMark: 100 },
  { subject: "Eficiência", A: 85, fullMark: 100 },
  { subject: "Resíduos", A: 90, fullMark: 100 },
  { subject: "Compliance", A: 94, fullMark: 100 },
  { subject: "Reportes", A: 86, fullMark: 100 },
];

const ciiDistribution = [
  { rating: "A", count: 2, color: "#22c55e" },
  { rating: "B", count: 3, color: "#84cc16" },
  { rating: "C", count: 1, color: "#eab308" },
  { rating: "D", count: 0, color: "#f97316" },
  { rating: "E", count: 0, color: "#ef4444" },
];

export function ESGCommandCenter() {
  const [selectedVessel, setSelectedVessel] = useState("all");
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", content: "Olá! Sou o consultor ESG IA. Posso analisar emissões, compliance regulatório e recomendar ações de sustentabilidade. Como posso ajudar?" },
  ]);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    setChatHistory(prev => [
      ...prev,
      { role: "user", content: chatMessage },
      { role: "assistant", content: "Analisando dados ambientais... Identifiquei que a embarcação AHTS Maré Alta apresenta consumo 23% acima do benchmark. Recomendo auditoria de motores e ajuste de perfil operacional." },
    ]);
    setChatMessage("");
  };

  const getCIIColor = (rating: string) => {
    switch (rating) {
      case "A": return "bg-green-500";
      case "B": return "bg-lime-500";
      case "C": return "bg-yellow-500";
      case "D": return "bg-orange-500";
      case "E": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "at_risk": return "bg-orange-500";
      case "non_compliant": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "warning": return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "opportunity": return <Zap className="h-4 w-4 text-blue-500" />;
      case "achievement": return <Award className="h-4 w-4 text-green-500" />;
      case "prediction": return <Brain className="h-4 w-4 text-purple-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Command Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
            <Leaf className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              ESG Command Center
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
                <Sparkles className="h-3 w-3 mr-1" />
                PREMIUM
              </Badge>
            </h2>
            <p className="text-sm text-muted-foreground">
              Monitoramento ambiental, compliance IMO/MARPOL e sustentabilidade
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedVessel} onValueChange={setSelectedVessel}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecionar embarcação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toda a Frota</SelectItem>
              {vesselEmissions.map((v) => (
                <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Relatório ESG
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-all">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">CO₂ Total</p>
                  <p className="text-2xl font-bold">{(metrics.totalCO2 / 1000).toFixed(1)}k t</p>
                  <div className="flex items-center text-xs text-green-600">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    -{metrics.reduction}% vs meta
                  </div>
                </div>
                <Factory className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="border-l-4 border-l-lime-500 hover:shadow-lg transition-all">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">CII Frota</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-lg ${getCIIColor(metrics.fleetCII)} flex items-center justify-center text-white font-bold text-xl`}>
                      {metrics.fleetCII}
                    </div>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                </div>
                <Gauge className="h-8 w-8 text-lime-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">SOx</p>
                  <p className="text-2xl font-bold">{metrics.sox} t</p>
                  <p className="text-xs text-muted-foreground">0.5% limite</p>
                </div>
                <Droplets className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-all">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">NOx</p>
                  <p className="text-2xl font-bold">{metrics.nox} t</p>
                  <p className="text-xs text-muted-foreground">Tier III</p>
                </div>
                <Cloud className="h-8 w-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-l-4 border-l-emerald-500 hover:shadow-lg transition-all">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">EEXI</p>
                  <p className="text-2xl font-bold text-emerald-600">{metrics.eexiCompliance}%</p>
                  <Badge className="bg-green-500/10 text-green-600 text-xs">Conforme</Badge>
                </div>
                <Zap className="h-8 w-8 text-emerald-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="border-l-4 border-l-primary hover:shadow-lg transition-all">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Score ESG</p>
                  <p className="text-2xl font-bold">{metrics.sustainabilityScore}/100</p>
                  <div className="flex items-center text-xs text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +3 pontos
                  </div>
                </div>
                <Target className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Vessel Emissions & Compliance */}
        <div className="space-y-6">
          {/* Vessel Emissions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Ship className="h-5 w-5 text-primary" />
                Emissões por Embarcação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[280px]">
                <div className="space-y-3">
                  {vesselEmissions.map((vessel) => (
                    <div
                      key={vessel.id}
                      className="p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{vessel.name}</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded ${getCIIColor(vessel.cii)} flex items-center justify-center text-white font-bold text-xs`}>
                            {vessel.cii}
                          </div>
                          {vessel.trend === "down" ? (
                            <TrendingDown className="h-4 w-4 text-green-500" />
                          ) : vessel.trend === "up" ? (
                            <TrendingUp className="h-4 w-4 text-red-500" />
                          ) : (
                            <Activity className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">CO₂</span>
                          <p className="font-semibold">{vessel.co2}t</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">SOx</span>
                          <p className="font-semibold">{vessel.sox}t</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">NOx</span>
                          <p className="font-semibold">{vessel.nox}t</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Eficiência</span>
                          <p className={`font-semibold ${vessel.efficiency >= 90 ? "text-green-600" : vessel.efficiency >= 80 ? "text-yellow-600" : "text-red-600"}`}>
                            {vessel.efficiency}%
                          </p>
                        </div>
                      </div>
                      <Progress value={vessel.efficiency} className="h-1 mt-2" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Compliance Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-primary" />
                Status de Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {complianceItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(item.status)}`} />
                        <span className="text-sm">{item.regulation}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.actions > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {item.actions} ações
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">{item.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Center Column - Charts */}
        <div className="space-y-6">
          {/* Emissions Trend */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <LineChartIcon className="h-5 w-5 text-primary" />
                Tendência de Emissões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={monthlyEmissionsData}>
                  <defs>
                    <linearGradient id="colorCO2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
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
                  <Area type="monotone" dataKey="co2" stroke="#22c55e" fillOpacity={1} fill="url(#colorCO2)" name="CO₂ (t)" />
                  <Line type="monotone" dataKey="target" stroke="#ef4444" strokeDasharray="5 5" name="Meta" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* ESG Radar */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-primary" />
                Performance ESG
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={esgRadarData}>
                  <PolarGrid strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="subject" className="text-xs" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-xs" />
                  <Radar name="Performance" dataKey="A" stroke="#22c55e" fill="#22c55e" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - AI Insights & Chat */}
        <div className="space-y-6">
          {/* AI Insights */}
          <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="h-5 w-5 text-green-500" />
                Insights IA
                <Badge variant="secondary" className="ml-auto">
                  <Sparkles className="h-3 w-3 mr-1" />
                  GPT-4
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[250px]">
                <div className="space-y-3">
                  {aiInsights.map((insight) => (
                    <div
                      key={insight.id}
                      className="p-3 rounded-lg border bg-background/50 hover:bg-background/80 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{insight.title}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {insight.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {insight.impact}
                            </Badge>
                            {insight.action && (
                              <Button size="sm" variant="outline" className="h-6 text-xs">
                                {insight.action}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* AI Consultant */}
          <Card className="bg-gradient-to-br from-emerald-500/5 to-green-500/5 border-emerald-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bot className="h-5 w-5 text-emerald-500" />
                Consultor ESG IA
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 ml-auto">
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
                            ? "bg-emerald-500 text-white"
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
                  placeholder="Pergunte sobre emissões, compliance, ESG..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button size="icon" onClick={handleSendMessage} className="bg-emerald-500 hover:bg-emerald-600">
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

export default ESGCommandCenter;
