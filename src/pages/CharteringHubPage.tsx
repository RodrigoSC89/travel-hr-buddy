/**
 * Chartering Hub — Spot/TC/COA Charter Party Management
 * Sprint 7-8: Full charter lifecycle with financials
 */

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCreateCharterParty, useUpdateCharterStatus } from "@/hooks/useModuleHooks";
import { CrossModulePanel } from "@/components/integration";
import { PremiumModuleShell, type ModuleTab } from "@/components/ui/premium-module-kit/PremiumModuleShell";
import { SmartKPIGrid } from "@/components/ui/premium-module-kit/SmartKPIGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Anchor, Ship, FileText, DollarSign, Plus, Search,
  Filter, TrendingUp, Globe, Package, Handshake, type LucideIcon
} from "lucide-react";
import { FixtureNegotiationWorkflow } from "@/components/commercial/FixtureNegotiationWorkflow";

interface CharterParty {
  id: string; charter_number: string; vessel_id: string | null;
  charter_type: string; charter_form: string | null;
  charterer_name: string; owner_name: string | null;
  laycan_from: string | null; laycan_to: string | null;
  commencement_date: string | null; redelivery_date: string | null;
  freight_rate: number | null; hire_rate: number | null;
  freight_type: string | null; worldscale_rate: number | null;
  cargo_type: string | null; cargo_quantity_mt: number | null;
  loading_port: string | null; discharge_port: string | null;
  demurrage_rate: number | null; laytime_terms: string | null;
  coa_total_quantity_mt: number | null; coa_shipped_mt: number | null;
  coa_shipments_total: number | null; coa_shipments_completed: number | null;
  status: string; tce_achieved: number | null; net_profit: number | null;
  broker_name: string | null; created_at: string;
}

