// @ts-nocheck
/**
 * PATCH 603 - Risk-Based Scheduling Service
 * Auto-generates tasks based on risk analysis and historical patterns
 */

import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";
import type { TaskRecommendation, TaskPriority } from "../types";

interface HistoricalFailurePattern {
  module: string;
  vesselId?: string;
  failureType: string;
  frequency: number;
  avgDaysBetweenFailures: number;
  lastOccurrence: Date;
  severity: number; // 1-10
}

interface CrewAvailability {
  userId: string;
  userName: string;
  role: string;
  availableFrom: Date;
  availableTo: Date;
  currentWorkload: number; // 0-100%
}

export class RiskBasedScheduler {
  /**
   * Auto-schedule tasks based on risk, history, and crew availability
   */
  static async autoRiskBasedScheduling(
    moduleName: string,
    vesselId?: string
  ): Promise<TaskRecommendation[]> {
    logger.info(`[Risk-Based Scheduler] Analyzing ${moduleName} for vessel ${vesselId || "all"}...`);

    try {
      // Step 1: Analyze historical failure patterns
      const failurePatterns = await this.analyzeHistoricalFailures(moduleName, vesselId);

      // Step 2: Get crew availability
      const crewAvailability = await this.getCrewAvailability(moduleName);

      // Step 3: Calculate risk scores and priorities
      const recommendations = await this.generateRiskBasedTasks(
        moduleName,
        vesselId,
        failurePatterns,
        crewAvailability
      );

      // Step 4: Log audit event
      await this.logAuditEvent("auto-schedule", moduleName, vesselId, recommendations.length);

      logger.info(`[Risk-Based Scheduler] Generated ${recommendations.length} risk-based tasks`);
      return recommendations;
    } catch (error) {
      logger.error("[Risk-Based Scheduler] Error in auto-scheduling:", error);
      return [];
    }
  }

  /**
   * Analyze historical failure patterns for predictive scheduling
   */
  private static async analyzeHistoricalFailures(
    moduleName: string,
    vesselId?: string
  ): Promise<HistoricalFailurePattern[]> {
    try {
      // Query inspection history and findings
      let query = supabase
        .from("auditorias")
        .select("*")
        .eq("tipo", moduleName)
        .order("data", { ascending: false })
        .limit(100);

      if (vesselId) {
        query = query.eq("vessel_id", vesselId);
      }

      const { data, error } = await query;

      if (error) {
        logger.error("[Risk-Based Scheduler] Failed to fetch inspection history:", error);
        return [];
      }

      // Analyze patterns from historical data
      const patterns: HistoricalFailurePattern[] = [];
      const failuresByType = new Map<string, any[]>();

      // Group failures by type
      (data || []).forEach((audit: any) => {
        const findings = audit.findings || [];
        findings.forEach((finding: string) => {
          if (!failuresByType.has(finding)) {
            failuresByType.set(finding, []);
          }
          failuresByType.get(finding)?.push({
            date: new Date(audit.data),
            score: audit.score
              });
        });
      });

      // Calculate patterns
      failuresByType.forEach((occurrences, failureType) => {
        if (occurrences.length > 1) {
          // Calculate average days between failures
          const sortedDates = occurrences.map(o => o.date).sort((a, b) => a.getTime() - b.getTime());
          let totalDays = 0;
          for (let i = 1; i < sortedDates.length; i++) {
            const daysDiff = Math.floor(
              (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24)
            );
            totalDays += daysDiff;
          }
          const avgDays = totalDays / (sortedDates.length - 1);

          // Calculate severity based on frequency and recency
          const lastOccurrence = sortedDates[sortedDates.length - 1];
          const daysSinceLastOccurrence = Math.floor(
            (new Date().getTime() - lastOccurrence.getTime()) / (1000 * 60 * 60 * 24)
          );
          const severity = Math.min(10, Math.max(1, 
            (occurrences.length * 2) + (10 - Math.min(10, daysSinceLastOccurrence / 10))
          ));

          patterns.push({
            module: moduleName,
            vesselId,
            failureType,
            frequency: occurrences.length,
            avgDaysBetweenFailures: avgDays,
            lastOccurrence,
            severity
          });
        }
      });

      return patterns.sort((a, b) => b.severity - a.severity);
    } catch (error) {
      logger.error("[Risk-Based Scheduler] Error analyzing failures:", error);
      return [];
    }
  }

