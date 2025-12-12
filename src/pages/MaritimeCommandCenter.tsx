import { useCallback, useEffect, useState } from "react";;
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Ship, 
  Users, 
  Shield, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  Search,
  Download,
  Plus,
  Award,
  Clock,
  Target,
  Activity,
  Sparkles,
  Brain,
  RefreshCw,
  BarChart3,
  Anchor,
  ClipboardList,
  UserPlus,
  XCircle,
  Bell,
  Gauge,
  Thermometer,
  Zap,
  Heart,
  TrendingUp
} from "lucide-react";

// Import components
import { CrewIntelligenceAI } from "@/components/crew/CrewIntelligenceAI";
import { CrewCertificationsManager } from "@/components/crew/crew-certifications-manager";
import { MaritimeCertificationManager } from "@/components/maritime/maritime-certification-manager";
import { MaritimeChecklistSystem } from "@/components/maritime-checklists/maritime-checklist-system";
import { MaritimeSystemDashboard } from "@/components/maritime/maritime-system-dashboard";
import CrewAIAnalysis from "@/modules/crew-management/components/CrewAIAnalysis";
import { CrewAIInsights } from "@/components/crew/crew-ai-insights";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import ModuleActionButton from "@/components/ui/module-action-button";
import { useMaritimeActions } from "@/hooks/useMaritimeActions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

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

interface MaritimeStats {
  totalChecklists: number;
  completedChecklists: number;
  pendingChecklists: number;
  activeVessels: number;
  averageCompliance: number;
  criticalIssues: number;
  totalCrew: number;
  activeCrew: number;
  certExpiring: number;
  certValid: number;
}

