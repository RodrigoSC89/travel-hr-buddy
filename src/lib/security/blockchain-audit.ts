/**
 * Blockchain-Style Audit Trail
 * Immutable hash chain for enterprise audit compliance
 * Phase 3: Enterprise Security - SOC2 Ready
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface AuditEntry {
  id: string;
  block_number: number;
  timestamp: string;
  user_id: string | null;
  action_type: string;
  resource_type: string;
  resource_id: string | null;
  previous_hash: string | null;
  current_hash: string;
  changes: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
}

export interface AuditQuery {
  user_id?: string;
  action_type?: string;
  resource_type?: string;
  resource_id?: string;
  from_date?: Date;
  to_date?: Date;
  limit?: number;
  offset?: number;
}

export interface ChainIntegrity {
  is_valid: boolean;
  total_blocks: number;
  verified_blocks: number;
  broken_at_block?: number;
  broken_at_id?: string;
  message: string;
}

/**
 * Blockchain Audit Trail Manager
 * Creates an immutable, verifiable audit log using hash chains
 */
export class BlockchainAuditTrail {
  private static readonly GENESIS_HASH = "0".repeat(64);

  /**
   * Create a new audit entry with hash chain linkage
   */
  async createEntry(params: {
    action_type: string;
    resource_type: string;
    resource_id?: string;
    changes?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }): Promise<string | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Get the last hash for chain linkage
      const { data: lastEntry } = await supabase
        .from("security_audit_chain")
        .select("current_hash, block_number")
        .order("block_number", { ascending: false })
        .limit(1)
        .single();

      const previousHash = lastEntry?.current_hash || BlockchainAuditTrail.GENESIS_HASH;
      const blockNumber = (lastEntry?.block_number || 0) + 1;

      // Calculate hash
      const hashInput = JSON.stringify({
        timestamp: new Date().toISOString(),
        user_id: user?.id,
        action_type: params.action_type,
        resource_type: params.resource_type,
        previous_hash: previousHash,
      });

      const encoder = new TextEncoder();
      const data = encoder.encode(hashInput);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const currentHash = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const { data: insertedData, error } = await supabase
        .from("security_audit_chain")
        .insert({
          user_id: user?.id || null,
          action_type: params.action_type,
          resource_type: params.resource_type,
          resource_id: params.resource_id || null,
          previous_hash: previousHash,
          current_hash: currentHash,
          changes: (params.changes || null) as import("@/integrations/supabase/types").Json,
          metadata: (params.metadata || null) as import("@/integrations/supabase/types").Json,
        })
        .select("id")
        .single();

      if (error) throw error;

