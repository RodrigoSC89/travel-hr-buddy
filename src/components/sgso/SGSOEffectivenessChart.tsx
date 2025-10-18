import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { TrendingUp, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EffectivenessData {
  category: string;
  incidents_total: number;
  incidents_repeated: number;
  effectiveness_percent: number;
  avg_resolution_days: number | null;
}

interface EffectivenessByVesselData extends EffectivenessData {
  vessel_name: string;
}

export function SGSOEffectivenessChart() {
  const [data, setData] = useState<EffectivenessData[]>([]);
  const [vesselData, setVesselData] = useState<EffectivenessByVesselData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch overall effectiveness data
      const response = await fetch("/api/sgso/effectiveness");
      if (!response.ok) throw new Error("Erro ao buscar dados de efetividade");
      const effectivenessData = await response.json();
      setData(effectivenessData || []);

      // Fetch effectiveness by vessel
      const vesselResponse = await fetch("/api/sgso/effectiveness?by_vessel=true");
      if (!vesselResponse.ok) throw new Error("Erro ao buscar dados por embarcação");
      const vesselEffectivenessData = await vesselResponse.json();
      setVesselData(vesselEffectivenessData || []);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: EffectivenessData }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-semibold">{data.category}</p>
          <p className="text-sm">Efetividade: {data.effectiveness_percent.toFixed(1)}%</p>
          <p className="text-sm">Total: {data.incidents_total}</p>
          <p className="text-sm">Repetidas: {data.incidents_repeated}</p>
          {data.avg_resolution_days !== null && (
            <p className="text-sm">Média resolução: {data.avg_resolution_days.toFixed(1)} dias</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Get color based on effectiveness percentage
  const getEffectivenessColor = (percent: number) => {
    if (percent >= 90) return "#22c55e"; // green
    if (percent >= 75) return "#eab308"; // yellow
    if (percent >= 50) return "#f97316"; // orange
    return "#ef4444"; // red
  };

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

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            📊 Efetividade por Categoria SGSO
          </CardTitle>
          <CardDescription>
            Monitoramento da eficácia dos planos de ação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nenhum dado de efetividade disponível. Registre incidentes resolvidos para visualizar métricas.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Group vessel data by vessel for easier rendering
  const vesselGroups = vesselData.reduce((acc, item) => {
    if (!acc[item.vessel_name]) {
      acc[item.vessel_name] = [];
    }
    acc[item.vessel_name].push(item);
    return acc;
  }, {} as Record<string, EffectivenessByVesselData[]>);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          📊 Efetividade por Categoria SGSO
        </CardTitle>
        <CardDescription>
          Monitoramento da eficácia dos planos de ação baseado em:
          <br />
          📉 Redução de reincidência • ⏱️ Tempo médio de resolução • 🚢 Efetividade por embarcação
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overall" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overall">Geral</TabsTrigger>
            <TabsTrigger value="vessel">Por Embarcação</TabsTrigger>
            <TabsTrigger value="table">Tabela</TabsTrigger>
          </TabsList>

          <TabsContent value="overall" className="space-y-4">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data}>
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                <YAxis unit="%" domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="effectiveness_percent" name="Efetividade (%)" radius={[8, 8, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getEffectivenessColor(entry.effectiveness_percent)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="vessel" className="space-y-4">
            {Object.entries(vesselGroups).map(([vesselName, vesselItems]) => (
              <div key={vesselName} className="space-y-2">
                <h3 className="font-semibold text-lg">🚢 {vesselName}</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={vesselItems}>
                    <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                    <YAxis unit="%" domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="effectiveness_percent" name="Efetividade (%)" radius={[8, 8, 0, 0]}>
                      {vesselItems.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getEffectivenessColor(entry.effectiveness_percent)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="table" className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-left p-3 font-semibold">Categoria</th>
                    <th className="text-center p-3 font-semibold">Incidências</th>
                    <th className="text-center p-3 font-semibold">Repetidas</th>
                    <th className="text-center p-3 font-semibold">Efetividade</th>
                    <th className="text-center p-3 font-semibold">Média de Resolução</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      <td className="p-3">{item.category}</td>
                      <td className="text-center p-3">{item.incidents_total}</td>
                      <td className="text-center p-3">{item.incidents_repeated}</td>
                      <td className="text-center p-3">
                        <span 
                          className="inline-block px-3 py-1 rounded-full text-white font-semibold"
                          style={{ backgroundColor: getEffectivenessColor(item.effectiveness_percent) }}
                        >
                          {item.effectiveness_percent.toFixed(1)}%
                        </span>
                      </td>
                      <td className="text-center p-3">
                        {item.avg_resolution_days !== null 
                          ? `${item.avg_resolution_days.toFixed(1)} dias`
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {vesselData.length > 0 && (
              <>
                <h3 className="font-semibold text-lg mt-6">📊 Detalhamento por Embarcação</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2">
                        <th className="text-left p-3 font-semibold">Embarcação</th>
                        <th className="text-left p-3 font-semibold">Categoria</th>
                        <th className="text-center p-3 font-semibold">Incidências</th>
                        <th className="text-center p-3 font-semibold">Repetidas</th>
                        <th className="text-center p-3 font-semibold">Efetividade</th>
                        <th className="text-center p-3 font-semibold">Média de Resolução</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vesselData.map((item, idx) => (
                        <tr key={idx} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-medium">{item.vessel_name}</td>
                          <td className="p-3">{item.category}</td>
                          <td className="text-center p-3">{item.incidents_total}</td>
                          <td className="text-center p-3">{item.incidents_repeated}</td>
                          <td className="text-center p-3">
                            <span 
                              className="inline-block px-3 py-1 rounded-full text-white font-semibold"
                              style={{ backgroundColor: getEffectivenessColor(item.effectiveness_percent) }}
                            >
                              {item.effectiveness_percent.toFixed(1)}%
                            </span>
                          </td>
                          <td className="text-center p-3">
                            {item.avg_resolution_days !== null 
                              ? `${item.avg_resolution_days.toFixed(1)} dias`
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Legend for effectiveness colors */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Legenda de Efetividade</h4>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "#22c55e" }}></div>
              <span className="text-sm">≥ 90% - Excelente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "#eab308" }}></div>
              <span className="text-sm">75-89% - Bom</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "#f97316" }}></div>
              <span className="text-sm">50-74% - Moderado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "#ef4444" }}></div>
              <span className="text-sm">&lt; 50% - Crítico</span>
            </div>
          </div>
        </div>

        {/* Key Metrics Summary */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {data.reduce((sum, item) => sum + item.incidents_total, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Total de Incidências Resolvidas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-destructive">
                {data.reduce((sum, item) => sum + item.incidents_repeated, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Reincidências Detectadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">
                {(() => {
                  const totalIncidents = data.reduce((sum, item) => sum + item.incidents_total, 0);
                  const totalRepeated = data.reduce((sum, item) => sum + item.incidents_repeated, 0);
                  return totalIncidents > 0 
                    ? ((100 - (totalRepeated / totalIncidents * 100)).toFixed(1))
                    : "0.0";
                })()}%
              </div>
              <p className="text-sm text-muted-foreground">Efetividade Geral</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
