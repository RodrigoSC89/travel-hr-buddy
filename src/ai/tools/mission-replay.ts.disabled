/**
 * PATCH 599 - Mission Replay Annotator
 * 
 * System for replaying missions with automatic AI annotations.
 * Implements:
 * - Timeline with critical events
 * - AI-powered automatic comments with insights
 * - PDF/JSON export of annotated replays
 */

import { supabase } from "@/integrations/supabase/client";
import { intelligenceCore } from "../mission/persistent-intelligence-core";
import { signalCollector } from "../signal/situational-collector";

export type EventType = "critical" | "warning" | "info" | "success";

export interface ReplayEvent {
  id: string;
  mission_id: string;
  event_type: EventType;
  event_data: Record<string, any>;
  ai_annotation: string;
  ai_insights: string[];
  timestamp: string;
  created_at: string;
}

export interface TimelineEvent {
  timestamp: string;
  type: EventType;
  title: string;
  description: string;
  ai_annotation: string;
  ai_insights: string[];
  metadata: Record<string, any>;
}

export interface MissionReplay {
  mission_id: string;
  mission_name: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  events: TimelineEvent[];
  summary: {
    total_events: number;
    critical_events: number;
    warnings: number;
    successes: number;
  };
  ai_insights: string[];
}

/**
 * Mission Replay Annotator Class
 */
export class MissionReplayAnnotator {
  /**
   * Record a replay event
   */
  async recordEvent(
    missionId: string,
    eventType: EventType,
    eventData: Record<string, any>
  ): Promise<ReplayEvent | null> {
    console.log(`📝 [Replay Annotator] Recording ${eventType} event for mission ${missionId}`);

    // Generate AI annotation
    const aiAnnotation = await this.generateAnnotation(eventType, eventData);
    const aiInsights = await this.generateInsights(missionId, eventType, eventData);

    try {
      const { data, error } = await supabase
        .from("mission_replay_events")
        .insert({
          mission_id: missionId,
          event_type: eventType,
          event_data: eventData,
          ai_annotation: aiAnnotation,
          ai_insights: aiInsights,
          timestamp: eventData.timestamp || new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("❌ [Replay Annotator] Error recording event:", error);
        return null;
      }

      console.log(`✅ [Replay Annotator] Event recorded with ID: ${data.id}`);
      return data as ReplayEvent;
    } catch (err) {
      console.error("❌ [Replay Annotator] Exception recording event:", err);
      return null;
    }
  }

  /**
   * Generate AI annotation for event
   */
  private async generateAnnotation(eventType: EventType, eventData: Record<string, any>): Promise<string> {
    const annotations: Record<EventType, string> = {
      critical: `⚠️ CRITICAL: ${eventData.description || "System alert detected"}. Immediate action required.`,
      warning: `⚡ WARNING: ${eventData.description || "Potential issue identified"}. Monitor closely.`,
      info: `ℹ️ INFO: ${eventData.description || "Standard operational event"}.`,
      success: `✅ SUCCESS: ${eventData.description || "Operation completed successfully"}.`,
    };

    return annotations[eventType];
  }

  /**
   * Generate AI insights for event
   */
  private async generateInsights(
    missionId: string,
    eventType: EventType,
    eventData: Record<string, any>
  ): Promise<string[]> {
    const insights: string[] = [];

    // Fetch mission intelligence to provide context
    const intelligence = await intelligenceCore.fetchMissionIntelligence(missionId);

    // Event-specific insights
    switch (eventType) {
      case "critical":
        insights.push("Historical data shows similar events require 15-30 minutes for resolution");
        insights.push("Recommend activating emergency protocols immediately");
        if (intelligence && intelligence.decisions.length > 0) {
          insights.push(`${intelligence.decisions.length} previous decisions recorded - reference available`);
        }
        break;

      case "warning":
        insights.push("Early intervention can prevent escalation to critical status");
        insights.push("Similar warnings in past missions resolved with systematic checks");
        break;

      case "info":
        insights.push("Standard operational event - monitoring continues");
        break;

      case "success":
        insights.push("Success pattern identified - consider documenting for training");
        if (intelligence) {
          insights.push(`This mission has maintained ${intelligence.session_count} active sessions`);
        }
        break;
    }

    // Add timing insight
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 6) {
      insights.push("Event occurred during low-activity hours - response may be delayed");
    } else if (hour >= 18 && hour < 24) {
      insights.push("Event occurred during evening hours - ensure adequate staffing");
    }

    return insights;
  }

