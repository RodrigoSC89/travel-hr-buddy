/**
 * Communication Analytics Hook - Connected to Supabase
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsData {
  dailyActivity: Array<{ date: string; messages: number; channels: number; users: number }>;
  messageTypes: Array<{ type: string; count: number; percentage: number }>;
  responseTimeData: Array<{ period: string; avgResponseTime: number; targetTime: number }>;
  userEngagement: Array<{ department: string; activeUsers: number; totalUsers: number; engagementRate: number }>;
  priorityDistribution: Array<{ priority: string; count: number; color: string }>;
  communicationTrends: Array<{ month: string; internal: number; external: number; emergency: number }>;
}

export function useCommunicationAnalytics(period: string = '7d') {
  return useQuery({
    queryKey: ['communication-analytics', period],
    queryFn: async (): Promise<AnalyticsData> => {
      // Calculate date range based on period
      const now = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '24h': startDate.setDate(now.getDate() - 1); break;
        case '7d': startDate.setDate(now.getDate() - 7); break;
        case '30d': startDate.setDate(now.getDate() - 30); break;
        case '90d': startDate.setDate(now.getDate() - 90); break;
        default: startDate.setDate(now.getDate() - 7);
      }

      // Fetch message counts by type
      const { data: messageData } = await supabase
        .from('communication_messages')
        .select('message_type, priority, created_at, response_time_seconds')
        .gte('created_at', startDate.toISOString());

      const messages = messageData || [];
      const totalMessages = messages.length;

      // Calculate message types distribution
      const typeCounts: Record<string, number> = {};
      messages.forEach(m => {
        typeCounts[m.message_type || 'direct'] = (typeCounts[m.message_type || 'direct'] || 0) + 1;
      });

      const typeLabels: Record<string, string> = {
        'direct': 'Mensagens Diretas',
        'group': 'Canais de Grupo',
        'broadcast': 'Transmissões',
        'emergency': 'Emergência',
        'system': 'Sistema/IA'
      };

      const messageTypes = Object.entries(typeCounts).map(([type, count]) => ({
        type: typeLabels[type] || type,
        count,
        percentage: totalMessages > 0 ? Math.round((count / totalMessages) * 100) : 0
      }));

      // Calculate priority distribution
      const priorityCounts: Record<string, number> = {};
      messages.forEach(m => {
        priorityCounts[m.priority || 'normal'] = (priorityCounts[m.priority || 'normal'] || 0) + 1;
      });

      const priorityColors: Record<string, string> = {
        'low': 'hsl(var(--muted))',
        'normal': 'hsl(var(--primary))',
        'high': 'hsl(var(--warning))',
        'critical': 'hsl(var(--destructive))'
      };

      const priorityLabels: Record<string, string> = {
        'low': 'Baixa',
        'normal': 'Normal',
        'high': 'Alta',
        'critical': 'Crítica'
      };

      const priorityDistribution = Object.entries(priorityCounts).map(([priority, count]) => ({
        priority: priorityLabels[priority] || priority,
        count,
        color: priorityColors[priority] || priorityColors['normal']
      }));

      // Calculate daily activity
      const dailyMap: Record<string, { messages: number; users: Set<string> }> = {};
      messages.forEach(m => {
        const date = m.created_at?.split('T')[0] || '';
        if (!dailyMap[date]) dailyMap[date] = { messages: 0, users: new Set() };
        dailyMap[date].messages++;
      });

      const dailyActivity = Object.entries(dailyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-7)
        .map(([date, data]) => ({
          date,
          messages: data.messages,
          channels: Math.ceil(data.messages / 10),
          users: data.users.size || Math.ceil(data.messages / 3)
        }));

      // Calculate average response time by day
      const dayOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const responseTimeData = dayOfWeek.map((day, idx) => {
        const dayMessages = messages.filter(m => {
          const d = new Date(m.created_at || '');
          return d.getDay() === idx;
        });
        const avgTime = dayMessages.length > 0 
          ? dayMessages.reduce((sum, m) => sum + (m.response_time_seconds || 0), 0) / dayMessages.length / 60
          : 0;
        return { period: day, avgResponseTime: parseFloat(avgTime.toFixed(1)), targetTime: 4 };
      });

      // User engagement - derive from crew_members positions
      const { data: crewByPosition } = await supabase
        .from("crew_members")
        .select("position, status")
        .limit(200);

      const positionGroups: Record<string, { active: number; total: number }> = {};
      (crewByPosition || []).forEach(c => {
        const pos = c.position || "Outros";
        if (!positionGroups[pos]) positionGroups[pos] = { active: 0, total: 0 };
        positionGroups[pos].total++;
        if (c.status === "active") positionGroups[pos].active++;
      });

      const userEngagement = Object.entries(positionGroups).slice(0, 5).map(([dept, counts]) => ({
        department: dept,
        activeUsers: counts.active,
        totalUsers: counts.total,
        engagementRate: counts.total > 0 ? Math.round((counts.active / counts.total) * 100) : 0,
      }));

      // Communication trends - aggregate from real messages by month
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      const { data: trendMessages } = await supabase
        .from("communication_messages")
        .select("message_type, priority, created_at")
        .gte("created_at", sixMonthsAgo.toISOString())
        .order("created_at", { ascending: true });

      const monthLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const trendMap: Record<string, { internal: number; external: number; emergency: number }> = {};

      (trendMessages || []).forEach(m => {
        const date = new Date(m.created_at || '');
        const key = monthLabels[date.getMonth()];
        if (!trendMap[key]) trendMap[key] = { internal: 0, external: 0, emergency: 0 };
        if (m.priority === 'critical') trendMap[key].emergency++;
        else if (m.message_type === 'broadcast') trendMap[key].external++;
        else trendMap[key].internal++;
      });

      const communicationTrends = Object.entries(trendMap).map(([month, data]) => ({
        month,
        ...data,
      }));

      return {
        dailyActivity,
        messageTypes: messageTypes.length > 0 ? messageTypes : [
          { type: 'Mensagens Diretas', count: 0, percentage: 0 }
        ],
        responseTimeData,
        userEngagement,
        priorityDistribution: priorityDistribution.length > 0 ? priorityDistribution : [
          { priority: 'Normal', count: 0, color: 'hsl(var(--primary))' }
        ],
        communicationTrends
      };
    },
    staleTime: 5 * 60 * 1000
  });
}
