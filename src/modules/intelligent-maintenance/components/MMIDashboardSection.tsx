/**
 * MMI Dashboard Section - Business Intelligence Dashboard
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, TrendingUp, TrendingDown, Clock, 
  Wrench, AlertTriangle, CheckCircle, DollarSign,
  Ship, Calendar, Activity, Target
} from "lucide-react";
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
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

// Mock data for charts
const maintenanceTrend = [
  { month: "Jan", preventiva: 12, corretiva: 3, preditiva: 5 },
  { month: "Fev", preventiva: 15, corretiva: 2, preditiva: 7 },
  { month: "Mar", preventiva: 18, corretiva: 4, preditiva: 8 },
  { month: "Abr", preventiva: 14, corretiva: 1, preditiva: 6 },
  { month: "Mai", preventiva: 20, corretiva: 3, preditiva: 9 },
  { month: "Jun", preventiva: 22, corretiva: 2, preditiva: 11 },
];

const costByVessel = [
  { vessel: "FPSO Alpha", cost: 45000 },
  { vessel: "PSV Beta", cost: 28000 },
  { vessel: "AHTS Gamma", cost: 35000 },
  { vessel: "PSV Delta", cost: 22000 },
  { vessel: "FPSO Epsilon", cost: 52000 },
];

const maintenanceByType = [
  { name: "Preventiva", value: 65, color: "#3b82f6" },
  { name: "Corretiva", value: 20, color: "#f97316" },
  { name: "Preditiva", value: 15, color: "#8b5cf6" },
];

const efficiencyData = [
  { week: "Sem 1", efficiency: 92 },
  { week: "Sem 2", efficiency: 88 },
  { week: "Sem 3", efficiency: 95 },
  { week: "Sem 4", efficiency: 91 },
  { week: "Sem 5", efficiency: 94 },
  { week: "Sem 6", efficiency: 97 },
];

export default function MMIDashboardSection() {
  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wide">MTBF Médio</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">842h</p>
                <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +12% vs mês anterior
                </div>
              </div>
              <Clock className="h-10 w-10 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border-green-200 dark:border-green-800">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 dark:text-green-400 uppercase tracking-wide">Disponibilidade</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">97.2%</p>
                <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +2.1% vs meta
                </div>
              </div>
              <Activity className="h-10 w-10 text-green-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30 border-orange-200 dark:border-orange-800">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-600 dark:text-orange-400 uppercase tracking-wide">Custo Mensal</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">R$ 182K</p>
                <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                  <TrendingDown className="h-3 w-3" />
                  -8% vs orçado
                </div>
              </div>
              <DollarSign className="h-10 w-10 text-orange-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 border-purple-200 dark:border-purple-800">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 dark:text-purple-400 uppercase tracking-wide">Backlog</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">23</p>
                <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                  <AlertTriangle className="h-3 w-3" />
                  5 críticos
                </div>
              </div>
              <Target className="h-10 w-10 text-purple-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Tendência de Manutenções
            </CardTitle>
            <CardDescription>Manutenções por tipo nos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={maintenanceTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }} 
                />
                <Area type="monotone" dataKey="preventiva" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Preventiva" />
                <Area type="monotone" dataKey="corretiva" stackId="1" stroke="#f97316" fill="#f97316" fillOpacity={0.6} name="Corretiva" />
                <Area type="monotone" dataKey="preditiva" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Preditiva" />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5" />
              Custo por Embarcação
            </CardTitle>
            <CardDescription>Gastos de manutenção por embarcação (R$)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costByVessel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="vessel" type="category" className="text-xs" width={100} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                  formatter={(value) => [`R$ ${Number(value).toLocaleString("pt-BR")}`, "Custo"]}
                />
                <Bar dataKey="cost" fill="#f97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Distribuição por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={maintenanceByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {maintenanceByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                  formatter={(value) => [`${value}%`, ""]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Eficiência Semanal
            </CardTitle>
            <CardDescription>Percentual de manutenções concluídas no prazo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={efficiencyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="week" className="text-xs" />
                <YAxis domain={[80, 100]} className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                  formatter={(value) => [`${value}%`, "Eficiência"]}
                />
                <Area type="monotone" dataKey="efficiency" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <AlertTriangle className="h-5 w-5" />
            Alertas de Manutenção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-100 dark:bg-red-950/30 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-700 dark:text-red-300">Motor Principal - FPSO Alpha</p>
                  <p className="text-sm text-red-600 dark:text-red-400">Manutenção vencida há 3 dias</p>
                </div>
              </div>
              <Badge className="bg-red-500 text-white">Crítico</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-orange-100 dark:bg-orange-950/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium text-orange-700 dark:text-orange-300">Sistema Hidráulico - PSV Beta</p>
                  <p className="text-sm text-orange-600 dark:text-orange-400">Vence em 2 dias</p>
                </div>
              </div>
              <Badge className="bg-orange-500 text-white">Alto</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-100 dark:bg-yellow-950/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-700 dark:text-yellow-300">Calibração de Sensores - AHTS Gamma</p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">Vence em 7 dias</p>
                </div>
              </div>
              <Badge className="bg-yellow-500 text-white">Médio</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
