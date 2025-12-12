/**
import { useCallback, useMemo, useEffect, useState } from "react";;
 * Fleet Command Center - Unified Fleet Module
 * Fusão de: Gestão de Frota, Fleet Dashboard, Fleet Tracking
 * Versão 192.0
 */

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Ship, Plus, RefreshCw, Brain, MapPin, Anchor, Fuel, Activity,
  AlertTriangle, CheckCircle, Navigation, Gauge, Waves, Clock,
  TrendingUp, BarChart3, Wrench, Route, Users
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from "recharts";

// ============ COMPONENTES INTEGRADOS ============

// KPI Card Component
const KPICard = ({ title, value, suffix = "", icon: Icon, color, change, trend, delay = 0 }: unknown: unknown: unknown) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
  >
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className={`absolute inset-0 bg-gradient-to-br from-${color}-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity`} />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <Icon className={`h-5 w-5 text-${color}-500`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold font-mono">{value}</span>
          {suffix && <span className="text-lg text-muted-foreground">{suffix}</span>}
        </div>
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className={`h-3 w-3 ${change >= 0 ? "text-green-500" : "text-red-500 rotate-180"}`} />
            <span className={`text-xs ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
              {change >= 0 ? "+" : ""}{change}%
            </span>
            {trend && <span className="text-xs text-muted-foreground ml-1">{trend}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

// Vessel Card Component (do Fleet Dashboard)
const VesselCard = ({ vessel, onClick }: { vessel: unknown: unknown: unknown; onClick: () => void }) => {
  const statusConfig: Record<string, { color: string; label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    operational: { color: "bg-green-500", label: "Operacional", variant: "default" },
    active: { color: "bg-green-500", label: "Ativa", variant: "default" },
    "in-port": { color: "bg-blue-500", label: "Em Porto", variant: "secondary" },
    anchored: { color: "bg-yellow-500", label: "Ancorada", variant: "secondary" },
    maintenance: { color: "bg-orange-500", label: "Manutenção", variant: "outline" },
    emergency: { color: "bg-red-500", label: "Emergência", variant: "destructive" }
  };

  const config = statusConfig[vessel.status] || statusConfig.operational;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{vessel.name}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {vessel.current_location || vessel.location || "Posição não informada"}
              </div>
            </div>
            <Badge variant={config.variant} className="gap-1">
              <div className={`h-2 w-2 rounded-full ${config.color} animate-pulse`} />
              {config.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Gauge className="h-3 w-3" />
                Velocidade
              </div>
              <p className="text-xl font-bold font-mono">{vessel.speed || 0} <span className="text-sm text-muted-foreground">kn</span></p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Fuel className="h-3 w-3" />
                Combustível
              </div>
              <p className="text-xl font-bold font-mono">{vessel.fuel || 85}<span className="text-sm text-muted-foreground">%</span></p>
            </div>
          </div>

          {vessel.efficiency && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Eficiência</span>
                <span className="text-xs font-bold font-mono">{vessel.efficiency}%</span>
              </div>
              <Progress value={vessel.efficiency} className="h-1.5" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2 border-t text-sm">
            <div className="flex items-center gap-2">
              <Ship className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">{vessel.vessel_type || "Cargo"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">{vessel.crew_count || 0} tripulantes</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Tracking Map Component (simplificado do vessel-tracking-map)
const TrackingMapPanel = ({ vessels, onSelectVessel, selectedVessel }: unknown: unknown: unknown) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[600px]">
      {/* Vessel List */}
      <div className="lg:col-span-1 space-y-3 overflow-y-auto">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Ship className="h-4 w-4" />
              Embarcações ({vessels.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-2">
            {vessels.map((vessel: unknown) => (
              <div
                key={vessel.id}
                className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                  selectedVessel?.id === vessel.id ? "ring-2 ring-primary bg-primary/5" : "border"
                }`}
                onClick={() => handleonSelectVessel}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{vessel.name}</span>
                  <Badge variant={vessel.status === "active" || vessel.status === "operational" ? "default" : "secondary"} className="text-xs">
                    {vessel.status === "active" || vessel.status === "operational" ? "Ativa" : vessel.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Navigation className="h-3 w-3" />
                    {vessel.speed || 0} kn
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {vessel.course || 0}°
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Map Placeholder */}
      <div className="lg:col-span-3 relative">
        <Card className="h-full">
          <CardContent className="h-full p-0">
            <div className="relative h-full bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg flex items-center justify-center">
              <div className="text-center space-y-4">
                <Waves className="h-20 w-20 mx-auto text-primary animate-pulse" />
                <div>
                  <h3 className="text-xl font-semibold">Mapa de Rastreamento</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Integração com sistema de rastreamento via satélite
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {vessels.slice(0, 4).map((v: unknown) => (
                    <Badge key={v.id} variant="outline" className="gap-1">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      {v.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur p-3 rounded-lg shadow-lg">
                <div className="text-sm font-medium mb-2">Legenda</div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /><span>Ativa</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500" /><span>Ancorada</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500" /><span>Manutenção</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /><span>Emergência</span></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// AI Copilot Component
const FleetAICopilot = ({ vessels }: { vessels: unknown[] }) => {
  const [query, setQuery] = useState("");
  const [thinking, setThinking] = useState(false);

  const insights = [
    { type: "success", icon: CheckCircle, text: `${vessels.filter(v => v.status === "active" || v.status === "operational").length} embarcações operacionais` },
    { type: "warning", icon: AlertTriangle, text: "2 manutenções preventivas pendentes" },
    { type: "info", icon: TrendingUp, text: "Eficiência média: 94.2%" }
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Fleet AI Copilot
        </CardTitle>
        <CardDescription>Assistente inteligente para operações</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Insights */}
        <div className="space-y-2">
          {insights.map((insight, i) => (
            <div key={i} className={`flex items-start gap-2 p-2 rounded-lg ${
              insight.type === "success" ? "bg-green-50 dark:bg-green-950/20" :
                insight.type === "warning" ? "bg-yellow-50 dark:bg-yellow-950/20" :
                  "bg-blue-50 dark:bg-blue-950/20"
            }`}>
              <insight.icon className={`h-4 w-4 mt-0.5 ${
                insight.type === "success" ? "text-green-600" :
                  insight.type === "warning" ? "text-yellow-600" :
                    "text-blue-600"
              }`} />
              <span className="text-sm">{insight.text}</span>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Ações Rápidas</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="justify-start">
              <Route className="h-3 w-3 mr-2" />
              Otimizar Rotas
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Fuel className="h-3 w-3 mr-2" />
              Análise Combustível
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Wrench className="h-3 w-3 mr-2" />
              Pred. Manutenção
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <BarChart3 className="h-3 w-3 mr-2" />
              Relatório
            </Button>
          </div>
        </div>

        {/* Chat Input */}
        <div className="pt-2 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Pergunte ao AI Copilot..."
              value={query}
              onChange={handleChange}
              className="text-sm"
            />
            <Button size="sm" disabled={!query.trim() || thinking}>
              {thinking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Mock data para gráficos
const fuelTrend = [
  { day: "Seg", consumption: 245, efficiency: 92 },
  { day: "Ter", consumption: 238, efficiency: 94 },
  { day: "Qua", consumption: 252, efficiency: 90 },
  { day: "Qui", consumption: 228, efficiency: 96 },
  { day: "Sex", consumption: 235, efficiency: 93 },
  { day: "Sáb", consumption: 242, efficiency: 91 },
  { day: "Dom", consumption: 230, efficiency: 95 }
];

const performanceMetrics = [
  { metric: "Eficiência", value: 93 },
  { metric: "Segurança", value: 96 },
  { metric: "Pontualidade", value: 89 },
  { metric: "Manutenção", value: 91 },
  { metric: "Tripulação", value: 94 },
  { metric: "Compliance", value: 97 }
];

// ============ COMPONENTE PRINCIPAL ============

export default function FleetCommandCenter() {
  const { toast } = useToast();
  const [vessels, setVessels] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState<unknown>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [newVessel, setNewVessel] = useState({ name: "", imo_number: "", vessel_type: "cargo", location: "" });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: vesselsData } = await supabase
        .from("vessels")
        .select("*")
        .order("name")
        .limit(50);
      
      // Enriquecer dados com campos simulados
      const enrichedVessels = (vesselsData || []).map(v => ({
        ...v,
        speed: Math.floor(Math.random() * 20),
        fuel: Math.floor(70 + Math.random() * 30),
        efficiency: Math.floor(85 + Math.random() * 15),
        crew_count: Math.floor(15 + Math.random() * 15),
        course: Math.floor(Math.random() * 360)
      }));
      setVessels(enrichedVessels);

      const { data: maintenanceData } = await supabase
        .from("maintenance_schedules" as unknown)
        .select("*")
        .order("scheduled_date", { ascending: false })
        .limit(50);
      setMaintenance((maintenanceData as any[]) || []);
    } catch (error) {
      console.error("Error loading fleet data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAddVessel = async () => {
    if (!newVessel.name.trim()) {
      toast({ title: "Erro", description: "Nome é obrigatório", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.from("vessels").insert([{
        name: newVessel.name,
        imo_number: newVessel.imo_number || null,
        vessel_type: newVessel.vessel_type,
        status: "active",
        current_location: newVessel.location || null,
        flag_state: "BR"
      }]);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Embarcação adicionada!" });
      setShowAddDialog(false);
      setNewVessel({ name: "", imo_number: "", vessel_type: "cargo", location: "" });
      loadData();
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao adicionar", variant: "destructive" });
    }
  };

  // Métricas calculadas
  const totalVessels = vessels.length;
  const operationalVessels = vessels.filter(v => v.status === "active" || v.status === "operational").length;
  const avgEfficiency = totalVessels > 0 ? (vessels.reduce((acc, v) => acc + (v.efficiency || 0), 0) / totalVessels).toFixed(1) : "0";
  const avgFuel = totalVessels > 0 ? (vessels.reduce((acc, v) => acc + (v.fuel || 0), 0) / totalVessels).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
            <Ship className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Fleet Command Center</h1>
            <p className="text-muted-foreground">Centro unificado de operações marítimas com IA</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Nova Embarcação</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Embarcação</DialogTitle>
                <DialogDescription>Adicione uma embarcação à frota</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div><Label>Nome *</Label><Input value={newVessel.name} onChange={handleChange}))} placeholder="MV Ocean Star" /></div>
                <div><Label>IMO</Label><Input value={newVessel.imo_number} onChange={handleChange}))} placeholder="9123456" /></div>
                <div><Label>Tipo</Label>
                  <Select value={newVessel.vessel_type} onValueChange={(v) => setNewVessel(p => ({ ...p, vessel_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cargo">Carga</SelectItem>
                      <SelectItem value="tanker">Petroleiro</SelectItem>
                      <SelectItem value="container">Contêiner</SelectItem>
                      <SelectItem value="offshore">Offshore</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Localização</Label><Input value={newVessel.location} onChange={handleChange}))} placeholder="Porto de Santos" /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleSetShowAddDialog}>Cancelar</Button>
                <Button onClick={handleAddVessel}>Adicionar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total de Embarcações" value={totalVessels} icon={Ship} color="blue" delay={0} />
        <KPICard title="Em Operação" value={operationalVessels} icon={CheckCircle} color="green" change={8.3} trend="operacional" delay={0.1} />
        <KPICard title="Eficiência Média" value={avgEfficiency} suffix="%" icon={Gauge} color="purple" change={5.2} trend="performance" delay={0.2} />
        <KPICard title="Combustível Médio" value={avgFuel} suffix="%" icon={Fuel} color="orange" change={-3.5} trend="consumo" delay={0.3} />
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="tracking">Rastreamento</TabsTrigger>
          <TabsTrigger value="vessels">Embarcações</TabsTrigger>
          <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
          <TabsTrigger value="fuel">Combustível</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vessels.slice(0, 4).map(vessel => (
                  <VesselCard key={vessel.id} vessel={vessel} onClick={handleSetSelectedVessel} />
                ))}
              </div>
            </div>
            <div className="xl:col-span-1">
              <FleetAICopilot vessels={vessels} />
            </div>
          </div>
        </TabsContent>

        {/* Tracking Tab */}
        <TabsContent value="tracking">
          <TrackingMapPanel vessels={vessels} selectedVessel={selectedVessel} onSelectVessel={setSelectedVessel} />
        </TabsContent>

        {/* Vessels Tab */}
        <TabsContent value="vessels">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {vessels.map(vessel => (
              <VesselCard key={vessel.id} vessel={vessel} onClick={handleSetSelectedVessel} />
            ))}
            {vessels.length === 0 && !loading && (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Ship className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">Nenhuma embarcação cadastrada</h3>
                  <p className="text-muted-foreground mb-4">Adicione sua primeira embarcação</p>
                  <Button onClick={handleSetShowAddDialog}><Plus className="h-4 w-4 mr-2" />Nova Embarcação</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Gestão de Manutenção
              </CardTitle>
              <CardDescription>Manutenções preventivas e corretivas</CardDescription>
            </CardHeader>
            <CardContent>
              {maintenance.length > 0 ? (
                <div className="space-y-3">
                  {maintenance.slice(0, 10).map((m: unknown) => (
                    <div key={m.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{m.description || "Manutenção Programada"}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(m.scheduled_date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <Badge variant={m.status === "completed" ? "default" : "outline"}>
                        {m.status || "Pendente"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>Sem manutenções pendentes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fuel Tab */}
        <TabsContent value="fuel">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fuel className="h-5 w-5" />
                Consumo de Combustível - 7 Dias
              </CardTitle>
              <CardDescription>Análise de consumo e eficiência energética</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={fuelTrend}>
                  <defs>
                    <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis yAxisId="left" className="text-xs" />
                  <YAxis yAxisId="right" orientation="right" className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="consumption" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorConsumption)" name="Consumo (L)" />
                  <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="hsl(var(--chart-2))" strokeWidth={3} name="Eficiência (%)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Radar de Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={performanceMetrics}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" className="text-xs" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Performance" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Insights de IA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Otimização Detectada</p>
                    <p className="text-xs text-muted-foreground">Eficiência 8% acima da média do setor</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Manutenção Prevista</p>
                    <p className="text-xs text-muted-foreground">1 embarcação requer manutenção em 5 dias</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Tendência Positiva</p>
                    <p className="text-xs text-muted-foreground">Consumo de combustível reduziu 12% este mês</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
