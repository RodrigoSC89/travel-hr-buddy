/**
 * Execution logs sidebar panel
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";
import type { ExecutionLog } from "./types";

interface ExecutionLogsPanelProps {
  logs: ExecutionLog[];
}

export const ExecutionLogsPanel: React.FC<ExecutionLogsPanelProps> = ({ logs }) => (
  <Card className="lg:col-span-1 flex flex-col">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center gap-2">
        <Terminal className="h-4 w-4" />
        Logs de Execução
      </CardTitle>
    </CardHeader>
    <ScrollArea className="flex-1">
      <CardContent className="space-y-2">
        {logs.map((log) => (
          <div key={log.id} className="p-3 bg-muted rounded-lg text-sm">
            <div className="flex items-center gap-2 mb-1">
              {log.status === "success" ? (
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              ) : log.status === "warning" ? (
                <AlertTriangle className="h-3 w-3 text-yellow-500" />
              ) : (
                <XCircle className="h-3 w-3 text-destructive" />
              )}
              <span className="font-medium text-xs">{log.action}</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{log.message}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {new Date(log.timestamp).toLocaleTimeString("pt-BR")}
              {log.duration_ms && (
                <>
                  <span>•</span>
                  <span>{log.duration_ms}ms</span>
                </>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </ScrollArea>
  </Card>
);
