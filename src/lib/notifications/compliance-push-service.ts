/**
 * Compliance Push Notification Service
 * PATCH COMPLIANCE-PUSH-1.0: Push notifications for critical compliance alerts
 * Works even when user is not on the page
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface ComplianceAlert {
  id: string;
  module: 'mlc' | 'peotram' | 'peo-dp' | 'sgso' | 'pre-ovid';
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  vesselId?: string;
  vesselName?: string;
  actionUrl?: string;
}

class CompliancePushService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private isInitialized = false;
  private vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    if (!('serviceWorker' in navigator)) {
      logger.warn('Service Worker not supported');
      return false;
    }

    if (!('PushManager' in window)) {
      logger.warn('Push API not supported');
      return false;
    }

    try {
      // Register dedicated push service worker
      this.swRegistration = await navigator.serviceWorker.register('/sw-compliance.js', {
        scope: '/'
      });

      logger.info('Compliance Push SW registered');
      
      // Wait for SW to be ready
      await navigator.serviceWorker.ready;
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      logger.error('Failed to initialize Compliance Push Service', { error });
      return false;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    logger.info('Notification permission:', permission);
    return permission;
  }

  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      await this.initialize();
    }

    if (!this.swRegistration) {
      return null;
    }

    try {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        return null;
      }

      // Check existing subscription
      const reg = this.swRegistration as unknown as { pushManager: { getSubscription: () => Promise<PushSubscription | null>; subscribe: (options: PushSubscriptionOptionsInit) => Promise<PushSubscription> } };
      let subscription = await reg.pushManager.getSubscription();
      
      if (!subscription) {
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey) as BufferSource
        });

        // Save subscription to database
        await this.saveSubscription(subscription);
      }

      logger.info('Push subscription active');
      return subscription;
    } catch (error) {
      logger.error('Failed to subscribe to push', { error });
      return null;
    }
  }

  private async saveSubscription(subscription: PushSubscription): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Store subscription in database for server-side push
      const subscriptionData = subscription.toJSON();
      
      await supabase.from('user_push_subscriptions' as any).upsert({
        user_id: user.id,
        endpoint: subscriptionData.endpoint,
        keys: subscriptionData.keys,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

      logger.info('Push subscription saved');
    } catch (error) {
      logger.error('Failed to save subscription', { error });
    }
  }

  async showComplianceAlert(alert: ComplianceAlert): Promise<boolean> {
    // First try service worker notification (works in background)
    if (this.swRegistration) {
      try {
        const icon = this.getAlertIcon(alert.type);
        const badge = '/favicon.ico';

        await this.swRegistration.showNotification(alert.title, {
          body: alert.message,
          icon: badge,
          badge,
          tag: `compliance-${alert.module}-${alert.id}`,
          data: {
            alertId: alert.id,
            module: alert.module,
            type: alert.type,
            url: alert.actionUrl || `/compliance-center`,
            timestamp: alert.timestamp.toISOString()
          },
          requireInteraction: alert.type === 'critical',
          vibrate: alert.type === 'critical' ? [200, 100, 200, 100, 200] : [100, 50, 100],
          actions: [
            { action: 'view', title: 'Ver Detalhes' },
            { action: 'dismiss', title: 'Ignorar' }
          ]
        } as NotificationOptions);

        logger.info('Compliance alert shown via SW', { alertId: alert.id });
        return true;
      } catch (error) {
        logger.warn('SW notification failed, trying fallback', { error });
      }
    }

    // Fallback to regular Notification API
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(alert.title, {
        body: alert.message,
        icon: '/favicon.ico',
        tag: `compliance-${alert.module}-${alert.id}`
      });
      return true;
    }

    return false;
  }

  async broadcastToChannel(alert: ComplianceAlert): Promise<void> {
    // Broadcast via Supabase Realtime for connected users
    const channel = supabase.channel('compliance-alerts');
    
    await channel.send({
      type: 'broadcast',
      event: 'critical-alert',
      payload: {
        ...alert,
        timestamp: alert.timestamp.toISOString()
      }
    });
  }

  private getAlertIcon(type: ComplianceAlert['type']): string {
    switch (type) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📋';
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Simulate checking compliance status and triggering alerts
  async checkComplianceStatus(): Promise<ComplianceAlert[]> {
    const alerts: ComplianceAlert[] = [];
    
    // This would normally query actual compliance data
    // For now, we return an empty array - real implementation would check:
    // - MLC certificate expirations
    // - PEOTRAM training deadlines
    // - SGSO audit schedules
    // - Pre-OVID inspection due dates
    
    return alerts;
  }
}

export const compliancePushService = new CompliancePushService();
