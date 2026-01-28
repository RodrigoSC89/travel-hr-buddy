/**
 * useIncidentClassifier Hook
 * React interface for Incident Classifier AI Engine
 */
import { useState, useCallback } from 'react';
import { 
  incidentClassifierEngine,
  type RawIncident,
  type ClassifiedIncident
} from '@/lib/ai/engines/incident-classifier';

export interface UseIncidentClassifierReturn {
  isClassifying: boolean;
  classification: ClassifiedIncident | null;
  classifyIncident: (incident: RawIncident, historicalIncidents?: RawIncident[]) => ClassifiedIncident;
  batchClassify: (incidents: RawIncident[], historicalIncidents?: RawIncident[]) => ClassifiedIncident[];
  getClassificationStats: (classifiedIncidents: ClassifiedIncident[]) => ReturnType<typeof incidentClassifierEngine.getClassificationStats>;
}

export function useIncidentClassifier(): UseIncidentClassifierReturn {
  const [isClassifying, setIsClassifying] = useState(false);
  const [classification, setClassification] = useState<ClassifiedIncident | null>(null);

  const classifyIncident = useCallback((
    incident: RawIncident, 
    historicalIncidents: RawIncident[] = []
  ): ClassifiedIncident => {
    setIsClassifying(true);
    try {
      const result = incidentClassifierEngine.classifyIncident(incident, historicalIncidents);
      setClassification(result);
      return result;
    } finally {
      setIsClassifying(false);
    }
  }, []);

  const batchClassify = useCallback((
    incidents: RawIncident[], 
    historicalIncidents: RawIncident[] = []
  ): ClassifiedIncident[] => {
    setIsClassifying(true);
    try {
      return incidentClassifierEngine.batchClassify(incidents, historicalIncidents);
    } finally {
      setIsClassifying(false);
    }
  }, []);

  const getClassificationStats = useCallback((classifiedIncidents: ClassifiedIncident[]) => {
    return incidentClassifierEngine.getClassificationStats(classifiedIncidents);
  }, []);

  return {
    isClassifying,
    classification,
    classifyIncident,
    batchClassify,
    getClassificationStats
  };
}
