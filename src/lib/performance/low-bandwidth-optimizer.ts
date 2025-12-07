/**
 * Low Bandwidth Optimizer
 * PATCH 834: Aggressive optimizations for 2 Mbps networks
 * PATCH 1000: Fixed React import order to prevent useState null error
 */

import { useState, useEffect, useMemo } from 'react';

interface BandwidthConfig {
  maxImageSize: number;
  imageQuality: number;
  enablePrefetch: boolean;
  batchSize: number;
  requestTimeout: number;
  enableAnimations: boolean;
  compressionLevel: 'none' | 'low' | 'high';
  lazyLoadThreshold: string;
}

const BANDWIDTH_CONFIGS: Record<string, BandwidthConfig> = {
  '4g': {
    maxImageSize: 500000, // 500KB
    imageQuality: 85,
    enablePrefetch: true,
    batchSize: 20,
    requestTimeout: 30000,
    enableAnimations: true,
    compressionLevel: 'low',
    lazyLoadThreshold: '200px',
  },
  '3g': {
    maxImageSize: 150000, // 150KB
    imageQuality: 70,
    enablePrefetch: false,
    batchSize: 10,
    requestTimeout: 45000,
    enableAnimations: false,
    compressionLevel: 'high',
    lazyLoadThreshold: '100px',
  },
  '2g': {
    maxImageSize: 50000, // 50KB
    imageQuality: 50,
    enablePrefetch: false,
    batchSize: 5,
    requestTimeout: 60000,
    enableAnimations: false,
    compressionLevel: 'high',
    lazyLoadThreshold: '50px',
  },
  'slow-2g': {
    maxImageSize: 20000, // 20KB
    imageQuality: 30,
    enablePrefetch: false,
    batchSize: 3,
    requestTimeout: 90000,
    enableAnimations: false,
    compressionLevel: 'high',
    lazyLoadThreshold: '0px',
  },
  offline: {
    maxImageSize: 0,
    imageQuality: 0,
    enablePrefetch: false,
    batchSize: 1,
    requestTimeout: 0,
    enableAnimations: false,
    compressionLevel: 'high',
    lazyLoadThreshold: '0px',
  },
};

class LowBandwidthOptimizer {
  private config: BandwidthConfig = BANDWIDTH_CONFIGS['4g'];
  private connectionType: string = '4g';
  private listeners: Set<(config: BandwidthConfig) => void> = new Set();
  private isInitialized = false;

  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    this.detectConnection();
    this.setupConnectionListener();
    this.applyOptimizations();
  }

  private detectConnection() {
    const connection = (navigator as any).connection;
    
    if (connection) {
      this.connectionType = connection.effectiveType || '4g';
      
      // Also check downlink speed
      if (connection.downlink) {
        if (connection.downlink < 0.5) {
          this.connectionType = 'slow-2g';
        } else if (connection.downlink < 2) {
          this.connectionType = '2g';
        } else if (connection.downlink < 5) {
          this.connectionType = '3g';
        }
      }
    }

    if (!navigator.onLine) {
      this.connectionType = 'offline';
    }

    this.config = BANDWIDTH_CONFIGS[this.connectionType] || BANDWIDTH_CONFIGS['4g'];
    this.notifyListeners();
  }

  private setupConnectionListener() {
    const connection = (navigator as any).connection;
    
    if (connection) {
      connection.addEventListener('change', () => {
        this.detectConnection();
        this.applyOptimizations();
      });
    }

    window.addEventListener('online', () => {
      this.detectConnection();
      this.applyOptimizations();
    });

    window.addEventListener('offline', () => {
      this.connectionType = 'offline';
      this.config = BANDWIDTH_CONFIGS['offline'];
      this.notifyListeners();
    });
  }

  private applyOptimizations() {
    // Disable animations for slow connections
    if (!this.config.enableAnimations) {
      document.documentElement.style.setProperty('--animation-duration', '0s');
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.style.removeProperty('--animation-duration');
      document.documentElement.classList.remove('reduce-motion');
    }

    // Set lazy load threshold
    document.documentElement.style.setProperty(
      '--lazy-load-threshold',
      this.config.lazyLoadThreshold
    );

    // Add low bandwidth class for CSS optimizations
    if (this.connectionType === '2g' || this.connectionType === 'slow-2g') {
      document.documentElement.classList.add('low-bandwidth');
    } else {
      document.documentElement.classList.remove('low-bandwidth');
    }
  }

  getConfig(): BandwidthConfig {
    return { ...this.config };
  }

  getConnectionType(): string {
    return this.connectionType;
  }

  isLowBandwidth(): boolean {
    return ['2g', 'slow-2g', 'offline'].includes(this.connectionType);
  }

  shouldLoadImage(size: number): boolean {
    return size <= this.config.maxImageSize || this.config.maxImageSize === 0;
  }

  getImageQuality(): number {
    return this.config.imageQuality;
  }

  shouldPrefetch(): boolean {
    return this.config.enablePrefetch;
  }

  getBatchSize(): number {
    return this.config.batchSize;
  }

  getTimeout(): number {
    return this.config.requestTimeout;
  }

  subscribe(callback: (config: BandwidthConfig) => void): () => void {
    this.listeners.add(callback);
    callback(this.config);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    this.listeners.forEach(cb => cb(this.config));
  }

  // Generate optimized image URL
  getOptimizedImageUrl(
    url: string,
    width?: number,
    format: 'webp' | 'jpeg' | 'auto' = 'auto'
  ): string {
    if (!url) return url;

    // If it's a Supabase storage URL, add transformation params
    if (url.includes('supabase.co/storage')) {
      const params = new URLSearchParams();
      if (width) params.set('width', String(Math.min(width, 800)));
      params.set('quality', String(this.config.imageQuality));
      if (format !== 'auto') params.set('format', format);
      
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}${params.toString()}`;
    }

    return url;
  }

  // Optimize fetch options for current bandwidth
  getOptimizedFetchOptions(options: RequestInit = {}): RequestInit {
    return {
      ...options,
      signal: AbortSignal.timeout(this.config.requestTimeout),
      headers: {
        ...options.headers,
        'Accept-Encoding': 'gzip, deflate, br',
      },
    };
  }
}

export const bandwidthOptimizer = new LowBandwidthOptimizer();

// React hook - imports moved to top of file (PATCH 1000)
export function useBandwidthOptimizer() {
  const [config, setConfig] = useState<BandwidthConfig>(bandwidthOptimizer.getConfig());
  const [connectionType, setConnectionType] = useState(bandwidthOptimizer.getConnectionType());

  useEffect(() => {
    bandwidthOptimizer.init();
    
    const unsubscribe = bandwidthOptimizer.subscribe((newConfig) => {
      setConfig(newConfig);
      setConnectionType(bandwidthOptimizer.getConnectionType());
    });

    return unsubscribe;
  }, []);

  const optimizations = useMemo(() => ({
    isLowBandwidth: bandwidthOptimizer.isLowBandwidth(),
    shouldLoadImages: config.maxImageSize > 0,
    shouldAnimate: config.enableAnimations,
    shouldPrefetch: config.enablePrefetch,
    imageQuality: config.imageQuality,
    batchSize: config.batchSize,
    timeout: config.requestTimeout,
  }), [config]);

  return {
    config,
    connectionType,
    ...optimizations,
    getOptimizedImageUrl: bandwidthOptimizer.getOptimizedImageUrl.bind(bandwidthOptimizer),
    getOptimizedFetchOptions: bandwidthOptimizer.getOptimizedFetchOptions.bind(bandwidthOptimizer),
  };
}
