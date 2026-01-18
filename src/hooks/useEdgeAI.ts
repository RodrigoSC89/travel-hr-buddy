/**
 * Hook for Edge AI (Local Inference)
 * Runs ML models directly in browser for offline/low-latency predictions
 */

import { useState, useCallback, useEffect } from "react";
import { EdgeAIRuntime } from "@/lib/edge-ai/onnx-runtime";

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

// Create singleton runtime
const runtime = new EdgeAIRuntime();

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
      const ready = await runtime.initialize();
      setStatus(prev => ({
        ...prev,
        isReady: ready,
        offlineCapable: ready
      }));
    };
    init();
  }, []);

  // Load a model
  const loadModel = useCallback(async (config: ModelConfig) => {
    setIsLoading(true);
    try {
      const success = await runtime.loadModel(config);
      if (success) {
        setStatus(prev => ({
          ...prev,
          loadedModels: [...prev.loadedModels, config.name]
        }));
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Run prediction
  const predict = useCallback(async (
    modelName: string, 
    inputs: Record<string, number[]>
  ): Promise<EdgeAIPrediction | null> => {
    const startTime = performance.now();
    
    try {
      const result = await runtime.predict(modelName, inputs);
      if (!result) return null;

      const latencyMs = performance.now() - startTime;

      // Find highest probability class
      const maxIndex = result.indexOf(Math.max(...result));
      const labels = getLabelsForModel(modelName);

      const prediction: EdgeAIPrediction = {
        modelName,
        prediction: maxIndex,
        confidence: result[maxIndex],
        label: labels[maxIndex] || `class_${maxIndex}`,
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
    yearsAtSea: number;
    certifications: number;
    restHours: number;
  }): Promise<EdgeAIPrediction | null> => {
    return predict("crew-risk", {
      age: [crew.age],
      years_at_sea: [crew.yearsAtSea],
      certifications: [crew.certifications],
      rest_hours: [crew.restHours]
    });
  }, [predict]);

  // Maintenance prediction
  const predictMaintenance = useCallback(async (equipment: {
    temperature: number;
    oilPressure: number;
    fuelConsumption: number;
    vibration: number;
    noiseLevel: number;
  }): Promise<EdgeAIPrediction | null> => {
    return predict("maintenance-predictor", {
      temperature: [equipment.temperature],
      oil_pressure: [equipment.oilPressure],
      fuel_consumption: [equipment.fuelConsumption],
      vibration: [equipment.vibration],
      noise_level: [equipment.noiseLevel]
    });
  }, [predict]);

  // Anomaly detection
  const detectAnomaly = useCallback(async (
    metrics: number[]
  ): Promise<EdgeAIPrediction | null> => {
    return predict("anomaly-detector", {
      metrics
    });
  }, [predict]);

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

  return {
    status,
    isLoading,
    predictions,
    loadModel,
    predict,
    assessCrewRisk,
    predictMaintenance,
    detectAnomaly,
    getStats
  };
}

// Helper to get labels for different models
function getLabelsForModel(modelName: string): string[] {
  const labelMaps: Record<string, string[]> = {
    "crew-risk": ["low_risk", "medium_risk", "high_risk"],
    "maintenance-predictor": ["normal", "warning", "critical"],
    "anomaly-detector": ["normal", "anomaly"]
  };
  return labelMaps[modelName] || [];
}
