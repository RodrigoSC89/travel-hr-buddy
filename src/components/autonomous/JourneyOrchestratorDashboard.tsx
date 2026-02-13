/**
 * Journey Orchestrator Dashboard (OJAC)
 * Contextual automated journey orchestration
 * NAUTILUS ONE v4.0 - Autonomous Platform
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GitBranch, Play, Pause, X, CheckCircle, Clock,
  AlertTriangle, Zap, Users, FileText, Ship, Wrench,
  TrendingUp, Activity, Target, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useJourneyOrchestrator } from '@/hooks/useJourneyOrchestrator';
import { cn } from '@/lib/utils';

const journeyTemplates = [
  {
    event: 'crew_onboarding',
    icon: Users,
    label: 'Onboarding de Tripulação',
    description: 'Jornada completa de embarque de novo tripulante'
  },
  {
    event: 'document_renewal',
    icon: FileText,
    label: 'Renovação de Documentos',
    description: 'Fluxo automatizado de renovação de certificados'
  },
  {
    event: 'voyage_planning',
    icon: Ship,
    label: 'Planejamento de Viagem',
    description: 'Preparação completa para nova viagem'
  },
  {
    event: 'maintenance_alert',
    icon: Wrench,
    label: 'Alerta de Manutenção',
    description: 'Resposta a alertas de manutenção preventiva'
  },
  {
    event: 'compliance_check',
    icon: CheckCircle,
    label: 'Verificação de Compliance',
    description: 'Auditoria de conformidade regulatória'
  }
];

export function JourneyOrchestratorDashboard() {
  const {
    activeJourneys,
    history,
    statistics,
    triggerJourney,
    cancelJourney,
    executeTask,
    refresh
  } = useJourneyOrchestrator();

  const [isCreating, setIsCreating] = useState(false);

  const handleCreateJourney = async (eventType: string) => {
    setIsCreating(true);
    try {
      await triggerJourney(
        eventType as Parameters<typeof triggerJourney>[0],
        { 
          vesselId: 'vessel-001',
          vesselName: 'MV Nautilus One',
          timestamp: new Date()
        }
      );
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-info';
      case 'completed': return 'bg-success';
      case 'failed': return 'bg-destructive';
      case 'cancelled': return 'bg-muted';
      default: return 'bg-warning';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const getTaskIcon = (taskType: string) => {
    switch (taskType) {
      case 'notification': return Zap;
      case 'document': return FileText;
      case 'validation': return CheckCircle;
      case 'integration': return GitBranch;
      default: return Activity;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-primary" />
            Orquestrador de Jornadas (OJAC)
          </h2>
          <p className="text-muted-foreground">
            Workflows inteligentes baseados em contexto operacional
          </p>
        </div>
        <Button variant="outline" onClick={refresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <Activity className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statistics.active}</p>
                <p className="text-xs text-muted-foreground">Jornadas Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statistics.completed}</p>
                <p className="text-xs text-muted-foreground">Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(statistics.successRate * 100).toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Taxa de Sucesso</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round(statistics.averageDuration / 60000)}m</p>
                <p className="text-xs text-muted-foreground">Tempo Médio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Journey Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Iniciar Nova Jornada
            </CardTitle>
            <CardDescription>
              Selecione um template para criar uma nova jornada automatizada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {journeyTemplates.map((template) => (
                <motion.button
                  key={template.event}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-3 rounded-lg border text-left hover:bg-muted/50 transition-colors"
                  onClick={() => handleCreateJourney(template.event)}
                  disabled={isCreating}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <template.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{template.label}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {template.description}
                      </p>
                    </div>
                    <Play className="h-4 w-4 text-muted-foreground" />
                  </div>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Journeys */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Jornadas Ativas
              {activeJourneys.length > 0 && (
                <Badge variant="secondary">{activeJourneys.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeJourneys.length > 0 ? (
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {activeJourneys.map((journey) => {
                    const completedTasks = journey.tasks.filter(t => t.status === 'completed').length;
                    const progress = (completedTasks / journey.tasks.length) * 100;
                    const currentTask = journey.tasks.find(t => t.status === 'pending' || t.status === 'in_progress');

                    return (
                      <motion.div
                        key={journey.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-lg border"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{journey.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {journey.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusBadge(journey.status)}>
                              {journey.status}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => cancelJourney(journey.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>{completedTasks}/{journey.tasks.length} tarefas</span>
                            <span>{progress.toFixed(0)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>

                        {/* Task Timeline */}
                        <div className="space-y-2">
                          {journey.tasks.map((task, index) => (
                            <div
                              key={task.id}
                              className={cn(
                                "flex items-center gap-3 p-2 rounded-lg",
                                task.status === 'completed' && "bg-success/10",
                                task.status === 'in_progress' && "bg-info/10 animate-pulse",
                                task.status === 'failed' && "bg-destructive/10",
                                task.status === 'pending' && "bg-muted/30"
                              )}
                            >
                              <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center",
                                task.status === 'completed' && "bg-success text-success-foreground",
                                task.status === 'in_progress' && "bg-info text-info-foreground",
                                task.status === 'failed' && "bg-destructive text-destructive-foreground",
                                task.status === 'pending' && "bg-muted text-muted-foreground"
                              )}>
                                {task.status === 'completed' ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : task.status === 'failed' ? (
                                  <AlertTriangle className="h-4 w-4" />
                                ) : (
                                  <span className="text-xs">{index + 1}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{task.action}</p>
                                {task.status === 'in_progress' && (
                                  <p className="text-xs text-info">Em execução...</p>
                                )}
                              </div>
                              <Activity className="h-4 w-4 text-muted-foreground" />
                              {task.status === 'pending' && (
                                <Button variant="ghost" size="sm" onClick={() => executeTask(journey.id, task.id)}>
                                  <Play className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Context */}
                        {journey.context && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-muted-foreground">
                              Vessel: {journey.context.vesselName || journey.context.vesselId}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                <GitBranch className="h-16 w-16 mb-4 opacity-30" />
                <p className="text-lg font-medium">Nenhuma jornada ativa</p>
                <p className="text-sm">Selecione um template para iniciar uma nova jornada</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* History */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Histórico de Jornadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="completed">Concluídas</TabsTrigger>
                <TabsTrigger value="failed">Falhas</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {history.map((journey) => (
                      <div
                        key={journey.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            getStatusColor(journey.status)
                          )} />
                          <div>
                            <p className="font-medium text-sm">{journey.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {journey.tasks.length} tarefas • 
                              {journey.completedAt 
                                ? ` Concluída em ${new Date(journey.completedAt).toLocaleString()}`
                                : ` Iniciada em ${new Date(journey.createdAt).toLocaleString()}`
                              }
                            </p>
                          </div>
                        </div>
                        <Badge variant={getStatusBadge(journey.status)}>
                          {journey.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="completed" className="mt-4">
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {history.filter(j => j.status === 'completed').map((journey) => (
                      <div
                        key={journey.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <div>
                            <p className="font-medium text-sm">{journey.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Concluída em {new Date(journey.completedAt!).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="failed" className="mt-4">
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {history.filter(j => j.status === 'failed').map((journey) => (
                      <div
                        key={journey.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-destructive/30"
                      >
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                          <div>
                            <p className="font-medium text-sm">{journey.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Falha em {journey.completedAt ? new Date(journey.completedAt).toLocaleString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {history.filter(j => j.status === 'failed').length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhuma jornada com falha
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
