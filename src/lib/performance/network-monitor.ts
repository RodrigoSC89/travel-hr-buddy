/**
 * Network Monitor - PATCH 835
 * Real-time network quality monitoring and adaptation
 */

import { useState, useEffect, useCallback } from 'react';

export interface NetworkStatus {
  online: boolean;
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
  downlink: number; // Mbps
  rtt: number; // ms
  saveData: boolean;
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'offline';
  timestamp: number;
}

type NetworkListener = (status: NetworkStatus) => void;

class NetworkMonitor {
  private status: NetworkStatus;
  private listeners = new Set<NetworkListener>();
  private measurementInterval: number | null = null;
  private measurements: number[] = [];
  
  constructor() {
    this.status = this.getInitialStatus();
    this.setupListeners();
  }
  
  private getInitialStatus(): NetworkStatus {
    const nav = navigator as Navigator & {
      connection?: {
        effectiveType?: string;
        downlink?: number;
        rtt?: number;
        saveData?: boolean;
      };
    };
    
    const connection = nav.connection;
    
    return {
      online: navigator.onLine,
      effectiveType: (connection?.effectiveType as NetworkStatus['effectiveType']) || 'unknown',
      downlink: connection?.downlink || 10,
      rtt: connection?.rtt || 50,
      saveData: connection?.saveData || false,
      quality: this.calculateQuality(
        navigator.onLine,
        connection?.effectiveType || '4g',
        connection?.rtt || 50
      ),
      timestamp: Date.now(),
    };
  }
  
  private calculateQuality(
    online: boolean,
    effectiveType: string,
    rtt: number
  ): NetworkStatus['quality'] {
    if (!online) return 'offline';
    
    if (effectiveType === 'slow-2g' || effectiveType === '2g' || rtt > 500) {
      return 'poor';
    }
    if (effectiveType === '3g' || rtt > 200) {
      return 'fair';
    }
    if (rtt > 100) {
      return 'good';
    }
    return 'excellent';
  }
  
  private setupListeners(): void {
    // Online/offline events
    window.addEventListener('online', () => this.updateStatus({ online: true }));
    window.addEventListener('offline', () => this.updateStatus({ online: false }));
    
    // Connection change events
    const nav = navigator as Navigator & {
      connection?: EventTarget & {
        effectiveType?: string;
        downlink?: number;
        rtt?: number;
        saveData?: boolean;
      };
    };
    
    if (nav.connection) {
      nav.connection.addEventListener('change', () => {
        const conn = nav.connection!;
        this.updateStatus({
          effectiveType: conn.effectiveType as NetworkStatus['effectiveType'],
          downlink: conn.downlink,
          rtt: conn.rtt,
          saveData: conn.saveData,
        });
      });
    }
  }
  
  private updateStatus(partial: Partial<NetworkStatus>): void {
    this.status = {
      ...this.status,
      ...partial,
      quality: this.calculateQuality(
        partial.online ?? this.status.online,
        partial.effectiveType ?? this.status.effectiveType,
        partial.rtt ?? this.status.rtt
      ),
      timestamp: Date.now(),
    };
    
    this.notifyListeners();
  }
  
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.status));
  }
  
  /**
   * Start continuous network measurement
   */
  startMeasurement(intervalMs = 30000): void {
    if (this.measurementInterval) return;
    
    this.measurementInterval = window.setInterval(() => {
      this.measureLatency();
    }, intervalMs);
    
    // Initial measurement
    this.measureLatency();
  }
  
  /**
   * Stop continuous measurement
   */
  stopMeasurement(): void {
    if (this.measurementInterval) {
      clearInterval(this.measurementInterval);
      this.measurementInterval = null;
    }
  }
  
  /**
   * Measure current latency
   */
  private async measureLatency(): Promise<void> {
    if (!this.status.online) return;
    
    try {
      const start = performance.now();
      
      // Ping a small resource
      await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-store',
      });
      
      const latency = Math.round(performance.now() - start);
      
      // Keep last 5 measurements for averaging
      this.measurements.push(latency);
      if (this.measurements.length > 5) {
        this.measurements.shift();
      }
      
      const avgLatency = Math.round(
        this.measurements.reduce((a, b) => a + b, 0) / this.measurements.length
      );
      
      this.updateStatus({ rtt: avgLatency });
    } catch {
      // Measurement failed, might be offline
      if (!navigator.onLine) {
        this.updateStatus({ online: false });
      }
    }
  }
  
  /**
   * Get current network status
   */
  getStatus(): NetworkStatus {
    return { ...this.status };
  }
  
  /**
   * Subscribe to network changes
   */
  subscribe(listener: NetworkListener): () => void {
    this.listeners.add(listener);
    // Immediately notify with current status
    listener(this.status);
    
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  /**
   * Check if network is suitable for heavy operations
   */
  canPerformHeavyOperation(): boolean {
    return (
      this.status.online &&
      this.status.quality !== 'poor' &&
      this.status.quality !== 'offline' &&
      !this.status.saveData
    );
  }
  
  /**
   * Get recommended settings based on network
   */
  getRecommendedSettings(): {
    imageQuality: number;
    enableAnimations: boolean;
    batchSize: number;
    timeout: number;
    prefetchEnabled: boolean;
  } {
    const { quality, saveData } = this.status;
    
    if (saveData || quality === 'poor') {
      return {
        imageQuality: 30,
        enableAnimations: false,
        batchSize: 10,
        timeout: 15000,
        prefetchEnabled: false,
      };
    }
    
    if (quality === 'fair') {
      return {
        imageQuality: 50,
        enableAnimations: false,
        batchSize: 20,
        timeout: 10000,
        prefetchEnabled: false,
      };
    }
    
    if (quality === 'good') {
      return {
        imageQuality: 70,
        enableAnimations: true,
        batchSize: 30,
        timeout: 8000,
        prefetchEnabled: true,
      };
    }
    
    // Excellent
    return {
      imageQuality: 85,
      enableAnimations: true,
      batchSize: 50,
      timeout: 5000,
      prefetchEnabled: true,
    };
  }
}

// Singleton instance
export const networkMonitor = new NetworkMonitor();

/**
 * React hook for network status
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState(networkMonitor.getStatus);
  
  useEffect(() => {
    return networkMonitor.subscribe(setStatus);
  }, []);
  
  return status;
}

/**
 * React hook for network-aware operations
 */
export function useNetworkAware() {
  const status = useNetworkStatus();
  
  const withNetworkCheck = useCallback(
    async <T>(
      operation: () => Promise<T>,
      options?: {
        requiresGoodConnection?: boolean;
        offlineFallback?: T;
      }
    ): Promise<T> => {
      const { requiresGoodConnection = false, offlineFallback } = options || {};
      
      if (!status.online) {
        if (offlineFallback !== undefined) {
          return offlineFallback;
        }
        throw new Error('No network connection');
      }
      
      if (requiresGoodConnection && !networkMonitor.canPerformHeavyOperation()) {
        throw new Error('Network too slow for this operation');
      }
      
      return operation();
    },
    [status.online]
  );
  
  return {
    status,
    isOnline: status.online,
    quality: status.quality,
    canPerformHeavyOperation: networkMonitor.canPerformHeavyOperation(),
    recommendedSettings: networkMonitor.getRecommendedSettings(),
    withNetworkCheck,
  };
}
