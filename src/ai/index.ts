/**
 * AI Module Exports
 * 
 * Exporta módulos de inteligência artificial:
 * - nautilus-inference: Inferência local com ONNX
 * - nautilus-core: Análise de logs e relatórios
 * 
 * @module ai
 */

export { nautilusInference, type InferenceResult, type AnalysisResult } from "./nautilus-inference";
export * from "./nautilus-core";
