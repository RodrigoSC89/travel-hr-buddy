import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  action?: {
    label: string;
    href: string;
  };
  created_at: string;
  expires_at?: string;
}

export const useEnhancedNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Buscar notificações do usuário
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Simular notificações baseadas em dados reais
      const mockNotifications: Notification[] = [];

      // Verificar certificados expirando
      const { data: certificates } = await supabase
        .from("employee_certificates")
        .select("*")
        .eq("employee_id", user.email)
        .gte("expiry_date", new Date().toISOString())
        .lte("expiry_date", new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());

      certificates?.forEach(cert => {
        const daysUntilExpiry = Math.ceil(
          (new Date(cert.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        
        mockNotifications.push({
          id: `cert-${cert.id}`,
          title: "Certificado Expirando",
          message: `Seu certificado "${cert.certificate_name}" expira em ${daysUntilExpiry} dias`,
          type: daysUntilExpiry <= 7 ? "error" : "warning",
          read: false,
          action: {
            label: "Ver Certificado",
            href: "/hr"
          },
          created_at: new Date().toISOString()
        });
      });

      // Verificar alertas de preços
      const { data: priceAlerts } = await supabase
        .from("price_alerts")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (priceAlerts && priceAlerts.length > 0) {
        mockNotifications.push({
          id: "price-alerts-active",
          title: "Alertas de Preços Ativos",
          message: `Você tem ${priceAlerts.length} alertas de preços monitorando produtos`,
          type: "info",
          read: false,
          action: {
            label: "Ver Alertas",
            href: "/price-alerts"
          },
          created_at: new Date().toISOString()
        });
      }

      // Adicionar notificações de boas-vindas para novos usuários
      const userCreated = new Date(user.created_at || "");
      const daysSinceCreated = Math.ceil(
        (new Date().getTime() - userCreated.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceCreated <= 7) {
        mockNotifications.push({
          id: "welcome",
          title: "Bem-vindo ao Sistema!",
          message: "Explore todas as funcionalidades disponíveis. Precisa de ajuda? Consulte nossa documentação.",
          type: "success",
          read: false,
          action: {
            label: "Explorar",
            href: "/"
          },
          created_at: new Date().toISOString()
        });
      }

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Marcar notificação como lida
  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Marcar todas como lidas
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  // Remover notificação
  const removeNotification = (notificationId: string) => {
    setNotifications(prev => {
      const filtered = prev.filter(n => n.id !== notificationId);
      const removedNotification = prev.find(n => n.id === notificationId);
      if (removedNotification && !removedNotification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return filtered;
    });
  };

  // Carregar notificações quando o usuário mudar
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Atualizar notificações periodicamente
  useEffect(() => {
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000); // 5 minutos
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification
  };
};