/**
import { useState, useCallback } from "react";;
 * AI Navigation Assistant - Assistente de Navegação
 * Rotas otimizadas e assistência de navegação com IA
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Navigation, 
  MapPin, 
  Anchor,
  Loader2, 
  Sparkles,
  Wind,
  Waves,
  Clock,
  Fuel,
  Route,
  Ship,
  ArrowRight,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

interface RoutePoint {
  name: string;
  lat: number;
  lon: number;
}

interface RouteAnalysis {
  recommendation: string;
  estimatedTime: string;
  distance: string;
  fuelConsumption: string;
  weatherConditions: string;
  risks: string[];
  alternatives: string[];
}

const NavigationAssistant: React.FC = () => {
  const [origin, setOrigin] = useState("Santos, BR");
  const [destination, setDestination] = useState("Rio de Janeiro, BR");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const commonRoutes = [
    { origin: "Santos, BR", destination: "Rio de Janeiro, BR", distance: "210 NM" },
    { origin: "Rio de Janeiro, BR", destination: "Vitória, BR", distance: "280 NM" },
    { origin: "Santos, BR", destination: "Paranaguá, BR", distance: "140 NM" },
    { origin: "Recife, BR", destination: "Salvador, BR", distance: "420 NM" },
  ];

  const analyzeRoute = async () => {
    if (!origin.trim() || !destination.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Informe a origem e o destino da rota.",
        variant: "destructive",
      };
      return;
    }

    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke("optimization-ai-copilot", {
        body: {
          messages: [
            {
              role: "user",
              content: `Analise a rota marítima de ${origin} para ${destination} e forneça:

1. **Rota Recomendada**
   - Waypoints principais
   - Distância total estimada
   - Tempo de navegação (considerando velocidade média de 12 nós)

2. **Condições Meteorológicas**
   - Previsão de vento
   - Condições do mar
   - Recomendações de segurança

3. **Otimização de Combustível**
   - Consumo estimado
   - Velocidade econômica recomendada
   - Pontos de reabastecimento

4. **Riscos e Precauções**
   - Áreas de atenção
   - Tráfego marítimo
   - Regulamentações locais

5. **Rotas Alternativas**
   - Opções em caso de mau tempo
   - Desvios recomendados

Formate a resposta em markdown estruturado com informações práticas para navegadores.`,
            },
          ],
          type: "navigation_analysis",
          context: "Assistente de navegação marítima para planejamento de rotas",
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      setAnalysis(data?.response || "Análise não disponível");

      toast({
        title: "Rota analisada!",
        description: "Recomendações de navegação geradas com sucesso.",
      };
    } catch (error) {
      console.error("Error analyzing route:", error);
      toast({
        title: "Erro na análise",
        description: "Não foi possível analisar a rota. Tente novamente.",
        variant: "destructive",
      };
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectRoute = (route: typeof commonRoutes[0]) => {
    setOrigin(route.origin);
    setDestination(route.destination);
  };

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Navigation className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Assistente de Navegação</h1>
            <p className="text-muted-foreground">
              Planejamento de rotas otimizadas com inteligência artificial
            </p>
          </div>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          AI Navigation
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5" />
              Planejamento de Rota
            </CardTitle>
            <CardDescription>
              Defina origem e destino para análise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="origin" className="flex items-center gap-2">
                <Anchor className="h-4 w-4 text-green-500" />
                Porto de Origem
              </Label>
              <Input
                id="origin"
                value={origin}
                onChange={handleChange}
                placeholder="Ex: Santos, BR"
              />
            </div>

            <div className="flex justify-center">
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-500" />
                Porto de Destino
              </Label>
              <Input
                id="destination"
                value={destination}
                onChange={handleChange}
                placeholder="Ex: Rio de Janeiro, BR"
              />
            </div>

            <Button 
              onClick={analyzeRoute} 
              disabled={isAnalyzing} 
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analisando Rota...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4 mr-2" />
                  Analisar Rota
                </>
              )}
            </Button>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium">Rotas Frequentes:</p>
              <div className="space-y-2">
                {commonRoutes.map((route, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="w-full justify-between text-xs"
                    onClick={() => handleselectRoute}
                  >
                    <span>{route.origin} → {route.destination}</span>
                    <Badge variant="secondary">{route.distance}</Badge>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Análise de Navegação
            </CardTitle>
            <CardDescription>
              Recomendações e otimizações para sua rota
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!analysis ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <Ship className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  Selecione uma rota para receber recomendações de navegação
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{analysis}</ReactMarkdown>
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Wind className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="font-medium text-sm">Vento</p>
              <p className="text-xs text-muted-foreground">15 nós NE</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10">
              <Waves className="h-5 w-5 text-cyan-500" />
            </div>
            <div>
              <p className="font-medium text-sm">Ondas</p>
              <p className="text-xs text-muted-foreground">1.5m - Moderado</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Clock className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="font-medium text-sm">Maré</p>
              <p className="text-xs text-muted-foreground">Enchente 14:30</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="font-medium text-sm">Alertas</p>
              <p className="text-xs text-muted-foreground">Nenhum ativo</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NavigationAssistant;
