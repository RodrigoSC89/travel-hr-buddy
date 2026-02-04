/**
 * Smart Notification Center - Premium Component
 * Central de notificações inteligente com priorização IA
 */

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetTrigger 
} from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, BellRing, Check, CheckCheck, Clock, AlertTriangle,
  AlertCircle, Info, Ship, Wrench, Users, FileText, Shield,
  DollarSign, Stethoscope, Brain, X, Trash2, Settings,
  Filter, Archive, Star, StarOff, ChevronRight, MoreHorizontal
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: "alert" | "warning" | "info" | "success" | "ai";
  category: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  starred: boolean;
  priority: "critical" | "high" | "medium" | "low";
  action?: {
    label: string;
    onClick: () => void;
  };
  metadata?: Record<string, any>;
}

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "alert",
    category: "maintenance",
    title: "Motor Principal - Manutenção Crítica",
    message: "MV Atlântico Sul requer manutenção urgente no motor principal. Previsão de falha em 48h.",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    read: false,
    starred: true,
    priority: "critical",
    action: { label: "Ver Detalhes", onClick: () => toast.info("Abrindo detalhes...") }
  },
  {
    id: "2",
    type: "warning",
    category: "compliance",
    title: "Certificado SMC Expirando",
    message: "Certificado SMC da embarcação MV Pacific Star expira em 30 dias. Agende renovação.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: false,
    starred: false,
    priority: "high",
    action: { label: "Agendar", onClick: () => toast.info("Abrindo agendamento...") }
  },
  {
    id: "3",
    type: "ai",
    category: "operations",
    title: "Otimização de Rota Sugerida",
    message: "IA identificou economia de 12% em combustível alterando rota para Santos.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    read: false,
    starred: false,
    priority: "medium",
    action: { label: "Ver Análise", onClick: () => toast.info("Abrindo análise IA...") }
  },
  {
    id: "4",
    type: "info",
    category: "crew",
    title: "Novo Tripulante Cadastrado",
    message: "João Carlos Silva foi adicionado à tripulação do MV Horizonte.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
    read: true,
    starred: false,
    priority: "low"
  },
  {
    id: "5",
    type: "success",
    category: "compliance",
    title: "Auditoria ISM Concluída",
    message: "Auditoria ISM do MV Atlântico Sul aprovada com score 98/100.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
    starred: true,
    priority: "low"
  },
  {
    id: "6",
    type: "warning",
    category: "medical",
    title: "Estoque Baixo - Medicamentos",
    message: "Estoque de Ciprofloxacino abaixo do mínimo na enfermaria.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    read: true,
    starred: false,
    priority: "high",
    action: { label: "Solicitar", onClick: () => toast.info("Abrindo solicitação...") }
  }
];

const typeConfig = {
  alert: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  info: { icon: Info, color: "text-primary", bg: "bg-primary/10" },
  success: { icon: Check, color: "text-success", bg: "bg-success/10" },
  ai: { icon: Brain, color: "text-purple-500", bg: "bg-purple-500/10" }
};

const categoryIcons: Record<string, React.ElementType> = {
  maintenance: Wrench,
  compliance: Shield,
  operations: Ship,
  crew: Users,
  finance: DollarSign,
  medical: Stethoscope,
  documents: FileText
};

interface SmartNotificationCenterProps {
  trigger?: React.ReactNode;
}

export function SmartNotificationCenter({ trigger }: SmartNotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<"all" | "unread" | "starred">("all");
  const [open, setOpen] = useState(false);

  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length, 
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    let filtered = notifications;
    
    if (filter === "unread") {
      filtered = filtered.filter(n => !n.read);
    } else if (filter === "starred") {
      filtered = filtered.filter(n => n.starred);
    }

    // Sort by priority and timestamp
    return filtered.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }, [notifications, filter]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleToggleStar = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, starred: !n.starred } : n)
    );
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success("Notificação removida");
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("Todas as notificações marcadas como lidas");
  };

  const handleClearAll = () => {
    setNotifications([]);
    toast.success("Notificações limpas");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="relative">
            {unreadCount > 0 ? (
              <BellRing className="h-5 w-5 animate-pulse" />
            ) : (
              <Bell className="h-5 w-5" />
            )}
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
          </Button>
        )}
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
              {unreadCount > 0 && (
                <Badge variant="secondary">{unreadCount} novas</Badge>
              )}
            </SheetTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handleMarkAllAsRead}>
                <CheckCheck className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <SheetDescription className="sr-only">
            Central de notificações do sistema
          </SheetDescription>
        </SheetHeader>

        {/* Filters */}
        <div className="p-2 border-b">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="unread" className="gap-1">
                Não Lidas
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="h-5 w-5 p-0 justify-center">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="starred">
                <Star className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Notifications List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            <AnimatePresence>
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Nenhuma notificação</p>
                  <p className="text-sm">Você está em dia!</p>
                </div>
              ) : (
                filteredNotifications.map((notification, idx) => {
                  const TypeIcon = typeConfig[notification.type].icon;
                  const CategoryIcon = categoryIcons[notification.category] || Info;
                  
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`relative p-3 rounded-lg border transition-colors ${
                        notification.read 
                          ? "bg-background" 
                          : "bg-muted/50 border-primary/20"
                      }`}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      {/* Priority indicator */}
                      {notification.priority === "critical" && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive rounded-l-lg" />
                      )}
                      {notification.priority === "high" && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-warning rounded-l-lg" />
                      )}

                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className={`p-2 rounded-lg ${typeConfig[notification.type].bg} shrink-0`}>
                          <TypeIcon className={`h-4 w-4 ${typeConfig[notification.type].color}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium text-sm truncate ${!notification.read ? "" : "text-muted-foreground"}`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStar(notification.id);
                              }}
                            >
                              {notification.starred ? (
                                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                              ) : (
                                <StarOff className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <CategoryIcon className="h-3 w-3" />
                              <span>
                                {formatDistanceToNow(notification.timestamp, { 
                                  addSuffix: true, 
                                  locale: ptBR 
                                })}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              {notification.action && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs gap-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    notification.action?.onClick();
                                  }}
                                >
                                  {notification.action.label}
                                  <ChevronRight className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(notification.id);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-2 border-t">
            <Button 
              variant="ghost" 
              className="w-full text-muted-foreground"
              onClick={handleClearAll}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Todas
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default SmartNotificationCenter;
