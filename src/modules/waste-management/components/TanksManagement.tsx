/**
 * Gestão Detalhada de Tanques - MARPOL Compliant
 * Integrado com tabela waste_tanks do Supabase
 */

import { useState } from "react";
import { logger } from "@/lib/logger";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Droplets, Plus, Trash2, AlertTriangle, TrendingDown,
  Fuel, Ship, Calendar, Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface WasteTank {
  id: string;
  tank_name: string;
  tank_type: string | null;
  capacity: number;
  current_level: number;
  unit: string | null;
  vessel_id: string | null;
  last_discharge_date: string | null;
  last_discharge_location: string | null;
  created_at: string | null;
}

const typeLabels: Record<string, { label: string; color: string; icon: typeof Fuel }> = {
  oily: { label: "Óleo Usado", color: "bg-warning", icon: Fuel },
  sewage: { label: "Esgoto", color: "bg-muted-foreground", icon: Droplets },
  bilge: { label: "Água de Porão", color: "bg-info", icon: Droplets },
  sludge: { label: "Lodo", color: "bg-warning", icon: Droplets },
  garbage: { label: "Resíduos Sólidos", color: "bg-success", icon: Trash2 },
};

function getStatus(current: number, capacity: number): "ok" | "warning" | "critical" {
  if (capacity <= 0) return "ok";
  const pct = (current / capacity) * 100;
  if (pct >= 90) return "critical";
  if (pct >= 70) return "warning";
  return "ok";
}

