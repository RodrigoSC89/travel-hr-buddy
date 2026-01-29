/**
 * Chaos Engineering Engine v6.0
 * Advanced testing and resilience validation
 */

interface ChaosExperiment {
  id: string;
  name: string;
  type: 'latency' | 'failure' | 'memory' | 'cpu' | 'network' | 'data';
  config: ChaosConfig;
  status: 'idle' | 'running' | 'completed' | 'aborted';
  startedAt?: Date;
  completedAt?: Date;
  results?: ExperimentResults;
}

interface ChaosConfig {
  duration: number; // ms
  probability: number; // 0-1
  intensity: 'low' | 'medium' | 'high';
  targets?: string[];
  safeMode?: boolean;
}

interface ExperimentResults {
  totalRequests: number;
  affectedRequests: number;
  errors: Array<{ type: string; count: number; message: string }>;
  recoveryTime: number;
  systemHealth: number;
  recommendations: string[];
}

interface ResilienceScore {
  overall: number;
  latencyTolerance: number;
  failureTolerance: number;
  memoryEfficiency: number;
  networkResilience: number;
  dataIntegrity: number;
}

class ChaosEngineeringEngine {
  private experiments = new Map<string, ChaosExperiment>();
  private activeExperiment: ChaosExperiment | null = null;
  private originalFetch: typeof fetch | null = null;
  private interceptedRequests = 0;
  private affectedRequests = 0;
  private errors: Array<{ type: string; message: string }> = [];

  async runExperiment(
    type: ChaosExperiment['type'],
    config: Partial<ChaosConfig> = {}
  ): Promise<ExperimentResults> {
    if (this.activeExperiment) {
      throw new Error('Experiment already running');
    }

    const experiment: ChaosExperiment = {
      id: crypto.randomUUID(),
      name: `${type}_${Date.now()}`,
      type,
      config: {
        duration: config.duration ?? 10000,
        probability: config.probability ?? 0.3,
        intensity: config.intensity ?? 'medium',
        targets: config.targets,
        safeMode: config.safeMode ?? true
      },
      status: 'running',
      startedAt: new Date()
    };

    this.experiments.set(experiment.id, experiment);
    this.activeExperiment = experiment;
    this.interceptedRequests = 0;
    this.affectedRequests = 0;
    this.errors = [];

    try {
      switch (type) {
        case 'latency':
          await this.runLatencyExperiment(experiment);
          break;
        case 'failure':
          await this.runFailureExperiment(experiment);
          break;
        case 'memory':
          await this.runMemoryExperiment(experiment);
          break;
        case 'cpu':
          await this.runCPUExperiment(experiment);
          break;
        case 'network':
          await this.runNetworkExperiment(experiment);
          break;
        case 'data':
          await this.runDataExperiment(experiment);
          break;
      }

      experiment.status = 'completed';
    } catch (error) {
      experiment.status = 'aborted';
      throw error;
    } finally {
      experiment.completedAt = new Date();
      this.activeExperiment = null;
      this.restoreOriginalBehavior();
    }

    experiment.results = this.generateResults(experiment);
    return experiment.results;
  }

