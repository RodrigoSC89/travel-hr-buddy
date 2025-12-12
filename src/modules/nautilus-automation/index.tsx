/**
import { useState, useMemo, useCallback } from "react";;
 * Nautilus Automation - Módulo Unificado de Automação
 * PATCH UNIFY-2.0 - Fusão dos módulos de automação
 * 
 * Módulos fundidos:
 * - automation-hub → Nautilus Automation
 * - smart-automation → Nautilus Automation
 * - smart-workflow → Nautilus Automation
 * - workflow-visual → Nautilus Automation
 * - workflow-suggestions → Nautilus Automation
 * - automation/workflows → Nautilus Automation
 * - automation/rpa → Nautilus Automation
 * - automation/triggers → Nautilus Automation
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Workflow, 
  Zap, 
  Bot, 
  Play, 
  Pause, 
  Plus,
  Settings,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  GitBranch,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Trash2
} from "lucide-react";
import { useNautilusEnhancementAI } from "@/hooks/useNautilusEnhancementAI";
import { toast } from "sonner";

interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: string;
  actions: string[];
  status: "active" | "paused" | "error";
  lastRun: Date | null;
  runCount: number;
  successRate: number;
}

interface RPABot {
  id: string;
  name: string;
  description: string;
  schedule: string;
  status: "running" | "idle" | "error";
  taskType: string;
  lastActivity: Date;
}

interface IntelligentTrigger {
  id: string;
  name: string;
  condition: string;
  action: string;
  isActive: boolean;
  triggerCount: number;
}

const NautilusAutomation: React.FC = () => {
  const [activeTab, setActiveTab] = useState("workflows");
  const { analyzeAudit, isLoading } = useNautilusEnhancementAI();

  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([
    {
      id: "1",
      name: "Checklist Diário Automático",
      description: "Gera e distribui checklists diários baseados em sensores IoT",
      trigger: "schedule:daily:06:00",
      actions: ["Coletar dados IoT", "Gerar checklist", "Enviar para tripulação"],
      status: "active",
      lastRun: new Date(Date.now() - 3600000),
      runCount: 245,
      successRate: 98.5
    },
    {
      id: "2",
      name: "Alerta de Manutenção Preditiva",
      description: "Dispara alertas quando sensores detectam anomalias",
      trigger: "event:sensor_anomaly",
      actions: ["Analisar padrão", "Classificar urgência", "Notificar equipe"],
      status: "active",
      lastRun: new Date(Date.now() - 7200000),
      runCount: 89,
      successRate: 94.2
    },
    {
      id: "3",
      name: "Relatório Semanal ESG",
      description: "Compila dados ambientais e gera relatório ESG",
      trigger: "schedule:weekly:sunday:22:00",
      actions: ["Coletar emissões", "Calcular métricas", "Gerar PDF", "Enviar stakeholders"],
      status: "paused",
      lastRun: new Date(Date.now() - 86400000 * 3),
      runCount: 12,
      successRate: 100
    }
  ]);

  const [bots] = useState<RPABot[]>([
    {
      id: "1",
      name: "DocProcessor",
      description: "Processa e classifica documentos automaticamente",
      schedule: "Contínuo",
      status: "running",
      taskType: "Processamento OCR",
      lastActivity: new Date()
    },
    {
      id: "2",
      name: "DataSync",
      description: "Sincroniza dados entre sistemas externos",
      schedule: "A cada 15 min",
      status: "idle",
      taskType: "Sincronização",
      lastActivity: new Date(Date.now() - 900000)
    },
    {
      id: "3",
      name: "ReportGen",
      description: "Gera relatórios automáticos personalizados",
      schedule: "Sob demanda",
      status: "idle",
      taskType: "Geração de Relatórios",
      lastActivity: new Date(Date.now() - 3600000)
    }
  ]);

  const [triggers, setTriggers] = useState<IntelligentTrigger[]>([
    {
      id: "1",
      name: "Combustível Baixo",
      condition: "fuel_level < 30%",
      action: "Notificar capitão e criar ordem de abastecimento",
      isActive: true,
      triggerCount: 34
    },
    {
      id: "2",
      name: "Certificado Expirando",
      condition: "certificate_expiry < 30 days",
      action: "Alertar RH e agendar renovação",
      isActive: true,
      triggerCount: 12
    },
    {
      id: "3",
      name: "Manutenção Atrasada",
      condition: "maintenance_overdue > 7 days",
      action: "Escalar para gerência e bloquear operação",
      isActive: false,
      triggerCount: 5
    }
  ]);

  const toggleWorkflow = (id: string) => {
    setWorkflows(prev => prev.map(wf => 
      wf.id === id 
        ? { ...wf, status: wf.status === "active" ? "paused" : "active" }
        : wf
    ));
    toast.success("Status do workflow atualizado");
  };

  const toggleTrigger = (id: string) => {
    setTriggers(prev => prev.map(t => 
      t.id === id ? { ...t, isActive: !t.isActive } : t
    ));
    toast.success("Status do trigger atualizado");
  };

  const runWorkflow = async (id: string) => {
    toast.info("Executando workflow...");
    // Simulação de execução
    setTimeout(() => {
      setWorkflows(prev => prev.map(wf => 
        wf.id === id 
          ? { ...wf, lastRun: new Date(), runCount: wf.runCount + 1 }
          : wf
      ));
      toast.success("Workflow executado com sucesso");
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "active":
    case "running":
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Ativo</Badge>;
    case "paused":
    case "idle":
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pausado</Badge>;
    case "error":
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Erro</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-orange-500/20 border border-primary/30">
            <Workflow className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Nautilus Automation</h1>
            <p className="text-muted-foreground">Centro de Automação Inteligente</p>
          </div>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Workflow
        </Button>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Workflows Ativos</p>
                <p className="text-2xl font-bold text-foreground">{workflows.filter(w => w.status === "active").length}</p>
              </div>
              <Workflow className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bots RPA</p>
                <p className="text-2xl font-bold text-foreground">{bots.filter(b => b.status === "running").length} / {bots.length}</p>
              </div>
              <Bot className="h-8 w-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Triggers Ativos</p>
                <p className="text-2xl font-bold text-foreground">{triggers.filter(t => t.isActive).length}</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-foreground">97.2%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="workflows" className="gap-2">
            <GitBranch className="h-4 w-4" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="rpa" className="gap-2">
            <Bot className="h-4 w-4" />
            RPA Bots
          </TabsTrigger>
          <TabsTrigger value="triggers" className="gap-2">
            <Zap className="h-4 w-4" />
            Triggers
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <Activity className="h-4 w-4" />
            Logs
          </TabsTrigger>
        </TabsList>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-4 mt-6">
          {workflows.map((workflow) => (
            <Card key={workflow.id} className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">{workflow.name}</h3>
                      {getStatusBadge(workflow.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{workflow.description}</p>
                    
                    {/* Flow visual */}
                    <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2">
                      <Badge variant="outline" className="shrink-0">
                        <Zap className="h-3 w-3 mr-1" />
                        {workflow.trigger}
                      </Badge>
                      {workflow.actions.map((action, i) => (
                        <React.Fragment key={i}>
                          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                          <Badge variant="secondary" className="shrink-0">{action}</Badge>
                        </React.Fragment>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" />
                        {workflow.runCount} execuções
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {workflow.successRate}% sucesso
                      </span>
                      {workflow.lastRun && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Última: {workflow.lastRun.toLocaleTimeString("pt-BR")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlerunWorkflow}
                      disabled={workflow.status !== "active"}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handletoggleWorkflow}
                    >
                      {workflow.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* RPA Bots Tab */}
        <TabsContent value="rpa" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bots.map((bot) => (
              <Card key={bot.id} className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Bot className={`h-5 w-5 ${bot.status === "running" ? "text-green-400 animate-pulse" : "text-muted-foreground"}`} />
                      {bot.name}
                    </CardTitle>
                    {getStatusBadge(bot.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{bot.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tipo:</span>
                      <span className="text-foreground">{bot.taskType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Agendamento:</span>
                      <span className="text-foreground">{bot.schedule}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Última atividade:</span>
                      <span className="text-foreground">{bot.lastActivity.toLocaleTimeString("pt-BR")}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Settings className="h-4 w-4 mr-1" />
                      Configurar
                    </Button>
                    <Button size="sm" variant={bot.status === "running" ? "destructive" : "default"} className="flex-1">
                      {bot.status === "running" ? <><Pause className="h-4 w-4 mr-1" />Parar</> : <><Play className="h-4 w-4 mr-1" />Iniciar</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Triggers Tab */}
        <TabsContent value="triggers" className="space-y-4 mt-6">
          <div className="flex justify-end mb-4">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Trigger
            </Button>
          </div>

          {triggers.map((trigger) => (
            <Card key={trigger.id} className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Zap className={`h-5 w-5 ${trigger.isActive ? "text-yellow-400" : "text-muted-foreground"}`} />
                      <h3 className="font-semibold text-foreground">{trigger.name}</h3>
                      <Badge variant="outline">{trigger.triggerCount} acionamentos</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Condição: </span>
                        <code className="bg-muted px-2 py-1 rounded text-foreground">{trigger.condition}</code>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Ação: </span>
                        <span className="text-foreground">{trigger.action}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={trigger.isActive}
                      onCheckedChange={() => toggleTrigger(trigger.id)}
                    />
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="mt-6">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Log de Execuções
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { time: "14:32:05", workflow: "Checklist Diário Automático", status: "success", message: "Executado com sucesso" },
                  { time: "14:30:00", workflow: "DataSync Bot", status: "success", message: "Sincronização concluída - 234 registros" },
                  { time: "14:15:22", workflow: "Alerta de Manutenção", status: "warning", message: "Anomalia detectada no sensor #45" },
                  { time: "13:45:00", workflow: "DocProcessor Bot", status: "success", message: "12 documentos processados" },
                  { time: "13:00:01", workflow: "Trigger: Combustível Baixo", status: "triggered", message: "Nível 28% - notificação enviada" }
                ].map((log, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                    <span className="text-sm text-muted-foreground font-mono w-20">{log.time}</span>
                    {log.status === "success" && <CheckCircle className="h-4 w-4 text-green-400" />}
                    {log.status === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-400" />}
                    {log.status === "triggered" && <Zap className="h-4 w-4 text-yellow-400" />}
                    <span className="font-medium text-foreground">{log.workflow}</span>
                    <span className="text-sm text-muted-foreground flex-1">{log.message}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NautilusAutomation;
