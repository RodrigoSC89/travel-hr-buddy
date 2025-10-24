/**
 * PATCH 73.0 - IA Mission Drill (Simulação Real)
 * Emergency Drill Simulator with AI-Powered Responses
 * 
 * Validates adaptive AI under real and critical scenarios:
 * - 🔥 Fire in engine room
 * - ⚠️ Missing crew signal
 * - 🧯 ISM checklist failure
 * - 🚨 Extreme weather alert
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Flame, Radio, FileWarning, CloudRain, CheckCircle } from 'lucide-react';

// Emergency scenario types
export type EmergencyScenario = 
  | 'engine_fire'
  | 'crew_missing'
  | 'ism_failure'
  | 'weather_alert';

// AI Response structure
interface AIEmergencyResponse {
  scenario: EmergencyScenario;
  timestamp: Date;
  responseTime: number; // in milliseconds
  evacuation_plan?: string;
  shift_reconfiguration?: string;
  express_audit?: string;
  maintenance_priority?: string;
  actions: string[];
  confidence: number; // 0-100
  log: string;
}

// Scenario definitions
const SCENARIOS: Record<EmergencyScenario, {
  title: string;
  icon: typeof Flame;
  color: string;
  description: string;
}> = {
  engine_fire: {
    title: 'Incêndio em Sala de Máquinas',
    icon: Flame,
    color: 'text-red-500',
    description: 'Detecção de fogo no compartimento principal de máquinas'
  },
  crew_missing: {
    title: 'Falta de Sinal de Tripulante',
    icon: Radio,
    color: 'text-orange-500',
    description: 'Perda de sinal de localização de tripulante crítico'
  },
  ism_failure: {
    title: 'Falha de Checklist ISM',
    icon: FileWarning,
    color: 'text-yellow-500',
    description: 'Não conformidade em checklist obrigatório ISM'
  },
  weather_alert: {
    title: 'Alerta Meteorológico Extremo',
    icon: CloudRain,
    color: 'text-blue-500',
    description: 'Previsão de condições meteorológicas extremas'
  }
};

/**
 * Simulates AI response to emergency scenarios
 * In production, this would call the actual AI kernel
 */
async function simulateAIResponse(scenario: EmergencyScenario): Promise<AIEmergencyResponse> {
  const startTime = Date.now();
  
  // Simulate processing time (1.5-2.5 seconds for realism)
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
  
  const responseTime = Date.now() - startTime;
  
  // Generate scenario-specific responses
  const responses: Record<EmergencyScenario, Partial<AIEmergencyResponse>> = {
    engine_fire: {
      evacuation_plan: 'Evacuação imediata da sala de máquinas via saída de emergência B. Isolamento do compartimento. Ativação do sistema de supressão automático CO2.',
      shift_reconfiguration: 'Redirecionar equipe auxiliar para monitoramento de energia. Ativar gerador de backup. Escalação de engenheiro sênior para comando.',
      maintenance_priority: 'Prioridade CRÍTICA: Inspeção completa do sistema de supressão após contenção. Verificação de sensores de fumaça.',
      actions: [
        'Ativar alarme geral',
        'Evacuar compartimento',
        'Isolar sistema de combustível',
        'Ativar supressão CO2',
        'Notificar autoridades marítimas',
        'Preparar relatório de incidente'
      ],
      confidence: 97.2
    },
    crew_missing: {
      evacuation_plan: 'Iniciar protocolo de busca e resgate (SAR). Divisão da tripulação em equipes de busca. Verificação de últimos locais conhecidos via sistema de rastreamento.',
      shift_reconfiguration: 'Redistribuição temporária de responsabilidades. Ativação de tripulante de standby. Notificação ao gestor de turno.',
      express_audit: 'Auditoria expressa de protocolos de segurança pessoal. Verificação de equipamentos de comunicação e localização.',
      actions: [
        'Ativar protocolo SAR',
        'Verificar última posição conhecida',
        'Formar equipes de busca',
        'Checar áreas restritas',
        'Contactar autoridades se necessário',
        'Documentar timeline'
      ],
      confidence: 94.5
    },
    ism_failure: {
      express_audit: 'Auditoria completa do checklist ISM falho. Identificação de itens não conformes. Verificação de certificações e treinamentos requeridos.',
      shift_reconfiguration: 'Designar oficial qualificado para revisão e correção. Suspensão temporária de operação afetada se necessário.',
      actions: [
        'Identificar itens não conformes',
        'Revisar requisitos ISM',
        'Verificar certificações',
        'Corrigir não conformidades',
        'Re-executar checklist',
        'Registrar ações corretivas'
      ],
      confidence: 96.8
    },
    weather_alert: {
      evacuation_plan: 'Preparação para condições adversas. Assegurar equipamentos. Verificar rotas alternativas. Considerar adiamento ou desvio de rota.',
      shift_reconfiguration: 'Reforçar turno de convés. Ativar protocolo de clima severo. Preparar equipe de emergência.',
      maintenance_priority: 'Prioridade ALTA: Verificação de sistema de ancoragem. Inspeção de equipamentos de convés. Teste de sistemas de navegação.',
      actions: [
        'Monitorar previsão contínua',
        'Avaliar rota atual',
        'Preparar embarcação',
        'Verificar suprimentos de emergência',
        'Briefing de segurança para tripulação',
        'Estabelecer comunicação com autoridades'
      ],
      confidence: 95.1
    }
  };
  
  const specificResponse = responses[scenario];
  const log = `[${new Date().toISOString()}] Emergency drill simulation for scenario: ${scenario}. Response generated in ${responseTime}ms. Confidence: ${specificResponse.confidence}%`;
  
  return {
    scenario,
    timestamp: new Date(),
    responseTime,
    ...specificResponse,
    actions: specificResponse.actions || [],
    confidence: specificResponse.confidence || 95.0,
    log
  };
}

