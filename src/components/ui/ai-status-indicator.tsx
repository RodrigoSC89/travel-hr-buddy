import React from "react";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, Shield, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIStatusIndicatorProps {
  model: string;
  confidenceScore: number;
  usedCache?: boolean;
  className?: string;
}

/**
 * Indicador de status da IA Nautilus
 * Mostra modelo usado, confiança e se usou cache
 */
export const AIStatusIndicator: React.FC<AIStatusIndicatorProps> = ({
  model,
  confidenceScore,
  usedCache = false,
  className
}) => {
  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return "text-success";
    if (score >= 0.75) return "text-warning";
    return "text-destructive";
  };

  const getModelIcon = (modelName: string) => {
    if (modelName === 'cache') return Database;
    if (modelName.includes('gpt')) return Brain;
    return Zap;
  };

  const Icon = getModelIcon(model);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge variant="outline" className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        <span className="text-xs">{model}</span>
      </Badge>
      
      <Badge 
        variant="secondary" 
        className={cn("flex items-center gap-1", getConfidenceColor(confidenceScore))}
      >
        <Shield className="h-3 w-3" />
        <span className="text-xs">{(confidenceScore * 100).toFixed(0)}%</span>
      </Badge>

      {usedCache && (
        <Badge variant="outline" className="text-xs">
          <Database className="h-3 w-3 mr-1" />
          Cache
        </Badge>
      )}
    </div>
  );
};

export default AIStatusIndicator;
