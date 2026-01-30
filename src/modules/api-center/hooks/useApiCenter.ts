/**
 * API Center Hook
 * PATCH 659: Hook for managing API integrations
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import type { ApiIntegration, ApiLog, ApiQuota } from '../types';

interface UseApiCenterReturn {
  apis: ApiIntegration[];
  logs: ApiLog[];
  quotas: Map<string, ApiQuota>;
  isLoading: boolean;
  error: string | null;
  testApi: (apiName: string) => Promise<boolean>;
  toggleApi: (apiName: string, enabled: boolean) => Promise<void>;
  refreshApis: () => Promise<void>;
  getApiLogs: (apiName: string) => ApiLog[];
}

export function useApiCenter(): UseApiCenterReturn {
  const [apis, setApis] = useState<ApiIntegration[]>([]);
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [quotas, setQuotas] = useState<Map<string, ApiQuota>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchApis = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('api_integrations')
        .select('*')
        .order('api_name');

      if (fetchError) throw fetchError;
      setApis((data as ApiIntegration[]) || []);
    } catch (err) {
      logger.error('[APICenter] Failed to fetch APIs', err as Error);
      setError('Falha ao carregar integrações');
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('external_api_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;
      setLogs((data as ApiLog[]) || []);
    } catch (err) {
      logger.error('[APICenter] Failed to fetch logs', err as Error);
    }
  }, []);

  const fetchQuotas = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('api_quota_tracking')
        .select('*');

      if (fetchError) throw fetchError;
      
      const quotaMap = new Map<string, ApiQuota>();
      ((data as ApiQuota[]) || []).forEach(q => quotaMap.set(q.api_name, q));
      setQuotas(quotaMap);
    } catch (err) {
      logger.error('[APICenter] Failed to fetch quotas', err as Error);
    }
  }, []);

  const refreshApis = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await Promise.all([fetchApis(), fetchLogs(), fetchQuotas()]);
    setIsLoading(false);
  }, [fetchApis, fetchLogs, fetchQuotas]);

  const testApi = useCallback(async (apiName: string): Promise<boolean> => {
    try {
      logger.info('[APICenter] Testing API', { apiName });
      
      const startTime = Date.now();
      
      // Call the appropriate edge function
      const { data, error: invokeError } = await supabase.functions.invoke(
        `integrations/${apiName}`,
        { body: { test: true } }
      );

      const responseTime = Date.now() - startTime;
      const success = !invokeError && data;

      // Log the test result
      await supabase.from('external_api_logs').insert({
        api_name: apiName,
        endpoint: `/functions/integrations/${apiName}`,
        method: 'POST',
        status_code: success ? 200 : 500,
        response_time_ms: responseTime,
        error_message: invokeError?.message || null
      });

      // Update API status
      await supabase
        .from('api_integrations')
        .update({
          status: success ? 'active' : 'error',
          last_checked: new Date().toISOString(),
          error_count: success ? 0 : 1
        })
        .eq('api_name', apiName);

      toast({
        title: success ? 'API Operacional' : 'Falha na API',
        description: success 
          ? `${apiName} respondeu em ${responseTime}ms`
          : `Erro: ${invokeError?.message || 'Falha na conexão'}`,
        variant: success ? 'default' : 'destructive'
      });

      await refreshApis();
      return success;
    } catch (err) {
      logger.error('[APICenter] Test failed', err as Error, { apiName });
      toast({
        title: 'Erro no Teste',
        description: `Não foi possível testar ${apiName}`,
        variant: 'destructive'
      });
      return false;
    }
  }, [toast, refreshApis]);

  const toggleApi = useCallback(async (apiName: string, enabled: boolean) => {
    try {
      await supabase
        .from('api_integrations')
        .update({ status: enabled ? 'active' : 'inactive' })
        .eq('api_name', apiName);

      toast({
        title: enabled ? 'API Ativada' : 'API Desativada',
        description: `${apiName} foi ${enabled ? 'ativada' : 'desativada'}`
      });

      await refreshApis();
    } catch (err) {
      logger.error('[APICenter] Toggle failed', err as Error, { apiName });
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status da API',
        variant: 'destructive'
      });
    }
  }, [toast, refreshApis]);

  const getApiLogs = useCallback((apiName: string): ApiLog[] => {
    return logs.filter(log => log.api_name === apiName);
  }, [logs]);

  useEffect(() => {
    refreshApis();
  }, [refreshApis]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('api-center-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'external_api_logs' },
        () => {
          fetchLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLogs]);

  return {
    apis,
    logs,
    quotas,
    isLoading,
    error,
    testApi,
    toggleApi,
    refreshApis,
    getApiLogs
  };
}
