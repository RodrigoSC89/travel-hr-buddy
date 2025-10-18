import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Ship,
  BarChart3,
} from "lucide-react";
import { getEffectivenessLevel } from "@/types/sgso-effectiveness";
import type {
  SGSOEffectivenessMetric,
  SGSOEffectivenessByVessel,
  SGSOEffectivenessResponse,
} from "@/types/sgso-effectiveness";

const COLORS = {
  green: "#22c55e",
  yellow: "#eab308",
  orange: "#f97316",
  red: "#ef4444",
};

export const SGSOEffectivenessChart = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generalData, setGeneralData] = useState<SGSOEffectivenessResponse | null>(null);
  const [vesselData, setVesselData] = useState<SGSOEffectivenessResponse | null>(null);
  const [activeView, setActiveView] = useState<"general" | "vessel" | "detailed">("general");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch general effectiveness data
        const generalResponse = await fetch("/api/sgso/effectiveness");
        if (!generalResponse.ok) {
          throw new Error("Failed to fetch general effectiveness data");
        }
        const general = await generalResponse.json();
        setGeneralData(general);

        // Fetch vessel-specific effectiveness data
        const vesselResponse = await fetch("/api/sgso/effectiveness?by_vessel=true");
        if (!vesselResponse.ok) {
          throw new Error("Failed to fetch vessel effectiveness data");
        }
        const vessel = await vesselResponse.json();
        setVesselData(vessel);
      } catch (err) {
        console.error("Error fetching effectiveness data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderSummaryCards = (data: SGSOEffectivenessResponse | null) => {
    if (!data) return null;

    const { summary } = data;
    const level = getEffectivenessLevel(summary.overall_effectiveness);

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Incidentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_incidents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registrados no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Incidentes Repetidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {summary.total_repeated}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Recorrências detectadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Efetividade Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold text-${level.color}-600`}>
              {summary.overall_effectiveness.toFixed(1)}%
            </div>
            <Badge
              variant="outline"
              className={`mt-1 border-${level.color}-300 text-${level.color}-700`}
            >
              {level.icon} {level.label}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.overall_effectiveness >= 90 ? (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">Excelente</span>
              </div>
            ) : summary.overall_effectiveness >= 75 ? (
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-600">Bom</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-600">Requer atenção</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Baseado em planos de ação
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderEffectivenessChart = (data: SGSOEffectivenessMetric[]) => {
    const chartData = data.map((item) => ({
      category: item.category,
      effectiveness: Number(item.effectiveness_percentage),
      total: Number(item.total_incidents),
      repeated: Number(item.repeated_incidents),
      avgDays: item.avg_resolution_days ? Number(item.avg_resolution_days) : null,
    }));

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis label={{ value: "Efetividade (%)", angle: -90, position: "insideLeft" }} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              const data = payload[0].payload;
              const level = getEffectivenessLevel(data.effectiveness);
              return (
                <Card className="p-3">
                  <p className="font-semibold mb-2">{data.category}</p>
                  <div className="space-y-1 text-sm">
                    <p className="flex items-center gap-2">
                      <Badge variant="outline" className={`border-${level.color}-300`}>
                        {level.icon} {data.effectiveness.toFixed(1)}%
                      </Badge>
                      <span className="text-muted-foreground">{level.label}</span>
                    </p>
                    <p>Total: {data.total} incidentes</p>
                    <p>Repetidos: {data.repeated} incidentes</p>
                    {data.avgDays !== null && (
                      <p className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Média: {data.avgDays} dias
                      </p>
                    )}
                  </div>
                </Card>
              );
            }}
          />
          <Legend />
          <Bar dataKey="effectiveness" name="Efetividade (%)">
            {chartData.map((entry, index) => {
              const level = getEffectivenessLevel(entry.effectiveness);
              return <Cell key={`cell-${index}`} fill={COLORS[level.color]} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderDetailedTable = (data: SGSOEffectivenessMetric[] | SGSOEffectivenessByVessel[]) => {
    const isVesselData = "vessel_name" in (data[0] || {});

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              {isVesselData && (
                <th className="text-left p-3 font-semibold">Embarcação</th>
              )}
              <th className="text-left p-3 font-semibold">Categoria</th>
              <th className="text-center p-3 font-semibold">Incidências</th>
              <th className="text-center p-3 font-semibold">Repetidas</th>
              <th className="text-center p-3 font-semibold">Efetividade</th>
              <th className="text-center p-3 font-semibold">Média de Resolução</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const level = getEffectivenessLevel(Number(item.effectiveness_percentage));
              const vesselItem = item as SGSOEffectivenessByVessel;
              return (
                <tr key={index} className="border-b hover:bg-muted/50">
                  {isVesselData && (
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Ship className="h-4 w-4 text-muted-foreground" />
                        {vesselItem.vessel_name}
                      </div>
                    </td>
                  )}
                  <td className="p-3">{item.category}</td>
                  <td className="text-center p-3">{item.total_incidents}</td>
                  <td className="text-center p-3 text-orange-600 font-medium">
                    {item.repeated_incidents}
                  </td>
                  <td className="text-center p-3">
                    <Badge
                      variant="outline"
                      className={`border-${level.color}-300 text-${level.color}-700`}
                    >
                      {level.icon} {Number(item.effectiveness_percentage).toFixed(1)}%
                    </Badge>
                  </td>
                  <td className="text-center p-3">
                    {item.avg_resolution_days !== null ? (
                      <span className="flex items-center justify-center gap-1">
                        <Clock className="h-3 w-3" />
                        {Number(item.avg_resolution_days).toFixed(1)} dias
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderInsights = (data: SGSOEffectivenessResponse | null) => {
    if (!data || data.data.length === 0) return null;

    const metrics = data.data as SGSOEffectivenessMetric[];
    const lowestEffectiveness = metrics.reduce((min, item) =>
      Number(item.effectiveness_percentage) < Number(min.effectiveness_percentage) ? item : min
    );
    const highestRepeated = metrics.reduce((max, item) =>
      Number(item.repeated_incidents) > Number(max.repeated_incidents) ? item : max
    );

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Insights Estratégicos
          </CardTitle>
          <CardDescription>
            Recomendações para melhoria contínua do QSMS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Number(lowestEffectiveness.effectiveness_percentage) < 75 && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">
                ⚠️ Categoria com menor efetividade
              </h4>
              <p className="text-sm text-orange-800">
                A categoria <strong>{lowestEffectiveness.category}</strong> apresenta
                efetividade de {Number(lowestEffectiveness.effectiveness_percentage).toFixed(1)}%
                com {lowestEffectiveness.repeated_incidents} incidentes repetidos.
                Recomenda-se revisar os planos de ação e implementar controles adicionais.
              </p>
            </div>
          )}

          {Number(highestRepeated.repeated_incidents) > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">
                🔄 Alta recorrência detectada
              </h4>
              <p className="text-sm text-yellow-800">
                <strong>{highestRepeated.category}</strong> tem {highestRepeated.repeated_incidents}
                {" "}incidentes repetidos. Considere:
              </p>
              <ul className="list-disc list-inside text-sm text-yellow-800 mt-2 space-y-1">
                <li>Análise de causa raiz mais profunda</li>
                <li>Treinamento adicional para a equipe</li>
                <li>Revisão de procedimentos operacionais</li>
              </ul>
            </div>
          )}

          {data.summary.overall_effectiveness >= 90 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">
                ✅ Excelente desempenho geral
              </h4>
              <p className="text-sm text-green-800">
                O sistema está atingindo {data.summary.overall_effectiveness.toFixed(1)}% de
                efetividade. Continue monitorando e compartilhando as melhores práticas entre
                as embarcações.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Carregando dados de efetividade...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div>
              <p className="font-semibold text-lg mb-2">Erro ao carregar dados</p>
              <p className="text-muted-foreground">{error}</p>
            </div>
            <Button onClick={() => window.location.reload()} variant="outline">
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!generalData || generalData.data.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <BarChart3 className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="font-semibold text-lg mb-2">Nenhum dado disponível</p>
              <p className="text-muted-foreground">
                Ainda não há incidentes com categorias SGSO registrados para análise de efetividade.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as typeof activeView)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">
            <Target className="mr-2 h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="vessel">
            <Ship className="mr-2 h-4 w-4" />
            Por Embarcação
          </TabsTrigger>
          <TabsTrigger value="detailed">
            <BarChart3 className="mr-2 h-4 w-4" />
            Detalhado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          {renderSummaryCards(generalData)}
          <Card>
            <CardHeader>
              <CardTitle>Efetividade por Categoria SGSO</CardTitle>
              <CardDescription>
                Percentual de efetividade dos planos de ação por tipo de incidente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderEffectivenessChart(generalData.data as SGSOEffectivenessMetric[])}
            </CardContent>
          </Card>
          {renderInsights(generalData)}
        </TabsContent>

        <TabsContent value="vessel" className="space-y-4">
          {vesselData && renderSummaryCards(vesselData)}
          <Card>
            <CardHeader>
              <CardTitle>Efetividade por Embarcação</CardTitle>
              <CardDescription>
                Comparação de efetividade entre diferentes embarcações
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vesselData && renderDetailedTable(vesselData.data)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visão Detalhada - Todas as Categorias</CardTitle>
              <CardDescription>
                Métricas completas de efetividade e tempo de resolução
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generalData && renderDetailedTable(generalData.data)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
