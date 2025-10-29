/**
 * PATCH 596 - Persistent Mission Intelligence Core
 * 
 * Core module for retaining contextual information across multiple sessions/missions.
 * Implements:
 * - Mission history persistence (Supabase + localStorage)
 * - Pattern recognition across sessions
 * - AI-driven decision suggestions based on previous missions
 * - Context restoration and learning
 */

import { supabase } from "@/integrations/supabase/client";

export interface MissionContext {
  mission_id: string;
  context: Record<string, any>;
  decisions: Array<{
    timestamp: string;
    decision: string;
    outcome: string;
    confidence: number;
  }>;
  patterns_learned: Array<{
    pattern: string;
    frequency: number;
    success_rate: number;
  }>;
  session_count: number;
  last_session_at: string;
}

export interface MissionIntelligence {
  id: string;
  mission_id: string;
  context: Record<string, any>;
  decisions: any[];
  patterns_learned: any[];
  session_count: number;
  last_session_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * Persistent Intelligence Core Class
 */
export class PersistentIntelligenceCore {
  private localStorageKey = "mission_intelligence_cache";

  /**
   * Initialize or restore mission intelligence
   */
  async initializeMission(missionId: string): Promise<MissionContext> {
    console.log(`🧠 [Intelligence Core] Initializing mission: ${missionId}`);

    // Try to fetch from Supabase
    const existingIntelligence = await this.fetchMissionIntelligence(missionId);

    if (existingIntelligence) {
      console.log(`📖 [Intelligence Core] Restored intelligence for mission ${missionId} (Session #${existingIntelligence.session_count + 1})`);
      
      // Update session count
      await this.updateSessionCount(missionId, existingIntelligence.session_count + 1);

      // Cache locally
      this.cacheLocally(missionId, existingIntelligence);

      return {
        mission_id: missionId,
        context: existingIntelligence.context,
        decisions: existingIntelligence.decisions,
        patterns_learned: existingIntelligence.patterns_learned,
        session_count: existingIntelligence.session_count + 1,
        last_session_at: new Date().toISOString(),
      };
    }

    // Create new mission intelligence
    console.log(`✨ [Intelligence Core] Creating new intelligence for mission ${missionId}`);
    const newContext: MissionContext = {
      mission_id: missionId,
      context: {},
      decisions: [],
      patterns_learned: [],
      session_count: 1,
      last_session_at: new Date().toISOString(),
    };

    await this.persistMissionIntelligence(newContext);
    this.cacheLocally(missionId, newContext);

    return newContext;
  }

  /**
   * Fetch mission intelligence from Supabase
   */
  async fetchMissionIntelligence(missionId: string): Promise<MissionIntelligence | null> {
    try {
      const { data, error } = await supabase
        .from("mission_intelligence")
        .select("*")
        .eq("mission_id", missionId)
        .single();

      if (error) {
        console.warn(`⚠️ [Intelligence Core] No existing intelligence for mission ${missionId}`);
        return null;
      }

      return data as MissionIntelligence;
    } catch (err) {
      console.error("❌ [Intelligence Core] Error fetching intelligence:", err);
      return null;
    }
  }

  /**
   * Persist mission intelligence to Supabase
   */
  async persistMissionIntelligence(context: MissionContext): Promise<void> {
    try {
      const { error } = await supabase
        .from("mission_intelligence")
        .upsert({
          mission_id: context.mission_id,
          context: context.context,
          decisions: context.decisions,
          patterns_learned: context.patterns_learned,
          session_count: context.session_count,
          last_session_at: context.last_session_at,
        });

      if (error) {
        console.error("❌ [Intelligence Core] Error persisting intelligence:", error);
        return;
      }

      console.log(`💾 [Intelligence Core] Persisted intelligence for mission ${context.mission_id}`);
    } catch (err) {
      console.error("❌ [Intelligence Core] Exception persisting intelligence:", err);
    }
  }

  /**
   * Update session count
   */
  async updateSessionCount(missionId: string, newCount: number): Promise<void> {
    try {
      const { error } = await supabase
        .from("mission_intelligence")
        .update({
          session_count: newCount,
          last_session_at: new Date().toISOString(),
        })
        .eq("mission_id", missionId);

      if (error) {
        console.error("❌ [Intelligence Core] Error updating session count:", error);
      }
    } catch (err) {
      console.error("❌ [Intelligence Core] Exception updating session count:", err);
    }
  }

  /**
   * Add decision to mission context
   */
  async addDecision(
    missionId: string,
    decision: string,
    outcome: string,
    confidence: number = 0.8
  ): Promise<void> {
    console.log(`📝 [Intelligence Core] Adding decision to mission ${missionId}`);

    const intelligence = await this.fetchMissionIntelligence(missionId);
    if (!intelligence) {
      console.warn(`⚠️ [Intelligence Core] Mission ${missionId} not initialized`);
      return;
    }

    const newDecision = {
      timestamp: new Date().toISOString(),
      decision,
      outcome,
      confidence,
    };

    const updatedDecisions = [...intelligence.decisions, newDecision];

    const { error } = await supabase
      .from("mission_intelligence")
      .update({ decisions: updatedDecisions })
      .eq("mission_id", missionId);

    if (error) {
      console.error("❌ [Intelligence Core] Error adding decision:", error);
      return;
    }

    console.log(`✅ [Intelligence Core] Decision added successfully`);
  }

