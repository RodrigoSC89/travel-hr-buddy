/**
 * Hook for Insurance & Claims AI Module
 * Policy management, claims processing, coverage verification
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InsurancePolicy {
  id: string;
  policyNumber: string;
  type: 'hull' | 'pi' | 'cargo' | 'liability' | 'crew' | 'war_risk';
  insurer: string;
  broker?: string;
  vesselId?: string;
  coverage: {
    limit: number;
    deductible: number;
    currency: string;
    coverageDetails: string[];
  };
  premium: {
    amount: number;
    frequency: 'annual' | 'quarterly' | 'monthly';
    dueDate: string;
    paid: boolean;
  };
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending_renewal';
  documents: string[];
}

export interface Claim {
  id: string;
  claimNumber: string;
  policyId: string;
  type: 'hull_damage' | 'pi_claim' | 'cargo_loss' | 'injury' | 'pollution' | 'other';
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'paid';
  incidentDate: string;
  reportedDate: string;
  description: string;
  estimatedAmount: number;
  approvedAmount?: number;
  documents: Array<{ name: string; type: string; url: string }>;
  timeline: Array<{ date: string; event: string; notes: string }>;
  adjuster?: { name: string; email: string; phone: string };
}

export interface CoverageCheck {
  policyId: string;
  scenario: string;
  isCovered: boolean;
  coverageLimit: number;
  deductible: number;
  exclusions: string[];
  conditions: string[];
  recommendation: string;
}

export interface ClaimAnalysis {
  claimId: string;
  successProbability: number;
  estimatedPayout: { min: number; max: number; likely: number };
  strengths: string[];
  weaknesses: string[];
  requiredDocuments: string[];
  similarCases: Array<{ description: string; outcome: string; amount: number }>;
  recommendations: string[];
}

export function useInsuranceClaimsAI() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPolicies = useCallback(async (
    vesselId?: string,
    type?: string
  ): Promise<InsurancePolicy[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('insurance-claims-ai', {
        body: { 
          action: 'get_policies',
          vesselId,
          type
        }
      });

      if (fnError) throw new Error(fnError.message);
      return data.policies;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar apólices';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkCoverage = useCallback(async (
    policyId: string,
    scenario: string
  ): Promise<CoverageCheck | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('insurance-claims-ai', {
        body: { 
          action: 'check_coverage',
          policyId,
          scenario
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: data.coverageCheck?.isCovered ? 'Coberto' : 'Não Coberto',
        description: data.coverageCheck?.recommendation || 'Verifique os detalhes',
        variant: data.coverageCheck?.isCovered ? 'default' : 'destructive',
      });

      return data.coverageCheck;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao verificar cobertura';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const submitClaim = useCallback(async (
    claim: Omit<Claim, 'id' | 'claimNumber' | 'status' | 'timeline'>
  ): Promise<Claim | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('insurance-claims-ai', {
        body: { 
          action: 'submit_claim',
          claim
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'Sinistro Registrado',
        description: `Número: ${data.claim?.claimNumber || 'CLM-2024-001'}`,
      });

      return data.claim;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao registrar sinistro';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const analyzeClaim = useCallback(async (
    claimId: string
  ): Promise<ClaimAnalysis | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('insurance-claims-ai', {
        body: { 
          action: 'analyze_claim',
          claimId
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'Análise Concluída',
        description: `Probabilidade de sucesso: ${data.claimAnalysis?.successProbability || 0}%`,
      });

      return data.claimAnalysis;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao analisar sinistro';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getClaims = useCallback(async (
    status?: string
  ): Promise<Claim[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('insurance-claims-ai', {
        body: { 
          action: 'get_claims',
          status
        }
      });

      if (fnError) throw new Error(fnError.message);
      return data.claims;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar sinistros';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRenewalAlerts = useCallback(async (): Promise<Array<{
    policyId: string;
    policyNumber: string;
    type: string;
    expiryDate: string;
    daysToExpiry: number;
    action: string;
  }> | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('insurance-claims-ai', {
        body: { 
          action: 'get_renewal_alerts'
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      const urgent = data.renewalAlerts?.filter(
        (a: { daysToExpiry: number }) => a.daysToExpiry <= 30
      ).length || 0;

      if (urgent > 0) {
        toast({
          title: 'Renovações Urgentes',
          description: `${urgent} apólices vencem em 30 dias`,
          variant: 'destructive',
        });
      }

      return data.renewalAlerts;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar alertas';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    isLoading,
    error,
    getPolicies,
    checkCoverage,
    submitClaim,
    analyzeClaim,
    getClaims,
    getRenewalAlerts
  };
}
