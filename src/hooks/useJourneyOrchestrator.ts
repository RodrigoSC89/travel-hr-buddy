/**
 * Hook for OJAC Journey Orchestrator
 * NAUTILUS ONE v4.0 - Autonomous Platform
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  journeyOrchestrator, 
  type JourneyDefinition, 
  type JourneyContext,
  type JourneyEvent 
} from '@/lib/ai/journey-orchestrator';
import { toast } from 'sonner';

export interface UseJourneyOrchestratorReturn {
  activeJourneys: JourneyDefinition[];
  history: JourneyDefinition[];
  statistics: {
    total: number;
    active: number;
    completed: number;
    failed: number;
    successRate: number;
    averageDuration: number;
  };
  triggerJourney: (event: JourneyEvent, context: JourneyContext) => Promise<JourneyDefinition>;
  cancelJourney: (journeyId: string) => boolean;
  executeTask: (journeyId: string, taskId: string) => Promise<boolean>;
  getJourney: (id: string) => JourneyDefinition | undefined;
  refresh: () => void;
}

export function useJourneyOrchestrator(): UseJourneyOrchestratorReturn {
  const [activeJourneys, setActiveJourneys] = useState<JourneyDefinition[]>([]);
  const [history, setHistory] = useState<JourneyDefinition[]>([]);
  const [statistics, setStatistics] = useState(journeyOrchestrator.getStatistics());

  const refresh = useCallback(() => {
    setActiveJourneys(journeyOrchestrator.getActiveJourneys());
    setHistory(journeyOrchestrator.getHistory());
    setStatistics(journeyOrchestrator.getStatistics());
  }, []);

  useEffect(() => {
    refresh();

    // Set up listeners
    journeyOrchestrator.on('journey-started', () => {
      refresh();
      toast.info('Nova jornada iniciada');
    });

    journeyOrchestrator.on('journey-completed', (journey) => {
      refresh();
      toast.success('Jornada concluída', {
        description: (journey as JourneyDefinition).name
      });
    });

    journeyOrchestrator.on('journey-failed', (journey) => {
      refresh();
      toast.error('Jornada falhou', {
        description: (journey as JourneyDefinition).name
      });
    });

    journeyOrchestrator.on('task-completed', () => {
      refresh();
    });

    journeyOrchestrator.on('task-failed', () => {
      refresh();
    });

    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  const triggerJourney = useCallback(async (
    event: JourneyEvent, 
    context: JourneyContext
  ): Promise<JourneyDefinition> => {
    try {
      const journey = await journeyOrchestrator.triggerJourney(event, context);
      refresh();
      return journey;
    } catch (error) {
      toast.error('Erro ao criar jornada', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      throw error;
    }
  }, [refresh]);

  const cancelJourney = useCallback((journeyId: string): boolean => {
    const result = journeyOrchestrator.cancelJourney(journeyId);
    if (result) {
      toast.info('Jornada cancelada');
      refresh();
    }
    return result;
  }, [refresh]);

  const executeTask = useCallback(async (journeyId: string, taskId: string): Promise<boolean> => {
    const result = await journeyOrchestrator.executeTask(journeyId, taskId);
    refresh();
    return result;
  }, [refresh]);

  const getJourney = useCallback((id: string): JourneyDefinition | undefined => {
    return journeyOrchestrator.getJourney(id);
  }, []);

  return {
    activeJourneys,
    history,
    statistics,
    triggerJourney,
    cancelJourney,
    executeTask,
    getJourney,
    refresh
  };
}
