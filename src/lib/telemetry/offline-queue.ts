/**
 * PATCH 499: Offline Event Queue
 * Manages telemetry events when offline
 */

import type { TelemetryEvent } from "./events";

const QUEUE_KEY = "telemetry_offline_queue";
const MAX_QUEUE_SIZE = 100;

export class OfflineQueue {
  /**
   * Add event to offline queue
   */
  static enqueue(event: TelemetryEvent): void {
    try {
      const queue = this.getQueue();
      
      // Add event with timestamp
      queue.push({
        ...event,
        queued_at: new Date().toISOString(),
      });

      // Limit queue size
      if (queue.length > MAX_QUEUE_SIZE) {
        queue.splice(0, queue.length - MAX_QUEUE_SIZE);
      }

      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.warn("Failed to enqueue telemetry event:", error);
    }
  }

  /**
   * Get all queued events
   */
  static getQueue(): any[] {
    try {
      const queueJson = localStorage.getItem(QUEUE_KEY);
      return queueJson ? JSON.parse(queueJson) : [];
    } catch (error) {
      console.warn("Failed to get offline queue:", error);
      return [];
    }
  }

  /**
   * Clear the queue
   */
  static clearQueue(): void {
    try {
      localStorage.removeItem(QUEUE_KEY);
    } catch (error) {
      console.warn("Failed to clear offline queue:", error);
    }
  }

  /**
   * Get queue size
   */
  static getQueueSize(): number {
    return this.getQueue().length;
  }

  /**
   * Process queue and send events
   */
  static async processQueue(sendFn: (event: TelemetryEvent) => Promise<void>): Promise<void> {
    const queue = this.getQueue();
    
    if (queue.length === 0) {
      return;
    }

    // Process in batches
    const batchSize = 10;
    for (let i = 0; i < queue.length; i += batchSize) {
      const batch = queue.slice(i, i + batchSize);
      
      try {
        await Promise.all(
          batch.map((event) => sendFn(event))
        );
      } catch (error) {
        console.error("Failed to process queue batch:", error);
        // Keep remaining events in queue
        const remaining = queue.slice(i);
        localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
        return;
      }
    }

    // Clear queue if all events were sent successfully
    this.clearQueue();
  }
}
