import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { WorkflowStats } from "@/components/automation/workflow/WorkflowStats";
import { WorkflowCard } from "@/components/automation/workflow/WorkflowCard";
import { WorkflowFilters } from "@/components/automation/workflow/WorkflowFilters";
import { WorkflowAISuggestions } from "@/components/ai/WorkflowAISuggestions";
import { workflowTemplates } from "@/hooks/useWorkflowAI";
import {
  Settings, Sparkles, Workflow, GitBranch, Lightbulb, Zap, Play,
  CheckCircle2, Clock, TrendingUp, Bot, Network, ArrowRight, Plus, Layers
} from "lucide-react";
import type { VisualWorkflow, WorkflowNode } from "./types";
import { getNodeStatusColor, getNodeIcon } from "./types";

interface WorkflowTabsProps {
  // Overview
  visualWorkflows: VisualWorkflow[];
  workflows: any[];
  automationRules: any[];
  // Workflows tab
  filteredWorkflows: any[];
  searchTerm: string;
  statusFilter: string;
  categoryFilter: string;
  priorityFilter: string;
  onSearchChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onPriorityChange: (v: string) => void;
  onClearFilters: () => void;
  // Actions
  onStartWorkflow: (id: string) => void;
  onPauseWorkflow: (id: string) => void;
  onDetailsWorkflow: (w: any) => void;
  onEditWorkflow: (w: any) => void;
  onDuplicateWorkflow: (w: any) => void;
  onDeleteWorkflow: (id: string) => void;
  onToggleAutomationRule: (id: string) => void;
  onUseTemplate: (t: typeof workflowTemplates[0]) => void;
  onSelectVisualWorkflow: (w: VisualWorkflow) => void;
  onShowNewWorkflow: () => void;
  createWorkflow: (data: any) => void;
}

