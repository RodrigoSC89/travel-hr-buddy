import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import type { SensorAlert } from "../types";

interface SensorAlertsProps {
  alerts: SensorAlert[];
  onAcknowledge: (id: string) => void;
}

export const SensorAlerts: React.FC<SensorAlertsProps> = ({ alerts, onAcknowledge }) => (
  <Card>
    <CardHeader><CardTitle>Active Alerts</CardTitle></CardHeader>
    <CardContent>
      {alerts.length === 0 ? (
        <p className="text-muted-foreground">No active alerts</p>
      ) : (
        <div className="space-y-2">
          {alerts.map(alert => (
            <div key={alert.id} className="p-3 border rounded flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={
                    alert.severity === "critical" ? "bg-red-500/10 text-red-500" :
                    alert.severity === "high" ? "bg-orange-500/10 text-orange-500" :
                    alert.severity === "medium" ? "bg-yellow-500/10 text-yellow-500" :
                    "bg-blue-500/10 text-blue-500"
                  }>
                    {alert.severity}
                  </Badge>
                  <span className="font-medium text-sm">{alert.sensorName}</span>
                </div>
                <p className="text-sm text-muted-foreground">{alert.message}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => onAcknowledge(alert.id)}>
                <CheckCircle className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);
