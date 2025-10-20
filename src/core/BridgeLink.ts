/**
 * BridgeLink – Internal communication system between Nautilus One modules
 * 
 * Event-based pub/sub system for decoupled module communication
 * Allows modules to emit and listen to events without tight coupling
 */

export interface BridgeLinkEvent {
  event: string;
  data?: unknown;
}

export const BridgeLink = {
  /**
   * Emit an event to all listeners
   * @param event - Event name (e.g., "nautilus:event", "mmi:job-completed")
   * @param data - Event payload
   */
  emit: (event: string, data?: unknown) => {
    console.debug(`📡 Emitting event: ${event}`, data);
    window.dispatchEvent(new CustomEvent(event, { detail: data }));
  },

  /**
   * Subscribe to an event
   * @param event - Event name to listen for
   * @param callback - Function to call when event is emitted
   * @returns Unsubscribe function
   */
  on: (event: string, callback: (data: unknown) => void) => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent;
      callback(customEvent.detail);
    };
    
    window.addEventListener(event, handler);
    
    // Return cleanup function
    return () => window.removeEventListener(event, handler);
  },
};
