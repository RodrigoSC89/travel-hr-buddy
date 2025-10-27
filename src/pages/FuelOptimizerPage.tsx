import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Fuel, TrendingDown, Cloud, Ship, Plus } from "lucide-react";
import { format } from "date-fns";

interface FuelOptimization {
  id: string;
  route_name: string;
  origin: string;
  destination: string;
  distance_nm: number;
  estimated_consumption: number;
  optimized_consumption: number | null;
  savings_percentage: number | null;
  weather_conditions: any;
  status: string;
  created_at: string;
}

const FuelOptimizerPage = () => {
  const [optimizations, setOptimizations] = useState<FuelOptimization[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newRoute, setNewRoute] = useState({
    route_name: "",
    origin: "",
    destination: "",
    distance_nm: "",
    estimated_consumption: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchOptimizations();
  }, []);

  const fetchOptimizations = async () => {
    const { data, error } = await supabase
      .from("fuel_optimizations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar otimizações", variant: "destructive" });
      return;
    }

    setOptimizations(data || []);
  };

  const simulateWeatherConditions = () => {
    const conditions = ["calm", "moderate", "rough", "stormy"];
    const windSpeeds = [5, 15, 25, 35];
    const waveHeights = [0.5, 1.5, 3.0, 5.0];
    
    const index = Math.floor(Math.random() * conditions.length);
    
    return {
      condition: conditions[index],
      wind_speed_knots: windSpeeds[index] + Math.floor(Math.random() * 10),
      wave_height_meters: waveHeights[index] + Math.random(),
      temperature: 15 + Math.random() * 15,
      visibility_nm: 5 + Math.random() * 10
    };
  };

  const calculateOptimization = (baseConsumption: number, weather: any) => {
    let factor = 1.0;
    
    // Weather impact
    switch(weather.condition) {
      case "calm":
        factor = 0.85;
        break;
      case "moderate":
        factor = 0.95;
        break;
      case "rough":
        factor = 1.15;
        break;
      case "stormy":
        factor = 1.35;
        break;
    }
    
    // Wind impact
    if (weather.wind_speed_knots > 30) {
      factor += 0.1;
    }
    
    const optimized = baseConsumption * factor;
    const savings = ((baseConsumption - optimized) / baseConsumption) * 100;
    
    return {
      optimized_consumption: optimized,
      savings_percentage: savings,
      optimization_factors: {
        weather_factor: factor,
        route_optimization: 0.95,
        speed_optimization: 0.92,
        trim_optimization: 0.98
      }
    };
  };

  const createOptimization = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: orgData } = await supabase
      .from("organization_users")
      .select("organization_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (!orgData) return;

    const weather = simulateWeatherConditions();
    const baseConsumption = parseFloat(newRoute.estimated_consumption);
    const optimization = calculateOptimization(baseConsumption, weather);

    const { error } = await supabase
      .from("fuel_optimizations")
      .insert({
        organization_id: orgData.organization_id,
        route_name: newRoute.route_name,
        origin: newRoute.origin,
        destination: newRoute.destination,
        distance_nm: parseFloat(newRoute.distance_nm),
        estimated_consumption: baseConsumption,
        optimized_consumption: optimization.optimized_consumption,
        savings_percentage: optimization.savings_percentage,
        weather_conditions: weather,
        optimization_factors: optimization.optimization_factors,
        created_by: user.id,
        status: "simulated"
      });

    if (error) {
      toast({ title: "Erro ao criar otimização", description: error.message, variant: "destructive" });
      return;
    }

    toast({ 
      title: "Otimização criada!", 
      description: `Economia estimada: ${optimization.savings_percentage.toFixed(2)}%`
    });
    setIsCreating(false);
    setNewRoute({
      route_name: "",
      origin: "",
      destination: "",
      distance_nm: "",
      estimated_consumption: ""
    });
    fetchOptimizations();
  };

  const getWeatherIcon = (condition: string) => {
    const icons: Record<string, string> = {
      calm: "🌤️",
      moderate: "⛅",
      rough: "🌧️",
      stormy: "⛈️"
    };
    return icons[condition] || "🌤️";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Fuel className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Otimizador de Combustível</h1>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Simulação
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Economia Total</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {optimizations.length > 0
                ? `${(optimizations.reduce((acc, opt) => acc + (opt.savings_percentage || 0), 0) / optimizations.length).toFixed(2)}%`
                : "0%"
              }
            </div>
            <p className="text-xs text-muted-foreground">Média das rotas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rotas Simuladas</CardTitle>
            <Ship className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{optimizations.length}</div>
            <p className="text-xs text-muted-foreground">Total de análises</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Combustível Economizado</CardTitle>
            <Fuel className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {optimizations.reduce((acc, opt) => {
                const saved = (opt.estimated_consumption || 0) - (opt.optimized_consumption || 0);
                return acc + Math.max(0, saved);
              }, 0).toFixed(2)} t
            </div>
            <p className="text-xs text-muted-foreground">Toneladas totais</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {optimizations.map((opt) => (
          <Card key={opt.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{opt.route_name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {opt.origin} → {opt.destination} ({opt.distance_nm} NM)
                  </p>
                </div>
                <Badge variant={opt.savings_percentage && opt.savings_percentage > 0 ? "default" : "secondary"}>
                  {opt.savings_percentage 
                    ? `${opt.savings_percentage > 0 ? '+' : ''}${opt.savings_percentage.toFixed(2)}%`
                    : "N/A"
                  }
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Estimado</p>
                  <p className="text-lg font-bold">{opt.estimated_consumption.toFixed(2)} t</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Otimizado</p>
                  <p className="text-lg font-bold text-green-500">
                    {opt.optimized_consumption?.toFixed(2) || "N/A"} t
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Economia</p>
                  <p className="text-lg font-bold text-green-500">
                    {opt.optimized_consumption 
                      ? `${(opt.estimated_consumption - opt.optimized_consumption).toFixed(2)} t`
                      : "N/A"
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Condições</p>
                  <p className="text-lg">
                    {opt.weather_conditions 
                      ? `${getWeatherIcon(opt.weather_conditions.condition)} ${opt.weather_conditions.condition}`
                      : "N/A"
                    }
                  </p>
                </div>
              </div>
              
              {opt.weather_conditions && (
                <div className="border-t pt-3 mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Cloud className="h-4 w-4" />
                    <span className="text-sm font-medium">Condições Meteorológicas</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Vento:</span>
                      <span className="ml-1 font-medium">
                        {opt.weather_conditions.wind_speed_knots} kn
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ondas:</span>
                      <span className="ml-1 font-medium">
                        {opt.weather_conditions.wave_height_meters?.toFixed(1)} m
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Temp:</span>
                      <span className="ml-1 font-medium">
                        {opt.weather_conditions.temperature?.toFixed(1)}°C
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Visibilidade:</span>
                      <span className="ml-1 font-medium">
                        {opt.weather_conditions.visibility_nm?.toFixed(1)} NM
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="text-xs text-muted-foreground mt-3">
                Simulado em {format(new Date(opt.created_at), "dd/MM/yyyy HH:mm")}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Simulação de Rota</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nome da Rota</Label>
              <Input
                value={newRoute.route_name}
                onChange={(e) => setNewRoute({...newRoute, route_name: e.target.value})}
                placeholder="Ex: Santos - Rotterdam"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Origem</Label>
                <Input
                  value={newRoute.origin}
                  onChange={(e) => setNewRoute({...newRoute, origin: e.target.value})}
                  placeholder="Porto de origem"
                />
              </div>
              <div className="grid gap-2">
                <Label>Destino</Label>
                <Input
                  value={newRoute.destination}
                  onChange={(e) => setNewRoute({...newRoute, destination: e.target.value})}
                  placeholder="Porto de destino"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Distância (NM)</Label>
                <Input
                  type="number"
                  value={newRoute.distance_nm}
                  onChange={(e) => setNewRoute({...newRoute, distance_nm: e.target.value})}
                  placeholder="5000"
                />
              </div>
              <div className="grid gap-2">
                <Label>Consumo Estimado (t)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newRoute.estimated_consumption}
                  onChange={(e) => setNewRoute({...newRoute, estimated_consumption: e.target.value})}
                  placeholder="150.5"
                />
              </div>
            </div>
          </div>
          <Button onClick={createOptimization} className="w-full">
            Simular Otimização
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FuelOptimizerPage;
