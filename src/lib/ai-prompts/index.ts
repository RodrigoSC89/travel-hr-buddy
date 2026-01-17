/**
 * AI Prompts Index - Central Registry - PATCH AI-TRAINING v4.0
 * 20+ IAs Especializadas com System Prompts Completos
 */

// Core AI Prompts
export { PEOTRAM_AI_CONFIG } from './peotram-ai-prompt';
export { PEODP_AI_CONFIG } from './peodp-ai-prompt';
export { PEO_DP_AI_CONFIG, PEO_DP_AI_SYSTEM_PROMPT, PEO_DP_SECTIONS } from './peo-dp-ai-prompt';
export { COMMAND_AI_CONFIG } from './command-ai-prompt';
export { VOICE_AI_CONFIG } from './voice-ai-prompt';

// Operational AI Prompts
export { BUNKER_AI_CONFIG } from './bunker-ai-prompt';
export { SAFETY_AI_CONFIG } from './safety-ai-prompt';
export { COMPLIANCE_AI_CONFIG } from './compliance-ai-prompt';
export { FLEET_AI_CONFIG } from './fleet-ai-prompt';
export { CREW_AI_CONFIG } from './crew-ai-prompt';
export { WEATHER_AI_CONFIG } from './weather-ai-prompt';
export { MAINTENANCE_AI_CONFIG } from './maintenance-ai-prompt';
export { CARGO_AI_CONFIG } from './cargo-ai-prompt';
export { TRAINING_AI_CONFIG } from './training-ai-prompt';
export { VOYAGE_AI_CONFIG } from './voyage-ai-prompt';
export { CHARTER_AI_CONFIG } from './charter-ai-prompt';
export { MLC_AI_CONFIG } from './mlc-ai-prompt';

// Pre-OVID AI Prompt
export { PREOVID_AI_CONFIG } from './preovid-ai-prompt';

// NEW v4.0 AI Prompts
export { SGSO_AI_CONFIG } from './sgso-ai-prompt';
export { HR_AI_CONFIG } from './hr-ai-prompt';
export { IMCA_AI_CONFIG } from './imca-ai-prompt';

// Type definitions
export interface AIModuleConfig {
  name: string;
  description: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  contextBuilder?: string;
  examples?: Array<{
    user: string;
    context?: Record<string, unknown>;
    response: string;
  }>;
}

