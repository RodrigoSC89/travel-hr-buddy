/**
 * 🧠 useAgentMemory - Persist and load agent conversations from Supabase
 * Checkpoint 3.2: Agent Memory System
 */
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

export interface ConversationSummary {
  id: string;
  title: string | null;
  module_context: string | null;
  created_at: string;
  updated_at: string;
  messageCount?: number;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  created_at: string;
  tokens_used: number | null;
}

/** Fetch all conversations for current user, optionally filtered by agent */
export function useConversations(agentId?: string) {
  return useQuery({
    queryKey: ["agent-conversations", agentId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from("ai_chat_conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (agentId) {
        query = query.eq("module_context", agentId);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return (data || []) as ConversationSummary[];
    },
    staleTime: 10000,
  });
}

/** Fetch messages for a specific conversation */
export function useConversationMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ["conversation-messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data, error } = await supabase
        .from("ai_chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as ConversationMessage[];
    },
    enabled: !!conversationId,
  });
}

/** Hook to save conversation + messages to Supabase */
export function useSaveConversation() {
  const queryClient = useQueryClient();

  const saveConversation = useCallback(
    async (
      agentId: string,
      messages: { role: string; content: string }[],
      existingConversationId?: string
    ): Promise<string> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.warn("[AgentMemory] User not authenticated, skipping save");
        return "";
      }

      let conversationId = existingConversationId;

      // Create conversation if new
      if (!conversationId) {
        const firstUserMsg = messages.find((m) => m.role === "user");
        const title = firstUserMsg
          ? firstUserMsg.content.substring(0, 100)
          : "Nova conversa";

        const { data, error } = await supabase
          .from("ai_chat_conversations")
          .insert({
            user_id: user.id,
            title,
            module_context: agentId,
            metadata: { agentId, messageCount: messages.length },
          })
          .select("id")
          .single();

        if (error) throw error;
        conversationId = data.id;
      }

      // Insert all messages
      if (messages.length > 0) {
        const messagesToInsert = messages.map((msg) => ({
          conversation_id: conversationId!,
          role: msg.role,
          content: msg.content,
        }));

        const { error } = await supabase
          .from("ai_chat_messages")
          .insert(messagesToInsert);

        if (error) throw error;
      }

      // Update conversation timestamp
      await supabase
        .from("ai_chat_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId!);

      queryClient.invalidateQueries({ queryKey: ["agent-conversations"] });
      return conversationId!;
    },
    [queryClient]
  );

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      // Delete messages first
      await supabase
        .from("ai_chat_messages")
        .delete()
        .eq("conversation_id", conversationId);

      // Delete conversation
      const { error } = await supabase
        .from("ai_chat_conversations")
        .delete()
        .eq("id", conversationId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["agent-conversations"] });
      toast.success("Conversa excluída");
    },
    [queryClient]
  );

  return { saveConversation, deleteConversation };
}
