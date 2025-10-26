/**
 * PATCH 207.0 - Manual Override System
 * Allows human operators to override tactical AI decisions
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

    // Update database
      await (supabase as any)
        .from('manual_overrides')
        .update({
          enabled: false,
          disabled_at: new Date().toISOString(),
          disabled_by: userId,
        })
        .eq('module_name', moduleName)
        .eq('enabled', true);
  }

  /**
   * Check if module has active override
   */
  async isOverrideActive(moduleName: string): Promise<boolean> {
    try {
      const { data } = await (supabase as any)
        .from('manual_overrides')
        .select('*')
        .eq('module_name', moduleName)
        .eq('enabled', true)
        .single();

      if (!data) return false;

      // Check if expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        await this.disableOverride(moduleName, 'system');
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
      const { data, error } = await (supabase as any)
        .from('manual_overrides')
        .select('*')
        .eq('enabled', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((d: any) => ({
        id: d.id,
        moduleName: d.module_name,
        enabled: d.enabled,
        reason: d.reason,
        createdBy: d.created_by,
        createdAt: new Date(d.created_at),
        expiresAt: d.expires_at ? new Date(d.expires_at) : undefined,
      }));
    } catch (error) {
      logger.error('[ManualOverride] Failed to fetch active overrides:', error);
      return [];
    }
  }

  /**
   * Get override history
   */
  async getOverrideHistory(moduleName?: string, limit = 50): Promise<ManualOverride[]> {
    try {
      let query = (supabase as any)
        .from('manual_overrides')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (moduleName) {
        query = query.eq('module_name', moduleName);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((d: any) => ({
        id: d.id,
        moduleName: d.module_name,
        enabled: d.enabled,
        reason: d.reason,
        createdBy: d.created_by,
        createdAt: new Date(d.created_at),
        expiresAt: d.expires_at ? new Date(d.expires_at) : undefined,
      }));
    } catch (error) {
      logger.error('[ManualOverride] Failed to fetch override history:', error);
      return [];
    }
  }

  /**
   * Save override to database
   */
  private async saveOverride(override: ManualOverride): Promise<void> {
    try {
      const { error } = await (supabase as any)
        .from('manual_overrides')
        .insert({
          id: override.id,
          module_name: override.moduleName,
          enabled: override.enabled,
          reason: override.reason,
          created_by: override.createdBy,
          created_at: override.createdAt.toISOString(),
          expires_at: override.expiresAt?.toISOString(),
        });

      if (error) {
        logger.error('[ManualOverride] Failed to save override:', error);
      }
    } catch (error) {
      logger.error('[ManualOverride] Error saving override:', error);
    }
  }

  /**
   * Generate unique override ID
   */
  private generateOverrideId(): string {
    return `override-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clean up expired overrides
   */
  async cleanupExpiredOverrides(): Promise<void> {
    try {
      const { data: expired } = await (supabase as any)
        .from('manual_overrides')
        .select('module_name')
        .eq('enabled', true)
        .lt('expires_at', new Date().toISOString());

      if (expired) {
        for (const override of expired) {
          await this.disableOverride(override.module_name, 'system');
        }
        logger.info(`[ManualOverride] Cleaned up ${expired.length} expired overrides`);
      }
    } catch (error) {
      logger.error('[ManualOverride] Failed to cleanup expired overrides:', error);
    }
  }
}

// Export singleton instance
export const manualOverrideSystem = new ManualOverrideSystem();
