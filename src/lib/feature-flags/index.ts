/**
 * Feature Flags System
 * Control feature rollout and A/B testing
 */

interface FeatureFlag {
  key: string;
  enabled: boolean;
  rolloutPercentage?: number;
  targetUsers?: string[];
  targetGroups?: string[];
  metadata?: Record<string, any>;
}

interface FeatureFlagsConfig {
  defaultFlags: Record<string, boolean>;
  remoteEndpoint?: string;
  refreshInterval?: number;
  userId?: string;
  userGroups?: string[];
}

class FeatureFlagsManager {
  private flags: Map<string, FeatureFlag> = new Map();
  private config: FeatureFlagsConfig;
  private userHash: number = 0;
  private refreshTimer: NodeJS.Timeout | null = null;
  private listeners: Set<(flags: Record<string, boolean>) => void> = new Set();

  constructor() {
    this.config = {
      defaultFlags: {},
    };
  }

  /**
   * Initialize feature flags
   */
  init(config: FeatureFlagsConfig) {
    this.config = config;

    // Set default flags
    Object.entries(config.defaultFlags).forEach(([key, enabled]) => {
      this.flags.set(key, { key, enabled });
    });

    // Calculate user hash for consistent rollout
    if (config.userId) {
      this.userHash = this.hashString(config.userId);
    }

    // Load from localStorage
    this.loadFromStorage();

    // Fetch remote flags
    if (config.remoteEndpoint) {
      this.fetchRemoteFlags();
      this.startRefreshTimer();
    }
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem("feature-flags");
      if (stored) {
        const flags = JSON.parse(stored);
        Object.entries(flags).forEach(([key, flag]) => {
          this.flags.set(key, flag as FeatureFlag);
        });
      }
    } catch (e) {
      // Ignore storage errors
    }
  }

  private saveToStorage() {
    try {
      const flags: Record<string, FeatureFlag> = {};
      this.flags.forEach((flag, key) => {
        flags[key] = flag;
      });
      localStorage.setItem("feature-flags", JSON.stringify(flags));
    } catch (e) {
      // Ignore storage errors
    }
  }

  private async fetchRemoteFlags() {
    if (!this.config.remoteEndpoint) return;

    try {
      const response = await fetch(this.config.remoteEndpoint, {
        headers: {
          "X-User-Id": this.config.userId || "",
          "X-User-Groups": (this.config.userGroups || []).join(","),
        },
      });

      if (response.ok) {
        const flags: FeatureFlag[] = await response.json();
        flags.forEach(flag => {
          this.flags.set(flag.key, flag);
        });
        this.saveToStorage();
        this.notifyListeners();
      }
    } catch (error) {
      console.warn("[FeatureFlags] Failed to fetch remote flags:", error);
    }
  }

  private startRefreshTimer() {
    if (this.refreshTimer) return;
    const interval = this.config.refreshInterval || 300000; // 5 minutes
    this.refreshTimer = setInterval(() => this.fetchRemoteFlags(), interval);
  }

  private notifyListeners() {
    const currentFlags = this.getAllFlags();
    this.listeners.forEach(listener => listener(currentFlags));
  }

  /**
   * Check if a feature is enabled
   */
  isEnabled(key: string): boolean {
    const flag = this.flags.get(key);
    if (!flag) return this.config.defaultFlags[key] ?? false;

    // Check if disabled
    if (!flag.enabled) return false;

    // Check target users
    if (flag.targetUsers?.length && this.config.userId) {
      if (flag.targetUsers.includes(this.config.userId)) return true;
    }

    // Check target groups
    if (flag.targetGroups?.length && this.config.userGroups?.length) {
      const hasGroup = flag.targetGroups.some(g => this.config.userGroups?.includes(g));
      if (hasGroup) return true;
    }

    // Check rollout percentage
    if (flag.rolloutPercentage !== undefined) {
      const bucket = this.userHash % 100;
      return bucket < flag.rolloutPercentage;
    }

    return flag.enabled;
  }

  /**
   * Get all flags as simple boolean map
   */
  getAllFlags(): Record<string, boolean> {
    const result: Record<string, boolean> = {};
    this.flags.forEach((_, key) => {
      result[key] = this.isEnabled(key);
    });
    return result;
  }

  /**
   * Set flag locally (for testing/development)
   */
  setFlag(key: string, enabled: boolean) {
    const existing = this.flags.get(key);
    this.flags.set(key, { ...existing, key, enabled });
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Subscribe to flag changes
   */
  subscribe(listener: (flags: Record<string, boolean>) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Set user context
   */
  setUser(userId: string, groups?: string[]) {
    this.config.userId = userId;
    this.config.userGroups = groups;
    this.userHash = this.hashString(userId);
    this.fetchRemoteFlags();
  }
}

export const featureFlags = new FeatureFlagsManager();

/**
 * React hook for feature flags
 */
import { useState, useEffect } from "react";

export function useFeatureFlag(key: string): boolean {
  const [enabled, setEnabled] = useState(() => featureFlags.isEnabled(key));

  useEffect(() => {
    const unsubscribe = featureFlags.subscribe((flags) => {
      setEnabled(flags[key] ?? false);
    });
    return unsubscribe;
  }, [key]);

  return enabled;
}

export function useAllFeatureFlags(): Record<string, boolean> {
  const [flags, setFlags] = useState(() => featureFlags.getAllFlags());

  useEffect(() => {
    const unsubscribe = featureFlags.subscribe(setFlags);
    return unsubscribe;
  }, []);

  return flags;
}

/**
 * Default feature flags for the application
 */
export const DEFAULT_FLAGS: Record<string, boolean> = {
  "lite-mode": true,
  "offline-sync": true,
  "progressive-upload": true,
  "web-vitals-tracking": true,
  "delta-sync": false,
  "experimental-ui": false,
  "ai-suggestions": true,
  "advanced-analytics": false,
};
