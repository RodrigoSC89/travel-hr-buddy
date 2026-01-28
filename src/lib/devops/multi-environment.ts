/**
 * Multi-Environment Configuration System
 * Nauti One v4.0
 */

export interface Environment {
  id: string;
  name: string;
  type: 'development' | 'staging' | 'production';
  status: 'active' | 'inactive' | 'maintenance';
  url: string;
  apiUrl: string;
  supabaseUrl: string;
  features: FeatureFlags;
  resources: ResourceConfig;
  secrets: SecretReference[];
  lastDeployment?: DeploymentInfo;
  metrics: EnvironmentMetrics;
}

export interface FeatureFlags {
  [key: string]: boolean | string | number;
}

export interface ResourceConfig {
  cpu: string;
  memory: string;
  storage: string;
  replicas: number;
  autoScale: AutoScaleConfig;
}

export interface AutoScaleConfig {
  enabled: boolean;
  minReplicas: number;
  maxReplicas: number;
  targetCPU: number;
  targetMemory: number;
}

export interface SecretReference {
  name: string;
  source: 'supabase' | 'env' | 'vault';
  required: boolean;
  masked: boolean;
}

export interface DeploymentInfo {
  version: string;
  commit: string;
  deployedAt: string;
  deployedBy: string;
  status: 'success' | 'failed' | 'rolling_back';
}

export interface EnvironmentMetrics {
  uptime: number;
  requestsPerMinute: number;
  errorRate: number;
  avgResponseTime: number;
  activeUsers: number;
}

export interface EnvironmentDiff {
  environment1: string;
  environment2: string;
  differences: {
    category: string;
    key: string;
    value1: unknown;
    value2: unknown;
  }[];
}

class MultiEnvironmentEngine {
  private environments: Map<string, Environment> = new Map();

  constructor() {
    this.initializeEnvironments();
  }

  private initializeEnvironments(): void {
    const defaultEnvironments: Environment[] = [
      {
        id: 'dev',
        name: 'Development',
        type: 'development',
        status: 'active',
        url: 'https://dev.nautione.com',
        apiUrl: 'https://dev-api.nautione.com',
        supabaseUrl: 'https://dev-vnbptmixvwropvanyhdb.supabase.co',
        features: {
          debug_mode: true,
          mock_data: true,
          ai_enabled: true,
          analytics_enabled: false,
          rate_limiting: false,
          maintenance_mode: false
        },
        resources: {
          cpu: '0.5',
          memory: '512Mi',
          storage: '10Gi',
          replicas: 1,
          autoScale: { enabled: false, minReplicas: 1, maxReplicas: 1, targetCPU: 80, targetMemory: 80 }
        },
        secrets: [
          { name: 'SUPABASE_URL', source: 'env', required: true, masked: false },
          { name: 'SUPABASE_ANON_KEY', source: 'env', required: true, masked: true },
          { name: 'OPENAI_API_KEY', source: 'supabase', required: false, masked: true }
        ],
        metrics: { uptime: 99.5, requestsPerMinute: 50, errorRate: 0.5, avgResponseTime: 200, activeUsers: 5 }
      },
      {
        id: 'staging',
        name: 'Staging',
        type: 'staging',
        status: 'active',
        url: 'https://staging.nautione.com',
        apiUrl: 'https://staging-api.nautione.com',
        supabaseUrl: 'https://staging-vnbptmixvwropvanyhdb.supabase.co',
        features: {
          debug_mode: false,
          mock_data: false,
          ai_enabled: true,
          analytics_enabled: true,
          rate_limiting: true,
          maintenance_mode: false
        },
        resources: {
          cpu: '1',
          memory: '1Gi',
          storage: '50Gi',
          replicas: 2,
          autoScale: { enabled: true, minReplicas: 2, maxReplicas: 4, targetCPU: 70, targetMemory: 70 }
        },
        secrets: [
          { name: 'SUPABASE_URL', source: 'env', required: true, masked: false },
          { name: 'SUPABASE_ANON_KEY', source: 'env', required: true, masked: true },
          { name: 'OPENAI_API_KEY', source: 'supabase', required: true, masked: true },
          { name: 'STRIPE_SECRET_KEY', source: 'supabase', required: true, masked: true }
        ],
        metrics: { uptime: 99.9, requestsPerMinute: 200, errorRate: 0.2, avgResponseTime: 150, activeUsers: 25 }
      },
      {
        id: 'prod',
        name: 'Production',
        type: 'production',
        status: 'active',
        url: 'https://nautione.com',
        apiUrl: 'https://api.nautione.com',
        supabaseUrl: 'https://vnbptmixvwropvanyhdb.supabase.co',
        features: {
          debug_mode: false,
          mock_data: false,
          ai_enabled: true,
          analytics_enabled: true,
          rate_limiting: true,
          maintenance_mode: false
        },
        resources: {
          cpu: '2',
          memory: '4Gi',
          storage: '200Gi',
          replicas: 3,
          autoScale: { enabled: true, minReplicas: 3, maxReplicas: 10, targetCPU: 60, targetMemory: 60 }
        },
        secrets: [
          { name: 'SUPABASE_URL', source: 'env', required: true, masked: false },
          { name: 'SUPABASE_ANON_KEY', source: 'env', required: true, masked: true },
          { name: 'OPENAI_API_KEY', source: 'supabase', required: true, masked: true },
          { name: 'STRIPE_SECRET_KEY', source: 'supabase', required: true, masked: true },
          { name: 'SENTRY_DSN', source: 'env', required: true, masked: true }
        ],
        metrics: { uptime: 99.99, requestsPerMinute: 2000, errorRate: 0.05, avgResponseTime: 100, activeUsers: 500 }
      }
    ];

    defaultEnvironments.forEach(e => this.environments.set(e.id, e));
  }

