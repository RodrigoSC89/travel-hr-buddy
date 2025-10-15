/**
 * Service for managing resolved work orders (OS) for AI learning
 */

import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type MmiOsResolvidas = Database['public']['Tables']['mmi_os_resolvidas'];
type MmiOsResolvidasInsert = MmiOsResolvidas['Insert'];
type MmiOsResolvidasRow = MmiOsResolvidas['Row'];

type MmiOsIaFeed = Database['public']['Views']['mmi_os_ia_feed'];
type MmiOsIaFeedRow = MmiOsIaFeed['Row'];

/**
 * Create a new resolved work order record
 */
export const createResolvedWorkOrder = async (
  data: Omit<MmiOsResolvidasInsert, 'id' | 'created_at'>
): Promise<{ data: MmiOsResolvidasRow | null; error: Error | null }> => {
  try {
    const { data: result, error } = await supabase
      .from('mmi_os_resolvidas')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Error creating resolved work order:', error);
      return { data: null, error };
    }

    return { data: result, error: null };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * Get all resolved work orders for a specific component
 */
export const getResolvedWorkOrdersByComponent = async (
  componente: string,
  onlyEffective: boolean = false
): Promise<{ data: MmiOsResolvidasRow[] | null; error: Error | null }> => {
  try {
    let query = supabase
      .from('mmi_os_resolvidas')
      .select('*')
      .eq('componente', componente)
      .order('resolvido_em', { ascending: false });

    if (onlyEffective) {
      query = query.eq('efetiva', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching resolved work orders:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * Get AI learning feed data
 * This returns clean data for AI consumption
 */
export const getAiLearningFeed = async (
  componente?: string,
  limit: number = 100
): Promise<{ data: MmiOsIaFeedRow[] | null; error: Error | null }> => {
  try {
    let query = supabase
      .from('mmi_os_ia_feed')
      .select('*')
      .order('resolvido_em', { ascending: false })
      .limit(limit);

    if (componente) {
      query = query.eq('componente', componente);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching AI learning feed:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * Get statistics for resolved work orders
 */
export const getResolvedWorkOrderStats = async (componente?: string) => {
  try {
    let query = supabase
      .from('mmi_os_resolvidas')
      .select('*');

    if (componente) {
      query = query.eq('componente', componente);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching statistics:', error);
      return { data: null, error };
    }

    if (!data) {
      return { data: null, error: new Error('No data found') };
    }

    // Calculate statistics
    const total = data.length;
    const effective = data.filter(item => item.efetiva === true).length;
    const ineffective = data.filter(item => item.efetiva === false).length;
    const pending = data.filter(item => item.efetiva === null).length;
    
    // Calculate average duration for completed items with duration
    const itemsWithDuration = data.filter(item => item.duracao_execucao);
    const avgDuration = itemsWithDuration.length > 0
      ? itemsWithDuration
          .map(item => parseDurationToMinutes(item.duracao_execucao))
          .reduce((sum, duration) => sum + duration, 0) / itemsWithDuration.length
      : 0;

    return {
      data: {
        total,
        effective,
        ineffective,
        pending,
        effectivenessRate: total > 0 ? (effective / total) * 100 : 0,
        avgDurationMinutes: avgDuration,
      },
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * Update the effectiveness status of a resolved work order
 */
export const updateWorkOrderEffectiveness = async (
  id: string,
  efetiva: boolean,
  causa_confirmada?: string
): Promise<{ data: MmiOsResolvidasRow | null; error: Error | null }> => {
  try {
    const updateData: Partial<MmiOsResolvidasRow> = {
      efetiva,
    };

    if (causa_confirmada) {
      updateData.causa_confirmada = causa_confirmada;
    }

    const { data, error } = await supabase
      .from('mmi_os_resolvidas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating work order effectiveness:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * Helper function to parse PostgreSQL interval to minutes
 */
function parseDurationToMinutes(duration: string | null): number {
  if (!duration) return 0;
  
  // Simple parser for common interval formats
  // Examples: "2 hours", "1 hour 30 minutes", "45 minutes"
  const hourMatch = duration.match(/(\d+)\s*hour/i);
  const minuteMatch = duration.match(/(\d+)\s*minute/i);
  
  const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
  const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;
  
  return (hours * 60) + minutes;
}

/**
 * Get the most common causes for a specific component
 */
export const getMostCommonCauses = async (
  componente: string,
  limit: number = 5
): Promise<{ data: Array<{ causa: string; count: number }> | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('mmi_os_resolvidas')
      .select('causa_confirmada')
      .eq('componente', componente)
      .not('causa_confirmada', 'is', null);

    if (error) {
      console.error('Error fetching causes:', error);
      return { data: null, error };
    }

    if (!data) {
      return { data: [], error: null };
    }

    // Count occurrences of each cause
    const causeCounts: { [key: string]: number } = {};
    data.forEach(item => {
      if (item.causa_confirmada) {
        causeCounts[item.causa_confirmada] = (causeCounts[item.causa_confirmada] || 0) + 1;
      }
    });

    // Convert to array and sort by count
    const sortedCauses = Object.entries(causeCounts)
      .map(([causa, count]) => ({ causa, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return { data: sortedCauses, error: null };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * Get the most effective actions for a specific component
 */
export const getMostEffectiveActions = async (
  componente: string,
  limit: number = 5
): Promise<{ data: Array<{ acao: string; successRate: number; count: number }> | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('mmi_os_resolvidas')
      .select('acao_realizada, efetiva')
      .eq('componente', componente)
      .not('acao_realizada', 'is', null)
      .not('efetiva', 'is', null);

    if (error) {
      console.error('Error fetching actions:', error);
      return { data: null, error };
    }

    if (!data || data.length === 0) {
      return { data: [], error: null };
    }

    // Calculate success rate for each action
    const actionStats: { [key: string]: { total: number; successful: number } } = {};
    
    data.forEach(item => {
      if (item.acao_realizada) {
        if (!actionStats[item.acao_realizada]) {
          actionStats[item.acao_realizada] = { total: 0, successful: 0 };
        }
        actionStats[item.acao_realizada].total++;
        if (item.efetiva) {
          actionStats[item.acao_realizada].successful++;
        }
      }
    });

    // Convert to array and calculate success rate
    const sortedActions = Object.entries(actionStats)
      .map(([acao, stats]) => ({
        acao,
        successRate: (stats.successful / stats.total) * 100,
        count: stats.total,
      }))
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, limit);

    return { data: sortedActions, error: null };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { data: null, error: error as Error };
  }
};
