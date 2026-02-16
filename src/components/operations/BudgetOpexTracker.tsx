/**
 * 📊 BUDGET vs ACTUAL OPEX TRACKER - vs Cloud Fleet Manager
 * Fleet-wide OPEX monitoring, variance analysis, budget planning
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, TrendingDown, BarChart3, AlertTriangle, Download, Ship } from "lucide-react";
import { toast } from "sonner";

interface OpexCategory {
  category: string;
  budget: number;
  actual: number;
  variance: number;
  variancePercent: number;
}

interface VesselOpex {
  vessel: string;
  vessel_type: string;
  daily_budget: number;
  daily_actual: number;
  categories: OpexCategory[];
}

const VESSELS_OPEX: VesselOpex[] = [
  {
    vessel: "MV Pacific Explorer", vessel_type: "Suezmax", daily_budget: 8500, daily_actual: 8120,
    categories: [
      { category: "Crew Wages", budget: 145000, actual: 142000, variance: 3000, variancePercent: 2.1 },
      { category: "Stores & Spares", budget: 28000, actual: 31500, variance: -3500, variancePercent: -12.5 },
      { category: "Repairs & Maintenance", budget: 35000, actual: 29000, variance: 6000, variancePercent: 17.1 },
      { category: "Insurance", budget: 42000, actual: 42000, variance: 0, variancePercent: 0 },
      { category: "Lubricants", budget: 18000, actual: 19200, variance: -1200, variancePercent: -6.7 },
      { category: "Administration", budget: 12000, actual: 11800, variance: 200, variancePercent: 1.7 },
    ]
  },
  {
    vessel: "MV Atlantic Star", vessel_type: "Aframax", daily_budget: 7800, daily_actual: 8400,
    categories: [
      { category: "Crew Wages", budget: 132000, actual: 138000, variance: -6000, variancePercent: -4.5 },
      { category: "Stores & Spares", budget: 24000, actual: 28000, variance: -4000, variancePercent: -16.7 },
      { category: "Repairs & Maintenance", budget: 30000, actual: 42000, variance: -12000, variancePercent: -40.0 },
      { category: "Insurance", budget: 38000, actual: 38000, variance: 0, variancePercent: 0 },
      { category: "Lubricants", budget: 15000, actual: 14500, variance: 500, variancePercent: 3.3 },
      { category: "Administration", budget: 10000, actual: 9800, variance: 200, variancePercent: 2.0 },
    ]
  },
  {
    vessel: "MV Nordic Wind", vessel_type: "VLCC", daily_budget: 11200, daily_actual: 10800,
    categories: [
      { category: "Crew Wages", budget: 185000, actual: 178000, variance: 7000, variancePercent: 3.8 },
      { category: "Stores & Spares", budget: 35000, actual: 33000, variance: 2000, variancePercent: 5.7 },
      { category: "Repairs & Maintenance", budget: 48000, actual: 45000, variance: 3000, variancePercent: 6.3 },
      { category: "Insurance", budget: 58000, actual: 58000, variance: 0, variancePercent: 0 },
      { category: "Lubricants", budget: 22000, actual: 21000, variance: 1000, variancePercent: 4.5 },
      { category: "Administration", budget: 15000, actual: 14500, variance: 500, variancePercent: 3.3 },
    ]
  },
];

export function BudgetOpexTracker() {
  const [selectedVessel, setSelectedVessel] = useState("all");
  const vessels = selectedVessel === "all" ? VESSELS_OPEX : VESSELS_OPEX.filter(v => v.vessel === selectedVessel);

  const fleetBudget = VESSELS_OPEX.reduce((s, v) => s + v.categories.reduce((ss, c) => ss + c.budget, 0), 0);
  const fleetActual = VESSELS_OPEX.reduce((s, v) => s + v.categories.reduce((ss, c) => ss + c.actual, 0), 0);
  const fleetVariance = fleetBudget - fleetActual;
  const overBudgetCount = VESSELS_OPEX.filter(v => v.daily_actual > v.daily_budget).length;

  return (
    <div className="space-y-6">
      {/* Fleet KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="pt-4 pb-3">
            <div className="text-sm text-muted-foreground mb-1">Fleet Monthly Budget</div>
            <div className="text-2xl font-bold">${(fleetBudget / 1000).toFixed(0)}k</div>
          </CardContent>
        </Card>
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-4 pb-3">
            <div className="text-sm text-muted-foreground mb-1">Actual Spend</div>
            <div className="text-2xl font-bold">${(fleetActual / 1000).toFixed(0)}k</div>
          </CardContent>
        </Card>
        <Card className={`${fleetVariance >= 0 ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              {fleetVariance >= 0 ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />} Variance
            </div>
            <div className={`text-2xl font-bold ${fleetVariance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {fleetVariance >= 0 ? '+' : ''}${(fleetVariance / 1000).toFixed(0)}k
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><AlertTriangle className="h-4 w-4" /> Over Budget</div>
            <div className="text-2xl font-bold text-yellow-400">{overBudgetCount} / {VESSELS_OPEX.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Select value={selectedVessel} onValueChange={setSelectedVessel}>
          <SelectTrigger className="w-60"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vessels</SelectItem>
            {VESSELS_OPEX.map(v => <SelectItem key={v.vessel} value={v.vessel}>{v.vessel}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" className="gap-2"><Download className="h-4 w-4" /> Export Report</Button>
      </div>

      {/* Per-Vessel Cards */}
      {vessels.map(v => {
        const vBudget = v.categories.reduce((s, c) => s + c.budget, 0);
        const vActual = v.categories.reduce((s, c) => s + c.actual, 0);
        const utilization = (vActual / vBudget) * 100;
        const isOver = vActual > vBudget;

        return (
          <Card key={v.vessel} className={isOver ? 'border-red-500/30' : 'border-green-500/30'}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2"><Ship className="h-5 w-5" /> {v.vessel}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{v.vessel_type}</Badge>
                  <Badge className={isOver ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}>
                    {isOver ? 'Over Budget' : 'Under Budget'}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-muted-foreground">Budget: ${(vBudget / 1000).toFixed(0)}k</span>
                <span className="text-sm text-muted-foreground">Actual: ${(vActual / 1000).toFixed(0)}k</span>
                <Progress value={Math.min(utilization, 100)} className="flex-1 h-2" />
                <span className="text-sm font-mono">{utilization.toFixed(1)}%</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {v.categories.map(c => (
                  <div key={c.category} className="p-3 rounded-lg bg-muted/30 border border-border/20">
                    <div className="text-xs text-muted-foreground mb-1">{c.category}</div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm">${(c.actual / 1000).toFixed(0)}k</span>
                      <span className={`text-xs font-mono ${c.variance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {c.variance >= 0 ? '▼' : '▲'}{Math.abs(c.variancePercent).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={(c.actual / c.budget) * 100} className="h-1 mt-1" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default BudgetOpexTracker;
