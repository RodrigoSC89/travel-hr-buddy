/**
 * Smart Notification Center - Premium Component
 * Central de notificações inteligente com dados reais do Supabase
 */

import React, { useState, useMemo } from "react";
import { useNotificationsData, type SystemNotification } from "@/hooks/useNotificationsData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger 
} from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, BellRing, Check, CheckCheck, AlertTriangle,
  AlertCircle, Info, Ship, Wrench, Users, FileText, Shield,
  DollarSign, Stethoscope, Brain, Settings, Star, StarOff
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface DisplayNotification {
  id: string;
  type: "alert" | "warning" | "info" | "success" | "ai";
  category: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  starred: boolean;
  priority: "critical" | "high" | "medium" | "low";
}

const typeConfig = {
  alert: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  info: { icon: Info, color: "text-primary", bg: "bg-primary/10" },
  success: { icon: Check, color: "text-success", bg: "bg-success/10" },
  ai: { icon: Brain, color: "text-purple-500", bg: "bg-purple-500/10" }
};

const categoryIcons: Record<string, React.ElementType> = {
  maintenance: Wrench, compliance: Shield, operations: Ship,
  crew: Users, finance: DollarSign, medical: Stethoscope,
  documents: FileText, Sistema: Info, SOC: Shield,
};

function mapSystemToDisplay(n: SystemNotification): DisplayNotification {
  const typeMap: Record<string, DisplayNotification["type"]> = {
    error: "alert", warning: "warning", info: "info", success: "success",
  };
  return {
    id: n.id, type: typeMap[n.type] || "info", category: n.source || "Sistema",
    title: n.title, message: n.message, timestamp: n.createdAt,
    read: n.read, starred: n.priority === "critical", priority: n.priority,
  };
}

interface SmartNotificationCenterProps {
  trigger?: React.ReactNode;
}

export function SmartNotificationCenter({ trigger }: SmartNotificationCenterProps) {
  const { notifications: systemNotifications, stats, markAsRead, markAllAsRead } = useNotificationsData();
  const [filter, setFilter] = useState<"all" | "unread" | "starred">("all");
  const [open, setOpen] = useState(false);
  const [localStarred, setLocalStarred] = useState<Set<string>>(new Set());

  const notifications = useMemo(() =>
    systemNotifications.map(n => {
      const display = mapSystemToDisplay(n);
      if (localStarred.has(n.id)) display.starred = true;
      return display;
    }),
    [systemNotifications, localStarred]
  );

  const filteredNotifications = useMemo(() => {
    let filtered = notifications;
    if (filter === "unread") filtered = filtered.filter(n => !n.read);
    else if (filter === "starred") filtered = filtered.filter(n => n.starred);
    return filtered.sort((a, b) => {
      const po = { critical: 0, high: 1, medium: 2, low: 3 };
      if (po[a.priority] !== po[b.priority]) return po[a.priority] - po[b.priority];
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }, [notifications, filter]);

  const handleToggleStar = (id: string) => {
    setLocalStarred(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast.success("Todas marcadas como lidas");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="relative">
            {stats.unread > 0 ? <BellRing className="h-5 w-5 animate-pulse" /> : <Bell className="h-5 w-5" />}
            {stats.unread > 0 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                {stats.unread > 9 ? "9+" : stats.unread}
              </motion.span>
            )}
          </Button>
        )}
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" /> Notificações
              {stats.unread > 0 && <Badge variant="secondary">{stats.unread} novas</Badge>}
            </SheetTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handleMarkAllAsRead}><CheckCheck className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button>
            </div>
          </div>
          <SheetDescription className="sr-only">Central de notificações do sistema</SheetDescription>
        </SheetHeader>

        <div className="p-2 border-b">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="unread" className="gap-1">
                Não Lidas
                {stats.unread > 0 && <Badge variant="secondary" className="h-5 w-5 p-0 justify-center">{stats.unread}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="starred"><Star className="h-4 w-4" /></TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

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
                    <motion.div key={notification.id}
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }} transition={{ delay: idx * 0.05 }}
                      className={`relative p-3 rounded-lg border transition-colors cursor-pointer ${
                        notification.read ? "bg-background" : "bg-muted/50 border-primary/20"
                      }`}
                      onClick={() => markAsRead(notification.id)}>
                      {notification.priority === "critical" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive rounded-l-lg" />}
                      {notification.priority === "high" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-warning rounded-l-lg" />}
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-lg ${typeConfig[notification.type].bg} shrink-0`}>
                          <TypeIcon className={`h-4 w-4 ${typeConfig[notification.type].color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium text-sm truncate ${!notification.read ? "" : "text-muted-foreground"}`}>{notification.title}</p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0"
                              onClick={(e) => { e.stopPropagation(); handleToggleStar(notification.id); }}>
                              {notification.starred ? <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" /> : <StarOff className="h-4 w-4 text-muted-foreground" />}
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                            <CategoryIcon className="h-3 w-3" />
                            <span>{formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: ptBR })}</span>
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

        {notifications.length > 0 && (
          <div className="p-2 border-t">
            <Button variant="ghost" className="w-full text-muted-foreground" onClick={handleMarkAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" /> Marcar Todas como Lidas
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default SmartNotificationCenter;
