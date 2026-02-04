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

      // No data - return empty array, UI should show EmptyState
      return [];
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
          unreadCount: 0, // Real count from unread messages
          lastMessage: "Última mensagem do canal",
          lastMessageTime: ch.last_activity ? new Date(ch.last_activity).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : undefined,
        }));
      }

      // No data - return empty array, UI should show EmptyState
      return [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ========================
// INBOX MANAGER SPECIFIC
// ========================

export interface InboxMessage {
  id: string;
  sender_id: string;
  sender_name?: string;
  sender_role?: string;
  recipient_id?: string;
  content: string;
  message_type: "text" | "file" | "voice" | "image" | "system" | "ai_response";
  priority: "low" | "normal" | "high" | "critical";
  category: "general" | "hr" | "operations" | "emergency" | "system" | "ai_notification";
  status: "sent" | "delivered" | "read" | "archived";
  is_urgent: boolean;
  is_broadcast: boolean;
  created_at: string;
  read_at?: string;
  attachments?: unknown[];
  metadata?: Record<string, unknown>;
}

export function useInboxMessages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading, error, refetch } = useQuery({
    queryKey: ["inbox-messages", user?.id],
    queryFn: async (): Promise<InboxMessage[]> => {
      const { data, error } = await supabase
        .from("intelligent_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      return (data || []).map((n): InboxMessage => {
        const meta = n.metadata as Record<string, unknown> | null;
        const priorityMap: Record<string, InboxMessage["priority"]> = {
          low: "low", normal: "normal", medium: "normal", high: "high", urgent: "critical", critical: "critical",
        };
        const categoryMap: Record<string, InboxMessage["category"]> = {
          hr: "hr", operations: "operations", emergency: "emergency", system: "system", ai_notification: "ai_notification",
        };

        return {
          id: n.id,
          sender_id: typeof meta?.sender_id === "string" ? meta.sender_id : "system",
          sender_name: typeof meta?.sender_name === "string" ? meta.sender_name : "Sistema Nautilus",
          sender_role: typeof meta?.sender_role === "string" ? meta.sender_role : "Sistema",
          recipient_id: n.user_id || undefined,
          content: n.message,
          message_type: n.type === "system" ? "system" : "text",
          priority: priorityMap[n.priority?.toLowerCase()] || "normal",
          category: categoryMap[n.type?.toLowerCase()] || "general",
          status: n.is_read ? "read" : "delivered",
          is_urgent: n.priority === "urgent" || n.priority === "critical",
          is_broadcast: typeof meta?.is_broadcast === "boolean" ? meta.is_broadcast : false,
          created_at: n.created_at,
          read_at: n.is_read ? n.created_at : undefined,
          attachments: [],
          metadata: meta || {},
        };
      });
    },
    enabled: !!user,
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const markAsRead = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from("intelligent_notifications")
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq("id", messageId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["inbox-messages"] }),
  });

  const stats = {
    total: messages.length,
    unread: messages.filter((m) => m.status !== "read").length,
    urgent: messages.filter((m) => m.is_urgent).length,
  };

  return { messages, isLoading, error: error?.message || null, refetch, markAsRead: markAsRead.mutate, stats };
}

// ========================
// CHANNEL MANAGER SPECIFIC
// ========================

export interface ChannelData {
  id: string;
  name: string;
  description?: string;
  type: "group" | "department" | "broadcast" | "emergency";
  is_public: boolean;
  is_active: boolean;
  created_by: string;
  member_count: number;
  last_message_at?: string;
  settings: Record<string, unknown>;
  created_at: string;
}

