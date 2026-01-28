/**
 * useFraudDetection Hook
 * Interface para detecção de fraudes financeiras
 */

import { useState, useCallback } from 'react';
import { 
  fraudDetectionEngine,
  type Transaction,
  type FraudAlert,
  type FraudAnalytics
} from '@/lib/ai/engines/fraud-detection';
import { toast } from 'sonner';

interface UseFraudDetectionReturn {
  isLoading: boolean;
  alerts: FraudAlert[];
  analyzeTransaction: (transaction: Transaction, historicalData?: Transaction[]) => Promise<FraudAlert | null>;
  analyzeBatch: (transactions: Transaction[]) => Promise<FraudAlert[]>;
  getHighRiskAlerts: () => FraudAlert[];
  clearAlerts: () => void;
}

export function useFraudDetection(): UseFraudDetectionReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);

  const analyzeTransaction = useCallback(async (
    transaction: Transaction,
    historicalData?: Transaction[]
  ): Promise<FraudAlert | null> => {
    setIsLoading(true);
    try {
      const alert = await fraudDetectionEngine.analyzeTransaction(transaction, historicalData);
      
      if (alert) {
        setAlerts(prev => [...prev, alert]);
        
        if (alert.severity === 'critical') {
          toast.error(`🚨 Fraude detectada: ${alert.alertType}`, {
            description: alert.description
          });
        } else if (alert.severity === 'high') {
          toast.warning(`Alerta de fraude: ${alert.alertType}`);
        }
      }
      
      return alert;
    } catch (error) {
      console.error('[useFraudDetection] Error:', error);
      toast.error('Erro ao analisar transação');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeBatch = useCallback(async (transactions: Transaction[]): Promise<FraudAlert[]> => {
    setIsLoading(true);
    try {
      const allAlerts: FraudAlert[] = [];
      
      for (const transaction of transactions) {
        const alert = await fraudDetectionEngine.analyzeTransaction(transaction);
        if (alert) {
          allAlerts.push(alert);
        }
      }
      
      setAlerts(allAlerts);
      
      const criticalCount = allAlerts.filter(a => a.severity === 'critical').length;
      const highCount = allAlerts.filter(a => a.severity === 'high').length;
      
      if (criticalCount > 0) {
        toast.error(`🚨 ${criticalCount} fraude(s) crítica(s) detectada(s)!`);
      } else if (highCount > 0) {
        toast.warning(`${highCount} alerta(s) de alto risco`);
      } else if (allAlerts.length > 0) {
        toast.info(`${allAlerts.length} alerta(s) identificado(s)`);
      } else {
        toast.success(`${transactions.length} transações analisadas - sem alertas`);
      }
      
      return allAlerts;
    } catch (error) {
      console.error('[useFraudDetection] Batch error:', error);
      toast.error('Erro na análise em lote');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getHighRiskAlerts = useCallback((): FraudAlert[] => {
    return alerts.filter(a => a.severity === 'critical' || a.severity === 'high');
  }, [alerts]);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return {
    isLoading,
    alerts,
    analyzeTransaction,
    analyzeBatch,
    getHighRiskAlerts,
    clearAlerts
  };
}