export function TanksManagement() {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDischargeDialogOpen, setIsDischargeDialogOpen] = useState(false);
  const [selectedTank, setSelectedTank] = useState<WasteTank | null>(null);
  const [filterType, setFilterType] = useState("all");

  const [newTank, setNewTank] = useState({
    tank_name: "",
    tank_type: "oily",
    capacity: 0,
    current_level: 0,
    unit: "L",
  });

  const [dischargeData, setDischargeData] = useState({
    quantity: 0,
    location: "",
    method: "",
    notes: "",
  });

  // Fetch tanks from Supabase
  const { data: tanks = [], isLoading } = useQuery({
    queryKey: ["waste-tanks-management"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waste_tanks")
        .select("*")
        .order("tank_name");
      if (error) throw error;
      return (data || []) as WasteTank[];
    },
    staleTime: 1000 * 60 * 2,
  });

  // Fetch vessels for dropdown
  const { data: vessels = [] } = useQuery({
    queryKey: ["vessels-list-short"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vessels")
        .select("id, name")
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  // Add tank mutation
  const addTankMutation = useMutation({
    mutationFn: async (tankData: typeof newTank & { vessel_id?: string }) => {
      const vesselMatch = vessels.find(v => v.id === tankData.vessel_id);
      const { data, error } = await supabase
        .from("waste_tanks")
        .insert({
          tank_name: tankData.tank_name,
          tank_type: tankData.tank_type,
          capacity: tankData.capacity,
          current_level: tankData.current_level,
          unit: tankData.unit,
          vessel_id: tankData.vessel_id || null,
          vessel_name: vesselMatch?.name || tankData.tank_name,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waste-tanks-management"] });
      queryClient.invalidateQueries({ queryKey: ["waste-intelligence"] });
      setIsAddDialogOpen(false);
      setNewTank({ tank_name: "", tank_type: "oily", capacity: 0, current_level: 0, unit: "L" });
      toast.success("Tanque adicionado com sucesso!");
    },
    onError: () => toast.error("Erro ao adicionar tanque"),
  });

  // Discharge mutation (update tank level + create waste_record)
  const dischargeMutation = useMutation({
    mutationFn: async ({ tankId, quantity, location, method, notes }: {
      tankId: string; quantity: number; location: string; method: string; notes: string;
    }) => {
      const tank = tanks.find(t => t.id === tankId);
      if (!tank) throw new Error("Tank not found");
      
      const newLevel = Math.max(0, tank.current_level - quantity);
      
      // Update tank level
      const { error: updateError } = await supabase
        .from("waste_tanks")
        .update({ 
          current_level: newLevel, 
          last_discharge_date: new Date().toISOString(),
          last_discharge_location: location,
        })
        .eq("id", tankId);
      if (updateError) throw updateError;

      // Create waste record
      const { error: recordError } = await supabase
        .from("waste_records")
        .insert({
          waste_type: tank.tank_type || "general",
          quantity: quantity,
          unit: tank.unit || "L",
          disposal_method: method,
          disposal_date: new Date().toISOString(),
          port_code: location,
          vessel_id: tank.vessel_id,
          notes: notes,
        });
      if (recordError) logger.warn("Could not create waste_record: " + recordError.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waste-tanks-management"] });
      queryClient.invalidateQueries({ queryKey: ["waste-intelligence"] });
      setIsDischargeDialogOpen(false);
      setDischargeData({ quantity: 0, location: "", method: "", notes: "" });
      toast.success("Descarte registrado com sucesso!");
    },
    onError: () => toast.error("Erro ao registrar descarte"),
  });

  // Delete tank mutation
  const deleteTankMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("waste_tanks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waste-tanks-management"] });
      queryClient.invalidateQueries({ queryKey: ["waste-intelligence"] });
      toast.success("Tanque removido!");
    },
    onError: () => toast.error("Erro ao remover tanque"),
  });

  const handleAddTank = () => {
    if (!newTank.tank_name || newTank.capacity <= 0) {
      toast.error("Preencha nome e capacidade");
      return;
    }
    addTankMutation.mutate(newTank);
  };

  const handleDischarge = () => {
    if (!selectedTank || dischargeData.quantity <= 0) {
      toast.error("Informe a quantidade");
      return;
    }
    dischargeMutation.mutate({
      tankId: selectedTank.id,
      quantity: dischargeData.quantity,
      location: dischargeData.location,
      method: dischargeData.method,
      notes: dischargeData.notes,
    });
  };

  const filteredTanks = tanks.filter(tank => {
    if (filterType !== "all" && tank.tank_type !== filterType) return false;
    return true;
  });

  const criticalCount = tanks.filter(t => getStatus(t.current_level, t.capacity) === "critical").length;
  const warningCount = tanks.filter(t => getStatus(t.current_level, t.capacity) === "warning").length;
  const totalCapacity = tanks.reduce((acc, t) => acc + (t.capacity || 0), 0);
  const totalUsed = tanks.reduce((acc, t) => acc + (t.current_level || 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Card key={i} className="animate-pulse"><CardContent className="p-4"><div className="h-16 bg-muted rounded" /></CardContent></Card>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-info">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Tanques</p>
                <p className="text-2xl font-bold">{tanks.length}</p>
              </div>
              <Droplets className="h-8 w-8 text-info opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ocupação Média</p>
                <p className="text-2xl font-bold">{totalCapacity > 0 ? Math.round((totalUsed / totalCapacity) * 100) : 0}%</p>
              </div>
              <TrendingDown className="h-8 w-8 text-warning opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Alerta</p>
                <p className="text-2xl font-bold">{warningCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticos</p>
                <p className="text-2xl font-bold">{criticalCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              {Object.entries(typeLabels).map(([key, val]) => (
                <SelectItem key={key} value={key}>{val.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Tanque
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Tanque</DialogTitle>
              <DialogDescription>Cadastre um novo tanque de resíduos para monitoramento.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome do Tanque</Label>
                <Input id="name" value={newTank.tank_name} onChange={(e) => setNewTank({ ...newTank, tank_name: e.target.value })} placeholder="Ex: Tanque de Óleo Usado #2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Tipo</Label>
                  <Select value={newTank.tank_type} onValueChange={(v) => setNewTank({ ...newTank, tank_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeLabels).map(([key, val]) => (
                        <SelectItem key={key} value={key}>{val.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Unidade</Label>
                  <Select value={newTank.unit} onValueChange={(v) => setNewTank({ ...newTank, unit: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">Litros (L)</SelectItem>
                      <SelectItem value="m³">Metros Cúbicos (m³)</SelectItem>
                      <SelectItem value="kg">Quilogramas (kg)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Capacidade</Label>
                  <Input type="number" value={newTank.capacity} onChange={(e) => setNewTank({ ...newTank, capacity: Number(e.target.value) })} />
                </div>
                <div className="grid gap-2">
                  <Label>Nível Atual</Label>
                  <Input type="number" value={newTank.current_level} onChange={(e) => setNewTank({ ...newTank, current_level: Number(e.target.value) })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleAddTank} disabled={addTankMutation.isPending}>Adicionar Tanque</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tanks Grid */}
      {filteredTanks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTanks.map((tank) => {
            const tankType = (tank.tank_type || "oily") as keyof typeof typeLabels;
            const typeConfig = typeLabels[tankType] || typeLabels.oily;
            const TypeIcon = typeConfig.icon;
            const status = getStatus(tank.current_level, tank.capacity);
            const percentage = tank.capacity > 0 ? Math.round((tank.current_level / tank.capacity) * 100) : 0;
            const vesselName = vessels.find(v => v.id === tank.vessel_id)?.name;
            
            return (
              <Card key={tank.id} className={`relative overflow-hidden ${
                status === "critical" ? "border-destructive/50" : 
                status === "warning" ? "border-warning/50" : ""
              }`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${typeConfig.color} text-white`}>
                        <TypeIcon className="h-4 w-4" />
                      </div>
                      {tank.tank_name}
                    </CardTitle>
                    <Badge variant={status === "critical" ? "destructive" : status === "warning" ? "secondary" : "outline"}>
                      {status === "critical" ? "Crítico" : status === "warning" ? "Atenção" : "Normal"}
                    </Badge>
                  </div>
                  {vesselName && (
                    <CardDescription className="flex items-center gap-1">
                      <Ship className="h-3 w-3" />
                      {vesselName}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{tank.current_level} / {tank.capacity} {tank.unit || "L"}</span>
                      <span className={percentage > 80 ? "text-destructive font-medium" : percentage > 60 ? "text-warning font-medium" : "text-muted-foreground"}>
                        {percentage}%
                      </span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className={`h-3 ${status === "critical" ? "[&>div]:bg-destructive" : status === "warning" ? "[&>div]:bg-warning" : "[&>div]:bg-success"}`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Descarte: {tank.last_discharge_date?.split("T")[0] || "—"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{tank.last_discharge_location || "—"}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedTank(tank);
                        setIsDischargeDialogOpen(true);
                      }}
                    >
                      <TrendingDown className="h-4 w-4 mr-1" />
                      Registrar Descarte
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteTankMutation.mutate(tank.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Droplets className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">Nenhum tanque cadastrado</p>
            <p className="text-sm text-muted-foreground mt-1">Clique em "Novo Tanque" para começar.</p>
          </CardContent>
        </Card>
      )}

      {/* Discharge Dialog */}
      <Dialog open={isDischargeDialogOpen} onOpenChange={setIsDischargeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Descarte</DialogTitle>
            <DialogDescription>
              {selectedTank?.tank_name} - Nível atual: {selectedTank?.current_level} {selectedTank?.unit || "L"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Quantidade Descartada ({selectedTank?.unit || "L"})</Label>
              <Input type="number" value={dischargeData.quantity} onChange={(e) => setDischargeData({ ...dischargeData, quantity: Number(e.target.value) })} max={selectedTank?.current_level} />
            </div>
            <div className="grid gap-2">
              <Label>Local de Descarte</Label>
              <Input value={dischargeData.location} onChange={(e) => setDischargeData({ ...dischargeData, location: e.target.value })} placeholder="Ex: Porto de Macaé" />
            </div>
            <div className="grid gap-2">
              <Label>Método</Label>
              <Select value={dischargeData.method} onValueChange={(v) => setDischargeData({ ...dischargeData, method: v })}>
                <SelectTrigger><SelectValue placeholder="Método de descarte" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Empresa credenciada">Empresa credenciada</SelectItem>
                  <SelectItem value="Caminhão limpa-fossa">Caminhão limpa-fossa</SelectItem>
                  <SelectItem value="OWS">Oil Water Separator (OWS)</SelectItem>
                  <SelectItem value="Incineração">Incineração</SelectItem>
                  <SelectItem value="Transferência">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Observações</Label>
              <Textarea value={dischargeData.notes} onChange={(e) => setDischargeData({ ...dischargeData, notes: e.target.value })} placeholder="Detalhes da operação..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDischargeDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleDischarge} disabled={dischargeMutation.isPending}>
              Registrar Descarte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
