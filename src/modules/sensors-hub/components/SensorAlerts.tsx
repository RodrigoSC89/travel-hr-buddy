/**
 * PATCH 441 - Sensor Alerts Component
 * Display and manage sensor anomaly alerts
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, X } from "lucide-react";

interface SensorAlert {
  id?: string;
  sensor_id: string;
  sensor_name: string;
  alert_type: "anomaly" | "threshold_exceeded" | "offline" | "calibration_needed";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  value?: number;
  threshold?: number;
  timestamp: string;
  acknowledged?: boolean;
  resolved?: boolean;
}

interface SensorAlertsProps {
  alerts: SensorAlert[];
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}

export const SensorAlerts: React.FC<SensorAlertsProps> = ({ 
  alerts, 
  onAcknowledge,
  onResolve 
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500/10 text-red-500 border-red-500/30";
      case "high": return "bg-orange-500/10 text-orange-500 border-orange-500/30";
      case "medium": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";
      default: return "bg-blue-500/10 text-blue-500 border-blue-500/30";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Active Alerts
        </CardTitle>
        <CardDescription>
          Sensor anomalies and threshold violations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50 text-green-500" />
            <p>No active alerts - all systems normal</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map(alert => (
              <div 
                key={alert.id} 
                className="p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {alert.alert_type.replace(/_/g, " ")}
                      </Badge>
                      <span className="font-medium text-sm">{alert.sensor_name}</span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    
                    {alert.value !== undefined && alert.threshold !== undefined && (
                      <div className="text-xs text-muted-foreground">
                        Value: {alert.value.toFixed(2)} | Threshold: {alert.threshold.toFixed(2)}
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                    
                    {alert.acknowledged && (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Acknowledged
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {!alert.acknowledged && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => alert.id && onAcknowledge(alert.id)}
                        title="Acknowledge alert"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    {!alert.resolved && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => alert.id && onResolve(alert.id)}
                        title="Resolve alert"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
