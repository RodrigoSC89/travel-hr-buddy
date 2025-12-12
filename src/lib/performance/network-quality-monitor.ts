/**
 * Network Quality Monitor - PATCH 950
 * Real-time network quality detection and adaptive behavior
 */

import { logger } from "@/lib/logger";

export interface NetworkQuality {
  type: "slow-2g" | "2g" | "3g" | "4g" | "unknown" | "offline";
  downlink: number; // Mbps
  rtt: number; // ms
  saveData: boolean;
  isOnline: boolean;
  timestamp: number;
}

export interface NetworkConfig {
  // Polling interval for network checks (ms)
  pollInterval: number;
  // Sample size for latency measurements
  sampleSize: number;
  // Timeout for latency tests (ms)
  testTimeout: number;
  // Minimum time between full tests (ms)
  minTestInterval: number;
}

const DEFAULT_CONFIG: NetworkConfig = {
  pollInterval: 30000, // 30 seconds
  sampleSize: 3,
  testTimeout: 5000,
  minTestInterval: 60000, // 1 minute
};

// Thresholds for network classification (Mbps)
const BANDWIDTH_THRESHOLDS = {
  "4g": 10,
  "3g": 2,
  "2g": 0.5,
  "slow-2g": 0.15,
} as const;

// Thresholds for RTT classification (ms)
const RTT_THRESHOLDS = {
  "4g": 100,
  "3g": 400,
  "2g": 1000,
  "slow-2g": 2000,
} as const;

class NetworkQualityMonitor {
  private config: NetworkConfig;
  private currentQuality: NetworkQuality;
  private listeners: Set<(quality: NetworkQuality) => void> = new Set();
  private pollTimer: number | null = null;
  private lastTestTime = 0;
  private latencySamples: number[] = [];

  constructor(config: Partial<NetworkConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.currentQuality = this.detectInitialQuality();
  }

  /**
   * Start monitoring network quality
   */
  start(): void {
    this.setupEventListeners();
    this.startPolling();
    logger.info("[NetworkQuality] Monitor started");
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    logger.info("[NetworkQuality] Monitor stopped");
  }

  /**
   * Get current network quality
   */
  getQuality(): NetworkQuality {
    return { ...this.currentQuality };
  }

  /**
   * Subscribe to quality changes
   */
  subscribe(callback: (quality: NetworkQuality) => void): () => void {
    this.listeners.add(callback);
    callback(this.currentQuality);
    return () => this.listeners.delete(callback);
  }

  /**
   * Force a network test
   */
  async runTest(): Promise<NetworkQuality> {
    const now = Date.now();
    
    if (now - this.lastTestTime < this.config.minTestInterval) {
      return this.currentQuality;
    }
    
    this.lastTestTime = now;
    
    try {
      const rtt = await this.measureLatency();
      const downlink = this.getConnectionInfo().downlink;
      
      this.updateQuality({
        ...this.currentQuality,
        rtt,
        downlink,
        type: this.classifyConnection(downlink, rtt),
        timestamp: now,
      });
    } catch (error) {
      logger.warn("[NetworkQuality] Test failed", { error });
    }
    
    return this.currentQuality;
  }

  /**
   * Check if connection is suitable for heavy operations
   */
  canPerformHeavyOperation(): boolean {
    return (
      this.currentQuality.isOnline &&
      ["4g", "3g"].includes(this.currentQuality.type) &&
      !this.currentQuality.saveData
    );
  }

  /**
   * Check if we're in low bandwidth mode
   */
  isLowBandwidth(): boolean {
    return ["2g", "slow-2g", "offline"].includes(this.currentQuality.type);
  }

  /**
   * Get recommended batch size based on network
   */
  getRecommendedBatchSize(): number {
    switch (this.currentQuality.type) {
    case "4g": return 20;
    case "3g": return 10;
    case "2g": return 5;
    case "slow-2g": return 2;
    default: return 1;
    }
  }

  /**
   * Get recommended timeout based on network
   */
  getRecommendedTimeout(): number {
    switch (this.currentQuality.type) {
    case "4g": return 10000;
    case "3g": return 30000;
    case "2g": return 60000;
    case "slow-2g": return 90000;
    default: return 120000;
    }
  }

  private detectInitialQuality(): NetworkQuality {
    const info = this.getConnectionInfo();
    
    return {
      type: info.effectiveType || "unknown",
      downlink: info.downlink,
      rtt: info.rtt,
      saveData: info.saveData,
      isOnline: navigator.onLine,
      timestamp: Date.now(),
    };
  }

