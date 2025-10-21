/**
 * AI Types
 * Type definitions for the Adaptive AI module
 */

export interface AILog {
  timestamp: string;
  message: string;
  context?: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
}

export interface AIAdvice {
  message: string;
  confidence: number;
  recommendations?: string[];
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface AIModel {
  name: string;
  version: string;
  type: 'GGUF' | 'ONNX' | 'TensorFlow';
  accuracy?: number;
}
