import React, { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Users, Shield, FileText, CheckCircle, AlertTriangle, Clock, Search, Download,
  Award, Activity, Brain, Sparkles, ClipboardList, UserPlus, XCircle, Bell, TrendingUp, Loader2
} from "lucide-react";
import { CrewIntelligenceAI } from "@/components/crew/CrewIntelligenceAI";
import { CrewCertificationsManager } from "@/components/crew/crew-certifications-manager";
import { MaritimeCertificationManager } from "@/components/maritime/maritime-certification-manager";
import { MaritimeChecklistSystem } from "@/components/maritime-checklists/maritime-checklist-system";
import { MaritimeSystemDashboard } from "@/components/maritime/maritime-system-dashboard";
import CrewAIAnalysis from "@/modules/crew-management/components/CrewAIAnalysis";
import { CrewAIInsights } from "@/components/crew/crew-ai-insights";
import { CrewMember, MaritimeStats, getStatusColor, getStatusLabel } from "./types";

interface MaritimeTabsProps {
  stats: MaritimeStats;
  crewMembers: CrewMember[];
  vessels: { id: string; name: string; status: string | null }[];
  userId: string;
  onTabChange: (tab: string) => void;
  handleCreate: (type: string) => void;
  handleExport: (type: string) => void;
  showInfo: (title: string, desc: string) => void;
}

