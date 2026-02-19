/**
 * LVS Notification Center - Compliance alerts, deadlines, and status tracking
 */
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell, AlertTriangle, Clock, CheckCircle2, XCircle,
  Calendar, Shield, TrendingDown, ArrowRight, Filter,
  BellOff, RefreshCw
} from "lucide-react";
import { ALL_LVS_SECTIONS } from "./lvs-data";

type NotificationType = "critical" | "warning" | "info" | "success";
type NotificationCategory = "deadline" | "gap" | "status_change" | "score" | "evidence";

interface LVSNotification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  description: string;
  section?: string;
  timestamp: Date;
  isRead: boolean;
  actionLabel?: string;
}

function generateNotifications(): LVSNotification[] {
  const notifications: LVSNotification[] = [];
  const now = new Date();

  const allItems = ALL_LVS_SECTIONS.flatMap(s =>
    s.subsections.flatMap(ss =>
      ss.items.map(item => ({ ...item, sectionTitle: s.title, sectionCode: s.code }))
    )
  );

  // Rejected items → critical
  const rejected = allItems.filter(i => i.status === "rejected");
  rejected.forEach((item, idx) => {
    notifications.push({
      id: `rej-${idx}`,
      type: "critical",
      category: "gap",
      title: `Item Rejeitado: ${item.ref}`,
      description: `"${item.question.substring(0, 80)}..." na seção ${item.sectionCode} — ${item.sectionTitle}`,
      section: item.sectionCode,
      timestamp: new Date(now.getTime() - (idx + 1) * 3600000 * 8), // deterministic: 8h apart
      isRead: false,
      actionLabel: "Ver Item",
    });
  });

  // Pending with deadlines → warning
  const pending = allItems.filter(i => i.status === "pending" && i.pendency);
  pending.slice(0, 10).forEach((item, idx) => {
    notifications.push({
      id: `pend-${idx}`,
      type: "warning",
      category: "deadline",
      title: `Pendência: ${item.ref}`,
      description: `${item.pendency} — Seção ${item.sectionCode}`,
      section: item.sectionCode,
      timestamp: new Date(now.getTime() - (idx + 1) * 3600000 * 12), // deterministic: 12h apart
      isRead: idx % 2 === 0, // deterministic alternating
      actionLabel: "Resolver",
    });
  });

  // Low score sections → warning
  ALL_LVS_SECTIONS.forEach((section, sIdx) => {
    const items = section.subsections.flatMap(ss => ss.items);
    const approved = items.filter(i => i.status === "approved").length;
    const score = items.length > 0 ? Math.round((approved / items.length) * 100) : 0;
    if (score < 50 && items.length > 0) {
      notifications.push({
        id: `score-${section.id}`,
        type: "warning",
        category: "score",
        title: `Score Baixo: ${section.code} ${section.title}`,
        description: `Apenas ${score}% de conformidade (${approved}/${items.length} itens aprovados)`,
        section: section.code,
        timestamp: new Date(now.getTime() - (sIdx + 1) * 3600000 * 4), // deterministic: 4h apart
        isRead: false,
        actionLabel: "Analisar",
      });
    }
  });

  // Not verified items → info
  const notVerified = allItems.filter(i => i.status === "not_verified").length;
  if (notVerified > 0) {
    notifications.push({
      id: "nv-summary",
      type: "info",
      category: "evidence",
      title: `${notVerified} Itens Não Verificados`,
      description: "Estes itens ainda precisam ser inspecionados e classificados",
      timestamp: new Date(now.getTime() - 3600000),
      isRead: true,
    });
  }

  // Overall score → success/warning
  const totalItems = allItems.length;
  const totalApproved = allItems.filter(i => i.status === "approved").length;
  const overallScore = totalItems > 0 ? Math.round((totalApproved / totalItems) * 100) : 0;
  notifications.push({
    id: "overall-score",
    type: overallScore >= 80 ? "success" : overallScore >= 50 ? "warning" : "critical",
    category: "score",
    title: `Score Geral: ${overallScore}%`,
    description: `${totalApproved} de ${totalItems} itens aprovados no checklist LVS`,
    timestamp: now,
    isRead: false,
  });

  return notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

const TYPE_CONFIG: Record<NotificationType, { icon: typeof Bell; color: string; bg: string }> = {
  critical: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" },
  warning: { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
  info: { icon: Bell, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
  success: { icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
};

const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  deadline: "Prazo",
  gap: "Gap",
  status_change: "Status",
  score: "Score",
  evidence: "Evidência",
};

export const LVSNotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<LVSNotification[]>(() => generateNotifications());
  const [activeTab, setActiveTab] = useState("all");

  const filtered = useMemo(() => {
    if (activeTab === "all") return notifications;
    if (activeTab === "unread") return notifications.filter(n => !n.isRead);
    return notifications.filter(n => n.type === activeTab);
  }, [notifications, activeTab]);

  const counts = useMemo(() => ({
    all: notifications.length,
    unread: notifications.filter(n => !n.isRead).length,
    critical: notifications.filter(n => n.type === "critical").length,
    warning: notifications.filter(n => n.type === "warning").length,
  }), [notifications]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const refresh = () => {
    setNotifications(generateNotifications());
  };

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m atrás`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h atrás`;
    return `${Math.floor(hours / 24)}d atrás`;
  };

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-muted">
          <CardContent className="p-3 text-center">
            <Bell className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
            <div className="text-xl font-bold">{counts.all}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-3 text-center">
            <Bell className="h-5 w-5 text-blue-400 mx-auto mb-1" />
            <div className="text-xl font-bold text-blue-400">{counts.unread}</div>
            <div className="text-xs text-muted-foreground">Não Lidas</div>
          </CardContent>
        </Card>
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-3 text-center">
            <XCircle className="h-5 w-5 text-red-400 mx-auto mb-1" />
            <div className="text-xl font-bold text-red-400">{counts.critical}</div>
            <div className="text-xs text-muted-foreground">Críticas</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-3 text-center">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
            <div className="text-xl font-bold text-yellow-400">{counts.warning}</div>
            <div className="text-xs text-muted-foreground">Alertas</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Central de Notificações LVS
              </CardTitle>
              <CardDescription>Alertas de compliance, prazos e mudanças de status</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={refresh}>
                <RefreshCw className="h-3.5 w-3.5 mr-1" /> Atualizar
              </Button>
              <Button variant="ghost" size="sm" onClick={markAllRead}>
                <BellOff className="h-3.5 w-3.5 mr-1" /> Marcar Lidas
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-3">
              <TabsTrigger value="all">Todas ({counts.all})</TabsTrigger>
              <TabsTrigger value="unread">Não Lidas ({counts.unread})</TabsTrigger>
              <TabsTrigger value="critical">Críticas ({counts.critical})</TabsTrigger>
              <TabsTrigger value="warning">Alertas ({counts.warning})</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {filtered.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma notificação nesta categoria</p>
                  </div>
                ) : (
                  filtered.map(notification => {
                    const cfg = TYPE_CONFIG[notification.type];
                    const Icon = cfg.icon;
                    return (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border ${cfg.bg} ${!notification.isRead ? "ring-1 ring-primary/20" : "opacity-80"} transition-all`}
                        onClick={() => {
                          setNotifications(prev =>
                            prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
                          );
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${cfg.color}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-medium truncate">{notification.title}</span>
                              {!notification.isRead && (
                                <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">{notification.description}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                {CATEGORY_LABELS[notification.category]}
                              </Badge>
                              {notification.section && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  §{notification.section}
                                </Badge>
                              )}
                              <span className="text-[10px] text-muted-foreground ml-auto">
                                {formatTime(notification.timestamp)}
                              </span>
                            </div>
                          </div>
                          {notification.actionLabel && (
                            <Button variant="ghost" size="sm" className="shrink-0 text-xs h-7">
                              {notification.actionLabel} <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
