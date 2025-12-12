import { useEffect, useState, useCallback } from "react";;
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Ship, Plus, RefreshCw, Brain, Route, BarChart3 } from "lucide-react";
import { FleetMetrics } from "./components/FleetMetrics";
import { VesselGrid } from "./components/VesselGrid";
import { MaintenancePanel } from "./components/MaintenancePanel";
import { FleetAICopilot } from "./components/FleetAICopilot";

const FleetModule = () => {
  const { toast } = useToast();
  const [vessels, setVessels] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [crewAssignments, setCrewAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState<unknown>(null);
  const [newVessel, setNewVessel] = useState({ name: "", imo_number: "", vessel_type: "cargo", location: "" });

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: vesselsData } = await supabase.from("vessels").select("*").order("name").limit(50);
      setVessels(vesselsData || []);

      const { data: maintenanceData } = await supabase.from("maintenance_schedules" as unknown).select("*").order("scheduled_date", { ascending: false }).limit(50);
      setMaintenance((maintenanceData as any[]) || []);

      const { data: crewData } = await supabase.from("crew_assignments" as unknown).select("*").limit(100);
      setCrewAssignments((crewData as any[]) || []);
    } catch (error) {
      console.error("Error loading fleet data:", error);
      console.error("Error loading fleet data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAddVessel = async () => {
    if (!newVessel.name.trim()) {
      toast({ title: "Erro", description: "Nome é obrigatório", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.from("vessels").insert([{
        name: newVessel.name,
        imo_number: newVessel.imo_number || null,
        vessel_type: newVessel.vessel_type,
        status: "active",
        current_location: newVessel.location || null,
        flag_state: "BR"
      }]);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Embarcação adicionada!" });
      setShowAddDialog(false);
      setNewVessel({ name: "", imo_number: "", vessel_type: "cargo", location: "" });
      loadData();
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao adicionar", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
            <Ship className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Gestão de Frota</h1>
            <p className="text-muted-foreground">Centro unificado de operações marítimas com IA</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Nova Embarcação</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Embarcação</DialogTitle>
                <DialogDescription>Adicione uma embarcação à frota</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div><Label>Nome *</Label><Input value={newVessel.name} onChange={handleChange}))} placeholder="MV Ocean Star" /></div>
                <div><Label>IMO</Label><Input value={newVessel.imo_number} onChange={handleChange}))} placeholder="9123456" /></div>
                <div><Label>Tipo</Label>
                  <Select value={newVessel.vessel_type} onValueChange={(v) => setNewVessel(p => ({ ...p, vessel_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cargo">Carga</SelectItem>
                      <SelectItem value="tanker">Petroleiro</SelectItem>
                      <SelectItem value="container">Contêiner</SelectItem>
                      <SelectItem value="offshore">Offshore</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Localização</Label><Input value={newVessel.location} onChange={handleChange}))} placeholder="Porto de Santos" /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleSetShowAddDialog}>Cancelar</Button>
                <Button onClick={handleAddVessel}>Adicionar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Metrics */}
      <FleetMetrics vessels={vessels} maintenance={maintenance} crewAssignments={crewAssignments} />

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Tabs defaultValue="vessels" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="vessels">Embarcações</TabsTrigger>
              <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
              <TabsTrigger value="routes">Rotas</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="vessels">
              <VesselGrid vessels={vessels} onViewDetails={setSelectedVessel} isLoading={loading} />
            </TabsContent>

            <TabsContent value="maintenance">
              <MaintenancePanel maintenance={maintenance} vessels={vessels} onRefresh={loadData} />
            </TabsContent>

            <TabsContent value="routes">
              <Card><CardHeader><CardTitle className="flex items-center gap-2"><Route className="h-5 w-5" />Otimização de Rotas</CardTitle></CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">Use o AI Copilot para otimizar rotas da frota</CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card><CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Analytics da Frota</CardTitle></CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">Dashboards e relatórios avançados</CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* AI Copilot Sidebar */}
        <div className="xl:col-span-1">
          <FleetAICopilot vessels={vessels} onInsightGenerated={(insight) => {}} />
        </div>
      </div>
    </div>
  );
};

export default FleetModule;
