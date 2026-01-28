/**
 * useNCPrediction Hook
 * React interface for non-conformity prediction engine
 */

import { useState, useCallback } from 'react';
import { 
  ncPredictionEngine, 
  type VesselInspectionData, 
  type NCPrediction,
  type InspectionType
} from '@/lib/ai/engines/nc-prediction';

export interface UseNCPredictionReturn {
  isProcessing: boolean;
  prediction: NCPrediction | null;
  predictNC: (data: VesselInspectionData, inspectionType: InspectionType, targetPort?: string) => NCPrediction;
}

export function useNCPrediction(): UseNCPredictionReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [prediction, setPrediction] = useState<NCPrediction | null>(null);

  const predictNC = useCallback((
    data: VesselInspectionData,
    inspectionType: InspectionType,
    targetPort?: string
  ): NCPrediction => {
    setIsProcessing(true);
    try {
      const result = ncPredictionEngine.predictNC(data, inspectionType, targetPort);
      setPrediction(result);
      return result;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    isProcessing,
    prediction,
    predictNC
  };
}
