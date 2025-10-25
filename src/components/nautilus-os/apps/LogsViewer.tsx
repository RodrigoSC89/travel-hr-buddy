import React from "react";
import { FileText, Info, AlertCircle, XCircle } from "lucide-react";

export function LogsViewer() {
  const logs = [
    { time: "10:45:32", level: "info", message: "Sistema inicializado com sucesso", icon: Info },
    { time: "10:45:48", level: "info", message: "Módulo de IA carregado", icon: Info },
    { time: "10:46:12", level: "warning", message: "Latência detectada em módulo de logs", icon: AlertCircle },
    { time: "10:46:35", level: "error", message: "Falha na conexão com sensor externo", icon: XCircle },
  ];

  return (
    <div className="space-y-2 font-mono text-xs">
      {logs.map((log, idx) => (
        <div
          key={idx}
          className={`flex items-start gap-2 p-2 rounded border ${
            log.level === "error"
              ? "bg-destructive/10 border-destructive/30"
              : log.level === "warning"
                ? "bg-warning/10 border-warning/30"
                : "bg-primary/5 border-border/30"
          }`}
        >
          <log.icon className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span className="text-muted-foreground">{log.time}</span>
          <span className="flex-1">{log.message}</span>
        </div>
      ))}
    </div>
  );
}
