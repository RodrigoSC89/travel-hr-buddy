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
  Calendar, Zap, Brain, Settings, MoreVertical, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

const dynamicFrom = supabase.from as Function;

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Ativo', color: 'bg-success/20 text-success border-success/30' },
  paused: { label: 'Pausado', color: 'bg-warning/20 text-warning border-warning/30' },
  completed: { label: 'Concluído', color: 'bg-primary/20 text-primary border-primary/30' },
  draft: { label: 'Rascunho', color: 'bg-muted text-muted-foreground border-border' }
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Baixa', color: 'text-muted-foreground' },
  medium: { label: 'Média', color: 'text-warning' },
  high: { label: 'Alta', color: 'text-warning' },
  critical: { label: 'Crítica', color: 'text-destructive' }
};

const typeConfig: Record<string, { label: string; icon: React.ElementType }> = {
  audit: { label: 'Auditoria', icon: FileText },
  certification: { label: 'Certificação', icon: CheckCircle2 },
  training: { label: 'Treinamento', icon: Users },
  incident: { label: 'Incidente', icon: AlertTriangle },
  documentation: { label: 'Documentação', icon: FileText }
};

export default function ComplianceWorkflows() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ["compliance-workflows"],
    queryFn: async () => {
      const { data, error } = await dynamicFrom("compliance_workflows")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      return (data || []).map((w: any): Workflow => ({
        id: w.id,
        name: w.name || "Workflow",
        description: w.description || "",
        status: w.status || "draft",
        type: w.type || "audit",
        progress: w.progress || 0,
        currentStep: w.current_step || 0,
        totalSteps: w.total_steps || 1,
        assignees: w.assignees || [],
        dueDate: w.due_date?.slice(0, 10) || "",
        priority: w.priority || "medium",
        automationLevel: w.automation_level || 0,
      }));
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: string }) => {
      const { error } = await dynamicFrom("compliance_workflows")
        .update({ status: newStatus })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-workflows"] });
    },
  });

  const createWorkflowMutation = useMutation({
    mutationFn: async () => {
      const { error } = await dynamicFrom("compliance_workflows").insert({
        name: "Novo Workflow de Compliance",
        description: "Workflow criado automaticamente",
        status: "draft",
        type: "audit",
        total_steps: 5,
        priority: "medium",
        automation_level: 50,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-workflows"] });
      toast.success("Workflow criado com sucesso");
    },
  });

  const filteredWorkflows = workflows.filter((w: Workflow) => {
    const matchesSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && w.status === activeTab;
  });

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    toggleStatusMutation.mutate({ id, newStatus });
    toast.success(`Workflow ${newStatus === 'active' ? 'ativado' : 'pausado'}`);
  };

  const stats = {
    active: workflows.filter((w: Workflow) => w.status === 'active').length,
    completed: workflows.filter((w: Workflow) => w.status === 'completed').length,
    avgAutomation: workflows.length > 0 ? Math.round(workflows.reduce((a: number, w: Workflow) => a + w.automationLevel, 0) / workflows.length) : 0,
    critical: workflows.filter((w: Workflow) => w.priority === 'critical' && w.status !== 'completed').length
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

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
            {workflows.length} workflows — Supabase integrado
          </p>
        </div>
        <Button className="gap-2" onClick={() => createWorkflowMutation.mutate()}>
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
              <Play className="h-8 w-8 text-success" />
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
              <CheckCircle2 className="h-8 w-8 text-primary" />
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
              <Zap className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticos Pendentes</p>
                <p className="text-2xl font-bold text-destructive">{stats.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar workflows..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Todos ({workflows.length})</TabsTrigger>
          <TabsTrigger value="active">Ativos ({stats.active})</TabsTrigger>
          <TabsTrigger value="paused">Pausados</TabsTrigger>
          <TabsTrigger value="completed">Concluídos</TabsTrigger>
          <TabsTrigger value="draft">Rascunhos</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 space-y-3">
          {filteredWorkflows.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum workflow encontrado.</p>
            </CardContent></Card>
          ) : filteredWorkflows.map((workflow: Workflow) => {
            const stCfg = statusConfig[workflow.status] || statusConfig.draft;
            const prCfg = priorityConfig[workflow.priority] || priorityConfig.medium;
            const tpCfg = typeConfig[workflow.type] || typeConfig.audit;
            const TypeIcon = tpCfg.icon;

            return (
              <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <TypeIcon className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold">{workflow.name}</h3>
                        <Badge variant="outline" className={stCfg.color}>{stCfg.label}</Badge>
                        <Badge variant="outline" className={prCfg.color}>{prCfg.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{workflow.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {workflow.dueDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{workflow.dueDate}</span>}
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{workflow.assignees.length} responsáveis</span>
                        <span className="flex items-center gap-1"><Zap className="h-3 w-3" />{workflow.automationLevel}% automação</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progresso</span>
                          <span>{workflow.currentStep}/{workflow.totalSteps} etapas ({workflow.progress}%)</span>
                        </div>
                        <Progress value={workflow.progress} className="h-1.5" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {workflow.status !== 'completed' && (
                        <Button size="sm" variant="outline" onClick={() => handleToggleStatus(workflow.id, workflow.status)} className="gap-1">
                          {workflow.status === 'active' ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                          {workflow.status === 'active' ? 'Pausar' : 'Ativar'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
