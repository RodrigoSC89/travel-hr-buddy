/**
 * Hub Core - Main Orchestration Engine
 * Coordinates all Control Hub subsystems
 */

import { ControlHubState, SystemHealth, HealthCheckResult } from './types';
import { hubMonitor } from './hub_monitor';
import { hubSync } from './hub_sync';
import { hubCache } from './hub_cache';
import { hubBridge } from './hub_bridge';

export class ControlHub {
  private initialized = false;
  private startTime: Date | null = null;

  /**
   * Initialize the Control Hub
   */
  async iniciar(): Promise<void> {
    if (this.initialized) {
      console.warn('Control Hub already initialized');
      return;
    }

    this.startTime = new Date();

    // Initialize subsystems
    await hubMonitor.initialize();
    hubSync.startAutoSync();

    this.initialized = true;
    console.log('Control Hub initialized successfully');
  }

  /**
   * Stop the Control Hub
   */
  parar(): void {
    if (!this.initialized) {
      return;
    }

    hubMonitor.stop();
    hubSync.stopAutoSync();

    this.initialized = false;
    console.log('Control Hub stopped');
  }

  /**
   * Get current state
   */
  getState(): ControlHubState {
    const modules = hubMonitor.getModulesState();
    const cacheStats = hubCache.getStats();
    const connectionQuality = hubBridge.getConnectionQuality();
    const lastSync = hubSync.getLastSync();

    return {
      modules,
      connectionQuality,
      cacheSize: cacheStats.size,
      cacheCapacity: cacheStats.capacity,
      pendingRecords: cacheStats.pending,
      lastSync,
      systemHealth: this.calculateSystemHealth(),
    };
  }

  /**
   * Trigger manual synchronization
   */
  async sincronizar() {
    return await hubSync.synchronize();
  }

  /**
   * Get system health
   */
  async getHealth(): Promise<HealthCheckResult> {
    const modules = hubMonitor.getModulesState();
    const moduleStatuses: Record<string, any> = {};
    
    for (const [key, state] of Object.entries(modules)) {
      moduleStatuses[key] = state.status;
    }

    const uptime = this.startTime 
      ? Date.now() - this.startTime.getTime() 
      : 0;

    return {
      status: this.calculateSystemHealth(),
      timestamp: new Date(),
      modules: moduleStatuses,
      uptime,
    };
  }

  /**
   * Add data to cache for offline storage
   */
  async addToCache(module: string, data: any): Promise<void> {
    await hubCache.addEntry({
      module,
      data,
      synchronized: false,
    });
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return hubCache.getStats();
  }

  /**
   * Clear synchronized cache entries
   */
  clearSynchronizedCache(): void {
    hubCache.clearSynchronized();
  }

  /**
   * Calculate overall system health
   */
  private calculateSystemHealth(): SystemHealth {
    const modules = hubMonitor.getModulesState();
    const moduleStates = Object.values(modules);

    if (moduleStates.length === 0) {
      return 'critical';
    }

    const errorCount = moduleStates.filter(m => m.status === 'error').length;
    const degradedCount = moduleStates.filter(m => m.status === 'degraded').length;
    const offlineCount = moduleStates.filter(m => m.status === 'offline').length;

    const totalProblems = errorCount + degradedCount + offlineCount;
    const problemRatio = totalProblems / moduleStates.length;

    if (errorCount > 0 || problemRatio > 0.5) {
      return 'critical';
    }

    if (degradedCount > 0 || offlineCount > 0) {
      return 'degraded';
    }

    return 'healthy';
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

export const controlHub = new ControlHub();
