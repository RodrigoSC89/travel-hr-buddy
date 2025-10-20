/**
 * BridgeLink - Event Bus System
 * Inter-module communication system for Nautilus One
 * Phase Beta 3.1
 */

type EventCallback = (data: any) => void;

interface EventSubscription {
  event: string;
  callback: EventCallback;
}

export class BridgeLinkClass {
  private subscribers: Map<string, Set<EventCallback>> = new Map();

  /**
   * Subscribe to an event
   * @param event Event name
   * @param callback Callback function
   * @returns Unsubscribe function
   */
  on(event: string, callback: EventCallback): () => void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }

    const callbacks = this.subscribers.get(event)!;
    callbacks.add(callback);

    console.log(`📡 [BridgeLink] Subscribed to: ${event}`);

    // Return unsubscribe function
    return () => {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.subscribers.delete(event);
      }
      console.log(`📡 [BridgeLink] Unsubscribed from: ${event}`);
    };
  }

  /**
   * Emit an event to all subscribers
   * @param event Event name
   * @param data Event data
   */
  emit(event: string, data: any): void {
    const callbacks = this.subscribers.get(event);

    if (!callbacks || callbacks.size === 0) {
      console.log(`📡 [BridgeLink] No subscribers for: ${event}`);
      return;
    }

    console.log(`📡 [BridgeLink] Emitting: ${event}`, data);

    callbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`📡 [BridgeLink] Error in callback for ${event}:`, error);
      }
    });
  }

  /**
   * Get count of subscribers for an event
   * @param event Event name
   * @returns Number of subscribers
   */
  getSubscriberCount(event: string): number {
    const callbacks = this.subscribers.get(event);
    return callbacks ? callbacks.size : 0;
  }

  /**
   * Get all registered events
   * @returns Array of event names
   */
  getRegisteredEvents(): string[] {
    return Array.from(this.subscribers.keys());
  }

  /**
   * Clear all subscribers
   */
  clear(): void {
    this.subscribers.clear();
    console.log(`📡 [BridgeLink] All subscribers cleared`);
  }

  /**
   * Remove all subscribers for a specific event
   * @param event Event name
   */
  removeAllListeners(event: string): void {
    if (this.subscribers.has(event)) {
      this.subscribers.delete(event);
      console.log(`📡 [BridgeLink] All subscribers removed for: ${event}`);
    }
  }
}

// Singleton instance
export const BridgeLink = new BridgeLinkClass();
