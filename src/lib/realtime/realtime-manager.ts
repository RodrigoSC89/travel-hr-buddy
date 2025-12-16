/**
 * Realtime Manager
 * PATCH 833: Centralized realtime subscription management
 */

import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

type ChangeType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';
type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

interface SubscriptionConfig {
  table: string;
  schema?: string;
  event?: ChangeType;
  filter?: string;
}

interface Subscription {
  id: string;
  config: SubscriptionConfig;
  channel: RealtimeChannel;
  callbacks: Set<(payload: any) => void>;
}

class RealtimeManager {
  private subscriptions = new Map<string, Subscription>();
  private connectionStatus: ConnectionStatus = 'disconnected';
  private statusListeners = new Set<(status: ConnectionStatus) => void>();

  private getSubscriptionKey(config: SubscriptionConfig): string {
    return `${config.schema || 'public'}:${config.table}:${config.event || '*'}:${config.filter || ''}`;
  }

  subscribe(
    config: SubscriptionConfig,
    callback: (payload: any) => void
  ): () => void {
    const key = this.getSubscriptionKey(config);
    
    let subscription = this.subscriptions.get(key);

    if (subscription) {
      subscription.callbacks.add(callback);
    } else {
      const channel = supabase.channel(`realtime:${key}`);
      
      channel.on(
        'postgres_changes' as any,
        {
          event: config.event || '*',
          schema: config.schema || 'public',
          table: config.table,
          filter: config.filter,
        },
        (payload: any) => {
          const sub = this.subscriptions.get(key);
          sub?.callbacks.forEach(cb => cb(payload));
        }
      ).subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.connectionStatus = 'connected';
        } else if (status === 'CLOSED') {
          this.connectionStatus = 'disconnected';
        }
        this.notifyStatusListeners();
      });

      subscription = {
        id: key,
        config,
        channel,
        callbacks: new Set([callback]),
      };

      this.subscriptions.set(key, subscription);
    }

    return () => {
      const sub = this.subscriptions.get(key);
      if (sub) {
        sub.callbacks.delete(callback);
        if (sub.callbacks.size === 0) {
          sub.channel.unsubscribe();
          this.subscriptions.delete(key);
        }
      }
    };
  }

  unsubscribeAll() {
    this.subscriptions.forEach((sub) => {
      sub.channel.unsubscribe();
    });
    this.subscriptions.clear();
    this.connectionStatus = 'disconnected';
    this.notifyStatusListeners();
  }

  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(callback);
    return () => this.statusListeners.delete(callback);
  }

  private notifyStatusListeners() {
    this.statusListeners.forEach(cb => cb(this.connectionStatus));
  }

  getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }
}

export const realtimeManager = new RealtimeManager();

// React hooks
import { useEffect, useState } from 'react';

export function useRealtimeSubscription(
  config: SubscriptionConfig | null,
  onData?: (payload: any) => void
) {
  const [lastPayload, setLastPayload] = useState<any>(null);

  useEffect(() => {
    if (!config) return;

    const unsubscribe = realtimeManager.subscribe(config, (payload) => {
      setLastPayload(payload);
      onData?.(payload);
    });

    return unsubscribe;
  }, [config?.table, config?.schema, config?.event, config?.filter]);

  return lastPayload;
}

export function useRealtimeConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>(realtimeManager.getConnectionStatus());

  useEffect(() => {
    return realtimeManager.onStatusChange(setStatus);
  }, []);

  return status;
}
