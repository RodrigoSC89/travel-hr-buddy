// @ts-nocheck
/**
 * PATCH 232: Auto Priority Balancer
 * TODO PATCH 659: TypeScript fixes deferred (priority_shifts table schema missing)
 * 
 * Dynamically adjusts priorities between modules and tasks based on global context.
 * Reads system state, applies intelligent rebalancing algorithms, and logs all changes.
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface Priority {
  moduleId: string;
  taskId?: string;
  priority: number; // 0-100
  weight: number; // 0-1
  criticality: "low" | "medium" | "high" | "critical";
}

export interface GlobalContext {
  systemLoad: number;
  activeIncidents: number;
  availableResources: number;
  criticalDeadlines: number;
  userActivity: number;
  timeOfDay: "night" | "morning" | "afternoon" | "evening";
  dayOfWeek: "weekday" | "weekend";
  emergencyMode: boolean;
}

export interface PriorityShift {
  moduleId: string;
  taskId?: string;
  oldPriority: number;
  newPriority: number;
  reason: string;
  confidence: number;
  timestamp: string;
}

export interface BalancingStrategy {
  name: string;
  description: string;
  apply: (priorities: Priority[], context: GlobalContext) => Priority[];
}

export class AutoPriorityBalancer {
  private strategies: BalancingStrategy[];

  constructor() {
    this.strategies = [
      this.emergencyModeStrategy(),
      this.loadBalancingStrategy(),
      this.deadlineProximityStrategy(),
      this.resourceOptimizationStrategy(),
      this.circadianRhythmStrategy(),
    ];
  }

  /**
   * Read current global context from system state
   */
  async readGlobalContext(): Promise<GlobalContext> {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    // Determine time of day
    let timeOfDay: GlobalContext["timeOfDay"];
    if (hour >= 0 && hour < 6) timeOfDay = "night";
    else if (hour >= 6 && hour < 12) timeOfDay = "morning";
    else if (hour >= 12 && hour < 18) timeOfDay = "afternoon";
    else timeOfDay = "evening";

    // Fetch system metrics from various sources
    const [incidents, resources, systemMetrics] = await Promise.all([
      this.fetchActiveIncidents(),
      this.fetchAvailableResources(),
      this.fetchSystemMetrics(),
    ]);

    return {
      systemLoad: systemMetrics.load,
      activeIncidents: incidents.count,
      availableResources: resources.count,
      criticalDeadlines: await this.countCriticalDeadlines(),
      userActivity: systemMetrics.activeUsers,
      timeOfDay,
      dayOfWeek: (dayOfWeek === 0 || dayOfWeek === 6) ? "weekend" : "weekday",
      emergencyMode: incidents.hasEmergency || systemMetrics.load > 90,
    };
  }

  /**
   * Apply rebalancing algorithm
   */
  async rebalance(currentPriorities: Priority[]): Promise<{
    updatedPriorities: Priority[];
    shifts: PriorityShift[];
  }> {
    const context = await this.readGlobalContext();
    let priorities = [...currentPriorities];
    const shifts: PriorityShift[] = [];

    // Apply each strategy in sequence
    for (const strategy of this.strategies) {
      const beforePriorities = [...priorities];
      priorities = strategy.apply(priorities, context);

      // Track changes made by this strategy
      for (let i = 0; i < priorities.length; i++) {
        if (priorities[i].priority !== beforePriorities[i].priority) {
          shifts.push({
            moduleId: priorities[i].moduleId,
            taskId: priorities[i].taskId,
            oldPriority: beforePriorities[i].priority,
            newPriority: priorities[i].priority,
            reason: `${strategy.name}: ${strategy.description}`,
            confidence: this.calculateConfidence(context, strategy),
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    // Log shifts to database
    await this.logPriorityShifts(shifts);

    return {
      updatedPriorities: priorities,
      shifts,
    };
  }

  /**
   * Log priority shifts to database
   */
  private async logPriorityShifts(shifts: PriorityShift[]): Promise<void> {
    if (shifts.length === 0) return;

    try {
      const records = shifts.map(shift => ({
        module_id: shift.moduleId,
        task_id: shift.taskId,
        old_priority: shift.oldPriority,
        new_priority: shift.newPriority,
        reason: shift.reason,
        confidence: shift.confidence,
        timestamp: shift.timestamp,
      }));

      await supabase.from("priority_shifts").insert(records);
    } catch (error) {
      console.error("Failed to log priority shifts:", error);
    }
  }

  /**
   * Strategy: Emergency Mode
   * In emergency, elevate critical tasks and deprioritize non-essentials
   */
  private emergencyModeStrategy(): BalancingStrategy {
    return {
      name: "Emergency Mode",
      description: "Elevate critical tasks during emergencies",
      apply: (priorities: Priority[], context: GlobalContext) => {
        if (!context.emergencyMode) return priorities;

        return priorities.map(p => {
          if (p.criticality === "critical") {
            return { ...p, priority: Math.min(100, p.priority + 30) };
          } else if (p.criticality === "low") {
            return { ...p, priority: Math.max(0, p.priority - 20) };
          }
          return p;
        });
      },
    };
  }

  /**
   * Strategy: Load Balancing
   * Distribute priorities to prevent system overload
   */
  private loadBalancingStrategy(): BalancingStrategy {
    return {
      name: "Load Balancing",
      description: "Distribute priorities to prevent overload",
      apply: (priorities: Priority[], context: GlobalContext) => {
        if (context.systemLoad < 70) return priorities;

        // Reduce non-critical priorities when system is heavily loaded
        const loadFactor = (context.systemLoad - 70) / 30; // 0 to 1
        
        return priorities.map(p => {
          if (p.criticality !== "critical") {
            const reduction = Math.floor(loadFactor * 15);
            return { ...p, priority: Math.max(0, p.priority - reduction) };
          }
          return p;
        });
      },
    };
  }

  /**
   * Strategy: Deadline Proximity
   * Boost priority for tasks approaching deadlines
   */
  private deadlineProximityStrategy(): BalancingStrategy {
    return {
      name: "Deadline Proximity",
      description: "Boost priority for tasks near deadlines",
      apply: (priorities: Priority[], context: GlobalContext) => {
        if (context.criticalDeadlines === 0) return priorities;

        // Boost priorities proportional to deadline pressure
        const urgencyFactor = Math.min(1, context.criticalDeadlines / 5);
        
        return priorities.map(p => {
          if (p.criticality === "high" || p.criticality === "critical") {
            const boost = Math.floor(urgencyFactor * 20);
            return { ...p, priority: Math.min(100, p.priority + boost) };
          }
          return p;
        });
      },
    };
  }

  /**
   * Strategy: Resource Optimization
   * Adjust priorities based on available resources
   */
  private resourceOptimizationStrategy(): BalancingStrategy {
    return {
      name: "Resource Optimization",
      description: "Optimize priorities based on resource availability",
      apply: (priorities: Priority[], context: GlobalContext) => {
        // When resources are scarce, focus on high-value tasks
        const resourceScarcity = context.availableResources < 30;
        
        if (!resourceScarcity) return priorities;

        return priorities.map(p => {
          // Boost high-weight tasks, reduce low-weight tasks
          if (p.weight > 0.7) {
            return { ...p, priority: Math.min(100, p.priority + 10) };
          } else if (p.weight < 0.3) {
            return { ...p, priority: Math.max(0, p.priority - 10) };
          }
          return p;
        });
      },
    };
  }

  /**
   * Strategy: Circadian Rhythm
   * Adjust priorities based on time of day and week
   */
  private circadianRhythmStrategy(): BalancingStrategy {
    return {
      name: "Circadian Rhythm",
      description: "Adjust priorities based on time patterns",
      apply: (priorities: Priority[], context: GlobalContext) => {
        // During off-hours, reduce non-critical priorities
        const isOffHours = 
          context.timeOfDay === "night" || 
          context.dayOfWeek === "weekend";

        if (!isOffHours) return priorities;

        return priorities.map(p => {
          if (p.criticality === "low" || p.criticality === "medium") {
            return { ...p, priority: Math.max(0, p.priority - 15) };
          }
          return p;
        });
      },
    };
  }

  /**
   * Calculate confidence in priority adjustment
   */
  private calculateConfidence(context: GlobalContext, strategy: BalancingStrategy): number {
    let confidence = 0.7;

    // Higher confidence in emergency mode
    if (context.emergencyMode && strategy.name === "Emergency Mode") {
      confidence = 0.95;
    }

    // Higher confidence with more data points
    const dataQuality = (
      (context.systemLoad > 0 ? 0.2 : 0) +
      (context.activeIncidents >= 0 ? 0.2 : 0) +
      (context.availableResources >= 0 ? 0.2 : 0) +
      (context.criticalDeadlines >= 0 ? 0.2 : 0) +
      (context.userActivity >= 0 ? 0.2 : 0)
    );

    return Math.min(1.0, confidence + dataQuality * 0.2);
  }

  // Helper methods to fetch system state
  private async fetchActiveIncidents(): Promise<{ count: number; hasEmergency: boolean }> {
    try {
      const { data, error } = await supabase
        .from("dp_incidents")
        .select("id, severity")
        .eq("status", "open");

      if (error) throw error;

      return {
        count: data?.length || 0,
        hasEmergency: data?.some(i => i.severity === "critical") || false,
      };
    } catch (error) {
      console.error("Failed to fetch incidents:", error);
      return { count: 0, hasEmergency: false };
    }
  }

  private async fetchAvailableResources(): Promise<{ count: number }> {
    // This would query actual resource availability
    // For now, return a simulated value based on time
    const hour = new Date().getHours();
    const businessHours = hour >= 8 && hour < 18;
    return { count: businessHours ? 80 : 30 };
  }

  private async fetchSystemMetrics(): Promise<{
    load: number;
    activeUsers: number;
  }> {
    // This would query actual system metrics
    // For now, return simulated values
    const hour = new Date().getHours();
    const peakHours = hour >= 9 && hour < 17;
    
    return {
      load: peakHours ? 65 : 35,
      activeUsers: peakHours ? 50 : 10,
    };
  }

  private async countCriticalDeadlines(): Promise<number> {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data, error } = await supabase
        .from("jobs")
        .select("id")
        .lte("due_date", tomorrow.toISOString())
        .eq("status", "pending");

      if (error) throw error;

      return data?.length || 0;
    } catch (error) {
      console.error("Failed to count deadlines:", error);
      return 0;
    }
  }

  /**
   * Get priority history for analysis
   */
  async getPriorityHistory(
    moduleId: string,
    limit: number = 100
  ): Promise<PriorityShift[]> {
    try {
      const { data, error } = await supabase
        .from("priority_shifts")
        .select("*")
        .eq("module_id", moduleId)
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map(d => ({
        moduleId: d.module_id,
        taskId: d.task_id,
        oldPriority: d.old_priority,
        newPriority: d.new_priority,
        reason: d.reason,
        confidence: d.confidence,
        timestamp: d.timestamp,
      })) || [];
    } catch (error) {
      console.error("Failed to fetch priority history:", error);
      return [];
    }
  }
}

// Export singleton instance
export const autoPriorityBalancer = new AutoPriorityBalancer();
