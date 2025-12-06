import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import { 
  Users, 
  UserPlus,
  Calendar,
  Award,
  AlertTriangle,
  Activity,
  Search,
  RefreshCw,
  Eye,
  FileText,
  Clock
} from "lucide-react";

interface CrewMember {
  id: string;
  full_name: string;
  position: string;
  status: string | null;
  vessel_id?: string | null;
  email?: string | null;
  phone?: string | null;
  join_date?: string | null;
  employee_id: string;
  nationality: string;
}

interface Certificate {
  id: string;
  employee_id: string;
  certificate_name: string;
  issue_date: string;
  expiry_date: string;
  status: string | null;
}

const CrewManagement = () => {
  const { toast } = useToast();
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddCrewDialog, setShowAddCrewDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CrewMember | null>(null);
  const [showMemberDetailsDialog, setShowMemberDetailsDialog] = useState(false);
  
  const [newCrewMember, setNewCrewMember] = useState({
    full_name: "",
    position: "deckhand",
    email: "",
    phone: "",
    nationality: "BR",
    employee_id: ""
  });

  const loadCrewData = async () => {
    try {
      setLoading(true);

      const { data: crewData, error: crewError } = await supabase
        .from("crew_members")
        .select("id, full_name, position, status, vessel_id, email, phone, join_date, employee_id, nationality")
        .order("full_name")
        .limit(100);

      if (crewError) {
        logger.error("Error loading crew members", { error: crewError });
      } else {
        setCrewMembers((crewData as unknown as CrewMember[]) || []);
      }

      const { data: certData, error: certError } = await supabase
        .from("employee_certificates")
        .select("id, employee_id, certificate_name, issue_date, expiry_date, status")
        .order("expiry_date", { ascending: true })
        .limit(200);

      if (certError) {
        logger.error("Error loading certificates", { error: certError });
      } else {
        setCertificates((certData as unknown as Certificate[]) || []);
      }

    } catch (error) {
      logger.error("Error loading crew data", { error });
      toast({
        title: "Erro",
        description: "Falha ao carregar dados da tripulação",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCrewData();
  }, []);

  const handleAddCrewMember = async () => {
    if (!newCrewMember.full_name.trim()) {
      toast({
        title: "Erro",
        description: "Nome completo é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      const employeeId = newCrewMember.employee_id || `EMP-${Date.now()}`;
      
      const { error } = await supabase
        .from("crew_members")
        .insert([{
          full_name: newCrewMember.full_name,
          position: newCrewMember.position,
          email: newCrewMember.email || null,
          phone: newCrewMember.phone || null,
          nationality: newCrewMember.nationality,
          employee_id: employeeId,
          status: "active",
          join_date: new Date().toISOString().split("T")[0]
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Tripulante adicionado com sucesso!"
      });

      setShowAddCrewDialog(false);
      setNewCrewMember({ full_name: "", position: "deckhand", email: "", phone: "", nationality: "BR", employee_id: "" });
      loadCrewData();
    } catch (error) {
      logger.error("Error adding crew member", { error });
      toast({
        title: "Erro",
        description: "Falha ao adicionar tripulante",
        variant: "destructive"
      });
    }
  };

  const handleViewMember = (member: CrewMember) => {
    setSelectedMember(member);
    setShowMemberDetailsDialog(true);
  };

  const getExpiringCertificates = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return certificates.filter(cert => {
      const expiryDate = new Date(cert.expiry_date);
      return expiryDate <= thirtyDaysFromNow && expiryDate >= today;
    });
  };

  const getExpiredCertificates = () => {
    const today = new Date();
    return certificates.filter(cert => new Date(cert.expiry_date) < today);
  };

  const filteredCrew = crewMembers.filter(member =>
    member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCrew = crewMembers.filter(m => m.status === "active").length;
  const expiringCerts = getExpiringCertificates().length;
  const expiredCerts = getExpiredCertificates().length;

  const getPositionLabel = (position: string) => {
    const labels: Record<string, string> = {
      captain: "Capitão",
      chief_officer: "Imediato",
      second_officer: "Segundo Oficial",
      third_officer: "Terceiro Oficial",
      chief_engineer: "Chefe de Máquinas",
      second_engineer: "Segundo Engenheiro",
      deckhand: "Marinheiro",
      cook: "Cozinheiro",
      steward: "Comissário"
    };
    return labels[position] || position;
  };

  const getStatusBadgeVariant = (status: string | null) => {
    switch (status) {
      case "active": return "default";
      case "on_leave": return "secondary";
      case "inactive": return "outline";
      default: return "outline";
    }
  };

  const getStatusLabel = (status: string | null) => {
    const labels: Record<string, string> = {
      active: "Ativo",
      on_leave: "Licença",
      inactive: "Inativo"
    };
    return labels[status || ""] || status || "Indefinido";
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Carregando dados da tripulação...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Gestão de Tripulação</h1>
            <p className="text-muted-foreground">Gerenciamento completo de tripulantes e certificações</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadCrewData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Dialog open={showAddCrewDialog} onOpenChange={setShowAddCrewDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar Tripulante
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Tripulante</DialogTitle>
                <DialogDescription>
                  Adicione um novo membro à tripulação
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome Completo *</Label>
                  <Input
                    value={newCrewMember.full_name}
                    onChange={(e) => setNewCrewMember(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Ex: João Silva"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cargo</Label>
                  <Select
                    value={newCrewMember.position}
                    onValueChange={(value) => setNewCrewMember(prev => ({ ...prev, position: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="captain">Capitão</SelectItem>
                      <SelectItem value="chief_officer">Imediato</SelectItem>
                      <SelectItem value="second_officer">Segundo Oficial</SelectItem>
                      <SelectItem value="third_officer">Terceiro Oficial</SelectItem>
                      <SelectItem value="chief_engineer">Chefe de Máquinas</SelectItem>
                      <SelectItem value="second_engineer">Segundo Engenheiro</SelectItem>
                      <SelectItem value="deckhand">Marinheiro</SelectItem>
                      <SelectItem value="cook">Cozinheiro</SelectItem>
                      <SelectItem value="steward">Comissário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newCrewMember.email}
                    onChange={(e) => setNewCrewMember(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={newCrewMember.phone}
                    onChange={(e) => setNewCrewMember(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+55 11 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nacionalidade</Label>
                  <Select
                    value={newCrewMember.nationality}
                    onValueChange={(value) => setNewCrewMember(prev => ({ ...prev, nationality: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BR">Brasil</SelectItem>
                      <SelectItem value="US">Estados Unidos</SelectItem>
                      <SelectItem value="PT">Portugal</SelectItem>
                      <SelectItem value="ES">Espanha</SelectItem>
                      <SelectItem value="OTHER">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddCrewDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddCrewMember}>
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
            <CardTitle className="text-sm font-medium">Total Tripulantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{crewMembers.length}</div>
            <p className="text-xs text-muted-foreground">{activeCrew} ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Certificações</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificates.length}</div>
            <p className="text-xs text-muted-foreground">Total registradas</p>
          </CardContent>
        </Card>

        <Card className={expiringCerts > 0 ? "border-yellow-500" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vencendo (30 dias)</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${expiringCerts > 0 ? "text-yellow-600" : ""}`}>
              {expiringCerts}
            </div>
            <p className="text-xs text-muted-foreground">Certificados a vencer</p>
          </CardContent>
        </Card>

        <Card className={expiredCerts > 0 ? "border-red-500 bg-red-50 dark:bg-red-950/20" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${expiredCerts > 0 ? "text-red-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${expiredCerts > 0 ? "text-red-600" : ""}`}>
              {expiredCerts}
            </div>
            <p className="text-xs text-muted-foreground">Requer atenção</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="crew" className="space-y-4">
        <TabsList>
          <TabsTrigger value="crew">Tripulantes</TabsTrigger>
          <TabsTrigger value="certificates">Certificações</TabsTrigger>
          <TabsTrigger value="schedule">Escalas</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="crew" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lista de Tripulantes</CardTitle>
                  <CardDescription>Gerencie todos os membros da tripulação</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar tripulante..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredCrew.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum tripulante encontrado</p>
                  <Button className="mt-4" onClick={() => setShowAddCrewDialog(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Adicionar Tripulante
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredCrew.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{member.full_name}</p>
                          <p className="text-sm text-muted-foreground">{getPositionLabel(member.position)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(member.status)}>
                          {getStatusLabel(member.status)}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => handleViewMember(member)}>
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

        <TabsContent value="certificates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Certificações da Tripulação</CardTitle>
              <CardDescription>Acompanhe vencimentos e renovações</CardDescription>
            </CardHeader>
            <CardContent>
              {certificates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma certificação registrada</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {certificates.slice(0, 10).map((cert) => {
                    const expiryDate = new Date(cert.expiry_date);
                    const today = new Date();
                    const isExpired = expiryDate < today;
                    const isExpiring = expiryDate <= new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                    
                    return (
                      <div key={cert.id} className={`flex items-center justify-between p-4 border rounded-lg ${isExpired ? "bg-red-50 dark:bg-red-950/20 border-red-300" : isExpiring ? "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-300" : ""}`}>
                        <div className="flex items-center gap-4">
                          <Award className={`h-5 w-5 ${isExpired ? "text-red-500" : isExpiring ? "text-yellow-500" : "text-primary"}`} />
                          <div>
                            <p className="font-semibold">{cert.certificate_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Vence em: {new Date(cert.expiry_date).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                        <Badge variant={isExpired ? "destructive" : isExpiring ? "secondary" : "default"}>
                          {isExpired ? "Vencido" : isExpiring ? "Vencendo" : "Válido"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Escalas de Trabalho</CardTitle>
              <CardDescription>Gestão de turnos e folgas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Módulo de escalas em desenvolvimento</p>
                <p className="text-sm mt-2">Em breve você poderá gerenciar turnos e folgas aqui</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentos da Tripulação</CardTitle>
              <CardDescription>Passaportes, vistos e documentos pessoais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Módulo de documentos em desenvolvimento</p>
                <p className="text-sm mt-2">Em breve você poderá gerenciar documentos aqui</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Member Details Dialog */}
      <Dialog open={showMemberDetailsDialog} onOpenChange={setShowMemberDetailsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Tripulante</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedMember.full_name}</h3>
                  <p className="text-muted-foreground">{getPositionLabel(selectedMember.position)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p className="font-medium">{getStatusLabel(selectedMember.status)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedMember.email || "Não informado"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Telefone</Label>
                  <p className="font-medium">{selectedMember.phone || "Não informado"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data de Admissão</Label>
                  <p className="font-medium">
                    {selectedMember.join_date 
                      ? new Date(selectedMember.join_date).toLocaleDateString("pt-BR")
                      : "Não informado"}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Certificações</h4>
                {certificates.filter(c => c.employee_id === selectedMember.employee_id).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma certificação registrada</p>
                ) : (
                  <div className="space-y-2">
                    {certificates.filter(c => c.employee_id === selectedMember.employee_id).map(cert => (
                      <div key={cert.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{cert.certificate_name}</span>
                        <Badge variant="outline" className="text-xs">
                          {new Date(cert.expiry_date).toLocaleDateString("pt-BR")}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CrewManagement;
