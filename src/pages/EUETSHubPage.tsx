/**
 * EU ETS & FuelEU Maritime Compliance Hub v2
 * Emissions tracking, allowance portfolio, cost forecasting, compliance timeline,
 * voyage emissions breakdown, EEXI tracking
 */

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCreateETSRecord } from "@/hooks/useModuleHooks";
import { PremiumModuleShell, type ModuleTab } from "@/components/ui/premium-module-kit/PremiumModuleShell";
import { SmartKPIGrid } from "@/components/ui/premium-module-kit/SmartKPIGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Leaf, Factory, Fuel, TrendingDown, Plus, Calculator,
  FileCheck, Globe, BarChart3, AlertTriangle, Target, Wallet,
  Calendar, Ship, ArrowDown, ArrowUp, type LucideIcon
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, AreaChart, Area, LineChart, Line,
} from "recharts";
import { format } from "date-fns";

const COLORS = ["hsl(var(--primary))", "hsl(160,60%,45%)", "hsl(35,80%,55%)", "hsl(210,70%,55%)", "hsl(280,60%,55%)", "hsl(0,70%,55%)"];

const FUEL_EMISSION_FACTORS: Record<string, number> = {
  HFO: 3.114, VLSFO: 3.151, MGO: 3.206, LNG: 2.750, methanol: 1.375, ammonia: 0,
};

interface EUETSRecord {
  id: string; vessel_id: string | null; reporting_year: number;
  voyage_type: string | null; total_co2_mt: number; co2_subject_to_ets: number;
  ets_percentage: number | null; allowances_required: number;
  allowances_purchased: number; allowance_price_eur: number | null;
  total_cost_eur: number; fuel_ghg_intensity: number | null;
  fueleu_target_intensity: number | null; fueleu_compliance_balance: number | null;
  fueleu_penalty_eur: number; fuel_type: string | null;
  fuel_consumed_mt: number | null; distance_nm: number | null;
  eexi_required: number | null; eexi_attained: number | null;
  eexi_compliant: boolean | null; imo_dcs_reported: boolean;
  status: string; created_at: string;
}

function useEUETSRecords(year?: number) {
  return useQuery({
    queryKey: ["eu_ets_tracking", year],
    queryFn: async () => {
      let q = supabase.from("eu_ets_tracking" as any).select("*").order("created_at", { ascending: false });
      if (year) q = q.eq("reporting_year", year);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as unknown as EUETSRecord[];
    },
  });
}

