import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface VoiceConversation {
  id: string;
  user_id: string;
  title?: string;
  session_id?: string;
  started_at: string;
  ended_at?: string;
  total_messages: number;
  total_duration: number;
  status: string;
}

export interface VoiceMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  audio_url?: string;
  transcript?: string;
  action_type?: string;
  action_data?: Record<string, any>;
  duration?: number;
  created_at: string;
}

export function useVoiceLogging() {
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLogging, setIsLogging] = useState(false);

  const startConversation = useCallback(async (title?: string) => {
    try {
      setIsLogging(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user");
        return null;
      }

      const sessionId = `session-${Date.now()}`;
      const { data, error } = await supabase
        .from('voice_conversations')
        .insert({
          user_id: user.id,
          title: title || 'Voice Conversation',
          session_id: sessionId,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentConversationId(data.id);
      return data.id;
    } catch (error) {
      console.error('Error starting conversation:', error);
      return null;
    } finally {
      setIsLogging(false);
    }
  }, []);

  const endConversation = useCallback(async (conversationId?: string) => {
    try {
      setIsLogging(true);
      const id = conversationId || currentConversationId;
      if (!id) return;

      const { error } = await supabase
        .from('voice_conversations')
        .update({
          ended_at: new Date().toISOString(),
          status: 'completed'
        })
        .eq('id', id);

      if (error) throw error;

      setCurrentConversationId(null);
    } catch (error) {
      console.error('Error ending conversation:', error);
    } finally {
      setIsLogging(false);
    }
  }, [currentConversationId]);

  const logMessage = useCallback(async (
    type: 'user' | 'assistant' | 'system',
    content: string,
    options?: {
      conversationId?: string;
      audioUrl?: string;
      transcript?: string;
      actionType?: string;
      actionData?: Record<string, any>;
      duration?: number;
    }
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user");
        return null;
      }

      const conversationId = options?.conversationId || currentConversationId;
      
      if (!conversationId) {
        console.warn("No conversation ID available, message not logged");
        return null;
      }

      const { data, error } = await supabase
        .from('voice_messages')
        .insert({
          conversation_id: conversationId,
          user_id: user.id,
          type,
          content,
          audio_url: options?.audioUrl,
          transcript: options?.transcript,
          action_type: options?.actionType,
          action_data: options?.actionData,
          duration: options?.duration
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation message count
      await supabase.rpc('increment_conversation_messages', {
        conversation_id: conversationId
      }).catch(err => {
        // If function doesn't exist, update directly
        supabase
          .from('voice_conversations')
          .update({ 
            total_messages: supabase.sql`total_messages + 1` as any
          })
          .eq('id', conversationId);
      });

      return data;
    } catch (error) {
      console.error('Error logging message:', error);
      return null;
    }
  }, [currentConversationId]);

  const getConversationHistory = useCallback(async (conversationId?: string) => {
    try {
      const id = conversationId || currentConversationId;
      if (!id) return [];

      const { data, error } = await supabase
        .from('voice_messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data as VoiceMessage[];
    } catch (error) {
      console.error('Error getting conversation history:', error);
      return [];
    }
  }, [currentConversationId]);

  const getRecentConversations = useCallback(async (limit = 10) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return [];

      const { data, error } = await supabase
        .from('voice_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data as VoiceConversation[];
    } catch (error) {
      console.error('Error getting recent conversations:', error);
      return [];
    }
  }, []);

  return {
    currentConversationId,
    isLogging,
    startConversation,
    endConversation,
    logMessage,
    getConversationHistory,
    getRecentConversations
  };
}