  /**
   * Learn pattern from mission data
   */
  async learnPattern(
    missionId: string,
    pattern: string,
    frequency: number,
    successRate: number
  ): Promise<void> {
    console.log(`🎓 [Intelligence Core] Learning pattern for mission ${missionId}`);

    const intelligence = await this.fetchMissionIntelligence(missionId);
    if (!intelligence) {
      console.warn(`⚠️ [Intelligence Core] Mission ${missionId} not initialized`);
      return;
    }

    const existingPatternIndex = intelligence.patterns_learned.findIndex(
      (p: any) => p.pattern === pattern
    );

    let updatedPatterns;
    if (existingPatternIndex >= 0) {
      // Update existing pattern
      updatedPatterns = [...intelligence.patterns_learned];
      updatedPatterns[existingPatternIndex] = {
        pattern,
        frequency: updatedPatterns[existingPatternIndex].frequency + frequency,
        success_rate: (updatedPatterns[existingPatternIndex].success_rate + successRate) / 2,
      };
    } else {
      // Add new pattern
      updatedPatterns = [
        ...intelligence.patterns_learned,
        { pattern, frequency, success_rate: successRate },
      ];
    }

    const { error } = await supabase
      .from("mission_intelligence")
      .update({ patterns_learned: updatedPatterns })
      .eq("mission_id", missionId);

    if (error) {
      console.error("❌ [Intelligence Core] Error learning pattern:", error);
      return;
    }

    console.log(`✅ [Intelligence Core] Pattern learned successfully`);
  }

  /**
   * Get AI suggestions based on previous missions
   */
  async getSuggestions(missionId: string): Promise<string[]> {
    console.log(`💡 [Intelligence Core] Getting suggestions for mission ${missionId}`);

    const intelligence = await this.fetchMissionIntelligence(missionId);
    if (!intelligence) {
      return ["Initialize mission first to get personalized suggestions"];
    }

    const suggestions: string[] = [];

    // Analyze patterns
    if (intelligence.patterns_learned.length > 0) {
      const topPatterns = intelligence.patterns_learned
        .sort((a: any, b: any) => b.success_rate - a.success_rate)
        .slice(0, 3);

      topPatterns.forEach((pattern: any) => {
        suggestions.push(
          `✓ Pattern "${pattern.pattern}" has ${(pattern.success_rate * 100).toFixed(0)}% success rate (seen ${pattern.frequency} times)`
        );
      });
    }

    // Analyze decisions
    if (intelligence.decisions.length > 0) {
      const successfulDecisions = intelligence.decisions.filter(
        (d: any) => d.outcome === "success" && d.confidence > 0.7
      );

      if (successfulDecisions.length > 0) {
        suggestions.push(
          `✓ ${successfulDecisions.length} high-confidence decisions succeeded in previous sessions`
        );
      }
    }

    // Session count insight
    if (intelligence.session_count > 1) {
      suggestions.push(
        `📊 This mission has been active for ${intelligence.session_count} sessions`
      );
    }

    return suggestions.length > 0
      ? suggestions
      : ["Continue mission to build intelligence history"];
  }

  /**
   * Cache mission intelligence locally for offline access
   */
  private cacheLocally(missionId: string, data: any): void {
    try {
      const cache = this.getLocalCache();
      cache[missionId] = {
        ...data,
        cached_at: new Date().toISOString(),
      };
      localStorage.setItem(this.localStorageKey, JSON.stringify(cache));
      console.log(`💾 [Intelligence Core] Cached mission ${missionId} locally`);
    } catch (err) {
      console.warn("⚠️ [Intelligence Core] Failed to cache locally:", err);
    }
  }

  /**
   * Get local cache
   */
  private getLocalCache(): Record<string, any> {
    try {
      const cache = localStorage.getItem(this.localStorageKey);
      return cache ? JSON.parse(cache) : {};
    } catch {
      return {};
    }
  }

  /**
   * Get mission intelligence from local cache (offline mode)
   */
  getFromLocalCache(missionId: string): MissionContext | null {
    const cache = this.getLocalCache();
    return cache[missionId] || null;
  }

  /**
   * Clear local cache
   */
  clearLocalCache(): void {
    localStorage.removeItem(this.localStorageKey);
    console.log("🗑️ [Intelligence Core] Local cache cleared");
  }
}

// Singleton instance
export const intelligenceCore = new PersistentIntelligenceCore();

// Demo/Example usage
export async function demonstrateIntelligenceCore() {
  console.log("🚀 [Demo] Starting Intelligence Core demonstration...");

  const missionId = `mission-demo-${Date.now()}`;

  // Initialize mission
  const context = await intelligenceCore.initializeMission(missionId);
  console.log("📋 Initial context:", context);

  // Add decisions
  await intelligenceCore.addDecision(
    missionId,
    "Deploy emergency response team",
    "success",
    0.9
  );

  await intelligenceCore.addDecision(
    missionId,
    "Activate backup power systems",
    "success",
    0.85
  );

  // Learn patterns
  await intelligenceCore.learnPattern(
    missionId,
    "Emergency procedures work best in morning hours",
    3,
    0.92
  );

  await intelligenceCore.learnPattern(
    missionId,
    "Team coordination improves with clear communication",
    5,
    0.88
  );

  // Get suggestions
  const suggestions = await intelligenceCore.getSuggestions(missionId);
  console.log("💡 Suggestions:", suggestions);

  console.log("✅ [Demo] Intelligence Core demonstration complete!");
}
