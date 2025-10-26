/**
 * PATCH 223 – Edge AI Operations Core
 * 
 * Executes AI locally on embedded devices using WebGPU for offline tactical inference.
 * Supports small models converted to ggml/onnx-lite formats for routing, failure detection,
 * and fast response without cloud dependency.
 * 
 * @module EdgeAICore
 * @version 1.0.0
 */

import { Logger } from "@/lib/utils/logger";

// Model formats supported
export type ModelFormat = "ggml" | "onnx-lite" | "onnx" | "tflite" | "wasm";

// Inference engines
export type InferenceEngine = "webgpu" | "webgl" | "wasm" | "cpu";

// AI task types
export type AITaskType = "routing" | "failure-detection" | "quick-response" | "classification" | "prediction" | "analysis";

// Model metadata
export interface ModelMetadata {
  id: string;
  name: string;
  version: string;
  format: ModelFormat;
  size: number; // bytes
  inputShape: number[];
  outputShape: number[];
  quantization?: string;
  description: string;
  taskType: AITaskType;
}

// Model status
export type ModelStatus = "unloaded" | "loading" | "loaded" | "error" | "inference";

// Inference request
export interface InferenceRequest {
  modelId: string;
  input: number[] | Float32Array | Uint8Array;
  options?: {
    temperature?: number;
    maxTokens?: number;
    topK?: number;
    topP?: number;
  };
}

// Inference result
export interface InferenceResult {
  output: number[] | Float32Array;
  confidence?: number;
  latency: number; // ms
  modelId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// Edge AI log entry
export interface EdgeAILogEntry {
  id: string;
  timestamp: string;
  modelId: string;
  taskType: AITaskType;
  latency: number;
  success: boolean;
  error?: string;
  inputSize: number;
  outputSize: number;
}

// GPU capabilities
export interface GPUCapabilities {
  available: boolean;
  vendor: string;
  renderer: string;
  maxTextureSize: number;
  maxComputeWorkgroupSize: number[];
  features: string[];
}

/**
 * EdgeAICore - Manages local AI model execution
 */
export class EdgeAICore {
  private models: Map<string, ModelMetadata> = new Map();
  private loadedModels: Map<string, any> = new Map();
  private modelStatus: Map<string, ModelStatus> = new Map();
  private gpuCapabilities?: GPUCapabilities;
  private inferenceEngine: InferenceEngine = "cpu";
  private logs: EdgeAILogEntry[] = [];
  private maxLogSize = 1000;

  constructor() {
    this.initializeEngine();
  }

  /**
   * Initialize inference engine and detect GPU capabilities
   */
  private async initializeEngine(): Promise<void> {
    Logger.info('Initializing Edge AI engine...');

    // Check for WebGPU support
    if ('gpu' in navigator) {
      try {
        const adapter = await (navigator as any).gpu.requestAdapter();
        if (adapter) {
          this.inferenceEngine = "webgpu";
          this.gpuCapabilities = await this.detectGPUCapabilities(adapter);
          Logger.info('WebGPU available, using GPU acceleration');
          return;
        }
      } catch (error) {
        Logger.warn('WebGPU initialization failed, falling back');
      }
    }

    // Check for WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (gl) {
      this.inferenceEngine = "webgl";
      Logger.info('WebGL available, using GPU acceleration');
      return;
    }

    // Fallback to WASM or CPU
    if (typeof WebAssembly !== 'undefined') {
      this.inferenceEngine = "wasm";
      Logger.info('WebAssembly available, using WASM acceleration');
    } else {
      this.inferenceEngine = "cpu";
      Logger.warn('No GPU or WASM support, using CPU inference');
    }
  }

  /**
   * Detect GPU capabilities
   */
  private async detectGPUCapabilities(adapter: any): Promise<GPUCapabilities> {
    const features: string[] = Array.from(adapter.features || []);
    
    return {
      available: true,
      vendor: adapter.info?.vendor || "unknown",
      renderer: adapter.info?.device || "unknown",
      maxTextureSize: 8192, // Default value
      maxComputeWorkgroupSize: [256, 256, 64],
      features
    };
  }

  /**
   * Register a model for use
   */
  registerModel(metadata: ModelMetadata): void {
    Logger.info(`Registering model: ${metadata.name} (${metadata.format})`);
    this.models.set(metadata.id, metadata);
    this.modelStatus.set(metadata.id, "unloaded");
  }

