/**
 * PATCH 222.0 - Adaptive UI Reconfiguration Engine
 * PATCH 659: TypeScript fixes applied
 * Adapts UI based on device type, network, operation, and priority
 * Automatically reconfigures UI based on operational context and limitations
 */

import { logger } from "@/lib/logger";

// Extended Navigator interfaces
interface AdaptiveNetworkInfo {
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g" | "5g";
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

interface AdaptiveNavigator {
  deviceMemory?: number;
  hardwareConcurrency?: number;
  onLine?: boolean;
  connection?: AdaptiveNetworkInfo;
  mozConnection?: AdaptiveNetworkInfo;
  webkitConnection?: AdaptiveNetworkInfo;
  getBattery?: () => Promise<BatteryManager>;
}

interface BatteryManager {
  level: number;
  charging: boolean;
}

export type DeviceType = "mobile" | "tablet" | "desktop" | "console";
export type NetworkQuality = "excellent" | "good" | "fair" | "poor" | "offline";
export type MissionType = "tactical" | "maintenance" | "administrative" | "emergency";
export type UIMode = "full" | "reduced" | "minimal" | "emergency";

export interface NetworkMetrics {
  latency: number; // ms
  bandwidth: number; // Mbps
  packetLoss: number; // percentage
  quality: NetworkQuality;
}

export interface DeviceMetrics {
  type: DeviceType;
  screenWidth: number;
  screenHeight: number;
  memory?: number; // GB
  cpuCores?: number;
  batteryLevel?: number; // percentage
  isLowPowerMode?: boolean;
}

export interface OperationalContext {
  missionType: MissionType;
  priority: "low" | "medium" | "high" | "critical";
  location?: string;
  isOffline: boolean;
  requiresSpeed: boolean;
  dataSensitive: boolean;
}

export interface UIConfiguration {
  mode: UIMode;
  componentSet: "light" | "heavy";
  features: {
    animations: boolean;
    charts: boolean;
    maps: boolean;
    realTimeUpdates: boolean;
    autoRefresh: boolean;
    heavyGraphics: boolean;
    backgroundSync: boolean;
  };
  layout: {
    sidebar: "full" | "mini" | "hidden";
    header: "full" | "compact" | "minimal";
    panels: "multi" | "single" | "modal";
  };
  dataStrategy: {
    caching: "aggressive" | "normal" | "minimal";
    preloading: boolean;
    lazyLoading: boolean;
    compressionLevel: "high" | "medium" | "low";
  };
}

class AdaptiveUI {
  private currentConfig: UIConfiguration | null = null;
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private contextMeshConnected = false;

  /**
   * Initialize adaptive UI system
   */
  initialize(): void {
    logger.info("[AdaptiveUI] Initializing Adaptive UI Reconfiguration Engine...");

    // Detect initial device and network
    const device = this.detectDevice();
    const network = this.measureNetwork();
    const context: OperationalContext = {
      missionType: "administrative",
      priority: "medium",
      isOffline: network.quality === "offline",
      requiresSpeed: false,
      dataSensitive: false,
    };

    // Generate initial configuration
    this.currentConfig = this.generateConfiguration(device, network, context);

    // Apply initial configuration
    this.applyConfiguration(this.currentConfig);

    // Connect to context mesh
    this.connectContextMesh();

    logger.info("[AdaptiveUI] Adaptive UI initialized");
  }

  /**
   * Start monitoring and auto-reconfiguration
   */
  startMonitoring(intervalMs: number = 30000): void {
    if (this.isMonitoring) {
      logger.warn("[AdaptiveUI] Already monitoring");
      return;
    }

    logger.info("[AdaptiveUI] Starting adaptive monitoring...");
    this.isMonitoring = true;

    this.monitoringInterval = setInterval(() => {
      this.evaluateAndReconfigure();
    }, intervalMs);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.isMonitoring = false;
    logger.info("[AdaptiveUI] Monitoring stopped");
  }

  /**
   * Evaluate current conditions and reconfigure if needed
   */
  async evaluateAndReconfigure(): Promise<void> {
    try {
      const device = this.detectDevice();
      const network = this.measureNetwork();
      const context = this.getOperationalContext();

      const newConfig = this.generateConfiguration(device, network, context);

      // Check if configuration changed significantly
      if (this.shouldReconfigure(newConfig)) {
        logger.info("[AdaptiveUI] Reconfiguring UI based on new conditions");
        await this.applyConfiguration(newConfig);
        this.currentConfig = newConfig;
      }
    } catch (error) {
      logger.error("[AdaptiveUI] Failed to evaluate and reconfigure:", error);
    }
  }

