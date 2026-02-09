/**
 * PATCH 100.0 - Webhook Manager Service
 * Real webhook delivery via fetch to configured URLs
 */

import { Webhook, WebhookLog } from "../types";
import type { WebhookPayload } from "@/types/webhook.types";
import { logger } from "@/lib/logger";

class WebhookManagerService {
  private webhooks: Map<string, Webhook> = new Map();
  private logs: WebhookLog[] = [];

  constructor() {
    // Initialize with demo webhooks
    this.createWebhook("Document Upload Notification", "https://example.com/webhooks/documents", ["document.uploaded", "document.updated"]);
    this.createWebhook("User Activity Alert", "https://example.com/webhooks/users", ["user.login", "user.logout"]);
    this.createWebhook("System Events", "https://example.com/webhooks/system", ["system.error", "system.warning"]);
  }

  createWebhook(name: string, url: string, events: string[]): Webhook {
    const webhook: Webhook = {
      id: this.generateId(),
      name,
      url,
      events,
      isActive: true,
      successCount: 0,
      failureCount: 0
    };

    this.webhooks.set(webhook.id, webhook);
    return webhook;
  }

  async triggerWebhook(event: string, payload: WebhookPayload): Promise<void> {
    const relevantWebhooks = Array.from(this.webhooks.values()).filter(
      wh => wh.isActive && wh.events.includes(event)
    );

    for (const webhook of relevantWebhooks) {
      const startTime = Date.now();
      
      try {
        // Real HTTP POST to webhook URL
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event, payload, timestamp: new Date().toISOString() }),
          signal: AbortSignal.timeout(10000),
        });

        const responseTime = Date.now() - startTime;
        webhook.lastTriggered = new Date();

        if (response.ok) {
          webhook.successCount++;
          this.addLog({
            id: this.generateId(),
            webhookId: webhook.id,
            event,
            status: "success",
            statusCode: response.status,
            responseTime,
            timestamp: new Date()
          });
        } else {
          webhook.failureCount++;
          this.addLog({
            id: this.generateId(),
            webhookId: webhook.id,
            event,
            status: "failure",
            statusCode: response.status,
            responseTime,
            error: `HTTP ${response.status}: ${response.statusText}`,
            timestamp: new Date()
          });
        }
      } catch (error) {
        const responseTime = Date.now() - startTime;
        webhook.failureCount++;

        this.addLog({
          id: this.generateId(),
          webhookId: webhook.id,
          event,
          status: "failure",
          statusCode: 0,
          responseTime,
          error: error instanceof Error ? error.message : "Network error",
          timestamp: new Date()
        });

        logger.warn(`[Webhook] Failed to deliver to ${webhook.url}:`, error);
      }
    }
  }

  updateWebhook(id: string, updates: Partial<Webhook>): boolean {
    const webhook = this.webhooks.get(id);
    if (webhook) {
      Object.assign(webhook, updates);
      return true;
    }
    return false;
  }

  deleteWebhook(id: string): boolean {
    return this.webhooks.delete(id);
  }

  getAllWebhooks(): Webhook[] {
    return Array.from(this.webhooks.values());
  }

  getWebhook(id: string): Webhook | undefined {
    return this.webhooks.get(id);
  }

  getLogs(webhookId?: string, limit: number = 100): WebhookLog[] {
    let logs = [...this.logs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    if (webhookId) {
      logs = logs.filter(log => log.webhookId === webhookId);
    }

    return logs.slice(0, limit);
  }

  private addLog(log: WebhookLog): void {
    this.logs.push(log);
    
    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
  }

  private generateId(): string {
    return `${Date.now()}_${crypto.randomUUID().slice(0, 9)}`;
  }
}

export const webhookManager = new WebhookManagerService();
