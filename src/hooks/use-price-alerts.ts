import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  priceAlertsService, 
  PriceAlert, 
  CreatePriceAlertInput, 
  UpdatePriceAlertInput,
  PriceHistory,
  PriceNotification
} from "@/services/price-alerts-service";

export const usePriceAlerts = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is authenticated before fetching
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // User not authenticated - just return empty array silently
        setAlerts([]);
        setLoading(false);
        return;
      }
      
      const data = await priceAlertsService.getAlerts();
      setAlerts(data);
    } catch (err) {
      // Don't show error toast for auth-related issues
      const errorMessage = err instanceof Error ? err.message : "Failed to load alerts";
      if (!errorMessage.includes("JWT") && !errorMessage.includes("auth") && !errorMessage.includes("row-level security")) {
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        // Silently set empty array for auth issues
        setAlerts([]);
      }
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    loadAlerts();
  }, []);

  const createAlert = async (input: CreatePriceAlertInput) => {
    try {
      const newAlert = await priceAlertsService.createAlert(input);
      setAlerts((prev) => [newAlert, ...prev]);
      toast({
        title: "Success",
        description: "Price alert created successfully",
      });
      return newAlert;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create alert";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  });

  const updateAlert = async (id: string, input: UpdatePriceAlertInput) => {
    try {
      const updatedAlert = await priceAlertsService.updateAlert(id, input);
      setAlerts((prev) =>
        prev.map((alert) => (alert.id === id ? updatedAlert : alert))
      );
      toast({
        title: "Success",
        description: "Price alert updated successfully",
      });
      return updatedAlert;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update alert";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  });

  const deleteAlert = async (id: string) => {
    try {
      await priceAlertsService.deleteAlert(id);
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
      toast({
        title: "Success",
        description: "Price alert deleted successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete alert";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  });

  const toggleAlert = async (id: string, isActive: boolean) => {
    try {
      const updatedAlert = await priceAlertsService.toggleAlert(id, isActive);
      setAlerts((prev) =>
        prev.map((alert) => (alert.id === id ? updatedAlert : alert))
      );
      toast({
        title: "Success",
        description: `Alert ${isActive ? "activated" : "deactivated"} successfully`,
      });
      return updatedAlert;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to toggle alert";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  });

  return {
    alerts,
    loading,
    error,
    createAlert,
    updateAlert,
    deleteAlert,
    toggleAlert,
    refreshAlerts: loadAlerts,
  };
};

export const usePriceHistory = (alertId: string | null) => {
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!alertId) return;

    const loadHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await priceAlertsService.getPriceHistory(alertId);
        setHistory(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load history";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [alertId]);

  return { history, loading, error };
};

export const usePriceNotifications = () => {
  const [notifications, setNotifications] = useState<PriceNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadNotifications = async (unreadOnly: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is authenticated before fetching
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setNotifications([]);
        setLoading(false);
        return;
      }
      
      const data = await priceAlertsService.getNotifications(unreadOnly);
      setNotifications(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load notifications";
      // Don't set error for auth-related issues
      if (!errorMessage.includes("JWT") && !errorMessage.includes("auth") && !errorMessage.includes("row-level security")) {
        setError(errorMessage);
      } else {
        setNotifications([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await priceAlertsService.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to mark as read";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  const markAllAsRead = async () => {
    try {
      await priceAlertsService.markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, is_read: true }))
      );
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to mark all as read";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  return {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications: loadNotifications,
  };
};
