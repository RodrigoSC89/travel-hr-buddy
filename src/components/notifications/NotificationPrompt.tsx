/**
 * Push Notification Prompt Component
 * PATCH PUSH-1.0: Prompt para ativar notificações push
 */

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  isPushSupported, 
  getPermissionStatus, 
  requestNotificationPermission,
  initializePushNotifications 
} from "@/lib/push-notifications";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface NotificationPromptProps {
  className?: string;
  onClose?: () => void;
}

export function NotificationPrompt({ className, onClose }: NotificationPromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if we should show the prompt
    const checkPermission = async () => {
      if (!isPushSupported()) return;
      
      const permission = getPermissionStatus();
      const hasBeenDismissed = localStorage.getItem("nautilus-push-dismissed");
      
      // Show if permission is default (not yet asked) and not dismissed
      if (permission === "default" && !hasBeenDismissed) {
        // Delay showing to avoid interrupting user
        setTimeout(() => setIsVisible(true), 5000);
      }
    };

    checkPermission();
  }, []);

  const handleEnable = async () => {
    setIsLoading(true);
    try {
      const granted = await requestNotificationPermission();
      if (granted) {
        await initializePushNotifications();
        toast.success("Notificações ativadas!", {
          description: "Você receberá alertas importantes em tempo real."
        });
      } else {
        toast.error("Permissão negada", {
          description: "Você pode ativar nas configurações do navegador."
        });
      }
    } catch (error) {
      toast.error("Erro ao ativar notificações");
    } finally {
      setIsLoading(false);
      setIsVisible(false);
      onClose?.();
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("nautilus-push-dismissed", "true");
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 animate-slide-in-bottom",
      className
    )}>
      <Card className="w-80 shadow-lg border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">Ativar Notificações</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Receba alertas críticos e atualizações importantes em tempo real.
              </p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleEnable}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Ativando..." : "Ativar"}
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={handleDismiss}
                >
                  Depois
                </Button>
              </div>
            </div>
            <button 
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default NotificationPrompt;