/**
 * Self-Adjusting System - PATCH 950
 * Monitors usage and auto-adjusts performance
 */

export interface UsageMetrics {
  moduleName: string;
  accessCount: number;
  avgLoadTime: number;
  errorCount: number;
  lastAccessed: Date;
  memoryUsage?: number;
}

export interface PerformanceAdjustment {
  id: string;
  type: 'preload' | 'cache' | 'lazy' | 'reduce' | 'optimize';
  target: string;
  reason: string;
  applied: boolean;
  timestamp: Date;
  impact?: string;
}

export interface SystemProfile {
  deviceType: 'high' | 'medium' | 'low';
  networkSpeed: 'fast' | 'medium' | 'slow' | 'offline';
  batteryLevel?: number;
  memoryPressure: 'low' | 'medium' | 'high';
}

class SelfAdjustingSystem {
  private usageHistory: Map<string, UsageMetrics[]> = new Map();
  private adjustments: PerformanceAdjustment[] = [];
  private currentProfile: SystemProfile = {
    deviceType: 'medium',
    networkSpeed: 'medium',
    memoryPressure: 'low'
  };
  private preloadedModules: Set<string> = new Set();
  private cachedData: Map<string, { data: any; expiry: number }> = new Map();

  /**
   * Record module usage
   */
  recordUsage(metrics: UsageMetrics): void {
    const history = this.usageHistory.get(metrics.moduleName) || [];
    history.push(metrics);
    
    // Keep last 100 entries per module
    if (history.length > 100) {
      history.shift();
    }
    
    this.usageHistory.set(metrics.moduleName, history);
    
    // Trigger auto-adjustment
    this.analyzeAndAdjust(metrics.moduleName);
  }

  /**
   * Update system profile
   */
  updateProfile(profile: Partial<SystemProfile>): void {
    this.currentProfile = { ...this.currentProfile, ...profile };
    this.applyProfileBasedAdjustments();
  }

  /**
   * Analyze module usage and apply adjustments
   */
  private analyzeAndAdjust(moduleName: string): void {
    const history = this.usageHistory.get(moduleName);
    if (!history || history.length < 5) return;

    const recent = history.slice(-10);
    const avgAccessCount = recent.reduce((sum, h) => sum + h.accessCount, 0) / recent.length;
    const avgLoadTime = recent.reduce((sum, h) => sum + h.avgLoadTime, 0) / recent.length;
    const avgErrorCount = recent.reduce((sum, h) => sum + h.errorCount, 0) / recent.length;

    // High usage module - preload
    if (avgAccessCount > 10 && !this.preloadedModules.has(moduleName)) {
      this.applyAdjustment({
        id: `preload_${moduleName}_${Date.now()}`,
        type: 'preload',
        target: moduleName,
        reason: `Alto uso detectado (${avgAccessCount.toFixed(1)} acessos)`,
        applied: true,
        timestamp: new Date(),
        impact: 'Módulo será pré-carregado para acesso mais rápido'
      });
      this.preloadedModules.add(moduleName);
    }

    // Slow module - optimize
    if (avgLoadTime > 2000) {
      this.applyAdjustment({
        id: `optimize_${moduleName}_${Date.now()}`,
        type: 'optimize',
        target: moduleName,
        reason: `Tempo de carga alto (${avgLoadTime.toFixed(0)}ms)`,
        applied: true,
        timestamp: new Date(),
        impact: 'Aplicando lazy loading e code splitting'
      });
    }

    // High error rate - reduce functionality
    if (avgErrorCount > 3) {
      this.applyAdjustment({
        id: `reduce_${moduleName}_${Date.now()}`,
        type: 'reduce',
        target: moduleName,
        reason: `Taxa de erro alta (${avgErrorCount.toFixed(1)} erros)`,
        applied: true,
        timestamp: new Date(),
        impact: 'Reduzindo funcionalidades para estabilidade'
      });
    }

    // Low usage module - lazy load
    if (avgAccessCount < 1) {
      this.applyAdjustment({
        id: `lazy_${moduleName}_${Date.now()}`,
        type: 'lazy',
        target: moduleName,
        reason: `Baixo uso detectado (${avgAccessCount.toFixed(1)} acessos)`,
        applied: true,
        timestamp: new Date(),
        impact: 'Módulo será carregado sob demanda'
      });
      this.preloadedModules.delete(moduleName);
    }
  }

  /**
   * Apply profile-based adjustments
   */
  private applyProfileBasedAdjustments(): void {
    const { deviceType, networkSpeed, memoryPressure, batteryLevel } = this.currentProfile;

    // Low-end device adjustments
    if (deviceType === 'low') {
      this.applyAdjustment({
        id: `device_low_${Date.now()}`,
        type: 'reduce',
        target: 'animations',
        reason: 'Dispositivo de baixa capacidade',
        applied: true,
        timestamp: new Date(),
        impact: 'Desabilitando animações e efeitos visuais'
      });
    }

    // Slow/offline network
    if (networkSpeed === 'slow' || networkSpeed === 'offline') {
      this.applyAdjustment({
        id: `network_${networkSpeed}_${Date.now()}`,
        type: 'cache',
        target: 'all_data',
        reason: `Rede ${networkSpeed === 'offline' ? 'indisponível' : 'lenta'}`,
        applied: true,
        timestamp: new Date(),
        impact: 'Usando cache local e modo offline'
      });
    }

    // High memory pressure
    if (memoryPressure === 'high') {
      this.applyAdjustment({
        id: `memory_${Date.now()}`,
        type: 'reduce',
        target: 'cache_size',
        reason: 'Memória sob pressão',
        applied: true,
        timestamp: new Date(),
        impact: 'Reduzindo tamanho do cache e liberando memória'
      });
      this.clearOldCache();
    }

    // Low battery
    if (batteryLevel !== undefined && batteryLevel < 20) {
      this.applyAdjustment({
        id: `battery_${Date.now()}`,
        type: 'reduce',
        target: 'background_tasks',
        reason: `Bateria baixa (${batteryLevel}%)`,
        applied: true,
        timestamp: new Date(),
        impact: 'Desabilitando tarefas em background'
      });
    }
  }

