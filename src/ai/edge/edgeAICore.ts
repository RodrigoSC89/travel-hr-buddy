/**
 * Edge AI Core - PATCH 223
 * 
 * Sistema de inferência local de IA embarcada
 * Suporta múltiplos backends: WebGPU → WebGL → WASM → CPU
 * Formatos: ggml, onnx-lite, tflite
 * 
 * @module ai/edge/edgeAICore
 */

import { supabase } from '@/integrations/supabase/client';

export type AIBackend = 'webgpu' | 'webgl' | 'wasm' | 'cpu';
export type ModelFormat = 'ggml' | 'onnx-lite' | 'tflite' | 'custom';
export type InferenceTask = 'classification' | 'route-analysis' | 'failure-detection' | 'quick-response';

export interface ModelMetadata {
  id: string;
  name: string;
  format: ModelFormat;
  size: number; // bytes
  version: string;
  task: InferenceTask;
  quantization?: 'int8' | 'int4' | 'float16' | 'float32';
}

export interface InferenceRequest {
  modelId: string;
  input: unknown;
  task: InferenceTask;
  options?: {
    maxLatency?: number; // ms
    preferredBackend?: AIBackend;
    fallbackEnabled?: boolean;
  };
}

export interface InferenceResult {
  success: boolean;
  output: unknown;
  latency: number; // ms
  backend: AIBackend;
  timestamp: number;
  error?: string;
}

export interface BackendCapabilities {
  backend: AIBackend;
  available: boolean;
  supported: boolean;
  performance: 'high' | 'medium' | 'low';
  features: string[];
}

export interface PerformanceMetrics {
  averageLatency: number;
  minLatency: number;
  maxLatency: number;
  totalInferences: number;
  successRate: number;
  backendUsage: Record<AIBackend, number>;
}

class EdgeAICore {
  private models: Map<string, ModelMetadata> = new Map();
  private backends: Map<AIBackend, BackendCapabilities> = new Map();
  private metrics: PerformanceMetrics = {
    averageLatency: 0,
    minLatency: Infinity,
    maxLatency: 0,
    totalInferences: 0,
    successRate: 1.0,
    backendUsage: {
      webgpu: 0,
      webgl: 0,
      wasm: 0,
      cpu: 0
    }
  };
  private latencyHistory: number[] = [];
  private readonly MAX_HISTORY = 100;

  constructor() {
    this.detectBackends();
  }

  /**
   * Detecta backends disponíveis no ambiente
   */
  private detectBackends(): void {
    // WebGPU
    const hasWebGPU = 'gpu' in navigator;
    this.backends.set('webgpu', {
      backend: 'webgpu',
      available: hasWebGPU,
      supported: hasWebGPU,
      performance: 'high',
      features: ['parallel-compute', 'fp16', 'int8']
    });

    // WebGL
    const canvas = document.createElement('canvas');
    const hasWebGL = !!canvas.getContext('webgl2') || !!canvas.getContext('webgl');
    this.backends.set('webgl', {
      backend: 'webgl',
      available: hasWebGL,
      supported: hasWebGL,
      performance: 'medium',
      features: ['gpu-compute', 'fp32']
    });

    // WASM
    const hasWASM = typeof WebAssembly !== 'undefined';
    this.backends.set('wasm', {
      backend: 'wasm',
      available: hasWASM,
      supported: hasWASM,
      performance: 'medium',
      features: ['simd', 'threads']
    });

    // CPU (sempre disponível)
    this.backends.set('cpu', {
      backend: 'cpu',
      available: true,
      supported: true,
      performance: 'low',
      features: ['basic']
    });

    console.log('[EdgeAI] Backends detected:', 
      Array.from(this.backends.values())
        .filter(b => b.available)
        .map(b => b.backend)
    );
  }

  /**
   * Seleciona o melhor backend disponível
   */
  private selectBackend(preferredBackend?: AIBackend): AIBackend {
    // Se há preferência e está disponível, usar
    if (preferredBackend) {
      const backend = this.backends.get(preferredBackend);
      if (backend?.available) {
        return preferredBackend;
      }
    }

    // Fallback cascade: WebGPU → WebGL → WASM → CPU
    const fallbackOrder: AIBackend[] = ['webgpu', 'webgl', 'wasm', 'cpu'];
    
    for (const backend of fallbackOrder) {
      const capability = this.backends.get(backend);
      if (capability?.available) {
        return backend;
      }
    }

    return 'cpu'; // Sempre disponível
  }

  /**
   * Registra um modelo para uso
   */
  async registerModel(metadata: ModelMetadata): Promise<void> {
    this.models.set(metadata.id, metadata);
    console.log(`[EdgeAI] Model registered: ${metadata.name} (${metadata.format})`);
  }

