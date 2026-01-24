import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: Date;
  module: string;
  level: "info" | "warning" | "error" | "success";
  message: string;
}

export const SystemLogs: React.FC = () => {
  const logs: LogEntry[] = [
    {
      id: "1",
      timestamp: new Date(),
      module: "Fleet",
      level: "success",
      message: "Vessel SSN-001 position updated successfully"
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 2 * 60000),
      module: "Weather",
      level: "warning",
      message: "Weather advisory: Moderate seas detected in sector 7"
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 5 * 60000),
      module: "Satellite",
      level: "info",
      message: "Satellite link re-established with ground station"
    },
    {
      id: "4",
      timestamp: new Date(Date.now() - 10 * 60000),
      module: "Emergency",
      level: "success",
      message: "Emergency drill completed - All teams responded"
    },
    {
      id: "5",
      timestamp: new Date(Date.now() - 15 * 60000),
      module: "Fleet",
      level: "info",
      message: "12 vessels tracked, all reporting nominal status"
    },
    {
      id: "6",
      timestamp: new Date(Date.now() - 20 * 60000),
      module: "Weather",
      level: "warning",
      message: "Wind speed increasing to 18kt in sector 4"
    }
  ];

  const getLevelIcon = (level: LogEntry["level"]) => {
    switch (level) {
    case "success":
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    case "warning":
      return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    case "error":
      return <AlertTriangle className="w-4 h-4 text-red-400" />;
    case "info":
    default:
      return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getLevelColor = (level: LogEntry["level"]) => {
    switch (level) {
    case "success":
      return "border-l-green-500";
    case "warning":
      return "border-l-yellow-500";
    case "error":
      return "border-l-red-500";
    case "info":
    default:
      return "border-l-blue-500";
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit",
      second: "2-digit"
    });
  };

  return (
    <Card className="bg-card/50 border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          System Activity Logs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`p-3 bg-background/50 rounded-lg border-l-4 ${getLevelColor(log.level)} hover:bg-muted/50 transition-colors`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getLevelIcon(log.level)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-primary">
                        {log.module}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(log.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80">{log.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
