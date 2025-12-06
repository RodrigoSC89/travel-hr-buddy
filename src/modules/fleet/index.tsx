import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import { 
  Ship, 
  Users, 
  AlertTriangle, 
  Activity,
  MapPin,
  Wrench,
  FileText,
  BarChart3,
  Plus,
  Eye,
  Edit,
  Trash2,
  RefreshCw
} from "lucide-react";

interface VesselData {
  id: string;
  name: string;
  status: string;
  location: string;
  lastUpdate: string;
  imo_number?: string;
  vessel_type?: string;
}

interface MaintenanceData {
  id: string;
  vessel_id: string;
  type: string;
  scheduled_date: string;
  status: string;
}

interface CrewAssignment {
  id: string;
  vessel_id: string;
  crew_member_id: string;
  role: string;
  assigned_date: string;
}

const FleetModule = () => {
  const { toast } = useToast();
  const [vessels, setVessels] = useState<VesselData[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceData[]>([]);
  const [crewAssignments, setCrewAssignments] = useState<CrewAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddVesselDialog, setShowAddVesselDialog] = useState(false);
  const [showVesselDetailsDialog, setShowVesselDetailsDialog] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState<VesselData | null>(null);
  const [newVessel, setNewVessel] = useState({
    name: "",
    imo_number: "",
    vessel_type: "cargo",
    status: "active",
    location: ""
  });

  const loadFleetData = async () => {
    try {
      setLoading(true);

      const { data: vesselsData, error: vesselsError } = await supabase
        .from("vessels")
        .select("id, name, status, location, updated_at, imo_number, vessel_type")
        .order("name")
        .limit(50);

      if (vesselsError) {
        logger.error("Error loading vessels", { error: vesselsError });
      } else {
        setVessels((vesselsData as any[]) || []);
      }

      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from("maintenance" as any)
        .select("id, vessel_id, type, scheduled_date, status")
        .order("scheduled_date", { ascending: false })
        .limit(100);

      if (maintenanceError) {
        logger.error("Error loading maintenance", { error: maintenanceError });
      } else {
        setMaintenance((maintenanceData as any[]) || []);
      }

      const { data: crewData, error: crewError } = await supabase
        .from("crew_assignments" as any)
        .select("id, vessel_id, crew_member_id, role, assigned_date")
        .order("start_date", { ascending: false })
        .limit(100);

      if (crewError) {
        logger.error("Error loading crew assignments", { error: crewError });
      } else {
        setCrewAssignments((crewData as any[]) || []);
      }

    } catch (error) {
      logger.error("Error loading fleet data", { error });
      toast({
        title: "Erro",
        description: "Falha ao carregar dados da frota. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFleetData();
  }, []);

  const handleAddVessel = async () => {
    if (!newVessel.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da embarcação é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("vessels")
        .insert([{
          name: newVessel.name,
          imo_number: newVessel.imo_number || null,
          vessel_type: newVessel.vessel_type,
          status: newVessel.status,
          current_location: newVessel.location || null,
          flag_state: "BR"
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Embarcação adicionada com sucesso!"
      });

      setShowAddVesselDialog(false);
      setNewVessel({ name: "", imo_number: "", vessel_type: "cargo", status: "active", location: "" });
      loadFleetData();
    } catch (error) {
      logger.error("Error adding vessel", { error });
      toast({
        title: "Erro",
        description: "Falha ao adicionar embarcação",
        variant: "destructive"
      });
    }
  };

  const handleViewVessel = (vessel: VesselData) => {
    setSelectedVessel(vessel);
    setShowVesselDetailsDialog(true);
  };

  const handleUpdateVesselStatus = async (vesselId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("vessels")
        .update({ status: newStatus })
        .eq("id", vesselId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Status atualizado com sucesso!"
      });

      loadFleetData();
    } catch (error) {
      logger.error("Error updating vessel status", { error });
      toast({
        title: "Erro",
        description: "Falha ao atualizar status",
        variant: "destructive"
      });
    }
  };

  const activeVessels = vessels.filter(v => v.status === "active").length;
  const pendingMaintenance = maintenance.filter(m => m.status === "pending").length;
  const totalCrew = crewAssignments.length;

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Carregando dados da frota...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Ship className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Gestão de Frota</h1>
            <p className="text-muted-foreground">Centro unificado de operações de frota e marítimas</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadFleetData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Dialog open={showAddVesselDialog} onOpenChange={setShowAddVesselDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Embarcação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Embarcação</DialogTitle>
                <DialogDescription>
                  Adicione uma nova embarcação à sua frota
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome da Embarcação *</Label>
                  <Input
                    value={newVessel.name}
                    onChange={(e) => setNewVessel(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: MV Ocean Star"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Número IMO</Label>
                  <Input
                    value={newVessel.imo_number}
                    onChange={(e) => setNewVessel(prev => ({ ...prev, imo_number: e.target.value }))}
                    placeholder="Ex: 9123456"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Embarcação</Label>
                  <Select
                    value={newVessel.vessel_type}
                    onValueChange={(value) => setNewVessel(prev => ({ ...prev, vessel_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cargo">Carga</SelectItem>
                      <SelectItem value="tanker">Petroleiro</SelectItem>
                      <SelectItem value="passenger">Passageiros</SelectItem>
                      <SelectItem value="container">Contêiner</SelectItem>
                      <SelectItem value="offshore">Offshore</SelectItem>
                      <SelectItem value="tug">Rebocador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Localização Atual</Label>
                  <Input
                    value={newVessel.location}
                    onChange={(e) => setNewVessel(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Ex: Porto de Santos"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddVesselDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddVessel}>
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Embarcações Ativas</CardTitle>
            <Ship className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeVessels}</div>
            <p className="text-xs text-muted-foreground">
              {vessels.length > 0 ? Math.round((activeVessels / vessels.length) * 100) : 0}% operacionais
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tripulação Atribuída</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCrew}</div>
            <p className="text-xs text-muted-foreground">Atribuições ativas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Manutenção</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingMaintenance}</div>
            <p className="text-xs text-muted-foreground">Tarefas pendentes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Posições Rastreadas</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeVessels}/{vessels.length}</div>
            <p className="text-xs text-muted-foreground">Rastreamento em tempo real</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="vessels" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vessels">Embarcações</TabsTrigger>
          <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
          <TabsTrigger value="crew">Tripulação</TabsTrigger>
          <TabsTrigger value="routes">Rotas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="vessels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Frota de Embarcações</CardTitle>
              <CardDescription>Gerencie e monitore todas as embarcações da sua frota</CardDescription>
            </CardHeader>
            <CardContent>
              {vessels.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Ship className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma embarcação encontrada. Adicione sua primeira embarcação para começar.</p>
                  <Button className="mt-4" onClick={() => setShowAddVesselDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Embarcação
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {vessels.map((vessel) => (
                    <div key={vessel.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <Ship className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-semibold">{vessel.name}</p>
                          <p className="text-sm text-muted-foreground">{vessel.location || "Localização não informada"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={vessel.status === "active" ? "default" : "secondary"}>
                          {vessel.status === "active" ? "Ativo" : vessel.status}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => handleViewVessel(vessel)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Detalhes
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Agenda de Manutenção</CardTitle>
                <CardDescription>Acompanhe e gerencie atividades de manutenção</CardDescription>
              </div>
              <Button onClick={() => window.location.href = "/maintenance-planner"}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Manutenção
              </Button>
            </CardHeader>
            <CardContent>
              {maintenance.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum registro de manutenção encontrado.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {maintenance.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Wrench className="h-5 w-5 text-orange-500" />
                        <div>
                          <p className="font-semibold">{item.type}</p>
                          <p className="text-sm text-muted-foreground">{item.scheduled_date}</p>
                        </div>
                      </div>
                      <Badge variant={item.status === "pending" ? "destructive" : "default"}>
                        {item.status === "pending" ? "Pendente" : item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crew" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Atribuições de Tripulação</CardTitle>
                <CardDescription>Gerencie membros da tripulação e suas atribuições</CardDescription>
              </div>
              <Button onClick={() => window.location.href = "/crew"}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Atribuição
              </Button>
            </CardHeader>
            <CardContent>
              {crewAssignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma atribuição de tripulação encontrada.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {crewAssignments.slice(0, 5).map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Users className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-semibold">{assignment.role}</p>
                          <p className="text-sm text-muted-foreground">Atribuído: {assignment.assigned_date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gestão de Rotas</CardTitle>
                <CardDescription>Planeje e rastreie rotas e navegação de embarcações</CardDescription>
              </div>
              <Button onClick={() => window.location.href = "/voyage-planner"}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Rota
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Interface de gestão de rotas.</p>
                <Button className="mt-4" onClick={() => window.location.href = "/voyage-planner"}>
                  Acessar Planejador de Viagem
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Analytics da Frota</CardTitle>
                <CardDescription>Métricas de performance e insights</CardDescription>
              </div>
              <Button onClick={() => window.location.href = "/operations-dashboard"}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard Completo
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{vessels.length}</div>
                      <p className="text-sm text-muted-foreground">Total de Embarcações</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-500">{Math.round((activeVessels / Math.max(vessels.length, 1)) * 100)}%</div>
                      <p className="text-sm text-muted-foreground">Taxa de Operação</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-500">{totalCrew}</div>
                      <p className="text-sm text-muted-foreground">Tripulantes Ativos</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Vessel Details Dialog */}
      <Dialog open={showVesselDetailsDialog} onOpenChange={setShowVesselDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Embarcação</DialogTitle>
            <DialogDescription>
              {selectedVessel?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedVessel && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Nome</Label>
                  <p className="font-semibold">{selectedVessel.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">IMO</Label>
                  <p className="font-semibold">{selectedVessel.imo_number || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tipo</Label>
                  <p className="font-semibold">{selectedVessel.vessel_type || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge variant={selectedVessel.status === "active" ? "default" : "secondary"}>
                    {selectedVessel.status === "active" ? "Ativo" : selectedVessel.status}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Localização</Label>
                  <p className="font-semibold">{selectedVessel.location || "Não informada"}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => handleUpdateVesselStatus(selectedVessel.id, selectedVessel.status === "active" ? "inactive" : "active")}
                >
                  {selectedVessel.status === "active" ? "Desativar" : "Ativar"}
                </Button>
                <Button onClick={() => window.location.href = `/maintenance-planner?vessel=${selectedVessel.id}`}>
                  <Wrench className="h-4 w-4 mr-2" />
                  Ver Manutenções
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FleetModule;
