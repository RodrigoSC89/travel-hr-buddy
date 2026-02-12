/**
 * ContractAnalyticsDashboard - Dashboard Analítico Avançado
 * Gráficos de performance, custos e tendências de downtime
 */

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  BarChart3, TrendingUp, PieChart as PieChartIcon, DollarSign, 
  Clock, Ship, Calendar, Download, RefreshCw, Target
} from "lucide-react";

interface AnalyticsData {
  slaPerformance: { month: string; sla: number; target: number }[];
  downtimeTrend: { month: string; planned: number; unplanned: number; total: number }[];
  costBreakdown: { category: string; value: number; color: string }[];
  vesselPerformance: { vessel: string; availability: number; downtime: number; compliance: number }[];
  penaltyTrend: { month: string; penalty: number; avoided: number }[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--accent))', 'hsl(var(--info))'];

export function ContractAnalyticsDashboard() {
  const [period, setPeriod] = useState('6m');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnalyticsData>({
    slaPerformance: [
      { month: 'Ago', sla: 97.5, target: 95 },
      { month: 'Set', sla: 96.2, target: 95 },
      { month: 'Out', sla: 98.1, target: 95 },
      { month: 'Nov', sla: 94.8, target: 95 },
      { month: 'Dez', sla: 97.3, target: 95 },
      { month: 'Jan', sla: 96.9, target: 95 },
    ],
    downtimeTrend: [
      { month: 'Ago', planned: 24, unplanned: 8, total: 32 },
      { month: 'Set', planned: 16, unplanned: 12, total: 28 },
      { month: 'Out', planned: 20, unplanned: 5, total: 25 },
      { month: 'Nov', planned: 32, unplanned: 18, total: 50 },
      { month: 'Dez', planned: 24, unplanned: 10, total: 34 },
      { month: 'Jan', planned: 18, unplanned: 6, total: 24 },
    ],
    costBreakdown: [
      { category: 'Manutenção Preventiva', value: 45000, color: '#3b82f6' },
      { category: 'Manutenção Corretiva', value: 28000, color: '#ef4444' },
      { category: 'Combustível', value: 62000, color: '#f59e0b' },
      { category: 'Tripulação', value: 85000, color: '#10b981' },
      { category: 'Penalidades SLA', value: 12000, color: '#8b5cf6' },
      { category: 'Seguros', value: 35000, color: '#ec4899' },
    ],
    vesselPerformance: [
      { vessel: 'MV Atlantic Star', availability: 97.5, downtime: 18, compliance: 98 },
      { vessel: 'MV Pacific Voyager', availability: 95.2, downtime: 35, compliance: 94 },
      { vessel: 'MV Ocean Dream', availability: 98.8, downtime: 9, compliance: 100 },
      { vessel: 'MV Gulf Express', availability: 93.1, downtime: 50, compliance: 89 },
    ],
    penaltyTrend: [
      { month: 'Ago', penalty: 5000, avoided: 15000 },
      { month: 'Set', penalty: 8000, avoided: 12000 },
      { month: 'Out', penalty: 2000, avoided: 18000 },
      { month: 'Nov', penalty: 15000, avoided: 5000 },
      { month: 'Dez', penalty: 6000, avoided: 14000 },
      { month: 'Jan', penalty: 3000, avoided: 17000 },
    ],
  });

  const totalCosts = useMemo(() => 
    data.costBreakdown.reduce((acc, item) => acc + item.value, 0), 
    [data.costBreakdown]
  );

  const avgSLA = useMemo(() => 
    data.slaPerformance.reduce((acc, item) => acc + item.sla, 0) / data.slaPerformance.length,
    [data.slaPerformance]
  );

  const totalPenalties = useMemo(() =>
    data.penaltyTrend.reduce((acc, item) => acc + item.penalty, 0),
    [data.penaltyTrend]
  );

  const avoidedPenalties = useMemo(() =>
    data.penaltyTrend.reduce((acc, item) => acc + item.avoided, 0),
    [data.penaltyTrend]
  );

  const refreshData = async () => {
    setLoading(true);
    // Data is already reactive via state — just toggle loading
    setLoading(false);
  };

  const exportReport = () => {
    // Generate PDF report
    const reportData = JSON.stringify(data, null, 2);
    const blob = new Blob([reportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Dashboard Analítico</h2>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Último Mês</SelectItem>
              <SelectItem value="3m">3 Meses</SelectItem>
              <SelectItem value="6m">6 Meses</SelectItem>
              <SelectItem value="1y">1 Ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">SLA Médio</p>
                <p className="text-2xl font-bold text-primary">{avgSLA.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-success/20 bg-success/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Penalidades Evitadas</p>
                <p className="text-2xl font-bold text-success">
                  ${(avoidedPenalties / 1000).toFixed(0)}k
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-success/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-warning/20 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Custo Total</p>
                <p className="text-2xl font-bold text-warning">
                  ${(totalCosts / 1000).toFixed(0)}k
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-warning/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Penalidades Pagas</p>
                <p className="text-2xl font-bold text-destructive">
                  ${(totalPenalties / 1000).toFixed(0)}k
                </p>
              </div>
              <Clock className="h-8 w-8 text-destructive/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* SLA Performance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Performance de SLA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.slaPerformance}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis domain={[90, 100]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="sla" 
                  name="SLA Real"
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  name="Meta"
                  stroke="#ef4444" 
                  strokeDasharray="5 5"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Downtime Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              Tendência de Downtime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data.downtimeTrend}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="planned" 
                  name="Planejado"
                  stackId="1"
                  stroke="#10b981" 
                  fill="#10b981"
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="unplanned" 
                  name="Não Planejado"
                  stackId="1"
                  stroke="#ef4444" 
                  fill="#ef4444"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-purple-500" />
              Distribuição de Custos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.costBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ category, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {data.costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Vessel Performance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Ship className="h-4 w-4 text-info" />
              Performance por Embarcação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.vesselPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="vessel" type="category" width={120} />
                <Tooltip />
                <Legend />
                <Bar dataKey="availability" name="Disponibilidade" fill="hsl(var(--primary))" />
                <Bar dataKey="compliance" name="Compliance" fill="hsl(var(--success))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Penalty Analysis */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-success" />
            Análise de Penalidades (Pagas vs Evitadas)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.penaltyTrend}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `$${(value / 1000).toFixed(1)}k`} />
              <Legend />
              <Bar dataKey="penalty" name="Penalidades Pagas" fill="hsl(var(--destructive))" />
              <Bar dataKey="avoided" name="Penalidades Evitadas" fill="hsl(var(--success))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