  private getConnectionInfo(): {
    effectiveType: NetworkQuality["type"];
    downlink: number;
    rtt: number;
    saveData: boolean;
    } {
    const connection = (navigator as any).connection;
    
    if (!connection) {
      return {
        effectiveType: navigator.onLine ? "unknown" : "offline",
        downlink: 10,
        rtt: 100,
        saveData: false,
      };
    }
    
    return {
      effectiveType: connection.effectiveType || "unknown",
      downlink: connection.downlink || 10,
      rtt: connection.rtt || 100,
      saveData: connection.saveData || false,
    };
  }

  private classifyConnection(downlink: number, rtt: number): NetworkQuality["type"] {
    if (!navigator.onLine) return "offline";
    
    // Use both downlink and RTT for classification
    if (downlink >= BANDWIDTH_THRESHOLDS["4g"] && rtt <= RTT_THRESHOLDS["4g"]) {
      return "4g";
    }
    if (downlink >= BANDWIDTH_THRESHOLDS["3g"] && rtt <= RTT_THRESHOLDS["3g"]) {
      return "3g";
    }
    if (downlink >= BANDWIDTH_THRESHOLDS["2g"] && rtt <= RTT_THRESHOLDS["2g"]) {
      return "2g";
    }
    if (downlink >= BANDWIDTH_THRESHOLDS["slow-2g"]) {
      return "slow-2g";
    }
    
    return "slow-2g";
  }

  private async measureLatency(): Promise<number> {
    const samples: number[] = [];
    
    for (let i = 0; i < this.config.sampleSize; i++) {
      try {
        const start = performance.now();
        
        await fetch("/favicon.ico", {
          method: "HEAD",
          cache: "no-store",
          signal: AbortSignal.timeout(this.config.testTimeout),
        });
        
        const rtt = performance.now() - start;
        samples.push(rtt);
      } catch {
        // Use a high value for failed samples
        samples.push(this.config.testTimeout);
      }
      
      // Small delay between samples
      if (i < this.config.sampleSize - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Return median
    samples.sort((a, b) => a - b);
    return samples[Math.floor(samples.length / 2)];
  }

  private setupEventListeners(): void {
    const connection = (navigator as any).connection;
    
    // Connection API changes
    if (connection) {
      connection.addEventListener("change", () => {
        const info = this.getConnectionInfo();
        this.updateQuality({
          ...this.currentQuality,
          type: info.effectiveType,
          downlink: info.downlink,
          rtt: info.rtt,
          saveData: info.saveData,
          timestamp: Date.now(),
        });
      });
    }
    
    // Online/offline events
    window.addEventListener("online", () => {
      this.updateQuality({
        ...this.currentQuality,
        isOnline: true,
        type: this.getConnectionInfo().effectiveType,
        timestamp: Date.now(),
      });
    });
    
    window.addEventListener("offline", () => {
      this.updateQuality({
        ...this.currentQuality,
        isOnline: false,
        type: "offline",
        timestamp: Date.now(),
      });
    });
  }

  private startPolling(): void {
    this.pollTimer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        this.runTest();
      }
    }, this.config.pollInterval);
  }

  private updateQuality(quality: NetworkQuality): void {
    const changed = JSON.stringify(quality) !== JSON.stringify(this.currentQuality);
    this.currentQuality = quality;
    
    if (changed) {
      logger.debug("[NetworkQuality] Quality changed", quality);
      this.notifyListeners();
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(cb => cb(this.currentQuality));
  }
}

export const networkQualityMonitor = new NetworkQualityMonitor();

// React hook
import { useState, useEffect } from "react";

export function useNetworkQuality() {
  const [quality, setQuality] = useState<NetworkQuality>(networkQualityMonitor.getQuality());

  useEffect(() => {
    networkQualityMonitor.start();
    const unsubscribe = networkQualityMonitor.subscribe(setQuality);
    
    return () => {
      unsubscribe();
    };
  }, []);

  return {
    ...quality,
    isLowBandwidth: networkQualityMonitor.isLowBandwidth(),
    canPerformHeavyOperation: networkQualityMonitor.canPerformHeavyOperation(),
    recommendedBatchSize: networkQualityMonitor.getRecommendedBatchSize(),
    recommendedTimeout: networkQualityMonitor.getRecommendedTimeout(),
    runTest: () => networkQualityMonitor.runTest(),
  };
}
