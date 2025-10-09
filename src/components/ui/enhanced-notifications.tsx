import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Calendar,
  Users,
  Ship,
  FileText,
  TrendingUp,
  Zap,
  Shield,
  DollarSign,
  Eye,
  Archive,
  Filter,
  Settings,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  title: string;
  description: string;
  type: "success" | "warning" | "error" | "info";
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  timestamp: Date;
  read: boolean;
  actionable: boolean;
  metadata?: {
    module?: string;
    vessel?: string;
    deadline?: Date;
    progress?: number;
    value?: number;
    trend?: "up" | "down" | "stable";
  };
  actions?: {
    label: string;
    action: () => void;
    variant?: "default" | "destructive" | "outline";
  }[];
}

interface EnhancedNotificationsProps {
  isOpen: boolean;
  onClose: () => void;
}

const EnhancedNotifications: React.FC<EnhancedNotificationsProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "urgent">("all");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Dados simulados de notificações em tempo real
  useEffect(() => {
    const initialNotifications: Notification[] = [
      {
        id: "1",
        title: "Certificado STCW Vencendo",
        description: "Certificado STCW da MV Ocean Explorer expira em 15 dias",
        type: "warning",
        priority: "high",
        category: "Certificações",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false,
        actionable: true,
        metadata: {
          module: "HR",
          vessel: "MV Ocean Explorer",
          deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        },
        actions: [
          {
            label: "Renovar Certificado",
            action: () => navigate("/hr"),
            variant: "default",
          },
          {
            label: "Ver Detalhes",
            action: () => toast({ title: "Certificado", description: "Abrindo detalhes..." }),
            variant: "outline",
          },
        ],
      },
      {
        id: "2",
        title: "Meta de Eficiência Atingida",
        description: "Parabéns! Meta mensal de eficiência operacional de 94% foi atingida",
        type: "success",
        priority: "medium",
        category: "Performance",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        read: false,
        actionable: true,
        metadata: {
          module: "Analytics",
          progress: 94.2,
          trend: "up",
        },
        actions: [
          {
            label: "Ver Relatório",
            action: () => navigate("/advanced-analytics"),
            variant: "default",
          },
        ],
      },
      {
        id: "3",
        title: "Auditoria PEOTRAM Concluída",
        description: "Auditoria #2024-001 finalizada com score 98.5%",
        type: "success",
        priority: "medium",
        category: "Auditorias",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        read: true,
        actionable: true,
        metadata: {
          module: "PEOTRAM",
          vessel: "MV Atlantic Dawn",
          progress: 98.5,
        },
        actions: [
          {
            label: "Ver Auditoria",
            action: () => navigate("/peotram"),
            variant: "outline",
          },
        ],
      },
      {
        id: "4",
        title: "Sistema de Backup Completo",
        description: "Backup automático da base de dados concluído (2.3GB)",
        type: "info",
        priority: "low",
        category: "Sistema",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        read: true,
        actionable: false,
        metadata: {
          module: "System",
          value: 2.3,
        },
      },
      {
        id: "5",
        title: "Anomalia Detectada na Frota",
        description: "IA detectou padrão anômalo no consumo de combustível",
        type: "error",
        priority: "urgent",
        category: "Frota",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: false,
        actionable: true,
        metadata: {
          module: "Fleet",
          vessel: "MV Coastal Explorer",
          trend: "down",
        },
        actions: [
          {
            label: "Investigar",
            action: () => navigate("/fleet-dashboard"),
            variant: "destructive",
          },
          {
            label: "Contatar Engenharia",
            action: () =>
              toast({ title: "Contato", description: "Enviando alerta para engenharia..." }),
            variant: "outline",
          },
        ],
      },
    ];

    setNotifications(initialNotifications);

    // Simular notificações em tempo real
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        // 20% chance de nova notificação
        const newNotification: Notification = {
          id: Date.now().toString(),
          title: "Nova Atualização",
          description: "Sistema detectou nova atividade nos módulos",
          type: "info",
          priority: "low",
          category: "Sistema",
          timestamp: new Date(),
          read: false,
          actionable: false,
        };

        setNotifications(prev => [newNotification, ...prev]);

        if (soundEnabled && "Audio" in window) {
          // Som de notificação simples
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.value = 800;
          oscillator.type = "sine";
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
        }
      }
    }, 30000); // A cada 30 segundos

    return () => clearInterval(interval);
  }, [soundEnabled]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case "error":
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case "info":
        return <Info className="w-5 h-5 text-info" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getCategoryIcon = (category: string): React.ComponentType<{ className?: string }> => {
    switch (category.toLowerCase()) {
      case "certificações":
        return Users;
      case "performance":
        return TrendingUp;
      case "auditorias":
        return FileText;
      case "sistema":
        return Settings;
      case "frota":
        return Ship;
      case "segurança":
        return Shield;
      case "financeiro":
        return DollarSign;
      default:
        return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-blue-500 text-white";
      case "low":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
    toast({
      title: "Notificações",
      description: "Todas as notificações foram marcadas como lidas",
    });
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case "unread":
        return !notification.read;
      case "urgent":
        return notification.priority === "urgent" || notification.priority === "high";
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => n.priority === "urgent").length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10060] bg-black/50 backdrop-blur-sm">
      <div className="fixed right-0 sm:right-6 top-0 sm:top-20 w-full sm:w-96 h-full sm:h-auto sm:max-h-[calc(100vh-8rem)] bg-background border-l sm:border-2 border-primary/20 sm:rounded-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="w-6 h-6 text-primary" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">Notificações</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {unreadCount} não lidas {urgentCount > 0 && `• ${urgentCount} urgentes`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="w-8 h-8 p-0"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose} className="w-8 h-8 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              className="text-xs"
            >
              Todas ({notifications.length})
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("unread")}
              className="text-xs"
            >
              Não lidas ({unreadCount})
            </Button>
            <Button
              variant={filter === "urgent" ? "destructive" : "outline"}
              size="sm"
              onClick={() => setFilter("urgent")}
              className="text-xs"
            >
              Urgentes ({urgentCount})
            </Button>
          </div>
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className="p-4 border-b border-border/50 bg-muted/30">
            <Button variant="outline" size="sm" onClick={markAllAsRead} className="w-full text-xs">
              <Eye className="w-4 h-4 mr-2" />
              Marcar todas como lidas
            </Button>
          </div>
        )}

        {/* Notifications List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredNotifications.length > 0 ? (
              <div className="space-y-2">
                {filteredNotifications.map(notification => {
                  const CategoryIcon = getCategoryIcon(notification.category);

                  return (
                    <Card
                      key={notification.id}
                      className={`transition-all duration-200 cursor-pointer ${
                        !notification.read
                          ? "bg-primary/5 border-primary/30 shadow-sm"
                          : "bg-background border-border/30"
                      } hover:shadow-md hover:scale-[1.02]`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">{getTypeIcon(notification.type)}</div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3
                                className={`font-semibold text-sm ${
                                  !notification.read ? "text-foreground" : "text-muted-foreground"
                                } line-clamp-1`}
                              >
                                {notification.title}
                              </h3>

                              <div className="flex items-center gap-1">
                                <Badge
                                  className={`text-xs px-2 py-1 ${getPriorityColor(notification.priority)}`}
                                >
                                  {notification.priority}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={e => {
                                    e.stopPropagation();
                                    removeNotification(notification.id);
                                  }}
                                  className="w-6 h-6 p-0 opacity-50 hover:opacity-100"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {notification.description}
                            </p>

                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="outline" className="text-xs">
                                <CategoryIcon className="w-3 h-3 mr-1" />
                                <span>{notification.category}</span>
                              </Badge>

                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {notification.timestamp.toLocaleTimeString()}
                              </div>
                            </div>

                            {notification.metadata?.progress && (
                              <div className="mb-3">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span>Progresso</span>
                                  <span>{notification.metadata.progress}%</span>
                                </div>
                                <Progress value={notification.metadata.progress} className="h-2" />
                              </div>
                            )}

                            {notification.actions && notification.actions.length > 0 && (
                              <div className="flex gap-2 flex-wrap">
                                {notification.actions.map((action, index) => (
                                  <Button
                                    key={index}
                                    variant={action.variant || "outline"}
                                    size="sm"
                                    onClick={e => {
                                      e.stopPropagation();
                                      action.action();
                                    }}
                                    className="text-xs h-7"
                                  >
                                    {action.label}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  {filter === "unread"
                    ? "Nenhuma notificação não lida"
                    : filter === "urgent"
                      ? "Nenhuma notificação urgente"
                      : "Nenhuma notificação encontrada"}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default EnhancedNotifications;