export function MaritimeTabs({ stats, crewMembers, vessels, userId, onTabChange, handleCreate, handleExport, showInfo }: MaritimeTabsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newCrew, setNewCrew] = useState({ full_name: '', position: '', nationality: '', passport_number: '', phone: '', email: '', vessel_id: '' });

  const getVesselName = (vesselId: string) => {
    const vessel = vessels.find(v => v.id === vesselId);
    return vessel ? vessel.name : "Não atribuído";
  };

  const filteredCrewMembers = crewMembers.filter(member => {
    const matchesSearch = member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      {/* Overview Tab */}
      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Crew Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-info" />
                Resumo da Tripulação
              </CardTitle>
              <CardDescription>Status atual dos tripulantes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                  <div className="text-2xl font-bold text-success">
                    {crewMembers.filter(m => m.status === "active").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Ativos a Bordo</div>
                </div>
                <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                  <div className="text-2xl font-bold text-warning">
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
              <Button className="w-full" variant="outline" onClick={() => onTabChange("crew-list")}>
                <Users className="h-4 w-4 mr-2" />
                Ver Tripulação Completa
              </Button>
            </CardContent>
          </Card>

          {/* Certifications Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-accent-foreground" />
                Status de Certificações
              </CardTitle>
              <CardDescription>Controle de certificações e validades</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-success/10 rounded-lg border border-success/20 text-center">
                  <CheckCircle className="h-5 w-5 mx-auto mb-1 text-success" />
                  <div className="text-xl font-bold">{stats.certValid}</div>
                  <div className="text-xs text-muted-foreground">Válidas</div>
                </div>
                <div className="p-3 bg-warning/10 rounded-lg border border-warning/20 text-center">
                  <Clock className="h-5 w-5 mx-auto mb-1 text-warning" />
                  <div className="text-xl font-bold">{stats.certExpiring}</div>
                  <div className="text-xs text-muted-foreground">Vencendo</div>
                </div>
                <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20 text-center">
                  <XCircle className="h-5 w-5 mx-auto mb-1 text-destructive" />
                  <div className="text-xl font-bold">1</div>
                  <div className="text-xs text-muted-foreground">Vencidas</div>
                </div>
              </div>
              <Button className="w-full" variant="outline" onClick={() => onTabChange("certifications")}>
                <Award className="h-4 w-4 mr-2" />
                Gerenciar Certificações
              </Button>
            </CardContent>
          </Card>

          {/* Checklists Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-info" />
                Checklists Operacionais
              </CardTitle>
              <CardDescription>Inspeções e verificações marítimas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                  <div className="text-2xl font-bold text-success">{stats.completedChecklists}</div>
                  <div className="text-sm text-muted-foreground">Concluídos</div>
                </div>
                <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                  <div className="text-2xl font-bold text-warning">{stats.pendingChecklists}</div>
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
                <Progress value={(stats.completedChecklists / stats.totalChecklists) * 100} className="h-2" />
              </div>
              <Button className="w-full" variant="outline" onClick={() => onTabChange("checklists")}>
                <ClipboardList className="h-4 w-4 mr-2" />
                Ver Checklists
              </Button>
            </CardContent>
          </Card>

          {/* Compliance & Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-destructive" />
                Alertas Críticos
              </CardTitle>
              <CardDescription>Itens que requerem atenção imediata</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.certExpiring > 0 && (
                <div className="p-3 bg-warning/10 rounded-lg border border-warning/30 flex items-center gap-3">
                  <Clock className="h-5 w-5 text-warning" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{stats.certExpiring} Certificações Vencendo</p>
                    <p className="text-xs text-muted-foreground">Próximos 30 dias</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => onTabChange("certifications")}>Ver</Button>
                </div>
              )}
              {stats.criticalIssues > 0 && (
                <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/30 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{stats.criticalIssues} Issues Críticos</p>
                    <p className="text-xs text-muted-foreground">Ação imediata necessária</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => {
                    onTabChange("crew-intelligence");
                    toast.success("Navegando ao painel de Crew Intelligence para resolução");
                  }}>Resolver</Button>
                </div>
              )}
              {stats.pendingChecklists > 0 && (
                <div className="p-3 bg-warning/10 rounded-lg border border-warning/30 flex items-center gap-3">
                  <FileText className="h-5 w-5 text-warning" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{stats.pendingChecklists} Checklists Pendentes</p>
                    <p className="text-xs text-muted-foreground">Aguardando conclusão</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => onTabChange("checklists")}>Ver</Button>
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
                <CardDescription>Gerencie informações da tripulação e atribuições</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleExport("Tripulação")}>
                  <Download className="h-4 w-4 mr-2" />Exportar
                </Button>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button><UserPlus className="h-4 w-4 mr-2" />Novo Tripulante</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Tripulante</DialogTitle>
                      <DialogDescription>Preencha as informações do novo membro da tripulação</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label htmlFor="name">Nome Completo</Label><Input id="name" placeholder="Nome do tripulante" value={newCrew.full_name} onChange={e => setNewCrew(p => ({ ...p, full_name: e.target.value }))} /></div>
                      <div className="space-y-2">
                        <Label htmlFor="position">Posição</Label>
                        <Select value={newCrew.position} onValueChange={v => setNewCrew(p => ({ ...p, position: v }))}>
                          <SelectTrigger><SelectValue placeholder="Selecione a posição" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Comandante">Comandante</SelectItem>
                            <SelectItem value="Chefe de Máquinas">Chefe de Máquinas</SelectItem>
                            <SelectItem value="Oficial de Convés">Oficial de Convés</SelectItem>
                            <SelectItem value="Engenheiro">Engenheiro</SelectItem>
                            <SelectItem value="Marinheiro">Marinheiro</SelectItem>
                            <SelectItem value="Cozinheiro">Cozinheiro</SelectItem>
                            <SelectItem value="Enfermeiro">Enfermeiro(a)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2"><Label htmlFor="nationality">Nacionalidade</Label><Input id="nationality" placeholder="Nacionalidade" value={newCrew.nationality} onChange={e => setNewCrew(p => ({ ...p, nationality: e.target.value }))} /></div>
                      <div className="space-y-2"><Label htmlFor="passport">Número do Passaporte</Label><Input id="passport" placeholder="Número do passaporte" value={newCrew.passport_number} onChange={e => setNewCrew(p => ({ ...p, passport_number: e.target.value }))} /></div>
                      <div className="space-y-2"><Label htmlFor="phone">Telefone</Label><Input id="phone" placeholder="Telefone de contato" value={newCrew.phone} onChange={e => setNewCrew(p => ({ ...p, phone: e.target.value }))} /></div>
                      <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="Email" value={newCrew.email} onChange={e => setNewCrew(p => ({ ...p, email: e.target.value }))} /></div>
                      <div className="space-y-2 col-span-2">
                        <Label>Embarcação</Label>
                        <Select value={newCrew.vessel_id} onValueChange={v => setNewCrew(p => ({ ...p, vessel_id: v }))}>
                          <SelectTrigger><SelectValue placeholder="Selecione a embarcação" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Não atribuído</SelectItem>
                            {vessels.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
                      <Button disabled={isSaving || !newCrew.full_name || !newCrew.position} onClick={async () => {
                        setIsSaving(true);
                        try {
                          const { error } = await supabase.from('crew_members').insert({
                            full_name: newCrew.full_name,
                            position: newCrew.position,
                            rank: newCrew.position,
                            nationality: newCrew.nationality || undefined,
                            passport_number: newCrew.passport_number || undefined,
                            phone: newCrew.phone || undefined,
                            email: newCrew.email || undefined,
                            vessel_id: newCrew.vessel_id || undefined,
                            status: 'active',
                          } as any);
                          if (error) throw error;
                          toast.success('Tripulante adicionado com sucesso!');
                          setIsAddDialogOpen(false);
                          setNewCrew({ full_name: '', position: '', nationality: '', passport_number: '', phone: '', email: '', vessel_id: '' });
                          // Trigger reload via parent
                          handleCreate("Tripulante");
                        } catch (err: any) {
                          toast.error('Erro ao adicionar tripulante', { description: err.message });
                        } finally {
                          setIsSaving(false);
                        }
                      }}>
                        {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</> : 'Adicionar Tripulante'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar por nome, posição ou ID..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="shore_leave">Licença Terra</SelectItem>
                  <SelectItem value="medical_leave">Licença Médica</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {filteredCrewMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(member.status)}`}></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{member.full_name}</h4>
                        {member.rank && <Badge variant="outline" className="text-xs">{member.rank}</Badge>}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{member.position}</span><span>•</span>
                        <span>ID: {member.employee_id}</span><span>•</span>
                        <span>{member.nationality}</span>
                        {member.vessel_id && (<><span>•</span><span>{getVesselName(member.vessel_id)}</span></>)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{getStatusLabel(member.status)}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => {
                      showInfo(`Documentos do tripulante ${member.full_name}`, `Status: ${getStatusLabel(member.status)} | Cargo: ${member.rank || 'N/A'}`);
                    }}>
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
                <p className="text-muted-foreground">Tente ajustar os filtros de busca</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="crew-intelligence" className="space-y-6"><CrewIntelligenceAI /></TabsContent>
      <TabsContent value="crew-insights" className="space-y-6"><CrewAIInsights crew={crewMembers} /></TabsContent>
      <TabsContent value="certifications" className="space-y-6"><CrewCertificationsManager crewMembers={crewMembers} /></TabsContent>
      <TabsContent value="maritime-certs" className="space-y-6"><MaritimeCertificationManager /></TabsContent>
      <TabsContent value="checklists" className="space-y-6">
        <MaritimeChecklistSystem userId={userId || "default-user"} userRole="inspector" vesselId={undefined} />
      </TabsContent>
      <TabsContent value="iot-sensors" className="space-y-6"><MaritimeSystemDashboard /></TabsContent>
      <TabsContent value="ai-analysis" className="space-y-6"><CrewAIAnalysis /></TabsContent>
    </>
  );
}
