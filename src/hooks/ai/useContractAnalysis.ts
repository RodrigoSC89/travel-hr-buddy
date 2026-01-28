/**
 * useContractAnalysis Hook
 * React interface for NLP contract analysis
 */

import { useState, useCallback } from 'react';
import { 
  contractAnalysisEngine, 
  type ContractDocument, 
  type ContractAnalysisResult,
  type RiskClause,
  type NegotiationOpportunity
} from '@/lib/ai/engines/contract-analysis';

export interface UseContractAnalysisReturn {
  isAnalyzing: boolean;
  lastAnalysis: ContractAnalysisResult | null;
  analyzeContract: (contract: ContractDocument) => ContractAnalysisResult;
}

export function useContractAnalysis(): UseContractAnalysisReturn {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<ContractAnalysisResult | null>(null);

  const analyzeContract = useCallback((contract: ContractDocument): ContractAnalysisResult => {
    setIsAnalyzing(true);
    try {
      const analysis = contractAnalysisEngine.analyzeContract(contract);
      setLastAnalysis(analysis);
      return analysis;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return {
    isAnalyzing,
    lastAnalysis,
    analyzeContract
  };
}
