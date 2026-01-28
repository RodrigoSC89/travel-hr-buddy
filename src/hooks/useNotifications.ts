/**
 * useNotifications Hook
 * Provides easy access to notification functionality in components
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationService } from "@/services/notification-service";
import { toast } from "sonner";

export interface UseNotificationsOptions {
  enabled?: boolean;
  limit?: number;
  unreadOnly?: boolean;
  realtime?: boolean;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { enabled = true, limit = 50, unreadOnly = false, realtime = true } = options;

  // Fetch notifications
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["notifications", user?.id, { limit, unreadOnly }],
    queryFn: async () => {
      if (!user?.id) return [];
      return NotificationService.getNotifications(user.id, { limit, unreadOnly });
    },
    enabled: enabled && !!user?.id,
  });

  // Unread count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications-unread-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      return NotificationService.getUnreadCount(user.id);
    },
    enabled: enabled && !!user?.id,
  });

  // Real-time subscription
  useEffect(() => {
    if (!realtime || !user?.id) return;

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Show toast for new notification
          const notification = payload.new as { title: string; message: string; priority: string };
          
          if (notification.priority === "urgent") {
            toast.error(notification.title, {
              description: notification.message,
              duration: 10000,
            });
          } else {
            toast(notification.title, {
              description: notification.message,
            });
          }

          // Invalidate queries
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
          queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, realtime, queryClient]);

  // Mark as read
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      return NotificationService.markAsRead(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });

  // Mark all as read
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user?.id) return false;
      return NotificationService.markAllAsRead(user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });

  // Send notification
  const sendNotification = useMutation({
    mutationFn: async (params: {
      userId: string;
      templateName: string;
      variables: Record<string, string>;
    }) => {
      return NotificationService.sendFromTemplate(
        params.userId,
        params.templateName,
        params.variables
      );
    },
  });

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    sendNotification: sendNotification.mutate,
    isMarkingAsRead: markAsRead.isPending,
    isMarkingAllAsRead: markAllAsRead.isPending,
  };
}

/**
 * Hook to request push notification permission
 */
export function usePushNotifications() {
  const { user } = useAuth();

  const requestPermission = async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      toast.error("Seu navegador não suporta notificações push");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      toast.error("Notificações foram bloqueadas. Habilite nas configurações do navegador.");
      return false;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === "granted") {
      await subscribeToWebPush();
      toast.success("Notificações push ativadas!");
      return true;
    }

    return false;
  };

  const subscribeToWebPush = async () => {
    if (!user?.id || !("serviceWorker" in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY || ""
        ),
      });

      // Save subscription to database
      const { endpoint, keys } = subscription.toJSON() as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };

      await supabase.from("push_subscriptions").upsert({
        user_id: user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        device_type: "web",
        device_name: navigator.userAgent,
      }, {
        onConflict: "user_id,endpoint",
      });
    } catch (error) {
      console.error("Failed to subscribe to push:", error);
    }
  };

  return {
    requestPermission,
    isSupported: "Notification" in window,
    permission: typeof Notification !== "undefined" ? Notification.permission : "default",
  };
}

// Helper function
function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}
