import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, Ship, BarChart3 } from "lucide-react";
import type {
  SGSOEffectivenessSummary,
  SGSOEffectivenessViewMode,
  SGSOEffectivenessInsight,
} from "@/types/sgso-effectiveness";

const EFFECTIVENESS_COLORS = {
  excellent: "#22c55e", // Green ≥90%
  good: "#eab308", // Yellow 75-89%
  regular: "#f97316", // Orange 50-74%
  critical: "#ef4444", // Red <50%
};

const getEffectivenessColor = (percentage: number): string => {
  if (percentage >= 90) return EFFECTIVENESS_COLORS.excellent;
  if (percentage >= 75) return EFFECTIVENESS_COLORS.good;
  if (percentage >= 50) return EFFECTIVENESS_COLORS.regular;
  return EFFECTIVENESS_COLORS.critical;
};

const getEffectivenessLabel = (percentage: number): string => {
  if (percentage >= 90) return "Excelente";
  if (percentage >= 75) return "Bom";
  if (percentage >= 50) return "Regular";
  return "Crítico";
};

export const SGSOEffectivenessChart: React.FC = () => {
  const [data, setData] = useState<SGSOEffectivenessSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<SGSOEffectivenessViewMode>("general");

  useEffect(() => {
    fetchEffectivenessData();
  }, []);

  const fetchEffectivenessData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/sgso/effectiveness");
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch effectiveness data");
      }

      setData(result.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching SGSO effectiveness:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = (): SGSOEffectivenessInsight[] => {
    if (!data) return [];

    const insights: SGSOEffectivenessInsight[] = [];

    // Check for low effectiveness categories
    data.by_category.forEach((category) => {
      if (category.effectiveness_percentage < 50) {
        insights.push({
          type: "warning",
          category: category.category,
          message: `${category.category} tem efetividade crítica (${category.effectiveness_percentage}%) com ${category.repeated_incidents} incidentes repetidos.`,
        });
      }
    });

    // Check for high recurrence
    const highRecurrence = data.by_category.filter(
      (c) => Number(c.repeated_incidents) / Number(c.total_incidents) > 0.3
    );

    if (highRecurrence.length > 0) {
      insights.push({
        type: "warning",
        category: "Recorrência",
        message: `${highRecurrence.length} categoria(s) com mais de 30% de incidentes repetidos. Revisar planos de ação.`,
      });
    }

    // Positive feedback for good effectiveness
    const excellentCategories = data.by_category.filter(
      (c) => c.effectiveness_percentage >= 90
    );

    if (excellentCategories.length > 0) {
      insights.push({
        type: "success",
        category: "Destaque",
        message: `${excellentCategories.length} categoria(s) com efetividade excelente (≥90%). Continuar boas práticas.`,
      });
    }

    // Resolution time insights
    if (data.avg_resolution_time !== null) {
      if (data.avg_resolution_time > 15) {
        insights.push({
          type: "warning",
          category: "Tempo de Resolução",
          message: `Tempo médio de resolução (${data.avg_resolution_time.toFixed(1)} dias) está acima do ideal. Revisar processos.`,
        });
      } else if (data.avg_resolution_time < 7) {
        insights.push({
          type: "success",
          category: "Tempo de Resolução",
          message: `Tempo médio de resolução excelente (${data.avg_resolution_time.toFixed(1)} dias).`,
        });
      }
    }

    return insights;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Efetividade SGSO
          </CardTitle>
          <CardDescription>Carregando dados de efetividade...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Erro ao Carregar Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              {error || "Não foi possível carregar os dados de efetividade."}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (data.total_incidents === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Efetividade SGSO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Nenhum incidente SGSO registrado. Os dados de efetividade aparecerão quando incidentes forem cadastrados.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const insights = generateInsights();

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Incidentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.total_incidents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Incidentes Repetidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-destructive">
                {data.total_repeated}
              </div>
              {data.total_repeated > 0 && (
                <TrendingUp className="h-5 w-5 text-destructive" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Efetividade Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div
                className="text-2xl font-bold"
                style={{ color: getEffectivenessColor(data.overall_effectiveness) }}
              >
                {data.overall_effectiveness.toFixed(1)}%
              </div>
              <Badge
                variant="outline"
                style={{
                  borderColor: getEffectivenessColor(data.overall_effectiveness),
                  color: getEffectivenessColor(data.overall_effectiveness),
                }}
              >
                {getEffectivenessLabel(data.overall_effectiveness)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tempo Médio Resolução
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div className="text-2xl font-bold">
                {data.avg_resolution_time?.toFixed(1) || "N/A"}
              </div>
              {data.avg_resolution_time && <span className="text-sm text-muted-foreground">dias</span>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Insights Estratégicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {insights.map((insight, idx) => (
              <Alert
                key={idx}
                variant={insight.type === "warning" ? "destructive" : "default"}
              >
                {insight.type === "warning" ? (
                  <AlertCircle className="h-4 w-4" />
                ) : insight.type === "success" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : null}
                <AlertDescription>
                  <strong>{insight.category}:</strong> {insight.message}
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* View Mode Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Análise de Efetividade</CardTitle>
          <CardDescription>
            Visualize dados por perspectiva geral, embarcação ou detalhes completos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as SGSOEffectivenessViewMode)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">
                <BarChart3 className="mr-2 h-4 w-4" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="vessel">
                <Ship className="mr-2 h-4 w-4" />
                Por Embarcação
              </TabsTrigger>
              <TabsTrigger value="detailed">
                <AlertCircle className="mr-2 h-4 w-4" />
                Detalhado
              </TabsTrigger>
            </TabsList>

            {/* General Overview */}
            <TabsContent value="general" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.by_category}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="effectiveness_percentage"
                      name="Efetividade (%)"
                      fill="#8884d8"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.by_category.map((category) => (
                  <Card key={category.category}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">{category.category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Efetividade:</span>
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: getEffectivenessColor(category.effectiveness_percentage),
                              color: getEffectivenessColor(category.effectiveness_percentage),
                            }}
                          >
                            {category.effectiveness_percentage.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total:</span>
                          <span className="font-medium">{category.total_incidents}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Repetidos:</span>
                          <span className="font-medium text-destructive">
                            {category.repeated_incidents}
                          </span>
                        </div>
                        {category.avg_resolution_days && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Tempo médio:</span>
                            <span className="font-medium">
                              {category.avg_resolution_days.toFixed(1)} dias
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* By Vessel */}
            <TabsContent value="vessel" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.by_vessel}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="vessel_name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="effectiveness_percentage"
                      name="Efetividade (%)"
                      fill="#82ca9d"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {data.by_vessel.map((vessel) => (
                  <Card key={vessel.vessel_id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Ship className="h-5 w-5 text-primary" />
                          <div>
                            <div className="font-semibold">{vessel.vessel_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {vessel.total_incidents} incidentes • {vessel.repeated_incidents}{" "}
                              repetidos
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className="text-2xl font-bold"
                            style={{
                              color: getEffectivenessColor(vessel.effectiveness_percentage),
                            }}
                          >
                            {vessel.effectiveness_percentage.toFixed(1)}%
                          </div>
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: getEffectivenessColor(vessel.effectiveness_percentage),
                              color: getEffectivenessColor(vessel.effectiveness_percentage),
                            }}
                          >
                            {getEffectivenessLabel(vessel.effectiveness_percentage)}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Detailed View */}
            <TabsContent value="detailed" className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="p-2">Categoria</th>
                      <th className="p-2 text-right">Total</th>
                      <th className="p-2 text-right">Repetidos</th>
                      <th className="p-2 text-right">Efetividade</th>
                      <th className="p-2 text-right">Tempo Médio (dias)</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.by_category.map((category) => (
                      <tr key={category.category} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">{category.category}</td>
                        <td className="p-2 text-right">{category.total_incidents}</td>
                        <td className="p-2 text-right text-destructive">
                          {category.repeated_incidents}
                        </td>
                        <td className="p-2 text-right">
                          <span
                            style={{
                              color: getEffectivenessColor(category.effectiveness_percentage),
                            }}
                          >
                            {category.effectiveness_percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-2 text-right">
                          {category.avg_resolution_days?.toFixed(1) || "N/A"}
                        </td>
                        <td className="p-2">
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: getEffectivenessColor(
                                category.effectiveness_percentage
                              ),
                              color: getEffectivenessColor(category.effectiveness_percentage),
                            }}
                          >
                            {getEffectivenessLabel(category.effectiveness_percentage)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Dados por Embarcação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr className="text-left">
                          <th className="p-2">Embarcação</th>
                          <th className="p-2 text-right">Total</th>
                          <th className="p-2 text-right">Repetidos</th>
                          <th className="p-2 text-right">Efetividade</th>
                          <th className="p-2 text-right">Tempo Médio (dias)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.by_vessel.map((vessel) => (
                          <tr key={vessel.vessel_id} className="border-b hover:bg-muted/50">
                            <td className="p-2 font-medium">{vessel.vessel_name}</td>
                            <td className="p-2 text-right">{vessel.total_incidents}</td>
                            <td className="p-2 text-right text-destructive">
                              {vessel.repeated_incidents}
                            </td>
                            <td className="p-2 text-right">
                              <span
                                style={{
                                  color: getEffectivenessColor(vessel.effectiveness_percentage),
                                }}
                              >
                                {vessel.effectiveness_percentage.toFixed(1)}%
                              </span>
                            </td>
                            <td className="p-2 text-right">
                              {vessel.avg_resolution_days?.toFixed(1) || "N/A"}
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
        </CardContent>
      </Card>
    </div>
  );
};
