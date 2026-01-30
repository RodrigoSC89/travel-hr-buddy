import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { useMissionControlLogs } from "@/hooks/useMissionControlLogs";

export const SystemLogs: React.FC = () => {
  const { logs, isLoading } = useMissionControlLogs(20);

  const getLevelIcon = (level: "info" | "warning" | "error" | "success") => {
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

  const getLevelColor = (level: "info" | "warning" | "error" | "success") => {
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
    return date.toLocaleTimeString("pt-BR", { 
      hour: "2-digit", 
      minute: "2-digit",
      second: "2-digit"
    });
  };

  if (isLoading) {
    return (
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            System Activity Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

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
            {logs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum log de atividade encontrado
              </p>
            ) : (
              logs.map((log) => (
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
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
