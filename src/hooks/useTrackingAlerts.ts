/**
 * Tracking Alerts Hook
 * Fetches real alerts from Supabase price_alerts and ai_insights tables
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface TrackingAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  alert_type: string;
  title: string;
  description: string;
  device_id?: string;
  created_at: string;
  resolved: boolean;
  resolved_at?: string;
  resolution?: string;
  ai_analysis?: string | null;
}

export interface AlertHistory {
  id: string;
  severity: string;
  title: string;
  resolved_at: string;
  resolution: string;
}

/**
 * Main hook to fetch tracking alerts
 */
export function useTrackingAlerts() {
  return useQuery({
    queryKey: ['tracking-alerts'],
    queryFn: async (): Promise<TrackingAlert[]> => {
      // Try to fetch from price_alerts first
      const { data: priceAlerts, error: priceError } = await supabase
        .from('price_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (priceError) {
        logger.warn('Failed to fetch price_alerts, using ai_insights', { error: priceError });
      }

      // Also fetch from ai_insights for additional alerts
      const { data: insights, error: insightsError } = await supabase
        .from('ai_insights')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (insightsError) {
        logger.warn('Failed to fetch ai_insights', { error: insightsError });
      }

      const alerts: TrackingAlert[] = [];

      // Transform price_alerts
      if (priceAlerts && priceAlerts.length > 0) {
        priceAlerts.forEach(alert => {
          alerts.push({
            id: alert.id,
            severity: mapSeverity(alert.category),
            alert_type: alert.category || 'general',
            title: `Alerta: ${alert.product_name || 'Notificação'}`,
            description: alert.description || `Preço alvo: ${alert.target_price || 'N/A'}`,
            device_id: undefined,
            created_at: alert.created_at || new Date().toISOString(),
            resolved: !alert.is_active,
            ai_analysis: null
          });
        });
      }

      // Transform ai_insights
      if (insights && insights.length > 0) {
        insights.forEach(insight => {
          alerts.push({
            id: insight.id,
            severity: mapPriorityToSeverity(insight.priority),
            alert_type: insight.category || 'insight',
            title: insight.title || 'Insight IA',
            description: insight.description || '',
            device_id: undefined,
            created_at: insight.created_at || new Date().toISOString(),
            resolved: insight.status === 'resolved' || insight.status === 'dismissed',
            ai_analysis: insight.description
          });
        });
      }

      // If no alerts found, return empty array
      if (alerts.length === 0) {
        logger.info('No alerts found in database');
      }

      return alerts;
    },
    staleTime: 30 * 1000 // 30 seconds for alerts
  });
}

/**
 * Hook for alert history
 */
export function useAlertHistory() {
  return useQuery({
    queryKey: ['alert-history'],
    queryFn: async (): Promise<AlertHistory[]> => {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('status', 'resolved')
        .order('updated_at', { ascending: false })
        .limit(20);

      if (error) {
        logger.warn('Failed to fetch alert history', { error });
        return [];
      }

      return (data || []).map(row => ({
        id: row.id,
        severity: mapPriorityToSeverity(row.priority),
        title: row.title || 'Alerta Resolvido',
        resolved_at: row.updated_at || new Date().toISOString(),
        resolution: 'Resolvido automaticamente'
      }));
    },
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook to resolve an alert
 */
export function useResolveAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      // Try to update in ai_insights
      const { error } = await supabase
        .from('ai_insights')
        .update({ status: 'resolved' })
        .eq('id', alertId);

      if (error) {
        // Try price_alerts
        const { error: priceError } = await supabase
          .from('price_alerts')
          .update({ is_active: false })
          .eq('id', alertId);

        if (priceError) {
          logger.error('Failed to resolve alert', { error: priceError });
          throw priceError;
        }
      }

      return alertId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-history'] });
    }
  });
}

/**
 * Hook for GNSS/tracking device alerts specifically
 */
export function useGNSSAlerts() {
  return useQuery({
    queryKey: ['gnss-alerts'],
    queryFn: async (): Promise<TrackingAlert[]> => {
      // Fetch from ai_insights with tracking-related categories
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .in('category', ['tracking', 'navigation', 'safety', 'operations'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        logger.warn('Failed to fetch GNSS alerts', { error });
        return [];
      }

      return (data || []).map(row => ({
        id: row.id,
        severity: mapPriorityToSeverity(row.priority),
        alert_type: categorizeAlertType(row.category),
        title: row.title || 'Alerta de Rastreamento',
        description: row.description || '',
        device_id: undefined,
        created_at: row.created_at || new Date().toISOString(),
        resolved: row.status === 'resolved',
        ai_analysis: row.description
      }));
    },
    staleTime: 30 * 1000
  });
}

// Helper functions
function mapSeverity(alertType: string | null): 'critical' | 'warning' | 'info' {
  if (!alertType) return 'info';
  const type = alertType.toLowerCase();
  if (type.includes('critical') || type.includes('emergency')) return 'critical';
  if (type.includes('warning') || type.includes('alert')) return 'warning';
  return 'info';
}

function mapPriorityToSeverity(priority: string | null): 'critical' | 'warning' | 'info' {
  switch (priority) {
    case 'critical':
    case 'high':
      return 'critical';
    case 'medium':
      return 'warning';
    default:
      return 'info';
  }
}

function categorizeAlertType(category: string | null): string {
  switch (category) {
    case 'tracking':
    case 'navigation':
      return 'signal_loss';
    case 'safety':
      return 'geofence';
    case 'operations':
      return 'maintenance';
    default:
      return 'general';
  }
}
