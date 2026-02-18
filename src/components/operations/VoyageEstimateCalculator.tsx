/**
 * 🧮 VOYAGE ESTIMATE CALCULATOR v2 - vs Veson IMOS
 * TCE calculation, fully editable scenarios, sensitivity analysis,
 * bunker cost breakdown, CSV export, CO2 estimation
 */
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calculator, TrendingUp, Fuel, DollarSign, Ship, Anchor, BarChart3, Plus, Trash2,
  Download, Edit, Copy, Leaf, ArrowUpDown
} from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

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
  daily_opex: number;
}

const defaultScenario: VoyageScenario = {
  id: "1", name: "Base Case", vessel_type: "Suezmax", dwt: 158000,
  laden_speed: 13.5, ballast_speed: 14.0, laden_consumption: 42, ballast_consumption: 38,
  port_consumption: 5, load_port: "Santos", discharge_port: "Rotterdam",
  laden_days: 18, ballast_days: 16, load_port_days: 2, discharge_port_days: 3,
  freight_rate: 18.50, cargo_quantity: 145000, address_commission: 3.75, brokerage: 1.25,
  bunker_price_vlsfo: 520, bunker_price_mgo: 780,
  port_costs_load: 85000, port_costs_discharge: 120000, canal_costs: 0, misc_costs: 15000,
  daily_opex: 8500,
};

const EMISSION_FACTOR_VLSFO = 3.151; // tCO2 per t fuel

function calculateVoyageEconomics(s: VoyageScenario) {
  const totalDays = s.laden_days + s.ballast_days + s.load_port_days + s.discharge_port_days;
  const grossFreight = s.freight_rate * s.cargo_quantity;
  const commissions = grossFreight * ((s.address_commission + s.brokerage) / 100);
  const netFreight = grossFreight - commissions;

  const ladenBunker = s.laden_days * s.laden_consumption;
  const ballastBunker = s.ballast_days * s.ballast_consumption;
  const portBunker = (s.load_port_days + s.discharge_port_days) * s.port_consumption;
  const totalFuelMT = ladenBunker + ballastBunker + portBunker;
  const seaBunkerCost = (ladenBunker + ballastBunker) * s.bunker_price_vlsfo / 1000;
  const portBunkerCost = portBunker * s.bunker_price_mgo / 1000;
  const totalBunkerCost = seaBunkerCost + portBunkerCost;
  const totalPortCosts = s.port_costs_load + s.port_costs_discharge;
  const totalVoyageCosts = totalBunkerCost + totalPortCosts + s.canal_costs + s.misc_costs;
  const netRevenue = netFreight - totalVoyageCosts;
  const tce = totalDays > 0 ? netRevenue / totalDays : 0;
  const profitPerDay = tce - s.daily_opex;
  const totalProfit = profitPerDay * totalDays;
  const margin = grossFreight > 0 ? (netRevenue / grossFreight) * 100 : 0;
  const co2Emissions = totalFuelMT * EMISSION_FACTOR_VLSFO / 1000; // in tonnes
  const breakeven_freight = totalDays > 0
    ? ((totalVoyageCosts + s.daily_opex * totalDays + commissions) / s.cargo_quantity)
    : 0;

  return {
    totalDays, grossFreight, commissions, netFreight,
    ladenBunker, ballastBunker, portBunker, totalFuelMT,
    seaBunkerCost, portBunkerCost, totalBunkerCost,
    totalPortCosts, totalVoyageCosts, netRevenue, tce,
    dailyOpex: s.daily_opex, profitPerDay, totalProfit, margin,
    co2Emissions, breakeven_freight,
  };
}