  /**
   * Get environment by ID
   */
  getEnvironment(id: string): Environment | undefined {
    return this.environments.get(id);
  }

  /**
   * List all environments
   */
  listEnvironments(): Environment[] {
    return Array.from(this.environments.values());
  }

  /**
   * Update feature flag
   */
  updateFeatureFlag(envId: string, flag: string, value: boolean | string | number): boolean {
    const env = this.environments.get(envId);
    if (!env) return false;
    env.features[flag] = value;
    return true;
  }

  /**
   * Compare environments
   */
  compareEnvironments(env1Id: string, env2Id: string): EnvironmentDiff | null {
    const env1 = this.environments.get(env1Id);
    const env2 = this.environments.get(env2Id);
    if (!env1 || !env2) return null;

    const differences: EnvironmentDiff['differences'] = [];

    // Compare features
    const allFlags = new Set([...Object.keys(env1.features), ...Object.keys(env2.features)]);
    allFlags.forEach(flag => {
      if (env1.features[flag] !== env2.features[flag]) {
        differences.push({
          category: 'features',
          key: flag,
          value1: env1.features[flag],
          value2: env2.features[flag]
        });
      }
    });

    // Compare resources
    if (env1.resources.replicas !== env2.resources.replicas) {
      differences.push({ category: 'resources', key: 'replicas', value1: env1.resources.replicas, value2: env2.resources.replicas });
    }
    if (env1.resources.cpu !== env2.resources.cpu) {
      differences.push({ category: 'resources', key: 'cpu', value1: env1.resources.cpu, value2: env2.resources.cpu });
    }
    if (env1.resources.memory !== env2.resources.memory) {
      differences.push({ category: 'resources', key: 'memory', value1: env1.resources.memory, value2: env2.resources.memory });
    }

    return { environment1: env1Id, environment2: env2Id, differences };
  }

  /**
   * Promote deployment to next environment
   */
  promoteDeployment(fromEnvId: string, toEnvId: string): { success: boolean; message: string } {
    const fromEnv = this.environments.get(fromEnvId);
    const toEnv = this.environments.get(toEnvId);

    if (!fromEnv || !toEnv) {
      return { success: false, message: 'Environment not found' };
    }

    if (!fromEnv.lastDeployment) {
      return { success: false, message: 'No deployment to promote' };
    }

    const validPromotions: Record<string, string[]> = {
      dev: ['staging'],
      staging: ['prod'],
      prod: []
    };

    if (!validPromotions[fromEnvId]?.includes(toEnvId)) {
      return { success: false, message: `Cannot promote from ${fromEnvId} to ${toEnvId}` };
    }

    toEnv.lastDeployment = {
      ...fromEnv.lastDeployment,
      deployedAt: new Date().toISOString(),
      deployedBy: 'promotion'
    };

    return { success: true, message: `Promoted ${fromEnv.lastDeployment.version} from ${fromEnvId} to ${toEnvId}` };
  }

  /**
   * Set environment status
   */
  setStatus(envId: string, status: Environment['status']): boolean {
    const env = this.environments.get(envId);
    if (!env) return false;
    env.status = status;
    return true;
  }

  /**
   * Get environment variables for build
   */
  getBuildVariables(envId: string): Record<string, string> {
    const env = this.environments.get(envId);
    if (!env) return {};

    return {
      VITE_APP_ENV: env.type,
      VITE_APP_URL: env.url,
      VITE_API_URL: env.apiUrl,
      VITE_SUPABASE_URL: env.supabaseUrl,
      VITE_DEBUG_MODE: String(env.features.debug_mode),
      VITE_ANALYTICS_ENABLED: String(env.features.analytics_enabled)
    };
  }
}

export const multiEnvironmentEngine = new MultiEnvironmentEngine();
