/**
 * System Configuration
 * PATCH 833: Centralized system configuration and feature flags
 */

export interface SystemConfig {
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
  };
  features: {
    pwa: boolean;
    offlineMode: boolean;
    pushNotifications: boolean;
    analytics: boolean;
    aiAssistant: boolean;
    realTimeUpdates: boolean;
    darkMode: boolean;
    multiLanguage: boolean;
  };
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    cacheEnabled: boolean;
    cacheTTL: number;
  };
  performance: {
    lazyLoadImages: boolean;
    prefetchEnabled: boolean;
    compressionEnabled: boolean;
    webVitalsEnabled: boolean;
    memoryOptimization: boolean;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    requireMFA: boolean;
  };
  ui: {
    animationsEnabled: boolean;
    reducedMotion: boolean;
    defaultTheme: 'light' | 'dark' | 'system';
    compactMode: boolean;
  };
}

const defaultConfig: SystemConfig = {
  app: {
    name: 'Nautica',
    version: '2.0.0',
    environment: import.meta.env.MODE as SystemConfig['app']['environment'],
  },
  features: {
    pwa: true,
    offlineMode: true,
    pushNotifications: true,
    analytics: true,
    aiAssistant: true,
    realTimeUpdates: true,
    darkMode: true,
    multiLanguage: false,
  },
  api: {
    baseUrl: import.meta.env.VITE_API_URL || '',
    timeout: 30000,
    retryAttempts: 3,
    cacheEnabled: true,
    cacheTTL: 5 * 60 * 1000,
  },
  performance: {
    lazyLoadImages: true,
    prefetchEnabled: true,
    compressionEnabled: true,
    webVitalsEnabled: true,
    memoryOptimization: true,
  },
  security: {
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireMFA: false,
  },
  ui: {
    animationsEnabled: true,
    reducedMotion: false,
    defaultTheme: 'system',
    compactMode: false,
  },
};

class SystemConfigManager {
  private config: SystemConfig;
  private listeners: ((config: SystemConfig) => void)[] = [];

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): SystemConfig {
    try {
      const stored = localStorage.getItem('system_config');
      if (stored) {
        return { ...defaultConfig, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load system config:', error);
    }
    return defaultConfig;
  }

  private saveConfig() {
    try {
      localStorage.setItem('system_config', JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save system config:', error);
    }
  }

  get(): SystemConfig {
    return { ...this.config };
  }

  set<K extends keyof SystemConfig>(
    section: K,
    values: Partial<SystemConfig[K]>
  ) {
    this.config = {
      ...this.config,
      [section]: {
        ...this.config[section],
        ...values,
      },
    };
    this.saveConfig();
    this.notifyListeners();
  }

  isFeatureEnabled(feature: keyof SystemConfig['features']): boolean {
    return this.config.features[feature];
  }

  enableFeature(feature: keyof SystemConfig['features']) {
    this.set('features', { [feature]: true });
  }

  disableFeature(feature: keyof SystemConfig['features']) {
    this.set('features', { [feature]: false });
  }

  subscribe(callback: (config: SystemConfig) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(l => l(this.config));
  }

  reset() {
    this.config = defaultConfig;
    localStorage.removeItem('system_config');
    this.notifyListeners();
  }

  // Adaptive settings based on device/connection
  getAdaptiveConfig(): Partial<SystemConfig> {
    const connection = (navigator as any).connection;
    const memory = (navigator as any).deviceMemory;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const adaptations: Partial<SystemConfig> = {};

    // Slow connection adaptations
    if (connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g') {
      adaptations.performance = {
        ...this.config.performance,
        lazyLoadImages: true,
        prefetchEnabled: false,
        compressionEnabled: true,
      };
      adaptations.ui = {
        ...this.config.ui,
        animationsEnabled: false,
      };
    }

    // Low memory adaptations
    if (memory && memory < 4) {
      adaptations.performance = {
        ...this.config.performance,
        memoryOptimization: true,
        prefetchEnabled: false,
      };
    }

    // Reduced motion preference
    if (prefersReducedMotion) {
      adaptations.ui = {
        ...this.config.ui,
        animationsEnabled: false,
        reducedMotion: true,
      };
    }

    return adaptations;
  }
}

export const systemConfig = new SystemConfigManager();

// React hook
import { useState, useEffect } from 'react';

export function useSystemConfig() {
  const [config, setConfig] = useState<SystemConfig>(systemConfig.get());

  useEffect(() => {
    return systemConfig.subscribe(setConfig);
  }, []);

  return {
    config,
    setConfig: systemConfig.set.bind(systemConfig),
    isFeatureEnabled: systemConfig.isFeatureEnabled.bind(systemConfig),
    enableFeature: systemConfig.enableFeature.bind(systemConfig),
    disableFeature: systemConfig.disableFeature.bind(systemConfig),
    reset: systemConfig.reset.bind(systemConfig),
    getAdaptiveConfig: systemConfig.getAdaptiveConfig.bind(systemConfig),
  };
}
