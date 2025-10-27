import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface VoiceMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  transcript?: string;
  audio_duration_ms?: number;
  confidence_score?: number;
  language?: string;
  command_detected?: string;
  action_taken?: string;
  metadata?: any;
  created_at: string;
}

export interface VoiceConversation {
  id: string;
  user_id: string;
  organization_id?: string;
  session_id: string;
  start_time: string;
  end_time?: string;
  message_count: number;
  status: "active" | "ended" | "interrupted";
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export function useVoiceConversation() {
  const { toast } = useToast();
  const [currentConversation, setCurrentConversation] = useState<VoiceConversation | null>(null);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Start a new conversation
  const startConversation = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { data, error } = await supabase
        .from("voice_conversations")
        .insert([
          {
            user_id: user.id,
            session_id: sessionId,
            status: "active",
            message_count: 0
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setCurrentConversation(data as VoiceConversation);
      setMessages([]);
      return data as VoiceConversation;
    } catch (error: any) {
      console.error("Error starting conversation:", error);
      toast({
        title: "Error",
        description: "Failed to start voice conversation",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // End the current conversation
  const endConversation = useCallback(async () => {
    if (!currentConversation) return;

    try {
      const { error } = await supabase.rpc("end_voice_conversation", {
        conversation_uuid: currentConversation.id
      });

      if (error) throw error;

      setCurrentConversation(null);
    } catch (error: any) {
      console.error("Error ending conversation:", error);
      toast({
        title: "Error",
        description: "Failed to end voice conversation",
        variant: "destructive"
      });
    }
  }, [currentConversation, toast]);

  // Log a message in the current conversation
  const logMessage = useCallback(async (
    role: "user" | "assistant",
    content: string,
    metadata?: {
      transcript?: string;
      confidence_score?: number;
      command_detected?: string;
      action_taken?: string;
      audio_duration_ms?: number;
    }
  ) => {
    if (!currentConversation) {
      console.warn("No active conversation to log message");
      return null;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("voice_messages")
        .insert([
          {
            conversation_id: currentConversation.id,
            user_id: user.id,
            role,
            content,
            transcript: metadata?.transcript,
            confidence_score: metadata?.confidence_score,
            command_detected: metadata?.command_detected,
            action_taken: metadata?.action_taken,
            audio_duration_ms: metadata?.audio_duration_ms,
            language: "pt-BR"
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Update message count in conversation
      await supabase
        .from("voice_conversations")
        .update({ message_count: currentConversation.message_count + 1 })
        .eq("id", currentConversation.id);

      const newMessage = data as VoiceMessage;
      setMessages(prev => [...prev, newMessage]);
      
      return newMessage;
    } catch (error: any) {
      console.error("Error logging message:", error);
      return null;
    }
  }, [currentConversation]);

  // Load conversation history
  const loadConversationHistory = useCallback(async (conversationId: string) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("voice_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMessages(data as VoiceMessage[]);
    } catch (error: any) {
      console.error("Error loading conversation history:", error);
      toast({
        title: "Error",
        description: "Failed to load conversation history",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Load recent conversations
  const loadRecentConversations = useCallback(async (limit: number = 10) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("voice_conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("start_time", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data as VoiceConversation[];
    } catch (error: any) {
      console.error("Error loading recent conversations:", error);
      return [];
    }
  }, []);

  return {
    currentConversation,
    messages,
    isLoading,
    startConversation,
    endConversation,
    logMessage,
    loadConversationHistory,
    loadRecentConversations
  };
}
