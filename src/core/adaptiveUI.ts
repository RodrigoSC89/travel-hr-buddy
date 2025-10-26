/**
 * PATCH 222 – Adaptive UI Reconfiguration Engine
 * 
 * Adapts UI based on device type, network conditions, operation type, and priority.
 * Automatically reconfigures interface for optimal performance in various contexts.
 * 
 * @module AdaptiveUI
 * @version 1.0.0
 */

import { Logger } from "@/lib/utils/logger";

const logger = new Logger("AdaptiveUI");

// Device types
export type DeviceType = "mobile" | "tablet" | "desktop" | "console" | "unknown";

// Mission types
export type MissionType = "tactical" | "strategic" | "maintenance" | "emergency" | "training";

// Network quality levels
export type NetworkQuality = "excellent" | "good" | "fair" | "poor" | "offline";

// UI mode configurations
export type UIMode = "full" | "reduced" | "minimal" | "offline";

// Component weight
export type ComponentWeight = "light" | "medium" | "heavy";

// Network status
export interface NetworkStatus {
  quality: NetworkQuality;
  latency: number; // ms
  bandwidth: number; // Mbps
  online: boolean;
  effectiveType: string;
}

// Device info
export interface DeviceInfo {
  type: DeviceType;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  memory?: number; // GB
  cores?: number;
  isMobile: boolean;
  isTablet: boolean;
}

// Operational context
export interface OperationalContext {
  missionType: MissionType;
  priority: "low" | "medium" | "high" | "critical";
  resourceConstraints: {
    battery?: number; // percentage
    memory: number; // MB available
    storage: number; // MB available
  };
}

// UI Configuration
export interface UIConfiguration {
  mode: UIMode;
  componentWeights: Map<string, ComponentWeight>;
  featuresEnabled: Set<string>;
  performanceMode: boolean;
  offlineMode: boolean;
}

// Adaptive decision
export interface AdaptiveDecision {
  timestamp: string;
  context: {
    device: DeviceInfo;
    network: NetworkStatus;
    operation: OperationalContext;
  };
  configuration: UIConfiguration;
  reason: string;
}

/**
 * AdaptiveUIEngine - Manages UI adaptation based on context
 */
export class AdaptiveUIEngine {
  private currentConfig: UIConfiguration;
  private decisionHistory: AdaptiveDecision[] = [];
  private maxHistorySize = 100;
  private networkObserver?: NetworkInformation;

  constructor() {
    this.currentConfig = this.getDefaultConfig();
    this.initializeObservers();
  }

  /**
   * Initialize observers for network and device changes
   */
  private initializeObservers(): void {
    // Network change observer
    if ('connection' in navigator) {
      this.networkObserver = (navigator as any).connection;
      this.networkObserver?.addEventListener('change', () => {
        logger.info('Network status changed, reconfiguring UI');
        this.reconfigure();
      });
    }

    // Window resize observer
    window.addEventListener('resize', () => {
      const newDevice = this.detectDevice();
      if (newDevice.type !== this.getCurrentDeviceType()) {
        logger.info('Device type changed, reconfiguring UI');
        this.reconfigure();
      }
    });
  }

  /**
   * Detect current device type and capabilities
   */
  detectDevice(): DeviceInfo {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = window.devicePixelRatio || 1;

    let type: DeviceType = "desktop";
    let isMobile = false;
    let isTablet = false;

    // Device detection logic
    if (width < 768) {
      type = "mobile";
      isMobile = true;
    } else if (width >= 768 && width < 1024) {
      type = "tablet";
      isTablet = true;
    } else {
      type = "desktop";
    }

    // Check for console/embedded systems
    if (navigator.userAgent.includes('Console') || navigator.userAgent.includes('Embedded')) {
      type = "console";
    }

    const info: DeviceInfo = {
      type,
      screenWidth: width,
      screenHeight: height,
      pixelRatio,
      isMobile,
      isTablet
    };

    // Get device memory if available
    if ('deviceMemory' in navigator) {
      info.memory = (navigator as any).deviceMemory;
    }

    // Get CPU cores if available
    if ('hardwareConcurrency' in navigator) {
      info.cores = navigator.hardwareConcurrency;
    }

    return info;
  }

