// @ts-nocheck
// PATCH 282: Fuel Optimizer Component with AI Optimization
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Fuel, TrendingDown, Sparkles, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface OptimizationResult {
  base_consumption: number;
  optimized_consumption: number;
  fuel_savings: number;
  fuel_savings_percentage: number;
  weather_factor: number;
  cargo_factor: number;
  route_factor: number;
  optimization_level: string;
  recommendations: string[];
}

export const FuelOptimizerAI: React.FC = () => {
  const { toast } = useToast();
  const [routeId, setRouteId] = useState("");
  const [cargoWeight, setCargoWeight] = useState("5000");
  const [weatherCondition, setWeatherCondition] = useState<string>("good");
  const [optimizationLevel, setOptimizationLevel] = useState<string>("ai_optimized");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);

  const handleOptimize = async () => {
    if (!routeId) {
      toast({
        title: "Route Required",
        description: "Please enter a route ID to optimize",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("optimize_fuel_plan", {
        p_route_id: routeId,
        p_cargo_weight: parseFloat(cargoWeight) || 0,
        p_weather_condition: weatherCondition,
        p_optimization_level: optimizationLevel,
      });

      if (error) {
        throw error;
      }

      setResult(data as OptimizationResult);
      toast({
        title: "Optimization Complete",
        description: `Potential savings: ${data.fuel_savings_percentage.toFixed(2)}%`,
      });
    } catch (error) {
      console.error("Optimization error:", error);
      toast({
        title: "Optimization Failed",
        description: error.message || "Failed to optimize fuel plan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Fuel className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">AI Fuel Optimizer</h1>
          <p className="text-sm text-muted-foreground">Optimize fuel consumption with AI-powered recommendations</p>
        </div>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Optimization Parameters
          </CardTitle>
          <CardDescription>Configure route and cargo details for AI optimization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="routeId">Route ID</Label>
              <Input
                id="routeId"
                placeholder="Enter route UUID"
                value={routeId}
                onChange={(e) => setRouteId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargoWeight">Cargo Weight (kg)</Label>
              <Input
                id="cargoWeight"
                type="number"
                placeholder="5000"
                value={cargoWeight}
                onChange={(e) => setCargoWeight(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weatherCondition">Weather Condition</Label>
              <Select value={weatherCondition} onValueChange={setWeatherCondition}>
                <SelectTrigger id="weatherCondition">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="optimizationLevel">Optimization Level</Label>
              <Select value={optimizationLevel} onValueChange={setOptimizationLevel}>
                <SelectTrigger id="optimizationLevel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic (5% savings)</SelectItem>
                  <SelectItem value="ai_optimized">AI Optimized (7% savings)</SelectItem>
                  <SelectItem value="ai_weather_optimized">AI Weather Optimized (8% savings)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleOptimize}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Optimizing..." : "Optimize Fuel Plan"}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Consumption Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Fuel Consumption</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Base Consumption:</span>
                <span className="text-2xl font-bold">{result.base_consumption.toFixed(2)} MT</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Optimized:</span>
                <span className="text-2xl font-bold text-green-600">{result.optimized_consumption.toFixed(2)} MT</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="font-semibold">Savings:</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {result.fuel_savings_percentage.toFixed(2)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {result.fuel_savings.toFixed(2)} MT saved
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Optimization Factors */}
          <Card>
            <CardHeader>
              <CardTitle>Optimization Factors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Weather Factor:</span>
                <span className="font-semibold">{(result.weather_factor * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cargo Factor:</span>
                <span className="font-semibold">{(result.cargo_factor * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Route Factor:</span>
                <span className="font-semibold">{(result.route_factor * 100).toFixed(1)}%</span>
              </div>
              <div className="pt-3 border-t">
                <span className="text-sm font-semibold">Optimization Level:</span>
                <p className="text-sm text-muted-foreground capitalize">
                  {result.optimization_level.replace(/_/g, " ")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-green-600" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FuelOptimizerAI;
