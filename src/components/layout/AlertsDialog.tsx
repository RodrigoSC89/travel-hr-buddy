/**
 * Alerts Dialog Component
 * Exibe notificações e alertas do sistema
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Trash2,
  Check,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Alert {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  timestamp: Date;
  isRead: boolean;
  module?: string;
}

interface AlertsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock alerts data
const mockAlerts: Alert[] = [
  {
    id: "1",
    title: "Manutenção Programada",
    message: "Embarcação 'Ocean Pioneer' com manutenção preventiva agendada para amanhã.",
    type: "warning",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    isRead: false,
    module: "MMI"
  },
  {
    id: "2",
    title: "Certificado Expirando",
    message: "3 certificados de tripulantes expiram nos próximos 30 dias.",
    type: "warning",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isRead: false,
    module: "Crew"
  },
  {
    id: "3",
    title: "Meta ESG Atingida",
    message: "Emissões de CO2 reduziram 15% em relação ao mês anterior.",
    type: "success",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    isRead: true,
    module: "ESG"
  },
  {
    id: "4",
    title: "Novo Relatório Disponível",
    message: "Relatório mensal de operações está pronto para download.",
    type: "info",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    isRead: true,
    module: "Analytics"
  },
  {
    id: "5",
    title: "Alerta de Segurança",
    message: "Incidente reportado na área de operações - verificação necessária.",
    type: "error",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 min ago
    isRead: false,
    module: "Safety"
  }
];

export function AlertsDialog({ open, onOpenChange }: AlertsDialogProps) {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [activeTab, setActiveTab] = useState("all");

  const unreadCount = alerts.filter(a => !a.isRead).length;

  const getTypeIcon = (type: Alert["type"]) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeBadge = (type: Alert["type"]) => {
    const variants: Record<Alert["type"], string> = {
      info: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      error: "bg-red-500/10 text-red-500 border-red-500/20"
    };
    return variants[type];
  };

  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const filteredAlerts = alerts.filter(a => {
    if (activeTab === "unread") return !a.isRead;
    if (activeTab === "warnings") return a.type === "warning" || a.type === "error";
    return true;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Alertas e Notificações
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} novas
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex justify-end mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="text-xs"
          >
            <Check className="h-3 w-3 mr-1" />
            Marcar todas como lidas
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="unread">Não lidas</TabsTrigger>
            <TabsTrigger value="warnings">Alertas</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {filteredAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Bell className="h-12 w-12 mb-4 opacity-30" />
                  <p>Nenhuma notificação encontrada</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        alert.isRead 
                          ? "bg-muted/30 border-border" 
                          : "bg-primary/5 border-primary/20"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getTypeIcon(alert.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-medium text-sm ${!alert.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                              {alert.title}
                            </h4>
                            {alert.module && (
                              <Badge variant="outline" className={`text-xs ${getTypeBadge(alert.type)}`}>
                                {alert.module}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {alert.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(alert.timestamp, { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {!alert.isRead && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => markAsRead(alert.id)}
                              title="Marcar como lida"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteAlert(alert.id)}
                            title="Excluir"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}