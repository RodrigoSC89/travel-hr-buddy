/**
 * useFeatureFlags Hook
 * React hook for accessing feature flags with reactivity
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  SystemFeatureFlags, 
  DEFAULT_FEATURE_FLAGS, 
  getFeatureFlags,
  setFeatureOverride,
  clearFeatureOverrides 
} from '@/lib/feature-flags/default-flags';

export function useFeatureFlags() {
  const [flags, setFlags] = useState<SystemFeatureFlags>(getFeatureFlags);
  
  // Refresh flags from storage
  const refreshFlags = useCallback(() => {
    setFlags(getFeatureFlags());
  }, []);
  
  // Listen for storage changes (cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'feature-flag-overrides') {
        refreshFlags();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshFlags]);
  
  // Check if a specific feature is enabled
  const isEnabled = useCallback((flag: keyof SystemFeatureFlags): boolean => {
    return flags[flag];
  }, [flags]);
  
  // Toggle a feature flag
  const toggleFlag = useCallback((flag: keyof SystemFeatureFlags) => {
    const newValue = !flags[flag];
    setFeatureOverride(flag, newValue);
    setFlags(prev => ({ ...prev, [flag]: newValue }));
  }, [flags]);
  
  // Set a specific flag value
  const setFlag = useCallback((flag: keyof SystemFeatureFlags, value: boolean) => {
    setFeatureOverride(flag, value);
    setFlags(prev => ({ ...prev, [flag]: value }));
  }, []);
  
  // Reset all flags to defaults
  const resetToDefaults = useCallback(() => {
    clearFeatureOverrides();
    setFlags(DEFAULT_FEATURE_FLAGS);
  }, []);
  
  return {
    flags,
    isEnabled,
    toggleFlag,
    setFlag,
    resetToDefaults,
    refreshFlags,
  };
}

// Simple hook for checking a single flag
export function useFeatureFlag(flag: keyof SystemFeatureFlags): boolean {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(flag);
}