const CP_STATUSES: Record<string, { label: string; color: string }> = {
  negotiating: { label: "Negociando", color: "bg-muted text-muted-foreground" },
  on_subs: { label: "On Subs", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  fixed: { label: "Fixado", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200" },
  loading: { label: "Carregando", color: "bg-warning/20 text-warning" },
  sailing: { label: "Navegando", color: "bg-primary/20 text-primary" },
  discharging: { label: "Descarregando", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  completed: { label: "Concluído", color: "bg-success/20 text-success" },
  cancelled: { label: "Cancelado", color: "bg-destructive/20 text-destructive" },
};

const TYPE_LABELS: Record<string, string> = {
  spot: "Spot", time_charter: "Time Charter", coa: "COA", bareboat: "Bareboat",
};

function useCharterParties(typeFilter?: string) {
  return useQuery({
    queryKey: ["charter_parties", typeFilter],
    queryFn: async () => {
      let q = supabase.from("charter_parties" as any).select("*").order("created_at", { ascending: false });
      if (typeFilter && typeFilter !== "all") q = q.eq("charter_type", typeFilter);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as unknown as CharterParty[];
    },
  });
}

function CharterPartiesTab() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const queryClient = useQueryClient();
  const { data: charters = [], isLoading } = useCharterParties(typeFilter);

  const filtered = useMemo(() => {
    if (!search) return charters;
    const q = search.toLowerCase();
    return charters.filter(cp =>
      cp.charter_number.toLowerCase().includes(q) ||
      cp.charterer_name.toLowerCase().includes(q) ||
      (cp.cargo_type || "").toLowerCase().includes(q)
    );
  }, [charters, search]);

  const createCPHook = useCreateCharterParty();
  const createCP = {
    mutate: (cp: any) => {
      createCPHook.mutateAsync(cp).then(() => {
        queryClient.invalidateQueries({ queryKey: ["charter_parties"] });
        setShowCreate(false);
      });
    },
    isPending: createCPHook.isPending,
  };

  const updateStatusHook = useUpdateCharterStatus();
  const updateStatus = {
    mutate: ({ id, status }: { id: string; status: string }) => {
      updateStatusHook.mutateAsync({ id, status }).then(() => {
        queryClient.invalidateQueries({ queryKey: ["charter_parties"] });
      });
    },
    isPending: updateStatusHook.isPending,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-56" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="spot">Spot</SelectItem>
              <SelectItem value="time_charter">Time Charter</SelectItem>
              <SelectItem value="coa">COA</SelectItem>
              <SelectItem value="bareboat">Bareboat</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Nova Charter Party</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Nova Charter Party</DialogTitle></DialogHeader>
            <form onSubmit={e => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              createCP.mutate({
                charter_type: fd.get("charter_type"),
                charter_form: fd.get("charter_form"),
                charterer_name: fd.get("charterer_name"),
                cargo_type: fd.get("cargo_type"),
                cargo_quantity_mt: Number(fd.get("cargo_quantity_mt")) || null,
                loading_port: fd.get("loading_port"),
                discharge_port: fd.get("discharge_port"),
                freight_rate: Number(fd.get("freight_rate")) || null,
                freight_type: fd.get("freight_type"),
                demurrage_rate: Number(fd.get("demurrage_rate")) || null,
                laytime_terms: fd.get("laytime_terms"),
                laycan_from: fd.get("laycan_from") || null,
                laycan_to: fd.get("laycan_to") || null,
              });
            }} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tipo</Label>
                  <Select name="charter_type" defaultValue="spot">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spot">Spot</SelectItem>
                      <SelectItem value="time_charter">Time Charter</SelectItem>
                      <SelectItem value="coa">COA</SelectItem>
                      <SelectItem value="bareboat">Bareboat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Charter Form</Label>
                  <Select name="charter_form" defaultValue="GENCON">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["GENCON", "NYPE", "SHELLTIME", "BALTIME", "ASBATANKVOY"].map(f => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Afretador</Label><Input name="charterer_name" required placeholder="Nome do afretador" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Carga</Label><Input name="cargo_type" placeholder="Iron Ore" /></div>
                <div><Label>Quantidade (MT)</Label><Input name="cargo_quantity_mt" type="number" placeholder="50000" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Porto Carga</Label><Input name="loading_port" placeholder="Santos" /></div>
                <div><Label>Porto Descarga</Label><Input name="discharge_port" placeholder="Rotterdam" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Frete ($/MT)</Label><Input name="freight_rate" type="number" step="0.01" /></div>
                <div>
                  <Label>Tipo Frete</Label>
                  <Select name="freight_type" defaultValue="per_mt">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="per_mt">$/MT</SelectItem>
                      <SelectItem value="lumpsum">Lump Sum</SelectItem>
                      <SelectItem value="per_day">$/dia</SelectItem>
                      <SelectItem value="worldscale">Worldscale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Demurrage ($/dia)</Label><Input name="demurrage_rate" type="number" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Laycan De</Label><Input name="laycan_from" type="date" /></div>
                <div><Label>Laycan Até</Label><Input name="laycan_to" type="date" /></div>
                <div>
                  <Label>Laytime Terms</Label>
                  <Select name="laytime_terms" defaultValue="SHINC">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SHINC">SHINC</SelectItem>
                      <SelectItem value="SHEX">SHEX</SelectItem>
                      <SelectItem value="WWD">WWD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createCP.isPending}>
                  {createCP.isPending ? "Criando..." : "Criar CP"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhuma charter party encontrada</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(cp => {
            const st = CP_STATUSES[cp.status] || CP_STATUSES.negotiating;
            return (
              <Card key={cp.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-muted-foreground">{cp.charter_number}</span>
                        <Badge variant="outline">{TYPE_LABELS[cp.charter_type] || cp.charter_type}</Badge>
                        <Badge className={st.color}>{st.label}</Badge>
                        {cp.charter_form && <Badge variant="secondary" className="text-[10px]">{cp.charter_form}</Badge>}
                      </div>
                      <h4 className="font-medium">{cp.charterer_name}</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        {cp.cargo_type && <span>📦 {cp.cargo_type} {cp.cargo_quantity_mt ? `(${cp.cargo_quantity_mt.toLocaleString()} MT)` : ""}</span>}
                        {cp.loading_port && cp.discharge_port && <span>🚢 {cp.loading_port} → {cp.discharge_port}</span>}
                        {cp.freight_rate && <span>💰 ${cp.freight_rate}/{cp.freight_type === "per_mt" ? "MT" : cp.freight_type === "per_day" ? "dia" : "LS"}</span>}
                        {cp.tce_achieved && <span>📊 TCE: ${cp.tce_achieved.toLocaleString()}/dia</span>}
                      </div>
                      {cp.charter_type === "coa" && cp.coa_shipments_total && (
                        <div className="text-xs text-muted-foreground">
                          COA: {cp.coa_shipments_completed}/{cp.coa_shipments_total} embarques • {((cp.coa_shipped_mt || 0) / 1000).toFixed(0)}k/{((cp.coa_total_quantity_mt || 0) / 1000).toFixed(0)}k MT
                        </div>
                      )}
                    </div>
                    <Select value={cp.status} onValueChange={s => updateStatus.mutate({ id: cp.id, status: s })}>
                      <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(CP_STATUSES).map(([v, { label }]) => (
                          <SelectItem key={v} value={v}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function CharteringHubPage() {
  const { data: charters = [] } = useCharterParties();

  const stats = useMemo(() => {
    const active = charters.filter(c => !["completed", "cancelled"].includes(c.status)).length;
    const spot = charters.filter(c => c.charter_type === "spot").length;
    const tc = charters.filter(c => c.charter_type === "time_charter").length;
    const coa = charters.filter(c => c.charter_type === "coa").length;
    return { total: charters.length, active, spot, tc, coa };
  }, [charters]);

  const kpis = [
    { id: "total", title: "Total CPs", value: stats.total, icon: FileText, color: "primary" as const },
    { id: "active", title: "Ativas", value: stats.active, icon: Ship, color: "warning" as const },
    { id: "spot", title: "Spot", value: stats.spot, icon: Anchor, color: "info" as const },
    { id: "tc", title: "Time Charter", value: stats.tc, icon: DollarSign, color: "success" as const },
  ];

  const tabs: ModuleTab[] = [
    { id: "charters", label: "Charter Parties", icon: FileText, content: <CharterPartiesTab />, badge: stats.active },
    { id: "fixture-negotiation", label: "Fixture Negotiation", icon: Handshake, content: <FixtureNegotiationWorkflow /> },
  ];

  return (
    <PremiumModuleShell
      title="Chartering — Charter Party Management"
      subtitle="Spot • Time Charter • COA • Bareboat • GENCON/NYPE/SHELLTIME"
      icon={Anchor}
      iconGradient="from-blue-500 to-cyan-500"
      tabs={tabs}
      defaultTab="charters"
    >
      <div className="mt-6">
        <SmartKPIGrid kpis={kpis} columns={4} />
      </div>
    </PremiumModuleShell>
  );
}
