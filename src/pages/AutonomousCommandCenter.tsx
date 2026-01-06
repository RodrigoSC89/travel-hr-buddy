/**
 * Autonomous Command Center
 * Main dashboard for Nautilus One Autonomous Platform v4.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play, Pause, Square, Cpu, Activity, Ship,
  Users, Fuel, Shield, Brain, AlertTriangle, CheckCircle,
  Clock, Zap, TrendingUp, Eye, Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { useAutonomousPlatform } from '@/hooks/useAutonomousPlatform';
import { SensorFusionDashboard } from '@/components/autonomous/SensorFusionDashboard';
import { VesselDigitalTwin3D } from '@/components/autonomous/VesselDigitalTwin3D';
import { cn } from '@/lib/utils';

export default function AutonomousCommandCenter() {
  const {
    status,
    isRunning,
    isPaused,
    vesselState,
    agents,
    decisions,
    pendingDecisions,
    anomalies,
    config,
    initialize,
    start,
    pause,
    resume,
    stop,
    approveDecision,
    rejectDecision,
    updateConfig
  } = useAutonomousPlatform();

  const [activeTab, setActiveTab] = useState('overview');

  // Initialize on mount
  useEffect(() => {
    initialize('vessel-001', 'MV Nautilus One');
  }, [initialize]);

  const formatUptime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const getStatusColor = (engineStatus: string) => {
    switch (engineStatus) {
      case 'running': return 'text-green-500 bg-green-500/10';
      case 'paused': return 'text-yellow-500 bg-yellow-500/10';
      case 'stopped': return 'text-red-500 bg-red-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getAgentStatusColor = (agentStatus: string) => {
    switch (agentStatus) {
      case 'active': return 'bg-green-500';
      case 'processing': return 'bg-blue-500 animate-pulse';
      case 'idle': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
            <Cpu className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              Autonomous Command Center
              <Badge variant="outline" className="ml-2">v4.0</Badge>
            </h1>
            <p className="text-muted-foreground">
              NAUTILUS ONE - Plataforma Autônoma Multi-Agente
            </p>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-2">
          <Badge className={cn('px-3 py-1', getStatusColor(status.engineStatus))}>
            {status.engineStatus === 'running' && <Activity className="h-3 w-3 mr-1 animate-pulse" />}
            {status.engineStatus.toUpperCase()}
          </Badge>
          
          {!isRunning && status.engineStatus === 'stopped' && (
            <Button onClick={start} className="gap-2">
              <Play className="h-4 w-4" />
              Iniciar
            </Button>
          )}
          
          {isRunning && (
            <Button onClick={pause} variant="outline" className="gap-2">
              <Pause className="h-4 w-4" />
              Pausar
            </Button>
          )}
          
          {isPaused && (
            <Button onClick={resume} className="gap-2">
              <Play className="h-4 w-4" />
              Retomar
            </Button>
          )}
          
          {(isRunning || isPaused) && (
            <Button onClick={stop} variant="destructive" className="gap-2">
              <Square className="h-4 w-4" />
              Parar
            </Button>
          )}
        </div>
      </motion.div>

      {/* Status Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Uptime
          </div>
          <p className="text-lg font-bold">{formatUptime(status.uptime)}</p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="h-4 w-4" />
            Ticks
          </div>
          <p className="text-lg font-bold">{status.tickCount.toLocaleString()}</p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Brain className="h-4 w-4" />
            Decisões
          </div>
          <p className="text-lg font-bold">{status.decisionsThisSession}</p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            Anomalias
          </div>
          <p className="text-lg font-bold">{anomalies.length}</p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            Tempo Médio
          </div>
          <p className="text-lg font-bold">{status.averageDecisionTime.toFixed(0)}ms</p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            Pendentes
          </div>
          <p className="text-lg font-bold">{pendingDecisions.length}</p>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full max-w-3xl">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="agents">Agentes IA</TabsTrigger>
          <TabsTrigger value="twin">Digital Twin</TabsTrigger>
          <TabsTrigger value="sensors">Sensores</TabsTrigger>
          <TabsTrigger value="decisions">Decisões</TabsTrigger>
          <TabsTrigger value="config">Config</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Vessel Status */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5" />
                  Status do Navio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {vesselState ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Posição</p>
                        <p className="font-medium">
                          {vesselState.position.lat.toFixed(4)}°, {vesselState.position.lng.toFixed(4)}°
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Velocidade</p>
                        <p className="font-medium">{vesselState.speed.toFixed(1)} nós</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Rumo</p>
                        <p className="font-medium">{vesselState.heading.toFixed(0)}°</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Combustível</p>
                        <p className="font-medium">
                          {((vesselState.fuelOnBoard / vesselState.initialFuel) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Fuel className="h-4 w-4" />
                          Bunker
                        </span>
                        <span>{vesselState.fuelOnBoard.toLocaleString()} L</span>
                      </div>
                      <Progress 
                        value={(vesselState.fuelOnBoard / vesselState.initialFuel) * 100} 
                        className="h-2"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Compliance
                        </span>
                        <span>{vesselState.compliance.overallScore}%</span>
                      </div>
                      <Progress 
                        value={vesselState.compliance.overallScore} 
                        className="h-2"
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Ship className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Aguardando inicialização...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Agents Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Agentes Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {agents.map((agent) => (
                      <div key={agent.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                        <div className={cn('h-3 w-3 rounded-full', getAgentStatusColor(agent.status))} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{agent.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{agent.role}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          L{agent.autonomyLevel}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Recent Anomalies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Anomalias Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {anomalies.length > 0 ? (
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {anomalies.slice(0, 10).map((anomaly) => (
                      <div 
                        key={anomaly.id} 
                        className={cn(
                          'p-3 rounded-lg border',
                          anomaly.severity === 'critical' ? 'border-red-500/50 bg-red-500/10' : 'border-yellow-500/50 bg-yellow-500/10'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{anomaly.source}</span>
                          <Badge variant={anomaly.severity === 'critical' ? 'destructive' : 'secondary'}>
                            {anomaly.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{anomaly.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <CheckCircle className="h-3 w-3 inline mr-1" />
                          {anomaly.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>Nenhuma anomalia detectada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {agents.map((agent) => (
              <Card key={agent.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className={cn('h-3 w-3 rounded-full', getAgentStatusColor(agent.status))} />
                    <Badge variant="outline">Level {agent.autonomyLevel}</Badge>
                  </div>
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                  <CardDescription>{agent.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Modelo</span>
                      <span className="font-medium">{agent.primaryModel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Decisões</span>
                      <span className="font-medium">{agent.decisionsCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxa de Sucesso</span>
                      <span className="font-medium">{agent.successRate}%</span>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {agent.capabilities.slice(0, 3).map((cap) => (
                      <Badge key={cap} variant="secondary" className="text-xs">
                        {cap}
                      </Badge>
                    ))}
                    {agent.capabilities.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{agent.capabilities.length - 3}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Digital Twin Tab */}
        <TabsContent value="twin" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* 3D Visualization */}
            <VesselDigitalTwin3D vesselState={vesselState} />

            {/* Equipment & Crew Status */}
            <div className="space-y-6">
              {/* Equipment Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Equipamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-3">
                      {vesselState?.equipment.map((eq) => (
                        <div key={eq.id} className="p-3 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{eq.name}</span>
                            <Badge variant={
                              eq.status === 'operational' ? 'default' :
                              eq.status === 'degraded' ? 'secondary' : 'destructive'
                            }>
                              {eq.status}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Saúde</span>
                              <span>{eq.health.toFixed(1)}%</span>
                            </div>
                            <Progress value={eq.health} className="h-1.5" />
                          </div>
                          {eq.temperature && (
                            <div className="flex justify-between text-sm mt-2">
                              <span className="text-muted-foreground">Temperatura</span>
                              <span>{eq.temperature.toFixed(1)}°C</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Crew Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Tripulação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-3">
                      {vesselState?.crew.map((crew) => (
                        <div key={crew.id} className="p-3 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium">{crew.name}</p>
                              <p className="text-sm text-muted-foreground">{crew.rank}</p>
                            </div>
                            <Badge variant={
                              crew.status === 'on-duty' ? 'default' :
                              crew.status === 'off-duty' ? 'secondary' : 'outline'
                            }>
                              {crew.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>
                              <p className="text-xs text-muted-foreground">Fadiga</p>
                              <Progress value={crew.fatigue} className="h-1.5 mt-1" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Stress</p>
                              <Progress value={crew.stress} className="h-1.5 mt-1" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Sensors Tab */}
        <TabsContent value="sensors" className="space-y-6">
          <SensorFusionDashboard />
        </TabsContent>

        {/* Decisions Tab */}
        <TabsContent value="decisions" className="space-y-6">
          {/* Pending Decisions */}
          {pendingDecisions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-500">
                  <AlertTriangle className="h-5 w-5" />
                  Decisões Pendentes de Aprovação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingDecisions.map((decision) => (
                    <div key={decision.id} className="p-4 rounded-lg border border-yellow-500/50 bg-yellow-500/10">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{decision.recommendation}</p>
                          <p className="text-sm text-muted-foreground mt-1">{decision.reasoning}</p>
                        </div>
                        <Badge>{decision.type}</Badge>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button 
                          size="sm" 
                          onClick={() => approveDecision(decision.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => rejectDecision(decision.id, 'Rejeitado pelo operador')}
                        >
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Decision History */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Decisões</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {decisions.map((decision) => (
                    <div key={decision.id} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{decision.type}</Badge>
                        <Badge variant={
                          decision.status === 'executed' ? 'default' :
                          decision.status === 'approved' ? 'secondary' :
                          decision.status === 'rejected' ? 'destructive' : 'outline'
                        }>
                          {decision.status}
                        </Badge>
                      </div>
                      <p className="font-medium">{decision.recommendation}</p>
                      <p className="text-sm text-muted-foreground mt-1">{decision.reasoning}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Autonomia: L{decision.autonomyLevel}</span>
                        <span>{decision.perspectives.length} agentes</span>
                        <span>{new Date(decision.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Config Tab */}
        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações do Sistema Autônomo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-execução de Decisões Não-Críticas</p>
                  <p className="text-sm text-muted-foreground">
                    Permite que o sistema execute automaticamente decisões de baixo risco
                  </p>
                </div>
                <Switch
                  checked={config.autoExecuteNonCritical}
                  onCheckedChange={(checked) => updateConfig({ autoExecuteNonCritical: checked })}
                />
              </div>

              <div>
                <p className="font-medium mb-2">Nível Máximo de Autonomia</p>
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map((level) => (
                    <Button
                      key={level}
                      variant={config.maxAutonomyLevel === level ? 'default' : 'outline'}
                      onClick={() => updateConfig({ maxAutonomyLevel: level as 0 | 1 | 2 | 3 })}
                    >
                      Level {level}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  L0: Sempre pedir | L1: Sugerir | L2: Auto + Notificar | L3: Full Auto
                </p>
              </div>

              <div>
                <p className="font-medium mb-2">Intervalo do Loop (ms)</p>
                <div className="flex gap-2">
                  {[1000, 5000, 10000, 30000].map((interval) => (
                    <Button
                      key={interval}
                      variant={config.loopIntervalMs === interval ? 'default' : 'outline'}
                      onClick={() => updateConfig({ loopIntervalMs: interval })}
                    >
                      {interval / 1000}s
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
