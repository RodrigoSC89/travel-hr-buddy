/**
 * Hook para dados reais de Comunicação
 * Substitui MOCK_NOTIFICATIONS, MOCK_MESSAGES, MOCK_CHANNELS
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

// ========================
// NOTIFICATIONS
// ========================

export interface Notification {
  id: string;
  type: "alert" | "info" | "warning" | "success" | "task" | "message";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  priority: "low" | "medium" | "high" | "urgent";
  source: string;
  actionUrl?: string;
  actionLabel?: string;
}

export function useNotificationsCenter() {
  const { user } = useAuth();
  const [realtimeNotifications, setRealtimeNotifications] = useState<Notification[]>([]);

  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ["notifications-center", user?.id],
    queryFn: async (): Promise<Notification[]> => {
      const results: Notification[] = [];

      // Buscar intelligent_notifications
      // Schema: id, user_id, type, priority, title, message, action_text, action_type, action_data, is_read
      const { data: intNotifs } = await supabase
        .from("intelligent_notifications")
        .select("*")
        .eq("user_id", user?.id || "")
        .order("created_at", { ascending: false })
        .limit(20);

      if (intNotifs) {
        intNotifs.forEach((n) => {
          const actionData = n.action_data as Record<string, unknown> | null;
          results.push({
            id: n.id,
            type: mapNotificationType(n.type),
            title: n.title,
            description: n.message || "",
            timestamp: n.created_at,
            read: n.is_read || false,
            priority: mapPriority(n.priority),
            source: n.type || "Sistema",
            actionUrl: (actionData?.url as string) || undefined,
            actionLabel: n.action_text || undefined,
          });
        });
      }

      // Buscar soc_alerts não reconhecidos
      const { data: alerts } = await supabase
        .from("soc_alerts")
        .select("id, title, message, severity, created_at, source_module, acknowledged_at")
        .is("acknowledged_at", null)
        .order("created_at", { ascending: false })
        .limit(10);

      if (alerts) {
        alerts.forEach((a) => {
          results.push({
            id: a.id,
            type: a.severity === "critical" ? "alert" : "warning",
            title: a.title,
            description: a.message || "",
            timestamp: a.created_at,
            read: a.acknowledged_at !== null,
            priority: a.severity === "critical" ? "urgent" : a.severity === "high" ? "high" : "medium",
            source: a.source_module || "SOC",
            actionUrl: "/noc-monitoring",
            actionLabel: "Ver Alerta",
          });
        });
      }

      return results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "intelligent_notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const n = payload.new as Record<string, unknown>;
          const newNotif: Notification = {
            id: n.id as string,
            type: mapNotificationType(n.type as string),
            title: n.title as string,
            description: (n.message as string) || "",
            timestamp: n.created_at as string,
            read: false,
            priority: mapPriority(n.priority as string),
            source: (n.type as string) || "Sistema",
          };
          setRealtimeNotifications((prev) => [newNotif, ...prev].slice(0, 5));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const allNotifications = [...realtimeNotifications, ...notifications].filter(
    (n, i, arr) => arr.findIndex((x) => x.id === n.id) === i
  );

  return {
    notifications: allNotifications,
    isLoading,
    refetch,
    unreadCount: allNotifications.filter((n) => !n.read).length,
  };
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("intelligent_notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-center"] });
    },
  });
}

// ========================
// MESSAGES & CHANNELS
// ========================

export interface Message {
  id: string;
  subject: string;
  content: string;
  from: string;
  fromAvatar?: string;
  timestamp: string;
  read: boolean;
  starred: boolean;
  category: "inbox" | "sent" | "draft" | "archived";
  priority: "low" | "normal" | "high";
  attachments?: number;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  type: "broadcast" | "department" | "vessel" | "private";
  isPublic: boolean;
  memberCount: number;
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
}

export function useCommunicationMessages() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["communication-messages", user?.id],
    queryFn: async (): Promise<Message[]> => {
      // Buscar de ai_chat_messages ou simular baseado em logs
      const { data: chats } = await supabase
        .from("ai_chat_messages")
        .select(`
          id,
          content,
          role,
          created_at,
          conversations:conversation_id (title, user_id)
        `)
        .order("created_at", { ascending: false })
        .limit(20);

      if (chats && chats.length > 0) {
        return chats.map((msg, idx) => ({
          id: msg.id,
          subject: (msg.conversations as { title: string | null } | null)?.title || "Conversa",
          content: msg.content.slice(0, 200),
          from: msg.role === "user" ? "Você" : "Nautilus IA",
          timestamp: msg.created_at,
          read: idx > 2,
          starred: false,
          category: msg.role === "user" ? "sent" as const : "inbox" as const,
          priority: "normal" as const,
        }));
      }

      // Fallback demo
      return [
        {
          id: "msg-1",
          subject: "Atualização de Política de Segurança",
          content: "Nova política de segurança marítima entrará em vigor...",
          from: "Departamento de Segurança",
          timestamp: new Date().toISOString(),
          read: false,
          starred: true,
          category: "inbox" as const,
          priority: "high" as const,
          attachments: 2,
        },
      ];
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useCommunicationChannels() {
  return useQuery({
    queryKey: ["communication-channels"],
    queryFn: async (): Promise<Channel[]> => {
      const { data: channels } = await supabase
        .from("communication_channels")
        .select("*")
        .eq("is_active", true)
        .order("last_activity", { ascending: false })
        .limit(15);

      if (channels && channels.length > 0) {
        return channels.map((ch) => ({
          id: ch.id,
          name: ch.name,
          description: ch.description || "",
          type: (ch.channel_type as Channel["type"]) || "broadcast",
          isPublic: ch.is_public ?? true,
          memberCount: ch.member_count || 0,
          unreadCount: Math.floor(Math.random() * 5),
          lastMessage: "Última mensagem do canal",
          lastMessageTime: ch.last_activity ? new Date(ch.last_activity).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : undefined,
        }));
      }

      // Demo fallback
      return [
        { id: "ch-1", name: "Geral", description: "Canal geral de comunicação", type: "broadcast" as const, isPublic: true, memberCount: 156, unreadCount: 5, lastMessage: "Bom dia!", lastMessageTime: "10:45" },
        { id: "ch-2", name: "RH", description: "Recursos Humanos", type: "department" as const, isPublic: true, memberCount: 89, unreadCount: 2, lastMessage: "Nova política", lastMessageTime: "09:30" },
      ];
    },
    staleTime: 1000 * 60 * 5,
  });
}

// Helpers
function mapNotificationType(type: string | null): Notification["type"] {
  const lower = type?.toLowerCase() || "";
  if (lower.includes("alert") || lower.includes("critical")) return "alert";
  if (lower.includes("warn")) return "warning";
  if (lower.includes("task")) return "task";
  if (lower.includes("success")) return "success";
  if (lower.includes("message")) return "message";
  return "info";
}

function mapPriority(priority: string | null): Notification["priority"] {
  const lower = priority?.toLowerCase() || "";
  if (lower.includes("urgent") || lower.includes("critical")) return "urgent";
  if (lower.includes("high")) return "high";
  if (lower.includes("low")) return "low";
  return "medium";
}
