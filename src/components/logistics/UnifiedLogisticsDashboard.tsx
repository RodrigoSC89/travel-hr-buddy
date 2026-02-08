/**
 * Unified Logistics Dashboard
 * Cargo tracking, supplier management, and port call optimization
 */

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Package,
  Ship,
  Anchor,
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Building,
  Star,
  Phone,
  Mail,
  Calendar,
  ArrowRight,
  Fuel,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Cargo {
  id: string;
  tracking_number: string;
  cargo_type: string;
  weight_tons: number;
  origin_port: string;
  destination_port: string;
  vessel_name: string;
  status: "loading" | "in_transit" | "at_port" | "delivered" | "delayed";
  eta: string;
  temperature_controlled: boolean;
  hazmat: boolean;
  value_usd: number;
}

interface Supplier {
  id: string;
  name: string;
  category: string;
  rating: number;
  total_orders: number;
  on_time_delivery_rate: number;
  contact_email: string;
  contact_phone: string;
  location: string;
  status: "active" | "inactive" | "pending";
}

interface PortCall {
  id: string;
  port_name: string;
  port_code: string;
  vessel_name: string;
  eta: string;
  etd: string;
  berth: string;
  operations: string[];
  status: "scheduled" | "approaching" | "berthed" | "departed";
  bunker_required: boolean;
  cargo_operations: number;
}

