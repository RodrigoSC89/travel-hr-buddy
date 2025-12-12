/**
 * useDashboardData Hook
 * Hook customizado para gerenciar dados de dashboard
 * FASE B.2 - Consolidação de Dashboards
 */

import { useState, useEffect, useCallback } from "react";
import { DataSourceConfig, DashboardState } from "@/types/dashboard-config";
import { supabase } from "@/integrations/supabase/client";

interface UseDashboardDataOptions {
  dataSource?: DataSourceConfig;
  autoRefresh?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: (data: any) => void;
}

export const useDashboardData = (options: UseDashboardDataOptions) => {
  const { dataSource, autoRefresh = false, onError, onSuccess } = options;

  const [state, setState] = useState<DashboardState>({
    isLoading: false,
    error: null,
    data: null,
    filters: {},
  });

  const fetchData = useCallback(async () => {
    if (!dataSource) {
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      let data;

      switch (dataSource.type) {
      case "static":
        // For static data, just return it
        data = dataSource.query;
        break;

      case "supabase":
        // Fetch from Supabase
        if (dataSource.endpoint) {
          const response = await supabase
            .from(dataSource.endpoint)
            .select("*");
            
          if (response.error) throw response.error;
          data = response.data;
        }
        break;

      case "api":
        // Fetch from API endpoint
        if (dataSource.endpoint) {
          const response = await fetch(dataSource.endpoint);
          if (!response.ok) throw new Error("API request failed");
          data = await response.json();
        }
        break;

      case "realtime":
        // Setup realtime subscription
        if (dataSource.endpoint) {
          const channel = supabase
            .channel(dataSource.endpoint)
            .on(
              "postgres_changes",
              { event: "*", schema: "public", table: dataSource.endpoint },
              (payload) => {
                setState((prev) => ({
                  ...prev,
                  data: dataSource.transform ? dataSource.transform(payload.new) : payload.new,
                }));
              }
            )
            .subscribe();

          return () => {
            supabase.removeChannel(channel);
          };
        }
        break;

      default:
        throw new Error(`Unsupported data source type: ${dataSource.type}`);
      }

      // Apply transform if provided
      if (dataSource.transform && data) {
        data = dataSource.transform(data);
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        data,
        error: null,
      }));

      onSuccess?.(data);
    } catch (error) {
      const err = error as Error;
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err,
      }));
      onError?.(err);
    }
  }, [dataSource, onError, onSuccess]);

  const refresh = useCallback(() => {
    setState((prev) => ({ ...prev, refreshing: true }));
    fetchData().finally(() => {
      setState((prev) => ({ ...prev, refreshing: false }));
    });
  }, [fetchData]);

  useEffect(() => {
    fetchData();

    if (autoRefresh && dataSource?.refreshInterval) {
      const interval = setInterval(fetchData, dataSource.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, autoRefresh, dataSource?.refreshInterval]);

  return {
    ...state,
    refresh,
    setFilters: (filters: Record<string, any>) =>
      setState((prev) => ({ ...prev, filters })),
  };
};
