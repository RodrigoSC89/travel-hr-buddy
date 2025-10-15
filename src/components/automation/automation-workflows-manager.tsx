import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Settings, 
  Play, 
  Pause, 
  Trash2, 
  Plus, 
  Clock, 
  Zap, 
  Mail,
  CheckCircle,
  Calendar,
  Activity,
  AlertTriangle,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ScheduleTriggerConfig {
  cron: string;
  timezone: string;
}

interface EventTriggerConfig {
  event_type: string;
  conditions?: Record<string, unknown>;
}

interface ConditionTriggerConfig {
  conditions: Record<string, unknown>;
}

type TriggerConfig = ScheduleTriggerConfig | EventTriggerConfig | ConditionTriggerConfig;

interface WorkflowAction {
  type: string;
  config: Record<string, unknown>;
}

interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  trigger_type: "schedule" | "event" | "condition";
  trigger_config: TriggerConfig;
  actions: WorkflowAction[];
  is_active: boolean;
  last_executed_at?: string;
  execution_count: number;
  created_at: string;
}

interface AutomationExecution {
  id: string;
  status: "pending" | "running" | "completed" | "failed";
  triggered_by: string;
  started_at: string;
  completed_at?: string;
  error_message?: string;
  duration_ms?: number;
}

const actionTemplates = {
  check_certificates: {
    name: "Verificar Certificados",
    description: "Verifica certificados que estão vencendo",
    icon: CheckCircle,
    config: { days_ahead: 30 }
  },
  send_notification: {
    name: "Enviar Notificação",
    description: "Envia notificação para usuários",
    icon: AlertTriangle,
    config: { template: "default", users: [] }
  },
  email_notification: {
    name: "Email Automático",
    description: "Envia email para destinatários",
    icon: Mail,
    config: { recipients: [], template: "default" }
  },
  generate_report: {
    name: "Gerar Relatório",
    description: "Gera relatório automático",
    icon: Activity,
    config: { report_type: "summary", format: "pdf" }
  }
};

