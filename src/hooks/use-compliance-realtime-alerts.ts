// @ts-nocheck - Realtime channel type compatibility
/**
 * Compliance Realtime Alerts Hook
 * Syncs compliance alerts across multiple connected users via Supabase Realtime
 */

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RealtimeChannel } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export interface ComplianceAlert {
  id: string;
  module: string;
  message: string;
  type: 'critical' | 'warning' | 'info';
  timestamp: string;
  userId?: string;
  userName?: string;
}

interface UseComplianceRealtimeAlertsReturn {
  alerts: ComplianceAlert[];
  isConnected: boolean;
  sendAlert: (alert: Omit<ComplianceAlert, 'id' | 'timestamp'>) => void;
  clearAlerts: () => void;
  onlineUsers: number;
}

export function useComplianceRealtimeAlerts(channelName = 'compliance-alerts'): UseComplianceRealtimeAlertsReturn {
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [onlineUsers, setOnlineUsers] = useState(0);

  useEffect(() => {
    // Create the realtime channel
    const realtimeChannel = supabase.channel(channelName, {
      config: {
        presence: {
          key: crypto.randomUUID(),
        },
      },
    });

    // Listen for broadcast messages (alerts)
    realtimeChannel
      .on('broadcast', { event: 'compliance_alert' }, (payload) => {
        logger.debug('[Realtime] Received alert', { payload });
        const alert = payload.payload as ComplianceAlert;
        
        setAlerts(prev => {
          // Avoid duplicates
          if (prev.some(a => a.id === alert.id)) return prev;
          return [alert, ...prev].slice(0, 50); // Keep last 50 alerts
        });

        // Show toast notification
        if (alert.type === 'critical') {
          toast.error(`⚠️ Alerta Crítico: ${alert.module}`, {
            description: alert.message,
            duration: 10000,
          });
        } else if (alert.type === 'warning') {
          toast.warning(`⚡ Atenção: ${alert.module}`, {
            description: alert.message,
            duration: 5000,
          });
        }
      })
      // Track presence for online users count
      .on('presence', { event: 'sync' }, () => {
        const state = realtimeChannel.presenceState();
        const userCount = Object.keys(state).length;
        setOnlineUsers(userCount);
        logger.debug('[Realtime] Online users:', userCount);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        logger.debug('[Realtime] User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        logger.debug('[Realtime] User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        logger.debug('[Realtime] Channel status:', status);
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          // Track presence
          await realtimeChannel.track({
            user: 'anonymous',
            online_at: new Date().toISOString(),
          });
        } else {
          setIsConnected(false);
        }
      });

    setChannel(realtimeChannel);

    // Cleanup on unmount
    return () => {
      logger.debug('[Realtime] Cleaning up channel');
      supabase.removeChannel(realtimeChannel);
    };
  }, [channelName]);

  const sendAlert = useCallback((alertData: Omit<ComplianceAlert, 'id' | 'timestamp'>) => {
    if (!channel) {
      logger.debug('[Realtime] Channel not ready');
      return;
    }

    const alert: ComplianceAlert = {
      ...alertData,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    logger.debug('[Realtime] Sending alert', { alert });

    channel.send({
      type: 'broadcast',
      event: 'compliance_alert',
      payload: alert,
    });

    // Also add to local state
    setAlerts(prev => [alert, ...prev].slice(0, 50));
  }, [channel]);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return {
    alerts,
    isConnected,
    sendAlert,
    clearAlerts,
    onlineUsers,
  };
}
