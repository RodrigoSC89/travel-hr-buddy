/**
 * Ultra Light Mode
 * Extreme optimizations for 2 Mbps and slower networks
 * Provides instant loading experience on slow connections
 */

import { Logger } from "@/lib/utils/logger";

interface UltraLightConfig {
  enabled: boolean;
  disableImages: boolean;
  disableAnimations: boolean;
  disableShadows: boolean;
  disableGradients: boolean;
  usePlaceholders: boolean;
  maxConcurrentRequests: number;
  requestDelay: number;
  criticalOnly: boolean;
}

const DEFAULT_CONFIG: UltraLightConfig = {
  enabled: false,
  disableImages: false,
  disableAnimations: false,
  disableShadows: false,
  disableGradients: false,
  usePlaceholders: false,
  maxConcurrentRequests: 6,
  requestDelay: 0,
  criticalOnly: false,
};

const ULTRA_LIGHT_CONFIG: UltraLightConfig = {
  enabled: true,
  disableImages: true,
  disableAnimations: true,
  disableShadows: true,
  disableGradients: true,
  usePlaceholders: true,
  maxConcurrentRequests: 2,
  requestDelay: 100,
  criticalOnly: true,
};

const LIGHT_CONFIG: UltraLightConfig = {
  enabled: true,
  disableImages: false,
  disableAnimations: true,
  disableShadows: true,
  disableGradients: false,
  usePlaceholders: true,
  maxConcurrentRequests: 3,
  requestDelay: 50,
  criticalOnly: false,
};

class UltraLightMode {
  private config: UltraLightConfig = DEFAULT_CONFIG;
  private isInitialized = false;
  private styleElement: HTMLStyleElement | null = null;

  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    this.detectAndApply();
    this.setupListeners();
  }

  private detectAndApply() {
    const connection = (navigator as any).connection;
    
    // Check for slow connection
    if (connection) {
      const effectiveType = connection.effectiveType;
      const downlink = connection.downlink || 10;
      const rtt = connection.rtt || 0;
      
      // Ultra light for very slow connections
      if (effectiveType === 'slow-2g' || downlink < 0.5 || rtt > 1000) {
        this.enable('ultra');
      } 
      // Light mode for 2g/3g
      else if (effectiveType === '2g' || downlink < 2 || rtt > 400) {
        this.enable('light');
      }
      // Default for fast connections
      else {
        this.disable();
      }
    }
    
    // Check for save-data header preference
    if (connection?.saveData) {
      this.enable('ultra');
    }
    
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.config.disableAnimations = true;
      this.applyStyles();
    }
  }

  private setupListeners() {
    const connection = (navigator as any).connection;
    
    if (connection) {
      connection.addEventListener('change', () => this.detectAndApply());
    }

    // Listen for user preference changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.config.disableAnimations = e.matches;
      this.applyStyles();
    });
  }

  enable(mode: 'light' | 'ultra' = 'light') {
    this.config = mode === 'ultra' ? { ...ULTRA_LIGHT_CONFIG } : { ...LIGHT_CONFIG };
    this.applyStyles();
    Logger.info(`Ultra Light Mode enabled: ${mode}`, undefined, "UltraLightMode");
  }

  disable() {
    this.config = { ...DEFAULT_CONFIG };
    this.removeStyles();
    Logger.info("Ultra Light Mode disabled", undefined, "UltraLightMode");
  }

  private applyStyles() {
    if (!this.styleElement) {
      this.styleElement = document.createElement('style');
      this.styleElement.id = 'ultra-light-mode';
      document.head.appendChild(this.styleElement);
    }

    const styles: string[] = [];

    if (this.config.disableAnimations) {
      styles.push(`
        *, *::before, *::after {
          animation-duration: 0.001ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.001ms !important;
          scroll-behavior: auto !important;
        }
      `);
    }

    if (this.config.disableShadows) {
      styles.push(`
        * {
          box-shadow: none !important;
          text-shadow: none !important;
        }
      `);
    }

    if (this.config.disableGradients) {
      styles.push(`
        [class*="gradient"] {
          background: var(--background) !important;
        }
      `);
    }

    if (this.config.disableImages) {
      styles.push(`
        img:not([data-critical="true"]) {
          visibility: hidden !important;
          height: 40px !important;
        }
        .bg-cover, .bg-contain, [style*="background-image"] {
          background-image: none !important;
          background-color: var(--muted) !important;
        }
      `);
    }

    if (this.config.usePlaceholders) {
      styles.push(`
        .lazy-placeholder {
          background: linear-gradient(90deg, var(--muted) 25%, var(--muted-foreground/10) 50%, var(--muted) 75%);
          background-size: 200% 100%;
        }
      `);
    }

    // Add bandwidth indicator class
    document.documentElement.classList.toggle('ultra-light-mode', this.config.enabled);
    document.documentElement.classList.toggle('low-bandwidth', this.config.enabled);

    this.styleElement.textContent = styles.join('\n');
  }

  private removeStyles() {
    if (this.styleElement) {
      this.styleElement.textContent = '';
    }
    document.documentElement.classList.remove('ultra-light-mode', 'low-bandwidth');
  }

  getConfig(): UltraLightConfig {
    return { ...this.config };
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  shouldLoadImage(): boolean {
    return !this.config.disableImages;
  }

  getMaxConcurrentRequests(): number {
    return this.config.maxConcurrentRequests;
  }

  getRequestDelay(): number {
    return this.config.requestDelay;
  }

  isCriticalOnly(): boolean {
    return this.config.criticalOnly;
  }
}

export const ultraLightMode = new UltraLightMode();

// React hook
import { useState, useEffect } from 'react';

export function useUltraLightMode() {
  const [config, setConfig] = useState<UltraLightConfig>(ultraLightMode.getConfig());

  useEffect(() => {
    ultraLightMode.init();
    
    // Poll for config changes (simple approach)
    const interval = setInterval(() => {
      const newConfig = ultraLightMode.getConfig();
      if (JSON.stringify(newConfig) !== JSON.stringify(config)) {
        setConfig(newConfig);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [config]);

  return {
    ...config,
    isUltraLight: config.enabled && config.criticalOnly,
    shouldShowImages: !config.disableImages,
    shouldAnimate: !config.disableAnimations,
  };
}
