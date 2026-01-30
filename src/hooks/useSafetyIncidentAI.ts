/**
 * Hook for Safety & Incident AI Module
 * Incident reporting, root cause analysis, safety analytics, drill management
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Incident {
  id: string;
  type: 'near_miss' | 'injury' | 'property_damage' | 'environmental' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
  reportedAt: string;
  reportedBy: string;
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  witnesses: string[];
  evidence: Array<{ type: 'photo' | 'video' | 'document'; url: string }>;
}

export interface RootCauseAnalysis {
  incidentId: string;
  methodology: '5_whys' | 'fishbone' | 'fault_tree';
  rootCauses: string[];
  contributingFactors: Array<{ 
    category: 'human' | 'equipment' | 'environment' | 'process' | 'management'; 
    factor: string; 
    weight: number 
  }>;
  systemicIssues: string[];
  recommendations: Array<{ action: string; priority: 'immediate' | 'short_term' | 'long_term'; responsible: string }>;
  preventiveMeasures: string[];
}

export interface SafetyMetrics {
  period: string;
  ltifr: number; // Lost Time Injury Frequency Rate
  trir: number; // Total Recordable Incident Rate
  nearMisses: number;
  safetyObservations: number;
  drillsCompleted: number;
  drillsPlanned: number;
  trainingHours: number;
  inspectionsCompleted: number;
  openActions: number;
  riskScore: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface DrillScenario {
  id: string;
  type: 'fire' | 'abandon_ship' | 'man_overboard' | 'spill' | 'security' | 'medical';
  name: string;
  description: string;
  objectives: string[];
  participants: string[];
  duration: number;
  score: number;
  competencies: Array<{ skill: string; rating: number }>;
  improvements: string[];
}

export function useSafetyIncidentAI() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reportIncident = useCallback(async (
    incident: Omit<Incident, 'id' | 'status' | 'reportedAt'>
  ): Promise<Incident | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('safety-incident-ai', {
        body: { 
          action: 'report_incident',
          incident
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'Incidente Registrado',
        description: `Severidade classificada: ${data.incident?.severity || incident.severity}`,
      });

      return data.incident;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao registrar incidente';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const analyzeRootCause = useCallback(async (
    incidentId: string,
    methodology: '5_whys' | 'fishbone' | 'fault_tree' = '5_whys'
  ): Promise<RootCauseAnalysis | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('safety-incident-ai', {
        body: { 
          action: 'analyze_root_cause',
          incidentId,
          methodology
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'Análise Concluída',
        description: `${data.rootCauseAnalysis?.rootCauses?.length || 3} causas raiz identificadas`,
      });

      return data.rootCauseAnalysis;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao analisar causa raiz';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getSafetyMetrics = useCallback(async (
    vesselId?: string,
    period: 'month' | 'quarter' | 'year' = 'month'
  ): Promise<SafetyMetrics | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('safety-incident-ai', {
        body: { 
          action: 'get_safety_metrics',
          vesselId,
          period
        }
      });

      if (fnError) throw new Error(fnError.message);
      return data.safetyMetrics;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar métricas';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateDrillScenario = useCallback(async (
    vesselId: string,
    drillType: 'fire' | 'abandon_ship' | 'man_overboard' | 'spill' | 'security' | 'medical'
  ): Promise<DrillScenario | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('safety-incident-ai', {
        body: { 
          action: 'generate_drill_scenario',
          vesselId,
          drillType
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'Cenário Gerado',
        description: `Drill: ${data.drillScenario?.name || drillType}`,
      });

      return data.drillScenario;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao gerar cenário';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const evaluateDrill = useCallback(async (
    drillId: string,
    performance: { responseTime: number; effectiveness: number; teamwork: number; communication: number }
  ): Promise<{ score: number; feedback: string; improvements: string[] } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('safety-incident-ai', {
        body: { 
          action: 'evaluate_drill',
          drillId,
          performance
        }
      });

      if (fnError) throw new Error(fnError.message);
      return data.drillEvaluation;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao avaliar drill';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const predictIncidents = useCallback(async (
    vesselId: string
  ): Promise<Array<{ type: string; probability: number; riskFactors: string[]; mitigations: string[] }> | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('safety-incident-ai', {
        body: { 
          action: 'predict_incidents',
          vesselId
        }
      });

      if (fnError) throw new Error(fnError.message);
      return data.incidentPredictions;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao prever incidentes';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    reportIncident,
    analyzeRootCause,
    getSafetyMetrics,
    generateDrillScenario,
    evaluateDrill,
    predictIncidents
  };
}
