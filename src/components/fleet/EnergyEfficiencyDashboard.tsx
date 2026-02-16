/**
 * Energy Efficiency Dashboard - vs DNV Navigator / Verifavia
 * EEXI, CII, EU ETS compliance tracking with projections
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Leaf, TrendingDown, BarChart3, Gauge, Ship, Zap,
  AlertTriangle, Download, Target, Globe, Fuel, Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface VesselCII {
  vessel_name: string;
  imo: string;
  attained_cii: number;
  required_cii: number;
  rating: "A" | "B" | "C" | "D" | "E";
  co2_tons: number;
  transport_work: number;
  trend: "improving" | "stable" | "declining";
  eexi_compliant: boolean;
  eu_ets_allowances: number;
}

const mockFleetCII: VesselCII[] = [
  { vessel_name: "MV Nautilus Star", imo: "9876543", attained_cii: 4.2, required_cii: 5.8, rating: "A", co2_tons: 12500, transport_work: 2976190, trend: "improving", eexi_compliant: true, eu_ets_allowances: 340 },
  { vessel_name: "MV Ocean Pioneer", imo: "9876544", attained_cii: 6.1, required_cii: 6.5, rating: "C", co2_tons: 18200, transport_work: 2983607, trend: "stable", eexi_compliant: true, eu_ets_allowances: 520 },
  { vessel_name: "MV Deep Horizon", imo: "9876545", attained_cii: 7.8, required_cii: 7.0, rating: "D", co2_tons: 22100, transport_work: 2833333, trend: "declining", eexi_compliant: false, eu_ets_allowances: 680 },
  { vessel_name: "MV Atlantic Grace", imo: "9876546", attained_cii: 5.5, required_cii: 6.2, rating: "B", co2_tons: 15800, transport_work: 2872727, trend: "improving", eexi_compliant: true, eu_ets_allowances: 410 },
];

const ratingColor: Record<string, string> = {
  A: "bg-success", B: "bg-success/80", C: "bg-warning", D: "bg-warning/80", E: "bg-destructive"
};

const ratingBg: Record<string, string> = {
  A: "bg-success/20 text-success", B: "bg-success/15 text-success",
  C: "bg-warning/20 text-warning", D: "bg-warning/15 text-warning", E: "bg-destructive/20 text-destructive"
};

export function EnergyEfficiencyDashboard() {
  const [selectedYear, setSelectedYear] = useState("2026");

  const { data: vessels } = useQuery({
    queryKey: ["vessels-energy"],
    queryFn: async () => {
      const { data } = await supabase.from("vessels").select("id, name, imo_number, gross_tonnage").limit(20);
      return data || [];
    },
  });

  const fleetAvgCII = mockFleetCII.reduce((s, v) => s + v.attained_cii, 0) / mockFleetCII.length;
  const compliantCount = mockFleetCII.filter(v => v.rating !== "D" && v.rating !== "E").length;
  const totalCO2 = mockFleetCII.reduce((s, v) => s + v.co2_tons, 0);
  const totalETS = mockFleetCII.reduce((s, v) => s + v.eu_ets_allowances, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Leaf className="h-6 w-6 text-success" />
            Energy Efficiency & Decarbonization
          </h1>
          <p className="text-muted-foreground">EEXI, CII Rating, EU ETS & IMO 2030/2050 compliance</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["2024", "2025", "2026"].map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> Export</Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Gauge, label: "Fleet Avg CII", value: fleetAvgCII.toFixed(1), sub: "gCO₂/dwt·nm", color: "text-info" },
          { icon: Ship, label: "CII Compliant", value: `${compliantCount}/${mockFleetCII.length}`, sub: "vessels ≤C rating", color: "text-success" },
          { icon: Globe, label: "Total CO₂", value: `${(totalCO2 / 1000).toFixed(1)}k t`, sub: `Year ${selectedYear}`, color: "text-warning" },
          { icon: Target, label: "EU ETS Cost", value: `€${(totalETS * 85).toLocaleString()}`, sub: `${totalETS} allowances`, color: "text-info" },
        ].map((item, i) => (
          <Card key={i} className="border-border/50 bg-card/80 backdrop-blur">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-1">
                <item.icon className={`h-4 w-4 ${item.color}`} />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
              <p className="text-xl font-bold">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="cii" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cii">CII Ratings</TabsTrigger>
          <TabsTrigger value="eexi">EEXI Compliance</TabsTrigger>
          <TabsTrigger value="ets">EU ETS</TabsTrigger>
          <TabsTrigger value="projections">IMO 2030/2050</TabsTrigger>
        </TabsList>

        <TabsContent value="cii" className="space-y-4">
          <div className="grid gap-3">
            {mockFleetCII.map((vessel, i) => (
              <Card key={i} className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${ratingBg[vessel.rating]}`}>
                      {vessel.rating}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{vessel.vessel_name}</p>
                        <Badge variant="outline" className="text-[10px]">IMO {vessel.imo}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span>Attained: {vessel.attained_cii}</span>
                        <span>Required: {vessel.required_cii}</span>
                        <span>{vessel.co2_tons.toLocaleString()} t CO₂</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        {vessel.trend === "improving" ? (
                          <TrendingDown className="h-4 w-4 text-success" />
                        ) : vessel.trend === "declining" ? (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        ) : (
                          <Activity className="h-4 w-4 text-warning" />
                        )}
                        <span className="text-xs capitalize">{vessel.trend}</span>
                      </div>
                      <Progress value={Math.min(100, (vessel.required_cii / vessel.attained_cii) * 100)} className="h-1.5 w-24 mt-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="eexi" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardHeader><CardTitle className="text-sm">EEXI Compliance Status</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {mockFleetCII.map((v, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                    <span className="text-sm">{v.vessel_name}</span>
                    <Badge className={v.eexi_compliant ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}>
                      {v.eexi_compliant ? "Compliant" : "Non-Compliant"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardHeader><CardTitle className="text-sm">Corrective Measures</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { measure: "Engine Power Limitation (EPL)", saving: "12%", cost: "$45,000", status: "Applied" },
                  { measure: "Shaft Generator Installation", saving: "8%", cost: "$180,000", status: "Planned" },
                  { measure: "Hull Coating Optimization", saving: "5%", cost: "$120,000", status: "Pending" },
                  { measure: "Propeller Boss Cap Fins", saving: "3%", cost: "$25,000", status: "Applied" },
                ].map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-background/50 text-sm">
                    <div>
                      <p className="font-medium">{m.measure}</p>
                      <p className="text-xs text-muted-foreground">Saving: {m.saving} • Cost: {m.cost}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{m.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ets" className="space-y-4">
          <Card className="border-border/50 bg-card/80 backdrop-blur">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4" /> EU ETS Exposure</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockFleetCII.map((v, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-background/50">
                    <Ship className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{v.vessel_name}</p>
                      <p className="text-xs text-muted-foreground">{v.eu_ets_allowances} allowances required</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-warning">€{(v.eu_ets_allowances * 85).toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">at €85/tCO₂</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <span className="font-medium">Total Fleet EU ETS Exposure</span>
                  <span className="text-lg font-bold text-warning">€{(totalETS * 85).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projections" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardHeader><CardTitle className="text-sm">IMO GHG Strategy Targets</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { year: "2030", target: "-40% CI", progress: 65, status: "On Track" },
                  { year: "2040", target: "-70% CI", progress: 35, status: "Needs Action" },
                  { year: "2050", target: "Net Zero", progress: 15, status: "Planning" },
                ].map((t, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">IMO {t.year}: {t.target}</span>
                      <Badge variant="outline" className="text-[10px]">{t.status}</Badge>
                    </div>
                    <Progress value={t.progress} className="h-2" />
                    <p className="text-[10px] text-muted-foreground text-right">{t.progress}% progress</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardHeader><CardTitle className="text-sm">Alternative Fuels Roadmap</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { fuel: "LNG", readiness: 80, viability: "High", timeline: "2024-2030" },
                  { fuel: "Methanol (Green)", readiness: 55, viability: "Medium", timeline: "2026-2035" },
                  { fuel: "Ammonia", readiness: 30, viability: "Medium", timeline: "2028-2040" },
                  { fuel: "Hydrogen", readiness: 15, viability: "Low", timeline: "2035-2050" },
                ].map((f, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{f.fuel}</span>
                      <span className="text-xs text-muted-foreground">{f.timeline}</span>
                    </div>
                    <Progress value={f.readiness} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
