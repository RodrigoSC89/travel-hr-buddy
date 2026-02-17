/**
 * ESG Command Center - Premium Dashboard
 * Integrado com dados CII reais do Supabase + AI Chat funcional
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Leaf, Factory, Globe, Droplets, Zap, TrendingUp, TrendingDown,
  AlertTriangle, Target, Activity, Ship, Brain, Sparkles, RefreshCw, Download,
  Send, Bot, Shield, ArrowDownRight, Award, Gauge, Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, LineChart, Line, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { useFleetCIIData, type VesselCIIData } from "@/hooks/use-cii-data";
import { supabase } from "@/integrations/supabase/client";

const CII_COLORS: Record<string, string> = {
  A: "#22c55e", B: "#84cc16", C: "#eab308", D: "#f97316", E: "#ef4444"
};

export function ESGCommandCenter() {
  const [selectedVessel, setSelectedVessel] = useState("all");
  const [chatMessage, setChatMessage] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", content: "Olá! Sou o consultor ESG IA. Posso analisar emissões, compliance regulatório e recomendar ações de sustentabilidade. Como posso ajudar?" },
  ]);

  const { data: ciiData, isLoading, error, refetch } = useFleetCIIData();
  const stats = ciiData?.stats;
  const vessels = ciiData?.vessels || [];

  const filteredVessels = selectedVessel === "all" 
    ? vessels 
    : vessels.filter(v => v.vesselId === selectedVessel);

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || isChatLoading) return;
    const userMsg = chatMessage;
    setChatMessage("");
    setChatHistory(prev => [...prev, { role: "user", content: userMsg }]);
    setIsChatLoading(true);

    try {
      const context = stats
        ? `Frota: ${stats.totalVessels} embarcações, CO₂ total: ${stats.totalCO2}t, CII médio: ${stats.avgCII}, Distribuição: A=${stats.ratingDistribution.A} B=${stats.ratingDistribution.B} C=${stats.ratingDistribution.C} D=${stats.ratingDistribution.D} E=${stats.ratingDistribution.E}`
        : 'Dados ESG indisponíveis';

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { message: userMsg, context, agentId: 'safety-officer' }
      });

      setChatHistory(prev => [...prev, {
        role: "assistant",
        content: error
          ? "Desculpe, não foi possível processar. Tente novamente."
          : (data?.reply || "Sem resposta do servidor."),
      }]);
    } catch {
      setChatHistory(prev => [...prev, {
        role: "assistant",
        content: "Erro de conexão. Verifique sua rede e tente novamente.",
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const getCIIColor = (rating: string) => CII_COLORS[rating] || "#6b7280";
  const getCIIBg = (rating: string) => {
    const map: Record<string, string> = {
      A: "bg-success", B: "bg-success/80", C: "bg-warning", D: "bg-warning/80", E: "bg-destructive"
    };
    return map[rating] || "bg-muted-foreground";
  };

  // Build chart data from real vessels
  const ciiDistribution = Object.entries(stats?.ratingDistribution || { A: 0, B: 0, C: 0, D: 0, E: 0 })
    .map(([rating, count]) => ({ rating, count, color: CII_COLORS[rating] || "#6b7280" }));

  const esgRadarData = [
    { subject: "Emissões CO₂", A: stats ? Math.min(100, Math.round((1 - (stats.nonCompliantVessels / Math.max(1, stats.totalVessels))) * 100)) : 0, fullMark: 100 },
    { subject: "CII Rating", A: stats ? Math.round(((stats.compliantVessels) / Math.max(1, stats.totalVessels)) * 100) : 0, fullMark: 100 },
    { subject: "Eficiência", A: stats ? Math.min(100, Math.round(stats.avgCII > 0 ? 85 : 0)) : 0, fullMark: 100 },
    { subject: "MARPOL", A: 90, fullMark: 100 },
    { subject: "Compliance", A: stats ? Math.round(((stats.compliantVessels + stats.warningVessels) / Math.max(1, stats.totalVessels)) * 100) : 0, fullMark: 100 },
    { subject: "Reportes", A: 75, fullMark: 100 },
  ];

  // Determine fleet CII letter
  const fleetRating = stats
    ? (['A', 'B', 'C', 'D', 'E'] as const).reduce((best, r) =>
        (stats.ratingDistribution[r] || 0) > (stats.ratingDistribution[best] || 0) ? r : best, 'C' as 'A' | 'B' | 'C' | 'D' | 'E')
    : 'C';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={`esg-skeleton-${i}`} className="h-24" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados ESG</h3>
        <p className="text-muted-foreground mb-4">{(error as Error).message}</p>
        <Button onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Command Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-success to-success/80 rounded-xl shadow-lg">
            <Leaf className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              ESG Command Center
              <Badge className="bg-gradient-to-r from-success to-success/80">
                <Sparkles className="h-3 w-3 mr-1" />
                LIVE DATA
              </Badge>
            </h2>
            <p className="text-sm text-muted-foreground">
              Dados CII reais • Compliance IMO/MARPOL • IA Integrada
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedVessel} onValueChange={setSelectedVessel}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecionar embarcação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toda a Frota ({stats?.totalVessels || 0})</SelectItem>
              {vessels.map((v) => (
                <SelectItem key={v.vesselId} value={v.vesselId}>{v.vesselName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Relatório ESG
          </Button>
        </div>
      </div>

      {/* KPI Cards - Real Data */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-all">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">CO₂ Total</p>
                  <p className="text-2xl font-bold">
                    {stats?.totalCO2 ? `${(stats.totalCO2 / 1000).toFixed(1)}k t` : '—'}
                  </p>
                   <div className="flex items-center text-xs text-success">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    Dados reais
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
                    <div className={`w-10 h-10 rounded-lg ${getCIIBg(fleetRating)} flex items-center justify-center text-white font-bold text-xl`}>
                      {fleetRating}
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
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Conformes</p>
                  <p className="text-2xl font-bold text-success">{stats?.compliantVessels || 0}</p>
                  <p className="text-xs text-muted-foreground">de {stats?.totalVessels || 0} navios</p>
                </div>
                <Droplets className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-all">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Em Risco</p>
                  <p className="text-2xl font-bold text-warning">
                    {(stats?.warningVessels || 0) + (stats?.nonCompliantVessels || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">D/E rating</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-l-4 border-l-emerald-500 hover:shadow-lg transition-all">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">CII Médio</p>
                   <p className="text-2xl font-bold text-success">{stats?.avgCII?.toFixed(1) || '—'}</p>
                  <Badge className="bg-success/10 text-success text-xs">gCO₂/DWT·nm</Badge>
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
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Embarcações</p>
                  <p className="text-2xl font-bold">{stats?.totalVessels || 0}</p>
                  <div className="flex items-center text-xs text-success">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Monitoradas
                  </div>
                </div>
                <Ship className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Vessel Emissions */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Ship className="h-5 w-5 text-primary" />
                CII por Embarcação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[280px]">
                <div className="space-y-3">
                  {filteredVessels.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Ship className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma embarcação encontrada</p>
                    </div>
                  ) : (
                    filteredVessels.map((vessel) => (
                      <VesselCIICard key={vessel.vesselId} vessel={vessel} getCIIBg={getCIIBg} />
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* CII Distribution Pie */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-primary" />
                Distribuição CII
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPie>
                  <Pie
                    data={ciiDistribution.filter(d => d.count > 0)}
                    cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                    dataKey="count" nameKey="rating" label={({ rating, count }) => `${rating}: ${count}`}
                  >
                    {ciiDistribution.filter(d => d.count > 0).map((entry) => (
                      <Cell key={entry.rating} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Center Column - Charts */}
        <div className="space-y-6">
          {/* Vessel CII Bar Chart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-primary" />
                CII Attained vs Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={filteredVessels.map(v => ({
                  name: v.vesselName.split(' ').pop() || v.vesselName,
                  attained: v.currentCII,
                  required: v.requiredCII,
                }))}>
                  <defs>
                    <linearGradient id="colorCII" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Area type="monotone" dataKey="attained" stroke="hsl(var(--success))" fillOpacity={1} fill="url(#colorCII)" name="CII Real" />
                  <Line type="monotone" dataKey="required" stroke="hsl(var(--destructive))" strokeDasharray="5 5" name="CII Requerido" />
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
                  <Radar name="Performance" dataKey="A" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - AI Chat */}
        <div className="space-y-6">
          {/* Fleet Summary */}
          <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-green-500" />
                Resumo da Frota
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {['A', 'B', 'C', 'D', 'E'].map(rating => {
                const count = stats?.ratingDistribution[rating] || 0;
                const pct = stats ? (count / Math.max(1, stats.totalVessels)) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded ${getCIIBg(rating)} flex items-center justify-center text-white font-bold text-sm`}>
                      {rating}
                    </div>
                    <div className="flex-1">
                      <Progress value={pct} className="h-2" />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* AI Consultant */}
          <Card className="bg-gradient-to-br from-emerald-500/5 to-green-500/5 border-emerald-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bot className="h-5 w-5 text-emerald-500" />
                Consultor ESG IA
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 ml-auto">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px] mb-4 p-3 bg-background/50 rounded-lg">
                <div className="space-y-3">
                  {chatHistory.map((msg, i) => (
                    <div key={`esg-chat-${i}`} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
                        msg.role === "user" ? "bg-emerald-500 text-white" : "bg-muted"
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-3 rounded-lg flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                        <span className="text-sm text-muted-foreground">Analisando...</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="flex gap-2">
                <Input
                  placeholder="Pergunte sobre emissões, CII, compliance..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                  disabled={isChatLoading}
                />
                <Button size="icon" onClick={handleSendMessage} disabled={isChatLoading} className="bg-emerald-500 hover:bg-emerald-600" aria-label="Enviar mensagem" title="Enviar">
                  {isChatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function VesselCIICard({ vessel, getCIIBg }: { vessel: VesselCIIData; getCIIBg: (r: string) => string }) {
  return (
    <div className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm">{vessel.vesselName}</span>
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded ${getCIIBg(vessel.rating)} flex items-center justify-center text-white font-bold text-xs`}>
            {vessel.rating}
          </div>
          {vessel.trend === "improving" ? (
            <TrendingDown className="h-4 w-4 text-green-500" />
          ) : vessel.trend === "declining" ? (
            <TrendingUp className="h-4 w-4 text-red-500" />
          ) : (
            <Activity className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <span className="text-muted-foreground">CII</span>
          <p className="font-semibold">{vessel.currentCII.toFixed(1)}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Req.</span>
          <p className="font-semibold">{vessel.requiredCII.toFixed(1)}</p>
        </div>
        <div>
          <span className="text-muted-foreground">CO₂</span>
          <p className="font-semibold">{vessel.totalCO2 > 0 ? `${vessel.totalCO2.toFixed(0)}t` : '—'}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 mt-2">
        <Badge variant={vessel.complianceStatus === 'compliant' ? 'default' : vessel.complianceStatus === 'warning' ? 'secondary' : 'destructive'} className="text-xs">
          {vessel.complianceStatus === 'compliant' ? '✅ Conforme' : vessel.complianceStatus === 'warning' ? '⚠️ Atenção' : '❌ Não conforme'}
        </Badge>
        {vessel.vesselType && (
          <Badge variant="outline" className="text-xs">{vessel.vesselType}</Badge>
        )}
      </div>
    </div>
  );
}

export default ESGCommandCenter;
