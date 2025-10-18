import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Ship,
  BarChart3,
  Loader2,
} from "lucide-react";
import type {
  SGSOEffectiveness,
  SGSOEffectivenessByVessel,
  SGSOEffectivenessResponse,
} from "@/types/sgso-effectiveness";
import { getEffectivenessStatus } from "@/types/sgso-effectiveness";

export const SGSOEffectivenessChart = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"general" | "vessel" | "detailed">("general");
  const [data, setData] = useState<SGSOEffectivenessResponse | null>(null);

  useEffect(() => {
    fetchData();
  }, [viewMode]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const byVessel = viewMode === "vessel";
      const response = await fetch(`/api/sgso/effectiveness?by_vessel=${byVessel}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("Error fetching SGSO effectiveness data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Carregando dados de efetividade...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar dados: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              Nenhum dado de efetividade disponível.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Os dados serão exibidos após o registro de incidentes com planos de ação.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Incidentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.total_incidents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Com plano de ação registrado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Incidentes Repetidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {data.summary.total_repeated}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Necessitam atenção especial
            </p>
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
              <div className="text-2xl font-bold">
                {data.summary.overall_effectiveness.toFixed(1)}%
              </div>
              {data.summary.overall_effectiveness >= 75 ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
            </div>
            <Badge
              variant={
                getEffectivenessStatus(data.summary.overall_effectiveness).variant
              }
              className="mt-2"
            >
              {getEffectivenessStatus(data.summary.overall_effectiveness).label}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tempo Médio de Resolução
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div className="text-2xl font-bold">
                {data.summary.avg_resolution_time.toFixed(1)}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">dias em média</p>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
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
            <AlertTriangle className="mr-2 h-4 w-4" />
            Detalhado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Efetividade por Categoria SGSO</CardTitle>
              <CardDescription>
                Percentual de efetividade dos planos de ação por tipo de incidente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="effectiveness_percentage" name="Efetividade (%)" fill="#8884d8">
                    {data.data.map((entry, index) => {
                      const effectiveness = (entry as SGSOEffectiveness).effectiveness_percentage;
                      let color = "#22c55e"; // green
                      if (effectiveness < 50) color = "#ef4444"; // red
                      else if (effectiveness < 75) color = "#f97316"; // orange
                      else if (effectiveness < 90) color = "#eab308"; // yellow
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Strategic Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Insights Estratégicos</CardTitle>
              <CardDescription>
                Recomendações para melhoria contínua do SGSO
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.data.map((item) => {
                  const catItem = item as SGSOEffectiveness;
                  const status = getEffectivenessStatus(catItem.effectiveness_percentage);
                  
                  if (catItem.effectiveness_percentage < 75) {
                    return (
                      <Alert key={catItem.category} className="border-orange-200 bg-orange-50">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <AlertDescription>
                          <strong>{catItem.category}:</strong> Efetividade abaixo do ideal (
                          {catItem.effectiveness_percentage.toFixed(1)}%). Recomenda-se revisar os
                          planos de ação e implementar medidas corretivas adicionais.
                        </AlertDescription>
                      </Alert>
                    );
                  } else if (catItem.repeated_incidents > 0) {
                    return (
                      <Alert key={catItem.category} className="border-blue-200 bg-blue-50">
                        <TrendingDown className="h-4 w-4 text-blue-600" />
                        <AlertDescription>
                          <strong>{catItem.category}:</strong> {catItem.repeated_incidents}{" "}
                          incidentes repetidos. Considere análise de causa raiz mais profunda.
                        </AlertDescription>
                      </Alert>
                    );
                  } else if (catItem.effectiveness_percentage >= 90) {
                    return (
                      <Alert key={catItem.category} className="border-green-200 bg-green-50">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription>
                          <strong>{catItem.category}:</strong> Excelente performance (
                          {catItem.effectiveness_percentage.toFixed(1)}%). Compartilhe as melhores
                          práticas com outras categorias.
                        </AlertDescription>
                      </Alert>
                    );
                  }
                  return null;
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vessel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Benchmarking por Embarcação</CardTitle>
              <CardDescription>
                Comparação de efetividade entre diferentes embarcações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="vessel_name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="effectiveness_percentage"
                    name="Efetividade (%)"
                    fill="#8884d8"
                  >
                    {data.data.map((entry, index) => {
                      const effectiveness = (entry as SGSOEffectivenessByVessel)
                        .effectiveness_percentage;
                      let color = "#22c55e"; // green
                      if (effectiveness < 50) color = "#ef4444"; // red
                      else if (effectiveness < 75) color = "#f97316"; // orange
                      else if (effectiveness < 90) color = "#eab308"; // yellow
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dados Detalhados</CardTitle>
              <CardDescription>
                Tabela completa com todas as métricas de efetividade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">
                        {data.by_vessel ? "Embarcação" : "Categoria"}
                      </th>
                      {data.by_vessel && <th className="text-left p-3">Categoria</th>}
                      <th className="text-right p-3">Incidências</th>
                      <th className="text-right p-3">Repetidas</th>
                      <th className="text-right p-3">Efetividade</th>
                      <th className="text-right p-3">Tempo Médio</th>
                      <th className="text-center p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((item, index) => {
                      const effectiveness = data.by_vessel
                        ? (item as SGSOEffectivenessByVessel).effectiveness_percentage
                        : (item as SGSOEffectiveness).effectiveness_percentage;
                      const status = getEffectivenessStatus(effectiveness);

                      return (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-3">
                            {data.by_vessel
                              ? (item as SGSOEffectivenessByVessel).vessel_name
                              : (item as SGSOEffectiveness).category}
                          </td>
                          {data.by_vessel && (
                            <td className="p-3">
                              {(item as SGSOEffectivenessByVessel).category}
                            </td>
                          )}
                          <td className="text-right p-3">{item.total_incidents}</td>
                          <td className="text-right p-3">{item.repeated_incidents}</td>
                          <td className="text-right p-3">
                            <span className={status.color}>
                              {effectiveness.toFixed(1)}%
                            </span>
                          </td>
                          <td className="text-right p-3">
                            {item.avg_resolution_days
                              ? `${item.avg_resolution_days.toFixed(1)} dias`
                              : "N/A"}
                          </td>
                          <td className="text-center p-3">
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </td>
                        </tr>
                      );
                    })}
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
