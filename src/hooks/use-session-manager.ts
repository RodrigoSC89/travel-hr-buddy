/**
 * useSessionManager Hook
 * PATCH 124.0 - Token & Session Security Engine
 * 
 * Hook for managing user sessions and tokens
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SessionToken {
  id: string;
  token: string;
  device_info: {
    platform?: string;
    browser?: string;
    os?: string;
    device_type?: string;
  };
  created_at: string;
  expires_at: string;
  last_activity_at: string;
  revoked: boolean;
}

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
  const [loading, setLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  /**
   * Load active sessions for the current user
   */
  const loadSessions = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_active_sessions');

      if (error) {
        console.error("Error loading sessions:", error);
        return;
      }

      setSessions(data || []);
    } catch (error) {
      console.error("Error loading sessions:", error);
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
      const finalDeviceInfo = deviceInfo || {
        platform: navigator.platform,
        browser: navigator.userAgent.split(' ').pop() || 'Unknown',
        os: navigator.platform,
        device_type: /Mobile|Tablet/.test(navigator.userAgent) ? 'mobile' : 'desktop',
      };

      const { data, error } = await supabase.rpc('create_session_token', {
        p_device_info: finalDeviceInfo,
        p_expires_in_hours: expiresInHours,
      });

      if (error) {
        console.error("Error creating session:", error);
        throw error;
      }

      if (data && data.length > 0) {
        const session = data[0];
        setCurrentSessionId(session.token_id);
        await loadSessions(); // Refresh sessions list
        return session;
      }

      return null;
    } catch (error) {
      console.error("Error creating session:", error);
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
      const { data, error } = await supabase.rpc('revoke_session_token', {
        p_token_id: sessionId,
        p_reason: reason || 'User requested revocation',
      });

      if (error) {
        console.error("Error revoking session:", error);
        throw error;
      }

      await loadSessions(); // Refresh sessions list
      return data;
    } catch (error) {
      console.error("Error revoking session:", error);
      throw error;
    }
  }, [user, loadSessions]);

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
          revokeSession(session.id, 'User revoked all other sessions')
        )
      );

      await loadSessions(); // Refresh sessions list
    } catch (error) {
      console.error("Error revoking all other sessions:", error);
      throw error;
    }
  }, [user, currentSessionId, sessions, revokeSession, loadSessions]);

  /**
   * Validate a session token
   */
  const validateSession = useCallback(async (token: string) => {
    try {
      const { data, error } = await supabase.rpc('validate_session_token', {
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
      revoked: sessions.filter(s => s.revoked).length,
    };
  }, [sessions]);

  // Load sessions on mount
  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user, loadSessions]);

  return {
    sessions,
    loading,
    currentSessionId,
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
  const userAgent = navigator.userAgent;
  
  // Detect browser
  let browser = 'Unknown';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  else if (userAgent.includes('Opera')) browser = 'Opera';

  // Detect OS
  let os = 'Unknown';
  if (userAgent.includes('Win')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';

  // Detect device type
  let deviceType = 'desktop';
  if (/Mobile/.test(userAgent)) deviceType = 'mobile';
  else if (/Tablet/.test(userAgent)) deviceType = 'tablet';

  return {
    platform: navigator.platform,
    browser,
    os,
    device_type: deviceType,
  };
};
