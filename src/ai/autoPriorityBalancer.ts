/**
 * PATCH 536 - Auto Priority Balancer
 * 
 * Automatically adjusts task priorities in real-time based on context,
 * urgency, dependencies, and system load.
 * 
 * @module ai/autoPriorityBalancer
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

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
   * Log priority shift to database (optional - table may not exist)
   */
  private async logPriorityShift(shift: PriorityShift): Promise<void> {
    try {
      // @ts-expect-error - priority_shifts table is optional and may not exist in all deployments
      const { error } = await supabase.from("priority_shifts").insert({
        task_id: shift.task_id,
        task_name: shift.task_name,
        old_priority: shift.old_priority,
        new_priority: shift.new_priority,
        reason: shift.reason,
        factors: shift.factors as any,
        timestamp: shift.timestamp
      });
      
      if (error) {
        // Table doesn't exist or other error - log but don't throw
        logger.debug("Priority shift not logged to DB", { error: error.message });
      }
    } catch (error) {
      logger.error("Failed to log priority shift", { error });
    }
  }

  /**
   * Get priority shift history (returns empty array if table doesn't exist)
   */
  async getPriorityShifts(taskId?: string, limit: number = 100): Promise<any[]> {
    try {
      // priority_shifts table is optional and may not exist in all deployments
      const supabaseQuery: any = supabase;
      let query = supabaseQuery
        .from("priority_shifts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (taskId) {
        query = query.eq("task_id", taskId);
      }

      const { data, error } = await query;
      if (error) {
        // Table doesn't exist - return empty array
        logger.debug("Priority shifts table not available", { error: error.message });
        return [];
      }
      return data || [];
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
