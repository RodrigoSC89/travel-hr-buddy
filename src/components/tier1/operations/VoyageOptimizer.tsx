/**
 * Voyage Optimizer - Tier-1 Operations Component
 * Based on: Veson IMOS, StormGeo, DTN
 * Features: Route optimization, weather routing, fuel efficiency, ETA predictions
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Navigation, Ship, Fuel, Clock, MapPin, CloudRain, Wind, 
  Waves, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  Route, Zap, Target, DollarSign, Leaf, Brain, RefreshCw,
  ArrowRight, Settings2, Play
} from "lucide-react";

interface RouteOption {
  id: string;
  name: string;
  distance: number;
  duration: number;
  fuelConsumption: number;
  cost: number;
  co2Emissions: number;
  weatherRisk: "low" | "moderate" | "high";
  recommended: boolean;
  waypoints: { name: string; eta: Date }[];
  savings?: {
    fuel: number;
    time: number;
    cost: number;
  };
}

interface WeatherWindow {
  startDate: Date;
  endDate: Date;
  conditions: string;
  windSpeed: number;
  waveHeight: number;
  recommendation: string;
}

const routeOptions: RouteOption[] = [
  {
    id: "OPT1",
    name: "Weather-Optimized Route",
    distance: 4250,
    duration: 168,
    fuelConsumption: 892,
    cost: 485000,
    co2Emissions: 2780,
    weatherRisk: "low",
    recommended: true,
    waypoints: [
      { name: "Rotterdam", eta: new Date("2025-02-06T08:00:00") },
      { name: "Gibraltar", eta: new Date("2025-02-09T14:00:00") },
      { name: "Suez Canal", eta: new Date("2025-02-12T06:00:00") },
      { name: "Singapore", eta: new Date("2025-02-13T08:00:00") }
    ],
    savings: { fuel: 45, time: 8, cost: 32000 }
  },
  {
    id: "OPT2",
    name: "Fastest Route",
    distance: 4120,
    duration: 156,
    fuelConsumption: 985,
    cost: 520000,
    co2Emissions: 3070,
    weatherRisk: "moderate",
    recommended: false,
    waypoints: [
      { name: "Rotterdam", eta: new Date("2025-02-06T08:00:00") },
      { name: "Gibraltar", eta: new Date("2025-02-09T02:00:00") },
      { name: "Suez Canal", eta: new Date("2025-02-11T18:00:00") },
      { name: "Singapore", eta: new Date("2025-02-12T20:00:00") }
    ]
  },
  {
    id: "OPT3",
    name: "Eco Route",
    distance: 4380,
    duration: 192,
    fuelConsumption: 815,
    cost: 445000,
    co2Emissions: 2540,
    weatherRisk: "low",
    recommended: false,
    waypoints: [
      { name: "Rotterdam", eta: new Date("2025-02-06T08:00:00") },
      { name: "Gibraltar", eta: new Date("2025-02-10T06:00:00") },
      { name: "Suez Canal", eta: new Date("2025-02-13T12:00:00") },
      { name: "Singapore", eta: new Date("2025-02-14T08:00:00") }
    ],
    savings: { fuel: 77, time: -24, cost: 40000 }
  }
];

const weatherWindows: WeatherWindow[] = [
  {
    startDate: new Date("2025-02-06T00:00:00"),
    endDate: new Date("2025-02-08T00:00:00"),
    conditions: "Favorable",
    windSpeed: 12,
    waveHeight: 1.5,
    recommendation: "Optimal departure window"
  },
  {
    startDate: new Date("2025-02-08T00:00:00"),
    endDate: new Date("2025-02-10T00:00:00"),
    conditions: "Moderate",
    windSpeed: 22,
    waveHeight: 3.2,
    recommendation: "Reduce speed through Bay of Biscay"
  },
  {
    startDate: new Date("2025-02-10T00:00:00"),
    endDate: new Date("2025-02-14T00:00:00"),
    conditions: "Favorable",
    windSpeed: 8,
    waveHeight: 0.8,
    recommendation: "Mediterranean conditions excellent"
  }
];

export function VoyageOptimizer() {
  const [activeTab, setActiveTab] = useState("routes");
  const [selectedRoute, setSelectedRoute] = useState<string>("OPT1");
  const [speedFactor, setSpeedFactor] = useState([85]);
  const [weatherRouting, setWeatherRouting] = useState(true);
  const [ecoMode, setEcoMode] = useState(false);

  const getWeatherRiskBadge = (risk: string) => {
    switch (risk) {
      case "low":
        return <Badge className="bg-success/10 text-success">Low Risk</Badge>;
      case "moderate":
        return <Badge className="bg-warning/10 text-warning">Moderate Risk</Badge>;
      case "high":
        return <Badge className="bg-destructive/10 text-destructive">High Risk</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Route className="h-6 w-6 text-primary" />
            Voyage Optimizer
          </h2>
          <p className="text-muted-foreground">
            AI-powered route optimization with weather routing and fuel efficiency
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Recalculate
          </Button>
          <Button size="sm">
            <Play className="h-4 w-4 mr-2" />
            Apply Route
          </Button>
        </div>
      </div>

      {/* Voyage Summary */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Ship className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">MV Atlantic Explorer</h3>
                <p className="text-sm text-muted-foreground">Rotterdam → Singapore</p>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-2xl font-bold">4,250</p>
                <p className="text-xs text-muted-foreground">Nautical Miles</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">7</p>
                <p className="text-xs text-muted-foreground">Days</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-success">$32K</p>
                <p className="text-xs text-muted-foreground">Potential Savings</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Optimization Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <Label>Speed Factor: {speedFactor}%</Label>
              <Slider
                value={speedFactor}
                onValueChange={setSpeedFactor}
                min={70}
                max={100}
                step={5}
              />
              <p className="text-xs text-muted-foreground">
                Lower speed = Less fuel consumption, longer voyage
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="weather-routing">Weather Routing</Label>
                <Switch
                  id="weather-routing"
                  checked={weatherRouting}
                  onCheckedChange={setWeatherRouting}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Optimize route based on weather forecasts
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="eco-mode">Eco Mode</Label>
                <Switch
                  id="eco-mode"
                  checked={ecoMode}
                  onCheckedChange={setEcoMode}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Prioritize CO2 emissions reduction
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="routes">Route Options</TabsTrigger>
          <TabsTrigger value="weather">Weather Windows</TabsTrigger>
          <TabsTrigger value="fuel">Fuel Analysis</TabsTrigger>
          <TabsTrigger value="emissions">Emissions</TabsTrigger>
        </TabsList>

        <TabsContent value="routes" className="mt-4">
          <div className="grid gap-4">
            {routeOptions.map((route) => (
              <Card 
                key={route.id}
                className={`cursor-pointer transition-all ${
                  selectedRoute === route.id 
                    ? "ring-2 ring-primary border-primary" 
                    : "hover:shadow-md"
                }`}
                onClick={() => setSelectedRoute(route.id)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{route.name}</h4>
                        {route.recommended && (
                          <Badge className="bg-primary/10 text-primary">
                            <Brain className="h-3 w-3 mr-1" />
                            AI Recommended
                          </Badge>
                        )}
                        {getWeatherRiskBadge(route.weatherRisk)}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <Navigation className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{route.distance.toLocaleString()} nm</p>
                            <p className="text-xs text-muted-foreground">Distance</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{Math.floor(route.duration / 24)}d {route.duration % 24}h</p>
                            <p className="text-xs text-muted-foreground">Duration</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Fuel className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{route.fuelConsumption} MT</p>
                            <p className="text-xs text-muted-foreground">Fuel</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">${(route.cost / 1000).toFixed(0)}K</p>
                            <p className="text-xs text-muted-foreground">Cost</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Leaf className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{route.co2Emissions} t CO₂</p>
                            <p className="text-xs text-muted-foreground">Emissions</p>
                          </div>
                        </div>
                      </div>

                      {/* Waypoints */}
                      <div className="flex items-center gap-2 text-xs overflow-x-auto pb-2">
                        {route.waypoints.map((wp, idx) => (
                          <React.Fragment key={wp.name}>
                            <div className="flex items-center gap-1 whitespace-nowrap">
                              <MapPin className="h-3 w-3 text-primary" />
                              <span className="font-medium">{wp.name}</span>
                              <span className="text-muted-foreground">({formatDate(wp.eta)})</span>
                            </div>
                            {idx < route.waypoints.length - 1 && (
                              <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* Savings */}
                    {route.savings && (
                      <div className="text-right bg-success/5 dark:bg-success/10 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Savings vs. Standard</p>
                        <div className="space-y-1">
                          <div className="flex items-center justify-end gap-1 text-sm">
                            <TrendingDown className="h-3 w-3 text-success" />
                            <span className="font-medium text-success">{route.savings.fuel} MT fuel</span>
                          </div>
                          <div className="flex items-center justify-end gap-1 text-sm">
                            {route.savings.time > 0 ? (
                              <>
                                <TrendingDown className="h-3 w-3 text-success" />
                                <span className="font-medium text-success">{route.savings.time}h faster</span>
                              </>
                            ) : (
                              <>
                                <TrendingUp className="h-3 w-3 text-warning" />
                                <span className="font-medium text-warning">{Math.abs(route.savings.time)}h longer</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center justify-end gap-1 text-sm">
                            <DollarSign className="h-3 w-3 text-success" />
                            <span className="font-medium text-success">${route.savings.cost.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="weather" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CloudRain className="h-5 w-5" />
                Weather Windows
              </CardTitle>
              <CardDescription>Optimal departure and transit windows based on weather forecasts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weatherWindows.map((window, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      window.conditions === "Favorable" 
                        ? "bg-success/5 border-success/20 dark:bg-success/10" 
                        : "bg-warning/5 border-warning/20 dark:bg-warning/10"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          window.conditions === "Favorable" 
                            ? "bg-success/10" 
                            : "bg-warning/10"
                        }`}>
                          {window.conditions === "Favorable" ? (
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-warning" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold">{window.conditions} Conditions</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(window.startDate)} - {formatDate(window.endDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Wind className="h-4 w-4 text-muted-foreground" />
                          <span>{window.windSpeed} kts</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Waves className="h-4 w-4 text-muted-foreground" />
                          <span>{window.waveHeight}m</span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-sm">
                      <strong>Recommendation:</strong> {window.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fuel" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fuel className="h-5 w-5" />
                Fuel Consumption Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">Consumption by Route</h4>
                  <div className="space-y-4">
                    {routeOptions.map((route) => (
                      <div key={route.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{route.name}</span>
                          <span className="font-medium">{route.fuelConsumption} MT</span>
                        </div>
                        <Progress 
                          value={(route.fuelConsumption / 1000) * 100} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Speed vs Fuel Trade-off</h4>
                  <div className="space-y-3">
                    {[
                      { speed: "12 kts (Eco)", consumption: "35 MT/day", daily: 420 },
                      { speed: "14 kts (Optimal)", consumption: "48 MT/day", daily: 576 },
                      { speed: "16 kts (Fast)", consumption: "65 MT/day", daily: 780 }
                    ].map((item) => (
                      <div key={item.speed} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium">{item.speed}</p>
                          <p className="text-xs text-muted-foreground">{item.consumption}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${item.daily}/day</p>
                          <p className="text-xs text-muted-foreground">Fuel cost</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emissions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5" />
                Emissions Analysis
              </CardTitle>
              <CardDescription>CO2 emissions comparison and CII rating impact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">CO2 Emissions by Route</h4>
                  <div className="space-y-4">
                    {routeOptions.map((route) => (
                      <div key={route.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{route.name}</span>
                          <span className="font-medium">{route.co2Emissions} t CO₂</span>
                        </div>
                        <Progress 
                          value={(route.co2Emissions / 3500) * 100} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">CII Impact</h4>
                  <div className="p-4 rounded-lg bg-success/5 dark:bg-success/10 border border-success/20">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">Current CII Rating</span>
                      <Badge className="bg-success text-primary-foreground text-lg px-3">B</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Projected After Voyage</span>
                      <Badge className="bg-success text-primary-foreground text-lg px-3">B</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Weather-optimized route maintains current CII rating
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
