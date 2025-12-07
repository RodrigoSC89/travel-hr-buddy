import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Map, Navigation, Anchor, Fuel, Users, Clock, DollarSign, 
  Cloud, Wind, Waves, Ship, Brain, Sparkles, Calendar,
  AlertTriangle, CheckCircle2, Plus, RefreshCw, Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VoyagePlan {
  id: string;
  origin: string;
  destination: string;
  vessel: string;
  departure: string;
  eta: string;
  distance: number;
  fuelEstimate: number;
  crewRequired: number;
  estimatedCost: number;
  status: "planning" | "optimizing" | "approved" | "active";
  weatherRisk: "low" | "medium" | "high";
  aiRecommendations: string[];
}

const sampleVoyages: VoyagePlan[] = [
  {
    id: "1",
    origin: "Santos, BR",
    destination: "Rotterdam, NL",
    vessel: "MV Atlântico Sul",
    departure: "2024-02-15T08:00",
    eta: "2024-03-02T14:00",
    distance: 5420,
    fuelEstimate: 850,
    crewRequired: 24,
    estimatedCost: 485000,
    status: "approved",
    weatherRisk: "medium",
    aiRecommendations: [
      "Desvio de 120nm recomendado para evitar tempestade atlântica",
      "Economia de 8% de combustível com velocidade otimizada de 12.5 nós",
      "Escala técnica sugerida em Las Palmas para reabastecimento"
    ]
  },
  {
    id: "2",
    origin: "Rio de Janeiro, BR",
    destination: "Macaé, BR",
    vessel: "PSV Oceano Azul",
    departure: "2024-02-10T06:00",
    eta: "2024-02-10T18:00",
    distance: 180,
    fuelEstimate: 45,
    crewRequired: 12,
    estimatedCost: 28000,
    status: "active",
    weatherRisk: "low",
    aiRecommendations: [
      "Condições meteorológicas favoráveis nas próximas 24h",
      "Janela de operação ideal para transferência de carga"
    ]
  }
];

