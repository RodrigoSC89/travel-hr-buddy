/**
 * useComplianceAudit Hook
 * Interface simplificada para auditoria contínua automatizada
 */

import { useState, useCallback } from 'react';
import { 
  complianceAuditEngine,
  type ComplianceCheck,
  type AuditResult,
  type VesselComplianceStatus
} from '@/lib/ai/engines/compliance-audit';
import { toast } from 'sonner';

interface UseComplianceAuditReturn {
  isLoading: boolean;
  auditResult: AuditResult | null;
  vesselStatus: VesselComplianceStatus | null;
  runAudit: (vesselId: string, checks: ComplianceCheck[]) => Promise<AuditResult | null>;
  clearAudit: () => void;
}

export function useComplianceAudit(): UseComplianceAuditReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [vesselStatus, setVesselStatus] = useState<VesselComplianceStatus | null>(null);

  const runAudit = useCallback(async (
    vesselId: string,
    checks: ComplianceCheck[]
  ): Promise<AuditResult | null> => {
    setIsLoading(true);
    try {
      const result = await complianceAuditEngine.runComplianceAudit(vesselId, checks);
      setAuditResult(result);
      
      toast.success(`Auditoria concluída: ${result.overallScore.toFixed(0)}% compliance`);
      return result;
    } catch (error) {
      console.error('[useComplianceAudit] Error:', error);
      toast.error('Erro ao executar auditoria');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearAudit = useCallback(() => {
    setAuditResult(null);
    setVesselStatus(null);
  }, []);

  return {
    isLoading,
    auditResult,
    vesselStatus,
    runAudit,
    clearAudit
  };
}
