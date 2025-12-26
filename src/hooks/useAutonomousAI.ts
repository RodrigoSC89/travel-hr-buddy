/**
 * useAutonomousAI Hook - PATCH 851
 * React hook for interacting with the Autonomous AI system
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  autonomousAI, 
  type AIDecision, 
  type LearningMetrics,
  type DecisionStatus,
  type DecisionType
} from '@/lib/autonomy';

interface UseAutonomousAIReturn {
  decisions: AIDecision[];
  pendingDecisions: AIDecision[];
  learningMetrics: LearningMetrics;
  statistics: ReturnType<typeof autonomousAI.getStatistics>;
  isActive: boolean;
  // Actions
  approveDecision: (id: string) => boolean;
  rejectDecision: (id: string, reason?: string) => boolean;
  executeDecision: (id: string) => Promise<boolean>;
  provideFeedback: (id: string, wasCorrect: boolean, notes?: string) => void;
  rollbackDecision: (id: string) => Promise<boolean>;
  // Filters
  filterByStatus: (status: DecisionStatus) => AIDecision[];
  filterByType: (type: DecisionType) => AIDecision[];
  // Control
  start: () => void;
  stop: () => void;
  refresh: () => void;
}

export function useAutonomousAI(): UseAutonomousAIReturn {
  const [decisions, setDecisions] = useState<AIDecision[]>([]);
  const [pendingDecisions, setPendingDecisions] = useState<AIDecision[]>([]);
  const [learningMetrics, setLearningMetrics] = useState<LearningMetrics>(autonomousAI.getLearningMetrics());
  const [statistics, setStatistics] = useState(autonomousAI.getStatistics());
  const [isActive, setIsActive] = useState(false);

  const refresh = useCallback(() => {
    setDecisions(autonomousAI.getDecisions());
    setPendingDecisions(autonomousAI.getPendingDecisions());
    setLearningMetrics(autonomousAI.getLearningMetrics());
    setStatistics(autonomousAI.getStatistics());
    setIsActive(autonomousAI.getStatistics().isActive);
  }, []);

  useEffect(() => {
    refresh();
    
    // Refresh periodically
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  const approveDecision = useCallback((id: string): boolean => {
    const result = autonomousAI.approveDecision(id);
    refresh();
    return result;
  }, [refresh]);

  const rejectDecision = useCallback((id: string, reason?: string): boolean => {
    const result = autonomousAI.rejectDecision(id, reason);
    refresh();
    return result;
  }, [refresh]);

  const executeDecision = useCallback(async (id: string): Promise<boolean> => {
    const result = await autonomousAI.executeDecision(id);
    refresh();
    return result;
  }, [refresh]);

  const provideFeedback = useCallback((id: string, wasCorrect: boolean, notes?: string) => {
    autonomousAI.provideFeedback(id, {
      wasCorrect,
      actualOutcome: wasCorrect ? "Decisão correta" : "Decisão incorreta",
      notes
    });
    refresh();
  }, [refresh]);

  const rollbackDecision = useCallback(async (id: string): Promise<boolean> => {
    const result = await autonomousAI.rollbackDecision(id);
    refresh();
    return result;
  }, [refresh]);

  const filterByStatus = useCallback((status: DecisionStatus): AIDecision[] => {
    return autonomousAI.getDecisions({ status });
  }, []);

  const filterByType = useCallback((type: DecisionType): AIDecision[] => {
    return autonomousAI.getDecisions({ type });
  }, []);

  const start = useCallback(() => {
    autonomousAI.start();
    refresh();
  }, [refresh]);

  const stop = useCallback(() => {
    autonomousAI.stop();
    refresh();
  }, [refresh]);

  return {
    decisions,
    pendingDecisions,
    learningMetrics,
    statistics,
    isActive,
    approveDecision,
    rejectDecision,
    executeDecision,
    provideFeedback,
    rollbackDecision,
    filterByStatus,
    filterByType,
    start,
    stop,
    refresh
  };
}
