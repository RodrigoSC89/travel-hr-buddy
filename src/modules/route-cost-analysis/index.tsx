import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, TrendingUp, TrendingDown, Ship, Fuel, Users, Wrench,
  Navigation, Calendar, Brain, Sparkles, AlertTriangle, CheckCircle2,
  BarChart3, PieChart, Download, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNautilusEnhancementAI } from "@/hooks/useNautilusEnhancementAI";

interface RouteCost {
  id: string;
  route: string;
  vessel: string;
  period: string;
  totalCost: number;
  breakdown: {
    fuel: number;
    crew: number;
    maintenance: number;
    port: number;
    other: number;
  };
  efficiency: number;
  variance: number;
  aiInsights: string[];
}

const sampleCosts: RouteCost[] = [
  {
    id: "1",
    route: "Santos → Rotterdam",
    vessel: "MV Atlântico Sul",
    period: "2024-02",
    totalCost: 485000,
    breakdown: {
      fuel: 285000,
      crew: 95000,
      maintenance: 45000,
      port: 42000,
      other: 18000
    },
    efficiency: 92,
    variance: -5.2,
    aiInsights: [
      "Economia de 8% em combustível vs média histórica",
      "Custo de tripulação dentro do esperado",
      "Manutenção preventiva reduziu custos não planejados em 23%"
    ]
  },
  {
    id: "2",
    route: "Rio → Macaé (Offshore)",
    vessel: "PSV Oceano Azul",
    period: "2024-02",
    totalCost: 156000,
    breakdown: {
      fuel: 68000,
      crew: 52000,
      maintenance: 18000,
      port: 12000,
      other: 6000
    },
    efficiency: 88,
    variance: 3.8,
    aiInsights: [
      "Consumo de combustível 4% acima do benchmark",
      "Recomendado ajuste de velocidade econômica",
      "Custo portuário otimizado com janelas preferenciais"
    ]
  },
  {
    id: "3",
    route: "Bacia de Santos (Operação DP)",
    vessel: "AHTS Maré Alta",
    period: "2024-02",
    totalCost: 892000,
    breakdown: {
      fuel: 425000,
      crew: 185000,
      maintenance: 125000,
      port: 85000,
      other: 72000
    },
    efficiency: 78,
    variance: 12.5,
    aiInsights: [
      "⚠️ Custo operacional 12.5% acima do orçado",
      "Alto consumo de combustível em modo DP",
      "Manutenção não planejada impactou orçamento",
      "Sugerido revisão de contrato de fornecimento"
    ]
  }
];