export function VoyageEstimateCalculator() {
  const [scenarios, setScenarios] = useState<VoyageScenario[]>([
    defaultScenario,
    { ...defaultScenario, id: "2", name: "High Freight", freight_rate: 22.00 },
    { ...defaultScenario, id: "3", name: "Slow Steam", laden_speed: 11.0, laden_consumption: 32, laden_days: 22 },
  ]);
  const [editingScenario, setEditingScenario] = useState<VoyageScenario | null>(null);
  const [activeTab, setActiveTab] = useState("comparison");

  const results = useMemo(() => scenarios.map(s => ({ scenario: s, ...calculateVoyageEconomics(s) })), [scenarios]);

  const addScenario = () => {
    const newId = String(Date.now());
    setScenarios(prev => [...prev, { ...defaultScenario, id: newId, name: `Scenario ${prev.length + 1}` }]);
    toast.success("Scenario added");
  };

  const duplicateScenario = (s: VoyageScenario) => {
    const newId = String(Date.now());
    setScenarios(prev => [...prev, { ...s, id: newId, name: `${s.name} (copy)` }]);
    toast.success("Scenario duplicated");
  };

  const removeScenario = (id: string) => {
    if (scenarios.length <= 1) { toast.error("At least one scenario required"); return; }
    setScenarios(prev => prev.filter(s => s.id !== id));
    toast.success("Scenario removed");
  };

  const saveScenario = (updated: VoyageScenario) => {
    setScenarios(prev => prev.map(s => s.id === updated.id ? updated : s));
    setEditingScenario(null);
    toast.success("Scenario updated");
  };

  const exportCSV = () => {
    const headers = ["Scenario", "Route", "DWT", "Cargo MT", "Days", "Freight $/MT", "Gross $", "Net Revenue $", "TCE $/day", "Profit/Day $", "Total Profit $", "CO2 t", "Breakeven $/MT"];
    const rows = results.map(r => [
      r.scenario.name, `${r.scenario.load_port}-${r.scenario.discharge_port}`,
      r.scenario.dwt, r.scenario.cargo_quantity, r.totalDays, r.scenario.freight_rate.toFixed(2),
      Math.round(r.grossFreight), Math.round(r.netRevenue), Math.round(r.tce),
      Math.round(r.profitPerDay), Math.round(r.totalProfit), r.co2Emissions.toFixed(1),
      r.breakeven_freight.toFixed(2),
    ].join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `voyage-estimates-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Exported to CSV");
  };

  // Sensitivity analysis: TCE vs freight rate
  const sensitivityData = useMemo(() => {
    const base = scenarios[0];
    if (!base) return [];
    return Array.from({ length: 11 }, (_, i) => {
      const rate = (base.freight_rate * 0.7) + (base.freight_rate * 0.6 * i / 10);
      const s = { ...base, freight_rate: rate };
      const r = calculateVoyageEconomics(s);
      return { rate: rate.toFixed(1), tce: Math.round(r.tce), profit: Math.round(r.totalProfit / 1000) };
    });
  }, [scenarios]);

  // Bunker sensitivity
  const bunkerSensitivity = useMemo(() => {
    const base = scenarios[0];
    if (!base) return [];
    return Array.from({ length: 9 }, (_, i) => {
      const price = 300 + i * 50;
      const s = { ...base, bunker_price_vlsfo: price };
      const r = calculateVoyageEconomics(s);
      return { price: `$${price}`, tce: Math.round(r.tce), bunkerCost: Math.round(r.totalBunkerCost / 1000) };
    });
  }, [scenarios]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Calculator className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold">Voyage Estimate Calculator</h2>
          <Badge variant="outline" className="text-xs">vs Veson IMOS</Badge>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={exportCSV}><Download className="h-4 w-4 mr-1" /> Export CSV</Button>
          <Button size="sm" onClick={addScenario}><Plus className="h-4 w-4 mr-1" /> Add Scenario</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
          <TabsTrigger value="sensitivity">Sensitivity</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="mt-4 space-y-4">
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
                        <th key={r.scenario.id} className="text-right py-2 px-3">
                          <div className="flex items-center justify-end gap-1">
                            {r.scenario.name}
                            <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => setEditingScenario(r.scenario)} aria-label="Edit scenario">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => duplicateScenario(r.scenario)} aria-label="Duplicate scenario">
                              <Copy className="h-3 w-3" />
                            </Button>
                            {scenarios.length > 1 && (
                              <Button size="icon" variant="ghost" className="h-5 w-5 text-destructive" onClick={() => removeScenario(r.scenario.id)} aria-label="Remove scenario">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "Route", render: (r: typeof results[0]) => `${r.scenario.load_port} → ${r.scenario.discharge_port}` },
                      { label: "Vessel / DWT", render: (r: typeof results[0]) => `${r.scenario.vessel_type} / ${(r.scenario.dwt/1000).toFixed(0)}K` },
                      { label: "Cargo (MT)", render: (r: typeof results[0]) => r.scenario.cargo_quantity.toLocaleString() },
                      { label: "Total Days", render: (r: typeof results[0]) => r.totalDays.toFixed(1) },
                      { label: "Freight Rate ($/MT)", render: (r: typeof results[0]) => `$${r.scenario.freight_rate.toFixed(2)}` },
                      { label: "Gross Freight", render: (r: typeof results[0]) => `$${(r.grossFreight / 1000).toFixed(0)}k` },
                      { label: "Commissions", render: (r: typeof results[0]) => `($${(r.commissions / 1000).toFixed(0)}k)` },
                      { label: "Net Freight", render: (r: typeof results[0]) => `$${(r.netFreight / 1000).toFixed(0)}k`, highlight: false },
                      { label: "Bunker Cost", render: (r: typeof results[0]) => `($${(r.totalBunkerCost / 1000).toFixed(0)}k)` },
                      { label: "Port Costs", render: (r: typeof results[0]) => `($${(r.totalPortCosts / 1000).toFixed(0)}k)` },
                      { label: "Canal + Misc", render: (r: typeof results[0]) => `($${((r.scenario.canal_costs + r.scenario.misc_costs) / 1000).toFixed(0)}k)` },
                      { label: "Total Voyage Cost", render: (r: typeof results[0]) => `($${(r.totalVoyageCosts / 1000).toFixed(0)}k)` },
                      { label: "Net Revenue", render: (r: typeof results[0]) => `$${(r.netRevenue / 1000).toFixed(0)}k`, highlight: true },
                      { label: "TCE ($/day)", render: (r: typeof results[0]) => `$${r.tce.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, highlight: true },
                      { label: "Daily OPEX", render: (r: typeof results[0]) => `($${r.dailyOpex.toLocaleString()})` },
                      { label: "Profit/Day", render: (r: typeof results[0]) => `$${r.profitPerDay.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, highlight: true },
                      { label: "Total Profit", render: (r: typeof results[0]) => `$${(r.totalProfit / 1000).toFixed(0)}k`, highlight: true },
                      { label: "Margin %", render: (r: typeof results[0]) => `${r.margin.toFixed(1)}%` },
                      { label: "CO₂ Emissions", render: (r: typeof results[0]) => `${r.co2Emissions.toFixed(0)} t` },
                      { label: "Breakeven Rate", render: (r: typeof results[0]) => `$${r.breakeven_freight.toFixed(2)}/MT`, highlight: true },
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

          {/* Best Scenario Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {results.map(r => {
              const best = results.reduce((a, b) => a.tce > b.tce ? a : b);
              const isBest = r.scenario.id === best.scenario.id;
              return (
                <Card key={r.scenario.id} className={`${isBest ? 'border-success/50 bg-success/5' : 'border-border/30'}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold">{r.scenario.name}</span>
                      {isBest && <Badge className="bg-success/20 text-success">Best TCE</Badge>}
                    </div>
                    <div className="text-3xl font-bold">${r.tce.toLocaleString(undefined, { maximumFractionDigits: 0 })}<span className="text-sm text-muted-foreground">/day</span></div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Profit: ${(r.totalProfit / 1000).toFixed(0)}k | {r.totalDays}d | BE: ${r.breakeven_freight.toFixed(2)}/MT
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Leaf className="h-3 w-3" /> {r.co2Emissions.toFixed(0)}t CO₂
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="breakdown" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Bunker Cost Breakdown</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={results.map(r => ({
                    name: r.scenario.name,
                    "Laden VLSFO": Math.round(r.ladenBunker * r.scenario.bunker_price_vlsfo / 1000),
                    "Ballast VLSFO": Math.round(r.ballastBunker * r.scenario.bunker_price_vlsfo / 1000),
                    "Port MGO": Math.round(r.portBunker * r.scenario.bunker_price_mgo / 1000),
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" fontSize={11} />
                    <YAxis fontSize={11} tickFormatter={v => `$${v}k`} />
                    <Tooltip formatter={(v: number) => `$${v.toLocaleString()}k`} />
                    <Bar dataKey="Laden VLSFO" stackId="a" fill="hsl(var(--primary))" />
                    <Bar dataKey="Ballast VLSFO" stackId="a" fill="hsl(210,70%,55%)" />
                    <Bar dataKey="Port MGO" stackId="a" fill="hsl(35,80%,55%)" />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Cost Structure</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={results.map(r => ({
                    name: r.scenario.name,
                    Bunker: Math.round(r.totalBunkerCost / 1000),
                    Port: Math.round(r.totalPortCosts / 1000),
                    Commission: Math.round(r.commissions / 1000),
                    Other: Math.round((r.scenario.canal_costs + r.scenario.misc_costs) / 1000),
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" fontSize={11} />
                    <YAxis fontSize={11} tickFormatter={v => `$${v}k`} />
                    <Tooltip formatter={(v: number) => `$${v.toLocaleString()}k`} />
                    <Bar dataKey="Bunker" stackId="a" fill="hsl(var(--primary))" />
                    <Bar dataKey="Port" stackId="a" fill="hsl(160,60%,45%)" />
                    <Bar dataKey="Commission" stackId="a" fill="hsl(35,80%,55%)" />
                    <Bar dataKey="Other" stackId="a" fill="hsl(280,60%,55%)" />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            {/* Fuel consumption summary */}
            <Card className="md:col-span-2">
              <CardHeader><CardTitle className="text-base">Fuel & Emissions Summary</CardTitle></CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr className="text-muted-foreground">
                      <th className="text-left p-2">Scenario</th>
                      <th className="text-right p-2">Laden (MT)</th>
                      <th className="text-right p-2">Ballast (MT)</th>
                      <th className="text-right p-2">Port (MT)</th>
                      <th className="text-right p-2">Total Fuel (MT)</th>
                      <th className="text-right p-2">CO₂ (t)</th>
                      <th className="text-right p-2">g CO₂/t·nm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map(r => (
                      <tr key={r.scenario.id} className="border-b hover:bg-muted/30">
                        <td className="p-2 font-medium">{r.scenario.name}</td>
                        <td className="p-2 text-right font-mono">{r.ladenBunker.toFixed(0)}</td>
                        <td className="p-2 text-right font-mono">{r.ballastBunker.toFixed(0)}</td>
                        <td className="p-2 text-right font-mono">{r.portBunker.toFixed(0)}</td>
                        <td className="p-2 text-right font-mono font-medium">{r.totalFuelMT.toFixed(0)}</td>
                        <td className="p-2 text-right font-mono">{r.co2Emissions.toFixed(0)}</td>
                        <td className="p-2 text-right font-mono text-xs text-muted-foreground">
                          {r.scenario.cargo_quantity > 0 ? ((r.co2Emissions * 1e6) / (r.scenario.cargo_quantity * (r.scenario.laden_speed * r.scenario.laden_days * 24))).toFixed(1) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sensitivity" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">TCE vs Freight Rate</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={sensitivityData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="rate" fontSize={11} label={{ value: "$/MT", position: "insideBottom", offset: -5, fontSize: 10 }} />
                    <YAxis fontSize={11} tickFormatter={v => `$${v}`} />
                    <Tooltip formatter={(v: number, name: string) => name === "tce" ? `$${v}/day` : `$${v}k`} />
                    <Line type="monotone" dataKey="tce" stroke="hsl(var(--primary))" strokeWidth={2} name="TCE $/day" dot={false} />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">TCE vs Bunker Price</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={bunkerSensitivity}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="price" fontSize={11} />
                    <YAxis fontSize={11} tickFormatter={v => `$${v}`} />
                    <Tooltip formatter={(v: number, name: string) => name === "tce" ? `$${v}/day` : `$${v}k`} />
                    <Line type="monotone" dataKey="tce" stroke="hsl(var(--warning))" strokeWidth={2} name="TCE $/day" dot={false} />
                    <Line type="monotone" dataKey="bunkerCost" stroke="hsl(var(--destructive))" strokeWidth={1} strokeDasharray="4 4" name="Bunker $k" dot={false} />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Scenario Dialog */}
      {editingScenario && (
        <Dialog open={!!editingScenario} onOpenChange={() => setEditingScenario(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Edit: {editingScenario.name}</DialogTitle></DialogHeader>
            <EditScenarioForm scenario={editingScenario} onSave={saveScenario} onCancel={() => setEditingScenario(null)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function EditScenarioForm({ scenario, onSave, onCancel }: { scenario: VoyageScenario; onSave: (s: VoyageScenario) => void; onCancel: () => void }) {
  const [form, setForm] = useState(scenario);
  const set = (k: keyof VoyageScenario, v: string | number) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div><Label>Scenario Name</Label><Input value={form.name} onChange={e => set("name", e.target.value)} /></div>
        <div><Label>Vessel Type</Label><Input value={form.vessel_type} onChange={e => set("vessel_type", e.target.value)} /></div>
        <div><Label>DWT</Label><Input type="number" value={form.dwt} onChange={e => set("dwt", +e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Load Port</Label><Input value={form.load_port} onChange={e => set("load_port", e.target.value)} /></div>
        <div><Label>Discharge Port</Label><Input value={form.discharge_port} onChange={e => set("discharge_port", e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <div><Label>Laden Days</Label><Input type="number" step="0.5" value={form.laden_days} onChange={e => set("laden_days", +e.target.value)} /></div>
        <div><Label>Ballast Days</Label><Input type="number" step="0.5" value={form.ballast_days} onChange={e => set("ballast_days", +e.target.value)} /></div>
        <div><Label>Load Port Days</Label><Input type="number" step="0.5" value={form.load_port_days} onChange={e => set("load_port_days", +e.target.value)} /></div>
        <div><Label>Discharge Port Days</Label><Input type="number" step="0.5" value={form.discharge_port_days} onChange={e => set("discharge_port_days", +e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <div><Label>Laden Speed (kn)</Label><Input type="number" step="0.1" value={form.laden_speed} onChange={e => set("laden_speed", +e.target.value)} /></div>
        <div><Label>Ballast Speed (kn)</Label><Input type="number" step="0.1" value={form.ballast_speed} onChange={e => set("ballast_speed", +e.target.value)} /></div>
        <div><Label>Laden Cons (MT/d)</Label><Input type="number" step="0.1" value={form.laden_consumption} onChange={e => set("laden_consumption", +e.target.value)} /></div>
        <div><Label>Ballast Cons (MT/d)</Label><Input type="number" step="0.1" value={form.ballast_consumption} onChange={e => set("ballast_consumption", +e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <div><Label>Freight Rate ($/MT)</Label><Input type="number" step="0.01" value={form.freight_rate} onChange={e => set("freight_rate", +e.target.value)} /></div>
        <div><Label>Cargo Qty (MT)</Label><Input type="number" value={form.cargo_quantity} onChange={e => set("cargo_quantity", +e.target.value)} /></div>
        <div><Label>Add. Commission %</Label><Input type="number" step="0.25" value={form.address_commission} onChange={e => set("address_commission", +e.target.value)} /></div>
        <div><Label>Brokerage %</Label><Input type="number" step="0.25" value={form.brokerage} onChange={e => set("brokerage", +e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <div><Label>VLSFO ($/MT)</Label><Input type="number" value={form.bunker_price_vlsfo} onChange={e => set("bunker_price_vlsfo", +e.target.value)} /></div>
        <div><Label>MGO ($/MT)</Label><Input type="number" value={form.bunker_price_mgo} onChange={e => set("bunker_price_mgo", +e.target.value)} /></div>
        <div><Label>Port Cons (MT/d)</Label><Input type="number" step="0.1" value={form.port_consumption} onChange={e => set("port_consumption", +e.target.value)} /></div>
        <div><Label>Daily OPEX ($)</Label><Input type="number" value={form.daily_opex} onChange={e => set("daily_opex", +e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <div><Label>Port Costs Load ($)</Label><Input type="number" value={form.port_costs_load} onChange={e => set("port_costs_load", +e.target.value)} /></div>
        <div><Label>Port Costs Disch ($)</Label><Input type="number" value={form.port_costs_discharge} onChange={e => set("port_costs_discharge", +e.target.value)} /></div>
        <div><Label>Canal Costs ($)</Label><Input type="number" value={form.canal_costs} onChange={e => set("canal_costs", +e.target.value)} /></div>
        <div><Label>Misc Costs ($)</Label><Input type="number" value={form.misc_costs} onChange={e => set("misc_costs", +e.target.value)} /></div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(form)}>Save Changes</Button>
      </DialogFooter>
    </div>
  );
}

export default VoyageEstimateCalculator;