  private async runLatencyExperiment(experiment: ChaosExperiment): Promise<void> {
    const latencyMap = {
      low: { min: 100, max: 300 },
      medium: { min: 500, max: 1500 },
      high: { min: 2000, max: 5000 }
    };

    const { min, max } = latencyMap[experiment.config.intensity];

    this.originalFetch = window.fetch;
    window.fetch = async (...args) => {
      this.interceptedRequests++;

      if (Math.random() < experiment.config.probability) {
        this.affectedRequests++;
        const delay = min + Math.random() * (max - min);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      return this.originalFetch!.apply(window, args);
    };

    await new Promise(resolve => setTimeout(resolve, experiment.config.duration));
  }

  private async runFailureExperiment(experiment: ChaosExperiment): Promise<void> {
    const errorTypes = ['NetworkError', 'TimeoutError', 'ServerError'];

    this.originalFetch = window.fetch;
    window.fetch = async (...args) => {
      this.interceptedRequests++;

      if (Math.random() < experiment.config.probability) {
        this.affectedRequests++;
        const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
        this.errors.push({ type: errorType, message: `Simulated ${errorType}` });

        if (experiment.config.safeMode) {
          // In safe mode, still make the request but log the "failure"
          return this.originalFetch!.apply(window, args);
        }

        throw new Error(`Chaos: ${errorType}`);
      }

      return this.originalFetch!.apply(window, args);
    };

    await new Promise(resolve => setTimeout(resolve, experiment.config.duration));
  }

  private async runMemoryExperiment(experiment: ChaosExperiment): Promise<void> {
    const memoryPressure: unknown[] = [];
    const sizeMap = { low: 1e6, medium: 5e6, high: 20e6 };
    const targetSize = sizeMap[experiment.config.intensity];

    const interval = setInterval(() => {
      if (Math.random() < experiment.config.probability) {
        this.affectedRequests++;
        const chunk = new Array(targetSize / 8).fill(Math.random());
        memoryPressure.push(chunk);
      }
      this.interceptedRequests++;
    }, 100);

    await new Promise(resolve => setTimeout(resolve, experiment.config.duration));
    clearInterval(interval);

    // Release memory
    memoryPressure.length = 0;
  }

  private async runCPUExperiment(experiment: ChaosExperiment): Promise<void> {
    const iterationsMap = { low: 1e5, medium: 1e6, high: 1e7 };
    const iterations = iterationsMap[experiment.config.intensity];

    const interval = setInterval(() => {
      if (Math.random() < experiment.config.probability) {
        this.affectedRequests++;
        // CPU-intensive operation
        let result = 0;
        for (let i = 0; i < iterations; i++) {
          result += Math.sin(i) * Math.cos(i);
        }
        // Prevent optimization
        if (result === Infinity) console.log(result);
      }
      this.interceptedRequests++;
    }, 100);

    await new Promise(resolve => setTimeout(resolve, experiment.config.duration));
    clearInterval(interval);
  }

  private async runNetworkExperiment(experiment: ChaosExperiment): Promise<void> {
    this.originalFetch = window.fetch;

    window.fetch = async (...args) => {
      this.interceptedRequests++;

      if (Math.random() < experiment.config.probability) {
        this.affectedRequests++;

        // Simulate various network conditions
        const conditions = ['slow-3g', 'offline', 'intermittent'];
        const condition = conditions[Math.floor(Math.random() * conditions.length)];

        switch (condition) {
          case 'slow-3g':
            await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
            break;
          case 'offline':
            if (!experiment.config.safeMode) {
              throw new Error('Network offline');
            }
            this.errors.push({ type: 'NetworkError', message: 'Simulated offline' });
            break;
          case 'intermittent':
            if (Math.random() < 0.5 && !experiment.config.safeMode) {
              throw new Error('Connection reset');
            }
            break;
        }
      }

      return this.originalFetch!.apply(window, args);
    };

    await new Promise(resolve => setTimeout(resolve, experiment.config.duration));
  }

  private async runDataExperiment(experiment: ChaosExperiment): Promise<void> {
    // Test data corruption resilience
    this.originalFetch = window.fetch;

    window.fetch = async (...args) => {
      this.interceptedRequests++;
      const response = await this.originalFetch!.apply(window, args);

      if (Math.random() < experiment.config.probability && experiment.config.safeMode === false) {
        this.affectedRequests++;
        
        // Clone and modify response
        const body = await response.text();
        
        // Simulate data corruption by modifying JSON
        try {
          const data = JSON.parse(body);
          if (Array.isArray(data)) {
            // Randomly remove items
            data.splice(Math.floor(Math.random() * data.length), 1);
          }
          
          return new Response(JSON.stringify(data), {
            status: response.status,
            headers: response.headers
          });
        } catch {
          return response;
        }
      }

      return response;
    };

    await new Promise(resolve => setTimeout(resolve, experiment.config.duration));
  }

  private restoreOriginalBehavior(): void {
    if (this.originalFetch) {
      window.fetch = this.originalFetch;
      this.originalFetch = null;
    }
  }

  private generateResults(experiment: ChaosExperiment): ExperimentResults {
    const errorCounts = this.errors.reduce((acc, err) => {
      const existing = acc.find(e => e.type === err.type);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ type: err.type, count: 1, message: err.message });
      }
      return acc;
    }, [] as Array<{ type: string; count: number; message: string }>);

    const affectedRatio = this.interceptedRequests > 0 
      ? this.affectedRequests / this.interceptedRequests 
      : 0;

    const systemHealth = Math.max(0, 100 - (affectedRatio * 100) - (errorCounts.length * 5));

    const recommendations = this.generateRecommendations(experiment, systemHealth, errorCounts);

    return {
      totalRequests: this.interceptedRequests,
      affectedRequests: this.affectedRequests,
      errors: errorCounts,
      recoveryTime: experiment.config.duration,
      systemHealth,
      recommendations
    };
  }

  private generateRecommendations(
    experiment: ChaosExperiment,
    systemHealth: number,
    errors: Array<{ type: string; count: number }>
  ): string[] {
    const recommendations: string[] = [];

    if (systemHealth < 80) {
      recommendations.push('Implement circuit breaker pattern for external services');
      recommendations.push('Add retry logic with exponential backoff');
    }

    if (experiment.type === 'latency' && systemHealth < 90) {
      recommendations.push('Optimize API response times');
      recommendations.push('Consider implementing request timeouts');
    }

    if (errors.some(e => e.type === 'NetworkError')) {
      recommendations.push('Implement offline-first architecture');
      recommendations.push('Add network status monitoring');
    }

    if (experiment.type === 'memory') {
      recommendations.push('Review memory usage patterns');
      recommendations.push('Implement lazy loading for large datasets');
    }

    if (recommendations.length === 0) {
      recommendations.push('System shows good resilience to chaos conditions');
    }

    return recommendations;
  }

  abortExperiment(): void {
    if (this.activeExperiment) {
      this.activeExperiment.status = 'aborted';
      this.restoreOriginalBehavior();
      this.activeExperiment = null;
    }
  }

  calculateResilienceScore(): ResilienceScore {
    const completedExperiments = Array.from(this.experiments.values())
      .filter(e => e.status === 'completed' && e.results);

    if (completedExperiments.length === 0) {
      return {
        overall: 0,
        latencyTolerance: 0,
        failureTolerance: 0,
        memoryEfficiency: 0,
        networkResilience: 0,
        dataIntegrity: 0
      };
    }

    const getTypeScore = (type: ChaosExperiment['type']) => {
      const typeExps = completedExperiments.filter(e => e.type === type);
      if (typeExps.length === 0) return 0;
      return typeExps.reduce((sum, e) => sum + (e.results?.systemHealth || 0), 0) / typeExps.length;
    };

    const latencyTolerance = getTypeScore('latency');
    const failureTolerance = getTypeScore('failure');
    const memoryEfficiency = getTypeScore('memory');
    const networkResilience = getTypeScore('network');
    const dataIntegrity = getTypeScore('data');

    const overall = (latencyTolerance + failureTolerance + memoryEfficiency + 
      networkResilience + dataIntegrity) / 5;

    return {
      overall: Math.round(overall),
      latencyTolerance: Math.round(latencyTolerance),
      failureTolerance: Math.round(failureTolerance),
      memoryEfficiency: Math.round(memoryEfficiency),
      networkResilience: Math.round(networkResilience),
      dataIntegrity: Math.round(dataIntegrity)
    };
  }

  getExperimentHistory(): ChaosExperiment[] {
    return Array.from(this.experiments.values());
  }

  isRunning(): boolean {
    return this.activeExperiment !== null;
  }
}

export const chaosEngine = new ChaosEngineeringEngine();
export type { ChaosExperiment, ChaosConfig, ExperimentResults, ResilienceScore };
