/**
 * Hook for Contract & Legal AI Module
 * Contract management, legal AI assistant, obligation tracking
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  type: 'charter_party' | 'service' | 'supply' | 'employment' | 'insurance' | 'other';
  status: 'draft' | 'negotiation' | 'active' | 'expired' | 'terminated';
  counterparty: string;
  startDate: string;
  endDate: string;
  value: number;
  currency: string;
  obligations: Array<{ description: string; deadline: string; status: string }>;
  renewalType: 'auto' | 'manual' | 'none';
  riskScore: number;
  documents: string[];
}

export interface ContractAnalysis {
  contractId: string;
  clauses: Array<{ 
    type: string; 
    text: string; 
    risk: 'low' | 'medium' | 'high';
    recommendation: string;
  }>;
  overallRisk: number;
  keyTerms: Array<{ term: string; value: string }>;
  obligations: Array<{ description: string; party: string; deadline: string }>;
  renewalTerms: { noticePeriod: number; autoRenewal: boolean };
  recommendedActions: string[];
}

export interface LegalQuery {
  query: string;
  response: string;
  sources: Array<{ title: string; reference: string }>;
  confidence: number;
  relatedCases: Array<{ title: string; summary: string }>;
}

export interface ObligationTracker {
  upcoming: Array<{ contract: string; obligation: string; deadline: string; daysRemaining: number }>;
  overdue: Array<{ contract: string; obligation: string; deadline: string; daysOverdue: number }>;
  completed: Array<{ contract: string; obligation: string; completedDate: string }>;
  statistics: { total: number; onTime: number; delayed: number; pending: number };
}

export function useContractLegalAI() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getContracts = useCallback(async (
    status?: string,
    type?: string
  ): Promise<Contract[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('contract-legal-ai', {
        body: { 
          action: 'get_contracts',
          status,
          type
        }
      });

      if (fnError) throw new Error(fnError.message);
      return data.contracts;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar contratos';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeContract = useCallback(async (
    contractId: string
  ): Promise<ContractAnalysis | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('contract-legal-ai', {
        body: { 
          action: 'analyze_contract',
          contractId
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'Análise Concluída',
        description: `Risco geral: ${data.analysis?.overallRisk || 0}%`,
      });

      return data.analysis;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao analisar contrato';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const uploadContract = useCallback(async (
    file: File,
    metadata: { type: string; counterparty: string }
  ): Promise<Contract | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // In production, this would upload the file to storage first
      const { data, error: fnError } = await supabase.functions.invoke('contract-legal-ai', {
        body: { 
          action: 'upload_contract',
          fileName: file.name,
          fileType: file.type,
          metadata
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'Contrato Carregado',
        description: 'Análise automática iniciada',
      });

      return data.contract;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar contrato';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const askLegalAI = useCallback(async (
    query: string,
    context?: { contractId?: string; jurisdiction?: string }
  ): Promise<LegalQuery | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('contract-legal-ai', {
        body: { 
          action: 'ask_legal_ai',
          query,
          context
        }
      });

      if (fnError) throw new Error(fnError.message);
      return data.legalQuery;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao consultar IA jurídica';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getObligations = useCallback(async (): Promise<ObligationTracker | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('contract-legal-ai', {
        body: { 
          action: 'get_obligations'
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      const overdue = data.obligationTracker?.overdue?.length || 0;
      if (overdue > 0) {
        toast({
          title: 'Obrigações Vencidas',
          description: `${overdue} obrigações precisam de atenção`,
          variant: 'destructive',
        });
      }

      return data.obligationTracker;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar obrigações';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const generateContractDraft = useCallback(async (
    type: string,
    parameters: Record<string, unknown>
  ): Promise<{ draft: string; suggestions: string[] } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('contract-legal-ai', {
        body: { 
          action: 'generate_draft',
          type,
          parameters
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'Minuta Gerada',
        description: 'Revise o documento antes de usar',
      });

      return data.contractDraft;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao gerar minuta';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    isLoading,
    error,
    getContracts,
    analyzeContract,
    uploadContract,
    askLegalAI,
    getObligations,
    generateContractDraft
  };
}
