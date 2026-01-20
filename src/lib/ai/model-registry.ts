/**
 * AI Model Registry - Centralized model management
 * Version control, A/B testing, and deployment tracking
 */

export interface ModelVersion {
  id: string;
  name: string;
  version: string;
  provider: 'lovable' | 'openai' | 'google' | 'custom';
  baseModel: string;
  fineTuned: boolean;
  trainingDataVersion?: string;
  metrics: ModelMetrics;
  deployedAt: string;
  isActive: boolean;
  abTestGroup?: 'A' | 'B' | 'control';
  rolloutPercentage: number;
}

export interface ModelMetrics {
  accuracy: number;
  latencyP50: number;
  latencyP95: number;
  costPerRequest: number;
  errorRate: number;
  userSatisfaction?: number;
  confidenceAvg: number;
}

export interface AgentConfig {
  agentId: string;
  agentName: string;
  description: string;
  primaryModel: string;
  fallbackModel: string;
  systemPrompt: string;
  maxTokens: number;
  temperature: number;
  capabilities: string[];
  integrationPoints: string[];
  status: 'active' | 'testing' | 'deprecated';
}

// Agent Registry - 7 core agents
const AGENT_REGISTRY: AgentConfig[] = [
  {
    agentId: 'nauti-brain',
    agentName: 'Nauti Brain',
    description: 'Central AI brain for decision-making and operational insights',
    primaryModel: 'google/gemini-3-flash-preview',
    fallbackModel: 'openai/gpt-5-mini',
    systemPrompt: `Você é Nauti Brain, o assistente de IA central do Nauti One para operações marítimas.
Você fornece insights sobre conformidade, operações de tripulação, manutenção e otimização de viagens.
Seja conciso, profissional e sempre considere as regulamentações marítimas (MLC 2006, STCW).`,
    maxTokens: 2000,
    temperature: 0.7,
    capabilities: ['chat', 'insights', 'recommendations', 'compliance-check'],
    integrationPoints: ['/dashboard', '/ai/nauti-brain', '/crew/:id', '/voyages/:id'],
    status: 'active'
  },
  {
    agentId: 'mlc-assistant',
    agentName: 'MLC Assistant',
    description: 'Specialized compliance expert for MLC 2006 regulations',
    primaryModel: 'openai/gpt-5-mini', // Better for structured compliance
    fallbackModel: 'google/gemini-3-flash-preview',
    systemPrompt: `Você é o MLC Assistant, especialista em conformidade com a Convenção do Trabalho Marítimo (MLC 2006).
Você conhece todas as regulamentações de horas de trabalho, períodos de descanso, salários, exames médicos e certificações.
Sempre cite os artigos e regulamentos específicos quando aplicável. Nunca invente informações.`,
    maxTokens: 1500,
    temperature: 0.3, // Lower for accuracy
    capabilities: ['compliance-questions', 'checklist-generation', 'violation-detection', 'remediation'],
    integrationPoints: ['/ai/mlc-assistant', '/compliance', '/crew/:id/compliance'],
    status: 'active'
  },
  {
    agentId: 'peotram-ai',
    agentName: 'PEOTRAM AI',
    description: 'Document analysis and audit processing with vision capabilities',
    primaryModel: 'google/gemini-2.5-pro', // Vision model
    fallbackModel: 'google/gemini-3-flash-preview',
    systemPrompt: `Você é PEOTRAM AI, especialista em análise de documentos de auditoria e inspeção marítima.
Você extrai informações de documentos, identifica não-conformidades, classifica severidade e sugere remediações.
Use formato estruturado para achados. Seja preciso nas datas e prazos.`,
    maxTokens: 3000,
    temperature: 0.2,
    capabilities: ['document-analysis', 'ocr', 'finding-extraction', 'report-generation'],
    integrationPoints: ['/ai/peotram', '/compliance/ism', '/documents'],
    status: 'active'
  },
  {
    agentId: 'crew-optimizer',
    agentName: 'Crew Optimizer',
    description: 'AI-powered crew allocation and optimization',
    primaryModel: 'google/gemini-3-flash-preview',
    fallbackModel: 'google/gemini-2.5-flash',
    systemPrompt: `Você é o Crew Optimizer, especialista em alocação otimizada de tripulação.
Considere certificações, experiência, disponibilidade, horas de descanso (STCW) e custos.
Forneça múltiplas opções ranqueadas com justificativa para cada recomendação.`,
    maxTokens: 2000,
    temperature: 0.4,
    capabilities: ['crew-allocation', 'constraint-validation', 'cost-optimization', 'scheduling'],
    integrationPoints: ['/ai/crew-optimizer', '/voyages/new', '/voyages/:id/crew'],
    status: 'active'
  },
  {
    agentId: 'predictive-maintenance',
    agentName: 'Predictive Maintenance',
    description: 'Equipment failure prediction and maintenance scheduling',
    primaryModel: 'custom/onnx-maintenance-v1',
    fallbackModel: 'google/gemini-3-flash-preview',
    systemPrompt: `Você auxilia na manutenção preditiva de equipamentos marítimos.
Analise dados de sensores, histórico de falhas e padrões para prever problemas.
Priorize segurança e forneça estimativas de custo para ação preventiva vs falha.`,
    maxTokens: 1500,
    temperature: 0.2,
    capabilities: ['failure-prediction', 'maintenance-scheduling', 'cost-analysis', 'alert-generation'],
    integrationPoints: ['/maintenance/predictive', '/equipment/:id', '/dashboard'],
    status: 'active'
  },
  {
    agentId: 'voice-assistant',
    agentName: 'Voice Assistant',
    description: 'Voice-enabled interaction with speech-to-text and text-to-speech',
    primaryModel: 'whisper', // Transcrição
    fallbackModel: 'google/gemini-2.5-flash',
    systemPrompt: `Você é o assistente de voz do Nauti One.
Responda de forma concisa e clara, otimizado para síntese de voz.
Evite listas longas e formate respostas para serem ouvidas.`,
    maxTokens: 500,
    temperature: 0.5,
    capabilities: ['voice-commands', 'transcription', 'speech-synthesis', 'hands-free-operation'],
    integrationPoints: ['/ai/voice', 'global-voice-trigger'],
    status: 'active'
  },
  {
    agentId: 'document-ocr',
    agentName: 'Document OCR',
    description: 'Optical character recognition and document field extraction',
    primaryModel: 'google/gemini-2.5-pro', // Vision
    fallbackModel: 'tesseract',
    systemPrompt: `Você extrai informações de documentos marítimos escaneados.
Identifique campos-chave: nomes, datas, números de certificação, autoridades emissoras.
Forneça níveis de confiança para cada campo extraído.`,
    maxTokens: 2000,
    temperature: 0.1,
    capabilities: ['ocr', 'field-extraction', 'document-classification', 'data-validation'],
    integrationPoints: ['/ai/ocr', '/documents/upload', '/crew/:id/documents'],
    status: 'active'
  }
];

