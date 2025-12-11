/**
 * Module Integration Service
 * Central service for cross-module communication and integration
 */

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ModuleAction {
  module: string;
  action: string;
  payload?: Record<string, any>;
  callback?: (result: any) => void;
}

export interface IntegrationEvent {
  type: string;
  source: string;
  target?: string;
  data: any;
  timestamp: Date;
}

class ModuleIntegrationService {
  private listeners: Map<string, Set<(event: IntegrationEvent) => void>> = new Map();
  private actionHandlers: Map<string, (payload: any) => Promise<any>> = new Map();

  constructor() {
    this.registerDefaultHandlers();
  }

  private registerDefaultHandlers() {
    // Navigation actions
    this.registerAction("navigate", async (payload) => {
      if (payload.path) {
        window.location.href = payload.path;
      }
      return { success: true };
    });

    // Toast notifications
    this.registerAction("notify", async (payload) => {
      const { title, message, type = "info" } = payload;
      if (type === "error") {
        toast.error(title || message);
      } else if (type === "success") {
        toast.success(title || message);
      } else {
        toast(title || message);
      }
      return { success: true };
    });

    // Data refresh
    this.registerAction("refresh", async (payload) => {
      this.emit({
        type: "refresh",
        source: "integration-service",
        target: payload.module,
        data: payload,
        timestamp: new Date()
      });
      return { success: true };
    });
  }

  registerAction(name: string, handler: (payload: any) => Promise<any>) {
    this.actionHandlers.set(name, handler);
  }

  async executeAction(action: ModuleAction): Promise<any> {
    const handler = this.actionHandlers.get(action.action);
    if (!handler) {
      return { success: false, error: "Action not found" };
    }

    try {
      const result = await handler({ ...action.payload, module: action.module });
      if (action.callback) {
        action.callback(result);
      }
      return result;
    } catch (error) {
      console.error(`Error executing action ${action.action}:`, error);
      console.error(`Error executing action ${action.action}:`, error);
      return { success: false, error };
    }
  }

  subscribe(eventType: string, callback: (event: IntegrationEvent) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  emit(event: IntegrationEvent) {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }

    // Also emit to "all" listeners
    const allListeners = this.listeners.get("*");
    if (allListeners) {
      allListeners.forEach(callback => callback(event));
    }
  }

  // Cross-module data sharing
  async getModuleData(module: string, query?: Record<string, any>): Promise<any> {
    const tableMap: Record<string, string> = {
      "fleet": "vessels",
      "crew": "crew_members",
      "maintenance": "mmi_maintenance_jobs",
      "documents": "ai_documents",
      "training": "academy_courses",
      "compliance": "peotram_audits",
      "communication": "channel_messages"
    };

    const table = tableMap[module];
    if (!table) {
      return { data: [], error: "Module not mapped" };
    }

    try {
      // Use type assertion to avoid deep type instantiation
      const { data, error } = await (supabase as any)
        .from(table)
        .select("*")
        .limit(query?.limit || 100);

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Module status check
  async checkModuleStatus(module: string): Promise<{ online: boolean; lastSync?: string }> {
    try {
      const result = await this.getModuleData(module, { limit: 1 });
      return {
        online: !result.error,
        lastSync: new Date().toISOString()
      };
    } catch {
      return { online: false };
    }
  }

  // Batch operations
  async batchExecute(actions: ModuleAction[]): Promise<any[]> {
    return Promise.all(actions.map(action => this.executeAction(action)));
  }
}

export const moduleIntegration = new ModuleIntegrationService();
export default moduleIntegration;