/* ─── Allowance Portfolio Tab ─── */
function AllowancePortfolioTab() {
  const { data: allowances = [] } = useQuery({
    queryKey: ["eu_ets_allowances"],
    queryFn: async () => {
      const { data, error } = await supabase.from("eu_ets_allowances" as any)
        .select("*")
        .order("purchase_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: records = [] } = useEUETSRecords();

  const totalPurchased = allowances.reduce((s: number, a: any) => s + (Number(a.quantity) || 0), 0);
  const totalRequired = records.reduce((s: number, r) => s + r.allowances_required, 0);
  const totalSpent = allowances.reduce((s: number, a: any) => s + (Number(a.quantity) || 0) * (Number(a.purchase_price_eur) || 0), 0);
  const avgPrice = totalPurchased > 0 ? totalSpent / totalPurchased : 0;
  const surplus = totalPurchased - totalRequired;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">EUAs Purchased</p>
          <p className="text-2xl font-bold">{totalPurchased.toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">EUAs Required</p>
          <p className="text-2xl font-bold text-warning">{totalRequired.toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Surplus / Deficit</p>
          <p className={`text-2xl font-bold ${surplus >= 0 ? "text-success" : "text-destructive"}`}>
            {surplus >= 0 ? "+" : ""}{surplus.toLocaleString()}
          </p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Avg Purchase Price</p>
          <p className="text-2xl font-bold">€{avgPrice.toFixed(2)}</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Wallet className="h-4 w-4" /> Allowance Transactions</CardTitle></CardHeader>
        <CardContent>
          {allowances.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">No allowance purchases recorded. Register via EU ETS Allowances table.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-muted-foreground">
                    <th className="text-left p-2">Date</th>
                    <th className="text-right p-2">Quantity</th>
                    <th className="text-right p-2">Price (€/EUA)</th>
                    <th className="text-right p-2">Total (€)</th>
                    <th className="text-center p-2">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {allowances.slice(0, 20).map((a: any) => (
                    <tr key={a.id} className="border-b hover:bg-muted/30">
                      <td className="p-2 text-xs">{a.purchase_date ? format(new Date(a.purchase_date), "dd MMM yyyy") : "—"}</td>
                      <td className="p-2 text-right font-mono">{Number(a.quantity || 0).toLocaleString()}</td>
                      <td className="p-2 text-right font-mono">€{Number(a.purchase_price_eur || 0).toFixed(2)}</td>
                      <td className="p-2 text-right font-mono font-medium">€{(Number(a.quantity || 0) * Number(a.purchase_price_eur || 0)).toLocaleString()}</td>
                      <td className="p-2 text-center"><Badge variant="outline" className="text-[10px]">{a.transaction_type || "purchase"}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Cost Forecasting Tab ─── */
function CostForecastTab() {
  const { data: records = [] } = useEUETSRecords();

  const forecastData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const historicalByYear: Record<number, number> = {};
    records.forEach((r) => {
      historicalByYear[r.reporting_year] = (historicalByYear[r.reporting_year] || 0) + r.total_co2_mt;
    });

    const avgCO2 = Object.values(historicalByYear).length > 0
      ? Object.values(historicalByYear).reduce((s, v) => s + v, 0) / Object.values(historicalByYear).length
      : 5000;

    const euaPriceScenarios = { low: 60, mid: 85, high: 120 };
    const phaseIn: Record<number, number> = { 2024: 40, 2025: 70, 2026: 100, 2027: 100, 2028: 100 };

    return Array.from({ length: 5 }, (_, i) => {
      const year = currentYear + i;
      const phase = phaseIn[year] || 100;
      const co2 = avgCO2 * (1 - i * 0.02); // 2% annual reduction target
      return {
        year,
        co2: Math.round(co2),
        phaseIn: phase,
        costLow: Math.round(co2 * (phase / 100) * euaPriceScenarios.low),
        costMid: Math.round(co2 * (phase / 100) * euaPriceScenarios.mid),
        costHigh: Math.round(co2 * (phase / 100) * euaPriceScenarios.high),
      };
    });
  }, [records]);

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
        <CardContent className="p-4">
          <h3 className="font-semibold">5-Year ETS Cost Forecast</h3>
          <p className="text-sm text-muted-foreground">Based on historical emissions with 2% annual reduction target</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="year" fontSize={12} />
              <YAxis fontSize={11} tickFormatter={(v) => `€${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => `€${v.toLocaleString()}`} />
              <Area type="monotone" dataKey="costHigh" fill="hsl(0,70%,55%)" fillOpacity={0.1} stroke="hsl(0,70%,55%)" strokeDasharray="4 4" name="High (€120/t)" />
              <Area type="monotone" dataKey="costMid" fill="hsl(var(--primary))" fillOpacity={0.2} stroke="hsl(var(--primary))" strokeWidth={2} name="Mid (€85/t)" />
              <Area type="monotone" dataKey="costLow" fill="hsl(160,60%,45%)" fillOpacity={0.1} stroke="hsl(160,60%,45%)" strokeDasharray="4 4" name="Low (€60/t)" />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-5 gap-3">
        {forecastData.map((d) => (
          <Card key={d.year}>
            <CardContent className="p-3 text-center">
              <p className="text-sm font-bold">{d.year}</p>
              <p className="text-xs text-muted-foreground">{d.phaseIn}% phase-in</p>
              <p className="text-lg font-bold mt-1">€{(d.costMid / 1000).toFixed(0)}K</p>
              <p className="text-[10px] text-muted-foreground">{d.co2.toLocaleString()} tCO₂</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ─── Voyage Emissions Breakdown Tab ─── */
function VoyageEmissionsTab() {
  const { data: records = [] } = useEUETSRecords();

  const byVoyageType = useMemo(() => {
    const groups: Record<string, { co2: number; cost: number; count: number }> = {};
    records.forEach((r) => {
      const type = r.voyage_type || "unknown";
      if (!groups[type]) groups[type] = { co2: 0, cost: 0, count: 0 };
      groups[type].co2 += r.total_co2_mt;
      groups[type].cost += r.total_cost_eur;
      groups[type].count++;
    });
    return Object.entries(groups).map(([name, v]) => ({
      name: name.replace(/_/g, " ").toUpperCase(),
      ...v,
    }));
  }, [records]);

  const byFuelType = useMemo(() => {
    const groups: Record<string, { co2: number; consumed: number; count: number }> = {};
    records.forEach((r) => {
      const fuel = r.fuel_type || "unknown";
      if (!groups[fuel]) groups[fuel] = { co2: 0, consumed: 0, count: 0 };
      groups[fuel].co2 += r.total_co2_mt;
      groups[fuel].consumed += Number(r.fuel_consumed_mt || 0);
      groups[fuel].count++;
    });
    return Object.entries(groups).map(([name, v]) => ({ name, ...v }));
  }, [records]);

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Emissions by Voyage Type</CardTitle></CardHeader>
          <CardContent>
            {byVoyageType.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground">No voyage data</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={byVoyageType}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" fontSize={10} />
                  <YAxis fontSize={11} />
                  <Tooltip formatter={(v: number) => `${v.toLocaleString()} tCO₂`} />
                  <Bar dataKey="co2" fill="hsl(var(--primary))" radius={[4,4,0,0]} name="CO₂ (MT)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Emissions by Fuel Type</CardTitle></CardHeader>
          <CardContent>
            {byFuelType.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground">No fuel data</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={byFuelType} dataKey="co2" nameKey="name" cx="50%" cy="50%" outerRadius={75} label>
                    {byFuelType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v.toLocaleString()} tCO₂`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Efficiency table */}
      <Card>
        <CardHeader><CardTitle className="text-base">Fuel Efficiency Analysis</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr className="text-muted-foreground">
                <th className="text-left p-2">Fuel</th>
                <th className="text-right p-2">Consumed (MT)</th>
                <th className="text-right p-2">CO₂ (MT)</th>
                <th className="text-right p-2">Emission Factor</th>
                <th className="text-right p-2">Voyages</th>
              </tr>
            </thead>
            <tbody>
              {byFuelType.map((f) => (
                <tr key={f.name} className="border-b hover:bg-muted/30">
                  <td className="p-2 font-medium">{f.name}</td>
                  <td className="p-2 text-right font-mono">{f.consumed.toLocaleString()}</td>
                  <td className="p-2 text-right font-mono">{f.co2.toLocaleString()}</td>
                  <td className="p-2 text-right font-mono text-xs">{FUEL_EMISSION_FACTORS[f.name]?.toFixed(3) || "—"} t/t</td>
                  <td className="p-2 text-right">{f.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Main Overview Tab ─── */
function ETSOverviewTab() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [showCreate, setShowCreate] = useState(false);
  const queryClient = useQueryClient();
  const { data: records = [], isLoading } = useEUETSRecords(year);

  const totals = useMemo(() => {
    const totalCO2 = records.reduce((s, r) => s + r.total_co2_mt, 0);
    const etsCO2 = records.reduce((s, r) => s + r.co2_subject_to_ets, 0);
    const totalCost = records.reduce((s, r) => s + r.total_cost_eur, 0);
    const allowancesNeeded = records.reduce((s, r) => s + r.allowances_required, 0);
    const allowancesBought = records.reduce((s, r) => s + r.allowances_purchased, 0);
    const fueleuPenalty = records.reduce((s, r) => s + r.fueleu_penalty_eur, 0);
    const dcsReported = records.filter(r => r.imo_dcs_reported).length;
    return { totalCO2, etsCO2, totalCost, allowancesNeeded, allowancesBought, fueleuPenalty, count: records.length, dcsReported };
  }, [records]);

  const createRecordHook = useCreateETSRecord();
  const createRecord = {
    mutate: (rec: any) => {
      const etsPercentage = year <= 2024 ? 40 : year === 2025 ? 70 : 100;
      const voyageMultiplier = rec.voyage_type === "intra_eu" ? 1.0 : rec.voyage_type === "non_eu" ? 0 : 0.5;
      const co2Subject = rec.total_co2_mt * voyageMultiplier;
      const allowancesReq = Math.ceil(co2Subject * (etsPercentage / 100));
      const cost = allowancesReq * (rec.allowance_price_eur || 80);

      createRecordHook.mutateAsync({
        ...rec,
        reporting_year: year,
        ets_percentage: etsPercentage,
        co2_subject_to_ets: co2Subject,
        allowances_required: allowancesReq,
        total_cost_eur: cost,
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ["eu_ets_tracking"] });
        setShowCreate(false);
      });
    },
    isPending: createRecordHook.isPending,
  };

  const etsPhaseIn = year <= 2024 ? 40 : year === 2025 ? 70 : 100;

  return (
    <div className="space-y-4">
      {/* Phase-in banner */}
      <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
        <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-semibold">EU ETS Maritime — Phase-in {year}</h3>
            <p className="text-sm text-muted-foreground">
              {etsPhaseIn}% das emissões sujeitas ao ETS • Preço médio EUA: ~€80/tCO₂
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026, 2027, 2028].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Registrar Viagem</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Registrar Emissões de Viagem</DialogTitle></DialogHeader>
                <form onSubmit={e => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  createRecord.mutate({
                    voyage_type: fd.get("voyage_type"),
                    total_co2_mt: Number(fd.get("total_co2_mt")),
                    fuel_type: fd.get("fuel_type"),
                    fuel_consumed_mt: Number(fd.get("fuel_consumed_mt")) || null,
                    distance_nm: Number(fd.get("distance_nm")) || null,
                    departure_port: fd.get("departure_port"),
                    arrival_port: fd.get("arrival_port"),
                    allowance_price_eur: Number(fd.get("allowance_price_eur")) || 80,
                  });
                }} className="space-y-3">
                  <div>
                    <Label>Tipo de Viagem</Label>
                    <Select name="voyage_type" defaultValue="intra_eu">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="intra_eu">Intra-EU (100%)</SelectItem>
                        <SelectItem value="incoming_eu">Entrada EU (50%)</SelectItem>
                        <SelectItem value="outgoing_eu">Saída EU (50%)</SelectItem>
                        <SelectItem value="non_eu">Non-EU (0%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Porto Partida</Label><Input name="departure_port" placeholder="Rotterdam" /></div>
                    <div><Label>Porto Chegada</Label><Input name="arrival_port" placeholder="Piraeus" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>CO₂ Total (MT)</Label><Input name="total_co2_mt" type="number" step="0.1" required /></div>
                    <div><Label>Distância (NM)</Label><Input name="distance_nm" type="number" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Combustível</Label>
                      <Select name="fuel_type" defaultValue="VLSFO">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["HFO", "VLSFO", "MGO", "LNG", "methanol", "ammonia"].map(f => (
                            <SelectItem key={f} value={f}>{f}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>Consumo (MT)</Label><Input name="fuel_consumed_mt" type="number" step="0.1" /></div>
                  </div>
                  <div>
                    <Label>Preço EUA (€/tCO₂)</Label>
                    <Input name="allowance_price_eur" type="number" step="0.01" defaultValue="80" />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createRecord.isPending}>
                      {createRecord.isPending ? "Calculando..." : "Calcular & Salvar"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">CO₂ Total</p>
          <p className="text-2xl font-bold">{totals.totalCO2.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">toneladas</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">CO₂ Sujeito ETS</p>
          <p className="text-2xl font-bold text-warning">{totals.etsCO2.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{etsPhaseIn}% phase-in</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Custo ETS</p>
          <p className="text-2xl font-bold text-destructive">€{totals.totalCost.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{totals.allowancesNeeded} EUAs</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">FuelEU Penalty</p>
          <p className="text-2xl font-bold">{totals.fueleuPenalty > 0 ? `€${totals.fueleuPenalty.toLocaleString()}` : "€0"}</p>
          <p className="text-xs text-muted-foreground">multas</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">IMO DCS</p>
          <p className="text-2xl font-bold text-success">{totals.dcsReported}/{totals.count}</p>
          <p className="text-xs text-muted-foreground">reported</p>
        </CardContent></Card>
      </div>

      {/* Records */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : records.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">
          <Leaf className="h-10 w-10 mx-auto mb-2 opacity-50" />
          Nenhum registro para {year}. Adicione viagens para calcular exposição ETS.
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {records.map(r => (
            <Card key={r.id} className="hover:border-primary/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{r.voyage_type?.replace("_", " ").toUpperCase()}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{r.fuel_type}</Badge>
                      <Badge className={r.status === "submitted" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}>
                        {r.status}
                      </Badge>
                      {r.imo_dcs_reported && <Badge className="bg-success/20 text-success text-[10px]">DCS ✓</Badge>}
                      {r.eexi_compliant === true && <Badge className="bg-success/20 text-success text-[10px]">EEXI ✓</Badge>}
                      {r.eexi_compliant === false && <Badge className="bg-destructive/20 text-destructive text-[10px]">EEXI ✗</Badge>}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span>🏭 {r.total_co2_mt.toLocaleString()} tCO₂</span>
                      <span>📊 {r.co2_subject_to_ets.toLocaleString()} tCO₂ (ETS)</span>
                      <span>💶 €{r.total_cost_eur.toLocaleString()}</span>
                      {r.distance_nm && <span>🚢 {r.distance_nm.toLocaleString()} NM</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{r.allowances_required} EUAs</p>
                    <p className="text-xs text-muted-foreground">@ €{r.allowance_price_eur || 80}/t</p>
                    {r.fuel_consumed_mt && r.distance_nm && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {(r.fuel_consumed_mt / (r.distance_nm / 1000)).toFixed(1)} MT/1000NM
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Compliance Timeline Tab ─── */
function ComplianceTimelineTab() {
  const deadlines = [
    { date: "2025-03-31", label: "EU MRV Annual Report Submission", status: "upcoming", framework: "EU MRV" },
    { date: "2025-04-30", label: "IMO DCS Data Submission to Flag State", status: "upcoming", framework: "IMO DCS" },
    { date: "2025-09-30", label: "EU ETS Allowance Surrender (2024 emissions)", status: "upcoming", framework: "EU ETS" },
    { date: "2026-01-01", label: "FuelEU Maritime — Enforcement Begins", status: "future", framework: "FuelEU" },
    { date: "2026-03-31", label: "EU MRV Annual Report (2025 data)", status: "future", framework: "EU MRV" },
    { date: "2026-09-30", label: "EU ETS Allowance Surrender (2025 — 70%)", status: "future", framework: "EU ETS" },
    { date: "2027-09-30", label: "EU ETS Allowance Surrender (2026 — 100%)", status: "future", framework: "EU ETS" },
  ];

  const frameworkColors: Record<string, string> = {
    "EU ETS": "bg-warning/20 text-warning",
    "EU MRV": "bg-primary/20 text-primary",
    "IMO DCS": "bg-blue-500/20 text-blue-400",
    "FuelEU": "bg-success/20 text-success",
  };

  return (
    <div className="space-y-3">
      <Card className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/20">
        <CardContent className="p-4">
          <h3 className="font-semibold">Regulatory Compliance Calendar</h3>
          <p className="text-sm text-muted-foreground">Key deadlines for EU ETS, MRV, IMO DCS & FuelEU Maritime</p>
        </CardContent>
      </Card>
      {deadlines.map((d, i) => {
        const isPast = new Date(d.date) < new Date();
        return (
          <Card key={i} className={isPast ? "opacity-50" : ""}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isPast ? "bg-success" : d.status === "upcoming" ? "bg-warning animate-pulse" : "bg-muted-foreground"}`} />
                <div>
                  <p className="text-sm font-medium">{d.label}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(d.date), "dd MMMM yyyy")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={frameworkColors[d.framework] || ""}>{d.framework}</Badge>
                {isPast && <Badge className="bg-success/20 text-success">Done</Badge>}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/* ─── Main Page ─── */
export default function EUETSHubPage() {
  const { data: records = [] } = useEUETSRecords();

  const stats = useMemo(() => {
    const totalCO2 = records.reduce((s, r) => s + r.total_co2_mt, 0);
    const totalCost = records.reduce((s, r) => s + r.total_cost_eur, 0);
    const submitted = records.filter(r => r.status === "submitted").length;
    const eexi = records.filter(r => r.eexi_compliant === true).length;
    return { totalCO2, totalCost, voyages: records.length, submitted, eexi };
  }, [records]);

  const kpis = [
    { id: "co2", title: "CO₂ Total", value: `${(stats.totalCO2 / 1000).toFixed(1)}k t`, icon: Factory, color: "warning" as const },
    { id: "cost", title: "Custo ETS", value: `€${(stats.totalCost / 1000).toFixed(0)}k`, icon: TrendingDown, color: "destructive" as const },
    { id: "voyages", title: "Viagens", value: stats.voyages, icon: Globe, color: "primary" as const },
    { id: "submitted", title: "Submetidos", value: stats.submitted, icon: FileCheck, color: "success" as const },
  ];

  const tabs: ModuleTab[] = [
    { id: "overview", label: "EU ETS & FuelEU", icon: Leaf, content: <ETSOverviewTab />, badge: stats.voyages },
    { id: "portfolio", label: "Allowances", icon: Wallet, content: <AllowancePortfolioTab /> },
    { id: "forecast", label: "Cost Forecast", icon: TrendingDown, content: <CostForecastTab /> },
    { id: "emissions", label: "Emissions", icon: BarChart3, content: <VoyageEmissionsTab /> },
    { id: "timeline", label: "Compliance", icon: Calendar, content: <ComplianceTimelineTab /> },
  ];

  return (
    <PremiumModuleShell
      title="EU ETS & FuelEU Maritime"
      subtitle="Emissões • Allowances EUA • EEXI • IMO DCS • FuelEU Compliance"
      icon={Leaf}
      iconGradient="from-green-500 to-emerald-500"
      tabs={tabs}
      defaultTab="overview"
      showAIBadge
      aiStatus="active"
    >
      <div className="mt-6">
        <SmartKPIGrid kpis={kpis} columns={4} />
      </div>
    </PremiumModuleShell>
  );
}
