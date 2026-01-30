/**
 * Feature Flags React Hooks
 * Hooks for consuming feature flags in React components
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { featureFlags } from './index';
import type { FeatureFlagKey, FlagChangeEvent } from './types';

/**
 * Hook to check if a single feature is enabled
 */
export function useFeatureFlag(key: FeatureFlagKey | string): boolean {
  const [enabled, setEnabled] = useState(() => featureFlags.isEnabled(key));

  useEffect(() => {
    // Initial sync
    setEnabled(featureFlags.isEnabled(key));
    
    // Subscribe to changes
    const unsubscribe = featureFlags.subscribe((flags) => {
      setEnabled(flags[key] ?? false);
    });

    return unsubscribe;
  }, [key]);

  return enabled;
}

/**
 * Hook to get all feature flags
 */
export function useAllFeatureFlags(): Record<string, boolean> {
  const [flags, setFlags] = useState(() => featureFlags.getAllFlags());

  useEffect(() => {
    const unsubscribe = featureFlags.subscribe(setFlags);
    return unsubscribe;
  }, []);

  return flags;
}

/**
 * Hook to check multiple features at once
 */
export function useFeatureFlags<T extends readonly string[]>(
  keys: T
): Record<T[number], boolean> {
  const allFlags = useAllFeatureFlags();
  
  return useMemo(() => {
    const result: Record<string, boolean> = {};
    keys.forEach(key => {
      result[key] = allFlags[key] ?? false;
    });
    return result as Record<T[number], boolean>;
  }, [keys, allFlags]);
}

/**
 * Hook to control a feature flag (read + write)
 */
export function useFeatureFlagControl(key: FeatureFlagKey | string): {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  reset: () => void;
} {
  const enabled = useFeatureFlag(key);

  const setEnabled = useCallback((value: boolean) => {
    featureFlags.setFlag(key, value);
  }, [key]);

  const reset = useCallback(() => {
    featureFlags.resetFlag(key);
  }, [key]);

  return { enabled, setEnabled, reset };
}

/**
 * Hook to listen for flag changes
 */
export function useOnFlagChange(
  callback: (event: FlagChangeEvent) => void
): void {
  useEffect(() => {
    const unsubscribe = featureFlags.onFlagChange(callback);
    return unsubscribe;
  }, [callback]);
}

/**
 * Hook for feature gating with fallback
 */
export function useFeatureGate<T>(
  key: FeatureFlagKey | string,
  enabledValue: T,
  disabledValue: T
): T {
  const enabled = useFeatureFlag(key);
  return enabled ? enabledValue : disabledValue;
}

/**
 * Hook for conditional rendering based on feature flag
 */
export function useFeatureEnabled(key: FeatureFlagKey | string): {
  enabled: boolean;
  loading: boolean;
} {
  // PATCH v44: Iniciar com loading=false para NUNCA bloquear renderização
  const [loading, setLoading] = useState(false);
  const enabled = useFeatureFlag(key);

  // Não precisa de delay - retorna imediatamente
  return { enabled, loading };

  return { enabled, loading };
}