export default function VoyagePlanner() {
  const { toast } = useToast();
  const [voyages, setVoyages] = useState<VoyagePlan[]>(sampleVoyages);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [newVoyage, setNewVoyage] = useState({
    origin: "",
    destination: "",
    vessel: "",
    departure: ""
  });

  const handleOptimizeRoute = async (voyageId: string) => {
    setIsOptimizing(true);
    toast({ title: "Otimizando rota...", description: "IA analisando condições meteorológicas e consumo" });
    
    try {
      // Simulate AI optimization
      await new Promise(r => setTimeout(r, 2000));
      
      setVoyages(prev => prev.map(v => 
        v.id === voyageId 
          ? { 
              ...v, 
              status: "approved" as const,
              fuelEstimate: Math.round(v.fuelEstimate * 0.92),
              aiRecommendations: [
                ...v.aiRecommendations,
                "Rota otimizada com economia de 8% em combustível"
              ]
            }
          : v
      ));
      
      toast({ title: "Rota otimizada!", description: "Economia estimada de 8% em combustível" });
    } catch (error) {
      toast({ title: "Erro", description: "Falha na otimização", variant: "destructive" });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleCreateVoyage = async () => {
    if (!newVoyage.origin || !newVoyage.destination) {
      toast({ title: "Erro", description: "Preencha origem e destino", variant: "destructive" });
      return;
    }

    const voyage: VoyagePlan = {
      id: Date.now().toString(),
      ...newVoyage,
      vessel: newVoyage.vessel || "A definir",
      departure: newVoyage.departure || new Date().toISOString(),
      eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      distance: Math.floor(Math.random() * 3000) + 500,
      fuelEstimate: Math.floor(Math.random() * 500) + 100,
      crewRequired: Math.floor(Math.random() * 20) + 10,
      estimatedCost: Math.floor(Math.random() * 300000) + 50000,
      status: "planning",
      weatherRisk: "medium",
      aiRecommendations: ["Aguardando análise de IA para otimização de rota"]
    };

    setVoyages(prev => [voyage, ...prev]);
    setNewVoyage({ origin: "", destination: "", vessel: "", departure: "" });
    toast({ title: "Viagem criada", description: "Planejamento iniciado com sucesso" });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planning: "bg-blue-500/10 text-blue-600",
      optimizing: "bg-amber-500/10 text-amber-600",
      approved: "bg-green-500/10 text-green-600",
      active: "bg-purple-500/10 text-purple-600"
    };
    return colors[status] || colors.planning;
  };

  const getWeatherColor = (risk: string) => {
    const colors: Record<string, string> = {
      low: "text-green-500",
      medium: "text-amber-500",
      high: "text-red-500"
    };
    return colors[risk] || colors.medium;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
            <Map className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Planejamento de Viagens
              <Badge variant="secondary">
                <Brain className="h-3 w-3 mr-1" />
                AI-Assisted
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              Otimização inteligente de rotas, carga e combustível
            </p>
          </div>
        </div>
        <Button onClick={() => toast({ title: "Exportando...", description: "Gerando relatório de viagens" })}>
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Viagens Ativas</p>
                <p className="text-2xl font-bold">{voyages.filter(v => v.status === "active").length}</p>
              </div>
              <Ship className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Milhas Navegadas</p>
                <p className="text-2xl font-bold">12,450</p>
              </div>
              <Navigation className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Combustível Economizado</p>
                <p className="text-2xl font-bold">245t</p>
              </div>
              <Fuel className="h-8 w-8 text-amber-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Economia Total</p>
                <p className="text-2xl font-bold">R$ 1.2M</p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="voyages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="voyages">Viagens</TabsTrigger>
          <TabsTrigger value="new">Nova Viagem</TabsTrigger>
          <TabsTrigger value="weather">Meteorologia</TabsTrigger>
        </TabsList>

        <TabsContent value="voyages" className="space-y-4">
          {voyages.map(voyage => (
            <Card key={voyage.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Anchor className="h-5 w-5" />
                      {voyage.origin} → {voyage.destination}
                    </CardTitle>
                    <CardDescription>{voyage.vessel}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(voyage.status)}>
                    {voyage.status === "planning" && "Planejando"}
                    {voyage.status === "optimizing" && "Otimizando"}
                    {voyage.status === "approved" && "Aprovado"}
                    {voyage.status === "active" && "Em Andamento"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Distância</p>
                      <p className="font-medium">{voyage.distance} nm</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Fuel className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Combustível Est.</p>
                      <p className="font-medium">{voyage.fuelEstimate}t</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Tripulação</p>
                      <p className="font-medium">{voyage.crewRequired}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Custo Est.</p>
                      <p className="font-medium">R$ {(voyage.estimatedCost / 1000).toFixed(0)}k</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cloud className={`h-4 w-4 ${getWeatherColor(voyage.weatherRisk)}`} />
                    <div>
                      <p className="text-xs text-muted-foreground">Risco Meteo</p>
                      <p className={`font-medium ${getWeatherColor(voyage.weatherRisk)}`}>
                        {voyage.weatherRisk === "low" && "Baixo"}
                        {voyage.weatherRisk === "medium" && "Médio"}
                        {voyage.weatherRisk === "high" && "Alto"}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Recomendações da IA</span>
                  </div>
                  <ul className="space-y-1">
                    {voyage.aiRecommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleOptimizeRoute(voyage.id)}
                    disabled={isOptimizing || voyage.status === "active"}
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    {isOptimizing ? "Otimizando..." : "Otimizar com IA"}
                  </Button>
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Ver Cronograma
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>Nova Viagem</CardTitle>
              <CardDescription>Planeje uma nova viagem com assistência de IA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Origem</label>
                  <Input 
                    placeholder="Ex: Santos, BR"
                    value={newVoyage.origin}
                    onChange={e => setNewVoyage(p => ({ ...p, origin: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Destino</label>
                  <Input 
                    placeholder="Ex: Rotterdam, NL"
                    value={newVoyage.destination}
                    onChange={e => setNewVoyage(p => ({ ...p, destination: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Embarcação</label>
                  <Select onValueChange={v => setNewVoyage(p => ({ ...p, vessel: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecionar embarcação" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MV Atlântico Sul">MV Atlântico Sul</SelectItem>
                      <SelectItem value="PSV Oceano Azul">PSV Oceano Azul</SelectItem>
                      <SelectItem value="AHTS Maré Alta">AHTS Maré Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data de Partida</label>
                  <Input 
                    type="datetime-local"
                    value={newVoyage.departure}
                    onChange={e => setNewVoyage(p => ({ ...p, departure: e.target.value }))}
                  />
                </div>
              </div>
              <Button onClick={handleCreateVoyage} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Criar Planejamento
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weather">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Condições Meteorológicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Atlântico Sul</span>
                  </div>
                  <p className="text-2xl font-bold">15 nós</p>
                  <p className="text-sm text-muted-foreground">NE, ondas 2.5m</p>
                  <Badge className="mt-2 bg-green-500/10 text-green-600">Favorável</Badge>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Waves className="h-5 w-5 text-amber-500" />
                    <span className="font-medium">Bacia de Campos</span>
                  </div>
                  <p className="text-2xl font-bold">22 nós</p>
                  <p className="text-sm text-muted-foreground">SE, ondas 3.2m</p>
                  <Badge className="mt-2 bg-amber-500/10 text-amber-600">Moderado</Badge>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <span className="font-medium">Atlântico Norte</span>
                  </div>
                  <p className="text-2xl font-bold">35 nós</p>
                  <p className="text-sm text-muted-foreground">SW, ondas 5.8m</p>
                  <Badge className="mt-2 bg-red-500/10 text-red-600">Tempestade</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
