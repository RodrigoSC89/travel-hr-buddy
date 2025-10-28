import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SensorAlert } from "../types";

interface SensorAlertsProps {
  alerts: SensorAlert[];
  onAcknowledge: (id: string) => void;
}

export const SensorAlerts: React.FC<SensorAlertsProps> = ({ alerts }) => (
  <Card>
    <CardHeader><CardTitle>Active Alerts</CardTitle></CardHeader>
    <CardContent>
      <p className="text-muted-foreground">{alerts.length} alert{alerts.length !== 1 ? 's' : ''}</p>
    </CardContent>
  </Card>
);