export function UnifiedLogisticsDashboard() {
  const [activeTab, setActiveTab] = useState("cargo");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch cargo data from Supabase shipments table
  const { data: cargoData = [], isLoading: cargoLoading, refetch: refetchCargo } = useQuery({
    queryKey: ["logistics-cargo"],
    queryFn: async (): Promise<Cargo[]> => {
      const { data, error } = await supabase
        .from("shipments")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        toast.error("Erro ao carregar cargas");
        return [];
      }
      
      if (!data || data.length === 0) return [];
      
      return data.map((s: Record<string, unknown>) => ({
        id: String(s.id),
        tracking_number: String(s.shipment_number || s.tracking_number || ""),
        cargo_type: String(s.carrier || "Container"),
        weight_tons: Number(s.total_weight) || 0,
        origin_port: String(s.origin || ""),
        destination_port: String(s.destination || ""),
        vessel_name: String(s.carrier || "N/A"),
        status: mapShipmentStatus(String(s.status)),
        eta: String(s.estimated_arrival || new Date().toISOString()),
        temperature_controlled: false,
        hazmat: false,
        value_usd: Number(s.cost) || 0,
      }));
    },
  });

  // Fetch suppliers from Supabase
  const { data: suppliers = [], isLoading: suppliersLoading, refetch: refetchSuppliers } = useQuery({
    queryKey: ["logistics-suppliers"],
    queryFn: async (): Promise<Supplier[]> => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("rating", { ascending: false });
      
      if (error) {
        toast.error("Erro ao carregar fornecedores");
        return [];
      }
      
      if (!data || data.length === 0) return [];
      
      return data.map((s: Record<string, unknown>) => ({
        id: String(s.id),
        name: String(s.company_name || s.trading_name || ""),
        category: String(s.category || s.payment_terms || "General"),
        rating: Number(s.rating) || 0,
        total_orders: Number(s.total_orders) || 0,
        on_time_delivery_rate: Number(s.rating) ? Number(s.rating) * 20 : 0,
        contact_email: String(s.contact_email || ""),
        contact_phone: String(s.contact_phone || ""),
        location: String(s.country || s.city || s.address || ""),
        status: s.is_active ? "active" as const : "inactive" as const,
      }));
    },
  });

  // Fetch port calls from Supabase
  const { data: portCalls = [], isLoading: portCallsLoading, refetch: refetchPortCalls } = useQuery({
    queryKey: ["port-calls"],
    queryFn: async (): Promise<PortCall[]> => {
      const { data, error } = await supabase
        .from("port_calls")
        .select("*, vessels(name)")
        .order("eta", { ascending: true });
      
      if (error) {
        toast.error("Erro ao carregar port calls");
        return [];
      }
      
      if (!data || data.length === 0) return [];
      
      return data.map((p: Record<string, unknown>) => ({
        id: String(p.id),
        port_name: String(p.port_name || ""),
        port_code: String(p.port_code || ""),
        vessel_name: (p.vessels as Record<string, unknown>)?.name as string || String(p.vessel_id || ""),
        eta: String(p.eta || new Date().toISOString()),
        etd: String(p.etd || new Date().toISOString()),
        berth: String(p.berth_number || "TBD"),
        operations: Array.isArray(p.operations) ? p.operations as string[] : ["Loading"],
        status: mapPortCallStatus(String(p.status)),
        bunker_required: Boolean(p.bunker_required),
        cargo_operations: Number(p.cargo_volume) || 0,
      }));
    },
  });

  // Status mapping functions
  function mapShipmentStatus(status: string): Cargo["status"] {
    const map: Record<string, Cargo["status"]> = {
      preparing: "loading",
      in_transit: "in_transit",
      customs: "at_port",
      delivered: "delivered",
      delayed: "delayed",
      cancelled: "delayed",
    };
    return map[status] || "loading";
  }

  function mapSupplierStatus(status: string): Supplier["status"] {
    const map: Record<string, Supplier["status"]> = {
      active: "active",
      inactive: "inactive",
      suspended: "pending",
    };
    return map[status] || "pending";
  }

  function mapPortCallStatus(status: string): PortCall["status"] {
    const map: Record<string, PortCall["status"]> = {
      scheduled: "scheduled",
      approaching: "approaching",
      berthed: "berthed",
      departed: "departed",
      arrived: "berthed",
      completed: "departed",
    };
    return map[status] || "scheduled";
  }

  // Calculate stats
  const stats = {
    totalCargo: cargoData.length,
    inTransit: cargoData.filter((c: Cargo) => c.status === "in_transit").length,
    delivered: cargoData.filter((c: Cargo) => c.status === "delivered").length,
    delayed: cargoData.filter((c: Cargo) => c.status === "delayed").length,
    activeSuppliers: suppliers.filter((s: Supplier) => s.status === "active").length,
    upcomingPortCalls: portCalls.filter((p: PortCall) => 
      p.status === "scheduled" || p.status === "approaching"
    ).length,
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      loading: "bg-blue-500",
      in_transit: "bg-purple-500",
      at_port: "bg-yellow-500",
      delivered: "bg-green-500",
      delayed: "bg-red-500",
      scheduled: "bg-blue-500",
      approaching: "bg-yellow-500",
      berthed: "bg-green-500",
      departed: "bg-gray-500",
      active: "bg-green-500",
      inactive: "bg-gray-500",
      pending: "bg-yellow-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const filteredCargo = cargoData.filter((c: Cargo) =>
    c.tracking_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.vessel_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.destination_port?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [isAddCargoOpen, setIsAddCargoOpen] = useState(false);
  const [cargoForm, setCargoForm] = useState({
    tracking_number: "",
    cargo_type: "",
    weight_tons: 0,
    origin_port: "",
    destination_port: "",
    vessel_name: ""
  });
  const [localCargo, setLocalCargo] = useState<Cargo[]>([]);

  // Combine API data with local data
  const allCargo = [...localCargo, ...cargoData];

  const handleAddCargo = (e: React.FormEvent) => {
    e.preventDefault();
    const newCargo: Cargo = {
      id: Date.now().toString(),
      ...cargoForm,
      status: "loading",
      eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      temperature_controlled: false,
      hazmat: false,
      value_usd: 0
    };
    setLocalCargo(prev => [newCargo, ...prev]);
    setIsAddCargoOpen(false);
    setCargoForm({ tracking_number: "", cargo_type: "", weight_tons: 0, origin_port: "", destination_port: "", vessel_name: "" });
    toast.success("Carga adicionada com sucesso!");
  };

  const handleDeleteCargo = (id: string) => {
    if (confirm("Deseja deletar esta carga?")) {
      setLocalCargo(prev => prev.filter(c => c.id !== id));
      toast.success("Carga removida");
    }
  };

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
          <Button onClick={() => setIsAddCargoOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Carga
          </Button>
          <Button variant="outline" onClick={() => {
            refetchCargo();
            refetchSuppliers();
            refetchPortCalls();
            toast.success("Dados atualizados!");
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Add Cargo Dialog */}
      {isAddCargoOpen && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="text-lg">Adicionar Nova Carga</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCargo} className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Nº Tracking</label>
                <Input
                  value={cargoForm.tracking_number}
                  onChange={e => setCargoForm({ ...cargoForm, tracking_number: e.target.value })}
                  placeholder="CRG-2026-001"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tipo de Carga</label>
                <Input
                  value={cargoForm.cargo_type}
                  onChange={e => setCargoForm({ ...cargoForm, cargo_type: e.target.value })}
                  placeholder="Container"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Peso (tons)</label>
                <Input
                  type="number"
                  value={cargoForm.weight_tons}
                  onChange={e => setCargoForm({ ...cargoForm, weight_tons: Number(e.target.value) })}
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Porto Origem</label>
                <Input
                  value={cargoForm.origin_port}
                  onChange={e => setCargoForm({ ...cargoForm, origin_port: e.target.value })}
                  placeholder="Santos"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Porto Destino</label>
                <Input
                  value={cargoForm.destination_port}
                  onChange={e => setCargoForm({ ...cargoForm, destination_port: e.target.value })}
                  placeholder="Rotterdam"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Embarcação</label>
                <Input
                  value={cargoForm.vessel_name}
                  onChange={e => setCargoForm({ ...cargoForm, vessel_name: e.target.value })}
                  placeholder="MV Atlantic Star"
                  required
                />
              </div>
              <div className="col-span-full flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsAddCargoOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Adicionar Carga</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Cargo</p>
                <p className="text-2xl font-bold">{stats.totalCargo}</p>
              </div>
              <Package className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">In Transit</p>
                <p className="text-2xl font-bold text-purple-500">{stats.inTransit}</p>
              </div>
              <Ship className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold text-green-500">{stats.delivered}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Delayed</p>
                <p className="text-2xl font-bold text-red-500">{stats.delayed}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Suppliers</p>
                <p className="text-2xl font-bold">{stats.activeSuppliers}</p>
              </div>
              <Building className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Port Calls</p>
                <p className="text-2xl font-bold">{stats.upcomingPortCalls}</p>
              </div>
              <Anchor className="h-8 w-8 text-cyan-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cargo" className="gap-2">
            <Package className="h-4 w-4" />
            Cargo Tracking
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="gap-2">
            <Building className="h-4 w-4" />
            Suppliers
          </TabsTrigger>
          <TabsTrigger value="ports" className="gap-2">
            <Anchor className="h-4 w-4" />
            Port Operations
          </TabsTrigger>
        </TabsList>

        {/* Cargo Tracking Tab */}
        <TabsContent value="cargo" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Cargo Shipments</CardTitle>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search cargo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {[...localCargo, ...filteredCargo].map((cargo: Cargo) => (
                    <div
                      key={cargo.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-3 rounded-lg",
                          cargo.hazmat ? "bg-red-500/20" : "bg-primary/10"
                        )}>
                          <Package className={cn(
                            "h-5 w-5",
                            cargo.hazmat ? "text-red-500" : "text-primary"
                          )} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{cargo.tracking_number}</p>
                            <Badge className={cn("text-white", getStatusColor(cargo.status))}>
                              {cargo.status.replace("_", " ").toUpperCase()}
                            </Badge>
                            {cargo.hazmat && (
                              <Badge variant="destructive">HAZMAT</Badge>
                            )}
                            {cargo.temperature_controlled && (
                              <Badge variant="outline">Temp Controlled</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Ship className="h-3 w-3" />
                              {cargo.vessel_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {cargo.origin_port}
                              <ArrowRight className="h-3 w-3" />
                              {cargo.destination_port}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">{cargo.weight_tons.toLocaleString()} tons</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            ETA: {new Date(cargo.eta).toLocaleDateString()}
                          </div>
                          {cargo.value_usd > 0 && (
                            <div className="flex items-center gap-1 text-sm text-green-500">
                              <DollarSign className="h-3 w-3" />
                              {cargo.value_usd.toLocaleString()}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteCargo(cargo.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Management</CardTitle>
              <CardDescription>
                Manage and track supplier performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {suppliers.map((supplier: Supplier) => (
                  <Card key={supplier.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{supplier.name}</CardTitle>
                          <CardDescription>{supplier.category}</CardDescription>
                        </div>
                        <Badge className={cn("text-white", getStatusColor(supplier.status))}>
                          {supplier.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "h-4 w-4",
                              star <= supplier.rating ? "fill-yellow-500 text-yellow-500" : "text-muted"
                            )}
                          />
                        ))}
                        <span className="text-sm text-muted-foreground ml-1">
                          ({supplier.total_orders} orders)
                        </span>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>On-Time Delivery</span>
                          <span className={supplier.on_time_delivery_rate >= 90 ? "text-green-500" : "text-yellow-500"}>
                            {supplier.on_time_delivery_rate}%
                          </span>
                        </div>
                        <Progress value={supplier.on_time_delivery_rate} className="h-1.5" />
                      </div>

                      <div className="pt-2 border-t space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {supplier.location}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {supplier.contact_email}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {supplier.contact_phone}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Port Operations Tab */}
        <TabsContent value="ports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Port Call Schedule</CardTitle>
              <CardDescription>
                Upcoming and current port operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {portCalls.map((call: PortCall) => (
                    <div
                      key={call.id}
                      className={cn(
                        "p-4 rounded-lg border",
                        call.status === "berthed" ? "border-green-500 bg-green-500/5" :
                        call.status === "approaching" ? "border-yellow-500 bg-yellow-500/5" : ""
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "p-3 rounded-lg",
                            getStatusColor(call.status) + "/20"
                          )}>
                            <Anchor className={cn(
                              "h-5 w-5",
                              call.status === "berthed" ? "text-green-500" :
                              call.status === "approaching" ? "text-yellow-500" : "text-blue-500"
                            )} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{call.port_name}</p>
                              <Badge variant="outline">{call.port_code}</Badge>
                              <Badge className={cn("text-white", getStatusColor(call.status))}>
                                {call.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Ship className="h-3 w-3" />
                                {call.vessel_name}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                Berth: {call.berth}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              {call.operations.map((op, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {op}
                                </Badge>
                              ))}
                              {call.bunker_required && (
                                <Badge variant="outline" className="text-xs gap-1">
                                  <Fuel className="h-3 w-3" />
                                  Bunkering
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            ETA: {new Date(call.eta).toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            ETD: {new Date(call.etd).toLocaleString()}
                          </div>
                          <p className="mt-2 font-medium">
                            {call.cargo_operations} cargo ops
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default UnifiedLogisticsDashboard;
