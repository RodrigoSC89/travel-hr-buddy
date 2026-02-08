/**
 * Performance Dashboard - Integrado com dados reais do Supabase
 * Usa vessel_performance, fuel_records e maintenance_tasks
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, Download, Ship, Fuel, Clock, AlertTriangle, Filter, RefreshCw
} from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { subDays, format } from "date-fns";
import { logger } from '@/lib/logger';

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const PerformanceDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("30");
  const [selectedVessel, setSelectedVessel] = useState<string>("all");
  const { toast } = useToast();

  const startDate = subDays(new Date(), parseInt(selectedPeriod)).toISOString();

  // Fetch real vessel performance data
  const { data: vesselPerformance, isLoading: loadingPerf, refetch: refetchPerf } = useQuery({
    queryKey: ["vessel-performance", selectedPeriod, selectedVessel],
    queryFn: async () => {
      let query = supabase
        .from("vessel_performance" as "vessel_performance")
        .select("*")
        .gte("created_at", startDate)
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (selectedVessel !== "all") {
        query = query.eq("vessel_id", selectedVessel);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch fuel records
  const { data: fuelRecords } = useQuery({
    queryKey: ["fuel-records-perf", selectedPeriod, selectedVessel],
    queryFn: async () => {
      let query = supabase
        .from("fuel_records")
        .select("*")
        .gte("created_at", startDate)
        .order("created_at", { ascending: false })
        .limit(100);

      if (selectedVessel !== "all") {
        query = query.eq("vessel_id", selectedVessel);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch maintenance tasks for downtime
  const { data: maintenanceTasks } = useQuery({
    queryKey: ["maintenance-downtime", selectedPeriod],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_tasks")
        .select("*")
        .gte("created_at", startDate)
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch vessels for filter
  const { data: vessels } = useQuery({
    queryKey: ["vessels-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vessels")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  // Compute KPIs from real data
  const totalFuelRecords = fuelRecords?.length || 0;
  const avgFuelConsumption = totalFuelRecords > 0
    ? (fuelRecords!.reduce((s, r) => s + (r.quantity_mt || 0), 0) / totalFuelRecords).toFixed(1)
    : "0";

  const totalPerformanceRecords = vesselPerformance?.length || 0;
  const avgPerformanceScore = totalPerformanceRecords > 0
    ? (vesselPerformance!.reduce((s, r) => s + (r.overall_performance_rating || 0), 0) / totalPerformanceRecords).toFixed(1)
    : "0";

  const totalMaintenanceTasks = maintenanceTasks?.length || 0;
  const completedTasks = maintenanceTasks?.filter(t => t.status === "completed").length || 0;
  const downtimePercent = totalMaintenanceTasks > 0 
    ? ((totalMaintenanceTasks - completedTasks) / Math.max(totalMaintenanceTasks, 1) * 100).toFixed(1)
    : "0";

  // Build chart data from real records
  const fuelChartData = (fuelRecords || []).slice(0, 10).map((r) => ({
    name: format(new Date(r.created_at || new Date()), "dd/MM"),
    value: r.quantity_mt || 0,
  }));

  const performanceChartData = (vesselPerformance || []).slice(0, 10).map((r) => ({
    name: format(new Date(r.created_at || new Date()), "dd/MM"),
    value: r.fuel_efficiency_score || 0,
  }));

  // Downtime by status
  const statusCounts: Record<string, number> = {};
  (maintenanceTasks || []).forEach((t) => {
    const s = t.status || "unknown";
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  });
  const downtimeData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  const handleRefresh = () => {
    refetchPerf();
    toast({ title: "Atualizado", description: "Dados de performance recarregados." });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Dashboard de Performance</h1>
            <p className="text-sm text-muted-foreground">
              Dados reais de vessel_performance, fuel_records e maintenance_tasks
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" disabled={loadingPerf}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loadingPerf ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Período</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Embarcação</label>
              <Select value={selectedVessel} onValueChange={setSelectedVessel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {(vessels || []).map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Consumo Médio</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgFuelConsumption} MT</div>
            <p className="text-xs text-muted-foreground">{totalFuelRecords} registros</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <Ship className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPerformanceScore}</div>
            <p className="text-xs text-muted-foreground">{totalPerformanceRecords} avaliações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Manutenção</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMaintenanceTasks}</div>
            <p className="text-xs text-muted-foreground">{completedTasks} concluídas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendências</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{downtimePercent}%</div>
            <p className="text-xs text-muted-foreground">Tarefas não concluídas</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Consumo de Combustível</CardTitle>
          </CardHeader>
          <CardContent>
            {fuelChartData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Fuel className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Sem registros de combustível no período</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={fuelChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" name="Litros" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Eficiência de Combustível por Data</CardTitle>
          </CardHeader>
          <CardContent>
            {performanceChartData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Ship className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Sem registros de performance no período</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} name="Knots" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Manutenção por Status</CardTitle>
          </CardHeader>
          <CardContent>
            {downtimeData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Sem tarefas de manutenção no período</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={downtimeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {downtimeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
