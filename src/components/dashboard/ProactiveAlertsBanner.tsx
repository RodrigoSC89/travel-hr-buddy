/**
 * ProactiveAlertsBanner - Autonomous AI alerts display
 * Shows critical and warning alerts from the monitoring system
 */
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Bell, CheckCircle, ChevronRight, X, Shield, Wrench, FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import type { ProactiveAlert } from "@/hooks/useAutonomousMonitor";

interface ProactiveAlertsBannerProps {
  alerts: ProactiveAlert[];
  onDismiss: (id: string) => void;
  maxVisible?: number;
}

const alertIcons: Record<string, typeof Bell> = {
  certificate_expiry: Shield,
  maintenance_due: Wrench,
  compliance_gap: FileWarning,
  crew_fatigue: AlertTriangle,
  system_anomaly: Bell,
  cascading_risk: AlertTriangle,
  vessel_risk: Shield,
};

const severityStyles = {
  critical: "border-destructive/30 bg-destructive/5 text-destructive",
  warning: "border-warning/30 bg-warning/5 text-warning",
  info: "border-info/30 bg-info/5 text-info",
};

export function ProactiveAlertsBanner({ alerts, onDismiss, maxVisible = 3 }: ProactiveAlertsBannerProps) {
  const navigate = useNavigate();
  const visible = alerts.slice(0, maxVisible);

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Bell className="h-3.5 w-3.5" />
        <span>Alertas Proativos da IA</span>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
          {alerts.length}
        </Badge>
      </div>
      <AnimatePresence mode="popLayout">
        {visible.map((alert) => {
          const Icon = alertIcons[alert.type] || Bell;
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className={`flex items-center gap-3 p-3 rounded-xl border ${severityStyles[alert.severity]}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{alert.title}</p>
                <p className="text-xs opacity-70 truncate">{alert.description}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {alert.actionUrl && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => navigate(alert.actionUrl!)}
                    aria-label="Ver detalhes do alerta"
                    title="Ver detalhes"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-50 hover:opacity-100"
                  onClick={() => onDismiss(alert.id)}
                  aria-label="Dispensar alerta"
                  title="Dispensar"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      {alerts.length > maxVisible && (
        <p className="text-xs text-muted-foreground text-center">
          +{alerts.length - maxVisible} alertas adicionais
        </p>
      )}
    </div>
  );
}
