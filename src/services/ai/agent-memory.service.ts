/**
 * M002 - Agent Memory Service
 * Persistent memory using ai_memory + ai_memory_events tables
 * Enables contextual conversations and continuous learning
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface MemoryEntry {
  id: string;
  agentId: string;
  type: string;
  content: Record<string, unknown>;
  importance: number;
  createdAt: Date;
}

export interface MemoryEvent {
  id: string;
  eventType: string;
  eventData: Record<string, unknown>;
  context: string;
  confidence: number;
  createdAt: Date;
}

export interface MemoryQueryResult {
  memories: MemoryEntry[];
  events: MemoryEvent[];
  totalRelevant: number;
}

class AgentMemoryService {
  /**
   * Store a memory for an agent
   */
  async storeMemory(
    agentId: string,
    memoryType: string,
    content: Record<string, unknown>,
    importance: number = 5
  ): Promise<string | null> {
    const { data: user } = await supabase.auth.getUser();
    
    const { data, error } = await supabase.from('ai_memory').insert({
      memory_type: memoryType,
      content: JSON.parse(JSON.stringify(content)),
      importance,
      user_id: user?.user?.id || null,
    }).select('id').single();

    if (error) {
      logger.error('Failed to store memory', error as Error);
      return null;
    }
    return data?.id || null;
  }

  /**
   * Store a memory event (interaction, decision, observation)
   */
  async storeEvent(
    eventType: string,
    eventData: Record<string, unknown>,
    context: string,
    confidence: number = 0.8
  ): Promise<string | null> {
    const { data: user } = await supabase.auth.getUser();

    const { data, error } = await supabase.from('ai_memory_events').insert({
      event_type: eventType,
      event_data: JSON.parse(JSON.stringify(eventData)),
      context,
      confidence,
      user_id: user?.user?.id || null,
    }).select('id').single();

    if (error) {
      logger.error('Failed to store event', error as Error);
      return null;
    }
    return data?.id || null;
  }

  /**
   * Query relevant memories for an agent context
   */
  async queryMemories(
    memoryType?: string,
    limit: number = 10
  ): Promise<MemoryEntry[]> {
    let query = supabase
      .from('ai_memory')
      .select('*')
      .order('importance', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (memoryType) {
      query = query.eq('memory_type', memoryType);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map(m => ({
      id: m.id,
      agentId: m.user_id || 'system',
      type: m.memory_type,
      content: (m.content as Record<string, unknown>) || {},
      importance: m.importance || 5,
      createdAt: new Date(m.created_at),
    }));
  }

  /**
   * Query recent events by type
   */
  async queryEvents(
    eventType?: string,
    limit: number = 20
  ): Promise<MemoryEvent[]> {
    let query = supabase
      .from('ai_memory_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map(e => ({
      id: e.id,
      eventType: e.event_type,
      eventData: (e.event_data as Record<string, unknown>) || {},
      context: e.context || '',
      confidence: e.confidence || 0,
      createdAt: new Date(e.created_at),
    }));
  }

  /**
   * Build context string from recent memories for AI prompt injection
   */
  async buildContextForAgent(agentId: string, maxTokens: number = 2000): Promise<string> {
    const memories = await this.queryMemories(undefined, 5);
    const events = await this.queryEvents(undefined, 10);

    let context = '## Agent Memory Context\n\n';

    if (memories.length > 0) {
      context += '### Recent Memories:\n';
      for (const m of memories) {
        const summary = JSON.stringify(m.content).substring(0, 200);
        context += `- [${m.type}] (importance: ${m.importance}) ${summary}\n`;
      }
    }

    if (events.length > 0) {
      context += '\n### Recent Events:\n';
      for (const e of events) {
        context += `- [${e.eventType}] ${e.context} (confidence: ${(e.confidence * 100).toFixed(0)}%)\n`;
      }
    }

    // Truncate to approximate token limit
    return context.substring(0, maxTokens * 4);
  }

  /**
   * Get memory statistics
   */
  async getStats(): Promise<{
    totalMemories: number;
    totalEvents: number;
    memoryTypes: string[];
    eventTypes: string[];
  }> {
    const { count: memCount } = await supabase
      .from('ai_memory')
      .select('*', { count: 'exact', head: true });

    const { count: eventCount } = await supabase
      .from('ai_memory_events')
      .select('*', { count: 'exact', head: true });

    const { data: memTypes } = await supabase
      .from('ai_memory')
      .select('memory_type')
      .limit(100);

    const { data: evTypes } = await supabase
      .from('ai_memory_events')
      .select('event_type')
      .limit(100);

    return {
      totalMemories: memCount || 0,
      totalEvents: eventCount || 0,
      memoryTypes: [...new Set(memTypes?.map(m => m.memory_type) || [])],
      eventTypes: [...new Set(evTypes?.map(e => e.event_type) || [])],
    };
  }
}

export const agentMemory = new AgentMemoryService();
