/**
 * 🧮 VOYAGE ESTIMATE CALCULATOR - vs Veson IMOS
 * TCE calculation, voyage economics, multi-scenario comparison
 */
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, TrendingUp, Fuel, DollarSign, Ship, Anchor, BarChart3, Plus, Trash2, Download } from "lucide-react";
import { toast } from "sonner";

interface VoyageScenario {
  id: string;
  name: string;
  vessel_type: string;
  dwt: number;
  laden_speed: number;
  ballast_speed: number;
  laden_consumption: number;
  ballast_consumption: number;
  port_consumption: number;
  load_port: string;
  discharge_port: string;
  laden_days: number;
  ballast_days: number;
  load_port_days: number;
  discharge_port_days: number;
  freight_rate: number;
  cargo_quantity: number;
  address_commission: number;
  brokerage: number;
  bunker_price_vlsfo: number;
  bunker_price_mgo: number;
  port_costs_load: number;
  port_costs_discharge: number;
  canal_costs: number;
  misc_costs: number;
}

const defaultScenario: VoyageScenario = {
  id: "1", name: "Base Case", vessel_type: "Suezmax", dwt: 158000,
  laden_speed: 13.5, ballast_speed: 14.0, laden_consumption: 42, ballast_consumption: 38,
  port_consumption: 5, load_port: "Santos", discharge_port: "Rotterdam",
  laden_days: 18, ballast_days: 16, load_port_days: 2, discharge_port_days: 3,
  freight_rate: 18.50, cargo_quantity: 145000, address_commission: 3.75, brokerage: 1.25,
  bunker_price_vlsfo: 520, bunker_price_mgo: 780,
  port_costs_load: 85000, port_costs_discharge: 120000, canal_costs: 0, misc_costs: 15000,
};

function calculateVoyageEconomics(s: VoyageScenario) {
  const totalDays = s.laden_days + s.ballast_days + s.load_port_days + s.discharge_port_days;
  const grossFreight = s.freight_rate * s.cargo_quantity;
  const commissions = grossFreight * ((s.address_commission + s.brokerage) / 100);
  const netFreight = grossFreight - commissions;

  const seaBunkerCost = (s.laden_days * s.laden_consumption + s.ballast_days * s.ballast_consumption) * s.bunker_price_vlsfo / 1000;
  const portBunkerCost = (s.load_port_days + s.discharge_port_days) * s.port_consumption * s.bunker_price_mgo / 1000;
  const totalBunkerCost = seaBunkerCost + portBunkerCost;
  const totalPortCosts = s.port_costs_load + s.port_costs_discharge;
  const totalVoyageCosts = totalBunkerCost + totalPortCosts + s.canal_costs + s.misc_costs;
  const netRevenue = netFreight - totalVoyageCosts;
  const tce = netRevenue / totalDays;
  const dailyOpex = 8500;
  const profitPerDay = tce - dailyOpex;
  const totalProfit = profitPerDay * totalDays;
  const margin = (netRevenue / grossFreight) * 100;

  return { totalDays, grossFreight, commissions, netFreight, totalBunkerCost, totalPortCosts, totalVoyageCosts, netRevenue, tce, dailyOpex, profitPerDay, totalProfit, margin };
}

