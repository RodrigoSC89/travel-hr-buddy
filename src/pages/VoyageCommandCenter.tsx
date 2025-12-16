/**
 * Voyage Command Center - Módulo Unificado de Planejamento de Viagens
 * PATCH UNIFY-12.0 - Fusão dos módulos de viagem
 * 
 * Módulos fundidos:
 * - voyage-planner (módulo simples) → Voyage Command Center
 * - planning/voyage-planner (módulo completo) → Voyage Command Center
 * 
 * Funcionalidades integradas:
 * - Planejamento de viagens com IA
 * - Copiloto IA para otimização
 * - Meteorologia e análise climática
 * - Analytics de performance
 * - Gestão de rotas e waypoints
 * - Análise de custos
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Map, Navigation, Anchor, Fuel, Users, Clock, DollarSign, 
  Cloud, Wind, Waves, Ship, Brain, Sparkles, Calendar,
  AlertTriangle, CheckCircle2, Plus, RefreshCw, Download,
  Route, Bot, Eye, Trash2, TrendingUp, Target, Compass,
  ThermometerSun, Droplets, Activity, BarChart3, Settings,
  Globe, Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

// Types
interface Port {
  id: string;
  name: string;
  country: string;
  code: string;
  lat: number;
  lng: number;
  type: "origin" | "destination" | "waypoint";
}

interface VoyageRoute {
  id: string;
  name: string;
  origin: Port;
  destination: Port;
  waypoints: Port[];
  distanceNm: number;
  estimatedDays: number;
  fuelConsumption: number;
  status: "planned" | "active" | "completed" | "cancelled";
  vesselName?: string;
  departureDate?: string;
  arrivalDate?: string;
  weatherRisk: "low" | "medium" | "high";
  createdAt: string;
  estimatedCost?: number;
  aiRecommendations?: string[];
}

interface WeatherCondition {
  location: string;
  condition: string;
  windSpeed: number;
  waveHeight: number;
  visibility: string;
  risk: "low" | "medium" | "high";
}

// Demo Data
const DEMO_PORTS: Port[] = [
  { id: "1", name: "Santos", country: "Brasil", code: "BRSSZ", lat: -23.95, lng: -46.3, type: "origin" },
  { id: "2", name: "Rio de Janeiro", country: "Brasil", code: "BRRIO", lat: -22.9, lng: -43.2, type: "origin" },
  { id: "3", name: "Rotterdam", country: "Holanda", code: "NLRTM", lat: 51.9, lng: 4.5, type: "destination" },
  { id: "4", name: "Hamburgo", country: "Alemanha", code: "DEHAM", lat: 53.5, lng: 9.99, type: "destination" },
  { id: "5", name: "Singapura", country: "Singapura", code: "SGSIN", lat: 1.3, lng: 103.8, type: "destination" },
  { id: "6", name: "Houston", country: "EUA", code: "USHOU", lat: 29.8, lng: -95.3, type: "destination" },
  { id: "7", name: "Las Palmas", country: "Espanha", code: "ESLPA", lat: 28.1, lng: -15.4, type: "waypoint" },
];

const DEMO_VOYAGES: VoyageRoute[] = [
  {
    id: "v1",
    name: "Santos → Rotterdam",
    origin: DEMO_PORTS[0],
    destination: DEMO_PORTS[2],
    waypoints: [DEMO_PORTS[6]],
    distanceNm: 5420,
    estimatedDays: 14,
    fuelConsumption: 2850,
    status: "active",
    vesselName: "MV Atlantic Pioneer",
    departureDate: "2025-12-01",
    arrivalDate: "2025-12-15",
    weatherRisk: "low",
    createdAt: "2025-11-28",
    estimatedCost: 485000,
    aiRecommendations: [
      "Desvio de 120nm recomendado para evitar tempestade atlântica",
      "Economia de 8% de combustível com velocidade otimizada de 12.5 nós"
    ]
  },
  {
    id: "v2",
    name: "Rio de Janeiro → Singapura",
    origin: DEMO_PORTS[1],
    destination: DEMO_PORTS[4],
    waypoints: [],
    distanceNm: 8950,
    estimatedDays: 24,
    fuelConsumption: 4720,
    status: "planned",
    vesselName: "MV Pacific Star",
    departureDate: "2025-12-10",
    arrivalDate: "2026-01-03",
    weatherRisk: "medium",
    createdAt: "2025-12-01",
    estimatedCost: 890000,
    aiRecommendations: [
      "Monitorar condições no Oceano Índico",
      "Escala técnica recomendada em Durban"
    ]
  },
  {
    id: "v3",
    name: "Santos → Houston",
    origin: DEMO_PORTS[0],
    destination: DEMO_PORTS[5],
    waypoints: [],
    distanceNm: 4850,
    estimatedDays: 12,
    fuelConsumption: 2550,
    status: "active",
    vesselName: "MV Gulf Carrier",
    departureDate: "2025-12-03",
    arrivalDate: "2025-12-15",
    weatherRisk: "high",
    createdAt: "2025-11-30",
    estimatedCost: 320000,
    aiRecommendations: [
      "Tempestade tropical no Golfo do México - rota alternativa sugerida",
      "Atraso estimado de 18h devido condições climáticas"
    ]
  },
  {
    id: "v4",
    name: "Rio de Janeiro → Hamburgo",
    origin: DEMO_PORTS[1],
    destination: DEMO_PORTS[3],
    waypoints: [DEMO_PORTS[6]],
    distanceNm: 5680,
    estimatedDays: 15,
    fuelConsumption: 2990,
    status: "completed",
    vesselName: "MV Europa Express",
    departureDate: "2025-11-15",
    arrivalDate: "2025-11-30",
    weatherRisk: "low",
    createdAt: "2025-11-10",
    estimatedCost: 425000,
    aiRecommendations: [
      "Viagem concluída com sucesso",
      "Economia de 12% vs estimativa inicial"
    ]
  },
];

const DEMO_WEATHER: WeatherCondition[] = [
  { location: "Atlântico Norte", condition: "Parcialmente nublado", windSpeed: 15, waveHeight: 2.5, visibility: "Boa", risk: "low" },
  { location: "Golfo do México", condition: "Tempestade tropical", windSpeed: 35, waveHeight: 5.2, visibility: "Ruim", risk: "high" },
  { location: "Oceano Índico", condition: "Céu limpo", windSpeed: 10, waveHeight: 1.8, visibility: "Excelente", risk: "low" },
  { location: "Mar do Norte", condition: "Neblina", windSpeed: 20, waveHeight: 3.0, visibility: "Moderada", risk: "medium" },
  { location: "Costa Brasileira", condition: "Ensolarado", windSpeed: 8, waveHeight: 1.2, visibility: "Excelente", risk: "low" },
];

export default function VoyageCommandCenter() {
  const { toast: shadcnToast } = useToast();
  const [voyages, setVoyages] = useState<VoyageRoute[]>(DEMO_VOYAGES);
  const [activeTab, setActiveTab] = useState("overview");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedVoyage, setSelectedVoyage] = useState<VoyageRoute | null>(null);
  const [aiCopilotInput, setAiCopilotInput] = useState("");
  const [aiMessages, setAiMessages] = useState<{role: string; content: string}[]>([
    { role: "assistant", content: "Olá! Sou o Copiloto de Viagens IA. Posso ajudar com otimização de rotas, análise climática e planejamento. O que você precisa?" }
  ]);

  // New voyage form
  const [newVoyage, setNewVoyage] = useState({
    origin: "",
    destination: "",
    vessel: "",
    departure: ""
  });

  // Stats
  const stats = {
    active: voyages.filter(v => v.status === "active").length,
    planned: voyages.filter(v => v.status === "planned").length,
    completed: voyages.filter(v => v.status === "completed").length,
    totalDistance: voyages.reduce((sum, v) => sum + v.distanceNm, 0),
    totalFuel: voyages.reduce((sum, v) => sum + v.fuelConsumption, 0),
    avgDays: Math.round(voyages.reduce((sum, v) => sum + v.estimatedDays, 0) / voyages.length),
    onTimeRate: 94,
    totalCost: voyages.reduce((sum, v) => sum + (v.estimatedCost || 0), 0),
    fuelSaved: 245,
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planned: "bg-blue-500/10 text-blue-600",
      active: "bg-green-500/10 text-green-600",
      completed: "bg-gray-500/10 text-gray-600",
      cancelled: "bg-red-500/10 text-red-600"
    };
    return colors[status] || colors.planned;
  };

  const getWeatherColor = (risk: string) => {
    const colors: Record<string, string> = {
      low: "text-green-500",
      medium: "text-amber-500",
      high: "text-red-500"
    };
    return colors[risk] || colors.medium;
  };

  const getWeatherBgColor = (risk: string) => {
    const colors: Record<string, string> = {
      low: "bg-green-500/10",
      medium: "bg-amber-500/10",
      high: "bg-red-500/10"
    };
    return colors[risk] || colors.medium;
  };

  const handleOptimizeRoute = async (voyageId: string) => {
    setIsOptimizing(true);
    toast.info("Otimizando rota com IA...");
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setVoyages(prev => prev.map(v => 
      v.id === voyageId 
        ? { 
            ...v, 
            fuelConsumption: Math.round(v.fuelConsumption * 0.92),
            aiRecommendations: [
              ...(v.aiRecommendations || []),
              "Rota otimizada com economia de 8% em combustível",
              `Novo consumo estimado: ${Math.round(v.fuelConsumption * 0.92)} ton`
            ]
          }
        : v
    ));
    
    toast.success("Rota otimizada! Economia estimada de 8%");
    setIsOptimizing(false);
  };

  const handleCreateVoyage = () => {
    if (!newVoyage.origin || !newVoyage.destination) {
      toast.error("Preencha origem e destino");
      return;
    }

    const originPort = DEMO_PORTS.find(p => p.id === newVoyage.origin) || DEMO_PORTS[0];
    const destPort = DEMO_PORTS.find(p => p.id === newVoyage.destination) || DEMO_PORTS[2];

    const voyage: VoyageRoute = {
      id: Date.now().toString(),
      name: `${originPort.name} → ${destPort.name}`,
      origin: originPort,
      destination: destPort,
      waypoints: [],
      distanceNm: Math.floor(Math.random() * 3000) + 2000,
      estimatedDays: Math.floor(Math.random() * 15) + 7,
      fuelConsumption: Math.floor(Math.random() * 2000) + 1500,
      status: "planned",
      vesselName: newVoyage.vessel || "A definir",
      departureDate: newVoyage.departure || new Date().toISOString().split('T')[0],
      arrivalDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      weatherRisk: "medium",
      createdAt: new Date().toISOString().split('T')[0],
      estimatedCost: Math.floor(Math.random() * 500000) + 200000,
      aiRecommendations: ["Aguardando análise de IA para otimização de rota"]
    };

    setVoyages(prev => [voyage, ...prev]);
    setNewVoyage({ origin: "", destination: "", vessel: "", departure: "" });
    setCreateDialogOpen(false);
    toast.success(`Viagem ${voyage.name} criada!`);
  };

  const handleDeleteVoyage = (id: string) => {
    setVoyages(prev => prev.filter(v => v.id !== id));
    toast.success("Viagem removida");
  };

  const handleAiCopilotSend = () => {
    if (!aiCopilotInput.trim()) return;

    setAiMessages(prev => [...prev, { role: "user", content: aiCopilotInput }]);
    
    setTimeout(() => {
      const responses = [
        "Analisando as condições meteorológicas atuais, recomendo uma rota via Las Palmas para otimizar o consumo de combustível em aproximadamente 12%.",
        "Com base nos dados de tráfego marítimo, sugiro antecipar a partida em 6 horas para evitar congestionamento no Canal da Mancha.",
        "A previsão indica ventos favoráveis nos próximos 3 dias. Aproveitar essa janela pode reduzir o tempo de viagem em 18 horas.",
        "Identificamos uma oportunidade de bunker em Durban com preços 8% abaixo da média. Deseja incluir essa escala no planejamento?"
      ];
      
      setAiMessages(prev => [...prev, { 
        role: "assistant", 
        content: responses[Math.floor(Math.random() * responses.length)]
      }]);
    }, 1500);

    setAiCopilotInput("");
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
            <Compass className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Voyage Command Center
              <Badge variant="secondary" className="ml-2">
                <Brain className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              Planejamento e otimização inteligente de viagens marítimas
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info("Exportando relatório...")}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Viagem
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Viagens Ativas</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <Ship className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Planejadas</p>
                <p className="text-2xl font-bold text-blue-600">{stats.planned}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Milhas Total</p>
                <p className="text-2xl font-bold">{stats.totalDistance.toLocaleString()}</p>
              </div>
              <Navigation className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Combustível</p>
                <p className="text-2xl font-bold">{stats.totalFuel.toLocaleString()}t</p>
              </div>
              <Fuel className="h-8 w-8 text-amber-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pontualidade</p>
                <p className="text-2xl font-bold text-green-600">{stats.onTimeRate}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Economia IA</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.fuelSaved}t</p>
              </div>
              <Sparkles className="h-8 w-8 text-emerald-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="voyages">Viagens</TabsTrigger>
          <TabsTrigger value="copilot">Copiloto IA</TabsTrigger>
          <TabsTrigger value="weather">Meteorologia</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="routes">Rotas</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Voyages Summary */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Viagens em Andamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {voyages.filter(v => v.status === "active").map(voyage => (
                  <div key={voyage.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{voyage.name}</h4>
                        <p className="text-sm text-muted-foreground">{voyage.vesselName}</p>
                      </div>
                      <Badge className={getStatusColor(voyage.status)}>Em Andamento</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Distância</p>
                        <p className="font-medium">{voyage.distanceNm} nm</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">ETA</p>
                        <p className="font-medium">{voyage.arrivalDate}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Combustível</p>
                        <p className="font-medium">{voyage.fuelConsumption}t</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Clima</p>
                        <p className={`font-medium ${getWeatherColor(voyage.weatherRisk)}`}>
                          {voyage.weatherRisk === "low" ? "Bom" : voyage.weatherRisk === "medium" ? "Moderado" : "Adverso"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Recomendações IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {voyages.flatMap(v => v.aiRecommendations || []).slice(0, 5).map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Weather Quick View */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Condições Meteorológicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {DEMO_WEATHER.map((weather, idx) => (
                  <div key={idx} className={`p-4 rounded-lg ${getWeatherBgColor(weather.risk)}`}>
                    <p className="font-medium text-sm">{weather.location}</p>
                    <p className="text-xs text-muted-foreground mt-1">{weather.condition}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Wind className={`h-4 w-4 ${getWeatherColor(weather.risk)}`} />
                      <span className="text-sm">{weather.windSpeed} nós</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Waves className={`h-4 w-4 ${getWeatherColor(weather.risk)}`} />
                      <span className="text-sm">{weather.waveHeight}m</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Voyages Tab */}
        <TabsContent value="voyages" className="space-y-4">
          {voyages.map(voyage => (
            <Card key={voyage.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Anchor className="h-5 w-5" />
                      {voyage.name}
                    </CardTitle>
                    <CardDescription>{voyage.vesselName}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(voyage.status)}>
                    {voyage.status === "planned" && "Planejada"}
                    {voyage.status === "active" && "Em Andamento"}
                    {voyage.status === "completed" && "Concluída"}
                    {voyage.status === "cancelled" && "Cancelada"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Distância</p>
                      <p className="font-medium">{voyage.distanceNm} nm</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Duração</p>
                      <p className="font-medium">{voyage.estimatedDays} dias</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Fuel className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Combustível</p>
                      <p className="font-medium">{voyage.fuelConsumption}t</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Custo Est.</p>
                      <p className="font-medium">R$ {((voyage.estimatedCost || 0) / 1000).toFixed(0)}k</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Partida</p>
                      <p className="font-medium">{voyage.departureDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cloud className={`h-4 w-4 ${getWeatherColor(voyage.weatherRisk)}`} />
                    <div>
                      <p className="text-xs text-muted-foreground">Risco Clima</p>
                      <p className={`font-medium ${getWeatherColor(voyage.weatherRisk)}`}>
                        {voyage.weatherRisk === "low" && "Baixo"}
                        {voyage.weatherRisk === "medium" && "Médio"}
                        {voyage.weatherRisk === "high" && "Alto"}
                      </p>
                    </div>
                  </div>
                </div>

                {voyage.aiRecommendations && voyage.aiRecommendations.length > 0 && (
                  <>
                    <Separator />
                    <div className="bg-muted/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">Recomendações IA</span>
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
                  </>
                )}

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleOptimizeRoute(voyage.id)}
                    disabled={isOptimizing || voyage.status === "completed" || voyage.status === "cancelled"}
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    {isOptimizing ? "Otimizando..." : "Otimizar com IA"}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSelectedVoyage(voyage);
                      setDetailsDialogOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Detalhes
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-destructive"
                    onClick={() => handleDeleteVoyage(voyage.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* AI Copilot Tab */}
        <TabsContent value="copilot" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Copiloto de Viagens IA
                </CardTitle>
                <CardDescription>
                  Assistente inteligente para otimização de rotas
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {aiMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        msg.role === "user" 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      }`}>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Pergunte ao Copiloto IA..."
                    value={aiCopilotInput}
                    onChange={e => setAiCopilotInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAiCopilotSend()}
                  />
                  <Button onClick={handleAiCopilotSend}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recursos do Copiloto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Route className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Otimização de Rotas</h4>
                    <p className="text-sm text-muted-foreground">
                      Sugere trajetos otimizados considerando clima e correntes
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Cloud className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Análise Meteorológica</h4>
                    <p className="text-sm text-muted-foreground">
                      Monitora condições e alerta sobre riscos
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Fuel className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Eficiência de Combustível</h4>
                    <p className="text-sm text-muted-foreground">
                      Calcula consumo e sugere economias
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Previsão de ETA</h4>
                    <p className="text-sm text-muted-foreground">
                      Estima tempo de chegada com precisão
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <DollarSign className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Análise de Custos</h4>
                    <p className="text-sm text-muted-foreground">
                      Identifica oportunidades de economia
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <AlertTriangle className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Alertas Inteligentes</h4>
                    <p className="text-sm text-muted-foreground">
                      Notificações proativas sobre riscos e oportunidades
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Weather Tab */}
        <TabsContent value="weather" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEMO_WEATHER.map((weather, idx) => (
              <Card key={idx} className={getWeatherBgColor(weather.risk)}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {weather.risk === "low" && <ThermometerSun className="h-5 w-5 text-green-500" />}
                    {weather.risk === "medium" && <Cloud className="h-5 w-5 text-amber-500" />}
                    {weather.risk === "high" && <AlertTriangle className="h-5 w-5 text-red-500" />}
                    {weather.location}
                  </CardTitle>
                  <CardDescription>{weather.condition}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wind className={`h-4 w-4 ${getWeatherColor(weather.risk)}`} />
                      <span>Vento</span>
                    </div>
                    <span className="font-bold">{weather.windSpeed} nós</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Waves className={`h-4 w-4 ${getWeatherColor(weather.risk)}`} />
                      <span>Ondas</span>
                    </div>
                    <span className="font-bold">{weather.waveHeight}m</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className={`h-4 w-4 ${getWeatherColor(weather.risk)}`} />
                      <span>Visibilidade</span>
                    </div>
                    <span className="font-bold">{weather.visibility}</span>
                  </div>
                  <Badge className={`w-full justify-center ${
                    weather.risk === "low" ? "bg-green-500/20 text-green-600" :
                    weather.risk === "medium" ? "bg-amber-500/20 text-amber-600" :
                    "bg-red-500/20 text-red-600"
                  }`}>
                    Risco {weather.risk === "low" ? "Baixo" : weather.risk === "medium" ? "Médio" : "Alto"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fuel className="h-5 w-5" />
                  Consumo de Combustível
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Planejado</span>
                  <span className="font-bold">{stats.totalFuel.toLocaleString()} ton</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Média por Viagem</span>
                  <span className="font-bold">
                    {Math.round(stats.totalFuel / voyages.length).toLocaleString()} ton
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Economia IA (12%)</span>
                  <span className="font-bold text-green-500">
                    {Math.round(stats.totalFuel * 0.12).toLocaleString()} ton
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Valor Economizado</span>
                  <span className="font-bold text-green-500">
                    R$ {(Math.round(stats.totalFuel * 0.12) * 2800).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance de Rotas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Taxa de Pontualidade</span>
                  <Badge className="bg-green-500/10 text-green-500">94%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Viagens Sem Incidentes</span>
                  <Badge className="bg-green-500/10 text-green-500">98%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Desvios por Clima</span>
                  <Badge className="bg-amber-500/10 text-amber-500">3 este mês</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Otimizações IA Aplicadas</span>
                  <Badge className="bg-primary/10 text-primary">12 este mês</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Viagens por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-green-500/10">
                    <div className="text-3xl font-bold text-green-500">
                      {voyages.filter(v => v.status === "active").length}
                    </div>
                    <p className="text-sm text-muted-foreground">Ativas</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-blue-500/10">
                    <div className="text-3xl font-bold text-blue-500">
                      {voyages.filter(v => v.status === "planned").length}
                    </div>
                    <p className="text-sm text-muted-foreground">Planejadas</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gray-500/10">
                    <div className="text-3xl font-bold text-gray-500">
                      {voyages.filter(v => v.status === "completed").length}
                    </div>
                    <p className="text-sm text-muted-foreground">Concluídas</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-red-500/10">
                    <div className="text-3xl font-bold text-red-500">
                      {voyages.filter(v => v.status === "cancelled").length}
                    </div>
                    <p className="text-sm text-muted-foreground">Canceladas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Routes Tab */}
        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Portos e Rotas Cadastradas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {DEMO_PORTS.map(port => (
                  <div key={port.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{port.name}</h4>
                      <Badge variant="outline">{port.code}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{port.country}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Navigation className="h-3 w-3" />
                      {port.lat.toFixed(2)}°, {port.lng.toFixed(2)}°
                    </div>
                    <Badge className={`mt-2 ${
                      port.type === "origin" ? "bg-green-500/10 text-green-600" :
                      port.type === "destination" ? "bg-blue-500/10 text-blue-600" :
                      "bg-amber-500/10 text-amber-600"
                    }`}>
                      {port.type === "origin" ? "Origem" : port.type === "destination" ? "Destino" : "Escala"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Voyage Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nova Viagem</DialogTitle>
            <DialogDescription>
              Planeje uma nova viagem com assistência de IA
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Origem</Label>
              <Select onValueChange={v => setNewVoyage(p => ({ ...p, origin: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar porto de origem" />
                </SelectTrigger>
                <SelectContent>
                  {DEMO_PORTS.filter(p => p.type === "origin").map(port => (
                    <SelectItem key={port.id} value={port.id}>{port.name}, {port.country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Destino</Label>
              <Select onValueChange={v => setNewVoyage(p => ({ ...p, destination: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar porto de destino" />
                </SelectTrigger>
                <SelectContent>
                  {DEMO_PORTS.filter(p => p.type === "destination").map(port => (
                    <SelectItem key={port.id} value={port.id}>{port.name}, {port.country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Embarcação</Label>
              <Select onValueChange={v => setNewVoyage(p => ({ ...p, vessel: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar embarcação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MV Atlantic Pioneer">MV Atlantic Pioneer</SelectItem>
                  <SelectItem value="MV Pacific Star">MV Pacific Star</SelectItem>
                  <SelectItem value="MV Gulf Carrier">MV Gulf Carrier</SelectItem>
                  <SelectItem value="MV Europa Express">MV Europa Express</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Data de Partida</Label>
              <Input 
                type="date"
                value={newVoyage.departure}
                onChange={e => setNewVoyage(p => ({ ...p, departure: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateVoyage}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Viagem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Voyage Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedVoyage?.name}</DialogTitle>
            <DialogDescription>
              {selectedVoyage?.vesselName}
            </DialogDescription>
          </DialogHeader>
          {selectedVoyage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Origem</Label>
                  <p className="font-medium">{selectedVoyage.origin.name}, {selectedVoyage.origin.country}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Destino</Label>
                  <p className="font-medium">{selectedVoyage.destination.name}, {selectedVoyage.destination.country}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Distância</Label>
                  <p className="font-medium">{selectedVoyage.distanceNm} milhas náuticas</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Duração Estimada</Label>
                  <p className="font-medium">{selectedVoyage.estimatedDays} dias</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Combustível</Label>
                  <p className="font-medium">{selectedVoyage.fuelConsumption} toneladas</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Custo Estimado</Label>
                  <p className="font-medium">R$ {(selectedVoyage.estimatedCost || 0).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Partida</Label>
                  <p className="font-medium">{selectedVoyage.departureDate}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Chegada</Label>
                  <p className="font-medium">{selectedVoyage.arrivalDate}</p>
                </div>
              </div>

              {selectedVoyage.waypoints.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Escalas</Label>
                  <div className="flex gap-2 mt-1">
                    {selectedVoyage.waypoints.map(wp => (
                      <Badge key={wp.id} variant="outline">{wp.name}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedVoyage.aiRecommendations && selectedVoyage.aiRecommendations.length > 0 && (
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Recomendações IA</span>
                  </div>
                  <ul className="space-y-1">
                    {selectedVoyage.aiRecommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Fechar
            </Button>
            <Button onClick={() => {
              if (selectedVoyage) {
                handleOptimizeRoute(selectedVoyage.id);
              }
              setDetailsDialogOpen(false);
            }}>
              <Brain className="h-4 w-4 mr-2" />
              Otimizar com IA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
