/**
 * PATCH 597 - Smart Scheduler Engine
 * Core engine for AI-powered task scheduling and generation
 */

import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";
import type { 
  ScheduledTask, 
  TaskRecommendation, 
  SchedulerConfig,
  ModuleInspectionContext 
} from "../types";
import { LLMTaskEngine } from "./LLMTaskEngine";
import { watchdogService } from "@/modules/system-watchdog/watchdog-service";

export class SmartSchedulerEngine {
  private static instance: SmartSchedulerEngine;
  private config: SchedulerConfig = {
    autoGenerateTasks: true,
    notifyAssignees: true,
    integrateWatchdog: true,
    enablePredictive: true,
    defaultPriority: "medium",
    defaultDueDays: 7
  };

  private constructor() {}

  static getInstance(): SmartSchedulerEngine {
    if (!SmartSchedulerEngine.instance) {
      SmartSchedulerEngine.instance = new SmartSchedulerEngine();
    }
    return SmartSchedulerEngine.instance;
  }

  /**
   * Generate tasks based on module inspection
   */
  async generateTasksFromInspection(
    context: ModuleInspectionContext
  ): Promise<TaskRecommendation[]> {
    logger.info(`[Smart Scheduler] Generating tasks for ${context.moduleName}...`);

    try {
      // Use LLM to generate intelligent task recommendations
      const recommendations = await LLMTaskEngine.generateTasks(context);

      logger.info(`[Smart Scheduler] Generated ${recommendations.length} task recommendations`);
      return recommendations;
    } catch (error) {
      logger.error("[Smart Scheduler] Failed to generate tasks:", error);
      return [];
    }
  }

  /**
   * Create task from recommendation
   */
  async createTask(
    recommendation: TaskRecommendation,
    assignedTo?: string
  ): Promise<ScheduledTask> {
    const task: ScheduledTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      module: recommendation.module,
      relatedEntity: recommendation.relatedEntity,
      title: recommendation.title,
      description: recommendation.description,
      priority: recommendation.priority,
      dueDate: recommendation.suggestedDueDate,
      assignedTo,
      aiGenerated: true,
      status: "pending",
      source: "ai_generated",
      tags: recommendation.tags,
      metadata: {
        justification: recommendation.justification,
        riskScore: recommendation.riskScore
      },
      createdAt: new Date()
    };

    // Save to Supabase
    try {
      const { error } = await supabase.from("scheduled_tasks").insert({
        id: task.id,
        module: task.module,
        related_entity: task.relatedEntity,
        description: task.description,
        priority: task.priority,
        due_date: task.dueDate.toISOString(),
        assigned_to: task.assignedTo,
        ai_generated: task.aiGenerated,
        status: task.status,
        created_at: task.createdAt.toISOString()
      });

      if (error) {
        logger.error("[Smart Scheduler] Failed to save task to Supabase:", error);
      } else {
        logger.info(`[Smart Scheduler] Task ${task.id} created successfully`);
        
        // Notify assignee if configured
        if (this.config.notifyAssignees && task.assignedTo) {
          await this.notifyAssignee(task);
        }
      }
    } catch (error) {
      logger.error("[Smart Scheduler] Error saving task:", error);
    }

    return task;
  }

  /**
   * Get all scheduled tasks
   */
  async getTasks(filters?: {
    status?: string;
    module?: string;
    priority?: string;
    assignedTo?: string;
  }): Promise<ScheduledTask[]> {
    try {
      let query = supabase.from("scheduled_tasks").select("*");

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.module) {
        query = query.eq("module", filters.module);
      }
      if (filters?.priority) {
        query = query.eq("priority", filters.priority);
      }
      if (filters?.assignedTo) {
        query = query.eq("assigned_to", filters.assignedTo);
      }

      const { data, error } = await query.order("due_date", { ascending: true });

      if (error) {
        logger.error("[Smart Scheduler] Failed to fetch tasks:", error);
        return [];
      }

      return (data || []).map(this.mapFromSupabase);
    } catch (error) {
      logger.error("[Smart Scheduler] Error fetching tasks:", error);
      return [];
    }
  }

  /**
   * Update task status
   */
  async updateTaskStatus(taskId: string, status: string): Promise<boolean> {
    try {
      const updates: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === "completed") {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("scheduled_tasks")
        .update(updates)
        .eq("id", taskId);

      if (error) {
        logger.error("[Smart Scheduler] Failed to update task:", error);
        return false;
      }

      logger.info(`[Smart Scheduler] Task ${taskId} updated to ${status}`);
      return true;
    } catch (error) {
      logger.error("[Smart Scheduler] Error updating task:", error);
      return false;
    }
  }

  /**
   * Check for overdue tasks and alert via watchdog
   */
  async checkOverdueTasks(): Promise<void> {
    const tasks = await this.getTasks({ status: "pending" });
    const now = new Date();

    const overdueTasks = tasks.filter(task => task.dueDate < now);

    if (overdueTasks.length > 0 && this.config.integrateWatchdog) {
      logger.warn(`[Smart Scheduler] Found ${overdueTasks.length} overdue tasks`);

      // Alert via watchdog
      for (const task of overdueTasks) {
        // Update task status
        await this.updateTaskStatus(task.id, "overdue");
        
        // Would trigger watchdog alert in production
        logger.warn(`[Smart Scheduler] Task ${task.id} is overdue: ${task.title}`);
      }
    }
  }

  /**
   * Schedule automatic task generation
   */
  startAutoGeneration(intervalMs: number = 3600000): void {
    if (!this.config.autoGenerateTasks) {
      logger.info("[Smart Scheduler] Auto-generation is disabled");
      return;
    }

    logger.info("[Smart Scheduler] Starting automatic task generation...");

    setInterval(async () => {
      try {
        // Check for overdue tasks
        await this.checkOverdueTasks();

        // Generate predictive tasks based on patterns
        if (this.config.enablePredictive) {
          // Would analyze historical data and generate predictive tasks
          logger.info("[Smart Scheduler] Running predictive task generation...");
        }
      } catch (error) {
        logger.error("[Smart Scheduler] Auto-generation error:", error);
      }
    }, intervalMs);
  }

  /**
   * Notify assignee about new task
   */
  private async notifyAssignee(task: ScheduledTask): Promise<void> {
    // In production, this would send email/push notification
    logger.info(`[Smart Scheduler] Notifying ${task.assignedTo} about task ${task.id}`);
  }

  /**
   * Map Supabase data to ScheduledTask
   */
  private mapFromSupabase(data: any): ScheduledTask {
    return {
      id: data.id,
      module: data.module,
      relatedEntity: data.related_entity,
      title: data.title || data.description?.substring(0, 50) || "Untitled Task",
      description: data.description,
      priority: data.priority,
      dueDate: new Date(data.due_date),
      createdBy: data.created_by,
      assignedTo: data.assigned_to,
      aiGenerated: data.ai_generated || false,
      status: data.status,
      source: data.source || "manual",
      tags: data.tags || [],
      metadata: data.metadata || {},
      createdAt: new Date(data.created_at),
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined
    };
  }

  /**
   * Get configuration
   */
  getConfig(): SchedulerConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<SchedulerConfig>): void {
    this.config = { ...this.config, ...updates };
    logger.info("[Smart Scheduler] Configuration updated:", this.config);
  }
}
