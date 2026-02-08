/**
 * PATCH 207.0 - Manual Override System
 * Allows human operators to override tactical AI decisions
 * Uses ai_decisions table as manual_overrides doesn't exist in schema
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { tacticalAI } from "./tacticalAI";

export interface ManualOverride {
  id: string;
  moduleName: string;
  enabled: boolean;
  reason: string;
  createdBy: string;
  createdAt: Date;
  expiresAt?: Date;
}

class ManualOverrideSystem {
  /**
   * Enable manual override for a module
   */
  async enableOverride(
    moduleName: string,
    reason: string,
    userId: string,
    durationMinutes?: number
  ): Promise<ManualOverride> {
    logger.info(`[ManualOverride] Enabling override for ${moduleName}`);

    const override: ManualOverride = {
      id: this.generateOverrideId(),
      moduleName,
      enabled: true,
      reason,
      createdBy: userId,
      createdAt: new Date(),
      expiresAt: durationMinutes 
        ? new Date(Date.now() + durationMinutes * 60 * 1000)
        : undefined,
    };

    // Apply override to tactical AI
    tacticalAI.setManualOverride(moduleName, true);

    // Save to database
    await this.saveOverride(override);

    return override;
  }

  /**
   * Disable manual override for a module
   */
  async disableOverride(moduleName: string, userId: string): Promise<void> {
    logger.info(`[ManualOverride] Disabling override for ${moduleName}`);

    // Remove override from tactical AI
    tacticalAI.setManualOverride(moduleName, false);

    // Update database - use ai_decisions as fallback
    await supabase
      .from("ai_decisions")
      .update({
        status: "rejected",
        rejected_reason: `Override disabled by ${userId}`,
      })
      .eq("type", "manual_override")
      .eq("title", `Override: ${moduleName}`)
      .eq("status", "approved");
  }

  /**
   * Check if module has active override
   */
  async isOverrideActive(moduleName: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from("ai_decisions")
        .select("*")
        .eq("type", "manual_override")
        .eq("title", `Override: ${moduleName}`)
        .eq("status", "approved")
        .maybeSingle();

      if (!data) return false;

      // Check if expired via metadata in justification
      const metadata = data.justification_evidence as Record<string, string> | null;
      if (metadata?.expires_at && new Date(metadata.expires_at) < new Date()) {
        await this.disableOverride(moduleName, "system");
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get active overrides
   */
  async getActiveOverrides(): Promise<ManualOverride[]> {
    try {
      const { data, error } = await supabase
        .from("ai_decisions")
        .select("*")
        .eq("type", "manual_override")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((d) => {
        const evidence = (d.justification_evidence || {}) as Record<string, string>;
        return {
          id: d.id,
          moduleName: d.title.replace("Override: ", ""),
          enabled: true,
          reason: d.description,
          createdBy: d.created_by || "system",
          createdAt: new Date(d.created_at),
          expiresAt: evidence.expires_at ? new Date(evidence.expires_at) : undefined,
        };
      });
    } catch (error) {
      logger.error("[ManualOverride] Failed to fetch active overrides:", error);
      return [];
    }
  }

  /**
   * Get override history
   */
  async getOverrideHistory(moduleName?: string, limit = 50): Promise<ManualOverride[]> {
    try {
      let query = supabase
        .from("ai_decisions")
        .select("*")
        .eq("type", "manual_override")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (moduleName) {
        query = query.eq("title", `Override: ${moduleName}`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((d) => {
        const evidence = (d.justification_evidence || {}) as Record<string, string>;
        return {
          id: d.id,
          moduleName: d.title.replace("Override: ", ""),
          enabled: d.status === "approved",
          reason: d.description,
          createdBy: d.created_by || "system",
          createdAt: new Date(d.created_at),
          expiresAt: evidence.expires_at ? new Date(evidence.expires_at) : undefined,
        };
      });
    } catch (error) {
      logger.error("[ManualOverride] Failed to fetch override history:", error);
      return [];
    }
  }

  /**
   * Save override to database
   */
  private async saveOverride(override: ManualOverride): Promise<void> {
    try {
      const { error } = await supabase
        .from("ai_decisions")
        .insert({
          title: `Override: ${override.moduleName}`,
          description: override.reason,
          type: "manual_override",
          status: "approved",
          confidence: 1.0,
          confidence_level: "high",
          impact: "medium",
          justification_reasoning: `Manual override by ${override.createdBy}: ${override.reason}`,
          justification_evidence: override.expiresAt 
            ? { expires_at: override.expiresAt.toISOString(), created_by: override.createdBy }
            : { created_by: override.createdBy },
          created_by: override.createdBy,
        });

      if (error) {
        logger.error("[ManualOverride] Failed to save override:", error);
      }
    } catch (error) {
      logger.error("[ManualOverride] Error saving override:", error);
    }
  }

  /**
   * Generate unique override ID
   */
  private generateOverrideId(): string {
    return `override-${Date.now()}-${crypto.randomUUID().slice(0, 9)}`;
  }

  /**
   * Clean up expired overrides
   */
  async cleanupExpiredOverrides(): Promise<void> {
    try {
      const { data: active } = await supabase
        .from("ai_decisions")
        .select("id, title, justification_evidence")
        .eq("type", "manual_override")
        .eq("status", "approved");

      if (active) {
        let cleaned = 0;
        for (const decision of active) {
          const evidence = (decision.justification_evidence || {}) as Record<string, string>;
          if (evidence.expires_at && new Date(evidence.expires_at) < new Date()) {
            const moduleName = decision.title.replace("Override: ", "");
            await this.disableOverride(moduleName, "system");
            cleaned++;
          }
        }
        if (cleaned > 0) {
          logger.info(`[ManualOverride] Cleaned up ${cleaned} expired overrides`);
        }
      }
    } catch (error) {
      logger.error("[ManualOverride] Failed to cleanup expired overrides:", error);
    }
  }
}

// Export singleton instance
export const manualOverrideSystem = new ManualOverrideSystem();
