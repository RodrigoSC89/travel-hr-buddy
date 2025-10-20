/**
 * BridgeLink - Internal Event Bus System
 * 
 * Connects all Nautilus One modules (MMI, DP Intelligence, FMEA, ASOG, etc.)
 * without requiring a backend. Provides a local, browser-based communication
 * layer for module integration.
 * 
 * Features:
 * - Type-safe event emission and subscription
 * - Automatic event logging for telemetry
 * - No external dependencies (browser-only)
 * - IMCA M 117 / ISM compliant (segregated functional layers)
 */

import React from 'react';

export type BridgeLinkEventType =
  | 'mmi:forecast:update'
  | 'mmi:job:created'
  | 'dp:incident:reported'
  | 'dp:intelligence:alert'
  | 'fmea:risk:identified'
  | 'asog:procedure:activated'
  | 'wsog:checklist:completed'
  | 'ai:analysis:complete'
  | 'system:module:loaded'
  | 'system:module:error'
  | 'telemetry:log';

export interface BridgeLinkEvent<T = any> {
  type: BridgeLinkEventType;
  timestamp: number;
  source: string;
  data: T;
  id: string;
}

export type BridgeLinkEventHandler<T = any> = (event: BridgeLinkEvent<T>) => void;

/**
 * BridgeLink Event Bus
 * Singleton pattern for global event coordination
 */
class BridgeLinkEventBus {
  private static instance: BridgeLinkEventBus;
  private listeners: Map<BridgeLinkEventType, Set<BridgeLinkEventHandler>> = new Map();
  private eventLog: BridgeLinkEvent[] = [];
  private maxLogSize: number = 500;
  
  private constructor() {
    console.log('[BridgeLink] Event Bus initialized');
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): BridgeLinkEventBus {
    if (!BridgeLinkEventBus.instance) {
      BridgeLinkEventBus.instance = new BridgeLinkEventBus();
    }
    return BridgeLinkEventBus.instance;
  }
  
  /**
   * Emit an event to all registered listeners
   */
  public emit<T = any>(
    type: BridgeLinkEventType,
    source: string,
    data: T
  ): void {
    const event: BridgeLinkEvent<T> = {
      type,
      timestamp: Date.now(),
      source,
      data,
      id: this.generateEventId()
    };
    
    // Log event
    this.logEvent(event);
    
    // Notify listeners
    const handlers = this.listeners.get(type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`[BridgeLink] Error in event handler for ${type}:`, error);
        }
      });
    }
    
    // Also notify wildcard listeners (telemetry)
    const telemetryHandlers = this.listeners.get('telemetry:log');
    if (telemetryHandlers && type !== 'telemetry:log') {
      telemetryHandlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error('[BridgeLink] Error in telemetry handler:', error);
        }
      });
    }
  }
  
  /**
   * Subscribe to events of a specific type
   */
  public on<T = any>(
    type: BridgeLinkEventType,
    handler: BridgeLinkEventHandler<T>
  ): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    
    this.listeners.get(type)!.add(handler as BridgeLinkEventHandler);
    
    // Return unsubscribe function
    return () => this.off(type, handler);
  }
  
  /**
   * Unsubscribe from events
   */
  public off<T = any>(
    type: BridgeLinkEventType,
    handler: BridgeLinkEventHandler<T>
  ): void {
    const handlers = this.listeners.get(type);
    if (handlers) {
      handlers.delete(handler as BridgeLinkEventHandler);
    }
  }
  
  /**
   * Get recent event log
   */
  public getEventLog(limit?: number): BridgeLinkEvent[] {
    if (limit) {
      return this.eventLog.slice(-limit);
    }
    return [...this.eventLog];
  }
  
  /**
   * Clear event log
   */
  public clearEventLog(): void {
    this.eventLog = [];
    console.log('[BridgeLink] Event log cleared');
  }
  
  /**
   * Get statistics about current listeners
   */
  public getStats(): {
    totalListeners: number;
    eventTypes: number;
    logSize: number;
  } {
    let totalListeners = 0;
    this.listeners.forEach(handlers => {
      totalListeners += handlers.size;
    });
    
    return {
      totalListeners,
      eventTypes: this.listeners.size,
      logSize: this.eventLog.length
    };
  }
  
  /**
   * Log event to internal buffer
   */
  private logEvent(event: BridgeLinkEvent): void {
    this.eventLog.push(event);
    
    // Maintain max log size
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.shift();
    }
    
    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[BridgeLink] ${event.type} from ${event.source}`, event.data);
    }
  }
  
  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const BridgeLink = BridgeLinkEventBus.getInstance();

/**
 * React Hook for subscribing to BridgeLink events
 */
export function useBridgeLink<T = any>(
  eventType: BridgeLinkEventType,
  handler: BridgeLinkEventHandler<T>,
  deps: React.DependencyList = []
): void {
  React.useEffect(() => {
    const unsubscribe = BridgeLink.on(eventType, handler);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export default BridgeLink;