export const AutomationWorkflowsManager: React.FC = () => {
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
  const [executions, setExecutions] = useState<AutomationExecution[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<AutomationWorkflow | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isExecutionsDialogOpen, setIsExecutionsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Form state para criação/edição
  type WorkflowFormData = {
    name: string;
    description: string;
    trigger_type: "schedule" | "event" | "condition";
    trigger_config: TriggerConfig;
    actions: WorkflowAction[];
  };
  const [formData, setFormData] = useState<WorkflowFormData>({
    name: "",
    description: "",
    trigger_type: "schedule",
    trigger_config: { cron: "0 9 * * *", timezone: "America/Sao_Paulo" } as ScheduleTriggerConfig,
    actions: []
  });

  const loadWorkflows = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("automation_workflows")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWorkflows((data as any) || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as automações.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  const loadExecutions = async (workflowId: string) => {
    try {
      const { data, error } = await supabase
        .from("automation_executions")
        .select("*")
        .eq("workflow_id", workflowId)
        .order("started_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setExecutions(data as AutomationExecution[] || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico de execuções.",
        variant: "destructive"
      });
    }
  };

  const toggleWorkflow = async (workflow: AutomationWorkflow) => {
    try {
      const { error } = await supabase
        .from("automation_workflows")
        .update({ is_active: !workflow.is_active })
        .eq("id", workflow.id);

      if (error) throw error;

      setWorkflows(prev => 
        prev.map(w => 
          w.id === workflow.id 
            ? { ...w, is_active: !w.is_active }
            : w
        )
      );

      toast({
        title: workflow.is_active ? "Automação pausada" : "Automação ativada",
        description: `${workflow.name} foi ${workflow.is_active ? "pausada" : "ativada"}.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a automação.",
        variant: "destructive"
      });
    }
  };

  const deleteWorkflow = async (workflow: AutomationWorkflow) => {
    if (!confirm(`Tem certeza que deseja excluir "${workflow.name}"?`)) return;

    try {
      const { error } = await supabase
        .from("automation_workflows")
        .delete()
        .eq("id", workflow.id);

      if (error) throw error;

      setWorkflows(prev => prev.filter(w => w.id !== workflow.id));
      toast({
        title: "Automação excluída",
        description: `${workflow.name} foi removida.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a automação.",
        variant: "destructive"
      });
    }
  };

  const createWorkflow = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { error} = await supabase
        .from("automation_workflows")
        .insert({
          ...formData,
          created_by: user.user?.id,
          organization_id: user.user?.id // Temporário para demo
        } as any);

      if (error) throw error;

      setIsCreateDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        trigger_type: "schedule",
        trigger_config: { cron: "0 9 * * *", timezone: "America/Sao_Paulo" },
        actions: []
      });
      
      await loadWorkflows();
      toast({
        title: "Automação criada!",
        description: "Nova automação foi configurada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a automação.",
        variant: "destructive"
      });
    }
  };

  const addAction = (actionType: string) => {
    const template = actionTemplates[actionType as keyof typeof actionTemplates];
    setFormData(prev => ({
      ...prev,
      actions: [...prev.actions, { type: actionType, config: template.config }]
    }));
  };

  const removeAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  const getTriggerDescription = (workflow: AutomationWorkflow) => {
    const { trigger_type, trigger_config } = workflow;
    
    switch (trigger_type) {
    case "schedule":
      return `Agendado: ${(trigger_config as ScheduleTriggerConfig).cron}`;
    case "event":
      return `Evento: ${(trigger_config as EventTriggerConfig).event_type}`;
    case "condition":
      return `Condição: ${JSON.stringify((trigger_config as ConditionTriggerConfig).conditions)}`;
    default:
      return "Não configurado";
    }
  };

  const getStatusBadge = (workflow: AutomationWorkflow) => {
    if (!workflow.is_active) {
      return <Badge variant="secondary">Pausado</Badge>;
    }
    return <Badge variant="default">Ativo</Badge>;
  };

  const getExecutionStatusBadge = (status: string) => {
    switch (status) {
    case "completed":
      return <Badge variant="default" className="bg-green-100 text-green-800">Sucesso</Badge>;
    case "failed":
      return <Badge variant="destructive">Falha</Badge>;
    case "running":
      return <Badge variant="default" className="bg-blue-100 text-blue-800">Executando</Badge>;
    case "pending":
      return <Badge variant="outline">Pendente</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Automações</h2>
          <p className="text-muted-foreground">
            Gerencie workflows automáticos e triggers inteligentes
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Automação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Automação</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Automação</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Alerta de Certificados"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="trigger">Tipo de Trigger</Label>
                  <Select 
                    value={formData.trigger_type} 
                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, trigger_type: value as "schedule" | "event" | "condition" }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="schedule">Agendamento (Cron)</SelectItem>
                      <SelectItem value="event">Evento do Sistema</SelectItem>
                      <SelectItem value="condition">Condição Específica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o que esta automação faz..."
                />
              </div>
              
              {formData.trigger_type === "schedule" && (
                <div className="space-y-2">
                  <Label htmlFor="cron">Expressão Cron</Label>
                  <Input
                    id="cron"
                    value={(formData.trigger_config as ScheduleTriggerConfig).cron}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      trigger_config: { ...(prev.trigger_config as ScheduleTriggerConfig), cron: e.target.value }
                    }))}
                    placeholder="Ex: 0 9 * * * (todo dia às 9h)"
                  />
                </div>
              )}
              
              <div className="space-y-4">
                <Label>Ações da Automação</Label>
                
                {formData.actions.map((action, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">
                          {actionTemplates[action.type as keyof typeof actionTemplates]?.name || action.type}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {actionTemplates[action.type as keyof typeof actionTemplates]?.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAction(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
                
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(actionTemplates).map(([key, template]) => (
                    <Button
                      key={key}
                      variant="outline"
                      size="sm"
                      onClick={() => addAction(key)}
                    >
                      <template.icon className="w-4 h-4 mr-2" />
                      {template.name}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={createWorkflow}
                  disabled={!formData.name || !formData.description || formData.actions.length === 0}
                >
                  Criar Automação
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Workflows Table */}
      <Card>
        <CardHeader>
          <CardTitle>Automações Configuradas</CardTitle>
        </CardHeader>
        <CardContent>
          {workflows.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma automação configurada</h3>
              <p className="text-muted-foreground">
                Crie sua primeira automação para começar a economizar tempo
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Ações</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última Execução</TableHead>
                  <TableHead>Execuções</TableHead>
                  <TableHead>Controles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workflows.map((workflow) => (
                  <TableRow key={workflow.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{workflow.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {workflow.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {getTriggerDescription(workflow)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {workflow.actions.length} ação(ões)
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(workflow)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {workflow.last_executed_at 
                          ? new Date(workflow.last_executed_at).toLocaleString("pt-BR")
                          : "Nunca"
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedWorkflow(workflow);
                          loadExecutions(workflow.id);
                          setIsExecutionsDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {workflow.execution_count}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleWorkflow(workflow)}
                        >
                          {workflow.is_active ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteWorkflow(workflow)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Executions Dialog */}
      <Dialog open={isExecutionsDialogOpen} onOpenChange={setIsExecutionsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Histórico de Execuções - {selectedWorkflow?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {executions.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Esta automação ainda não foi executada
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Iniciado em</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Resultado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {executions.map((execution) => (
                    <TableRow key={execution.id}>
                      <TableCell>
                        {getExecutionStatusBadge(execution.status)}
                      </TableCell>
                      <TableCell>
                        {new Date(execution.started_at).toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        {execution.duration_ms 
                          ? `${execution.duration_ms}ms`
                          : execution.status === "running" 
                            ? "Executando..."
                            : "-"
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{execution.triggered_by}</Badge>
                      </TableCell>
                      <TableCell>
                        {execution.error_message ? (
                          <div className="text-red-600 text-sm">
                            {execution.error_message}
                          </div>
                        ) : execution.status === "completed" ? (
                          <div className="text-green-600 text-sm">Sucesso</div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};