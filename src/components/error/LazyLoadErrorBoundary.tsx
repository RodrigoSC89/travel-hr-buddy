/**
 * LazyLoadErrorBoundary - PATCH v51 - Simplified, No Auto-Reload
 * Handles dynamic import failures WITHOUT causing reload loops
 * Shows error UI and lets user decide to retry
 */
import React, { Component, ReactNode } from 'react';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class LazyLoadErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      errorMessage: error.message || 'Unknown error'
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[LazyLoadErrorBoundary] Error:', error.message);
    console.error('[LazyLoadErrorBoundary] Stack:', errorInfo.componentStack);
  }

  handleClearAndReload = async () => {
    try {
      // Clear session storage
      sessionStorage.clear();
      
      // Clear localStorage keys related to app
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('chunk') || key.includes('retry') || key.includes('error'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      
      // Clear caches
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      
      // Unregister service workers
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }
    } catch (e) {
      console.warn('[LazyLoadErrorBoundary] Cleanup error:', e);
    }
    
    // Reload with cache bust
    window.location.replace(window.location.origin + '?v=' + Date.now());
  };

  handleGoHome = () => {
    window.location.href = '/auth';
  };

  render() {
    if (this.state.hasError) {
      // Check if it's a chunk/import error
      const isChunkError = 
        this.state.errorMessage.includes('chunk') ||
        this.state.errorMessage.includes('import') ||
        this.state.errorMessage.includes('module') ||
        this.state.errorMessage.includes('CSS');
      
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {isChunkError ? 'Atualização Disponível' : 'Erro ao Carregar'}
          </h2>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            {isChunkError 
              ? 'Uma nova versão está disponível. Limpe o cache para continuar.'
              : 'Ocorreu um erro. Tente limpar o cache e recarregar.'}
          </p>
          <div className="flex gap-3">
            <Button onClick={this.handleClearAndReload} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Limpar cache e recarregar
            </Button>
            <Button onClick={this.handleGoHome} variant="outline" className="gap-2">
              <Home className="h-4 w-4" />
              Ir para Login
            </Button>
          </div>
          {!isChunkError && (
            <p className="text-xs text-muted-foreground/60 mt-4 max-w-sm text-center">
              Erro: {this.state.errorMessage.slice(0, 100)}
            </p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default LazyLoadErrorBoundary;
