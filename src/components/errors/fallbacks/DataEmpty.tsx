/**
 * FASE A2 - Data Empty Fallback
 * Fallback elegante para estados vazios de dados
 */

import React from "react";
import { Database, Plus, RefreshCw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DataEmptyProps {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  showRefresh?: boolean;
  onRefresh?: () => void;
  className?: string;
  variant?: "default" | "compact" | "card";
}

export const DataEmpty: React.FC<DataEmptyProps> = ({
  title = "Nenhum dado encontrado",
  description = "Não há dados disponíveis no momento. Tente adicionar novos itens ou ajustar seus filtros.",
  icon: Icon = Database,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  showRefresh = true,
  onRefresh,
  className,
  variant = "default",
}) => {
  if (variant === "compact") {
    return (
      <div className={cn("flex flex-col items-center justify-center p-6 text-center", className)}>
        <div className="mb-3 p-2 rounded-full bg-muted">
          <Icon className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground mb-3 max-w-xs">
          {description}
        </p>
        <div className="flex gap-2">
          {onAction && actionLabel && (
            <Button onClick={onAction} size="sm" variant="default">
              <Plus className="w-3 h-3 mr-1" />
              {actionLabel}
            </Button>
          )}
          {showRefresh && onRefresh && (
            <Button onClick={onRefresh} size="sm" variant="ghost">
              <RefreshCw className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn("bg-card border border-border rounded-lg p-8 text-center shadow-sm", className)}>
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-muted">
            <Icon className="w-10 h-10 text-muted-foreground" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          {description}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          {onAction && actionLabel && (
            <Button onClick={onAction} variant="default" className="gap-2">
              <Plus className="w-4 h-4" />
              {actionLabel}
            </Button>
          )}
          {onSecondaryAction && secondaryActionLabel && (
            <Button onClick={onSecondaryAction} variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              {secondaryActionLabel}
            </Button>
          )}
          {showRefresh && onRefresh && (
            <Button onClick={onRefresh} variant="ghost" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("text-center py-16 px-4", className)}>
      <div className="flex justify-center mb-6">
        <div className="p-6 rounded-full bg-gradient-to-br from-muted to-muted/50 shadow-soft">
          <Icon className="w-14 h-14 text-muted-foreground" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
        {description}
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        {onAction && actionLabel && (
          <Button
            onClick={onAction}
            size="lg"
            className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Plus className="w-5 h-5" />
            {actionLabel}
          </Button>
        )}
        {onSecondaryAction && secondaryActionLabel && (
          <Button
            onClick={onSecondaryAction}
            size="lg"
            variant="outline"
            className="gap-2"
          >
            <Filter className="w-5 h-5" />
            {secondaryActionLabel}
          </Button>
        )}
        {showRefresh && onRefresh && (
          <Button
            onClick={onRefresh}
            size="lg"
            variant="ghost"
            className="gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Atualizar Dados
          </Button>
        )}
      </div>
    </div>
  );
};
