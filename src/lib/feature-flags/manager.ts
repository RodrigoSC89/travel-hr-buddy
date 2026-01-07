/**
 * Feature Flags Manager
 * Core logic for feature flag evaluation and management
 */

import { logger } from "@/lib/logger";
import type {
  FeatureFlag,
  FeatureFlagsConfig,
  FlagListener,
  FlagChangeListener,
  FlagChangeEvent,
  FlagEvaluationContext,
} from "./types";

const STORAGE_KEY = 'nautilus-feature-flags';
const STORAGE_VERSION = 'v1';

export class FeatureFlagsManager {
  private flags: Map<string, FeatureFlag> = new Map();
  private config: FeatureFlagsConfig;
  private userHash: number = 0;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<FlagListener> = new Set();
  private changeListeners: Set<FlagChangeListener> = new Set();
  private initialized = false;

  constructor() {
    this.config = { defaultFlags: {} };
  }

  /**
   * Initialize feature flags system
   */
  init(config: FeatureFlagsConfig): void {
    if (this.initialized) {
      logger.warn('[FeatureFlags] Already initialized, updating config');
    }

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

    // Fetch remote flags if endpoint configured
    if (config.remoteEndpoint) {
      this.fetchRemoteFlags();
      this.startRefreshTimer();
    }

    this.initialized = true;
    logger.info('[FeatureFlags] Initialized', { 
      flagCount: this.flags.size,
      environment: config.environment 
    });
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.listeners.clear();
    this.changeListeners.clear();
    this.initialized = false;
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

  private getStorageKey(): string {
    return `${STORAGE_KEY}-${STORAGE_VERSION}`;
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.getStorageKey());
      if (stored) {
        const { flags, timestamp } = JSON.parse(stored);
        
        // Check if cache is still valid (1 hour)
        const cacheAge = Date.now() - timestamp;
        if (cacheAge < 3600000) {
          Object.entries(flags).forEach(([key, flag]) => {
            this.flags.set(key, flag as FeatureFlag);
          });
          logger.debug('[FeatureFlags] Loaded from cache', { age: cacheAge });
        }
      }
    } catch (e) {
      logger.warn('[FeatureFlags] Failed to load from storage');
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const flags: Record<string, FeatureFlag> = {};
      this.flags.forEach((flag, key) => {
        flags[key] = flag;
      });
      
      localStorage.setItem(this.getStorageKey(), JSON.stringify({
        flags,
        timestamp: Date.now(),
      }));
    } catch (e) {
      logger.warn('[FeatureFlags] Failed to save to storage');
    }
  }

  private async fetchRemoteFlags(): Promise<void> {
    if (!this.config.remoteEndpoint) return;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(this.config.remoteEndpoint, {
        headers: {
          'X-User-Id': this.config.userId || '',
          'X-User-Groups': (this.config.userGroups || []).join(','),
          'X-Environment': this.config.environment || 'production',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const remoteFlags: FeatureFlag[] = await response.json();
        const changedFlags: FlagChangeEvent[] = [];

        remoteFlags.forEach(flag => {
          const previousFlag = this.flags.get(flag.key);
          const previousValue = previousFlag?.enabled ?? false;
          
          this.flags.set(flag.key, flag);

          if (previousValue !== flag.enabled) {
            changedFlags.push({
              key: flag.key,
              previousValue,
              newValue: flag.enabled,
              timestamp: Date.now(),
              source: 'remote',
            });
          }
        });

        this.saveToStorage();
        this.notifyListeners();
        changedFlags.forEach(event => this.notifyChangeListeners(event));

        logger.debug('[FeatureFlags] Remote flags fetched', { 
          count: remoteFlags.length,
          changed: changedFlags.length 
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        logger.warn('[FeatureFlags] Remote fetch timeout');
      } else {
        logger.warn('[FeatureFlags] Failed to fetch remote flags');
      }
    }
  }

  private startRefreshTimer(): void {
    if (this.refreshTimer) return;
    const interval = this.config.refreshInterval || 300000; // 5 minutes
    this.refreshTimer = setInterval(() => this.fetchRemoteFlags(), interval);
  }

  private notifyListeners(): void {
    const currentFlags = this.getAllFlags();
    this.listeners.forEach(listener => {
      try {
        listener(currentFlags);
      } catch (e) {
        logger.error('[FeatureFlags] Listener error');
      }
    });
  }

  private notifyChangeListeners(event: FlagChangeEvent): void {
    this.changeListeners.forEach(listener => {
      try {
        listener(event);
      } catch (e) {
        logger.error('[FeatureFlags] Change listener error');
      }
    });
  }

  /**
   * Check if a feature is enabled
   */
  isEnabled(key: string, context?: FlagEvaluationContext): boolean {
    const flag = this.flags.get(key);
    if (!flag) return this.config.defaultFlags[key] ?? false;

    // Check if globally disabled
    if (!flag.enabled) return false;

    const evalContext = context || {
      userId: this.config.userId,
      userGroups: this.config.userGroups,
    };

    // Check target users
    if (flag.targetUsers?.length && evalContext.userId) {
      if (flag.targetUsers.includes(evalContext.userId)) return true;
    }

    // Check target groups
    if (flag.targetGroups?.length && evalContext.userGroups?.length) {
      const hasGroup = flag.targetGroups.some(g => 
        evalContext.userGroups?.includes(g)
      );
      if (hasGroup) return true;
    }

    // Check rollout percentage
    if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) {
      const hash = evalContext.userId 
        ? this.hashString(evalContext.userId) 
        : this.userHash;
      const bucket = hash % 100;
      return bucket < flag.rolloutPercentage;
    }

    return flag.enabled;
  }

  /**
   * Get all flags as boolean map
   */
  getAllFlags(): Record<string, boolean> {
    const result: Record<string, boolean> = {};
    this.flags.forEach((_, key) => {
      result[key] = this.isEnabled(key);
    });
    return result;
  }

  /**
   * Get flag details
   */
  getFlag(key: string): FeatureFlag | undefined {
    return this.flags.get(key);
  }

  /**
   * Set flag locally (for testing/development)
   */
  setFlag(key: string, enabled: boolean): void {
    const existing = this.flags.get(key);
    const previousValue = existing?.enabled ?? false;

    this.flags.set(key, { ...existing, key, enabled });
    this.saveToStorage();
    this.notifyListeners();

    if (previousValue !== enabled) {
      this.notifyChangeListeners({
        key,
        previousValue,
        newValue: enabled,
        timestamp: Date.now(),
        source: 'local',
      });
    }
  }

  /**
   * Reset flag to default
   */
  resetFlag(key: string): void {
    const defaultValue = this.config.defaultFlags[key] ?? false;
    this.setFlag(key, defaultValue);
  }

  /**
   * Reset all flags to defaults
   */
  resetAllFlags(): void {
    Object.entries(this.config.defaultFlags).forEach(([key, enabled]) => {
      this.flags.set(key, { key, enabled });
    });
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Subscribe to flag changes
   */
  subscribe(listener: FlagListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Subscribe to individual flag changes
   */
  onFlagChange(listener: FlagChangeListener): () => void {
    this.changeListeners.add(listener);
    return () => this.changeListeners.delete(listener);
  }

  /**
   * Set user context
   */
  setUser(userId: string, groups?: string[]): void {
    this.config.userId = userId;
    this.config.userGroups = groups;
    this.userHash = this.hashString(userId);
    
    if (this.config.remoteEndpoint) {
      this.fetchRemoteFlags();
    }
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    this.config.userId = undefined;
    this.config.userGroups = undefined;
    this.userHash = 0;
  }
}
