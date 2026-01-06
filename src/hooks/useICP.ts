/**
 * Hook for ICP Compliance Predictor
 * NAUTILUS ONE v4.0 - Autonomous Platform
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  icpPredictor, 
  type RiskPrediction, 
  type ComplianceTrend,
  type ComplianceRecord 
} from '@/lib/ai/icp-compliance';
import { toast } from 'sonner';

export function useICP() {
  const [prediction, setPrediction] = useState<RiskPrediction | null>(null);
  const [trends, setTrends] = useState<ComplianceTrend[]>([]);
  const [deadlines, setDeadlines] = useState<ComplianceRecord[]>([]);

  const predictRisk = useCallback((vesselId: string) => {
    const result = icpPredictor.predictRisk(vesselId);
    setPrediction(result);
    return result;
  }, []);

  const loadTrends = useCallback((vesselId?: string) => {
    const result = icpPredictor.getComplianceTrends(vesselId);
    setTrends(result);
    return result;
  }, []);

  const loadDeadlines = useCallback((days: number = 90) => {
    const result = icpPredictor.getUpcomingDeadlines(days);
    setDeadlines(result);
    return result;
  }, []);

  const addRecord = useCallback((record: ComplianceRecord) => {
    icpPredictor.addComplianceRecord(record);
    toast.success('Registro de compliance adicionado');
  }, []);

  const reset = useCallback(() => {
    icpPredictor.reset();
    setPrediction(null);
    setTrends([]);
    setDeadlines([]);
    toast.info('ICP resetado');
  }, []);

  useEffect(() => {
    loadDeadlines(90);
  }, [loadDeadlines]);

  return {
    prediction,
    trends,
    deadlines,
    predictRisk,
    loadTrends,
    loadDeadlines,
    addRecord,
    reset
  };
}
