/**
 * BridgeLink - Internal Event Bus Communication System
 * 
 * Provides a centralized event communication system for inter-module messaging
 * without requiring backend infrastructure. All modules can communicate via events.
 * 
 * Usage:
 *   BridgeLink.emit("nautilus:event", { message: "Task completed" });
 *   BridgeLink.on("nautilus:event", (data) => console.log(data));
 */

export interface BridgeLinkEvent {
  type: string;
  data?: any;
  timestamp?: string;
  source?: string;
}

export const BridgeLink = {
  /**
   * Emit an event to the internal event bus
   * 
   * @param event - Event name/type
   * @param data - Event payload data
   */
  emit: (event: string, data?: any) => {
    console.debug(`📡 Emitindo evento: ${event}`, data);
    
    const eventData: BridgeLinkEvent = {
      type: event,
      data,
      timestamp: new Date().toISOString(),
    };
    
    window.dispatchEvent(
      new CustomEvent(event, { detail: eventData })
    );
  },

  /**
   * Subscribe to an event on the internal event bus
   * 
   * @param event - Event name/type to listen for
   * @param callback - Callback function to execute when event is received
   * @returns Unsubscribe function
   */
  on: (event: string, callback: (data: any) => void) => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<BridgeLinkEvent>;
      callback(customEvent.detail);
    };
    
    window.addEventListener(event, handler);
    
    // Return unsubscribe function
    return () => window.removeEventListener(event, handler);
  },

  /**
   * Subscribe to an event that should only fire once
   * 
   * @param event - Event name/type to listen for
   * @param callback - Callback function to execute when event is received
   */
  once: (event: string, callback: (data: any) => void) => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<BridgeLinkEvent>;
      callback(customEvent.detail);
      window.removeEventListener(event, handler);
    };
    
    window.addEventListener(event, handler, { once: true });
  },

  /**
   * Remove all listeners for a specific event
   * 
   * @param event - Event name/type
   */
  off: (event: string) => {
    // Note: This doesn't remove specific listeners, only provides a placeholder
    // For proper cleanup, use the unsubscribe function returned by `on()`
    console.debug(`🔇 Removing listeners for: ${event}`);
  },
};

export default BridgeLink;
