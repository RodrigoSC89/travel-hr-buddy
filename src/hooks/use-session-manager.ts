/**
 * useSessionManager Hook
 * PATCH 124.0 - Token & Session Security Engine
 * 
 * Hook for managing user sessions and tokens
 */

import { useState, useEffect, useCallback, Dispatch, SetStateAction } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

interface DeviceInfo {
  platform?: string;
  browser?: string;
  os?: string;
  device_type?: string;
}

export interface SessionToken {
  id: string;
  token: string;
  device_info: DeviceInfo | null;
  created_at: string;
  expires_at: string;
  last_activity_at: string;
  revoked: boolean | null;
  ip_address?: string | null;
}

type SupabaseActiveSession = Omit<SessionToken, "device_info"> & {
  device_info?: DeviceInfo | null;
};

type ActiveSessionRow = Database["public"]["Functions"]["get_active_sessions"]["Returns"][number];

interface CreateSessionParams {
  deviceInfo?: {
    platform?: string;
    browser?: string;
    os?: string;
    device_type?: string;
  };
  expiresInHours?: number;
}

/**
 * Hook to manage user sessions
 */
export const useSessionManager = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => getStoredSessionId());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Load active sessions for the current user
   */
  const loadSessions = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setErrorMessage(null);
      const { data, error } = await supabase.rpc("get_active_sessions");

      if (error) {
        console.error("Error loading sessions:", error);
        setErrorMessage("Não foi possível carregar as sessões ativas.");
        return;
      }

      // Ensure device_info and metadata are normalized
      const typedSessions: SessionToken[] = (data || []).map(normalizeSupabaseSession);
      setSessions(typedSessions);

      const storedSessionId = getStoredSessionId();
      const hasStoredSession = storedSessionId && typedSessions.some(session => session.id === storedSessionId);

      if (!storedSessionId && typedSessions.length > 0) {
        setAndPersistCurrentSession(typedSessions[0].id, setCurrentSessionId);
      } else if (storedSessionId && !hasStoredSession) {
        if (typedSessions.length > 0) {
          setAndPersistCurrentSession(typedSessions[0].id, setCurrentSessionId);
        } else {
          clearStoredSessionId();
          setCurrentSessionId(null);
        }
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
      setErrorMessage("Não foi possível carregar as sessões ativas.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Create a new session token
   */
  const createSession = useCallback(async ({
    deviceInfo,
    expiresInHours = 720, // 30 days default
  }: CreateSessionParams = {}) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      // Detect device info if not provided
      const finalDeviceInfo = deviceInfo || detectDeviceInfo();

      const { data, error } = await supabase.rpc("create_session_token", {
        p_device_info: finalDeviceInfo,
        p_expires_in_hours: expiresInHours,
      });

      if (error) {
        console.error("Error creating session:", error);
        throw error;
      }

      if (data && data.length > 0) {
        const session = data[0];
        setAndPersistCurrentSession(session.token_id, setCurrentSessionId);
        await loadSessions(); // Refresh sessions list
        return session;
      }

      return null;
    } catch (error) {
      console.error("Error creating session:", error);
      setErrorMessage("Não foi possível criar a sessão.");
      throw error;
    }
  }, [user, loadSessions]);

  /**
   * Revoke a specific session
   */
  const revokeSession = useCallback(async (sessionId: string, reason?: string) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      const { data, error } = await supabase.rpc("revoke_session_token", {
        p_token_id: sessionId,
        p_reason: reason || "User requested revocation",
      });

      if (error) {
        console.error("Error revoking session:", error);
        setErrorMessage("Não foi possível revogar a sessão.");
        throw error;
      }

      if (sessionId === currentSessionId) {
        clearStoredSessionId();
        setCurrentSessionId(null);
      }

      await loadSessions(); // Refresh sessions list
      return data;
    } catch (error) {
      console.error("Error revoking session:", error);
      setErrorMessage("Não foi possível revogar a sessão.");
      throw error;
    }
  }, [user, currentSessionId, loadSessions]);

  /**
   * Revoke all sessions except the current one
   */
  const revokeAllOtherSessions = useCallback(async () => {
    if (!user || !currentSessionId) {
      throw new Error("User not authenticated or no current session");
    }

    try {
      const otherSessions = sessions.filter(s => s.id !== currentSessionId);
      
      await Promise.all(
        otherSessions.map(session =>
          revokeSession(session.id, "User revoked all other sessions")
        )
      );

      await loadSessions(); // Refresh sessions list
    } catch (error) {
      console.error("Error revoking all other sessions:", error);
      setErrorMessage("Não foi possível revogar as outras sessões.");
      throw error;
    }
  }, [user, currentSessionId, sessions, revokeSession, loadSessions]);

  /**
   * Validate a session token
   */
  const validateSession = useCallback(async (token: string) => {
    try {
      const { data, error } = await supabase.rpc("validate_session_token", {
        p_token: token,
      });

      if (error) {
        console.error("Error validating session:", error);
        return { isValid: false, userId: null, expiresAt: null };
      }

      if (data && data.length > 0) {
        return data[0];
      }

      return { isValid: false, userId: null, expiresAt: null };
    } catch (error) {
      console.error("Error validating session:", error);
      return { isValid: false, userId: null, expiresAt: null };
    }
  }, []);

  /**
   * Get session statistics
   */
  const getSessionStats = useCallback(() => {
    return {
      total: sessions.length,
      active: sessions.filter(s => 
        new Date(s.expires_at) > new Date() && !s.revoked
      ).length,
      expired: sessions.filter(s => 
        new Date(s.expires_at) <= new Date()
      ).length,
      revoked: sessions.filter(s => s.revoked === true).length,
    };
  }, [sessions]);

  // Load sessions on mount
  useEffect(() => {
    if (!user) {
      setSessions([]);
      setLoading(false);
      clearStoredSessionId();
      setCurrentSessionId(null);
      return;
    }

    loadSessions();
  }, [user, loadSessions]);

  return {
    sessions,
    loading,
    currentSessionId,
    error: errorMessage,
    loadSessions,
    createSession,
    revokeSession,
    revokeAllOtherSessions,
    validateSession,
    getSessionStats,
  };
};

