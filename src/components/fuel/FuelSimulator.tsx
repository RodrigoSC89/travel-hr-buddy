import { useMemo, useState, useCallback } from "react";;
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  Fuel, 
  Route, 
  Gauge,
  TrendingDown,
  DollarSign,
  Clock
} from "lucide-react";

interface SimulationResult {
  estimatedConsumption: number;
  optimizedConsumption: number;
  savingsLiters: number;
  savingsPercentage: number;
  estimatedCost: number;
  estimatedSavings: number;
  travelTime: number;
  optimalSpeed: number;
}

export const FuelSimulator: React.FC = () => {
  const [distance, setDistance] = useState(500);
  const [currentSpeed, setCurrentSpeed] = useState(14);
  const [weatherCondition, setWeatherCondition] = useState("normal");
  const [fuelPrice, setFuelPrice] = useState(3.50);

  const weatherFactors: Record<string, { factor: number; label: string }> = {
    excellent: { factor: 0.9, label: "Excelente" },
    good: { factor: 0.95, label: "Bom" },
    normal: { factor: 1.0, label: "Normal" },
    moderate: { factor: 1.1, label: "Moderado" },
    challenging: { factor: 1.25, label: "Desafiador" },
  };

  const simulation = useMemo((): SimulationResult => {
    const baseRate = 2.5; // liters per nautical mile
    const optimalSpeed = 10.5;
    const weatherFactor = weatherFactors[weatherCondition]?.factor || 1.0;
    
    // Current consumption calculation
    const speedAdjustment = Math.pow(currentSpeed / 12, 2.5);
    const estimatedConsumption = distance * baseRate * speedAdjustment * weatherFactor;
    
    // Optimized consumption calculation
    const optimalSpeedAdjustment = Math.pow(optimalSpeed / 12, 2.5);
    const optimizedConsumption = distance * baseRate * optimalSpeedAdjustment * weatherFactor;
    
    const savingsLiters = estimatedConsumption - optimizedConsumption;
    const savingsPercentage = (savingsLiters / estimatedConsumption) * 100;
    
    const estimatedCost = estimatedConsumption * fuelPrice;
    const estimatedSavings = savingsLiters * fuelPrice;
    
    const travelTime = distance / currentSpeed;
    
    return {
      estimatedConsumption: Math.round(estimatedConsumption),
      optimizedConsumption: Math.round(optimizedConsumption),
      savingsLiters: Math.round(savingsLiters),
      savingsPercentage: Math.round(savingsPercentage * 10) / 10,
      estimatedCost: Math.round(estimatedCost * 100) / 100,
      estimatedSavings: Math.round(estimatedSavings * 100) / 100,
      travelTime: Math.round(travelTime * 10) / 10,
      optimalSpeed,
    };
  }, [distance, currentSpeed, weatherCondition, fuelPrice]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Simulador de Consumo
        </CardTitle>
        <CardDescription>
          Simule e otimize o consumo de combustível para suas viagens
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Route className="h-4 w-4" />
                Distância da Viagem: {distance} nm
              </Label>
              <Slider
                value={[distance]}
                onValueChange={(v) => setDistance(v[0])}
                min={50}
                max={2000}
                step={50}
              />
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Gauge className="h-4 w-4" />
                Velocidade Atual: {currentSpeed} nós
              </Label>
              <Slider
                value={[currentSpeed]}
                onValueChange={(v) => setCurrentSpeed(v[0])}
                min={8}
                max={20}
                step={0.5}
              />
            </div>

            <div>
              <Label className="mb-2 block">Condição Meteorológica</Label>
              <Select value={weatherCondition} onValueChange={setWeatherCondition}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(weatherFactors).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4" />
                Preço do Combustível (R$/L)
              </Label>
              <Input
                type="number"
                value={fuelPrice}
                onChange={handleChange}
                step={0.10}
                min={0}
              />
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Consumo Estimado</p>
                    <p className="text-2xl font-bold">{simulation.estimatedConsumption.toLocaleString()} L</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Consumo Otimizado</p>
                    <p className="text-2xl font-bold text-green-600">{simulation.optimizedConsumption.toLocaleString()} L</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingDown className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Economia Potencial</p>
                    <p className="text-2xl font-bold text-green-600">
                      {simulation.savingsLiters.toLocaleString()} L ({simulation.savingsPercentage}%)
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Custo Atual</p>
                    <p className="font-semibold">R$ {simulation.estimatedCost.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Economia em R$</p>
                    <p className="font-semibold text-green-600">R$ {simulation.estimatedSavings.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Tempo de Viagem</p>
                      <p className="font-semibold">{simulation.travelTime} horas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Velocidade Ideal</p>
                      <p className="font-semibold">{simulation.optimalSpeed} nós</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm">
                <strong>Recomendação:</strong> Reduza a velocidade de {currentSpeed} para {simulation.optimalSpeed} nós 
                para economizar <strong className="text-green-600">R$ {simulation.estimatedSavings.toLocaleString()}</strong> nesta viagem.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
