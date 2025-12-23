/**
 * Seção: Visão Geral - Dashboard Principal
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import {
  Ship, Users, Wrench, Package, Shield, DollarSign,
  TrendingUp, TrendingDown, AlertTriangle, Activity, Clock,
  ArrowRight, BarChart3, Fuel, Anchor
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import type { SystemStatus } from "../index";

interface VisaoGeralSectionProps {
  systemStatus: SystemStatus;
  isLoading: boolean;
  onNavigate: (tab: string) => void;
}

// Sample data for charts
const operationsData = [
  { time: "00:00", operacoes: 45, eficiencia: 92 },
  { time: "04:00", operacoes: 38, eficiencia: 89 },
  { time: "08:00", operacoes: 67, eficiencia: 95 },
  { time: "12:00", operacoes: 82, eficiencia: 94 },
  { time: "16:00", operacoes: 75, eficiencia: 91 },
  { time: "20:00", operacoes: 58, eficiencia: 93 },
  { time: "Agora", operacoes: 62, eficiencia: 96 }
];

const resourceDistribution = [
  { name: "Navegação", value: 35, color: "#3B82F6" },
  { name: "Manutenção", value: 25, color: "#10B981" },
  { name: "Tripulação", value: 20, color: "#8B5CF6" },
  { name: "Logística", value: 12, color: "#F59E0B" },
  { name: "Compliance", value: 8, color: "#EF4444" }
];

const recentActivities = [
  { id: 1, action: "Embarcação MV Atlântico iniciou viagem", time: "Há 5 min", type: "voyage", icon: Ship },
  { id: 2, action: "Manutenção preventiva concluída - MV Pacific", time: "Há 15 min", type: "maintenance", icon: Wrench },
  { id: 3, action: "12 certificados renovados", time: "Há 30 min", type: "compliance", icon: Shield },
  { id: 4, action: "Novo tripulante embarcado - João Silva", time: "Há 1h", type: "crew", icon: Users },
  { id: 5, action: "Abastecimento concluído - 15.000L", time: "Há 2h", type: "fuel", icon: Fuel }
];

export function VisaoGeralSection({ systemStatus, isLoading, onNavigate }: VisaoGeralSectionProps) {
  const metrics = [
    {
      title: "Frota Ativa",
      value: `${systemStatus.fleet.active}/${systemStatus.fleet.total}`,
      subtitle: "Embarcações em operação",
      trend: "+2 este mês",
      icon: Ship,
      color: "from-blue-500 to-blue-600",
      status: "up"
    },
    {
      title: "Receita Hoje",
      value: "R$ 2.4M",
      subtitle: "Faturamento diário",
      trend: "+8% vs média",
      icon: DollarSign,
      color: "from-emerald-500 to-emerald-600",
      status: "up"
    },
    {
      title: "Alertas",
      value: String(systemStatus.fleet.alerts),
      subtitle: "Pendentes de ação",
      trend: "-3 vs ontem",
      icon: AlertTriangle,
      color: "from-amber-500 to-amber-600",
      status: "down"
    },
    {
      title: "Eficiência IA",
      value: "98.5%",
      subtitle: "Performance do sistema",
      trend: "+2% esta semana",
      icon: Activity,
      color: "from-purple-500 to-purple-600",
      status: "up"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-5`} />
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.title}</p>
                    <p className="text-2xl font-bold mt-1">{metric.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{metric.subtitle}</p>
                  </div>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.color}`}>
                    <metric.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  {metric.status === "up" ? (
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-emerald-500" />
                  )}
                  <span className="text-xs text-emerald-600">{metric.trend}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gráfico de Operações em Tempo Real */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Operações em Tempo Real</CardTitle>
                <CardDescription>Atividade e eficiência nas últimas 24h</CardDescription>
              </div>
              <Badge variant="outline" className="animate-pulse">
                <Activity className="h-3 w-3 mr-1" />
                Ao vivo
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={operationsData}>
                  <defs>
                    <linearGradient id="colorOperacoes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorEficiencia" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="time" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="operacoes"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorOperacoes)"
                    name="Operações"
                  />
                  <Area
                    type="monotone"
                    dataKey="eficiencia"
                    stroke="#10B981"
                    fillOpacity={1}
                    fill="url(#colorEficiencia)"
                    name="Eficiência %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Distribuição */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Distribuição de Recursos</CardTitle>
            <CardDescription>Por área operacional</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resourceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {resourceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {resourceDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                  <span className="text-muted-foreground ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status dos Sistemas e Atividades Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Status dos Sistemas */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Status dos Sistemas</CardTitle>
            <CardDescription>Performance em tempo real</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Frota</span>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    Operacional
                  </Badge>
                </div>
                <Progress value={91.6} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {systemStatus.fleet.active} de {systemStatus.fleet.total} ativas
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tripulação</span>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    OK
                  </Badge>
                </div>
                <Progress value={80.2} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {systemStatus.crew.onboard} embarcados
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Manutenção</span>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    Atenção
                  </Badge>
                </div>
                <Progress value={systemStatus.maintenance.efficiency} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {systemStatus.maintenance.overdue} atrasadas
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Compliance</span>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    Excelente
                  </Badge>
                </div>
                <Progress value={systemStatus.compliance.score} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Score: {systemStatus.compliance.score}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Atividades Recentes */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Atividades Recentes</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onNavigate("operations")}>
                Ver mais <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[240px]">
              <div className="p-4 space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-muted">
                      <activity.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{activity.action}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
