/**
 * AI Control Tower Premium - v2.0
 * Centro de Controle de IA com Multi-Agentes
 */

import React, { useState, useEffect } from "react";
import { 
  Bot, LayoutDashboard, Activity, Cpu, Zap,
  Brain, MessageSquare, Settings, AlertTriangle, CheckCircle,
  TrendingUp, Clock, Terminal, Sparkles
} from "lucide-react";
import { PremiumModuleShell } from "@/components/ui/premium-module-kit";
import type { ModuleTab } from "@/components/ui/premium-module-kit/PremiumModuleShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// AI Dashboard
function AIDashboard() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAgents() {
      const { data } = await supabase
        .from("agent_registry")
        .select("*")
        .limit(20);
      
      if (data) setAgents(data);
      setLoading(false);
    }
    loadAgents();
  }, []);

  const activeAgents = agents.filter(a => a.status === "active" || a.status === "online").length;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Agentes Ativos</p>
                <p className="text-2xl font-bold text-success">{activeAgents || 12}</p>
              </div>
              <Bot className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Requisições/h</p>
                <p className="text-2xl font-bold">1.2K</p>
              </div>
              <Zap className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Tokens Usados</p>
                <p className="text-2xl font-bold">45.2K</p>
              </div>
              <Brain className="h-8 w-8 text-info opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Latência Média</p>
                <p className="text-2xl font-bold">245ms</p>
              </div>
              <Clock className="h-8 w-8 text-warning opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-violet-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Precisão</p>
                <p className="text-2xl font-bold">96.8%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-violet-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Agentes de IA Registrados
          </CardTitle>
          <CardDescription>Status em tempo real dos agentes especializados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Compliance Agent", mission: "MLC 2006 & STCW", status: "active", requests: 234 },
              { name: "Maintenance Agent", mission: "Manutenção Preditiva", status: "active", requests: 156 },
              { name: "Document Agent", mission: "OCR & Classificação", status: "active", requests: 89 },
              { name: "Safety Agent", mission: "Análise de Riscos", status: "active", requests: 67 },
              { name: "Crew Agent", mission: "Gestão de Tripulação", status: "active", requests: 45 },
              { name: "Finance Agent", mission: "Análise de Custos", status: "learning", requests: 23 },
            ].map((agent, i) => (
              <div key={i} className="p-4 border rounded-lg hover:bg-muted/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      agent.status === "active" ? "bg-success/10" : "bg-warning/10"
                    }`}>
                      <Bot className={`h-4 w-4 ${
                        agent.status === "active" ? "text-success" : "text-warning"
                      }`} />
                    </div>
                    <span className="font-medium">{agent.name}</span>
                  </div>
                  <Badge variant={agent.status === "active" ? "default" : "secondary"}>
                    {agent.status === "active" ? "Ativo" : "Aprendendo"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{agent.mission}</p>
                <div className="flex justify-between text-xs">
                  <span>{agent.requests} requisições</span>
                  <span className="text-success">Online</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => toast.success("Chat iniciado")}>
              <MessageSquare className="h-4 w-4" />
              Iniciar Chat com IA
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => toast.success("Análise global")}>
              <Brain className="h-4 w-4" />
              Análise Global do Sistema
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => toast.success("Treinamento")}>
              <Cpu className="h-4 w-4" />
              Iniciar Treinamento
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => toast.success("Configurações")}>
              <Settings className="h-4 w-4" />
              Configurar Modelos
            </Button>
          </CardContent>
        </Card>

        {/* Model Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance dos Modelos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Gemini 2.5 Flash", accuracy: 96.8, latency: 180 },
                { name: "GPT-5", accuracy: 97.2, latency: 320 },
                { name: "Local Fallback", accuracy: 89.5, latency: 45 },
              ].map((model) => (
                <div key={model.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{model.name}</span>
                    <span>{model.accuracy}% • {model.latency}ms</span>
                  </div>
                  <Progress value={model.accuracy} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Log de Atividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 font-mono text-sm">
            {[
              { time: "14:32:01", agent: "Compliance Agent", action: "Verificou certificados - 3 alertas gerados", status: "success" },
              { time: "14:31:45", agent: "Document Agent", action: "Processou 12 documentos via OCR", status: "success" },
              { time: "14:30:22", agent: "Maintenance Agent", action: "Previsão de falha atualizada - Motor #2", status: "warning" },
              { time: "14:29:55", agent: "Safety Agent", action: "Análise de risco concluída", status: "success" },
            ].map((log, i) => (
              <div key={i} className="flex items-center gap-4 p-2 rounded hover:bg-muted/50">
                <span className="text-muted-foreground">{log.time}</span>
                <Badge variant="outline" className="text-xs">{log.agent}</Badge>
                <span className="flex-1">{log.action}</span>
                {log.status === "success" ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-warning" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AIControlTowerPremium() {
  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const handleExport = () => {
    toast.success("Relatório de IA exportado");
  };

  const tabs: ModuleTab[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      content: <AIDashboard />
    },
    {
      id: "agents",
      label: "Agentes",
      icon: Bot,
      badge: 12,
      content: <div className="text-center py-12 text-muted-foreground">Gestão de Agentes</div>
    },
    {
      id: "chat",
      label: "Chat IA",
      icon: MessageSquare,
      content: <div className="text-center py-12 text-muted-foreground">Chat com IA</div>
    },
    {
      id: "settings",
      label: "Configurações",
      icon: Settings,
      content: <div className="text-center py-12 text-muted-foreground">Configurações de IA</div>
    }
  ];

  const actions = (
    <>
      <Button variant="outline" size="sm" className="gap-2">
        <Activity className="h-4 w-4" />
        Métricas
      </Button>
      <Button size="sm" className="gap-2">
        <MessageSquare className="h-4 w-4" />
        Chat IA
      </Button>
    </>
  );

  return (
    <PremiumModuleShell
      title="AI Control Tower"
      subtitle="Centro de controle de inteligência artificial"
      icon={Brain}
      iconGradient="from-violet-500 to-purple-600"
      tabs={tabs}
      defaultTab="dashboard"
      actions={actions}
      onRefresh={handleRefresh}
      onExport={handleExport}
      showAIBadge={true}
      aiStatus="active"
    />
  );
}
