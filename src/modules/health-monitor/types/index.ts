// PATCH 623: Health Monitor Types

export type ServiceStatus = 'healthy' | 'degraded' | 'down';

export interface HealthCheckResult {
  service: string;
  status: ServiceStatus;
  responseTime: number;
  timestamp: Date;
  error?: string;
  metadata?: Record<string, any>;
}

export interface SystemHealth {
  overall: ServiceStatus;
  services: HealthCheckResult[];
  lastCheck: Date;
}

export interface HealthAlert {
  id: string;
  service: string;
  status: ServiceStatus;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

export interface ServiceConfig {
  name: string;
  checkFunction: () => Promise<HealthCheckResult>;
  threshold: {
    healthy: number;
    degraded: number;
  };
  enabled: boolean;
}
