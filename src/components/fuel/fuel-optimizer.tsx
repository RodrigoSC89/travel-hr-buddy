// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Fuel,
  TrendingDown,
  TrendingUp,
  Route,
  Sparkles,
  BarChart3,
  Calculator,
  CheckCircle2,
  Download,
  FileText,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { FuelOptimizationService } from "@/services/fuel-optimization-service";
import { FuelAICopilot } from "./FuelAICopilot";
import { FuelAnalysisPanel } from "./FuelAnalysisPanel";
import { FuelSimulator } from "./FuelSimulator";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface FuelRecord {
  id: string;
  vessel_id: string;
  fuel_type: string;
  quantity_consumed: number;
  consumption_rate: number;
  efficiency_rating: number;
  record_date: string;
  distance_covered_nm: number;
  vessel_speed_knots: number;
}

interface RouteComparison {
  id: string;
  route_id: string;
  planned_fuel_consumption: number;
  actual_fuel_consumption: number;
  fuel_efficiency: number;
  route_optimization_score: number;
  ai_recommendation: string;
}

interface OptimizationResult {
  route_name: string;
  original_consumption: number;
  optimized_consumption: number;
  savings_liters: number;
  savings_percentage: number;
  recommendations: string[];
  confidence_score: number;
  optimal_speed: number;
  reasoning: string;
}

// Demo data for when database tables don't exist
const demoOptimizationResults: OptimizationResult[] = [
  {
    route_name: "Santos → Rio de Janeiro",
    original_consumption: 1250,
    optimized_consumption: 1050,
    savings_liters: 200,
    savings_percentage: 16,
    recommendations: [
      "Reduza a velocidade de 14 para 11 nós para economia ideal",
      "Condições meteorológicas favoráveis detectadas",
      "Economia significativa de 16% é alcançável"
    ],
    confidence_score: 85,
    optimal_speed: 11,
    reasoning: "Análise das condições mostra tempo favorável. Reduzindo velocidade de 14 para 11 nós, o consumo pode ser reduzido em aproximadamente 16%."
  },
  {
    route_name: "Rio de Janeiro → Vitória",
    original_consumption: 980,
    optimized_consumption: 870,
    savings_liters: 110,
    savings_percentage: 11.2,
    recommendations: [
      "Ajuste velocidade para 10.5 nós",
      "Aproveite correntes favoráveis na região",
      "Economia moderada de 11% possível"
    ],
    confidence_score: 82,
    optimal_speed: 10.5,
    reasoning: "Correntes marítimas favoráveis na rota. Velocidade otimizada de 10.5 nós permite economia de 11.2%."
  },
  {
    route_name: "Paranaguá → Santos",
    original_consumption: 1100,
    optimized_consumption: 990,
    savings_liters: 110,
    savings_percentage: 10,
    recommendations: [
      "Mantenha velocidade entre 10-11 nós",
      "Rota já está próxima do ideal",
      "Pequenos ajustes podem render 10% de economia"
    ],
    confidence_score: 78,
    optimal_speed: 10.5,
    reasoning: "Rota relativamente curta com condições estáveis. Ajuste fino de velocidade permite economia de 10%."
  },
  {
    route_name: "Salvador → Recife",
    original_consumption: 1500,
    optimized_consumption: 1200,
    savings_liters: 300,
    savings_percentage: 20,
    recommendations: [
      "Velocidade atual muito alta - reduza significativamente",
      "Considere rota alternativa mais costeira",
      "Potencial de economia de 20% identificado"
    ],
    confidence_score: 88,
    optimal_speed: 10,
    reasoning: "Alto potencial de otimização. Velocidade excessiva atual causa consumo elevado. Redução para 10 nós oferece economia de 20%."
  }
];