  /**
   * Detect device type and capabilities
   */
  private detectDevice(): DeviceMetrics {
    const width = window.innerWidth;
    const height = window.innerHeight;

    let type: DeviceType = "desktop";
    if (width < 768) {
      type = "mobile";
    } else if (width < 1024) {
      type = "tablet";
    } else if (width >= 1920) {
      type = "console"; // Large displays / control room consoles
    }

    // Try to get device memory if available
    const extNavigator = navigator as unknown as AdaptiveNavigator;
    const memory = extNavigator.deviceMemory;
    const cpuCores = extNavigator.hardwareConcurrency;

    // Try to get battery info if available
    let batteryLevel: number | undefined;
    let isLowPowerMode: boolean | undefined;

    if (extNavigator.getBattery) {
      extNavigator.getBattery().then((battery: BatteryManager) => {
        batteryLevel = battery.level * 100;
        isLowPowerMode = batteryLevel < 20;
      });
    }

    return {
      type,
      screenWidth: width,
      screenHeight: height,
      memory,
      cpuCores,
      batteryLevel,
      isLowPowerMode,
    };
  }

  /**
   * Measure network quality
   */
  private measureNetwork(): NetworkMetrics {
    const extNavigator = navigator as unknown as AdaptiveNavigator;
    const connection = extNavigator.connection || extNavigator.mozConnection || extNavigator.webkitConnection;

    let latency = 50; // Default
    let bandwidth = 10; // Default Mbps
    const packetLoss = 0;

    if (connection) {
      // Get effective type (slow-2g, 2g, 3g, 4g, 5g)
      const effectiveType = connection.effectiveType;
      const downlink = connection.downlink; // Mbps

      if (downlink) {
        bandwidth = downlink;
      }

      // Estimate latency based on connection type
      switch (effectiveType) {
      case "slow-2g":
        latency = 2000;
        break;
      case "2g":
        latency = 500;
        break;
      case "3g":
        latency = 200;
        break;
      case "4g":
        latency = 50;
        break;
      case "5g":
        latency = 10;
        break;
      }
    }

    // Determine quality
    let quality: NetworkQuality = "good";
    if (!navigator.onLine) {
      quality = "offline";
    } else if (latency > 500 || bandwidth < 1) {
      quality = "poor";
    } else if (latency > 200 || bandwidth < 5) {
      quality = "fair";
    } else if (latency < 50 && bandwidth > 20) {
      quality = "excellent";
    }

    return { latency, bandwidth, packetLoss, quality };
  }

  /**
   * Get operational context
   */
  private getOperationalContext(): OperationalContext {
    // This would be connected to contextMesh in real implementation
    // For now, derive from localStorage or defaults
    const missionType = (localStorage.getItem("current_mission_type") as MissionType) || "administrative";
    const priority = (localStorage.getItem("current_priority") as "low" | "medium" | "high" | "critical") || "medium";
    const isOffline = !navigator.onLine;

    return {
      missionType,
      priority,
      isOffline,
      requiresSpeed: priority === "critical" || missionType === "emergency",
      dataSensitive: missionType === "tactical",
    };
  }

