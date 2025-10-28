/**
 * PATCH 442 - SATCOM Failover Service
 * Handles failover event logging and connection status management
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface FailoverLogEntry {
  vessel_id: string;
  event_type: 
    | "fallback_initiated"
    | "fallback_completed"
    | "recovery_initiated"
    | "recovery_completed"
    | "connection_lost"
    | "connection_restored"
    | "manual_switch"
    | "automatic_switch";
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
  metadata?: Record<string, any>;
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
  /**
   * Log a failover event
   */
  async logFailover(entry: FailoverLogEntry): Promise<string | null> {
try {
  const { data, error } = await supabase.rpc<any>("log_satcom_failover", {
    p_vessel_id: entry.vessel_id,
    p_event_type: entry.event_type,
    p_from_provider: entry.from_provider || null,
    p_to_provider: entry.to_provider || null,
    p_reason: entry.reason,
    p_success: entry.success !== undefined ? entry.success : true,
    p_metadata: entry.metadata || null,
  });

      if (error) {
        logger.error("Failed to log failover event", { error: error.message });
        throw error;
      }

      logger.info("Failover event logged", {
        vesselId: entry.vessel_id,
        eventType: entry.event_type,
      });

      return data;
    } catch (error) {
      logger.error("Error logging failover", error);
      return null;
    }
  }

  /**
   * Update connection status
   */
  async updateConnectionStatus(status: ConnectionStatus): Promise<void> {
try {
  await supabase.rpc<any>("update_satcom_connection_status", {
    p_vessel_id: status.vessel_id,
    p_connection_id: status.connection_id,
    p_provider: status.provider,
    p_status: status.status,
    p_signal_strength: status.signal_strength,
    p_latency_ms: status.latency_ms || null,
    p_bandwidth_kbps: status.bandwidth_kbps || null,
  });

      logger.debug("Connection status updated", {
        vesselId: status.vessel_id,
        connectionId: status.connection_id,
      });
    } catch (error) {
      logger.error("Error updating connection status", error);
      throw error;
    }
  }

  /**
   * Log a communication message
   */
  async logCommunication(log: CommunicationLog): Promise<string | null> {
    try {
const { data, error } = await supabase.rpc<any>("log_satcom_communication", {
  p_vessel_id: log.vessel_id,
  p_provider: log.provider || null,
  p_message_type: log.message_type,
  p_direction: log.direction,
  p_message_content: log.message_content,
  p_signal_strength: log.signal_strength || null,
});

      if (error) {
        logger.error("Failed to log communication", { error: error.message });
        throw error;
      }

      logger.debug("Communication logged", {
        vesselId: log.vessel_id,
        messageType: log.message_type,
      });

      return data;
    } catch (error) {
      logger.error("Error logging communication", error);
      return null;
    }
  }

  /**
   * Get recent failover logs
   */
  async getRecentFailovers(
    vesselId: string,
    limit: number = 50
  ): Promise<any[]> {
    try {
const { data, error } = await supabase
  .from<any>("satcom_failover_logs")
  .select("*")
  .eq("vessel_id", vesselId)
  .order("timestamp", { ascending: false })
  .limit(limit);

      if (error) {
        logger.error("Failed to fetch failover logs", { error: error.message });
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error("Error fetching failover logs", error);
      return [];
    }
  }

  /**
   * Get current connection status
   */
  async getConnectionStatus(vesselId: string): Promise<ConnectionStatus[]> {
    try {
const { data, error } = await supabase
  .from<any>("satcom_connection_status")
  .select("*")
  .eq("vessel_id", vesselId)
  .order("updated_at", { ascending: false });

      if (error) {
        logger.error("Failed to fetch connection status", {
          error: error.message,
        });
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error("Error fetching connection status", error);
      return [];
    }
  }

  /**
   * Get recent communications
   */
  async getRecentCommunications(
    vesselId: string,
    limit: number = 100
  ): Promise<any[]> {
    try {
const { data, error } = await supabase
  .from<any>("satcom_communication_logs")
  .select("*")
  .eq("vessel_id", vesselId)
  .order("timestamp", { ascending: false })
  .limit(limit);

      if (error) {
        logger.error("Failed to fetch communication logs", {
          error: error.message,
        });
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error("Error fetching communication logs", error);
      return [];
    }
  }

  /**
   * Get failover statistics
   */
  async getFailoverStats(
    vesselId: string,
    hours: number = 24
  ): Promise<{
    total_events: number;
    successful_failovers: number;
    failed_failovers: number;
    avg_recovery_time_seconds: number;
    most_common_provider: string;
  } | null> {
    try {
const { data, error } = await supabase.rpc<any>("get_satcom_failover_stats", {
  p_vessel_id: vesselId,
  p_hours: hours,
});

      if (error) {
        logger.error("Failed to fetch failover stats", {
          error: error.message,
        });
        return null;
      }

      return data?.[0] || null;
    } catch (error) {
      logger.error("Error fetching failover stats", error);
      return null;
    }
  }

  /**
   * Simulate a connection loss for testing
   */
  async simulateConnectionLoss(
    vesselId: string,
    connectionId: string,
    provider: "Iridium" | "Starlink" | "Inmarsat" | "Thuraya",
    reason: string
  ): Promise<void> {
    await this.logFailover({
      vessel_id: vesselId,
      event_type: "connection_lost",
      from_provider: provider,
      from_connection_id: connectionId,
      reason,
      success: true,
    });

    await this.updateConnectionStatus({
      vessel_id: vesselId,
      connection_id: connectionId,
      provider,
      status: "disconnected",
      signal_strength: 0,
    });

    logger.info("Connection loss simulated", { vesselId, connectionId });
  }

  /**
   * Simulate a failover test
   */
  async simulateFailoverTest(
    vesselId: string,
    fromConnectionId: string,
    toConnectionId: string,
    fromProvider: "Iridium" | "Starlink" | "Inmarsat" | "Thuraya",
    toProvider: "Iridium" | "Starlink" | "Inmarsat" | "Thuraya"
  ): Promise<void> {
    // Initiate fallback
    await this.logFailover({
      vessel_id: vesselId,
      event_type: "fallback_initiated",
      from_provider: fromProvider,
      to_provider: toProvider,
      from_connection_id: fromConnectionId,
      to_connection_id: toConnectionId,
      reason: "Manual failover test",
      success: true,
    });

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Complete fallback
    await this.logFailover({
      vessel_id: vesselId,
      event_type: "fallback_completed",
      from_provider: fromProvider,
      to_provider: toProvider,
      from_connection_id: fromConnectionId,
      to_connection_id: toConnectionId,
      reason: "Manual failover test completed",
      success: true,
      duration_seconds: 2,
    });

    // Update connection statuses
    await this.updateConnectionStatus({
      vessel_id: vesselId,
      connection_id: fromConnectionId,
      provider: fromProvider,
      status: "disconnected",
      signal_strength: 0,
      is_active: false,
    });

    await this.updateConnectionStatus({
      vessel_id: vesselId,
      connection_id: toConnectionId,
      provider: toProvider,
      status: "connected",
      signal_strength: 85,
      is_active: true,
    });

    logger.info("Failover test completed", { vesselId, fromProvider, toProvider });
  }
}

export const satcomFailoverService = new SatcomFailoverService();
