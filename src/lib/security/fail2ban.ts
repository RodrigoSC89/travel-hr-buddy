/**
 * PATCH 616 - Fail2Ban Simulation Service
 * Monitors and blocks excessive login attempts and suspicious activity
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';

interface LoginAttempt {
  userId?: string;
  ipAddress: string;
  success: boolean;
  timestamp: Date;
  userAgent?: string;
}

interface BlockedEntity {
  identifier: string; // IP address or user ID
  type: "ip" | "user";
  blockedAt: Date;
  expiresAt: Date;
  reason: string;
  attemptCount: number;
}

interface AttemptWindow {
  attempts: LoginAttempt[];
  firstAttempt: Date;
}

// In-memory store for blocked entities (in production, use Redis or database)
const blockedEntities = new Map<string, BlockedEntity>();
const attemptWindows = new Map<string, AttemptWindow>();

// Configuration
const FAIL2BAN_CONFIG = {
  maxAttempts: 5,
  blockDuration: 15 * 60 * 1000, // 15 minutes in milliseconds
  windowDuration: 5 * 60 * 1000, // 5 minutes window to count attempts
};

/**
 * Check if an IP address or user is blocked
 */
export function isBlocked(identifier: string): boolean {
  const blocked = blockedEntities.get(identifier);

  if (!blocked) {
    return false;
  }

  // Check if block has expired
  if (new Date() > blocked.expiresAt) {
    blockedEntities.delete(identifier);
    return false;
  }

  return true;
}

/**
 * Get block information
 */
export function getBlockInfo(identifier: string): BlockedEntity | null {
  const blocked = blockedEntities.get(identifier);

  if (!blocked) {
    return null;
  }

  // Check if block has expired
  if (new Date() > blocked.expiresAt) {
    blockedEntities.delete(identifier);
    return null;
  }

  return blocked;
}

/**
 * Log a login attempt and check for fail2ban
 */
export async function logLoginAttempt(attempt: LoginAttempt): Promise<{
  blocked: boolean;
  reason?: string;
  remainingAttempts?: number;
  blockExpiresAt?: Date;
}> {
  try {
    // Log to database via access_logs (login_logs may not exist)
    await supabase.from("access_logs").insert({
      user_id: attempt.userId || null,
      action: attempt.success ? "login_success" : "login_failed",
      module_accessed: "auth",
      result: attempt.success ? "success" : "failure",
      severity: attempt.success ? "info" : "warning",
      user_agent: attempt.userAgent || null,
      details: {
        ip_address: attempt.ipAddress,
        timestamp: attempt.timestamp.toISOString(),
      },
    });

    // If login was successful, clear any failed attempt tracking
    if (attempt.success) {
      attemptWindows.delete(attempt.ipAddress);
      return { blocked: false };
    }

    // Check if IP is already blocked
    if (isBlocked(attempt.ipAddress)) {
      const blockInfo = getBlockInfo(attempt.ipAddress);
      return {
        blocked: true,
        reason: blockInfo?.reason || "Too many failed attempts",
        blockExpiresAt: blockInfo?.expiresAt,
      };
    }

    // Track failed attempt
    const now = new Date();
    let window = attemptWindows.get(attempt.ipAddress);

    if (!window) {
      window = { attempts: [], firstAttempt: now };
      attemptWindows.set(attempt.ipAddress, window);
    }

    // Clean up old attempts outside the window
    const windowStart = new Date(now.getTime() - FAIL2BAN_CONFIG.windowDuration);
    window.attempts = window.attempts.filter((a) => a.timestamp > windowStart);

    // Add current attempt
    window.attempts.push(attempt);

    // Check if we should block
    if (window.attempts.length >= FAIL2BAN_CONFIG.maxAttempts) {
      const expiresAt = new Date(now.getTime() + FAIL2BAN_CONFIG.blockDuration);

      blockedEntities.set(attempt.ipAddress, {
        identifier: attempt.ipAddress,
        type: "ip",
        blockedAt: now,
        expiresAt,
        reason: `Too many failed login attempts (${window.attempts.length} in ${FAIL2BAN_CONFIG.windowDuration / 60000} minutes)`,
        attemptCount: window.attempts.length,
      });

      // Log the block
      await supabase.from("access_logs").insert({
        user_id: attempt.userId || null,
        action: "ip_blocked",
        module_accessed: "security",
        result: "blocked",
        severity: "critical",
        details: {
          ip_address: attempt.ipAddress,
          reason: "fail2ban",
          attempts: window.attempts.length,
          block_expires: expiresAt.toISOString(),
        },
      });

      // Clear the window
      attemptWindows.delete(attempt.ipAddress);

      return {
        blocked: true,
        reason: `Too many failed login attempts. Try again in ${FAIL2BAN_CONFIG.blockDuration / 60000} minutes.`,
        blockExpiresAt: expiresAt,
      };
    }

    return {
      blocked: false,
      remainingAttempts: FAIL2BAN_CONFIG.maxAttempts - window.attempts.length,
    };
  } catch (error) {
    logger.error("Fail2ban logging error:", error);
    // Don't block on logging errors
    return { blocked: false };
  }
}

/**
 * Manually block an IP or user
 */
export function blockEntity(
  identifier: string,
  type: "ip" | "user",
  reason: string,
  durationMs: number = FAIL2BAN_CONFIG.blockDuration
): void {
  const now = new Date();
  blockedEntities.set(identifier, {
    identifier,
    type,
    blockedAt: now,
    expiresAt: new Date(now.getTime() + durationMs),
    reason,
    attemptCount: 0,
  });
}

/**
 * Unblock an IP or user
 */
export function unblockEntity(identifier: string): boolean {
  return blockedEntities.delete(identifier);
}

/**
 * Get all currently blocked entities
 */
export function getBlockedEntities(): BlockedEntity[] {
  const now = new Date();
  const entities: BlockedEntity[] = [];

  blockedEntities.forEach((entity, key) => {
    if (now > entity.expiresAt) {
      blockedEntities.delete(key);
    } else {
      entities.push(entity);
    }
  });

  return entities;
}

/**
 * Clear all blocks (admin function)
 */
export function clearAllBlocks(): void {
  blockedEntities.clear();
  attemptWindows.clear();
}

/**
 * Get fail2ban statistics
 */
export function getStatistics(): {
  blockedCount: number;
  activeWindowsCount: number;
  config: typeof FAIL2BAN_CONFIG;
} {
  // Clean up expired blocks first
  const now = new Date();
  blockedEntities.forEach((entity, key) => {
    if (now > entity.expiresAt) {
      blockedEntities.delete(key);
    }
  });

  return {
    blockedCount: blockedEntities.size,
    activeWindowsCount: attemptWindows.size,
    config: FAIL2BAN_CONFIG,
  };
}
