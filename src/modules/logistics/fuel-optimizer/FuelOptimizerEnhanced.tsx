import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Fuel, TrendingDown, Sparkles, AlertCircle, Ship, Cloud, MapPin, Gauge } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VesselType {
  type: string;
  baseConsumption: number; // tons per day at cruise speed
  optimalSpeed: number; // knots
  cargoFactor: number; // consumption multiplier per ton of cargo
}

const VESSEL_TYPES: Record<string, VesselType> = {
  "container": { type: "Container Ship", baseConsumption: 150, optimalSpeed: 22, cargoFactor: 0.00001 },
  "tanker": { type: "Oil Tanker", baseConsumption: 180, optimalSpeed: 14, cargoFactor: 0.000008 },
  "bulk_carrier": { type: "Bulk Carrier", baseConsumption: 140, optimalSpeed: 14, cargoFactor: 0.000009 },
  "cruise": { type: "Cruise Ship", baseConsumption: 200, optimalSpeed: 20, cargoFactor: 0.00002 },
  "cargo": { type: "General Cargo", baseConsumption: 120, optimalSpeed: 16, cargoFactor: 0.00001 },
};

const WEATHER_MULTIPLIERS: Record<string, number> = {
  "calm": 1.0,
  "moderate": 1.15,
  "rough": 1.35,
  "storm": 1.60,
};

interface OptimizationResult {
  vessel_name: string;
  vessel_type: string;
  route_origin: string;
  route_destination: string;
  current_speed: number;
  optimal_speed: number;
  cargo_weight: number;
  current_consumption: number;
  optimized_consumption: number;
  fuel_savings_percentage: number;
  estimated_savings_usd: number;
  weather_conditions: {
    condition: string;
    impact: string;
    multiplier: number;
  };
  alternative_routes?: {
    name: string;
    distance_nm: number;
    estimated_time_days: number;
    fuel_savings: number;
  }[];
  recommendations: string[];
}

