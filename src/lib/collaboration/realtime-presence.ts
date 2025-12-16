/**
 * Real-time Presence System - PATCH 837
 * Live collaboration and presence awareness
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UserPresence {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  cursor?: { x: number; y: number };
  currentPage: string;
  lastSeen: number;
  status: 'online' | 'away' | 'busy';
}

interface PresenceState {
  users: UserPresence[];
  isConnected: boolean;
  currentUser: UserPresence | null;
}

// Generate consistent color from user ID
function generateUserColor(userId: string): string {
  const colors = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', 
    '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
  ];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

class RealtimePresenceManager {
  private channel: RealtimeChannel | null = null;
  private currentUser: UserPresence | null = null;
  private users = new Map<string, UserPresence>();
  private listeners = new Set<(state: PresenceState) => void>();
  private heartbeatInterval: number | null = null;
  private isConnected = false;
  
  /**
   * Initialize presence for a user
   */
  async init(user: { id: string; name: string; avatar?: string }, roomId = 'global'): Promise<void> {
    if (this.channel) {
      await this.disconnect();
    }
    
    this.currentUser = {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      color: generateUserColor(user.id),
      currentPage: window.location.pathname,
      lastSeen: Date.now(),
      status: 'online',
    };
    
    this.channel = supabase.channel(`presence:${roomId}`, {
      config: { presence: { key: user.id } },
    });
    
    this.channel
      .on('presence', { event: 'sync' }, () => {
        const state = this.channel?.presenceState() || {};
        this.users.clear();
        
        Object.entries(state).forEach(([key, presences]) => {
          const presence = (presences as unknown[])[0] as UserPresence | undefined;
          if (presence && key !== this.currentUser?.id) {
            this.users.set(key, presence);
          }
        });
        
        this.notify();
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        const presence = (newPresences as unknown[])[0] as UserPresence | undefined;
        if (presence && key !== this.currentUser?.id) {
          this.users.set(key, presence);
          this.notify();
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        this.users.delete(key);
        this.notify();
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && this.currentUser) {
          await this.channel?.track(this.currentUser);
          this.isConnected = true;
          this.startHeartbeat();
          this.notify();
        }
      });
  }
  
  private startHeartbeat(): void {
    this.heartbeatInterval = window.setInterval(() => {
      if (this.currentUser && this.channel) {
        this.currentUser.lastSeen = Date.now();
        this.channel.track(this.currentUser);
      }
    }, 30000); // Every 30 seconds
  }
  
  /**
   * Update current user's page
   */
  async updatePage(page: string): Promise<void> {
    if (this.currentUser && this.channel) {
      this.currentUser.currentPage = page;
      await this.channel.track(this.currentUser);
    }
  }
  
  /**
   * Update current user's cursor position
   */
  async updateCursor(x: number, y: number): Promise<void> {
    if (this.currentUser && this.channel) {
      this.currentUser.cursor = { x, y };
      await this.channel.track(this.currentUser);
    }
  }
  
  /**
   * Update current user's status
   */
  async updateStatus(status: UserPresence['status']): Promise<void> {
    if (this.currentUser && this.channel) {
      this.currentUser.status = status;
      await this.channel.track(this.currentUser);
    }
  }
  
  /**
   * Disconnect from presence
   */
  async disconnect(): Promise<void> {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.channel) {
      await this.channel.untrack();
      await supabase.removeChannel(this.channel);
      this.channel = null;
    }
    
    this.users.clear();
    this.currentUser = null;
    this.isConnected = false;
    this.notify();
  }
  
  /**
   * Get current state
   */
  getState(): PresenceState {
    return {
      users: Array.from(this.users.values()),
      isConnected: this.isConnected,
      currentUser: this.currentUser,
    };
  }
  
  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: PresenceState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }
  
  private notify(): void {
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
  }
}

// Singleton instance
export const presenceManager = new RealtimePresenceManager();

/**
 * React hook for presence
 */
export function usePresence(roomId?: string) {
  const [state, setState] = useState<PresenceState>(presenceManager.getState());
  
  useEffect(() => {
    return presenceManager.subscribe(setState);
  }, []);
  
  const updatePage = useCallback((page: string) => {
    presenceManager.updatePage(page);
  }, []);
  
  const updateStatus = useCallback((status: UserPresence['status']) => {
    presenceManager.updateStatus(status);
  }, []);
  
  return {
    ...state,
    updatePage,
    updateStatus,
    disconnect: presenceManager.disconnect.bind(presenceManager),
  };
}

/**
 * Hook for cursor tracking
 */
export function useCursorTracking(enabled = true) {
  const throttleRef = useRef<number>(0);
  
  useEffect(() => {
    if (!enabled) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - throttleRef.current > 100) { // Throttle to 10fps
        throttleRef.current = now;
        presenceManager.updateCursor(e.clientX, e.clientY);
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [enabled]);
}

/**
 * Get users on same page
 */
export function useUsersOnPage(page: string) {
  const { users } = usePresence();
  return users.filter(u => u.currentPage === page);
}
