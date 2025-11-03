/**
 * PATCH 597 - LLM Task Engine
 * AI-powered task generation using language models
 */

import { logger } from "@/lib/logger";
import { runAIContext } from "@/ai/kernel";
import type { TaskRecommendation, ModuleInspectionContext, TaskPriority } from "../types";

export class LLMTaskEngine {
  /**
   * Generate task recommendations using AI
   */
  static async generateTasks(
    context: ModuleInspectionContext
  ): Promise<TaskRecommendation[]> {
    logger.info(`[LLM Task Engine] Generating tasks for ${context.moduleName}...`);

    try {
      const prompt = this.buildPrompt(context);
      
      // Call AI service
      const aiResponse = await runAIContext({
        module: "smart-scheduler",
        action: "generate_tasks",
        context: {
          prompt,
          moduleName: context.moduleName,
          vesselId: context.vesselId,
          score: context.score
        }
      });

      // Parse AI response into task recommendations
      const recommendations = this.parseAIResponse(aiResponse, context);

      logger.info(`[LLM Task Engine] Generated ${recommendations.length} recommendations`);
      return recommendations;
    } catch (error) {
      logger.error("[LLM Task Engine] Failed to generate tasks:", error);
      
      // Fallback to rule-based task generation
      return this.generateFallbackTasks(context);
    }
  }

  /**
   * Build prompt for LLM
   */
  private static buildPrompt(context: ModuleInspectionContext): string {
    const { moduleName, vesselId, lastInspection, score, findings, history } = context;

    return `
Based on the following inspection data for module "${moduleName}", generate a list of preventive and corrective operational tasks:

**Vessel ID:** ${vesselId || "N/A"}
**Last Inspection:** ${lastInspection ? lastInspection.toISOString() : "Never"}
**Current Score:** ${score || "N/A"}
**Recent Findings:** ${findings?.join(", ") || "None"}

Generate tasks with:
- **Title:** Clear, actionable task name
- **Priority:** Critical, High, Medium, or Low
- **Suggested Due Date:** In days from now (e.g., 7, 14, 30)
- **Justification:** Why this task is needed
- **Risk Score:** 1-10 scale

Format response as JSON array of tasks.

Example:
[
  {
    "title": "Inspect safety equipment",
    "description": "Complete inspection of all safety equipment following recent findings",
    "priority": "High",
    "dueDays": 7,
    "justification": "Recent inspection found outdated safety equipment",
    "riskScore": 8
  }
]
`;
  }

  /**
   * Parse AI response into task recommendations
   */
  private static parseAIResponse(
    aiResponse: any,
    context: ModuleInspectionContext
  ): TaskRecommendation[] {
    try {
      // Extract tasks from AI response
      const tasksData = aiResponse?.tasks || [];
      
      return tasksData.map((taskData: any) => {
        const dueDays = taskData.dueDays || 7;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + dueDays);

        return {
          title: taskData.title,
          description: taskData.description,
          priority: this.normalizePriority(taskData.priority),
          suggestedDueDate: dueDate,
          justification: taskData.justification,
          riskScore: taskData.riskScore || 5,
          module: context.moduleName,
          relatedEntity: context.vesselId,
          tags: taskData.tags || []
        };
      });
    } catch (error) {
      logger.error("[LLM Task Engine] Failed to parse AI response:", error);
      return [];
    }
  }

  /**
   * Normalize priority string
   */
  private static normalizePriority(priority: string): TaskPriority {
    const normalized = priority?.toLowerCase() || "medium";
    
    if (normalized.includes("critical")) return "critical";
    if (normalized.includes("high")) return "high";
    if (normalized.includes("low")) return "low";
    return "medium";
  }

  /**
   * Generate fallback tasks using rules
   */
  private static generateFallbackTasks(
    context: ModuleInspectionContext
  ): TaskRecommendation[] {
    const recommendations: TaskRecommendation[] = [];
    const now = new Date();

    // Rule-based task generation
    if (context.score && context.score < 70) {
      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + 7);

      recommendations.push({
        title: `Improve ${context.moduleName} compliance score`,
        description: `Current score (${context.score}) is below acceptable threshold. Review and address all findings.`,
        priority: "high",
        suggestedDueDate: dueDate,
        justification: "Low compliance score requires immediate attention",
        riskScore: 8,
        module: context.moduleName,
        relatedEntity: context.vesselId,
        tags: ["compliance", "urgent"]
      });
    }

    if (context.findings && context.findings.length > 0) {
      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + 14);

      recommendations.push({
        title: `Address ${context.moduleName} findings`,
        description: `${context.findings.length} findings require attention: ${context.findings.slice(0, 3).join(", ")}`,
        priority: "medium",
        suggestedDueDate: dueDate,
        justification: "Recent inspection identified issues requiring follow-up",
        riskScore: 6,
        module: context.moduleName,
        relatedEntity: context.vesselId,
        tags: ["inspection", "follow-up"]
      });
    }

    // Always schedule next inspection
    const nextInspectionDate = new Date(now);
    nextInspectionDate.setDate(nextInspectionDate.getDate() + 30);

    recommendations.push({
      title: `Schedule next ${context.moduleName} inspection`,
      description: "Regular inspection to maintain compliance and safety standards",
      priority: "medium",
      suggestedDueDate: nextInspectionDate,
      justification: "Regular inspections required for ongoing compliance",
      riskScore: 4,
      module: context.moduleName,
      relatedEntity: context.vesselId,
      tags: ["inspection", "routine"]
    });

    return recommendations;
  }
}