export const FuelOptimizer = () => {
  const { toast } = useToast();
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([]);
  const [routeComparisons, setRouteComparisons] = useState<RouteComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResult[]>(demoOptimizationResults);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadFuelData();
  }, []);

  const loadFuelData = async () => {
    try {
      setLoading(true);
      
      const [fuelData, routeData] = await Promise.all([
        supabase
          .from("fuel_records")
          .select("*")
          .order("record_date", { ascending: false })
          .limit(50),
        supabase
          .from("route_consumption")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20)
      ]);

      // Only set data if query succeeded (table exists)
      if (!fuelData.error) {
        setFuelRecords(fuelData.data || []);
      }
      if (!routeData.error) {
        setRouteComparisons(routeData.data || []);
      }

      // Run optimization with available data
      await runOptimizationAnalysis();

    } catch (error: unknown) {
      console.error("Error loading fuel data:", error);
      // Keep using demo data - don't show error toast
    } finally {
      setLoading(false);
    }
  };

  const runOptimizationAnalysis = async () => {
    try {
      const { data: routes, error } = await supabase
        .from("vessel_routes")
        .select("*")
        .limit(5);
      
      if (!error && routes && routes.length > 0) {
        const results = routes.map((route: Record<string, unknown>) => {
          const routeData = {
            distance_nm: (route.distance_nm as number) || 100,
            weather_factor: (route.weather_factor as number) || 1.0,
            current_factor: (route.current_factor as number) || 1.0,
            departure_port: route.departure_port as string,
            arrival_port: route.arrival_port as string
          };
          
          const currentSpeed = (route.planned_speed as number) || 13;
          const historicalData = {
            avg_consumption_rate: 2.5,
            avg_speed: 12,
            efficiency_rating: 85
          };
          
          const optimization = FuelOptimizationService.optimizeRoute(
            routeData,
            currentSpeed,
            historicalData
          );
          
          return {
            route_name: `${route.departure_port || "Porto A"} → ${route.arrival_port || "Porto B"}`,
            ...optimization
          };
        });
        
        setOptimizationResults(results);
      }
      // If no routes found, keep using demo data
    } catch (error) {
      console.error("Error running optimization:", error);
      // Keep using demo data
    }
  };

  const getAverageFuelConsumption = () => {
    if (fuelRecords.length === 0) {
      // Return demo average
      return 2.3;
    }
    const total = fuelRecords.reduce((sum, record) => sum + record.quantity_consumed, 0);
    return total / fuelRecords.length;
  };

  const getAverageEfficiency = () => {
    if (fuelRecords.length === 0) {
      // Return demo efficiency
      return 87.5;
    }
    const total = fuelRecords.reduce((sum, record) => sum + (record.efficiency_rating || 0), 0);
    return total / fuelRecords.length;
  };

  const getOptimizationSavings = () => {
    const savingsFromOptimization = optimizationResults.reduce((sum, result) => sum + result.savings_liters, 0);
    if (savingsFromOptimization > 0) return savingsFromOptimization / 1000; // Convert to MT
    
    if (routeComparisons.length === 0) {
      // Return demo savings
      return 0.72;
    }
    return routeComparisons.reduce((sum, route) => {
      if (route.actual_fuel_consumption && route.planned_fuel_consumption) {
        const saving = route.planned_fuel_consumption - route.actual_fuel_consumption;
        return sum + (saving > 0 ? saving : 0);
      }
      return sum;
    }, 0);
  };

  const getFuelTrend = () => {
    if (fuelRecords.length < 2) return "estável";
    const recent = fuelRecords.slice(0, 5);
    const older = fuelRecords.slice(5, 10);
    
    const recentAvg = recent.reduce((sum, r) => sum + r.quantity_consumed, 0) / recent.length;
    const olderAvg = older.length > 0 
      ? older.reduce((sum, r) => sum + r.quantity_consumed, 0) / older.length 
      : recentAvg;

    if (recentAvg > olderAvg * 1.1) return "crescente";
    if (recentAvg < olderAvg * 0.9) return "decrescente";
    return "estável";
  };

  const exportToPDF = async () => {
    try {
      const [{ default: jsPDF }, autoTableModule] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable")
      ]);
      
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(18);
      doc.text("Relatório de Otimização de Combustível", 14, 20);
      
      // Date
      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 14, 28);
      
      // Summary Section
      doc.setFontSize(14);
      doc.text("Resumo", 14, 40);
      doc.setFontSize(10);
      doc.text(`Consumo Médio: ${getAverageFuelConsumption().toFixed(1)} MT`, 14, 48);
      doc.text(`Eficiência Média: ${getAverageEfficiency().toFixed(1)}%`, 14, 54);
      doc.text(`Economia Total: ${getOptimizationSavings().toFixed(2)} MT`, 14, 60);
      doc.text(`Tendência: ${getFuelTrend()}`, 14, 66);
      
      // Optimization Results
      if (optimizationResults.length > 0) {
        doc.setFontSize(14);
        doc.text("Recomendações de Otimização", 14, 80);
        
        const tableData = optimizationResults.map((result) => [
          result.route_name,
          `${result.original_consumption.toFixed(0)}L`,
          `${result.optimized_consumption.toFixed(0)}L`,
          `${result.savings_percentage.toFixed(1)}%`,
          `${result.optimal_speed.toFixed(1)} nós`,
          `${result.confidence_score}%`
        ]);
        
        (doc as unknown as { autoTable: (options: Record<string, unknown>) => void }).autoTable({
          startY: 85,
          head: [["Rota", "Original", "Otimizado", "Economia", "Vel. Ideal", "Confiança"]],
          body: tableData,
          theme: "striped",
          headStyles: { fillColor: [59, 130, 246] }
        });
      }
      
      doc.save(`relatorio-combustivel-${new Date().toISOString().split("T")[0]}.pdf`);
      
      toast({
        title: "Relatório exportado",
        description: "PDF baixado com sucesso",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o PDF",
        variant: "destructive",
      });
    }
  };

  const getOptimizationChartData = () => {
    return {
      labels: optimizationResults.map((r) => r.route_name),
      datasets: [
        {
          label: "Consumo Original (L)",
          data: optimizationResults.map(r => r.original_consumption),
          backgroundColor: "rgba(239, 68, 68, 0.6)",
        },
        {
          label: "Consumo Otimizado (L)",
          data: optimizationResults.map(r => r.optimized_consumption),
          backgroundColor: "rgba(34, 197, 94, 0.6)",
        }
      ]
    };
  };

  const fuelDataForCopilot = {
    averageConsumption: getAverageFuelConsumption(),
    totalSavings: getOptimizationSavings(),
    trend: getFuelTrend(),
    routesAnalyzed: optimizationResults.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Fuel className="h-8 w-8" />
            Otimizador de Combustível
          </h1>
          <p className="text-muted-foreground">
            Otimização inteligente de rotas e análise de consumo
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadFuelData} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button onClick={exportToPDF}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Economia Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(getOptimizationSavings() * 100 / (getAverageFuelConsumption() * optimizationResults.length || 1)).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Média das rotas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rotas Simuladas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {optimizationResults.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total de análises</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Combustível Economizado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getOptimizationSavings().toFixed(2)} t
            </div>
            <p className="text-xs text-muted-foreground mt-1">Toneladas totais</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="simulator">Simulador</TabsTrigger>
          <TabsTrigger value="analysis">Análise</TabsTrigger>
          <TabsTrigger value="copilot">Copiloto IA</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Comparação - Consumo Original vs Otimizado
              </CardTitle>
              <CardDescription>
                Potencial de economia por rota analisada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Bar
                  data={getOptimizationChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top" as const,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: "Consumo (Litros)"
                        }
                      }
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Optimization Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                Análise de Otimização por IA
              </CardTitle>
              <CardDescription>
                Recomendações detalhadas para cada rota
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizationResults.map((result, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-lg">{result.route_name}</h4>
                          <Badge variant={result.savings_percentage > 10 ? "default" : "secondary"}>
                            {result.savings_percentage.toFixed(1)}% Economia
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Original</p>
                            <p className="font-semibold">{result.original_consumption.toFixed(0)}L</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Otimizado</p>
                            <p className="font-semibold text-green-600">{result.optimized_consumption.toFixed(0)}L</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Velocidade Ideal</p>
                            <p className="font-semibold">{result.optimal_speed.toFixed(1)} nós</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Confiança</p>
                            <p className="font-semibold">{result.confidence_score}%</p>
                          </div>
                        </div>
                        
                        <div className="pt-2">
                          <p className="text-sm text-muted-foreground mb-2">
                            <FileText className="h-4 w-4 inline mr-1" />
                            Análise:
                          </p>
                          <p className="text-sm">{result.reasoning}</p>
                        </div>
                        
                        <div className="pt-2">
                          <p className="text-sm font-medium mb-2">Recomendações:</p>
                          <ul className="space-y-1">
                            {result.recommendations.map((rec: string, idx: number) => (
                              <li key={idx} className="text-sm flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulator">
          <FuelSimulator />
        </TabsContent>

        <TabsContent value="analysis">
          <FuelAnalysisPanel 
            averageEfficiency={getAverageEfficiency()}
            totalConsumption={optimizationResults.reduce((sum, r) => sum + r.original_consumption, 0)}
            targetReduction={15}
          />
        </TabsContent>

        <TabsContent value="copilot">
          <FuelAICopilot fuelData={fuelDataForCopilot} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
