/**
 * Usage Simulation Page - PATCH 980
 * Simulate real-world usage scenarios
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, Pause, RotateCcw, CheckCircle2, XCircle, 
  Clock, Activity, Database, Wifi, WifiOff, Brain,
  Ship, Wrench, FileText, Users, Download
} from 'lucide-react';
import { toast } from 'sonner';

interface SimulationStep {
  id: string;
  action: string;
  module: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'error';
  duration: number;
  logs: string[];
}

interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  offline: boolean;
  steps: SimulationStep[];
}

const SCENARIOS: SimulationScenario[] = [
  {
    id: 'daily-ops',
    name: 'Operação Diária',
    description: 'Simula um dia típico de operações marítimas',
    offline: false,
    steps: [
      { id: '1', action: 'Login', module: 'Auth', description: 'Operador faz login no sistema', status: 'pending', duration: 500, logs: [] },
      { id: '2', action: 'Carregar Dashboard', module: 'Dashboard', description: 'Carrega KPIs e alertas do dia', status: 'pending', duration: 1200, logs: [] },
      { id: '3', action: 'Verificar Alertas', module: 'Notifications', description: 'Revisa alertas críticos pendentes', status: 'pending', duration: 800, logs: [] },
      { id: '4', action: 'Consultar Frota', module: 'Fleet', description: 'Verifica status das embarcações', status: 'pending', duration: 1000, logs: [] },
      { id: '5', action: 'Abrir OS de Manutenção', module: 'Maintenance', description: 'Cria ordem de serviço preventiva', status: 'pending', duration: 1500, logs: [] },
      { id: '6', action: 'Consultar Estoque', module: 'Inventory', description: 'Verifica peças disponíveis', status: 'pending', duration: 900, logs: [] },
      { id: '7', action: 'Perguntar à IA', module: 'AI', description: 'Solicita recomendação de manutenção', status: 'pending', duration: 2000, logs: [] },
      { id: '8', action: 'Gerar Relatório', module: 'Reports', description: 'Gera relatório diário de operações', status: 'pending', duration: 3000, logs: [] },
      { id: '9', action: 'Verificar Compliance', module: 'Compliance', description: 'Revisa status de conformidade', status: 'pending', duration: 1100, logs: [] },
      { id: '10', action: 'Logout', module: 'Auth', description: 'Encerra sessão', status: 'pending', duration: 300, logs: [] }
    ]
  },
  {
    id: 'offline-ops',
    name: 'Operação Offline (7 dias)',
    description: 'Simula operação sem internet por uma semana',
    offline: true,
    steps: [
      { id: '1', action: 'Entrar em Modo Offline', module: 'Offline', description: 'Sistema detecta perda de conexão', status: 'pending', duration: 500, logs: [] },
      { id: '2', action: 'Carregar Cache Local', module: 'Storage', description: 'Carrega dados do IndexedDB', status: 'pending', duration: 800, logs: [] },
      { id: '3', action: 'Cadastrar Tripulante', module: 'HR', description: 'Adiciona novo membro da tripulação', status: 'pending', duration: 1200, logs: [] },
      { id: '4', action: 'Registrar Manutenção', module: 'Maintenance', description: 'Cria OS corretiva emergencial', status: 'pending', duration: 1500, logs: [] },
      { id: '5', action: 'Consultar IA Offline', module: 'AI', description: 'Pergunta usando cache local', status: 'pending', duration: 300, logs: [] },
      { id: '6', action: 'Upload de Documento', module: 'Documents', description: 'Adiciona documento para sync posterior', status: 'pending', duration: 1000, logs: [] },
      { id: '7', action: 'Simular 7 Dias', module: 'Offline', description: 'Acumula operações offline', status: 'pending', duration: 2000, logs: [] },
      { id: '8', action: 'Reconectar', module: 'Sync', description: 'Detecta retorno de conexão', status: 'pending', duration: 500, logs: [] },
      { id: '9', action: 'Sincronizar Dados', module: 'Sync', description: 'Envia queue pendente ao servidor', status: 'pending', duration: 5000, logs: [] },
      { id: '10', action: 'Resolver Conflitos', module: 'Sync', description: 'Processa conflitos detectados', status: 'pending', duration: 1500, logs: [] },
      { id: '11', action: 'Validar Integridade', module: 'Sync', description: 'Verifica consistência dos dados', status: 'pending', duration: 1000, logs: [] }
    ]
  },
  {
    id: 'ai-intensive',
    name: 'Uso Intensivo de IA',
    description: 'Testa capacidades de IA em múltiplos módulos',
    offline: false,
    steps: [
      { id: '1', action: 'Solicitar Resumo Executivo', module: 'AI', description: 'Gera resumo do período', status: 'pending', duration: 2500, logs: [] },
      { id: '2', action: 'Análise Preditiva', module: 'AI', description: 'Solicita previsão de falhas', status: 'pending', duration: 3000, logs: [] },
      { id: '3', action: 'Recomendação de Treinamento', module: 'AI', description: 'Sugere treinamentos para equipe', status: 'pending', duration: 2000, logs: [] },
      { id: '4', action: 'Otimização de Rotas', module: 'AI', description: 'Calcula rotas mais eficientes', status: 'pending', duration: 2500, logs: [] },
      { id: '5', action: 'Análise de Compliance', module: 'AI', description: 'Verifica conformidade com MLC', status: 'pending', duration: 2200, logs: [] },
      { id: '6', action: 'Geração de Relatório AI', module: 'AI', description: 'Gera relatório com insights', status: 'pending', duration: 4000, logs: [] },
      { id: '7', action: 'Perguntas em Série', module: 'AI', description: 'Testa cache semântico com 10 perguntas', status: 'pending', duration: 3000, logs: [] },
      { id: '8', action: 'Verificar Cache Hit Rate', module: 'AI', description: 'Analisa eficiência do cache', status: 'pending', duration: 500, logs: [] }
    ]
  }
];

export default function UsageSimulation() {
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<SimulationStep[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [stats, setStats] = useState({ success: 0, error: 0, totalTime: 0 });
  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const runStep = async (step: SimulationStep, index: number) => {
    setSteps(prev => prev.map((s, i) => 
      i === index ? { ...s, status: 'running' } : s
    ));
    addLog(`▶ Iniciando: ${step.action} (${step.module})`);

    await new Promise(resolve => setTimeout(resolve, step.duration));

    // Simulate occasional errors (5% chance)
    const hasError = Math.random() < 0.05;
    
    const stepLogs = [
      `Executando ${step.description}`,
      `Módulo: ${step.module}`,
      `Tempo: ${step.duration}ms`,
      hasError ? '❌ Erro simulado - recuperando...' : '✓ Concluído com sucesso'
    ];

    setSteps(prev => prev.map((s, i) => 
      i === index ? { 
        ...s, 
        status: hasError ? 'error' : 'success',
        logs: stepLogs
      } : s
    ));

    addLog(hasError 
      ? `✗ Erro em ${step.action} - recuperado automaticamente`
      : `✓ ${step.action} concluído em ${step.duration}ms`
    );

    return { success: !hasError, duration: step.duration };
  };

  const startSimulation = async () => {
    if (!selectedScenario) {
      toast.error('Selecione um cenário primeiro');
      return;
    }

    setIsRunning(true);
    setIsPaused(false);
    setCurrentStepIndex(0);
    setSteps(selectedScenario.steps.map(s => ({ ...s, status: 'pending', logs: [] })));
    setLogs([]);
    setStats({ success: 0, error: 0, totalTime: 0 });

    addLog(`🚀 Iniciando simulação: ${selectedScenario.name}`);
    if (selectedScenario.offline) {
      addLog('📴 Modo offline ativado');
    }

    let successCount = 0;
    let errorCount = 0;
    let totalTime = 0;

    for (let i = 0; i < selectedScenario.steps.length; i++) {
      if (isPaused) {
        addLog('⏸ Simulação pausada');
        while (isPaused) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        addLog('▶ Simulação retomada');
      }

      setCurrentStepIndex(i);
      const result = await runStep(selectedScenario.steps[i], i);
      
      if (result.success) successCount++;
      else errorCount++;
      totalTime += result.duration;

      setStats({ success: successCount, error: errorCount, totalTime });
    }

    addLog(`✅ Simulação concluída!`);
    addLog(`📊 Resultados: ${successCount} sucessos, ${errorCount} erros, ${(totalTime / 1000).toFixed(1)}s total`);
    
    setIsRunning(false);
    toast.success('Simulação concluída!');
  };

  const pauseSimulation = () => {
    setIsPaused(!isPaused);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentStepIndex(0);
    setSteps(selectedScenario?.steps.map(s => ({ ...s, status: 'pending', logs: [] })) || []);
    setLogs([]);
    setStats({ success: 0, error: 0, totalTime: 0 });
  };

  const exportLogs = () => {
    const content = logs.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulation-logs-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Logs exportados!');
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'Fleet': return <Ship className="h-4 w-4" />;
      case 'Maintenance': return <Wrench className="h-4 w-4" />;
      case 'Reports': return <FileText className="h-4 w-4" />;
      case 'HR': return <Users className="h-4 w-4" />;
      case 'AI': return <Brain className="h-4 w-4" />;
      case 'Offline':
      case 'Sync': return <WifiOff className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const progress = steps.length > 0 
    ? ((steps.filter(s => s.status === 'success' || s.status === 'error').length) / steps.length) * 100
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Simulação de Uso</h1>
          <p className="text-muted-foreground">
            Teste cenários reais de operação do sistema
          </p>
        </div>
        <div className="flex gap-2">
          {!isRunning ? (
            <Button onClick={startSimulation} disabled={!selectedScenario}>
              <Play className="h-4 w-4 mr-2" />
              Iniciar
            </Button>
          ) : (
            <Button onClick={pauseSimulation} variant={isPaused ? 'default' : 'outline'}>
              <Pause className="h-4 w-4 mr-2" />
              {isPaused ? 'Retomar' : 'Pausar'}
            </Button>
          )}
          <Button variant="outline" onClick={resetSimulation}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reiniciar
          </Button>
          <Button variant="outline" onClick={exportLogs} disabled={logs.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Logs
          </Button>
        </div>
      </div>

      {/* Scenario Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SCENARIOS.map((scenario) => (
          <Card 
            key={scenario.id}
            className={`cursor-pointer transition-all ${
              selectedScenario?.id === scenario.id 
                ? 'ring-2 ring-primary' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => {
              if (!isRunning) {
                setSelectedScenario(scenario);
                setSteps(scenario.steps.map(s => ({ ...s, status: 'pending', logs: [] })));
              }
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {scenario.offline ? <WifiOff className="h-5 w-5" /> : <Wifi className="h-5 w-5" />}
                {scenario.name}
              </CardTitle>
              <CardDescription>{scenario.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {scenario.steps.length} etapas
                {scenario.offline && (
                  <Badge variant="secondary">Offline</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Simulation Progress */}
      {selectedScenario && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Etapas da Simulação</CardTitle>
              <CardDescription>
                <Progress value={progress} className="mt-2" />
                <span className="text-xs mt-1 block">
                  {Math.round(progress)}% concluído
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {steps.map((step, idx) => (
                    <div 
                      key={step.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        step.status === 'running' ? 'bg-info/10 border-info' :
                        step.status === 'success' ? 'bg-success/10 border-success/30' :
                        step.status === 'error' ? 'bg-destructive/10 border-destructive/30' :
                        idx === currentStepIndex && isRunning ? 'border-primary' : ''
                      }`}
                    >
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        step.status === 'running' ? 'bg-info animate-pulse' :
                        step.status === 'success' ? 'bg-success' :
                        step.status === 'error' ? 'bg-destructive' :
                        'bg-muted'
                      }`}>
                        {step.status === 'success' ? (
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        ) : step.status === 'error' ? (
                          <XCircle className="h-4 w-4 text-white" />
                        ) : step.status === 'running' ? (
                          <Activity className="h-4 w-4 text-white animate-spin" />
                        ) : (
                          <span className="text-xs text-muted-foreground">{idx + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {getModuleIcon(step.module)}
                          <span className="font-medium">{step.action}</span>
                          <Badge variant="outline" className="text-xs">{step.module}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{step.duration}ms</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Logs de Execução</CardTitle>
              <CardDescription>
                <div className="flex gap-4 mt-2">
                  <span className="text-success">✓ {stats.success} sucesso</span>
                  <span className="text-destructive">✗ {stats.error} erros</span>
                  <span className="text-muted-foreground">
                    ⏱ {(stats.totalTime / 1000).toFixed(1)}s
                  </span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] bg-black/90 rounded-lg p-4 font-mono text-xs">
                <div className="space-y-1 text-success">
                  {logs.map((log, logIdx) => (
                    <div key={`log-${logIdx}-${log.substring(0, 20)}`} className={
                      log.includes('✗') || log.includes('Erro') ? 'text-destructive' :
                      log.includes('✓') || log.includes('sucesso') ? 'text-success' :
                      log.includes('▶') || log.includes('🚀') ? 'text-info' :
                      'text-muted-foreground'
                    }>
                      {log}
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
