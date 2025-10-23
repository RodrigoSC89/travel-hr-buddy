import React from "react";
import { Compass, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

export function CopilotPanel() {
  const suggestions = [
    { icon: CheckCircle, text: "Sistema operando normalmente", type: "success" },
    { icon: TrendingUp, text: "Performance acima da média", type: "info" },
    { icon: AlertTriangle, text: "Considere atualizar módulo de logs", type: "warning" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Compass className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Sugestões Inteligentes</span>
      </div>

      {suggestions.map((suggestion, idx) => (
        <div
          key={idx}
          className={`flex items-start gap-2 p-3 rounded-lg border ${
            suggestion.type === "success"
              ? "bg-success/10 border-success/30"
              : suggestion.type === "warning"
              ? "bg-warning/10 border-warning/30"
              : "bg-primary/10 border-primary/30"
          }`}
        >
          <suggestion.icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{suggestion.text}</p>
        </div>
      ))}
    </div>
  );
}
