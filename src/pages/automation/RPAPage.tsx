import { useState, useMemo, useCallback } from "react";;
import React, { useState } from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Bot,
  Play,
  Pause,
  Settings,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Activity,
  Cpu,
  Zap,
  RefreshCw,
  Target,
  BarChart3,
} from "lucide-react";

const bots = [
  {
    id: 1,
    name: "Bot Processamento de Documentos",
    description: "Extrai e valida dados de documentos automaticamente",
    status: "running",
    tasksToday: 145,
    successRate: 99.2,
    lastActivity: "Executando agora",
    cpu: 23,
    memory: 45,
    type: "Extração",
  },
  {
    id: 2,
    name: "Bot Envio de Relatórios",
    description: "Gera e distribui relatórios automaticamente",
    status: "running",
    tasksToday: 87,
    successRate: 100,
    lastActivity: "há 3 min",
    cpu: 8,
    memory: 22,
    type: "Distribuição",
  },
  {
    id: 3,
    name: "Bot Validação de Dados",
    description: "Verifica consistência de dados em sistemas",
    status: "running",
    tasksToday: 234,
    successRate: 98.7,
    lastActivity: "há 1 min",
    cpu: 15,
    memory: 38,
    type: "Validação",
  },
  {
    id: 4,
    name: "Bot Sincronização ERP",
    description: "Sincroniza dados entre sistemas ERP",
    status: "paused",
    tasksToday: 0,
    successRate: 97.5,
    lastActivity: "há 2h",
    cpu: 0,
    memory: 5,
    type: "Integração",
  },
  {
    id: 5,
    name: "Bot Notificações",
    description: "Envia notificações baseadas em eventos",
    status: "running",
    tasksToday: 412,
    successRate: 99.8,
    lastActivity: "há 30s",
    cpu: 5,
    memory: 12,
    type: "Comunicação",
  },
  {
    id: 6,
    name: "Bot Backup Incremental",
    description: "Realiza backup automático de dados críticos",
    status: "scheduled",
    tasksToday: 24,
    successRate: 100,
    lastActivity: "Agendado 02:00",
    cpu: 0,
    memory: 8,
    type: "Backup",
  },
];

const kpis = [
  { title: "Bots Ativos", value: "12", icon: Bot, color: "text-red-500" },
  { title: "Tarefas Hoje", value: "345", icon: Target, color: "text-blue-500" },
  { title: "Taxa de Sucesso", value: "99.1%", icon: CheckCircle2, color: "text-green-500" },
  { title: "Economia Mensal", value: "R$ 45K", icon: Zap, color: "text-amber-500" },
];

export default function RPAPage() {
  const [botStates, setBotStates] = useState<Record<number, boolean>>(
    bots.reduce((acc, b) => ({ ...acc, [b.id]: b.status === "running" }), {})
  );

  const toggleBot = (id: number) => {
    setBotStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (isActive && status !== "scheduled") {
      return <Badge className="bg-green-100 text-green-700">Executando</Badge>;
    }
    if (status === "scheduled") {
      return <Badge className="bg-blue-100 text-blue-700">Agendado</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-700">Pausado</Badge>;
  };

  return (
    <ModulePageWrapper gradient="orange">
      <ModuleHeader
        icon={Bot}
        title="RPA - Automação Robótica"
        description="Bots inteligentes para automatização de tarefas repetitivas"
        gradient="red"
        badges={[
          { icon: Bot, label: "12 Bots Ativos" },
          { icon: Target, label: "345 Tarefas/Dia" },
          { icon: Activity, label: "Monitoramento 24/7" },
        ]}
      />

      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                    <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-muted ${kpi.color}`}>
                    <kpi.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Resource Monitor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Monitor de Recursos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">CPU Total</span>
                  <span className="text-sm font-bold">51%</span>
                </div>
                <Progress value={51} className="h-3" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Memória</span>
                  <span className="text-sm font-bold">38%</span>
                </div>
                <Progress value={38} className="h-3" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Rede</span>
                  <span className="text-sm font-bold">12 Mbps</span>
                </div>
                <Progress value={24} className="h-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bots List */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Bots Configurados</h2>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Bot
          </Button>
        </div>

        <div className="grid gap-4">
          {bots.map((bot) => (
            <Card key={bot.id} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        botStates[bot.id]
                          ? "bg-red-100 dark:bg-red-950"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      <Bot
                        className={`h-6 w-6 ${botStates[bot.id] ? "text-red-500" : "text-gray-400"}`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{bot.name}</h3>
                        {getStatusBadge(bot.status, botStates[bot.id])}
                        <Badge variant="outline">{bot.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{bot.description}</p>
                      <div className="flex items-center gap-6 mt-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span>{bot.tasksToday} tarefas hoje</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>{bot.successRate}% sucesso</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{bot.lastActivity}</span>
                        </div>
                      </div>
                      {botStates[bot.id] && (
                        <div className="flex items-center gap-6 mt-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Cpu className="h-4 w-4 text-blue-500" />
                            <span>CPU: {bot.cpu}%</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Activity className="h-4 w-4 text-purple-500" />
                            <span>RAM: {bot.memory}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={botStates[bot.id]}
                      onCheckedChange={() => toggleBot(bot.id}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ModulePageWrapper>
  );
}
