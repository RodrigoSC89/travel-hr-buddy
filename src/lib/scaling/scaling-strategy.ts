/**
 * Scaling Strategy Service - PROMPT 18
 * Estratégias de escalabilidade para 1M+ usuários
 */

import { logger } from '@/lib/logger';

export interface ScalingMetrics {
  current_users: number;
  peak_users: number;
  requests_per_second: number;
  database_connections: number;
  cache_hit_rate: number;
  average_response_time_ms: number;
  error_rate_percent: number;
  memory_usage_percent: number;
  cpu_usage_percent: number;
}

export interface ScalingThresholds {
  scale_up_cpu: number;      // % CPU para escalar para cima
  scale_down_cpu: number;    // % CPU para escalar para baixo
  scale_up_memory: number;   // % Memory para escalar
  scale_down_memory: number;
  min_instances: number;
  max_instances: number;
  cooldown_seconds: number;  // Tempo entre ações de scaling
}

export interface RegionConfig {
  id: string;
  name: string;
  location: string;
  primary: boolean;
  latency_target_ms: number;
  status: 'active' | 'standby' | 'maintenance';
}

export interface CDNConfig {
  provider: string;
  regions: string[];
  cache_rules: {
    pattern: string;
    ttl_seconds: number;
    bypass_conditions?: string[];
  }[];
}

export interface DisasterRecoveryConfig {
  rpo_minutes: number;  // Recovery Point Objective
  rto_minutes: number;  // Recovery Time Objective
  backup_frequency_hours: number;
  backup_retention_days: number;
  failover_regions: string[];
  auto_failover: boolean;
}

// Configuração padrão de scaling
export const DEFAULT_SCALING_THRESHOLDS: ScalingThresholds = {
  scale_up_cpu: 70,
  scale_down_cpu: 30,
  scale_up_memory: 80,
  scale_down_memory: 40,
  min_instances: 2,
  max_instances: 50,
  cooldown_seconds: 300
};

// Regiões disponíveis
export const AVAILABLE_REGIONS: RegionConfig[] = [
  {
    id: 'us-east-1',
    name: 'US East',
    location: 'Virginia, USA',
    primary: true,
    latency_target_ms: 50,
    status: 'active'
  },
  {
    id: 'eu-west-1',
    name: 'EU West',
    location: 'Dublin, Ireland',
    primary: false,
    latency_target_ms: 60,
    status: 'active'
  },
  {
    id: 'ap-southeast-1',
    name: 'Asia Pacific',
    location: 'Singapore',
    primary: false,
    latency_target_ms: 80,
    status: 'active'
  },
  {
    id: 'sa-east-1',
    name: 'South America',
    location: 'São Paulo, Brazil',
    primary: false,
    latency_target_ms: 100,
    status: 'standby'
  }
];

// Configuração de CDN
export const DEFAULT_CDN_CONFIG: CDNConfig = {
  provider: 'cloudflare',
  regions: ['global'],
  cache_rules: [
    {
      pattern: '/assets/*',
      ttl_seconds: 31536000, // 1 year for static assets
    },
    {
      pattern: '/api/public/*',
      ttl_seconds: 300, // 5 minutes for public API
    },
    {
      pattern: '/api/auth/*',
      ttl_seconds: 0, // No cache for auth
      bypass_conditions: ['authenticated']
    },
    {
      pattern: '*.js',
      ttl_seconds: 604800, // 1 week for JS bundles
    },
    {
      pattern: '*.css',
      ttl_seconds: 604800,
    },
    {
      pattern: '*.woff2',
      ttl_seconds: 31536000, // 1 year for fonts
    }
  ]
};

// Configuração de DR
export const DEFAULT_DR_CONFIG: DisasterRecoveryConfig = {
  rpo_minutes: 5,  // Max 5 minutes of data loss
  rto_minutes: 30, // Max 30 minutes to recover
  backup_frequency_hours: 1,
  backup_retention_days: 30,
  failover_regions: ['eu-west-1', 'ap-southeast-1'],
  auto_failover: true
};

