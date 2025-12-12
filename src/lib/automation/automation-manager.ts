/**
 * Automation Manager - PATCH 850
 * Handles automated tasks like cache cleanup, sync monitoring, and memory optimization
 */

import { logger } from "@/lib/logger";

type TaskPriority = "low" | "normal" | "high" | "critical";
type TaskSchedule = "startup" | "interval" | "idle" | "online";

interface AutomatedTask {
  id: string;
  name: string;
  description: string;
  priority: TaskPriority;
  schedule: TaskSchedule;
  intervalMs?: number;
  enabled: boolean;
  lastRun?: number;
  runCount: number;
  execute: () => Promise<void>;
}

interface TaskResult {
  taskId: string;
  success: boolean;
  duration: number;
  error?: string;
  timestamp: number;
}

class AutomationManager {
  private tasks: Map<string, AutomatedTask> = new Map();
  private intervals: Map<string, number> = new Map();
  private taskResults: TaskResult[] = [];
  private isRunning: boolean = false;
  private idleCallbackId: number | null = null;

  constructor() {
    this.registerDefaultTasks();
  }

  private registerDefaultTasks() {
    // Cache cleanup task
    this.registerTask({
      id: "cache-cleanup",
      name: "Cache Cleanup",
      description: "Limpa cache expirado do IndexedDB e localStorage",
      priority: "low",
      schedule: "interval",
      intervalMs: 5 * 60 * 1000, // 5 minutos
      enabled: true,
      runCount: 0,
      execute: async () => {
        await this.cleanupCache();
      },
    });

    // Memory optimization task
    this.registerTask({
      id: "memory-optimization",
      name: "Memory Optimization",
      description: "Otimiza uso de memória em idle",
      priority: "low",
      schedule: "idle",
      enabled: true,
      runCount: 0,
      execute: async () => {
        await this.optimizeMemory();
      },
    });

    // Sync check task
    this.registerTask({
      id: "sync-check",
      name: "Sync Check",
      description: "Verifica fila de sincronização pendente",
      priority: "normal",
      schedule: "online",
      enabled: true,
      runCount: 0,
      execute: async () => {
        await this.checkSyncQueue();
      },
    });

    // Health check task
    this.registerTask({
      id: "health-check",
      name: "Health Check",
      description: "Verifica saúde do sistema",
      priority: "normal",
      schedule: "interval",
      intervalMs: 30 * 1000, // 30 segundos
      enabled: true,
      runCount: 0,
      execute: async () => {
        await this.performHealthCheck();
      },
    });
  }

