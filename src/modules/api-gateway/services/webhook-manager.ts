/**
 * PATCH 100.0 - Webhook Manager Service
 */

import { Webhook, WebhookLog } from "../types";

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

  async triggerWebhook(event: string, payload: any): Promise<void> {
    const relevantWebhooks = Array.from(this.webhooks.values()).filter(
      wh => wh.isActive && wh.events.includes(event)
    );

    for (const webhook of relevantWebhooks) {
      const startTime = Date.now();
      
      try {
        // Simulate webhook call (in production, this would be a real HTTP request)
        await this.simulateWebhookCall(webhook.url, event, payload);
        
        const responseTime = Date.now() - startTime;
        webhook.lastTriggered = new Date();
        webhook.successCount++;

        this.addLog({
          id: this.generateId(),
          webhookId: webhook.id,
          event,
          status: "success",
          statusCode: 200,
          responseTime,
          timestamp: new Date()
        });
      } catch (error) {
        const responseTime = Date.now() - startTime;
        webhook.failureCount++;

        this.addLog({
          id: this.generateId(),
          webhookId: webhook.id,
          event,
          status: "failure",
          statusCode: 500,
          responseTime,
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date()
        });
      }
    }
  }

  private async simulateWebhookCall(url: string, event: string, payload: any): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));
    
    // Simulate occasional failures (10% chance)
    if (Math.random() < 0.1) {
      throw new Error("Network timeout");
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
    return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

export const webhookManager = new WebhookManagerService();