class ScalingService {
  private static instance: ScalingService;
  private metrics: ScalingMetrics | null = null;

  private constructor() {}

  static getInstance(): ScalingService {
    if (!ScalingService.instance) {
      ScalingService.instance = new ScalingService();
    }
    return ScalingService.instance;
  }

  // Atualizar métricas (simulado - em produção viria de monitoring)
  updateMetrics(metrics: Partial<ScalingMetrics>): void {
    this.metrics = {
      current_users: metrics.current_users || 0,
      peak_users: metrics.peak_users || 0,
      requests_per_second: metrics.requests_per_second || 0,
      database_connections: metrics.database_connections || 0,
      cache_hit_rate: metrics.cache_hit_rate || 0,
      average_response_time_ms: metrics.average_response_time_ms || 0,
      error_rate_percent: metrics.error_rate_percent || 0,
      memory_usage_percent: metrics.memory_usage_percent || 0,
      cpu_usage_percent: metrics.cpu_usage_percent || 0
    };
  }

  getMetrics(): ScalingMetrics | null {
    return this.metrics;
  }

  // Calcular instâncias necessárias baseado em usuários
  calculateRequiredInstances(
    targetUsers: number, 
    usersPerInstance = 1000
  ): number {
    const instances = Math.ceil(targetUsers / usersPerInstance);
    return Math.max(
      DEFAULT_SCALING_THRESHOLDS.min_instances,
      Math.min(instances, DEFAULT_SCALING_THRESHOLDS.max_instances)
    );
  }

  // Verificar se deve escalar
  shouldScale(thresholds = DEFAULT_SCALING_THRESHOLDS): 'up' | 'down' | 'none' {
    if (!this.metrics) return 'none';

    const { cpu_usage_percent, memory_usage_percent } = this.metrics;

    if (cpu_usage_percent > thresholds.scale_up_cpu || 
        memory_usage_percent > thresholds.scale_up_memory) {
      return 'up';
    }

    if (cpu_usage_percent < thresholds.scale_down_cpu && 
        memory_usage_percent < thresholds.scale_down_memory) {
      return 'down';
    }

    return 'none';
  }

  // Calcular custo estimado
  estimateMonthlyCost(config: {
    instances: number;
    storage_gb: number;
    bandwidth_gb: number;
    database_tier: 'small' | 'medium' | 'large' | 'xlarge';
  }): { total: number; breakdown: Record<string, number> } {
    // Preços estimados (em produção, viriam do cloud provider)
    const prices = {
      instance_per_hour: 0.05,
      storage_per_gb: 0.10,
      bandwidth_per_gb: 0.08,
      database: {
        small: 25,
        medium: 100,
        large: 400,
        xlarge: 1500
      }
    };

    const hours_per_month = 730; // Average hours in a month

    const breakdown = {
      compute: config.instances * prices.instance_per_hour * hours_per_month,
      storage: config.storage_gb * prices.storage_per_gb,
      bandwidth: config.bandwidth_gb * prices.bandwidth_per_gb,
      database: prices.database[config.database_tier]
    };

    return {
      total: Object.values(breakdown).reduce((a, b) => a + b, 0),
      breakdown
    };
  }

  // Obter região recomendada baseado em localização do usuário
  getRecommendedRegion(userLatitude: number, userLongitude: number): RegionConfig {
    // Simplificado - em produção usaria geolocalização real
    const regionCoords: Record<string, [number, number]> = {
      'us-east-1': [37.4, -79.5],    // Virginia
      'eu-west-1': [53.3, -6.3],     // Dublin
      'ap-southeast-1': [1.3, 103.8], // Singapore
      'sa-east-1': [-23.5, -46.6]    // São Paulo
    };

    let closest: RegionConfig = AVAILABLE_REGIONS[0];
    let minDistance = Infinity;

    AVAILABLE_REGIONS
      .filter(r => r.status === 'active')
      .forEach(region => {
        const [lat, lon] = regionCoords[region.id] || [0, 0];
        const distance = Math.sqrt(
          Math.pow(userLatitude - lat, 2) + 
          Math.pow(userLongitude - lon, 2)
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          closest = region;
        }
      });

    return closest;
  }

