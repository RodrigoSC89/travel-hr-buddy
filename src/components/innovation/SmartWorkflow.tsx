import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Workflow, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Play, 
  Pause, 
  Settings,
  Users,
  Calendar,
  Target,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WorkflowTask {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  assignee: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  estimatedHours: number;
  completedHours: number;
}

interface SmartWorkflow {
  id: number;
  name: string;
  description: string;
  progress: number;
  status: 'active' | 'paused' | 'completed';
  tasks: WorkflowTask[];
  participants: string[];
  deadline: string;
  autoOptimization: boolean;
}

export const SmartWorkflow = () => {
  const [workflows, setWorkflows] = useState<SmartWorkflow[]>([
    {
      id: 1,
      name: 'Onboarding Cliente Enterprise',
      description: 'Processo automatizado de integração de novos clientes corporativos',
      progress: 65,
      status: 'active',
      deadline: '2024-02-15',
      autoOptimization: true,
      participants: ['Ana Silva', 'Carlos Santos', 'Maria Costa'],
      tasks: [
        {
          id: 1,
          title: 'Análise de Requisitos',
          description: 'Coleta e validação dos requisitos do cliente',
          status: 'completed',
          assignee: 'Ana Silva',
          dueDate: '2024-01-20',
          priority: 'high',
          estimatedHours: 8,
          completedHours: 8
        },
        {
          id: 2,
          title: 'Setup Infraestrutura',
          description: 'Configuração do ambiente técnico',
          status: 'in_progress',
          assignee: 'Carlos Santos',
          dueDate: '2024-01-25',
          priority: 'high',
          estimatedHours: 12,
          completedHours: 7
        },
        {
          id: 3,
          title: 'Treinamento Equipe',
          description: 'Capacitação da equipe do cliente',
          status: 'pending',
          assignee: 'Maria Costa',
          dueDate: '2024-02-01',
          priority: 'medium',
          estimatedHours: 16,
          completedHours: 0
        }
      ]
    },
    {
      id: 2,
      name: 'Campanha Marketing Q1',
      description: 'Estratégia de marketing digital para primeiro trimestre',
      progress: 30,
      status: 'active',
      deadline: '2024-03-31',
      autoOptimization: true,
      participants: ['João Pedro', 'Ana Silva'],
      tasks: [
        {
          id: 4,
          title: 'Pesquisa de Mercado',
          description: 'Análise da concorrência e público-alvo',
          status: 'completed',
          assignee: 'João Pedro',
          dueDate: '2024-01-15',
          priority: 'high',
          estimatedHours: 20,
          completedHours: 20
        },
        {
          id: 5,
          title: 'Criação de Conteúdo',
          description: 'Desenvolvimento de materiais promocionais',
          status: 'in_progress',
          assignee: 'Ana Silva',
          dueDate: '2024-02-15',
          priority: 'high',
          estimatedHours: 40,
          completedHours: 12
        }
      ]
    }
  ]);

  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500 bg-green-500/10';
      case 'in_progress': return 'text-blue-500 bg-blue-500/10';
      case 'pending': return 'text-yellow-500 bg-yellow-500/10';
      case 'blocked': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Play className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'blocked': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const toggleWorkflowStatus = (workflowId: number) => {
    setWorkflows(prev => prev.map(workflow => 
      workflow.id === workflowId 
        ? { ...workflow, status: workflow.status === 'active' ? 'paused' : 'active' }
        : workflow
    ));
    
    toast({
      title: "Status do workflow atualizado",
      description: "Workflow pausado/retomado com sucesso."
    });
  };

  const optimizeWorkflow = (workflowId: number) => {
    toast({
      title: "IA Otimizando Workflow",
      description: "Analisando tarefas e redistribuindo recursos para máxima eficiência."
    });
  };

  return (
    <div className="space-y-6">
      {/* Workflows Overview */}
      {workflows.map((workflow) => (
        <Card key={workflow.id} className="bg-gradient-to-br from-background to-muted/20">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="w-5 h-5 text-primary" />
                  {workflow.name}
                  {workflow.autoOptimization && (
                    <Badge variant="secondary" className="text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      IA Ativa
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>{workflow.description}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => optimizeWorkflow(workflow.id)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Otimizar
                </Button>
                <Button 
                  variant={workflow.status === 'active' ? 'secondary' : 'default'}
                  size="sm"
                  onClick={() => toggleWorkflowStatus(workflow.id)}
                >
                  {workflow.status === 'active' ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Retomar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Progress and Info */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    Progresso
                  </div>
                  <div className="space-y-1">
                    <Progress value={workflow.progress} className="h-2" />
                    <span className="text-sm font-medium">{workflow.progress}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Deadline
                  </div>
                  <p className="text-sm font-medium">{new Date(workflow.deadline).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    Equipe
                  </div>
                  <div className="flex -space-x-2">
                    {workflow.participants.slice(0, 3).map((participant, index) => (
                      <Avatar key={index} className="w-8 h-8 border-2 border-background">
                        <AvatarFallback className="text-xs">{participant.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                    ))}
                    {workflow.participants.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                        <span className="text-xs font-medium">+{workflow.participants.length - 3}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="w-4 h-4" />
                    Status
                  </div>
                  <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                    {workflow.status === 'active' ? 'Ativo' : 'Pausado'}
                  </Badge>
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-3">
                <h4 className="font-medium">Tarefas do Workflow</h4>
                <div className="space-y-2">
                  {workflow.tasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card/50">
                      <div className={`p-2 rounded-lg ${getStatusColor(task.status)}`}>
                        {getStatusIcon(task.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-sm">{task.title}</h5>
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                          <Badge variant="outline" className="text-xs">{task.assignee}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Prazo: {new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
                          <span>{task.completedHours}h / {task.estimatedHours}h</span>
                          <Progress 
                            value={(task.completedHours / task.estimatedHours) * 100} 
                            className="w-20 h-1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};