import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Clock,
  MapPin,
  Award,
  AlertCircle,
  Search,
  Filter,
  Plus
} from "lucide-react";

interface CrewMember {
  id: string;
  full_name: string;
  position: string;
  rank: string;
  status: "available" | "assigned" | "on_leave" | "training";
  vessel_assignment?: string;
  contract_start: string;
  contract_end: string;
  certification_count: number;
  experience_years: number;
  nationality: string;
  last_assignment: string;
}

interface CrewAssignment {
  id: string;
  crew_member_name: string;
  vessel_name: string;
  position: string;
  start_date: string;
  end_date?: string;
  status: "active" | "completed" | "scheduled";
}

export const CrewManagementDashboard = () => {
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [assignments, setAssignments] = useState<CrewAssignment[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCrewData();
  }, []);

  const loadCrewData = async () => {
    try {
      setLoading(true);
      
      // Load crew members
      const { data: crewData, error: crewError } = await supabase
        .from("crew_members")
        .select("*")
        .order("full_name");

      if (crewError) throw crewError;

      // Transform data
      const transformedCrew: CrewMember[] = crewData?.map(member => ({
        id: member.id,
        full_name: member.full_name,
        position: member.position,
        rank: member.rank || "N/A",
        status: member.status as any,
        vessel_assignment: member.vessel_id,
        contract_start: member.contract_start,
        contract_end: member.contract_end,
        certification_count: Math.floor(Math.random() * 10) + 1,
        experience_years: member.experience_years || 0,
        nationality: member.nationality,
        last_assignment: "MV Atlantic Explorer"
      })) || [];

      setCrewMembers(transformedCrew);

      // Mock assignments data
      const mockAssignments: CrewAssignment[] = [
        {
          id: "1",
          crew_member_name: "João Silva",
          vessel_name: "MV Atlantic Explorer",
          position: "Capitão",
          start_date: "2024-01-15",
          status: "active"
        },
        {
          id: "2",
          crew_member_name: "Maria Santos",
          vessel_name: "MS Ocean Pioneer",
          position: "Imediato",
          start_date: "2024-02-01",
          end_date: "2024-06-01",
          status: "scheduled"
        }
      ];

      setAssignments(mockAssignments);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados da tripulação",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: CrewMember["status"]) => {
    switch (status) {
    case "available": return "bg-green-500";
    case "assigned": return "bg-blue-500";
    case "on_leave": return "bg-yellow-500";
    case "training": return "bg-purple-500";
    default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: CrewMember["status"]) => {
    switch (status) {
    case "available": return "Disponível";
    case "assigned": return "Designado";
    case "on_leave": return "De Licença";
    case "training": return "Treinamento";
    default: return "Desconhecido";
    }
  };

  const filteredCrewMembers = crewMembers.filter(member => {
    const matchesSearch = member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const crewStats = {
    total: crewMembers.length,
    available: crewMembers.filter(m => m.status === "available").length,
    assigned: crewMembers.filter(m => m.status === "assigned").length,
    on_leave: crewMembers.filter(m => m.status === "on_leave").length,
    training: crewMembers.filter(m => m.status === "training").length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Tripulação</h2>
          <p className="text-muted-foreground">
            Gerencie membros da tripulação, escalas e certificações
          </p>
        </div>
        
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Tripulante
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{crewStats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <UserCheck className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{crewStats.available}</div>
            <div className="text-sm text-muted-foreground">Disponíveis</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{crewStats.assigned}</div>
            <div className="text-sm text-muted-foreground">Designados</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold">{crewStats.on_leave}</div>
            <div className="text-sm text-muted-foreground">De Licença</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{crewStats.training}</div>
            <div className="text-sm text-muted-foreground">Treinamento</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="assignments">Escalas</TabsTrigger>
          <TabsTrigger value="certificates">Certificações</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome ou cargo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="available">Disponível</SelectItem>
                    <SelectItem value="assigned">Designado</SelectItem>
                    <SelectItem value="on_leave">De Licença</SelectItem>
                    <SelectItem value="training">Treinamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Crew Members List */}
          <Card>
            <CardHeader>
              <CardTitle>Membros da Tripulação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredCrewMembers.map((member) => (
                  <div key={member.id} className="border rounded-lg p-4 hover:bg-accent transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        
                        <div>
                          <h3 className="font-semibold">{member.full_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {member.position} • {member.rank}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.experience_years} anos de experiência • {member.nationality}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge className={`${getStatusColor(member.status)} text-azure-50`}>
                            {getStatusText(member.status)}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {member.certification_count} certificações
                          </div>
                        </div>
                        
                        <Button variant="outline" size="sm">
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                    
                    {member.vessel_assignment && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          Designado para: {member.last_assignment}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Escalas Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{assignment.crew_member_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {assignment.position} • {assignment.vessel_name}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(assignment.start_date).toLocaleDateString()} - 
                            {assignment.end_date ? new Date(assignment.end_date).toLocaleDateString() : "Em aberto"}
                          </span>
                        </div>
                      </div>
                      
                      <Badge variant={assignment.status === "active" ? "default" : "secondary"}>
                        {assignment.status === "active" ? "Ativo" : 
                          assignment.status === "scheduled" ? "Agendado" : "Concluído"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-6">
          <Card>
            <CardContent className="text-center py-12">
              <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Gestão de Certificações</h3>
              <p className="text-muted-foreground">
                Módulo de certificações em desenvolvimento
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Relatórios de Tripulação</h3>
              <p className="text-muted-foreground">
                Relatórios detalhados em desenvolvimento
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};