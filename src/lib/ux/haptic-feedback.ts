/**
 * Haptic Feedback System - PATCH 836
 * Mobile haptic feedback and vibration patterns
 */

type HapticPattern = "light" | "medium" | "heavy" | "success" | "warning" | "error" | "selection" | "notification";

interface HapticConfig {
  enabled: boolean;
  intensity: "low" | "medium" | "high";
}

class HapticFeedbackEngine {
  private config: HapticConfig = {
    enabled: true,
    intensity: "medium",
  };
  private storageKey = "nautilus_haptic_config";
  
  constructor() {
    this.loadConfig();
  }
  
  private loadConfig(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.config = JSON.parse(stored);
      }
    } catch {
      // Use defaults
    }
  }
  
  private saveConfig(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.config));
    } catch {
      // Ignore
    }
  }
  
  /**
   * Check if haptic feedback is supported
   */
  isSupported(): boolean {
    return "vibrate" in navigator;
  }
  
  /**
   * Enable/disable haptic feedback
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.saveConfig();
  }
  
  /**
   * Set haptic intensity
   */
  setIntensity(intensity: HapticConfig["intensity"]): void {
    this.config.intensity = intensity;
    this.saveConfig();
  }
  
  /**
   * Get vibration pattern for feedback type
   */
  private getPattern(type: HapticPattern): number | number[] {
    const intensityMultiplier = {
      low: 0.5,
      medium: 1,
      high: 1.5,
    }[this.config.intensity];
    
    const patterns: Record<HapticPattern, number | number[]> = {
      light: Math.round(10 * intensityMultiplier),
      medium: Math.round(25 * intensityMultiplier),
      heavy: Math.round(50 * intensityMultiplier),
      success: [
        Math.round(15 * intensityMultiplier),
        50,
        Math.round(15 * intensityMultiplier),
      ],
      warning: [
        Math.round(30 * intensityMultiplier),
        100,
        Math.round(30 * intensityMultiplier),
      ],
      error: [
        Math.round(50 * intensityMultiplier),
        100,
        Math.round(50 * intensityMultiplier),
        100,
        Math.round(50 * intensityMultiplier),
      ],
      selection: Math.round(5 * intensityMultiplier),
      notification: [
        Math.round(20 * intensityMultiplier),
        100,
        Math.round(20 * intensityMultiplier),
        100,
        Math.round(40 * intensityMultiplier),
      ],
    };
    
    return patterns[type];
  }
  
  /**
   * Trigger haptic feedback
   */
  trigger(type: HapticPattern = "medium"): void {
    if (!this.config.enabled || !this.isSupported()) {
      return;
    }
    
    try {
      const pattern = this.getPattern(type);
      navigator.vibrate(pattern);
    } catch {
      // Vibration failed, ignore
    }
  }
  
  /**
   * Trigger custom vibration pattern
   */
  triggerCustom(pattern: number | number[]): void {
    if (!this.config.enabled || !this.isSupported()) {
      return;
    }
    
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore
    }
  }
  
  /**
   * Stop any ongoing vibration
   */
  stop(): void {
    if (this.isSupported()) {
      navigator.vibrate(0);
    }
  }
  
  /**
   * Get current config
   */
  getConfig(): HapticConfig {
    return { ...this.config };
  }
}

// Singleton instance
export const hapticFeedback = new HapticFeedbackEngine();

/**
 * React hook for haptic feedback
 */
import { useCallback } from "react";

export function useHapticFeedback() {
  const trigger = useCallback((type: HapticPattern = "medium") => {
    hapticFeedback.trigger(type);
  }, []);
  
  const triggerOnClick = useCallback((
    callback?: () => void,
    type: HapticPattern = "light"
  ) => {
    return () => {
      hapticFeedback.trigger(type);
      callback?.();
    };
  }, []);
  
  const triggerOnSuccess = useCallback(() => {
    hapticFeedback.trigger("success");
  }, []);
  
  const triggerOnError = useCallback(() => {
    hapticFeedback.trigger("error");
  }, []);
  
  const triggerOnWarning = useCallback(() => {
    hapticFeedback.trigger("warning");
  }, []);
  
  return {
    trigger,
    triggerOnClick,
    triggerOnSuccess,
    triggerOnError,
    triggerOnWarning,
    isSupported: hapticFeedback.isSupported(),
    setEnabled: hapticFeedback.setEnabled.bind(hapticFeedback),
    setIntensity: hapticFeedback.setIntensity.bind(hapticFeedback),
    config: hapticFeedback.getConfig(),
  };
}