export function VoyageEstimateCalculator() {
  const [scenarios, setScenarios] = useState<VoyageScenario[]>([
    defaultScenario,
    { ...defaultScenario, id: "2", name: "High Freight", freight_rate: 22.00 },
    { ...defaultScenario, id: "3", name: "Slow Steam", laden_speed: 11.0, laden_consumption: 32, laden_days: 22 },
  ]);

  const results = useMemo(() => scenarios.map(s => ({ scenario: s, ...calculateVoyageEconomics(s) })), [scenarios]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calculator className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold">Voyage Estimate Calculator</h2>
          <Badge variant="outline" className="text-xs">vs Veson IMOS</Badge>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-2"><Download className="h-4 w-4" /> Export</Button>
          <Button size="sm" className="gap-2" onClick={() => toast.success("Scenario added")}>
            <Plus className="h-4 w-4" /> Add Scenario
          </Button>
        </div>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Scenario Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground">
                  <th className="text-left py-2 px-3">Metric</th>
                  {results.map(r => (
                    <th key={r.scenario.id} className="text-right py-2 px-3">{r.scenario.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Route", render: (r: typeof results[0]) => `${r.scenario.load_port} → ${r.scenario.discharge_port}` },
                  { label: "Cargo (MT)", render: (r: typeof results[0]) => r.scenario.cargo_quantity.toLocaleString() },
                  { label: "Total Days", render: (r: typeof results[0]) => r.totalDays.toFixed(1) },
                  { label: "Freight Rate ($/MT)", render: (r: typeof results[0]) => `$${r.scenario.freight_rate.toFixed(2)}` },
                  { label: "Gross Freight", render: (r: typeof results[0]) => `$${(r.grossFreight / 1000).toFixed(0)}k` },
                  { label: "Commissions", render: (r: typeof results[0]) => `($${(r.commissions / 1000).toFixed(0)}k)` },
                  { label: "Net Freight", render: (r: typeof results[0]) => `$${(r.netFreight / 1000).toFixed(0)}k` },
                  { label: "Bunker Cost", render: (r: typeof results[0]) => `($${(r.totalBunkerCost / 1000).toFixed(0)}k)` },
                  { label: "Port Costs", render: (r: typeof results[0]) => `($${(r.totalPortCosts / 1000).toFixed(0)}k)` },
                  { label: "Total Voyage Cost", render: (r: typeof results[0]) => `($${(r.totalVoyageCosts / 1000).toFixed(0)}k)` },
                  { label: "Net Revenue", render: (r: typeof results[0]) => `$${(r.netRevenue / 1000).toFixed(0)}k`, highlight: true },
                  { label: "TCE ($/day)", render: (r: typeof results[0]) => `$${r.tce.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, highlight: true },
                  { label: "Daily OPEX", render: (r: typeof results[0]) => `($${r.dailyOpex.toLocaleString()})` },
                  { label: "Profit/Day", render: (r: typeof results[0]) => `$${r.profitPerDay.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, highlight: true },
                  { label: "Total Profit", render: (r: typeof results[0]) => `$${(r.totalProfit / 1000).toFixed(0)}k`, highlight: true },
                  { label: "Margin %", render: (r: typeof results[0]) => `${r.margin.toFixed(1)}%` },
                ].map((row, idx) => (
                  <tr key={idx} className={`border-b border-border/20 ${row.highlight ? 'bg-primary/5 font-semibold' : 'hover:bg-muted/30'}`}>
                    <td className="py-2 px-3 text-muted-foreground">{row.label}</td>
                    {results.map(r => (
                      <td key={r.scenario.id} className="py-2 px-3 text-right font-mono text-xs">{row.render(r)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Best Scenario Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {results.map(r => {
          const best = results.reduce((a, b) => a.tce > b.tce ? a : b);
          const isBest = r.scenario.id === best.scenario.id;
          return (
            <Card key={r.scenario.id} className={`${isBest ? 'border-green-500/50 bg-green-500/5' : 'border-border/30'}`}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold">{r.scenario.name}</span>
                  {isBest && <Badge className="bg-green-500/20 text-green-400">Best TCE</Badge>}
                </div>
                <div className="text-3xl font-bold">${r.tce.toLocaleString(undefined, { maximumFractionDigits: 0 })}<span className="text-sm text-muted-foreground">/day</span></div>
                <div className="text-sm text-muted-foreground mt-1">Profit: ${(r.totalProfit / 1000).toFixed(0)}k | {r.totalDays} days</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default VoyageEstimateCalculator;
