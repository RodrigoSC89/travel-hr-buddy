/**
 * NAUTI ONE — ErrorState Component
 * Consistent error display across all modules
 */

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { normalizeError, type NormalizedError } from '@/contracts/error-normalization';

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

export function ErrorState({ error, onRetry, className = '', compact = false }: ErrorStateProps) {
  const normalized: NormalizedError = normalizeError(error);

  if (compact) {
    return (
      <div className={`flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 ${className}`} data-testid="error-state">
        <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
        <span className="text-sm text-destructive">{normalized.message}</span>
        {normalized.retryable && onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry} className="ml-auto shrink-0">
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`} data-testid="error-state">
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">Erro</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{normalized.message}</p>
      {normalized.retryable && onRetry && (
        <Button onClick={onRetry} variant="outline" data-testid="error-retry-button">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
