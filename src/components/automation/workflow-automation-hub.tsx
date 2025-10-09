import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  Play, 
  Pause, 
  SkipForward,
  User,
  FileText,
  Calendar,
  Workflow,
  ArrowRight,
  Target,
  TrendingUp,
  Users,
  Database,
  Settings,
  Zap,
  Filter,
  Search,
  Download,
  Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignee?: string;
  dueDate?: Date;
  duration?: number;
  dependencies?: string[];
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  category: 'hr' | 'finance' | 'operations' | 'marketing' | 'custom';
  status: 'draft' | 'active' | 'paused' | 'completed';
  progress: number;
  steps: WorkflowStep[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  estimatedDuration: number;
  actualDuration?: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  condition: string;
  action: string;
  isActive: boolean;
  executionCount: number;
  lastExecuted?: Date;
  category: string;
}

export const WorkflowAutomationHub: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Dados simulados para demonstração
  const generateMockData = () => {
    const mockWorkflows: Workflow[] = [
      {
        id: '1',
        name: 'Processo de Onboarding',
        description: 'Fluxo completo de integração de novos funcionários',
        category: 'hr',
        status: 'active',
        progress: 65,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        createdBy: 'Admin',
        estimatedDuration: 2880, // 48 horas
        actualDuration: 1920, // 32 horas
        priority: 'high',
        steps: [
          {
            id: 's1',
            name: 'Criação de Usuário',
            description: 'Criar conta no sistema',
            status: 'completed',
            assignee: 'TI',
            duration: 30
          },
          {
            id: 's2',
            name: 'Documentação',
            description: 'Coleta de documentos pessoais',
            status: 'completed',
            assignee: 'RH',
            duration: 120
          },
          {
            id: 's3',
            name: 'Treinamento Inicial',
            description: 'Curso de integração',
            status: 'in_progress',
            assignee: 'Supervisor',
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
          },
          {
            id: 's4',
            name: 'Avaliação 30 dias',
            description: 'Primeira avaliação de desempenho',
            status: 'pending',
            assignee: 'Gerente',
            dependencies: ['s3']
          }
        ]
      },
      {
        id: '2',
        name: 'Aprovação de Despesas',
        description: 'Fluxo de aprovação para reembolsos',
        category: 'finance',
        status: 'active',
        progress: 80,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000),
        createdBy: 'Financeiro',
        estimatedDuration: 480, // 8 horas
        priority: 'medium',
        steps: [
          {
            id: 's5',
            name: 'Submissão',
            description: 'Funcionário submete despesa',
            status: 'completed',
            assignee: 'Funcionário'
          },
          {
            id: 's6',
            name: 'Revisão Supervisor',
            description: 'Aprovação do supervisor direto',
            status: 'completed',
            assignee: 'Supervisor'
          },
          {
            id: 's7',
            name: 'Aprovação Financeira',
            description: 'Validação do departamento financeiro',
            status: 'in_progress',
            assignee: 'Financeiro'
          }
        ]
      },
      {
        id: '3',
        name: 'Manutenção Preventiva',
        description: 'Rotina de manutenção de equipamentos',
        category: 'operations',
        status: 'paused',
        progress: 40,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        createdBy: 'Operações',
        estimatedDuration: 720, // 12 horas
        priority: 'low',
        steps: [
          {
            id: 's8',
            name: 'Inspeção Visual',
            description: 'Verificação inicial dos equipamentos',
            status: 'completed',
            assignee: 'Técnico'
          },
          {
            id: 's9',
            name: 'Testes Funcionais',
            description: 'Execução de testes operacionais',
            status: 'failed',
            assignee: 'Especialista'
          }
        ]
      }
    ];

    const mockAutomationRules: AutomationRule[] = [
      {
        id: 'r1',
        name: 'Auto-aprovação Despesas Baixo Valor',
        description: 'Aprova automaticamente despesas abaixo de R$ 100',
        trigger: 'expense_submitted',
        condition: 'amount < 100',
        action: 'auto_approve',
        isActive: true,
        executionCount: 47,
        lastExecuted: new Date(Date.now() - 2 * 60 * 60 * 1000),
        category: 'finance'
      },
      {
        id: 'r2',
        name: 'Notificação Certificado Vencendo',
        description: 'Envia alerta 30 dias antes do vencimento',
        trigger: 'certificate_check',
        condition: 'days_to_expiry <= 30',
        action: 'send_notification',
        isActive: true,
        executionCount: 12,
        lastExecuted: new Date(Date.now() - 24 * 60 * 60 * 1000),
        category: 'hr'
      },
      {
        id: 'r3',
        name: 'Escalação de Tickets',
        description: 'Escala tickets não resolvidos em 24h',
        trigger: 'ticket_created',
        condition: 'hours_open > 24',
        action: 'escalate_to_manager',
        isActive: false,
        executionCount: 8,
        category: 'operations'
      }
    ];

    setWorkflows(mockWorkflows);
    setAutomationRules(mockAutomationRules);
    setIsLoading(false);
  };

  useEffect(() => {
    generateMockData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-orange-600 bg-orange-100';
      case 'draft': return 'text-muted-foreground bg-gray-100';
      default: return 'text-muted-foreground bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'failed': return <AlertTriangle className="h-4 w-4" />;
      case 'active': return <Play className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-muted-foreground bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hr': return <Users className="h-4 w-4" />;
      case 'finance': return <TrendingUp className="h-4 w-4" />;
      case 'operations': return <Settings className="h-4 w-4" />;
      case 'marketing': return <Target className="h-4 w-4" />;
      default: return <Workflow className="h-4 w-4" />;
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || workflow.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleStartWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.map(wf => 
      wf.id === workflowId 
        ? { ...wf, status: 'active' as const, updatedAt: new Date() }
        : wf
    ));
    
    toast({
      title: "Workflow iniciado",
      description: "O workflow foi ativado com sucesso.",
    });
  };

  const handlePauseWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.map(wf => 
      wf.id === workflowId 
        ? { ...wf, status: 'paused' as const, updatedAt: new Date() }
        : wf
    ));
    
    toast({
      title: "Workflow pausado",
      description: "O workflow foi pausado com sucesso.",
    });
  };

  const toggleAutomationRule = (ruleId: string) => {
    setAutomationRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, isActive: !rule.isActive }
        : rule
    ));
    
    toast({
      title: "Regra atualizada",
      description: "O status da regra de automação foi alterado.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Automação de Workflows</h2>
          <p className="text-muted-foreground">
            Gerencie processos automatizados e fluxos de trabalho
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Workflow
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workflows Ativos</CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workflows.filter(w => w.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              de {workflows.length} workflows
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automações Ativas</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {automationRules.filter(r => r.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              regras configuradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(workflows.reduce((acc, w) => acc + w.progress, 0) / workflows.length)}%
            </div>
            <p className="text-xs text-muted-foreground">
              dos workflows
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Execuções Hoje</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">
              +12% vs ontem
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="automation">Automações</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Análise</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          {/* Filtros */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar workflows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="paused">Pausado</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="hr">RH</SelectItem>
                <SelectItem value="finance">Financeiro</SelectItem>
                <SelectItem value="operations">Operações</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de Workflows */}
          <div className="grid gap-4">
            {filteredWorkflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getCategoryIcon(workflow.category)}
                      <div>
                        <CardTitle className="text-lg">{workflow.name}</CardTitle>
                        <CardDescription>{workflow.description}</CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(workflow.priority)}>
                        {workflow.priority}
                      </Badge>
                      <Badge className={getStatusColor(workflow.status)}>
                        {getStatusIcon(workflow.status)}
                        <span className="ml-1 capitalize">{workflow.status}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Progresso */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progresso</span>
                        <span>{workflow.progress}%</span>
                      </div>
                      <Progress value={workflow.progress} className="h-2" />
                    </div>
                    
                    {/* Etapas */}
                    <div className="grid gap-2">
                      <h4 className="font-medium text-sm">Etapas ({workflow.steps.length})</h4>
                      <div className="grid gap-2 max-h-32 overflow-y-auto">
                        {workflow.steps.map((step, index) => (
                          <div key={step.id} className="flex items-center justify-between p-2 border border-border rounded-md">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(step.status)}
                              <span className="text-sm">{step.name}</span>
                              {step.assignee && (
                                <Badge variant="outline" className="text-xs">
                                  {step.assignee}
                                </Badge>
                              )}
                            </div>
                            <Badge className={getStatusColor(step.status)}>
                              {step.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Informações e Ações */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {workflow.updatedAt.toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {workflow.createdBy}
                        </span>
                        {workflow.estimatedDuration && (
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {Math.round(workflow.estimatedDuration / 60)}h estimado
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <FileText className="h-3 w-3 mr-1" />
                          Detalhes
                        </Button>
                        
                        {workflow.status === 'draft' || workflow.status === 'paused' ? (
                          <Button 
                            size="sm" 
                            onClick={() => handleStartWorkflow(workflow.id)}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Iniciar
                          </Button>
                        ) : workflow.status === 'active' ? (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handlePauseWorkflow(workflow.id)}
                          >
                            <Pause className="h-3 w-3 mr-1" />
                            Pausar
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regras de Automação</CardTitle>
              <CardDescription>
                Configure regras para automatizar processos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automationRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium">{rule.name}</h4>
                        <Badge variant="outline">{rule.category}</Badge>
                        <Badge className={rule.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-muted-foreground'}>
                          {rule.isActive ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{rule.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Execuções: {rule.executionCount}</span>
                        {rule.lastExecuted && (
                          <span>Última execução: {rule.lastExecuted.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant={rule.isActive ? "destructive" : "default"}
                        onClick={() => toggleAutomationRule(rule.id)}
                      >
                        {rule.isActive ? 'Desativar' : 'Ativar'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Templates de Workflow</CardTitle>
              <CardDescription>
                Modelos pré-configurados para processos comuns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { name: 'Onboarding de Funcionários', category: 'RH', steps: 8 },
                  { name: 'Aprovação de Despesas', category: 'Financeiro', steps: 4 },
                  { name: 'Processo de Compras', category: 'Operações', steps: 6 },
                  { name: 'Campanha de Marketing', category: 'Marketing', steps: 10 },
                  { name: 'Manutenção Preventiva', category: 'Operações', steps: 5 },
                  { name: 'Avaliação de Desempenho', category: 'RH', steps: 7 }
                ].map((template, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription>{template.category}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {template.steps} etapas
                        </span>
                        <Button size="sm">
                          Usar Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Eficiência dos Workflows</CardTitle>
                <CardDescription>Tempo médio de conclusão por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { category: 'RH', avgTime: '2.3 dias', efficiency: 87 },
                    { category: 'Financeiro', avgTime: '4.1 horas', efficiency: 94 },
                    { category: 'Operações', avgTime: '1.8 dias', efficiency: 76 },
                    { category: 'Marketing', avgTime: '5.2 dias', efficiency: 82 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.category}</p>
                        <p className="text-sm text-muted-foreground">{item.avgTime}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.efficiency}%</p>
                        <Progress value={item.efficiency} className="w-20 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Automações por Categoria</CardTitle>
                <CardDescription>Execuções nos últimos 30 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { category: 'RH', executions: 156, trend: '+12%' },
                    { category: 'Financeiro', executions: 289, trend: '+8%' },
                    { category: 'Operações', executions: 97, trend: '-3%' },
                    { category: 'Marketing', executions: 43, trend: '+25%' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <p className="font-medium">{item.category}</p>
                      <div className="text-right">
                        <p className="font-bold">{item.executions}</p>
                        <p className={`text-sm ${item.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {item.trend}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};