/**
 * Hook for inspection push notifications
 * Provides easy access to notification scheduling for inspectors
 */
import { useEffect, useState, useCallback } from "react";
import { inspectionNotificationService, InspectionAlert } from "@/lib/notifications/inspection-push-service";
import { toast } from "sonner";

interface UseInspectionNotificationsReturn {
  isInitialized: boolean;
  permissionGranted: boolean;
  requestPermissions: () => Promise<boolean>;
  scheduleDeadlineAlert: (inspection: {
    id: string;
    vesselName: string;
    type: string;
    dueDate: Date;
  }) => Promise<boolean>;
  alertPendingItems: (items: Array<{ id: string; title: string; module: string }>) => Promise<void>;
  checkDeadlines: () => Promise<number>;
  cancelAll: () => Promise<void>;
}

export function useInspectionNotifications(): UseInspectionNotificationsReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    const init = async () => {
      const success = await inspectionNotificationService.initialize();
      setIsInitialized(success);
      if (success) {
        const hasPermission = await inspectionNotificationService.requestPermissions();
        setPermissionGranted(hasPermission);
      }
    };
    init();
  }, []);

  const requestPermissions = useCallback(async () => {
    const granted = await inspectionNotificationService.requestPermissions();
    setPermissionGranted(granted);
    if (granted) {
      toast.success("Notificações ativadas", {
        description: "Você receberá alertas de prazos e itens pendentes"
      });
    } else {
      toast.error("Permissão negada", {
        description: "Ative as notificações nas configurações do dispositivo"
      });
    }
    return granted;
  }, []);

  const scheduleDeadlineAlert = useCallback(async (inspection: {
    id: string;
    vesselName: string;
    type: string;
    dueDate: Date;
  }) => {
    if (!isInitialized) return false;

    const alert: InspectionAlert = {
      id: `deadline-${inspection.id}`,
      type: "deadline",
      priority: "high",
      title: `📋 Prazo de Inspeção`,
      body: `${inspection.vesselName}: ${inspection.type}`,
      scheduledAt: new Date(inspection.dueDate.getTime() - 24 * 60 * 60 * 1000), // 1 day before
      data: {
        inspectionId: inspection.id,
        route: `/pre-ovid?inspection=${inspection.id}`
      }
    };

    return inspectionNotificationService.scheduleInspectionAlert(alert);
  }, [isInitialized]);

  const alertPendingItems = useCallback(async (items: Array<{ id: string; title: string; module: string }>) => {
    if (!isInitialized) return;
    await inspectionNotificationService.alertPendingItems(items);
  }, [isInitialized]);

  const checkDeadlines = useCallback(async () => {
    if (!isInitialized) return 0;
    return inspectionNotificationService.checkAndAlertDeadlines();
  }, [isInitialized]);

  const cancelAll = useCallback(async () => {
    await inspectionNotificationService.cancelAllScheduled();
  }, []);

  return {
    isInitialized,
    permissionGranted,
    requestPermissions,
    scheduleDeadlineAlert,
    alertPendingItems,
    checkDeadlines,
    cancelAll
  };
}
