
/**
 * PATCH 501: Satellite Alerts Component
 * Displays alerts and warnings for satellites
 */

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { satelliteTrackingService } from "../services/satellite-tracking-service";
import { toast } from "sonner";

interface Alert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description?: string;
  is_resolved: boolean;
  created_at: string;
}

interface SatelliteAlertsProps {
  satelliteId: string;
}

export const SatelliteAlerts: React.FC<SatelliteAlertsProps> = ({ satelliteId }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, [satelliteId]);

  const loadAlerts = async () => {
    try {
      setIsLoading(true);
      const data = await satelliteTrackingService.getAlerts({ satelliteId });
      setAlerts(data);
    } catch (error) {
      console.error("Failed to load alerts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      await satelliteTrackingService.resolveAlert(alertId);
      toast.success("Alerta resolvido");
      loadAlerts();
    } catch (error) {
      console.error("Failed to resolve alert:", error);
      toast.error("Falha ao resolver alerta");
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
    case "critical":
      return <XCircle className="h-5 w-5 text-red-500" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case "info":
      return <AlertCircle className="h-5 w-5 text-blue-500" />;
    default:
      return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "critical":
      return "bg-red-500";
    case "warning":
      return "bg-yellow-500";
    case "info":
      return "bg-blue-500";
    default:
      return "bg-gray-500";
    }
  };

  if (isLoading) {
    return <div>Carregando alertas...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Alertas ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
            <p>Nenhum alerta ativo</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start justify-between p-4 border rounded-lg"
              >
                <div className="flex gap-3 flex-1">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{alert.title}</span>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      {alert.is_resolved && (
                        <Badge variant="outline" className="bg-green-50">
                          Resolvido
                        </Badge>
                      )}
                    </div>
                    {alert.description && (
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                {!alert.is_resolved && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResolve(alert.id)}
                  >
                    Resolver
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
