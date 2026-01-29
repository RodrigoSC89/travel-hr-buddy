/**
 * Webhook Hub v6.0
 * Advanced webhook management and third-party integrations
 */

import { supabase } from "@/integrations/supabase/client";

type WebhookEventType = 
  | 'crew.created' | 'crew.updated' | 'crew.deleted'
  | 'vessel.created' | 'vessel.updated' | 'vessel.alert'
  | 'document.uploaded' | 'document.approved' | 'document.expired'
  | 'compliance.violation' | 'compliance.resolved'
  | 'safety.incident' | 'safety.drill_completed'
  | 'maintenance.scheduled' | 'maintenance.completed' | 'maintenance.overdue'
  | 'payroll.processed' | 'payroll.approved'
  | 'custom';

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: WebhookEventType[];
  secret: string;
  headers?: Record<string, string>;
  retryPolicy: {
    maxRetries: number;
    backoffMs: number;
    backoffMultiplier: number;
  };
  enabled: boolean;
  createdAt: Date;
  lastTriggeredAt?: Date;
}

interface WebhookPayload {
  event: WebhookEventType;
  timestamp: string;
  data: unknown;
  metadata: {
    webhookId: string;
    attemptNumber: number;
    correlationId: string;
  };
}

interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEventType;
  payload: unknown;
  status: 'pending' | 'success' | 'failed';
  statusCode?: number;
  responseBody?: string;
  attempts: number;
  createdAt: Date;
  completedAt?: Date;
}

interface ThirdPartyIntegration {
  id: string;
  name: string;
  type: 'stripe' | 'twilio' | 'sendgrid' | 'slack' | 'teams' | 'zapier' | 'custom';
  config: Record<string, unknown>;
  status: 'active' | 'inactive' | 'error';
  lastSync?: Date;
}

class WebhookHub {
  private webhooks = new Map<string, WebhookConfig>();
  private deliveryQueue: WebhookDelivery[] = [];
  private integrations = new Map<string, ThirdPartyIntegration>();
  private isProcessing = false;

  async initialize(): Promise<void> {
    // Load webhooks from storage
    await this.loadWebhooks();
    
    // Start delivery processor
    this.startDeliveryProcessor();

    console.log('[WebhookHub] Initialized with', this.webhooks.size, 'webhooks');
  }

  private async loadWebhooks(): Promise<void> {
    try {
      const stored = localStorage.getItem('webhook_configs');
      if (stored) {
        const configs = JSON.parse(stored) as WebhookConfig[];
        configs.forEach(config => {
          this.webhooks.set(config.id, config);
        });
      }
    } catch (error) {
      console.error('[WebhookHub] Failed to load webhooks:', error);
    }
  }

  private async saveWebhooks(): Promise<void> {
    try {
      const configs = Array.from(this.webhooks.values());
      localStorage.setItem('webhook_configs', JSON.stringify(configs));
    } catch (error) {
      console.error('[WebhookHub] Failed to save webhooks:', error);
    }
  }

  registerWebhook(config: Omit<WebhookConfig, 'id' | 'createdAt'>): string {
    const id = crypto.randomUUID();
    const webhook: WebhookConfig = {
      ...config,
      id,
      createdAt: new Date()
    };

    this.webhooks.set(id, webhook);
    this.saveWebhooks();

    return id;
  }

  updateWebhook(id: string, updates: Partial<WebhookConfig>): boolean {
    const webhook = this.webhooks.get(id);
    if (!webhook) return false;

    Object.assign(webhook, updates);
    this.saveWebhooks();
    return true;
  }

  deleteWebhook(id: string): boolean {
    const deleted = this.webhooks.delete(id);
    if (deleted) this.saveWebhooks();
    return deleted;
  }

  getWebhook(id: string): WebhookConfig | undefined {
    return this.webhooks.get(id);
  }

  listWebhooks(): WebhookConfig[] {
    return Array.from(this.webhooks.values());
  }

  async trigger(event: WebhookEventType, data: unknown): Promise<void> {
    const matchingWebhooks = Array.from(this.webhooks.values())
      .filter(w => w.enabled && (w.events.includes(event) || w.events.includes('custom')));

    for (const webhook of matchingWebhooks) {
      const delivery: WebhookDelivery = {
        id: crypto.randomUUID(),
        webhookId: webhook.id,
        event,
        payload: data,
        status: 'pending',
        attempts: 0,
        createdAt: new Date()
      };

      this.deliveryQueue.push(delivery);
    }

    // Process immediately if not already processing
    if (!this.isProcessing) {
      this.processDeliveryQueue();
    }
  }

  private async processDeliveryQueue(): Promise<void> {
    if (this.isProcessing || this.deliveryQueue.length === 0) return;

    this.isProcessing = true;

    while (this.deliveryQueue.length > 0) {
      const delivery = this.deliveryQueue.shift()!;
      await this.deliverWebhook(delivery);
    }

    this.isProcessing = false;
  }

  private startDeliveryProcessor(): void {
    setInterval(() => {
      if (!this.isProcessing && this.deliveryQueue.length > 0) {
        this.processDeliveryQueue();
      }
    }, 5000);
  }

