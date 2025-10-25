/**
 * PATCH 100.0 - API Gateway Types
 */

export interface ApiRoute {
  id: string;
  service: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  status: 'active' | 'inactive' | 'error';
  requestCount: number;
  avgLatency: number;
  lastError?: string;
  lastErrorTime?: Date;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  scope: string[];
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  requestCount: number;
}

export interface RateLimitConfig {
  endpoint: string;
  maxRequests: number;
  windowMs: number;
  currentCount: number;
  resetAt: Date;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  lastTriggered?: Date;
  successCount: number;
  failureCount: number;
}

export interface WebhookLog {
  id: string;
  webhookId: string;
  event: string;
  status: 'success' | 'failure';
  statusCode?: number;
  responseTime: number;
  error?: string;
  timestamp: Date;
}

export interface MonitoringStats {
  totalRequests: number;
  avgLatency: number;
  errorRate: number;
  activeConnections: number;
  timestamp: Date;
}
