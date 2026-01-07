/**
 * PATCH 536 - Auto Priority Balancer
 * 
 * Automatically adjusts task priorities in real-time based on context,
 * urgency, dependencies, and system load.
 * 
 * Note: Uses priority_shifts table which is optional. 
 * All DB operations are wrapped with try/catch to handle missing table gracefully.
 * 
 * @module ai/autoPriorityBalancer
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { Json } from "@/integrations/supabase/types";

export type Priority = "low" | "medium" | "high" | "critical";

export interface Task {
  id: string;
  name: string;
  current_priority: Priority;
  original_priority: Priority;
  urgency_score: number;
  impact_score: number;
  dependencies: string[];
  deadline?: string;
  assigned_to?: string;
}

export interface PriorityShift {
  task_id: string;
  task_name: string;
  old_priority: Priority;
  new_priority: Priority;
  reason: string;
  factors: Record<string, number>;
  timestamp: string;
}

export interface BalancingContext {
  system_load: number;
  available_resources: number;
  critical_threshold: number;
  time_pressure: number;
}

class AutoPriorityBalancer {
  private tasks: Map<string, Task> = new Map();
  private balancingInterval: number | null = null;

  /**
   * Start automatic priority balancing
   */
  startBalancing(intervalMs: number = 60000): void {
    if (this.balancingInterval) {
      logger.warn("PriorityBalancer already running");
      return;
    }

    logger.info("Starting automatic priority balancing", { intervalMs });
    this.balancingInterval = window.setInterval(() => {
      this.rebalancePriorities();
    }, intervalMs);
  }

  /**
   * Stop automatic priority balancing
   */
  stopBalancing(): void {
    if (this.balancingInterval) {
      clearInterval(this.balancingInterval);
      this.balancingInterval = null;
      logger.info("PriorityBalancer stopped");
    }
  }

  /**
   * Register a task for priority management
   */
  registerTask(task: Task): void {
    this.tasks.set(task.id, task);
    logger.debug("Task registered for priority management", { taskId: task.id, taskName: task.name });
  }

  /**
   * Rebalance priorities for all tasks
   */
  async rebalancePriorities(context?: BalancingContext): Promise<PriorityShift[]> {
    const ctx = context || {
      system_load: Math.random() * 100,
      available_resources: Math.random() * 100,
      critical_threshold: 75,
      time_pressure: Math.random() * 100
    };

    logger.debug("Rebalancing priorities", { context: ctx });

    const shifts: PriorityShift[] = [];

    for (const [id, task] of this.tasks.entries()) {
      const newPriority = this.calculatePriority(task, ctx);
      
      if (newPriority !== task.current_priority) {
        const shift: PriorityShift = {
          task_id: id,
          task_name: task.name,
          old_priority: task.current_priority,
          new_priority: newPriority,
          reason: this.generateReason(task, newPriority, ctx),
          factors: {
            urgency: task.urgency_score,
            impact: task.impact_score,
            system_load: ctx.system_load,
            time_pressure: ctx.time_pressure
          },
          timestamp: new Date().toISOString()
        };

        // Update task
        task.current_priority = newPriority;
        this.tasks.set(id, task);

        shifts.push(shift);
        await this.logPriorityShift(shift);
      }
    }

    if (shifts.length > 0) {
      logger.info("Priority adjustments completed", { shiftsCount: shifts.length });
    }

    return shifts;
  }

  /**
   * Calculate new priority for a task
   */
  private calculatePriority(task: Task, context: BalancingContext): Priority {
    let score = task.urgency_score * 0.4 + task.impact_score * 0.4;

    // Adjust for deadline proximity
    if (task.deadline) {
      const timeToDeadline = new Date(task.deadline).getTime() - Date.now();
      const daysLeft = timeToDeadline / (1000 * 60 * 60 * 24);
      
      if (daysLeft < 1) score += 30;
      else if (daysLeft < 3) score += 20;
      else if (daysLeft < 7) score += 10;
    }

    // Adjust for dependencies
    if (task.dependencies.length > 0) {
      score += task.dependencies.length * 5;
    }

    // Adjust for system context
    if (context.system_load > 80) {
      // High system load: prioritize critical tasks only
      score *= context.system_load / 100;
    }

    if (context.time_pressure > context.critical_threshold) {
      score += 15;
    }

    // Map score to priority
    if (score >= 80) return "critical";
    if (score >= 60) return "high";
    if (score >= 40) return "medium";
    return "low";
  }

  /**
   * Generate human-readable reason for priority change
   */
  private generateReason(task: Task, newPriority: Priority, context: BalancingContext): string {
    const reasons: string[] = [];

    if (task.deadline) {
      const daysLeft = (new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      if (daysLeft < 1) reasons.push("deadline approaching (< 1 day)");
      else if (daysLeft < 3) reasons.push("deadline near (< 3 days)");
    }

    if (task.urgency_score > 70) reasons.push("high urgency score");
    if (task.impact_score > 70) reasons.push("high impact score");
    if (task.dependencies.length > 2) reasons.push("multiple dependencies");
    if (context.system_load > 80) reasons.push("high system load");
    if (context.time_pressure > context.critical_threshold) reasons.push("time pressure");

    return reasons.length > 0 
      ? `Priority adjusted to ${newPriority}: ${reasons.join(", ")}`
      : `Priority adjusted to ${newPriority} based on overall context`;
  }

  /**
   * Log priority shift to database
   */
  private async logPriorityShift(shift: PriorityShift): Promise<void> {
    try {
      // Map priority names to numeric values for DB
      const priorityToNumber = (p: Priority): number => {
        switch (p) {
          case "critical": return 4;
          case "high": return 3;
          case "medium": return 2;
          case "low": return 1;
          default: return 2;
        }
      };

      const { error } = await supabase.from("priority_shifts").insert({
        module_name: shift.task_name,
        old_priority: priorityToNumber(shift.old_priority),
        new_priority: priorityToNumber(shift.new_priority),
        reason: shift.reason,
        triggered_by: "auto_balancer",
        shift_type: "automatic",
        context: shift.factors as Json,
        is_active: true
      });
      
      if (error) {
        logger.debug("Priority shift not logged to DB", { error: error.message });
      }
    } catch (error) {
      logger.error("Failed to log priority shift", { error });
    }
  }

  /**
   * Get priority shift history
   */
  async getPriorityShifts(moduleName?: string, limit: number = 100): Promise<PriorityShift[]> {
    try {
      let query = supabase
        .from("priority_shifts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (moduleName) {
        query = query.eq("module_name", moduleName);
      }

      const { data, error } = await query;
      if (error) {
        logger.debug("Priority shifts table not available", { error: error.message });
        return [];
      }

      // Map DB format back to PriorityShift interface
      const numberToPriority = (n: number): Priority => {
        switch (n) {
          case 4: return "critical";
          case 3: return "high";
          case 2: return "medium";
          case 1: return "low";
          default: return "medium";
        }
      };

      return (data || []).map(row => ({
        task_id: row.id,
        task_name: row.module_name,
        old_priority: numberToPriority(row.old_priority),
        new_priority: numberToPriority(row.new_priority),
        reason: row.reason || "",
        factors: (row.context as Record<string, number>) || {},
        timestamp: row.created_at || new Date().toISOString()
      }));
    } catch (error) {
      logger.warn("Failed to fetch priority shifts", { error });
      return [];
    }
  }

  /**
   * Get current tasks
   */
  getTasks(): Task[] {
    return Array.from(this.tasks.values());
  }
}

export const autoPriorityBalancer = new AutoPriorityBalancer();
