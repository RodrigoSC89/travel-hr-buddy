import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  UserPlus,
  Shield,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Search,
  Download,
  Edit,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CrewMember {
  id: string;
  full_name: string;
  position: string;
  rank?: string;
  nationality: string;
  passport_number?: string;
  phone?: string;
  email?: string;
  employee_id: string;
  status: string;
  vessel_id?: string;
  contract_start?: string;
  contract_end?: string;
  experience_years?: number;
}

export default function CrewManagement() {
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [vessels, setVessels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [vesselFilter, setVesselFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar navios
      const { data: vesselsData } = await supabase
        .from("vessels")
        .select("*")
        .eq("organization_id", "550e8400-e29b-41d4-a716-446655440000");

      if (vesselsData) {
        setVessels(vesselsData);
      }

      // Dados demo para tripulação
      const demoCrewMembers: CrewMember[] = [
        {
          id: "1",
          full_name: "João Silva",
          position: "Comandante",
          rank: "Capitão",
          nationality: "Brasileiro",
          passport_number: "BR123456789",
          phone: "+55 11 99999-9999",
          email: "joao.silva@nautilus.com",
          employee_id: "EMP001",
          status: "active",
          vessel_id: vesselsData?.[0]?.id,
          contract_start: "2024-01-01",
          contract_end: "2024-12-31",
          experience_years: 15,
        },
        {
          id: "2",
          full_name: "Carlos Santos",
          position: "Chefe de Máquinas",
          rank: "Oficial",
          nationality: "Brasileiro",
          passport_number: "BR987654321",
          phone: "+55 21 77777-7777",
          email: "carlos.santos@nautilus.com",
          employee_id: "EMP002",
          status: "active",
          vessel_id: vesselsData?.[0]?.id,
          contract_start: "2024-01-01",
          contract_end: "2024-12-31",
          experience_years: 12,
        },
        {
          id: "3",
          full_name: "Maria Oliveira",
          position: "Oficial de Convés",
          rank: "Oficial",
          nationality: "Brasileira",
          passport_number: "BR456789123",
          phone: "+55 11 66666-6666",
          email: "maria.oliveira@nautilus.com",
          employee_id: "EMP003",
          status: "active",
          vessel_id: vesselsData?.[1]?.id,
          contract_start: "2024-01-01",
          contract_end: "2024-12-31",
          experience_years: 8,
        },
        {
          id: "4",
          full_name: "Pedro Costa",
          position: "Marinheiro",
          nationality: "Brasileiro",
          passport_number: "BR789123456",
          phone: "+55 31 55555-5555",
          email: "pedro.costa@nautilus.com",
          employee_id: "EMP004",
          status: "shore_leave",
          experience_years: 5,
        },
      ];
      setCrewMembers(demoCrewMembers);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados da tripulação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getVesselName = (vesselId: string) => {
    const vessel = vessels.find(v => v.id === vesselId);
    return vessel ? vessel.name : "Não atribuído";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "shore_leave":
        return "bg-yellow-500";
      case "medical_leave":
        return "bg-orange-500";
      case "inactive":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo";
      case "shore_leave":
        return "Licença Terra";
      case "medical_leave":
        return "Licença Médica";
      case "inactive":
        return "Inativo";
      default:
        return status;
    }
  };

  const filteredCrewMembers = crewMembers.filter(member => {
    const matchesSearch =
      member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    const matchesVessel = vesselFilter === "all" || member.vessel_id === vesselFilter;

    return matchesSearch && matchesStatus && matchesVessel;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Tripulação</h1>
        <p className="text-muted-foreground">
          Controle completo da tripulação, certificações e escalas
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Tripulantes</p>
                <p className="text-2xl font-bold">{crewMembers.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {crewMembers.filter(m => m.status === "active").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Licença</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {crewMembers.filter(m => m.status === "shore_leave").length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cert. Vencendo</p>
                <p className="text-2xl font-bold text-red-600">3</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Tripulação</CardTitle>
              <CardDescription>Gerencie informações da tripulação e certificações</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Novo Tripulante
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Tripulante</DialogTitle>
                    <DialogDescription>
                      Preencha as informações do novo membro da tripulação
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input id="name" placeholder="Nome do tripulante" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Posição</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a posição" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="commander">Comandante</SelectItem>
                          <SelectItem value="chief_engineer">Chefe de Máquinas</SelectItem>
                          <SelectItem value="deck_officer">Oficial de Convés</SelectItem>
                          <SelectItem value="engineer">Engenheiro</SelectItem>
                          <SelectItem value="sailor">Marinheiro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nationality">Nacionalidade</Label>
                      <Input id="nationality" placeholder="Nacionalidade" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passport">Número do Passaporte</Label>
                      <Input id="passport" placeholder="Número do passaporte" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input id="phone" placeholder="Telefone de contato" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="Email" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button>Adicionar Tripulante</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, posição ou ID..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="shore_leave">Licença Terra</SelectItem>
                <SelectItem value="medical_leave">Licença Médica</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={vesselFilter} onValueChange={setVesselFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Embarcação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {vessels.map(vessel => (
                  <SelectItem key={vessel.id} value={vessel.id}>
                    {vessel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Crew Members Table */}
          <div className="space-y-3">
            {filteredCrewMembers.map(member => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(member.status)}`}></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{member.full_name}</h4>
                      {member.rank && (
                        <Badge variant="outline" className="text-xs">
                          {member.rank}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{member.position}</span>
                      <span>•</span>
                      <span>ID: {member.employee_id}</span>
                      <span>•</span>
                      <span>{member.nationality}</span>
                      {member.vessel_id && (
                        <>
                          <span>•</span>
                          <span>{getVesselName(member.vessel_id)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{getStatusLabel(member.status)}</Badge>
                  {member.experience_years && (
                    <div className="text-sm text-muted-foreground">
                      {member.experience_years} anos exp.
                    </div>
                  )}
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Shield className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredCrewMembers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum tripulante encontrado</h3>
              <p className="text-muted-foreground">
                Tente ajustar os filtros ou adicione novos tripulantes
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
