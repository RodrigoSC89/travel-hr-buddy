/**
 * Hook for Edge AI (Local Inference)
 * Runs ML models directly in browser for offline/low-latency predictions
 */

import { useState, useCallback, useEffect } from "react";
import { onnxRuntime, MARITIME_MODELS } from "@/lib/edge-ai/onnx-runtime";
import { logger } from "@/lib/logger";

export interface ModelConfig {
  name: string;
  path: string;
  inputNames: string[];
  outputNames: string[];
}

export interface EdgeAIPrediction {
  modelName: string;
  prediction: number;
  confidence: number;
  label: string;
  timestamp: Date;
  latencyMs: number;
}

export interface EdgeAIStatus {
  isReady: boolean;
  loadedModels: string[];
  offlineCapable: boolean;
  lastPrediction: EdgeAIPrediction | null;
}

export function useEdgeAI() {
  const [status, setStatus] = useState<EdgeAIStatus>({
    isReady: false,
    loadedModels: [],
    offlineCapable: false,
    lastPrediction: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<EdgeAIPrediction[]>([]);

  // Initialize runtime
  useEffect(() => {
    const init = async () => {
      try {
        await onnxRuntime.initialize();
        setStatus(prev => ({
          ...prev,
          isReady: true,
          offlineCapable: true
        }));
      } catch (error) {
        logger.warn("ONNX Runtime initialization failed", { error });
      }
    };
    init();
  }, []);

  // Load a model
  const loadModel = useCallback(async (modelKey: string) => {
    setIsLoading(true);
    try {
      const success = await onnxRuntime.loadModel(modelKey);
      if (success) {
        setStatus(prev => ({
          ...prev,
          loadedModels: [...prev.loadedModels, modelKey]
        }));
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Run prediction using ONNX runtime
  const predict = useCallback(async (
    modelKey: string, 
    inputs: number[]
  ): Promise<EdgeAIPrediction | null> => {
    const startTime = performance.now();
    
    try {
      const result = await onnxRuntime.infer(modelKey, inputs);
      if (!result) return null;

      const latencyMs = performance.now() - startTime;
      const modelConfig = MARITIME_MODELS[modelKey];

      // Find highest probability class
      const predictions_arr = result.predictions as number[];
      const maxIndex = predictions_arr.indexOf(Math.max(...predictions_arr));

      const prediction: EdgeAIPrediction = {
        modelName: modelConfig?.name || modelKey,
        prediction: maxIndex,
        confidence: result.confidence,
        label: modelConfig?.labels?.[maxIndex] || `class_${maxIndex}`,
        timestamp: new Date(),
        latencyMs
      };

      setPredictions(prev => [prediction, ...prev.slice(0, 99)]);
      setStatus(prev => ({ ...prev, lastPrediction: prediction }));

      return prediction;
    } catch (error) {
      console.error("Prediction error:", error);
      return null;
    }
  }, []);

  // Crew risk assessment
  const assessCrewRisk = useCallback(async (crew: {
    age: number;
    yearsExperience: number;
    certificationsCount: number;
    lastMedicalDays: number;
    voyagesCompleted: number;
    incidentCount: number;
    trainingScore: number;
    restHoursAvg: number;
    workHoursAvg: number;
    satisfactionScore: number;
  }) => {
    return onnxRuntime.assessCrewRisk(crew);
  }, []);

  // Maintenance prediction
  const predictMaintenance = useCallback(async (equipmentFeatures: number[]) => {
    return onnxRuntime.predictMaintenance(equipmentFeatures);
  }, []);

  // Document classification
  const classifyDocument = useCallback(async (textEmbedding: number[]) => {
    return onnxRuntime.classifyDocument(textEmbedding);
  }, []);

  // Get model stats
  const getStats = useCallback(() => {
    if (predictions.length === 0) {
      return {
        totalPredictions: 0,
        avgLatency: 0,
        avgConfidence: 0
      };
    }

    return {
      totalPredictions: predictions.length,
      avgLatency: Math.round(
        predictions.reduce((sum, p) => sum + p.latencyMs, 0) / predictions.length
      ),
      avgConfidence: Math.round(
        predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length * 100
      ) / 100
    };
  }, [predictions]);

  // Get available models
  const getAvailableModels = useCallback(() => {
    return Object.entries(MARITIME_MODELS).map(([key, config]) => ({
      key,
      name: config.name,
      isLoaded: onnxRuntime.isModelLoaded(key)
    }));
  }, []);

  return {
    status,
    isLoading,
    predictions,
    loadModel,
    predict,
    assessCrewRisk,
    predictMaintenance,
    classifyDocument,
    getStats,
    getAvailableModels
  };
}
