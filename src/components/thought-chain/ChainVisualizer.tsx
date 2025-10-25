import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Loader2, XCircle, Clock } from "lucide-react";
import { ChainStep } from "@/lib/ai/llmChainEngine";
import { cn } from "@/lib/utils";

interface ChainVisualizerProps {
  steps: ChainStep[];
  className?: string;
}

export const ChainVisualizer: React.FC<ChainVisualizerProps> = ({ steps, className }) => {
  const getStatusIcon = (status: ChainStep["status"]) => {
    switch (status) {
    case "completed":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "processing":
      return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
    case "error":
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: ChainStep["status"]) => {
    switch (status) {
    case "completed":
      return "bg-green-500/20 border-green-500/50";
    case "processing":
      return "bg-blue-500/20 border-blue-500/50 animate-pulse";
    case "error":
      return "bg-red-500/20 border-red-500/50";
    default:
      return "bg-muted border-muted-foreground/20";
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {steps.map((step, index) => (
        <div key={step.id} className="relative">
          {/* Connector line */}
          {index < steps.length - 1 && (
            <div className="absolute left-6 top-16 w-0.5 h-8 bg-border" />
          )}
          
          <Card className={cn("border-2 transition-all", getStatusColor(step.status))}>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="mt-1">{getStatusIcon(step.status)}</div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Etapa {index + 1}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {step.executionTime && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {step.executionTime}ms
                        </Badge>
                      )}
                      {step.confidence && (
                        <Badge variant="outline" className="text-xs">
                          {(step.confidence * 100).toFixed(0)}% confiança
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-foreground/90">{step.step}</p>
                </div>
              </div>
            </CardHeader>
            
            {step.response && (
              <CardContent>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm whitespace-pre-wrap">{step.response}</p>
                </div>
                {step.timestamp && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(step.timestamp).toLocaleString("pt-BR")}
                  </p>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      ))}
    </div>
  );
};