  /**
   * Measure network status
   */
  async measureNetwork(): Promise<NetworkStatus> {
    const online = navigator.onLine;
    let latency = 0;
    let bandwidth = 0;
    let effectiveType = "4g";

    if (online) {
      // Measure latency with ping
      const start = performance.now();
      try {
        // Use a tiny request to measure latency
        await fetch('/api/ping', { method: 'HEAD', cache: 'no-cache' });
        latency = performance.now() - start;
      } catch (error) {
        latency = 9999; // High latency on error
      }

      // Get connection info if available
      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        effectiveType = conn.effectiveType || "4g";
        bandwidth = conn.downlink || 10; // Mbps
      }
    }

    // Determine quality based on metrics
    let quality: NetworkQuality = "offline";
    if (online) {
      if (latency < 50 && bandwidth > 10) {
        quality = "excellent";
      } else if (latency < 100 && bandwidth > 5) {
        quality = "good";
      } else if (latency < 300 && bandwidth > 1) {
        quality = "fair";
      } else {
        quality = "poor";
      }
    }

    return {
      quality,
      latency,
      bandwidth,
      online,
      effectiveType
    };
  }

  /**
   * Determine UI mode based on context
   */
  determineUIMode(device: DeviceInfo, network: NetworkStatus, operation: OperationalContext): UIMode {
    // Offline mode if not connected
    if (!network.online) {
      return "offline";
    }

    // Critical operations get full UI regardless
    if (operation.priority === "critical") {
      return "full";
    }

    // Mobile devices get reduced UI by default
    if (device.isMobile) {
      if (network.quality === "poor" || network.quality === "fair") {
        return "minimal";
      }
      return "reduced";
    }

    // Desktop with good network gets full UI
    if (device.type === "desktop" && network.quality !== "poor") {
      return "full";
    }

    // Poor network conditions force reduced UI
    if (network.quality === "poor") {
      return "minimal";
    }

    return "reduced";
  }

  /**
   * Configure component weights based on mode
   */
  configureComponents(mode: UIMode, device: DeviceInfo): Map<string, ComponentWeight> {
    const weights = new Map<string, ComponentWeight>();

    switch (mode) {
      case "full":
        weights.set("charts", "heavy");
        weights.set("maps", "heavy");
        weights.set("realtime", "heavy");
        weights.set("animations", "medium");
        weights.set("images", "heavy");
        break;

      case "reduced":
        weights.set("charts", "medium");
        weights.set("maps", "medium");
        weights.set("realtime", "medium");
        weights.set("animations", "light");
        weights.set("images", "medium");
        break;

      case "minimal":
        weights.set("charts", "light");
        weights.set("maps", "light");
        weights.set("realtime", "light");
        weights.set("animations", "light");
        weights.set("images", "light");
        break;

      case "offline":
        weights.set("charts", "light");
        weights.set("maps", "light");
        weights.set("realtime", "light");
        weights.set("animations", "light");
        weights.set("images", "light");
        break;
    }

    return weights;
  }

  /**
   * Determine enabled features based on context
   */
  determineFeatures(mode: UIMode, network: NetworkStatus, operation: OperationalContext): Set<string> {
    const features = new Set<string>();

    // Core features always enabled
    features.add("core-navigation");
    features.add("essential-data");

    if (mode === "full") {
      features.add("realtime-updates");
      features.add("advanced-charts");
      features.add("collaborative-editing");
      features.add("video-conferencing");
      features.add("ai-assistance");
    } else if (mode === "reduced") {
      features.add("realtime-updates");
      features.add("basic-charts");
      features.add("ai-assistance");
    } else if (mode === "minimal") {
      features.add("basic-charts");
    }

    // Offline mode features
    if (!network.online || mode === "offline") {
      features.add("offline-storage");
      features.add("offline-sync");
      features.delete("realtime-updates");
      features.delete("video-conferencing");
    }

    // Emergency operations enable all critical features
    if (operation.missionType === "emergency") {
      features.add("emergency-alerts");
      features.add("priority-sync");
    }

    return features;
  }

  /**
   * Reconfigure UI based on current context
   */
  async reconfigure(operation?: OperationalContext): Promise<UIConfiguration> {
    logger.info('Reconfiguring UI...');

    const device = this.detectDevice();
    const network = await this.measureNetwork();
    const context = operation || this.getDefaultOperationalContext();

    const mode = this.determineUIMode(device, network, context);
    const componentWeights = this.configureComponents(mode, device);
    const featuresEnabled = this.determineFeatures(mode, network, context);
    const performanceMode = mode === "minimal" || mode === "reduced";
    const offlineMode = !network.online || mode === "offline";

    const newConfig: UIConfiguration = {
      mode,
      componentWeights,
      featuresEnabled,
      performanceMode,
      offlineMode
    };

    // Record decision
    const decision: AdaptiveDecision = {
      timestamp: new Date().toISOString(),
      context: { device, network, operation: context },
      configuration: newConfig,
      reason: this.generateReason(device, network, context, mode)
    };

    this.decisionHistory.push(decision);
    if (this.decisionHistory.length > this.maxHistorySize) {
      this.decisionHistory.shift();
    }

    this.currentConfig = newConfig;
    logger.info(`UI reconfigured to mode: ${mode}`);

    return newConfig;
  }

  /**
   * Generate human-readable reason for configuration decision
   */
  private generateReason(device: DeviceInfo, network: NetworkStatus, operation: OperationalContext, mode: UIMode): string {
    const reasons: string[] = [];

    reasons.push(`Device: ${device.type}`);
    reasons.push(`Network: ${network.quality}`);
    reasons.push(`Mission: ${operation.missionType}`);
    reasons.push(`Priority: ${operation.priority}`);
    reasons.push(`Mode: ${mode}`);

    return reasons.join(", ");
  }

  /**
   * Get current configuration
   */
  getCurrentConfig(): UIConfiguration {
    return this.currentConfig;
  }

  /**
   * Get configuration history
   */
  getHistory(): AdaptiveDecision[] {
    return [...this.decisionHistory];
  }

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(feature: string): boolean {
    return this.currentConfig.featuresEnabled.has(feature);
  }

  /**
   * Get component weight
   */
  getComponentWeight(component: string): ComponentWeight {
    return this.currentConfig.componentWeights.get(component) || "medium";
  }

  /**
   * Force UI mode (override automatic detection)
   */
  forceMode(mode: UIMode): void {
    logger.info(`Forcing UI mode to: ${mode}`);
    this.currentConfig.mode = mode;
    this.currentConfig.performanceMode = mode === "minimal" || mode === "reduced";
    this.currentConfig.offlineMode = mode === "offline";
  }

  /**
   * Get default operational context
   */
  private getDefaultOperationalContext(): OperationalContext {
    return {
      missionType: "strategic",
      priority: "medium",
      resourceConstraints: {
        memory: 1024,
        storage: 5120
      }
    };
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): UIConfiguration {
    return {
      mode: "full",
      componentWeights: new Map(),
      featuresEnabled: new Set(["core-navigation", "essential-data"]),
      performanceMode: false,
      offlineMode: false
    };
  }

  /**
   * Get current device type
   */
  private getCurrentDeviceType(): DeviceType {
    const width = window.innerWidth;
    if (width < 768) return "mobile";
    if (width < 1024) return "tablet";
    return "desktop";
  }
}

// Singleton instance
export const adaptiveUIEngine = new AdaptiveUIEngine();

// Export hook for React components
export function useAdaptiveUI() {
  const [config, setConfig] = React.useState(adaptiveUIEngine.getCurrentConfig());

  React.useEffect(() => {
    const reconfigure = async () => {
      const newConfig = await adaptiveUIEngine.reconfigure();
      setConfig(newConfig);
    };

    reconfigure();

    // Re-configure on visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        reconfigure();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return config;
}

// Import React for the hook
import * as React from 'react';
