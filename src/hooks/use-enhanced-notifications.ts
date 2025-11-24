// @ts-nocheck
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type EmployeeCertificate = Database["public"]["Tables"]["employee_certificates"]["Row"];
type PriceAlert = Database["public"]["Tables"]["price_alerts"]["Row"];
type EmployeeNotificationRow = Database["public"]["Tables"]["employee_notifications"]["Row"];

type NotificationOrigin = "database" | "certificate" | "price_alert" | "welcome";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  origin: NotificationOrigin;
  action?: {
    label: string;
    href: string;
  };
  created_at: string;
  expires_at?: string;
  persistentId?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export const useEnhancedNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const isMountedRef = useRef(true);

  const unreadCount = useMemo(
    () => notifications.filter(notification => !notification.read).length,
    [notifications]
  );

  // Buscar notificações do usuário
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const certificateIdentifiers = [user.id, user.email].filter(Boolean) as string[];

      const certificatesPromise = certificateIdentifiers.length > 0
        ? supabase
          .from("employee_certificates")
          .select("id, certificate_name, expiry_date, employee_id")
          .in("employee_id", certificateIdentifiers)
          .gte("expiry_date", now.toISOString())
          .lte("expiry_date", thirtyDaysFromNow.toISOString())
        : Promise.resolve({ data: [] as EmployeeCertificate[], error: null });

      const priceAlertsPromise = supabase
        .from("price_alerts")
        .select("id, product_name, target_price, current_price, user_id, is_active, created_at")
        .eq("user_id", user.id)
        .eq("is_active", true);

      const persistedNotificationsPromise = supabase
        .from("employee_notifications")
        .select("id, title, message, type, is_read, action_url, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      const [certificatesResult, priceAlertsResult, persistedResult] = await Promise.all([
        certificatesPromise,
        priceAlertsPromise,
        persistedNotificationsPromise,
      ]);

      if (certificatesResult.error || priceAlertsResult.error || persistedResult.error) {
        throw certificatesResult.error || priceAlertsResult.error || persistedResult.error;
      }

      if (!isMountedRef.current) return;

      const certificateNotifications = buildCertificateNotifications(
        (certificatesResult.data || []) as EmployeeCertificate[],
        now
      );
      const priceAlertNotifications = buildPriceAlertNotifications(
        (priceAlertsResult.data || []) as PriceAlert[]
      );
      const persistedNotifications = buildPersistedNotifications(
        (persistedResult.data || []) as EmployeeNotificationRow[]
      );
      const welcomeNotification = buildWelcomeNotification(user.created_at);

      const combinedNotifications = deduplicateNotifications([
        ...persistedNotifications,
        ...certificateNotifications,
        ...priceAlertNotifications,
        ...welcomeNotification,
      ]);
      
      setNotifications(combinedNotifications);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("Error fetching notifications:", errorMessage);
      setError("Erro ao carregar notificações");
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [user]);

  // Marcar notificação como lida
  const markAsRead = useCallback(async (notificationId: string) => {
    const target = notifications.find(notification => notification.id === notificationId);
    if (!target) return;

    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );

    if (target.persistentId) {
      await supabase
        .from("employee_notifications")
        .update({ is_read: true })
        .eq("id", target.persistentId);
    }
  }, [notifications]);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    const persistentIds = notifications
      .filter(notification => !notification.read && notification.persistentId)
      .map(notification => notification.persistentId as string);

    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));

    if (persistentIds.length > 0) {
      await supabase
        .from("employee_notifications")
        .update({ is_read: true })
        .in("id", persistentIds);
    }
  }, [notifications]);

  // Remover notificação
  const removeNotification = useCallback(async (notificationId: string) => {
    const target = notifications.find(notification => notification.id === notificationId);

    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));

    if (target?.persistentId) {
      await supabase
        .from("employee_notifications")
        .delete()
        .eq("id", target.persistentId);
    }
  }, [notifications]);

  // Carregar notificações quando o usuário mudar
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Atualizar notificações periodicamente
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(fetchNotifications, 5 * 60 * 1000); // 5 minutos
    return () => clearInterval(interval);
  }, [fetchNotifications, user]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification
  };
};

