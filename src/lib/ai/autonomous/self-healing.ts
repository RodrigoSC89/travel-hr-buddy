/**
 * Self-Healing System
 * Automatic detection and repair of system issues
 * NAUTILUS ONE v4.0 - Autonomous Platform
 */

import { logger } from '@/lib/utils/production-logger';
import { logger } from '@/lib/logger';

export interface HealthIssue {
  id: string;
  type: 'performance-degradation' | 'memory-leak' | 'database-connection-error' | 
        'api-timeout' | 'cache-stale' | 'sync-failure' | 'component-error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  module: string;
  description: string;
  detectedAt: Date;
  autoRepaired: boolean;
  repairAction?: string;
  repairedAt?: Date;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  score: number; // 0-100
  issues: HealthIssue[];
  lastCheck: Date;
  memoryUsage: number;
  cacheHitRate: number;
  apiLatency: number;
  errorRate: number;
}

/**
 * Self-Healing System
 * Monitors and auto-repairs system issues
 */
export class SelfHealingSystem {
  private monitorInterval: ReturnType<typeof setInterval> | null = null;
  private health: SystemHealth = {
    status: 'healthy',
    score: 100,
    issues: [],
    lastCheck: new Date(),
    memoryUsage: 0,
    cacheHitRate: 100,
    apiLatency: 0,
    errorRate: 0,
  };
  private listeners: Map<string, ((data: unknown) => void)[]> = new Map();
  private repairHistory: HealthIssue[] = [];
  private errorCounts: Map<string, number> = new Map();
  private lastRepairTime: Map<string, number> = new Map();

  /**
   * Start self-healing monitoring
   */
  start(intervalMs = 30000): void {
    if (this.monitorInterval) {
      logger.debug('[SelfHealing] Already running');
      return;
    }

    logger.info('[SelfHealing] Starting monitoring...');

    this.monitorInterval = setInterval(() => {
      this.runHealthCheck();
    }, intervalMs);

    // Initial check
    this.runHealthCheck();

    this.emit('started', { intervalMs });
  }

  /**
   * Stop self-healing monitoring
   */
  stop(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    logger.debug('[SelfHealing] Stopped');
    this.emit('stopped', {});
  }

  /**
   * Run health check and auto-repair
   */
  private async runHealthCheck(): Promise<void> {
    const checkStart = Date.now();
    const issues: HealthIssue[] = [];

    try {
      // Check memory usage
      const memoryIssue = this.checkMemoryUsage();
      if (memoryIssue) issues.push(memoryIssue);

      // Check cache health
      const cacheIssue = this.checkCacheHealth();
      if (cacheIssue) issues.push(cacheIssue);

      // Check API health
      const apiIssue = await this.checkAPIHealth();
      if (apiIssue) issues.push(apiIssue);

      // Check error rates
      const errorIssue = this.checkErrorRates();
      if (errorIssue) issues.push(errorIssue);

      // Check localStorage health
      const storageIssue = this.checkStorageHealth();
      if (storageIssue) issues.push(storageIssue);

      // Auto-repair issues
      for (const issue of issues) {
        if (this.shouldAutoRepair(issue)) {
          await this.repairIssue(issue);
        }
      }

      // Update health status
      this.health = {
        ...this.health,
        status: this.calculateStatus(issues),
        score: this.calculateScore(issues),
        issues,
        lastCheck: new Date(),
      };

      const duration = Date.now() - checkStart;
      logger.debug(`[SelfHealing] Health check completed in ${duration}ms - Status: ${this.health.status}, Score: ${this.health.score}`);

      this.emit('health-check', this.health);

    } catch (error) {
      logger.error('[SelfHealing] Health check failed:', error);
      this.emit('error', error);
    }
  }

