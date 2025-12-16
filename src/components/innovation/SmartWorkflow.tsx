import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, 
  CheckCircle, 
  Clock, 
  Play, 
  Pause, 
  Settings, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  Users,
  FileText,
  Mail,
  Database,
  Workflow,
  Bot
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  triggers: string[];
  actions: string[];
  estimatedTimeSaved: string;
  complexity: "simple" | "medium" | "complex";
  popularity: number;
}

interface ActiveWorkflow {
  id: string;
  name: string;
  status: "running" | "paused" | "error";
  executions: number;
  successRate: number;
  lastRun: string;
  timeSaved: string;
}

export const SmartWorkflow = () => {
  const [activeWorkflows, setActiveWorkflows] = useState<ActiveWorkflow[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setActiveWorkflows([
      {
        id: "1",
        name: "Onboarding Automático",
        status: "running",
        executions: 847,
        successRate: 98.5,
        lastRun: "2 horas atrás",
        timeSaved: "156h"
      },
      {
        id: "2",
        name: "Processamento de Faturas",
        status: "running",
        executions: 2341,
        successRate: 99.2,
        lastRun: "15 min atrás",
        timeSaved: "420h"
      },
      {
        id: "3",
        name: "Relatórios Semanais",
        status: "paused",
        executions: 156,
        successRate: 97.8,
        lastRun: "3 dias atrás",
        timeSaved: "89h"
      },
      {
        id: "4",
        name: "Backup de Documentos",
        status: "running",
        executions: 1205,
        successRate: 100,
        lastRun: "1 hora atrás",
        timeSaved: "203h"
      }
    ]);

    setTemplates([
      {
        id: "1",
        name: "Aprovação de Despesas",
        description: "Automatiza o fluxo de aprovação de despesas corporativas",
        category: "Financeiro",
        triggers: ["Nova despesa", "Valor > limite"],
        actions: ["Notificar gestor", "Criar ticket", "Atualizar planilha"],
        estimatedTimeSaved: "4h/semana",
        complexity: "medium",
        popularity: 87
      },
      {
        id: "2",
        name: "Welcome Kit Digital",
        description: "Envia materiais de boas-vindas para novos funcionários",
        category: "RH",
        triggers: ["Novo funcionário"],
        actions: ["Enviar email", "Criar usuário", "Agendar reunião"],
        estimatedTimeSaved: "2h/contratação",
        complexity: "simple",
        popularity: 92
      },
      {
        id: "3",
        name: "Análise de Performance",
        description: "Gera relatórios automáticos de KPIs semanais",
        category: "Analytics",
        triggers: ["Final de semana", "Dados atualizados"],
        actions: ["Coletar dados", "Gerar gráficos", "Enviar relatório"],
        estimatedTimeSaved: "6h/semana",
        complexity: "complex",
        popularity: 76
      }
    ]);
  }, []);

  const toggleWorkflow = (id: string) => {
    setActiveWorkflows(prev => 
      prev.map(workflow => 
        workflow.id === id 
          ? { ...workflow, status: workflow.status === "running" ? "paused" : "running" as "running" | "paused" }
          : workflow
      )
    );
    
    toast({
      title: "Status atualizado",
      description: "Workflow foi pausado/reativado",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "running": return "bg-success";
    case "paused": return "bg-warning";
    case "error": return "bg-destructive";
    default: return "bg-muted";
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
    case "simple": return "bg-green-100 text-green-700";
    case "medium": return "bg-yellow-100 text-yellow-700";
    case "complex": return "bg-red-100 text-red-700";
    default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
    case "Financeiro": return <Database className="h-4 w-4" />;
    case "RH": return <Users className="h-4 w-4" />;
    case "Analytics": return <TrendingUp className="h-4 w-4" />;
    default: return <Workflow className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Workflows Inteligentes</h2>
          <p className="text-muted-foreground">Automações que potencializam sua produtividade</p>
        </div>
        <Button>
          <Bot className="h-4 w-4 mr-2" />
          Criar Workflow
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-effect">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-warning" />
              Workflows Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">12</div>
            <p className="text-xs text-muted-foreground">+3 este mês</p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-success" />
              Taxa de Sucesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">99.2%</div>
            <p className="text-xs text-muted-foreground">Última semana</p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              Tempo Economizado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">847h</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-info" />
              Execuções
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">4,589</div>
            <p className="text-xs text-muted-foreground">Total este mês</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Workflows Ativos</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {activeWorkflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(workflow.status)}`} />
                      <div>
                        <h3 className="font-semibold">{workflow.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {workflow.executions} execuções • {workflow.successRate}% sucesso • {workflow.lastRun}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium">{workflow.timeSaved}</p>
                        <p className="text-xs text-muted-foreground">economizadas</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleWorkflow(workflow.id)}
                        >
                          {workflow.status === "running" ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Taxa de Sucesso</span>
                      <span>{workflow.successRate}%</span>
                    </div>
                    <Progress value={workflow.successRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(template.category)}
                      <div>
                        <h3 className="font-semibold">{template.name}</h3>
                        <Badge variant="outline" className={getComplexityColor(template.complexity)}>
                          {template.complexity}
                        </Badge>
                      </div>
                    </div>
                    <Badge variant="secondary">{template.popularity}%</Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-medium">Triggers:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.triggers.map((trigger, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {trigger}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-medium">Ações:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.actions.map((action, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4">
                    <span className="text-sm font-medium text-primary">
                      {template.estimatedTimeSaved}
                    </span>
                    <Button size="sm">
                      Usar Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};