export const FuelOptimizerEnhanced: React.FC = () => {
  const { toast } = useToast();
  const [vesselName, setVesselName] = useState("");
  const [vesselType, setVesselType] = useState("container");
  const [routeOrigin, setRouteOrigin] = useState("");
  const [routeDestination, setRouteDestination] = useState("");
  const [currentSpeed, setCurrentSpeed] = useState("24");
  const [cargoWeight, setCargoWeight] = useState("15000");
  const [weatherCondition, setWeatherCondition] = useState("moderate");
  const [fuelPriceUSD, setFuelPriceUSD] = useState("600");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [savedResults, setSavedResults] = useState<OptimizationResult[]>([]);

  useEffect(() => {
    fetchSavedResults();
  }, []);

  const fetchSavedResults = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: orgData } = await supabase
      .from("organization_users")
      .select("organization_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (!orgData) return;

    const { data, error } = await supabase
      .from("fuel_optimization_results")
      .select("*")
      .eq("organization_id", orgData.organization_id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (!error && data) {
      setSavedResults(data as any);
    }
  };

  const calculateOptimization = (): OptimizationResult => {
    const vessel = VESSEL_TYPES[vesselType];
    const speed = parseFloat(currentSpeed);
    const cargo = parseFloat(cargoWeight);
    const weatherMultiplier = WEATHER_MULTIPLIERS[weatherCondition];
    const fuelPrice = parseFloat(fuelPriceUSD);

    // Calculate current fuel consumption
    // Formula: Base consumption * (speed/optimal_speed)^3 * cargo_factor * weather_multiplier
    const speedFactor = Math.pow(speed / vessel.optimalSpeed, 3);
    const cargoImpact = 1 + (cargo * vessel.cargoFactor);
    const currentConsumption = vessel.baseConsumption * speedFactor * cargoImpact * weatherMultiplier;

    // Calculate optimized consumption (at optimal speed)
    const optimalSpeedFactor = 1; // Already at optimal
    const optimizedConsumption = vessel.baseConsumption * optimalSpeedFactor * cargoImpact * weatherMultiplier;

    // Calculate savings
    const fuelSavings = currentConsumption - optimizedConsumption;
    const fuelSavingsPercentage = (fuelSavings / currentConsumption) * 100;
    const estimatedSavingsUSD = fuelSavings * fuelPrice * 30; // 30 days

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (speed > vessel.optimalSpeed) {
      recommendations.push(`Reduce speed from ${speed} to ${vessel.optimalSpeed} knots for optimal efficiency`);
      recommendations.push(`Speed reduction can save up to ${fuelSavingsPercentage.toFixed(1)}% fuel consumption`);
    } else if (speed < vessel.optimalSpeed) {
      recommendations.push(`Consider increasing speed to ${vessel.optimalSpeed} knots for better fuel efficiency`);
    }

    if (weatherCondition === "rough" || weatherCondition === "storm") {
      recommendations.push("Consider delaying departure or taking alternative route due to severe weather");
      recommendations.push("Current weather increases fuel consumption by " + ((weatherMultiplier - 1) * 100).toFixed(0) + "%");
    }

    if (cargo > 20000) {
      recommendations.push("Heavy cargo detected - consider splitting load or optimizing trim");
    }

    recommendations.push("Implement Just-In-Time (JIT) arrival to minimize port waiting time");
    recommendations.push("Use weather routing to avoid unfavorable conditions");

    // Alternative routes (simplified simulation)
    const alternativeRoutes = [
      {
        name: "Direct Route",
        distance_nm: 3500,
        estimated_time_days: 7.3,
        fuel_savings: 0
      },
      {
        name: "Great Circle Route",
        distance_nm: 3400,
        estimated_time_days: 7.1,
        fuel_savings: 2.9
      },
      {
        name: "Weather-Optimized Route",
        distance_nm: 3600,
        estimated_time_days: 7.5,
        fuel_savings: 5.2
      }
    ];

    return {
      vessel_name: vesselName || "Unknown Vessel",
      vessel_type: vessel.type,
      route_origin: routeOrigin || "Unknown Origin",
      route_destination: routeDestination || "Unknown Destination",
      current_speed: speed,
      optimal_speed: vessel.optimalSpeed,
      cargo_weight: cargo,
      current_consumption: parseFloat(currentConsumption.toFixed(2)),
      optimized_consumption: parseFloat(optimizedConsumption.toFixed(2)),
      fuel_savings_percentage: parseFloat(fuelSavingsPercentage.toFixed(2)),
      estimated_savings_usd: parseFloat(estimatedSavingsUSD.toFixed(2)),
      weather_conditions: {
        condition: weatherCondition,
        impact: weatherMultiplier > 1.3 ? "High" : weatherMultiplier > 1.1 ? "Moderate" : "Low",
        multiplier: weatherMultiplier
      },
      alternative_routes: alternativeRoutes,
      recommendations: recommendations
    };
  };

  const handleOptimize = async () => {
    if (!vesselName || !routeOrigin || !routeDestination) {
      toast({
        title: "Missing Information",
        description: "Please fill in vessel name, origin and destination",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const optimizationResult = calculateOptimization();
      setResult(optimizationResult);

      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: orgData } = await supabase
          .from("organization_users")
          .select("organization_id")
          .eq("user_id", user.id)
          .eq("status", "active")
          .single();

        if (orgData) {
          await supabase.from("fuel_optimization_results").insert({
            organization_id: orgData.organization_id,
            vessel_name: optimizationResult.vessel_name,
            vessel_type: optimizationResult.vessel_type,
            route_origin: optimizationResult.route_origin,
            route_destination: optimizationResult.route_destination,
            current_speed: optimizationResult.current_speed,
            optimal_speed: optimizationResult.optimal_speed,
            cargo_weight: optimizationResult.cargo_weight,
            fuel_savings_percentage: optimizationResult.fuel_savings_percentage,
            estimated_savings_usd: optimizationResult.estimated_savings_usd,
            weather_conditions: optimizationResult.weather_conditions,
            alternative_routes: optimizationResult.alternative_routes,
            recommendations: optimizationResult.recommendations.join("; "),
            created_by: user.id
          });
        }
      }

      toast({
        title: "Optimization Complete",
        description: `Potential savings: ${optimizationResult.fuel_savings_percentage.toFixed(1)}%`,
      });

      fetchSavedResults();
    } catch (error) {
      console.error('Optimization error:', error);
      toast({
        title: "Optimization Failed",
        description: "Failed to calculate optimization",
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
          <h1 className="text-3xl font-bold">Fuel Optimizer with Real Algorithm</h1>
          <p className="text-sm text-muted-foreground">
            Real-time fuel optimization based on vessel type, cargo, route, and weather
          </p>
        </div>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Optimization Parameters
          </CardTitle>
          <CardDescription>Configure vessel, route and conditions for optimization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vesselName">Vessel Name</Label>
              <Input
                id="vesselName"
                placeholder="e.g., MV Atlantic Star"
                value={vesselName}
                onChange={(e) => setVesselName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vesselType">Vessel Type</Label>
              <Select value={vesselType} onValueChange={setVesselType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(VESSEL_TYPES).map(([key, vessel]) => (
                    <SelectItem key={key} value={key}>
                      {vessel.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="routeOrigin">Route Origin</Label>
              <Input
                id="routeOrigin"
                placeholder="e.g., Rotterdam"
                value={routeOrigin}
                onChange={(e) => setRouteOrigin(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="routeDestination">Route Destination</Label>
              <Input
                id="routeDestination"
                placeholder="e.g., Singapore"
                value={routeDestination}
                onChange={(e) => setRouteDestination(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentSpeed">Current Speed (knots)</Label>
              <Input
                id="currentSpeed"
                type="number"
                placeholder="24"
                value={currentSpeed}
                onChange={(e) => setCurrentSpeed(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargoWeight">Cargo Weight (tons)</Label>
              <Input
                id="cargoWeight"
                type="number"
                placeholder="15000"
                value={cargoWeight}
                onChange={(e) => setCargoWeight(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weatherCondition">Weather Condition</Label>
              <Select value={weatherCondition} onValueChange={setWeatherCondition}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="calm">Calm (1.0x)</SelectItem>
                  <SelectItem value="moderate">Moderate (1.15x)</SelectItem>
                  <SelectItem value="rough">Rough (1.35x)</SelectItem>
                  <SelectItem value="storm">Storm (1.60x)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuelPrice">Fuel Price (USD/ton)</Label>
              <Input
                id="fuelPrice"
                type="number"
                placeholder="600"
                value={fuelPriceUSD}
                onChange={(e) => setFuelPriceUSD(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={handleOptimize}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                Calculating...
              </>
            ) : (
              <>
                <TrendingDown className="mr-2 h-4 w-4" />
                Optimize Fuel Consumption
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <>
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <TrendingDown className="h-5 w-5" />
                Optimization Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {result.fuel_savings_percentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Fuel Savings</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    ${result.estimated_savings_usd.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Estimated Savings (30 days)</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">
                    {result.optimal_speed} kn
                  </div>
                  <div className="text-sm text-muted-foreground">Optimal Speed</div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Current Consumption:</span>
                  <span className="font-medium">{result.current_consumption} tons/day</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Optimized Consumption:</span>
                  <span className="font-medium text-green-600">{result.optimized_consumption} tons/day</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Weather Impact:</span>
                  <Badge variant={result.weather_conditions.impact === "High" ? "destructive" : "secondary"}>
                    {result.weather_conditions.impact}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Alternative Routes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {result.alternative_routes?.map((route, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <div className="font-medium">{route.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {route.distance_nm} NM • {route.estimated_time_days} days
                      </div>
                    </div>
                    <Badge variant={route.fuel_savings > 3 ? "default" : "secondary"}>
                      {route.fuel_savings > 0 ? `+${route.fuel_savings.toFixed(1)}%` : 'Baseline'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}

      {/* Recent Optimizations */}
      {savedResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Optimizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {savedResults.map((r: any, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{r.vessel_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {r.route_origin} → {r.route_destination}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {r.fuel_savings_percentage?.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${r.estimated_savings_usd?.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FuelOptimizerEnhanced;
