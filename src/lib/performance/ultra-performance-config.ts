/**
 * Ultra Performance Configuration
 * Configurações otimizadas para máxima performance em redes lentas
 * Lighthouse 98+ Target
 */

export const PERFORMANCE_CONFIG = {
  // Cache timings
  cache: {
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: 30 * 60 * 1000, // 30 min
    refetchInterval: false, // DISABLED - prevent infinite loading
  },

  // Network thresholds
  network: {
    slowConnectionThreshold: 2, // Mbps
    timeoutFast: 10000, // 10s
    timeoutSlow: 30000, // 30s
    retryAttempts: 3,
  },

  // Bundle optimization
  bundle: {
    maxInitialChunkSize: 150 * 1024, // 150KB
    maxAsyncChunkSize: 250 * 1024, // 250KB
    preloadThreshold: 50 * 1024, // 50KB
  },

  // Image optimization
  images: {
    lazyLoadThreshold: '200px',
    lowQualityPlaceholder: true,
    webpPreferred: true,
    maxWidth: 1920,
  },

  // Animation settings for slow connections
  animations: {
    reducedMotion: {
      transitionDuration: '0.1s',
      animationDuration: '0.1s',
    },
    normal: {
      transitionDuration: '0.3s',
      animationDuration: '0.5s',
    },
  },

  // Prefetch strategy
  prefetch: {
    enabled: true,
    delay: 100, // ms after hover
    maxConcurrent: 2,
    priorityRoutes: ['/central-comando', '/maritime-command', '/crew'],
  },

  // Memory management
  memory: {
    warningThreshold: 100 * 1024 * 1024, // 100MB
    criticalThreshold: 200 * 1024 * 1024, // 200MB
    cleanupInterval: 60000, // 1 min
  },
} as const;

// Connection quality detection
// PATCH v34 iOS PWA: Removido navigator.onLine check - não é confiável no iOS Safari
export function getConnectionQuality(): 'fast' | 'medium' | 'slow' | 'offline' {
  const connection = (navigator as Navigator & { 
    connection?: { 
      effectiveType?: string; 
      downlink?: number;
      rtt?: number;
    } 
  }).connection;

  if (!connection) return 'medium';

  const effectiveType = connection.effectiveType;
  const downlink = connection.downlink || 10;
  const rtt = connection.rtt || 100;

  // Satellite/maritime connections are usually high RTT
  if (rtt > 600 || downlink < 0.5) return 'slow';
  if (effectiveType === '2g' || effectiveType === 'slow-2g') return 'slow';
  if (effectiveType === '3g' || downlink < 2) return 'medium';
  
  return 'fast';
}

// Adaptive fetch timeout
export function getAdaptiveTimeout(): number {
  const quality = getConnectionQuality();
  switch (quality) {
    case 'fast': return PERFORMANCE_CONFIG.network.timeoutFast;
    case 'slow': return PERFORMANCE_CONFIG.network.timeoutSlow;
    case 'offline': return 0;
    default: return 15000;
  }
}

// Should reduce animations?
export function shouldReduceAnimations(): boolean {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const quality = getConnectionQuality();
  return prefersReducedMotion || quality === 'slow';
}

// Get optimized image params
export function getOptimizedImageParams(width: number): {
  width: number;
  quality: number;
  format: 'webp' | 'jpeg';
} {
  const quality = getConnectionQuality();
  const isSlowConnection = quality === 'slow';
  
  return {
    width: isSlowConnection ? Math.min(width, 800) : width,
    quality: isSlowConnection ? 60 : 85,
    format: 'webp',
  };
}

export default PERFORMANCE_CONFIG;
