/**
 * PATCH 100.1 - API Proxy Router Service
 * Uses database for route stats and health checks
 */

import { supabase } from "@/integrations/supabase/client";
import { ApiRoute, MonitoringStats } from "../types";

interface ApiEndpointRow {
  id: string;
  name: string;
  url: string;
  method: string;
  status: string;
  created_at: string;
  updated_at: string;
}

class ApiProxyRouterService {
  private routes: Map<string, ApiRoute> = new Map();
  private stats: MonitoringStats = {
    totalRequests: 0,
    avgLatency: 0,
    errorRate: 0,
    activeConnections: 0,
    timestamp: new Date()
  };
  private initialized: boolean = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Load routes from database using actual table columns
      const { data, error } = await supabase
        .from("api_endpoints")
        .select("id, path, method, summary, description, is_deprecated, is_public")
        .eq("is_deprecated", false);

      if (error) throw error;

      if (data && data.length > 0) {
        data.forEach((row) => {
          // Extract service name from path (e.g., "/api/fleet" -> "fleet")
          const pathParts = (row.path ?? "").split("/").filter(Boolean);
          const serviceName = pathParts.length > 1 ? pathParts[1] : row.id;
          
          const route: ApiRoute = {
            id: row.id,
            service: serviceName,
            path: row.path ?? "/api/unknown",
            method: (row.method ?? "GET") as ApiRoute["method"],
            status: row.is_deprecated ? "inactive" : "active",
            requestCount: 0,
            avgLatency: 100
          };
          this.routes.set(route.id, route);
        });
      } else {
        // Fallback to default routes if database is empty
        this.registerDefaultRoutes();
      }

      this.initialized = true;
    } catch (err) {
      console.error("Failed to load API routes from database:", err);
      this.registerDefaultRoutes();
      this.initialized = true;
    }
  }

  private registerDefaultRoutes(): void {
    const defaults = [
      { service: "auth", path: "/api/auth", method: "POST" as const },
      { service: "fleet", path: "/api/fleet", method: "GET" as const },
      { service: "documents", path: "/api/documents", method: "POST" as const },
      { service: "analytics", path: "/api/analytics", method: "GET" as const },
      { service: "missions", path: "/api/missions", method: "GET" as const },
      { service: "finance", path: "/api/finance", method: "GET" as const },
      { service: "logs", path: "/api/logs", method: "GET" as const }
    ];

    defaults.forEach(d => {
      this.registerRoute(d.service, d.path, d.method);
    });
  }

  registerRoute(service: string, path: string, method: ApiRoute["method"]): ApiRoute {
    const route: ApiRoute = {
      id: this.generateId(),
      service,
      path,
      method,
      status: "active",
      requestCount: 0,
      avgLatency: 100
    };

    this.routes.set(route.id, route);
    return route;
  }

  async proxyRequest(service: string, endpoint: string, options?: RequestInit): Promise<Response> {
    await this.initialize();

    const route = Array.from(this.routes.values()).find(r => r.service === service);
    
    if (!route) {
      throw new Error(`Service ${service} not found`);
    }

    if (route.status !== "active") {
      throw new Error(`Service ${service} is ${route.status}`);
    }

    const startTime = Date.now();
    this.stats.activeConnections++;

    try {
      const response = await this.executeApiCall(route, endpoint, options);
      
      const latency = Date.now() - startTime;
      this.updateRouteStats(route, latency, true);

      return response;
    } catch (error) {
      const latency = Date.now() - startTime;
      this.updateRouteStats(route, latency, false);
      route.lastError = error instanceof Error ? error.message : "Unknown error";
      route.lastErrorTime = new Date();
      throw error;
    } finally {
      this.stats.activeConnections--;
    }
  }

  private async executeApiCall(route: ApiRoute, endpoint: string, options?: RequestInit): Promise<Response> {
    // For internal API calls, use Supabase Edge Functions
    if (route.path.startsWith("/api/")) {
      const functionName = route.service;
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: options?.body ? JSON.parse(options.body as string) : undefined
      });

      if (error) throw error;
      return new Response(JSON.stringify(data), { status: 200 });
    }

    // For external endpoints, make actual HTTP request
    const fullUrl = `${route.path}${endpoint}`;
    return fetch(fullUrl, options);
  }

  async checkEndpointStatus(path: string): Promise<{
    status: "healthy" | "degraded" | "down";
    latency: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      // Query health from database
      const { data, error } = await supabase
        .from("system_health_metrics")
        .select("response_time_ms, network_status")
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const latency = Date.now() - startTime;

      if (error) throw error;

      if (!data) {
        return { status: "healthy", latency };
      }

      if (data.network_status !== "online") {
        return { status: "down", latency };
      }

      if ((data.response_time_ms ?? 0) > 1000) {
        return { status: "degraded", latency: data.response_time_ms ?? latency };
      }

      return { status: "healthy", latency: data.response_time_ms ?? latency };
    } catch (error) {
      const latency = Date.now() - startTime;
      return {
        status: "down",
        latency,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  private updateRouteStats(route: ApiRoute, latency: number, success: boolean): void {
    route.requestCount++;
    route.avgLatency = Math.round((route.avgLatency * (route.requestCount - 1) + latency) / route.requestCount);

    this.stats.totalRequests++;
    this.stats.avgLatency = Math.round(
      (this.stats.avgLatency * (this.stats.totalRequests - 1) + latency) / this.stats.totalRequests
    );

    if (!success) {
      route.status = "error";
    }

    const totalErrors = Array.from(this.routes.values()).filter(r => r.status === "error").length;
    this.stats.errorRate = (totalErrors / this.routes.size) * 100;
    this.stats.timestamp = new Date();
  }

  async getAllRoutes(): Promise<ApiRoute[]> {
    await this.initialize();
    return Array.from(this.routes.values());
  }

  getRoute(id: string): ApiRoute | undefined {
    return this.routes.get(id);
  }

  getStats(): MonitoringStats {
    return { ...this.stats };
  }

  private generateId(): string {
    return `route_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`;
  }
}

export const apiProxyRouter = new ApiProxyRouterService();
