/**
 * Vessel KPI Dashboard - vs Cloud Fleet Manager (CFM)
 * Per-vessel performance KPIs with fleet comparison
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Ship, Fuel, DollarSign, Clock, Shield, Users,
  TrendingUp, TrendingDown, AlertTriangle, BarChart3,
  Anchor, Activity, Target, Wrench, Leaf
} from "lucide-react";
import { toast } from "sonner";

interface VesselKPI {
  vessel: string;
  vesselType: string;
  flag: string;
  kpis: {
    utilization: number; // %
    availableDays: number;
    offHireDays: number;
    opexPerDay: number; // USD
    opexBudgetVariance: number; // %
    fuelConsumption: number; // MT/day
    fuelEfficiency: number; // % vs baseline
    complianceScore: number; // %
    openDefects: number;
    overdueMaintenace: number;
    crewManning: number; // %
    safetyScore: number; // LTIF
    carbonIntensity: number; // CII grade
    ciiRating: string; // A-E
    voyagesCompleted: number;
    revenuePerDay: number; // TCE
  };
  trend: "improving" | "stable" | "declining";
}

const VESSELS: VesselKPI[] = [
  {
    vessel: "MV Atlantic Pioneer", vesselType: "AHTS", flag: "🇳🇴",
    trend: "improving",
    kpis: {
      utilization: 92, availableDays: 330, offHireDays: 2.5,
      opexPerDay: 12500, opexBudgetVariance: -3.2,
      fuelConsumption: 18.5, fuelEfficiency: 94,
      complianceScore: 97, openDefects: 3, overdueMaintenace: 1,
      crewManning: 92, safetyScore: 0.8,
      carbonIntensity: 8.2, ciiRating: "B",
      voyagesCompleted: 12, revenuePerDay: 18500
    }
  },
  {
    vessel: "MV Pacific Guardian", vesselType: "PSV", flag: "🇧🇷",
    trend: "stable",
    kpis: {
      utilization: 88, availableDays: 320, offHireDays: 5,
      opexPerDay: 9800, opexBudgetVariance: 1.5,
      fuelConsumption: 12.3, fuelEfficiency: 91,
      complianceScore: 95, openDefects: 5, overdueMaintenace: 2,
      crewManning: 100, safetyScore: 1.2,
      carbonIntensity: 6.5, ciiRating: "A",
      voyagesCompleted: 18, revenuePerDay: 15200
    }
  },
  {
    vessel: "MV Nordic Star", vesselType: "AHTS", flag: "🇧🇷",
    trend: "declining",
    kpis: {
      utilization: 78, availableDays: 285, offHireDays: 12,
      opexPerDay: 14200, opexBudgetVariance: 8.5,
      fuelConsumption: 22.1, fuelEfficiency: 82,
      complianceScore: 88, openDefects: 9, overdueMaintenace: 4,
      crewManning: 85, safetyScore: 2.1,
      carbonIntensity: 10.5, ciiRating: "C",
      voyagesCompleted: 8, revenuePerDay: 15800
    }
  },
];

function getScoreColor(value: number, thresholds: [number, number] = [80, 90]) {
  if (value >= thresholds[1]) return "text-success";
  if (value >= thresholds[0]) return "text-warning";
  return "text-destructive";
}

function getCIIColor(rating: string) {
  const colors: Record<string, string> = { A: "bg-success", B: "bg-success/80", C: "bg-warning", D: "bg-warning/80", E: "bg-destructive" };
  return colors[rating] || "bg-muted";
}

export function VesselKPIDashboard() {
  const [selectedVessel, setSelectedVessel] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

  const displayVessels = selectedVessel === "all" ? VESSELS : VESSELS.filter(v => v.vessel === selectedVessel);
  const fleetAvg = {
    utilization: Math.round(VESSELS.reduce((s, v) => s + v.kpis.utilization, 0) / VESSELS.length),
    opex: Math.round(VESSELS.reduce((s, v) => s + v.kpis.opexPerDay, 0) / VESSELS.length),
    compliance: Math.round(VESSELS.reduce((s, v) => s + v.kpis.complianceScore, 0) / VESSELS.length),
    tce: Math.round(VESSELS.reduce((s, v) => s + v.kpis.revenuePerDay, 0) / VESSELS.length),
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-primary" />
            Vessel KPI Dashboard
          </h1>
          <p className="text-muted-foreground">Per-vessel performance • Fleet comparison • OPEX tracking • CII ratings</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedVessel} onValueChange={setSelectedVessel}>
            <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vessels</SelectItem>
              {VESSELS.map(v => <SelectItem key={v.vessel} value={v.vessel}>{v.vessel}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => toast.success("KPI report exported to PDF")}>Export</Button>
        </div>
      </div>

      {/* Fleet Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><Activity className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-2xl font-bold">{fleetAvg.utilization}%</p><p className="text-xs text-muted-foreground">Fleet Utilization</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><DollarSign className="h-5 w-5 mx-auto text-success mb-1" /><p className="text-2xl font-bold">${fleetAvg.opex.toLocaleString()}</p><p className="text-xs text-muted-foreground">Avg OPEX/Day</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Shield className="h-5 w-5 mx-auto text-info mb-1" /><p className="text-2xl font-bold">{fleetAvg.compliance}%</p><p className="text-xs text-muted-foreground">Compliance Score</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><TrendingUp className="h-5 w-5 mx-auto text-accent-foreground mb-1" /><p className="text-2xl font-bold">${fleetAvg.tce.toLocaleString()}</p><p className="text-xs text-muted-foreground">Avg TCE/Day</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="commercial">Commercial</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="esg">ESG & Safety</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {displayVessels.map(v => (
            <Card key={v.vessel}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    {v.flag} {v.vessel}
                    <Badge variant="outline">{v.vesselType}</Badge>
                    {v.trend === "improving" && <TrendingUp className="h-4 w-4 text-success" />}
                    {v.trend === "declining" && <TrendingDown className="h-4 w-4 text-destructive" />}
                  </CardTitle>
                  <div className={`w-8 h-8 rounded-full ${getCIIColor(v.kpis.ciiRating)} text-white flex items-center justify-center font-bold text-sm`}>
                    {v.kpis.ciiRating}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="text-center p-2 rounded bg-muted/50">
                    <p className={`text-lg font-bold ${getScoreColor(v.kpis.utilization)}`}>{v.kpis.utilization}%</p>
                    <p className="text-xs text-muted-foreground">Utilization</p>
                  </div>
                  <div className="text-center p-2 rounded bg-muted/50">
                    <p className="text-lg font-bold">${v.kpis.revenuePerDay.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">TCE/Day</p>
                  </div>
                  <div className="text-center p-2 rounded bg-muted/50">
                    <p className="text-lg font-bold">${v.kpis.opexPerDay.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">OPEX/Day</p>
                  </div>
                  <div className="text-center p-2 rounded bg-muted/50">
                    <p className={`text-lg font-bold ${getScoreColor(v.kpis.complianceScore)}`}>{v.kpis.complianceScore}%</p>
                    <p className="text-xs text-muted-foreground">Compliance</p>
                  </div>
                  <div className="text-center p-2 rounded bg-muted/50">
                    <p className={`text-lg font-bold ${getScoreColor(v.kpis.crewManning)}`}>{v.kpis.crewManning}%</p>
                    <p className="text-xs text-muted-foreground">Manning</p>
                  </div>
                  <div className="text-center p-2 rounded bg-muted/50">
                    <p className="text-lg font-bold">{v.kpis.fuelConsumption} MT</p>
                    <p className="text-xs text-muted-foreground">Fuel/Day</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="commercial" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Revenue & Cost Comparison</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {VESSELS.map(v => {
                const margin = v.kpis.revenuePerDay - v.kpis.opexPerDay;
                return (
                  <div key={v.vessel} className="space-y-2">
                    <div className="flex justify-between"><span className="font-medium">{v.flag} {v.vessel}</span><span className="font-bold text-success">Margin: ${margin.toLocaleString()}/day</span></div>
                    <div className="flex gap-2 items-center">
                      <span className="text-xs w-16 text-right">Revenue</span>
                      <div className="flex-1 bg-muted rounded-full h-4 relative overflow-hidden">
                        <div className="bg-success h-full rounded-full" style={{ width: `${(v.kpis.revenuePerDay / 25000) * 100}%` }} />
                      </div>
                      <span className="text-xs w-20">${v.kpis.revenuePerDay.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="text-xs w-16 text-right">OPEX</span>
                      <div className="flex-1 bg-muted rounded-full h-4 relative overflow-hidden">
                        <div className="bg-warning h-full rounded-full" style={{ width: `${(v.kpis.opexPerDay / 25000) * 100}%` }} />
                      </div>
                      <span className="text-xs w-20">${v.kpis.opexPerDay.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Technical Performance</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {VESSELS.map(v => (
                <div key={v.vessel} className="p-4 rounded-lg bg-muted/50 border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">{v.flag} {v.vessel}</span>
                    <Badge variant={v.kpis.overdueMaintenace === 0 ? "default" : "destructive"}>
                      {v.kpis.overdueMaintenace} overdue tasks
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div><p className="text-sm font-bold">{v.kpis.openDefects}</p><p className="text-xs text-muted-foreground">Open Defects</p></div>
                    <div><p className="text-sm font-bold">{v.kpis.fuelEfficiency}%</p><p className="text-xs text-muted-foreground">Fuel Efficiency</p></div>
                    <div><p className="text-sm font-bold">{v.kpis.offHireDays}d</p><p className="text-xs text-muted-foreground">Off-Hire</p></div>
                    <div><p className="text-sm font-bold">{v.kpis.availableDays}d</p><p className="text-xs text-muted-foreground">Available Days</p></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="esg" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">ESG & Safety Scorecard</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {VESSELS.map(v => (
                <div key={v.vessel} className="p-4 rounded-lg bg-muted/50 border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">{v.flag} {v.vessel}</span>
                    <div className={`px-3 py-1 rounded-full text-white text-sm font-bold ${getCIIColor(v.kpis.ciiRating)}`}>
                      CII: {v.kpis.ciiRating}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div><p className="text-sm font-bold">{v.kpis.carbonIntensity}</p><p className="text-xs text-muted-foreground">CO₂ g/nm</p></div>
                    <div><p className={`text-sm font-bold ${v.kpis.safetyScore <= 1.0 ? "text-success" : "text-warning"}`}>{v.kpis.safetyScore}</p><p className="text-xs text-muted-foreground">LTIF</p></div>
                    <div><p className="text-sm font-bold">{v.kpis.complianceScore}%</p><p className="text-xs text-muted-foreground">Compliance</p></div>
                    <div><p className="text-sm font-bold">{v.kpis.fuelConsumption} MT</p><p className="text-xs text-muted-foreground">Fuel/Day</p></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default VesselKPIDashboard;
