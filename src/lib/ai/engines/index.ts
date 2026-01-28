/**
 * Consolidated AI Engines Export
 * v6.0 - Complete Maritime AI Suite (30+ Engines)
 */

// CREW & HR
export { crewMatchingEngine } from './crew-matching';
export { turnoverPredictionEngine } from './turnover-prediction';
export type { CrewMemberProfile, TurnoverPrediction, RiskFactor as TurnoverRiskFactor, RetentionAction, TeamTurnoverAnalysis } from './turnover-prediction';
export { wellnessSentinelEngine } from './wellness-sentinel';
export { wellbeingNLPEngine } from './wellbeing-nlp';
export { fatigueRiskEngine } from './fatigue-risk-ai';
export { careerPathEngine } from './career-path-ai';

// MANUTENÇÃO & FROTA
export { onnxPredictiveMaintenanceEngine, type TelemetryReading, type FailurePrediction, type MaintenanceSchedule } from './onnx-predictive-maintenance';
export { digitalTwinEngine } from './digital-twin-engine';
export { anomalyDetectionIoT } from './anomaly-detection-iot';
export { sparePartsDemandEngine } from './spare-parts-demand';
export { autoSchedulingEngine } from './auto-scheduling-maintenance';

// COMPLIANCE & SAFETY
export { ncPredictionEngine } from './nc-prediction';
export { riskScoringEngine } from './risk-scoring';
export { complianceAuditEngine } from './compliance-audit';
export { incidentClassifierEngine } from './incident-classifier';
export { accessAnomalyEngine } from './access-anomaly';

// FINANCEIRO & OPERAÇÕES
export { opexForecastingEngine, type HistoricalExpense, type OPEXForecast } from './opex-forecasting';
export { fraudDetectionEngine } from './fraud-detection';
export { bunkerOptimizationEngine, type VesselFuelRequirement, type BunkerPort, type BunkerPlan } from './bunker-optimization';
export { contractAnalysisEngine } from './contract-analysis';
export { cashFlowPredictorEngine } from './cash-flow-predictor';
export { costForecastingEngine } from './cost-forecasting';

// VIAGEM & NAVEGAÇÃO
export { realtimeRouteOptimizer, type VesselPosition, type VesselSpecs, type WeatherData as RouteWeatherData, type OptimizedRoute, type RouteWaypoint, type RouteAlert, type BunkerPrice } from './realtime-route-optimizer';
export { routeOptimizationEngine } from './route-optimization';
export { etaPredictorEngine } from './eta-predictor';
export { driftAlertEngine } from './drift-alert';
export { portCongestionPredictor } from './port-congestion-predictor';

// DOCUMENTOS
export { adaptiveTrainingEngine } from './adaptive-training';
export { smartOCREngine } from './smart-ocr-engine';

// AGENTIC AI
export { multiAgentOrchestrator } from './multi-agent-orchestrator';
export type { Agent, AgentRole, Decision, DecisionType, Situation } from './multi-agent-orchestrator';
export { selfHealingSystemEngine, type SystemComponent, type SystemHealth, type HealingReport } from './self-healing-system';
export { blockchainAuditEngine } from './blockchain-audit';

// ENGINE REGISTRY
export interface AIEngineInfo {
  id: string;
  name: string;
  module: 'crew' | 'maintenance' | 'compliance' | 'finance' | 'navigation' | 'documents' | 'agentic';
  type: 'ML' | 'NLP' | 'Optimization' | 'Prediction' | 'Agent' | 'Computer Vision' | 'Streaming';
  status: 'active' | 'beta' | 'development';
  description: string;
}

