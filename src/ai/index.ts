/**
 * AI Module Exports
 * 
 * Exporta módulos de inteligência artificial:
 * - nautilus-inference: Inferência local com ONNX
 * - nautilus-core: Análise de logs e relatórios
 * - kernel: AI Context Runner for all modules (PATCH 74.0)
 * 
 * @module ai
 */

export { nautilusInference, type InferenceResult, type AnalysisResult } from "./nautilus-inference";
export * from "./nautilus-core";
export { 
  runAIContext, 
  getAIContextLogs, 
  clearAIContextLogs, 
  getAIContextStats,
  type AIContextRequest,
  type AIContextResponse
} from "./kernel";