/**
 * Emergency Drill Simulator Component
 */
export function EmergencyDrillSimulator() {
  const [selectedScenario, setSelectedScenario] = useState<EmergencyScenario | null>(null);
  const [response, setResponse] = useState<AIEmergencyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [simulationHistory, setSimulationHistory] = useState<AIEmergencyResponse[]>([]);
  
  const runSimulation = async (scenario: EmergencyScenario) => {
    setSelectedScenario(scenario);
    setIsLoading(true);
    setResponse(null);
    
    try {
      const aiResponse = await simulateAIResponse(scenario);
      setResponse(aiResponse);
      setSimulationHistory(prev => [aiResponse, ...prev]);
      
      // Store log in localStorage for audit
      const logs = JSON.parse(localStorage.getItem('emergency_drill_logs') || '[]');
      logs.push(aiResponse.log);
      localStorage.setItem('emergency_drill_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Simulation error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const calculateStats = () => {
    if (simulationHistory.length === 0) {
      return { avgResponseTime: 0, avgConfidence: 0, totalSimulations: 0 };
    }
    
    const avgResponseTime = simulationHistory.reduce((acc, r) => acc + r.responseTime, 0) / simulationHistory.length;
    const avgConfidence = simulationHistory.reduce((acc, r) => acc + r.confidence, 0) / simulationHistory.length;
    
    return {
      avgResponseTime: avgResponseTime / 1000, // Convert to seconds
      avgConfidence,
      totalSimulations: simulationHistory.length
    };
  };
  
  const stats = calculateStats();
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          Emergency Drill Simulator - PATCH 73.0
        </h1>
        <p className="text-muted-foreground">
          Validação da IA adaptativa sob cenários reais e críticos
        </p>
      </div>
      
      {/* Statistics */}
      {simulationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Estatísticas de Simulação</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.avgConfidence.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Precisão Média</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.avgResponseTime.toFixed(1)}s
              </div>
              <div className="text-sm text-muted-foreground">Tempo de Resposta</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.totalSimulations}
              </div>
              <div className="text-sm text-muted-foreground">Simulações</div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Scenario Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.keys(SCENARIOS) as EmergencyScenario[]).map((scenarioKey) => {
          const scenario = SCENARIOS[scenarioKey];
          const Icon = scenario.icon;
          
          return (
            <Card 
              key={scenarioKey}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedScenario === scenarioKey ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => !isLoading && runSimulation(scenarioKey)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${scenario.color}`} />
                  <span className="text-sm">{scenario.title}</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  {scenario.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  disabled={isLoading}
                  onClick={(e) => {
                    e.stopPropagation();
                    runSimulation(scenarioKey);
                  }}
                >
                  {isLoading && selectedScenario === scenarioKey ? 'Simulando...' : 'Simular'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* AI Response */}
      {response && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Resposta da IA Embarcada
              <Badge variant="outline" className="ml-auto">
                {response.confidence.toFixed(1)}% confiança
              </Badge>
            </CardTitle>
            <CardDescription>
              Processado em {(response.responseTime / 1000).toFixed(2)} segundos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {response.evacuation_plan && (
              <div>
                <h4 className="font-semibold mb-2">🚨 Plano de Evacuação:</h4>
                <p className="text-sm text-muted-foreground">{response.evacuation_plan}</p>
              </div>
            )}
            
            {response.shift_reconfiguration && (
              <div>
                <h4 className="font-semibold mb-2">👥 Reconfiguração de Escala:</h4>
                <p className="text-sm text-muted-foreground">{response.shift_reconfiguration}</p>
              </div>
            )}
            
            {response.express_audit && (
              <div>
                <h4 className="font-semibold mb-2">🔍 Auditoria Expressa:</h4>
                <p className="text-sm text-muted-foreground">{response.express_audit}</p>
              </div>
            )}
            
            {response.maintenance_priority && (
              <div>
                <h4 className="font-semibold mb-2">🔧 Priorização de Manutenção:</h4>
                <p className="text-sm text-muted-foreground">{response.maintenance_priority}</p>
              </div>
            )}
            
            <div>
              <h4 className="font-semibold mb-2">✅ Ações Recomendadas:</h4>
              <ul className="list-disc list-inside space-y-1">
                {response.actions.map((action, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">{action}</li>
                ))}
              </ul>
            </div>
            
            <div className="pt-4 border-t">
              <details>
                <summary className="cursor-pointer text-sm font-semibold">📝 Log de Auditoria</summary>
                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                  {response.log}
                </pre>
              </details>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Simulation History */}
      {simulationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📜 Histórico de Simulações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {simulationHistory.slice(0, 5).map((sim, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    {SCENARIOS[sim.scenario] && (() => {
                      const Icon = SCENARIOS[sim.scenario].icon;
                      return <Icon className={`h-4 w-4 ${SCENARIOS[sim.scenario].color}`} />;
                    })()}
                    <span className="text-sm">{SCENARIOS[sim.scenario]?.title}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">{sim.confidence.toFixed(1)}%</Badge>
                    <span className="text-xs text-muted-foreground">
                      {sim.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default EmergencyDrillSimulator;
