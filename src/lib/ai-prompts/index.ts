/**
 * AI Prompts Index - Central export for all AI system prompts
 * Nautilus One Maritime HR Management Platform
 */

// Core AI Prompts
export { PEOTRAM_AI_CONFIG } from './peotram-ai-prompt';
export { PEODP_AI_CONFIG } from './peodp-ai-prompt';
export { COMMAND_AI_CONFIG } from './command-ai-prompt';
export { VOICE_AI_CONFIG } from './voice-ai-prompt';

// AI Module Registry
export const AI_MODULES = {
  peotram: {
    name: 'PEOTRAM Assistant',
    description: 'Especialista em auditorias PEOTRAM Petrobras',
    edgeFunction: 'peotram-ai-chat',
    capabilities: ['generate_evidence', 'explain_element', 'create_action_plan', 'simulate_audit']
  },
  peodp: {
    name: 'PEO-DP Assistant', 
    description: 'Especialista em Posicionamento Dinâmico',
    edgeFunction: 'peodp-ai-chat',
    capabilities: ['generate_evidence', 'analyze_redundancy', 'troubleshoot', 'check_asog']
  },
  command: {
    name: 'Nautilus Brain',
    description: 'Central de Comando Inteligente',
    edgeFunction: 'nautilus-brain',
    capabilities: ['status', 'analyze', 'recommend', 'execute', 'coordinate']
  },
  voice: {
    name: 'ARIA',
    description: 'Assistente de Voz',
    edgeFunction: 'voice-assistant-chat',
    capabilities: ['navigate', 'status', 'create', 'search']
  },
  bunker: {
    name: 'BunkerBot',
    description: 'Gestão de Combustível',
    edgeFunction: 'bunker-ai',
    capabilities: ['predict_consumption', 'compare_prices', 'optimize_route', 'efficiency_report']
  },
  safety: {
    name: 'Safety AI',
    description: 'Segurança Operacional',
    edgeFunction: 'safety-ai',
    capabilities: ['analyze_incident', 'generate_recommendations', 'predictive_insights', 'dds_generate']
  },
  compliance: {
    name: 'Compliance AI',
    description: 'Conformidade Regulatória',
    edgeFunction: 'compliance-ai',
    capabilities: ['analyze_compliance', 'generate_checklist', 'predict_risks', 'analyze_document']
  },
  fleet: {
    name: 'Fleet Copilot',
    description: 'Gestão de Frota',
    edgeFunction: 'fleet-ai-copilot',
    capabilities: ['maintenance_prediction', 'route_optimization', 'fuel_analysis', 'fleet_insights']
  },
  crew: {
    name: 'Crew Copilot',
    description: 'Gestão de Tripulação',
    edgeFunction: 'crew-ai-copilot',
    capabilities: ['fatigue_analysis', 'competency_analysis', 'schedule_optimization', 'certification_alerts']
  },
  training: {
    name: 'Training AI',
    description: 'Treinamento e Capacitação',
    edgeFunction: 'training-ai-assistant',
    capabilities: ['generate_recommendations', 'analyze_gaps', 'predictive_insights', 'generate_quiz']
  },
  weather: {
    name: 'Weather Copilot',
    description: 'Meteorologia Marítima',
    edgeFunction: 'weather-ai-copilot',
    capabilities: ['analyze_conditions', 'route_planning', 'safety_alerts']
  },
  voyage: {
    name: 'Voyage Copilot',
    description: 'Viagens Marítimas',
    edgeFunction: 'voyage-ai-copilot',
    capabilities: ['optimize_route', 'calculate_eta', 'fuel_efficiency']
  },
  cargo: {
    name: 'Cargo AI',
    description: 'Gestão de Carga',
    edgeFunction: 'cargo-management-ai',
    capabilities: ['optimize_loading', 'predict_operations_time', 'detect_anomalies', 'stability_check']
  },
  charter: {
    name: 'Charter Party AI',
    description: 'Afretamento Marítimo',
    edgeFunction: 'charter-party-ai',
    capabilities: ['calculate_hire', 'calculate_demurrage', 'analyze_contract', 'market_rate_check']
  },
  mlc: {
    name: 'MLC Assistant',
    description: 'Maritime Labour Convention',
    edgeFunction: 'mlc-assistant',
    capabilities: ['checklist', 'evidence', 'corrective', 'risk', 'explain']
  }
} as const;

export type AIModuleKey = keyof typeof AI_MODULES;

// Helper to get AI config by module
export function getAIModule(key: AIModuleKey) {
  return AI_MODULES[key];
}

// List all available AI modules
export function listAIModules() {
  return Object.entries(AI_MODULES).map(([key, config]) => ({
    key,
    ...config
  }));
}