// Model versions for A/B testing
const MODEL_VERSIONS: ModelVersion[] = [
  {
    id: 'mlc-v1',
    name: 'MLC Assistant',
    version: '1.0.0',
    provider: 'openai',
    baseModel: 'gpt-5-mini',
    fineTuned: false,
    metrics: {
      accuracy: 0.92,
      latencyP50: 450,
      latencyP95: 850,
      costPerRequest: 0.002,
      errorRate: 0.01,
      confidenceAvg: 0.85
    },
    deployedAt: '2024-01-15',
    isActive: true,
    abTestGroup: 'control',
    rolloutPercentage: 100
  },
  {
    id: 'nauti-brain-v2',
    name: 'Nauti Brain',
    version: '2.0.0',
    provider: 'google',
    baseModel: 'gemini-3-flash-preview',
    fineTuned: false,
    metrics: {
      accuracy: 0.88,
      latencyP50: 380,
      latencyP95: 720,
      costPerRequest: 0.001,
      errorRate: 0.005,
      confidenceAvg: 0.82
    },
    deployedAt: '2024-01-20',
    isActive: true,
    abTestGroup: 'control',
    rolloutPercentage: 100
  }
];

/**
 * Get agent configuration by ID
 */
export function getAgentConfig(agentId: string): AgentConfig | undefined {
  return AGENT_REGISTRY.find(a => a.agentId === agentId);
}

/**
 * Get all active agents
 */
export function getActiveAgents(): AgentConfig[] {
  return AGENT_REGISTRY.filter(a => a.status === 'active');
}

/**
 * Get model for agent with A/B testing support
 */
export function getModelForAgent(agentId: string, userId?: string): string {
  const agent = getAgentConfig(agentId);
  if (!agent) {
    throw new Error(`Unknown agent: ${agentId}`);
  }

  // Simple A/B: use userId hash to determine group
  if (userId) {
    const hash = hashCode(userId);
    const useVariant = hash % 100 < 10; // 10% get variant
    
    if (useVariant) {
      const variantModel = MODEL_VERSIONS.find(
        m => m.name === agent.agentName && m.abTestGroup === 'B'
      );
      if (variantModel?.isActive) {
        return variantModel.baseModel;
      }
    }
  }

  return agent.primaryModel;
}

/**
 * Get system prompt for agent
 */
export function getSystemPrompt(agentId: string, context?: Record<string, string>): string {
  const agent = getAgentConfig(agentId);
  if (!agent) return '';

  let prompt = agent.systemPrompt;

  // Inject context variables
  if (context) {
    for (const [key, value] of Object.entries(context)) {
      prompt = prompt.replace(`{{${key}}}`, value);
    }
  }

  return prompt;
}

/**
 * Get model metrics
 */
export function getModelMetrics(modelId: string): ModelMetrics | undefined {
  const version = MODEL_VERSIONS.find(m => m.id === modelId);
  return version?.metrics;
}

/**
 * Get all model versions for an agent
 */
export function getModelVersions(agentName: string): ModelVersion[] {
  return MODEL_VERSIONS.filter(m => m.name === agentName);
}

/**
 * Simple hash function for A/B testing
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Get agent health summary
 */
export function getAgentHealthSummary(): Array<{
  agentId: string;
  agentName: string;
  status: string;
  model: string;
  metrics?: ModelMetrics;
}> {
  return AGENT_REGISTRY.map(agent => ({
    agentId: agent.agentId,
    agentName: agent.agentName,
    status: agent.status,
    model: agent.primaryModel,
    metrics: MODEL_VERSIONS.find(m => m.name === agent.agentName)?.metrics
  }));
}

export { AGENT_REGISTRY, MODEL_VERSIONS };
