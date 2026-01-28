/**
 * Load Balancer Engine
 * PATCH: Intelligent request distribution
 */

export interface ServerInstance {
  id: string;
  host: string;
  port: number;
  weight: number;
  healthy: boolean;
  activeConnections: number;
  totalRequests: number;
  avgResponseTime: number;
  lastHealthCheck: Date;
  region: string;
}

export interface LoadBalancerConfig {
  algorithm: 'round_robin' | 'least_connections' | 'weighted' | 'ip_hash' | 'random';
  healthCheckInterval: number; // seconds
  healthCheckTimeout: number; // seconds
  maxRetries: number;
  stickySession: boolean;
  sessionTTL: number; // seconds
}

export interface RequestContext {
  clientIP: string;
  sessionId?: string;
  path: string;
  method: string;
  headers: Record<string, string>;
}

export class LoadBalancer {
  private instances: Map<string, ServerInstance> = new Map();
  private config: LoadBalancerConfig;
  private roundRobinIndex: number = 0;
  private sessionMap: Map<string, string> = new Map(); // sessionId -> instanceId

  constructor(config?: Partial<LoadBalancerConfig>) {
    this.config = {
      algorithm: 'least_connections',
      healthCheckInterval: 30,
      healthCheckTimeout: 5,
      maxRetries: 3,
      stickySession: true,
      sessionTTL: 3600,
      ...config,
    };
  }

  registerInstance(instance: ServerInstance): void {
    this.instances.set(instance.id, instance);
  }

  removeInstance(instanceId: string): void {
    this.instances.delete(instanceId);
    // Clean up session mappings
    for (const [sessionId, mappedInstanceId] of this.sessionMap.entries()) {
      if (mappedInstanceId === instanceId) {
        this.sessionMap.delete(sessionId);
      }
    }
  }

  selectInstance(context: RequestContext): ServerInstance | null {
    const healthyInstances = Array.from(this.instances.values()).filter(i => i.healthy);
    
    if (healthyInstances.length === 0) {
      return null;
    }

    // Check sticky session first
    if (this.config.stickySession && context.sessionId) {
      const stickyInstanceId = this.sessionMap.get(context.sessionId);
      if (stickyInstanceId) {
        const stickyInstance = this.instances.get(stickyInstanceId);
        if (stickyInstance?.healthy) {
          return stickyInstance;
        }
      }
    }

    let selected: ServerInstance | null = null;

    switch (this.config.algorithm) {
      case 'round_robin':
        selected = this.roundRobin(healthyInstances);
        break;
      case 'least_connections':
        selected = this.leastConnections(healthyInstances);
        break;
      case 'weighted':
        selected = this.weighted(healthyInstances);
        break;
      case 'ip_hash':
        selected = this.ipHash(healthyInstances, context.clientIP);
        break;
      case 'random':
        selected = this.random(healthyInstances);
        break;
      default:
        selected = this.leastConnections(healthyInstances);
    }

    // Update sticky session
    if (selected && this.config.stickySession && context.sessionId) {
      this.sessionMap.set(context.sessionId, selected.id);
    }

    return selected;
  }

  private roundRobin(instances: ServerInstance[]): ServerInstance {
    const instance = instances[this.roundRobinIndex % instances.length];
    this.roundRobinIndex++;
    return instance;
  }

  private leastConnections(instances: ServerInstance[]): ServerInstance {
    return instances.reduce((min, instance) => 
      instance.activeConnections < min.activeConnections ? instance : min
    );
  }

  private weighted(instances: ServerInstance[]): ServerInstance {
    const totalWeight = instances.reduce((sum, i) => sum + i.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const instance of instances) {
      random -= instance.weight;
      if (random <= 0) {
        return instance;
      }
    }
    
    return instances[0];
  }

  private ipHash(instances: ServerInstance[], clientIP: string): ServerInstance {
    let hash = 0;
    for (let i = 0; i < clientIP.length; i++) {
      hash = ((hash << 5) - hash) + clientIP.charCodeAt(i);
      hash = hash & hash;
    }
    const index = Math.abs(hash) % instances.length;
    return instances[index];
  }

  private random(instances: ServerInstance[]): ServerInstance {
    const index = Math.floor(Math.random() * instances.length);
    return instances[index];
  }

  async healthCheck(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    
    for (const [id, instance] of this.instances) {
      // Simulate health check (in real implementation, would make HTTP request)
      const isHealthy = Math.random() > 0.05; // 95% healthy simulation
      instance.healthy = isHealthy;
      instance.lastHealthCheck = new Date();
      results.set(id, isHealthy);
    }
    
    return results;
  }

  recordRequest(instanceId: string, responseTime: number): void {
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.totalRequests++;
      // Rolling average for response time
      instance.avgResponseTime = (instance.avgResponseTime * 0.9) + (responseTime * 0.1);
    }
  }

  incrementConnections(instanceId: string): void {
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.activeConnections++;
    }
  }

  decrementConnections(instanceId: string): void {
    const instance = this.instances.get(instanceId);
    if (instance && instance.activeConnections > 0) {
      instance.activeConnections--;
    }
  }

  getInstances(): ServerInstance[] {
    return Array.from(this.instances.values());
  }

  getHealthyInstances(): ServerInstance[] {
    return Array.from(this.instances.values()).filter(i => i.healthy);
  }

  getConfig(): LoadBalancerConfig {
    return { ...this.config };
  }

  setConfig(config: Partial<LoadBalancerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getStats(): {
    totalInstances: number;
    healthyInstances: number;
    totalConnections: number;
    totalRequests: number;
    avgResponseTime: number;
  } {
    const instances = Array.from(this.instances.values());
    const healthy = instances.filter(i => i.healthy);
    
    return {
      totalInstances: instances.length,
      healthyInstances: healthy.length,
      totalConnections: instances.reduce((sum, i) => sum + i.activeConnections, 0),
      totalRequests: instances.reduce((sum, i) => sum + i.totalRequests, 0),
      avgResponseTime: instances.length > 0 
        ? instances.reduce((sum, i) => sum + i.avgResponseTime, 0) / instances.length 
        : 0,
    };
  }
}

export const loadBalancer = new LoadBalancer();
