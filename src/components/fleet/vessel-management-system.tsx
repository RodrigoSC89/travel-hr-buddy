import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Ship,
  Plus,
  Search,
  MapPin,
  Calendar,
  Users,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  Eye,
  Filter,
  Download,
  FileText,
  Anchor,
  Navigation,
  Fuel,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Vessel {
  id: string;
  name: string;
  imo_number?: string;
  vessel_type: string;
  flag_state: string;
  status: string;
  current_location?: string;
  next_port?: string;
  eta?: string;
  created_at: string;
  organization_id?: string;
  crew_count?: number;
  cargo_capacity?: number;
  fuel_consumption?: number;
  last_maintenance?: string;
}

interface VesselManagementProps {
  onStatsUpdate: () => void;
}

const VesselManagementSystem: React.FC<VesselManagementProps> = ({ onStatsUpdate }) => {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const { toast } = useToast();

  // Form state for new vessel
  const [newVessel, setNewVessel] = useState({
    name: "",
    imo_number: "",
    vessel_type: "",
    flag_state: "",
    next_port: "",
    eta: "",
    crew_count: "",
    cargo_capacity: "",
    fuel_consumption: "",
  });

  useEffect(() => {
    loadVessels();

    // Setup real-time subscriptions
    const channel = supabase
      .channel("vessels-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "vessels",
        },
        payload => {
          console.log("Vessel change received:", payload);

          if (payload.eventType === "INSERT") {
            setVessels(prev => [payload.new as Vessel, ...prev]);
            toast({
              title: "Nova Embarcação",
              description: `${payload.new.name} foi adicionada à frota`,
            });
          } else if (payload.eventType === "UPDATE") {
            setVessels(prev =>
              prev.map(vessel => (vessel.id === payload.new.id ? (payload.new as Vessel) : vessel))
            );
          } else if (payload.eventType === "DELETE") {
            setVessels(prev => prev.filter(vessel => vessel.id !== payload.old.id));
            toast({
              title: "Embarcação Removida",
              description: "Uma embarcação foi removida da frota",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const loadVessels = async () => {
    try {
      setIsLoading(true);

      const { data: vessels, error } = await supabase
        .from("vessels")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        // Mock data fallback
        const mockVessels: Vessel[] = [
          {
            id: "1",
            name: "MV Atlântico Explorer",
            imo_number: "9876543",
            vessel_type: "Container Ship",
            flag_state: "Brasil",
            status: "active",
            current_location: "Santos, Brasil",
            next_port: "Rio de Janeiro",
            eta: "2024-01-15T10:00:00Z",
            created_at: "2024-01-01T00:00:00Z",
            crew_count: 24,
            cargo_capacity: 12000,
            fuel_consumption: 15.2,
            last_maintenance: "2024-01-01",
          },
          {
            id: "2",
            name: "MV Pacífico Star",
            imo_number: "9765432",
            vessel_type: "Bulk Carrier",
            flag_state: "Brasil",
            status: "active",
            current_location: "Paranaguá, Brasil",
            next_port: "Salvador",
            eta: "2024-01-18T14:30:00Z",
            created_at: "2024-01-01T00:00:00Z",
            crew_count: 22,
            cargo_capacity: 18000,
            fuel_consumption: 18.5,
            last_maintenance: "2023-12-15",
          },
          {
            id: "3",
            name: "MV Índico Pioneer",
            imo_number: "9654321",
            vessel_type: "Tanker",
            flag_state: "Brasil",
            status: "maintenance",
            current_location: "Estaleiro Suape",
            next_port: "Fortaleza",
            eta: "2024-01-22T08:00:00Z",
            created_at: "2024-01-01T00:00:00Z",
            crew_count: 26,
            cargo_capacity: 25000,
            fuel_consumption: 22.1,
            last_maintenance: "2024-01-10",
          },
          {
            id: "4",
            name: "MV Mediterrâneo",
            imo_number: "9543210",
            vessel_type: "Cargo Ship",
            flag_state: "Brasil",
            status: "active",
            current_location: "Vitória, Brasil",
            next_port: "Recife",
            eta: "2024-01-20T16:00:00Z",
            created_at: "2024-01-01T00:00:00Z",
            crew_count: 20,
            cargo_capacity: 8500,
            fuel_consumption: 12.8,
            last_maintenance: "2023-12-20",
          },
        ];

        setVessels(mockVessels);
      } else {
        setVessels(vessels || []);
      }
    } catch (error) {
      console.error("Erro ao carregar embarcações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as embarcações",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVessel = async () => {
    try {
      // Get current organization ID
      const { data: userOrg, error: orgError } = await supabase
        .from("organization_users")
        .select("organization_id")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .eq("status", "active")
        .single();

      const vesselData = {
        name: newVessel.name,
        imo_number: newVessel.imo_number,
        vessel_type: newVessel.vessel_type,
        flag_state: newVessel.flag_state,
        next_port: newVessel.next_port,
        eta: newVessel.eta ? new Date(newVessel.eta).toISOString() : null,
        status: "active",
        current_location: "Location TBD",
        crew_count: parseInt(newVessel.crew_count) || 0,
        cargo_capacity: parseInt(newVessel.cargo_capacity) || 0,
        fuel_consumption: parseFloat(newVessel.fuel_consumption) || 0,
        organization_id: userOrg?.organization_id,
      };

      const { data, error } = await supabase.from("vessels").insert([vesselData]).select().single();

      if (error) {
        throw error;
      }

      // Real-time will handle the UI update
      setNewVessel({
        name: "",
        imo_number: "",
        vessel_type: "",
        flag_state: "",
        next_port: "",
        eta: "",
        crew_count: "",
        cargo_capacity: "",
        fuel_consumption: "",
      });
      setShowAddDialog(false);
      onStatsUpdate();

      toast({
        title: "Embarcação Adicionada",
        description: `${data.name} foi adicionada com sucesso à frota`,
      });
    } catch (error) {
      console.error("Error adding vessel:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a embarcação",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success text-success-foreground";
      case "maintenance":
        return "bg-warning text-warning-foreground";
      case "inactive":
        return "bg-destructive text-destructive-foreground";
      case "docked":
        return "bg-info text-info-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Operacional";
      case "maintenance":
        return "Manutenção";
      case "inactive":
        return "Inativa";
      case "docked":
        return "Atracada";
      default:
        return "Desconhecido";
    }
  };

  const getVesselTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "container ship":
        return <Ship className="h-5 w-5 text-primary" />;
      case "bulk carrier":
        return <Anchor className="h-5 w-5 text-azure-600" />;
      case "tanker":
        return <Fuel className="h-5 w-5 text-warning" />;
      default:
        return <Navigation className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const filteredVessels = vessels.filter(vessel => {
    const matchesSearch =
      vessel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vessel.vessel_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vessel.imo_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || vessel.status === statusFilter;
    const matchesType = typeFilter === "all" || vessel.vessel_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const vesselTypes = [...new Set(vessels.map(v => v.vessel_type))];

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Ship className="h-6 w-6 text-primary" />
            Gestão da Frota Ativa
          </h2>
          <p className="text-muted-foreground">Controle completo das embarcações da organização</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar Lista
          </Button>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Embarcação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Adicionar Nova Embarcação</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome da Embarcação *</Label>
                  <Input
                    id="name"
                    value={newVessel.name}
                    onChange={e => setNewVessel({ ...newVessel, name: e.target.value })}
                    placeholder="Ex: MV Atlântico Explorer"
                  />
                </div>
                <div>
                  <Label htmlFor="imo">Número IMO</Label>
                  <Input
                    id="imo"
                    value={newVessel.imo_number}
                    onChange={e => setNewVessel({ ...newVessel, imo_number: e.target.value })}
                    placeholder="Ex: 9876543"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo de Embarcação *</Label>
                  <Select
                    value={newVessel.vessel_type}
                    onValueChange={value => setNewVessel({ ...newVessel, vessel_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Container Ship">Navio Porta-contêineres</SelectItem>
                      <SelectItem value="Bulk Carrier">Graneleiro</SelectItem>
                      <SelectItem value="Tanker">Petroleiro</SelectItem>
                      <SelectItem value="Cargo Ship">Navio de Carga</SelectItem>
                      <SelectItem value="Passenger Ship">Navio de Passageiros</SelectItem>
                      <SelectItem value="Fishing Vessel">Pesqueiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="flag">Bandeira *</Label>
                  <Input
                    id="flag"
                    value={newVessel.flag_state}
                    onChange={e => setNewVessel({ ...newVessel, flag_state: e.target.value })}
                    placeholder="Ex: Brasil"
                  />
                </div>
                <div>
                  <Label htmlFor="crew">Tripulação</Label>
                  <Input
                    id="crew"
                    type="number"
                    value={newVessel.crew_count}
                    onChange={e => setNewVessel({ ...newVessel, crew_count: e.target.value })}
                    placeholder="Ex: 24"
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacidade de Carga (toneladas)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={newVessel.cargo_capacity}
                    onChange={e => setNewVessel({ ...newVessel, cargo_capacity: e.target.value })}
                    placeholder="Ex: 12000"
                  />
                </div>
                <div>
                  <Label htmlFor="fuel">Consumo de Combustível (L/h)</Label>
                  <Input
                    id="fuel"
                    type="number"
                    step="0.1"
                    value={newVessel.fuel_consumption}
                    onChange={e => setNewVessel({ ...newVessel, fuel_consumption: e.target.value })}
                    placeholder="Ex: 15.2"
                  />
                </div>
                <div>
                  <Label htmlFor="port">Próximo Porto</Label>
                  <Input
                    id="port"
                    value={newVessel.next_port}
                    onChange={e => setNewVessel({ ...newVessel, next_port: e.target.value })}
                    placeholder="Ex: Santos"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="eta">ETA (Data e Hora Estimada de Chegada)</Label>
                  <Input
                    id="eta"
                    type="datetime-local"
                    value={newVessel.eta}
                    onChange={e => setNewVessel({ ...newVessel, eta: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button onClick={handleAddVessel} className="flex-1">
                  Adicionar Embarcação
                </Button>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancelar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, tipo ou IMO..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Operacional</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="docked">Atracada</SelectItem>
                <SelectItem value="inactive">Inativa</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                {vesselTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vessels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12">
            <div className="inline-flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              <span>Carregando embarcações...</span>
            </div>
          </div>
        ) : filteredVessels.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Ship className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Nenhuma embarcação encontrada</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                ? "Tente ajustar os filtros de busca"
                : "Adicione a primeira embarcação à sua frota"}
            </p>
            {!searchTerm && statusFilter === "all" && typeFilter === "all" && (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Embarcação
              </Button>
            )}
          </div>
        ) : (
          filteredVessels.map(vessel => (
            <Card key={vessel.id} className="hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getVesselTypeIcon(vessel.vessel_type)}
                    <div>
                      <CardTitle className="text-lg">{vessel.name}</CardTitle>
                      <CardDescription>
                        {vessel.vessel_type} • IMO: {vessel.imo_number}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(vessel.status)}>
                    {getStatusText(vessel.status)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">
                      {vessel.current_location || "Localização não informada"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{vessel.crew_count || "N/A"} tripulantes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      ETA: {vessel.eta ? new Date(vessel.eta).toLocaleDateString("pt-BR") : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Fuel className="h-4 w-4 text-muted-foreground" />
                    <span>{vessel.fuel_consumption || "N/A"} L/h</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedVessel(vessel);
                      setShowDetailsDialog(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Detalhes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Vessel Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedVessel && getVesselTypeIcon(selectedVessel.vessel_type)}
              {selectedVessel?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedVessel && (
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">Geral</TabsTrigger>
                <TabsTrigger value="location">Localização</TabsTrigger>
                <TabsTrigger value="crew">Tripulação</TabsTrigger>
                <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedVessel.status)}>
                        {getStatusText(selectedVessel.status)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label>Tipo de Embarcação</Label>
                    <p className="mt-1 text-sm">{selectedVessel.vessel_type}</p>
                  </div>
                  <div>
                    <Label>Número IMO</Label>
                    <p className="mt-1 text-sm">{selectedVessel.imo_number}</p>
                  </div>
                  <div>
                    <Label>Bandeira</Label>
                    <p className="mt-1 text-sm">{selectedVessel.flag_state}</p>
                  </div>
                  <div>
                    <Label>Capacidade de Carga</Label>
                    <p className="mt-1 text-sm">
                      {selectedVessel.cargo_capacity || "N/A"} toneladas
                    </p>
                  </div>
                  <div>
                    <Label>Consumo de Combustível</Label>
                    <p className="mt-1 text-sm">{selectedVessel.fuel_consumption || "N/A"} L/h</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="location" className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label>Localização Atual</Label>
                    <p className="mt-1">{selectedVessel.current_location || "Não informada"}</p>
                  </div>
                  <div>
                    <Label>Próximo Porto</Label>
                    <p className="mt-1">{selectedVessel.next_port || "Não definido"}</p>
                  </div>
                  <div>
                    <Label>ETA</Label>
                    <p className="mt-1">
                      {selectedVessel.eta
                        ? new Date(selectedVessel.eta).toLocaleString("pt-BR")
                        : "Não definida"}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="outline" className="w-full">
                    <MapPin className="h-4 w-4 mr-2" />
                    Ver no Mapa
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="crew" className="space-y-4">
                <div>
                  <Label>Tripulação Atual</Label>
                  <p className="mt-1 text-2xl font-bold">
                    {selectedVessel.crew_count || 0} membros
                  </p>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Gerenciar Tripulação
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Certificações da Tripulação
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="maintenance" className="space-y-4">
                <div>
                  <Label>Última Manutenção</Label>
                  <p className="mt-1">
                    {selectedVessel.last_maintenance
                      ? new Date(selectedVessel.last_maintenance).toLocaleDateString("pt-BR")
                      : "Não registrada"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Histórico de Manutenção
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendar Manutenção
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="h-4 w-4 mr-2" />
                    Manutenção Preventiva
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VesselManagementSystem;
