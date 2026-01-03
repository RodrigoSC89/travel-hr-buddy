/**
 * Hook for Compliance Push Notifications
 * Manages push notification permissions and subscriptions
 */

import { useState, useEffect, useCallback } from 'react';
import { compliancePushService, ComplianceAlert } from '@/lib/notifications/compliance-push-service';
import { useToast } from '@/hooks/use-toast';

interface UseCompliancePushNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<void>;
  sendTestNotification: () => Promise<boolean>;
  sendAlert: (alert: ComplianceAlert) => Promise<boolean>;
}

export function useCompliancePushNotifications(): UseCompliancePushNotificationsReturn {
  const { toast } = useToast();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSupport = async () => {
      const supported = 'Notification' in window && 'serviceWorker' in navigator;
      setIsSupported(supported);

      if (supported) {
        setPermission(Notification.permission);
        
        // Check if already subscribed
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.getRegistration('/sw-compliance.js');
            if (registration) {
              const subscription = await registration.pushManager.getSubscription();
              setIsSubscribed(!!subscription);
            }
          } catch (error) {
            console.error('Error checking subscription:', error);
          }
        }
      }

      setIsLoading(false);
    };

    checkSupport();
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      await compliancePushService.initialize();
      const subscription = await compliancePushService.subscribeToPush();
      
      if (subscription) {
        setIsSubscribed(true);
        setPermission('granted');
        toast({
          title: "Notificações ativadas",
          description: "Você receberá alertas de compliance mesmo quando não estiver na página.",
        });
        return true;
      } else {
        toast({
          title: "Erro ao ativar notificações",
          description: "Não foi possível ativar as notificações push.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      toast({
        title: "Erro",
        description: "Falha ao configurar notificações push.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const unsubscribe = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration('/sw-compliance.js');
        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            await subscription.unsubscribe();
            setIsSubscribed(false);
            toast({
              title: "Notificações desativadas",
              description: "Você não receberá mais alertas push de compliance.",
            });
          }
        }
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const sendTestNotification = useCallback(async (): Promise<boolean> => {
    const testAlert: ComplianceAlert = {
      id: `test-${Date.now()}`,
      module: 'mlc',
      type: 'info',
      title: '🧪 Teste de Notificação',
      message: 'Esta é uma notificação de teste do sistema de compliance.',
      timestamp: new Date(),
      actionUrl: '/compliance-center'
    };

    const success = await compliancePushService.showComplianceAlert(testAlert);
    
    if (success) {
      toast({
        title: "Notificação enviada",
        description: "Verifique sua central de notificações.",
      });
    }
    
    return success;
  }, [toast]);

  const sendAlert = useCallback(async (alert: ComplianceAlert): Promise<boolean> => {
    return await compliancePushService.showComplianceAlert(alert);
  }, []);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    sendTestNotification,
    sendAlert
  };
}