  /**
   * Executa inferência local
   */
  async infer(request: InferenceRequest): Promise<InferenceResult> {
    const startTime = performance.now();
    
    const model = this.models.get(request.modelId);
    if (!model) {
      return {
        success: false,
        output: null,
        latency: 0,
        backend: 'cpu',
        timestamp: Date.now(),
        error: `Model not found: ${request.modelId}`
      };
    }

    const backend = this.selectBackend(request.options?.preferredBackend);
    
    try {
      // Simular inferência (na implementação real, usar backend específico)
      const output = await this.runInference(model, request.input, backend);
      
      const latency = performance.now() - startTime;
      
      // Atualizar métricas
      this.updateMetrics(latency, backend, true);
      
      // Log para analytics
      await this.logInference({
        modelId: request.modelId,
        task: request.task,
        backend,
        latency,
        success: true
      });

      const result: InferenceResult = {
        success: true,
        output,
        latency,
        backend,
        timestamp: Date.now()
      };

      console.log(`[EdgeAI] Inference complete: ${latency.toFixed(2)}ms on ${backend}`);
      return result;

    } catch (error) {
      const latency = performance.now() - startTime;
      this.updateMetrics(latency, backend, false);
      
      console.error('[EdgeAI] Inference failed:', error);
      
      return {
        success: false,
        output: null,
        latency,
        backend,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Executa a inferência no backend selecionado
   */
  private async runInference(
    model: ModelMetadata,
    input: unknown,
    backend: AIBackend
  ): Promise<unknown> {
    // Simulação - na implementação real, despachar para backend específico
    switch (backend) {
      case 'webgpu':
        return this.runWebGPUInference(model, input);
      case 'webgl':
        return this.runWebGLInference(model, input);
      case 'wasm':
        return this.runWASMInference(model, input);
      case 'cpu':
        return this.runCPUInference(model, input);
    }
  }

  /**
   * Inferência WebGPU (placeholder)
   */
  private async runWebGPUInference(model: ModelMetadata, input: unknown): Promise<unknown> {
    // Simular processamento rápido
    await this.delay(10);
    return this.mockInferenceOutput(model.task, input);
  }

  /**
   * Inferência WebGL (placeholder)
   */
  private async runWebGLInference(model: ModelMetadata, input: unknown): Promise<unknown> {
    await this.delay(20);
    return this.mockInferenceOutput(model.task, input);
  }

  /**
   * Inferência WASM (placeholder)
   */
  private async runWASMInference(model: ModelMetadata, input: unknown): Promise<unknown> {
    await this.delay(30);
    return this.mockInferenceOutput(model.task, input);
  }

  /**
   * Inferência CPU (placeholder)
   */
  private async runCPUInference(model: ModelMetadata, input: unknown): Promise<unknown> {
    await this.delay(50);
    return this.mockInferenceOutput(model.task, input);
  }

  /**
   * Gera output mockado baseado na task
   */
  private mockInferenceOutput(task: InferenceTask, input: unknown): unknown {
    switch (task) {
      case 'classification':
        return {
          class: 'normal',
          confidence: 0.92,
          alternatives: [
            { class: 'anomaly', confidence: 0.05 },
            { class: 'warning', confidence: 0.03 }
          ]
        };
      
      case 'route-analysis':
        return {
          optimal: true,
          score: 0.88,
          suggestions: ['Consider alternative route B', 'Check weather conditions']
        };
      
      case 'failure-detection':
        return {
          failure: false,
          confidence: 0.95,
          components: []
        };
      
      case 'quick-response':
        return {
          response: 'Proceed with caution',
          priority: 'medium'
        };
      
      default:
        return { processed: true };
    }
  }

  /**
   * Atualiza métricas de performance
   */
  private updateMetrics(latency: number, backend: AIBackend, success: boolean): void {
    this.latencyHistory.push(latency);
    if (this.latencyHistory.length > this.MAX_HISTORY) {
      this.latencyHistory.shift();
    }

    this.metrics.totalInferences++;
    this.metrics.backendUsage[backend]++;
    
    if (success) {
      this.metrics.minLatency = Math.min(this.metrics.minLatency, latency);
      this.metrics.maxLatency = Math.max(this.metrics.maxLatency, latency);
      this.metrics.averageLatency = 
        this.latencyHistory.reduce((a, b) => a + b, 0) / this.latencyHistory.length;
    }

    const successCount = this.latencyHistory.length;
    this.metrics.successRate = successCount / this.metrics.totalInferences;
  }

  /**
   * Registra inferência no Supabase
   */
  private async logInference(data: {
    modelId: string;
    task: InferenceTask;
    backend: AIBackend;
    latency: number;
    success: boolean;
  }): Promise<void> {
    try {
      await supabase.from('edge_ai_log').insert({
        model_id: data.modelId,
        task: data.task,
        backend: data.backend,
        latency_ms: data.latency,
        success: data.success,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.warn('[EdgeAI] Failed to log inference:', error);
    }
  }

  /**
   * Obtém métricas de performance
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Obtém capacidades dos backends
   */
  getBackendCapabilities(): BackendCapabilities[] {
    return Array.from(this.backends.values());
  }

  /**
   * Lista modelos registrados
   */
  listModels(): ModelMetadata[] {
    return Array.from(this.models.values());
  }

  /**
   * Helper para delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const edgeAICore = new EdgeAICore();

/**
 * Helper functions para tarefas comuns
 */

export async function analyzeRoute(routeData: unknown): Promise<InferenceResult> {
  return edgeAICore.infer({
    modelId: 'route-analyzer-v1',
    input: routeData,
    task: 'route-analysis'
  });
}

export async function detectFailure(systemData: unknown): Promise<InferenceResult> {
  return edgeAICore.infer({
    modelId: 'failure-detector-v1',
    input: systemData,
    task: 'failure-detection'
  });
}

export async function classifyIncident(incidentData: unknown): Promise<InferenceResult> {
  return edgeAICore.infer({
    modelId: 'incident-classifier-v1',
    input: incidentData,
    task: 'classification'
  });
}
