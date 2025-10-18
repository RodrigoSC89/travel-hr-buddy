// ETAPA 32.2: Technical Performance Dashboard by Vessel
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Download, TrendingUp, AlertCircle, Activity, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

interface PerformanceMetrics {
  id: string;
  vessel_id: string;
  vessel_name: string;
  metric_date: string;
  compliance_percentage: number;
  failure_frequency_by_system: Record<string, number>;
  mttr_hours: number;
  ai_vs_human_actions: {
    ai_actions: number;
    human_actions: number;
  };
  training_completions: number;
  total_incidents: number;
  resolved_incidents: number;
}

export const PerformanceDashboard: React.FC = () => {
  const [vessels, setVessels] = useState<string[]>([]);
  const [selectedVessel, setSelectedVessel] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVessels();
  }, []);

  const loadVessels = async () => {
    try {
      // Get distinct vessels from dp_incidents
      const { data, error } = await supabase
        .from("dp_incidents")
        .select("vessel")
        .order("vessel");

      if (error) throw error;

      const uniqueVessels = [...new Set(data?.map((d) => d.vessel) || [])];
      setVessels(uniqueVessels);
      if (uniqueVessels.length > 0) {
        setSelectedVessel(uniqueVessels[0]);
      }
    } catch (error: any) {
      console.error("Erro ao carregar embarcações:", error);
      toast.error("Erro ao carregar lista de embarcações");
    }
  };

  const calculateMetrics = async () => {
    if (!selectedVessel) {
      toast.error("Selecione uma embarcação");
      return;
    }

    setLoading(true);
    try {
      // Call PostgreSQL function to calculate metrics
      const { data, error } = await supabase.rpc("calculate_vessel_performance_metrics", {
        p_vessel_id: selectedVessel,
        p_start_date: startDate,
        p_end_date: endDate,
      });

      if (error) throw error;

      // Format the data
      if (data && data.length > 0) {
        const metricsData: PerformanceMetrics = {
          id: crypto.randomUUID(),
          vessel_id: selectedVessel,
          vessel_name: selectedVessel,
          metric_date: endDate,
          compliance_percentage: data[0].compliance_percentage || 0,
          failure_frequency_by_system: data[0].failure_frequency || {},
          mttr_hours: data[0].mttr_hours || 0,
          ai_vs_human_actions: data[0].ai_vs_human || { ai_actions: 0, human_actions: 0 },
          training_completions: data[0].training_count || 0,
          total_incidents: data[0].incident_count || 0,
          resolved_incidents: data[0].resolved_count || 0,
        };

        setMetrics([metricsData]);
        toast.success("Métricas calculadas com sucesso!");
      } else {
        toast.info("Nenhum dado encontrado para o período selecionado");
        setMetrics([]);
      }
    } catch (error: any) {
      console.error("Erro ao calcular métricas:", error);
      toast.error(error.message || "Erro ao calcular métricas");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (metrics.length === 0) {
      toast.error("Nenhuma métrica para exportar");
      return;
    }

    const csvContent = [
      ["Embarcação", "Data", "Conformidade (%)", "MTTR (horas)", "Incidentes Totais", "Incidentes Resolvidos", "Treinamentos"],
      ...metrics.map((m) => [
        m.vessel_name,
        m.metric_date,
        m.compliance_percentage.toFixed(2),
        m.mttr_hours.toFixed(2),
        m.total_incidents,
        m.resolved_incidents,
        m.training_completions,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `performance-${selectedVessel}-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV exportado com sucesso!");
  };

  const radarData = metrics.length > 0 ? [
    { subject: "Conformidade", value: metrics[0].compliance_percentage, fullMark: 100 },
    { subject: "Taxa Resolução", value: metrics[0].total_incidents > 0 ? (metrics[0].resolved_incidents / metrics[0].total_incidents) * 100 : 0, fullMark: 100 },
    { subject: "Treinamentos", value: Math.min(metrics[0].training_completions * 10, 100), fullMark: 100 },
    { subject: "Eficiência IA", value: metrics[0].ai_vs_human_actions.ai_actions > 0 ? 80 : 20, fullMark: 100 },
  ] : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Painel de Performance Técnica por Embarcação</CardTitle>
          <CardDescription>
            Métricas técnicas críticas agregadas por navio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vessel-select">Embarcação</Label>
              <Select value={selectedVessel} onValueChange={setSelectedVessel}>
                <SelectTrigger id="vessel-select">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {vessels.map((vessel) => (
                    <SelectItem key={vessel} value={vessel}>
                      {vessel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start-date">Data Inicial</Label>
              <input
                id="start-date"
                type="date"
                className="w-full px-3 py-2 border rounded-md"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">Data Final</Label>
              <input
                id="end-date"
                type="date"
                className="w-full px-3 py-2 border rounded-md"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={calculateMetrics} disabled={loading} className="flex-1">
                {loading ? "Calculando..." : "Calcular"}
              </Button>
              <Button onClick={exportCSV} variant="outline" disabled={metrics.length === 0}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {metrics.length > 0 && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Conformidade</p>
                    <p className="text-2xl font-bold">{metrics[0].compliance_percentage.toFixed(1)}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">MTTR</p>
                    <p className="text-2xl font-bold">{metrics[0].mttr_hours.toFixed(1)}h</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Incidentes</p>
                    <p className="text-2xl font-bold">{metrics[0].total_incidents}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Resolvidos</p>
                    <p className="text-2xl font-bold">{metrics[0].resolved_incidents}</p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Geral</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Performance" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* AI vs Human Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações IA vs Humanas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={[
                    {
                      name: "Ações",
                      IA: metrics[0].ai_vs_human_actions.ai_actions,
                      Humanas: metrics[0].ai_vs_human_actions.human_actions,
                    },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="IA" fill="#8884d8" />
                  <Bar dataKey="Humanas" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
