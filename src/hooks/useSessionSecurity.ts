/**
 * Session Security Hook - Enterprise Session Management
 * Monitors session health, detects anomalies, enforces timeout
 */

import { useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface SessionSecurityConfig {
  idleTimeoutMs?: number;       // Auto-logout after idle (default: 30 min)
  heartbeatIntervalMs?: number; // Session heartbeat (default: 5 min)
  enableAuditLog?: boolean;     // Log access events
}

const DEFAULT_CONFIG: Required<SessionSecurityConfig> = {
  idleTimeoutMs: 30 * 60 * 1000,
  heartbeatIntervalMs: 5 * 60 * 1000,
  enableAuditLog: true,
};

export function useSessionSecurity(config?: SessionSecurityConfig) {
  const opts = { ...DEFAULT_CONFIG, ...config };
  const lastActivityRef = useRef(Date.now());
  const heartbeatRef = useRef<ReturnType<typeof setInterval>>();
  const idleCheckRef = useRef<ReturnType<typeof setInterval>>();

  // Track user activity
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Log security event to audit trail
  const logSecurityEvent = useCallback(async (action: string, details?: Record<string, unknown>) => {
    if (!opts.enableAuditLog) return;
    try {
      await supabase.rpc("log_user_action", {
        p_action: action,
        p_resource_type: "session",
        p_status: "success",
        p_details: JSON.parse(JSON.stringify(details || {})),
      });
    } catch (e) {
      // Silent fail - don't break app for audit logging
      logger.warn("Failed to log security event", e);
    }
  }, [opts.enableAuditLog]);

  // Session heartbeat - keeps session alive and updates last_activity
  const sendHeartbeat = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;

      // Update active_sessions table
      await supabase
        .from("active_sessions")
        .update({ last_activity: new Date().toISOString() })
        .eq("user_id", data.session.user.id)
        .eq("is_active", true);
    } catch (e) {
      logger.warn("Session heartbeat failed", e);
    }
  }, []);

  // Check for idle timeout
  const checkIdleTimeout = useCallback(async () => {
    const idleTime = Date.now() - lastActivityRef.current;
    if (idleTime > opts.idleTimeoutMs) {
      logger.info("Session idle timeout - logging out");
      await logSecurityEvent("idle_timeout", { idle_ms: idleTime });
      await supabase.auth.signOut();
    }
  }, [opts.idleTimeoutMs, logSecurityEvent]);

  // Verify session integrity
  const verifySession = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return { valid: false, reason: "no_session" };

    const expiresAt = data.session.expires_at;
    if (expiresAt && expiresAt * 1000 < Date.now()) {
      return { valid: false, reason: "expired" };
    }

    return { valid: true, reason: "active" };
  }, []);

  useEffect(() => {
    // Setup activity listeners
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach(e => document.addEventListener(e, updateActivity, { passive: true }));

    // Start heartbeat
    heartbeatRef.current = setInterval(sendHeartbeat, opts.heartbeatIntervalMs);

    // Start idle check
    idleCheckRef.current = setInterval(checkIdleTimeout, 60000); // Check every minute

    // Log session start
    logSecurityEvent("session_start");

    return () => {
      events.forEach(e => document.removeEventListener(e, updateActivity));
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (idleCheckRef.current) clearInterval(idleCheckRef.current);
    };
  }, [updateActivity, sendHeartbeat, checkIdleTimeout, logSecurityEvent, opts.heartbeatIntervalMs]);

  return {
    verifySession,
    logSecurityEvent,
    updateActivity,
  };
}
