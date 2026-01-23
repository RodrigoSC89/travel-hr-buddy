import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, Play, Pause, CheckCircle2, AlertTriangle, 
  Plus, Search, ArrowRight, Users, FileText, 
  Calendar, Zap, Brain, Settings, MoreVertical
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  type: 'audit' | 'certification' | 'training' | 'incident' | 'documentation';
  progress: number;
  currentStep: number;
  totalSteps: number;
  assignees: string[];
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  automationLevel: number;
}

const initialWorkflows: Workflow[] = [
  {
    id: '1',
    name: 'Auditoria ISPS Trimestral',
    description: 'Workflow automático de verificação ISPS Code para todas as embarcações',
    status: 'active',
    type: 'audit',
    progress: 65,
    currentStep: 4,
    totalSteps: 6,
    assignees: ['Maria Santos', 'João Silva'],
    dueDate: '2025-02-15',
    priority: 'high',
    automationLevel: 85
  },
  {
    id: '2',
    name: 'Renovação Certificados MLC 2006',
    description: 'Processo automatizado de renovação de certificados MLC para tripulação',
    status: 'active',
    type: 'certification',
    progress: 40,
    currentStep: 2,
    totalSteps: 5,
    assignees: ['Pedro Costa'],
    dueDate: '2025-01-30',
    priority: 'critical',
    automationLevel: 70
  },
  {
    id: '3',
    name: 'Treinamento STCW Obrigatório',
    description: 'Fluxo de gestão de treinamentos obrigatórios STCW',
    status: 'paused',
    type: 'training',
    progress: 25,
    currentStep: 1,
    totalSteps: 4,
    assignees: ['Ana Lima', 'Carlos Neto'],
    dueDate: '2025-03-01',
    priority: 'medium',
    automationLevel: 60
  },
  {
    id: '4',
    name: 'Relatório de Incidente Marítimo',
    description: 'Workflow de investigação e documentação de incidentes',
    status: 'completed',
    type: 'incident',
    progress: 100,
    currentStep: 5,
    totalSteps: 5,
    assignees: ['Roberto Alves'],
    dueDate: '2024-12-20',
    priority: 'high',
    automationLevel: 45
  },
  {
    id: '5',
    name: 'Atualização Procedimentos ISM',
    description: 'Revisão e atualização de documentação ISM Code',
    status: 'draft',
    type: 'documentation',
    progress: 0,
    currentStep: 0,
    totalSteps: 7,
    assignees: [],
    dueDate: '2025-04-01',
    priority: 'low',
    automationLevel: 90
  }
];

const statusConfig = {
  active: { label: 'Ativo', color: 'bg-success/20 text-success border-success/30' },
  paused: { label: 'Pausado', color: 'bg-warning/20 text-warning border-warning/30' },
  completed: { label: 'Concluído', color: 'bg-primary/20 text-primary border-primary/30' },
  draft: { label: 'Rascunho', color: 'bg-muted text-muted-foreground border-border' }
};

const priorityConfig = {
  low: { label: 'Baixa', color: 'text-muted-foreground' },
  medium: { label: 'Média', color: 'text-warning' },
  high: { label: 'Alta', color: 'text-warning' },
  critical: { label: 'Crítica', color: 'text-destructive' }
};

const typeConfig = {
  audit: { label: 'Auditoria', icon: FileText },
  certification: { label: 'Certificação', icon: CheckCircle2 },
  training: { label: 'Treinamento', icon: Users },
  incident: { label: 'Incidente', icon: AlertTriangle },
  documentation: { label: 'Documentação', icon: FileText }
};

