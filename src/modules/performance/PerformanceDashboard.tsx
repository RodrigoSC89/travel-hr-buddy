/**
import { useEffect, useState, useCallback } from "react";;
 * PATCH 95.0 - Performance Dashboard Module
 * Dashboard with operational KPIs and AI-powered performance analysis
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp,
  Download,
  Ship,
  Fuel,
  Clock,
  AlertTriangle,
  Filter,
  RefreshCw
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { runAIContext } from "@/ai/kernel";
import { getPerformanceStatus } from "@/lib/insights/performance";
import { exportPerformancePDF } from "@/lib/pdf/performance-report";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays } from "date-fns";

interface PerformanceMetrics {
  fuelEfficiency: number;
  navigationHours: number;
  productivity: number;
  downtime: number;
  totalMissions: number;
}

interface ChartData {
  name: string;
  value: number;
  label?: string;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [fuelData, setFuelData] = useState<ChartData[]>([]);
  const [productivityData, setProductivityData] = useState<ChartData[]>([]);
  const [downtimeData, setDowntimeData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string>("");
  const [performanceStatus, setPerformanceStatus] = useState<string>("loading");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("7");
  const [selectedVessel, setSelectedVessel] = useState<string>("all");
  const [selectedMissionType, setSelectedMissionType] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    loadPerformanceData();
  }, [selectedPeriod, selectedVessel, selectedMissionType]);

  const loadPerformanceData = async () => {
    setIsLoading(true);
    try {
      // Log dashboard access

      // Calculate date range
      const endDate = new Date();
      const startDate = subDays(endDate, parseInt(selectedPeriod));

      // Using mock data as these tables don't exist yet
      // TODO: Create fleet_logs, mission_activities, fuel_usage tables
      const fleetLogs: unknown[] = [];
      const missionActivities: unknown[] = [];
      const fuelUsage: unknown[] = [];

      // If tables don't exist, use simulated data
      const simulatedMetrics: PerformanceMetrics = {
        fuelEfficiency: 94.2,
        navigationHours: 156,
        productivity: 87.5,
        downtime: 4.3,
        totalMissions: 23
      };

      const simulatedFuelData: ChartData[] = [
        { name: "Missão A", value: 95.2, label: "Otimizado" },
        { name: "Missão B", value: 89.8, label: "Normal" },
        { name: "Missão C", value: 92.4, label: "Otimizado" },
        { name: "Missão D", value: 88.1, label: "Normal" },
        { name: "Missão E", value: 96.7, label: "Excelente" },
      ];

      const simulatedProductivityData: ChartData[] = [
        { name: "Semana 1", value: 145 },
        { name: "Semana 2", value: 162 },
        { name: "Semana 3", value: 158 },
        { name: "Semana 4", value: 171 },
      ];

      const simulatedDowntimeData: ChartData[] = [
        { name: "Manutenção", value: 45 },
        { name: "Clima", value: 18 },
        { name: "Operacional", value: 12 },
        { name: "Técnico", value: 25 },
      ];

      setMetrics(simulatedMetrics);
      setFuelData(simulatedFuelData);
      setProductivityData(simulatedProductivityData);
      setDowntimeData(simulatedDowntimeData);

      // Get AI performance analysis
      const aiResponse = await runAIContext({
        module: "operations.performance",
        action: "analyze",
        context: {
          metrics: simulatedMetrics,
          period: selectedPeriod
        }
      });

      setAiInsight(aiResponse.message);

      // Evaluate performance status
      const status = getPerformanceStatus(simulatedMetrics);
      setPerformanceStatus(status);

      toast({
        title: "Dashboard Atualizado",
        description: "Dados de performance carregados com sucesso",
      });

    } catch (error) {
      console.error("[Performance Dashboard] Error loading data:", error);
      console.error("[Performance Dashboard] Error loading data:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados de performance",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      if (!metrics) return;

      toast({
        title: "Gerando PDF",
        description: "Preparando relatório de performance...",
      });

      await exportPerformancePDF({
        metrics,
        fuelData,
        productivityData,
        downtimeData,
        aiInsight,
        performanceStatus,
        period: selectedPeriod,
        vessel: selectedVessel,
        missionType: selectedMissionType
      });

      toast({
        title: "PDF Gerado",
        description: "Relatório de performance exportado com sucesso",
      });

    } catch (error) {
      console.error("[Performance Dashboard] PDF export error:", error);
      console.error("[Performance Dashboard] PDF export error:", error);
      toast({
        title: "Erro",
        description: "Falha ao gerar PDF",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "destructive" | "outline" | "secondary", label: string }> = {
      optimal: { variant: "default", label: "Ótimo" },
      average: { variant: "secondary", label: "Médio" },
      critical: { variant: "destructive", label: "Crítico" },
      loading: { variant: "outline", label: "Carregando..." }
    };

    const config = variants[status] || variants.loading;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Dashboard de Performance</h1>
            <p className="text-sm text-muted-foreground">
              Análise operacional com KPIs e inteligência artificial
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadPerformanceData} variant="outline" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button onClick={handleExportPDF} disabled={isLoading || !metrics}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Período</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
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
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a embarcação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="vessel-1">Embarcação 1</SelectItem>
                  <SelectItem value="vessel-2">Embarcação 2</SelectItem>
                  <SelectItem value="vessel-3">Embarcação 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Missão</label>
              <Select value={selectedMissionType} onValueChange={setSelectedMissionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="transport">Transporte</SelectItem>
                  <SelectItem value="inspection">Inspeção</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Eficiência de Combustível</CardTitle>
              <Fuel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.fuelEfficiency}%</div>
              <p className="text-xs text-muted-foreground">Acima do esperado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Horas Navegadas</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.navigationHours}h</div>
              <p className="text-xs text-muted-foreground">{metrics.totalMissions} missões</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Produtividade</CardTitle>
              <Ship className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.productivity}%</div>
              <p className="text-xs text-muted-foreground">Performance média</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Downtime</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.downtime}%</div>
              <p className="text-xs text-muted-foreground">Frota total</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Insight Card */}
      {aiInsight && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Análise de IA - Performance
              {getStatusBadge(performanceStatus)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{aiInsight}</p>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuel Efficiency Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Eficiência de Consumo por Missão</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fuelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#0088FE" name="Eficiência (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Productivity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Horas Navegadas vs Produtividade</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#00C49F" 
                  strokeWidth={2}
                  name="Horas"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Downtime Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Downtime da Frota por Causa</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={downtimeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {downtimeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-[300px]">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Carregando dados...</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PerformanceDashboard;
