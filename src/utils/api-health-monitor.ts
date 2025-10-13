/**
 * API Health Monitoring Utility
 * Monitors the health of external API connections and implements circuit breaker pattern
 */

import { logger } from "@/lib/logger";

interface APIHealthStatus {
  name: string;
  status: "healthy" | "degraded" | "down";
  lastCheck: Date;
  responseTime?: number;
  errorCount: number;
  successCount: number;
}

interface CircuitBreakerState {
  state: "closed" | "open" | "half-open";
  failures: number;
  lastFailureTime: number;
  nextRetryTime: number;
}

export class APIHealthMonitor {
  private healthStatus: Map<string, APIHealthStatus> = new Map();
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private readonly failureThreshold = 5; // Open circuit after 5 failures
  private readonly timeoutThreshold = 60000; // Reset circuit after 1 minute
  private readonly checkInterval = 30000; // Health check every 30 seconds
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<(status: Map<string, APIHealthStatus>) => void> = new Set();

  constructor() {
    this.initializeAPIs();
    this.startMonitoring();
  }

  private initializeAPIs() {
    const apis = ["openai", "supabase", "realtime"];
    
    apis.forEach(api => {
      this.healthStatus.set(api, {
        name: api,
        status: "healthy",
        lastCheck: new Date(),
        errorCount: 0,
        successCount: 0
      });
      
      this.circuitBreakers.set(api, {
        state: "closed",
        failures: 0,
        lastFailureTime: 0,
        nextRetryTime: 0
      });
    });
  }

  /**
   * Check if an API call should be allowed based on circuit breaker state
   */
  public canMakeRequest(apiName: string): boolean {
    const breaker = this.circuitBreakers.get(apiName);
    if (!breaker) return true;

    const now = Date.now();

    switch (breaker.state) {
    case "closed":
      return true;
      
    case "open":
      // Check if we should transition to half-open
      if (now >= breaker.nextRetryTime) {
        breaker.state = "half-open";
        logger.log(`Circuit breaker for ${apiName} transitioned to half-open`);
        return true;
      }
      logger.warn(`Circuit breaker for ${apiName} is open, blocking request`);
      return false;
      
    case "half-open":
      // Allow one request to test if service recovered
      return true;
      
    default:
      return true;
    }
  }

  /**
   * Record a successful API call
   */
  public recordSuccess(apiName: string, responseTime?: number) {
    const status = this.healthStatus.get(apiName);
    const breaker = this.circuitBreakers.get(apiName);
    
    if (status) {
      status.successCount++;
      status.errorCount = Math.max(0, status.errorCount - 1); // Reduce error count
      status.lastCheck = new Date();
      status.responseTime = responseTime;
      
      // Update status based on response time
      if (responseTime && responseTime > 5000) {
        status.status = "degraded";
      } else {
        status.status = "healthy";
      }
    }
    
    if (breaker) {
      // Reset circuit breaker on success
      if (breaker.state === "half-open") {
        breaker.state = "closed";
        breaker.failures = 0;
        logger.log(`Circuit breaker for ${apiName} closed after successful request`);
      } else if (breaker.state === "closed") {
        breaker.failures = Math.max(0, breaker.failures - 1);
      }
    }
    
    this.notifyListeners();
  }

  /**
   * Record a failed API call
   */
  public recordFailure(apiName: string, error?: Error) {
    const status = this.healthStatus.get(apiName);
    const breaker = this.circuitBreakers.get(apiName);
    
    if (status) {
      status.errorCount++;
      status.lastCheck = new Date();
      
      // Update status based on error count
      if (status.errorCount >= 10) {
        status.status = "down";
      } else if (status.errorCount >= 3) {
        status.status = "degraded";
      }
    }
    
    if (breaker) {
      breaker.failures++;
      breaker.lastFailureTime = Date.now();
      
      // Open circuit breaker if threshold exceeded
      if (breaker.failures >= this.failureThreshold && breaker.state === "closed") {
        breaker.state = "open";
        breaker.nextRetryTime = Date.now() + this.timeoutThreshold;
        logger.error(`Circuit breaker for ${apiName} opened after ${breaker.failures} failures`);
      }
      
      // If already half-open and still failing, go back to open
      if (breaker.state === "half-open") {
        breaker.state = "open";
        breaker.nextRetryTime = Date.now() + this.timeoutThreshold;
        logger.error(`Circuit breaker for ${apiName} reopened after failed retry`);
      }
    }
    
    logger.error(`API failure recorded for ${apiName}:`, error?.message);
    this.notifyListeners();
  }

  /**
   * Get health status for a specific API
   */
  public getAPIStatus(apiName: string): APIHealthStatus | undefined {
    return this.healthStatus.get(apiName);
  }

  /**
   * Get all API health statuses
   */
  public getAllStatuses(): Map<string, APIHealthStatus> {
    return new Map(this.healthStatus);
  }

  /**
   * Get circuit breaker state
   */
  public getCircuitBreakerState(apiName: string): CircuitBreakerState | undefined {
    return this.circuitBreakers.get(apiName);
  }

  /**
   * Subscribe to health status changes
   */
  public subscribe(callback: (status: Map<string, APIHealthStatus>) => void): () => void {
    this.listeners.add(callback);
    // Immediately notify with current status
    callback(this.getAllStatuses());
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners() {
    const status = this.getAllStatuses();
    this.listeners.forEach(listener => listener(status));
  }

  private startMonitoring() {
    // Periodic health check (could be enhanced to actually ping APIs)
    this.intervalId = setInterval(() => {
      this.healthStatus.forEach((status, name) => {
        // Reset error counts gradually if no recent failures
        const timeSinceLastCheck = Date.now() - status.lastCheck.getTime();
        if (timeSinceLastCheck > 60000 && status.errorCount > 0) {
          status.errorCount = Math.max(0, status.errorCount - 1);
          if (status.errorCount < 3) {
            status.status = "healthy";
          } else if (status.errorCount < 10) {
            status.status = "degraded";
          }
        }
      });
      
      this.notifyListeners();
    }, this.checkInterval);
  }

  /**
   * Stop monitoring and cleanup
   */
  public destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.listeners.clear();
  }

  /**
   * Manually reset a circuit breaker
   */
  public resetCircuitBreaker(apiName: string) {
    const breaker = this.circuitBreakers.get(apiName);
    if (breaker) {
      breaker.state = "closed";
      breaker.failures = 0;
      breaker.lastFailureTime = 0;
      breaker.nextRetryTime = 0;
      logger.log(`Circuit breaker for ${apiName} manually reset`);
    }
  }
}

// Singleton instance
export const apiHealthMonitor = new APIHealthMonitor();
