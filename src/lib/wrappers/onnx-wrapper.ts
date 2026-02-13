/**
 * PATCH 548 - ONNX Runtime Wrapper
 * Type-safe wrapper for ONNX Runtime operations
 */

import type {
  ONNXConfig,
  ONNXModel,
  ONNXInputs,
  ONNXOutputs,
  ONNXInferenceSession,
  ONNXTensor
} from "@/types/ai-core";
import { logger } from "@/lib/logger";

class ONNXSessionWrapper implements ONNXInferenceSession {
  private session: unknown = null;
  private model: ONNXModelWrapper | null = null;

  constructor(private config: ONNXConfig) {}

  async loadModel(modelPath: string): Promise<ONNXModel> {
    try {
      // Dynamic import to handle ONNX Runtime
      const ort = await import("onnxruntime-web");
      
      this.session = await ort.InferenceSession.create(modelPath, {
        executionProviders: this.config.executionProviders,
        graphOptimizationLevel: this.config.graphOptimizationLevel ?? "all",
        enableCpuMemArena: this.config.enableCpuMemArena ?? true,
        enableMemPattern: this.config.enableMemPattern ?? true,
        executionMode: this.config.executionMode ?? "sequential",
        logSeverityLevel: this.config.logSeverityLevel ?? 2,
      });

      const inputNames = (this.session as unknown as { inputNames: string[] }).inputNames;
      const outputNames = (this.session as unknown as { outputNames: string[] }).outputNames;

      this.model = new ONNXModelWrapper(this.session, inputNames, outputNames);
      
      logger.info(`[ONNX] Model loaded successfully from ${modelPath}`);
      return this.model;
    } catch (error) {
      logger.error("[ONNX] Failed to load model:", error);
      throw error;
    }
  }

  async run(inputs: ONNXInputs): Promise<ONNXOutputs> {
    if (!this.model) {
      throw new Error("Model not loaded");
    }
    return this.model.run(inputs);
  }

  release(): void {
    if (this.model) {
      this.model.release();
      this.model = null;
    }
    if (this.session) {
      (this.session as unknown as { release?: () => void }).release?.();
      this.session = null;
    }
    logger.info("[ONNX] Session released");
  }
}

class ONNXModelWrapper implements ONNXModel {
  constructor(
    private session: unknown,
    public inputNames: string[],
    public outputNames: string[]
  ) {}

  async run(inputs: ONNXInputs): Promise<ONNXOutputs> {
    try {
      // Convert inputs to ONNX format
      const feeds: Record<string, unknown> = {};
      for (const [name, tensor] of Object.entries(inputs)) {
        feeds[name] = new (window as unknown as { ort: { Tensor: new (type: string, data: unknown, dims: number[]) => unknown } }).ort.Tensor(
          tensor.type,
          tensor.data as unknown,
          tensor.dims
        );
      }

      // Run inference
      const results = await (this.session as unknown as { run: (feeds: Record<string, unknown>) => Promise<Record<string, unknown>> }).run(feeds);

      // Convert outputs to our format
      const outputs: ONNXOutputs = {};
      for (const [name, tensor] of Object.entries(results)) {
        const t = tensor as { data: Float32Array; dims: number[]; type: ONNXTensor["type"] };
        outputs[name] = {
          data: t.data,
          dims: t.dims,
          type: t.type,
        };
      }

      return outputs;
    } catch (error) {
      logger.error("[ONNX] Inference error:", error);
      throw error;
    }
  }

  release(): void {
    // Session release is handled by the parent
    logger.debug("[ONNX] Model wrapper released");
  }
}

/**
 * Factory function to create ONNX inference session
 */
export function createONNXSession(config: ONNXConfig): ONNXInferenceSession {
  return new ONNXSessionWrapper(config);
}

/**
 * Helper to create ONNX tensor from array
 */
export function createTensor(
  data: Float32Array | Int32Array | Uint8Array,
  dims: number[],
  type: ONNXTensor["type"] = "float32"
): ONNXTensor {
  return { data, dims, type };
}
