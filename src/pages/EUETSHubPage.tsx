/**
 * EU ETS & FuelEU Maritime Compliance Hub
 * Sprint 7-8: Emissions tracking, allowances, EEXI, IMO DCS
 */

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
  FileCheck, Globe, BarChart3, AlertTriangle, type LucideIcon
} from "lucide-react";

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
    return { totalCO2, etsCO2, totalCost, allowancesNeeded, allowancesBought, fueleuPenalty, count: records.length };
  }, [records]);

  const createRecord = useMutation({
    mutationFn: async (rec: any) => {
      // Calculate ETS percentage based on year
      const etsPercentage = year <= 2024 ? 40 : year === 2025 ? 70 : 100;
      const voyageMultiplier = rec.voyage_type === "intra_eu" ? 1.0 : rec.voyage_type === "non_eu" ? 0 : 0.5;
      const co2Subject = rec.total_co2_mt * voyageMultiplier;
      const allowancesReq = Math.ceil(co2Subject * (etsPercentage / 100));
      const cost = allowancesReq * (rec.allowance_price_eur || 80);

      const { error } = await supabase.from("eu_ets_tracking" as any).insert({
        ...rec,
        reporting_year: year,
        ets_percentage: etsPercentage,
        co2_subject_to_ets: co2Subject,
        allowances_required: allowancesReq,
        total_cost_eur: cost,
        status: "calculated",
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eu_ets_tracking"] });
      toast.success("Registro ETS criado");
      setShowCreate(false);
    },
    onError: () => toast.error("Erro ao criar registro"),
  });

  const etsPhaseIn = year <= 2024 ? 40 : year === 2025 ? 70 : 100;

  return (
    <div className="space-y-4">
      {/* Phase-in banner */}
      <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
        <CardContent className="p-4 flex items-center justify-between">
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
                {[2024, 2025, 2026, 2027].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">CO₂ Total</p>
            <p className="text-2xl font-bold">{totals.totalCO2.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">toneladas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">CO₂ Sujeito ETS</p>
            <p className="text-2xl font-bold text-warning">{totals.etsCO2.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">toneladas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Custo ETS</p>
            <p className="text-2xl font-bold text-destructive">€{totals.totalCost.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{totals.allowancesNeeded} EUAs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Penalidade FuelEU</p>
            <p className="text-2xl font-bold">{totals.fueleuPenalty > 0 ? `€${totals.fueleuPenalty.toLocaleString()}` : "€0"}</p>
            <p className="text-xs text-muted-foreground">multas</p>
          </CardContent>
        </Card>
      </div>

      {/* Records */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : records.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">
          Nenhum registro para {year}. Adicione viagens para calcular exposição ETS.
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {records.map(r => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{r.voyage_type?.replace("_", " ").toUpperCase()}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{r.fuel_type}</Badge>
                      <Badge className={r.status === "submitted" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}>
                        {r.status}
                      </Badge>
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
