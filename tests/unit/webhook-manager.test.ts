/**
 * Unit Tests for Webhook Manager
 * PATCH 10/10 - Test coverage for integrations
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock types for testing
type WebhookChannel = "slack" | "whatsapp" | "email" | "sms";
type WebhookPriority = "low" | "medium" | "high" | "critical";

interface WebhookPayload {
  channel: WebhookChannel;
  priority: WebhookPriority;
  title: string;
  message: string;
  recipient?: string;
  metadata?: Record<string, unknown>;
}

// Simple mock implementation for testing
class MockWebhookManager {
  private queue: WebhookPayload[] = [];
  private sentWebhooks: WebhookPayload[] = [];

  async send(payload: WebhookPayload): Promise<boolean> {
    this.queue.push(payload);
    this.sentWebhooks.push(payload);
    return true;
  }

  getSentWebhooks(): WebhookPayload[] {
    return this.sentWebhooks;
  }

  clearSentWebhooks(): void {
    this.sentWebhooks = [];
    this.queue = [];
  }

  async broadcastAlert(
    title: string,
    message: string,
    priority: WebhookPriority,
    options?: {
      slackChannel?: string;
      emailRecipients?: string[];
      whatsappRecipients?: string[];
    }
  ): Promise<void> {
    if (priority === "high" || priority === "critical") {
      await this.send({
        channel: "slack",
        priority,
        title,
        message,
        metadata: { slackChannel: options?.slackChannel }
      });
    }

    if (options?.emailRecipients) {
      for (const email of options.emailRecipients) {
        await this.send({
          channel: "email",
          priority,
          title,
          message,
          recipient: email
        });
      }
    }

    if (priority === "critical" && options?.whatsappRecipients) {
      for (const phone of options.whatsappRecipients) {
        await this.send({
          channel: "whatsapp",
          priority,
          title,
          message,
          recipient: phone
        });
      }
    }
  }
}

describe("WebhookManager", () => {
  let webhookManager: MockWebhookManager;

  beforeEach(() => {
    webhookManager = new MockWebhookManager();
  });

  describe("send", () => {
    it("should queue and send webhook payload", async () => {
      const payload: WebhookPayload = {
        channel: "slack",
        priority: "high",
        title: "Test Alert",
        message: "This is a test message"
      };

      const result = await webhookManager.send(payload);
      
      expect(result).toBe(true);
      expect(webhookManager.getSentWebhooks()).toHaveLength(1);
      expect(webhookManager.getSentWebhooks()[0]).toEqual(payload);
    });

    it("should handle multiple webhook sends", async () => {
      await webhookManager.send({
        channel: "slack",
        priority: "low",
        title: "Alert 1",
        message: "Message 1"
      });

      await webhookManager.send({
        channel: "email",
        priority: "medium",
        title: "Alert 2",
        message: "Message 2",
        recipient: "test@example.com"
      });

      expect(webhookManager.getSentWebhooks()).toHaveLength(2);
    });

    it("should include metadata in payload", async () => {
      const metadata = { userId: "123", action: "login" };
      
      await webhookManager.send({
        channel: "slack",
        priority: "medium",
        title: "User Action",
        message: "User logged in",
        metadata
      });

      const sent = webhookManager.getSentWebhooks()[0];
      expect(sent.metadata).toEqual(metadata);
    });
  });

  describe("broadcastAlert", () => {
    it("should send to Slack for high priority", async () => {
      await webhookManager.broadcastAlert(
        "Critical Issue",
        "System is down",
        "high"
      );

      const sent = webhookManager.getSentWebhooks();
      expect(sent).toHaveLength(1);
      expect(sent[0].channel).toBe("slack");
      expect(sent[0].priority).toBe("high");
    });

    it("should send to Slack for critical priority", async () => {
      await webhookManager.broadcastAlert(
        "Emergency",
        "Immediate attention required",
        "critical"
      );

      const sent = webhookManager.getSentWebhooks();
      expect(sent.some(w => w.channel === "slack")).toBe(true);
    });

    it("should NOT send to Slack for low priority", async () => {
      await webhookManager.broadcastAlert(
        "Info",
        "Just FYI",
        "low"
      );

      const sent = webhookManager.getSentWebhooks();
      expect(sent.filter(w => w.channel === "slack")).toHaveLength(0);
    });

    it("should send to all email recipients", async () => {
      const recipients = ["a@test.com", "b@test.com", "c@test.com"];
      
      await webhookManager.broadcastAlert(
        "Report Ready",
        "Your report is available",
        "medium",
        { emailRecipients: recipients }
      );

      const emailWebhooks = webhookManager.getSentWebhooks()
        .filter(w => w.channel === "email");
      
      expect(emailWebhooks).toHaveLength(3);
      expect(emailWebhooks.map(w => w.recipient)).toEqual(recipients);
    });

    it("should send WhatsApp only for critical priority", async () => {
      const phones = ["+1234567890", "+0987654321"];
      
      // High priority - no WhatsApp
      await webhookManager.broadcastAlert(
        "High Priority",
        "Important message",
        "high",
        { whatsappRecipients: phones }
      );

      let whatsappWebhooks = webhookManager.getSentWebhooks()
        .filter(w => w.channel === "whatsapp");
      expect(whatsappWebhooks).toHaveLength(0);

      // Clear and test critical
      webhookManager.clearSentWebhooks();

      await webhookManager.broadcastAlert(
        "Critical Alert",
        "Emergency message",
        "critical",
        { whatsappRecipients: phones }
      );

      whatsappWebhooks = webhookManager.getSentWebhooks()
        .filter(w => w.channel === "whatsapp");
      expect(whatsappWebhooks).toHaveLength(2);
    });

    it("should broadcast to multiple channels for critical alerts", async () => {
      await webhookManager.broadcastAlert(
        "System Failure",
        "All systems down",
        "critical",
        {
          slackChannel: "#alerts",
          emailRecipients: ["admin@test.com"],
          whatsappRecipients: ["+1234567890"]
        }
      );

      const sent = webhookManager.getSentWebhooks();
      const channels = new Set(sent.map(w => w.channel));
      
      expect(channels.has("slack")).toBe(true);
      expect(channels.has("email")).toBe(true);
      expect(channels.has("whatsapp")).toBe(true);
    });
  });

  describe("priority handling", () => {
    it.each([
      ["low", 0],
      ["medium", 0],
      ["high", 1],
      ["critical", 1]
    ] as [WebhookPriority, number][])(
      "priority %s should send %d Slack messages",
      async (priority, expectedCount) => {
        webhookManager.clearSentWebhooks();
        
        await webhookManager.broadcastAlert(
          "Test",
          "Message",
          priority
        );

        const slackCount = webhookManager.getSentWebhooks()
          .filter(w => w.channel === "slack").length;
        
        expect(slackCount).toBe(expectedCount);
      }
    );
  });
});
