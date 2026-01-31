/**
 * Default Feature Flags Configuration
 * Centralized feature toggles for the entire system
 */

export interface SystemFeatureFlags {
  // Module visibility
  UNDERWATER_ENABLED: boolean;
  VRAR_ENABLED: boolean;
  AI_AUTONOMY_ENABLED: boolean;
  BETA_MODULES_ENABLED: boolean;
  
  // Feature toggles
  OFFLINE_SYNC_ENABLED: boolean;
  VOICE_COMMANDS_ENABLED: boolean;
  DARK_MODE_V2: boolean;
  REALTIME_COLLABORATION: boolean;
  ADVANCED_ANALYTICS: boolean;
  
  // AI Features
  AI_SUGGESTIONS: boolean;
  AI_CONSENSUS: boolean;
  AI_AUTO_APPROVE: boolean;
  
  // Security
  ENHANCED_SECURITY: boolean;
  WEBHOOK_SIGNATURES: boolean;
  MFA_REQUIRED: boolean;
}

export const DEFAULT_FEATURE_FLAGS: SystemFeatureFlags = {
  // Module visibility - Underwater is OFF as per requirements
  UNDERWATER_ENABLED: false,
  VRAR_ENABLED: true,
  AI_AUTONOMY_ENABLED: true,
  BETA_MODULES_ENABLED: false,
  
  // Feature toggles
  OFFLINE_SYNC_ENABLED: true,
  VOICE_COMMANDS_ENABLED: true,
  DARK_MODE_V2: true,
  REALTIME_COLLABORATION: true,
  ADVANCED_ANALYTICS: true,
  
  // AI Features
  AI_SUGGESTIONS: true,
  AI_CONSENSUS: true,
  AI_AUTO_APPROVE: false, // Requires human approval by default
  
  // Security
  ENHANCED_SECURITY: true,
  WEBHOOK_SIGNATURES: true,
  MFA_REQUIRED: false,
};

// Helper to check if a feature is enabled
export function isFeatureEnabled(flag: keyof SystemFeatureFlags): boolean {
  // Check localStorage for overrides first
  const overrides = localStorage.getItem('feature-flag-overrides');
  if (overrides) {
    try {
      const parsed = JSON.parse(overrides);
      if (flag in parsed) {
        return parsed[flag];
      }
    } catch {
      // Ignore parse errors
    }
  }
  
  return DEFAULT_FEATURE_FLAGS[flag];
}

// Helper to set a feature flag override (for admin/dev use)
export function setFeatureOverride(flag: keyof SystemFeatureFlags, value: boolean): void {
  const overrides = localStorage.getItem('feature-flag-overrides');
  let parsed: Record<string, boolean> = {};
  
  if (overrides) {
    try {
      parsed = JSON.parse(overrides);
    } catch {
      // Start fresh
    }
  }
  
  parsed[flag] = value;
  localStorage.setItem('feature-flag-overrides', JSON.stringify(parsed));
}

// Helper to clear all overrides
export function clearFeatureOverrides(): void {
  localStorage.removeItem('feature-flag-overrides');
}

// Hook-like getter for multiple flags
export function getFeatureFlags(): SystemFeatureFlags {
  const flags = { ...DEFAULT_FEATURE_FLAGS };
  
  const overrides = localStorage.getItem('feature-flag-overrides');
  if (overrides) {
    try {
      const parsed = JSON.parse(overrides);
      Object.keys(parsed).forEach(key => {
        if (key in flags) {
          (flags as Record<string, boolean>)[key] = parsed[key];
        }
      });
    } catch {
      // Ignore
    }
  }
  
  return flags;
}
