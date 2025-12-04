/**
 * Performance Utilities Index - PATCH 752
 * Central export for all performance utilities
 */

// Connection awareness
export * from './connection-aware';

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
