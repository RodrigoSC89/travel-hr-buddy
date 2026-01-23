/**
 * Webhook Manager - Centralized webhook dispatch for Slack/WhatsApp/Email
 * PATCH 10/10 - Production-grade integrations
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export type WebhookChannel = "slack" | "whatsapp" | "email" | "sms";
export type WebhookPriority = "low" | "medium" | "high" | "critical";

export interface WebhookPayload {
  channel: WebhookChannel;
  priority: WebhookPriority;
  title: string;
  message: string;
  recipient?: string;
  metadata?: Record<string, unknown>;
}

export interface WebhookConfig {
  slackWebhookUrl?: string;
  whatsappPhoneId?: string;
  emailFrom?: string;
  smsPhoneNumber?: string;
}

class WebhookManager {
  private config: WebhookConfig = {};
  private queue: WebhookPayload[] = [];
  private isProcessing = false;

  /**
   * Initialize webhook configuration from environment/localStorage
   */
  initialize(): void {
    // Load from localStorage for demo (in production, use edge function)
    try {
      const stored = localStorage.getItem("webhook_config");
      if (stored) {
        this.config = JSON.parse(stored);
      }
      logger.info("WebhookManager initialized");
    } catch (error) {
      logger.warn("WebhookManager init failed", { error });
    }
  }

  /**
   * Set configuration
   */
  setConfig(config: Partial<WebhookConfig>): void {
    this.config = { ...this.config, ...config };
    localStorage.setItem("webhook_config", JSON.stringify(this.config));
  }

  /**
   * Send a webhook notification
   */
  async send(payload: WebhookPayload): Promise<boolean> {
    this.queue.push(payload);
    
    if (!this.isProcessing) {
      await this.processQueue();
    }
    
    return true;
  }

  /**
   * Process queued webhooks
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const payload = this.queue.shift();
      if (!payload) continue;

      try {
        await this.dispatch(payload);
      } catch (error) {
        logger.error("Failed to dispatch webhook", { 
          channel: payload.channel, 
          error 
        });
      }
    }

    this.isProcessing = false;
  }

  /**
   * Dispatch webhook to appropriate channel
   */
  private async dispatch(payload: WebhookPayload): Promise<void> {
    switch (payload.channel) {
      case "slack":
        await this.sendSlack(payload);
        break;
      case "whatsapp":
        await this.sendWhatsApp(payload);
        break;
      case "email":
        await this.sendEmail(payload);
        break;
      case "sms":
        await this.sendSMS(payload);
        break;
      default:
        logger.warn("Unknown webhook channel", { channel: payload.channel });
    }
  }

  private async sendSlack(payload: WebhookPayload): Promise<void> {
    if (!this.config.slackWebhookUrl) {
      logger.warn("Slack webhook not configured");
      return;
    }

    const priorityEmoji: Record<WebhookPriority, string> = {
      low: "ℹ️", medium: "⚠️", high: "🔴", critical: "🚨"
    };

    await supabase.functions.invoke("notify-slack", {
      body: {
        webhookUrl: this.config.slackWebhookUrl,
        text: `${priorityEmoji[payload.priority]} *${payload.title}*\n${payload.message}`
      }
    });
  }

  private async sendWhatsApp(payload: WebhookPayload): Promise<void> {
    if (!payload.recipient) return;

    await supabase.functions.invoke("twilio-send-whatsapp", {
      body: { to: payload.recipient, message: `*${payload.title}*\n\n${payload.message}` }
    });
  }

  private async sendEmail(payload: WebhookPayload): Promise<void> {
    if (!payload.recipient) return;

    await supabase.functions.invoke("sendgrid-email", {
      body: { to: payload.recipient, subject: payload.title, html: `<p>${payload.message}</p>` }
    });
  }

  private async sendSMS(payload: WebhookPayload): Promise<void> {
    if (!payload.recipient) return;

    await supabase.functions.invoke("twilio-send-sms", {
      body: { to: payload.recipient, message: `${payload.title}: ${payload.message}` }
    });
  }

  /**
   * Broadcast alert to multiple channels based on priority
   */
  async broadcastAlert(
    title: string, 
    message: string, 
    priority: WebhookPriority,
    options?: { emailRecipients?: string[]; whatsappRecipients?: string[] }
  ): Promise<void> {
    const promises: Promise<boolean>[] = [];

    if (priority === "high" || priority === "critical") {
      promises.push(this.send({ channel: "slack", priority, title, message }));
    }

    if (options?.emailRecipients) {
      for (const email of options.emailRecipients) {
        promises.push(this.send({ channel: "email", priority, title, message, recipient: email }));
      }
    }

    if (priority === "critical" && options?.whatsappRecipients) {
      for (const phone of options.whatsappRecipients) {
        promises.push(this.send({ channel: "whatsapp", priority, title, message, recipient: phone }));
      }
    }

    await Promise.allSettled(promises);
  }
}

export const webhookManager = new WebhookManager();

if (typeof window !== "undefined") {
  webhookManager.initialize();
}
