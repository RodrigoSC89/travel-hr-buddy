/**
 * StatusPipeline - World-class workflow visualization
 * Inspired by ServiceNow, Jira, Monday.com
 * 
 * Shows clear stage progression with counts, colors, and interactivity
 */

import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock, AlertTriangle, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface PipelineStage {
  id: string;
  label: string;
  count: number;
  color?: string;
  icon?: React.ReactNode;
  description?: string;
}

interface StatusPipelineProps {
  stages: PipelineStage[];
  activeStage?: string;
  onStageClick?: (stageId: string) => void;
  variant?: "horizontal" | "compact";
  className?: string;
}

export function StatusPipeline({ 
  stages, 
  activeStage, 
  onStageClick, 
  variant = "horizontal",
  className 
}: StatusPipelineProps) {
  const total = stages.reduce((sum, s) => sum + s.count, 0);

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-1 flex-wrap", className)}>
        {stages.map((stage) => (
          <button
            key={stage.id}
            onClick={() => onStageClick?.(stage.id)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              "border hover:shadow-sm",
              activeStage === stage.id
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card text-foreground border-border hover:border-primary/50"
            )}
          >
            <span>{stage.label}</span>
            <Badge variant="secondary" className="h-5 min-w-[20px] px-1.5 text-[10px]">
              {stage.count}
            </Badge>
          </button>
        ))}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn("bg-card border rounded-xl p-4", className)}>
        {/* Pipeline bar */}
        <div className="flex items-center gap-0 mb-3">
          {stages.map((stage, index) => {
            const percentage = total > 0 ? (stage.count / total) * 100 : 0;
            const isActive = activeStage === stage.id;
            
            return (
              <React.Fragment key={stage.id}>
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40 flex-shrink-0 -mx-1 z-10" />
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onStageClick?.(stage.id)}
                      className={cn(
                        "flex-1 relative group transition-all",
                        onStageClick && "cursor-pointer"
                      )}
                    >
                      <div
                        className={cn(
                          "h-10 flex items-center justify-center gap-2 rounded-lg transition-all text-sm font-medium",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20"
                            : stage.count > 0
                            ? "bg-muted/80 text-foreground hover:bg-muted"
                            : "bg-muted/30 text-muted-foreground"
                        )}
                      >
                        <span className="truncate">{stage.label}</span>
                        <Badge 
                          variant={isActive ? "secondary" : "outline"} 
                          className={cn(
                            "h-5 min-w-[20px] px-1.5 text-[10px]",
                            isActive && "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30"
                          )}
                        >
                          {stage.count}
                        </Badge>
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{stage.description || stage.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {stage.count} itens ({percentage.toFixed(0)}%)
                    </p>
                  </TooltipContent>
                </Tooltip>
              </React.Fragment>
            );
          })}
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{total} itens no total</span>
          <div className="flex items-center gap-3">
            {stages.filter(s => s.count > 0).map(stage => (
              <span key={stage.id} className="flex items-center gap-1">
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  activeStage === stage.id ? "bg-primary" : "bg-muted-foreground/30"
                )} />
                {stage.label}: {stage.count}
              </span>
            ))}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
