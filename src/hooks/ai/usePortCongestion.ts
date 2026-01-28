/**
 * usePortCongestion Hook
 * React interface for Port Congestion Predictor
 */
import { useState, useCallback } from 'react';
import { 
  portCongestionPredictor,
  type PortData,
  type CongestionPrediction
} from '@/lib/ai/engines/port-congestion-predictor';

export interface UsePortCongestionReturn {
  isPredicting: boolean;
  prediction: CongestionPrediction | null;
  predictCongestion: (portData: PortData, horizonHours?: number) => CongestionPrediction;
  comparePortOptions: (ports: PortData[]) => {
    rankings: Array<{
      portId: string;
      portName: string;
      score: number;
      currentWait: number;
      predictedWait24h: number;
      recommendation: string;
    }>;
    bestOption: string;
    analysis: string;
  };
  suggestArrivalTime: (portData: PortData, earliestArrival: Date, latestArrival: Date) => {
    optimalTime: Date;
    expectedWait: number;
    congestionLevel: string;
    savings: { timeHours: number; percentReduction: number };
  };
}

export function usePortCongestion(): UsePortCongestionReturn {
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState<CongestionPrediction | null>(null);

  const predictCongestion = useCallback((portData: PortData, horizonHours: number = 72): CongestionPrediction => {
    setIsPredicting(true);
    try {
      const result = portCongestionPredictor.predictCongestion(portData, horizonHours);
      setPrediction(result);
      return result;
    } finally {
      setIsPredicting(false);
    }
  }, []);

  const comparePortOptions = useCallback((ports: PortData[]) => {
    setIsPredicting(true);
    try {
      return portCongestionPredictor.comparePortOptions(ports);
    } finally {
      setIsPredicting(false);
    }
  }, []);

  const suggestArrivalTime = useCallback((portData: PortData, earliestArrival: Date, latestArrival: Date) => {
    return portCongestionPredictor.suggestArrivalTime(portData, earliestArrival, latestArrival);
  }, []);

  return {
    isPredicting,
    prediction,
    predictCongestion,
    comparePortOptions,
    suggestArrivalTime
  };
}
