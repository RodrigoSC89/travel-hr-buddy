/**
 * Feature Flags System
 * Control feature rollout and A/B testing
 * 
 * Refactored into modular structure:
 * - types.ts: Type definitions
 * - manager.ts: Core logic
 * - hooks.ts: React hooks
 */

import { FeatureFlagsManager } from './manager';
import type { FeatureFlagKey } from './types';

// Export types
export type { 
  FeatureFlag, 
  FeatureFlagsConfig, 
  FlagEvaluationContext,
  FlagChangeEvent,
  FeatureFlagKey,
} from './types';

// Export hooks
export { 
  useFeatureFlag, 
  useAllFeatureFlags,
  useFeatureFlags,
  useFeatureFlagControl,
  useOnFlagChange,
  useFeatureGate,
  useFeatureEnabled,
} from './hooks';

// Singleton instance
export const featureFlags = new FeatureFlagsManager();

/**
 * Default feature flags for the application
 */
export const DEFAULT_FLAGS: Record<FeatureFlagKey, boolean> = {
  'lite-mode': true,
  'offline-sync': true,
  'progressive-upload': true,
  'web-vitals-tracking': true,
  'delta-sync': false,
  'experimental-ui': false,
  'ai-suggestions': true,
  'advanced-analytics': false,
  // V2 Module Flags
  'use-v2-modules': true,
  'external-audit': false,
  'sgp4-tracking': true,
  // New flags
  'webhook-signatures': true,
  'enhanced-security': true,
  'mobile-optimizations': true,
  'voice-commands': false,
  'dark-mode-v2': false,
  'realtime-collaboration': false,
};

/**
 * Initialize feature flags with defaults
 * Call this in your app's entry point
 */
export function initializeFeatureFlags(userId?: string, userGroups?: string[]): void {
  featureFlags.init({
    defaultFlags: DEFAULT_FLAGS,
    userId,
    userGroups,
    environment: import.meta.env.MODE as 'development' | 'production',
    refreshInterval: 300000, // 5 minutes
  });
}

/**
 * Feature flag utilities
 */
export const FeatureFlagUtils = {
  /**
   * Check if running in development mode
   */
  isDevelopment: () => import.meta.env.DEV,
  
  /**
   * Check if all experimental features are enabled
   */
  isExperimentalMode: () => featureFlags.isEnabled('experimental-ui'),
  
  /**
   * Check if lite mode is active (for low-bandwidth)
   */
  isLiteMode: () => featureFlags.isEnabled('lite-mode'),
  
  /**
   * Check if offline features are enabled
   */
  isOfflineEnabled: () => featureFlags.isEnabled('offline-sync'),
  
  /**
   * Check if AI features are enabled
   */
  isAIEnabled: () => featureFlags.isEnabled('ai-suggestions'),
};
