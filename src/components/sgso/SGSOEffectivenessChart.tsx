import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Cell
} from "recharts";
import { TrendingUp, AlertTriangle, CheckCircle, Ship, Info } from "lucide-react";

// Type definitions
interface EffectivenessData {
  category: string;
  incidents_total: number;
  incidents_repeated: number;
  effectiveness_percent: number;
  avg_resolution_days: number;
}

interface EffectivenessDataByVessel extends EffectivenessData {
  vessel: string;
}

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

// Summary Card Component
const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </CardContent>
  </Card>
);

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="font-semibold mb-2">{data.category}</p>
        <div className="space-y-1 text-sm">
          <p>Total de Incidências: <span className="font-medium">{data.incidents_total}</span></p>
          <p>Reincidências: <span className="font-medium">{data.incidents_repeated}</span></p>
          <p>Efetividade: <span className="font-medium">{data.effectiveness_percent}%</span></p>
          <p>Tempo Médio: <span className="font-medium">{data.avg_resolution_days || "N/A"} dias</span></p>
        </div>
      </div>
    );
  }
  return null;
};

// Get color based on effectiveness percentage
const getEffectivenessColor = (percent: number): string => {
  if (percent >= 90) return "#22c55e"; // Green
  if (percent >= 75) return "#eab308"; // Yellow
  if (percent >= 50) return "#f97316"; // Orange
  return "#ef4444"; // Red
};

