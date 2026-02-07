/**
 * UXGuard - Componente wrapper para garantir padrão UX obrigatório
 * 
 * Envolve qualquer módulo e garante:
 * 1. Título claro
 * 2. Subtítulo explicativo
 * 3. Loading state (skeleton)
 * 4. Error state (humano + retry)
 * 5. Empty state (ícone + CTA)
 * 6. Breadcrumbs contextuais
 * 7. Ações primárias visíveis
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { 
  AlertCircle, RefreshCw, Inbox, Plus, 
  ArrowRight, Lightbulb, HelpCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface UXGuardProps {
  /** Título da seção/módulo */
  title: string;
  /** Descrição curta do que o módulo faz */
  subtitle: string;
  /** Dica contextual (tooltip no ícone ?) */
  helpTip?: string;
  /** Se está carregando */
  isLoading?: boolean;
  /** Erro, se houver */
  error?: Error | string | null;
  /** Retry handler */
  onRetry?: () => void;
  /** Se está vazio (sem dados) */
  isEmpty?: boolean;
  /** Configuração do empty state */
  emptyConfig?: {
    icon?: React.ElementType;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    tips?: string[];
  };
  /** Badge de status */
  badge?: { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' };
  /** Conteúdo principal */
  children: React.ReactNode;
  /** Classes adicionais */
  className?: string;
}

/** Skeleton otimizado para diferentes layouts */
function SmartSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-7 w-16 mb-1" />
            <Skeleton className="h-2 w-24" />
          </Card>
        ))}
      </div>
      {/* Content skeleton */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-8 w-24" />
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4 items-center">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/** Error state humanizado */
function SmartError({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-destructive/10 p-4 mb-4">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Algo não saiu como esperado</h3>
        <p className="text-sm text-muted-foreground max-w-md text-center mb-2">
          {error}
        </p>
        <p className="text-xs text-muted-foreground mb-6">
          Se o problema persistir, entre em contato com o suporte técnico.
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/** Empty state inteligente com dicas */
function SmartEmpty({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  tips,
}: NonNullable<UXGuardProps['emptyConfig']>) {
  return (
    <Card className="border-dashed border-2">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-muted p-5 mb-5">
          <Icon className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md text-center mb-6">
          {description}
        </p>
        
        {/* Tips section */}
        {tips && tips.length > 0 && (
          <div className="bg-muted/50 rounded-lg p-4 mb-6 max-w-md w-full">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Dicas para começar:</span>
            </div>
            <ul className="space-y-1.5">
              {tips.map((tip, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0 text-primary" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {actionLabel && onAction && (
          <Button onClick={onAction} className="gap-2" size="lg">
            <Plus className="h-4 w-4" />
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function UXGuard({
  title,
  subtitle,
  helpTip,
  isLoading,
  error,
  onRetry,
  isEmpty,
  emptyConfig,
  badge,
  children,
  className,
}: UXGuardProps) {
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <TooltipProvider>
      <div className={cn("space-y-4", className)}>
        {/* Section header */}
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
              {badge && (
                <Badge variant={badge.variant}>{badge.label}</Badge>
              )}
              {helpTip && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <HelpCircle className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p className="text-sm">{helpTip}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        {/* Content with state management */}
        {isLoading ? (
          <SmartSkeleton />
        ) : errorMessage ? (
          <SmartError error={errorMessage} onRetry={onRetry} />
        ) : isEmpty && emptyConfig ? (
          <SmartEmpty {...emptyConfig} />
        ) : (
          <div className="animate-fade-in">{children}</div>
        )}
      </div>
    </TooltipProvider>
  );
}

export default UXGuard;
