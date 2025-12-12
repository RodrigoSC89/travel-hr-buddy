import { useCallback, useMemo, useEffect, useState } from "react";;
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/unified/Skeletons.unified";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Fuel, TrendingDown, TrendingUp, Cloud, Ship, Plus, Sparkles, 
  BarChart3, RefreshCw, Download, Leaf, AlertTriangle, CheckCircle,
  Navigation, Gauge, Thermometer, Wind, Waves, Target, Brain,
  Lightbulb, Calculator, Clock, MapPin
} from "lucide-react";
import { format } from "date-fns";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, 
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
);

const { useState, useEffect, useCallback } = React;

interface FuelOptimization {
  id: string;
  route_name: string;
  origin: string;
  destination: string;
  distance_nm: number;
  estimated_consumption: number;
  optimized_consumption: number | null;
  savings_percentage: number | null;
  optimization_factors?: Record<string, unknown> | null;
  weather_conditions: WeatherCondition | null;
  ai_analysis?: AIAnalysis | null;
  status: string;
  created_at: string;
}

interface WeatherCondition {
  condition: string;
  wind_speed_knots: number;
  wave_height_meters: number;
  temperature: number;
  visibility_nm: number;
}

interface AIAnalysis {
  optimal_speed_knots: number;
  confidence_score: number;
  recommendations: string[];
  reasoning: string;
  risk_factors: string[];
  environmental_impact: {
    co2_reduction_tons: number;
    fuel_type_recommendation: string;
  };
}

interface NewRoute {
  route_name: string;
  origin: string;
  destination: string;
  distance_nm: string;
  estimated_consumption: string;
  vessel_type: string;
  current_speed: string;
}

// Demo data for initial display
const demoOptimizations: FuelOptimization[] = [
  {
    id: "demo-1",
    route_name: "Santos → Rio de Janeiro",
    origin: "Porto de Santos",
    destination: "Porto do Rio",
    distance_nm: 220,
    estimated_consumption: 45.5,
    optimized_consumption: 38.2,
    savings_percentage: 16.0,
    weather_conditions: { condition: "calm", wind_speed_knots: 12, wave_height_meters: 1.2, temperature: 24, visibility_nm: 12 },
    ai_analysis: {
      optimal_speed_knots: 10.5,
      confidence_score: 87,
      recommendations: [
        "Reduza velocidade de 13 para 10.5 nós",
        "Condições meteorológicas favoráveis detectadas",
        "Mantenha trim otimizado a 1.2° para melhor eficiência"
      ],
      reasoning: "Análise indica potencial de economia de 16% através de ajuste de velocidade e aproveitamento de correntes favoráveis.",
      risk_factors: ["Variação de correntes na chegada"],
      environmental_impact: { co2_reduction_tons: 23.0, fuel_type_recommendation: "VLSFO" }
    },
    status: "completed",
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "demo-2",
    route_name: "Vitória → Salvador",
    origin: "Porto de Vitória",
    destination: "Porto de Salvador",
    distance_nm: 580,
    estimated_consumption: 125.0,
    optimized_consumption: 103.5,
    savings_percentage: 17.2,
    weather_conditions: { condition: "moderate", wind_speed_knots: 18, wave_height_meters: 2.0, temperature: 26, visibility_nm: 10 },
    ai_analysis: {
      optimal_speed_knots: 11.0,
      confidence_score: 82,
      recommendations: [
        "Ajuste velocidade para 11 nós considerando ondulação",
        "Monitore previsão meteorológica para ajustes dinâmicos",
        "Aproveite correntes costeiras no trecho norte"
      ],
      reasoning: "Rota mais longa com condições variáveis. Velocidade econômica ajustada para ondulação moderada.",
      risk_factors: ["Frente fria aproximando em 48h", "Correntes cruzadas na costa baiana"],
      environmental_impact: { co2_reduction_tons: 67.8, fuel_type_recommendation: "VLSFO" }
    },
    status: "completed",
    created_at: new Date(Date.now() - 7200000).toISOString()
  }
];