export const WorkflowTabs: React.FC<WorkflowTabsProps> = ({
  visualWorkflows, workflows, automationRules,
  filteredWorkflows, searchTerm, statusFilter, categoryFilter, priorityFilter,
  onSearchChange, onStatusChange, onCategoryChange, onPriorityChange, onClearFilters,
  onStartWorkflow, onPauseWorkflow, onDetailsWorkflow, onEditWorkflow, onDuplicateWorkflow, onDeleteWorkflow,
  onToggleAutomationRule, onUseTemplate, onSelectVisualWorkflow, onShowNewWorkflow, createWorkflow,
}) => {
  return (
    <>
      {/* Overview Tab */}
      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5 text-primary" />
                Workflows Visuais Ativos
              </CardTitle>
              <CardDescription>Fluxos em execução com visualização de etapas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {visualWorkflows.filter((w) => w.status === "running").map((workflow) => (
                <div
                  key={workflow.id}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => onSelectVisualWorkflow(workflow)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{workflow.name}</h4>
                    <Badge className="bg-primary/10 text-primary">Em execução</Badge>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {workflow.nodes.map((node, i: number) => (
                      <React.Fragment key={node.id}>
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getNodeStatusColor(node.status)} text-white`}>
                          {getNodeIcon(node.type)}
                        </div>
                        {i < workflow.nodes.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {workflow.executions} execuções • Última: {new Date(workflow.lastRun).toLocaleString()}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-warning" />
                Sugestões de IA Recentes
              </CardTitle>
              <CardDescription>Otimizações sugeridas pelo sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <WorkflowAISuggestions limit={3} className="border-0 shadow-none p-0" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Workflows Recentes</CardTitle>
            <CardDescription>Últimos workflows criados ou modificados</CardDescription>
          </CardHeader>
          <CardContent>
            <WorkflowStats workflows={workflows} automationRules={automationRules} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Workflows Tab */}
      <TabsContent value="workflows" className="space-y-4">
        <WorkflowFilters
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          statusFilter={statusFilter}
          onStatusChange={onStatusChange}
          categoryFilter={categoryFilter}
          onCategoryChange={onCategoryChange}
          priorityFilter={priorityFilter}
          onPriorityChange={onPriorityChange}
          onClearFilters={onClearFilters}
        />
        <div className="grid gap-4">
          {filteredWorkflows.length === 0 ? (
            <Card className="p-8 text-center">
              <Workflow className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Nenhum workflow encontrado</p>
              <Button className="mt-4" onClick={onShowNewWorkflow}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Workflow
              </Button>
            </Card>
          ) : (
            filteredWorkflows.map((workflow) => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                onStart={onStartWorkflow}
                onPause={onPauseWorkflow}
                onDetails={(w) => onDetailsWorkflow(w)}
                onEdit={(w) => onEditWorkflow(w)}
                onDuplicate={(w) => createWorkflow({ ...w, name: `${w.name} (Cópia)`, status: "draft" })}
                onDelete={onDeleteWorkflow}
              />
            ))
          )}
        </div>
      </TabsContent>

      {/* Visual Builder Tab */}
      <TabsContent value="visual" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" />
              Workflows Visuais
            </CardTitle>
            <CardDescription>Construa e visualize fluxos de trabalho com arrastar e soltar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {visualWorkflows.map((workflow) => (
                <Card
                  key={workflow.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onSelectVisualWorkflow(workflow)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{workflow.name}</CardTitle>
                      <Badge variant={workflow.status === "running" ? "default" : "secondary"}>
                        {workflow.status === "running" ? "Ativo" : "Concluído"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-2">
                      {workflow.nodes.slice(0, 5).map((node: WorkflowNode, i: number) => (
                        <React.Fragment key={node.id}>
                          <div className={`flex items-center justify-center w-6 h-6 rounded-full ${getNodeStatusColor(node.status)} text-white`}>
                            {getNodeIcon(node.type)}
                          </div>
                          {i < Math.min(workflow.nodes.length - 1, 4) && (
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          )}
                        </React.Fragment>
                      ))}
                      {workflow.nodes.length > 5 && (
                        <Badge variant="outline" className="ml-1">+{workflow.nodes.length - 5}</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{workflow.nodes.length} etapas</span>
                      <span>{workflow.executions} execuções</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Card className="border-dashed hover:border-primary transition-colors cursor-pointer flex items-center justify-center min-h-[180px]">
                <div className="text-center p-4">
                  <Plus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="font-medium">Novo Workflow Visual</p>
                  <p className="text-sm text-muted-foreground">Crie com arrastar e soltar</p>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Automation Tab */}
      <TabsContent value="automation" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Regras de Automação</CardTitle>
                <CardDescription>Configure regras para automatizar processos</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Regra
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {automationRules.length === 0 ? (
              <div className="text-center py-8">
                <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Nenhuma regra de automação configurada</p>
                <Button className="mt-4" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Regra
                </Button>
              </div>
            ) : (
              automationRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{rule.rule_name}</h4>
                      <Badge variant="outline">{rule.trigger_type}</Badge>
                      <Badge className={rule.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>
                        {rule.is_active ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{rule.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Execuções: {rule.execution_count} | Última: {rule.last_executed_at ? new Date(rule.last_executed_at).toLocaleString() : "Nunca"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant={rule.is_active ? "destructive" : "default"} onClick={() => onToggleAutomationRule(rule.id)}>
                      {rule.is_active ? "Desativar" : "Ativar"}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* AI Suggestions Tab */}
      <TabsContent value="suggestions" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-warning" />
              Como Funcionam as Sugestões de IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              O sistema analisa automaticamente os logs, prazos e falhas dos workflows
              para gerar sugestões acionáveis. As sugestões podem incluir:
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-info" />
                Criação de novas tarefas para resolver problemas identificados
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-warning" />
                Ajustes de prazo baseados em análise de histórico
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success" />
                Reatribuição de responsáveis para maior eficiência
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-destructive" />
                Escalação de problemas críticos
              </li>
            </ul>
          </CardContent>
        </Card>
        <WorkflowAISuggestions limit={50} />
      </TabsContent>

      {/* Templates Tab */}
      <TabsContent value="templates" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Templates de Workflow</CardTitle>
            <CardDescription>Modelos pré-configurados para processos comuns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {workflowTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription>{template.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{template.steps.length} etapas</span>
                      <Button size="sm" onClick={() => onUseTemplate(template)}>
                        <Sparkles className="h-3 w-3 mr-1" />
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

      {/* Analytics Tab */}
      <TabsContent value="analytics" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Eficiência dos Workflows</CardTitle>
              <CardDescription>Tempo médio por categoria</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { category: "RH", time: "2.3 dias", eff: 87 },
                { category: "Financeiro", time: "4h", eff: 94 },
                { category: "Operações", time: "1.8 dias", eff: 76 },
                { category: "Manutenção", time: "3.2 dias", eff: 82 },
              ].map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.category}</p>
                    <p className="text-sm text-muted-foreground">{item.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{item.eff}%</p>
                    <Progress value={item.eff} className="w-20 h-2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Automações por Categoria</CardTitle>
              <CardDescription>Últimos 30 dias</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { cat: "RH", exec: 156, trend: "+12%" },
                { cat: "Financeiro", exec: 289, trend: "+8%" },
                { cat: "Operações", exec: 97, trend: "-3%" },
                { cat: "Manutenção", exec: 234, trend: "+15%" },
              ].map((item) => (
                <div key={item.cat} className="flex items-center justify-between">
                  <p className="font-medium">{item.cat}</p>
                  <div className="text-right">
                    <p className="font-bold">{item.exec}</p>
                    <p className={`text-sm ${item.trend.startsWith("+") ? "text-success" : "text-destructive"}`}>
                      {item.trend}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Métricas de Performance</CardTitle>
              <CardDescription>Indicadores chave dos workflows</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-3xl font-bold text-primary">98.5%</p>
                  <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-3xl font-bold text-success">1.2h</p>
                  <p className="text-sm text-muted-foreground">Tempo Médio</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-3xl font-bold text-primary">847</p>
                  <p className="text-sm text-muted-foreground">Execuções/Mês</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-3xl font-bold text-yellow-500">23h</p>
                  <p className="text-sm text-muted-foreground">Economia/Semana</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </>
  );
};