export default function MaritimeCommandCenter() {
  const [activeTab, setActiveTab] = useState("overview");
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [vessels, setVessels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [stats, setStats] = useState<MaritimeStats>({
    totalChecklists: 0,
    completedChecklists: 0,
    pendingChecklists: 0,
    activeVessels: 0,
    averageCompliance: 0,
    criticalIssues: 0,
    totalCrew: 0,
    activeCrew: 0,
    certExpiring: 0,
    certValid: 0
  });
  
  const { handleCreate, handleExport, handleRefresh, showInfo } = useMaritimeActions();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load vessels
      const { data: vesselsData } = await supabase
        .from("vessels")
        .select("id, name, status")
        .limit(50);

      if (vesselsData) {
        setVessels(vesselsData);
      }

      // Load checklists
      const { data: checklists } = await supabase
        .from("operational_checklists")
        .select("status, compliance_score");

      // Demo crew data
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
          experience_years: 15
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
          experience_years: 12
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
          experience_years: 8
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
          experience_years: 5
        },
        {
          id: "5",
          full_name: "Ana Rodrigues",
          position: "Enfermeira de Bordo",
          nationality: "Brasileira",
          passport_number: "BR321654987",
          phone: "+55 11 44444-4444",
          email: "ana.rodrigues@nautilus.com",
          employee_id: "EMP005",
          status: "active",
          vessel_id: vesselsData?.[0]?.id,
          contract_start: "2024-02-01",
          contract_end: "2024-12-31",
          experience_years: 6
        }
      ];
      setCrewMembers(demoCrewMembers);

      // Calculate stats
      const total = checklists?.length || 12;
      const completed = checklists?.filter(c => c.status === "completed").length || 8;
      const pending = checklists?.filter(c => c.status === "in_progress" || c.status === "draft").length || 4;
      const avgCompliance = checklists?.length ? 
        checklists.reduce((sum, c) => sum + (c.compliance_score || 85), 0) / checklists.length : 87;

      setStats({
        totalChecklists: total,
        completedChecklists: completed,
        pendingChecklists: pending,
        activeVessels: vesselsData?.length || 5,
        averageCompliance: Math.round(avgCompliance),
        criticalIssues: 2,
        totalCrew: demoCrewMembers.length,
        activeCrew: demoCrewMembers.filter(m => m.status === "active").length,
        certExpiring: 3,
        certValid: 12
      });
      
    } catch (error) {
      toast.error("Erro ao carregar dados marítimos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getVesselName = (vesselId: string) => {
    const vessel = vessels.find(v => v.id === vesselId);
    return vessel ? vessel.name : "Não atribuído";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "active": return "bg-green-500";
    case "shore_leave": return "bg-yellow-500";
    case "medical_leave": return "bg-orange-500";
    case "inactive": return "bg-gray-500";
    default: return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
    case "active": return "Ativo";
    case "shore_leave": return "Licença Terra";
    case "medical_leave": return "Licença Médica";
    case "inactive": return "Inativo";
    default: return status;
    }
  };

  const filteredCrewMembers = crewMembers.filter(member => {
    const matchesSearch = member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Ship}
        title="Maritime Command Center"
        description="Centro Unificado de Operações Marítimas - Tripulação, Certificações e Checklists"
        gradient="blue"
        badges={[
          { icon: Users, label: `${stats.totalCrew} Tripulantes` },
          { icon: Shield, label: `${stats.certValid} Certificações` },
          { icon: ClipboardList, label: `${stats.totalChecklists} Checklists` },
          { icon: Ship, label: `${stats.activeVessels} Embarcações` }
        ]}
      />

      {/* KPIs Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{stats.totalCrew}</div>
            <div className="text-xs text-muted-foreground">Tripulantes</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{stats.activeCrew}</div>
            <div className="text-xs text-muted-foreground">Ativos</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-purple-500/20">
          <CardContent className="p-4 text-center">
            <Award className="h-6 w-6 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{stats.certValid}</div>
            <div className="text-xs text-muted-foreground">Cert. Válidas</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/20">
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">{stats.certExpiring}</div>
            <div className="text-xs text-muted-foreground">Cert. Vencendo</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border-cyan-500/20">
          <CardContent className="p-4 text-center">
            <ClipboardList className="h-6 w-6 mx-auto mb-2 text-cyan-500" />
            <div className="text-2xl font-bold">{stats.totalChecklists}</div>
            <div className="text-xs text-muted-foreground">Checklists</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
          <CardContent className="p-4 text-center">
            <FileText className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
            <div className="text-2xl font-bold">{stats.completedChecklists}</div>
            <div className="text-xs text-muted-foreground">Concluídos</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border-indigo-500/20">
          <CardContent className="p-4 text-center">
            <Target className="h-6 w-6 mx-auto mb-2 text-indigo-500" />
            <div className="text-2xl font-bold">{stats.averageCompliance}%</div>
            <div className="text-xs text-muted-foreground">Conformidade</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-rose-500/10 border-red-500/20">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-red-500" />
            <div className="text-2xl font-bold">{stats.criticalIssues}</div>
            <div className="text-xs text-muted-foreground">Issues Críticos</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap gap-1 bg-background/50 backdrop-blur-sm p-1 h-auto">
          <TabsTrigger value="overview" className="flex items-center gap-1.5 text-xs">
            <BarChart3 className="h-3.5 w-3.5" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="crew-list" className="flex items-center gap-1.5 text-xs">
            <Users className="h-3.5 w-3.5" />
            Tripulação
          </TabsTrigger>
          <TabsTrigger value="crew-intelligence" className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
            <Brain className="h-3.5 w-3.5" />
            Crew Intelligence
            <Sparkles className="h-3 w-3 text-blue-500" />
          </TabsTrigger>
          <TabsTrigger value="crew-insights" className="flex items-center gap-1.5 text-xs">
            <TrendingUp className="h-3.5 w-3.5" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="certifications" className="flex items-center gap-1.5 text-xs">
            <Award className="h-3.5 w-3.5" />
            Certificações
          </TabsTrigger>
          <TabsTrigger value="maritime-certs" className="flex items-center gap-1.5 text-xs">
            <Shield className="h-3.5 w-3.5" />
            Cert. Marítimas
          </TabsTrigger>
          <TabsTrigger value="checklists" className="flex items-center gap-1.5 text-xs">
            <ClipboardList className="h-3.5 w-3.5" />
            Checklists
          </TabsTrigger>
          <TabsTrigger value="iot-sensors" className="flex items-center gap-1.5 text-xs">
            <Activity className="h-3.5 w-3.5" />
            IoT & Sensores
          </TabsTrigger>
          <TabsTrigger value="ai-analysis" className="flex items-center gap-1.5 text-xs">
            <Brain className="h-3.5 w-3.5" />
            Análise IA
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Crew Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Resumo da Tripulação
                </CardTitle>
                <CardDescription>Status atual dos tripulantes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="text-2xl font-bold text-green-600">
                      {crewMembers.filter(m => m.status === "active").length}
                    </div>
                    <div className="text-sm text-muted-foreground">Ativos a Bordo</div>
                  </div>
                  <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <div className="text-2xl font-bold text-yellow-600">
                      {crewMembers.filter(m => m.status === "shore_leave").length}
                    </div>
                    <div className="text-sm text-muted-foreground">Em Licença</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Capacidade da Tripulação</span>
                    <span className="font-medium">{Math.round((stats.activeCrew / stats.totalCrew) * 100)}%</span>
                  </div>
                  <Progress value={(stats.activeCrew / stats.totalCrew) * 100} className="h-2" />
                </div>
                <Button className="w-full" variant="outline" onClick={() => setActiveTab("crew-list")}>
                  <Users className="h-4 w-4 mr-2" />
                  Ver Tripulação Completa
                </Button>
              </CardContent>
            </Card>

            {/* Certifications Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-500" />
                  Status de Certificações
                </CardTitle>
                <CardDescription>Controle de certificações e validades</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20 text-center">
                    <CheckCircle className="h-5 w-5 mx-auto mb-1 text-green-500" />
                    <div className="text-xl font-bold">{stats.certValid}</div>
                    <div className="text-xs text-muted-foreground">Válidas</div>
                  </div>
                  <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20 text-center">
                    <Clock className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                    <div className="text-xl font-bold">{stats.certExpiring}</div>
                    <div className="text-xs text-muted-foreground">Vencendo</div>
                  </div>
                  <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20 text-center">
                    <XCircle className="h-5 w-5 mx-auto mb-1 text-red-500" />
                    <div className="text-xl font-bold">1</div>
                    <div className="text-xs text-muted-foreground">Vencidas</div>
                  </div>
                </div>
                <Button className="w-full" variant="outline" onClick={() => setActiveTab("certifications")}>
                  <Award className="h-4 w-4 mr-2" />
                  Gerenciar Certificações
                </Button>
              </CardContent>
            </Card>

            {/* Checklists Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-cyan-500" />
                  Checklists Operacionais
                </CardTitle>
                <CardDescription>Inspeções e verificações marítimas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <div className="text-2xl font-bold text-emerald-600">{stats.completedChecklists}</div>
                    <div className="text-sm text-muted-foreground">Concluídos</div>
                  </div>
                  <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <div className="text-2xl font-bold text-orange-600">{stats.pendingChecklists}</div>
                    <div className="text-sm text-muted-foreground">Pendentes</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Taxa de Conclusão</span>
                    <span className="font-medium">
                      {Math.round((stats.completedChecklists / stats.totalChecklists) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(stats.completedChecklists / stats.totalChecklists) * 100} 
                    className="h-2" 
                  />
                </div>
                <Button className="w-full" variant="outline" onClick={() => setActiveTab("checklists")}>
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Ver Checklists
                </Button>
              </CardContent>
            </Card>

            {/* Compliance & Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-red-500" />
                  Alertas Críticos
                </CardTitle>
                <CardDescription>Itens que requerem atenção imediata</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.certExpiring > 0 && (
                  <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30 flex items-center gap-3">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{stats.certExpiring} Certificações Vencendo</p>
                      <p className="text-xs text-muted-foreground">Próximos 30 dias</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setActiveTab("certifications")}>
                      Ver
                    </Button>
                  </div>
                )}
                {stats.criticalIssues > 0 && (
                  <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30 flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{stats.criticalIssues} Issues Críticos</p>
                      <p className="text-xs text-muted-foreground">Ação imediata necessária</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Resolver
                    </Button>
                  </div>
                )}
                {stats.pendingChecklists > 0 && (
                  <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/30 flex items-center gap-3">
                    <FileText className="h-5 w-5 text-orange-500" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{stats.pendingChecklists} Checklists Pendentes</p>
                      <p className="text-xs text-muted-foreground">Aguardando conclusão</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setActiveTab("checklists")}>
                      Ver
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Crew List Tab */}
        <TabsContent value="crew-list" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Lista de Tripulação
                  </CardTitle>
                  <CardDescription>
                    Gerencie informações da tripulação e atribuições
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleExport("Tripulação")}>
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
                        <Button onClick={() => {
                          handleCreate("Tripulante");
                          setIsAddDialogOpen(false);
                        }}>
                          Adicionar Tripulante
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome, posição ou ID..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
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
              </div>

              {/* Crew List */}
              <div className="space-y-3">
                {filteredCrewMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
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
                      <Badge variant="secondary">
                        {getStatusLabel(member.status)}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
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
                    Tente ajustar os filtros de busca
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Crew Intelligence Tab */}
        <TabsContent value="crew-intelligence" className="space-y-6">
          <CrewIntelligenceAI />
        </TabsContent>

        {/* Crew AI Insights Tab */}
        <TabsContent value="crew-insights" className="space-y-6">
          <CrewAIInsights crew={crewMembers} />
        </TabsContent>

        {/* Certifications Tab (Crew) */}
        <TabsContent value="certifications" className="space-y-6">
          <CrewCertificationsManager crewMembers={crewMembers} />
        </TabsContent>

        {/* Maritime Certifications Tab */}
        <TabsContent value="maritime-certs" className="space-y-6">
          <MaritimeCertificationManager />
        </TabsContent>

        {/* Checklists Tab */}
        <TabsContent value="checklists" className="space-y-6">
          <MaritimeChecklistSystem
            userId="demo-user-id"
            userRole="inspector"
            vesselId={undefined}
          />
        </TabsContent>

        {/* IoT Sensors Tab */}
        <TabsContent value="iot-sensors" className="space-y-6">
          <MaritimeSystemDashboard />
        </TabsContent>

        {/* AI Analysis Tab */}
        <TabsContent value="ai-analysis" className="space-y-6">
          <CrewAIAnalysis />
        </TabsContent>
      </Tabs>

      {/* Module Action Button */}
      <ModuleActionButton
        moduleId="maritime-command"
        moduleName="Maritime Command"
        actions={[
          {
            id: "crew",
            label: "Tripulação",
            icon: <Users className="h-3 w-3" />,
            action: () => setActiveTab("crew-list")
          },
          {
            id: "certifications",
            label: "Certificações",
            icon: <Award className="h-3 w-3" />,
            action: () => setActiveTab("certifications")
          },
          {
            id: "checklists",
            label: "Checklists",
            icon: <ClipboardList className="h-3 w-3" />,
            action: () => setActiveTab("checklists")
          },
          {
            id: "intelligence",
            label: "Crew Intelligence",
            icon: <Brain className="h-3 w-3" />,
            action: () => setActiveTab("crew-intelligence")
          },
          {
            id: "sensors",
            label: "IoT & Sensores",
            icon: <Activity className="h-3 w-3" />,
            action: () => setActiveTab("iot-sensors")
          },
          {
            id: "ai-analysis",
            label: "Análise IA",
            icon: <Sparkles className="h-3 w-3" />,
            action: () => setActiveTab("ai-analysis")
          }
        ]}
        quickActions={[
          {
            id: "new-crew",
            label: "Novo Tripulante",
            icon: <UserPlus className="h-3 w-3" />,
            action: () => setIsAddDialogOpen(true)
          },
          {
            id: "refresh",
            label: "Atualizar",
            icon: <RefreshCw className="h-3 w-3" />,
            action: () => handleRefresh("Maritime Command", loadData),
            shortcut: "F5"
          },
          {
            id: "export",
            label: "Exportar",
            icon: <Download className="h-3 w-3" />,
            action: () => handleExport("Maritime Command")
          }
        ]}
      />
    </ModulePageWrapper>
  );
}
