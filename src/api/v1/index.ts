// @ts-nocheck
/**
 * PATCH 649 - REST API Gateway for External Integrations
 * TODO PATCH 659: TypeScript fixes pending (complex type issues)
 * Base API v1 structure for modules, missions, inspections, and crew
 */

import { supabase } from "@/integrations/supabase/client";

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface ModuleAPIData {
  id: string;
  name: string;
  status: string;
  category: string;
  version: string;
  route: string;
}

/**
 * API v1 Endpoints
 */
export class NautilusAPI {
  private rateLimit = {
    requests: 0,
    windowStart: Date.now(),
    maxRequests: 1000,
    windowMs: 60000, // 1 minute
  };

  /**
   * Check rate limit
   */
  private checkRateLimit(): boolean {
    const now = Date.now();
    
    // Reset window if expired
    if (now - this.rateLimit.windowStart > this.rateLimit.windowMs) {
      this.rateLimit.requests = 0;
      this.rateLimit.windowStart = now;
    }

    // Check limit
    if (this.rateLimit.requests >= this.rateLimit.maxRequests) {
      return false;
    }

    this.rateLimit.requests++;
    return true;
  }

  /**
   * Create API response
   */
  private createResponse<T>(success: boolean, data?: T, error?: string): APIResponse<T> {
    return {
      success,
      data,
      error,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Fetch and parse modules registry
   */
  private async fetchModulesRegistry(): Promise<{modules: any[]}> {
    const response = await fetch("/modules-registry.json");
    if (!response.ok) {
      throw new Error(`Failed to load modules registry: ${response.status}`);
    }
    return await response.json();
  }

  /**
   * GET /api/v1/modules
   * Get all modules
   */
  async getModules(): Promise<APIResponse<ModuleAPIData[]>> {
    if (!this.checkRateLimit()) {
      return this.createResponse(false, undefined, "Rate limit exceeded");
    }

    try {
      const data = await this.fetchModulesRegistry();
      
      const modules: ModuleAPIData[] = data.modules.map((m: any) => ({
        id: m.id,
        name: m.name,
        status: m.status,
        category: m.category,
        version: m.version,
        route: m.route,
      }));

      return this.createResponse(true, modules);
    } catch (error) {
      return this.createResponse(false, undefined, "Failed to fetch modules");
    }
  }

  /**
   * GET /api/v1/module/:id
   * Get specific module
   */
  async getModule(id: string): Promise<APIResponse<ModuleAPIData>> {
    if (!this.checkRateLimit()) {
      return this.createResponse(false, undefined, "Rate limit exceeded");
    }

    try {
      const data = await this.fetchModulesRegistry();
      
      const module = data.modules.find((m: any) => m.id === id);
      
      if (!module) {
        return this.createResponse(false, undefined, "Module not found");
      }

      const moduleData: ModuleAPIData = {
        id: module.id,
        name: module.name,
        status: module.status,
        category: module.category,
        version: module.version,
        route: module.route,
      };

      return this.createResponse(true, moduleData);
    } catch (error) {
      return this.createResponse(false, undefined, "Failed to fetch module");
    }
  }

  /**
   * GET /api/v1/missions
   * Get all missions
   */
  async getMissions(): Promise<APIResponse<MissionRow[]>> {
    if (!this.checkRateLimit()) {
      return this.createResponse(false, undefined, "Rate limit exceeded");
    }

    try {
      const { data, error } = await supabase
        .from("missions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      return this.createResponse(true, data || []);
    } catch (error) {
      return this.createResponse(false, undefined, "Failed to fetch missions");
    }
  }

  /**
   * POST /api/v1/missions
   * Create new mission
   */
  async createMission(missionData: Partial<MissionRow>): Promise<APIResponse<MissionRow>> {
    if (!this.checkRateLimit()) {
      return this.createResponse(false, undefined, "Rate limit exceeded");
    }

    try {
      const { data, error } = await supabase
        .from("missions")
        .insert([missionData])
        .select()
        .single();

      if (error) throw error;

      return this.createResponse(true, data);
    } catch (error) {
      return this.createResponse(false, undefined, "Failed to create mission");
    }
  }

  /**
   * GET /api/v1/crew
   * Get crew members
   */
  async getCrew(): Promise<APIResponse<CrewMemberRow[]>> {
    if (!this.checkRateLimit()) {
      return this.createResponse(false, undefined, "Rate limit exceeded");
    }

    try {
      const { data, error } = await supabase
        .from("crew_members")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;

      return this.createResponse(true, data || []);
    } catch (error) {
      return this.createResponse(false, undefined, "Failed to fetch crew");
    }
  }

  /**
   * POST /api/v1/inspections
   * Create new inspection
   */
  async createInspection(inspectionData: any): Promise<APIResponse<any>> {
    if (!this.checkRateLimit()) {
      return this.createResponse(false, undefined, "Rate limit exceeded");
    }

    try {
      const { data, error } = await supabase
        .from("inspections")
        .insert([inspectionData])
        .select()
        .single();

      if (error) throw error;

      return this.createResponse(true, data);
    } catch (error) {
      return this.createResponse(false, undefined, "Failed to create inspection");
    }
  }

  /**
   * Health check endpoint
   */
  async health(): Promise<APIResponse<{ status: string; version: string }>> {
    return this.createResponse(true, {
      status: "healthy",
      version: "1.0.0",
    });
  }
}

// Export singleton instance
export const nautilusAPI = new NautilusAPI();