export const AI_ENGINE_REGISTRY: AIEngineInfo[] = [
  { id: 'crew-matching', name: 'Crew Matching AI', module: 'crew', type: 'ML', status: 'active', description: 'Algoritmo de compatibilidade tripulante-embarcação' },
  { id: 'turnover-prediction', name: 'Turnover Predictor', module: 'crew', type: 'Prediction', status: 'active', description: 'Previsão de rotatividade com 90 dias de antecedência' },
  { id: 'wellness-sentinel', name: 'Wellness Sentinel', module: 'crew', type: 'NLP', status: 'active', description: 'Análise de sentimentos para detectar estresse/burnout' },
  { id: 'fatigue-risk', name: 'Fatigue Risk AI', module: 'crew', type: 'Agent', status: 'active', description: 'Monitoramento autônomo de horas de descanso' },
  { id: 'career-path', name: 'Career Path AI', module: 'crew', type: 'ML', status: 'active', description: 'Sugestões de progressão de carreira' },
  { id: 'onnx-maintenance', name: 'ONNX Predictive Maintenance', module: 'maintenance', type: 'ML', status: 'active', description: 'Modelo embarcado para predição offline' },
  { id: 'digital-twin', name: 'Digital Twin Engine', module: 'maintenance', type: 'ML', status: 'active', description: 'Réplica virtual para cenários what-if' },
  { id: 'anomaly-iot', name: 'Anomaly Detection IoT', module: 'maintenance', type: 'Streaming', status: 'active', description: 'Detecção em sensores real-time' },
  { id: 'spare-parts', name: 'Spare Parts Demand', module: 'maintenance', type: 'Prediction', status: 'active', description: 'Previsão de demanda de peças' },
  { id: 'auto-scheduling', name: 'Auto-Scheduling', module: 'maintenance', type: 'Agent', status: 'active', description: 'Agendamento autônomo baseado em condição' },
  { id: 'nc-predictor', name: 'NC Predictor', module: 'compliance', type: 'Prediction', status: 'active', description: 'Previsão de não-conformidades PSC' },
  { id: 'dynamic-risk', name: 'Dynamic Risk Scoring', module: 'compliance', type: 'ML', status: 'active', description: 'Score de risco com 50+ fatores' },
  { id: 'compliance-audit', name: 'Compliance Audit Agent', module: 'compliance', type: 'Agent', status: 'active', description: 'Auditoria autônoma contínua' },
  { id: 'incident-classifier', name: 'Incident Classifier', module: 'compliance', type: 'NLP', status: 'active', description: 'Classificação automática de incidentes' },
  { id: 'opex-forecast', name: 'OPEX Forecasting', module: 'finance', type: 'Prediction', status: 'active', description: 'Previsão de custos operacionais 90 dias' },
  { id: 'fraud-detection', name: 'Fraud Detection', module: 'finance', type: 'ML', status: 'active', description: 'Detecção de fraudes em transações' },
  { id: 'bunker-optimizer', name: 'Bunker Optimizer', module: 'finance', type: 'Optimization', status: 'active', description: 'Otimização de compras de combustível' },
  { id: 'contract-analyzer', name: 'Contract Analyzer', module: 'finance', type: 'NLP', status: 'active', description: 'Análise de contratos para cláusulas de risco' },
  { id: 'cash-flow', name: 'Cash Flow Predictor', module: 'finance', type: 'Prediction', status: 'active', description: 'Previsão de fluxo de caixa' },
  { id: 'route-optimizer', name: 'Route Optimizer', module: 'navigation', type: 'Optimization', status: 'active', description: 'Otimização weather/fuel/ETA' },
  { id: 'port-congestion', name: 'Port Congestion', module: 'navigation', type: 'Prediction', status: 'beta', description: 'Previsão de congestionamento portuário' },
  { id: 'eta-predictor', name: 'ETA Predictor', module: 'navigation', type: 'ML', status: 'active', description: 'Previsão precisa de chegada 98%+' },
  { id: 'drift-alert', name: 'Drift Alert', module: 'navigation', type: 'Agent', status: 'active', description: 'Detecção de desvio de rota' },
  { id: 'smart-ocr', name: 'Smart OCR', module: 'documents', type: 'Computer Vision', status: 'active', description: 'Extração inteligente de documentos' },
  { id: 'multi-agent', name: 'Multi-Agent Orchestrator', module: 'agentic', type: 'Agent', status: 'active', description: '8 agentes colaborando em decisões' },
  { id: 'self-healing', name: 'Self-Healing System', module: 'agentic', type: 'Agent', status: 'active', description: 'Auto-recuperação do sistema' },
  { id: 'blockchain-audit', name: 'Blockchain Audit', module: 'agentic', type: 'Agent', status: 'active', description: 'Rastreabilidade imutável' },
];

export const getEnginesByModule = (module: AIEngineInfo['module']): AIEngineInfo[] => 
  AI_ENGINE_REGISTRY.filter(e => e.module === module);

export const getActiveEngines = (): AIEngineInfo[] =>
  AI_ENGINE_REGISTRY.filter(e => e.status === 'active');

export const getEngineById = (id: string): AIEngineInfo | undefined =>
  AI_ENGINE_REGISTRY.find(e => e.id === id);
