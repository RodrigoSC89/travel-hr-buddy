import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Fuel, TrendingDown, Zap, Cloud, Navigation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const FuelOptimizer: React.FC = () => {
  const { toast } = useToast();
  const [distance, setDistance] = useState("500");
  const [cargoWeight, setCargoWeight] = useState("5000");
  const [weatherCondition, setWeatherCondition] = useState("normal");
  const [optimizationLevel, setOptimizationLevel] = useState("ai_basic");
  const [result, setResult] = useState<any>(null);

  const handleOptimize = () => {
    const baseConsumption = parseFloat(distance) * 0.15;
    const weatherFactor = weatherCondition === "good" ? 0.95 : weatherCondition === "poor" ? 1.1 : 1.0;
    const cargoFactor = 1 + (parseFloat(cargoWeight) / 10000) * 0.1;
    const levelFactor = optimizationLevel === "ai_advanced" ? 0.95 : optimizationLevel === "ai_weather_optimized" ? 0.92 : 1.0;
    
    const optimizedConsumption = baseConsumption * weatherFactor * cargoFactor * levelFactor;
    const savings = ((baseConsumption - optimizedConsumption) / baseConsumption) * 100;
    
    setResult({
      optimized_consumption: optimizedConsumption.toFixed(2),
      fuel_savings_percentage: savings.toFixed(2),
      cost_estimate: (optimizedConsumption * 600).toFixed(2),
      co2_estimate: (optimizedConsumption * 3.114).toFixed(2),
      recommendations: optimizationLevel === "ai_weather_optimized" 
        ? ["Reduzir velocidade em 5% para 8% de economia", "Ajustar rota em 3° para evitar ventos contrários"]
        : ["Manter velocidade ótima", "Monitorar condições climáticas"]
    });

    toast({ title: "Otimização concluída", description: `Economia estimada: ${savings.toFixed(1)}%` });
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold flex items-center gap-2"><Fuel className="h-6 w-6" />Otimizador de Combustível AI</h2><p className="text-muted-foreground mt-1">PATCH 282 - AI-Powered Fuel Optimization</p></div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle>Parâmetros da Viagem</CardTitle></CardHeader><CardContent className="space-y-4"><div><Label>Distância (milhas náuticas)</Label><Input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} /></div><div><Label>Peso da carga (toneladas)</Label><Input type="number" value={cargoWeight} onChange={(e) => setCargoWeight(e.target.value)} /></div><div><Label>Condições Climáticas</Label><Select value={weatherCondition} onValueChange={setWeatherCondition}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="excellent">Excelente</SelectItem><SelectItem value="good">Boa</SelectItem><SelectItem value="normal">Normal</SelectItem><SelectItem value="poor">Ruim</SelectItem></SelectContent></Select></div><div><Label>Nível de Otimização</Label><Select value={optimizationLevel} onValueChange={setOptimizationLevel}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="manual">Manual</SelectItem><SelectItem value="ai_basic">AI Básica</SelectItem><SelectItem value="ai_advanced">AI Avançada</SelectItem><SelectItem value="ai_weather_optimized">AI Otimizada por Clima</SelectItem></SelectContent></Select></div><Button onClick={handleOptimize} className="w-full"><Zap className="mr-2 h-4 w-4" />Otimizar Rota</Button></CardContent></Card>
        {result && (
          <Card><CardHeader><CardTitle>Resultado da Otimização</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid grid-cols-2 gap-4"><div><p className="text-sm text-muted-foreground">Consumo Otimizado</p><p className="text-2xl font-bold">{result.optimized_consumption} t</p></div><div><p className="text-sm text-muted-foreground">Economia</p><p className="text-2xl font-bold text-green-600">{result.fuel_savings_percentage}%</p></div><div><p className="text-sm text-muted-foreground">Custo Estimado</p><p className="text-xl font-semibold">${result.cost_estimate}</p></div><div><p className="text-sm text-muted-foreground">CO₂ Estimado</p><p className="text-xl font-semibold">{result.co2_estimate} t</p></div></div><div className="pt-4 border-t"><p className="font-semibold mb-2">Recomendações:</p><ul className="space-y-1">{result.recommendations.map((rec: string, i: number) => (<li key={i} className="text-sm flex items-start gap-2"><Zap className="h-3 w-3 mt-1 text-primary" />{rec}</li>))}</ul></div></CardContent></Card>
        )}
      </div>
    </div>
  );
};
