import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const ModulesControl = memo(function() {
  const modules = [
    { id: "ai", name: "IA Embarcada", enabled: true },
    { id: "monitoring", name: "Monitoramento", enabled: true },
    { id: "logs", name: "Sistema de Logs", enabled: true },
    { id: "alerts", name: "Alertas", enabled: false },
  ];

  return (
    <div className="space-y-3">
      {modules.map((module) => (
        <div
          key={module.id}
          className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/30"
        >
          <Label htmlFor={module.id} className="text-sm font-medium cursor-pointer">
            {module.name}
          </Label>
          <Switch id={module.id} checked={module.enabled} />
        </div>
      ))}
    </div>
  );
}
