/**
 * PATCH 548 - Priority Balancer Service
 * Refactored service for dynamic priority balancing
 */

import { supabase } from "@/integrations/supabase/client";

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

export class PriorityBalancerService {
  /**
   * Read current global context
   */
  static async readGlobalContext(): Promise<GlobalContext> {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    let timeOfDay: GlobalContext["timeOfDay"];
    if (hour >= 0 && hour < 6) timeOfDay = "night";
    else if (hour >= 6 && hour < 12) timeOfDay = "morning";
    else if (hour >= 12 && hour < 18) timeOfDay = "afternoon";
    else timeOfDay = "evening";

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
   * Rebalance priorities
   */
  static async rebalance(currentPriorities: Priority[]): Promise<{
    updatedPriorities: Priority[];
    shifts: PriorityShift[];
  }> {
    const context = await this.readGlobalContext();
    let priorities = [...currentPriorities];
    const shifts: PriorityShift[] = [];

    // Apply emergency mode adjustments
    if (context.emergencyMode) {
      priorities = priorities.map(p => {
        const oldPriority = p.priority;
        let newPriority = p.priority;

        if (p.criticality === "critical") {
          newPriority = Math.min(100, p.priority + 30);
        } else if (p.criticality === "low") {
          newPriority = Math.max(0, p.priority - 20);
        }

        if (oldPriority !== newPriority) {
          shifts.push({
            moduleId: p.moduleId,
            taskId: p.taskId,
            oldPriority,
            newPriority,
            reason: "Emergency Mode: Elevate critical tasks",
            confidence: 0.95,
            timestamp: new Date().toISOString(),
          });
        }

        return { ...p, priority: newPriority };
      });
    }

    // Apply load balancing if system is stressed
    if (context.systemLoad >= 70) {
      const loadFactor = (context.systemLoad - 70) / 30;
      
      priorities = priorities.map(p => {
        const oldPriority = p.priority;
        let newPriority = p.priority;

        if (p.criticality !== "critical") {
          const reduction = Math.floor(loadFactor * 15);
          newPriority = Math.max(0, p.priority - reduction);
        }

        if (oldPriority !== newPriority) {
          shifts.push({
            moduleId: p.moduleId,
            taskId: p.taskId,
            oldPriority,
            newPriority,
            reason: "Load Balancing: Reduce non-critical under high load",
            confidence: 0.85,
            timestamp: new Date().toISOString(),
          });
        }

        return { ...p, priority: newPriority };
      });
    }

    return { updatedPriorities: priorities, shifts };
  }

  // Private helper methods

  private static async fetchActiveIncidents(): Promise<{ count: number; hasEmergency: boolean }> {
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
    } catch {
      return { count: 0, hasEmergency: false };
    }
  }

  private static async fetchAvailableResources(): Promise<{ count: number }> {
    const hour = new Date().getHours();
    const businessHours = hour >= 8 && hour < 18;
    return { count: businessHours ? 80 : 30 };
  }

  private static async fetchSystemMetrics(): Promise<{ load: number; activeUsers: number }> {
    const hour = new Date().getHours();
    const peakHours = hour >= 9 && hour < 17;
    return {
      load: peakHours ? 65 : 35,
      activeUsers: peakHours ? 50 : 10,
    };
  }

  private static async countCriticalDeadlines(): Promise<number> {
    // Simplified implementation - would query actual deadlines in production
    return 0;
  }
}

export const priorityBalancerService = PriorityBalancerService;