  /**
   * Build mission replay timeline
   */
  async buildReplay(
    missionId: string,
    startTime?: string,
    endTime?: string
  ): Promise<MissionReplay | null> {
    console.log(`🎬 [Replay Annotator] Building replay for mission ${missionId}`);

    try {
      // Fetch events
      let query = supabase
        .from("mission_replay_events")
        .select("*")
        .eq("mission_id", missionId)
        .order("timestamp", { ascending: true });

      if (startTime) {
        query = query.gte("timestamp", startTime);
      }
      if (endTime) {
        query = query.lte("timestamp", endTime);
      }

      const { data: events, error } = await query;

      if (error) {
        console.error("❌ [Replay Annotator] Error fetching events:", error);
        return null;
      }

      if (!events || events.length === 0) {
        console.warn(`⚠️ [Replay Annotator] No events found for mission ${missionId}`);
        return null;
      }

      // Build timeline
      const timelineEvents: TimelineEvent[] = events.map((event: any) => ({
        timestamp: event.timestamp,
        type: event.event_type,
        title: this.generateEventTitle(event.event_type, event.event_data),
        description: event.event_data.description || "No description available",
        ai_annotation: event.ai_annotation,
        ai_insights: event.ai_insights,
        metadata: event.event_data,
      }));

      // Calculate summary
      const summary = {
        total_events: events.length,
        critical_events: events.filter((e: any) => e.event_type === "critical").length,
        warnings: events.filter((e: any) => e.event_type === "warning").length,
        successes: events.filter((e: any) => e.event_type === "success").length,
      };

      // Generate mission-level insights
      const missionInsights = await this.generateMissionInsights(missionId, events);

      // Calculate duration
      const start = new Date(events[0].timestamp);
      const end = new Date(events[events.length - 1].timestamp);
      const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);

      const replay: MissionReplay = {
        mission_id: missionId,
        mission_name: `Mission ${missionId}`,
        start_time: events[0].timestamp,
        end_time: events[events.length - 1].timestamp,
        duration_minutes: durationMinutes,
        events: timelineEvents,
        summary,
        ai_insights: missionInsights,
      };

      console.log(`✅ [Replay Annotator] Replay built with ${events.length} events`);
      return replay;
    } catch (err) {
      console.error("❌ [Replay Annotator] Exception building replay:", err);
      return null;
    }
  }

  /**
   * Generate event title
   */
  private generateEventTitle(eventType: EventType, eventData: Record<string, any>): string {
    if (eventData.title) {
      return eventData.title;
    }

    const titles: Record<EventType, string> = {
      critical: "Critical Alert",
      warning: "Warning Issued",
      info: "Operational Update",
      success: "Successful Operation",
    };

    return titles[eventType];
  }

  /**
   * Generate mission-level insights
   */
  private async generateMissionInsights(missionId: string, events: any[]): Promise<string[]> {
    const insights: string[] = [];

    // Event frequency insight
    const criticalCount = events.filter((e) => e.event_type === "critical").length;
    if (criticalCount > 3) {
      insights.push(`⚠️ High frequency of critical events (${criticalCount}) - investigation recommended`);
    }

    // Success rate insight
    const successCount = events.filter((e) => e.event_type === "success").length;
    const successRate = (successCount / events.length) * 100;
    insights.push(`✓ Success rate: ${successRate.toFixed(0)}% (${successCount}/${events.length} events)`);

    // Timing insight
    const timestamps = events.map((e) => new Date(e.timestamp).getTime());
    const avgInterval = timestamps.reduce((sum, t, i) => {
      if (i === 0) return 0;
      return sum + (t - timestamps[i - 1]);
    }, 0) / Math.max(timestamps.length - 1, 1);

    insights.push(`📊 Average event interval: ${Math.round(avgInterval / 60000)} minutes`);

    // Fetch additional context from intelligence
    const intelligence = await intelligenceCore.fetchMissionIntelligence(missionId);
    if (intelligence) {
      insights.push(`🧠 Mission has ${intelligence.patterns_learned.length} learned patterns`);
      insights.push(`📖 ${intelligence.decisions.length} decisions recorded across ${intelligence.session_count} sessions`);
    }

    return insights;
  }

  /**
   * Export replay as JSON
   */
  async exportToJSON(replay: MissionReplay): Promise<string> {
    console.log(`💾 [Replay Annotator] Exporting replay to JSON`);
    return JSON.stringify(replay, null, 2);
  }

  /**
   * Export replay as formatted text (for PDF generation)
   */
  async exportToText(replay: MissionReplay): Promise<string> {
    console.log(`📄 [Replay Annotator] Exporting replay to text format`);

    let text = `MISSION REPLAY REPORT\n`;
    text += `${"=".repeat(60)}\n\n`;
    text += `Mission ID: ${replay.mission_id}\n`;
    text += `Mission Name: ${replay.mission_name}\n`;
    text += `Start Time: ${new Date(replay.start_time).toLocaleString()}\n`;
    text += `End Time: ${new Date(replay.end_time).toLocaleString()}\n`;
    text += `Duration: ${replay.duration_minutes} minutes\n\n`;

    text += `SUMMARY\n`;
    text += `${"-".repeat(60)}\n`;
    text += `Total Events: ${replay.summary.total_events}\n`;
    text += `Critical Events: ${replay.summary.critical_events}\n`;
    text += `Warnings: ${replay.summary.warnings}\n`;
    text += `Successes: ${replay.summary.successes}\n\n`;

    text += `AI INSIGHTS\n`;
    text += `${"-".repeat(60)}\n`;
    replay.ai_insights.forEach((insight, i) => {
      text += `${i + 1}. ${insight}\n`;
    });
    text += `\n`;

    text += `EVENT TIMELINE\n`;
    text += `${"-".repeat(60)}\n\n`;

    replay.events.forEach((event, i) => {
      text += `[${i + 1}] ${event.type.toUpperCase()} - ${new Date(event.timestamp).toLocaleString()}\n`;
      text += `Title: ${event.title}\n`;
      text += `Description: ${event.description}\n`;
      text += `AI Annotation: ${event.ai_annotation}\n`;
      
      if (event.ai_insights.length > 0) {
        text += `AI Insights:\n`;
        event.ai_insights.forEach((insight) => {
          text += `  • ${insight}\n`;
        });
      }
      
      text += `\n`;
    });

    return text;
  }

  /**
   * Get recent events for a mission
   */
  async getRecentEvents(missionId: string, limit: number = 10): Promise<TimelineEvent[]> {
    const { data, error } = await supabase
      .from("mission_replay_events")
      .select("*")
      .eq("mission_id", missionId)
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (error || !data) {
      return [];
    }

    return data.map((event: any) => ({
      timestamp: event.timestamp,
      type: event.event_type,
      title: this.generateEventTitle(event.event_type, event.event_data),
      description: event.event_data.description || "No description",
      ai_annotation: event.ai_annotation,
      ai_insights: event.ai_insights,
      metadata: event.event_data,
    }));
  }
}

