/**
import { useState, useCallback } from "react";;
 * PATCH 452 - Mission Logs Component
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, AlertTriangle, AlertCircle } from "lucide-react";
import type { MissionLog } from "../types";

interface MissionLogsProps {
  logs: MissionLog[];
  onRefresh: () => void;
}

export const MissionLogs: React.FC<MissionLogsProps> = ({ logs, onRefresh }) => {
  const [filter, setFilter] = useState<string>("all");

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
    case "critical":
    case "error":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case "warning":
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    default:
      return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "critical": return "bg-red-500/20 text-red-500";
    case "error": return "bg-red-400/20 text-red-400";
    case "warning": return "bg-yellow-500/20 text-yellow-500";
    default: return "bg-blue-500/20 text-blue-500";
    }
  };

  const filteredLogs = filter === "all" ? logs : logs.filter(l => l.severity === filter);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Mission Logs</CardTitle>
            <CardDescription>Event history and activity logs</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={handleSetFilter}
            >
              All
            </Button>
            <Button
              variant={filter === "critical" ? "default" : "outline"}
              size="sm"
              onClick={handleSetFilter}
            >
              Critical
            </Button>
            <Button
              variant={filter === "error" ? "default" : "outline"}
              size="sm"
              onClick={handleSetFilter}
            >
              Error
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No logs found
            </div>
          ) : (
            filteredLogs.map(log => (
              <Card key={log.id} className="p-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getSeverityIcon(log.severity)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getSeverityColor(log.severity)}>
                        {log.severity}
                      </Badge>
                      <Badge variant="outline">{log.eventType}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{log.message}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
});