export default function ComplianceWorkflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredWorkflows = workflows.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && w.status === activeTab;
  });

  const handleToggleStatus = (id: string) => {
    setWorkflows(prev => prev.map(w => {
      if (w.id === id) {
        const newStatus = w.status === 'active' ? 'paused' : 'active';
        toast.success(`Workflow ${newStatus === 'active' ? 'ativado' : 'pausado'}`);
        return { ...w, status: newStatus };
      }
      return w;
    }));
  };

  const handleRunAI = (workflow: Workflow) => {
    toast.success(`IA analisando workflow: ${workflow.name}`, {
      description: 'Otimizações sendo calculadas...'
    });
  };

  const stats = {
    active: workflows.filter(w => w.status === 'active').length,
    completed: workflows.filter(w => w.status === 'completed').length,
    avgAutomation: Math.round(workflows.reduce((a, w) => a + w.automationLevel, 0) / workflows.length),
    critical: workflows.filter(w => w.priority === 'critical' && w.status !== 'completed').length
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Clock className="h-8 w-8 text-primary" />
            Workflows de Compliance
          </h1>
          <p className="text-muted-foreground mt-1">
            Automação inteligente de processos de conformidade marítima
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Workflow
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Workflows Ativos</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <Play className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Automação Média</p>
                <p className="text-2xl font-bold">{stats.avgAutomation}%</p>
              </div>
              <Zap className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticos Pendentes</p>
                <p className="text-2xl font-bold">{stats.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar workflows..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="active">Ativos</TabsTrigger>
            <TabsTrigger value="paused">Pausados</TabsTrigger>
            <TabsTrigger value="completed">Concluídos</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Workflow List */}
      <div className="space-y-4">
        {filteredWorkflows.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum workflow encontrado</p>
            </CardContent>
          </Card>
        ) : (
          filteredWorkflows.map((workflow) => {
            const TypeIcon = typeConfig[workflow.type].icon;
            return (
              <Card key={workflow.id} className="border-border/50 bg-card/50 hover:bg-card/80 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <TypeIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{workflow.name}</h3>
                          <p className="text-sm text-muted-foreground">{workflow.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <Badge className={cn("border", statusConfig[workflow.status].color)}>
                          {statusConfig[workflow.status].label}
                        </Badge>
                        <Badge variant="outline" className={priorityConfig[workflow.priority].color}>
                          {priorityConfig[workflow.priority].label}
                        </Badge>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(workflow.dueDate).toLocaleDateString('pt-BR')}
                        </span>
                        {workflow.assignees.length > 0 && (
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {workflow.assignees.length} responsáveis
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="w-full lg:w-48 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">{workflow.progress}%</span>
                      </div>
                      <Progress value={workflow.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground text-center">
                        Etapa {workflow.currentStep}/{workflow.totalSteps}
                      </p>
                    </div>

                    {/* Automation */}
                    <div className="w-full lg:w-32 text-center">
                      <div className="flex items-center justify-center gap-1 text-sm">
                        <Zap className="h-4 w-4 text-amber-400" />
                        <span className="font-medium">{workflow.automationLevel}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Automação</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {workflow.status !== 'completed' && workflow.status !== 'draft' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleToggleStatus(workflow.id)}
                        >
                          {workflow.status === 'active' ? (
                            <><Pause className="h-4 w-4 mr-1" /> Pausar</>
                          ) : (
                            <><Play className="h-4 w-4 mr-1" /> Retomar</>
                          )}
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRunAI(workflow)}
                      >
                        <Brain className="h-4 w-4 mr-1" />
                        IA
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* AI Insights */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Insights de IA
          </CardTitle>
          <CardDescription>
            Recomendações automáticas baseadas na análise dos workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-background/50 rounded-lg border border-border/50">
              <h4 className="font-medium text-foreground mb-2">⚡ Otimização Sugerida</h4>
              <p className="text-sm text-muted-foreground">
                O workflow "Renovação MLC 2006" pode ser 30% mais rápido com automação de validação de documentos.
              </p>
            </div>
            <div className="p-4 bg-background/50 rounded-lg border border-border/50">
              <h4 className="font-medium text-foreground mb-2">⚠️ Alerta de Prazo</h4>
              <p className="text-sm text-muted-foreground">
                2 workflows críticos vencem nos próximos 30 dias. Priorização recomendada.
              </p>
            </div>
            <div className="p-4 bg-background/50 rounded-lg border border-border/50">
              <h4 className="font-medium text-foreground mb-2">📊 Tendência</h4>
              <p className="text-sm text-muted-foreground">
                Taxa de conclusão aumentou 15% este mês. Meta de automação: 80% até Q2.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
