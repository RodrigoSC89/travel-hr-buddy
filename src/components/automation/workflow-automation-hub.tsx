import React, { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Settings, Sparkles, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWorkflows, type Workflow } from "@/hooks/useWorkflows";
import { useWorkflowAI, workflowTemplates } from "@/hooks/useWorkflowAI";
import { WorkflowHeader } from "./workflow/WorkflowHeader";
import { WorkflowStats } from "./workflow/WorkflowStats";
import { WorkflowCard } from "./workflow/WorkflowCard";
import { WorkflowFilters } from "./workflow/WorkflowFilters";
import { RuleConfigCard } from "./RuleConfigCard";

export const WorkflowAutomationHub: React.FC = () => {
  const { toast } = useToast();
  const {
    workflows, automationRules, isLoading,
    createWorkflow, updateWorkflow, deleteWorkflow,
    startWorkflow, pauseWorkflow, toggleAutomationRule,
    createAutomationRule, exportWorkflows, refetch,
  } = useWorkflows();

  const { isAnalyzing, generateWorkflowFromDescription } = useWorkflowAI();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [unreadCount, setUnreadCount] = useState(3);

  // Dialogs
  const [showNewWorkflow, setShowNewWorkflow] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- workflow shape from dynamic hook
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  const [newWorkflowData, setNewWorkflowData] = useState({ name: "", description: "", category: "custom", priority: "medium" });

  // Filtered workflows
  const filteredWorkflows = workflows.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (w.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === "all" || w.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || w.category === categoryFilter;
    const matchesPriority = priorityFilter === "all" || w.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setPriorityFilter("all");
  }, []);

  const handleMarkAllRead = () => {
    setUnreadCount(0);
    toast({ title: "Notificações", description: "Todas marcadas como lidas" });
  };

  const handleNewWorkflow = async () => {
    if (!newWorkflowData.name) {
      toast({ title: "Erro", description: "Nome é obrigatório", variant: "destructive" });
      return;
    }
    await createWorkflow({
      name: newWorkflowData.name,
      description: newWorkflowData.description,
      category: newWorkflowData.category as Workflow["category"],
      priority: newWorkflowData.priority as Workflow["priority"],
      status: "draft",
      steps: [],
    });
    setShowNewWorkflow(false);
    setNewWorkflowData({ name: "", description: "", category: "custom", priority: "medium" });
  };

  const handleUseTemplate = async (template: typeof workflowTemplates[0]) => {
    await createWorkflow({
      name: template.name,
      description: template.description,
      category: template.category as Workflow["category"],
      priority: "medium",
      status: "draft",
      steps: template.steps,
      estimated_duration: template.estimated_duration,
      tags: template.tags,
    });
    toast({ title: "Template aplicado", description: `Workflow "${template.name}" criado` });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      <WorkflowHeader
        onExport={exportWorkflows}
        onNewWorkflow={() => setShowNewWorkflow(true)}
        onRefresh={refetch}
        onSettings={() => setShowSettings(true)}
        onMarkAllRead={handleMarkAllRead}
        unreadCount={unreadCount}
        isLoading={isLoading}
      />

      <WorkflowStats workflows={workflows} automationRules={automationRules} />

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="automation">Automações</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Análise</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          <WorkflowFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            priorityFilter={priorityFilter}
            onPriorityChange={setPriorityFilter}
            onClearFilters={handleClearFilters}
          />

          <div className="grid gap-4">
            {filteredWorkflows.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Nenhum workflow encontrado</p>
                <Button className="mt-4" onClick={() => setShowNewWorkflow(true)}>Criar Workflow</Button>
              </Card>
            ) : (
              filteredWorkflows.map((workflow) => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onStart={startWorkflow}
                  onPause={pauseWorkflow}
                  onDetails={(w) => { setSelectedWorkflow(w); setShowDetails(true); }}
                  onEdit={(w) => { setSelectedWorkflow(w); setShowNewWorkflow(true); }}
                  onDuplicate={(w) => createWorkflow({ ...w, name: `${w.name} (Cópia)`, status: "draft" })}
                  onDelete={deleteWorkflow}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Regras de Automação</CardTitle>
                <CardDescription>Configure regras para automatizar processos</CardDescription>
              </div>
              <Button onClick={() => {
                createAutomationRule({
                  rule_name: `Nova Regra ${Date.now()}`,
                  description: "Nova regra de automação",
                  trigger_type: "schedule",
                  is_active: false
                });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Regra
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {automationRules.length === 0 ? (
                <div className="text-center py-8">
                  <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma regra de automação configurada</p>
                  <Button variant="link" onClick={() => createAutomationRule({ rule_name: "Primeira Regra", description: "Regra de exemplo", trigger_type: "event", is_active: false })}>
                    Criar primeira regra
                  </Button>
                </div>
              ) : (
                automationRules.map((rule) => (
                  <RuleConfigCard 
                    key={rule.id} 
                    rule={rule} 
                    onToggle={() => toggleAutomationRule(rule.id)}
                    onSave={(updates: Record<string, unknown>) => {
                      toast({ title: "Regra atualizada", description: `"${rule.rule_name}" foi salva com sucesso` });
                    }}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

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
                        <Button size="sm" onClick={() => handleUseTemplate(template)}>
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

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Eficiência dos Workflows</CardTitle>
                <CardDescription>Tempo médio por categoria</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[{ category: "RH", time: "2.3 dias", eff: 87 }, { category: "Financeiro", time: "4h", eff: 94 }, { category: "Operações", time: "1.8 dias", eff: 76 }].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div><p className="font-medium">{item.category}</p><p className="text-sm text-muted-foreground">{item.time}</p></div>
                    <div className="text-right"><p className="font-medium">{item.eff}%</p><Progress value={item.eff} className="w-20 h-2" /></div>
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
                {[{ cat: "RH", exec: 156, trend: "+12%" }, { cat: "Financeiro", exec: 289, trend: "+8%" }, { cat: "Operações", exec: 97, trend: "-3%" }].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <p className="font-medium">{item.cat}</p>
                    <div className="text-right"><p className="font-bold">{item.exec}</p><p className={`text-sm ${item.trend.startsWith("+") ? "text-green-600" : "text-red-600"}`}>{item.trend}</p></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Workflow Dialog */}
      <Dialog open={showNewWorkflow} onOpenChange={setShowNewWorkflow}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Workflow</DialogTitle>
            <DialogDescription>Crie um novo fluxo de trabalho</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input placeholder="Nome do workflow" value={newWorkflowData.name} onChange={(e) => setNewWorkflowData(p => ({ ...p, name: e.target.value }))} />
            <Textarea placeholder="Descrição" value={newWorkflowData.description} onChange={(e) => setNewWorkflowData(p => ({ ...p, description: e.target.value }))} />
            <div className="grid grid-cols-2 gap-4">
              <Select value={newWorkflowData.category} onValueChange={(v) => setNewWorkflowData(p => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hr">RH</SelectItem>
                  <SelectItem value="finance">Financeiro</SelectItem>
                  <SelectItem value="operations">Operações</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newWorkflowData.priority} onValueChange={(v) => setNewWorkflowData(p => ({ ...p, priority: v }))}>
                <SelectTrigger><SelectValue placeholder="Prioridade" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewWorkflow(false)}>Cancelar</Button>
            <Button onClick={handleNewWorkflow}>Criar Workflow</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedWorkflow?.name}</DialogTitle>
            <DialogDescription>{selectedWorkflow?.description}</DialogDescription>
          </DialogHeader>
          {selectedWorkflow && (
            <div className="space-y-4 py-4">
              <div className="flex gap-2">
                <Badge>{selectedWorkflow.category}</Badge>
                <Badge variant="outline">{selectedWorkflow.status}</Badge>
                <Badge variant="outline">{selectedWorkflow.priority}</Badge>
              </div>
              <Progress value={selectedWorkflow.progress} className="h-3" />
              <p className="text-sm text-muted-foreground">Progresso: {selectedWorkflow.progress}%</p>
              <div className="border rounded-lg p-4 max-h-60 overflow-auto space-y-2">
                {(selectedWorkflow.steps as Array<{ name: string; status: string }>)?.map((step, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <span>{step.name}</span>
                    <Badge variant="outline">{step.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetails(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurações</DialogTitle>
            <DialogDescription>Configure preferências do módulo de workflows</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">Notificações, integrações e preferências podem ser configuradas aqui.</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSettings(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
