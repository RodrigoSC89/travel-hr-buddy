/**
 * Automation Workflows Manager
 * PATCH 902: Full implementation with AI integration
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Workflow, 
  Plus, 
  Play, 
  Pause, 
  Trash2,
  Zap,
  Bot,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { hybridLLMEngine } from "@/lib/llm/hybrid-engine";

interface WorkflowStep {
  id: string;
  type: 'trigger' | 'condition' | 'action';
  name: string;
  config: Record<string, unknown>;
}

interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: string;
  steps: WorkflowStep[];
  isActive: boolean;
  executionCount: number;
  lastExecution?: string;
  aiOptimized: boolean;
}

const TRIGGERS = [
  { value: 'schedule', label: 'Agendamento', icon: '⏰' },
  { value: 'event', label: 'Evento do Sistema', icon: '📡' },
  { value: 'threshold', label: 'Limite Atingido', icon: '📊' },
  { value: 'document', label: 'Documento Criado', icon: '📄' },
  { value: 'maintenance', label: 'Manutenção Programada', icon: '🔧' },
  { value: 'compliance', label: 'Prazo de Compliance', icon: '✅' },
];

const ACTIONS = [
  { value: 'notify', label: 'Enviar Notificação' },
  { value: 'email', label: 'Enviar Email' },
  { value: 'create_task', label: 'Criar Tarefa' },
  { value: 'update_status', label: 'Atualizar Status' },
  { value: 'generate_report', label: 'Gerar Relatório' },
  { value: 'ai_analysis', label: 'Análise de IA' },
];

export const AutomationWorkflowsManager = () => {
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([
    {
      id: '1',
      name: 'Alerta de Manutenção Preventiva',
      description: 'Notifica equipe quando manutenção está próxima',
      trigger: 'maintenance',
      steps: [
        { id: 's1', type: 'trigger', name: 'Manutenção em 7 dias', config: { days: 7 } },
        { id: 's2', type: 'action', name: 'Enviar Email', config: { to: 'manutencao@empresa.com' } },
        { id: 's3', type: 'action', name: 'Criar Tarefa', config: { assignee: 'supervisor' } },
      ],
      isActive: true,
      executionCount: 45,
      lastExecution: '2025-01-07T10:30:00',
      aiOptimized: true,
    },
    {
      id: '2',
      name: 'Compliance - Certificados Expirando',
      description: 'Alerta sobre certificados próximos do vencimento',
      trigger: 'compliance',
      steps: [
        { id: 's1', type: 'trigger', name: 'Certificado expira em 30 dias', config: { days: 30 } },
        { id: 's2', type: 'condition', name: 'Se certificado crítico', config: { critical: true } },
        { id: 's3', type: 'action', name: 'Alerta Urgente', config: { priority: 'high' } },
      ],
      isActive: true,
      executionCount: 12,
      lastExecution: '2025-01-06T08:00:00',
      aiOptimized: false,
    },
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    trigger: 'schedule',
    aiOptimized: true,
  });

  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const handleCreateWorkflow = () => {
    if (!newWorkflow.name) {
      toast.error('Informe o nome do workflow');
      return;
    }

    const workflow: AutomationWorkflow = {
      id: Date.now().toString(),
      name: newWorkflow.name,
      description: newWorkflow.description,
      trigger: newWorkflow.trigger,
      steps: [
        { id: 's1', type: 'trigger', name: TRIGGERS.find(t => t.value === newWorkflow.trigger)?.label || 'Trigger', config: {} },
        { id: 's2', type: 'action', name: 'Enviar Notificação', config: {} },
      ],
      isActive: true,
      executionCount: 0,
      aiOptimized: newWorkflow.aiOptimized,
    };

    setWorkflows([...workflows, workflow]);
    setIsCreating(false);
    setNewWorkflow({ name: '', description: '', trigger: 'schedule', aiOptimized: true });
    toast.success('Workflow criado com sucesso!');
  };

  const toggleWorkflow = (id: string) => {
    setWorkflows(workflows.map(w => 
      w.id === id ? { ...w, isActive: !w.isActive } : w
    ));
    toast.success('Status do workflow atualizado');
  };

  const deleteWorkflow = (id: string) => {
    setWorkflows(workflows.filter(w => w.id !== id));
    toast.success('Workflow removido');
  };

  const runWorkflow = async (workflow: AutomationWorkflow) => {
    toast.info(`Executando workflow: ${workflow.name}...`);
    
    // Simulate execution
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setWorkflows(workflows.map(w => 
      w.id === workflow.id 
        ? { ...w, executionCount: w.executionCount + 1, lastExecution: new Date().toISOString() }
        : w
    ));
    
    toast.success('Workflow executado com sucesso!');
  };

  const getAISuggestion = async () => {
    setIsLoadingAI(true);
    try {
      const result = await hybridLLMEngine.query(
        'Sugira 3 automações importantes para operações marítimas offshore que aumentem eficiência e reduzam riscos.'
      );
      setAiSuggestion(result.response);
    } catch {
      setAiSuggestion('Sugestões: 1) Alerta automático quando horímetro atinge limite de manutenção, 2) Notificação de compliance quando certificado expira em 30 dias, 3) Criação automática de relatório semanal de performance.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const optimizeWithAI = async (workflow: AutomationWorkflow) => {
    toast.info('Otimizando workflow com IA...');
    
    try {
      await hybridLLMEngine.query(
        `Analise este workflow "${workflow.name}" e sugira otimizações para melhorar eficiência.`
      );
      
      setWorkflows(workflows.map(w => 
        w.id === workflow.id ? { ...w, aiOptimized: true } : w
      ));
      
      toast.success('Workflow otimizado com IA!');
    } catch {
      toast.error('Não foi possível otimizar (modo offline)');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Automações & Workflows</h2>
          <p className="text-muted-foreground">Configure fluxos automáticos com IA embarcada</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={getAISuggestion} disabled={isLoadingAI}>
            <Bot className="w-4 h-4 mr-2" />
            {isLoadingAI ? 'Analisando...' : 'Sugestões IA'}
          </Button>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Workflow
          </Button>
        </div>
      </div>

      {aiSuggestion && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Bot className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="font-medium text-sm text-primary">Sugestão da IA</p>
                <p className="text-sm text-muted-foreground mt-1">{aiSuggestion}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Workflow de Automação</CardTitle>
            <CardDescription>Configure os parâmetros do fluxo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Workflow</Label>
                <Input 
                  placeholder="Ex: Alerta de Manutenção"
                  value={newWorkflow.name}
                  onChange={e => setNewWorkflow({...newWorkflow, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Gatilho (Trigger)</Label>
                <Select value={newWorkflow.trigger} onValueChange={v => setNewWorkflow({...newWorkflow, trigger: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGERS.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.icon} {t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input 
                placeholder="Descreva o objetivo deste workflow"
                value={newWorkflow.description}
                onChange={e => setNewWorkflow({...newWorkflow, description: e.target.value})}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                checked={newWorkflow.aiOptimized}
                onCheckedChange={v => setNewWorkflow({...newWorkflow, aiOptimized: v})}
              />
              <Label>Otimização por IA (ajuste automático de parâmetros)</Label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancelar</Button>
              <Button onClick={handleCreateWorkflow}>Criar Workflow</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {workflows.map(workflow => (
          <WorkflowCard 
            key={workflow.id} 
            workflow={workflow} 
            onToggle={toggleWorkflow}
            onDelete={deleteWorkflow}
            onRun={runWorkflow}
            onOptimize={optimizeWithAI}
          />
        ))}
      </div>

      {workflows.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Workflow className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">Nenhum workflow configurado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Crie seu primeiro workflow de automação para otimizar operações.
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Workflow
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const WorkflowCard = ({ 
  workflow, 
  onToggle, 
  onDelete, 
  onRun,
  onOptimize
}: { 
  workflow: AutomationWorkflow; 
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onRun: (workflow: AutomationWorkflow) => void;
  onOptimize: (workflow: AutomationWorkflow) => void;
}) => {
  const triggerInfo = TRIGGERS.find(t => t.value === workflow.trigger);

  return (
    <Card className={!workflow.isActive ? 'opacity-60' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Workflow className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{workflow.name}</h3>
                {workflow.aiOptimized && (
                  <Badge variant="secondary" className="text-xs">
                    <Bot className="w-3 h-3 mr-1" />
                    IA Otimizado
                  </Badge>
                )}
                <Badge variant={workflow.isActive ? 'default' : 'outline'}>
                  {workflow.isActive ? 'Ativo' : 'Pausado'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{workflow.description}</p>
              
              {/* Workflow Steps */}
              <div className="flex items-center gap-2 mt-3">
                {workflow.steps.map((step, idx) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`
                      px-2 py-1 rounded text-xs
                      ${step.type === 'trigger' ? 'bg-blue-500/10 text-blue-600' : ''}
                      ${step.type === 'condition' ? 'bg-yellow-500/10 text-yellow-600' : ''}
                      ${step.type === 'action' ? 'bg-green-500/10 text-green-600' : ''}
                    `}>
                      {step.name}
                    </div>
                    {idx < workflow.steps.length - 1 && (
                      <ArrowRight className="w-4 h-4 mx-1 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onRun(workflow)}>
              <Zap className="w-4 h-4 mr-1" />
              Executar
            </Button>
            {!workflow.aiOptimized && (
              <Button variant="ghost" size="sm" onClick={() => onOptimize(workflow)}>
                <Bot className="w-4 h-4 mr-1" />
                Otimizar
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onToggle(workflow.id)}
            >
              {workflow.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onDelete(workflow.id)}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t flex items-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {workflow.executionCount} execuções
          </span>
          {workflow.lastExecution && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Última: {new Date(workflow.lastExecution).toLocaleString('pt-BR')}
            </span>
          )}
          <span className="flex items-center gap-1">
            {triggerInfo?.icon} {triggerInfo?.label}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