      logger.debug("[Audit] Entry created", { id: insertedData.id });
      return insertedData.id;
    } catch (error) {
      logger.error("[Audit] Failed to create entry", error);
      return null;
    }
  }

  /**
   * Query audit trail with filters
   */
  async queryAudit(query: AuditQuery): Promise<AuditEntry[]> {
    try {
      let request = supabase
        .from("security_audit_chain")
        .select("*")
        .order("block_number", { ascending: false });

      if (query.user_id) {
        request = request.eq("user_id", query.user_id);
      }
      if (query.action_type) {
        request = request.eq("action_type", query.action_type);
      }
      if (query.resource_type) {
        request = request.eq("resource_type", query.resource_type);
      }
      if (query.resource_id) {
        request = request.eq("resource_id", query.resource_id);
      }
      if (query.from_date) {
        request = request.gte("timestamp", query.from_date.toISOString());
      }
      if (query.to_date) {
        request = request.lte("timestamp", query.to_date.toISOString());
      }

      request = request
        .limit(query.limit || 100)
        .range(query.offset || 0, (query.offset || 0) + (query.limit || 100) - 1);

      const { data, error } = await request;

      if (error) throw error;
      
      return (data || []).map(entry => ({
        id: entry.id,
        block_number: entry.block_number,
        timestamp: entry.timestamp,
        user_id: entry.user_id,
        action_type: entry.action_type,
        resource_type: entry.resource_type,
        resource_id: entry.resource_id,
        previous_hash: entry.previous_hash,
        current_hash: entry.current_hash,
        changes: entry.changes as Record<string, unknown> | null,
        metadata: entry.metadata as Record<string, unknown> | null,
      }));
    } catch (error) {
      logger.error("[Audit] Query failed", error);
      return [];
    }
  }

  /**
   * Verify chain integrity using database function
   */
  async verifyChainIntegrity(): Promise<ChainIntegrity> {
    try {
      const { data, error } = await supabase.rpc("verify_audit_chain_integrity");

      if (error) throw error;

      const result = data?.[0];
      
      const { count } = await supabase
        .from("security_audit_chain")
        .select("*", { count: "exact", head: true });

      return {
        is_valid: result?.is_valid ?? true,
        total_blocks: count || 0,
        verified_blocks: result?.is_valid ? (count || 0) : (result?.broken_at_block || 0) - 1,
        broken_at_block: result?.broken_at_block,
        broken_at_id: result?.broken_at_id,
        message: result?.message || "Chain verification complete",
      };
    } catch (error) {
      logger.error("[Audit] Chain verification failed", error);
      return {
        is_valid: false,
        total_blocks: 0,
        verified_blocks: 0,
        message: "Verification failed: " + String(error),
      };
    }
  }

  /**
   * Get audit statistics
   */
  async getStatistics(days: number = 30): Promise<{
    total_entries: number;
    by_action_type: Record<string, number>;
    by_resource_type: Record<string, number>;
    by_user: Record<string, number>;
    by_day: { date: string; count: number }[];
  }> {
    try {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const { data, error } = await supabase
        .from("security_audit_chain")
        .select("action_type, resource_type, user_id, timestamp")
        .gte("timestamp", fromDate.toISOString());

      if (error) throw error;

      const stats = {
        total_entries: data.length,
        by_action_type: {} as Record<string, number>,
        by_resource_type: {} as Record<string, number>,
        by_user: {} as Record<string, number>,
        by_day: [] as { date: string; count: number }[],
      };

      const dayMap = new Map<string, number>();

      data.forEach((entry) => {
        stats.by_action_type[entry.action_type] =
          (stats.by_action_type[entry.action_type] || 0) + 1;

        stats.by_resource_type[entry.resource_type] =
          (stats.by_resource_type[entry.resource_type] || 0) + 1;

        if (entry.user_id) {
          stats.by_user[entry.user_id] =
            (stats.by_user[entry.user_id] || 0) + 1;
        }

        const day = entry.timestamp.split("T")[0];
        dayMap.set(day, (dayMap.get(day) || 0) + 1);
      });

      stats.by_day = Array.from(dayMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return stats;
    } catch (error) {
      logger.error("[Audit] Statistics query failed", error);
      return {
        total_entries: 0,
        by_action_type: {},
        by_resource_type: {},
        by_user: {},
        by_day: [],
      };
    }
  }

  /**
   * Export audit trail for external verification
   */
  async exportForVerification(
    fromBlock?: number,
    toBlock?: number
  ): Promise<{
    entries: AuditEntry[];
    merkle_root: string;
    exported_at: string;
  }> {
    try {
      let query = supabase
        .from("security_audit_chain")
        .select("*")
        .order("block_number", { ascending: true });

      if (fromBlock !== undefined) {
        query = query.gte("block_number", fromBlock);
      }
      if (toBlock !== undefined) {
        query = query.lte("block_number", toBlock);
      }

      const { data, error } = await query;
      if (error) throw error;

      const entries = (data || []).map(entry => ({
        id: entry.id,
        block_number: entry.block_number,
        timestamp: entry.timestamp,
        user_id: entry.user_id,
        action_type: entry.action_type,
        resource_type: entry.resource_type,
        resource_id: entry.resource_id,
        previous_hash: entry.previous_hash,
        current_hash: entry.current_hash,
        changes: entry.changes as Record<string, unknown> | null,
        metadata: entry.metadata as Record<string, unknown> | null,
      }));

      const merkleRoot = await this.calculateMerkleRoot(
        entries.map((e) => e.current_hash)
      );

      return {
        entries,
        merkle_root: merkleRoot,
        exported_at: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("[Audit] Export failed", error);
      return {
        entries: [],
        merkle_root: "",
        exported_at: new Date().toISOString(),
      };
    }
  }

  /**
   * Calculate Merkle root from list of hashes
   */
  private async calculateMerkleRoot(hashes: string[]): Promise<string> {
    if (hashes.length === 0) return BlockchainAuditTrail.GENESIS_HASH;
    if (hashes.length === 1) return hashes[0];

    const pairs: string[] = [];
    for (let i = 0; i < hashes.length; i += 2) {
      const left = hashes[i];
      const right = hashes[i + 1] || left;
      pairs.push(await this.hashPair(left, right));
    }

    return this.calculateMerkleRoot(pairs);
  }

  /**
   * Hash a pair of values
   */
  private async hashPair(left: string, right: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(left + right);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  /**
   * Convenience methods for common audit events
   */
  async logLogin(userId: string, success: boolean): Promise<void> {
    await this.createEntry({
      action_type: success ? "login_success" : "login_failed",
      resource_type: "auth",
      resource_id: userId,
      changes: { success },
    });
  }

  async logDataAccess(
    resourceType: string,
    resourceId: string,
    action: "view" | "create" | "update" | "delete"
  ): Promise<void> {
    await this.createEntry({
      action_type: `data_${action}`,
      resource_type: resourceType,
      resource_id: resourceId,
    });
  }

  async logPermissionChange(
    userId: string,
    oldRole: string,
    newRole: string
  ): Promise<void> {
    await this.createEntry({
      action_type: "permission_change",
      resource_type: "user_role",
      resource_id: userId,
      changes: { old_role: oldRole, new_role: newRole },
    });
  }

  async logSecurityEvent(
    eventType: string,
    details: Record<string, unknown>
  ): Promise<void> {
    await this.createEntry({
      action_type: eventType,
      resource_type: "security",
      changes: details,
    });
  }
}

// Singleton instance
export const auditTrail = new BlockchainAuditTrail();
