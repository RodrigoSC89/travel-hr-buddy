/**
 * BridgeLink Event Bus
 * Internal event communication system without backend dependencies
 * 
 * This provides a simple pub/sub pattern for inter-module communication
 * using the browser's native CustomEvent API.
 */

export interface BridgeLinkEvent<T = any> {
  data?: T;
  timestamp: string;
  source?: string;
}

type EventCallback<T = any> = (event: BridgeLinkEvent<T>) => void;

export const BridgeLink = {
  /**
   * Emit an event to all subscribers
   * @param event - Event name (e.g., "nautilus:event")
   * @param data - Optional event data
   */
  emit: <T = any>(event: string, data?: T) => {
    const eventData: BridgeLinkEvent<T> = {
      data,
      timestamp: new Date().toISOString(),
      source: data && typeof data === 'object' && 'source' in data ? String(data.source) : undefined,
    };
    
    console.debug(`📡 Emitindo evento: ${event}`, eventData);
    window.dispatchEvent(new CustomEvent(event, { detail: eventData }));
  },

  /**
   * Subscribe to an event
   * @param event - Event name to listen for
   * @param callback - Function to call when event is emitted
   * @returns Unsubscribe function
   */
  on: <T = any>(event: string, callback: EventCallback<T>) => {
    const handler = (e: Event) => {
      if (e instanceof CustomEvent) {
        callback(e.detail as BridgeLinkEvent<T>);
      }
    };
    
    window.addEventListener(event, handler);
    
    // Return unsubscribe function
    return () => window.removeEventListener(event, handler);
  },

  /**
   * Subscribe to an event only once
   * @param event - Event name to listen for
   * @param callback - Function to call when event is emitted (only once)
   * @returns Unsubscribe function
   */
  once: <T = any>(event: string, callback: EventCallback<T>) => {
    const handler = (e: Event) => {
      if (e instanceof CustomEvent) {
        callback(e.detail as BridgeLinkEvent<T>);
        window.removeEventListener(event, handler);
      }
    };
    
    window.addEventListener(event, handler);
    
    // Return unsubscribe function (in case they want to cancel before it fires)
    return () => window.removeEventListener(event, handler);
  },
};
