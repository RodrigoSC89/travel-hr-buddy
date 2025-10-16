import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import {
  TrendingUp,
  AlertTriangle,
  Ship,
  Activity,
  Download,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

interface MetricaRisco {
  risco_nivel: string;
  total_auditorias: number;
  total_falhas_criticas: number;
  embarcacoes: string[];
  media_score: number;
}

interface EvolucaoMensal {
  mes: string;
  ano: number;
  total_auditorias: number;
  total_falhas_criticas: number;
  media_score: number;
}

interface MetricaEmbarcacao {
  nome_navio: string;
  total_auditorias: number;
  total_falhas_criticas: number;
  media_score: number;
  ultima_auditoria: string;
}

const RISK_COLORS = {
  critico: "#dc2626",
  alto: "#ea580c",
  medio: "#f59e0b",
  baixo: "#10b981",
  negligivel: "#6b7280",
  indefinido: "#9ca3af"
};

const RISK_LABELS = {
  critico: "Crítico",
  alto: "Alto",
  medio: "Médio",
  baixo: "Baixo",
  negligivel: "Negligível",
  indefinido: "Indefinido"
};

export const MetricasPanel: React.FC = () => {
  const [metricasRisco, setMetricasRisco] = useState<MetricaRisco[]>([]);
  const [evolucaoMensal, setEvolucaoMensal] = useState<EvolucaoMensal[]>([]);
  const [metricasEmbarcacao, setMetricasEmbarcacao] = useState<MetricaEmbarcacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [embarcacaoSelecionada, setEmbarcacaoSelecionada] = useState<string>("todas");

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Load metrics by risk level
      const resMetricas = await fetch("/api/admin/metrics");
      if (resMetricas.ok) {
        const dataMetricas = await resMetricas.json();
        setMetricasRisco(dataMetricas);
      }

      // Load monthly evolution
      const resEvolucao = await fetch("/api/admin/metrics/evolucao-mensal");
      if (resEvolucao.ok) {
        const dataEvolucao = await resEvolucao.json();
        setEvolucaoMensal(dataEvolucao);
      }

      // Load vessel metrics
      const resEmbarcacoes = await fetch("/api/admin/metrics/por-embarcacao");
      if (resEmbarcacoes.ok) {
        const dataEmbarcacoes = await resEmbarcacoes.json();
        setMetricasEmbarcacao(dataEmbarcacoes);
      }

      toast.success("Métricas carregadas com sucesso!");
    } catch (error) {
      console.error("Erro ao carregar métricas:", error);
      toast.error("Erro ao carregar métricas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const exportarCSV = () => {
    // Export metrics to CSV
    const csvContent = [
      ["Nível de Risco", "Total Auditorias", "Falhas Críticas", "Média Score"],
      ...metricasRisco.map(m => [
        RISK_LABELS[m.risco_nivel as keyof typeof RISK_LABELS],
        m.total_auditorias,
        m.total_falhas_criticas,
        m.media_score
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `metricas-auditorias-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("CSV exportado com sucesso!");
  };

  // Filter vessel metrics if a specific vessel is selected
  const metricasFiltradas = embarcacaoSelecionada === "todas" 
    ? metricasEmbarcacao 
    : metricasEmbarcacao.filter(m => m.nome_navio === embarcacaoSelecionada);

  // Prepare data for charts
  const pieChartData = metricasRisco.map(m => ({
    name: RISK_LABELS[m.risco_nivel as keyof typeof RISK_LABELS],
    value: m.total_auditorias,
    color: RISK_COLORS[m.risco_nivel as keyof typeof RISK_COLORS]
  }));

  const evolucaoChartData = evolucaoMensal.map(e => ({
    mes: `${e.mes}/${e.ano}`,
    falhas: e.total_falhas_criticas,
    auditorias: e.total_auditorias,
    score: e.media_score
  }));

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Painel de Métricas</h2>
          <p className="text-sm text-muted-foreground">
            Dashboard analítico de auditorias e riscos
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={carregarDados}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button
            variant="outline"
            onClick={exportarCSV}
            disabled={metricasRisco.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-8 w-8 text-blue-600" />
              <Badge className="bg-blue-600 text-white">Total</Badge>
            </div>
            <h3 className="text-sm font-medium text-blue-700 mb-1">Total Auditorias</h3>
            <p className="text-3xl font-bold text-blue-900">
              {metricasRisco.reduce((sum, m) => sum + Number(m.total_auditorias), 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <Badge className="bg-red-600 text-white">Crítico</Badge>
            </div>
            <h3 className="text-sm font-medium text-red-700 mb-1">Falhas Críticas</h3>
            <p className="text-3xl font-bold text-red-900">
              {metricasRisco.reduce((sum, m) => sum + Number(m.total_falhas_criticas), 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <Badge className="bg-green-600 text-white">Média</Badge>
            </div>
            <h3 className="text-sm font-medium text-green-700 mb-1">Score Médio</h3>
            <p className="text-3xl font-bold text-green-900">
              {metricasRisco.length > 0
                ? (metricasRisco.reduce((sum, m) => sum + Number(m.media_score), 0) / metricasRisco.length).toFixed(1)
                : "0"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Ship className="h-8 w-8 text-purple-600" />
              <Badge className="bg-purple-600 text-white">Frota</Badge>
            </div>
            <h3 className="text-sm font-medium text-purple-700 mb-1">Embarcações</h3>
            <p className="text-3xl font-bold text-purple-900">
              {metricasEmbarcacao.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter by Vessel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtro por Embarcação</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={embarcacaoSelecionada} onValueChange={setEmbarcacaoSelecionada}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Selecione uma embarcação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as Embarcações</SelectItem>
              {metricasEmbarcacao.map((m) => (
                <SelectItem key={m.nome_navio} value={m.nome_navio}>
                  {m.nome_navio}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição por Nível de Risco</CardTitle>
            <CardDescription>Comparativo entre auditorias por risco</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Evolution Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Evolução Mensal de Falhas Críticas</CardTitle>
            <CardDescription>Tendência dos últimos 12 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolucaoChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="falhas" 
                  stroke="#dc2626" 
                  strokeWidth={2}
                  name="Falhas Críticas"
                />
                <Line 
                  type="monotone" 
                  dataKey="auditorias" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Total Auditorias"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Risk Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Métricas por Nível de Risco</CardTitle>
          <CardDescription>Análise detalhada por categoria de risco</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Nível de Risco</th>
                  <th className="text-center py-3 px-4">Auditorias</th>
                  <th className="text-center py-3 px-4">Falhas Críticas</th>
                  <th className="text-center py-3 px-4">Média Score</th>
                  <th className="text-left py-3 px-4">Embarcações</th>
                </tr>
              </thead>
              <tbody>
                {metricasRisco.map((metrica, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <Badge 
                        style={{ 
                          backgroundColor: RISK_COLORS[metrica.risco_nivel as keyof typeof RISK_COLORS],
                          color: "white"
                        }}
                      >
                        {RISK_LABELS[metrica.risco_nivel as keyof typeof RISK_LABELS]}
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-4 font-semibold">
                      {metrica.total_auditorias}
                    </td>
                    <td className="text-center py-3 px-4 font-semibold text-red-600">
                      {metrica.total_falhas_criticas}
                    </td>
                    <td className="text-center py-3 px-4 font-semibold">
                      {Number(metrica.media_score).toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {metrica.embarcacoes?.join(", ") || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Vessel Metrics Table */}
      {metricasFiltradas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Métricas por Embarcação</CardTitle>
            <CardDescription>
              {embarcacaoSelecionada === "todas" 
                ? "Todas as embarcações" 
                : `Filtrado por: ${embarcacaoSelecionada}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Embarcação</th>
                    <th className="text-center py-3 px-4">Auditorias</th>
                    <th className="text-center py-3 px-4">Falhas Críticas</th>
                    <th className="text-center py-3 px-4">Média Score</th>
                    <th className="text-center py-3 px-4">Última Auditoria</th>
                  </tr>
                </thead>
                <tbody>
                  {metricasFiltradas.map((metrica, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-semibold">{metrica.nome_navio}</td>
                      <td className="text-center py-3 px-4">{metrica.total_auditorias}</td>
                      <td className="text-center py-3 px-4 font-semibold text-red-600">
                        {metrica.total_falhas_criticas}
                      </td>
                      <td className="text-center py-3 px-4">
                        {Number(metrica.media_score).toFixed(1)}
                      </td>
                      <td className="text-center py-3 px-4 text-sm text-muted-foreground">
                        {new Date(metrica.ultima_auditoria).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MetricasPanel;
