import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Fuel,
  DollarSign,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Target,
  Zap,
  Ship,
  Users,
  Gauge,
} from "lucide-react";

interface FleetMetrics {
  efficiency: number;
  fuel_consumption: number;
  operational_cost: number;
  maintenance_cost: number;
  revenue: number;
  profit_margin: number;
  vessel_utilization: number;
  crew_efficiency: number;
  safety_score: number;
  environmental_score: number;
}

interface PerformanceData {
  date: string;
  fuel_efficiency: number;
  operational_cost: number;
  revenue: number;
  vessel_count: number;
  crew_satisfaction: number;
  safety_incidents: number;
}

interface VesselPerformance {
  vessel_name: string;
  efficiency: number;
  fuel_consumption: number;
  utilization: number;
  maintenance_score: number;
  profit: number;
  status: "excellent" | "good" | "average" | "poor";
}

interface PredictiveInsight {
  id: string;
  type: "maintenance" | "fuel" | "route" | "crew" | "cost";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  confidence: number;
  potential_savings: number;
  action_required: boolean;
  timeline: string;
}

export const AdvancedFleetAnalytics = () => {
  const [metrics, setMetrics] = useState<FleetMetrics | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [vesselPerformance, setVesselPerformance] = useState<VesselPerformance[]>([]);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight[]>([]);
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalyticsData();

    // Set up real-time updates
    const interval = setInterval(() => {
      loadAnalyticsData();
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [timeRange, loadAnalyticsData]);

  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);

      // Mock analytics data - In production, this would come from actual calculations
      const mockMetrics: FleetMetrics = {
        efficiency: 87.5,
        fuel_consumption: 245.8,
        operational_cost: 125000,
        maintenance_cost: 35000,
        revenue: 450000,
        profit_margin: 64.4,
        vessel_utilization: 92.3,
        crew_efficiency: 89.1,
        safety_score: 96.2,
        environmental_score: 88.7,
      };

      const mockPerformanceData: PerformanceData[] = [
        {
          date: "2024-01-01",
          fuel_efficiency: 85,
          operational_cost: 120000,
          revenue: 420000,
          vessel_count: 5,
          crew_satisfaction: 87,
          safety_incidents: 2,
        },
        {
          date: "2024-01-02",
          fuel_efficiency: 87,
          operational_cost: 118000,
          revenue: 435000,
          vessel_count: 5,
          crew_satisfaction: 89,
          safety_incidents: 1,
        },
        {
          date: "2024-01-03",
          fuel_efficiency: 89,
          operational_cost: 115000,
          revenue: 445000,
          vessel_count: 5,
          crew_satisfaction: 91,
          safety_incidents: 0,
        },
        {
          date: "2024-01-04",
          fuel_efficiency: 86,
          operational_cost: 122000,
          revenue: 430000,
          vessel_count: 5,
          crew_satisfaction: 88,
          safety_incidents: 1,
        },
        {
          date: "2024-01-05",
          fuel_efficiency: 90,
          operational_cost: 112000,
          revenue: 465000,
          vessel_count: 5,
          crew_satisfaction: 93,
          safety_incidents: 0,
        },
        {
          date: "2024-01-06",
          fuel_efficiency: 88,
          operational_cost: 119000,
          revenue: 450000,
          vessel_count: 5,
          crew_satisfaction: 90,
          safety_incidents: 1,
        },
        {
          date: "2024-01-07",
          fuel_efficiency: 91,
          operational_cost: 110000,
          revenue: 470000,
          vessel_count: 5,
          crew_satisfaction: 94,
          safety_incidents: 0,
        },
      ];

      const mockVesselPerformance: VesselPerformance[] = [
        {
          vessel_name: "MV Atlantic Explorer",
          efficiency: 94,
          fuel_consumption: 185,
          utilization: 96,
          maintenance_score: 92,
          profit: 85000,
          status: "excellent",
        },
        {
          vessel_name: "MS Ocean Pioneer",
          efficiency: 89,
          fuel_consumption: 220,
          utilization: 91,
          maintenance_score: 88,
          profit: 78000,
          status: "good",
        },
        {
          vessel_name: "MV Pacific Star",
          efficiency: 85,
          fuel_consumption: 245,
          utilization: 87,
          maintenance_score: 85,
          profit: 72000,
          status: "good",
        },
        {
          vessel_name: "MS Baltic Wind",
          efficiency: 82,
          fuel_consumption: 265,
          utilization: 89,
          maintenance_score: 79,
          profit: 65000,
          status: "average",
        },
        {
          vessel_name: "MV Nordic Crown",
          efficiency: 79,
          fuel_consumption: 285,
          utilization: 84,
          maintenance_score: 76,
          profit: 58000,
          status: "average",
        },
      ];

      const mockPredictiveInsights: PredictiveInsight[] = [
        {
          id: "1",
          type: "maintenance",
          title: "Manutenção Preventiva Recomendada",
          description: "MV Pacific Star requer manutenção do motor em 15 dias para evitar falhas",
          impact: "high",
          confidence: 92,
          potential_savings: 45000,
          action_required: true,
          timeline: "15 dias",
        },
        {
          id: "2",
          type: "fuel",
          title: "Otimização de Rota",
          description: "Rota alternativa pode reduzir consumo de combustível em 12%",
          impact: "medium",
          confidence: 87,
          potential_savings: 15000,
          action_required: false,
          timeline: "Próxima viagem",
        },
        {
          id: "3",
          type: "crew",
          title: "Rotação de Tripulação",
          description: "Otimização de escalas pode melhorar eficiência em 8%",
          impact: "medium",
          confidence: 84,
          potential_savings: 12000,
          action_required: false,
          timeline: "30 dias",
        },
        {
          id: "4",
          type: "cost",
          title: "Negociação de Contratos",
          description: "Renegociação de fornecedores pode reduzir custos em 6%",
          impact: "low",
          confidence: 78,
          potential_savings: 8000,
          action_required: false,
          timeline: "60 dias",
        },
      ];

      setMetrics(mockMetrics);
      setPerformanceData(mockPerformanceData);
      setVesselPerformance(mockVesselPerformance);
      setPredictiveInsights(mockPredictiveInsights);
    } catch (error) {
      console.error("Error loading analytics data:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados de analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getStatusColor = (status: VesselPerformance["status"]) => {
    switch (status) {
    case "excellent":
      return "bg-success";
    case "good":
      return "bg-info";
    case "average":
      return "bg-warning";
    case "poor":
      return "bg-status-error";
    default:
      return "bg-muted";
    }
  };

  const getStatusText = (status: VesselPerformance["status"]) => {
    switch (status) {
    case "excellent":
      return "Excelente";
    case "good":
      return "Bom";
    case "average":
      return "Médio";
    case "poor":
      return "Ruim";
    default:
      return "Desconhecido";
    }
  };

  const getImpactColor = (impact: PredictiveInsight["impact"]) => {
    switch (impact) {
    case "high":
      return "text-red-600 bg-red-100";
    case "medium":
      return "text-yellow-600 bg-yellow-100";
    case "low":
      return "text-green-600 bg-green-100";
    default:
      return "text-muted-foreground bg-gray-100";
    }
  };

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#8dd1e1"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Analytics Avançado da Frota</h2>
          <p className="text-muted-foreground">
            Análise em tempo real e insights preditivos para otimização operacional
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
              <SelectItem value="1y">1 ano</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Eficiência Geral</p>
                  <p className="text-2xl font-bold">{metrics.efficiency}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">+2.3%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Margem de Lucro</p>
                  <p className="text-2xl font-bold">{metrics.profit_margin}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">+5.1%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Utilização da Frota</p>
                  <p className="text-2xl font-bold">{metrics.vessel_utilization}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingDown className="h-3 w-3 text-red-600" />
                    <span className="text-xs text-red-600">-1.2%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Ship className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Score de Segurança</p>
                  <p className="text-2xl font-bold">{metrics.safety_score}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">Excelente</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="vessels">Embarcações</TabsTrigger>
          <TabsTrigger value="predictions">Insights Preditivos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Eficiência de Combustível</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="fuel_efficiency"
                      stroke="#8884d8"
                      name="Eficiência %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Receita vs Custos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stackId="1"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      name="Receita"
                    />
                    <Area
                      type="monotone"
                      dataKey="operational_cost"
                      stackId="2"
                      stroke="#ffc658"
                      fill="#ffc658"
                      name="Custos"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Eficiência da Tripulação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Performance Geral</span>
                    <span className="font-semibold">{metrics?.crew_efficiency}%</span>
                  </div>
                  <Progress value={metrics?.crew_efficiency} className="h-2" />

                  <div className="text-xs text-muted-foreground">+3.2% vs período anterior</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fuel className="h-5 w-5" />
                  Consumo de Combustível
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Litros/Milha</span>
                    <span className="font-semibold">{metrics?.fuel_consumption}</span>
                  </div>
                  <Progress value={75} className="h-2" />

                  <div className="text-xs text-green-600">-5.8% vs período anterior</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Score Ambiental
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Sustentabilidade</span>
                    <span className="font-semibold">{metrics?.environmental_score}%</span>
                  </div>
                  <Progress value={metrics?.environmental_score} className="h-2" />

                  <div className="text-xs text-green-600">+1.9% vs período anterior</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tendência de Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="fuel_efficiency"
                      stroke="#8884d8"
                      name="Eficiência"
                    />
                    <Line
                      type="monotone"
                      dataKey="crew_satisfaction"
                      stroke="#82ca9d"
                      name="Satisfação"
                    />
                    <Line
                      type="monotone"
                      dataKey="safety_incidents"
                      stroke="#ff7c7c"
                      name="Incidentes"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Custos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Combustível", value: 45, fill: "#8884d8" },
                        { name: "Manutenção", value: 25, fill: "#82ca9d" },
                        { name: "Tripulação", value: 20, fill: "#ffc658" },
                        { name: "Outros", value: 10, fill: "#ff7c7c" },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: "Combustível", value: 45, fill: "#8884d8" },
                        { name: "Manutenção", value: 25, fill: "#82ca9d" },
                        { name: "Tripulação", value: 20, fill: "#ffc658" },
                        { name: "Outros", value: 10, fill: "#ff7c7c" },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vessels" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance por Embarcação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vesselPerformance.map(vessel => (
                  <div key={vessel.vessel_name} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{vessel.vessel_name}</h3>
                        <Badge className={`${getStatusColor(vessel.status)} text-card-foreground`}>
                          {getStatusText(vessel.status)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          R$ {vessel.profit.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Lucro mensal</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Eficiência</div>
                        <div className="font-semibold">{vessel.efficiency}%</div>
                        <Progress value={vessel.efficiency} className="h-1 mt-1" />
                      </div>

                      <div>
                        <div className="text-sm text-muted-foreground">Utilização</div>
                        <div className="font-semibold">{vessel.utilization}%</div>
                        <Progress value={vessel.utilization} className="h-1 mt-1" />
                      </div>

                      <div>
                        <div className="text-sm text-muted-foreground">Manutenção</div>
                        <div className="font-semibold">{vessel.maintenance_score}%</div>
                        <Progress value={vessel.maintenance_score} className="h-1 mt-1" />
                      </div>

                      <div>
                        <div className="text-sm text-muted-foreground">Combustível</div>
                        <div className="font-semibold">{vessel.fuel_consumption}L/h</div>
                        <div className="text-xs text-muted-foreground">Consumo médio</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Insights Preditivos e Recomendações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictiveInsights.map(insight => (
                  <div key={insight.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{insight.title}</h3>
                          <Badge className={getImpactColor(insight.impact)}>
                            {insight.impact === "high"
                              ? "Alto Impacto"
                              : insight.impact === "medium"
                                ? "Médio Impacto"
                                : "Baixo Impacto"}
                          </Badge>
                          {insight.action_required && (
                            <Badge variant="destructive">Ação Necessária</Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>

                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            <span>Confiança: {insight.confidence}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>Economia: R$ {insight.potential_savings.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Prazo: {insight.timeline}</span>
                          </div>
                        </div>
                      </div>

                      <Button variant={insight.action_required ? "default" : "outline"} size="sm">
                        {insight.action_required ? "Implementar" : "Ver Detalhes"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
