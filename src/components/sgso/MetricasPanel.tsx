import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Ship, AlertTriangle, TrendingUp, FileText } from "lucide-react";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface MetricasRiscoData {
  risco_nivel: string;
  total_auditorias: number;
  falhas_criticas: number;
  score_medio: number;
}

interface EvolucaoMensalData {
  mes: string;
  total_auditorias: number;
  falhas_criticas: number;
}

interface MetricasEmbarcacaoData {
  nome_navio: string;
  total_auditorias: number;
  falhas_criticas: number;
  score_medio: number;
  ultima_auditoria: string;
}

export const MetricasPanel = () => {
  const [metricsRisco, setMetricsRisco] = useState<MetricasRiscoData[]>([]);
  const [evolucaoMensal, setEvolucaoMensal] = useState<EvolucaoMensalData[]>([]);
  const [metricsEmbarcacao, setMetricsEmbarcacao] = useState<MetricasEmbarcacaoData[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, [selectedVessel]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);

      // Fetch risk metrics
      const riscoResponse = await fetch("/api/admin/metrics");
      const riscoData = await riscoResponse.json();
      setMetricsRisco(riscoData || []);

      // Fetch monthly evolution
      const evolucaoResponse = await fetch("/api/admin/metrics/evolucao-mensal");
      const evolucaoData = await evolucaoResponse.json();
      setEvolucaoMensal(evolucaoData || []);

      // Fetch vessel metrics
      const embarcacaoUrl = selectedVessel === "all" 
        ? "/api/admin/metrics/por-embarcacao"
        : `/api/admin/metrics/por-embarcacao?nome_navio=${selectedVessel}`;
      const embarcacaoResponse = await fetch(embarcacaoUrl);
      const embarcacaoData = await embarcacaoResponse.json();
      setMetricsEmbarcacao(embarcacaoData || []);
    } catch (error) {
      console.error("Erro ao buscar métricas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary metrics
  const totalAuditorias = metricsRisco.reduce((sum, item) => sum + item.total_auditorias, 0);
  const totalFalhasCriticas = metricsRisco.reduce((sum, item) => sum + item.falhas_criticas, 0);
  const scoreMediaGeral = metricsRisco.length > 0
    ? metricsRisco.reduce((sum, item) => sum + (item.score_medio * item.total_auditorias), 0) / totalAuditorias
    : 0;
  const totalEmbarcacoes = metricsEmbarcacao.length;

  // Prepare chart data for risk distribution
  const riskColors: Record<string, string> = {
    "Crítico": "#ef4444",
    "Alto": "#f97316",
    "Médio": "#eab308",
    "Baixo": "#22c55e",
    "Negligenciável": "#06b6d4",
    "Não Classificado": "#6b7280"
  };

  const pieChartData = {
    labels: metricsRisco.map(item => item.risco_nivel),
    datasets: [{
      data: metricsRisco.map(item => item.total_auditorias),
      backgroundColor: metricsRisco.map(item => riskColors[item.risco_nivel] || "#6b7280"),
      borderColor: "#fff",
      borderWidth: 2,
    }],
  };

  // Prepare line chart data for monthly evolution
  const lineChartData = {
    labels: evolucaoMensal.map(item => {
      const [year, month] = item.mes.split("-");
      return `${month}/${year}`;
    }),
    datasets: [
      {
        label: "Total Auditorias",
        data: evolucaoMensal.map(item => item.total_auditorias),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
      {
        label: "Falhas Críticas",
        data: evolucaoMensal.map(item => item.falhas_criticas),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const exportToCSV = () => {
    const headers = ["Embarcação", "Total Auditorias", "Falhas Críticas", "Score Médio", "Última Auditoria"];
    const rows = metricsEmbarcacao.map(item => [
      item.nome_navio,
      item.total_auditorias,
      item.falhas_criticas,
      item.score_medio,
      new Date(item.ultima_auditoria).toLocaleDateString("pt-BR"),
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `metricas-sgso-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Get unique vessel names for filter
  const uniqueVessels = Array.from(new Set(metricsEmbarcacao.map(item => item.nome_navio)));

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Auditorias</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAuditorias}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Falhas Críticas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{totalFalhasCriticas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scoreMediaGeral.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Embarcações</CardTitle>
            <Ship className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmbarcacoes}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Export */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Select value={selectedVessel} onValueChange={setSelectedVessel}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Selecionar embarcação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as embarcações</SelectItem>
              {uniqueVessels.map(vessel => (
                <SelectItem key={vessel} value={vessel}>{vessel}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={exportToCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Nível de Risco</CardTitle>
            <CardDescription>Auditorias agrupadas por criticidade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal</CardTitle>
            <CardDescription>Últimos 12 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Line 
                data={lineChartData} 
                options={{ 
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <Tabs defaultValue="risk" className="space-y-4">
        <TabsList>
          <TabsTrigger value="risk">Métricas por Risco</TabsTrigger>
          <TabsTrigger value="vessel">Métricas por Embarcação</TabsTrigger>
        </TabsList>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métricas por Nível de Risco</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Nível de Risco</th>
                      <th className="text-right p-2">Total Auditorias</th>
                      <th className="text-right p-2">Falhas Críticas</th>
                      <th className="text-right p-2">Score Médio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metricsRisco.map((item, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: riskColors[item.risco_nivel] || "#6b7280" }}
                            />
                            {item.risco_nivel}
                          </div>
                        </td>
                        <td className="text-right p-2">{item.total_auditorias}</td>
                        <td className="text-right p-2">{item.falhas_criticas}</td>
                        <td className="text-right p-2">{item.score_medio.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vessel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métricas por Embarcação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Embarcação</th>
                      <th className="text-right p-2">Total Auditorias</th>
                      <th className="text-right p-2">Falhas Críticas</th>
                      <th className="text-right p-2">Score Médio</th>
                      <th className="text-right p-2">Última Auditoria</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metricsEmbarcacao.map((item, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">{item.nome_navio}</td>
                        <td className="text-right p-2">{item.total_auditorias}</td>
                        <td className="text-right p-2">{item.falhas_criticas}</td>
                        <td className="text-right p-2">{item.score_medio.toFixed(2)}</td>
                        <td className="text-right p-2">
                          {new Date(item.ultima_auditoria).toLocaleDateString("pt-BR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
