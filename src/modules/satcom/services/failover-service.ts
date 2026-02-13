/**
 * PATCH 442 - SATCOM Failover Service
 * DEBT-FIX: Removed (supabase as any) - aligned with actual satcom_failover_logs schema
 * Schema uses from_link_id/to_link_id, provider info goes in metadata
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface FailoverLogEntry {
  vessel_id: string;
  event_type: string;
  from_provider?: "Iridium" | "Starlink" | "Inmarsat" | "Thuraya";
  to_provider?: "Iridium" | "Starlink" | "Inmarsat" | "Thuraya";
  from_connection_id?: string;
  to_connection_id?: string;
  reason: string;
  success?: boolean;
  latency_ms?: number;
  signal_strength?: number;
  bandwidth_kbps?: number;
  duration_seconds?: number;
  metadata?: Record<string, unknown>;
}

export interface ConnectionStatus {
  vessel_id: string;
  connection_id: string;
  provider: "Iridium" | "Starlink" | "Inmarsat" | "Thuraya";
  status: "connected" | "degraded" | "disconnected" | "maintenance";
  signal_strength: number;
  latency_ms?: number;
  bandwidth_kbps?: number;
  packet_loss_percent?: number;
  uptime_percent?: number;
  is_primary?: boolean;
  is_active?: boolean;
  is_fallback?: boolean;
}

export interface CommunicationLog {
  vessel_id: string;
  connection_id?: string;
  provider?: "Iridium" | "Starlink" | "Inmarsat" | "Thuraya";
  message_type: "status_report" | "command" | "data_sync" | "emergency" | "diagnostic" | "test";
  direction: "outbound" | "inbound";
  message_content: string;
  message_size_bytes?: number;
  transmission_status?: "queued" | "transmitting" | "completed" | "failed" | "retrying";
  signal_strength?: number;
}

class SatcomFailoverService {
  async logFailover(entry: FailoverLogEntry): Promise<string | null> {
    try {
      // satcom_failover_logs uses from_link_id/to_link_id, extra data in metadata
      const { data, error } = await supabase
        .from("satcom_failover_logs")
        .insert({
          vessel_id: entry.vessel_id,
          from_link_id: entry.from_connection_id || null,
          to_link_id: entry.to_connection_id || null,
          reason: entry.reason,
          success: entry.success !== undefined ? entry.success : true,
          failover_time_ms: entry.latency_ms || entry.duration_seconds ? (entry.duration_seconds || 0) * 1000 : null,
          metadata: {
            event_type: entry.event_type,
            from_provider: entry.from_provider,
            to_provider: entry.to_provider,
            signal_strength: entry.signal_strength,
            bandwidth_kbps: entry.bandwidth_kbps,
            ...(entry.metadata || {}),
          },
        })
        .select("id")
        .single();

      if (error) {
        logger.error("Failed to log failover event", { error: error.message });
        throw error;
      }

      logger.info("Failover event logged", { vesselId: entry.vessel_id, eventType: entry.event_type });
      return data?.id || null;
    } catch (error) {
      logger.error("Error logging failover", error);
      return null;
    }
  }

  async updateConnectionStatus(status: ConnectionStatus): Promise<void> {
    try {
      const { error } = await supabase
        .from("satcom_connection_status")
        .upsert({
          vessel_id: status.vessel_id,
          connection_id: status.connection_id,
          provider: status.provider,
          status: status.status,
          signal_strength: status.signal_strength,
          latency_ms: status.latency_ms || null,
          bandwidth_available_kbps: status.bandwidth_kbps || null,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      logger.debug("Connection status updated", { vesselId: status.vessel_id, connectionId: status.connection_id });
    } catch (error) {
      logger.error("Error updating connection status", error);
      throw error;
    }
  }

  async logCommunication(log: CommunicationLog): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from("satcom_communication_logs")
        .insert({
          vessel_id: log.vessel_id,
          provider: log.provider || null,
          message_type: log.message_type,
          direction: log.direction,
          message_content: log.message_content,
          signal_strength: log.signal_strength || null,
        })
        .select("id")
        .single();

      if (error) {
        logger.error("Failed to log communication", { error: error.message });
        throw error;
      }

      logger.debug("Communication logged", { vesselId: log.vessel_id, messageType: log.message_type });
      return data?.id || null;
    } catch (error) {
      logger.error("Error logging communication", error);
      return null;
    }
  }

  async getRecentFailovers(vesselId: string, limit: number = 50): Promise<Record<string, unknown>[]> {
    try {
      const { data, error } = await supabase
        .from("satcom_failover_logs")
        .select("*")
        .eq("vessel_id", vesselId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) { logger.error("Failed to fetch failover logs", { error: error.message }); throw error; }
      return data || [];
    } catch (error) {
      logger.error("Error fetching failover logs", error);
      return [];
    }
  }

  async getConnectionStatus(vesselId: string): Promise<ConnectionStatus[]> {
    try {
      const { data, error } = await supabase
        .from("satcom_connection_status")
        .select("*")
        .eq("vessel_id", vesselId)
        .order("updated_at", { ascending: false });

      if (error) { logger.error("Failed to fetch connection status", { error: error.message }); throw error; }
      return (data || []) as unknown as ConnectionStatus[];
    } catch (error) {
      logger.error("Error fetching connection status", error);
      return [];
    }
  }

  async getRecentCommunications(vesselId: string, limit: number = 100): Promise<Record<string, unknown>[]> {
    try {
      const { data, error } = await supabase
        .from("satcom_communication_logs")
        .select("*")
        .eq("vessel_id", vesselId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) { logger.error("Failed to fetch communication logs", { error: error.message }); throw error; }
      return data || [];
    } catch (error) {
      logger.error("Error fetching communication logs", error);
      return [];
    }
  }

  async getFailoverStats(vesselId: string, hours: number = 24): Promise<{
    total_events: number;
    successful_failovers: number;
    failed_failovers: number;
    avg_recovery_time_seconds: number;
    most_common_provider: string;
  } | null> {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("satcom_failover_logs")
        .select("*")
        .eq("vessel_id", vesselId)
        .gte("created_at", since);

      if (error) { logger.error("Failed to fetch failover stats", { error: error.message }); return null; }

      const logs = data || [];
      const successful = logs.filter((l) => l.success === true).length;
      const failed = logs.filter((l) => l.success === false).length;

      // Extract providers from metadata
      const providerCounts: Record<string, number> = {};
      logs.forEach((l) => {
        const meta = l.metadata as Record<string, unknown> | null;
        const provider = String(meta?.to_provider || meta?.from_provider || "unknown");
        providerCounts[provider] = (providerCounts[provider] || 0) + 1;
      });
      const mostCommon = Object.entries(providerCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A";

      return {
        total_events: logs.length,
        successful_failovers: successful,
        failed_failovers: failed,
        avg_recovery_time_seconds: 0,
        most_common_provider: mostCommon,
      };
    } catch (error) {
      logger.error("Error fetching failover stats", error);
      return null;
    }
  }

  async simulateConnectionLoss(vesselId: string, connectionId: string, provider: "Iridium" | "Starlink" | "Inmarsat" | "Thuraya", reason: string): Promise<void> {
    await this.logFailover({ vessel_id: vesselId, event_type: "connection_lost", from_provider: provider, from_connection_id: connectionId, reason, success: true });
    await this.updateConnectionStatus({ vessel_id: vesselId, connection_id: connectionId, provider, status: "disconnected", signal_strength: 0 });
    logger.info("Connection loss simulated", { vesselId, connectionId });
  }

  async simulateFailoverTest(vesselId: string, fromConnectionId: string, toConnectionId: string, fromProvider: "Iridium" | "Starlink" | "Inmarsat" | "Thuraya", toProvider: "Iridium" | "Starlink" | "Inmarsat" | "Thuraya"): Promise<void> {
    await this.logFailover({ vessel_id: vesselId, event_type: "fallback_initiated", from_provider: fromProvider, to_provider: toProvider, from_connection_id: fromConnectionId, to_connection_id: toConnectionId, reason: "Manual failover test", success: true });
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await this.logFailover({ vessel_id: vesselId, event_type: "fallback_completed", from_provider: fromProvider, to_provider: toProvider, from_connection_id: fromConnectionId, to_connection_id: toConnectionId, reason: "Manual failover test completed", success: true, duration_seconds: 2 });
    await this.updateConnectionStatus({ vessel_id: vesselId, connection_id: fromConnectionId, provider: fromProvider, status: "disconnected", signal_strength: 0, is_active: false });
    await this.updateConnectionStatus({ vessel_id: vesselId, connection_id: toConnectionId, provider: toProvider, status: "connected", signal_strength: 85, is_active: true });
    logger.info("Failover test completed", { vesselId, fromProvider, toProvider });
  }
}

export const satcomFailoverService = new SatcomFailoverService();
