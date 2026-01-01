/**
 * ModuleHeaderV2 - Header Padronizado para Módulos V2
 * ETAPA 2: Componentes V2 - NÃO SUBSTITUI headers existentes
 */

import React, { ReactNode } from 'react';
import { LucideIcon, Sparkles, Settings, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface ModuleHeaderV2Props {
  title: string;
  description?: string;
  icon?: LucideIcon;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  actions?: ReactNode;
  aiEnabled?: boolean;
  onAIToggle?: () => void;
  onSettings?: () => void;
  onHelp?: () => void;
  className?: string;
}

export function ModuleHeaderV2({
  title,
  description,
  icon: Icon,
  badge,
  badgeVariant = 'secondary',
  actions,
  aiEnabled = false,
  onAIToggle,
  onSettings,
  onHelp,
  className,
}: ModuleHeaderV2Props) {
  return (
    <div className={cn(
      'flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6',
      'bg-gradient-to-r from-background to-muted/20 rounded-xl border border-border/50',
      'shadow-sm',
      className
    )}>
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 text-primary shadow-inner">
            <Icon className="h-6 w-6" />
          </div>
        )}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              {title}
            </h2>
            {badge && (
              <Badge variant={badgeVariant} className="text-xs">
                {badge}
              </Badge>
            )}
            {aiEnabled && (
              <Badge variant="default" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                <Sparkles className="h-3 w-3 mr-1" />
                IA
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground max-w-xl">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* AI Toggle */}
        {onAIToggle && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={aiEnabled ? 'default' : 'outline'}
                  size="sm"
                  onClick={onAIToggle}
                  className={cn(
                    'gap-1.5',
                    aiEnabled && 'bg-purple-600 hover:bg-purple-700'
                  )}
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">Assistente IA</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {aiEnabled ? 'Desativar IA' : 'Ativar Assistente IA'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Custom Actions */}
        {actions}

        {/* Settings */}
        {onSettings && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onSettings}>
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Configurações</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Help */}
        {onHelp && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onHelp}>
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Ajuda</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}

export default ModuleHeaderV2;