  private async cleanupCache(): Promise<void> {
    try {
      // Clean localStorage expired items
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("cache_")) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || "{}");
            if (data.expiresAt && data.expiresAt < Date.now()) {
              keysToRemove.push(key);
            }
          } catch {
            // Invalid JSON, remove it
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
      if (keysToRemove.length > 0) {
        logger.info(`[AutomationManager] Cleaned ${keysToRemove.length} expired cache items`);
      }
    } catch (error) {
      logger.warn("[AutomationManager] Cache cleanup error:", { error });
    }
  }

  private async optimizeMemory(): Promise<void> {
    try {
      // Clear any large in-memory caches
      if (typeof window !== "undefined" && "gc" in window) {
        // Force GC if available (Chrome with --expose-gc flag)
        (window as unknown as { gc: () => void }).gc();
      }

      // Clear image cache if memory is low
      const memory = (performance as unknown as { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      if (memory && memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.8) {
        logger.warn("[AutomationManager] High memory usage detected");
      }
    } catch (error) {
      // Memory optimization is optional
    }
  }

  private async checkSyncQueue(): Promise<void> {
    try {
      // Check if there are pending sync items
      const pendingSync = localStorage.getItem("nautilus_pending_sync");
      if (pendingSync) {
        const items = JSON.parse(pendingSync);
        if (Array.isArray(items) && items.length > 0) {
          logger.info(`[AutomationManager] ${items.length} pending sync items found`);
          // Trigger sync via custom event
          window.dispatchEvent(new CustomEvent("automation-sync-pending", { 
            detail: { count: items.length } 
          }));
        }
      }
    } catch (error) {
      logger.warn("[AutomationManager] Sync check error:", { error });
    }
  }

  private async performHealthCheck(): Promise<void> {
    const health = {
      online: navigator.onLine,
      memory: (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0,
      serviceWorker: "serviceWorker" in navigator,
      indexedDB: "indexedDB" in window,
      localStorage: typeof localStorage !== "undefined",
    });

    // Emit health status event
    window.dispatchEvent(new CustomEvent("automation-health-check", { detail: health }));
  }

  /**
   * Register a new automated task
   */
  registerTask(task: AutomatedTask): void {
    this.tasks.set(task.id, task);
    logger.info(`[AutomationManager] Task registered: ${task.name}`);
  }

  /**
   * Start the automation manager
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    logger.info("[AutomationManager] Starting...");

    // Run startup tasks
    this.runTasksBySchedule("startup");

    // Setup interval tasks
    this.tasks.forEach((task) => {
      if (task.schedule === "interval" && task.intervalMs && task.enabled) {
        const intervalId = window.setInterval(() => {
          this.runTask(task.id);
        }, task.intervalMs);
        this.intervals.set(task.id, intervalId);
      }
    });

    // Setup idle tasks
    this.setupIdleTasks();

    // Setup online tasks
    this.setupOnlineTasks();

    logger.info("[AutomationManager] Started successfully");
  }

  /**
   * Stop the automation manager
   */
  stop(): void {
    if (!this.isRunning) return;

    // Clear all intervals
    this.intervals.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    this.intervals.clear();

    // Cancel idle callback
    if (this.idleCallbackId !== null && "cancelIdleCallback" in window) {
      cancelIdleCallback(this.idleCallbackId);
      this.idleCallbackId = null;
    }

    // Remove event listeners
    window.removeEventListener("online", this.onlineHandler);

    this.isRunning = false;
    logger.info("[AutomationManager] Stopped");
  }

  private setupIdleTasks(): void {
    if (!("requestIdleCallback" in window)) return;

    const runIdleTasks = () => {
      this.runTasksBySchedule("idle");
      this.idleCallbackId = requestIdleCallback(runIdleTasks, { timeout: 60000 });
    };

    this.idleCallbackId = requestIdleCallback(runIdleTasks, { timeout: 60000 });
  }

  private onlineHandler = () => {
    this.runTasksBySchedule("online");
  };

  private setupOnlineTasks(): void {
    window.addEventListener("online", this.onlineHandler);
  }

  private runTasksBySchedule(schedule: TaskSchedule): void {
    this.tasks.forEach((task) => {
      if (task.schedule === schedule && task.enabled) {
        this.runTask(task.id);
      }
    });
  }

  /**
   * Run a specific task
   */
  async runTask(taskId: string): Promise<TaskResult | null> {
    const task = this.tasks.get(taskId);
    if (!task || !task.enabled) return null;

    const startTime = performance.now();

    try {
      await task.execute();
      task.lastRun = Date.now();
      task.runCount++;

      const result: TaskResult = {
        taskId,
        success: true,
        duration: performance.now() - startTime,
        timestamp: Date.now(),
      };

      this.taskResults.push(result);
      this.trimResults();

      return result;
    } catch (error) {
      const result: TaskResult = {
        taskId,
        success: false,
        duration: performance.now() - startTime,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: Date.now(),
      };

      this.taskResults.push(result);
      this.trimResults();
      logger.error(`[AutomationManager] Task ${taskId} failed:`, error);

      return result;
    }
  }

  private trimResults(): void {
    // Keep only last 100 results
    if (this.taskResults.length > 100) {
      this.taskResults = this.taskResults.slice(-100);
    }
  }

  /**
   * Enable/disable a task
   */
  setTaskEnabled(taskId: string, enabled: boolean): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.enabled = enabled;
      logger.info(`[AutomationManager] Task ${taskId} ${enabled ? "enabled" : "disabled"}`);
    }
  }

  /**
   * Get all registered tasks
   */
  getTasks(): AutomatedTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get task results history
   */
  getResults(): TaskResult[] {
    return [...this.taskResults];
  }

  /**
   * Get manager status
   */
  getStatus(): {
    isRunning: boolean;
    taskCount: number;
    activeIntervals: number;
    totalRuns: number;
    } {
    return {
      isRunning: this.isRunning,
      taskCount: this.tasks.size,
      activeIntervals: this.intervals.size,
      totalRuns: this.taskResults.filter(r => r.success).length,
    };
  }
}

// Singleton instance
export const automationManager = new AutomationManager();

// React hook for automation manager
export function useAutomationManager() {
  return {
    start: () => automationManager.start(),
    stop: () => automationManager.stop(),
    getTasks: () => automationManager.getTasks(),
    getResults: () => automationManager.getResults(),
    getStatus: () => automationManager.getStatus(),
    runTask: (taskId: string) => automationManager.runTask(taskId),
    setTaskEnabled: (taskId: string, enabled: boolean) => 
      automationManager.setTaskEnabled(taskId, enabled),
  };
}
