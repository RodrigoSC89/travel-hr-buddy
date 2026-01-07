/**
 * Feature Flags Type Definitions
 * Centralized types for feature flag system
 */

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  rolloutPercentage?: number;
  targetUsers?: string[];
  targetGroups?: string[];
  metadata?: Record<string, unknown>;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FeatureFlagsConfig {
  defaultFlags: Record<string, boolean>;
  remoteEndpoint?: string;
  refreshInterval?: number;
  userId?: string;
  userGroups?: string[];
  environment?: 'development' | 'staging' | 'production';
}

export interface FlagEvaluationContext {
  userId?: string;
  userGroups?: string[];
  userAttributes?: Record<string, string | number | boolean>;
  environment?: string;
}

export interface FlagChangeEvent {
  key: string;
  previousValue: boolean;
  newValue: boolean;
  timestamp: number;
  source: 'remote' | 'local' | 'override';
}

export type FlagListener = (flags: Record<string, boolean>) => void;
export type FlagChangeListener = (event: FlagChangeEvent) => void;

/**
 * All available feature flags in the system
 */
export type FeatureFlagKey =
  | 'lite-mode'
  | 'offline-sync'
  | 'progressive-upload'
  | 'web-vitals-tracking'
  | 'delta-sync'
  | 'experimental-ui'
  | 'ai-suggestions'
  | 'advanced-analytics'
  | 'use-v2-modules'
  | 'external-audit'
  | 'sgp4-tracking'
  | 'webhook-signatures'
  | 'enhanced-security'
  | 'mobile-optimizations'
  | 'voice-commands'
  | 'dark-mode-v2'
  | 'realtime-collaboration';
