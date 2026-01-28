/**
 * useAccessAnomaly Hook
 * React interface for access anomaly detection
 */

import { useState, useCallback } from 'react';
import { 
  accessAnomalyEngine, 
  type AccessEvent, 
  type AnomalyDetectionResult,
  type SecurityAlert
} from '@/lib/ai/engines/access-anomaly';

export interface UseAccessAnomalyReturn {
  isMonitoring: boolean;
  alerts: SecurityAlert[];
  analyzeEvent: (event: AccessEvent) => AnomalyDetectionResult | null;
  getSecurityStatus: () => { threatsBlocked: number; activeAlerts: number; riskLevel: string };
}

export function useAccessAnomaly(): UseAccessAnomalyReturn {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);

  const analyzeEvent = useCallback((event: AccessEvent): AnomalyDetectionResult | null => {
    const result = accessAnomalyEngine.analyzeAccess(event);
    if (result && result.severity !== 'low') {
      const newAlert: SecurityAlert = {
        alertId: result.eventId,
        anomaly: result,
        status: 'open' as const,
        assignedTo: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        resolution: null,
        escalated: result.severity === 'critical'
      };
      setAlerts(prev => [newAlert, ...prev].slice(0, 100));
    }
    return result;
  }, []);

  const getSecurityStatus = useCallback(() => {
    const activeAlerts = alerts.filter(a => a.status === 'open').length;
    const threatsBlocked = alerts.filter(a => a.anomaly.autoActionTaken?.actionType === 'block_session').length;
    const criticalAlerts = alerts.filter(a => a.anomaly.severity === 'critical' && a.status === 'open').length;
    
    return {
      threatsBlocked,
      activeAlerts,
      riskLevel: criticalAlerts > 0 ? 'critical' : activeAlerts > 5 ? 'high' : activeAlerts > 0 ? 'medium' : 'low'
    };
  }, [alerts]);

  return {
    isMonitoring,
    alerts,
    analyzeEvent,
    getSecurityStatus
  };
}
