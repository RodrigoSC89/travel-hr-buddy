/**
 * Session Manager
 * Handles session persistence, auto-refresh, and timeout
 */

import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

interface SessionConfig {
  refreshThresholdMs: number; // Refresh when this much time left
  timeoutMs: number; // Auto logout after this inactivity
}

const DEFAULT_CONFIG: SessionConfig = {
  refreshThresholdMs: 5 * 60 * 1000, // Refresh 5 minutes before expiry
  timeoutMs: 30 * 60 * 1000, // 30 minutes of inactivity
};

class SessionManager {
  private lastActivity: number = Date.now();
  private activityTimer: NodeJS.Timeout | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;
  private config: SessionConfig = DEFAULT_CONFIG;

  /**
   * Initialize session manager
   */
  public initialize(config?: Partial<SessionConfig>): void {
    if (config) {
      this.config = { ...DEFAULT_CONFIG, ...config };
    }

    this.startActivityMonitoring();
    this.startRefreshMonitoring();
  }

  /**
   * Start monitoring user activity
   */
  private startActivityMonitoring(): void {
    const updateActivity = () => {
      this.lastActivity = Date.now();
    };

    // Monitor user interactions
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Check for timeout every minute
    this.activityTimer = setInterval(() => {
      this.checkActivityTimeout();
    }, 60000);
  }

  /**
   * Check if session has timed out due to inactivity
   */
  private async checkActivityTimeout(): Promise<void> {
    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivity;

    if (timeSinceLastActivity >= this.config.timeoutMs) {
      console.log('Session timed out due to inactivity');
      await supabase.auth.signOut();
    }
  }

  /**
   * Start monitoring session expiry and auto-refresh
   */
  private startRefreshMonitoring(): void {
    this.refreshTimer = setInterval(async () => {
      await this.checkAndRefreshSession();
    }, 60000); // Check every minute
  }

  /**
   * Check session expiry and refresh if needed
   */
  private async checkAndRefreshSession(): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const expiresAt = session.expires_at;
      if (!expiresAt) return;

      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = (expiresAt - now) * 1000;

      // Refresh if close to expiry
      if (timeUntilExpiry <= this.config.refreshThresholdMs) {
        console.log('Refreshing session token');
        const { error } = await supabase.auth.refreshSession();
        
        if (error) {
          console.error('Failed to refresh session:', error);
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  }

  /**
   * Store session in localStorage for persistence
   */
  public persistSession(session: Session): void {
    try {
      localStorage.setItem('session_backup', JSON.stringify({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
      }));
    } catch (error) {
      console.error('Failed to persist session:', error);
    }
  }

  /**
   * Restore session from localStorage
   */
  public async restoreSession(): Promise<boolean> {
    try {
      const sessionData = localStorage.getItem('session_backup');
      if (!sessionData) return false;

      const { access_token, refresh_token } = JSON.parse(sessionData);
      
      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) {
        console.error('Failed to restore session:', error);
        localStorage.removeItem('session_backup');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error restoring session:', error);
      return false;
    }
  }

  /**
   * Clear persisted session
   */
  public clearPersistedSession(): void {
    try {
      localStorage.removeItem('session_backup');
    } catch (error) {
      console.error('Failed to clear persisted session:', error);
    }
  }

  /**
   * Cleanup and stop monitoring
   */
  public cleanup(): void {
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
      this.activityTimer = null;
    }
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Get time since last activity
   */
  public getTimeSinceLastActivity(): number {
    return Date.now() - this.lastActivity;
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();
