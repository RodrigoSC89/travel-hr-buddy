/**
 * Performance Utilities Index - PATCH 752.1
 * Central export for all performance utilities
 */

/**
 * Configurações padrão de performance
 */
export const PERFORMANCE_CONFIG = {
  // Cache
  DEFAULT_CACHE_TTL: 30 * 60 * 1000, // 30 minutos
  MAX_CACHE_SIZE: 50, // máximo de itens em cache
  
  // Conexão
  SLOW_CONNECTION_THRESHOLD: 100, // rtt em ms
  MODERATE_CONNECTION_THRESHOLD: 200,
  
  // Animações
  ANIMATION_DURATION_FAST: 150,
  ANIMATION_DURATION_NORMAL: 300,
  ANIMATION_DURATION_SLOW: 500,
  
  // Debounce
  DEBOUNCE_FAST: 150,
  DEBOUNCE_NORMAL: 300,
  DEBOUNCE_SLOW: 500,
  
  // Imagens
  IMAGE_QUALITY_HIGH: 90,
  IMAGE_QUALITY_MEDIUM: 70,
  IMAGE_QUALITY_LOW: 50,
} as const;

// Connection awareness
export * from './connection-aware';
export { connectionAdaptive, type ConnectionQuality, useConnectionQuality } from './connection-adaptive';

// Request deduplication and optimization
export { 
  requestDeduplicator, 
  RequestBatcher, 
  fetchWithRetry 
} from './request-deduplication';

// Offline support
export { offlineQueue, fetchWithOfflineSupport } from './offline-queue';

// Image optimization
export { imagePreloader, preloadVisibleImages, preloadRouteImages } from './image-preloader';

// Resource hints
export { resourceHints } from './resource-hints';

// Data compression
export { 
  compressString, 
  decompressString, 
  compressJSON, 
  decompressJSON,
  shouldCompress 
} from './compression';

// Existing utilities
export { offlineManager, cachedFetch } from './offline-manager';
export { 
  checkFormatSupport,
  getBestFormat,
  generateSrcSet,
  generateSizes,
  getOptimizedImageUrl,
  createPlaceholder,
  createBlurPlaceholder,
  getAdaptiveQuality,
  preloadImages,
  calculateOptimalDimensions,
  loadImage,
  isImageInViewport
} from './image-optimizer';
export { pollingManager } from './polling-manager';
export { lazyWithPreload, preloadStrategy, moduleCache } from './lazy-with-preload';
export { createOptimizedQueryClient } from './query-config';

// PATCH 800: Enhanced lazy loading
export { 
  createLazyComponent, 
  LazyWrapper, 
  preloadComponent,
  useInViewport 
} from './lazy-loader';

// PATCH 800: Data compression utilities
export {
  compressObject as compressObjectSimple,
  selectFields,
  paginateData,
  estimateSize,
  logDataTransfer,
  chunkArray,
  createRequestDeduplicator,
} from './data-compression';