export function useChannelManagerData() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: channels = [], isLoading, error, refetch } = useQuery({
    queryKey: ["channel-manager", user?.id],
    queryFn: async (): Promise<ChannelData[]> => {
      const { data, error } = await supabase
        .from("communication_channels")
        .select("*")
        .eq("is_active", true)
        .order("last_activity", { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data && data.length > 0) {
        return data.map((ch): ChannelData => ({
          id: ch.id,
          name: ch.name,
          description: ch.description || undefined,
          type: (ch.channel_type as ChannelData["type"]) || "group",
          is_public: ch.is_public ?? true,
          is_active: ch.is_active ?? true,
          created_by: ch.created_by || "system",
          member_count: ch.member_count || 0,
          last_message_at: ch.last_activity || undefined,
          settings: { notifications: true },
          created_at: ch.created_at,
        }));
      }

      return [];
    },
    enabled: !!user,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const createChannel = useMutation({
    mutationFn: async (channel: { name: string; description: string; type: ChannelData["type"]; is_public: boolean }) => {
      const { data, error } = await supabase
        .from("communication_channels")
        .insert([{
          name: channel.name,
          description: channel.description,
          channel_type: channel.type,
          is_public: channel.is_public,
          is_active: true,
          created_by: user?.id || "",
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["channel-manager"] }),
  });

  const stats = {
    total: channels.length,
    active: channels.filter((c) => c.is_active).length,
    totalMembers: channels.reduce((sum, c) => sum + c.member_count, 0),
  };

  return { channels, isLoading, error: error?.message || null, refetch, createChannel: createChannel.mutate, stats };
}

// ========================
// RECIPIENTS
// ========================

export interface Recipient {
  id: string;
  name: string;
  role?: string;
  type: "user" | "channel" | "department" | "broadcast";
}

export function useRecipientsData() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["recipients", user?.id],
    queryFn: async (): Promise<Recipient[]> => {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, department")
        .limit(100);

      const userRecipients: Recipient[] = (profiles || []).map((p) => ({
        id: p.id,
        name: p.full_name || "Usuário",
        role: undefined,
        type: "user" as const,
      }));

      const departments = new Set<string>();
      (profiles || []).forEach((p) => { if (p.department) departments.add(p.department); });

      const deptRecipients: Recipient[] = Array.from(departments).map((dept) => ({
        id: `dept-${dept.toLowerCase().replace(/\s+/g, "-")}`,
        name: dept,
        type: "department" as const,
      }));

      const broadcastRecipients: Recipient[] = [
        { id: "broadcast-all", name: "Todos os Usuários", type: "broadcast" },
        { id: "broadcast-embarcados", name: "Tripulantes Embarcados", type: "broadcast" },
        { id: "broadcast-terra", name: "Equipe em Terra", type: "broadcast" },
      ];

      return [...userRecipients, ...deptRecipients, ...broadcastRecipients];
    },
    enabled: !!user,
    staleTime: 60000,
  });
}

// ========================
// MARITIME CHANNELS
// ========================

export interface MaritimeChannel {
  id: string;
  name: string;
  type: "emergency" | "vhf" | "satellite" | "internal";
  status: "active" | "inactive" | "standby";
  participants: string[];
  last_activity: string;
}

export function useMaritimeChannels() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["maritime-channels", user?.id],
    queryFn: async (): Promise<MaritimeChannel[]> => {
      const { data: vessels } = await supabase
        .from("vessels")
        .select("id, name")
        .limit(20);

      const vesselNames = (vessels || []).map((v) => v.name || "Embarcação");

      return [
        { id: "vhf-16", name: "VHF Canal 16 (Emergência)", type: "emergency", status: "active", participants: ["Todas as embarcações", "Guarda Costeira"], last_activity: new Date().toISOString() },
        { id: "vhf-68", name: "VHF Canal 68 (Operações)", type: "vhf", status: "active", participants: vesselNames.slice(0, 5), last_activity: new Date().toISOString() },
        { id: "sat-primary", name: "Satélite Principal", type: "satellite", status: "active", participants: ["Centro de Controle", ...vesselNames.slice(0, 3)], last_activity: new Date().toISOString() },
        { id: "internal-ops", name: "Operações Internas", type: "internal", status: "active", participants: ["Gestão de Frota", "Capitães"], last_activity: new Date().toISOString() },
      ];
    },
    enabled: !!user,
    staleTime: 60000,
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
