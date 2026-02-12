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
  { name: "Preventiva", value: 65, color: "hsl(var(--primary))" },
  { name: "Corretiva", value: 20, color: "hsl(var(--warning))" },
  { name: "Preditiva", value: 15, color: "hsl(var(--accent))" },
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
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-primary uppercase tracking-wide">MTBF Médio</p>
                <p className="text-2xl font-bold text-primary">842h</p>
                <div className="flex items-center gap-1 text-xs text-success mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +12% vs mês anterior
                </div>
              </div>
              <Clock className="h-10 w-10 text-primary/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-success uppercase tracking-wide">Disponibilidade</p>
                <p className="text-2xl font-bold text-success">97.2%</p>
                <div className="flex items-center gap-1 text-xs text-success mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +2.1% vs meta
                </div>
              </div>
              <Activity className="h-10 w-10 text-success/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-warning uppercase tracking-wide">Custo Mensal</p>
                <p className="text-2xl font-bold text-warning">R$ 182K</p>
                <div className="flex items-center gap-1 text-xs text-destructive mt-1">
                  <TrendingDown className="h-3 w-3" />
                  -8% vs orçado
                </div>
              </div>
              <DollarSign className="h-10 w-10 text-warning/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-accent-foreground uppercase tracking-wide">Backlog</p>
                <p className="text-2xl font-bold text-accent-foreground">23</p>
                <div className="flex items-center gap-1 text-xs text-warning mt-1">
                  <AlertTriangle className="h-3 w-3" />
                  5 críticos
                </div>
              </div>
              <Target className="h-10 w-10 text-accent-foreground/50" />
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
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Area type="monotone" dataKey="preventiva" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} name="Preventiva" />
                <Area type="monotone" dataKey="corretiva" stackId="1" stroke="hsl(var(--warning))" fill="hsl(var(--warning))" fillOpacity={0.6} name="Corretiva" />
                <Area type="monotone" dataKey="preditiva" stackId="1" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.6} name="Preditiva" />
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
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Custo']}
                />
                <Bar dataKey="cost" fill="hsl(var(--warning))" radius={[0, 4, 4, 0]} />
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
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [`${value}%`, '']}
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
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [`${value}%`, 'Eficiência']}
                />
                <Area type="monotone" dataKey="efficiency" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card className="border-warning/30 bg-warning/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning">
            <AlertTriangle className="h-5 w-5" />
            Alertas de Manutenção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">Motor Principal - FPSO Alpha</p>
                  <p className="text-sm text-destructive/80">Manutenção vencida há 3 dias</p>
                </div>
              </div>
              <Badge variant="destructive">Crítico</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-warning" />
                <div>
                  <p className="font-medium text-warning">Sistema Hidráulico - PSV Beta</p>
                  <p className="text-sm text-warning/80">Vence em 2 dias</p>
                </div>
              </div>
              <Badge className="bg-warning text-warning-foreground">Alto</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-warning/5 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-warning" />
                <div>
                  <p className="font-medium text-warning">Calibração de Sensores - AHTS Gamma</p>
                  <p className="text-sm text-warning/80">Vence em 7 dias</p>
                </div>
              </div>
              <Badge className="bg-warning/80 text-warning-foreground">Médio</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
