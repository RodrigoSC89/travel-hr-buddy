import React, { useState } from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  GitBranch, Plus, Clock, CheckCircle, XCircle, AlertTriangle,
  FileText, Users, Shield, Send, RefreshCw, Calendar
} from "lucide-react";

interface GMUDRequest {
  id: string;
  change_type: string;
  description: string;
  justification: string;
  impact_assessment: string;
  implementation_date: string;
  rollback_plan: string;
  status: string;
  current_step: number;
  vessel_name?: string;
  created_at: string;
}

interface SignatureStep {
  step_number: number;
  role: string;
  title: string;
  status: "pending" | "approved" | "rejected" | "waiting";
  deadline: string;
  signed_at?: string;
  comments?: string;
}

const SIGNATURE_WORKFLOW: SignatureStep[] = [
  { step_number: 1, role: "safety_officer", title: "Oficial de Segurança", status: "pending", deadline: "" },
  { step_number: 2, role: "chief_engineer", title: "Chefe de Máquinas", status: "waiting", deadline: "" },
  { step_number: 3, role: "captain", title: "Capitão", status: "waiting", deadline: "" },
  { step_number: 4, role: "shipowner", title: "Armador", status: "waiting", deadline: "" },
];

const GMUD = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isNewGMUDOpen, setIsNewGMUDOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedGMUD, setSelectedGMUD] = useState<GMUDRequest | null>(null);
  
  const [formData, setFormData] = useState({
    change_type: "",
    description: "",
    justification: "",
    impact_assessment: "",
    implementation_date: "",
    rollback_plan: "",
    vessel_name: ""
  });

  // Demo data with state management for real updates
  const [gmudRequests, setGmudRequests] = useState<GMUDRequest[]>([
    {
      id: "GMUD-001",
      change_type: "technical",
      description: "Atualização do sistema de navegação GPS para DGPS",
      justification: "Melhoria na precisão de posicionamento para operações DP",
      impact_assessment: "Média - Requer parada de 4 horas",
      implementation_date: "2025-01-15",
      rollback_plan: "Reverter para configuração anterior do GPS",
      status: "in_progress",
      current_step: 2,
      vessel_name: "MV Atlantic Explorer",
      created_at: "2024-12-28"
    },
    {
      id: "GMUD-002",
      change_type: "procedural",
      description: "Novo procedimento de troca de turno",
      justification: "Reduzir erros de comunicação entre turnos",
      impact_assessment: "Baixa - Mudança processual",
      implementation_date: "2025-01-10",
      rollback_plan: "Retorno ao procedimento anterior",
      status: "approved",
      current_step: 4,
      vessel_name: "OSV Petrobras XXI",
      created_at: "2024-12-20"
    }
  ]);

  const handleApproveGMUD = async (gmudId: string) => {
    setGmudRequests(prev => prev.map(g => 
      g.id === gmudId 
        ? { ...g, status: "approved", current_step: 4 }
        : g
    ));
    toast({
      title: "✅ GMUD Aprovado",
      description: `${gmudId} foi aprovado com sucesso e está pronto para implementação`,
    });
  };

  const handleRejectGMUD = async (gmudId: string) => {
    setGmudRequests(prev => prev.map(g => 
      g.id === gmudId 
        ? { ...g, status: "rejected", current_step: g.current_step }
        : g
    ));
    toast({
      title: "❌ GMUD Rejeitado",
      description: `${gmudId} foi rejeitado. O solicitante será notificado.`,
      variant: "destructive"
    });
  };

  const handleViewDetails = (gmud: GMUDRequest) => {
    setSelectedGMUD(gmud);
    setShowDetailsDialog(true);
  };

  const handleCreateGMUD = async () => {
    setIsLoading(true);
    try {
      // Criar workflow via Edge Function
      const { data, error } = await supabase.functions.invoke("gmud-workflow", {
        body: {
          action: "create_workflow",
          gmud_request: {
            id: `GMUD-${Date.now()}`,
            ...formData
          },
          webhook_url: webhookUrl || undefined
        }
      });

      if (error) throw error;

      toast({
        title: "GMUD Criado",
        description: "Workflow de assinaturas iniciado. Primeiro aprovador notificado."
      });
      
      setIsNewGMUDOpen(false);
      setFormData({
        change_type: "",
        description: "",
        justification: "",
        impact_assessment: "",
        implementation_date: "",
        rollback_plan: "",
        vessel_name: ""
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao criar GMUD",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      draft: { variant: "outline", label: "Rascunho" },
      submitted: { variant: "secondary", label: "Submetido" },
      in_progress: { variant: "default", label: "Em Aprovação" },
      approved: { variant: "default", label: "Aprovado" },
      rejected: { variant: "destructive", label: "Rejeitado" },
      implemented: { variant: "default", label: "Implementado" }
    };
    const { variant, label } = config[status] || { variant: "outline" as const, label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected": return <XCircle className="h-5 w-5 text-red-500" />;
      case "pending": return <Clock className="h-5 w-5 text-yellow-500" />;
      default: return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <ModulePageWrapper gradient="purple">
      <ModuleHeader
        icon={GitBranch}
        title="GMUD - Gestão de Mudanças"
        description="Controle de mudanças com workflow automático de assinaturas"
        gradient="purple"
        badges={[
          { icon: Shield, label: "Workflow Automático" },
          { icon: Users, label: "Multi-Aprovadores" },
          { icon: Send, label: "Notificações" }
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>
          
          <Dialog open={isNewGMUDOpen} onOpenChange={setIsNewGMUDOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Solicitação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nova Solicitação de Mudança (GMUD)</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Mudança</Label>
                    <Select value={formData.change_type} onValueChange={(v) => setFormData({...formData, change_type: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Técnica</SelectItem>
                        <SelectItem value="procedural">Procedural</SelectItem>
                        <SelectItem value="operational">Operacional</SelectItem>
                        <SelectItem value="emergency">Emergencial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Embarcação</Label>
                    <Input 
                      value={formData.vessel_name}
                      onChange={(e) => setFormData({...formData, vessel_name: e.target.value})}
                      placeholder="Nome da embarcação"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descrição da Mudança</Label>
                  <Textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descreva detalhadamente a mudança proposta..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Justificativa</Label>
                  <Textarea 
                    value={formData.justification}
                    onChange={(e) => setFormData({...formData, justification: e.target.value})}
                    placeholder="Por que esta mudança é necessária?"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Avaliação de Impacto</Label>
                  <Textarea 
                    value={formData.impact_assessment}
                    onChange={(e) => setFormData({...formData, impact_assessment: e.target.value})}
                    placeholder="Quais áreas serão afetadas?"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data de Implementação</Label>
                    <Input 
                      type="date"
                      value={formData.implementation_date}
                      onChange={(e) => setFormData({...formData, implementation_date: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Plano de Rollback (Contingência)</Label>
                  <Textarea 
                    value={formData.rollback_plan}
                    onChange={(e) => setFormData({...formData, rollback_plan: e.target.value})}
                    placeholder="O que fazer se a mudança causar problemas?"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Webhook Zapier (Opcional)</Label>
                  <Input 
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://hooks.zapier.com/..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Configure um Zap para receber notificações SMS/WhatsApp/Email
                  </p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Fluxo de Aprovação</h4>
                  <div className="flex items-center gap-2 text-sm">
                    {SIGNATURE_WORKFLOW.map((step, i) => (
                      <React.Fragment key={step.step_number}>
                        <span className="px-2 py-1 bg-background rounded">{step.title}</span>
                        {i < SIGNATURE_WORKFLOW.length - 1 && <span>→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsNewGMUDOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateGMUD} disabled={isLoading}>
                    {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                    Criar GMUD
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de GMUDs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{gmudRequests.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Em Aprovação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {gmudRequests.filter(g => g.status === "in_progress").length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {gmudRequests.filter(g => g.status === "approved").length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>GMUDs Recentes</CardTitle>
              <CardDescription>Últimas solicitações de mudança</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gmudRequests.map((gmud) => (
                  <div key={gmud.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{gmud.id}</h4>
                          {getStatusBadge(gmud.status)}
                          <Badge variant="outline">{gmud.change_type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{gmud.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {gmud.vessel_name} • {new Date(gmud.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(gmud)}>
                        <FileText className="h-4 w-4 mr-1" />
                        Detalhes
                      </Button>
                    </div>
                    
                    {/* Workflow Progress */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progresso de Aprovação</span>
                        <span className="text-sm text-muted-foreground">
                          {gmud.current_step}/{SIGNATURE_WORKFLOW.length}
                        </span>
                      </div>
                      <Progress value={(gmud.current_step / SIGNATURE_WORKFLOW.length) * 100} />
                      <div className="flex justify-between mt-2">
                        {SIGNATURE_WORKFLOW.map((step) => (
                          <div key={step.step_number} className="flex flex-col items-center">
                            {getStepIcon(step.step_number <= gmud.current_step ? "approved" : step.step_number === gmud.current_step + 1 ? "pending" : "waiting")}
                            <span className="text-xs mt-1">{step.title.split(' ')[0]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>GMUDs Pendentes de Aprovação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gmudRequests.filter(g => g.status === "in_progress").map((gmud) => (
                  <div key={gmud.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{gmud.id} - {gmud.description}</h4>
                        <p className="text-sm text-muted-foreground">{gmud.vessel_name}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleRejectGMUD(gmud.id)}>
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejeitar
                        </Button>
                        <Button size="sm" onClick={() => handleApproveGMUD(gmud.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de GMUDs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {gmudRequests.map((gmud) => (
                  <div key={gmud.id} className="flex justify-between items-center p-3 border rounded cursor-pointer hover:bg-accent" onClick={() => handleViewDetails(gmud)}>
                    <div>
                      <span className="font-medium">{gmud.id}</span>
                      <span className="text-muted-foreground ml-2">{gmud.description.substring(0, 50)}...</span>
                    </div>
                    {getStatusBadge(gmud.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedGMUD?.id} - Detalhes</DialogTitle>
          </DialogHeader>
          {selectedGMUD && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Tipo de Mudança</Label>
                  <p className="font-medium capitalize">{selectedGMUD.change_type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Embarcação</Label>
                  <p className="font-medium">{selectedGMUD.vessel_name}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Descrição</Label>
                <p className="font-medium">{selectedGMUD.description}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Justificativa</Label>
                <p className="font-medium">{selectedGMUD.justification}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Avaliação de Impacto</Label>
                <p className="font-medium">{selectedGMUD.impact_assessment}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Plano de Rollback</Label>
                <p className="font-medium">{selectedGMUD.rollback_plan}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Data de Implementação</Label>
                  <p className="font-medium">{new Date(selectedGMUD.implementation_date).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedGMUD.status)}</div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Progresso de Aprovação</h4>
                <Progress value={(selectedGMUD.current_step / SIGNATURE_WORKFLOW.length) * 100} />
                <div className="flex justify-between mt-2">
                  {SIGNATURE_WORKFLOW.map((step) => (
                    <div key={step.step_number} className="flex flex-col items-center">
                      {getStepIcon(step.step_number <= selectedGMUD.current_step ? "approved" : step.step_number === selectedGMUD.current_step + 1 ? "pending" : "waiting")}
                      <span className="text-xs mt-1">{step.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ModulePageWrapper>
  );
};

export default GMUD;