// Main Component
export const SGSOEffectivenessChart: React.FC = () => {
  const [overallData, setOverallData] = useState<EffectivenessData[]>([]);
  const [vesselData, setVesselData] = useState<EffectivenessDataByVessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVessel, setSelectedVessel] = useState<string>("all");

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch overall data
        const overallResponse = await fetch("/api/sgso/effectiveness");
        if (!overallResponse.ok) {
          throw new Error("Falha ao carregar dados de efetividade");
        }
        const overallResult = await overallResponse.json();
        setOverallData(overallResult);

        // Fetch vessel-specific data
        const vesselResponse = await fetch("/api/sgso/effectiveness?by_vessel=true");
        if (!vesselResponse.ok) {
          throw new Error("Falha ao carregar dados por embarcação");
        }
        const vesselResult = await vesselResponse.json();
        setVesselData(vesselResult);
      } catch (err) {
        console.error("Error fetching effectiveness data:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate summary metrics
  const totalIncidents = overallData.reduce((sum, item) => sum + item.incidents_total, 0);
  const totalRepeated = overallData.reduce((sum, item) => sum + item.incidents_repeated, 0);
  const avgEffectiveness = overallData.length > 0
    ? (overallData.reduce((sum, item) => sum + item.effectiveness_percent, 0) / overallData.length).toFixed(1)
    : "0";

  // Get unique vessels
  const vessels = Array.from(new Set(vesselData.map(item => item.vessel))).sort();

  // Filter data by selected vessel
  const filteredVesselData = selectedVessel === "all" 
    ? vesselData 
    : vesselData.filter(item => item.vessel === selectedVessel);

  // Group vessel data by category for selected vessel
  const vesselChartData = selectedVessel === "all"
    ? []
    : filteredVesselData.reduce((acc: any[], item) => {
      const existing = acc.find(x => x.category === item.category);
      if (!existing) {
        acc.push({
          category: item.category,
          incidents_total: item.incidents_total,
          incidents_repeated: item.incidents_repeated,
          effectiveness_percent: item.effectiveness_percent,
          avg_resolution_days: item.avg_resolution_days
        });
      }
      return acc;
    }, []);

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dados de efetividade...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (overallData.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Nenhum dado de efetividade disponível. Certifique-se de que os incidentes possuem categorias SGSO atribuídas.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Total de Incidências"
          value={totalIncidents}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          description="Todas as categorias SGSO"
        />
        <SummaryCard
          title="Reincidências"
          value={totalRepeated}
          icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
          description={`${((totalRepeated / totalIncidents) * 100).toFixed(1)}% do total`}
        />
        <SummaryCard
          title="Efetividade Média"
          value={`${avgEffectiveness}%`}
          icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
          description="Média de todas as categorias"
        />
      </div>

      {/* Main Chart Area */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="byvessel">Por Embarcação</TabsTrigger>
          <TabsTrigger value="table">Tabela Detalhada</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Efetividade por Categoria SGSO</CardTitle>
              <CardDescription>
                Percentual de efetividade baseado na redução de reincidências
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={overallData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="category" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                  />
                  <YAxis 
                    label={{ value: "Efetividade (%)", angle: -90, position: "insideLeft" }}
                    domain={[0, 100]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="effectiveness_percent" name="Efetividade (%)" radius={[8, 8, 0, 0]}>
                    {overallData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getEffectivenessColor(entry.effectiveness_percent)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Strategic Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Insights Estratégicos</CardTitle>
              <CardDescription>Recomendações para melhoria contínua do QSMS</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {overallData
                .filter(item => item.effectiveness_percent < 90)
                .map((item, index) => (
                  <Alert key={index} variant={item.effectiveness_percent < 75 ? "destructive" : "default"}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{item.category}</strong>: Efetividade de {item.effectiveness_percent}% 
                      ({item.incidents_repeated} de {item.incidents_total} incidentes reincidentes).
                      {item.effectiveness_percent < 75 && " Ação urgente necessária."}
                    </AlertDescription>
                  </Alert>
                ))}
              {overallData.every(item => item.effectiveness_percent >= 90) && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Excelente! Todas as categorias apresentam efetividade superior a 90%.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* By Vessel Tab */}
        <TabsContent value="byvessel" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Efetividade por Embarcação</CardTitle>
                  <CardDescription>
                    Comparação de performance entre embarcações
                  </CardDescription>
                </div>
                <select
                  value={selectedVessel}
                  onChange={(e) => setSelectedVessel(e.target.value)}
                  className="border rounded-md px-3 py-2"
                >
                  <option value="all">Selecione uma embarcação</option>
                  {vessels.map(vessel => (
                    <option key={vessel} value={vessel}>{vessel}</option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <CardContent>
              {selectedVessel === "all" ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <Ship className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Selecione uma embarcação para visualizar os dados</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={vesselChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="category" 
                      angle={-45} 
                      textAnchor="end" 
                      height={100}
                    />
                    <YAxis 
                      label={{ value: "Efetividade (%)", angle: -90, position: "insideLeft" }}
                      domain={[0, 100]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="effectiveness_percent" name="Efetividade (%)" radius={[8, 8, 0, 0]}>
                      {vesselChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getEffectivenessColor(entry.effectiveness_percent)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Table Tab */}
        <TabsContent value="table" className="space-y-4">
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
                      <th className="text-left py-3 px-4">Categoria</th>
                      <th className="text-right py-3 px-4">Incidências</th>
                      <th className="text-right py-3 px-4">Repetidas</th>
                      <th className="text-right py-3 px-4">Efetividade</th>
                      <th className="text-right py-3 px-4">Média de Resolução</th>
                      <th className="text-center py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overallData.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{item.category}</td>
                        <td className="text-right py-3 px-4">{item.incidents_total}</td>
                        <td className="text-right py-3 px-4">{item.incidents_repeated}</td>
                        <td className="text-right py-3 px-4">
                          <span 
                            className="font-semibold"
                            style={{ color: getEffectivenessColor(item.effectiveness_percent) }}
                          >
                            {item.effectiveness_percent}%
                          </span>
                        </td>
                        <td className="text-right py-3 px-4">
                          {item.avg_resolution_days ? `${item.avg_resolution_days} dias` : "N/A"}
                        </td>
                        <td className="text-center py-3 px-4">
                          <Badge 
                            variant={item.effectiveness_percent >= 90 ? "default" : "secondary"}
                            className={item.effectiveness_percent >= 90 ? "bg-green-500" : 
                              item.effectiveness_percent >= 75 ? "bg-yellow-500" : 
                                item.effectiveness_percent >= 50 ? "bg-orange-500" : "bg-red-500"}
                          >
                            {item.effectiveness_percent >= 90 ? "Excelente" :
                              item.effectiveness_percent >= 75 ? "Bom" :
                                item.effectiveness_percent >= 50 ? "Regular" : "Crítico"}
                          </Badge>
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