  /**
   * Load a model into memory
   */
  async loadModel(modelId: string, modelData?: ArrayBuffer): Promise<void> {
    const metadata = this.models.get(modelId);
    if (!metadata) {
      throw new Error(`Model not registered: ${modelId}`);
    }

    this.modelStatus.set(modelId, "loading");
    Logger.info(`Loading model: ${metadata.name}`);

    try {
      // In real implementation, this would load the actual model
      // For now, we simulate model loading
      await new Promise(resolve => setTimeout(resolve, 500));

      const model = {
        id: modelId,
        metadata,
        data: modelData || new ArrayBuffer(0),
        loadedAt: Date.now()
      };

      this.loadedModels.set(modelId, model);
      this.modelStatus.set(modelId, "loaded");
      Logger.info(`Model loaded successfully: ${metadata.name}`);
    } catch (error) {
      this.modelStatus.set(modelId, "error");
      Logger.error(`Failed to load model: ${error}`);
      throw error;
    }
  }

  /**
   * Unload a model from memory
   */
  unloadModel(modelId: string): void {
    const metadata = this.models.get(modelId);
    if (!metadata) {
      throw new Error(`Model not registered: ${modelId}`);
    }

    this.loadedModels.delete(modelId);
    this.modelStatus.set(modelId, "unloaded");
    Logger.info(`Model unloaded: ${metadata.name}`);
  }

  /**
   * Run inference on a model
   */
  async infer(request: InferenceRequest): Promise<InferenceResult> {
    const { modelId, input, options } = request;
    
    const metadata = this.models.get(modelId);
    if (!metadata) {
      throw new Error(`Model not registered: ${modelId}`);
    }

    const model = this.loadedModels.get(modelId);
    if (!model) {
      throw new Error(`Model not loaded: ${modelId}`);
    }

    this.modelStatus.set(modelId, "inference");
    const startTime = performance.now();

    try {
      Logger.debug(`Running inference on model: ${metadata.name}`);

      // Simulate inference based on engine type
      let output: Float32Array;
      switch (this.inferenceEngine) {
        case "webgpu":
          output = await this.inferWebGPU(model, input, options);
          break;
        case "webgl":
          output = await this.inferWebGL(model, input, options);
          break;
        case "wasm":
          output = await this.inferWASM(model, input, options);
          break;
        default:
          output = await this.inferCPU(model, input, options);
      }

      const latency = performance.now() - startTime;

      const result: InferenceResult = {
        output,
        confidence: this.calculateConfidence(output),
        latency,
        modelId,
        timestamp: new Date().toISOString(),
        metadata: {
          engine: this.inferenceEngine,
          inputSize: input.length
        }
      };

      // Log inference
      this.logInference({
        id: this.generateLogId(),
        timestamp: result.timestamp,
        modelId,
        taskType: metadata.taskType,
        latency,
        success: true,
        inputSize: input.length,
        outputSize: output.length
      });

      this.modelStatus.set(modelId, "loaded");
      Logger.debug(`Inference completed in ${latency.toFixed(2)}ms`);

      return result;
    } catch (error) {
      const latency = performance.now() - startTime;
      
      // Log failed inference
      this.logInference({
        id: this.generateLogId(),
        timestamp: new Date().toISOString(),
        modelId,
        taskType: metadata.taskType,
        latency,
        success: false,
        error: String(error),
        inputSize: input.length,
        outputSize: 0
      });

      this.modelStatus.set(modelId, "error");
      Logger.error(`Inference failed: ${error}`);
      throw error;
    }
  }

  /**
   * WebGPU inference (best performance)
   */
  private async inferWebGPU(model: any, input: number[] | Float32Array | Uint8Array, options?: any): Promise<Float32Array> {
    // Simulate GPU inference
    await new Promise(resolve => setTimeout(resolve, 10));
    return this.mockInference(input);
  }

  /**
   * WebGL inference (fallback)
   */
  private async inferWebGL(model: any, input: number[] | Float32Array | Uint8Array, options?: any): Promise<Float32Array> {
    // Simulate WebGL inference
    await new Promise(resolve => setTimeout(resolve, 20));
    return this.mockInference(input);
  }

  /**
   * WASM inference (portable)
   */
  private async inferWASM(model: any, input: number[] | Float32Array | Uint8Array, options?: any): Promise<Float32Array> {
    // Simulate WASM inference
    await new Promise(resolve => setTimeout(resolve, 30));
    return this.mockInference(input);
  }

  /**
   * CPU inference (slowest, most compatible)
   */
  private async inferCPU(model: any, input: number[] | Float32Array | Uint8Array, options?: any): Promise<Float32Array> {
    // Simulate CPU inference
    await new Promise(resolve => setTimeout(resolve, 50));
    return this.mockInference(input);
  }

