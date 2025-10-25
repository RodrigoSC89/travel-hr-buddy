/**
 * PATCH 100.0 - API Proxy Router Service
 */

import { ApiRoute, MonitoringStats } from '../types';

class ApiProxyRouterService {
  private routes: Map<string, ApiRoute> = new Map();
  private stats: MonitoringStats = {
    totalRequests: 0,
    avgLatency: 0,
    errorRate: 0,
    activeConnections: 0,
    timestamp: new Date()
  };

  constructor() {
    // Initialize with demo routes
    this.registerRoute('auth', '/api/auth', 'POST');
    this.registerRoute('fleet', '/api/fleet', 'GET');
    this.registerRoute('documents', '/api/documents', 'POST');
    this.registerRoute('analytics', '/api/analytics', 'GET');
    this.registerRoute('missions', '/api/missions', 'GET');
    this.registerRoute('finance', '/api/finance', 'GET');
    this.registerRoute('logs', '/api/logs', 'GET');
  }

  registerRoute(service: string, path: string, method: ApiRoute['method']): ApiRoute {
    const route: ApiRoute = {
      id: this.generateId(),
      service,
      path,
      method,
      status: 'active',
      requestCount: Math.floor(Math.random() * 10000),
      avgLatency: Math.floor(Math.random() * 300) + 50
    };

    this.routes.set(route.id, route);
    return route;
  }

  async proxyRequest(service: string, endpoint: string, options?: RequestInit): Promise<Response> {
    const route = Array.from(this.routes.values()).find(r => r.service === service);
    
    if (!route) {
      throw new Error(`Service ${service} not found`);
    }

    if (route.status !== 'active') {
      throw new Error(`Service ${service} is ${route.status}`);
    }

    const startTime = Date.now();
    this.stats.activeConnections++;

    try {
      // Simulate API call
      const response = await this.simulateApiCall(route, endpoint);
      
      const latency = Date.now() - startTime;
      this.updateRouteStats(route, latency, true);

      return response;
    } catch (error) {
      const latency = Date.now() - startTime;
      this.updateRouteStats(route, latency, false);
      route.lastError = error instanceof Error ? error.message : 'Unknown error';
      route.lastErrorTime = new Date();
      throw error;
    } finally {
      this.stats.activeConnections--;
    }
  }

  async checkEndpointStatus(path: string): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    latency: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      // Simulate health check
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
      
      const latency = Date.now() - startTime;
      
      if (latency > 1000) {
        return { status: 'degraded', latency };
      }
      
      return { status: 'healthy', latency };
    } catch (error) {
      const latency = Date.now() - startTime;
      return {
        status: 'down',
        latency,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async simulateApiCall(route: ApiRoute, endpoint: string): Promise<Response> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, route.avgLatency + Math.random() * 50));
    
    // Simulate occasional errors (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('Internal Server Error');
    }

    return new Response(JSON.stringify({ success: true, data: {} }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private updateRouteStats(route: ApiRoute, latency: number, success: boolean): void {
    route.requestCount++;
    
    // Update average latency
    route.avgLatency = Math.round((route.avgLatency * (route.requestCount - 1) + latency) / route.requestCount);

    // Update global stats
    this.stats.totalRequests++;
    this.stats.avgLatency = Math.round(
      (this.stats.avgLatency * (this.stats.totalRequests - 1) + latency) / this.stats.totalRequests
    );

    if (!success) {
      route.status = 'error';
    }

    // Calculate error rate
    const totalErrors = Array.from(this.routes.values()).filter(r => r.status === 'error').length;
    this.stats.errorRate = (totalErrors / this.routes.size) * 100;
    this.stats.timestamp = new Date();
  }

  getAllRoutes(): ApiRoute[] {
    return Array.from(this.routes.values());
  }

  getRoute(id: string): ApiRoute | undefined {
    return this.routes.get(id);
  }

  getStats(): MonitoringStats {
    return { ...this.stats };
  }

  private generateId(): string {
    return `route_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

export const apiProxyRouter = new ApiProxyRouterService();