  // Health check do sistema
  async performHealthCheck(): Promise<{
    healthy: boolean;
    checks: Record<string, { status: 'ok' | 'warning' | 'critical'; message: string }>;
  }> {
    const checks: Record<string, { status: 'ok' | 'warning' | 'critical'; message: string }> = {};

    // Check métricas
    if (this.metrics) {
      // CPU
      if (this.metrics.cpu_usage_percent > 90) {
        checks.cpu = { status: 'critical', message: 'CPU usage above 90%' };
      } else if (this.metrics.cpu_usage_percent > 70) {
        checks.cpu = { status: 'warning', message: 'CPU usage above 70%' };
      } else {
        checks.cpu = { status: 'ok', message: 'CPU usage normal' };
      }

      // Memory
      if (this.metrics.memory_usage_percent > 90) {
        checks.memory = { status: 'critical', message: 'Memory usage above 90%' };
      } else if (this.metrics.memory_usage_percent > 80) {
        checks.memory = { status: 'warning', message: 'Memory usage above 80%' };
      } else {
        checks.memory = { status: 'ok', message: 'Memory usage normal' };
      }

      // Error rate
      if (this.metrics.error_rate_percent > 5) {
        checks.errors = { status: 'critical', message: 'Error rate above 5%' };
      } else if (this.metrics.error_rate_percent > 1) {
        checks.errors = { status: 'warning', message: 'Error rate above 1%' };
      } else {
        checks.errors = { status: 'ok', message: 'Error rate normal' };
      }

      // Response time
      if (this.metrics.average_response_time_ms > 1000) {
        checks.latency = { status: 'critical', message: 'Response time above 1s' };
      } else if (this.metrics.average_response_time_ms > 500) {
        checks.latency = { status: 'warning', message: 'Response time above 500ms' };
      } else {
        checks.latency = { status: 'ok', message: 'Response time normal' };
      }
    } else {
      checks.metrics = { status: 'warning', message: 'No metrics available' };
    }

    const healthy = Object.values(checks).every(c => c.status !== 'critical');

    return { healthy, checks };
  }

  // Gerar relatório de capacidade
  generateCapacityReport(): {
    current_capacity: number;
    max_capacity: number;
    utilization_percent: number;
    recommendations: string[];
  } {
    const currentUsers = this.metrics?.current_users || 0;
    const maxCapacity = DEFAULT_SCALING_THRESHOLDS.max_instances * 1000; // 1000 users per instance
    const utilization = (currentUsers / maxCapacity) * 100;

    const recommendations: string[] = [];

    if (utilization > 80) {
      recommendations.push('Consider increasing max_instances limit');
      recommendations.push('Review database connection pooling');
    }

    if (this.metrics?.cache_hit_rate && this.metrics.cache_hit_rate < 80) {
      recommendations.push('Improve cache strategy to reduce database load');
    }

    if (this.metrics?.average_response_time_ms && this.metrics.average_response_time_ms > 300) {
      recommendations.push('Optimize slow queries and API endpoints');
    }

    if (recommendations.length === 0) {
      recommendations.push('System is operating within healthy parameters');
    }

    return {
      current_capacity: currentUsers,
      max_capacity: maxCapacity,
      utilization_percent: Math.round(utilization * 100) / 100,
      recommendations
    };
  }

  logScalingEvent(event: string, data: Record<string, unknown>): void {
    logger.info(`Scaling event: ${event}`, data);
  }
}

// Export singleton instance
export const scalingService = ScalingService.getInstance();
