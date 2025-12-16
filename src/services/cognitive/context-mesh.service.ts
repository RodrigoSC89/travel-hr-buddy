/**
 * PATCH 548 - Context Mesh Service
 * Refactored service for distributed context sharing
 */

import { logger } from "@/lib/logger";

export type ContextType = "mission" | "risk" | "ai" | "prediction" | "telemetry";
export type SyncStatus = "pending" | "synced" | "failed";

export interface ContextMessage {
  id?: string;
  moduleName: string;
  contextType: ContextType;
  contextData: Record<string, any>;
  timestamp?: Date;
  source: string;
  syncStatus?: SyncStatus;
}

export interface ContextSubscription {
  id: string;
  moduleName: string;
  contextTypes: ContextType[];
  handler: (message: ContextMessage) => void;
}

type EventHandler = (message: ContextMessage) => void;

export class ContextMeshService {
  private static subscribers = new Map<string, ContextSubscription>();
  private static eventBus = new Map<ContextType, Set<EventHandler>>();
  private static messageHistory: ContextMessage[] = [];
  private static readonly MAX_HISTORY = 1000;

  /**
   * Publish a context message
   */
  static publish(message: ContextMessage): void {
    const timestamp = message.timestamp || new Date();
    const fullMessage: ContextMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp,
      syncStatus: "synced"
    };

    this.notifySubscribers(fullMessage);
    this.addToHistory(fullMessage);
    logger.debug("[ContextMesh] Published context message", { 
      contextType: message.contextType, 
      moduleName: message.moduleName 
    });
  }

  /**
   * Subscribe to context updates
   */
  static subscribe(subscription: Omit<ContextSubscription, "id">): string {
    const id = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullSubscription: ContextSubscription = { ...subscription, id };
    
    this.subscribers.set(id, fullSubscription);

    subscription.contextTypes.forEach(type => {
      if (!this.eventBus.has(type)) {
        this.eventBus.set(type, new Set());
      }
      this.eventBus.get(type)!.add(subscription.handler);
    });

    logger.debug("[ContextMesh] Subscription created", { 
      moduleName: subscription.moduleName, 
      contextTypes: subscription.contextTypes 
    });
    return id;
  }

  /**
   * Unsubscribe from context updates
   */
  static unsubscribe(subscriptionId: string): void {
    const subscription = this.subscribers.get(subscriptionId);
    if (!subscription) return;

    subscription.contextTypes.forEach(type => {
      const handlers = this.eventBus.get(type);
      if (handlers) {
        handlers.delete(subscription.handler);
      }
    });

    this.subscribers.delete(subscriptionId);
  }

  /**
   * Get context history
   */
  static getHistory(moduleName?: string, contextType?: ContextType, limit: number = 100): ContextMessage[] {
    let filtered = this.messageHistory;

    if (moduleName) {
      filtered = filtered.filter(msg => msg.moduleName === moduleName);
    }
    if (contextType) {
      filtered = filtered.filter(msg => msg.contextType === contextType);
    }

    return filtered.slice(0, limit);
  }

  /**
   * Clear history
   */
  static clearHistory(): void {
    this.messageHistory = [];
  }

  // Private helper methods

  private static notifySubscribers(message: ContextMessage): void {
    const handlers = this.eventBus.get(message.contextType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          logger.error("[ContextMesh] Error in message handler", error as Error, { 
            contextType: message.contextType,
            moduleName: message.moduleName
          });
        }
      });
    }
  }

  private static addToHistory(message: ContextMessage): void {
    this.messageHistory.unshift(message);
    if (this.messageHistory.length > this.MAX_HISTORY) {
      this.messageHistory = this.messageHistory.slice(0, this.MAX_HISTORY);
    }
  }
}

export const contextMeshService = ContextMeshService;
