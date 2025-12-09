/**
 * Voyage Simulator - PHASE 5
 * Simulador de viagem com IA, clima e rotas otimizadas
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Navigation, 
  Ship,
  Fuel,
  Clock,
  MapPin,
  Wind,
  Waves,
  CloudRain,
  Sun,
  AlertTriangle,
  CheckCircle,
  Route,
  Zap,
  TrendingUp,
  Loader2,
  Anchor
} from "lucide-react";

interface SimulationResult {
  estimatedTime: number; // hours
  fuelConsumption: number; // liters
  distance: number; // nautical miles
  avgSpeed: number; // knots
  weatherRisk: "low" | "medium" | "high";
  recommendedRoute: string;
  alternativeRoutes: {
    name: string;
    time: number;
    fuel: number;
    risk: string;
  }[];
  weatherAlerts: string[];
  optimizations: string[];
}

const vessels = [
  { id: "1", name: "MV Nautilus", type: "PSV", consumption: 450 },
  { id: "2", name: "PSV Alpha", type: "PSV", consumption: 380 },
  { id: "3", name: "OSV Beta", type: "OSV", consumption: 520 },
  { id: "4", name: "AHTS Gamma", type: "AHTS", consumption: 680 },
];

const ports = [
  "Santos, BR",
  "Rio de Janeiro, BR",
  "Macaé, BR",
  "Vitória, BR",
  "Salvador, BR",
  "Campos Basin (P-50)",
  "Campos Basin (P-66)",
  "Santos Basin (FPSO)",
];

export const VoyageSimulator: React.FC = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [vessel, setVessel] = useState("");
  const [cargo, setCargo] = useState<number[]>([50]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const runSimulation = async () => {
    if (!origin || !destination || !vessel) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsSimulating(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const selectedVessel = vessels.find(v => v.id === vessel);
    const baseDistance = 120 + Math.random() * 180;
    const cargoFactor = 1 + (cargo[0] / 100) * 0.3;
    
    const mockResult: SimulationResult = {
      estimatedTime: Math.round(baseDistance / (12 + Math.random() * 4)),
      fuelConsumption: Math.round(baseDistance * (selectedVessel?.consumption || 400) / 100 * cargoFactor),
      distance: Math.round(baseDistance),
      avgSpeed: 12 + Math.random() * 4,
      weatherRisk: Math.random() > 0.7 ? "high" : Math.random() > 0.4 ? "medium" : "low",
      recommendedRoute: "Rota Costeira Sul",
      alternativeRoutes: [
        {
          name: "Rota Direta",
          time: Math.round(baseDistance / 14),
          fuel: Math.round(baseDistance * (selectedVessel?.consumption || 400) / 100 * cargoFactor * 1.1),
          risk: "medium"
        },
        {
          name: "Rota Norte (evita mau tempo)",
          time: Math.round(baseDistance * 1.15 / 11),
          fuel: Math.round(baseDistance * (selectedVessel?.consumption || 400) / 100 * cargoFactor * 0.95),
          risk: "low"
        }
      ],
      weatherAlerts: Math.random() > 0.5 
        ? ["Previsão de ventos de 25-30 nós entre 14h-20h", "Mar agitado próximo à costa"]
        : [],
      optimizations: [
        "Reduzir velocidade em 2 nós economiza 12% de combustível",
        "Melhor janela de partida: 06:00 - 08:00",
        "Considerar parada técnica em Vitória para otimização"
      ]
    };
    
    setResult(mockResult);
    setIsSimulating(false);
    toast.success("Simulação concluída!");
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "text-green-500";
      case "medium": return "text-amber-500";
      case "high": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "low": return "default";
      case "medium": return "secondary";
      case "high": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Navigation className="h-6 w-6 text-primary" />
            Simulador de Viagem
          </h2>
          <p className="text-muted-foreground">
            Simule rotas com previsão de consumo, tempo e condições climáticas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configuração da Viagem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Origem</Label>
              <Select value={origin} onValueChange={setOrigin}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a origem" />
                </SelectTrigger>
                <SelectContent>
                  {ports.map((port) => (
                    <SelectItem key={port} value={port}>{port}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Destino</Label>
              <Select value={destination} onValueChange={setDestination}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o destino" />
                </SelectTrigger>
                <SelectContent>
                  {ports.filter(p => p !== origin).map((port) => (
                    <SelectItem key={port} value={port}>{port}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Embarcação</Label>
              <Select value={vessel} onValueChange={setVessel}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a embarcação" />
                </SelectTrigger>
                <SelectContent>
                  {vessels.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} ({v.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Carga</Label>
                <span className="text-sm text-muted-foreground">{cargo[0]}%</span>
              </div>
              <Slider
                value={cargo}
                onValueChange={setCargo}
                max={100}
                step={5}
              />
            </div>

            <Button 
              className="w-full gap-2" 
              onClick={runSimulation}
              disabled={isSimulating}
            >
              {isSimulating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Simulando...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Simular Viagem
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              {/* Main Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Clock className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Tempo Est.</p>
                        <p className="text-2xl font-bold">{result.estimatedTime}h</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Fuel className="h-8 w-8 text-amber-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Combustível</p>
                        <p className="text-2xl font-bold">{result.fuelConsumption.toLocaleString()}L</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Route className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Distância</p>
                        <p className="text-2xl font-bold">{result.distance} NM</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Velocidade</p>
                        <p className="text-2xl font-bold">{result.avgSpeed.toFixed(1)} kn</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recommended Route */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Navigation className="h-5 w-5 text-primary" />
                      Rota Recomendada
                    </CardTitle>
                    <Badge variant={getRiskBadge(result.weatherRisk)}>
                      Risco {result.weatherRisk === "low" ? "Baixo" : result.weatherRisk === "medium" ? "Médio" : "Alto"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-semibold text-lg">{result.recommendedRoute}</p>
                      <p className="text-sm text-muted-foreground">
                        Melhor relação tempo/consumo/segurança para as condições atuais
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Rotas Alternativas</p>
                    <div className="space-y-2">
                      {result.alternativeRoutes.map((route, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Route className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{route.name}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {route.time}h
                            </span>
                            <span className="flex items-center gap-1">
                              <Fuel className="h-3 w-3" />
                              {route.fuel.toLocaleString()}L
                            </span>
                            <Badge variant="outline" className={getRiskColor(route.risk)}>
                              {route.risk}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weather & Optimizations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CloudRain className="h-5 w-5 text-blue-500" />
                      Alertas Meteorológicos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {result.weatherAlerts.length > 0 ? (
                      <div className="space-y-2">
                        {result.weatherAlerts.map((alert, idx) => (
                          <div key={idx} className="flex items-start gap-2 p-2 bg-amber-500/10 rounded-lg">
                            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            <span className="text-sm">{alert}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600">
                        <Sun className="h-5 w-5" />
                        <span>Condições climáticas favoráveis</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      Otimizações IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {result.optimizations.map((opt, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm">{opt}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card className="h-full min-h-[400px] flex items-center justify-center">
              <div className="text-center">
                <Ship className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Configure sua viagem</h3>
                <p className="text-muted-foreground mt-1">
                  Selecione origem, destino e embarcação para simular
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoyageSimulator;
