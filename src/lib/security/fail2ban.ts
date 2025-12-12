
/**
 * PATCH 616 - Fail2Ban Simulation Service
 * Monitors and blocks excessive login attempts and suspicious activity
 */

import { supabase } from "@/integrations/supabase/client";

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

// In-memory store for blocked entities (in production, use Redis or database)
const blockedEntities = new Map<string, BlockedEntity>();

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
    // Log to database
    await supabase.from("login_logs").insert({
      user_id: attempt.userId,
      success: attempt.success,
      ip_address: attempt.ipAddress,
      user_agent: attempt.userAgent,
      metadata: {
        timestamp: attempt.timestamp.toISOString(),
      },
    });
    
    // If login was successful, clear any failed attempt tracking
    if (attempt.success) {
      return { blocked: false };
    }
    
    // Check if IP is already blocked
    if (isBlocked(attempt.ipAddress)) {
      const blockInfo = getBlockInfo(attempt.ipAddress);
      return {
        blocked: true,
        reason: "IP address temporarily blocked due to excessive failed login attempts",
        blockExpiresAt: blockInfo?.expiresAt,
      };
    }
    
    // Count recent failed attempts from this IP
    const windowStart = new Date(Date.now() - FAIL2BAN_CONFIG.windowDuration);
    
    const { data: recentAttempts, error } = await supabase
      .from("login_logs")
      .select("id")
      .eq("ip_address", attempt.ipAddress)
      .eq("success", false)
      .gte("created_at", windowStart.toISOString());
    
    if (error) {
      return { blocked: false };
    }
    
    const attemptCount = (recentAttempts?.length || 0) + 1; // +1 for current attempt
    
    // Check if we should block this IP
    if (attemptCount >= FAIL2BAN_CONFIG.maxAttempts) {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + FAIL2BAN_CONFIG.blockDuration);
      
      const blockInfo: BlockedEntity = {
        identifier: attempt.ipAddress,
        type: "ip",
        blockedAt: now,
        expiresAt,
        reason: "Excessive failed login attempts",
        attemptCount,
      };
      
      blockedEntities.set(attempt.ipAddress, blockInfo);
      
      // Log security event
      await supabase.from("security_events").insert({
        user_id: attempt.userId,
        event_type: "ip_blocked",
        ip_address: attempt.ipAddress,
        user_agent: attempt.userAgent,
        severity: "high",
        metadata: {
          attemptCount,
          blockDuration: FAIL2BAN_CONFIG.blockDuration,
          windowDuration: FAIL2BAN_CONFIG.windowDuration,
        },
      });
      
      return {
        blocked: true,
        reason: "IP blocked due to excessive failed login attempts",
        blockExpiresAt: expiresAt,
      };
    }
    
    // Return remaining attempts
    return {
      blocked: false,
      remainingAttempts: FAIL2BAN_CONFIG.maxAttempts - attemptCount,
    };
    
  } catch (error) {
    console.error("Error in logLoginAttempt:", error);
    console.error("Error in logLoginAttempt:", error);
    return { blocked: false };
  }
}

/**
 * Log a password reset attempt
 */
export async function logPasswordResetAttempt(
  email: string,
  ipAddress: string,
  userAgent?: string
): Promise<{
  blocked: boolean;
  reason?: string;
  remainingAttempts?: number;
}> {
  try {
    // Check if IP is already blocked
    if (isBlocked(ipAddress)) {
      return {
        blocked: true,
        reason: "IP address temporarily blocked due to excessive requests",
      };
    }
    
    // Count recent password reset attempts from this IP
    const windowStart = new Date(Date.now() - FAIL2BAN_CONFIG.windowDuration);
    
    const { data: recentAttempts } = await supabase
      .from("security_events")
      .select("id")
      .eq("ip_address", ipAddress)
      .eq("event_type", "password_reset_attempt")
      .gte("created_at", windowStart.toISOString());
    
    const attemptCount = (recentAttempts?.length || 0) + 1;
    
    // Log the attempt
    await supabase.from("security_events").insert({
      event_type: "password_reset_attempt",
      ip_address: ipAddress,
      user_agent: userAgent,
      severity: "medium",
      metadata: {
        email,
        attemptCount,
      },
    });
    
    // Block if too many attempts
    if (attemptCount >= FAIL2BAN_CONFIG.maxAttempts) {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + FAIL2BAN_CONFIG.blockDuration);
      
      blockedEntities.set(ipAddress, {
        identifier: ipAddress,
        type: "ip",
        blockedAt: now,
        expiresAt,
        reason: "Excessive password reset requests",
        attemptCount,
      });
      
      return {
        blocked: true,
        reason: "Too many password reset requests. Please try again later.",
      };
    }
    
    return {
      blocked: false,
      remainingAttempts: FAIL2BAN_CONFIG.maxAttempts - attemptCount,
    };
    
  } catch (error) {
    console.error("Error in logPasswordResetAttempt:", error);
    console.error("Error in logPasswordResetAttempt:", error);
    return { blocked: false };
  }
}

/**
 * Manually unblock an entity (for admin use)
 */
export function unblock(identifier: string): boolean {
  return blockedEntities.delete(identifier);
}

/**
 * Get all currently blocked entities
 */
export function getAllBlocked(): BlockedEntity[] {
  const now = new Date();
  const blocked: BlockedEntity[] = [];
  
  for (const [identifier, entity] of blockedEntities.entries()) {
    // Remove expired blocks
    if (now > entity.expiresAt) {
      blockedEntities.delete(identifier);
    } else {
      blocked.push(entity);
    }
  }
  
  return blocked;
}

/**
 * Initialize cleanup interval
 * Should be called once when the application starts
 */
export function initializeCleanup(): () => void {
  // Clean up expired blocks every minute
  const intervalId = setInterval(cleanupExpiredBlocks, 60 * 1000);
  
  // Return cleanup function to clear interval
  return () => clearInterval(intervalId);
}
export function getClientIp(headers: Headers): string {
  // Try various headers that might contain the real IP
  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }
  
  const xRealIp = headers.get("x-real-ip");
  if (xRealIp) {
    return xRealIp;
  }
  
  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  return "unknown";
}

/**
 * Get user agent from request
 */
export function getUserAgent(headers: Headers): string {
  return headers.get("user-agent") || "unknown";
}

/**
 * Clean up expired blocks periodically
 */
export function cleanupExpiredBlocks(): number {
  const now = new Date();
  let cleaned = 0;
  
  for (const [identifier, entity] of blockedEntities.entries()) {
    if (now > entity.expiresAt) {
      blockedEntities.delete(identifier);
      cleaned++;
    }
  }
  
  return cleaned;
}

// Note: initializeCleanup() should be called explicitly in app initialization
// rather than at module load time to prevent memory leaks in development
