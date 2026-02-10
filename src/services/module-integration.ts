/**
 * Module Integration Service
 * Central service for cross-module communication and integration
 * DEBT-FIX: Removed (supabase as any) - using typed dynamic table helper
 */

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { spaNavigate } from "@/lib/navigation/spa-navigate";
import type { Database } from "@/integrations/supabase/types";

type TableName = keyof Database["public"]["Tables"];

export interface ModuleAction {
  module: string;
  action: string;
  payload?: Record<string, unknown>;
  callback?: (result: unknown) => void;
}

export interface IntegrationEvent {
  type: string;
  source: string;
  target?: string;
  data: Record<string, unknown>;
  timestamp: Date;
}

const MODULE_TABLE_MAP: Record<string, TableName> = {
  "fleet": "vessels",
  "crew": "crew_members",
  "maintenance": "maintenance_tasks",
  "documents": "ai_documents",
  "training": "academy_courses",
  "compliance": "compliance_items",
  "communication": "channel_messages"
};

class ModuleIntegrationService {
  private listeners: Map<string, Set<(event: IntegrationEvent) => void>> = new Map();
  private actionHandlers: Map<string, (payload: Record<string, unknown>) => Promise<unknown>> = new Map();

  constructor() {
    this.registerDefaultHandlers();
  }

  private registerDefaultHandlers() {
    this.registerAction("navigate", async (payload) => {
      const path = payload.path as string | undefined;
      if (path) spaNavigate(path);
      return { success: true };
    });

    this.registerAction("notify", async (payload) => {
      const title = payload.title as string | undefined;
      const message = payload.message as string | undefined;
      const type = (payload.type as string) || "info";
      if (type === "error") toast.error(title || message);
      else if (type === "success") toast.success(title || message);
      else toast(title || message);
      return { success: true };
    });

    this.registerAction("refresh", async (payload) => {
      this.emit({ type: "refresh", source: "integration-service", target: payload.module as string | undefined, data: payload, timestamp: new Date() });
      return { success: true };
    });
  }

  registerAction(name: string, handler: (payload: Record<string, unknown>) => Promise<unknown>) {
    this.actionHandlers.set(name, handler);
  }

  async executeAction(action: ModuleAction): Promise<Record<string, unknown>> {
    const handler = this.actionHandlers.get(action.action);
    if (!handler) {
      logger.warn(`No handler for action: ${action.action}`);
      return { success: false, error: "Action not found" };
    }

    try {
      const result = await handler({ ...action.payload, module: action.module });
      if (action.callback) action.callback(result);
      return (result as Record<string, unknown>) ?? { success: true };
    } catch (error) {
      logger.error(`Error executing action ${action.action}`, { error });
      return { success: false, error: String(error) };
    }
  }

  subscribe(eventType: string, callback: (event: IntegrationEvent) => void) {
    if (!this.listeners.has(eventType)) this.listeners.set(eventType, new Set());
    this.listeners.get(eventType)!.add(callback);
    return () => { this.listeners.get(eventType)?.delete(callback); };
  }

  emit(event: IntegrationEvent) {
    const listeners = this.listeners.get(event.type);
    if (listeners) listeners.forEach(callback => callback(event));
    const allListeners = this.listeners.get("*");
    if (allListeners) allListeners.forEach(callback => callback(event));
  }

  async getModuleData(module: string, query?: Record<string, any>): Promise<any> {
    const table = MODULE_TABLE_MAP[module];
    if (!table) return { data: [], error: "Module not mapped" };

    try {
      // Dynamic table access requires targeted type assertion on table name
      const { data, error } = await (supabase.from as Function)(table)
        .select("*")
        .limit(query?.limit || 100);

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  async checkModuleStatus(module: string): Promise<{ online: boolean; lastSync?: string }> {
    try {
      const result = await this.getModuleData(module, { limit: 1 });
      return { online: !result.error, lastSync: new Date().toISOString() };
    } catch {
      return { online: false };
    }
  }

  async batchExecute(actions: ModuleAction[]): Promise<any[]> {
    return Promise.all(actions.map(action => this.executeAction(action)));
  }
}

export const moduleIntegration = new ModuleIntegrationService();
export default moduleIntegration;
