/**
 * Hook para dados reais da caixa de entrada
 * Substitui mockMessages em inbox-manager.tsx
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface InboxMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  subject: string;
  preview: string;
  content: string;
  is_read: boolean;
  is_starred: boolean;
  is_archived: boolean;
  category: "primary" | "updates" | "promotions" | "alerts";
  priority: "low" | "normal" | "high" | "urgent";
  created_at: string;
  attachments?: { name: string; url: string; size: number }[];
}

export interface InboxStats {
  total: number;
  unread: number;
  starred: number;
  archived: number;
}

export function useInboxMessagesData() {
  const queryClient = useQueryClient();

  // Fetch messages from intelligent_notifications
  const messagesQuery = useQuery({
    queryKey: ["inbox-messages"],
    queryFn: async (): Promise<InboxMessage[]> => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data: notifications, error } = await supabase
        .from("intelligent_notifications")
        .select(`
          id,
          title,
          message,
          type,
          priority,
          is_read,
          created_at,
          metadata
        `)
        .eq("user_id", user.user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      return (notifications || []).map(notif => ({
        id: notif.id,
        sender_id: "system",
        sender_name: mapSenderName(notif.type),
        subject: notif.title,
        preview: (notif.message || "").substring(0, 100),
        content: notif.message || "",
        is_read: notif.is_read || false,
        is_starred: (notif.metadata as Record<string, unknown>)?.starred === true,
        is_archived: (notif.metadata as Record<string, unknown>)?.archived === true,
        category: mapCategory(notif.type),
        priority: mapPriority(notif.priority),
        created_at: notif.created_at,
        attachments: (Array.isArray((notif.metadata as Record<string, unknown>)?.attachments) 
          ? (notif.metadata as Record<string, unknown>).attachments 
          : []) as { name: string; url: string; size: number }[],
      }));
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  // Stats calculation
  const stats: InboxStats = {
    total: messagesQuery.data?.length || 0,
    unread: messagesQuery.data?.filter(m => !m.is_read).length || 0,
    starred: messagesQuery.data?.filter(m => m.is_starred).length || 0,
    archived: messagesQuery.data?.filter(m => m.is_archived).length || 0,
  };

  // Mark as read mutation
  const markAsRead = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from("intelligent_notifications")
        .update({ is_read: true })
        .eq("id", messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox-messages"] });
    },
  });

  // Toggle star mutation
  const toggleStar = useMutation({
    mutationFn: async (messageId: string) => {
      const message = messagesQuery.data?.find(m => m.id === messageId);
      if (!message) return;

      const { error } = await supabase
        .from("intelligent_notifications")
        .update({ 
          metadata: { starred: !message.is_starred }
        })
        .eq("id", messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox-messages"] });
    },
  });

  // Archive mutation
  const archiveMessage = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from("intelligent_notifications")
        .update({ 
          metadata: { archived: true }
        })
        .eq("id", messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox-messages"] });
    },
  });

  // Delete mutation
  const deleteMessage = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from("intelligent_notifications")
        .delete()
        .eq("id", messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox-messages"] });
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("inbox-messages-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "intelligent_notifications" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["inbox-messages"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    messages: messagesQuery.data || [],
    stats,
    isLoading: messagesQuery.isLoading,
    error: messagesQuery.error,
    markAsRead,
    toggleStar,
    archiveMessage,
    deleteMessage,
    refetch: messagesQuery.refetch,
  };
}

function mapSenderName(type?: string): string {
  switch (type) {
    case "alert": return "Sistema de Alertas";
    case "maintenance": return "Manutenção";
    case "compliance": return "Compliance";
    case "hr": return "Recursos Humanos";
    case "finance": return "Financeiro";
    default: return "Nautilus System";
  }
}

function mapCategory(type?: string): InboxMessage["category"] {
  switch (type) {
    case "alert": return "alerts";
    case "promotion": return "promotions";
    case "update": return "updates";
    default: return "primary";
  }
}

function mapPriority(priority?: string | null): InboxMessage["priority"] {
  if (!priority) return "normal";
  if (priority === "critical" || priority === "urgent") return "urgent";
  if (priority === "high") return "high";
  if (priority === "low") return "low";
  return "normal";
}
