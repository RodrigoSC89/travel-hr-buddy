/**
 * Bunker Optimization Engine - vs Integr8 / BunkerEx
 * Advanced fuel analytics, procurement optimization, and ROB forecasting
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Fuel, TrendingDown, TrendingUp, DollarSign, BarChart3,
  MapPin, AlertTriangle, Zap, Ship, Globe, Download, Calculator
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface BunkerPort {
  port: string;
  country: string;
  vlsfo_price: number;
  hsfo_price: number;
  mgo_price: number;
  availability: "high" | "medium" | "low";
  quality_rating: number;
  lead_time_days: number;
}

const bunkerPorts: BunkerPort[] = [
  { port: "Singapore", country: "SG", vlsfo_price: 580, hsfo_price: 420, mgo_price: 750, availability: "high", quality_rating: 4.8, lead_time_days: 1 },
  { port: "Fujairah", country: "AE", vlsfo_price: 560, hsfo_price: 405, mgo_price: 720, availability: "high", quality_rating: 4.5, lead_time_days: 2 },
  { port: "Rotterdam", country: "NL", vlsfo_price: 610, hsfo_price: 440, mgo_price: 780, availability: "high", quality_rating: 4.9, lead_time_days: 1 },
  { port: "Houston", country: "US", vlsfo_price: 595, hsfo_price: 430, mgo_price: 760, availability: "medium", quality_rating: 4.6, lead_time_days: 2 },
  { port: "Piraeus", country: "GR", vlsfo_price: 625, hsfo_price: 445, mgo_price: 790, availability: "medium", quality_rating: 4.3, lead_time_days: 3 },
];

export function BunkerOptimizationEngine() {
  const [selectedFuel, setSelectedFuel] = useState("vlsfo");

  const { data: vessels } = useQuery({
    queryKey: ["vessels-bunker-opt"],
    queryFn: async () => {
      const { data } = await supabase.from("vessels").select("id, name").limit(20);
      return data || [];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Fuel className="h-6 w-6 text-warning" />
            Bunker Optimization Engine
          </h1>
          <p className="text-muted-foreground">AI-powered fuel procurement, pricing intelligence & ROB forecasting</p>
        </div>
        <Badge variant="outline" className="border-warning/30 text-warning">vs Integr8 / BunkerEx</Badge>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: "Avg VLSFO Price", value: "$594/MT", trend: "-2.3%", up: false },
          { icon: TrendingDown, label: "Savings YTD", value: "$185,000", trend: "+12%", up: true },
          { icon: Ship, label: "Fleet ROB", value: "4,250 MT", trend: "21 days", up: true },
          { icon: AlertTriangle, label: "Low Stock Vessels", value: "2", trend: "< 7 days", up: false },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-border/50 bg-card/80 backdrop-blur">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-1">
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
              </div>
              <p className="text-xl font-bold">{kpi.value}</p>
              <div className="flex items-center gap-1 text-xs">
                {kpi.up ? <TrendingUp className="h-3 w-3 text-success" /> : <TrendingDown className="h-3 w-3 text-destructive" />}
                <span className="text-muted-foreground">{kpi.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="pricing" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pricing">Market Pricing</TabsTrigger>
          <TabsTrigger value="rob">ROB Forecast</TabsTrigger>
          <TabsTrigger value="procurement">Procurement</TabsTrigger>
          <TabsTrigger value="quality">Quality & Claims</TabsTrigger>
        </TabsList>

        <TabsContent value="pricing" className="space-y-4">
          <Card className="border-border/50 bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="h-4 w-4" /> Global Bunker Price Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-7 gap-2 text-xs font-medium text-muted-foreground border-b border-border/50 pb-2">
                  <span className="col-span-2">Port</span>
                  <span>VLSFO</span>
                  <span>HSFO</span>
                  <span>MGO</span>
                  <span>Availability</span>
                  <span>Quality</span>
                </div>
                {bunkerPorts.map((port) => {
                  const isLowest = port.vlsfo_price === Math.min(...bunkerPorts.map(p => p.vlsfo_price));
                  return (
                    <div key={port.port} className={`grid grid-cols-7 gap-2 text-sm items-center p-2 rounded ${isLowest ? "bg-success/10 border border-success/20" : "bg-background/50"}`}>
                      <div className="col-span-2 flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{port.port}</span>
                        <span className="text-xs text-muted-foreground">{port.country}</span>
                      </div>
                      <span className={isLowest ? "text-success font-bold" : ""}>${port.vlsfo_price}</span>
                      <span>${port.hsfo_price}</span>
                      <span>${port.mgo_price}</span>
                      <Badge variant="outline" className={`text-[10px] ${
                        port.availability === "high" ? "text-success" : port.availability === "medium" ? "text-warning" : "text-destructive"
                      }`}>
                        {port.availability}
                      </Badge>
                      <span className="text-xs">⭐ {port.quality_rating}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rob" className="space-y-4">
          <div className="grid gap-3">
          {(vessels || []).slice(0, 4).map((vessel, i) => {
              // Deterministic ROB based on vessel index
              const robValues = [1850, 1420, 980, 650];
              const consumptionValues = [42, 38, 45, 35];
              const rob = robValues[i] || 1200;
              const consumption = consumptionValues[i] || 40;
              const capacity = 2500;
              const daysLeft = Math.round(rob / consumption);
              const pct = (rob / capacity) * 100;
              return (
                <Card key={vessel.id} className="border-border/50 bg-card/80 backdrop-blur">
                  <CardContent className="py-3">
                    <div className="flex items-center gap-4">
                      <Ship className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{vessel.name}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span>ROB: {rob} MT</span>
                          <span>Consumption: ~{consumption} MT/day</span>
                          <span className={daysLeft < 7 ? "text-destructive font-medium" : daysLeft < 14 ? "text-warning" : "text-success"}>
                            {daysLeft} days remaining
                          </span>
                        </div>
                        <Progress value={pct} className="h-1.5 mt-2" />
                      </div>
                      {daysLeft < 7 && (
                        <Button size="sm" variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" /> Order Now
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="procurement" className="space-y-4">
          <Card className="border-border/50 bg-card/80 backdrop-blur">
            <CardHeader><CardTitle className="text-sm">Bunker Enquiry Calculator</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Quantity (MT)</label>
                  <Input type="number" defaultValue={500} className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Fuel Grade</label>
                  <Input defaultValue="VLSFO 0.5%S" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Delivery Window</label>
                  <Input type="date" className="bg-background/50" />
                </div>
              </div>
              <Button className="mt-4 bg-warning hover:bg-warning/90 text-warning-foreground">
                <Calculator className="h-4 w-4 mr-2" /> Get Best Price
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card className="border-border/50 bg-card/80 backdrop-blur">
            <CardHeader><CardTitle className="text-sm">Fuel Quality Monitoring (ISO 8217)</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { param: "Viscosity @ 50°C", spec: "≤ 380 cSt", result: "342 cSt", pass: true },
                { param: "Density @ 15°C", spec: "≤ 991 kg/m³", result: "985.2 kg/m³", pass: true },
                { param: "Sulphur Content", spec: "≤ 0.50%", result: "0.47%", pass: true },
                { param: "Cat Fines (Al+Si)", spec: "≤ 60 mg/kg", result: "55 mg/kg", pass: true },
                { param: "Water Content", spec: "≤ 0.50%", result: "0.62%", pass: false },
              ].map((q) => (
                <div key={q.param} className="flex items-center justify-between p-2 rounded bg-background/50">
                  <span className="text-sm">{q.param}</span>
                  <span className="text-xs text-muted-foreground">{q.spec}</span>
                  <span className="text-sm font-medium">{q.result}</span>
                  <Badge className={q.pass ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}>
                    {q.pass ? "PASS" : "FAIL"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
