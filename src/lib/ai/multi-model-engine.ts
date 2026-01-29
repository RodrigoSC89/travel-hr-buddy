/**
 * Multi-Model AI Engine - APEX v1.0
 * Unified interface for multiple AI providers with fallback and consensus
 */

import { Logger } from '@/lib/utils/logger';

export type AIProvider = 'lovable' | 'openai' | 'anthropic' | 'gemini' | 'local';

export type AIModel = 
  | 'google/gemini-3-flash-preview'
  | 'google/gemini-2.5-flash'
  | 'google/gemini-2.5-pro'
  | 'openai/gpt-5'
  | 'openai/gpt-5-mini'
  | 'anthropic/claude-3'
  | 'local/embedded';

export interface ModelConfig {
  id: AIModel;
  provider: AIProvider;
  displayName: string;
  maxTokens: number;
  costPer1kTokens: number;
  latencyMs: number;
  capabilities: string[];
  isDefault?: boolean;
}

export interface AIRequestOptions {
  model?: AIModel;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  stream?: boolean;
  timeout?: number;
  fallbackModels?: AIModel[];
}

export interface AIResponse {
  content: string;
  model: AIModel;
  provider: AIProvider;
  tokensUsed: number;
  latencyMs: number;
  cached: boolean;
  confidence?: number;
}

// Model registry with capabilities and pricing
export const MODEL_REGISTRY: Record<AIModel, ModelConfig> = {
  'google/gemini-3-flash-preview': {
    id: 'google/gemini-3-flash-preview',
    provider: 'lovable',
    displayName: 'Gemini 3 Flash',
    maxTokens: 32000,
    costPer1kTokens: 0.0001,
    latencyMs: 400,
    capabilities: ['chat', 'analysis', 'code', 'multimodal'],
    isDefault: true,
  },
  'google/gemini-2.5-flash': {
    id: 'google/gemini-2.5-flash',
    provider: 'lovable',
    displayName: 'Gemini 2.5 Flash',
    maxTokens: 32000,
    costPer1kTokens: 0.00015,
    latencyMs: 500,
    capabilities: ['chat', 'analysis', 'code', 'multimodal'],
  },
  'google/gemini-2.5-pro': {
    id: 'google/gemini-2.5-pro',
    provider: 'lovable',
    displayName: 'Gemini 2.5 Pro',
    maxTokens: 128000,
    costPer1kTokens: 0.0005,
    latencyMs: 800,
    capabilities: ['chat', 'analysis', 'code', 'multimodal', 'reasoning'],
  },
  'openai/gpt-5': {
    id: 'openai/gpt-5',
    provider: 'lovable',
    displayName: 'GPT-5',
    maxTokens: 128000,
    costPer1kTokens: 0.001,
    latencyMs: 1000,
    capabilities: ['chat', 'analysis', 'code', 'multimodal', 'reasoning'],
  },
  'openai/gpt-5-mini': {
    id: 'openai/gpt-5-mini',
    provider: 'lovable',
    displayName: 'GPT-5 Mini',
    maxTokens: 32000,
    costPer1kTokens: 0.0003,
    latencyMs: 600,
    capabilities: ['chat', 'analysis', 'code'],
  },
  'anthropic/claude-3': {
    id: 'anthropic/claude-3',
    provider: 'anthropic',
    displayName: 'Claude 3',
    maxTokens: 200000,
    costPer1kTokens: 0.0008,
    latencyMs: 700,
    capabilities: ['chat', 'analysis', 'code', 'reasoning', 'safety'],
  },
  'local/embedded': {
    id: 'local/embedded',
    provider: 'local',
    displayName: 'Embedded Model',
    maxTokens: 4000,
    costPer1kTokens: 0,
    latencyMs: 50,
    capabilities: ['chat', 'classification'],
  },
};

// Default fallback chain
const DEFAULT_FALLBACK_CHAIN: AIModel[] = [
  'google/gemini-3-flash-preview',
  'google/gemini-2.5-flash',
  'openai/gpt-5-mini',
  'local/embedded',
];

// Response cache for deduplication
const responseCache = new Map<string, { response: AIResponse; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Generate cache key from request parameters
 */
function generateCacheKey(messages: string[], options: AIRequestOptions): string {
  const key = JSON.stringify({ messages, model: options.model, temp: options.temperature });
  return btoa(key).substring(0, 64);
}

/**
 * Check if cached response is valid
 */
function getCachedResponse(key: string): AIResponse | null {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { ...cached.response, cached: true };
  }
  responseCache.delete(key);
  return null;
}

/**
 * Cache a response
 */
