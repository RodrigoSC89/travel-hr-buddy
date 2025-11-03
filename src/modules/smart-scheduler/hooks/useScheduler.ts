/**
 * PATCH 597 - useScheduler Hook
 * React hook for smart scheduler functionality
 */

import { useState, useCallback, useEffect } from "react";
import { SmartSchedulerEngine } from "../services/SmartSchedulerEngine";
import type { ScheduledTask, TaskRecommendation, ModuleInspectionContext } from "../types";
import { logger } from "@/lib/logger";

export function useScheduler() {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const engine = SmartSchedulerEngine.getInstance();

  /**
   * Load all tasks
   */
  const loadTasks = useCallback(async (filters?: any) => {
    setLoading(true);
    setError(null);

    try {
      const fetchedTasks = await engine.getTasks(filters);
      setTasks(fetchedTasks);
      logger.info(`[useScheduler] Loaded ${fetchedTasks.length} tasks`);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error("Failed to load tasks");
      setError(errorObj);
      logger.error("[useScheduler] Error loading tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [engine]);

  /**
   * Generate tasks from inspection
   */
  const generateTasks = useCallback(async (context: ModuleInspectionContext) => {
    setLoading(true);
    setError(null);

    try {
      const recommendations = await engine.generateTasksFromInspection(context);
      logger.info(`[useScheduler] Generated ${recommendations.length} recommendations`);
      return recommendations;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error("Failed to generate tasks");
      setError(errorObj);
      logger.error("[useScheduler] Error generating tasks:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [engine]);

  /**
   * Create task from recommendation
   */
  const createTask = useCallback(async (
    recommendation: TaskRecommendation,
    assignedTo?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const task = await engine.createTask(recommendation, assignedTo);
      setTasks(prev => [...prev, task]);
      logger.info(`[useScheduler] Created task: ${task.id}`);
      return task;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error("Failed to create task");
      setError(errorObj);
      logger.error("[useScheduler] Error creating task:", err);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, [engine]);

  /**
   * Update task status
   */
  const updateStatus = useCallback(async (taskId: string, status: string) => {
    try {
      const success = await engine.updateTaskStatus(taskId, status);
      
      if (success) {
        setTasks(prev => 
          prev.map(task => 
            task.id === taskId 
              ? { ...task, status: status as any, updatedAt: new Date() }
              : task
          )
        );
        logger.info(`[useScheduler] Updated task ${taskId} to ${status}`);
      }
      
      return success;
    } catch (err) {
      logger.error("[useScheduler] Error updating task:", err);
      return false;
    }
  }, [engine]);

  /**
   * Check for overdue tasks
   */
  const checkOverdue = useCallback(async () => {
    try {
      await engine.checkOverdueTasks();
      // Reload tasks to get updated statuses
      await loadTasks();
    } catch (err) {
      logger.error("[useScheduler] Error checking overdue tasks:", err);
    }
  }, [engine, loadTasks]);

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    tasks,
    loading,
    error,
    loadTasks,
    generateTasks,
    createTask,
    updateStatus,
    checkOverdue
  };
}
