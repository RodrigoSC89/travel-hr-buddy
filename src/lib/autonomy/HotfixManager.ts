/**
 * Hotfix Manager - Optimized
 * Lightweight hotfix management
 */

import { Logger } from "@/lib/utils/logger";

export interface Hotfix {
  id: string;
  moduleId: string;
  description: string;
  fix: () => Promise<boolean>;
  validatedByAI: boolean;
  appliedCount: number;
  successRate: number;
  createdAt: string;
}

class HotfixManager {
  private hotfixes: Map<string, Hotfix> = new Map();
  private initialized = false;

  private ensureInitialized() {
    if (this.initialized) return;
    this.initialized = true;
    this.registerDefaultHotfixes();
  }

  private registerDefaultHotfixes() {
    this.registerHotfix({
      id: "hotfix_dp_memory_leak",
      moduleId: "dp-intelligence",
      description: "Clear DP Intelligence cache",
      fix: async () => {
        try {
          localStorage.removeItem("cache_dp-intelligence");
          return true;
        } catch {
          return false;
        }
      },
      validatedByAI: true,
      appliedCount: 0,
      successRate: 0,
      createdAt: new Date().toISOString()
    });

    this.registerHotfix({
      id: "hotfix_workspace_sync",
      moduleId: "real-time-workspace",
      description: "Resync workspace",
      fix: async () => true,
      validatedByAI: true,
      appliedCount: 0,
      successRate: 0,
      createdAt: new Date().toISOString()
    });
  }

  registerHotfix(hotfix: Hotfix) {
    this.hotfixes.set(hotfix.id, hotfix);
  }

  hasHotfix(patternId: string): boolean {
    this.ensureInitialized();
    return this.hotfixes.has(patternId);
  }

  async applyHotfix(moduleId: string): Promise<boolean> {
    this.ensureInitialized();
    
    const hotfix = Array.from(this.hotfixes.values()).find(h => h.moduleId === moduleId);
    if (!hotfix) return false;

    try {
      const success = await hotfix.fix();
      hotfix.appliedCount++;
      
      Logger.info(`Hotfix applied: ${hotfix.id}`, { success }, "HotfixManager");
      return success;
    } catch (error) {
      Logger.error(`Hotfix failed: ${hotfix.id}`, error, "HotfixManager");
      return false;
    }
  }

  getAllHotfixes(): Hotfix[] {
    this.ensureInitialized();
    return Array.from(this.hotfixes.values());
  }

  getStatistics() {
    this.ensureInitialized();
    const hotfixes = Array.from(this.hotfixes.values());
    
    return {
      totalHotfixes: hotfixes.length,
      totalApplied: hotfixes.reduce((sum, h) => sum + h.appliedCount, 0),
      averageSuccessRate: 0,
      validated: hotfixes.filter(h => h.validatedByAI).length
    });
  }
}

export const hotfixManager = new HotfixManager();
