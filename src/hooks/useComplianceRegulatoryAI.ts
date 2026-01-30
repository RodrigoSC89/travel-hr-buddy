/**
 * Hook for Compliance & Regulatory AI Module
 * SOLAS, MARPOL, MLC, ISM, ISPS compliance automation
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ComplianceStatus {
  regulation: string;
  status: 'compliant' | 'non_compliant' | 'pending' | 'expiring';
  score: number;
  gaps: Array<{ item: string; severity: 'critical' | 'major' | 'minor'; action: string }>;
  deadline?: string;
  evidence: string[];
}

export interface RegulatoryUpdate {
  id: string;
  source: 'IMO' | 'Flag State' | 'Port State' | 'Class Society';
  title: string;
  summary: string;
  effectiveDate: string;
  impactLevel: 'high' | 'medium' | 'low';
  affectedVessels: string[];
  actionRequired: string;
}

export interface PSCPrediction {
  port: string;
  inspectionProbability: number;
  predictedDeficiencies: Array<{ 
    code: string; 
    description: string; 
    probability: number;
    historicalOccurrences: number;
  }>;
  detentionRisk: 'low' | 'medium' | 'high';
  recommendations: string[];
  readinessScore: number;
}

export interface AuditPreparation {
  auditType: 'ISM' | 'ISPS' | 'MLC' | 'Class' | 'Flag State';
  scheduledDate: string;
  checklistProgress: number;
  pendingItems: Array<{ item: string; responsible: string; deadline: string }>;
  documentationStatus: { complete: number; pending: number; expired: number };
  crewTrainingStatus: { certified: number; expiring: number; expired: number };
}

export function useComplianceRegulatoryAI() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkCompliance = useCallback(async (
    vesselId: string,
    regulations?: string[]
  ): Promise<ComplianceStatus[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('compliance-regulatory-ai', {
        body: { 
          action: 'check_compliance',
          vesselId,
          regulations: regulations || ['SOLAS', 'MARPOL', 'MLC', 'ISM', 'ISPS']
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      const overallScore = data.complianceStatuses?.reduce(
        (acc: number, s: ComplianceStatus) => acc + s.score, 0
      ) / (data.complianceStatuses?.length || 1);

      toast({
        title: 'Compliance Verificado',
        description: `Score geral: ${overallScore?.toFixed(1) || 95}%`,
      });

      return data.complianceStatuses;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao verificar compliance';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getRegulatoryUpdates = useCallback(async (
    vesselTypes?: string[],
    flagStates?: string[]
  ): Promise<RegulatoryUpdate[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('compliance-regulatory-ai', {
        body: { 
          action: 'get_regulatory_updates',
          vesselTypes,
          flagStates
        }
      });

      if (fnError) throw new Error(fnError.message);
      return data.regulatoryUpdates;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar atualizações';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const predictPSCInspection = useCallback(async (
    vesselId: string,
    targetPort: string
  ): Promise<PSCPrediction | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('compliance-regulatory-ai', {
        body: { 
          action: 'predict_psc',
          vesselId,
          targetPort
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'Predição PSC Concluída',
        description: `Risco de detenção: ${data.pscPrediction?.detentionRisk || 'baixo'}`,
      });

      return data.pscPrediction;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao prever inspeção PSC';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const prepareAudit = useCallback(async (
    vesselId: string,
    auditType: 'ISM' | 'ISPS' | 'MLC' | 'Class' | 'Flag State',
    scheduledDate: string
  ): Promise<AuditPreparation | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('compliance-regulatory-ai', {
        body: { 
          action: 'prepare_audit',
          vesselId,
          auditType,
          scheduledDate
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'Preparação de Auditoria',
        description: `Progresso: ${data.auditPreparation?.checklistProgress || 75}%`,
      });

      return data.auditPreparation;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao preparar auditoria';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const generateGapAnalysis = useCallback(async (
    vesselId: string,
    regulation: string
  ): Promise<{ gaps: Array<{ item: string; currentStatus: string; required: string; action: string; deadline: string }> } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('compliance-regulatory-ai', {
        body: { 
          action: 'gap_analysis',
          vesselId,
          regulation
        }
      });

      if (fnError) throw new Error(fnError.message);
      return data.gapAnalysis;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao gerar gap analysis';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const trackCertificates = useCallback(async (
    vesselId: string
  ): Promise<Array<{ name: string; issueDate: string; expiryDate: string; status: string; daysToExpiry: number }> | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('compliance-regulatory-ai', {
        body: { 
          action: 'track_certificates',
          vesselId
        }
      });

      if (fnError) throw new Error(fnError.message);
      return data.certificates;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao rastrear certificados';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    checkCompliance,
    getRegulatoryUpdates,
    predictPSCInspection,
    prepareAudit,
    generateGapAnalysis,
    trackCertificates
  };
}
