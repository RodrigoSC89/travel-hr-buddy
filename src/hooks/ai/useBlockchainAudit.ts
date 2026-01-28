/**
 * useBlockchainAudit Hook
 * React interface for blockchain audit trail
 */

import { useState, useCallback } from 'react';
import { 
  blockchainAuditEngine, 
  type AuditBlock, 
  type AuditEntry
} from '@/lib/ai/engines/blockchain-audit';

export interface UseBlockchainAuditReturn {
  isRecording: boolean;
  recordDecision: (decision: {
    agentId: string;
    agentName: string;
    type: string;
    description: string;
    module: string;
    resource: string;
    resourceId: string;
    confidence: number;
    reasoning: string;
    parameters: Record<string, unknown>;
  }) => AuditEntry;
  verifyIntegrity: () => ReturnType<typeof blockchainAuditEngine.verifyChainIntegrity>;
}

export function useBlockchainAudit(): UseBlockchainAuditReturn {
  const [isRecording, setIsRecording] = useState(false);

  const recordDecision = useCallback((decision: {
    agentId: string;
    agentName: string;
    type: string;
    description: string;
    module: string;
    resource: string;
    resourceId: string;
    confidence: number;
    reasoning: string;
    parameters: Record<string, unknown>;
  }): AuditEntry => {
    setIsRecording(true);
    try {
      return blockchainAuditEngine.recordAIDecision(
        decision.agentId,
        decision.agentName,
        {
          type: decision.type,
          description: decision.description,
          module: decision.module,
          resource: decision.resource,
          resourceId: decision.resourceId,
          confidence: decision.confidence,
          reasoning: decision.reasoning,
          parameters: decision.parameters
        },
        {}
      );
    } finally {
      setIsRecording(false);
    }
  }, []);

  const verifyIntegrity = useCallback(() => {
    return blockchainAuditEngine.verifyChainIntegrity();
  }, []);

  return {
    isRecording,
    recordDecision,
    verifyIntegrity
  };
}
