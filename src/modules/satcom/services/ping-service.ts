/**
 * PATCH 476: SATCOM Ping Service
 * Simulates satellite link pings and monitors connectivity
 */

import { supabase } from "@/integrations/supabase/client";

export interface SatcomLink {
  id: string;
  vessel_id: string | null;
  name: string;
  provider: "Iridium" | "Starlink" | "Inmarsat" | "Thuraya";
  status: "online" | "offline" | "degraded";
  signal_strength: number | null;
  latency_ms: number | null;
  bandwidth_kbps: number | null;
  last_ping_at: string | null;
  last_failure_at: string | null;
  failure_reason: string | null;
  priority: number;
  is_primary: boolean;
  config: any;
  created_at: string;
  updated_at: string;
}

export interface PingResult {
  linkId: string;
  success: boolean;
  latency: number | null;
  signalStrength: number | null;
  timestamp: string;
  error?: string;
}

export interface SatcomLog {
  vessel_id: string | null;
  transmission_type: "send" | "receive" | "status" | "heartbeat";
  provider: "Iridium" | "Starlink" | "Inmarsat" | "Thuraya";
  message_content: string | null;
  signal_strength: number | null;
  latency_ms: number | null;
  bandwidth_kbps: number | null;
  status: "success" | "failed" | "degraded" | "timeout";
  error_message: string | null;
  metadata?: any;
}

class SatcomPingService {
  /**
   * Get all satcom links
   */
  async getLinks(): Promise<SatcomLink[]> {
    const { data, error } = await supabase
      .from("satcom_links")
      .select("*")
      .order("priority", { ascending: false });

    if (error) {
      console.error("Error fetching satcom links:", error);
      return [];
    }

    return data || [];
  }

  /**
   * Create or update a satcom link
   */
  async upsertLink(link: Partial<SatcomLink>): Promise<SatcomLink | null> {
    const { data, error } = await supabase
      .from("satcom_links")
      .upsert(link)
      .select()
      .single();

    if (error) {
      console.error("Error upserting satcom link:", error);
      return null;
    }

    return data;
  }

  /**
   * Simulate a ping to a satellite link
   * In production, this would make an actual network request
   */
  async simulatePing(link: SatcomLink): Promise<PingResult> {
    const timestamp = new Date().toISOString();
    
    // Simulate ping with random variations
    const baseLatency = this.getBaseLatency(link.provider);
    const variation = (Math.random() - 0.5) * baseLatency * 0.3;
    const latency = Math.max(10, baseLatency + variation);
    
    // Simulate signal strength with random variations
    const baseSignal = link.signal_strength || 80;
    const signalVariation = (Math.random() - 0.5) * 20;
    const signalStrength = Math.max(0, Math.min(100, baseSignal + signalVariation));
    
    // Simulate occasional failures (5% chance)
    const success = Math.random() > 0.05;
    
    const result: PingResult = {
      linkId: link.id,
      success,
      latency: success ? Math.round(latency) : null,
      signalStrength: success ? Math.round(signalStrength) : null,
      timestamp,
      error: success ? undefined : "Connection timeout",
    };

    // Update link status
    await this.updateLinkStatus(link.id, result);

    // Log the ping
    await this.logPing(link, result);

    return result;
  }

  /**
   * Perform pings on all active links
   */
  async pingAllLinks(): Promise<PingResult[]> {
    const links = await this.getLinks();
    const results: PingResult[] = [];

    for (const link of links) {
      const result = await this.simulatePing(link);
      results.push(result);
    }

    return results;
  }

  /**
   * Update link status after ping
   */
  private async updateLinkStatus(linkId: string, result: PingResult): Promise<void> {
    const status: "online" | "offline" | "degraded" = 
      !result.success ? "offline" :
      (result.signalStrength && result.signalStrength < 50) ? "degraded" :
      "online";

    const update: Partial<SatcomLink> = {
      status,
      latency_ms: result.latency,
      signal_strength: result.signalStrength,
      last_ping_at: result.timestamp,
    };

    if (!result.success) {
      update.last_failure_at = result.timestamp;
      update.failure_reason = result.error || "Unknown error";
    }

    await supabase
      .from("satcom_links")
      .update(update)
      .eq("id", linkId);
  }

  /**
   * Log ping to satcom_logs
   */
  private async logPing(link: SatcomLink, result: PingResult): Promise<void> {
    const log: SatcomLog = {
      vessel_id: link.vessel_id,
      transmission_type: "heartbeat",
      provider: link.provider,
      message_content: `Ping to ${link.name}`,
      signal_strength: result.signalStrength,
      latency_ms: result.latency,
      bandwidth_kbps: link.bandwidth_kbps,
      status: result.success ? "success" : "timeout",
      error_message: result.error || null,
      metadata: {
        link_id: link.id,
        link_name: link.name,
      },
    };

    await supabase.from("satcom_logs").insert(log);
  }

  /**
   * Get base latency for provider
   */
  private getBaseLatency(provider: string): number {
    switch (provider) {
      case "Starlink":
        return 35;
      case "Iridium":
        return 680;
      case "Inmarsat":
        return 720;
      case "Thuraya":
        return 650;
      default:
        return 500;
    }
  }

  /**
   * Get recent logs for a link
   */
  async getLogs(linkId?: string, limit: number = 50): Promise<any[]> {
    let query = supabase
      .from("satcom_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (linkId) {
      query = query.eq("metadata->>link_id", linkId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching satcom logs:", error);
      return [];
    }

    return data || [];
  }

  /**
   * Get connection statistics
   */
  async getStatistics(linkId?: string): Promise<{
    total: number;
    successful: number;
    failed: number;
    avgLatency: number;
    avgSignalStrength: number;
  }> {
    const logs = await this.getLogs(linkId, 100);
    
    const successful = logs.filter(log => log.status === "success").length;
    const failed = logs.filter(log => log.status !== "success").length;
    
    const latencies = logs
      .filter(log => log.latency_ms !== null)
      .map(log => log.latency_ms);
    
    const signals = logs
      .filter(log => log.signal_strength !== null)
      .map(log => log.signal_strength);
    
    const avgLatency = latencies.length > 0
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length
      : 0;
    
    const avgSignalStrength = signals.length > 0
      ? signals.reduce((a, b) => a + b, 0) / signals.length
      : 0;

    return {
      total: logs.length,
      successful,
      failed,
      avgLatency: Math.round(avgLatency),
      avgSignalStrength: Math.round(avgSignalStrength),
    };
  }
}

export const satcomPingService = new SatcomPingService();
