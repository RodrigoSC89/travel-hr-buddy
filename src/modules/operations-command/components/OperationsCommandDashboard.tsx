/**
 * Operations Command Dashboard - Premium Operations Center
 * Centro de Comando de Operações Marítimas
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Anchor, Ship, MapPin, Navigation, Compass, Clock,
  Fuel, Activity, AlertTriangle, CheckCircle2, Target,
  Calendar, TrendingUp, Brain, Sparkles, Globe, Wind,
  Waves, ArrowRight, Eye, RefreshCw, Radio, Gauge
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Mock data
const fleetStatus = {
  total: 15,
  sailing: 8,
  anchored: 3,
  moored: 3,
  maintenance: 1,
  avgSpeed: 12.4,
  totalCargo: 245000,
};

const activeVoyages = [
  { id: "1", vessel: "MV Atlântico Sul", route: "Santos → Rotterdam", progress: 65, eta: "2026-02-15 14:00", status: "on_time", cargo: "Container", speed: 14.2 },
  { id: "2", vessel: "MV Horizonte", route: "Rio de Janeiro → Houston", progress: 32, eta: "2026-02-20 08:00", status: "on_time", cargo: "Crude Oil", speed: 12.8 },
  { id: "3", vessel: "MV Oceano", route: "Paranaguá → Shanghai", progress: 18, eta: "2026-03-05 06:00", status: "delayed", cargo: "Grain", speed: 11.5 },
  { id: "4", vessel: "MV Pacífico", route: "Tubarão → Qingdao", progress: 85, eta: "2026-02-08 20:00", status: "ahead", cargo: "Iron Ore", speed: 13.1 },
];

const portCalls = [
  { id: "1", vessel: "MV Atlântico Sul", port: "Las Palmas", type: "Bunker", date: "2026-02-10", duration: "8h", status: "confirmed" },
  { id: "2", vessel: "MV Caribe", port: "Santos", type: "Discharge", date: "2026-02-06", duration: "24h", status: "in_progress" },
  { id: "3", vessel: "MV Horizonte", port: "Curaçao", type: "Bunker", date: "2026-02-12", duration: "6h", status: "pending" },
];

const weatherAlerts = [
  { id: "1", vessel: "MV Oceano", type: "Storm", severity: "warning", message: "Sistema frontal detectado na rota - redução de velocidade recomendada", eta_impact: "+12h" },
  { id: "2", vessel: "MV Atlântico Sul", type: "Wind", severity: "info", message: "Ventos favoráveis previstos - possível adiantamento de ETA", eta_impact: "-4h" },
];

const fuelEfficiency = [
  { day: "Seg", consumption: 42, optimal: 40 },
  { day: "Ter", consumption: 38, optimal: 40 },
  { day: "Qua", consumption: 45, optimal: 40 },
  { day: "Qui", consumption: 41, optimal: 40 },
  { day: "Sex", consumption: 39, optimal: 40 },
  { day: "Sab", consumption: 36, optimal: 40 },
  { day: "Dom", consumption: 40, optimal: 40 },
];

const aiRecommendations = [
  { id: "1", type: "route", message: "Otimização de rota para MV Oceano pode economizar 18t de combustível", action: "Aplicar", savings: "USD 12,600" },
  { id: "2", type: "speed", message: "Slow steaming no MV Horizonte reduziria emissões em 15%", action: "Analisar", savings: "8t CO₂" },
  { id: "3", type: "weather", message: "Janela meteorológica favorável para partida do MV Caribe em 6h", action: "Ver previsão" },
  { id: "4", type: "port", message: "Congestionamento previsto em Rotterdam - considerar berço alternativo", action: "Ver opções" },
];

function VoyageStatusBadge({ status }: { status: string }) {
  const variants: Record<string, { label: string; className: string; icon: any }> = {
    on_time: { label: "No Prazo", className: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
    delayed: { label: "Atrasado", className: "bg-warning/10 text-warning border-warning/20", icon: Clock },
    ahead: { label: "Adiantado", className: "bg-primary/10 text-primary border-primary/20", icon: TrendingUp },
  };
  const variant = variants[status] || variants.on_time;
  return (
    <Badge variant="outline" className={`${variant.className} gap-1`}>
      <variant.icon className="h-3 w-3" />
      {variant.label}
    </Badge>
  );
}

export default function OperationsCommandDashboard() {
  return (
    <div className="space-y-6">
      {/* Fleet Status KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Frota Total</p>
                  <p className="text-2xl font-bold">{fleetStatus.total}</p>
                  <p className="text-xs">embarcações</p>
                </div>
                <Ship className="h-8 w-8 text-primary opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-l-4 border-l-success hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Navegando</p>
                  <p className="text-2xl font-bold text-success">{fleetStatus.sailing}</p>
                  <p className="text-xs">{Math.round((fleetStatus.sailing / fleetStatus.total) * 100)}% da frota</p>
                </div>
                <Navigation className="h-8 w-8 text-success opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-l-4 border-l-warning hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Ancorados</p>
                  <p className="text-2xl font-bold text-warning">{fleetStatus.anchored}</p>
                  <p className="text-xs">aguardando</p>
                </div>
                <Anchor className="h-8 w-8 text-warning opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-l-4 border-l-cyan-500 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Vel. Média</p>
                  <p className="text-2xl font-bold text-cyan-600">{fleetStatus.avgSpeed} kn</p>
                  <p className="text-xs">frota ativa</p>
                </div>
                <Gauge className="h-8 w-8 text-cyan-500 opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Carga Total</p>
                  <p className="text-2xl font-bold text-purple-600">{(fleetStatus.totalCargo / 1000).toFixed(0)}k</p>
                  <p className="text-xs">toneladas</p>
                </div>
                <Activity className="h-8 w-8 text-purple-500 opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="border-l-4 border-l-emerald-500 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Viagens Ativas</p>
                  <p className="text-2xl font-bold text-emerald-600">{activeVoyages.length}</p>
                  <p className="text-xs">em andamento</p>
                </div>
                <Globe className="h-8 w-8 text-emerald-500 opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Voyages */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-primary" />
                  Viagens em Andamento
                </CardTitle>
                <Button size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[320px]">
                <div className="space-y-4">
                  {activeVoyages.map((voyage, idx) => (
                    <motion.div
                      key={voyage.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Ship className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{voyage.vessel}</p>
                            <p className="text-sm text-muted-foreground">{voyage.route}</p>
                          </div>
                        </div>
                        <VoyageStatusBadge status={voyage.status} />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progresso: {voyage.progress}%</span>
                          <span>Velocidade: {voyage.speed} kn</span>
                        </div>
                        <Progress value={voyage.progress} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Carga: {voyage.cargo}</span>
                          <span>ETA: {voyage.eta}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          Detalhes
                        </Button>
                        <Button size="sm" variant="ghost">
                          <MapPin className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* AI Recommendations */}
        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Insights IA Operacional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {aiRecommendations.map((rec) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-start gap-2">
                      <Brain className="h-4 w-4 mt-0.5 text-purple-500" />
                      <div className="flex-1">
                        <p className="text-sm">{rec.message}</p>
                        {rec.savings && (
                          <p className="text-xs text-success font-medium mt-1">
                            Economia: {rec.savings}
                          </p>
                        )}
                        <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs gap-1 p-0">
                          {rec.action}
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weather Alerts */}
        <Card className={weatherAlerts.some(a => a.severity === "warning") ? "border-warning/20" : ""}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Wind className="h-5 w-5 text-warning" />
                Alertas Meteorológicos
              </CardTitle>
              <Badge variant="secondary">{weatherAlerts.length} ativos</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weatherAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${
                    alert.severity === "warning" ? "border-warning/50 bg-warning/5" : "border-primary/50 bg-primary/5"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={alert.severity === "warning" ? "secondary" : "default"} className={alert.severity === "warning" ? "bg-warning/20 text-warning" : ""}>
                        {alert.type}
                      </Badge>
                      <span className="font-medium">{alert.vessel}</span>
                    </div>
                    <span className={`text-sm font-medium ${alert.eta_impact.includes("+") ? "text-warning" : "text-success"}`}>
                      ETA {alert.eta_impact}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Port Calls */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Escalas Portuárias
              </CardTitle>
              <Button size="sm" variant="outline">Ver Todas</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {portCalls.map((call) => (
                <div key={call.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      call.status === "in_progress" ? "bg-success/10" : "bg-primary/10"
                    }`}>
                      <Anchor className={`h-4 w-4 ${
                        call.status === "in_progress" ? "text-success" : "text-primary"
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium">{call.vessel}</p>
                      <p className="text-sm text-muted-foreground">{call.port} • {call.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={call.status === "in_progress" ? "default" : call.status === "confirmed" ? "secondary" : "outline"}>
                      {call.status === "in_progress" ? "Em Andamento" : call.status === "confirmed" ? "Confirmado" : "Pendente"}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{call.date} • {call.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fuel Efficiency Chart */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Fuel className="h-5 w-5 text-primary" />
                Eficiência de Combustível
              </CardTitle>
              <CardDescription>Consumo vs Meta - Última Semana</CardDescription>
            </div>
            <Button size="sm" variant="outline">
              Ver Relatório
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={fuelEfficiency}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="day" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
              <Area type="monotone" dataKey="optimal" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.1} name="Meta" strokeDasharray="5 5" />
              <Area type="monotone" dataKey="consumption" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} name="Consumo Real" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