// AI Module Registry with Edge Functions
export const AI_MODULES = {
  peotram: {
    name: 'PEOTRAM Assistant',
    description: 'Especialista em auditorias PEOTRAM Petrobras - 13 Elementos',
    icon: '📋',
    color: 'emerald',
    edgeFunction: 'peotram-ai-chat',
    configImport: () => import('./peotram-ai-prompt'),
    capabilities: ['generate_evidence', 'explain_element', 'create_action_plan', 'simulate_audit', 'voice_chat']
  },
  peodp: {
    name: 'PEO-DP Assistant',
    description: 'Especialista em Posicionamento Dinâmico',
    icon: '⚓',
    color: 'blue',
    edgeFunction: 'peodp-ai-chat',
    configImport: () => import('./peodp-ai-prompt'),
    capabilities: ['generate_evidence', 'analyze_redundancy', 'troubleshoot', 'check_asog', 'fmea_analysis']
  },
  command: {
    name: 'Nautilus Brain',
    description: 'Central de Comando Inteligente - 5 Níveis de Autonomia',
    icon: '🤖',
    color: 'purple',
    edgeFunction: 'nautilus-brain',
    configImport: () => import('./command-ai-prompt'),
    capabilities: ['status', 'analyze', 'recommend', 'execute', 'coordinate', 'autonomous_decision']
  },
  voice: {
    name: 'ARIA',
    description: 'Assistente de Voz Marítimo',
    icon: '🎙️',
    color: 'pink',
    edgeFunction: 'voice-assistant-chat',
    configImport: () => import('./voice-ai-prompt'),
    capabilities: ['navigate', 'status', 'create', 'search', 'hands_free']
  },
  bunker: {
    name: 'BunkerBot',
    description: 'Gestão de Combustível e Eficiência Energética',
    icon: '⛽',
    color: 'orange',
    edgeFunction: 'bunker-ai',
    configImport: () => import('./bunker-ai-prompt'),
    capabilities: ['predict_consumption', 'compare_prices', 'optimize_route', 'efficiency_report', 'eexi_cii']
  },
  safety: {
    name: 'SafetyGuard',
    description: 'Segurança Marítima e HSEQ',
    icon: '🛡️',
    color: 'red',
    edgeFunction: 'safety-ai',
    configImport: () => import('./safety-ai-prompt'),
    capabilities: ['analyze_incident', 'risk_assessment', 'generate_tbt', 'near_miss', 'permit_to_work']
  },
  compliance: {
    name: 'ComplianceGuard',
    description: 'Conformidade Regulatória Marítima',
    icon: '📋',
    color: 'indigo',
    edgeFunction: 'compliance-ai',
    configImport: () => import('./compliance-ai-prompt'),
    capabilities: ['certificate_check', 'audit_preparation', 'psc_readiness', 'sire_preparation', 'vetting']
  },
  fleet: {
    name: 'FleetMaster',
    description: 'Gestão de Frota Marítima',
    icon: '🚢',
    color: 'cyan',
    edgeFunction: 'fleet-ai-copilot',
    configImport: () => import('./fleet-ai-prompt'),
    capabilities: ['fleet_overview', 'performance_benchmark', 'drydock_planning', 'utilization', 'tce_analysis']
  },
  crew: {
    name: 'CrewMaster',
    description: 'Gestão de Tripulação e STCW',
    icon: '👥',
    color: 'teal',
    edgeFunction: 'crew-ai-copilot',
    configImport: () => import('./crew-ai-prompt'),
    capabilities: ['crew_planning', 'certification_tracking', 'mlc_hours', 'rotation_planning', 'gap_analysis']
  },
  weather: {
    name: 'WeatherNav',
    description: 'Meteorologia Marítima e Otimização de Rotas',
    icon: '🌊',
    color: 'sky',
    edgeFunction: 'weather-ai-copilot',
    configImport: () => import('./weather-ai-prompt'),
    capabilities: ['forecast', 'route_optimization', 'tropical_tracking', 'sea_state', 'weather_routing']
  },
  maintenance: {
    name: 'MaintenancePro',
    description: 'Manutenção Preditiva e PMS',
    icon: '🔧',
    color: 'amber',
    edgeFunction: 'ai-predictive-maintenance',
    configImport: () => import('./maintenance-ai-prompt'),
    capabilities: ['predictive_analysis', 'troubleshooting', 'spare_parts', 'pms_compliance', 'condition_monitoring']
  },
  cargo: {
    name: 'CargoMaster',
    description: 'Gestão de Carga e Estabilidade',
    icon: '📦',
    color: 'lime',
    edgeFunction: 'cargo-management-ai',
    configImport: () => import('./cargo-ai-prompt'),
    capabilities: ['stability_check', 'loading_plan', 'imdg_segregation', 'draft_survey', 'stowage']
  },
  training: {
    name: 'TrainingMentor',
    description: 'Treinamento Marítimo e Drills SOLAS',
    icon: '📚',
    color: 'violet',
    edgeFunction: 'training-ai-assistant',
    configImport: () => import('./training-ai-prompt'),
    capabilities: ['drill_planning', 'competency_assessment', 'gap_analysis', 'stcw_tracking', 'e_learning']
  },
  voyage: {
    name: 'VoyagePlanner',
    description: 'Planejamento de Viagens e Voyage Estimate',
    icon: '🗺️',
    color: 'emerald',
    edgeFunction: 'voyage-ai-copilot',
    configImport: () => import('./voyage-ai-prompt'),
    capabilities: ['voyage_planning', 'eta_calculation', 'voyage_estimate', 'port_costs', 'tce_projection']
  },
  charter: {
    name: 'CharterPro',
    description: 'Charter Party e Contratos Marítimos',
    icon: '📄',
    color: 'slate',
    edgeFunction: 'charter-party-ai',
    configImport: () => import('./charter-ai-prompt'),
    capabilities: ['demurrage_calculation', 'contract_analysis', 'laytime_calc', 'hire_calculation', 'claim_support']
  },
  mlc: {
    name: 'MLCGuard',
    description: 'Maritime Labour Convention 2006',
    icon: '⚖️',
    color: 'rose',
    edgeFunction: 'mlc-assistant',
    configImport: () => import('./mlc-ai-prompt'),
    capabilities: ['hours_verification', 'sea_compliance', 'inspection_prep', 'complaint_handling', 'welfare']
  }
} as const;

export type AIModuleKey = keyof typeof AI_MODULES;

// Helper to get AI config by module
export function getAIModule(key: AIModuleKey) {
  return AI_MODULES[key];
}

// Get system prompt for a module
export async function getSystemPrompt(key: AIModuleKey): Promise<string> {
  const module = AI_MODULES[key];
  if (!module) return '';
  
  try {
    const config = await module.configImport();
    return config.default?.systemPrompt || '';
  } catch {
    return '';
  }
}

// List all available AI modules
export function listAIModules() {
  return Object.entries(AI_MODULES).map(([key, config]) => ({
    key: key as AIModuleKey,
    ...config
  }));
}

// Get modules by capability
export function getModulesByCapability(capability: string) {
  return listAIModules().filter(m => m.capabilities.includes(capability as never));
}
