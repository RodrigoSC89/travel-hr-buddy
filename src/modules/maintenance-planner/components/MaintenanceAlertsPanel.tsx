import { useState, useMemo, useCallback } from "react";;
import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Bell,
  Wrench,
  Calendar,
  Eye,
  Check,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MaintenanceAlert {
  id: string;
  type: "overdue" | "upcoming" | "critical" | "warning";
  title: string;
  description: string;
  equipment: string;
  equipmentCode: string;
  dueDate: string;
  priority: "low" | "medium" | "high" | "critical";
  isRead: boolean;
  createdAt: string;
}

interface MaintenanceAlertsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const demoAlerts: MaintenanceAlert[] = [
  {
    id: "1",
    type: "overdue",
    title: "Manutenção preventiva vencida",
    description: "Troca de óleo do sistema hidráulico está atrasada em 3 dias",
    equipment: "Bomba Hidráulica STBD",
    equipmentCode: "HYD-001",
    dueDate: "2024-12-02",
    priority: "critical",
    isRead: false,
    createdAt: "2024-12-05T10:00:00Z",
  },
  {
    id: "2",
    type: "overdue",
    title: "Inspeção de segurança vencida",
    description: "Verificação mensal do sistema de combate a incêndio",
    equipment: "Sistema de Incêndio",
    equipmentCode: "FIR-001",
    dueDate: "2024-12-01",
    priority: "critical",
    isRead: false,
    createdAt: "2024-12-05T09:00:00Z",
  },
  {
    id: "3",
    type: "overdue",
    title: "Calibração de sensores vencida",
    description: "Calibração dos sensores de posição DP",
    equipment: "Sistema DP",
    equipmentCode: "DP-001",
    dueDate: "2024-12-03",
    priority: "high",
    isRead: true,
    createdAt: "2024-12-05T08:00:00Z",
  },
  {
    id: "4",
    type: "upcoming",
    title: "Manutenção preventiva em 3 dias",
    description: "Troca de filtros de ar do gerador principal",
    equipment: "Gerador Principal 1",
    equipmentCode: "GEN-001",
    dueDate: "2024-12-08",
    priority: "medium",
    isRead: false,
    createdAt: "2024-12-05T07:00:00Z",
  },
  {
    id: "5",
    type: "upcoming",
    title: "Inspeção programada em 5 dias",
    description: "Inspeção visual do thruster de boreste",
    equipment: "Thruster STBD",
    equipmentCode: "THR-001",
    dueDate: "2024-12-10",
    priority: "medium",
    isRead: true,
    createdAt: "2024-12-05T06:00:00Z",
  },
  {
    id: "6",
    type: "warning",
    title: "Horímetro próximo do limite",
    description: "Compressor de ar atingirá 500h de operação em breve",
    equipment: "Compressor de Ar",
    equipmentCode: "CMP-001",
    dueDate: "2024-12-12",
    priority: "low",
    isRead: true,
    createdAt: "2024-12-05T05:00:00Z",
  },
];

export const MaintenanceAlertsPanel: React.FC<MaintenanceAlertsPanelProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>(demoAlerts);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  const getTypeIcon = (type: string) => {
    switch (type) {
    case "overdue":
      return <XCircle className="h-4 w-4 text-destructive" />;
    case "critical":
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    case "upcoming":
      return <Clock className="h-4 w-4 text-warning" />;
    case "warning":
      return <Bell className="h-4 w-4 text-muted-foreground" />;
    default:
      return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-muted text-muted-foreground",
      medium: "bg-warning/20 text-warning",
      high: "bg-orange-500/20 text-orange-500",
      critical: "bg-destructive/20 text-destructive",
    };
    return colors[priority] || colors.medium;
  };

  const handleMarkAsRead = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      )
    );
    toast({
      title: "Alerta marcado como lido",
      description: "O alerta foi marcado como lido",
    });
  };

  const handleMarkAllAsRead = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })));
    toast({
      title: "Todos os alertas marcados como lidos",
      description: `${alerts.filter(a => !a.isRead).length} alertas marcados`,
    });
  };

  const handleViewDetails = (alert: MaintenanceAlert) => {
    toast({
      title: alert.title,
      description: `${alert.equipment} - ${alert.description}`,
    });
  };

  const filteredAlerts = alerts.filter(alert => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !alert.isRead;
    if (activeTab === "overdue") return alert.type === "overdue";
    if (activeTab === "upcoming") return alert.type === "upcoming" || alert.type === "warning";
    return true;
  });

  const overdueCount = alerts.filter(a => a.type === "overdue").length;
  const unreadCount = alerts.filter(a => !a.isRead).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Alertas de Manutenção
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            Acompanhe manutenções vencidas e próximas
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium">Vencidos</span>
              </div>
              <p className="text-2xl font-bold text-destructive mt-1">{overdueCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium">Próximos</span>
              </div>
              <p className="text-2xl font-bold text-warning mt-1">
                {alerts.filter(a => a.type === "upcoming").length}
              </p>
            </div>
          </div>

          {/* Actions */}
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} className="w-full">
              <Check className="h-4 w-4 mr-2" />
              Marcar todos como lidos
            </Button>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="unread">
                Não lidos
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="overdue">Vencidos</TabsTrigger>
              <TabsTrigger value="upcoming">Próximos</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <ScrollArea className="h-[calc(100vh-380px)]">
                <div className="space-y-3 pr-4">
                  {filteredAlerts.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 mx-auto text-success opacity-50 mb-2" />
                      <p className="text-muted-foreground">Nenhum alerta nesta categoria</p>
                    </div>
                  ) : (
                    filteredAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-3 rounded-lg border transition-colors ${
                          !alert.isRead 
                            ? "bg-muted/50 border-primary/20" 
                            : "bg-card border-border"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {getTypeIcon(alert.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className={`font-medium text-sm ${!alert.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                                {alert.title}
                              </h4>
                              <Badge className={getPriorityBadge(alert.priority)} variant="secondary">
                                {alert.priority === "critical" ? "Crítico" : 
                                  alert.priority === "high" ? "Alto" :
                                    alert.priority === "medium" ? "Médio" : "Baixo"}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {alert.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <Wrench className="h-3 w-3" />
                              <span>{alert.equipment}</span>
                              <Badge variant="outline" className="text-xs h-5">
                                {alert.equipmentCode}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>Prazo: {new Date(alert.dueDate).toLocaleDateString("pt-BR")}</span>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => handlehandleViewDetails}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Detalhes
                              </Button>
                              {!alert.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => handlehandleMarkAsRead}
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Marcar lido
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Abrir OS
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
});
