/**
 * Hook for Quality Management AI Module
 * NCR management, CAPA tracking, internal audits, continuous improvement
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface NonConformity {
  id: string;
  ncrNumber: string;
  title: string;
  description: string;
  category: string;
  severity: 'minor' | 'major' | 'critical';
  source: 'internal_audit' | 'external_audit' | 'psc' | 'customer' | 'observation';
  status: 'open' | 'investigating' | 'action_pending' | 'verification' | 'closed';
  rootCause?: string;
  correctiveAction?: string;
  preventiveAction?: string;
  responsible: string;
  dueDate: string;
  closedDate?: string;
  effectiveness?: 'effective' | 'partially_effective' | 'not_effective';
}

export interface CAPA {
  id: string;
  type: 'corrective' | 'preventive';
  ncrId: string;
  description: string;
  actionPlan: Array<{ step: string; responsible: string; dueDate: string; status: string }>;
  resources: string[];
  kpis: Array<{ metric: string; target: number; current: number }>;
  verification: { method: string; date: string; result?: string };
  status: 'planned' | 'in_progress' | 'completed' | 'verified';
}

export interface InternalAudit {
  id: string;
  auditNumber: string;
  scope: string[];
  standard: 'ISO 9001' | 'ISO 14001' | 'ISO 45001' | 'ISM';
  status: 'planned' | 'in_progress' | 'completed' | 'closed';
  scheduledDate: string;
  auditors: string[];
  checklist: Array<{ question: string; finding: string; status: string }>;
  findings: { conformities: number; minorNCs: number; majorNCs: number; observations: number };
  score: number;
}

export interface ImprovementProject {
  id: string;
  title: string;
  description: string;
  category: 'process' | 'product' | 'service' | 'safety' | 'environmental';
  status: 'idea' | 'evaluating' | 'approved' | 'implementing' | 'completed' | 'rejected';
  expectedROI: number;
  actualROI?: number;
  timeline: { start: string; end: string };
  team: string[];
  kpis: Array<{ metric: string; baseline: number; target: number; actual?: number }>;
}

export function useQualityManagementAI() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createNCR = useCallback(async (
    ncr: Omit<NonConformity, 'id' | 'ncrNumber' | 'status'>
  ): Promise<NonConformity | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('quality-management-ai', {
        body: { 
          action: 'create_ncr',
          ncr
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'NCR Criada',
        description: `Número: ${data.ncr?.ncrNumber || 'NCR-2024-001'}`,
      });

      return data.ncr;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar NCR';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const analyzeNCRTrends = useCallback(async (
    period: 'month' | 'quarter' | 'year' = 'quarter'
  ): Promise<{
    totalNCRs: number;
    bySeverity: Record<string, number>;
    bySource: Record<string, number>;
    byCategory: Record<string, number>;
    trends: Array<{ period: string; count: number }>;
    recurringIssues: Array<{ issue: string; occurrences: number; recommendation: string }>;
  } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('quality-management-ai', {
        body: { 
          action: 'analyze_ncr_trends',
          period
        }
      });

      if (fnError) throw new Error(fnError.message);
      return data.ncrTrends;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao analisar tendências';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateCAPA = useCallback(async (
    ncrId: string
  ): Promise<CAPA | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('quality-management-ai', {
        body: { 
          action: 'generate_capa',
          ncrId
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'CAPA Gerado',
        description: `${data.capa?.actionPlan?.length || 0} ações planejadas`,
      });

      return data.capa;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao gerar CAPA';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const planAudit = useCallback(async (
    scope: string[],
    standard: 'ISO 9001' | 'ISO 14001' | 'ISO 45001' | 'ISM',
    scheduledDate: string
  ): Promise<InternalAudit | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('quality-management-ai', {
        body: { 
          action: 'plan_audit',
          scope,
          standard,
          scheduledDate
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'Auditoria Planejada',
        description: `Checklist com ${data.audit?.checklist?.length || 0} itens`,
      });

      return data.audit;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao planejar auditoria';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const submitImprovement = useCallback(async (
    improvement: Omit<ImprovementProject, 'id' | 'status' | 'actualROI'>
  ): Promise<ImprovementProject | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('quality-management-ai', {
        body: { 
          action: 'submit_improvement',
          improvement
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'Melhoria Registrada',
        description: `ROI esperado: ${improvement.expectedROI}%`,
      });

      return data.improvement;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao registrar melhoria';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getQualityKPIs = useCallback(async (): Promise<{
    ncrCloseRate: number;
    capaEffectiveness: number;
    auditScore: number;
    customerSatisfaction: number;
    improvementsROI: number;
    certificationStatus: Record<string, 'valid' | 'expiring' | 'expired'>;
  } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('quality-management-ai', {
        body: { 
          action: 'get_quality_kpis'
        }
      });

      if (fnError) throw new Error(fnError.message);
      return data.qualityKPIs;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar KPIs';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    createNCR,
    analyzeNCRTrends,
    generateCAPA,
    planAudit,
    submitImprovement,
    getQualityKPIs
  };
}