  /**
   * Check memory usage
   */
  private checkMemoryUsage(): HealthIssue | null {
    // Use Performance API if available
    if ('memory' in performance) {
      const memory = (performance as unknown as { memory: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      this.health.memoryUsage = usagePercent;

      if (usagePercent > 90) {
        return {
          id: `memory-${Date.now()}`,
          type: 'memory-leak',
          severity: usagePercent > 95 ? 'critical' : 'high',
          module: 'system',
          description: `Uso de memória em ${usagePercent.toFixed(1)}%`,
          detectedAt: new Date(),
          autoRepaired: false,
        };
      }
    }
    return null;
  }

  /**
   * Check cache health
   */
  private checkCacheHealth(): HealthIssue | null {
    try {
      const cacheStats = this.getCacheStats();
      this.health.cacheHitRate = cacheStats.hitRate;

      if (cacheStats.hitRate < 50 && cacheStats.totalRequests > 100) {
        return {
          id: `cache-${Date.now()}`,
          type: 'cache-stale',
          severity: cacheStats.hitRate < 25 ? 'high' : 'medium',
          module: 'cache',
          description: `Taxa de cache hit baixa: ${cacheStats.hitRate.toFixed(1)}%`,
          detectedAt: new Date(),
          autoRepaired: false,
        };
      }
    } catch {
      // Cache not available
    }
    return null;
  }

  /**
   * Check API health
   */
  private async checkAPIHealth(): Promise<HealthIssue | null> {
    const start = Date.now();
    
    try {
      // Simple ping to check connectivity
      const response = await fetch('/api/health', { 
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      }).catch(() => null);

      const latency = Date.now() - start;
      this.health.apiLatency = latency;

      if (latency > 3000) {
        return {
          id: `api-${Date.now()}`,
          type: 'api-timeout',
          severity: latency > 5000 ? 'high' : 'medium',
          module: 'api',
          description: `Latência da API alta: ${latency}ms`,
          detectedAt: new Date(),
          autoRepaired: false,
        };
      }

      if (response && !response.ok) {
        return {
          id: `api-error-${Date.now()}`,
          type: 'api-timeout',
          severity: 'high',
          module: 'api',
          description: `API retornou status ${response.status}`,
          detectedAt: new Date(),
          autoRepaired: false,
        };
      }
    } catch {
      // Expected for non-existent endpoint
    }

    return null;
  }

  /**
   * Check error rates
   */
  private checkErrorRates(): HealthIssue | null {
    const totalErrors = Array.from(this.errorCounts.values()).reduce((a, b) => a + b, 0);
    const errorRate = totalErrors / 100; // Normalized
    this.health.errorRate = errorRate;

    if (totalErrors > 50) {
      const topModule = this.getTopErrorModule();
      return {
        id: `errors-${Date.now()}`,
        type: 'component-error',
        severity: totalErrors > 100 ? 'critical' : 'high',
        module: topModule || 'unknown',
        description: `Alta taxa de erros: ${totalErrors} erros recentes no módulo ${topModule}`,
        detectedAt: new Date(),
        autoRepaired: false,
      };
    }

    return null;
  }

  /**
   * Check localStorage health
   */
  private checkStorageHealth(): HealthIssue | null {
    try {
      const testKey = '__health_check__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);

      // Check if localStorage is near quota
      let totalSize = 0;
      for (const key of Object.keys(localStorage)) {
        totalSize += localStorage.getItem(key)?.length || 0;
      }

      const sizeInMB = totalSize / (1024 * 1024);
      if (sizeInMB > 4) { // Most browsers have 5MB limit
        return {
          id: `storage-${Date.now()}`,
          type: 'cache-stale',
          severity: sizeInMB > 4.5 ? 'high' : 'medium',
          module: 'storage',
          description: `localStorage quase cheio: ${sizeInMB.toFixed(2)}MB`,
          detectedAt: new Date(),
          autoRepaired: false,
        };
      }
    } catch {
      return {
        id: `storage-error-${Date.now()}`,
        type: 'database-connection-error',
        severity: 'high',
        module: 'storage',
        description: 'localStorage inacessível',
        detectedAt: new Date(),
        autoRepaired: false,
      };
    }

    return null;
  }

  /**
   * Should auto-repair this issue?
   */
  private shouldAutoRepair(issue: HealthIssue): boolean {
    // Don't repair too frequently
    const lastRepair = this.lastRepairTime.get(issue.type);
    if (lastRepair && Date.now() - lastRepair < 60000) {
      return false;
    }

    // Auto-repair based on type
    const autoRepairTypes: string[] = [
      'memory-leak',
      'cache-stale',
      'component-error',
    ];

    return autoRepairTypes.includes(issue.type);
  }

  /**
   * Repair an issue
   */
  private async repairIssue(issue: HealthIssue): Promise<void> {
    logger.debug(`[SelfHealing] Repairing issue: ${issue.type}`);

    try {
      switch (issue.type) {
        case 'memory-leak':
          await this.clearMemoryCache();
          issue.repairAction = 'Cleared memory caches and unused objects';
          break;

        case 'cache-stale':
          await this.refreshCache();
          issue.repairAction = 'Refreshed stale cache entries';
          break;

        case 'component-error':
          this.resetErrorCounts();
          issue.repairAction = 'Reset error counters and cleared error state';
          break;

        case 'api-timeout':
          // Can't really repair, but log it
          issue.repairAction = 'Logged API timeout for monitoring';
          break;

        default:
          logger.debug(`[SelfHealing] No auto-repair for ${issue.type}`);
          return;
      }

      issue.autoRepaired = true;
      issue.repairedAt = new Date();
      this.lastRepairTime.set(issue.type, Date.now());
      this.repairHistory.push(issue);

      logger.debug(`[SelfHealing] Repaired: ${issue.repairAction}`);
      this.emit('repaired', issue);

    } catch (error) {
      logger.error(`[SelfHealing] Repair failed for ${issue.type}:`, error);
      this.emit('repair-failed', { issue, error });
    }
  }

  /**
   * Clear memory cache
   */
  private async clearMemoryCache(): Promise<void> {
    // Clear React Query cache if available
    if (typeof window !== 'undefined' && (window as unknown as { queryClient?: { clear: () => void } }).queryClient) {
      (window as unknown as { queryClient: { clear: () => void } }).queryClient.clear();
    }

    // Clear any global caches
    const cacheKeys = ['nautilus_cache_', 'offline_', 'temp_'];
    for (const key of Object.keys(localStorage)) {
      if (cacheKeys.some(prefix => key.startsWith(prefix))) {
        localStorage.removeItem(key);
      }
    }

    // Force garbage collection hint
    if (typeof window !== 'undefined') {
      (window as unknown as { gc?: () => void }).gc?.();
    }
  }

  /**
   * Refresh stale cache
   */
  private async refreshCache(): Promise<void> {
    // Clear old cache entries
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const key of Object.keys(localStorage)) {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          if (parsed.timestamp && now - parsed.timestamp > maxAge) {
            localStorage.removeItem(key);
          }
        }
      } catch {
        // Not a cached item with timestamp
      }
    }
  }

  /**
   * Get cache statistics
   */
  private getCacheStats(): { hitRate: number; totalRequests: number } {
    const stats = localStorage.getItem('cache_stats');
    if (stats) {
      try {
        return JSON.parse(stats);
      } catch {
        // Ignore
      }
    }
    return { hitRate: 100, totalRequests: 0 };
  }

  /**
   * Get module with most errors
   */
  private getTopErrorModule(): string | null {
    let maxErrors = 0;
    let topModule: string | null = null;

    for (const [module, count] of this.errorCounts.entries()) {
      if (count > maxErrors) {
        maxErrors = count;
        topModule = module;
      }
    }

    return topModule;
  }

  /**
   * Reset error counts
   */
  private resetErrorCounts(): void {
    this.errorCounts.clear();
  }

  /**
   * Calculate health status
   */
  private calculateStatus(issues: HealthIssue[]): SystemHealth['status'] {
    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const highCount = issues.filter(i => i.severity === 'high').length;

    if (criticalCount > 0) return 'critical';
    if (highCount > 2) return 'critical';
    if (highCount > 0 || issues.length > 3) return 'degraded';
    return 'healthy';
  }

  /**
   * Calculate health score
   */
  private calculateScore(issues: HealthIssue[]): number {
    let score = 100;

    for (const issue of issues) {
      switch (issue.severity) {
        case 'critical':
          score -= 30;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 5;
          break;
        case 'low':
          score -= 2;
          break;
      }
    }

    return Math.max(0, score);
  }

  /**
   * Report an error from external source
   */
  reportError(module: string, error: Error): void {
    const count = (this.errorCounts.get(module) || 0) + 1;
    this.errorCounts.set(module, count);

    logger.debug(`[SelfHealing] Error reported from ${module}: ${error.message}`);
    this.emit('error-reported', { module, error, count });
  }

  /**
   * Get current health status
   */
  getHealth(): SystemHealth {
    return { ...this.health };
  }

  /**
   * Get repair history
   */
  getRepairHistory(): HealthIssue[] {
    return [...this.repairHistory];
  }

  /**
   * Event emitter
   */
  on(event: string, callback: (data: unknown) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: (data: unknown) => void): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: unknown): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }
}

// Singleton instance
export const selfHealingSystem = new SelfHealingSystem();
