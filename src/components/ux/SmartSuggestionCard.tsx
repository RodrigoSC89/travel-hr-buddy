/**
 * Smart Suggestion Card - PATCH 836
 * Beautiful, animated suggestion cards
 */

import React from 'react';
import { X, Lightbulb, Zap, AlertTriangle, Info, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/lib/ux/haptic-feedback';

interface Suggestion {
  id: string;
  type: 'action' | 'shortcut' | 'feature' | 'tip' | 'warning';
  title: string;
  description: string;
  action?: () => void;
  actionLabel?: string;
  priority: number;
  dismissable?: boolean;
}

interface SmartSuggestionCardProps {
  suggestion: Suggestion;
  onDismiss?: (id: string) => void;
  onAction?: () => void;
  variant?: 'default' | 'compact' | 'banner';
  className?: string;
}

const typeConfig = {
  action: {
    icon: Zap,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
  },
  shortcut: {
    icon: Zap,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  feature: {
    icon: Lightbulb,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  tip: {
    icon: Info,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
  },
};

export function SmartSuggestionCard({
  suggestion,
  onDismiss,
  onAction,
  variant = 'default',
  className,
}: SmartSuggestionCardProps) {
  const { trigger } = useHapticFeedback();
  const config = typeConfig[suggestion.type];
  const Icon = config.icon;
  
  const handleDismiss = () => {
    trigger('light');
    onDismiss?.(suggestion.id);
  };
  
  const handleAction = () => {
    trigger('success');
    suggestion.action?.();
    onAction?.();
  };
  
  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-sm',
          config.bg,
          config.border,
          className
        )}
      >
        <div className={cn('p-1.5 rounded-full', config.bg)}>
          <Icon className={cn('h-4 w-4', config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{suggestion.title}</p>
        </div>
        {suggestion.dismissable !== false && (
          <button
            onClick={handleDismiss}
            className="p-1 rounded-full hover:bg-muted/80 transition-colors"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>
    );
  }
  
  if (variant === 'banner') {
    return (
      <div
        className={cn(
          'flex items-center gap-4 p-4 rounded-lg border',
          config.bg,
          config.border,
          className
        )}
      >
        <div className={cn('p-2 rounded-full', config.bg)}>
          <Icon className={cn('h-5 w-5', config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium">{suggestion.title}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{suggestion.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {suggestion.actionLabel && (
            <Button size="sm" onClick={handleAction}>
              {suggestion.actionLabel}
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          )}
          {suggestion.dismissable !== false && (
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-full hover:bg-muted/80 transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
    );
  }
  
  // Default card variant
  return (
    <Card className={cn('overflow-hidden border', config.border, className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn('p-2 rounded-full shrink-0', config.bg)}>
            <Icon className={cn('h-5 w-5', config.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium leading-tight">{suggestion.title}</h4>
              {suggestion.dismissable !== false && (
                <button
                  onClick={handleDismiss}
                  className="p-1 rounded-full hover:bg-muted/80 transition-colors shrink-0"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {suggestion.description}
            </p>
            {suggestion.actionLabel && (
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={handleAction}
              >
                {suggestion.actionLabel}
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Smart Suggestions List
 */
interface SmartSuggestionsListProps {
  suggestions: Suggestion[];
  onDismiss: (id: string) => void;
  maxVisible?: number;
  variant?: 'default' | 'compact' | 'banner';
  className?: string;
}

export function SmartSuggestionsList({
  suggestions,
  onDismiss,
  maxVisible = 3,
  variant = 'default',
  className,
}: SmartSuggestionsListProps) {
  const visible = suggestions.slice(0, maxVisible);
  const remaining = suggestions.length - maxVisible;
  
  if (visible.length === 0) {
    return null;
  }
  
  return (
    <div className={cn('space-y-3', className)}>
      {visible.map((suggestion, index) => (
        <div
          key={suggestion.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <SmartSuggestionCard
            suggestion={suggestion}
            onDismiss={onDismiss}
            variant={variant}
          />
        </div>
      ))}
      {remaining > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          +{remaining} mais sugestões
        </p>
      )}
    </div>
  );
}

export default SmartSuggestionCard;
