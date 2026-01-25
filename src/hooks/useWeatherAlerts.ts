/**
 * Hook para alertas meteorológicos
 * Usa tabela weather_alerts do Supabase
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface WeatherAlert {
  id: string;
  alert_type: 'storm' | 'wind' | 'wave' | 'visibility' | 'temperature' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location?: {
    lat: number;
    lng: number;
    name?: string;
  };
  affected_vessels?: string[];
  valid_from: string;
  valid_until: string;
  source?: string;
  raw_data?: Record<string, unknown>;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  created_at: string;
  organization_id?: string;
}

export interface WeatherAlertStats {
  total: number;
  active: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  unacknowledged: number;
}

export function useWeatherAlerts(options?: {
  vesselId?: string;
  severity?: string[];
  activeOnly?: boolean;
  limit?: number;
}) {
  const queryClient = useQueryClient();

  const alertsQuery = useQuery({
    queryKey: ['weather-alerts', options],
    queryFn: async (): Promise<WeatherAlert[]> => {
      let query = supabase
        .from('weather_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (options?.activeOnly) {
        const now = new Date().toISOString();
        query = query
          .lte('valid_from', now)
          .gte('valid_until', now);
      }

      if (options?.severity?.length) {
        query = query.in('severity', options.severity);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      let alerts = (data || []).map(alert => ({
        id: alert.id,
        alert_type: alert.alert_type as WeatherAlert['alert_type'],
        severity: alert.severity as WeatherAlert['severity'],
        title: alert.title,
        description: alert.description ?? '',
        location: alert.location as WeatherAlert['location'],
        affected_vessels: alert.affected_vessels ?? undefined,
        valid_from: alert.valid_from,
        valid_until: alert.valid_until,
        source: alert.source ?? undefined,
        raw_data: alert.raw_data as Record<string, unknown>,
        acknowledged: alert.acknowledged || false,
        acknowledged_by: alert.acknowledged_by ?? undefined,
        acknowledged_at: alert.acknowledged_at ?? undefined,
        created_at: alert.created_at,
        organization_id: alert.organization_id ?? undefined,
      }));

      if (options?.vesselId) {
        alerts = alerts.filter(a => 
          a.affected_vessels?.includes(options.vesselId!) || 
          !a.affected_vessels?.length
        );
      }

      return alerts;
    },
    staleTime: 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });

  const statsQuery = useQuery({
    queryKey: ['weather-alert-stats'],
    queryFn: async (): Promise<WeatherAlertStats> => {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('weather_alerts')
        .select('severity, acknowledged, valid_from, valid_until');

      if (error) throw error;

      const alerts = data || [];
      const active = alerts.filter(a => 
        a.valid_from <= now && a.valid_until >= now
      );

      return {
        total: alerts.length,
        active: active.length,
        critical: active.filter(a => a.severity === 'critical').length,
        high: active.filter(a => a.severity === 'high').length,
        medium: active.filter(a => a.severity === 'medium').length,
        low: active.filter(a => a.severity === 'low').length,
        unacknowledged: active.filter(a => !a.acknowledged).length,
      };
    },
    staleTime: 60 * 1000,
  });

  const acknowledgeAlert = useMutation({
    mutationFn: async (alertId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('weather_alerts')
        .update({
          acknowledged: true,
          acknowledged_by: user?.id,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weather-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['weather-alert-stats'] });
    },
  });

  const createAlert = useMutation({
    mutationFn: async (alert: Omit<WeatherAlert, 'id' | 'created_at' | 'acknowledged'>) => {
      const { data, error } = await supabase
        .from('weather_alerts')
        .insert([{
          alert_type: alert.alert_type,
          severity: alert.severity,
          title: alert.title,
          description: alert.description,
          location: alert.location as any,
          affected_vessels: alert.affected_vessels,
          valid_from: alert.valid_from,
          valid_until: alert.valid_until,
          source: alert.source,
          raw_data: alert.raw_data as any,
          acknowledged: false,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weather-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['weather-alert-stats'] });
    },
  });

  return {
    alerts: alertsQuery.data || [],
    stats: statsQuery.data,
    isLoading: alertsQuery.isLoading,
    error: alertsQuery.error,
    acknowledgeAlert: acknowledgeAlert.mutate,
    createAlert: createAlert.mutate,
    refetch: alertsQuery.refetch,
  };
}

export function useWeatherAlertHistory(options?: {
  days?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['weather-alert-history', options],
    queryFn: async () => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - (options?.days || 30));

      const { data, error } = await supabase
        .from('weather_alerts')
        .select('*')
        .gte('created_at', daysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(options?.limit || 50);

      if (error) throw error;

      const byDate = new Map<string, WeatherAlert[]>();
      
      (data || []).forEach(alert => {
        const date = alert.created_at.split('T')[0];
        if (!byDate.has(date)) {
          byDate.set(date, []);
        }
        byDate.get(date)!.push({
          id: alert.id,
          alert_type: alert.alert_type as WeatherAlert['alert_type'],
          severity: alert.severity as WeatherAlert['severity'],
          title: alert.title,
          description: alert.description ?? '',
          location: alert.location as WeatherAlert['location'],
          affected_vessels: alert.affected_vessels ?? undefined,
          valid_from: alert.valid_from,
          valid_until: alert.valid_until,
          source: alert.source ?? undefined,
          raw_data: alert.raw_data as Record<string, unknown>,
          acknowledged: alert.acknowledged || false,
          acknowledged_by: alert.acknowledged_by ?? undefined,
          acknowledged_at: alert.acknowledged_at ?? undefined,
          created_at: alert.created_at,
          organization_id: alert.organization_id ?? undefined,
        });
      });

      return Array.from(byDate.entries())
        .map(([date, alerts]) => ({
          date,
          alerts,
          summary: {
            total: alerts.length,
            critical: alerts.filter(a => a.severity === 'critical').length,
            high: alerts.filter(a => a.severity === 'high').length,
          },
        }))
        .sort((a, b) => b.date.localeCompare(a.date));
    },
    staleTime: 5 * 60 * 1000,
  });
}
