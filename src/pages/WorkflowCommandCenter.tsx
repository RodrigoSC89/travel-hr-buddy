/**
 * PATCH UNIFY-12.0 - Workflow Command Center
 * Centro Unificado de Workflows - Fusão de 4 módulos
 * Refactored: Orchestrator pattern (~200 lines from 876)
 */

import React, { useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useWorkflows } from "@/hooks/useWorkflows";
import { useWorkflowAI, workflowTemplates } from "@/hooks/useWorkflowAI";
import {
  RefreshCw, Workflow, GitBranch, Lightbulb, Zap, Play,
  CheckCircle2, TrendingUp, BarChart3, Plus, Layers, Sparkles, Target
} from "lucide-react";

import { getVisualWorkflows } from "./workflow/types";
import type { VisualWorkflow } from "./workflow/types";
import { WorkflowTabs } from "./workflow/WorkflowTabs";
import { NewWorkflowDialog, WorkflowDetailsDialog, VisualWorkflowDialog } from "./workflow/WorkflowDialogs";

export default function WorkflowCommandCenter() {
  const { toast } = useToast();
  const {
    workflows, automationRules, isLoading,
    createWorkflow, updateWorkflow, deleteWorkflow,
    startWorkflow, pauseWorkflow, toggleAutomationRule,
    createAutomationRule, exportWorkflows, refetch,
  } = useWorkflows();

  const { isAnalyzing, generateWorkflowFromDescription } = useWorkflowAI();

  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [showNewWorkflow, setShowNewWorkflow] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<typeof workflows[number] | null>(null);
  const [newWorkflowData, setNewWorkflowData] = useState({ name: "", description: "", category: "custom", priority: "medium" });

  const visualWorkflows = getVisualWorkflows(workflows as unknown as Parameters<typeof getVisualWorkflows>[0]);
  const [selectedVisualWorkflow, setSelectedVisualWorkflow] = useState<VisualWorkflow | null>(null);

  const filteredWorkflows = workflows.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (w.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === "all" || w.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || w.category === categoryFilter;
    const matchesPriority = priorityFilter === "all" || w.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  const handleClearFilters = useCallback(() => {
    setSearchTerm(""); setStatusFilter("all"); setCategoryFilter("all"); setPriorityFilter("all");
  }, []);

  const handleNewWorkflow = async () => {
    if (!newWorkflowData.name) {
      toast({ title: "Erro", description: "Nome é obrigatório", variant: "destructive" });
      return;
    }
    await createWorkflow({
      name: newWorkflowData.name, description: newWorkflowData.description,
      category: newWorkflowData.category as "custom" | "compliance" | "finance" | "hr" | "maintenance" | "marketing" | "operations",
      priority: newWorkflowData.priority as "low" | "medium" | "high" | "urgent",
      status: "draft", steps: [],
    });
    setShowNewWorkflow(false);
    setNewWorkflowData({ name: "", description: "", category: "custom", priority: "medium" });
  };

  const handleUseTemplate = async (template: typeof workflowTemplates[0]) => {
    await createWorkflow({
      name: template.name, description: template.description,
      category: template.category as "custom" | "compliance" | "finance" | "hr" | "maintenance" | "marketing" | "operations",
      priority: "medium", status: "draft", steps: template.steps,
      estimated_duration: template.estimated_duration, tags: template.tags,
    });
    toast({ title: "Template aplicado", description: `Workflow "${template.name}" criado` });
  };

  const stats = {
    totalWorkflows: workflows.length,
    activeWorkflows: workflows.filter((w) => w.status === "active").length,
    completedToday: workflows.filter((w) => w.status === "completed").length,
    automationRulesActive: automationRules.filter((r) => r.is_active).length,
    totalExecutions: visualWorkflows.reduce((acc: number, w) => acc + w.executions, 0),
    efficiencyScore: 87
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Workflow Command Center | Nauti One</title>
        <meta name="description" content="Centro unificado de gestão e automação de workflows com IA" />
      </Helmet>

      <div className="space-y-6 p-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Workflow className="h-8 w-8 text-primary" />
              Workflow Command Center
            </h1>
            <p className="text-muted-foreground mt-1">Gestão unificada de workflows, automações e sugestões de IA</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={refetch}><RefreshCw className="h-4 w-4 mr-2" />Atualizar</Button>
            <Button variant="outline" onClick={exportWorkflows}><BarChart3 className="h-4 w-4 mr-2" />Exportar</Button>
            <Button onClick={() => setShowNewWorkflow(true)}><Plus className="h-4 w-4 mr-2" />Novo Workflow</Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { icon: Layers, color: "text-primary", value: stats.totalWorkflows, label: "Total Workflows" },
            { icon: Play, color: "text-success", value: stats.activeWorkflows, label: "Em Execução" },
            { icon: CheckCircle2, color: "text-primary", value: stats.completedToday, label: "Concluídos Hoje" },
            { icon: Zap, color: "text-warning", value: stats.automationRulesActive, label: "Automações Ativas" },
            { icon: Target, color: "text-accent-foreground", value: stats.totalExecutions, label: "Execuções Total" },
            { icon: TrendingUp, color: "text-success", value: `${stats.efficiencyScore}%`, label: "Eficiência" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                  <div>
                    <p className={`text-2xl font-bold ${s.color === "text-success" ? "text-success" : ""}`}>{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-muted/50 flex-wrap h-auto p-1">
            <TabsTrigger value="overview" className="gap-2"><BarChart3 className="h-4 w-4" />Visão Geral</TabsTrigger>
            <TabsTrigger value="workflows" className="gap-2"><Workflow className="h-4 w-4" />Workflows</TabsTrigger>
            <TabsTrigger value="visual" className="gap-2"><GitBranch className="h-4 w-4" />Visual Builder</TabsTrigger>
            <TabsTrigger value="automation" className="gap-2"><Zap className="h-4 w-4" />Automações</TabsTrigger>
            <TabsTrigger value="suggestions" className="gap-2"><Lightbulb className="h-4 w-4" />Sugestões IA</TabsTrigger>
            <TabsTrigger value="templates" className="gap-2"><Sparkles className="h-4 w-4" />Templates</TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2"><TrendingUp className="h-4 w-4" />Analytics</TabsTrigger>
          </TabsList>

          <WorkflowTabs
            visualWorkflows={visualWorkflows}
            workflows={workflows}
            automationRules={automationRules}
            filteredWorkflows={filteredWorkflows}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            categoryFilter={categoryFilter}
            priorityFilter={priorityFilter}
            onSearchChange={setSearchTerm}
            onStatusChange={setStatusFilter}
            onCategoryChange={setCategoryFilter}
            onPriorityChange={setPriorityFilter}
            onClearFilters={handleClearFilters}
            onStartWorkflow={startWorkflow}
            onPauseWorkflow={pauseWorkflow}
            onDetailsWorkflow={(w) => { setSelectedWorkflow(w); setShowDetails(true); }}
            onEditWorkflow={(w) => { setSelectedWorkflow(w); setShowNewWorkflow(true); }}
            onDuplicateWorkflow={(w) => createWorkflow({ ...w, name: `${w.name} (Cópia)`, status: "draft" })}
            onDeleteWorkflow={deleteWorkflow}
            onToggleAutomationRule={toggleAutomationRule}
            onUseTemplate={handleUseTemplate}
            onSelectVisualWorkflow={setSelectedVisualWorkflow}
            onShowNewWorkflow={() => setShowNewWorkflow(true)}
            createWorkflow={createWorkflow}
          />
        </Tabs>

        <NewWorkflowDialog
          open={showNewWorkflow}
          onOpenChange={setShowNewWorkflow}
          data={newWorkflowData}
          onChange={setNewWorkflowData}
          onCreate={handleNewWorkflow}
        />
        <WorkflowDetailsDialog
          open={showDetails}
          onOpenChange={setShowDetails}
          workflow={selectedWorkflow}
        />
        <VisualWorkflowDialog
          workflow={selectedVisualWorkflow}
          onClose={() => setSelectedVisualWorkflow(null)}
        />
      </div>
    </>
  );
}