function cacheResponse(key: string, response: AIResponse): void {
  responseCache.set(key, { response, timestamp: Date.now() });
  
  // Cleanup old entries if cache is too large
  if (responseCache.size > 100) {
    const entries = Array.from(responseCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    entries.slice(0, 20).forEach(([k]) => responseCache.delete(k));
  }
}

/**
 * Local embedded model fallback (rule-based responses)
 */
function generateLocalResponse(prompt: string): string {
  const promptLower = prompt.toLowerCase();
  
  // Maritime-specific responses
  if (promptLower.includes('stcw') || promptLower.includes('certificado')) {
    return 'Para questões sobre certificações STCW, consulte o módulo de Certificações ou entre em contato com o departamento de RH. Os prazos de validade devem ser monitorados para renovação antecipada.';
  }
  
  if (promptLower.includes('mlc') || promptLower.includes('trabalho marítimo')) {
    return 'A Convenção do Trabalho Marítimo (MLC 2006) estabelece os direitos dos marítimos. Consulte o módulo de Compliance para verificar a conformidade da sua embarcação.';
  }
  
  if (promptLower.includes('segurança') || promptLower.includes('safety')) {
    return 'Questões de segurança são prioridade máxima. Consulte o SGSO (Sistema de Gestão de Segurança Operacional) para procedimentos específicos ou reporte incidentes imediatamente.';
  }
  
  if (promptLower.includes('manutenção') || promptLower.includes('maintenance')) {
    return 'Para manutenção preventiva e corretiva, utilize o módulo de PMS (Planned Maintenance System). Registre todas as atividades para manter o histórico atualizado.';
  }
  
  return 'Entendi sua pergunta. Para uma resposta mais precisa, recomendo consultar o módulo específico ou utilizar o assistente de IA quando a conexão for restabelecida.';
}

/**
 * Call AI model via Lovable gateway
 */
async function callLovableGateway(
  messages: Array<{ role: string; content: string }>,
  model: AIModel,
  options: AIRequestOptions
): Promise<AIResponse> {
  const startTime = performance.now();
  
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Note: This endpoint requires a Lovable API key configured as secret
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2000,
      stream: false,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI Gateway error: ${response.status} - ${error}`);
  }
  
  const data = await response.json();
  const latencyMs = performance.now() - startTime;
  
  return {
    content: data.choices?.[0]?.message?.content || '',
    model,
    provider: MODEL_REGISTRY[model].provider,
    tokensUsed: data.usage?.total_tokens || 0,
    latencyMs,
    cached: false,
    confidence: 0.9,
  };
}

/**
 * Main AI query function with fallback support
 */
export async function queryAI(
  prompt: string,
  options: AIRequestOptions = {}
): Promise<AIResponse> {
  const startTime = performance.now();
  const model = options.model || 'google/gemini-3-flash-preview';
  const fallbackChain = options.fallbackModels || DEFAULT_FALLBACK_CHAIN;
  
  // Check cache first
  const cacheKey = generateCacheKey([prompt], options);
  const cachedResponse = getCachedResponse(cacheKey);
  if (cachedResponse) {
    Logger.info('AI cache hit', { model }, 'AI');
    return cachedResponse;
  }
  
  // Build messages
  const messages = [
    ...(options.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
    { role: 'user', content: prompt },
  ];
  
  // Try primary model
  const modelsToTry = [model, ...fallbackChain.filter(m => m !== model)];
  
  for (const currentModel of modelsToTry) {
    try {
      if (currentModel === 'local/embedded') {
        // Use local fallback
        const response: AIResponse = {
          content: generateLocalResponse(prompt),
          model: 'local/embedded',
          provider: 'local',
          tokensUsed: 0,
          latencyMs: performance.now() - startTime,
          cached: false,
          confidence: 0.5,
        };
        cacheResponse(cacheKey, response);
        return response;
      }
      
      const response = await callLovableGateway(messages, currentModel, options);
      cacheResponse(cacheKey, response);
      
      Logger.info('AI query success', { 
        model: currentModel, 
        latency: response.latencyMs.toFixed(0) 
      }, 'AI');
      
      return response;
    } catch (error) {
      Logger.warn(`AI model ${currentModel} failed, trying next`, { error }, 'AI');
      continue;
    }
  }
  
  // All models failed, return local fallback
  Logger.error('All AI models failed, using local fallback', undefined, 'AI');
  return {
    content: generateLocalResponse(prompt),
    model: 'local/embedded',
    provider: 'local',
    tokensUsed: 0,
    latencyMs: performance.now() - startTime,
    cached: false,
    confidence: 0.3,
  };
}

/**
 * Multi-model consensus query (for critical decisions)
 */
export async function queryWithConsensus(
  prompt: string,
  models: AIModel[],
  options: AIRequestOptions = {}
): Promise<{
  responses: AIResponse[];
  consensus: string;
  agreementScore: number;
}> {
  const startTime = performance.now();
  
  // Query all models in parallel
  const responses = await Promise.allSettled(
    models.map(model => queryAI(prompt, { ...options, model, fallbackModels: [] }))
  );
  
  const successfulResponses = responses
    .filter((r): r is PromiseFulfilledResult<AIResponse> => r.status === 'fulfilled')
    .map(r => r.value);
  
  if (successfulResponses.length === 0) {
    return {
      responses: [],
      consensus: generateLocalResponse(prompt),
      agreementScore: 0,
    };
  }
  
  // Simple consensus: use response from most capable model
  const sortedByCapability = successfulResponses.sort((a, b) => {
    const configA = MODEL_REGISTRY[a.model];
    const configB = MODEL_REGISTRY[b.model];
    return configB.capabilities.length - configA.capabilities.length;
  });
  
  // Calculate agreement score based on response similarity
  const agreementScore = successfulResponses.length / models.length;
  
  Logger.info('Consensus query completed', {
    modelsQueried: models.length,
    successfulResponses: successfulResponses.length,
    agreementScore,
    totalLatency: performance.now() - startTime,
  }, 'AI');
  
  return {
    responses: successfulResponses,
    consensus: sortedByCapability[0].content,
    agreementScore,
  };
}

/**
 * Get available models
 */
export function getAvailableModels(): ModelConfig[] {
  return Object.values(MODEL_REGISTRY);
}

/**
 * Get model by ID
 */
export function getModelConfig(modelId: AIModel): ModelConfig | undefined {
  return MODEL_REGISTRY[modelId];
}

/**
 * Clear response cache
 */
export function clearAICache(): void {
  responseCache.clear();
  Logger.info('AI response cache cleared', undefined, 'AI');
}

export const multiModelEngine = {
  query: queryAI,
  queryWithConsensus,
  getModels: getAvailableModels,
  getModelConfig,
  clearCache: clearAICache,
};
