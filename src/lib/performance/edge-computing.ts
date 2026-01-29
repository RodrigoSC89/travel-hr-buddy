/**
 * Edge Computing Engine v6.0
 * Advanced edge processing for maritime operations
 */

interface EdgeWorkerConfig {
  maxConcurrency: number;
  timeout: number;
  retryAttempts: number;
  cacheStrategy: 'memory' | 'indexeddb' | 'hybrid';
}

interface ComputeTask<T = unknown> {
  id: string;
  type: 'transform' | 'aggregate' | 'filter' | 'ml-inference';
  payload: T;
  priority: number;
  deadline?: number;
}

interface ComputeResult<T = unknown> {
  taskId: string;
  result: T;
  executionTime: number;
  cached: boolean;
}

class EdgeComputingEngine {
  private workers: Worker[] = [];
  private taskQueue: ComputeTask[] = [];
  private resultCache = new Map<string, { result: unknown; timestamp: number }>();
  private config: EdgeWorkerConfig = {
    maxConcurrency: navigator.hardwareConcurrency || 4,
    timeout: 30000,
    retryAttempts: 3,
    cacheStrategy: 'hybrid'
  };

  async initialize(): Promise<void> {
    // Check for Web Worker support
    if (typeof Worker === 'undefined') {
      console.warn('[EdgeComputing] Web Workers not supported, using main thread');
      return;
    }

    // Create worker pool
    const workerCode = this.generateWorkerCode();
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);

    for (let i = 0; i < this.config.maxConcurrency; i++) {
      const worker = new Worker(workerUrl);
      this.workers.push(worker);
    }

    console.log(`[EdgeComputing] Initialized ${this.workers.length} workers`);
  }

  private generateWorkerCode(): string {
    return `
      // Edge Worker for data processing
      self.onmessage = async function(e) {
        const { taskId, type, payload } = e.data;
        const startTime = performance.now();
        
        try {
          let result;
          
          switch (type) {
            case 'transform':
              result = transformData(payload);
              break;
            case 'aggregate':
              result = aggregateData(payload);
              break;
            case 'filter':
              result = filterData(payload);
              break;
            case 'ml-inference':
              result = runInference(payload);
              break;
            default:
              throw new Error('Unknown task type: ' + type);
          }
          
          self.postMessage({
            taskId,
            result,
            executionTime: performance.now() - startTime,
            success: true
          });
        } catch (error) {
          self.postMessage({
            taskId,
            error: error.message,
            executionTime: performance.now() - startTime,
            success: false
          });
        }
      };
      
      function transformData(data) {
        // Data transformation logic
        if (Array.isArray(data)) {
          return data.map(item => ({
            ...item,
            processed: true,
            timestamp: Date.now()
          }));
        }
        return { ...data, processed: true };
      }
      
      function aggregateData(data) {
        // Aggregation logic
        if (!Array.isArray(data)) return data;
        
        const numeric = data.filter(d => typeof d === 'number');
        return {
          count: data.length,
          sum: numeric.reduce((a, b) => a + b, 0),
          avg: numeric.length ? numeric.reduce((a, b) => a + b, 0) / numeric.length : 0,
          min: numeric.length ? Math.min(...numeric) : null,
          max: numeric.length ? Math.max(...numeric) : null
        };
      }
      
      function filterData(data) {
        // Filter logic
        const { items, predicate } = data;
        if (!Array.isArray(items)) return items;
        
        return items.filter(item => {
          return Object.entries(predicate).every(([key, value]) => {
            if (typeof value === 'function') return value(item[key]);
            return item[key] === value;
          });
        });
      }
      
      function runInference(data) {
        // Simple ML inference (weighted scoring)
        const { features, weights } = data;
        let score = 0;
        
        Object.keys(weights).forEach(key => {
          if (features[key] !== undefined) {
            score += features[key] * weights[key];
          }
        });
        
        return {
          score: Math.min(1, Math.max(0, score)),
          confidence: 0.85,
          features: Object.keys(weights).length
        };
      }
    `;
  }

  async compute<T, R>(task: ComputeTask<T>): Promise<ComputeResult<R>> {
    // Check cache first
    const cacheKey = this.generateCacheKey(task);
    const cached = this.resultCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 60000) {
      return {
        taskId: task.id,
        result: cached.result as R,
        executionTime: 0,
        cached: true
      };
    }

    // If no workers, process on main thread
    if (this.workers.length === 0) {
      return this.processOnMainThread(task);
    }

    // Find available worker
    const worker = this.workers[Math.floor(Math.random() * this.workers.length)];
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Task timeout'));
      }, this.config.timeout);

      worker.onmessage = (e) => {
        clearTimeout(timeout);
        
        if (e.data.success) {
          // Cache result
          this.resultCache.set(cacheKey, {
            result: e.data.result,
            timestamp: Date.now()
          });
          
          resolve({
            taskId: task.id,
            result: e.data.result,
            executionTime: e.data.executionTime,
            cached: false
          });
        } else {
          reject(new Error(e.data.error));
        }
      };

      worker.postMessage({
        taskId: task.id,
        type: task.type,
        payload: task.payload
      });
    });
  }

  private async processOnMainThread<T, R>(task: ComputeTask<T>): Promise<ComputeResult<R>> {
    const startTime = performance.now();
    let result: unknown;

    switch (task.type) {
      case 'transform':
        result = Array.isArray(task.payload) 
          ? (task.payload as unknown[]).map(item => ({ ...(item as object), processed: true }))
          : { ...(task.payload as object), processed: true };
        break;
      case 'aggregate':
        const data = task.payload as unknown[];
        if (Array.isArray(data)) {
          const numeric = data.filter((d): d is number => typeof d === 'number');
          result = {
            count: data.length,
            sum: numeric.reduce((a, b) => a + b, 0),
            avg: numeric.length ? numeric.reduce((a, b) => a + b, 0) / numeric.length : 0
          };
        } else {
          result = task.payload;
        }
        break;
      default:
        result = task.payload;
    }

    return {
      taskId: task.id,
      result: result as R,
      executionTime: performance.now() - startTime,
      cached: false
    };
  }

  private generateCacheKey(task: ComputeTask): string {
    return `${task.type}:${JSON.stringify(task.payload)}`;
  }

  async batchCompute<T, R>(tasks: ComputeTask<T>[]): Promise<ComputeResult<R>[]> {
    // Sort by priority
    const sortedTasks = [...tasks].sort((a, b) => b.priority - a.priority);
    
    // Process in parallel
    return Promise.all(sortedTasks.map(task => this.compute<T, R>(task)));
  }

  clearCache(): void {
    this.resultCache.clear();
  }

  terminate(): void {
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    this.clearCache();
  }

  getStats() {
    return {
      workers: this.workers.length,
      cacheSize: this.resultCache.size,
      maxConcurrency: this.config.maxConcurrency
    };
  }
}

export const edgeComputingEngine = new EdgeComputingEngine();
export type { ComputeTask, ComputeResult, EdgeWorkerConfig };
