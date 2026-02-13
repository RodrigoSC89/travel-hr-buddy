/**
 * Unified Logistics Dashboard
 * Cargo tracking, supplier management, and port call optimization
 */

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Package, Ship, Anchor, MapPin, Clock, CheckCircle, AlertTriangle,
  Search, RefreshCw, DollarSign, Building, Star, Phone, Mail, Calendar,
  ArrowRight, Fuel, FileText, Globe, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────
interface Cargo {
  id: string;
  tracking_number: string;
  cargo_description: string;
  shipment_type: string;
  weight_kg: number;
  volume_cbm: number;
  origin_port: string;
  destination_port: string;
  status: string;
  priority: string;
  estimated_arrival: string | null;
  shipping_cost: number;
  customs_status: string | null;
  current_location: string | null;
  departure_date: string | null;
}

interface Supplier {
  id: string;
  company_name: string;
  trading_name: string | null;
  category: string[];
  rating: number;
  total_orders: number;
  contact_email: string;
  contact_phone: string;
  city: string | null;
  country: string | null;
  is_active: boolean;
  website: string | null;
  services: string[] | null;
  payment_terms: string | null;
  lead_time_days: number | null;
}

interface PortCall {
  id: string;
  port_name: string;
  port_code: string;
  vessel_name: string;
  vessel_id: string | null;
  eta: string;
  etd: string | null;
  berth_number: string | null;
  purpose: string | null;
  status: string;
  agent_name: string | null;
  agent_contact: string | null;
  psc_risk_level: string | null;
  estimated_costs: number | null;
  documents_status: string | null;
  country: string | null;
}

