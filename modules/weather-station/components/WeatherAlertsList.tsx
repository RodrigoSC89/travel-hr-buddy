/**
 * Weather Alerts Component
 * PATCH 105.0
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import type { WeatherAlert } from "../types";
import { format } from "date-fns";

interface WeatherAlertsListProps {
  alerts: WeatherAlert[];
  onAcknowledge: (alertId: string) => void;
}

export function WeatherAlertsList({ alerts, onAcknowledge }: WeatherAlertsListProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "severe":
      return "bg-red-500/20 text-red-300 border-red-500/30";
    case "high":
      return "bg-orange-500/20 text-orange-300 border-orange-500/30";
    case "moderate":
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    case "low":
      return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    default:
      return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === "severe" || severity === "high") {
      return <AlertTriangle className="h-5 w-5" />;
    }
    return <Clock className="h-5 w-5" />;
  };

  if (alerts.length === 0) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
            <p className="text-gray-300 font-medium">No Active Weather Alerts</p>
            <p className="text-gray-400 text-sm mt-1">
              All conditions are within normal parameters
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
          Weather Alerts ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-lg border p-4 ${
              alert.acknowledged
                ? "bg-gray-800/50 border-gray-700"
                : "bg-gray-800 border-yellow-500/30"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${alert.acknowledged ? "text-gray-500" : "text-yellow-400"}`}>
                  {getSeverityIcon(alert.severity)}
                </div>
                <div>
                  <h4 className="text-white font-semibold flex items-center gap-2">
                    {alert.title}
                    {alert.acknowledged && (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    )}
                  </h4>
                  <Badge
                    variant="outline"
                    className={`${getSeverityColor(alert.severity)} mt-1`}
                  >
                    {alert.severity}
                  </Badge>
                </div>
              </div>
            </div>

            <p className="text-gray-300 text-sm mb-3">{alert.description}</p>

            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="space-y-1">
                {alert.start_time && (
                  <p>
                    Start: {format(new Date(alert.start_time), "MMM d, yyyy HH:mm")}
                  </p>
                )}
                {alert.end_time && (
                  <p>End: {format(new Date(alert.end_time), "MMM d, yyyy HH:mm")}</p>
                )}
                {alert.acknowledged && alert.acknowledged_at && (
                  <p className="text-green-400">
                    Acknowledged by {alert.acknowledged_by} on{" "}
                    {format(new Date(alert.acknowledged_at), "MMM d, HH:mm")}
                  </p>
                )}
              </div>

              {!alert.acknowledged && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAcknowledge(alert.id)}
                  className="text-green-400 hover:text-green-300 border-green-500/30 hover:bg-green-900/20"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Acknowledge
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
