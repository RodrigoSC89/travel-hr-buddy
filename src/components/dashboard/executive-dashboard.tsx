/**
 * Executive Dashboard - Professional Grade
 * Dashboard executivo com métricas, KPIs e visualizações avançadas
 */

import { memo, memo, useState, useMemo } from "react";;;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Ship,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Activity,
  Users,
  DollarSign,
  Target,
  Zap,
  Globe,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from "lucide-react";
import { LineChart as RechartsLine, Line, AreaChart, Area, BarChart as RechartsBar, Bar, PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { motion } from "framer-motion";

// Dados mockados para demonstração
const revenueData = [
  { month: "Jan", revenue: 42000, target: 40000, costs: 28000 },
  { month: "Fev", revenue: 48000, target: 45000, costs: 30000 },
  { month: "Mar", revenue: 52000, target: 50000, costs: 32000 },
  { month: "Abr", revenue: 58000, target: 55000, costs: 35000 },
  { month: "Mai", revenue: 65000, target: 60000, costs: 38000 },
  { month: "Jun", revenue: 72000, target: 70000, costs: 42000 },
];

const fleetPerformance = [
  { vessel: "Atlântico I", efficiency: 92, uptime: 98, compliance: 95 },
  { vessel: "Pacífico II", efficiency: 88, uptime: 95, compliance: 92 },
  { vessel: "Índico III", efficiency: 94, uptime: 99, compliance: 97 },
  { vessel: "Ártico IV", efficiency: 86, uptime: 93, compliance: 90 },
];

const operationalMetrics = [
  { name: "Excelente", value: 65, color: "#10b981" },
  { name: "Bom", value: 25, color: "#3b82f6" },
  { name: "Regular", value: 8, color: "#f59e0b" },
  { name: "Crítico", value: 2, color: "#ef4444" },
];

const KPICard = ({ title, value, change, icon: Icon, trend, prefix = "", suffix = "" }: unknown: unknown: unknown) => {
  const isPositive = change >= 0;
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full -mr-16 -mt-16" />
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold font-playfair">
                {prefix}{value}{suffix}
              </p>
              <div className="flex items-center gap-2">
                <Badge
                  variant={isPositive ? "default" : "destructive"}
                  className="gap-1"
                >
                  <TrendIcon className="h-3 w-3" />
                  {Math.abs(change)}%
                </Badge>
                <span className="text-xs text-muted-foreground">{trend}</span>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${isPositive ? "bg-green-100 dark:bg-green-900/20" : "bg-blue-100 dark:bg-blue-900/20"}`}>
              <Icon className={`h-6 w-6 ${isPositive ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const MetricIndicator = ({ label, value, target, color = "blue" }: unknown: unknown: unknown) => {
  const percentage = (value / target) * 100;
  const isExceeding = percentage >= 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-bold font-mono">
          {value} / {target}
        </span>
      </div>
      <div className="relative">
        <Progress value={Math.min(percentage, 100)} className="h-2" />
        {isExceeding && (
          <Badge className="absolute -top-6 right-0 gap-1 text-xs" variant="default">
            <CheckCircle className="h-3 w-3" />
            Meta superada!
          </Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {percentage.toFixed(1)}% da meta
      </p>
    </div>
  );
};

const VesselPerformanceCard = ({ vessel }: unknown: unknown: unknown) => (
  <Card>
    <CardContent className="pt-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{vessel.vessel}</h3>
            <p className="text-xs text-muted-foreground">Performance Operacional</p>
          </div>
          <Badge variant="outline">Ativo</Badge>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">Eficiência</span>
              <span className="text-sm font-bold">{vessel.efficiency}%</span>
            </div>
            <Progress value={vessel.efficiency} className="h-2" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">Uptime</span>
              <span className="text-sm font-bold">{vessel.uptime}%</span>
            </div>
            <Progress value={vessel.uptime} className="h-2" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">Compliance</span>
              <span className="text-sm font-bold">{vessel.compliance}%</span>
            </div>
            <Progress value={vessel.compliance} className="h-2" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const ExecutiveDashboard = memo(function() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold font-playfair">Dashboard Executivo</h1>
          <p className="text-muted-foreground mt-1">
            Visão estratégica e métricas de alto nível
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Tempo Real
          </Badge>
          <Button variant="outline" size="sm">
            <Clock className="h-4 w-4 mr-2" />
            Últimas 24h
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Receita Total"
          value="72.5"
          change={12.5}
          icon={DollarSign}
          trend="vs mês anterior"
          prefix="R$ "
          suffix="K"
        />
        <KPICard
          title="Embarcações Ativas"
          value="24"
          change={8.3}
          icon={Ship}
          trend="vs trimestre anterior"
        />
        <KPICard
          title="Taxa de Compliance"
          value="94.2"
          change={2.8}
          icon={CheckCircle}
          trend="meta: 95%"
          suffix="%"
        />
        <KPICard
          title="Eficiência Operacional"
          value="89.7"
          change={5.2}
          icon={Target}
          trend="acima da meta"
          suffix="%"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="operations">Operações</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Evolução de Receita vs Meta
                </CardTitle>
                <CardDescription>
                  Acompanhamento mensal de receita e custos operacionais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      fillOpacity={1} 
                      fill="url(#colorRevenue)"
                      name="Receita"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="target" 
                      stroke="#10b981" 
                      fillOpacity={1} 
                      fill="url(#colorTarget)"
                      name="Meta"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="costs" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="Custos"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Operational Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Status Operacional
                </CardTitle>
                <CardDescription>
                  Distribuição de performance da frota
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPie>
                    <Pie
                      data={operationalMetrics}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {operationalMetrics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quick Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Metas Mensais
                </CardTitle>
                <CardDescription>
                  Progresso em relação aos objetivos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <MetricIndicator
                  label="Receita"
                  value={72}
                  target={70}
                  color="blue"
                />
                <MetricIndicator
                  label="Novos Contratos"
                  value={18}
                  target={20}
                  color="green"
                />
                <MetricIndicator
                  label="Compliance Score"
                  value={94}
                  target={95}
                  color="purple"
                />
                <MetricIndicator
                  label="Satisfação Clientes"
                  value={4.7}
                  target={4.5}
                  color="yellow"
                />
              </CardContent>
            </Card>
          </div>

          {/* Fleet Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ship className="h-5 w-5" />
                Performance da Frota
              </CardTitle>
              <CardDescription>
                Indicadores operacionais por embarcação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {fleetPerformance.map((vessel, index) => (
                  <VesselPerformanceCard key={index} vessel={vessel} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Análise Financeira Detalhada
              </CardTitle>
              <CardDescription>
                Breakdown de receitas, custos e margem de lucro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RechartsBar data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3b82f6" name="Receita" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="costs" fill="#ef4444" name="Custos" radius={[8, 8, 0, 0]} />
                </RechartsBar>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Uptime Geral</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-5xl font-bold font-playfair text-green-600">
                    96.8%
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Disponibilidade da frota
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Incidentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-5xl font-bold font-playfair text-yellow-600">
                    3
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Este mês (-40% vs anterior)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Manutenções</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-5xl font-bold font-playfair text-blue-600">
                    12
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Programadas este mês
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Analytics Avançado
              </CardTitle>
              <CardDescription>
                Insights e tendências baseados em IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <Zap className="h-5 w-5 text-yellow-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Previsão de Receita</h4>
                    <p className="text-sm text-muted-foreground">
                      Com base no crescimento atual, esperamos atingir R$ 850K até final do ano (+18%)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Alerta de Manutenção</h4>
                    <p className="text-sm text-muted-foreground">
                      2 embarcações precisarão de manutenção preventiva nos próximos 30 dias
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Oportunidade Detectada</h4>
                    <p className="text-sm text-muted-foreground">
                      Eficiência de combustível melhorou 8% com otimizações recentes de rota
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
});
