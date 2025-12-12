/**
import { useState, useMemo, useCallback } from "react";;
 * PATCH: Reabastecimento Logístico Inteligente
 * Sistema de gestão de suprimentos com IA preditiva
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  Brain, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Truck,
  ShoppingCart,
  BarChart3,
  Fuel,
  Droplets,
  Utensils,
  Wrench,
  Pill,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

interface SupplyItem {
  id: string;
  name: string;
  category: "fuel" | "water" | "food" | "parts" | "medical" | "safety";
  currentStock: number;
  maxCapacity: number;
  unit: string;
  consumptionRate: number;
  daysUntilEmpty: number;
  reorderPoint: number;
  lastRestock: Date;
  predictedNeed: Date;
  status: "ok" | "low" | "critical" | "ordered";
}

interface AIRecommendation {
  id: string;
  type: "reorder" | "optimization" | "alert" | "savings";
  title: string;
  description: string;
  impact: string;
  confidence: number;
  action?: string;
}

const mockSupplies: SupplyItem[] = [
  {
    id: "1",
    name: "Diesel Marítimo",
    category: "fuel",
    currentStock: 45000,
    maxCapacity: 100000,
    unit: "litros",
    consumptionRate: 2500,
    daysUntilEmpty: 18,
    reorderPoint: 30000,
    lastRestock: new Date(Date.now() - 604800000),
    predictedNeed: new Date(Date.now() + 1296000000),
    status: "ok"
  },
  {
    id: "2",
    name: "Água Potável",
    category: "water",
    currentStock: 8000,
    maxCapacity: 25000,
    unit: "litros",
    consumptionRate: 500,
    daysUntilEmpty: 16,
    reorderPoint: 10000,
    lastRestock: new Date(Date.now() - 432000000),
    predictedNeed: new Date(Date.now() + 1036800000),
    status: "low"
  },
  {
    id: "3",
    name: "Alimentos Secos",
    category: "food",
    currentStock: 120,
    maxCapacity: 500,
    unit: "kg",
    consumptionRate: 8,
    daysUntilEmpty: 15,
    reorderPoint: 150,
    lastRestock: new Date(Date.now() - 864000000),
    predictedNeed: new Date(Date.now() + 950400000),
    status: "low"
  },
  {
    id: "4",
    name: "Peças Motor Principal",
    category: "parts",
    currentStock: 45,
    maxCapacity: 100,
    unit: "unidades",
    consumptionRate: 0.5,
    daysUntilEmpty: 90,
    reorderPoint: 20,
    lastRestock: new Date(Date.now() - 2592000000),
    predictedNeed: new Date(Date.now() + 7776000000),
    status: "ok"
  },
  {
    id: "5",
    name: "Kit Primeiros Socorros",
    category: "medical",
    currentStock: 3,
    maxCapacity: 10,
    unit: "kits",
    consumptionRate: 0.1,
    daysUntilEmpty: 30,
    reorderPoint: 5,
    lastRestock: new Date(Date.now() - 1728000000),
    predictedNeed: new Date(Date.now() + 2592000000),
    status: "critical"
  },
];

const mockRecommendations: AIRecommendation[] = [
  {
    id: "1",
    type: "reorder",
    title: "Reabastecer Água Potável",
    description: "Estoque abaixo do ponto de reabastecimento. Consumo atual indica necessidade em 16 dias.",
    impact: "Evita risco de desabastecimento",
    confidence: 95,
    action: "Gerar Pedido"
  },
  {
    id: "2",
    type: "optimization",
    title: "Otimizar Rota para Economia de Combustível",
    description: "Rota alternativa pode reduzir consumo de diesel em 8% baseado em condições climáticas.",
    impact: "Economia de ~3.600 litros",
    confidence: 87
  },
  {
    id: "3",
    type: "alert",
    title: "Kit Médico em Nível Crítico",
    description: "Estoque de kits de primeiros socorros abaixo do mínimo regulatório.",
    impact: "Conformidade SOLAS",
    confidence: 100,
    action: "Pedido Urgente"
  },
  {
    id: "4",
    type: "savings",
    title: "Oportunidade de Compra Consolidada",
    description: "Próxima escala em Santos permite consolidar pedidos com 12% de economia.",
    impact: "Economia estimada: R$ 15.000",
    confidence: 82
  },
];

export default function SmartLogistics() {
  const [supplies, setSupplies] = useState<SupplyItem[]>(mockSupplies);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(mockRecommendations);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const runAIAnalysis = () => {
    setIsAnalyzing(true);
    toast.info("IA analisando padrões de consumo...");
    
    setTimeout(() => {
      const newRec: AIRecommendation = {
        id: Date.now().toString(),
        type: "optimization",
        title: "Nova oportunidade identificada",
        description: `Análise de ${supplies.length} itens revelou padrão de consumo otimizável.`,
        impact: "Redução de 5% no custo total",
        confidence: Math.floor(Math.random() * 15) + 80
      };
      
      setRecommendations(prev => [newRec, ...prev]);
      setIsAnalyzing(false);
      toast.success("Análise concluída!");
    }, 2000);
  });

  const generateOrder = (itemId: string) => {
    const item = supplies.find(s => s.id === itemId);
    if (!item) return;
    
    setSupplies(prev => prev.map(s => 
      s.id === itemId ? { ...s, status: "ordered" as const } : s
    ));
    toast.success(`Pedido gerado para ${item.name}`);
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
    case "fuel": return <Fuel className="h-5 w-5" />;
    case "water": return <Droplets className="h-5 w-5" />;
    case "food": return <Utensils className="h-5 w-5" />;
    case "parts": return <Wrench className="h-5 w-5" />;
    case "medical": return <Pill className="h-5 w-5" />;
    default: return <Package className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "ok": return "bg-green-500/20 text-green-400";
    case "low": return "bg-yellow-500/20 text-yellow-400";
    case "critical": return "bg-red-500/20 text-red-400";
    case "ordered": return "bg-blue-500/20 text-blue-400";
    default: return "bg-muted text-muted-foreground";
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
    case "reorder": return <ShoppingCart className="h-5 w-5 text-blue-400" />;
    case "optimization": return <TrendingUp className="h-5 w-5 text-green-400" />;
    case "alert": return <AlertTriangle className="h-5 w-5 text-red-400" />;
    case "savings": return <Sparkles className="h-5 w-5 text-yellow-400" />;
    default: return <Brain className="h-5 w-5 text-primary" />;
    }
  };

  const stockPercentage = (item: SupplyItem) => (item.currentStock / item.maxCapacity) * 100;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            Logística Inteligente
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestão de suprimentos com IA preditiva
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={runAIAnalysis} disabled={isAnalyzing}>
            <Brain className={`h-4 w-4 mr-2 ${isAnalyzing ? "animate-pulse" : ""}`} />
            {isAnalyzing ? "Analisando..." : "Análise IA"}
          </Button>
          <Button>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Novo Pedido
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{supplies.filter(s => s.status === "ok").length}</p>
                <p className="text-xs text-muted-foreground">Estoque OK</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{supplies.filter(s => s.status === "low").length}</p>
                <p className="text-xs text-muted-foreground">Estoque Baixo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{supplies.filter(s => s.status === "critical").length}</p>
                <p className="text-xs text-muted-foreground">Crítico</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Truck className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{supplies.filter(s => s.status === "ordered").length}</p>
                <p className="text-xs text-muted-foreground">Em Pedido</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Supplies List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Inventário de Suprimentos</CardTitle>
              <CardDescription>Monitoramento em tempo real</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {supplies.map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-4 rounded-lg border ${
                        item.status === "critical" ? "border-red-500/50 bg-red-500/5" :
                          item.status === "low" ? "border-yellow-500/50 bg-yellow-500/5" :
                            "border-border bg-muted/30"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            item.status === "critical" ? "bg-red-500/10" :
                              item.status === "low" ? "bg-yellow-500/10" :
                                "bg-primary/10"
                          }`}>
                            {getCategoryIcon(item.category)}
                          </div>
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {item.currentStock.toLocaleString()} / {item.maxCapacity.toLocaleString()} {item.unit}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status === "ok" ? "OK" :
                            item.status === "low" ? "Baixo" :
                              item.status === "critical" ? "Crítico" : "Pedido"}
                        </Badge>
                      </div>

                      <Progress 
                        value={stockPercentage(item)} 
                        className={`h-2 ${
                          stockPercentage(item) < 20 ? "[&>div]:bg-red-500" :
                            stockPercentage(item) < 40 ? "[&>div]:bg-yellow-500" :
                              "[&>div]:bg-green-500"
                        }`}
                      />

                      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.daysUntilEmpty} dias restantes
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {item.consumptionRate} {item.unit}/dia
                          </span>
                        </div>
                        {(item.status === "low" || item.status === "critical") && (
                          <Button 
                            size="sm" 
                            variant={item.status === "critical" ? "destructive" : "outline"}
                            onClick={() => handlegenerateOrder}
                          >
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            Reabastecer
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* AI Recommendations */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Recomendações IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <div 
                      key={rec.id} 
                      className="p-4 rounded-lg border border-border/50 bg-muted/30"
                    >
                      <div className="flex items-start gap-3">
                        {getRecommendationIcon(rec.type)}
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{rec.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {rec.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {rec.confidence}% confiança
                            </Badge>
                            <span className="text-xs text-green-400">{rec.impact}</span>
                          </div>
                          {rec.action && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="mt-3 w-full"
                              onClick={() => toast.success(`Ação executada: ${rec.action}`)}
                            >
                              {rec.action}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