export default function RouteCostAnalysis() {
  const { toast } = useToast();
  const { analyzeRouteCost, isLoading } = useNautilusEnhancementAI();
  const [costs, setCosts] = useState<RouteCost[]>(sampleCosts);
  const [selectedPeriod, setSelectedPeriod] = useState("2024-02");
  const [selectedVessel, setSelectedVessel] = useState("all");

  const handleAIAnalysis = async () => {
    toast({ title: "Analisando custos...", description: "IA identificando desvios e oportunidades" });
    
    const routeData = filteredCosts.map(c => ({
      route: c.route,
      vessel: c.vessel,
      totalCost: c.totalCost,
      breakdown: c.breakdown,
      efficiency: c.efficiency
    }));
    
    const result = await analyzeRouteCost(routeData, { period: selectedPeriod });
    
    if (result?.response) {
      const aiResponse = result.response;
      
      // Update costs with new AI insights
      setCosts(prev => prev.map(cost => ({
        ...cost,
        aiInsights: aiResponse.insights?.[cost.id] || cost.aiInsights
      })));
      
      toast({ 
        title: "Análise concluída", 
        description: `${aiResponse.opportunitiesCount || 3} oportunidades de economia identificadas` 
      });
    } else {
      toast({ title: "Erro", description: "Falha na análise de IA", variant: "destructive" });
    }
  };

  const filteredCosts = selectedVessel === "all" 
    ? costs 
    : costs.filter(c => c.vessel === selectedVessel);

  const totalCost = filteredCosts.reduce((acc, c) => acc + c.totalCost, 0);
  const avgEfficiency = filteredCosts.reduce((acc, c) => acc + c.efficiency, 0) / filteredCosts.length;
  const totalFuel = filteredCosts.reduce((acc, c) => acc + c.breakdown.fuel, 0);

  const getCostColor = (variance: number) => {
    if (variance <= 0) return "text-green-600";
    if (variance <= 5) return "text-amber-600";
    return "text-red-600";
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return "bg-green-500";
    if (efficiency >= 80) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white">
            <DollarSign className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Análise de Custos por Rota
              <Badge variant="secondary">
                <Brain className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              Análise cruzada de custos com IA apontando desvios e otimizações
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-02">Fev 2024</SelectItem>
              <SelectItem value="2024-01">Jan 2024</SelectItem>
              <SelectItem value="2023-12">Dez 2023</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedVessel} onValueChange={setSelectedVessel}>
            <SelectTrigger className="w-[180px]">
              <Ship className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Embarcação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="MV Atlântico Sul">MV Atlântico Sul</SelectItem>
              <SelectItem value="PSV Oceano Azul">PSV Oceano Azul</SelectItem>
              <SelectItem value="AHTS Maré Alta">AHTS Maré Alta</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAIAnalysis} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Analisar com IA
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Custo Total</p>
                <p className="text-2xl font-bold">R$ {(totalCost / 1000000).toFixed(2)}M</p>
                <p className="text-xs text-green-600">↓ 3.2% vs mês anterior</p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Eficiência Média</p>
                <p className="text-2xl font-bold">{avgEfficiency.toFixed(0)}%</p>
                <p className="text-xs text-green-600">↑ 2.1% melhoria</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Combustível</p>
                <p className="text-2xl font-bold">R$ {(totalFuel / 1000).toFixed(0)}k</p>
                <p className="text-xs text-muted-foreground">~51% do total</p>
              </div>
              <Fuel className="h-8 w-8 text-amber-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Economia IA</p>
                <p className="text-2xl font-bold text-green-600">R$ 125k</p>
                <p className="text-xs text-muted-foreground">Oportunidades identificadas</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Route Cost Details */}
      <div className="space-y-4">
        {filteredCosts.map(cost => (
          <Card key={cost.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-5 w-5" />
                    {cost.route}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Ship className="h-4 w-4" />
                    {cost.vessel}
                    <span className="text-xs">•</span>
                    <Calendar className="h-4 w-4" />
                    {cost.period}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">R$ {(cost.totalCost / 1000).toFixed(0)}k</p>
                  <p className={`text-sm flex items-center gap-1 justify-end ${getCostColor(cost.variance)}`}>
                    {cost.variance > 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {cost.variance > 0 ? '+' : ''}{cost.variance}% vs orçado
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cost Breakdown */}
              <div className="grid grid-cols-5 gap-3">
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <Fuel className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                  <p className="text-xs text-muted-foreground">Combustível</p>
                  <p className="font-bold">R$ {(cost.breakdown.fuel / 1000).toFixed(0)}k</p>
                  <p className="text-xs text-muted-foreground">{((cost.breakdown.fuel / cost.totalCost) * 100).toFixed(0)}%</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <Users className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                  <p className="text-xs text-muted-foreground">Tripulação</p>
                  <p className="font-bold">R$ {(cost.breakdown.crew / 1000).toFixed(0)}k</p>
                  <p className="text-xs text-muted-foreground">{((cost.breakdown.crew / cost.totalCost) * 100).toFixed(0)}%</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <Wrench className="h-4 w-4 mx-auto mb-1 text-purple-500" />
                  <p className="text-xs text-muted-foreground">Manutenção</p>
                  <p className="font-bold">R$ {(cost.breakdown.maintenance / 1000).toFixed(0)}k</p>
                  <p className="text-xs text-muted-foreground">{((cost.breakdown.maintenance / cost.totalCost) * 100).toFixed(0)}%</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <Ship className="h-4 w-4 mx-auto mb-1 text-green-500" />
                  <p className="text-xs text-muted-foreground">Portuário</p>
                  <p className="font-bold">R$ {(cost.breakdown.port / 1000).toFixed(0)}k</p>
                  <p className="text-xs text-muted-foreground">{((cost.breakdown.port / cost.totalCost) * 100).toFixed(0)}%</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <BarChart3 className="h-4 w-4 mx-auto mb-1 text-gray-500" />
                  <p className="text-xs text-muted-foreground">Outros</p>
                  <p className="font-bold">R$ {(cost.breakdown.other / 1000).toFixed(0)}k</p>
                  <p className="text-xs text-muted-foreground">{((cost.breakdown.other / cost.totalCost) * 100).toFixed(0)}%</p>
                </div>
              </div>

              {/* Efficiency */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Eficiência Operacional</span>
                  <span className="font-medium">{cost.efficiency}%</span>
                </div>
                <Progress value={cost.efficiency} className={`h-2 [&>div]:${getEfficiencyColor(cost.efficiency)}`} />
              </div>

              {/* AI Insights */}
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Insights da IA</span>
                </div>
                <ul className="space-y-1">
                  {cost.aiInsights.map((insight, idx) => (
                    <li key={idx} className={`text-sm flex items-start gap-2 ${insight.startsWith('⚠️') ? 'text-amber-600' : 'text-muted-foreground'}`}>
                      {insight.startsWith('⚠️') ? (
                        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      )}
                      {insight.replace('⚠️ ', '')}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Ver Detalhes
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
