import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, User, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CrewMember {
  id: string;
  full_name: string;
  position: string;
  employee_id: string;
  status: string;
  vessel_assignment?: string;
  nationality: string;
}

interface CrewSelectionProps {
  onSelect: (crewId: string) => void;
}

export const CrewSelection: React.FC<CrewSelectionProps> = ({ onSelect }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadCrewMembers();
  }, []);

  const loadCrewMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("crew_members")
        .select("*")
        .order("full_name");

      if (error) throw error;
      setCrewMembers(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar tripulantes",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCrewMembers = crewMembers.filter(member =>
    member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "available":
      return <Badge variant="default" className="bg-success text-success-foreground">Disponível</Badge>;
    case "embarked":
      return <Badge variant="secondary">Embarcado</Badge>;
    case "leave":
      return <Badge variant="outline">Folga</Badge>;
    case "training":
      return <Badge variant="secondary">Treinamento</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando tripulantes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Dossiê do Tripulante</h1>
        <p className="text-muted-foreground">
          Selecione um tripulante para visualizar seu dossiê completo
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tripulantes Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, função ou matrícula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCrewMembers.map((member) => (
                <Card key={member.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {member.full_name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{member.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{member.position}</p>
                        <p className="text-xs text-muted-foreground">ID: {member.employee_id}</p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          {getStatusBadge(member.status)}
                          {member.vessel_assignment && (
                            <Badge variant="outline" className="text-xs">
                              {member.vessel_assignment}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full mt-4" 
                      onClick={() => onSelect(member.id)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Ver Dossiê
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCrewMembers.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchTerm ? "Nenhum tripulante encontrado para a busca" : "Nenhum tripulante cadastrado"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};