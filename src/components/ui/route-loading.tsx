/**
 * Loading component for lazy-loaded routes
 * Provides smooth loading experience with skeleton
 */

import { Loader2 } from 'lucide-react';

export function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
      <div className="text-center space-y-4">
        <Loader2 
          className="h-12 w-12 animate-spin text-primary mx-auto" 
          aria-label="Carregando página"
        />
        <p className="text-muted-foreground text-sm">Carregando...</p>
      </div>
    </div>
  );
}

export function RouteLoadingMinimal() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center space-y-3">
        <Loader2 
          className="h-8 w-8 animate-spin text-primary mx-auto" 
          aria-label="Carregando"
        />
        <p className="text-muted-foreground text-xs">Carregando módulo...</p>
      </div>
    </div>
  );
}
