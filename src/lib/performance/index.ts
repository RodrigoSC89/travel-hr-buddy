/**
 * Performance Utilities Index - PATCH 750
 * Central export for all performance utilities
 */

// Connection awareness
export * from './connection-aware';

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