  /**
   * Get crew availability for task assignment
   */
  private static async getCrewAvailability(moduleName: string): Promise<CrewAvailability[]> {
    try {
      // In a real implementation, this would query crew schedules, certifications, and workload
      // For now, we return a simplified structure
      const { data: users, error } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .limit(10);

      if (error) {
        logger.error("[Risk-Based Scheduler] Failed to fetch crew:", error);
        return [];
      }

      // Simulate availability data
      return (users || []).map((user: any) => ({
        userId: user.id,
        userName: user.full_name || "Unknown",
        role: user.role || "crew",
        availableFrom: new Date(),
        availableTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        currentWorkload: Math.floor(Math.random() * 100) // Random workload 0-100%
      }));
    } catch (error) {
      logger.error("[Risk-Based Scheduler] Error getting crew availability:", error);
      return [];
    }
  }

  /**
   * Generate risk-based task recommendations
   */
  private static async generateRiskBasedTasks(
    moduleName: string,
    vesselId: string | undefined,
    patterns: HistoricalFailurePattern[],
    crew: CrewAvailability[]
  ): Promise<TaskRecommendation[]> {
    const recommendations: TaskRecommendation[] = [];
    const now = new Date();

    // Generate tasks for high-risk patterns
    patterns.forEach(pattern => {
      if (pattern.severity >= 7) {
        // High severity - create urgent task
        const dueDate = new Date(now);
        const predictedDays = Math.max(7, Math.floor(pattern.avgDaysBetweenFailures * 0.7));
        dueDate.setDate(dueDate.getDate() + predictedDays);

        recommendations.push({
          title: `Preventive action: ${pattern.failureType}`,
          description: `Historical data shows recurring issue (${pattern.frequency}x). Last occurrence: ${pattern.lastOccurrence.toLocaleDateString()}. Average interval: ${Math.floor(pattern.avgDaysBetweenFailures)} days.`,
          priority: this.calculatePriority(pattern.severity),
          suggestedDueDate: dueDate,
          justification: `Predictive maintenance based on ${pattern.frequency} historical occurrences with ${Math.floor(pattern.avgDaysBetweenFailures)}-day cycle`,
          riskScore: pattern.severity,
          module: moduleName,
          relatedEntity: vesselId,
          tags: ["predictive", "high-risk", "ai-generated"]
        });
      } else if (pattern.severity >= 5) {
        // Medium severity - create routine task
        const dueDate = new Date(now);
        dueDate.setDate(dueDate.getDate() + Math.floor(pattern.avgDaysBetweenFailures * 0.9));

        recommendations.push({
          title: `Monitor: ${pattern.failureType}`,
          description: `Periodic check recommended based on historical pattern (${pattern.frequency} occurrences).`,
          priority: "medium",
          suggestedDueDate: dueDate,
          justification: `Preventive monitoring based on historical data`,
          riskScore: pattern.severity,
          module: moduleName,
          relatedEntity: vesselId,
          tags: ["monitoring", "predictive"]
        });
      }
    });

    // Find least busy crew members for assignment (future enhancement)
    const availableCrew = crew.filter(c => c.currentWorkload < 80).sort((a, b) => a.currentWorkload - b.currentWorkload);
    
    logger.info(`[Risk-Based Scheduler] Found ${availableCrew.length} available crew members`);

    return recommendations;
  }

  /**
   * Calculate priority based on severity score
   */
  private static calculatePriority(severity: number): TaskPriority {
    if (severity >= 9) return "critical";
    if (severity >= 7) return "high";
    if (severity >= 4) return "medium";
    return "low";
  }

  /**
   * Log audit event for auto-scheduling
   */
  private static async logAuditEvent(
    type: string,
    module: string,
    vesselId: string | undefined,
    taskCount: number
  ): Promise<void> {
    try {
      await supabase.from("system_logs").insert({
        event_type: type,
        source: "LLM",
        module,
        metadata: {
          vesselId,
          taskCount,
          timestamp: new Date().toISOString()
        }
      });
      
      logger.info(`[Risk-Based Scheduler] Audit log recorded: ${type}`);
    } catch (error) {
      logger.error("[Risk-Based Scheduler] Failed to log audit event:", error);
    }
  }
}
