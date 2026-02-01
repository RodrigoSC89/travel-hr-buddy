/**
 * Tracking Alerts - Placeholder
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function TrackingAlerts() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Alertas de Rastreamento</h2>
          <p className="text-muted-foreground">Alertas de posição e geofencing</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Alertas Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Nenhum alerta ativo no momento.</p>
        </CardContent>
      </Card>
    </div>
  );
}
