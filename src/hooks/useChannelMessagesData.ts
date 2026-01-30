/**
 * Hook para dados reais de mensagens e membros de canais
 * Substitui mockMessages e mockMembers em ChannelManagerProfessional
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface ChannelMessage {
  id: string;
  channel_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  message_content: string;
  message_type: "text" | "ai_analysis" | "file" | "alert";
  created_at: string;
  is_ai_generated: boolean;
  reactions?: { emoji: string; count: number }[];
  attachments?: { name: string; url: string; type: string }[];
}

export interface ChannelMember {
  id: string;
  user_id: string;
  name: string;
  role: "admin" | "moderator" | "member";
  status: "online" | "away" | "offline";
  joined_at: string;
  avatar_url?: string;
}

export function useChannelMessagesData(channelId?: string) {
  const queryClient = useQueryClient();

  // Fetch messages for a channel
  const messagesQuery = useQuery({
    queryKey: ["channel-messages", channelId],
    queryFn: async (): Promise<ChannelMessage[]> => {
      if (!channelId) return [];

      // Fetch from channel_messages or ai_chat_messages
      const { data: messages, error } = await supabase
        .from("ai_chat_messages")
        .select(`
          id,
          content,
          role,
          created_at,
          conversation_id,
          metadata
        `)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;

      // Map to ChannelMessage format
      return (messages || []).map(msg => ({
        id: msg.id,
        channel_id: channelId,
        sender_id: msg.role === "assistant" ? "ai" : "user",
        sender_name: msg.role === "assistant" ? "Nautilus AI" : "Você",
        message_content: msg.content,
        message_type: msg.role === "assistant" ? "ai_analysis" : "text",
        created_at: msg.created_at,
        is_ai_generated: msg.role === "assistant",
        reactions: [],
      }));
    },
    enabled: !!channelId,
    staleTime: 30000,
  });

  // Fetch channel members
  const membersQuery = useQuery({
    queryKey: ["channel-members", channelId],
    queryFn: async (): Promise<ChannelMember[]> => {
      // Use channel_members table - correct columns: joined_at (not created_at)
      const { data: members, error } = await supabase
        .from("channel_members")
        .select(`
          id,
          user_id,
          role,
          joined_at
        `)
        .eq("channel_id", channelId || "")
        .limit(50);

      if (error || !members?.length) {
        // Fallback to organization members
        const { data: orgMembers } = await supabase
          .from("organization_members")
          .select(`
            id,
            user_id,
            role,
            joined_at
          `)
          .eq("status", "active")
          .limit(20);

        return (orgMembers || []).map(m => ({
          id: m.id,
          user_id: m.user_id,
          name: "Membro da Equipe",
          role: m.role === "admin" ? "admin" : "member",
          status: "online" as const,
          joined_at: m.joined_at || new Date().toISOString(),
        }));
      }

      return members.map(m => ({
        id: m.id,
        user_id: m.user_id,
        name: "Membro do Canal",
        role: (m.role as "admin" | "moderator" | "member") || "member",
        status: "online" as const,
        joined_at: m.joined_at,
      }));
    },
    enabled: !!channelId,
    staleTime: 60000,
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (data: { content: string; channelId: string }) => {
      const { data: user } = await supabase.auth.getUser();
      
      // Get or create conversation
      let conversationId: string;
      const { data: existing } = await supabase
        .from("ai_chat_conversations")
        .select("id")
        .eq("user_id", user.user?.id || "")
        .eq("module_context", data.channelId)
        .single();

      if (existing) {
        conversationId = existing.id;
      } else {
        const { data: newConv, error } = await supabase
          .from("ai_chat_conversations")
          .insert({
            user_id: user.user?.id || "",
            module_context: data.channelId,
            title: "Canal de Comunicação"
          })
          .select()
          .single();
        
        if (error) throw error;
        conversationId = newConv.id;
      }

      // Insert message
      const { data: message, error } = await supabase
        .from("ai_chat_messages")
        .insert({
          conversation_id: conversationId,
          role: "user",
          content: data.content
        })
        .select()
        .single();

      if (error) throw error;
      return message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channel-messages", channelId] });
    },
  });

  // Real-time subscription
  useEffect(() => {
    if (!channelId) return;

    const channel = supabase
      .channel(`messages-${channelId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ai_chat_messages" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["channel-messages", channelId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, queryClient]);

  return {
    messages: messagesQuery.data || [],
    members: membersQuery.data || [],
    isLoading: messagesQuery.isLoading || membersQuery.isLoading,
    error: messagesQuery.error || membersQuery.error,
    sendMessage,
    refetch: () => {
      messagesQuery.refetch();
      membersQuery.refetch();
    },
  };
}