  /**
   * Generate UI configuration based on conditions
   */
  private generateConfiguration(
    device: DeviceMetrics,
    network: NetworkMetrics,
    context: OperationalContext
  ): UIConfiguration {
    // Determine UI mode
    let mode: UIMode = "full";

    if (context.missionType === "emergency" || context.priority === "critical") {
      mode = "emergency";
    } else if (device.type === "mobile" || network.quality === "poor" || context.isOffline) {
      mode = "minimal";
    } else if (device.type === "tablet" || network.quality === "fair") {
      mode = "reduced";
    }

    // Determine component set
    const componentSet: "light" | "heavy" = 
      mode === "full" && network.quality === "excellent" && device.type !== "mobile" 
        ? "heavy" 
        : "light";

    // Configure features based on conditions
    const features = {
      animations: mode === "full" && network.quality !== "poor",
      charts: mode !== "emergency",
      maps: mode !== "minimal" && network.quality !== "poor",
      realTimeUpdates: network.quality !== "offline" && network.quality !== "poor",
      autoRefresh: mode === "full" && network.quality === "excellent",
      heavyGraphics: componentSet === "heavy",
      backgroundSync: !context.isOffline && network.quality !== "poor",
    };

    // Configure layout
    const layout: UIConfiguration["layout"] = {
      sidebar: mode === "emergency" || device.type === "mobile" ? "hidden" : 
        mode === "minimal" || device.type === "tablet" ? "mini" : "full",
      header: mode === "emergency" ? "minimal" : 
        mode === "minimal" || device.type === "mobile" ? "compact" : "full",
      panels: mode === "emergency" || device.type === "mobile" ? "modal" : 
        mode === "minimal" ? "single" : "multi",
    };

    // Configure data strategy
    const dataStrategy: UIConfiguration["dataStrategy"] = {
      caching: network.quality === "poor" || context.isOffline ? "aggressive" : 
        network.quality === "excellent" ? "minimal" : "normal",
      preloading: network.quality === "excellent" && !device.isLowPowerMode,
      lazyLoading: mode !== "emergency" && (device.type === "mobile" || network.quality !== "excellent"),
      compressionLevel: network.quality === "poor" ? "high" : 
        network.quality === "fair" ? "medium" : "low",
    };

    return {
      mode,
      componentSet,
      features,
      layout,
      dataStrategy,
    };
  }

  /**
   * Apply configuration to UI
   */
  private async applyConfiguration(config: UIConfiguration): Promise<void> {
    logger.info(`[AdaptiveUI] Applying configuration: ${config.mode} mode with ${config.componentSet} components`);

    try {
      // Save configuration to localStorage
      localStorage.setItem("adaptive_ui_config", JSON.stringify(config));

      // Update CSS variables for animations
      document.documentElement.style.setProperty(
        "--animation-enabled",
        config.features.animations ? "1" : "0"
      );

      // Dispatch event for other components to react
      window.dispatchEvent(new CustomEvent("adaptive-ui-config-changed", {
        detail: config,
      }));

      // Update contextMesh if connected
      if (this.contextMeshConnected) {
        await this.updateContextMesh(config);
      }

      logger.info("[AdaptiveUI] Configuration applied successfully");
    } catch (error) {
      logger.error("[AdaptiveUI] Failed to apply configuration:", error);
    }
  }

  /**
   * Check if reconfiguration is needed
   */
  private shouldReconfigure(newConfig: UIConfiguration): boolean {
    if (!this.currentConfig) return true;

    // Check if major changes occurred
    return (
      this.currentConfig.mode !== newConfig.mode ||
      this.currentConfig.componentSet !== newConfig.componentSet ||
      this.currentConfig.layout.sidebar !== newConfig.layout.sidebar
    );
  }

  /**
   * Connect to context mesh
   */
  private connectContextMesh(): void {
    // Placeholder for contextMesh integration
    // In real implementation, this would connect to a message bus or state manager
    logger.info("[AdaptiveUI] Connecting to contextMesh...");
    this.contextMeshConnected = true;
    logger.info("[AdaptiveUI] Connected to contextMesh");
  }

  /**
   * Update contextMesh with current configuration
   */
  private async updateContextMesh(config: UIConfiguration): Promise<void> {
    // Placeholder for contextMesh update
    logger.debug("[AdaptiveUI] Updating contextMesh with new configuration");
  }

  /**
   * Get current configuration
   */
  getCurrentConfiguration(): UIConfiguration | null {
    return this.currentConfig;
  }

  /**
   * Force reconfiguration for specific mode
   */
  async forceMode(mode: UIMode): Promise<void> {
    logger.info(`[AdaptiveUI] Forcing UI mode: ${mode}`);

    const device = this.detectDevice();
    const network = this.measureNetwork();
    const context = this.getOperationalContext();

    const config = this.generateConfiguration(device, network, context);
    config.mode = mode; // Override mode

    await this.applyConfiguration(config);
    this.currentConfig = config;
  }

  /**
   * Get system stats
   */
  getStats() {
    return {
      isMonitoring: this.isMonitoring,
      contextMeshConnected: this.contextMeshConnected,
      currentMode: this.currentConfig?.mode,
      currentComponentSet: this.currentConfig?.componentSet,
    };
  }
}

// Export singleton instance
export const adaptiveUI = new AdaptiveUI();
