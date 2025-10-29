/**
 * PATCH 506: AI Memory Service
 * Persistent AI learning and context retrieval using vector embeddings
 */

import { supabase } from '@/integrations/supabase/client';
import { generateEmbedding } from './openai';

export interface AIMemoryEvent {
  id?: string;
  user_id?: string;
  context_type: 'decision' | 'query' | 'action' | 'feedback';
  action: string;
  input_text: string;
  output_text: string;
  embedding?: number[];
  metadata?: Record<string, any>;
  relevance_score?: number;
  success_indicator?: boolean;
  created_at?: string;
}

export interface SimilarMemory extends AIMemoryEvent {
  similarity: number;
}

/**
 * Store a new AI memory event with vector embedding
 */
export async function storeAIMemory(
  memory: AIMemoryEvent
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Generate embedding for the combined context
    const textForEmbedding = `${memory.input_text} ${memory.output_text}`;
    const embedding = await generateEmbedding(textForEmbedding);

    if (!embedding) {
      return { success: false, error: 'Failed to generate embedding' };
    }

    // Store in database
    const { data, error } = await supabase
      .from('ai_memory_events')
      .insert({
        user_id: user.id,
        context_type: memory.context_type,
        action: memory.action,
        input_text: memory.input_text,
        output_text: memory.output_text,
        embedding: embedding,
        metadata: memory.metadata || {},
        relevance_score: memory.relevance_score || 0.5,
        success_indicator: memory.success_indicator ?? true,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error storing AI memory:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data.id };
  } catch (error) {
    console.error('Exception storing AI memory:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Retrieve similar memories using vector similarity search
 */
export async function retrieveSimilarMemories(
  query: string,
  matchThreshold: number = 0.7,
  matchCount: number = 5,
  userId?: string
): Promise<SimilarMemory[]> {
  try {
    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query);
    
    if (!queryEmbedding) {
      console.error('Failed to generate query embedding');
      return [];
    }

    const { data: { user } } = await supabase.auth.getUser();
    const targetUserId = userId || user?.id;

    // Call RPC function for similarity search
    const { data, error } = await supabase.rpc('search_similar_ai_memories', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
      p_user_id: targetUserId,
    });

    if (error) {
      console.error('Error retrieving similar memories:', error);
      return [];
    }

    // Update access statistics for retrieved memories
    if (data && data.length > 0) {
      await Promise.all(
        data.map((memory: any) => updateMemoryAccess(memory.id))
      );
    }

    return data || [];
  } catch (error) {
    console.error('Exception retrieving similar memories:', error);
    return [];
  }
}

/**
 * Update access count when memory is retrieved
 */
export async function updateMemoryAccess(memoryId: string): Promise<void> {
  try {
    await supabase.rpc('update_ai_memory_access', {
      memory_id: memoryId,
    });
  } catch (error) {
    console.error('Error updating memory access:', error);
  }
}

/**
 * Get recent memories for a user
 */
export async function getRecentMemories(
  limit: number = 10,
  contextType?: string
): Promise<AIMemoryEvent[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    let query = supabase
      .from('ai_memory_events')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (contextType) {
      query = query.eq('context_type', contextType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching recent memories:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception fetching recent memories:', error);
    return [];
  }
}

/**
 * Get memory statistics for a user
 */
export async function getMemoryStats(): Promise<{
  total: number;
  byType: Record<string, number>;
  avgRelevance: number;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { total: 0, byType: {}, avgRelevance: 0 };
    }

    const { data, error } = await supabase
      .from('ai_memory_events')
      .select('context_type, relevance_score')
      .eq('user_id', user.id)
      .is('deleted_at', null);

    if (error || !data) {
      return { total: 0, byType: {}, avgRelevance: 0 };
    }

    const byType: Record<string, number> = {};
    let totalRelevance = 0;

    data.forEach((item) => {
      byType[item.context_type] = (byType[item.context_type] || 0) + 1;
      totalRelevance += item.relevance_score || 0;
    });

    return {
      total: data.length,
      byType,
      avgRelevance: data.length > 0 ? totalRelevance / data.length : 0,
    };
  } catch (error) {
    console.error('Exception fetching memory stats:', error);
    return { total: 0, byType: {}, avgRelevance: 0 };
  }
}

/**
 * Delete old or irrelevant memories
 */
export async function cleanupOldMemories(daysOld: number = 90): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('cleanup_old_ai_memories', {
      days_old: daysOld,
    });

    if (error) {
      console.error('Error cleaning up memories:', error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error('Exception cleaning up memories:', error);
    return 0;
  }
}