  private async deliverWebhook(delivery: WebhookDelivery): Promise<void> {
    const webhook = this.webhooks.get(delivery.webhookId);
    if (!webhook) {
      delivery.status = 'failed';
      return;
    }

    const payload: WebhookPayload = {
      event: delivery.event,
      timestamp: new Date().toISOString(),
      data: delivery.payload,
      metadata: {
        webhookId: webhook.id,
        attemptNumber: delivery.attempts + 1,
        correlationId: delivery.id
      }
    };

    const signature = await this.signPayload(JSON.stringify(payload), webhook.secret);

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': delivery.event,
          'X-Webhook-Delivery': delivery.id,
          ...webhook.headers
        },
        body: JSON.stringify(payload)
      });

      delivery.attempts++;
      delivery.statusCode = response.status;

      if (response.ok) {
        delivery.status = 'success';
        delivery.completedAt = new Date();
        webhook.lastTriggeredAt = new Date();
        this.saveWebhooks();
      } else {
        delivery.responseBody = await response.text();
        
        // Retry if not at max retries
        if (delivery.attempts < webhook.retryPolicy.maxRetries) {
          const backoff = webhook.retryPolicy.backoffMs * 
            Math.pow(webhook.retryPolicy.backoffMultiplier, delivery.attempts - 1);
          
          setTimeout(() => {
            this.deliveryQueue.push(delivery);
          }, backoff);
        } else {
          delivery.status = 'failed';
          delivery.completedAt = new Date();
        }
      }
    } catch (error) {
      delivery.attempts++;
      delivery.status = 'failed';
      delivery.responseBody = error instanceof Error ? error.message : 'Unknown error';
      
      // Retry on network errors
      if (delivery.attempts < webhook.retryPolicy.maxRetries) {
        const backoff = webhook.retryPolicy.backoffMs * 
          Math.pow(webhook.retryPolicy.backoffMultiplier, delivery.attempts - 1);
        
        setTimeout(() => {
          this.deliveryQueue.push(delivery);
        }, backoff);
      } else {
        delivery.completedAt = new Date();
      }
    }

    // Log delivery
    await this.logDelivery(delivery);
  }

  private async signPayload(payload: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(payload)
    );

    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private async logDelivery(delivery: WebhookDelivery): Promise<void> {
    try {
      console.log('[WebhookHub] Delivery logged:', delivery.id, delivery.status);
    } catch (error) {
      console.error('[WebhookHub] Failed to log delivery:', error);
    }
  }

  // Third-party integrations

  registerIntegration(integration: Omit<ThirdPartyIntegration, 'id'>): string {
    const id = crypto.randomUUID();
    this.integrations.set(id, { ...integration, id });
    return id;
  }

  async syncIntegration(id: string): Promise<boolean> {
    const integration = this.integrations.get(id);
    if (!integration) return false;

    try {
      switch (integration.type) {
        case 'slack':
          await this.syncSlack(integration);
          break;
        case 'stripe':
          await this.syncStripe(integration);
          break;
        default:
          // Custom sync logic
          break;
      }

      integration.status = 'active';
      integration.lastSync = new Date();
      return true;
    } catch (error) {
      integration.status = 'error';
      console.error(`[WebhookHub] Integration ${id} sync failed:`, error);
      return false;
    }
  }

  private async syncSlack(integration: ThirdPartyIntegration): Promise<void> {
    const webhookUrl = integration.config.webhookUrl as string;
    if (!webhookUrl) throw new Error('Slack webhook URL not configured');

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: '🚢 Nauti One integration active',
        username: 'Nauti One',
        icon_emoji: ':ship:'
      })
    });
  }

  private async syncStripe(integration: ThirdPartyIntegration): Promise<void> {
    // Stripe sync would be handled by Edge Function with secret key
    console.log('[WebhookHub] Stripe sync requires Edge Function');
  }

  async sendSlackNotification(
    channel: string,
    message: string,
    options?: { color?: string; fields?: Array<{ title: string; value: string }> }
  ): Promise<boolean> {
    const slackIntegration = Array.from(this.integrations.values())
      .find(i => i.type === 'slack' && i.status === 'active');

    if (!slackIntegration) {
      console.warn('[WebhookHub] No active Slack integration');
      return false;
    }

    const webhookUrl = slackIntegration.config.webhookUrl as string;

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          attachments: [{
            color: options?.color || '#0ea5e9',
            text: message,
            fields: options?.fields,
            footer: 'Nauti One',
            ts: Math.floor(Date.now() / 1000)
          }]
        })
      });
      return true;
    } catch {
      return false;
    }
  }

  listIntegrations(): ThirdPartyIntegration[] {
    return Array.from(this.integrations.values());
  }

  getDeliveryStats(): { pending: number; success: number; failed: number } {
    const allDeliveries = this.deliveryQueue;
    return {
      pending: allDeliveries.filter(d => d.status === 'pending').length,
      success: allDeliveries.filter(d => d.status === 'success').length,
      failed: allDeliveries.filter(d => d.status === 'failed').length
    };
  }
}

export const webhookHub = new WebhookHub();
export type { 
  WebhookConfig, 
  WebhookEventType, 
  WebhookPayload, 
  WebhookDelivery, 
  ThirdPartyIntegration 
};