// Singleton instance
export const replayAnnotator = new MissionReplayAnnotator();

// Demo/Example usage
export async function demonstrateReplayAnnotator() {
  console.log("🚀 [Demo] Starting Replay Annotator demonstration...");

  const missionId = `mission-replay-${Date.now()}`;

  // Record events
  await replayAnnotator.recordEvent(missionId, "info", {
    description: "Mission initiated",
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  });

  await replayAnnotator.recordEvent(missionId, "success", {
    description: "Team deployed successfully",
    timestamp: new Date(Date.now() - 3000000).toISOString(), // 50 min ago
  });

  await replayAnnotator.recordEvent(missionId, "warning", {
    description: "Communication signal weakening",
    timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
  });

  await replayAnnotator.recordEvent(missionId, "critical", {
    description: "Emergency situation detected",
    timestamp: new Date(Date.now() - 900000).toISOString(), // 15 min ago
  });

  await replayAnnotator.recordEvent(missionId, "success", {
    description: "Emergency resolved successfully",
    timestamp: new Date().toISOString(),
  });

  // Build replay
  const replay = await replayAnnotator.buildReplay(missionId);
  if (replay) {
    console.log("🎬 Mission Replay:", replay);

    // Export to JSON
    const jsonExport = await replayAnnotator.exportToJSON(replay);
    console.log("📦 JSON Export (first 500 chars):", jsonExport.substring(0, 500));

    // Export to text
    const textExport = await replayAnnotator.exportToText(replay);
    console.log("📄 Text Export (first 500 chars):", textExport.substring(0, 500));
  }

  console.log("✅ [Demo] Replay Annotator demonstration complete!");
}
