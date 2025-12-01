/**
 * PATCH 510: Enhanced Authentication Service
 * JWT + Refresh Token implementation with session management
 */

import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

interface RefreshTokenResult {
  success: boolean;
  session?: Session;
  error?: string;
}

/**
 * Auto-refresh tokens before they expire
 */
export class TokenRefreshManager {
  private refreshTimer: NodeJS.Timeout | null = null;
  private readonly REFRESH_MARGIN_SECONDS = 300; // Refresh 5 minutes before expiry

  constructor() {
    this.initializeRefreshCycle();
  }

  /**
   * Initialize the automatic token refresh cycle
   */
  private async initializeRefreshCycle() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        this.scheduleRefresh(session);
      }
    } catch (error) {
      logger.error("Error initializing refresh cycle", error as Error);
    }

    // Listen for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session) {
          this.scheduleRefresh(session);
        }
      } else if (event === "SIGNED_OUT") {
        this.clearRefreshTimer();
      }
    });
  }

  /**
   * Schedule the next token refresh
   */
  private scheduleRefresh(session: Session) {
    this.clearRefreshTimer();

    const expiresAt = session.expires_at;
    if (!expiresAt) return;

    const expiryTime = expiresAt * 1000; // Convert to milliseconds
    const now = Date.now();
    const timeUntilExpiry = expiryTime - now;
    const refreshTime = timeUntilExpiry - (this.REFRESH_MARGIN_SECONDS * 1000);

    // Only schedule if we have enough time before expiry
    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshToken();
      }, refreshTime);

      logger.debug(`Token refresh scheduled in ${Math.round(refreshTime / 1000 / 60)} minutes`);
    } else {
      // Token is about to expire or already expired, refresh immediately
      this.refreshToken();
    }
  }

  /**
   * Manually refresh the access token
   */
  public async refreshToken(): Promise<RefreshTokenResult> {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        logger.error("Token refresh error", error as Error);
        return { success: false, error: error.message };
      }

      if (data.session) {
        logger.info("Token refreshed successfully");
        this.scheduleRefresh(data.session);
        return { success: true, session: data.session };
      }

      return { success: false, error: "No session returned" };
    } catch (error) {
      logger.error("Exception during token refresh", error as Error);
      return {
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  }

  /**
   * Clear the refresh timer
   */
  private clearRefreshTimer() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Clean up resources
   */
  public destroy() {
    this.clearRefreshTimer();
  }
}

/**
 * Enhanced logout with token invalidation
 */
export async function secureLogout(): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current session before logout
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      // Revoke the refresh token if available
      // This is handled automatically by Supabase when signing out
      const { error } = await supabase.auth.signOut();

      if (error) {
        return { success: false, error: error.message };
      }

      // Clear local storage
      localStorage.removeItem("supabase.auth.token");
      sessionStorage.clear();

      logger.info("Secure logout completed");
      return { success: true };
    }

    return { success: true };
  } catch (error) {
    logger.error("Logout error", error as Error);
    return {
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Get active session information
 */
export async function getActiveSession(): Promise<{
  session: Session | null;
  expiresIn: number; // seconds until expiry
  isExpiringSoon: boolean; // true if expires in less than 5 minutes
}> {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return { session: null, expiresIn: 0, isExpiringSoon: false };
    }

    const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
    const now = Date.now();
    const expiresIn = Math.max(0, Math.floor((expiresAt - now) / 1000));
    const isExpiringSoon = expiresIn < 300; // Less than 5 minutes

    return { session, expiresIn, isExpiringSoon };
  } catch (error) {
    logger.error("Error getting session", error as Error);
    return { session: null, expiresIn: 0, isExpiringSoon: false };
  }
}

/**
 * Check if user is authenticated with valid token
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    logger.error("Authentication check error", error as Error);
    return false;
  }
}

/**
 * Get session metadata for display
 */
export interface SessionMetadata {
  userId: string;
  email: string;
  createdAt: string;
  expiresAt: string;
  expiresIn: string; // Human-readable format
  tokenType: string;
  isExpiring: boolean;
}

export async function getSessionMetadata(): Promise<SessionMetadata | null> {
  try {
    const { session, expiresIn, isExpiringSoon } = await getActiveSession();

    if (!session || !session.user) {
      return null;
    }

    const expiresInMinutes = Math.floor(expiresIn / 60);
    const expiresInHours = Math.floor(expiresInMinutes / 60);

    let expiresInFormatted: string;
    if (expiresInHours > 0) {
      expiresInFormatted = `${expiresInHours}h ${expiresInMinutes % 60}m`;
    } else {
      expiresInFormatted = `${expiresInMinutes}m`;
    }

    return {
      userId: session.user.id,
      email: session.user.email || "Unknown",
      createdAt: new Date(session.user.created_at).toLocaleString(),
      expiresAt: new Date((session.expires_at || 0) * 1000).toLocaleString(),
      expiresIn: expiresInFormatted,
      tokenType: "Bearer",
      isExpiring: isExpiringSoon,
    };
  } catch (error) {
    logger.error("Error getting session metadata", error as Error);
    return null;
  }
}

/**
 * Initialize automatic token refresh
 */
let tokenManager: TokenRefreshManager | null = null;

export function initializeTokenRefresh() {
  if (!tokenManager) {
    tokenManager = new TokenRefreshManager();
  }
  return tokenManager;
}

/**
 * Clean up token refresh manager
 */
export function destroyTokenRefresh() {
  if (tokenManager) {
    tokenManager.destroy();
    tokenManager = null;
  }
}
