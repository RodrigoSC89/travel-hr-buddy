/**
import { useCallback, useMemo, useState } from "react";;
 * PATCH 801/835 - Quick Actions Panel
 * Acesso rápido às principais funcionalidades - Otimizado
 */

import React, { memo, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertsDialog } from "@/components/layout/AlertsDialog";
import {
  Plus,
  FileText,
  Users,
  Ship,
  AlertTriangle,
  Calendar,
  ClipboardCheck,
  BarChart3,
  Zap,
  Wrench,
  Bell,
} from "lucide-react";
import { smartPrefetch } from "@/lib/performance/smart-prefetch";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  route: string;
  color: string;
  badge?: string;
  description: string;
}

const quickActions: QuickAction[] = [
  {
    id: "new-mission",
    label: "Nova Missão",
    icon: Plus,
    route: "/missions/new",
    color: "bg-primary hover:bg-primary/90",
    description: "Criar nova missão",
  },
  {
    id: "crew-management",
    label: "Tripulação",
    icon: Users,
    route: "/crew",
    color: "bg-green-500 hover:bg-green-600",
    badge: "24 ativos",
    description: "Gerenciar tripulação",
  },
  {
    id: "vessels",
    label: "Frota",
    icon: Ship,
    route: "/fleet",
    color: "bg-blue-500 hover:bg-blue-600",
    badge: "8 embarcações",
    description: "Ver embarcações",
  },
  {
    id: "alerts",
    label: "Alertas",
    icon: AlertTriangle,
    route: "/notifications-center",
    color: "bg-amber-500 hover:bg-amber-600",
    badge: "3 novos",
    description: "Ver alertas ativos",
  },
  {
    id: "schedule",
    label: "Agenda",
    icon: Calendar,
    route: "/calendar",
    color: "bg-purple-500 hover:bg-purple-600",
    description: "Ver agenda",
  },
  {
    id: "checklists",
    label: "Checklists",
    icon: ClipboardCheck,
    route: "/admin/checklists",
    color: "bg-teal-500 hover:bg-teal-600",
    badge: "5 pendentes",
    description: "Gerenciar checklists",
  },
  {
    id: "reports",
    label: "Relatórios",
    icon: BarChart3,
    route: "/reports",
    color: "bg-indigo-500 hover:bg-indigo-600",
    description: "Gerar relatórios",
  },
  {
    id: "maintenance",
    label: "Manutenção",
    icon: Wrench,
    route: "/maintenance-planner",
    color: "bg-orange-500 hover:bg-orange-600",
    badge: "2 urgentes",
    description: "Planejar manutenção",
  },
];

const recentActivities = [
  { id: 1, text: "Embarcação NS-01 completou inspeção", time: "5 min", icon: Ship },
  { id: 2, text: "Novo alerta de manutenção preventiva", time: "15 min", icon: Wrench },
  { id: 3, text: "Relatório ESG gerado automaticamente", time: "1h", icon: FileText },
  { id: 4, text: "Tripulante João Silva certificado", time: "2h", icon: Users },
];

const QuickActionsPanelComponent: React.FC = () => {
  const navigate = useNavigate();
  const [alertsOpen, setAlertsOpen] = useState(false);

  const handleNavigate = useCallback((route: string) => {
    navigate(route);
  }, [navigate]);

  const handlePrefetch = useCallback((route: string) => {
    smartPrefetch.prefetchRoute(route);
  }, []);

  const handleViewAllActivities = useCallback(() => {
    setAlertsOpen(true);
  }, []);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Quick Actions */}
      <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-foreground font-semibold">
            <Zap className="h-4 w-4 text-primary" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="ghost"
                className={`h-auto flex-col gap-2 p-3 ${action.color} text-white relative shadow-md`}
                onClick={() => handlehandleNavigate}
                onMouseEnter={() => handlePrefetch(action.route)}
              >
                <action.icon className="h-6 w-6 drop-shadow-sm" />
                <span className="text-sm font-bold drop-shadow-sm">{action.label}</span>
                {action.badge && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-1 -right-1 text-[10px] px-1.5 py-0.5 bg-slate-900 text-white font-semibold border-0"
                  >
                    {action.badge}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base text-foreground font-semibold">
            <span className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Atividade Recente
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sm h-7 text-primary hover:text-primary font-medium"
              onClick={handleViewAllActivities}
            >
              Ver todas
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="p-2 rounded-full bg-primary/30">
                  <activity.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate text-foreground font-semibold">{activity.text}</p>
                </div>
                <span className="text-sm text-foreground whitespace-nowrap font-bold">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts Dialog */}
      <AlertsDialog open={alertsOpen} onOpenChange={setAlertsOpen} />
    </div>
  );
};

export const QuickActionsPanel = memo(QuickActionsPanelComponent);
export default QuickActionsPanel;
