import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Ship,
  Table as TableIcon,
} from "lucide-react";

interface EffectivenessData {
  categoria: string;
  total_incidencias: number;
  incidencias_repetidas: number;
  efetividade: number;
  tempo_medio_resolucao: number | null;
}

interface EffectivenessByVesselData {
  embarcacao: string;
  categoria: string;
  total_incidencias: number;
  incidencias_repetidas: number;
  efetividade: number;
  tempo_medio_resolucao: number | null;
}

/**
 * SGSOEffectivenessChart Component
 * 
 * Displays SGSO (Sistema de Gestão de Segurança Operacional) effectiveness metrics
 * with interactive visualizations and detailed analysis.
 * 
 * Features:
 * - Three view modes: General, By Vessel, and Detailed Table
 * - Color-coded effectiveness indicators
 * - Resolution time tracking
 * - Strategic insights for QSMS improvement
 */
export const SGSOEffectivenessChart: React.FC = () => {
  const [overallData, setOverallData] = useState<EffectivenessData[]>([]);
  const [vesselData, setVesselData] = useState<EffectivenessByVesselData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"general" | "vessel" | "table">("general");

  useEffect(() => {
    fetchEffectivenessData();
  }, []);

  const fetchEffectivenessData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch overall data
      const overallResponse = await fetch("/api/sgso/effectiveness");
      if (!overallResponse.ok) {
        throw new Error("Failed to fetch overall effectiveness data");
      }
      const overallJson = await overallResponse.json();
      setOverallData(overallJson);

      // Fetch vessel-specific data
      const vesselResponse = await fetch("/api/sgso/effectiveness?by_vessel=true");
      if (!vesselResponse.ok) {
        throw new Error("Failed to fetch vessel effectiveness data");
      }
      const vesselJson = await vesselResponse.json();
      setVesselData(vesselJson);
    } catch (err) {
      console.error("Error fetching effectiveness data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const getEffectivenessColor = (efetividade: number): string => {
    if (efetividade >= 90) return "#10b981"; // Green
    if (efetividade >= 75) return "#f59e0b"; // Yellow/Amber
    if (efetividade >= 50) return "#f97316"; // Orange
    return "#ef4444"; // Red
  };

  const getEffectivenessLabel = (efetividade: number): string => {
    if (efetividade >= 90) return "Excelente";
    if (efetividade >= 75) return "Bom";
    if (efetividade >= 50) return "Regular";
    return "Crítico";
  };

  const getEffectivenessIcon = (efetividade: number) => {
    if (efetividade >= 90) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (efetividade >= 75) return <AlertCircle className="h-4 w-4 text-amber-500" />;
    if (efetividade >= 50) return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  };

  const formatResolutionTime = (dias: number | null): string => {
    if (dias === null) return "N/A";
    if (dias < 1) return `${(dias * 24).toFixed(1)}h`;
    return `${dias.toFixed(1)} dias`;
  };

  const calculateOverallMetrics = () => {
    if (overallData.length === 0) {
      return {
        totalIncidents: 0,
        totalRepeated: 0,
        averageEffectiveness: 0,
        averageResolutionTime: null,
      };
    }

    const totalIncidents = overallData.reduce((sum, item) => sum + item.total_incidencias, 0);
    const totalRepeated = overallData.reduce((sum, item) => sum + item.incidencias_repetidas, 0);
    const averageEffectiveness = overallData.reduce((sum, item) => sum + item.efetividade, 0) / overallData.length;
    
    const validResolutionTimes = overallData.filter(item => item.tempo_medio_resolucao !== null);
    const averageResolutionTime = validResolutionTimes.length > 0
      ? validResolutionTimes.reduce((sum, item) => sum + (item.tempo_medio_resolucao || 0), 0) / validResolutionTimes.length
      : null;

    return {
      totalIncidents,
      totalRepeated,
      averageEffectiveness,
      averageResolutionTime,
    };
  };

  const groupVesselDataByVessel = () => {
    const grouped: Record<string, EffectivenessByVesselData[]> = {};
    vesselData.forEach(item => {
      if (!grouped[item.embarcacao]) {
        grouped[item.embarcacao] = [];
      }
      grouped[item.embarcacao].push(item);
    });
    return grouped;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Efetividade dos Planos de Ação SGSO
          </CardTitle>
          <CardDescription>
            Carregando dados de efetividade...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-muted-foreground">
              Carregando métricas...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Efetividade dos Planos de Ação SGSO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro ao carregar dados</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (overallData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Efetividade dos Planos de Ação SGSO
          </CardTitle>
          <CardDescription>
            Monitore a efetividade dos planos de ação por categoria SGSO
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Nenhum dado disponível</AlertTitle>
            <AlertDescription>
              Não há dados de efetividade para exibir. Certifique-se de que os incidentes
              possuem categorias SGSO atribuídas.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const metrics = calculateOverallMetrics();
  const vesselGroups = groupVesselDataByVessel();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Efetividade dos Planos de Ação SGSO
        </CardTitle>
        <CardDescription>
          Monitore a efetividade dos planos de ação e identifique oportunidades de melhoria
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total de Incidências</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalIncidents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Incidências Repetidas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{metrics.totalRepeated}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Efetividade Média</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{metrics.averageEffectiveness.toFixed(1)}%</div>
                {getEffectivenessIcon(metrics.averageEffectiveness)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tempo Médio de Resolução</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="text-2xl font-bold">
                  {formatResolutionTime(metrics.averageResolutionTime)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as typeof activeView)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">
              <BarChart3 className="mr-2 h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="vessel">
              <Ship className="mr-2 h-4 w-4" />
              Por Embarcação
            </TabsTrigger>
            <TabsTrigger value="table">
              <TableIcon className="mr-2 h-4 w-4" />
              Tabela Detalhada
            </TabsTrigger>
          </TabsList>

          {/* General View */}
          <TabsContent value="general" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overallData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="categoria" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length > 0) {
                        const data = payload[0].payload as EffectivenessData;
                        return (
                          <div className="bg-background border rounded-lg shadow-lg p-3 space-y-1">
                            <p className="font-semibold">{data.categoria}</p>
                            <p className="text-sm">Total: {data.total_incidencias}</p>
                            <p className="text-sm">Repetidas: {data.incidencias_repetidas}</p>
                            <p className="text-sm">Efetividade: {data.efetividade.toFixed(1)}%</p>
                            <p className="text-sm">
                              Tempo médio: {formatResolutionTime(data.tempo_medio_resolucao)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="efetividade" name="Efetividade (%)" radius={[8, 8, 0, 0]}>
                    {overallData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getEffectivenessColor(entry.efetividade)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Strategic Insights */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Insights Estratégicos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {overallData.map((item) => (
                  <Alert key={item.categoria}>
                    <div className="flex items-start gap-2">
                      {getEffectivenessIcon(item.efetividade)}
                      <div className="flex-1">
                        <AlertTitle className="text-sm">{item.categoria}</AlertTitle>
                        <AlertDescription className="text-xs">
                          <Badge variant="outline" className="mr-2">
                            {getEffectivenessLabel(item.efetividade)}
                          </Badge>
                          {item.efetividade < 75 && (
                            <span>Requer atenção - Alta taxa de recorrência</span>
                          )}
                          {item.efetividade >= 75 && item.efetividade < 90 && (
                            <span>Bom desempenho - Manter monitoramento</span>
                          )}
                          {item.efetividade >= 90 && (
                            <span>Excelente efetividade - Compartilhar boas práticas</span>
                          )}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Vessel View */}
          <TabsContent value="vessel" className="space-y-4">
            {Object.entries(vesselGroups).map(([vessel, data]) => (
              <Card key={vessel}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Ship className="h-4 w-4" />
                    {vessel}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="categoria" 
                          angle={-45} 
                          textAnchor="end" 
                          height={80}
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length > 0) {
                              const data = payload[0].payload as EffectivenessByVesselData;
                              return (
                                <div className="bg-background border rounded-lg shadow-lg p-3 space-y-1">
                                  <p className="font-semibold text-sm">{data.categoria}</p>
                                  <p className="text-xs">Total: {data.total_incidencias}</p>
                                  <p className="text-xs">Repetidas: {data.incidencias_repetidas}</p>
                                  <p className="text-xs">Efetividade: {data.efetividade.toFixed(1)}%</p>
                                  <p className="text-xs">
                                    Tempo médio: {formatResolutionTime(data.tempo_medio_resolucao)}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="efetividade" name="Efetividade (%)" radius={[6, 6, 0, 0]}>
                          {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getEffectivenessColor(entry.efetividade)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Table View */}
          <TabsContent value="table">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Categoria</th>
                    <th className="p-3 text-center text-sm font-medium">Incidências</th>
                    <th className="p-3 text-center text-sm font-medium">Repetidas</th>
                    <th className="p-3 text-center text-sm font-medium">Efetividade</th>
                    <th className="p-3 text-center text-sm font-medium">Tempo Médio</th>
                    <th className="p-3 text-center text-sm font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {overallData.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-muted/30">
                      <td className="p-3 text-sm">{item.categoria}</td>
                      <td className="p-3 text-center text-sm">{item.total_incidencias}</td>
                      <td className="p-3 text-center text-sm">{item.incidencias_repetidas}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {getEffectivenessIcon(item.efetividade)}
                          <span className="text-sm font-semibold">
                            {item.efetividade.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-center text-sm">
                        {formatResolutionTime(item.tempo_medio_resolucao)}
                      </td>
                      <td className="p-3 text-center">
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: getEffectivenessColor(item.efetividade),
                            color: getEffectivenessColor(item.efetividade),
                          }}
                        >
                          {getEffectivenessLabel(item.efetividade)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
