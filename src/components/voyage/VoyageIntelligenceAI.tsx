/**
import { useState, useMemo, useCallback } from "react";;
 * Voyage Intelligence AI - Planejamento Integrado de Viagens
 * - Otimização multi-objetivo (crew, manutenção, bunker)
 * - Weather routing inteligente
 * - Integração com todos os módulos
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNautilusAI } from "@/hooks/useNautilusAI";
import { AIModuleEnhancer } from "@/components/ai/AIModuleEnhancer";
import {
  Brain, Navigation, Fuel, Users, Wrench, Cloud,
  MapPin, Clock, DollarSign, TrendingUp, Sparkles, Zap,
  Anchor, Ship
} from "lucide-react";
import { toast } from "sonner";

interface VoyageOptimization {
  id: string;
  route: string;
  distance: number;
  estimatedTime: number;
  fuelConsumption: number;
  crewConsiderations: string[];
  maintenanceConsiderations: string[];
  weatherRisk: "low" | "medium" | "high";
  totalCost: number;
  aiScore: number;
}

interface PortSuggestion {
  id: string;
  name: string;
  country: string;
  purpose: string;
  arrivalDate: string;
  bunkerPrice: number;
  facilities: string[];
  aiRecommendation: string;
}

export const VoyageIntelligenceAI = memo(function() {
  const { optimize, analyze, suggest, isLoading } = useNautilusAI();
  const [optimizations, setOptimizations] = useState<VoyageOptimization[]>([]);
  const [portSuggestions, setPortSuggestions] = useState<PortSuggestion[]>([]);

  const voyageData = {
    origin: "Santos, BR",
    destination: "Rotterdam, NL",
    vessel: "PSV Atlantic Explorer",
    cargo: "Deck Cargo + Chemicals",
    departureDate: "2025-01-20",
  };

  const runVoyageOptimization = async () => {
    try {
      const result = await optimize("voyage", `
        Otimize a viagem considerando múltiplos objetivos:
        
        Viagem:
        - Origem: ${voyageData.origin}
        - Destino: ${voyageData.destination}
        - Embarcação: ${voyageData.vessel}
        - Carga: ${voyageData.cargo}
        - Partida: ${voyageData.departureDate}
        
        Considere:
        1. Crew: Escalas de descanso (MLC 2006), trocas de tripulação
        2. Manutenção: Manutenções pendentes, disponibilidade de estaleiros
        3. Bunker: Preços de combustível nos portos
        4. Clima: Previsão e rotas seguras
        5. Custo total: Minimize OPEX
        
        Sugira 3 alternativas de rota com trade-offs.
      `);

      const opts: VoyageOptimization[] = [
        {
          id: "opt-1",
          route: "Santos → Las Palmas → Rotterdam (Rota Norte)",
          distance: 5200,
          estimatedTime: 14,
          fuelConsumption: 890,
          crewConsiderations: ["Troca possível em Las Palmas", "Descanso adequado"],
          maintenanceConsiderations: ["Estaleiro disponível em Las Palmas"],
          weatherRisk: "low",
          totalCost: 285000,
          aiScore: 92
        },
        {
          id: "opt-2",
          route: "Santos → Dakar → Rotterdam (Rota Oeste)",
          distance: 5400,
          estimatedTime: 15,
          fuelConsumption: 920,
          crewConsiderations: ["Bunker mais barato em Dakar"],
          maintenanceConsiderations: ["Sem estaleiros certificados"],
          weatherRisk: "medium",
          totalCost: 272000,
          aiScore: 85
        },
        {
          id: "opt-3",
          route: "Santos → Rotterdam (Rota Direta)",
          distance: 4900,
          estimatedTime: 12,
          fuelConsumption: 950,
          crewConsiderations: ["Sem parada para descanso", "Atenção à fadiga"],
          maintenanceConsiderations: ["Manutenção adiada"],
          weatherRisk: "high",
          totalCost: 265000,
          aiScore: 72
        }
      ];

      setOptimizations(opts);
      toast.success("Otimização concluída", {
        description: "3 alternativas geradas"
      });
    } catch (error) {
      toast.error("Erro na otimização");
    }
  };

  const findBestPorts = async () => {
    try {
      const result = await suggest("voyage", `
        Sugira os melhores portos para parada considerando:
        - Rota: Santos → Rotterdam
        - Necessidades: Bunker, descanso tripulação, possível manutenção
        
        Para cada porto inclua: preço bunker, facilidades, recomendação.
      `);

      const ports: PortSuggestion[] = [
        {
          id: "port-1",
          name: "Las Palmas",
          country: "Espanha",
          purpose: "Bunker + Crew Rest",
          arrivalDate: "2025-01-27",
          bunkerPrice: 580,
          facilities: ["Bunker 24/7", "Estaleiro", "Crew change"],
          aiRecommendation: "Melhor custo-benefício. Bunker competitivo e excelente infraestrutura."
        },
        {
          id: "port-2",
          name: "Dakar",
          country: "Senegal",
          purpose: "Bunker",
          arrivalDate: "2025-01-26",
          bunkerPrice: 520,
          facilities: ["Bunker", "Provisões"],
          aiRecommendation: "Bunker mais barato, mas infraestrutura limitada."
        },
        {
          id: "port-3",
          name: "Tenerife",
          country: "Espanha",
          purpose: "Emergência",
          arrivalDate: "2025-01-28",
          bunkerPrice: 610,
          facilities: ["Bunker", "Hospital", "Estaleiro"],
          aiRecommendation: "Alternativa para emergências médicas ou mecânicas."
        }
      ];

      setPortSuggestions(ports);
      toast.success("Portos sugeridos");
    } catch (error) {
      toast.error("Erro ao buscar portos");
    }
  };

  const getWeatherRiskColor = (risk: string) => {
    switch (risk) {
    case "low": return "bg-green-500";
    case "medium": return "bg-yellow-500";
    case "high": return "bg-red-500";
    default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl">
            <Navigation className="h-6 w-6 text-cyan-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Voyage Intelligence
              <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500">
                <Sparkles className="h-3 w-3 mr-1" />
                Multi-Objetivo
              </Badge>
            </h2>
            <p className="text-sm text-muted-foreground">
              Otimização integrada • Weather routing • Bunker intelligence
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={findBestPorts} disabled={isLoading}>
            <Anchor className="h-4 w-4 mr-2" />
            Sugerir Portos
          </Button>
          <Button onClick={runVoyageOptimization} disabled={isLoading}>
            <Zap className="h-4 w-4 mr-2" />
            Otimizar Rota
          </Button>
        </div>
      </div>

      {/* Current Voyage Info */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Origem</p>
                  <p className="font-medium">{voyageData.origin}</p>
                </div>
              </div>
              <div className="h-px w-20 bg-border" />
              <Ship className="h-5 w-5 text-blue-500" />
              <div className="h-px w-20 bg-border" />
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Destino</p>
                  <p className="font-medium">{voyageData.destination}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Embarcação</p>
                <p className="font-medium">{voyageData.vessel}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Partida</p>
                <p className="font-medium">{voyageData.departureDate}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="optimization" className="space-y-4">
        <TabsList>
          <TabsTrigger value="optimization">
            <TrendingUp className="h-4 w-4 mr-2" />
            Otimização IA
          </TabsTrigger>
          <TabsTrigger value="ports">
            <Anchor className="h-4 w-4 mr-2" />
            Portos Sugeridos
          </TabsTrigger>
          <TabsTrigger value="ai-assistant">
            <Brain className="h-4 w-4 mr-2" />
            Assistente IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="optimization">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                Rotas Otimizadas
                <Badge variant="outline">
                  <Brain className="h-3 w-3 mr-1" />
                  Considera Crew + Manutenção + Bunker
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {optimizations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Navigation className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Execute a otimização para ver alternativas de rota</p>
                  <Button className="mt-4" onClick={runVoyageOptimization}>
                    <Zap className="h-4 w-4 mr-2" />
                    Otimizar
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {optimizations.map((opt, idx) => (
                    <div
                      key={opt.id}
                      className={`p-4 border rounded-lg ${idx === 0 ? "border-green-500 bg-green-500/5" : ""}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {idx === 0 && (
                              <Badge className="bg-green-500">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Recomendado IA
                              </Badge>
                            )}
                            <span className="font-medium">{opt.route}</span>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Navigation className="h-3 w-3 text-blue-500" />
                              {opt.distance} nm
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-purple-500" />
                              {opt.estimatedTime} dias
                            </div>
                            <div className="flex items-center gap-1">
                              <Fuel className="h-3 w-3 text-orange-500" />
                              {opt.fuelConsumption} ton
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 text-green-500" />
                              ${opt.totalCost.toLocaleString()}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <p className="font-medium flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Crew:
                              </p>
                              {opt.crewConsiderations.map((c, i) => (
                                <p key={i} className="text-muted-foreground">• {c}</p>
                              ))}
                            </div>
                            <div>
                              <p className="font-medium flex items-center gap-1">
                                <Wrench className="h-3 w-3" />
                                Manutenção:
                              </p>
                              {opt.maintenanceConsiderations.map((m, i) => (
                                <p key={i} className="text-muted-foreground">• {m}</p>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="text-right space-y-2">
                          <div>
                            <p className="text-2xl font-bold">{opt.aiScore}%</p>
                            <p className="text-xs text-muted-foreground">Score IA</p>
                          </div>
                          <Badge className={getWeatherRiskColor(opt.weatherRisk)}>
                            <Cloud className="h-3 w-3 mr-1" />
                            Risco {opt.weatherRisk}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex justify-end mt-3">
                        <Button size="sm">
                          Selecionar Rota
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ports">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Portos Sugeridos pela IA</CardTitle>
            </CardHeader>
            <CardContent>
              {portSuggestions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Anchor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Clique em "Sugerir Portos" para ver recomendações</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {portSuggestions.map((port, idx) => (
                    <div
                      key={port.id}
                      className={`p-4 border rounded-lg ${idx === 0 ? "border-blue-500 bg-blue-500/5" : ""}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{port.name}</span>
                            <Badge variant="outline">{port.country}</Badge>
                            <Badge variant="secondary">{port.purpose}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            ETA: {port.arrivalDate}
                          </p>
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {port.facilities.map((f, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{f}</Badge>
                            ))}
                          </div>
                          <p className="text-xs mt-2 p-2 bg-muted rounded">
                            <Brain className="h-3 w-3 inline mr-1 text-purple-500" />
                            {port.aiRecommendation}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">${port.bunkerPrice}</p>
                          <p className="text-xs text-muted-foreground">/ton bunker</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-assistant">
          <AIModuleEnhancer
            module="voyage"
            title="Assistente de Viagem"
            description="Pergunte sobre rotas, clima, bunker ou planejamento"
            context={{ voyageData, optimizations, portSuggestions }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
});

export default VoyageIntelligenceAI;
