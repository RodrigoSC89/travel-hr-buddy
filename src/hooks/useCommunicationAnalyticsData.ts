/**
 * Hook para dados de Communication Analytics
 * Usa a tabela messages com as colunas corretas
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CommunicationMetrics {
  totalMessages: number;
  sentMessages: number;
  receivedMessages: number;
  averageResponseTime: number;
  activeConversations: number;
  unreadMessages: number;
}

export interface ChannelStats {
  channel: string;
  messageCount: number;
  lastActivity: string;
  participants: number;
}

export interface CommunicationTrend {
  date: string;
  sent: number;
  received: number;
  total: number;
}

export interface TopCommunicator {
  userId: string;
  userName: string;
  avatar?: string;
  messagesSent: number;
  avgResponseTime: number;
}

export function useCommunicationAnalyticsData(options?: {
  dateRange?: { start: Date; end: Date };
  conversationId?: string;
}) {
  const metricsQuery = useQuery({
    queryKey: ['communication-metrics', options],
    queryFn: async (): Promise<CommunicationMetrics> => {
      let query = supabase
        .from('messages')
        .select('id, sender_id, created_at, message_type, conversation_id');

      if (options?.dateRange) {
        query = query
          .gte('created_at', options.dateRange.start.toISOString())
          .lte('created_at', options.dateRange.end.toISOString());
      }

      const { data: messages, error } = await query;
      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      const allMessages = messages || [];
      const sent = allMessages.filter(m => m.sender_id === userId);
      
      // Get unique conversations
      const conversations = new Set(allMessages.map(m => m.conversation_id).filter(Boolean));

      return {
        totalMessages: allMessages.length,
        sentMessages: sent.length,
        receivedMessages: allMessages.length - sent.length,
        averageResponseTime: 5, // Placeholder - would need read receipts
        activeConversations: conversations.size,
        unreadMessages: 0, // Would need read status tracking
      };
    },
    staleTime: 2 * 60 * 1000,
  });

  const channelStatsQuery = useQuery({
    queryKey: ['communication-channels', options],
    queryFn: async (): Promise<ChannelStats[]> => {
      const { data, error } = await supabase
        .from('messages')
        .select('conversation_id, created_at, sender_id, message_type')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by conversation
      const conversationMap = new Map<string, any[]>();
      (data || []).forEach(msg => {
        const convId = msg.conversation_id || 'direct';
        if (!conversationMap.has(convId)) {
          conversationMap.set(convId, []);
        }
        conversationMap.get(convId)!.push(msg);
      });

      return Array.from(conversationMap.entries()).map(([channel, messages]) => {
        const participants = new Set(messages.map(m => m.sender_id).filter(Boolean));

        return {
          channel: channel.substring(0, 8), // Short ID
          messageCount: messages.length,
          lastActivity: messages[0]?.created_at || new Date().toISOString(),
          participants: participants.size,
        };
      }).sort((a, b) => b.messageCount - a.messageCount).slice(0, 10);
    },
    staleTime: 5 * 60 * 1000,
  });

  const trendsQuery = useQuery({
    queryKey: ['communication-trends', options],
    queryFn: async (): Promise<CommunicationTrend[]> => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('messages')
        .select('sender_id, created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at');

      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      // Group by date
      const byDate = new Map<string, { sent: number; received: number }>();
      
      (data || []).forEach(msg => {
        const date = msg.created_at.split('T')[0];
        if (!byDate.has(date)) {
          byDate.set(date, { sent: 0, received: 0 });
        }
        
        const stats = byDate.get(date)!;
        if (msg.sender_id === userId) {
          stats.sent++;
        } else {
          stats.received++;
        }
      });

      return Array.from(byDate.entries())
        .map(([date, stats]) => ({
          date,
          sent: stats.sent,
          received: stats.received,
          total: stats.sent + stats.received,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    },
    staleTime: 5 * 60 * 1000,
  });

  const topCommunicatorsQuery = useQuery({
    queryKey: ['top-communicators', options],
    queryFn: async (): Promise<TopCommunicator[]> => {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('sender_id, created_at')
        .limit(1000);

      if (error) throw error;

      // Count messages per user
      const userStats = new Map<string, { sent: number }>();
      
      (messages || []).forEach(msg => {
        if (msg.sender_id) {
          if (!userStats.has(msg.sender_id)) {
            userStats.set(msg.sender_id, { sent: 0 });
          }
          userStats.get(msg.sender_id)!.sent++;
        }
      });

      // Get user profiles
      const userIds = Array.from(userStats.keys());
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds.length > 0 ? userIds : ['00000000-0000-0000-0000-000000000000']);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return Array.from(userStats.entries())
        .map(([usId, stats]) => {
          const profile = profileMap.get(usId);
          return {
            userId: usId,
            userName: profile?.full_name || 'Unknown User',
            avatar: profile?.avatar_url ?? undefined,
            messagesSent: stats.sent,
            avgResponseTime: 5, // Placeholder
          };
        })
        .sort((a, b) => b.messagesSent - a.messagesSent)
        .slice(0, 10);
    },
    staleTime: 10 * 60 * 1000,
  });

  return {
    metrics: metricsQuery.data,
    channelStats: channelStatsQuery.data || [],
    trends: trendsQuery.data || [],
    topCommunicators: topCommunicatorsQuery.data || [],
    isLoading: metricsQuery.isLoading || channelStatsQuery.isLoading,
    error: metricsQuery.error || channelStatsQuery.error,
    refetch: () => {
      metricsQuery.refetch();
      channelStatsQuery.refetch();
      trendsQuery.refetch();
      topCommunicatorsQuery.refetch();
    },
  };
}
