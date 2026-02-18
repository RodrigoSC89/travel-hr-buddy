/**
 * QuickActionsPanel v2 - Real data activities + animated interactions
 * Fetches real access_logs and shows live counts from Supabase
 */
import React, { memo, useCallback, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertsDialog } from "@/components/layout/AlertsDialog";
import {
  Plus, FileText, Users, Ship, AlertTriangle,
  Calendar, ClipboardCheck, BarChart3, Zap,
  Wrench, Bell, Activity, Shield, Award
} from "lucide-react";
import { smartPrefetch } from "@/lib/performance/smart-prefetch";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  route: string;
  colorClass: string;
  description: string;
}

const quickActions: QuickAction[] = [
  { id: "new-mission", label: "Nova Missão", icon: Plus, route: "/ops?tab=voyage", colorClass: "text-primary", description: "Criar nova missão" },
  { id: "crew", label: "Tripulação", icon: Users, route: "/workbench?section=people", colorClass: "text-success", description: "Gerenciar tripulação" },
  { id: "vessels", label: "Frota", icon: Ship, route: "/ops?tab=fleet", colorClass: "text-info", description: "Ver embarcações" },
  { id: "alerts", label: "Alertas", icon: AlertTriangle, route: "/command?tab=alerts", colorClass: "text-warning", description: "Ver alertas ativos" },
  { id: "schedule", label: "Agenda", icon: Calendar, route: "/calendar", colorClass: "text-accent-foreground", description: "Ver agenda" },
  { id: "compliance", label: "Compliance", icon: Shield, route: "/compliance", colorClass: "text-destructive", description: "Auditorias" },
  { id: "reports", label: "Relatórios", icon: BarChart3, route: "/reports", colorClass: "text-primary", description: "Gerar relatórios" },
  { id: "maintenance", label: "Manutenção", icon: Wrench, route: "/maintenance", colorClass: "text-warning", description: "Planejar manutenção" },
];

/* ─── Activity Icon Mapper ─── */
const getActivityIcon = (module: string) => {
  const map: Record<string, React.ElementType> = {
    fleet: Ship, crew: Users, maintenance: Wrench, compliance: Shield,
    documents: FileText, reports: BarChart3, certificates: Award, soc: AlertTriangle,
  };
  const key = Object.keys(map).find(k => module.toLowerCase().includes(k));
  return key ? map[key] : Activity;
};

const getTimeAgo = (timestamp: string): string => {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
};

const QuickActionsPanelComponent: React.FC = () => {
  const navigate = useNavigate();
  const [alertsOpen, setAlertsOpen] = useState(false);

  // Fetch real recent activities
  const { data: activities, isLoading } = useQuery({
    queryKey: ['quick-actions-activities'],
    queryFn: async () => {
      const { data } = await supabase
        .from('access_logs')
        .select('id, action, module_accessed, timestamp')
        .order('timestamp', { ascending: false })
        .limit(5);
      return (data ?? []).map(log => ({
        id: log.id,
        text: `${log.action} — ${log.module_accessed}`,
        time: getTimeAgo(log.timestamp),
        module: log.module_accessed || 'system',
      }));
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const handleNavigate = useCallback((route: string) => {
    navigate(route);
  }, [navigate]);

  const handlePrefetch = useCallback((route: string) => {
    smartPrefetch.prefetchRoute(route);
  }, []);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Quick Actions */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Zap className="h-4 w-4 text-primary" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.04, duration: 0.3 }}
              >
                <Button
                  variant="ghost"
                  className="h-auto flex-col gap-2 p-3 w-full hover:bg-muted/80 border border-transparent hover:border-border/50 transition-all duration-200 active:scale-[0.95] group"
                  onClick={() => handleNavigate(action.route)}
                  onMouseEnter={() => handlePrefetch(action.route)}
                >
                  <div className={cn("p-2 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors")}>
                    <action.icon className={cn("h-5 w-5", action.colorClass)} />
                  </div>
                  <span className="text-xs font-medium text-foreground">{action.label}</span>
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity - Real Data */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base font-semibold">
            <span className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Atividade Recente
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 text-primary hover:text-primary font-medium"
              onClick={() => setAlertsOpen(true)}
            >
              Ver todas
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 rounded-lg" />
              ))}
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="space-y-2">
              {activities.map((activity, index) => {
                const Icon = getActivityIcon(activity.module);
                return (
                  <motion.div
                    key={activity.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.06, duration: 0.3 }}
                  >
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate text-foreground">{activity.text}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap tabular-nums font-medium">
                      {activity.time}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-sm text-muted-foreground">
              Nenhuma atividade recente registrada.
            </div>
          )}
        </CardContent>
      </Card>

      <AlertsDialog open={alertsOpen} onOpenChange={setAlertsOpen} />
    </div>
  );
};

export const QuickActionsPanel = memo(QuickActionsPanelComponent);
export default QuickActionsPanel;