const buildCertificateNotifications = (
  certificates: EmployeeCertificate[],
  now: Date
): Notification[] => {
  return certificates
    .map((cert) => {
      if (!cert.expiry_date) return null;
      const expiryDate = new Date(cert.expiry_date);
      if (Number.isNaN(expiryDate.getTime())) return null;

      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        id: `cert-${cert.id}`,
        title: "Certificado Expirando",
        message: `Seu certificado "${cert.certificate_name}" expira em ${daysUntilExpiry} dias`,
        type: daysUntilExpiry <= 7 ? "error" : "warning",
        read: false,
        origin: "certificate" as const,
        action: {
          label: "Ver Certificado",
          href: "/hr",
        },
        created_at: now.toISOString(),
        expires_at: cert.expiry_date,
        metadata: {
          certificateId: cert.id,
          daysUntilExpiry,
        },
      } satisfies Notification;
    })
    .filter((notification): notification is Notification => Boolean(notification));
};

const buildPriceAlertNotifications = (alerts: PriceAlert[]): Notification[] => {
  if (!alerts.length) {
    return [];
  }

  const mostRecent = alerts.reduce((latest, alert) => {
    if (!latest) return alert;
    return new Date(alert.created_at).getTime() > new Date(latest.created_at).getTime()
      ? alert
      : latest;
  });

  return [
    {
      id: "price-alerts-active",
      title: "Alertas de Preços Ativos",
      message: `Você tem ${alerts.length} alertas monitorando oportunidades de compra. Último produto configurado: ${mostRecent.product_name}.`,
      type: "info",
      read: false,
      origin: "price_alert",
      action: {
        label: "Ver Alertas",
        href: "/price-alerts",
      },
      created_at: mostRecent.created_at ?? new Date().toISOString(),
      metadata: {
        lastProduct: mostRecent.product_name,
        lastTargetPrice: mostRecent.target_price,
      },
    },
  ];
};

const buildPersistedNotifications = (rows: EmployeeNotificationRow[]): Notification[] =>
  rows.map((row) => ({
    id: row.id,
    persistentId: row.id,
    title: row.title,
    message: row.message,
    type: normalizeNotificationType(row.type),
    read: row.is_read ?? false,
    origin: "database",
    action: row.action_url
      ? {
        label: "Ver Detalhes",
        href: row.action_url,
      }
      : undefined,
    created_at: row.created_at ?? new Date().toISOString(),
  }));

const buildWelcomeNotification = (userCreatedAt?: string) => {
  if (!userCreatedAt) return [];

  const createdAtDate = new Date(userCreatedAt);
  if (Number.isNaN(createdAtDate.getTime())) return [];

  const daysSinceCreated = Math.ceil(
    (Date.now() - createdAtDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceCreated > 7) return [];

  return [
    {
      id: "welcome",
      title: "Bem-vindo ao Sistema!",
      message: "Explore todas as funcionalidades disponíveis. Precisa de ajuda? Consulte nossa documentação.",
      type: "success",
      read: false,
      origin: "welcome",
      action: {
        label: "Explorar",
        href: "/",
      },
      created_at: createdAtDate.toISOString(),
    },
  ];
};

const deduplicateNotifications = (items: Notification[]): Notification[] => {
  const notificationMap = new Map<string, Notification>();

  items.forEach((item) => {
    notificationMap.set(item.id, item);
  });

  return Array.from(notificationMap.values()).sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
};

const normalizeNotificationType = (type?: string | null): Notification["type"] => {
  if (type === "success" || type === "warning" || type === "error" || type === "info") {
    return type;
  }

  return "info";
};