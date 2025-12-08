/**
 * ANÁLISE DE DISPONIBILIDADE DE RECURSOS
 * Dashboard unificado com IA preditiva de gargalos
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, Users, Fuel, Wrench, AlertTriangle, 
  TrendingUp, TrendingDown, Brain, Sparkles,
  Ship, Calendar, Clock, CheckCircle, XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNautilusEnhancementAI } from "@/hooks/useNautilusEnhancementAI";

interface Resource {
  id: string;
  name: string;
  category: "inventory" | "crew" | "fuel" | "equipment";
  currentLevel: number;
  optimalLevel: number;
  minLevel: number;
  unit: string;
  vessel?: string;
  lastUpdated: Date;
  prediction: {
    daysUntilLow: number;
    trend: "up" | "down" | "stable";
  };
}

interface AIGarrafalo {
  id: string;
  resource: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  recommendation: string;
  eta: Date;
}

const mockResources: Resource[] = [
  {
    id: "1",
    name: "Óleo Diesel MGO",
    category: "fuel",
    currentLevel: 75,
    optimalLevel: 90,
    minLevel: 20,
    unit: "m³",
    vessel: "MV Atlântico Sul",
    lastUpdated: new Date(),
    prediction: { daysUntilLow: 12, trend: "down" }
  },
  {
    id: "2",
    name: "Tripulação Qualificada",
    category: "crew",
    currentLevel: 45,
    optimalLevel: 50,
    minLevel: 35,
    unit: "pessoas",
    lastUpdated: new Date(),
    prediction: { daysUntilLow: 30, trend: "stable" }
  },
  {
    id: "3",
    name: "Peças de Reposição",
    category: "inventory",
    currentLevel: 28,
    optimalLevel: 80,
    minLevel: 25,
    unit: "unidades",
    vessel: "Base Santos",
    lastUpdated: new Date(Date.now() - 3600000),
    prediction: { daysUntilLow: 5, trend: "down" }
  },
  {
    id: "4",
    name: "Equipamentos de Segurança",
    category: "equipment",
    currentLevel: 92,
    optimalLevel: 95,
    minLevel: 80,
    unit: "sets",
    lastUpdated: new Date(),
    prediction: { daysUntilLow: 45, trend: "up" }
  },
  {
    id: "5",
    name: "Água Potável",
    category: "inventory",
    currentLevel: 60,
    optimalLevel: 100,
    minLevel: 30,
    unit: "m³",
    vessel: "PSV Oceano Azul",
    lastUpdated: new Date(),
    prediction: { daysUntilLow: 8, trend: "down" }
  }
];

const mockGargalos: AIGarrafalo[] = [
  {
    id: "1",
    resource: "Peças de Reposição",
    severity: "high",
    description: "Estoque crítico de filtros de óleo detectado",
    recommendation: "Solicitar reposição urgente via Porto de Santos",
    eta: new Date(Date.now() + 5 * 24 * 3600000)
  },
  {
    id: "2",
    resource: "Tripulação Qualificada",
    severity: "medium",
    description: "Déficit previsto de Oficiais de Máquinas em 15 dias",
    recommendation: "Antecipar processo de recrutamento ou realocação interna",
    eta: new Date(Date.now() + 15 * 24 * 3600000)
  }
];

export default function ResourceAvailability() {
  const { toast } = useToast();
  const { checkResourceAvailability, isLoading } = useNautilusEnhancementAI();
  const [resources, setResources] = useState<Resource[]>(mockResources);
  const [gargalos, setGargalos] = useState<AIGarrafalo[]>(mockGargalos);

  const handleAIPrediction = async () => {
    const result = await checkResourceAvailability(
      resources.map(r => ({ name: r.name, level: r.currentLevel, min: r.minLevel })),
      "30 dias"
    );
    
    if (result?.response) {
      toast({ 
        title: "Análise Preditiva Concluída", 
        description: "IA identificou potenciais gargalos futuros" 
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "inventory": return <Package className="h-4 w-4" />;
      case "crew": return <Users className="h-4 w-4" />;
      case "fuel": return <Fuel className="h-4 w-4" />;
      case "equipment": return <Wrench className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "inventory": return "Estoque";
      case "crew": return "Tripulação";
      case "fuel": return "Combustível";
      case "equipment": return "Equipamentos";
      default: return category;
    }
  };

  const getLevelColor = (current: number, min: number, optimal: number) => {
    const percentage = ((current - min) / (optimal - min)) * 100;
    if (percentage <= 20) return "bg-red-500";
    if (percentage <= 50) return "bg-amber-500";
    return "bg-green-500";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "border-red-500 bg-red-500/10";
      case "high": return "border-orange-500 bg-orange-500/10";
      case "medium": return "border-amber-500 bg-amber-500/10";
      default: return "border-blue-500 bg-blue-500/10";
    }
  };

  const criticalResources = resources.filter(r => r.currentLevel <= r.minLevel * 1.2).length;
  const lowResources = resources.filter(r => r.prediction.daysUntilLow <= 7).length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <Package className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Disponibilidade de Recursos
              <Badge variant="secondary">
                <Brain className="h-3 w-3 mr-1" />
                AI-Predicted
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              Dashboard unificado com previsão de gargalos
            </p>
          </div>
        </div>
        <Button onClick={handleAIPrediction} disabled={isLoading}>
          <Sparkles className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Análise Preditiva
        </Button>
      </div>

      {/* Alert Banner */}
      {gargalos.filter(g => g.severity === "high" || g.severity === "critical").length > 0 && (
        <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              <div>
                <p className="font-medium text-orange-700 dark:text-orange-400">
                  {gargalos.filter(g => g.severity === "high" || g.severity === "critical").length} gargalos identificados pela IA
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-500">
                  Ação preventiva recomendada para evitar interrupções operacionais
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recursos Monitorados</p>
                <p className="text-2xl font-bold">{resources.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className={criticalResources > 0 ? "border-red-500/50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Níveis Críticos</p>
                <p className={`text-2xl font-bold ${criticalResources > 0 ? 'text-red-600' : ''}`}>
                  {criticalResources}
                </p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${criticalResources > 0 ? 'text-red-500' : 'text-muted-foreground'} opacity-80`} />
            </div>
          </CardContent>
        </Card>
        <Card className={lowResources > 0 ? "border-amber-500/50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Baixo em 7 dias</p>
                <p className={`text-2xl font-bold ${lowResources > 0 ? 'text-amber-600' : ''}`}>
                  {lowResources}
                </p>
              </div>
              <Clock className="h-8 w-8 text-amber-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gargalos IA</p>
                <p className="text-2xl font-bold">{gargalos.length}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="resources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resources">Recursos</TabsTrigger>
          <TabsTrigger value="gargalos">Gargalos IA</TabsTrigger>
          <TabsTrigger value="forecast">Previsões</TabsTrigger>
        </TabsList>

        <TabsContent value="resources">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {resources.map(resource => (
              <Card key={resource.id} className={resource.currentLevel <= resource.minLevel * 1.2 ? "border-red-500/50" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        {getCategoryIcon(resource.category)}
                      </div>
                      <div>
                        <CardTitle className="text-base">{resource.name}</CardTitle>
                        <CardDescription>{resource.vessel || "Geral"}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">{getCategoryLabel(resource.category)}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Nível Atual</span>
                    <span className="font-medium">{resource.currentLevel} {resource.unit}</span>
                  </div>
                  <Progress 
                    value={(resource.currentLevel / resource.optimalLevel) * 100} 
                    className={`h-2 [&>div]:${getLevelColor(resource.currentLevel, resource.minLevel, resource.optimalLevel)}`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Mín: {resource.minLevel}</span>
                    <span>Ótimo: {resource.optimalLevel}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-1">
                      {resource.prediction.trend === "down" ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : resource.prediction.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                      <span className={`text-sm ${
                        resource.prediction.daysUntilLow <= 7 ? 'text-red-600 font-medium' :
                        resource.prediction.daysUntilLow <= 14 ? 'text-amber-600' : 'text-muted-foreground'
                      }`}>
                        {resource.prediction.daysUntilLow} dias até nível baixo
                      </span>
                    </div>
                    <Button variant="ghost" size="sm">Detalhes</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="gargalos">
          <div className="space-y-4">
            {gargalos.map(gargalo => (
              <Card key={gargalo.id} className={getSeverityColor(gargalo.severity)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-background">
                      <Brain className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{gargalo.resource}</h4>
                        <Badge variant={gargalo.severity === "critical" || gargalo.severity === "high" ? "destructive" : "secondary"}>
                          {gargalo.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{gargalo.description}</p>
                      <div className="p-3 bg-background rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Recomendação IA</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{gargalo.recommendation}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          ETA: {gargalo.eta.toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Ação</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="forecast">
          <Card>
            <CardHeader>
              <CardTitle>Previsões de 30 Dias</CardTitle>
              <CardDescription>Análise preditiva baseada em consumo histórico</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Clique em "Análise Preditiva" para gerar previsões detalhadas</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
