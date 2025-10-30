/**
 * PATCH 451 - Drone Fleet Logs Viewer
 * Displays logs from drone_fleet_logs table
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, AlertTriangle, Info, AlertCircle, CheckCircle } from "lucide-react";
import { droneCommanderService } from "../services/drone-service";

interface DroneLog {
  id: string;
  droneId: string;
  eventType: string;
  severity: "info" | "warning" | "error" | "critical";
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export const DroneLogsViewer: React.FC = () => {
  const [logs, setLogs] = useState<DroneLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await droneCommanderService.getFleetLogs();
      setLogs(data);
    } catch (error) {
      console.error("Error loading logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
    case "critical":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case "error":
      return <AlertCircle className="h-4 w-4 text-red-400" />;
    case "warning":
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    case "info":
    default:
      return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "critical":
      return "bg-red-500/20 text-red-500";
    case "error":
      return "bg-red-400/20 text-red-400";
    case "warning":
      return "bg-yellow-500/20 text-yellow-500";
    case "info":
    default:
      return "bg-blue-500/20 text-blue-500";
    }
  };

  const filteredLogs = filter === "all" 
    ? logs 
    : logs.filter(log => log.severity === filter);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Fleet Logs</CardTitle>
            <CardDescription>
              Real-time event logs from the drone fleet
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "critical" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("critical")}
            >
              Critical
            </Button>
            <Button
              variant={filter === "error" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("error")}
            >
              Error
            </Button>
            <Button
              variant={filter === "warning" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("warning")}
            >
              Warning
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading logs...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No logs found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map(log => (
                <Card key={log.id} className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getSeverityIcon(log.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getSeverityColor(log.severity)}>
                          {log.severity}
                        </Badge>
                        <Badge variant="outline">
                          {log.eventType}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{log.message}</p>
                      {log.droneId && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Drone: {log.droneId}
                        </p>
                      )}
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs text-muted-foreground cursor-pointer">
                            Show metadata
                          </summary>
                          <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
