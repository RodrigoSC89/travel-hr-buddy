"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface StatsData {
  byVessel: Record<string, number>;
  bySeverity: { Alta: number; Média: number; Baixa: number };
  byMonth: Record<string, number>;
}

export default function DPIntelligenceDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dp-intelligence/stats")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching stats:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-muted-foreground">Carregando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Erro ao carregar dados: {error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum dado disponível</p>
      </div>
    );
  }

  const vesselData = Object.entries(stats.byVessel).map(([vessel, count]) => ({
    name: vessel,
    value: count as number,
  }));

  const severityData = Object.entries(stats.bySeverity).map(([severity, count]) => ({
    name: severity,
    value: count as number,
  }));

  const monthData = Object.entries(stats.byMonth)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, count]) => ({
      name: month,
      value: count as number,
    }));

  const COLORS = ["#EF4444", "#FBBF24", "#10B981", "#6366F1", "#3B82F6", "#8B5CF6"];

  return (
    <div className="space-y-8 py-6">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold">📊 Resumo de Incidentes DP</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Por Navio */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">🚢 Por Navio</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vesselData}>
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  style={{ fontSize: "11px" }}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Por Severidade */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">🎯 Por Severidade</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Por Mês */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">📅 Por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthData}>
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  style={{ fontSize: "11px" }}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights Acionáveis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">📈 Insights Acionáveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h3 className="font-semibold mb-2">🔍 Análise de Tendências</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  Total de incidentes registrados:{" "}
                  <strong>{Object.values(stats.byVessel).reduce((a, b) => a + b, 0)}</strong>
                </li>
                <li>
                  Navio com mais incidentes:{" "}
                  <strong>
                    {vesselData.length > 0
                      ? vesselData.reduce((prev, current) =>
                        prev.value > current.value ? prev : current
                      ).name
                      : "N/A"}
                  </strong>
                </li>
                <li>
                  Severidade mais comum:{" "}
                  <strong>
                    {severityData.length > 0
                      ? severityData.reduce((prev, current) =>
                        prev.value > current.value ? prev : current
                      ).name
                      : "N/A"}
                  </strong>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <h3 className="font-semibold mb-2">⚠️ Recomendações</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Revisar protocolos de manutenção preventiva para navios com alta incidência</li>
                <li>Implementar treinamentos específicos focados nas causas mais frequentes</li>
                <li>Monitorar tendências mensais para identificar padrões sazonais</li>
                <li>Desenvolver planos de ação corretiva para incidentes de alta severidade</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <h3 className="font-semibold mb-2">✅ Próximos Passos</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Agendar reuniões com equipes dos navios mais afetados</li>
                <li>Criar relatórios detalhados por tipo de incidente</li>
                <li>Estabelecer metas de redução de incidentes para o próximo trimestre</li>
                <li>Implementar sistema de alertas para incidentes recorrentes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
