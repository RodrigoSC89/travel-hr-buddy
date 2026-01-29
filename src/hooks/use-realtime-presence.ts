/**
 * Hook para presença em tempo real com Supabase Realtime
 * Mostra quem está online e onde estão na aplicação
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UserPresence {
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
  currentPage: string;
  lastActivity: string;
  status: 'online' | 'away' | 'busy';
}

interface UseRealtimePresenceOptions {
  roomId?: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}

export function useRealtimePresence(options: UseRealtimePresenceOptions = {}) {
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [myPresence, setMyPresence] = useState<UserPresence | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Get room ID (default to 'global')
  const roomId = options.roomId || 'nautione-presence';

  // Join presence channel
  useEffect(() => {
    const presenceChannel = supabase.channel(roomId);

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const users: UserPresence[] = [];

        Object.values(state).forEach((presences: unknown) => {
          const presenceArray = presences as UserPresence[];
          presenceArray.forEach(presence => {
            users.push(presence);
          });
        });

        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('[useRealtimePresence] User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('[useRealtimePresence] User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          
          // Track own presence
          const { data: { user } } = await supabase.auth.getUser();
          
          const presence: UserPresence = {
            id: user?.id || crypto.randomUUID(),
            email: options.userEmail || user?.email,
            name: options.userName || user?.user_metadata?.name || user?.email?.split('@')[0],
            avatar: options.userAvatar || user?.user_metadata?.avatar_url,
            currentPage: window.location.pathname,
            lastActivity: new Date().toISOString(),
            status: 'online',
          };

          setMyPresence(presence);
          await presenceChannel.track(presence);
        }
      });

    setChannel(presenceChannel);

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [roomId, options.userEmail, options.userName, options.userAvatar]);

  // Update current page
  const updatePage = useCallback(async (page: string) => {
    if (!channel || !myPresence) return;

    const updatedPresence = {
      ...myPresence,
      currentPage: page,
      lastActivity: new Date().toISOString(),
    };

    setMyPresence(updatedPresence);
    await channel.track(updatedPresence);
  }, [channel, myPresence]);

  // Update status
  const updateStatus = useCallback(async (status: 'online' | 'away' | 'busy') => {
    if (!channel || !myPresence) return;

    const updatedPresence = {
      ...myPresence,
      status,
      lastActivity: new Date().toISOString(),
    };

    setMyPresence(updatedPresence);
    await channel.track(updatedPresence);
  }, [channel, myPresence]);

  // Get users on specific page
  const getUsersOnPage = useCallback((page: string) => {
    return onlineUsers.filter(u => u.currentPage === page);
  }, [onlineUsers]);

  // Get other users (excluding self)
  const otherUsers = onlineUsers.filter(u => u.id !== myPresence?.id);

  return {
    onlineUsers,
    otherUsers,
    myPresence,
    isConnected,
    updatePage,
    updateStatus,
    getUsersOnPage,
    totalOnline: onlineUsers.length,
  };
}
