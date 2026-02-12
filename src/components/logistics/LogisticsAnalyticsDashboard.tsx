/**
 * LogisticsAnalyticsDashboard - Analytics Avançado de Logística
 * KPIs, gráficos e insights de performance
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Package,
  Truck,
  Ship,
  Clock,
  DollarSign,
  Target,
  Download,
  RefreshCw,
  Calendar,
  Fuel,
  MapPin
} from "lucide-react";

// Mock data
const MONTHLY_DATA = [
  { month: "Jul", entregas: 145, atrasos: 8, custoOperacional: 85000, eficiencia: 94.5 },
  { month: "Ago", entregas: 162, atrasos: 5, custoOperacional: 92000, eficiencia: 96.9 },
  { month: "Set", entregas: 178, atrasos: 12, custoOperacional: 88000, eficiencia: 93.3 },
  { month: "Out", entregas: 189, atrasos: 7, custoOperacional: 95000, eficiencia: 96.3 },
  { month: "Nov", entregas: 201, atrasos: 4, custoOperacional: 98000, eficiencia: 98.0 },
  { month: "Dez", entregas: 215, atrasos: 6, custoOperacional: 102000, eficiencia: 97.2 },
];

const ROUTE_PERFORMANCE = [
  { name: "Santos-Rotterdam", viagens: 24, onTime: 22, eficiencia: 91.7 },
  { name: "Rio-Hamburgo", viagens: 18, onTime: 17, eficiencia: 94.4 },
  { name: "Paranaguá-Xangai", viagens: 12, onTime: 11, eficiencia: 91.7 },
  { name: "Vitória-Antuérpia", viagens: 15, onTime: 14, eficiencia: 93.3 },
];

const COST_BREAKDOWN = [
  { name: "Combustível", value: 42, color: "#ef4444" },
  { name: "Tripulação", value: 28, color: "#3b82f6" },
  { name: "Manutenção", value: 15, color: "#f59e0b" },
  { name: "Porto", value: 10, color: "#22c55e" },
  { name: "Outros", value: 5, color: "#8b5cf6" },
];

const FUEL_CONSUMPTION = [
  { month: "Jul", consumo: 4200, media: 4100 },
  { month: "Ago", consumo: 4350, media: 4100 },
  { month: "Set", consumo: 4100, media: 4100 },
  { month: "Out", consumo: 3950, media: 4100 },
  { month: "Nov", consumo: 3800, media: 4100 },
  { month: "Dez", consumo: 3900, media: 4100 },
];

export const LogisticsAnalyticsDashboard: React.FC = () => {
  const [period, setPeriod] = useState("6m");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    requestAnimationFrame(() => {
      setIsRefreshing(false);
      toast.success("Dados atualizados!");
    });
  };

  const handleExport = () => {
    toast.success("Relatório exportado!", { description: "Download iniciado" });
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Último mês</SelectItem>
              <SelectItem value="3m">3 meses</SelectItem>
              <SelectItem value="6m">6 meses</SelectItem>
              <SelectItem value="1y">1 ano</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Jul - Dez 2025
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Package className="h-5 w-5 text-green-600" />
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12%
              </Badge>
            </div>
            <p className="text-2xl font-bold">1,090</p>
            <p className="text-sm text-muted-foreground">Total de Entregas</p>
            <Progress value={95} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-5 w-5 text-blue-600" />
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2.3%
              </Badge>
            </div>
            <p className="text-2xl font-bold">96.2%</p>
            <p className="text-sm text-muted-foreground">Taxa de Eficiência</p>
            <Progress value={96.2} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30">
                <TrendingDown className="h-3 w-3 mr-1" />
                -15%
              </Badge>
            </div>
            <p className="text-2xl font-bold">42</p>
            <p className="text-sm text-muted-foreground">Atrasos (Total)</p>
            <Progress value={4} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30">
                <TrendingDown className="h-3 w-3 mr-1" />
                -5%
              </Badge>
            </div>
            <p className="text-2xl font-bold">R$ 560K</p>
            <p className="text-sm text-muted-foreground">Custo Operacional</p>
            <Progress value={78} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deliveries Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Entregas vs Atrasos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={MONTHLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="entregas" name="Entregas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="atrasos" name="Atrasos" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Efficiency Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Tendência de Eficiência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={MONTHLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis domain={[90, 100]} fontSize={12} />
                <Tooltip formatter={(value) => [`${value}%`, 'Eficiência']} />
                <Area 
                  type="monotone" 
                  dataKey="eficiencia" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Distribuição de Custos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={COST_BREAKDOWN}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {COST_BREAKDOWN.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {COST_BREAKDOWN.map((item) => (
                <Badge key={item.name} variant="outline" className="text-xs">
                  <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: item.color }} />
                  {item.name}: {item.value}%
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fuel Consumption */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Fuel className="h-4 w-4" />
              Consumo de Combustível (MT)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={FUEL_CONSUMPTION}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="consumo" 
                  name="Consumo Real"
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ fill: '#ef4444' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="media" 
                  name="Média Histórica"
                  stroke="#94a3b8" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Route Performance Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Performance por Rota
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ROUTE_PERFORMANCE.map((route) => (
              <div key={route.name} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Ship className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{route.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {route.viagens} viagens | {route.onTime} no prazo
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-lg">{route.eficiencia}%</p>
                    <p className="text-xs text-muted-foreground">Eficiência</p>
                  </div>
                  <Progress value={route.eficiencia} className="w-24 h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogisticsAnalyticsDashboard;
