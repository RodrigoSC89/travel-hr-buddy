import { useState } from "react";;
import React, { useState } from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Zap,
  Play,
  Settings,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Activity,
  Bell,
  Mail,
  MessageSquare,
  Database,
  Webhook,
  Calendar,
  Target,
  ArrowRight,
} from "lucide-react";

const triggers = [
  {
    id: 1,
    name: "Alerta de Manutenção Crítica",
    description: "Dispara quando sensor indica falha iminente",
    type: "event",
    status: "active",
    executions: 47,
    successRate: 100,
    lastTriggered: "há 2h",
    action: "Notificação + Ticket",
    condition: "Vibração > 5mm/s",
    icon: AlertTriangle,
    color: "text-orange-500",
  },
  {
    id: 2,
    name: "Relatório Diário Automático",
    description: "Gera e envia relatório às 06:00",
    type: "schedule",
    status: "active",
    executions: 365,
    successRate: 99.7,
    lastTriggered: "hoje 06:00",
    action: "Gerar PDF + Email",
    condition: "Diariamente 06:00",
    icon: Calendar,
    color: "text-blue-500",
  },
  {
    id: 3,
    name: "Webhook de Integração",
    description: "Recebe dados externos e processa automaticamente",
    type: "webhook",
    status: "active",
    executions: 1234,
    successRate: 98.9,
    lastTriggered: "há 5 min",
    action: "Processar + Armazenar",
    condition: "POST /api/webhook",
    icon: Webhook,
    color: "text-purple-500",
  },
  {
    id: 4,
    name: "Notificação de Vencimento",
    description: "Alerta 30 dias antes de certificados vencerem",
    type: "schedule",
    status: "active",
    executions: 89,
    successRate: 100,
    lastTriggered: "ontem",
    action: "Email + Dashboard",
    condition: "Vencimento < 30 dias",
    icon: Bell,
    color: "text-amber-500",
  },
  {
    id: 5,
    name: "Backup Automático",
    description: "Backup incremental ao detectar mudanças",
    type: "event",
    status: "active",
    executions: 456,
    successRate: 100,
    lastTriggered: "há 1h",
    action: "Backup Cloud",
    condition: "Mudanças > 100MB",
    icon: Database,
    color: "text-cyan-500",
  },
  {
    id: 6,
    name: "Alerta de Combustível",
    description: "Notifica quando nível de combustível está baixo",
    type: "event",
    status: "paused",
    executions: 23,
    successRate: 100,
    lastTriggered: "há 3 dias",
    action: "SMS + App",
    condition: "Nível < 20%",
    icon: AlertTriangle,
    color: "text-red-500",
  },
];

const kpis = [
  { title: "Triggers Ativos", value: "67", icon: Zap, color: "text-yellow-500" },
  { title: "Execuções Hoje", value: "234", icon: Play, color: "text-green-500" },
  { title: "Taxa de Precisão", value: "99.8%", icon: Target, color: "text-blue-500" },
  { title: "Tempo de Resposta", value: "<1s", icon: Clock, color: "text-purple-500" },
];

const triggerTypes = [
  { type: "event", label: "Evento", count: 28, icon: Activity },
  { type: "schedule", label: "Agendado", count: 24, icon: Calendar },
  { type: "webhook", label: "Webhook", count: 15, icon: Webhook },
];

export default function IntelligentTriggersPage() {
  const [triggerStates, setTriggerStates] = useState<Record<number, boolean>>(
    triggers.reduce((acc, t) => ({ ...acc, [t.id]: t.status === "active" }), {})
  );

  const toggleTrigger = (id: number) => {
    setTriggerStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <ModulePageWrapper gradient="orange">
      <ModuleHeader
        icon={Zap}
        title="Triggers Inteligentes"
        description="Ações automáticas baseadas em eventos, agendamentos e webhooks"
        gradient="yellow"
        badges={[
          { icon: Zap, label: "67 Triggers" },
          { icon: Target, label: "99.8% Precisão" },
          { icon: Activity, label: "Tempo Real" },
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

        {/* Trigger Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {triggerTypes.map((type, index) => (
            <Card key={index} className="hover:shadow-lg transition-all">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-muted">
                    <type.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{type.label}</h3>
                    <p className="text-2xl font-bold">{type.count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Triggers Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Triggers Configurados</h2>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Trigger
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="event">Eventos</TabsTrigger>
            <TabsTrigger value="schedule">Agendados</TabsTrigger>
            <TabsTrigger value="webhook">Webhooks</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4">
              {triggers.map((trigger) => (
                <Card key={trigger.id} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 rounded-lg ${
                            triggerStates[trigger.id]
                              ? "bg-yellow-100 dark:bg-yellow-950"
                              : "bg-gray-100 dark:bg-gray-800"
                          }`}
                        >
                          <trigger.icon
                            className={`h-6 w-6 ${
                              triggerStates[trigger.id] ? trigger.color : "text-gray-400"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{trigger.name}</h3>
                            <Badge
                              className={
                                triggerStates[trigger.id]
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }
                            >
                              {triggerStates[trigger.id] ? "Ativo" : "Pausado"}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {trigger.type === "event"
                                ? "Evento"
                                : trigger.type === "schedule"
                                  ? "Agendado"
                                  : "Webhook"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{trigger.description}</p>

                          {/* Condition & Action */}
                          <div className="flex items-center gap-2 mt-3 p-3 rounded-lg bg-muted/50">
                            <Badge variant="outline" className="font-mono text-xs">
                              {trigger.condition}
                            </Badge>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <Badge className="bg-primary/10 text-primary">{trigger.action}</Badge>
                          </div>

                          <div className="flex items-center gap-6 mt-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Play className="h-4 w-4 text-muted-foreground" />
                              <span>{trigger.executions} execuções</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span>{trigger.successRate}% sucesso</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{trigger.lastTriggered}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Switch
                          checked={triggerStates[trigger.id]}
                          onCheckedChange={() => toggleTrigger(trigger.id)}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="event">
            <div className="grid gap-4">
              {triggers
                .filter((t) => t.type === "event")
                .map((trigger) => (
                  <Card key={trigger.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <trigger.icon className={`h-5 w-5 ${trigger.color}`} />
                        <div className="flex-1">
                          <h3 className="font-semibold">{trigger.name}</h3>
                          <p className="text-sm text-muted-foreground">{trigger.condition}</p>
                        </div>
                        <Switch
                          checked={triggerStates[trigger.id]}
                          onCheckedChange={() => toggleTrigger(trigger.id)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="schedule">
            <div className="grid gap-4">
              {triggers
                .filter((t) => t.type === "schedule")
                .map((trigger) => (
                  <Card key={trigger.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <Calendar className="h-5 w-5 text-blue-500" />
                        <div className="flex-1">
                          <h3 className="font-semibold">{trigger.name}</h3>
                          <p className="text-sm text-muted-foreground">{trigger.condition}</p>
                        </div>
                        <Switch
                          checked={triggerStates[trigger.id]}
                          onCheckedChange={() => toggleTrigger(trigger.id)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="webhook">
            <div className="grid gap-4">
              {triggers
                .filter((t) => t.type === "webhook")
                .map((trigger) => (
                  <Card key={trigger.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <Webhook className="h-5 w-5 text-purple-500" />
                        <div className="flex-1">
                          <h3 className="font-semibold">{trigger.name}</h3>
                          <p className="text-sm text-muted-foreground font-mono">
                            {trigger.condition}
                          </p>
                        </div>
                        <Switch
                          checked={triggerStates[trigger.id]}
                          onCheckedChange={() => toggleTrigger(trigger.id)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ModulePageWrapper>
  );
}
