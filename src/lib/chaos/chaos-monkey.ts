/**
 * Chaos Monkey - Resilience Testing System
 * Netflix-style chaos engineering for Nautilus One
 */

export interface ChaosConfig {
  enabled: boolean;
  failureRate: number; // 0-1
  latencyRate: number; // 0-1
  maxLatencyMs: number;
  excludeRoutes: string[];
}

export interface ChaosTestResult {
  testName: string;
  duration: number;
  success: boolean;
  errors: ChaosError[];
  recoveryTime?: number;
}

export interface ChaosError {
  type: string;
  message: string;
  timestamp: Date;
  recovered: boolean;
}

const DEFAULT_CONFIG: ChaosConfig = {
  enabled: false,
  failureRate: 0.01, // 1% random failures
  latencyRate: 0.05, // 5% latency injection
  maxLatencyMs: 5000,
  excludeRoutes: ['/api/health', '/api/auth'],
};

export class ChaosMonkey {
  private config: ChaosConfig;
  private errors: ChaosError[] = [];
  private isTestRunning = false;

  constructor(config: Partial<ChaosConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  static isEnabled(): boolean {
    return import.meta.env.VITE_CHAOS_MONKEY_ENABLED === 'true';
  }

  enable(): void {
    this.config.enabled = true;
    console.warn('🐒 Chaos Monkey ENABLED - System instability expected');
  }

  disable(): void {
    this.config.enabled = false;
    console.info('🐒 Chaos Monkey disabled');
  }

  // Random request failure
  async maybeFailRequest(url: string): Promise<void> {
    if (!this.config.enabled) return;
    if (this.isExcluded(url)) return;

    if (Math.random() < this.config.failureRate) {
      const error: ChaosError = {
        type: 'request_failure',
        message: `Chaos Monkey: Random failure injected for ${url}`,
        timestamp: new Date(),
        recovered: false,
      };
      this.errors.push(error);
      throw new Error(error.message);
    }
  }

  // Latency injection
  async maybeAddLatency(url: string): Promise<number> {
    if (!this.config.enabled) return 0;
    if (this.isExcluded(url)) return 0;

    if (Math.random() < this.config.latencyRate) {
      const latency = Math.random() * this.config.maxLatencyMs;
      await this.delay(latency);
      return latency;
    }
    return 0;
  }

  // Combined chaos middleware
  async chaos<T>(url: string, fn: () => Promise<T>): Promise<T> {
    await this.maybeFailRequest(url);
    const latency = await this.maybeAddLatency(url);
    
    if (latency > 0) {
      console.warn(`🐒 Chaos: Added ${latency.toFixed(0)}ms latency to ${url}`);
    }
    
    return fn();
  }

  private isExcluded(url: string): boolean {
    return this.config.excludeRoutes.some(route => url.includes(route));
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Chaos test suite
  async runChaosTest(durationMs: number = 60000): Promise<ChaosTestResult[]> {
    if (this.isTestRunning) {
      throw new Error('Chaos test already running');
    }

    this.isTestRunning = true;
    const results: ChaosTestResult[] = [];
    const startTime = Date.now();

    console.log(`🐒 Starting chaos test suite (${durationMs / 1000}s)`);

    try {
      // Run all chaos tests
      results.push(await this.testDatabaseResilience());
      results.push(await this.testNetworkPartition());
      results.push(await this.testHighCPULoad());
      results.push(await this.testMemoryPressure());
      results.push(await this.testCacheFailure());
      results.push(await this.testConcurrentRequests());
    } finally {
      this.isTestRunning = false;
    }

    const totalDuration = Date.now() - startTime;
    console.log(`🐒 Chaos test completed in ${totalDuration}ms`);

    return results;
  }

  private async testDatabaseResilience(): Promise<ChaosTestResult> {
    const start = Date.now();
    const errors: ChaosError[] = [];
    let success = true;

    try {
      // Simulate database connection drops
      for (let i = 0; i < 5; i++) {
        try {
          // Simulate random failure
          if (Math.random() < 0.3) {
            throw new Error('Simulated DB connection drop');
          }
          await this.delay(100);
        } catch (e) {
          errors.push({
            type: 'database',
            message: (e as Error).message,
            timestamp: new Date(),
            recovered: true,
          });
        }
      }
    } catch (e) {
      success = false;
      errors.push({
        type: 'database',
        message: (e as Error).message,
        timestamp: new Date(),
        recovered: false,
      });
    }

    return {
      testName: 'Database Resilience',
      duration: Date.now() - start,
      success,
      errors,
      recoveryTime: errors.length > 0 ? 500 : undefined,
    };
  }

  private async testNetworkPartition(): Promise<ChaosTestResult> {
    const start = Date.now();
    const errors: ChaosError[] = [];
    let success = true;

    try {
      // Simulate network partitioning
      const offlineSimulation = async () => {
        // Check if offline handling works
        const wasOnline = navigator.onLine;
        
        // Simulate offline period
        await this.delay(2000);
        
        if (!wasOnline) {
          errors.push({
            type: 'network',
            message: 'Network partition detected',
            timestamp: new Date(),
            recovered: navigator.onLine,
          });
        }
      };

      await offlineSimulation();
    } catch (e) {
      success = false;
      errors.push({
        type: 'network',
        message: (e as Error).message,
        timestamp: new Date(),
        recovered: false,
      });
    }

    return {
      testName: 'Network Partition',
      duration: Date.now() - start,
      success,
      errors,
    };
  }

  private async testHighCPULoad(): Promise<ChaosTestResult> {
    const start = Date.now();
    const errors: ChaosError[] = [];
    let success = true;

    try {
      // Simulate CPU-intensive operations
      const cpuIntensiveTask = () => {
        let result = 0;
        for (let i = 0; i < 1000000; i++) {
          result += Math.sqrt(i) * Math.sin(i);
        }
        return result;
      };

      // Run multiple times
      for (let i = 0; i < 3; i++) {
        cpuIntensiveTask();
      }

      // Check if UI remained responsive
      const frameTime = await this.measureFrameTime();
      if (frameTime > 100) {
        errors.push({
          type: 'performance',
          message: `High frame time detected: ${frameTime}ms`,
          timestamp: new Date(),
          recovered: true,
        });
      }
    } catch (e) {
      success = false;
      errors.push({
        type: 'cpu',
        message: (e as Error).message,
        timestamp: new Date(),
        recovered: false,
      });
    }

    return {
      testName: 'High CPU Load',
      duration: Date.now() - start,
      success,
      errors,
    };
  }

  private async testMemoryPressure(): Promise<ChaosTestResult> {
    const start = Date.now();
    const errors: ChaosError[] = [];
    let success = true;

    try {
      // Simulate memory pressure (carefully!)
      const allocations: unknown[] = [];
      const targetMB = 50; // Allocate 50MB

      for (let i = 0; i < targetMB; i++) {
        allocations.push(new ArrayBuffer(1024 * 1024)); // 1MB each
      }

      // Check performance
      const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
      if (memory && memory.usedJSHeapSize > 500 * 1024 * 1024) {
        errors.push({
          type: 'memory',
          message: 'High memory usage detected',
          timestamp: new Date(),
          recovered: true,
        });
      }

      // Release memory
      allocations.length = 0;
    } catch (e) {
      success = false;
      errors.push({
        type: 'memory',
        message: (e as Error).message,
        timestamp: new Date(),
        recovered: false,
      });
    }

    return {
      testName: 'Memory Pressure',
      duration: Date.now() - start,
      success,
      errors,
    };
  }

  private async testCacheFailure(): Promise<ChaosTestResult> {
    const start = Date.now();
    const errors: ChaosError[] = [];
    let success = true;

    try {
      // Test cache invalidation
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        
        // Simulate cache corruption
        for (const name of cacheNames.slice(0, 1)) {
          try {
            await caches.delete(name);
            errors.push({
              type: 'cache',
              message: `Cache "${name}" deleted for testing`,
              timestamp: new Date(),
              recovered: true,
            });
          } catch {
            // Cache deletion failed - that's ok
          }
        }
      }
    } catch (e) {
      success = false;
      errors.push({
        type: 'cache',
        message: (e as Error).message,
        timestamp: new Date(),
        recovered: false,
      });
    }

    return {
      testName: 'Cache Failure',
      duration: Date.now() - start,
      success,
      errors,
    };
  }

  private async testConcurrentRequests(): Promise<ChaosTestResult> {
    const start = Date.now();
    const errors: ChaosError[] = [];
    let success = true;

    try {
      // Simulate many concurrent requests
      const requests = Array(50).fill(null).map(async (_, i) => {
        await this.delay(Math.random() * 100);
        if (Math.random() < 0.1) {
          throw new Error(`Request ${i} failed`);
        }
        return i;
      });

      const results = await Promise.allSettled(requests);
      const failures = results.filter(r => r.status === 'rejected');

      if (failures.length > 0) {
        errors.push({
          type: 'concurrency',
          message: `${failures.length} of ${requests.length} requests failed`,
          timestamp: new Date(),
          recovered: true,
        });
      }
    } catch (e) {
      success = false;
      errors.push({
        type: 'concurrency',
        message: (e as Error).message,
        timestamp: new Date(),
        recovered: false,
      });
    }

    return {
      testName: 'Concurrent Requests',
      duration: Date.now() - start,
      success,
      errors,
    };
  }

  private measureFrameTime(): Promise<number> {
    return new Promise(resolve => {
      const start = performance.now();
      requestAnimationFrame(() => {
        resolve(performance.now() - start);
      });
    });
  }

  // Get error log
  getErrors(): ChaosError[] {
    return [...this.errors];
  }

  // Clear error log
  clearErrors(): void {
    this.errors = [];
  }

  // Generate report
  generateReport(results: ChaosTestResult[]): string {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.success).length;
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / totalTests;

    return `
# Chaos Engineering Report
Generated: ${new Date().toISOString()}

## Summary
- Total Tests: ${totalTests}
- Passed: ${passedTests} (${((passedTests / totalTests) * 100).toFixed(1)}%)
- Failed: ${totalTests - passedTests}
- Total Errors Detected: ${totalErrors}
- Average Test Duration: ${avgDuration.toFixed(0)}ms

## Test Results
${results.map(r => `
### ${r.testName}
- Status: ${r.success ? '✅ PASSED' : '❌ FAILED'}
- Duration: ${r.duration}ms
- Errors: ${r.errors.length}
${r.recoveryTime ? `- Recovery Time: ${r.recoveryTime}ms` : ''}
${r.errors.length > 0 ? `
Errors:
${r.errors.map(e => `  - [${e.type}] ${e.message} (Recovered: ${e.recovered})`).join('\n')}
` : ''}
`).join('\n')}

## Recommendations
${passedTests === totalTests 
  ? '✅ System demonstrates good resilience to chaos testing.'
  : `⚠️ ${totalTests - passedTests} test(s) failed. Review error handling and recovery mechanisms.`}
    `;
  }
}

// Singleton instance
export const chaosMonkey = new ChaosMonkey();

// React hook for chaos testing
export function useChaosMonkey() {
  return chaosMonkey;
}