// ── Status helpers ───────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  preparing: { label: "Preparando", class: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  in_transit: { label: "Em Trânsito", class: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  customs: { label: "Alfândega", class: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  delivered: { label: "Entregue", class: "bg-green-500/20 text-green-400 border-green-500/30" },
  delayed: { label: "Atrasado", class: "bg-destructive/20 text-destructive border-destructive/30" },
  cancelled: { label: "Cancelado", class: "bg-muted text-muted-foreground border-muted" },
  scheduled: { label: "Agendado", class: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  approaching: { label: "Aproximando", class: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  arrived: { label: "Atracado", class: "bg-green-500/20 text-green-400 border-green-500/30" },
  berthed: { label: "Atracado", class: "bg-green-500/20 text-green-400 border-green-500/30" },
  departed: { label: "Partiu", class: "bg-muted text-muted-foreground border-muted" },
  completed: { label: "Concluído", class: "bg-green-500/20 text-green-400 border-green-500/30" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, class: "bg-muted text-muted-foreground" };
  return <Badge variant="outline" className={cn("text-xs border", cfg.class)}>{cfg.label}</Badge>;
}

function PriorityBadge({ priority }: { priority: string }) {
  const cls = priority === "high" ? "bg-destructive/20 text-destructive border-destructive/30"
    : priority === "medium" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    : "bg-muted text-muted-foreground";
  return <Badge variant="outline" className={cn("text-xs border", cls)}>{priority}</Badge>;
}

// ── Empty state component ────────────────────────────────────────────
function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: {
  icon: React.ElementType; title: string; description: string;
  actionLabel?: string; onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="gap-2">
          <Plus className="h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────
export function UnifiedLogisticsDashboard() {
  const [activeTab, setActiveTab] = useState("cargo");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddCargoOpen, setIsAddCargoOpen] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isAddPortCallOpen, setIsAddPortCallOpen] = useState(false);
  const queryClient = useQueryClient();

  // ── Cargo Form ──
  const [cargoForm, setCargoForm] = useState({
    tracking_number: "", cargo_description: "", shipment_type: "maritime",
    weight_kg: 0, volume_cbm: 0, origin_port: "", destination_port: "",
    estimated_arrival: "", shipping_cost: 0, priority: "medium",
  });

  // ── Supplier Form ──
  const [supplierForm, setSupplierForm] = useState({
    company_name: "", trading_name: "", category: "general",
    contact_email: "", contact_phone: "", city: "", country: "",
    website: "", payment_terms: "NET30",
  });

  // ── Port Call Form ──
  const [portCallForm, setPortCallForm] = useState({
    port_name: "", port_code: "", vessel_id: "",
    eta: "", etd: "", berth_number: "", purpose: "cargo_operations",
    agent_name: "", agent_contact: "", country: "",
  });

  // ═══ QUERIES ═══════════════════════════════════════════════════════

  const { data: cargoData = [], isLoading: cargoLoading, refetch: refetchCargo } = useQuery({
    queryKey: ["logistics-cargo"],
    queryFn: async (): Promise<Cargo[]> => {
      const { data, error } = await supabase
        .from("shipments")
        .select("id, tracking_number, cargo_description, shipment_type, weight_kg, volume_cbm, origin_port, destination_port, status, priority, estimated_arrival, shipping_cost, customs_status, current_location, departure_date")
        .order("created_at", { ascending: false });
      if (error) { toast.error("Erro ao carregar cargas"); return []; }
      return (data || []) as Cargo[];
    },
  });

  const { data: suppliers = [], isLoading: suppliersLoading, refetch: refetchSuppliers } = useQuery({
    queryKey: ["logistics-suppliers"],
    queryFn: async (): Promise<Supplier[]> => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("id, company_name, trading_name, category, rating, total_orders, contact_email, contact_phone, city, country, is_active, website, services, payment_terms, lead_time_days")
        .order("rating", { ascending: false });
      if (error) { toast.error("Erro ao carregar fornecedores"); return []; }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- supplier row shape varies, need to normalize arrays
      return (data || []).map((s: Record<string, unknown>) => ({
        ...s,
        category: Array.isArray(s.category) ? s.category : [String(s.category || "general")],
        services: Array.isArray(s.services) ? s.services : [],
      })) as Supplier[];
    },
  });

  const { data: vessels = [] } = useQuery({
    queryKey: ["vessels-list"],
    queryFn: async () => {
      const { data } = await supabase.from("vessels").select("id, name").order("name");
      return data || [];
    },
  });

  const { data: portCalls = [], isLoading: portCallsLoading, refetch: refetchPortCalls } = useQuery({
    queryKey: ["port-calls"],
    queryFn: async (): Promise<PortCall[]> => {
      const { data, error } = await supabase
        .from("port_calls")
        .select("id, port_name, port_code, vessel_id, eta, etd, berth_number, purpose, status, agent_name, agent_contact, psc_risk_level, estimated_costs, documents_status, country, vessels(name)")
        .order("eta", { ascending: true });
      if (error) { toast.error("Erro ao carregar port calls"); return []; }
      return (data || []).map((p) => ({
        ...p,
        vessel_name: p.vessels?.name || "N/A",
      })) as PortCall[];
    },
  });

  // ═══ MUTATIONS ═════════════════════════════════════════════════════

  const addCargoMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("shipments").insert({
        tracking_number: cargoForm.tracking_number || `CRG-${Date.now()}`,
        cargo_description: cargoForm.cargo_description,
        shipment_type: cargoForm.shipment_type,
        weight_kg: cargoForm.weight_kg,
        volume_cbm: cargoForm.volume_cbm,
        origin_port: cargoForm.origin_port,
        destination_port: cargoForm.destination_port,
        estimated_arrival: cargoForm.estimated_arrival || null,
        shipping_cost: cargoForm.shipping_cost,
        priority: cargoForm.priority,
        status: "preparing",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logistics-cargo"] });
      setIsAddCargoOpen(false);
      setCargoForm({ tracking_number: "", cargo_description: "", shipment_type: "maritime", weight_kg: 0, volume_cbm: 0, origin_port: "", destination_port: "", estimated_arrival: "", shipping_cost: 0, priority: "medium" });
      toast.success("Carga adicionada com sucesso!");
    },
    onError: () => toast.error("Erro ao adicionar carga"),
  });

  const deleteCargoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("shipments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logistics-cargo"] });
      toast.success("Carga removida");
    },
    onError: () => toast.error("Erro ao remover carga"),
  });

  const addSupplierMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("suppliers").insert({
        company_name: supplierForm.company_name,
        trading_name: supplierForm.trading_name || null,
        category: [supplierForm.category],
        contact_email: supplierForm.contact_email,
        contact_phone: supplierForm.contact_phone,
        city: supplierForm.city || null,
        country: supplierForm.country || null,
        website: supplierForm.website || null,
        payment_terms: supplierForm.payment_terms,
        is_active: true,
        rating: 0,
        total_orders: 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logistics-suppliers"] });
      setIsAddSupplierOpen(false);
      setSupplierForm({ company_name: "", trading_name: "", category: "general", contact_email: "", contact_phone: "", city: "", country: "", website: "", payment_terms: "NET30" });
      toast.success("Fornecedor adicionado!");
    },
    onError: () => toast.error("Erro ao adicionar fornecedor"),
  });

  const deleteSupplierMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("suppliers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logistics-suppliers"] });
      toast.success("Fornecedor removido");
    },
    onError: () => toast.error("Erro ao remover fornecedor"),
  });

  const addPortCallMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("port_calls").insert({
        port_name: portCallForm.port_name,
        port_code: portCallForm.port_code,
        vessel_id: portCallForm.vessel_id || null,
        eta: portCallForm.eta,
        etd: portCallForm.etd || null,
        berth_number: portCallForm.berth_number || null,
        purpose: portCallForm.purpose,
        agent_name: portCallForm.agent_name || null,
        agent_contact: portCallForm.agent_contact || null,
        country: portCallForm.country || null,
        status: "scheduled",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["port-calls"] });
      setIsAddPortCallOpen(false);
      setPortCallForm({ port_name: "", port_code: "", vessel_id: "", eta: "", etd: "", berth_number: "", purpose: "cargo_operations", agent_name: "", agent_contact: "", country: "" });
      toast.success("Port Call agendado!");
    },
    onError: () => toast.error("Erro ao adicionar port call"),
  });

  const deletePortCallMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("port_calls").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["port-calls"] });
      toast.success("Port Call removido");
    },
    onError: () => toast.error("Erro ao remover port call"),
  });

  // ═══ COMPUTED ══════════════════════════════════════════════════════

  const stats = {
    totalCargo: cargoData.length,
    inTransit: cargoData.filter(c => c.status === "in_transit").length,
    delivered: cargoData.filter(c => c.status === "delivered").length,
    delayed: cargoData.filter(c => c.status === "delayed").length,
    activeSuppliers: suppliers.filter(s => s.is_active).length,
    upcomingPortCalls: portCalls.filter(p => p.status === "scheduled" || p.status === "approaching").length,
  };

  const filteredCargo = cargoData.filter(c =>
    (c.tracking_number || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.cargo_description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.destination_port || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSuppliers = suppliers.filter(s =>
    (s.company_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.category || []).join(" ").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefreshAll = () => {
    refetchCargo(); refetchSuppliers(); refetchPortCalls();
    toast.success("Dados atualizados!");
  };

  // ═══ RENDER ════════════════════════════════════════════════════════

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Unified Logistics Dashboard
          </h2>
          <p className="text-muted-foreground">
            Cargo tracking, supplier management, and port operations
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === "cargo" && (
            <Button onClick={() => setIsAddCargoOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Nova Carga
            </Button>
          )}
          {activeTab === "suppliers" && (
            <Button onClick={() => setIsAddSupplierOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Novo Fornecedor
            </Button>
          )}
          {activeTab === "ports" && (
            <Button onClick={() => setIsAddPortCallOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Novo Port Call
            </Button>
          )}
          <Button variant="outline" onClick={handleRefreshAll}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Total Cargo", value: stats.totalCargo, icon: Package, color: "text-primary" },
          { label: "Em Trânsito", value: stats.inTransit, icon: Ship, color: "text-purple-400" },
          { label: "Entregues", value: stats.delivered, icon: CheckCircle, color: "text-green-400" },
          { label: "Atrasados", value: stats.delayed, icon: AlertTriangle, color: "text-destructive" },
          { label: "Fornecedores", value: stats.activeSuppliers, icon: Building, color: "text-blue-400" },
          { label: "Port Calls", value: stats.upcomingPortCalls, icon: Anchor, color: "text-cyan-400" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
                <s.icon className={cn("h-8 w-8 opacity-50", s.color)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ══ ADD FORMS ══ */}
      {isAddCargoOpen && <CargoForm form={cargoForm} setForm={setCargoForm} onSubmit={() => addCargoMutation.mutate()} onCancel={() => setIsAddCargoOpen(false)} loading={addCargoMutation.isPending} />}
      {isAddSupplierOpen && <SupplierForm form={supplierForm} setForm={setSupplierForm} onSubmit={() => addSupplierMutation.mutate()} onCancel={() => setIsAddSupplierOpen(false)} loading={addSupplierMutation.isPending} />}
      {isAddPortCallOpen && <PortCallForm form={portCallForm} setForm={setPortCallForm} onSubmit={() => addPortCallMutation.mutate()} onCancel={() => setIsAddPortCallOpen(false)} loading={addPortCallMutation.isPending} vessels={vessels} />}

      {/* ══ TABS ══ */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cargo" className="gap-2">
            <Package className="h-4 w-4" /> Cargo Tracking
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="gap-2">
            <Building className="h-4 w-4" /> Suppliers ({suppliers.length})
          </TabsTrigger>
          <TabsTrigger value="ports" className="gap-2">
            <Anchor className="h-4 w-4" /> Port Operations ({portCalls.length})
          </TabsTrigger>
        </TabsList>

        {/* ── CARGO TAB ── */}
        <TabsContent value="cargo" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Cargo Shipments</CardTitle>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar carga..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 w-64" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {cargoLoading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={`cargo-skeleton-${i}`} className="h-20 rounded-lg bg-muted animate-pulse" />)}
                </div>
              ) : filteredCargo.length === 0 ? (
                <EmptyState icon={Package} title="Nenhuma carga registrada" description="Adicione sua primeira carga para começar o rastreamento de shipments." actionLabel="Adicionar Carga" onAction={() => setIsAddCargoOpen(true)} />
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {filteredCargo.map((cargo) => (
                      <div key={cargo.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-lg bg-primary/10">
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium">{cargo.tracking_number || "Sem tracking"}</p>
                              <StatusBadge status={cargo.status} />
                              <PriorityBadge priority={cargo.priority || "medium"} />
                              {cargo.customs_status && <Badge variant="outline" className="text-xs"><FileText className="h-3 w-3 mr-1" />{cargo.customs_status}</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">{cargo.cargo_description || cargo.shipment_type}</p>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {cargo.origin_port || "—"}
                                <ArrowRight className="h-3 w-3" />
                                {cargo.destination_port || "—"}
                              </span>
                              {cargo.current_location && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{cargo.current_location}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium">{(cargo.weight_kg / 1000).toFixed(1)} tons</p>
                            {cargo.volume_cbm > 0 && <p className="text-xs text-muted-foreground">{cargo.volume_cbm} m³</p>}
                            {cargo.estimated_arrival && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                ETA: {new Date(cargo.estimated_arrival).toLocaleDateString("pt-BR")}
                              </div>
                            )}
                            {cargo.shipping_cost > 0 && (
                              <div className="flex items-center gap-1 text-sm text-green-400">
                                <DollarSign className="h-3 w-3" />
                                {cargo.shipping_cost.toLocaleString("pt-BR")}
                              </div>
                            )}
                          </div>
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => { if(confirm("Deseja deletar esta carga?")) deleteCargoMutation.mutate(cargo.id); }} aria-label="Excluir carga" title="Excluir carga">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── SUPPLIERS TAB ── */}
        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gestão de Fornecedores</CardTitle>
                  <CardDescription>Gerencie e acompanhe o desempenho dos fornecedores</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar fornecedor..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 w-64" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {suppliersLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[1,2,3].map(i => <div key={`supplier-skeleton-${i}`} className="h-48 rounded-lg bg-muted animate-pulse" />)}
                </div>
              ) : filteredSuppliers.length === 0 ? (
                <EmptyState icon={Building} title="Nenhum fornecedor cadastrado" description="Adicione fornecedores para gerenciar a cadeia de suprimentos." actionLabel="Adicionar Fornecedor" onAction={() => setIsAddSupplierOpen(true)} />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredSuppliers.map((supplier) => (
                    <Card key={supplier.id} className="overflow-hidden group">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base truncate">{supplier.company_name}</CardTitle>
                            {supplier.trading_name && <p className="text-xs text-muted-foreground truncate">{supplier.trading_name}</p>}
                            <div className="flex flex-wrap gap-1 mt-1">
                              {supplier.category.map((cat) => (
                                <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge variant={supplier.is_active ? "default" : "outline"} className="text-xs">
                              {supplier.is_active ? "Ativo" : "Inativo"}
                            </Badge>
                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => { if(confirm(`Remover ${supplier.company_name}?`)) deleteSupplierMutation.mutate(supplier.id); }} aria-label={`Remover ${supplier.company_name}`} title="Remover fornecedor">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Rating */}
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map((star) => (
                            <Star key={star} className={cn("h-4 w-4", star <= Math.round(supplier.rating) ? "fill-yellow-500 text-yellow-500" : "text-muted")} />
                          ))}
                          <span className="text-sm text-muted-foreground ml-1">{supplier.rating?.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">({supplier.total_orders || 0} pedidos)</span>
                        </div>

                        {/* Details */}
                        <div className="pt-2 border-t space-y-1.5 text-sm">
                          {(supplier.city || supplier.country) && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate">{[supplier.city, supplier.country].filter(Boolean).join(", ")}</span>
                            </div>
                          )}
                          {supplier.contact_email && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="h-3 w-3 shrink-0" />
                              <span className="truncate">{supplier.contact_email}</span>
                            </div>
                          )}
                          {supplier.contact_phone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-3 w-3 shrink-0" />
                              {supplier.contact_phone}
                            </div>
                          )}
                          {supplier.website && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Globe className="h-3 w-3 shrink-0" />
                              <a href={supplier.website} target="_blank" rel="noopener" className="truncate hover:text-primary">{supplier.website}</a>
                            </div>
                          )}
                          {supplier.payment_terms && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <DollarSign className="h-3 w-3 shrink-0" />
                              {supplier.payment_terms}
                              {supplier.lead_time_days && <span>• Lead: {supplier.lead_time_days}d</span>}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── PORT OPERATIONS TAB ── */}
        <TabsContent value="ports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Port Call Schedule</CardTitle>
              <CardDescription>Operações portuárias agendadas e em andamento</CardDescription>
            </CardHeader>
            <CardContent>
              {portCallsLoading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={`portcall-skeleton-${i}`} className="h-24 rounded-lg bg-muted animate-pulse" />)}
                </div>
              ) : portCalls.length === 0 ? (
                <EmptyState icon={Anchor} title="Nenhum port call agendado" description="Agende operações portuárias para suas embarcações." actionLabel="Agendar Port Call" onAction={() => setIsAddPortCallOpen(true)} />
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {portCalls.map((call) => (
                      <div key={call.id} className={cn("p-4 rounded-lg border group", call.status === "arrived" || call.status === "berthed" ? "border-green-500/30 bg-green-500/5" : call.status === "approaching" ? "border-yellow-500/30 bg-yellow-500/5" : "")}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-primary/10">
                              <Anchor className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium">{call.port_name}</p>
                                {call.port_code && <Badge variant="outline" className="text-xs">{call.port_code}</Badge>}
                                <StatusBadge status={call.status} />
                                {call.psc_risk_level && (
                                  <Badge variant="outline" className={cn("text-xs", call.psc_risk_level === "high" ? "border-destructive text-destructive" : "")}>
                                    PSC: {call.psc_risk_level}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1"><Ship className="h-3 w-3" />{call.vessel_name}</span>
                                {call.berth_number && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />Berth: {call.berth_number}</span>}
                                {call.country && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{call.country}</span>}
                              </div>
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                {call.purpose && <Badge variant="secondary" className="text-xs">{call.purpose.replace(/_/g, " ")}</Badge>}
                                {call.agent_name && <Badge variant="outline" className="text-xs">Agente: {call.agent_name}</Badge>}
                                {call.documents_status && (
                                  <Badge variant="outline" className={cn("text-xs", call.documents_status === "complete" ? "border-green-500/30 text-green-400" : "border-yellow-500/30 text-yellow-400")}>
                                    <FileText className="h-3 w-3 mr-1" />{call.documents_status}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="text-right text-sm">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                ETA: {new Date(call.eta).toLocaleString("pt-BR")}
                              </div>
                              {call.etd && (
                                <div className="flex items-center gap-1 text-muted-foreground mt-1">
                                  <Clock className="h-3 w-3" />
                                  ETD: {new Date(call.etd).toLocaleString("pt-BR")}
                                </div>
                              )}
                              {call.estimated_costs != null && call.estimated_costs > 0 && (
                                <p className="mt-1 font-medium text-green-400 flex items-center gap-1 justify-end">
                                  <DollarSign className="h-3 w-3" />{call.estimated_costs.toLocaleString("pt-BR")}
                                </p>
                              )}
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => { if(confirm("Remover este port call?")) deletePortCallMutation.mutate(call.id); }} aria-label="Remover port call" title="Remover port call">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ═══ FORM COMPONENTS ═════════════════════════════════════════════════

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium mb-1 block">{label}</label>
      {children}
    </div>
  );
}

interface CargoFormData {
  tracking_number: string; cargo_description: string; shipment_type: string;
  weight_kg: number; volume_cbm: number; origin_port: string; destination_port: string;
  estimated_arrival: string; shipping_cost: number; priority: string;
}

interface SupplierFormData {
  company_name: string; trading_name: string; category: string;
  contact_email: string; contact_phone: string; city: string; country: string;
  website: string; payment_terms: string;
}

interface PortCallFormData {
  port_name: string; port_code: string; vessel_id: string;
  eta: string; etd: string; berth_number: string; purpose: string;
  agent_name: string; agent_contact: string; country: string;
}

function CargoForm({ form, setForm, onSubmit, onCancel, loading }: {
  form: CargoFormData; setForm: (f: CargoFormData) => void; onSubmit: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <Card className="border-primary/50">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">Adicionar Nova Carga</CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel} aria-label="Fechar formulário" title="Fechar"><X className="h-4 w-4" /></Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <FormField label="Nº Tracking">
            <Input value={form.tracking_number} onChange={e => setForm({...form, tracking_number: e.target.value})} placeholder="CRG-2026-001" />
          </FormField>
          <FormField label="Descrição da Carga">
            <Input value={form.cargo_description} onChange={e => setForm({...form, cargo_description: e.target.value})} placeholder="Peças de motor" required />
          </FormField>
          <FormField label="Tipo">
            <Select value={form.shipment_type} onValueChange={v => setForm({...form, shipment_type: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="maritime">Marítimo</SelectItem>
                <SelectItem value="air">Aéreo</SelectItem>
                <SelectItem value="land">Terrestre</SelectItem>
                <SelectItem value="multimodal">Multimodal</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Peso (kg)">
            <Input type="number" value={form.weight_kg} onChange={e => setForm({...form, weight_kg: Number(e.target.value)})} placeholder="0" />
          </FormField>
          <FormField label="Volume (m³)">
            <Input type="number" value={form.volume_cbm} onChange={e => setForm({...form, volume_cbm: Number(e.target.value)})} placeholder="0" />
          </FormField>
          <FormField label="Prioridade">
            <Select value={form.priority} onValueChange={v => setForm({...form, priority: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Porto Origem">
            <Input value={form.origin_port} onChange={e => setForm({...form, origin_port: e.target.value})} placeholder="Santos" required />
          </FormField>
          <FormField label="Porto Destino">
            <Input value={form.destination_port} onChange={e => setForm({...form, destination_port: e.target.value})} placeholder="Rotterdam" required />
          </FormField>
          <FormField label="ETA">
            <Input type="date" value={form.estimated_arrival} onChange={e => setForm({...form, estimated_arrival: e.target.value})} />
          </FormField>
          <FormField label="Custo Frete">
            <Input type="number" value={form.shipping_cost} onChange={e => setForm({...form, shipping_cost: Number(e.target.value)})} placeholder="0" />
          </FormField>
          <div className="col-span-full flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Adicionar Carga"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function SupplierForm({ form, setForm, onSubmit, onCancel, loading }: {
  form: SupplierFormData; setForm: (f: SupplierFormData) => void; onSubmit: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <Card className="border-primary/50">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">Adicionar Fornecedor</CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel} aria-label="Fechar formulário" title="Fechar"><X className="h-4 w-4" /></Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <FormField label="Razão Social">
            <Input value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} placeholder="Petrobras Marine" required />
          </FormField>
          <FormField label="Nome Fantasia">
            <Input value={form.trading_name} onChange={e => setForm({...form, trading_name: e.target.value})} placeholder="Petrobras" />
          </FormField>
          <FormField label="Categoria">
            <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Geral</SelectItem>
                <SelectItem value="fuel">Combustível</SelectItem>
                <SelectItem value="equipment">Equipamentos</SelectItem>
                <SelectItem value="engine_parts">Peças Motor</SelectItem>
                <SelectItem value="safety_equipment">Segurança</SelectItem>
                <SelectItem value="provisions">Provisões</SelectItem>
                <SelectItem value="lubricants">Lubrificantes</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="E-mail">
            <Input type="email" value={form.contact_email} onChange={e => setForm({...form, contact_email: e.target.value})} placeholder="contato@empresa.com" required />
          </FormField>
          <FormField label="Telefone">
            <Input value={form.contact_phone} onChange={e => setForm({...form, contact_phone: e.target.value})} placeholder="+55-11-9999-9999" />
          </FormField>
          <FormField label="Prazo Pagamento">
            <Select value={form.payment_terms} onValueChange={v => setForm({...form, payment_terms: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NET15">NET 15</SelectItem>
                <SelectItem value="NET30">NET 30</SelectItem>
                <SelectItem value="NET60">NET 60</SelectItem>
                <SelectItem value="COD">Contra Entrega</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Cidade">
            <Input value={form.city} onChange={e => setForm({...form, city: e.target.value})} placeholder="São Paulo" />
          </FormField>
          <FormField label="País">
            <Input value={form.country} onChange={e => setForm({...form, country: e.target.value})} placeholder="Brasil" />
          </FormField>
          <FormField label="Website">
            <Input value={form.website} onChange={e => setForm({...form, website: e.target.value})} placeholder="https://empresa.com" />
          </FormField>
          <div className="col-span-full flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Adicionar Fornecedor"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function PortCallForm({ form, setForm, onSubmit, onCancel, loading, vessels }: {
  form: PortCallFormData; setForm: (f: PortCallFormData) => void; onSubmit: () => void; onCancel: () => void; loading: boolean; vessels: { id: string; name: string }[];
}) {
  return (
    <Card className="border-primary/50">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">Agendar Port Call</CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel} aria-label="Fechar formulário" title="Fechar"><X className="h-4 w-4" /></Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <FormField label="Porto">
            <Input value={form.port_name} onChange={e => setForm({...form, port_name: e.target.value})} placeholder="Porto de Santos" required />
          </FormField>
          <FormField label="Código Porto">
            <Input value={form.port_code} onChange={e => setForm({...form, port_code: e.target.value})} placeholder="BRSSZ" required />
          </FormField>
          <FormField label="Embarcação">
            <Select value={form.vessel_id} onValueChange={v => setForm({...form, vessel_id: v})}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {vessels.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="ETA">
            <Input type="datetime-local" value={form.eta} onChange={e => setForm({...form, eta: e.target.value})} required />
          </FormField>
          <FormField label="ETD">
            <Input type="datetime-local" value={form.etd} onChange={e => setForm({...form, etd: e.target.value})} />
          </FormField>
          <FormField label="Berth">
            <Input value={form.berth_number} onChange={e => setForm({...form, berth_number: e.target.value})} placeholder="B-12" />
          </FormField>
          <FormField label="Propósito">
            <Select value={form.purpose} onValueChange={v => setForm({...form, purpose: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cargo_operations">Operações de Carga</SelectItem>
                <SelectItem value="bunkering">Bunkering</SelectItem>
                <SelectItem value="crew_change">Troca de Tripulação</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="inspection">Inspeção</SelectItem>
                <SelectItem value="dry_dock">Doca Seca</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Agente">
            <Input value={form.agent_name} onChange={e => setForm({...form, agent_name: e.target.value})} placeholder="Wilson Sons" />
          </FormField>
          <FormField label="País">
            <Input value={form.country} onChange={e => setForm({...form, country: e.target.value})} placeholder="Brasil" />
          </FormField>
          <div className="col-span-full flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Agendar Port Call"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default UnifiedLogisticsDashboard;
