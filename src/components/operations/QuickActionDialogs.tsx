/**
 * Quick Action Dialogs for Operations Command Hub
 * Real functional dialogs with Supabase mutations
 */

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Map, Users, Ship, Fuel, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";

// ===================== TYPES =====================
interface Vessel {
  id: string;
  name: string;
  status?: string;
  imo_number?: string;
}

interface CrewMember {
  id: string;
  full_name: string;
  rank?: string;
  vessel_id?: string | null;
  status?: string;
}

// ===================== SHARED HOOKS =====================
function useVesselsList() {
  return useQuery({
    queryKey: ["vessels-list-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vessels")
        .select("id, name, status, imo_number")
        .order("name");
      if (error) throw error;
      return (data || []) as Vessel[];
    },
  });
}

function useCrewList() {
  return useQuery({
    queryKey: ["crew-list-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_members")
        .select("id, full_name, rank, vessel_id, status")
        .order("full_name");
      if (error) throw error;
      return (data || []) as unknown as CrewMember[];
    },
  });
}

// ===================== 1. NOVA VIAGEM DIALOG =====================
export function NewVoyageDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const queryClient = useQueryClient();
  const { data: vessels = [] } = useVesselsList();
  const [form, setForm] = useState({
    vessel_id: "",
    origin_port: "",
    destination_port: "",
    departure_date: "",
    arrival_date: "",
    notes: "",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!form.origin_port || !form.destination_port) throw new Error("Portos de origem e destino são obrigatórios");
      const { data, error } = await supabase
        .from("voyage_plans")
        .insert([{
          vessel_id: form.vessel_id || null,
          origin_port: form.origin_port,
          destination_port: form.destination_port,
          departure_date: form.departure_date || new Date().toISOString(),
          arrival_date: form.arrival_date || null,
          status: "planned",
          notes: form.notes || null,
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations-voyages"] });
      queryClient.invalidateQueries({ queryKey: ["voyages"] });
      queryClient.invalidateQueries({ queryKey: ["voyage_plans"] });
      toast.success("Viagem criada com sucesso!");
      onOpenChange(false);
      setForm({ vessel_id: "", origin_port: "", destination_port: "", departure_date: "", arrival_date: "", notes: "" });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            Nova Viagem
          </DialogTitle>
          <DialogDescription>Planeje uma nova viagem marítima</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Embarcação</Label>
            <Select value={form.vessel_id} onValueChange={(v) => setForm(p => ({ ...p, vessel_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Selecione a embarcação" /></SelectTrigger>
              <SelectContent>
                {vessels.map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.name} {v.imo_number ? `(${v.imo_number})` : ""}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Porto de Origem</Label>
              <Input placeholder="Ex: Santos" value={form.origin_port} onChange={(e) => setForm(p => ({ ...p, origin_port: e.target.value }))} />
            </div>
            <div>
              <Label>Porto de Destino</Label>
              <Input placeholder="Ex: Rotterdam" value={form.destination_port} onChange={(e) => setForm(p => ({ ...p, destination_port: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Data Partida</Label>
              <Input type="date" value={form.departure_date} onChange={(e) => setForm(p => ({ ...p, departure_date: e.target.value }))} />
            </div>
            <div>
              <Label>Data Chegada (est.)</Label>
              <Input type="date" value={form.arrival_date} onChange={(e) => setForm(p => ({ ...p, arrival_date: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea placeholder="Notas sobre a viagem..." value={form.notes} onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.origin_port || !form.destination_port}>
            {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Criar Viagem
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===================== 2. ESCALAR TRIPULAÇÃO DIALOG =====================
export function CrewScheduleDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const queryClient = useQueryClient();
  const { data: vessels = [] } = useVesselsList();
  const { data: crew = [] } = useCrewList();
  const [selectedVessel, setSelectedVessel] = useState("");
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]);
  const [joinDate, setJoinDate] = useState("");
  const [leaveDate, setLeaveDate] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selectedVessel || selectedCrew.length === 0) throw new Error("Selecione embarcação e tripulantes");
      const updates = selectedCrew.map((crewId) =>
        supabase.from("crew_members").update({
          vessel_id: selectedVessel,
          join_date: joinDate || new Date().toISOString().split("T")[0],
          leave_date: leaveDate || null,
        }).eq("id", crewId)
      );
      const results = await Promise.all(updates);
      const errors = results.filter((r) => r.error);
      if (errors.length > 0) throw new Error(`${errors.length} atribuições falharam`);
      return { assigned: selectedCrew.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["crew"] });
      queryClient.invalidateQueries({ queryKey: ["crew-members"] });
      queryClient.invalidateQueries({ queryKey: ["crew-list-select"] });
      toast.success(`${data.assigned} tripulante(s) escalado(s) com sucesso!`);
      onOpenChange(false);
      setSelectedCrew([]);
      setSelectedVessel("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const availableCrew = crew.filter((c) => !c.vessel_id || c.status === "available");

  const toggleCrew = (crewId: string) => {
    setSelectedCrew((prev) =>
      prev.includes(crewId) ? prev.filter((id) => id !== crewId) : [...prev, crewId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Escalar Tripulação
          </DialogTitle>
          <DialogDescription>Atribua tripulantes a uma embarcação</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Embarcação de Destino</Label>
            <Select value={selectedVessel} onValueChange={setSelectedVessel}>
              <SelectTrigger><SelectValue placeholder="Selecione a embarcação" /></SelectTrigger>
              <SelectContent>
                {vessels.map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Data Embarque</Label>
              <Input type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} />
            </div>
            <div>
              <Label>Data Desembarque (est.)</Label>
              <Input type="date" value={leaveDate} onChange={(e) => setLeaveDate(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Tripulantes Disponíveis ({availableCrew.length})</Label>
            <ScrollArea className="h-[200px] border rounded-md p-2 mt-1">
              {availableCrew.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  Nenhum tripulante disponível
                </div>
              ) : (
                availableCrew.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 p-2 rounded hover:bg-accent/50 cursor-pointer"
                    onClick={() => toggleCrew(c.id)}
                  >
                    <Checkbox checked={selectedCrew.includes(c.id)} />
                    <div className="flex-1">
                      <span className="font-medium">{c.full_name}</span>
                      {c.rank && <Badge variant="outline" className="ml-2 text-xs">{c.rank}</Badge>}
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
            {selectedCrew.length > 0 && (
              <p className="text-sm text-primary mt-1">{selectedCrew.length} selecionado(s)</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !selectedVessel || selectedCrew.length === 0}>
            {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Escalar {selectedCrew.length} Tripulante(s)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===================== 3. ORDEM DE SERVIÇO DIALOG =====================
export function MaintenanceOrderDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const queryClient = useQueryClient();
  const { data: vessels = [] } = useVesselsList();
  const [form, setForm] = useState({
    vessel_id: "",
    title: "",
    description: "",
    priority: "medium",
    maintenance_type: "corrective",
    scheduled_date: "",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!form.title) throw new Error("Título é obrigatório");
      if (!form.vessel_id) throw new Error("Embarcação é obrigatória");

      const { data, error } = await supabase
        .from("maintenance_records")
        .insert([{
          vessel_id: form.vessel_id,
          title: form.title,
          description: form.description || null,
          priority: form.priority,
          maintenance_type: form.maintenance_type,
          scheduled_date: form.scheduled_date || new Date(Date.now() + 7 * 86400000).toISOString(),
          status: "pending",
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["maintenance-records"] });
      toast.success("Ordem de serviço criada com sucesso!");
      onOpenChange(false);
      setForm({ vessel_id: "", title: "", description: "", priority: "medium", maintenance_type: "corrective", scheduled_date: "" });
    },
    onError: (err: Error) => toast.error(`Erro: ${err.message}`),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5 text-primary" />
            Nova Ordem de Serviço
          </DialogTitle>
          <DialogDescription>Registre uma nova ordem de manutenção</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Título *</Label>
            <Input placeholder="Ex: Revisão motor principal" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div>
            <Label>Embarcação *</Label>
            <Select value={form.vessel_id} onValueChange={(v) => setForm(p => ({ ...p, vessel_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Selecione a embarcação" /></SelectTrigger>
              <SelectContent>
                {vessels.map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Prioridade</Label>
              <Select value={form.priority} onValueChange={(v) => setForm(p => ({ ...p, priority: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Baixa</SelectItem>
                  <SelectItem value="medium">🟡 Média</SelectItem>
                  <SelectItem value="high">🟠 Alta</SelectItem>
                  <SelectItem value="critical">🔴 Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo de Manutenção</Label>
              <Select value={form.maintenance_type} onValueChange={(v) => setForm(p => ({ ...p, maintenance_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="corrective">Corretiva</SelectItem>
                  <SelectItem value="preventive">Preventiva</SelectItem>
                  <SelectItem value="predictive">Preditiva</SelectItem>
                  <SelectItem value="emergency">Emergencial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Data Agendamento</Label>
            <Input type="date" value={form.scheduled_date} onChange={(e) => setForm(p => ({ ...p, scheduled_date: e.target.value }))} />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea placeholder="Detalhes do serviço..." value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.title || !form.vessel_id}>
            {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Criar Ordem
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===================== 4. RELATÓRIO COMBUSTÍVEL DIALOG =====================
export function FuelReportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data: vessels = [], isLoading } = useQuery({
    queryKey: ["vessels-fuel-report"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vessels")
        .select("id, name, current_fuel_level, fuel_capacity, status")
        .order("name");
      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  const exportCSV = () => {
    if (!vessels.length) {
      toast.error("Nenhum dado para exportar");
      return;
    }
    const headers = ["Embarcação", "Combustível Atual", "Capacidade", "Nível (%)", "Status"];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- vessel fuel data from dynamic query
    const rows = vessels.map((v: any) => [
      v.name,
      v.current_fuel_level ?? "N/A",
      v.fuel_capacity ?? "N/A",
      v.fuel_capacity ? `${Math.round(((v.current_fuel_level || 0) / v.fuel_capacity) * 100)}%` : "N/A",
      v.status || "N/A",
    ]);
    const csv = [headers.join(","), ...rows.map((r: string[]) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-combustivel-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Relatório exportado com sucesso!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Fuel className="h-5 w-5 text-primary" />
            Relatório de Combustível
          </DialogTitle>
          <DialogDescription>Status de combustível da frota</DialogDescription>
        </DialogHeader>
        <div className="py-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : vessels.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Fuel className="h-8 w-8 mx-auto mb-2 opacity-40" />
              Nenhum dado de combustível disponível
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- vessel fuel data */}
                {vessels.map((v: any) => {
                  const fuelCap = Number(v.fuel_capacity) || 0;
                  const fuelLevel = Number(v.current_fuel_level) || 0;
                  const level = fuelCap ? Math.round((fuelLevel / fuelCap) * 100) : null;
                  return (
                    <div key={v.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{v.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {v.current_fuel_level ?? "?"} / {v.fuel_capacity ?? "?"} tons
                        </p>
                      </div>
                      <div className="text-right">
                        {level !== null ? (
                          <Badge variant={level < 20 ? "destructive" : level < 50 ? "secondary" : "default"}>
                            {level}%
                          </Badge>
                        ) : (
                          <Badge variant="outline">N/A</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
          <Button onClick={exportCSV} disabled={vessels.length === 0}>
            Exportar CSV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===================== 5. CHECKLIST DIALOG =====================
export function ChecklistDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const queryClient = useQueryClient();
  const { data: checklists = [], isLoading } = useQuery({
    queryKey: ["ops-checklists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("non_conformities")
        .select("id, title, severity, status, created_at, vessel_id")
        .in("status", ["open", "in_progress"])
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  const resolveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("non_conformities")
        .update({ status: "resolved" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ops-checklists"] });
      toast.success("Item resolvido!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Checklists Pendentes
          </DialogTitle>
          <DialogDescription>Itens que requerem ação</DialogDescription>
        </DialogHeader>
        <div className="py-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : checklists.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-success" />
              <p className="font-medium">Tudo em dia!</p>
              <p className="text-sm">Nenhum item pendente</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- non_conformities dynamic query */}
                {checklists.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/30 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {item.severity === "critical" ? (
                        <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={item.severity === "critical" ? "destructive" : "secondary"}>
                        {item.severity}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveMutation.mutate(item.id)}
                        disabled={resolveMutation.isPending}
                      >
                        Resolver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