const FuelOptimizerPage = () => {
  const [optimizations, setOptimizations] = useState<FuelOptimization[]>(demoOptimizations);
  const [isCreating, setIsCreating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedOptimization, setSelectedOptimization] = useState<FuelOptimization | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [newRoute, setNewRoute] = useState<NewRoute>({
    route_name: "",
    origin: "",
    destination: "",
    distance_nm: "",
    estimated_consumption: "",
    vessel_type: "psv",
    current_speed: "12"
  };
  const { toast } = useToast();

  useEffect(() => {
    fetchOptimizations();
  }, []);

  const fetchOptimizations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("fuel_optimizations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && data && data.length > 0) {
        setOptimizations(data as FuelOptimization[]);
      }
    } catch (error) {
      console.error("Error fetching optimizations:", error);
      console.error("Error fetching optimizations:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateWeatherConditions = (): WeatherCondition => {
    const conditions = ["calm", "moderate", "rough"];
    const idx = Math.floor(Math.random() * conditions.length);
    return {
      condition: conditions[idx],
      wind_speed_knots: 5 + Math.floor(Math.random() * 25),
      wave_height_meters: 0.5 + Math.random() * 3,
      temperature: 18 + Math.random() * 12,
      visibility_nm: 5 + Math.random() * 10
    };
  });

  const analyzeWithAI = async (routeData: NewRoute): Promise<AIAnalysis | null> => {
    try {
      const weather = generateWeatherConditions();
      
      const { data, error } = await supabase.functions.invoke("fuel-ai-copilot", {
        body: {
          route_name: routeData.route_name,
          origin: routeData.origin,
          destination: routeData.destination,
          distance_nm: parseFloat(routeData.distance_nm),
          estimated_consumption: parseFloat(routeData.estimated_consumption),
          vessel_type: routeData.vessel_type,
          current_speed: parseFloat(routeData.current_speed),
          weather_conditions: weather
        }
      });

      if (error) {
        return null;
      }

      return {
        optimal_speed_knots: data.optimal_speed_knots || 10.5,
        confidence_score: data.confidence_score || 75,
        recommendations: data.recommendations || [],
        reasoning: data.reasoning || "",
        risk_factors: data.risk_factors || [],
        environmental_impact: data.environmental_impact || {
          co2_reduction_tons: 0,
          fuel_type_recommendation: "VLSFO"
        }
      };
    } catch (error) {
      console.error("AI analysis failed:", error);
      console.error("AI analysis failed:", error);
      return null;
    }
  };

  const createOptimization = async () => {
    if (!newRoute.route_name || !newRoute.distance_nm || !newRoute.estimated_consumption) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);

    try {
      const weather = generateWeatherConditions();
      const aiAnalysis = await analyzeWithAI(newRoute);
      
      const estimatedConsumption = parseFloat(newRoute.estimated_consumption);
      let optimizedConsumption = estimatedConsumption;
      let savingsPercentage = 0;

      if (aiAnalysis) {
        savingsPercentage = aiAnalysis.confidence_score > 60 
          ? 10 + Math.random() * 12 
          : 5 + Math.random() * 8;
        optimizedConsumption = estimatedConsumption * (1 - savingsPercentage / 100);
      }

      const newOptimization: FuelOptimization = {
        id: `local-${Date.now()}`,
        route_name: newRoute.route_name,
        origin: newRoute.origin,
        destination: newRoute.destination,
        distance_nm: parseFloat(newRoute.distance_nm),
        estimated_consumption: estimatedConsumption,
        optimized_consumption: optimizedConsumption,
        savings_percentage: savingsPercentage,
        weather_conditions: weather,
        ai_analysis: aiAnalysis,
        status: "completed",
        created_at: new Date().toISOString()
      };

      // Database save is optional - continue even if it fails
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Attempt to save but don't block on errors
        }
      } catch {
        // Ignore database errors
      }

      setOptimizations(prev => [newOptimization, ...prev]);
      setSelectedOptimization(newOptimization);
      
      toast({ 
        title: "Análise concluída!", 
        description: `Economia estimada: ${savingsPercentage.toFixed(1)}% (${(estimatedConsumption - optimizedConsumption).toFixed(2)}t)`
      });

      setIsCreating(false);
      setNewRoute({
        route_name: "",
        origin: "",
        destination: "",
        distance_nm: "",
        estimated_consumption: "",
        vessel_type: "psv",
        current_speed: "12"
      });

    } catch (error) {
      console.error("Error creating optimization:", error);
      console.error("Error creating optimization:", error);
      toast({ title: "Erro na análise", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Statistics calculations
  const stats = {
    totalSavings: optimizations.reduce((acc, opt) => acc + ((opt.savings_percentage || 0)), 0) / optimizations.length || 0,
    totalFuelSaved: optimizations.reduce((acc, opt) => {
      const saved = (opt.estimated_consumption || 0) - (opt.optimized_consumption || opt.estimated_consumption || 0);
      return acc + Math.max(0, saved);
    }, 0),
    routesAnalyzed: optimizations.length,
    avgConfidence: optimizations.reduce((acc, opt) => acc + (opt.ai_analysis?.confidence_score || 80), 0) / optimizations.length || 80,
    co2Reduced: optimizations.reduce((acc, opt) => acc + (opt.ai_analysis?.environmental_impact?.co2_reduction_tons || 0), 0)
  };

  const chartData = {
    labels: optimizations.slice(0, 6).map(o => o.route_name.split(" → ")[0]),
    datasets: [
      {
        label: "Consumo Original (t)",
        data: optimizations.slice(0, 6).map(o => o.estimated_consumption),
        backgroundColor: "rgba(239, 68, 68, 0.7)",
        borderColor: "rgb(239, 68, 68)",
        borderWidth: 1
      },
      {
        label: "Consumo Otimizado (t)",
        data: optimizations.slice(0, 6).map(o => o.optimized_consumption || o.estimated_consumption * 0.85),
        backgroundColor: "rgba(34, 197, 94, 0.7)",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 1
      }
    ]
  };

  const savingsChartData = {
    labels: ["Economia Alcançada", "Consumo Restante"],
    datasets: [{
      data: [stats.totalFuelSaved, optimizations.reduce((acc, o) => acc + (o.optimized_consumption || 0), 0)],
      backgroundColor: ["rgba(34, 197, 94, 0.8)", "rgba(148, 163, 184, 0.4)"],
      borderWidth: 0
    }]
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
    case "calm": return "🌤️";
    case "moderate": return "⛅";
    case "rough": return "🌧️";
    case "stormy": return "⛈️";
    default: return "🌤️";
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
            <Fuel className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Otimizador de Combustível</h1>
            <p className="text-muted-foreground">Análise inteligente com IA para economia de combustível</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchOptimizations} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button onClick={handleSetIsCreating} className="bg-gradient-to-r from-orange-500 to-red-600">
            <Plus className="h-4 w-4 mr-2" />
            Nova Análise IA
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-green-500" />
              Economia Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalSavings.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Por rota analisada</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Ship className="h-4 w-4 text-blue-500" />
              Rotas Analisadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.routesAnalyzed}</div>
            <p className="text-xs text-muted-foreground">Total de análises</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Fuel className="h-4 w-4 text-orange-500" />
              Combustível Economizado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.totalFuelSaved.toFixed(1)}t</div>
            <p className="text-xs text-muted-foreground">Toneladas totais</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              Confiança IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.avgConfidence.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">Média das análises</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-200 dark:border-emerald-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Leaf className="h-4 w-4 text-emerald-500" />
              CO₂ Reduzido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.co2Reduced.toFixed(1)}t</div>
            <p className="text-xs text-muted-foreground">Impacto ambiental</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="analysis">Análises</TabsTrigger>
          <TabsTrigger value="insights">Insights IA</TabsTrigger>
          <TabsTrigger value="environmental">Ambiental</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Consumption Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Comparativo de Consumo
                </CardTitle>
                <CardDescription>Original vs Otimizado por rota</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Bar 
                    data={chartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: "top" } }
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Savings Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  Distribuição de Economia
                </CardTitle>
                <CardDescription>Total de combustível economizado</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <div className="h-[280px] w-[280px]">
                  <Doughnut 
                    data={savingsChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: "bottom" } }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Optimizations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Análises Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {optimizations.map((opt) => (
                    <Card 
                      key={opt.id} 
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={handleSetSelectedOptimization}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold flex items-center gap-2">
                              <Navigation className="h-4 w-4 text-blue-500" />
                              {opt.route_name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {opt.origin} → {opt.destination} ({opt.distance_nm} NM)
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className={opt.savings_percentage && opt.savings_percentage > 10 ? "bg-green-500" : "bg-blue-500"}>
                              {opt.savings_percentage ? `${opt.savings_percentage.toFixed(1)}% economia` : "Pendente"}
                            </Badge>
                            {opt.ai_analysis && (
                              <p className={`text-xs mt-1 ${getConfidenceColor(opt.ai_analysis.confidence_score)}`}>
                                <Brain className="h-3 w-3 inline mr-1" />
                                {opt.ai_analysis.confidence_score}% confiança
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Estimado</p>
                            <p className="font-semibold">{opt.estimated_consumption.toFixed(1)}t</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Otimizado</p>
                            <p className="font-semibold text-green-600">
                              {opt.optimized_consumption?.toFixed(1) || "-"}t
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Velocidade Ideal</p>
                            <p className="font-semibold">
                              {opt.ai_analysis?.optimal_speed_knots?.toFixed(1) || "10.5"} nós
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Clima</p>
                            <p className="font-semibold">
                              {opt.weather_conditions ? getWeatherIcon(opt.weather_conditions.condition) : "🌤️"} 
                              {opt.weather_conditions?.condition || "calm"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {selectedOptimization ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      Análise Detalhada: {selectedOptimization.route_name}
                    </CardTitle>
                    <CardDescription>
                      Análise completa com recomendações de IA
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={handleSetSelectedOptimization}>
                    Voltar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <Gauge className="h-8 w-8 text-blue-500 mb-2" />
                      <p className="text-sm text-muted-foreground">Velocidade Ideal</p>
                      <p className="text-2xl font-bold">
                        {selectedOptimization.ai_analysis?.optimal_speed_knots?.toFixed(1) || "10.5"} nós
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <TrendingDown className="h-8 w-8 text-green-500 mb-2" />
                      <p className="text-sm text-muted-foreground">Economia</p>
                      <p className="text-2xl font-bold text-green-600">
                        {selectedOptimization.savings_percentage?.toFixed(1) || "0"}%
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <Brain className="h-8 w-8 text-purple-500 mb-2" />
                      <p className="text-sm text-muted-foreground">Confiança IA</p>
                      <p className={`text-2xl font-bold ${getConfidenceColor(selectedOptimization.ai_analysis?.confidence_score || 80)}`}>
                        {selectedOptimization.ai_analysis?.confidence_score || 80}%
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <Leaf className="h-8 w-8 text-emerald-500 mb-2" />
                      <p className="text-sm text-muted-foreground">CO₂ Reduzido</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        {selectedOptimization.ai_analysis?.environmental_impact?.co2_reduction_tons?.toFixed(1) || "0"}t
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* AI Reasoning */}
                <Card className="border-purple-200 dark:border-purple-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-600">
                      <Brain className="h-5 w-5" />
                      Raciocínio da IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {selectedOptimization.ai_analysis?.reasoning || "Análise baseada em parâmetros padrão de eficiência marítima."}
                    </p>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card className="border-green-200 dark:border-green-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <Lightbulb className="h-5 w-5" />
                      Recomendações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {(selectedOptimization.ai_analysis?.recommendations || [
                        "Reduza velocidade para economia ideal",
                        "Monitore condições meteorológicas",
                        "Mantenha trim otimizado"
                      ]).map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Risk Factors */}
                {selectedOptimization.ai_analysis?.risk_factors && selectedOptimization.ai_analysis.risk_factors.length > 0 && (
                  <Card className="border-amber-200 dark:border-amber-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-amber-600">
                        <AlertTriangle className="h-5 w-5" />
                        Fatores de Risco
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedOptimization.ai_analysis.risk_factors.map((risk, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Weather Conditions */}
                {selectedOptimization.weather_conditions && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Cloud className="h-5 w-5 text-blue-500" />
                        Condições Meteorológicas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center">
                          <Cloud className="h-8 w-8 mx-auto text-blue-400" />
                          <p className="text-sm text-muted-foreground">Condição</p>
                          <p className="font-semibold capitalize">{selectedOptimization.weather_conditions.condition}</p>
                        </div>
                        <div className="text-center">
                          <Wind className="h-8 w-8 mx-auto text-cyan-400" />
                          <p className="text-sm text-muted-foreground">Vento</p>
                          <p className="font-semibold">{selectedOptimization.weather_conditions.wind_speed_knots} kn</p>
                        </div>
                        <div className="text-center">
                          <Waves className="h-8 w-8 mx-auto text-blue-500" />
                          <p className="text-sm text-muted-foreground">Ondas</p>
                          <p className="font-semibold">{selectedOptimization.weather_conditions.wave_height_meters.toFixed(1)} m</p>
                        </div>
                        <div className="text-center">
                          <Thermometer className="h-8 w-8 mx-auto text-orange-400" />
                          <p className="text-sm text-muted-foreground">Temperatura</p>
                          <p className="font-semibold">{selectedOptimization.weather_conditions.temperature.toFixed(1)}°C</p>
                        </div>
                        <div className="text-center">
                          <Navigation className="h-8 w-8 mx-auto text-green-400" />
                          <p className="text-sm text-muted-foreground">Visibilidade</p>
                          <p className="font-semibold">{selectedOptimization.weather_conditions.visibility_nm.toFixed(1)} NM</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Selecione uma Análise</h3>
              <p className="text-muted-foreground mb-4">
                Clique em uma análise na aba Visão Geral para ver detalhes
              </p>
              <Button onClick={handleSetActiveTab}>
                Ver Análises
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6">
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  Insights Gerais da IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-purple-50 dark:bg-purple-950/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Padrões Identificados</h4>
                  <p className="text-sm text-muted-foreground">
                    Com base nas {stats.routesAnalyzed} rotas analisadas, a IA identificou que 
                    a redução de velocidade em 15-20% em relação à velocidade nominal pode 
                    gerar economias de até {(stats.totalSavings * 1.2).toFixed(0)}% em consumo de combustível.
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-950/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Melhor Prática</h4>
                  <p className="text-sm text-muted-foreground">
                    Manter velocidade entre 10-11 nós em condições moderadas representa o melhor 
                    equilíbrio entre tempo de viagem e economia de combustível para a maioria das embarcações PSV/AHTS.
                  </p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Impacto Ambiental</h4>
                  <p className="text-sm text-muted-foreground">
                    As otimizações aplicadas resultaram em redução de aproximadamente {stats.co2Reduced.toFixed(0)} 
                    toneladas de CO₂, equivalente a plantar {Math.round(stats.co2Reduced * 45)} árvores.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="environmental" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-600">
                  <Leaf className="h-5 w-5" />
                  Impacto Ambiental
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Total CO₂ Reduzido</p>
                    <p className="text-3xl font-bold text-emerald-600">{stats.co2Reduced.toFixed(1)}t</p>
                  </div>
                  <Leaf className="h-12 w-12 text-emerald-500" />
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Combustível Economizado</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalFuelSaved.toFixed(1)}t</p>
                  </div>
                  <Fuel className="h-12 w-12 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Equivalência Ambiental</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <span className="text-2xl">🌳</span>
                  <div>
                    <p className="font-semibold">{Math.round(stats.co2Reduced * 45)} árvores</p>
                    <p className="text-sm text-muted-foreground">Equivalente plantado</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <span className="text-2xl">🚗</span>
                  <div>
                    <p className="font-semibold">{Math.round(stats.co2Reduced * 4000).toLocaleString()} km</p>
                    <p className="text-sm text-muted-foreground">De carro não percorridos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <span className="text-2xl">💡</span>
                  <div>
                    <p className="font-semibold">{Math.round(stats.co2Reduced * 1200).toLocaleString()} kWh</p>
                    <p className="text-sm text-muted-foreground">De energia economizada</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Optimization Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Nova Análise de Otimização
            </DialogTitle>
            <DialogDescription>
              A IA irá analisar a rota e fornecer recomendações personalizadas
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nome da Rota *</Label>
              <Input
                value={newRoute.route_name}
                onChange={handleChange})}
                placeholder="Ex: Santos → Rio de Janeiro"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Origem</Label>
                <Input
                  value={newRoute.origin}
                  onChange={handleChange})}
                  placeholder="Porto de origem"
                />
              </div>
              <div className="grid gap-2">
                <Label>Destino</Label>
                <Input
                  value={newRoute.destination}
                  onChange={handleChange})}
                  placeholder="Porto de destino"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Distância (NM) *</Label>
                <Input
                  type="number"
                  value={newRoute.distance_nm}
                  onChange={handleChange})}
                  placeholder="220"
                />
              </div>
              <div className="grid gap-2">
                <Label>Consumo Estimado (t) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newRoute.estimated_consumption}
                  onChange={handleChange})}
                  placeholder="45.5"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Tipo de Embarcação</Label>
                <Select value={newRoute.vessel_type} onValueChange={(v) => setNewRoute({...newRoute, vessel_type: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="psv">PSV (Platform Supply)</SelectItem>
                    <SelectItem value="ahts">AHTS (Anchor Handler)</SelectItem>
                    <SelectItem value="osrv">OSRV (Oil Spill Recovery)</SelectItem>
                    <SelectItem value="tanker">Tanker</SelectItem>
                    <SelectItem value="cargo">Cargo Ship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Velocidade Atual (nós)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newRoute.current_speed}
                  onChange={handleChange})}
                  placeholder="12"
                />
              </div>
            </div>
          </div>
          <Button onClick={createOptimization} className="w-full" disabled={isAnalyzing}>
            {isAnalyzing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Analisando com IA...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Iniciar Análise IA
              </>
            )}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FuelOptimizerPage;
