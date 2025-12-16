/**
 * Resource Manager - PATCH 850
 * Unified resource management for CPU, memory, network and battery
 */

export interface ResourceStatus {
  cpu: 'low' | 'normal' | 'high';
  memory: 'low' | 'normal' | 'high' | 'critical';
  network: 'offline' | 'slow' | 'moderate' | 'fast';
  battery: 'low' | 'normal' | 'charging';
  overall: 'constrained' | 'normal' | 'optimal';
}

interface BatteryManager {
  charging: boolean;
  level: number;
  addEventListener: (type: string, listener: EventListener) => void;
  removeEventListener: (type: string, listener: EventListener) => void;
}

class ResourceManager {
  private status: ResourceStatus = {
    cpu: 'normal',
    memory: 'normal',
    network: 'fast',
    battery: 'normal',
    overall: 'normal',
  };
  
  private listeners: Set<(status: ResourceStatus) => void> = new Set();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private batteryManager: BatteryManager | null = null;

  async initialize(): Promise<void> {
    await this.initBatteryMonitor();
    this.initNetworkMonitor();
    this.updateStatus();
  }

  private async initBatteryMonitor(): Promise<void> {
    if ('getBattery' in navigator) {
      try {
        this.batteryManager = await (navigator as any).getBattery();
        this.batteryManager?.addEventListener('levelchange', () => this.updateStatus());
        this.batteryManager?.addEventListener('chargingchange', () => this.updateStatus());
      } catch {
        // Battery API not available
      }
    }
  }

  private initNetworkMonitor(): void {
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      conn?.addEventListener('change', () => this.updateStatus());
    }
    
    window.addEventListener('online', () => this.updateStatus());
    window.addEventListener('offline', () => this.updateStatus());
  }

  private updateStatus(): void {
    // Network
    if (!navigator.onLine) {
      this.status.network = 'offline';
    } else if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      const effectiveType = conn?.effectiveType || '4g';
      
      if (effectiveType === '2g' || effectiveType === 'slow-2g') {
        this.status.network = 'slow';
      } else if (effectiveType === '3g') {
        this.status.network = 'moderate';
      } else {
        this.status.network = 'fast';
      }
    }

    // Battery
    if (this.batteryManager) {
      if (this.batteryManager.charging) {
        this.status.battery = 'charging';
      } else if (this.batteryManager.level < 0.2) {
        this.status.battery = 'low';
      } else {
        this.status.battery = 'normal';
      }
    }

    // Memory (if available)
    const perf = performance as any;
    if (perf.memory) {
      const usage = perf.memory.usedJSHeapSize / perf.memory.jsHeapSizeLimit;
      if (usage > 0.9) {
        this.status.memory = 'critical';
      } else if (usage > 0.7) {
        this.status.memory = 'high';
      } else if (usage < 0.3) {
        this.status.memory = 'low';
      } else {
        this.status.memory = 'normal';
      }
    }

    // Overall status
    this.status.overall = this.calculateOverall();
    
    // Notify listeners
    this.listeners.forEach(fn => fn(this.status));
  }

  private calculateOverall(): 'constrained' | 'normal' | 'optimal' {
    const constrained = 
      this.status.memory === 'critical' ||
      this.status.memory === 'high' ||
      this.status.network === 'offline' ||
      this.status.network === 'slow' ||
      this.status.battery === 'low';
    
    if (constrained) return 'constrained';
    
    const optimal =
      this.status.memory === 'low' &&
      this.status.network === 'fast' &&
      this.status.battery === 'charging';
    
    return optimal ? 'optimal' : 'normal';
  }

  startMonitoring(intervalMs: number = 10000): void {
    if (this.monitoringInterval) return;
    
    this.monitoringInterval = setInterval(() => {
      this.updateStatus();
    }, intervalMs);
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  getStatus(): ResourceStatus {
    return { ...this.status };
  }

  isConstrained(): boolean {
    return this.status.overall === 'constrained';
  }

  subscribe(callback: (status: ResourceStatus) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Adaptive settings based on resources
  getAdaptiveSettings() {
    const isConstrained = this.isConstrained();
    
    return {
      enableAnimations: !isConstrained && this.status.battery !== 'low',
      imageQuality: isConstrained ? 50 : 85,
      prefetchEnabled: this.status.network === 'fast' && !isConstrained,
      cacheSize: isConstrained ? 10 : 50,
      debounceMs: isConstrained ? 500 : 300,
      batchSize: isConstrained ? 5 : 20,
    };
  }
}

export const resourceManager = new ResourceManager();
