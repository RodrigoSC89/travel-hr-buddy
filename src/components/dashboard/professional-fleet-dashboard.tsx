/**
 * Professional Fleet Dashboard
 * Dashboard de frota com visualizações avançadas e métricas operacionais
 */

import { memo, memo, useState, useMemo } from "react";;;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Ship,
  MapPin,
  Anchor,
  Fuel,
  Activity,
  AlertTriangle,
  CheckCircle,
  Navigation,
  Gauge,
  Waves,
  Clock,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { motion } from "framer-motion";
import { ProfessionalHeader } from "./professional-header";
import { ProfessionalKPICard } from "./professional-kpi-card";

const vessels = [
  { 
    id: 1, 
    name: "Atlântico I", 
    status: "operational", 
    location: "Santos, BR",
    speed: 12.5,
    fuel: 78,
    crew: 24,
    lastMaintenance: "3 dias",
    efficiency: 94,
    coordinates: { lat: -23.96, lng: -46.33 }
  },
  { 
    id: 2, 
    name: "Pacífico II", 
    status: "in-port", 
    location: "Rio de Janeiro, BR",
    speed: 0,
    fuel: 92,
    crew: 22,
    lastMaintenance: "15 dias",
    efficiency: 91,
    coordinates: { lat: -22.91, lng: -43.17 }
  },
  { 
    id: 3, 
    name: "Índico III", 
    status: "operational", 
    location: "Salvador, BR",
    speed: 15.8,
    fuel: 65,
    crew: 26,
    lastMaintenance: "7 dias",
    efficiency: 96,
    coordinates: { lat: -12.97, lng: -38.50 }
  },
  { 
    id: 4, 
    name: "Ártico IV", 
    status: "maintenance", 
    location: "Vitória, BR",
    speed: 0,
    fuel: 45,
    crew: 18,
    lastMaintenance: "1 dia",
    efficiency: 88,
    coordinates: { lat: -20.32, lng: -40.34 }
  }
];

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

const VesselCard = ({ vessel }: unknown: unknown: unknown) => {
  const statusConfig = {
    operational: { color: "bg-green-500", label: "Operacional", variant: "default" as const },
    "in-port": { color: "bg-blue-500", label: "Em Porto", variant: "secondary" as const },
    maintenance: { color: "bg-yellow-500", label: "Manutenção", variant: "outline" as const }
  };

  const config = statusConfig[vessel.status as keyof typeof statusConfig];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="relative overflow-hidden group cursor-pointer">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500" />
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-playfair">{vessel.name}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {vessel.location}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={config.variant} className="gap-1">
                <div className={`h-2 w-2 rounded-full ${config.color} animate-pulse`} />
                {config.label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                ID: {vessel.id.toString().padStart(4, "0")}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Speed & Fuel */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Gauge className="h-3 w-3" />
                Velocidade
              </div>
              <p className="text-2xl font-bold font-mono">{vessel.speed} <span className="text-sm text-muted-foreground">kn</span></p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Fuel className="h-3 w-3" />
                Combustível
              </div>
              <p className="text-2xl font-bold font-mono">{vessel.fuel}<span className="text-sm text-muted-foreground">%</span></p>
            </div>
          </div>

          {/* Efficiency Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Eficiência Operacional</span>
              <span className="text-xs font-bold font-mono">{vessel.efficiency}%</span>
            </div>
            <Progress value={vessel.efficiency} className="h-2" />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Tripulação</p>
                <p className="text-sm font-semibold">{vessel.crew}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Última Manutenção</p>
                <p className="text-sm font-semibold">{vessel.lastMaintenance}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const ProfessionalFleetDashboard = memo(function() {
  const [activeTab, setActiveTab] = useState("overview");

  const totalVessels = vessels.length;
  const operationalVessels = vessels.filter(v => v.status === "operational").length;
  const avgEfficiency = (vessels.reduce((acc, v) => acc + v.efficiency, 0) / totalVessels).toFixed(1);
  const avgFuel = (vessels.reduce((acc, v) => acc + v.fuel, 0) / totalVessels).toFixed(1);

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-background via-background to-muted/20 min-h-screen">
      <ProfessionalHeader
        title="Gestão de Frota"
        subtitle="Monitoramento em tempo real e análise operacional de todas as embarcações"
        showLogo={true}
        showRealTime={true}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProfessionalKPICard
          title="Total de Embarcações"
          value={totalVessels.toString()}
          icon={Ship}
          color="blue"
          delay={0}
        />
        <ProfessionalKPICard
          title="Em Operação"
          value={operationalVessels.toString()}
          icon={CheckCircle}
          color="green"
          change={8.3}
          trend="status operacional"
          delay={0.1}
        />
        <ProfessionalKPICard
          title="Eficiência Média"
          value={avgEfficiency}
          suffix="%"
          icon={Gauge}
          color="purple"
          change={5.2}
          trend="performance"
          delay={0.2}
        />
        <ProfessionalKPICard
          title="Combustível Médio"
          value={avgFuel}
          suffix="%"
          icon={Fuel}
          color="orange"
          change={-3.5}
          trend="nível de reserva"
          delay={0.3}
        />
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="fuel">Combustível</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Vessels Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {vessels.map(vessel => (
              <VesselCard key={vessel.id} vessel={vessel} />
            ))}
          </div>

          {/* Map Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Localização em Tempo Real
              </CardTitle>
              <CardDescription>
                Posição atual de todas as embarcações da frota
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-[400px] bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg border-2 border-dashed flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Waves className="h-16 w-16 mx-auto text-blue-500 animate-pulse" />
                  <p className="text-lg font-semibold">Mapa Interativo</p>
                  <p className="text-sm text-muted-foreground">
                    Integração com sistema de rastreamento via satélite
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Radar de Performance
              </CardTitle>
              <CardDescription>
                Análise multidimensional de métricas operacionais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={performanceMetrics}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar 
                    name="Performance" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.6} 
                  />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fuel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fuel className="h-5 w-5" />
                Consumo de Combustível - 7 Dias
              </CardTitle>
              <CardDescription>
                Análise de consumo e eficiência energética
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={fuelTrend}>
                  <defs>
                    <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="consumption" 
                    stroke="#f59e0b" 
                    fillOpacity={1} 
                    fill="url(#colorConsumption)"
                    name="Consumo (L)"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="efficiency" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="Eficiência (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Insights de IA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Otimização Detectada</p>
                    <p className="text-xs text-muted-foreground">
                      Atlântico I apresenta eficiência 8% acima da média
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Manutenção Prevista</p>
                    <p className="text-xs text-muted-foreground">
                      Ártico IV requer manutenção preventiva em 5 dias
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Tendência Positiva</p>
                    <p className="text-xs text-muted-foreground">
                      Consumo de combustível reduziu 12% este mês
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Próximas Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <div>
                      <p className="text-sm font-medium">Manutenção Emergencial</p>
                      <p className="text-xs text-muted-foreground">Ártico IV - Motor</p>
                    </div>
                  </div>
                  <Badge variant="destructive">Urgente</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">Inspeção Programada</p>
                      <p className="text-xs text-muted-foreground">Pacífico II - Casco</p>
                    </div>
                  </div>
                  <Badge variant="outline">3 dias</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <div>
                      <p className="text-sm font-medium">Abastecimento</p>
                      <p className="text-xs text-muted-foreground">Índico III - Combustível</p>
                    </div>
                  </div>
                  <Badge variant="secondary">5 dias</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
});
