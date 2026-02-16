/**
 * Cargo Operations Manager - Full CRUD with Supabase
 * B/L, stowage, hazmat, demurrage/despatch, claims
 */

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Package, Plus, RefreshCw, Ship, FileText, AlertTriangle,
  DollarSign, TrendingUp, Anchor, Truck, Scale
} from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";

const CARGO_TYPES = ["Dry Bulk", "Liquid Bulk", "Break Bulk", "Container", "Ro-Ro", "Reefer", "Project Cargo", "Hazmat"];
const CARGO_STATUS = ["booked", "loading", "in_transit", "discharging", "completed", "cancelled"];
const HAZMAT_CLASSES = ["1 - Explosives", "2 - Gases", "3 - Flammable Liquids", "4 - Flammable Solids", "5 - Oxidizers", "6 - Toxics", "7 - Radioactive", "8 - Corrosives", "9 - Misc"];
const COLORS = ["#3b82f6", "#22c55e", "#eab308", "#f97316", "#ef4444", "#8b5cf6"];

export function CargoManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("operations");
  const [addDialog, setAddDialog] = useState(false);
  const [newCargo, setNewCargo] = useState({
    cargo_type: "Dry Bulk", commodity: "", quantity: "", unit: "MT", bl_number: "",
    shipper: "", consignee: "", load_port: "", discharge_port: "",
    freight_rate: "", demurrage_rate: "", hazmat_class: "", notes: "",
  });

  // Using manual type since cargo_shipments is a new table
  interface CargoShipment {
    id: string;
    cargo_type: string;
    commodity: string;
    quantity: number;
    unit: string;
    bl_number: string | null;
    shipper: string | null;
    consignee: string | null;
    load_port: string | null;
    discharge_port: string | null;
    hazmat_class: string | null;
    status: string;
    freight_rate: number;
    freight_amount: number;
    demurrage_rate: number;
    demurrage_amount: number;
    notes: string | null;
    created_at: string;
  }

  const { data: operations = [], isLoading } = useQuery({
    queryKey: ["cargo-shipments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cargo_shipments" as "cargo_operations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as CargoShipment[];
    },
  });

  const { data: claims = [] } = useQuery({
    queryKey: ["cargo-claims"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cargo_claims" as "cargo_operations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Array<{
        id: string; claim_type: string; claim_amount: number;
        currency: string; claimant: string | null; description: string | null; status: string;
      }>;
    },
  });

  const addCargo = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const payload = {
        cargo_type: data.cargo_type,
        commodity: data.commodity,
        quantity: Number(data.quantity) || 0,
        unit: data.unit,
        bl_number: data.bl_number,
        shipper: data.shipper,
        consignee: data.consignee,
        load_port: data.load_port,
        discharge_port: data.discharge_port,
        freight_rate: Number(data.freight_rate) || 0,
        freight_amount: (Number(data.quantity) || 0) * (Number(data.freight_rate) || 0),
        demurrage_rate: Number(data.demurrage_rate) || 0,
        hazmat_class: data.hazmat_class,
        notes: data.notes,
        status: "booked",
      };
      const { error } = await (supabase as unknown as { from: (t: string) => { insert: (d: unknown) => Promise<{ error: { message: string } | null }> } }).from("cargo_shipments").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cargo-shipments"] });
      toast.success("Carga registrada com sucesso");
      setAddDialog(false);
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await (supabase as unknown as { from: (t: string) => { update: (d: unknown) => { eq: (k: string, v: string) => Promise<{ error: { message: string } | null }> } } }).from("cargo_shipments").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cargo-shipments"] });
      toast.success("Status atualizado");
    },
  });

  // Computed
  const totalQuantity = operations.reduce((s, o) => s + Number(o.quantity || 0), 0);
  const totalFreight = operations.reduce((s, o) => s + Number(o.freight_amount || 0), 0);
  const totalDemurrage = operations.reduce((s, o) => s + Number(o.demurrage_amount || 0), 0);
  const activeOps = operations.filter(o => !["completed", "cancelled"].includes(o.status));

  const typeDistribution = CARGO_TYPES.map(t => ({
    name: t,
    value: operations.filter(o => o.cargo_type === t).length,
  })).filter(d => d.value > 0);

  const statusData = CARGO_STATUS.map(s => ({
    name: s.charAt(0).toUpperCase() + s.slice(1).replace("_", " "),
    count: operations.filter(o => o.status === s).length,
  }));

  const getStatusBadge = (status: string) => {
    const map: Record<string, React.ReactNode> = {
      booked: <Badge variant="secondary">Reservado</Badge>,
      loading: <Badge className="bg-primary/20 text-primary">Carregando</Badge>,
      in_transit: <Badge className="bg-warning/20 text-warning">Em Trânsito</Badge>,
      discharging: <Badge className="bg-orange-500/20 text-orange-500">Descarregando</Badge>,
      completed: <Badge className="bg-success/20 text-success">Concluído</Badge>,
      cancelled: <Badge variant="destructive">Cancelado</Badge>,
    };
    return map[status] || <Badge variant="secondary">{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Cargo Operations</h2>
            <p className="text-sm text-muted-foreground">B/L, Stowage, Hazmat, Demurrage & Claims</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ["cargo-operations"] })}>
            <RefreshCw className="h-4 w-4 mr-1" /> Atualizar
          </Button>
          <Button size="sm" onClick={() => setAddDialog(true)}>
            <Plus className="h-4 w-4 mr-1" /> Nova Carga
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center">
          <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold">{activeOps.length}</div>
          <div className="text-xs text-muted-foreground">Operações Ativas</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Scale className="h-8 w-8 mx-auto mb-2 text-warning" />
          <div className="text-2xl font-bold">{totalQuantity.toLocaleString()} MT</div>
          <div className="text-xs text-muted-foreground">Quantidade Total</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <DollarSign className="h-8 w-8 mx-auto mb-2 text-success" />
          <div className="text-2xl font-bold">${totalFreight.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Frete Total</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-destructive" />
          <div className="text-2xl font-bold">${totalDemurrage.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Demurrage</div>
        </CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="operations">Operações</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="claims">Claims ({claims.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="operations">
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {operations.map(op => (
                <Card key={op.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold">{op.commodity || "N/A"}</span>
                          <Badge variant="outline">{op.cargo_type}</Badge>
                          {getStatusBadge(op.status)}
                          {op.hazmat_class && <Badge variant="destructive">HAZMAT</Badge>}
                        </div>
                        <div className="text-sm text-muted-foreground grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                          <span>📦 {Number(op.quantity).toLocaleString()} {op.unit}</span>
                          <span>📄 B/L: {op.bl_number || "—"}</span>
                          <span>🚢 {op.load_port || "—"} → {op.discharge_port || "—"}</span>
                          <span>💰 ${Number(op.freight_amount || 0).toLocaleString()}</span>
                        </div>
                        {op.shipper && <div className="text-xs text-muted-foreground mt-1">Embarcador: {op.shipper} | Consignatário: {op.consignee}</div>}
                      </div>
                      <div className="flex gap-1">
                        {op.status === "booked" && <Button variant="outline" size="sm" onClick={() => updateStatus.mutate({ id: op.id, status: "loading" })}>Iniciar Carga</Button>}
                        {op.status === "loading" && <Button variant="outline" size="sm" onClick={() => updateStatus.mutate({ id: op.id, status: "in_transit" })}>Em Trânsito</Button>}
                        {op.status === "in_transit" && <Button variant="outline" size="sm" onClick={() => updateStatus.mutate({ id: op.id, status: "discharging" })}>Descarregar</Button>}
                        {op.status === "discharging" && <Button variant="outline" size="sm" onClick={() => updateStatus.mutate({ id: op.id, status: "completed" })}>Concluir</Button>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {operations.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma operação de carga registrada</p>}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Por Tipo de Carga</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={typeDistribution} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {typeDistribution.map((entry, i) => <Cell key={`cargo-type-${entry.name}-${i}`} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Por Status</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="claims">
          <div className="space-y-3">
            {claims.map(c => (
              <Card key={c.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{c.claim_type}</div>
                    <div className="text-sm text-muted-foreground">{c.description}</div>
                    <div className="text-xs text-muted-foreground">Claimant: {c.claimant || "N/A"}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{c.currency} {Number(c.claim_amount).toLocaleString()}</div>
                    <Badge variant={c.status === "open" ? "destructive" : "secondary"}>{c.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            {claims.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum claim registrado</p>}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Cargo Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Nova Operação de Carga</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 pr-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Tipo</Label>
                  <Select value={newCargo.cargo_type} onValueChange={v => setNewCargo(p => ({ ...p, cargo_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CARGO_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Commodity</Label><Input value={newCargo.commodity} onChange={e => setNewCargo(p => ({ ...p, commodity: e.target.value }))} placeholder="Ex: Iron Ore" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Quantidade</Label><Input type="number" value={newCargo.quantity} onChange={e => setNewCargo(p => ({ ...p, quantity: e.target.value }))} /></div>
                <div><Label>Unidade</Label>
                  <Select value={newCargo.unit} onValueChange={v => setNewCargo(p => ({ ...p, unit: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MT">MT</SelectItem>
                      <SelectItem value="TEU">TEU</SelectItem>
                      <SelectItem value="CBM">CBM</SelectItem>
                      <SelectItem value="BBL">BBL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>B/L Number</Label><Input value={newCargo.bl_number} onChange={e => setNewCargo(p => ({ ...p, bl_number: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Embarcador</Label><Input value={newCargo.shipper} onChange={e => setNewCargo(p => ({ ...p, shipper: e.target.value }))} /></div>
                <div><Label>Consignatário</Label><Input value={newCargo.consignee} onChange={e => setNewCargo(p => ({ ...p, consignee: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Porto de Carga</Label><Input value={newCargo.load_port} onChange={e => setNewCargo(p => ({ ...p, load_port: e.target.value }))} /></div>
                <div><Label>Porto de Descarga</Label><Input value={newCargo.discharge_port} onChange={e => setNewCargo(p => ({ ...p, discharge_port: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Freight Rate ($/MT)</Label><Input type="number" value={newCargo.freight_rate} onChange={e => setNewCargo(p => ({ ...p, freight_rate: e.target.value }))} /></div>
                <div><Label>Demurrage Rate ($/day)</Label><Input type="number" value={newCargo.demurrage_rate} onChange={e => setNewCargo(p => ({ ...p, demurrage_rate: e.target.value }))} /></div>
              </div>
              <div><Label>HAZMAT Class (se aplicável)</Label>
                <Select value={newCargo.hazmat_class} onValueChange={v => setNewCargo(p => ({ ...p, hazmat_class: v }))}>
                  <SelectTrigger><SelectValue placeholder="Não aplicável" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Não aplicável</SelectItem>
                    {HAZMAT_CLASSES.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Notas</Label><Textarea value={newCargo.notes} onChange={e => setNewCargo(p => ({ ...p, notes: e.target.value }))} /></div>
              <Button className="w-full" onClick={() => addCargo.mutate(newCargo)} disabled={addCargo.isPending || !newCargo.commodity}>
                {addCargo.isPending ? "Salvando..." : "Registrar Carga"}
              </Button>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