  /**
   * Mock inference for demonstration
   */
  private mockInference(input: number[] | Float32Array | Uint8Array): Float32Array {
    const outputSize = 10;
    const output = new Float32Array(outputSize);
    
    // Generate mock output based on input
    for (let i = 0; i < outputSize; i++) {
      output[i] = Math.random();
    }
    
    // Normalize to sum to 1 (probability distribution)
    const sum = output.reduce((a, b) => a + b, 0);
    for (let i = 0; i < outputSize; i++) {
      output[i] /= sum;
    }

    return output;
  }

  /**
   * Calculate confidence from output
   */
  private calculateConfidence(output: Float32Array): number {
    // Use max value as confidence
    return Math.max(...Array.from(output));
  }

  /**
   * Log inference execution
   */
  private logInference(entry: EdgeAILogEntry): void {
    this.logs.push(entry);
    
    // Trim logs if too large
    if (this.logs.length > this.maxLogSize) {
      this.logs.shift();
    }
  }

  /**
   * Get inference logs
   */
  getLogs(modelId?: string): EdgeAILogEntry[] {
    if (modelId) {
      return this.logs.filter(log => log.modelId === modelId);
    }
    return [...this.logs];
  }

  /**
   * Get model status
   */
  getModelStatus(modelId: string): ModelStatus {
    return this.modelStatus.get(modelId) || "unloaded";
  }

  /**
   * List registered models
   */
  listModels(): ModelMetadata[] {
    return Array.from(this.models.values());
  }

  /**
   * Get loaded models
   */
  getLoadedModels(): string[] {
    return Array.from(this.loadedModels.keys());
  }

  /**
   * Get GPU capabilities
   */
  getGPUCapabilities(): GPUCapabilities | undefined {
    return this.gpuCapabilities;
  }

  /**
   * Get current inference engine
   */
  getInferenceEngine(): InferenceEngine {
    return this.inferenceEngine;
  }

  /**
   * Get performance metrics
   */
  getMetrics(): {
    totalInferences: number;
    successfulInferences: number;
    failedInferences: number;
    averageLatency: number;
    modelsLoaded: number;
  } {
    const successful = this.logs.filter(log => log.success);
    const failed = this.logs.filter(log => !log.success);
    const averageLatency = successful.length > 0
      ? successful.reduce((sum, log) => sum + log.latency, 0) / successful.length
      : 0;

    return {
      totalInferences: this.logs.length,
      successfulInferences: successful.length,
      failedInferences: failed.length,
      averageLatency,
      modelsLoaded: this.loadedModels.size
    };
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs = [];
    Logger.info('Inference logs cleared');
  }

  /**
   * Generate unique log ID
   */
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Export logs for persistence
   */
  exportLogs(): Blob {
    const data = JSON.stringify(this.logs, null, 2);
    return new Blob([data], { type: "application/json" });
  }
}

// Singleton instance
export const edgeAICore = new EdgeAICore();

// Convenience functions for common AI tasks

/**
 * Quick route analysis using edge AI
 */
export async function analyzeRoute(routeData: number[]): Promise<InferenceResult> {
  const routeModelId = "route-analyzer-v1";
  
  // Register model if not already registered
  if (!edgeAICore.listModels().find(m => m.id === routeModelId)) {
    edgeAICore.registerModel({
      id: routeModelId,
      name: "Route Analyzer",
      version: "1.0.0",
      format: "onnx-lite",
      size: 1024 * 1024, // 1MB
      inputShape: [1, routeData.length],
      outputShape: [1, 10],
      taskType: "routing",
      description: "Analyzes and optimizes maritime routes"
    });
  }

  // Load model if not loaded
  if (edgeAICore.getModelStatus(routeModelId) !== "loaded") {
    await edgeAICore.loadModel(routeModelId);
  }

  return edgeAICore.infer({
    modelId: routeModelId,
    input: routeData
  });
}

/**
 * Quick failure detection using edge AI
 */
export async function detectFailure(sensorData: number[]): Promise<InferenceResult> {
  const failureModelId = "failure-detector-v1";
  
  if (!edgeAICore.listModels().find(m => m.id === failureModelId)) {
    edgeAICore.registerModel({
      id: failureModelId,
      name: "Failure Detector",
      version: "1.0.0",
      format: "ggml",
      size: 512 * 1024, // 512KB
      inputShape: [1, sensorData.length],
      outputShape: [1, 5],
      taskType: "failure-detection",
      description: "Detects equipment failures from sensor data"
    });
  }

  if (edgeAICore.getModelStatus(failureModelId) !== "loaded") {
    await edgeAICore.loadModel(failureModelId);
  }

  return edgeAICore.infer({
    modelId: failureModelId,
    input: sensorData
  });
}