/**
 * Detect device information from user agent
 */
export const detectDeviceInfo = () => {
  if (typeof navigator === "undefined") {
    return {
      platform: "server",
      browser: "unknown",
      os: "unknown",
      device_type: "server",
    };
  }

  const userAgent = navigator.userAgent;
  
  // Detect browser
  let browser = "Unknown";
  if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Safari")) browser = "Safari";
  else if (userAgent.includes("Edge")) browser = "Edge";
  else if (userAgent.includes("Opera")) browser = "Opera";

  // Detect OS
  let os = "Unknown";
  if (userAgent.includes("Win")) os = "Windows";
  else if (userAgent.includes("Mac")) os = "macOS";
  else if (userAgent.includes("Linux")) os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iOS")) os = "iOS";

  // Detect device type
  let deviceType = "desktop";
  if (/Mobile/.test(userAgent)) deviceType = "mobile";
  else if (/Tablet/.test(userAgent)) deviceType = "tablet";

  return {
    platform: navigator.platform,
    browser,
    os,
    device_type: deviceType,
  };
};

const normalizeSupabaseSession = (rawSession: ActiveSessionRow): SessionToken => {
  const session = rawSession as ActiveSessionRow & SupabaseActiveSession & { session_id?: string | null };

  const parsedDeviceInfo = parseDeviceInfo(session.device_info);
  const fallbackId =
    session.session_id ||
    session.id ||
    session.token ||
    `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    id: fallbackId,
    token: session.token ?? "",
    device_info: parsedDeviceInfo,
    created_at: session.created_at,
    expires_at: session.expires_at,
    last_activity_at: session.last_activity_at ?? session.created_at,
    revoked: session.revoked ?? false,
    ip_address: session.ip_address ?? null,
  };
};

const parseDeviceInfo = (deviceInfo: unknown): DeviceInfo | null => {
  if (!deviceInfo || typeof deviceInfo !== "object") {
    return null;
  }

  const safeInfo = deviceInfo as Record<string, unknown>;

  const normalized: DeviceInfo = {
    platform: typeof safeInfo.platform === "string" ? safeInfo.platform : undefined,
    browser: typeof safeInfo.browser === "string" ? safeInfo.browser : undefined,
    os: typeof safeInfo.os === "string" ? safeInfo.os : undefined,
    device_type: typeof safeInfo.device_type === "string" ? safeInfo.device_type : undefined,
  };

  if (!normalized.platform && !normalized.browser && !normalized.os && !normalized.device_type) {
    return null;
  }

  return normalized;
};

function getStoredSessionId(): string | null {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return null;
  }

  try {
    return window.sessionStorage.getItem("session_id");
  } catch (error) {
    console.warn("Unable to access sessionStorage for session_id", error);
    return null;
  }
}

function setStoredSessionId(sessionId: string) {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return;
  }

  try {
    window.sessionStorage.setItem("session_id", sessionId);
  } catch (error) {
    console.warn("Unable to persist session_id", error);
  }
}

function clearStoredSessionId() {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return;
  }

  try {
    window.sessionStorage.removeItem("session_id");
  } catch (error) {
    console.warn("Unable to clear session_id", error);
  }
}

function setAndPersistCurrentSession(
  sessionId: string,
  setter: Dispatch<SetStateAction<string | null>>,
) {
  setStoredSessionId(sessionId);
  setter(sessionId);
}
