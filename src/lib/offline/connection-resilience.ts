/**
 * Connection Resilience - PATCH 850
 * Handles connection failures gracefully with retry and fallback strategies
 */

import { logger } from "@/lib/logger";

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export interface ConnectionState {
  isOnline: boolean;
  effectiveType: "4g" | "3g" | "2g" | "slow-2g" | "unknown";
  downlink: number; // Mbps
  rtt: number; // ms
  saveData: boolean;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
};

class ConnectionResilience {
  private state: ConnectionState;
  private listeners: Set<(state: ConnectionState) => void> = new Set();
  private pendingRequests: Map<string, AbortController> = new Map();

  constructor() {
    this.state = this.getInitialState();
    this.setupListeners();
  }

  private getInitialState(): ConnectionState {
    const conn = (navigator as any).connection;
    
    return {
      isOnline: navigator.onLine,
      effectiveType: conn?.effectiveType || "unknown",
      downlink: conn?.downlink || 10,
      rtt: conn?.rtt || 50,
      saveData: conn?.saveData || false,
    };
  }

  private setupListeners(): void {
    window.addEventListener("online", () => this.updateState({ isOnline: true }));
    window.addEventListener("offline", () => this.updateState({ isOnline: false }));

    if ("connection" in navigator) {
      const conn = (navigator as any).connection;
      conn?.addEventListener("change", () => {
        this.updateState({
          effectiveType: conn.effectiveType || "unknown",
          downlink: conn.downlink || 10,
          rtt: conn.rtt || 50,
          saveData: conn.saveData || false,
        });
      });
    }
  }

  private updateState(partial: Partial<ConnectionState>): void {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach(fn => fn(this.state));
    
    if (!this.state.isOnline) {
      logger.warn("[ConnectionResilience] Offline detected");
    }
  }

  getState(): ConnectionState {
    return { ...this.state };
  }

  isSlowConnection(): boolean {
    return (
      this.state.effectiveType === "2g" ||
      this.state.effectiveType === "slow-2g" ||
      this.state.downlink < 1
    );
  }

  subscribe(callback: (state: ConnectionState) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Fetch with automatic retry and exponential backoff
   */
  async fetchWithRetry(
    url: string,
    options: RequestInit = {},
    config: Partial<RetryConfig> = {}
  ): Promise<Response> {
    const cfg = { ...DEFAULT_RETRY_CONFIG, ...config };
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= cfg.maxRetries; attempt++) {
      // Skip if offline
      if (!this.state.isOnline) {
        throw new Error("No network connection");
      }

      try {
        const controller = new AbortController();
        const requestId = `${url}-${Date.now()}`;
        this.pendingRequests.set(requestId, controller);

        // Timeout based on connection quality
        const timeout = this.getAdaptiveTimeout();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        this.pendingRequests.delete(requestId);

        if (!response.ok && response.status >= 500) {
          throw new Error(`Server error: ${response.status}`);
        }

        return response;
      } catch (error) {
        lastError = error as Error;
        
        if ((error as Error).name === "AbortError") {
          logger.warn(`[ConnectionResilience] Request timeout, attempt ${attempt + 1}`);
        }

        if (attempt < cfg.maxRetries) {
          const delay = Math.min(
            cfg.baseDelayMs * Math.pow(cfg.backoffMultiplier, attempt),
            cfg.maxDelayMs
          );
          logger.warn(`[ConnectionResilience] Retry ${attempt + 1}/${cfg.maxRetries} in ${delay}ms`);
          await this.sleep(delay);
        }
      }
    }

    throw lastError || new Error("Request failed after retries");
  }

  /**
   * Get adaptive timeout based on connection quality
   */
  private getAdaptiveTimeout(): number {
    if (this.state.effectiveType === "slow-2g") return 30000;
    if (this.state.effectiveType === "2g") return 20000;
    if (this.state.effectiveType === "3g") return 15000;
    return 10000;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cancel all pending requests
   */
  cancelAllRequests(): void {
    this.pendingRequests.forEach((controller, id) => {
      controller.abort();
      logger.info(`[ConnectionResilience] Cancelled request: ${id}`);
    });
    this.pendingRequests.clear();
  }

  /**
   * Get recommended settings based on connection
   */
  getAdaptiveSettings() {
    const slow = this.isSlowConnection();
    
    return {
      imageQuality: slow ? 30 : 85,
      enableAnimations: !slow && !this.state.saveData,
      prefetchEnabled: !slow && this.state.isOnline,
      batchSize: slow ? 5 : 20,
      compressionEnabled: slow || this.state.saveData,
      lazyLoadThreshold: slow ? "500px" : "200px",
    };
  }
}

export const connectionResilience = new ConnectionResilience();
