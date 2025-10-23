/**
 * Tests for Notification Delivery System
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock notification service
class NotificationService {
  private queue: any[] = [];
  private sent: any[] = [];
  private failed: any[] = [];

  async sendNotification(notification: any) {
    const { recipient, message, priority, channel } = notification;

    // Simulate delivery
    const deliveryTime = priority === "high" ? 100 : 500;

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (recipient && message) {
          this.sent.push({
            ...notification,
            id: `notif-${Date.now()}`,
            sentAt: new Date(),
            status: "delivered",
          });
          resolve({ success: true });
        } else {
          this.failed.push(notification);
          reject(new Error("Invalid notification"));
        }
      }, deliveryTime);
    });
  }

  queueNotification(notification: any) {
    this.queue.push({
      ...notification,
      queuedAt: new Date(),
      status: "queued",
    });
  }

  async processQueue() {
    const toProcess = [...this.queue];
    this.queue = [];

    const results = await Promise.allSettled(
      toProcess.map(notif => this.sendNotification(notif))
    );

    return results;
  }

  getStats() {
    return {
      queued: this.queue.length,
      sent: this.sent.length,
      failed: this.failed.length,
      successRate: this.sent.length / (this.sent.length + this.failed.length) || 0,
    };
  }

  clear() {
    this.queue = [];
    this.sent = [];
    this.failed = [];
  }
}

describe("Notification Delivery System", () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService();
    vi.clearAllMocks();
  });

  describe("Direct Sending", () => {
    it("should send notification successfully", async () => {
      const notification = {
        recipient: "user@example.com",
        message: "Test notification",
        priority: "normal",
        channel: "email",
      };

      const result = await service.sendNotification(notification) as { success: boolean };

      expect(result.success).toBe(true);
      expect(service.getStats().sent).toBe(1);
    });

    it("should prioritize high priority notifications", async () => {
      const highPriority = {
        recipient: "user@example.com",
        message: "Urgent alert",
        priority: "high",
        channel: "sms",
      };

      const normalPriority = {
        recipient: "user@example.com",
        message: "Regular update",
        priority: "normal",
        channel: "email",
      };

      const start = Date.now();
      await service.sendNotification(highPriority);
      const highTime = Date.now() - start;

      const start2 = Date.now();
      await service.sendNotification(normalPriority);
      const normalTime = Date.now() - start2;

      expect(highTime).toBeLessThan(normalTime);
    });

    it("should handle invalid notifications", async () => {
      const invalid = {
        recipient: null,
        message: "",
        priority: "normal",
      };

      await expect(service.sendNotification(invalid)).rejects.toThrow();
      expect(service.getStats().failed).toBe(1);
    });
  });

  describe("Queue Management", () => {
    it("should queue notifications", () => {
      service.queueNotification({
        recipient: "user1@example.com",
        message: "Queued message 1",
      });

      service.queueNotification({
        recipient: "user2@example.com",
        message: "Queued message 2",
      });

      expect(service.getStats().queued).toBe(2);
    });

    it("should process queued notifications", async () => {
      service.queueNotification({
        recipient: "user1@example.com",
        message: "Message 1",
        priority: "high",
      });

      service.queueNotification({
        recipient: "user2@example.com",
        message: "Message 2",
        priority: "normal",
      });

      await service.processQueue();

      expect(service.getStats().queued).toBe(0);
      expect(service.getStats().sent).toBe(2);
    });

    it("should handle mixed success/failure in queue", async () => {
      service.queueNotification({
        recipient: "valid@example.com",
        message: "Valid message",
      });

      service.queueNotification({
        recipient: null,
        message: "",
      });

      await service.processQueue();

      const stats = service.getStats();
      expect(stats.sent).toBe(1);
      expect(stats.failed).toBe(1);
    });
  });

  describe("Statistics", () => {
    it("should calculate success rate correctly", async () => {
      await service.sendNotification({
        recipient: "user1@example.com",
        message: "Success 1",
      });

      await service.sendNotification({
        recipient: "user2@example.com",
        message: "Success 2",
      });

      try {
        await service.sendNotification({
          recipient: null,
          message: "",
        });
      } catch {}

      const stats = service.getStats();
      expect(stats.successRate).toBeCloseTo(0.67, 1);
    });

    it("should track all notification states", () => {
      service.queueNotification({ recipient: "user1@example.com", message: "Q1" });
      service.queueNotification({ recipient: "user2@example.com", message: "Q2" });

      const stats = service.getStats();
      expect(stats.queued).toBe(2);
      expect(stats.sent).toBe(0);
      expect(stats.failed).toBe(0);
    });

    it("should handle zero sent/failed gracefully", () => {
      const stats = service.getStats();
      expect(stats.successRate).toBe(0);
    });
  });

  describe("Cleanup", () => {
    it("should clear all data", async () => {
      service.queueNotification({ recipient: "user@example.com", message: "Test" });
      await service.processQueue();

      service.clear();

      const stats = service.getStats();
      expect(stats.queued).toBe(0);
      expect(stats.sent).toBe(0);
      expect(stats.failed).toBe(0);
    });
  });
});
