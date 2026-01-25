/**
 * Hook para dados do Mood Dashboard
 * Migra de localStorage para Supabase
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MoodEntry {
  id: string;
  crew_member_id: string;
  crew_member_name?: string;
  mood_score: number;
  energy_level: number;
  stress_level: number;
  notes?: string;
  factors?: string[];
  recorded_at: string;
  vessel_id?: string;
  vessel_name?: string;
}

export interface MoodStats {
  averageMood: number;
  averageEnergy: number;
  averageStress: number;
  totalEntries: number;
  trend: 'improving' | 'declining' | 'stable';
  commonFactors: { factor: string; count: number }[];
}

export interface MoodTrend {
  date: string;
  avgMood: number;
  avgEnergy: number;
  avgStress: number;
  entries: number;
}

export function useMoodDashboardData(options?: {
  vesselId?: string;
  crewMemberId?: string;
  dateRange?: { start: Date; end: Date };
}) {
  const queryClient = useQueryClient();

  const entriesQuery = useQuery({
    queryKey: ['mood-entries', options?.vesselId, options?.crewMemberId, options?.dateRange],
    queryFn: async (): Promise<MoodEntry[]> => {
      let query = supabase
        .from('crew_wellbeing_logs')
        .select(`
          id,
          crew_member_id,
          mood_score,
          energy_level,
          stress_level,
          notes,
          factors,
          recorded_at,
          vessel_id,
          crew_members!crew_wellbeing_logs_crew_member_id_fkey(full_name),
          vessels!crew_wellbeing_logs_vessel_id_fkey(name)
        `)
        .order('recorded_at', { ascending: false })
        .limit(100);

      if (options?.vesselId) {
        query = query.eq('vessel_id', options.vesselId);
      }

      if (options?.crewMemberId) {
        query = query.eq('crew_member_id', options.crewMemberId);
      }

      if (options?.dateRange) {
        query = query
          .gte('recorded_at', options.dateRange.start.toISOString())
          .lte('recorded_at', options.dateRange.end.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(entry => ({
        id: entry.id,
        crew_member_id: entry.crew_member_id || '',
        crew_member_name: (entry.crew_members as any)?.full_name,
        mood_score: entry.mood_score || 3,
        energy_level: entry.energy_level || 3,
        stress_level: entry.stress_level || 3,
        notes: entry.notes ?? undefined,
        factors: (entry.factors as string[]) || [],
        recorded_at: entry.recorded_at,
        vessel_id: entry.vessel_id ?? undefined,
        vessel_name: (entry.vessels as any)?.name,
      }));
    },
    staleTime: 2 * 60 * 1000,
  });

  const statsQuery = useQuery({
    queryKey: ['mood-stats', options?.vesselId, options?.crewMemberId],
    queryFn: async (): Promise<MoodStats> => {
      const entries = entriesQuery.data || [];
      
      if (!entries.length) {
        return {
          averageMood: 0,
          averageEnergy: 0,
          averageStress: 0,
          totalEntries: 0,
          trend: 'stable',
          commonFactors: [],
        };
      }

      const avgMood = entries.reduce((sum, e) => sum + e.mood_score, 0) / entries.length;
      const avgEnergy = entries.reduce((sum, e) => sum + e.energy_level, 0) / entries.length;
      const avgStress = entries.reduce((sum, e) => sum + e.stress_level, 0) / entries.length;

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const recentEntries = entries.filter(e => new Date(e.recorded_at) >= sevenDaysAgo);
      const previousEntries = entries.filter(e => {
        const date = new Date(e.recorded_at);
        return date >= fourteenDaysAgo && date < sevenDaysAgo;
      });

      const recentAvg = recentEntries.length 
        ? recentEntries.reduce((sum, e) => sum + e.mood_score, 0) / recentEntries.length 
        : avgMood;
      const previousAvg = previousEntries.length 
        ? previousEntries.reduce((sum, e) => sum + e.mood_score, 0) / previousEntries.length 
        : avgMood;

      const trend = recentAvg > previousAvg + 0.2 ? 'improving' 
        : recentAvg < previousAvg - 0.2 ? 'declining' 
        : 'stable';

      const factorCounts = new Map<string, number>();
      entries.forEach(e => {
        e.factors?.forEach(f => {
          factorCounts.set(f, (factorCounts.get(f) || 0) + 1);
        });
      });

      const commonFactors = Array.from(factorCounts.entries())
        .map(([factor, count]) => ({ factor, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        averageMood: Math.round(avgMood * 10) / 10,
        averageEnergy: Math.round(avgEnergy * 10) / 10,
        averageStress: Math.round(avgStress * 10) / 10,
        totalEntries: entries.length,
        trend,
        commonFactors,
      };
    },
    enabled: !!entriesQuery.data,
  });

  const trendsQuery = useQuery({
    queryKey: ['mood-trends', options?.vesselId, options?.crewMemberId],
    queryFn: async (): Promise<MoodTrend[]> => {
      const entries = entriesQuery.data || [];
      
      const byDate = new Map<string, MoodEntry[]>();
      entries.forEach(entry => {
        const date = entry.recorded_at.split('T')[0];
        if (!byDate.has(date)) {
          byDate.set(date, []);
        }
        byDate.get(date)!.push(entry);
      });

      return Array.from(byDate.entries())
        .map(([date, dayEntries]) => ({
          date,
          avgMood: dayEntries.reduce((sum, e) => sum + e.mood_score, 0) / dayEntries.length,
          avgEnergy: dayEntries.reduce((sum, e) => sum + e.energy_level, 0) / dayEntries.length,
          avgStress: dayEntries.reduce((sum, e) => sum + e.stress_level, 0) / dayEntries.length,
          entries: dayEntries.length,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30);
    },
    enabled: !!entriesQuery.data,
  });

  const addEntryMutation = useMutation({
    mutationFn: async (entry: Omit<MoodEntry, 'id' | 'recorded_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('crew_wellbeing_logs')
        .insert({
          crew_member_id: entry.crew_member_id,
          mood_score: entry.mood_score,
          energy_level: entry.energy_level,
          stress_level: entry.stress_level,
          notes: entry.notes,
          factors: entry.factors,
          vessel_id: entry.vessel_id,
          recorded_at: new Date().toISOString(),
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mood-entries'] });
      queryClient.invalidateQueries({ queryKey: ['mood-stats'] });
      queryClient.invalidateQueries({ queryKey: ['mood-trends'] });
    },
  });

  return {
    entries: entriesQuery.data || [],
    stats: statsQuery.data,
    trends: trendsQuery.data || [],
    isLoading: entriesQuery.isLoading,
    error: entriesQuery.error,
    addEntry: addEntryMutation.mutate,
    isAddingEntry: addEntryMutation.isPending,
    refetch: entriesQuery.refetch,
  };
}
