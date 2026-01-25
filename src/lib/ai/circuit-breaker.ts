/**
 * Advanced Circuit Breaker for AI Services
 * Production-grade failure handling with multi-provider fallback
 */

import { logger } from "@/lib/utils/production-logger";

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerConfig {
  name: string;
  failureThreshold: number;
  successThreshold: number;
  timeout: number; // ms to wait before trying again
  monitorInterval?: number;
}

export interface CircuitStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailure: number | null;
  lastSuccess: number | null;
  totalRequests: number;
  totalFailures: number;
}

interface ProviderConfig {
  name: string;
  priority: number;
  endpoint: string;
  model: string;
  apiKeyEnv: string;
}

const PROVIDERS: ProviderConfig[] = [
  {
    name: 'lovable-gemini',
    priority: 1,
    endpoint: 'https://ai.gateway.lovable.dev/v1/chat/completions',
    model: 'google/gemini-3-flash-preview',
    apiKeyEnv: 'LOVABLE_API_KEY'
  },
  {
    name: 'lovable-gpt',
    priority: 2,
    endpoint: 'https://ai.gateway.lovable.dev/v1/chat/completions',
    model: 'openai/gpt-5-mini',
    apiKeyEnv: 'LOVABLE_API_KEY'
  },
  {
    name: 'lovable-gemini-lite',
    priority: 3,
    endpoint: 'https://ai.gateway.lovable.dev/v1/chat/completions',
    model: 'google/gemini-2.5-flash-lite',
    apiKeyEnv: 'LOVABLE_API_KEY'
  }
];

class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failures = 0;
  private successes = 0;
  private lastFailure: number | null = null;
  private lastSuccess: number | null = null;
  private totalRequests = 0;
  private totalFailures = 0;
  private config: CircuitBreakerConfig;

  constructor(config: CircuitBreakerConfig) {
    this.config = {
      ...config,
      monitorInterval: config.monitorInterval || 60000
    };
  }

  getStats(): CircuitStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailure: this.lastFailure,
      lastSuccess: this.lastSuccess,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures
    };
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalRequests++;

    if (this.state === 'OPEN') {
      if (Date.now() - (this.lastFailure || 0) > this.config.timeout) {
        this.state = 'HALF_OPEN';
        logger.debug(`[CircuitBreaker:${this.config.name}] Transitioning to HALF_OPEN`);
      } else {
        throw new Error(`Circuit breaker ${this.config.name} is OPEN`);
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.successes++;
    this.lastSuccess = Date.now();
    this.failures = 0;

    if (this.state === 'HALF_OPEN') {
      if (this.successes >= this.config.successThreshold) {
        this.state = 'CLOSED';
        logger.info(`[CircuitBreaker:${this.config.name}] Circuit CLOSED after recovery`);
      }
    }
  }

  private onFailure(): void {
    this.failures++;
    this.totalFailures++;
    this.lastFailure = Date.now();
    this.successes = 0;

    if (this.failures >= this.config.failureThreshold) {
      this.state = 'OPEN';
      logger.warn(`[CircuitBreaker:${this.config.name}] Circuit OPENED after ${this.failures} failures`);
    }
  }

  reset(): void {
    this.state = 'CLOSED';
    this.failures = 0;
    this.successes = 0;
  }
}

// Provider-specific circuit breakers
const circuitBreakers = new Map<string, CircuitBreaker>();

function getCircuitBreaker(providerName: string): CircuitBreaker {
  if (!circuitBreakers.has(providerName)) {
    circuitBreakers.set(providerName, new CircuitBreaker({
      name: providerName,
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 30000 // 30 seconds
    }));
  }
  return circuitBreakers.get(providerName)!;
}

export interface AIRequest {
  messages: Array<{ role: string; content: string }>;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface AIResponse {
  content: string;
  model: string;
  provider: string;
  tokens: { input: number; output: number };
  latencyMs: number;
  fromCache?: boolean;
  fromFallback?: boolean;
}

/**
 * Execute AI request with automatic fallback
 */
export async function executeWithFallback(
  request: AIRequest,
  options: { timeout?: number; preferredModel?: string } = {}
): Promise<AIResponse> {
  const startTime = Date.now();
  const timeout = options.timeout || 15000;
  const errors: Array<{ provider: string; error: string }> = [];

  // Sort providers by priority
  const sortedProviders = [...PROVIDERS].sort((a, b) => a.priority - b.priority);

  for (const provider of sortedProviders) {
    const breaker = getCircuitBreaker(provider.name);
    
    // Skip if circuit is open and not ready for retry
    if (breaker.getStats().state === 'OPEN') {
      const timeSinceFailure = Date.now() - (breaker.getStats().lastFailure || 0);
      if (timeSinceFailure < 30000) {
        console.log(`[AI] Skipping ${provider.name} - circuit OPEN`);
        continue;
      }
    }

    try {
      const result = await breaker.execute(async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          // This is a placeholder - actual implementation would be in edge function
          // In browser context, we call the edge function
          const response = await fetch('/api/ai-gateway', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider: provider.name,
              model: options.preferredModel || provider.model,
              messages: request.messages,
              maxTokens: request.maxTokens,
              temperature: request.temperature
            }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`${provider.name} error: ${response.status} - ${errorText}`);
          }

          const data = await response.json();
          
          return {
            content: data.content || data.choices?.[0]?.message?.content || '',
            model: data.model || provider.model,
            provider: provider.name,
            tokens: data.usage || { input: 0, output: 0 },
            latencyMs: Date.now() - startTime,
            fromFallback: provider.priority > 1
          };
        } finally {
          clearTimeout(timeoutId);
        }
      });

      logger.debug(`[AI] Success with ${provider.name} (${result.latencyMs}ms)`);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push({ provider: provider.name, error: errorMessage });
      logger.warn(`[AI] ${provider.name} failed: ${errorMessage}`);
    }
  }

  // All providers failed
  throw new Error(`All AI providers failed: ${JSON.stringify(errors)}`);
}

/**
 * Get health status of all circuits
 */
export function getCircuitHealth(): Record<string, CircuitStats> {
  const health: Record<string, CircuitStats> = {};
  for (const [name, breaker] of circuitBreakers) {
    health[name] = breaker.getStats();
  }
  return health;
}

/**
 * Reset a specific circuit breaker
 */
export function resetCircuit(providerName: string): void {
  const breaker = circuitBreakers.get(providerName);
  if (breaker) {
    breaker.reset();
    console.log(`[CircuitBreaker] Reset ${providerName}`);
  }
}

/**
 * Reset all circuit breakers
 */
export function resetAllCircuits(): void {
  for (const [name, breaker] of circuitBreakers) {
    breaker.reset();
  }
  console.log('[CircuitBreaker] All circuits reset');
}

export { PROVIDERS, CircuitBreaker };
