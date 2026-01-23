/**
 * Circuit Breaker Pattern Implementation
 * 
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Circuit tripped, requests fail immediately
 * - HALF_OPEN: Testing if service recovered
 * 
 * @author Nauti One Engineering
 * @version 4.1.0
 */

import { logger } from '@/lib/logger';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerConfig {
  /** Number of failures before opening circuit */
  failureThreshold: number;
  /** Time in ms before attempting recovery (half-open) */
  resetTimeout: number;
  /** Number of successful calls needed to close circuit */
  successThreshold: number;
  /** Request timeout in ms */
  timeout: number;
  /** Name for logging */
  name: string;
}

export interface CircuitBreakerMetrics {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailure: Date | null;
  lastSuccess: Date | null;
  totalRequests: number;
  totalFailures: number;
  totalSuccesses: number;
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeout: 30000, // 30 seconds
  successThreshold: 2,
  timeout: 30000, // 30 seconds
  name: 'default',
};

class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failures = 0;
  private successes = 0;
  private lastFailureTime: Date | null = null;
  private lastSuccessTime: Date | null = null;
  private totalRequests = 0;
  private totalFailures = 0;
  private totalSuccesses = 0;
  private config: CircuitBreakerConfig;
  private listeners: Set<(metrics: CircuitBreakerMetrics) => void> = new Set();

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  getMetrics(): CircuitBreakerMetrics {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailure: this.lastFailureTime,
      lastSuccess: this.lastSuccessTime,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures,
      totalSuccesses: this.totalSuccesses,
    };
  }

  subscribe(listener: (metrics: CircuitBreakerMetrics) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const metrics = this.getMetrics();
    this.listeners.forEach(listener => listener(metrics));
  }

  private transitionTo(newState: CircuitState): void {
    if (this.state !== newState) {
      logger.info(`[CircuitBreaker:${this.config.name}] State transition`, { from: this.state, to: newState });
      this.state = newState;
      this.notifyListeners();
    }
  }

  private shouldAllowRequest(): boolean {
    if (this.state === 'CLOSED') {
      return true;
    }

    if (this.state === 'OPEN') {
      // Check if reset timeout has passed
      if (this.lastFailureTime) {
        const timeSinceFailure = Date.now() - this.lastFailureTime.getTime();
        if (timeSinceFailure >= this.config.resetTimeout) {
          this.transitionTo('HALF_OPEN');
          return true;
        }
      }
      return false;
    }

    // HALF_OPEN: allow limited requests to test recovery
    return true;
  }

  private onSuccess(): void {
    this.lastSuccessTime = new Date();
    this.totalSuccesses++;
    this.successes++;
    this.failures = 0;

    if (this.state === 'HALF_OPEN') {
      if (this.successes >= this.config.successThreshold) {
        this.transitionTo('CLOSED');
        this.successes = 0;
      }
    }

    this.notifyListeners();
  }

  private onFailure(error: Error): void {
    this.lastFailureTime = new Date();
    this.totalFailures++;
    this.failures++;
    this.successes = 0;

    if (this.state === 'HALF_OPEN') {
      this.transitionTo('OPEN');
    } else if (this.state === 'CLOSED') {
      if (this.failures >= this.config.failureThreshold) {
        this.transitionTo('OPEN');
      }
    }

    logger.warn(`[CircuitBreaker:${this.config.name}] Failure #${this.failures}`, { error: error.message });
    this.notifyListeners();
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalRequests++;

    if (!this.shouldAllowRequest()) {
      const error = new Error(`Circuit breaker is OPEN for ${this.config.name}`);
      error.name = 'CircuitBreakerOpenError';
      throw error;
    }

    try {
      // Add timeout wrapper
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Request timeout after ${this.config.timeout}ms`));
          }, this.config.timeout);
        }),
      ]);

      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  reset(): void {
    this.state = 'CLOSED';
    this.failures = 0;
    this.successes = 0;
    this.notifyListeners();
    logger.info(`[CircuitBreaker:${this.config.name}] Manually reset`);
  }

  getState(): CircuitState {
    return this.state;
  }

  isOpen(): boolean {
    return this.state === 'OPEN';
  }

  isClosed(): boolean {
    return this.state === 'CLOSED';
  }
}

// ============================================
// CIRCUIT BREAKER REGISTRY
// ============================================

interface CircuitRegistry {
  [key: string]: CircuitBreaker;
}

const registry: CircuitRegistry = {};

// Tier 1: Critical APIs
registry['supabase'] = new CircuitBreaker({
  name: 'supabase',
  failureThreshold: 10,
  resetTimeout: 10000,
  successThreshold: 3,
  timeout: 30000,
});

registry['lovable-ai'] = new CircuitBreaker({
  name: 'lovable-ai',
  failureThreshold: 5,
  resetTimeout: 30000,
  successThreshold: 2,
  timeout: 60000,
});

registry['gemini'] = new CircuitBreaker({
  name: 'gemini',
  failureThreshold: 5,
  resetTimeout: 30000,
  successThreshold: 2,
  timeout: 60000,
});

registry['gpt'] = new CircuitBreaker({
  name: 'gpt',
  failureThreshold: 5,
  resetTimeout: 30000,
  successThreshold: 2,
  timeout: 60000,
});

// Tier 2: Important APIs
registry['stripe'] = new CircuitBreaker({
  name: 'stripe',
  failureThreshold: 3,
  resetTimeout: 60000,
  successThreshold: 2,
  timeout: 30000,
});

registry['docusign'] = new CircuitBreaker({
  name: 'docusign',
  failureThreshold: 3,
  resetTimeout: 60000,
  successThreshold: 2,
  timeout: 45000,
});

registry['marine-traffic'] = new CircuitBreaker({
  name: 'marine-traffic',
  failureThreshold: 5,
  resetTimeout: 30000,
  successThreshold: 2,
  timeout: 30000,
});

registry['stormglass'] = new CircuitBreaker({
  name: 'stormglass',
  failureThreshold: 5,
  resetTimeout: 30000,
  successThreshold: 2,
  timeout: 30000,
});

// Tier 3: Auxiliary APIs
registry['elevenlabs'] = new CircuitBreaker({
  name: 'elevenlabs',
  failureThreshold: 5,
  resetTimeout: 60000,
  successThreshold: 2,
  timeout: 30000,
});

registry['mapbox'] = new CircuitBreaker({
  name: 'mapbox',
  failureThreshold: 5,
  resetTimeout: 30000,
  successThreshold: 2,
  timeout: 15000,
});

registry['twilio'] = new CircuitBreaker({
  name: 'twilio',
  failureThreshold: 3,
  resetTimeout: 60000,
  successThreshold: 2,
  timeout: 30000,
});

// ============================================
// EXPORTS
// ============================================

export function getCircuitBreaker(name: string): CircuitBreaker {
  if (!registry[name]) {
    // Create a default circuit breaker for unknown services
    registry[name] = new CircuitBreaker({ name });
  }
  return registry[name];
}

export function getAllCircuitBreakers(): { name: string; metrics: CircuitBreakerMetrics }[] {
  return Object.entries(registry).map(([name, breaker]) => ({
    name,
    metrics: breaker.getMetrics(),
  }));
}

export function resetAllCircuitBreakers(): void {
  Object.values(registry).forEach(breaker => breaker.reset());
}

export { CircuitBreaker };
export default CircuitBreaker;
