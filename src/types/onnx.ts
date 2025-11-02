/**
 * PATCH-601: TypeScript type definitions for ONNX Runtime
 * Comprehensive types for ONNX model inference and execution
 */

import type { InferenceSession, Tensor } from "onnxruntime-web";

export type { InferenceSession, Tensor };

export interface OnnxModelConfig {
  modelPath: string;
  executionProviders?: ExecutionProvider[];
  graphOptimizationLevel?: GraphOptimizationLevel;
  enableMemPattern?: boolean;
  enableCpuMemArena?: boolean;
  enableProfiling?: boolean;
  logLevel?: "verbose" | "info" | "warning" | "error" | "fatal";
}

export type ExecutionProvider = 
  | "webgl"
  | "wasm"
  | "cpu"
  | "webgpu"
  | "webnn";

export type GraphOptimizationLevel = 
  | "disabled"
  | "basic"
  | "extended"
  | "all";

export interface OnnxInferenceInput {
  [inputName: string]: Tensor;
}

export interface OnnxInferenceOutput {
  [outputName: string]: Tensor;
}

export interface OnnxModelMetadata {
  inputNames: string[];
  outputNames: string[];
  inputShapes: Record<string, number[]>;
  outputShapes: Record<string, number[]>;
  modelVersion?: string;
  domain?: string;
  producer?: string;
  description?: string;
}

export interface OnnxTensorData {
  data: Float32Array | Int32Array | Uint8Array | number[];
  dims: number[];
  type: TensorDataType;
}

export type TensorDataType = 
  | "float32"
  | "int32"
  | "uint8"
  | "bool"
  | "float64"
  | "int64"
  | "string";

export interface OnnxInferenceOptions {
  timeout?: number;
  batchSize?: number;
  preprocessor?: (input: unknown) => OnnxTensorData;
  postprocessor?: (output: OnnxInferenceOutput) => unknown;
}

export interface OnnxInferenceResult<T = unknown> {
  output: OnnxInferenceOutput;
  processedOutput?: T;
  inferenceTime: number;
  preprocessTime?: number;
  postprocessTime?: number;
}

export interface OnnxModelInfo {
  session: InferenceSession;
  metadata: OnnxModelMetadata;
  loadedAt: Date;
  inferenceCount: number;
  averageInferenceTime: number;
  lastInferenceAt?: Date;
}

export interface OnnxError {
  type: OnnxErrorType;
  message: string;
  originalError?: Error;
  timestamp: Date;
  modelPath?: string;
}

export type OnnxErrorType = 
  | "model_load_failed"
  | "inference_failed"
  | "invalid_input"
  | "invalid_output"
  | "session_creation_failed"
  | "preprocessing_failed"
  | "postprocessing_failed"
  | "timeout"
  | "unknown";

export interface OnnxPerformanceMetrics {
  modelLoadTime: number;
  totalInferences: number;
  successfulInferences: number;
  failedInferences: number;
  averageInferenceTime: number;
  minInferenceTime: number;
  maxInferenceTime: number;
  lastInferenceTime?: number;
}

export interface OnnxPreprocessConfig {
  normalizeInput?: boolean;
  meanValues?: number[];
  stdValues?: number[];
  targetDims?: number[];
  dataType?: TensorDataType;
}

export interface OnnxPostprocessConfig {
  threshold?: number;
  topK?: number;
  labels?: string[];
  outputFormat?: "raw" | "probabilities" | "labels" | "bounding_boxes";
}

export interface OnnxBatchInferenceInput {
  inputs: OnnxInferenceInput[];
  batchSize: number;
}

export interface OnnxBatchInferenceResult {
  outputs: OnnxInferenceOutput[];
  batchInferenceTime: number;
  perItemInferenceTimes: number[];
}