  /**
   * Apply adjustment
   */
  private applyAdjustment(adjustment: PerformanceAdjustment): void {
    // Check if similar adjustment was applied recently
    const recent = this.adjustments.find(
      a => a.type === adjustment.type && 
           a.target === adjustment.target &&
           Date.now() - a.timestamp.getTime() < 5 * 60 * 1000
    );

    if (recent) return;

    this.adjustments.push(adjustment);

    // Keep last 100 adjustments
    if (this.adjustments.length > 100) {
      this.adjustments = this.adjustments.slice(-100);
    }

    console.log(`[SelfAdjust] ${adjustment.type}: ${adjustment.target} - ${adjustment.reason}`);
  }

  /**
   * Clear old cache entries
   */
  private clearOldCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cachedData.entries()) {
      if (value.expiry < now) {
        this.cachedData.delete(key);
      }
    }
  }

  /**
   * Get optimization recommendations
   */
  getRecommendations(): {
    action: string;
    target: string;
    reason: string;
    priority: 'low' | 'medium' | 'high';
  }[] {
    const recommendations: ReturnType<typeof this.getRecommendations> = [];

    // Analyze all modules
    for (const [moduleName, history] of this.usageHistory.entries()) {
      if (history.length < 5) continue;

      const recent = history.slice(-10);
      const avgLoadTime = recent.reduce((sum, h) => sum + h.avgLoadTime, 0) / recent.length;
      const avgErrorCount = recent.reduce((sum, h) => sum + h.errorCount, 0) / recent.length;

      if (avgLoadTime > 3000) {
        recommendations.push({
          action: 'Otimizar carregamento',
          target: moduleName,
          reason: `Tempo médio de ${avgLoadTime.toFixed(0)}ms`,
          priority: 'high'
        });
      }

      if (avgErrorCount > 5) {
        recommendations.push({
          action: 'Investigar erros',
          target: moduleName,
          reason: `${avgErrorCount.toFixed(0)} erros em média`,
          priority: 'high'
        });
      }
    }

    // Profile-based recommendations
    if (this.currentProfile.memoryPressure === 'high') {
      recommendations.push({
        action: 'Liberar memória',
        target: 'Sistema',
        reason: 'Pressão de memória detectada',
        priority: 'high'
      });
    }

    return recommendations.sort((a, b) => {
      const priority = { high: 3, medium: 2, low: 1 };
      return priority[b.priority] - priority[a.priority];
    });
  }

  /**
   * Get current adjustments
   */
  getActiveAdjustments(): PerformanceAdjustment[] {
    return this.adjustments.filter(a => a.applied);
  }

  /**
   * Get module priorities for loading
   */
  getModulePriorities(): { module: string; priority: number }[] {
    const priorities: { module: string; priority: number }[] = [];

    for (const [moduleName, history] of this.usageHistory.entries()) {
      if (history.length === 0) continue;

      const recent = history.slice(-20);
      const avgAccess = recent.reduce((sum, h) => sum + h.accessCount, 0) / recent.length;
      const recency = Date.now() - recent[recent.length - 1].lastAccessed.getTime();
      
      // Priority based on usage frequency and recency
      const priority = avgAccess * 10 - (recency / (1000 * 60 * 60)); // Decay over hours
      
      priorities.push({ module: moduleName, priority: Math.max(0, priority) });
    }

    return priorities.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Detect system profile automatically
   */
  async detectSystemProfile(): Promise<SystemProfile> {
    const profile: SystemProfile = {
      deviceType: 'medium',
      networkSpeed: 'medium',
      memoryPressure: 'low'
    };

    // Detect device type based on cores and memory
    const cores = navigator.hardwareConcurrency || 2;
    if (cores >= 8) profile.deviceType = 'high';
    else if (cores <= 2) profile.deviceType = 'low';

    // Detect network speed
    const connection = (navigator as any).connection;
    if (connection) {
      if (connection.effectiveType === '4g' && connection.downlink > 5) {
        profile.networkSpeed = 'fast';
      } else if (connection.effectiveType === '2g' || connection.downlink < 1) {
        profile.networkSpeed = 'slow';
      }
    }

    if (!navigator.onLine) {
      profile.networkSpeed = 'offline';
    }

    // Detect memory pressure
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      if (memory) {
        const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        if (usage > 0.8) profile.memoryPressure = 'high';
        else if (usage > 0.5) profile.memoryPressure = 'medium';
      }
    }

    // Detect battery
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        profile.batteryLevel = Math.round(battery.level * 100);
      } catch (e) {
        // Battery API not supported
      }
    }

    this.updateProfile(profile);
    return profile;
  }
}

export const selfAdjustingSystem = new SelfAdjustingSystem();

// Auto-detect profile on load
if (typeof window !== 'undefined') {
  selfAdjustingSystem.detectSystemProfile();
}
