/**
 * Circuit Breaker Pattern - PATCH 900
 * Prevents cascading failures and provides graceful degradation
 */

import { logger } from "@/lib/logger";

export type CircuitState = "closed" | "open" | "half-open";

export interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
  monitorInterval: number;
}

export interface CircuitStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailure: number | null;
  lastSuccess: number | null;
  totalRequests: number;
  failureRate: number;
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 3,
  timeout: 30000,
  monitorInterval: 10000,
};

class CircuitBreaker {
  private state: CircuitState = "closed";
  private failures = 0;
  private successes = 0;
  private lastFailure: number | null = null;
  private lastSuccess: number | null = null;
  private totalRequests = 0;
  private config: CircuitBreakerConfig;
  private listeners: Set<(stats: CircuitStats) => void> = new Set();
  private monitorTimer: number | null = null;

  constructor(
    private readonly name: string,
    config: Partial<CircuitBreakerConfig> = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startMonitoring();
  }

  private startMonitoring(): void {
    this.monitorTimer = window.setInterval(() => {
      this.checkStateTransition();
    }, this.config.monitorInterval);
  }

  private checkStateTransition(): void {
    if (this.state === "open" && this.lastFailure) {
      const elapsed = Date.now() - this.lastFailure;
      
      if (elapsed >= this.config.timeout) {
        this.transitionTo("half-open");
      }
    }
  }

  private transitionTo(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;
    
    logger.info(`[CircuitBreaker:${this.name}] State transition: ${oldState} -> ${newState}`);
    
    if (newState === "half-open") {
      this.successes = 0;
    }
    
    if (newState === "closed") {
      this.failures = 0;
      this.successes = 0;
    }
    
    this.notifyListeners();
  }

  private notifyListeners(): void {
    const stats = this.getStats();
    this.listeners.forEach(listener => listener(stats));
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalRequests++;
    
    if (this.state === "open") {
      const elapsed = this.lastFailure ? Date.now() - this.lastFailure : Infinity;
      
      if (elapsed < this.config.timeout) {
        logger.warn(`[CircuitBreaker:${this.name}] Circuit open, rejecting request`);
        throw new CircuitOpenError(this.name, this.config.timeout - elapsed);
      }
      
      this.transitionTo("half-open");
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
    
    if (this.state === "half-open") {
      if (this.successes >= this.config.successThreshold) {
        this.transitionTo("closed");
      }
    } else if (this.state === "closed") {
      // Decay failures over time on success
      this.failures = Math.max(0, this.failures - 1);
    }
    
    this.notifyListeners();
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailure = Date.now();
    
    if (this.state === "half-open") {
      this.transitionTo("open");
    } else if (this.state === "closed") {
      if (this.failures >= this.config.failureThreshold) {
        this.transitionTo("open");
      }
    }
    
    this.notifyListeners();
  }

  /**
   * Get current circuit statistics
   */
  getStats(): CircuitStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailure: this.lastFailure,
      lastSuccess: this.lastSuccess,
      totalRequests: this.totalRequests,
      failureRate: this.totalRequests > 0 
        ? this.failures / this.totalRequests 
        : 0,
    };
  }

  /**
   * Check if circuit is allowing requests
   */
  isAvailable(): boolean {
    return this.state !== "open";
  }

  /**
   * Force circuit to open state
   */
  trip(): void {
    this.transitionTo("open");
    this.lastFailure = Date.now();
  }

  /**
   * Force circuit to closed state
   */
  reset(): void {
    this.transitionTo("closed");
    this.failures = 0;
    this.successes = 0;
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback: (stats: CircuitStats) => void): () => void {
    this.listeners.add(callback);
    callback(this.getStats()); // Immediate update
    return () => this.listeners.delete(callback);
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.monitorTimer) {
      clearInterval(this.monitorTimer);
    }
    this.listeners.clear();
  }
}

/**
 * Custom error for circuit open state
 */
export class CircuitOpenError extends Error {
  constructor(
    public readonly circuitName: string,
    public readonly retryAfterMs: number
  ) {
    super(`Circuit breaker '${circuitName}' is open. Retry after ${retryAfterMs}ms`);
    this.name = "CircuitOpenError";
  }
}

/**
 * Circuit breaker registry for multiple services
 */
class CircuitBreakerRegistry {
  private circuits: Map<string, CircuitBreaker> = new Map();

  get(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (!this.circuits.has(name)) {
      this.circuits.set(name, new CircuitBreaker(name, config));
    }
    return this.circuits.get(name)!;
  }

  getAll(): Map<string, CircuitBreaker> {
    return new Map(this.circuits);
  }

  getAllStats(): Record<string, CircuitStats> {
    const stats: Record<string, CircuitStats> = {};
    
    for (const [name, circuit] of this.circuits) {
      stats[name] = circuit.getStats();
    }
    
    return stats;
  }

  resetAll(): void {
    for (const circuit of this.circuits.values()) {
      circuit.reset();
    }
  }

  destroy(): void {
    for (const circuit of this.circuits.values()) {
      circuit.destroy();
    }
    this.circuits.clear();
  }
}

export const circuitBreakerRegistry = new CircuitBreakerRegistry();

/**
 * Pre-configured circuit breakers for common services
 */
export const circuits = {
  supabase: circuitBreakerRegistry.get("supabase", {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 30000,
  }),
  api: circuitBreakerRegistry.get("api", {
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 20000,
  }),
  sync: circuitBreakerRegistry.get("sync", {
    failureThreshold: 3,
    successThreshold: 1,
    timeout: 60000,
  }),
};

/**
 * Wrapper for fetch with circuit breaker
 */
export async function protectedFetch(
  circuitName: string,
  url: string,
  options?: RequestInit
): Promise<Response> {
  const circuit = circuitBreakerRegistry.get(circuitName);
  
  return circuit.execute(async () => {
    const response = await fetch(url, options);
    
    // Treat 5xx as failures
    if (response.status >= 500) {
      throw new Error(`Server error: ${response.status}`);
    }
    
    return response;
  });
}
